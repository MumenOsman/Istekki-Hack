/**
 * Call Controller
 * Manages active emergency / triage voice and video call lifecycle, live duration timer,
 * switching between audio and video modes with request prompts, and dock actions.
 * Synchronizes call state, answering, responder transfers, and two-way video mode across apps.
 */
import { state } from './state.js';
import { cancelSOSCountdown } from './sos-controller.js';

let callTimerInterval = null;
let callDurationSec = 0;
let broadcastBus = null;

try {
  broadcastBus = new BroadcastChannel('791_emergency_bus');
} catch (e) {
  console.warn('[791 Call] BroadcastChannel not supported:', e);
}

export function initCallController() {
  const endCallBtn = document.getElementById('end-call-btn');
  const videoEndCallBtn = document.getElementById('video-end-call-btn');
  const callVideoBtn = document.getElementById('call-video-btn');
  const videoToggleBtn = document.getElementById('video-toggle-btn');
  const videoFlipCameraBtn = document.getElementById('video-flip-camera-btn');
  const callSpeakerBtn = document.getElementById('call-speaker-btn');
  const videoSpeakerBtn = document.getElementById('video-speaker-btn');

  // Video Request Prompt Modal Elements
  const videoRequestModal = document.getElementById('video-request-modal-mother');
  const acceptVideoBtn = document.getElementById('mother-accept-video-btn');
  const declineVideoBtn = document.getElementById('mother-decline-video-btn');

  // Listen for SOS Countdown Completion
  window.addEventListener('sos:connected', (e) => {
    const responder = e.detail?.responder || {
      responderName: 'Laura Hakala',
      facilityName: 'Kuopion yliopistollinen sairaala'
    };
    openCallScreen(responder);
  });

  // Listen for cross-tab messages from Midwife App
  if (broadcastBus) {
    broadcastBus.onmessage = (event) => {
      handleBusMessage(event.data);
    };
  }

  // Cross-tab fallback via localStorage
  window.addEventListener('storage', (e) => {
    if (e.key === '791_emergency_sync' && e.newValue) {
      try {
        const data = JSON.parse(e.newValue);
        handleBusMessage(data);
      } catch (err) {
        // ignore
      }
    }
  });

  function handleBusMessage(data) {
    if (!data) return;
    if (data.type === 'CALL_ENDED') {
      endCall(false);
    } else if (data.type === 'CALL_TRANSFERRED') {
      onCallTransferred(data.newResponder || { name: 'Sari Korhonen', facility: 'Kuopion yliopistollinen sairaala (Triage B)' });
    } else if (data.type === 'VIDEO_REQUEST_SENT' && data.from === 'midwife') {
      if (videoRequestModal) videoRequestModal.classList.add('active');
    } else if (data.type === 'VIDEO_ACCEPTED') {
      if (videoRequestModal) videoRequestModal.classList.remove('active');
      openVideoScreen();
    } else if (data.type === 'VIDEO_DECLINED') {
      if (videoRequestModal) videoRequestModal.classList.remove('active');
    } else if (data.type === 'VIDEO_CLOSED') {
      closeVideoScreen(false);
    }
  }

  // Mother Taps Video Button -> Sends Request to Midwife
  if (callVideoBtn) {
    callVideoBtn.addEventListener('click', () => {
      broadcastMessage({ type: 'VIDEO_REQUEST_SENT', from: 'mother' });
    });
  }

  // Accept Video Request
  if (acceptVideoBtn) {
    acceptVideoBtn.addEventListener('click', () => {
      if (videoRequestModal) videoRequestModal.classList.remove('active');
      broadcastMessage({ type: 'VIDEO_ACCEPTED' });
      openVideoScreen();
    });
  }

  // Decline Video Request
  if (declineVideoBtn) {
    declineVideoBtn.addEventListener('click', () => {
      if (videoRequestModal) videoRequestModal.classList.remove('active');
      broadcastMessage({ type: 'VIDEO_DECLINED' });
    });
  }

  // Toggle Video / Return to Audio
  if (videoToggleBtn) {
    videoToggleBtn.addEventListener('click', () => {
      closeVideoScreen(true);
    });
  }

  // End Call Handlers
  if (endCallBtn) {
    endCallBtn.addEventListener('click', () => endCall(true));
  }

  if (videoEndCallBtn) {
    videoEndCallBtn.addEventListener('click', () => endCall(true));
  }

  // Speaker Toggles
  if (callSpeakerBtn) {
    callSpeakerBtn.addEventListener('click', () => {
      callSpeakerBtn.classList.toggle('active-toggle');
    });
  }

  if (videoSpeakerBtn) {
    videoSpeakerBtn.addEventListener('click', () => {
      videoSpeakerBtn.classList.toggle('active-toggle');
    });
  }

  // Flip Camera
  if (videoFlipCameraBtn) {
    videoFlipCameraBtn.addEventListener('click', () => {
      console.log('[791 Video] Camera feed flipped (Front/Back)');
    });
  }
}

export function onCallTransferred(newResponder) {
  const contactNameEl = document.getElementById('call-contact-name');
  const facilityNameEl = document.getElementById('call-facility-name');

  if (contactNameEl) {
    contactNameEl.textContent = `Transferring: ${newResponder.name || 'Sari Korhonen'}`;
    contactNameEl.style.transition = 'color 0.3s ease';
    contactNameEl.style.color = '#F59E0B';

    setTimeout(() => {
      if (contactNameEl) {
        contactNameEl.textContent = newResponder.name || 'Sari Korhonen';
        contactNameEl.style.color = '';
      }
    }, 2000);
  }

  if (facilityNameEl && newResponder.facility) {
    facilityNameEl.textContent = newResponder.facility;
  }

  console.log('[791 Call] Call transferred to new responder:', newResponder);
}

export function openCallScreen(info) {
  const callScreen = document.getElementById('call-screen');
  const contactNameEl = document.getElementById('call-contact-name');
  const facilityNameEl = document.getElementById('call-facility-name');
  const deviceWrapper = document.querySelector('.device-wrapper');

  if (!callScreen) return;

  if (deviceWrapper) {
    deviceWrapper.classList.remove('zen-sos-mode');
  }

  if (contactNameEl && (info.responderName || info.name)) {
    contactNameEl.textContent = info.responderName || info.name;
  }
  if (facilityNameEl && (info.facilityName || info.facility)) {
    facilityNameEl.textContent = info.facilityName || info.facility;
  }

  state.callStatus = 'connected';
  callScreen.classList.add('active');

  startCallTimer();
  console.log('[791 Call] Emergency voice call active with responder:', info.responderName || info.name);
}

export function openVideoScreen() {
  const videoScreen = document.getElementById('video-screen-overlay');
  if (!videoScreen) return;

  videoScreen.classList.add('active');
  console.log('[791 Call] Switched to Video stream (Midwife on Big Screen, Mother on PiP).');
}

export function closeVideoScreen(broadcast = true) {
  const videoScreen = document.getElementById('video-screen-overlay');
  if (!videoScreen) return;

  videoScreen.classList.remove('active');

  if (broadcast) {
    broadcastMessage({ type: 'VIDEO_CLOSED' });
  }

  console.log('[791 Call] Returned to Voice Call stream.');
}

export function endCall(broadcast = true) {
  const callScreen = document.getElementById('call-screen');
  const videoScreen = document.getElementById('video-screen-overlay');

  stopCallTimer();

  if (videoScreen) videoScreen.classList.remove('active');
  if (callScreen) callScreen.classList.remove('active');

  cancelSOSCountdown();
  state.callStatus = 'idle';
  state.emergencyActive = false;

  if (broadcast) {
    broadcastMessage({ type: 'CALL_ENDED' });
  }

  console.log('[791 Call] Emergency Call ended.');
}

function broadcastMessage(payload) {
  try {
    if (broadcastBus) {
      broadcastBus.postMessage(payload);
    }
    localStorage.setItem('791_emergency_sync', JSON.stringify({ ...payload, _t: Date.now() }));
  } catch (err) {
    console.warn('[791 Call] Broadcast failed:', err);
  }
}

function startCallTimer() {
  stopCallTimer();
  callDurationSec = 0;
  updateTimerDisplay();

  callTimerInterval = setInterval(() => {
    callDurationSec++;
    updateTimerDisplay();
  }, 1000);
}

function stopCallTimer() {
  if (callTimerInterval) {
    clearInterval(callTimerInterval);
    callTimerInterval = null;
  }
  callDurationSec = 0;
}

function updateTimerDisplay() {
  const timerBadge = document.getElementById('call-timer-badge');
  const videoTimerBadge = document.getElementById('video-timer-badge');
  
  const mins = String(Math.floor(callDurationSec / 60)).padStart(2, '0');
  const secs = String(callDurationSec % 60).padStart(2, '0');
  const formattedTime = `${mins}:${secs}`;

  if (timerBadge) timerBadge.textContent = formattedTime;
  if (videoTimerBadge) videoTimerBadge.textContent = formattedTime;
}

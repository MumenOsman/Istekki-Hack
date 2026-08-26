/**
 * Midwife Incoming Call & Triage Reception Controller
 * Displays Mother Name, Age, Gestational Week (e.g. H38+1), Parity History (e.g. G2P1),
 * upward continuous timer, Call Transfer, connected screen with Dual Docks (Upper Triage Outcomes + Lower Control Dock),
 * synchronized Video Call with inverted big/small screen positions, and Context-Aware Patient Clinical Report.
 */
import { midwifeState } from './midwife-duty-controller.js';

let channel = null;
let callDurationSec = 0;
let callTimerInterval = null;
let incomingElapsedSec = 0;
let incomingTimerInterval = null;
let currentCallStartTime = null;
let isCallIncoming = false;
let currentMotherData = null;
let previousCallSource = 'audio'; // 'audio' | 'video'

export const DEFAULT_MOTHER_DATA = {
  name: 'Maria Nieminen',
  age: '29',
  week: 'H38+1',
  parity: 'G2P1',
  location: 'Juontotie 8, 70150 Kuopio'
};

export function initMidwifeIncomingCallController() {
  const acceptBtn = document.getElementById('midwife-accept-call-btn');
  const transferBtn = document.getElementById('midwife-transfer-call-btn');
  const endCallBtn = document.getElementById('midwife-dock-end-btn');
  const videoEndCallBtn = document.getElementById('midwife-video-end-btn');

  // Lower Primary Dock Action Buttons
  const speakerBtn = document.getElementById('midwife-dock-speaker-btn');
  const videoBtn = document.getElementById('midwife-dock-video-btn');
  const reportBtn = document.getElementById('midwife-dock-report-btn');
  const videoReportBtn = document.getElementById('midwife-video-report-btn');
  const videoToggleAudioBtn = document.getElementById('midwife-video-toggle-audio-btn');

  // Upper Secondary Triage Dock Buttons (Left to Right: Hangup, Sand Timer, Ambulance, Microphone)
  const triageHangupBtn = document.getElementById('triage-dock-hangup-btn');
  const triageTimerBtn = document.getElementById('triage-dock-timer-btn');
  const triageAmbulanceBtn = document.getElementById('triage-dock-ambulance-btn');
  const triageMicBtn = document.getElementById('triage-dock-mic-btn');

  // Report Back Button
  const reportBackBtn = document.getElementById('midwife-report-back-btn');

  // Video Request Prompt Modal Elements
  const videoRequestModal = document.getElementById('video-request-modal-midwife');
  const acceptVideoBtn = document.getElementById('midwife-accept-video-btn');
  const declineVideoBtn = document.getElementById('midwife-decline-video-btn');

  // Transfer Modal Elements
  const transferModal = document.getElementById('midwife-transfer-modal');
  const transferForm = document.getElementById('midwife-transfer-form');
  const transferInput = document.getElementById('transfer-explanation-input');
  const quickTags = document.querySelectorAll('.transfer-tag-btn');

  // 1. Initialize Cross-Tab Broadcast Channel
  try {
    channel = new BroadcastChannel('791_emergency_bus');
    channel.onmessage = (event) => {
      handleIncomingEvent(event.data);
    };
  } catch (err) {
    console.warn('[791 Midwife Bus] BroadcastChannel not supported:', err);
  }

  // 2. Storage event fallback for cross-tab sync
  window.addEventListener('storage', (e) => {
    if (e.key === '791_emergency_sync' && e.newValue) {
      try {
        const data = JSON.parse(e.newValue);
        handleIncomingEvent(data);
      } catch (err) {
        // ignore
      }
    }
  });

  // Accept Call Handler
  if (acceptBtn) {
    acceptBtn.addEventListener('click', () => {
      answerCall();
    });
  }

  // Transfer Call Handler
  if (transferBtn) {
    transferBtn.addEventListener('click', () => {
      initiateCallTransfer();
    });
  }

  // ---------------------------------------------------------
  // Upper Triage Outcome Dock Button Selection Logic
  // ---------------------------------------------------------

  // 1. Microphone: Selected while pressed / toggled for muted conversation
  if (triageMicBtn) {
    triageMicBtn.addEventListener('click', () => {
      const isMuted = triageMicBtn.classList.toggle('selected');
      broadcastBusMessage({ type: 'MIDWIFE_MIC_TOGGLE', isMuted });
      console.log('[791 Midwife] Microphone mute state:', isMuted ? 'MUTED' : 'UNMUTED');
    });
  }

  // 2. Ambulance: Selected when pressed, deselects Sand Timer and Hang Up
  if (triageAmbulanceBtn) {
    triageAmbulanceBtn.addEventListener('click', () => {
      const wasSelected = triageAmbulanceBtn.classList.contains('selected');
      if (wasSelected) {
        triageAmbulanceBtn.classList.remove('selected');
        broadcastBusMessage({ type: 'TRIAGE_RECOMMENDATION', action: 'idle' });
      } else {
        triageAmbulanceBtn.classList.add('selected');
        if (triageTimerBtn) triageTimerBtn.classList.remove('selected');
        if (triageHangupBtn) triageHangupBtn.classList.remove('selected', 'is-call-state');
        broadcastBusMessage({ type: 'TRIAGE_RECOMMENDATION', action: 'ambulance', midwife: 'Laura Hakala' });
      }
      console.log('[791 Midwife] Triage Outcome selected: AMBULANCE');
    });
  }

  // 3. Sand Timer: Selected when pressed, deselects Ambulance and Hang Up
  if (triageTimerBtn) {
    triageTimerBtn.addEventListener('click', () => {
      const wasSelected = triageTimerBtn.classList.contains('selected');
      if (wasSelected) {
        triageTimerBtn.classList.remove('selected');
        broadcastBusMessage({ type: 'TRIAGE_RECOMMENDATION', action: 'idle' });
      } else {
        triageTimerBtn.classList.add('selected');
        if (triageAmbulanceBtn) triageAmbulanceBtn.classList.remove('selected');
        if (triageHangupBtn) triageHangupBtn.classList.remove('selected', 'is-call-state');
        broadcastBusMessage({ type: 'TRIAGE_RECOMMENDATION', action: 'wait', midwife: 'Laura Hakala' });
      }
      console.log('[791 Midwife] Triage Outcome selected: SAND TIMER / WAIT');
    });
  }

  // 4. Hang Up / Call Toggle (Upper Dock): Turns into Green Call button when pressed, and vice versa
  if (triageHangupBtn) {
    triageHangupBtn.addEventListener('click', () => {
      const isCall = triageHangupBtn.classList.contains('is-call-state');
      if (isCall) {
        // Switch back to Red Hang Up state
        triageHangupBtn.classList.remove('is-call-state', 'selected');
        broadcastBusMessage({ type: 'ED_CALL_TOGGLE', isCallState: false });
        console.log('[791 Midwife] Upper Dock button switched to: HANG UP (Red)');
      } else {
        // Switch to Green Call state
        triageHangupBtn.classList.add('is-call-state', 'selected');
        if (triageAmbulanceBtn) triageAmbulanceBtn.classList.remove('selected');
        if (triageTimerBtn) triageTimerBtn.classList.remove('selected');
        broadcastBusMessage({ type: 'ED_CALL_TOGGLE', isCallState: true });
        console.log('[791 Midwife] Upper Dock button switched to: CALL (Green)');
      }
    });
  }

  // ---------------------------------------------------------
  // Lower Primary Dock Buttons Handlers
  // ---------------------------------------------------------
  if (speakerBtn) {
    speakerBtn.addEventListener('click', () => {
      speakerBtn.classList.toggle('active-toggle');
    });
  }

  // Midwife Taps Video Button -> Sends Request to Mother
  if (videoBtn) {
    videoBtn.addEventListener('click', () => {
      broadcastBusMessage({ type: 'VIDEO_REQUEST_SENT', from: 'midwife' });
    });
  }

  // Accept Video Request
  if (acceptVideoBtn) {
    acceptVideoBtn.addEventListener('click', () => {
      if (videoRequestModal) videoRequestModal.classList.remove('active');
      broadcastBusMessage({ type: 'VIDEO_ACCEPTED' });
      openMidwifeVideoScreen();
    });
  }

  // Decline Video Request
  if (declineVideoBtn) {
    declineVideoBtn.addEventListener('click', () => {
      if (videoRequestModal) videoRequestModal.classList.remove('active');
      broadcastBusMessage({ type: 'VIDEO_DECLINED' });
    });
  }

  // Open Clinical Report from Audio Call
  if (reportBtn) {
    reportBtn.addEventListener('click', () => {
      openMotherReport('audio');
    });
  }

  // Open Clinical Report from Video Call
  if (videoReportBtn) {
    videoReportBtn.addEventListener('click', () => {
      openMotherReport('video');
    });
  }

  // Back from Clinical Report -> Context-Aware Return
  if (reportBackBtn) {
    reportBackBtn.addEventListener('click', () => {
      closeMotherReport();
    });
  }

  // Return to Voice from Video
  if (videoToggleAudioBtn) {
    videoToggleAudioBtn.addEventListener('click', () => {
      closeMidwifeVideoScreen(true);
    });
  }

  // Quick Tags in Transfer Explanation Modal
  quickTags.forEach(btn => {
    btn.addEventListener('click', () => {
      if (transferInput) {
        transferInput.value = btn.textContent;
      }
    });
  });

  // Submit Transfer Explanation
  if (transferForm) {
    transferForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const reason = transferInput?.value || 'In active delivery room';
      console.log('[791 Midwife] Transfer explanation submitted:', reason);
      closeTransferModal();
    });
  }

  // End Active Connected Call
  if (endCallBtn) {
    endCallBtn.addEventListener('click', () => {
      endConnectedCall();
    });
  }

  if (videoEndCallBtn) {
    videoEndCallBtn.addEventListener('click', () => {
      endConnectedCall();
    });
  }
}

function handleIncomingEvent(data) {
  if (!data) return;
  console.log('[791 Midwife Bus] Received event:', data);

  const videoRequestModal = document.getElementById('video-request-modal-midwife');

  if (data.type === 'SOS_INITIATED' || data.type === 'SOS_ACTIVATED') {
    if (midwifeState.isListening === true) {
      if (!isCallIncoming) {
        currentCallStartTime = data.startTime || Date.now();
        showIncomingCall(data.mother || DEFAULT_MOTHER_DATA, currentCallStartTime);
      } else {
        console.log('[791 Midwife] Call already ringing. Continuing continuous timer.');
      }
    } else {
      console.log('[791 Midwife] Call IGNORED: Midwife is not listening (OFF / Busy / Break).');
    }
  } else if (data.type === 'SOS_CANCELLED' || data.type === 'CALL_ENDED') {
    dismissIncomingCall();
    endConnectedCall(false);
  } else if (data.type === 'VIDEO_REQUEST_SENT' && data.from === 'mother') {
    if (videoRequestModal) videoRequestModal.classList.add('active');
  } else if (data.type === 'VIDEO_ACCEPTED') {
    if (videoRequestModal) videoRequestModal.classList.remove('active');
    openMidwifeVideoScreen();
  } else if (data.type === 'VIDEO_DECLINED') {
    if (videoRequestModal) videoRequestModal.classList.remove('active');
  } else if (data.type === 'VIDEO_CLOSED') {
    closeMidwifeVideoScreen(false);
  }
}

export function showIncomingCall(motherData = DEFAULT_MOTHER_DATA, startTime = Date.now()) {
  currentMotherData = motherData;
  const overlay = document.getElementById('midwife-incoming-call-overlay');
  const nameEl = document.getElementById('incoming-patient-name');
  const ageEl = document.getElementById('incoming-patient-age');
  const weekEl = document.getElementById('incoming-patient-week');
  const parityEl = document.getElementById('incoming-patient-parity');
  const deviceWrapper = document.querySelector('.device-wrapper');

  if (nameEl) nameEl.textContent = motherData.name || 'Maria Nieminen';
  if (ageEl) ageEl.textContent = `${motherData.age || '29'}`;
  if (weekEl) weekEl.textContent = motherData.week || 'H38+1';
  if (parityEl) parityEl.textContent = motherData.parity || 'G2P1';

  isCallIncoming = true;

  if (deviceWrapper) {
    deviceWrapper.classList.add('midwife-call-active');
  }

  if (overlay) {
    overlay.classList.add('active');
  }

  startIncomingUpTimer(startTime);
  console.log('[791 Midwife] Incoming call active. Top status bar set to pure white.');
}

function startIncomingUpTimer(startTime) {
  stopIncomingUpTimer();

  const timerEl = document.getElementById('incoming-countdown-timer');
  const start = startTime || Date.now();

  function update() {
    const elapsedMs = Math.max(0, Date.now() - start);
    incomingElapsedSec = Math.floor(elapsedMs / 1000);

    if (timerEl) {
      const formatted = String(incomingElapsedSec).padStart(2, '0');
      timerEl.textContent = `${formatted}s`;
    }
  }

  update();
  incomingTimerInterval = setInterval(update, 500);
}

function stopIncomingUpTimer() {
  if (incomingTimerInterval) {
    clearInterval(incomingTimerInterval);
    incomingTimerInterval = null;
  }
  incomingElapsedSec = 0;
  isCallIncoming = false;
  currentCallStartTime = null;
}

export function dismissIncomingCall() {
  stopIncomingUpTimer();
  const overlay = document.getElementById('midwife-incoming-call-overlay');
  const deviceWrapper = document.querySelector('.device-wrapper');

  if (overlay) {
    overlay.classList.remove('active');
  }

  if (deviceWrapper && !document.getElementById('midwife-connected-overlay')?.classList.contains('active')) {
    deviceWrapper.classList.remove('midwife-call-active');
  }
}

export function initiateCallTransfer() {
  stopIncomingUpTimer();
  dismissIncomingCall();

  broadcastBusMessage({
    type: 'CALL_TRANSFERRED',
    transferredFrom: 'Laura Hakala',
    newResponder: {
      name: 'Sari Korhonen',
      facility: 'Kuopion yliopistollinen sairaala (Triage B)'
    }
  });

  openTransferModal();
}

export function openTransferModal() {
  const modal = document.getElementById('midwife-transfer-modal');
  if (modal) {
    modal.classList.add('active');
  }
}

export function closeTransferModal() {
  const modal = document.getElementById('midwife-transfer-modal');
  if (modal) {
    modal.classList.remove('active');
  }
}

export function answerCall() {
  stopIncomingUpTimer();

  const incomingOverlay = document.getElementById('midwife-incoming-call-overlay');
  const connectedOverlay = document.getElementById('midwife-connected-overlay');
  const deviceWrapper = document.querySelector('.device-wrapper');

  if (deviceWrapper) {
    deviceWrapper.classList.add('midwife-call-active');
  }

  const mother = currentMotherData || DEFAULT_MOTHER_DATA;
  const connectedNameEl = document.getElementById('connected-patient-name');
  const connectedAgeEl = document.getElementById('connected-patient-age');
  const connectedWeekEl = document.getElementById('connected-patient-week');
  const connectedParityEl = document.getElementById('connected-patient-parity');

  if (connectedNameEl) connectedNameEl.textContent = mother.name || 'Maria Nieminen';
  if (connectedAgeEl) connectedAgeEl.textContent = `${mother.age || '29'}`;
  if (connectedWeekEl) connectedWeekEl.textContent = mother.week || 'H38+1';
  if (connectedParityEl) connectedParityEl.textContent = mother.parity || 'G2P1';

  // Reset upper dock triage buttons on new call
  document.querySelectorAll('.triage-dock-btn').forEach(btn => btn.classList.remove('selected'));

  if (incomingOverlay) incomingOverlay.classList.remove('active');
  if (connectedOverlay) connectedOverlay.classList.add('active');

  startCallTimer();

  broadcastBusMessage({
    type: 'CALL_ANSWERED',
    responder: { name: 'Laura Hakala', facility: 'KYS Synnytystriage' }
  });

  console.log('[791 Midwife] Call answered.');
}

export function openMidwifeVideoScreen() {
  const videoOverlay = document.getElementById('midwife-video-overlay');
  if (videoOverlay) {
    videoOverlay.classList.add('active');
  }
  console.log('[791 Midwife] Video stream active (Mother on Big Screen, Midwife on PiP).');
}

export function closeMidwifeVideoScreen(broadcast = true) {
  const videoOverlay = document.getElementById('midwife-video-overlay');
  if (videoOverlay) {
    videoOverlay.classList.remove('active');
  }

  if (broadcast) {
    broadcastBusMessage({ type: 'VIDEO_CLOSED' });
  }

  console.log('[791 Midwife] Returned to Voice Call stream.');
}

export function openMotherReport(source = 'audio') {
  previousCallSource = source;
  const reportOverlay = document.getElementById('midwife-mother-report-overlay');
  if (reportOverlay) {
    reportOverlay.classList.add('active');
  }
  console.log('[791 Midwife] Opened Patient Clinical Report from:', source);
}

export function closeMotherReport() {
  const reportOverlay = document.getElementById('midwife-mother-report-overlay');
  if (reportOverlay) {
    reportOverlay.classList.remove('active');
  }
  console.log('[791 Midwife] Exited Patient Report. Returned to:', previousCallSource);
}

export function endConnectedCall(notifyMother = true) {
  stopIncomingUpTimer();
  const connectedOverlay = document.getElementById('midwife-connected-overlay');
  const videoOverlay = document.getElementById('midwife-video-overlay');
  const reportOverlay = document.getElementById('midwife-mother-report-overlay');
  const videoRequestModal = document.getElementById('video-request-modal-midwife');
  const deviceWrapper = document.querySelector('.device-wrapper');
  stopCallTimer();

  if (reportOverlay) reportOverlay.classList.remove('active');
  if (videoOverlay) videoOverlay.classList.remove('active');
  if (connectedOverlay) connectedOverlay.classList.remove('active');
  if (videoRequestModal) videoRequestModal.classList.remove('active');

  if (deviceWrapper) {
    deviceWrapper.classList.remove('midwife-call-active');
  }

  if (notifyMother) {
    broadcastBusMessage({ type: 'CALL_ENDED' });
  }

  console.log('[791 Midwife] Call ended.');
}

function broadcastBusMessage(payload) {
  try {
    if (channel) channel.postMessage(payload);
    localStorage.setItem('791_emergency_sync', JSON.stringify({ ...payload, _t: Date.now() }));
  } catch (err) {
    console.warn('[791 Midwife] Broadcast failed:', err);
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
  const timerBadge = document.getElementById('connected-call-timer');
  const videoTimerBadge = document.getElementById('midwife-video-timer-badge');
  const reportTimerBadge = document.getElementById('report-call-timer');
  const mins = String(Math.floor(callDurationSec / 60)).padStart(2, '0');
  const secs = String(callDurationSec % 60).padStart(2, '0');
  const formatted = `${mins}:${secs}`;
  if (timerBadge) timerBadge.textContent = formatted;
  if (videoTimerBadge) videoTimerBadge.textContent = formatted;
  if (reportTimerBadge) reportTimerBadge.textContent = formatted;
}

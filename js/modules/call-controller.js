/**
 * Call Controller
 * Manages active emergency / triage voice and video call lifecycle, live duration timer,
 * switching between audio and video modes, and dock actions.
 * Initiated strictly by the SOS emergency trigger.
 */
import { state } from './state.js';
import { cancelSOSCountdown } from './sos-controller.js';

let callTimerInterval = null;
let callDurationSec = 0;

export function initCallController() {
  const endCallBtn = document.getElementById('end-call-btn');
  const videoEndCallBtn = document.getElementById('video-end-call-btn');
  const callVideoBtn = document.getElementById('call-video-btn');
  const videoToggleBtn = document.getElementById('video-toggle-btn');
  const videoCloseBtn = document.getElementById('video-close-btn');
  const videoFlipCameraBtn = document.getElementById('video-flip-camera-btn');
  const callSpeakerBtn = document.getElementById('call-speaker-btn');
  const videoSpeakerBtn = document.getElementById('video-speaker-btn');

  // Listen for SOS Countdown Completion (Emergency Call Screen is strictly for SOS)
  window.addEventListener('sos:connected', () => {
    openCallScreen({
      responderName: 'Laura Hakala',
      facilityName: 'Kuopion yliopistollinen sairaala'
    });
  });

  // Open Video Screen (Keeps Call Active)
  if (callVideoBtn) {
    callVideoBtn.addEventListener('click', openVideoScreen);
  }

  // Close Video Screen (Returns to Voice Call)
  if (videoCloseBtn) {
    videoCloseBtn.addEventListener('click', closeVideoScreen);
  }

  if (videoToggleBtn) {
    videoToggleBtn.addEventListener('click', closeVideoScreen);
  }

  // End Call Handlers (Ends Call completely from either Audio or Video)
  if (endCallBtn) {
    endCallBtn.addEventListener('click', endCall);
  }

  if (videoEndCallBtn) {
    videoEndCallBtn.addEventListener('click', endCall);
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

export function openCallScreen(info) {
  const callScreen = document.getElementById('call-screen');
  const contactNameEl = document.getElementById('call-contact-name');
  const facilityNameEl = document.getElementById('call-facility-name');
  const deviceWrapper = document.querySelector('.device-wrapper');

  if (!callScreen) return;

  if (deviceWrapper) {
    deviceWrapper.classList.remove('zen-sos-mode');
  }

  if (contactNameEl && info.responderName) {
    contactNameEl.textContent = info.responderName;
  }
  if (facilityNameEl && info.facilityName) {
    facilityNameEl.textContent = info.facilityName;
  }

  state.callStatus = 'connected';
  callScreen.classList.add('active');

  startCallTimer();
  console.log('[791 Call] Emergency voice call active with responder:', info.responderName);
}

export function openVideoScreen() {
  const videoScreen = document.getElementById('video-screen-overlay');
  if (!videoScreen) return;

  videoScreen.classList.add('active');
  console.log('[791 Call] Switched to Video stream. Voice call stays connected.');
}

export function closeVideoScreen() {
  const videoScreen = document.getElementById('video-screen-overlay');
  if (!videoScreen) return;

  videoScreen.classList.remove('active');
  console.log('[791 Call] Closed Video stream. Returned to Voice call screen.');
}

export function endCall() {
  const callScreen = document.getElementById('call-screen');
  const videoScreen = document.getElementById('video-screen-overlay');

  stopCallTimer();

  if (videoScreen) videoScreen.classList.remove('active');
  if (callScreen) callScreen.classList.remove('active');

  cancelSOSCountdown();
  state.callStatus = 'idle';
  state.emergencyActive = false;

  console.log('[791 Call] Emergency Call ended. Returned to main screen.');
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

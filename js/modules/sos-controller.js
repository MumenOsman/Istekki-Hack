/**
 * SOS Emergency Controller
 * Manages 10-second Zen Mode emergency countdown with:
 * - Full red screen immersion & fadeout of menu/dots
 * - White button with green progress ring
 * - Dynamic 10S -> 09S countdown & 'Calling Emergency' subtitle
 * - Click-to-cancel without cancel text
 */
import { state } from './state.js';

let animationFrameId = null;
const COUNTDOWN_DURATION_MS = 10000; // 10 seconds

export function initSOSController() {
  const sosBtn = document.getElementById('sos-button');
  if (!sosBtn) return;

  sosBtn.addEventListener('click', handleSOSClick);
}

function handleSOSClick() {
  if (state.callStatus === 'connecting') {
    // Already in 10s connecting countdown -> Cancel and return to original state
    cancelSOSCountdown();
  } else {
    // Start 10s connecting countdown
    startSOSCountdown();
  }
}

function startSOSCountdown() {
  state.callStatus = 'connecting';
  state.emergencyActive = true;

  const deviceWrapper = document.querySelector('.device-wrapper');
  const titleEl = document.getElementById('sos-title');
  const subtitleEl = document.getElementById('sos-subtitle');
  const progressFill = document.getElementById('sos-progress-fill');

  // Trigger Zen Mode (Red immersion, menu & dots disappear, white circle)
  if (deviceWrapper) {
    deviceWrapper.classList.add('zen-sos-mode');
  }

  const startTime = Date.now();
  const circumference = 2 * Math.PI * 140; // radius = 140 -> ~880

  if (progressFill) {
    progressFill.style.strokeDasharray = `${circumference}`;
    progressFill.style.strokeDashoffset = `${circumference}`;
  }

  if (subtitleEl) {
    subtitleEl.textContent = 'Calling Emergency';
  }

  function updateTick() {
    const elapsed = Date.now() - startTime;
    const remainingMs = Math.max(0, COUNTDOWN_DURATION_MS - elapsed);
    const remainingSec = Math.ceil(remainingMs / 1000);
    const progress = Math.min(1, elapsed / COUNTDOWN_DURATION_MS);

    // Update SVG progress ring stroke
    if (progressFill) {
      const offset = circumference * (1 - progress);
      progressFill.style.strokeDashoffset = `${offset}`;
    }

    // Format remaining seconds as 10S, 09S, 08S...
    if (titleEl) {
      const formattedSec = String(remainingSec).padStart(2, '0');
      titleEl.textContent = `${formattedSec}S`;
    }

    if (remainingMs > 0 && state.callStatus === 'connecting') {
      animationFrameId = requestAnimationFrame(updateTick);
    } else if (remainingMs <= 0 && state.callStatus === 'connecting') {
      onSOSCountdownComplete();
    }
  }

  animationFrameId = requestAnimationFrame(updateTick);
}

export function cancelSOSCountdown() {
  state.callStatus = 'idle';
  state.emergencyActive = false;

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  const deviceWrapper = document.querySelector('.device-wrapper');
  const titleEl = document.getElementById('sos-title');
  const subtitleEl = document.getElementById('sos-subtitle');
  const progressFill = document.getElementById('sos-progress-fill');

  // Exit Zen Mode (Restore white background, menu, dots, red button)
  if (deviceWrapper) {
    deviceWrapper.classList.remove('zen-sos-mode');
  }

  if (titleEl) titleEl.textContent = 'SOS';
  if (subtitleEl) subtitleEl.textContent = 'Call Emergency';
  if (progressFill) {
    progressFill.style.strokeDashoffset = '890';
  }

  console.log('[791 SOS] Zen Mode cancelled. Reset to original state.');
}

function onSOSCountdownComplete() {
  state.callStatus = 'connected';
  console.log('[791 SOS] 10s Countdown completed! Emergency connection established.');

  window.dispatchEvent(new CustomEvent('sos:connected', { 
    detail: { 
      timestamp: new Date().toISOString(),
      motherInfo: state.motherInfo 
    } 
  }));
}

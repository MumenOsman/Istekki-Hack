/**
 * Nurse & Healthcare Clinic Controller
 * Manages the clinic main screen actions (non-emergency clinic dialer, messaging, map explorer)
 */
import { state } from './state.js';

export function initNurseController() {
  const callNurseBtn = document.getElementById('call-nurse-btn');
  const sendMessageBtn = document.getElementById('send-message-btn');
  const mapFabBtn = document.getElementById('map-fab-btn');

  if (callNurseBtn) {
    callNurseBtn.addEventListener('click', () => {
      console.log('[791 Clinic] Standard clinic call dialed for Niiralan neuvola.');
      // Standard telephone protocol for clinic reception
      window.location.href = 'tel:+35817173311';
    });
  }

  if (sendMessageBtn) {
    sendMessageBtn.addEventListener('click', () => {
      console.log('[791 Clinic] Non-emergency clinic messaging tapped.');
    });
  }

  if (mapFabBtn) {
    mapFabBtn.addEventListener('click', () => {
      console.log('[791 Clinic] Map explorer opened for:', state.motherInfo.currentLocation);
      window.dispatchEvent(new CustomEvent('map:open', { detail: state.motherInfo }));
    });
  }
}

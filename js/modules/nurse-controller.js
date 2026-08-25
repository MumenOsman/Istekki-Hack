/**
 * Nurse & Healthcare Clinic Controller
 */
import { state } from './state.js';

export function initNurseController() {
  const callNurseBtn = document.getElementById('call-nurse-btn');
  const sendMessageBtn = document.getElementById('send-message-btn');
  const mapFabBtn = document.getElementById('map-fab-btn');

  if (callNurseBtn) {
    callNurseBtn.addEventListener('click', () => {
      console.log('[791 Clinic] Call Nurse initiated:', state.motherInfo.assignedMidwife);
      window.dispatchEvent(new CustomEvent('nurse:call', { detail: state.motherInfo }));
    });
  }

  if (sendMessageBtn) {
    sendMessageBtn.addEventListener('click', () => {
      console.log('[791 Clinic] Send Message initiated');
      window.dispatchEvent(new CustomEvent('nurse:message', { detail: state.motherInfo }));
    });
  }

  if (mapFabBtn) {
    mapFabBtn.addEventListener('click', () => {
      console.log('[791 Clinic] Map navigation opened for:', state.motherInfo.currentLocation);
      window.dispatchEvent(new CustomEvent('map:open', { detail: state.motherInfo }));
    });
  }
}

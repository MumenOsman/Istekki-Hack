/**
 * 791 Mother Application - Main Entry Point
 */
import { initSOSController } from './modules/sos-controller.js';
import { initNurseController } from './modules/nurse-controller.js';
import { initNavigation } from './modules/navigation.js';
import { initDrawerController } from './modules/drawer-controller.js';
import { initCallController } from './modules/call-controller.js';
import { initMapController } from './modules/map-controller.js';

document.addEventListener('DOMContentLoaded', () => {
  // Update live clock in status bar
  updateStatusBarClock();
  setInterval(updateStatusBarClock, 1000);

  // Initialize modules
  initSOSController();
  initNurseController();
  initNavigation();
  initDrawerController();
  initCallController();
  initMapController();

  console.log('🚀 [791 Application] Mother Mobile UI initialized successfully.');
});

function updateStatusBarClock() {
  const clockEl = document.getElementById('status-time');
  if (clockEl) {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    clockEl.textContent = `${hours}:${minutes}`;
  }
}

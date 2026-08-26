/**
 * 791 Mother Application - Main Entry Point
 */
import { initSOSController } from './modules/sos-controller.js';
import { initNurseController } from './modules/nurse-controller.js';
import { initNavigation } from './modules/navigation.js';
import { initDrawerController } from './modules/drawer-controller.js';
import { initCallController } from './modules/call-controller.js';
import { initMapController } from './modules/map-controller.js';
import { initProfileController, openProfileScreen } from './modules/profile-controller.js';
import { initSurveyController } from './modules/survey-controller.js';
import { initHealthController, openHealthScreen } from './modules/health-controller.js';
import { initSettingsController, openSettingsScreen } from './modules/settings-controller.js';
import { initLoginController, motherSignOut } from './modules/login-controller.js';

document.addEventListener('DOMContentLoaded', () => {
  // Update live clock in status bar
  updateStatusBarClock();
  setInterval(updateStatusBarClock, 1000);

  // Initialize modules
  initLoginController();
  initSOSController();
  initNurseController();
  initNavigation();
  initDrawerController();
  initCallController();
  initMapController();
  initProfileController();
  initSurveyController();
  initHealthController();
  initSettingsController();

  // Handle drawer item routing
  window.addEventListener('drawer:navigate', (e) => {
    const target = e.detail?.target;
    if (target === 'profile') {
      openProfileScreen();
    } else if (target === 'health-history') {
      openHealthScreen();
    } else if (target === 'settings') {
      openSettingsScreen();
    } else if (target === 'signout') {
      console.log('[791 Mother] User signed out.');
      motherSignOut();
    }
  });

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

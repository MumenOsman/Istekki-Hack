/**
 * 791 Midwife Application - Main Entry Point
 */
import { initMidwifeLogin } from './midwife-login.js';
import { initMidwifeDutyController } from './midwife-duty-controller.js';
import { initMidwifeNavigation } from './midwife-navigation.js';
import { initMidwifeTeamController } from './midwife-team-controller.js';
import { initMidwifeCallLogsController } from './midwife-call-logs-controller.js';
import { initTableDragScroll } from './midwife-table-drag.js';
import { initMidwifeIncomingCallController, showIncomingCall } from './midwife-incoming-call-controller.js';

document.addEventListener('DOMContentLoaded', () => {
  // Update live clock in status bar
  updateStatusBarClock();
  setInterval(updateStatusBarClock, 1000);

  // Initialize modules
  initMidwifeLogin();
  initMidwifeDutyController();
  initMidwifeNavigation();
  initMidwifeTeamController();
  initMidwifeCallLogsController();
  initTableDragScroll();
  initMidwifeIncomingCallController();

  // Developer / Test helper for direct simulation
  window.testIncomingCall = () => {
    showIncomingCall();
  };

  console.log('🩺 [791 Midwife App] Initialized successfully with incoming call reception.');
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

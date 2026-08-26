/**
 * Midwife Duty Toggle Controller
 * Manages full-screen green inversion, drawer open/close with status bar styling,
 * and status reason prompt (Busy vs Break).
 */

export const midwifeState = {
  isLoggedIn: false,
  isListening: false,
  currentReason: 'Busy',
  practitionerName: 'Laura Hakala',
  staffId: '502941'
};

export function initMidwifeDutyController() {
  const dutyBtn = document.getElementById('midwife-duty-button');
  const menuToggleBtn = document.getElementById('midwife-menu-toggle-btn');
  const drawerCloseBtn = document.getElementById('midwife-drawer-close-btn');
  const drawer = document.getElementById('midwife-drawer-menu');
  const signoutMenuItem = document.getElementById('midwife-menu-signout');
  const callLogsMenuItem = document.getElementById('midwife-menu-call-logs');
  const deviceWrapper = document.querySelector('.device-wrapper');

  // Reason Modal Elements
  const reasonModal = document.getElementById('midwife-reason-modal');
  const busyChoiceBtn = document.getElementById('choice-busy-btn');
  const breakChoiceBtn = document.getElementById('choice-break-btn');
  const cancelChoiceBtn = document.getElementById('choice-cancel-btn');

  // Duty Toggle Button
  if (dutyBtn) {
    dutyBtn.addEventListener('click', () => {
      if (!midwifeState.isListening) {
        startListeningMode();
      } else {
        openReasonPrompt();
      }
    });
  }

  // Reason Modal Choices
  if (busyChoiceBtn) {
    busyChoiceBtn.addEventListener('click', () => {
      stopListeningWithReason('Busy');
    });
  }

  if (breakChoiceBtn) {
    breakChoiceBtn.addEventListener('click', () => {
      stopListeningWithReason('Break');
    });
  }

  if (cancelChoiceBtn) {
    cancelChoiceBtn.addEventListener('click', closeReasonPrompt);
  }

  // Hamburger Drawer Open (Right to Left Slide)
  if (menuToggleBtn && drawer) {
    menuToggleBtn.addEventListener('click', () => {
      drawer.classList.add('open');
      deviceWrapper?.classList.add('drawer-open');
    });
  }

  // Drawer Close Button (Left to Right Slide)
  if (drawerCloseBtn && drawer) {
    drawerCloseBtn.addEventListener('click', () => {
      drawer.classList.remove('open');
      setTimeout(() => {
        if (!midwifeState.isListening && !drawer.classList.contains('open')) {
          deviceWrapper?.classList.remove('drawer-open');
        }
      }, 280);
    });
  }

  // Call Logs Action from Drawer
  if (callLogsMenuItem) {
    callLogsMenuItem.addEventListener('click', () => {
      console.log('[791 Midwife] Call logs tapped.');
    });
  }

  // Sign out from Drawer Menu
  if (signoutMenuItem) {
    signoutMenuItem.addEventListener('click', () => {
      drawer?.classList.remove('open');
      deviceWrapper?.classList.remove('drawer-open');
      handleSignOut();
    });
  }

  // Escape key closes modal
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && reasonModal?.classList.contains('active')) {
      closeReasonPrompt();
    }
  });
}

export function startListeningMode() {
  const deviceWrapper = document.querySelector('.device-wrapper');
  const actionText = document.getElementById('midwife-duty-action-text');
  const statusSub = document.getElementById('midwife-duty-status-sub');

  midwifeState.isListening = true;

  if (deviceWrapper) {
    deviceWrapper.classList.add('midwife-listening-mode');
  }
  if (actionText) actionText.textContent = 'Stop Listening';
  if (statusSub) statusSub.textContent = 'Listening for Calls';

  console.log('[791 Midwife] Status: ACTIVE - Listening for incoming emergency calls');
  window.dispatchEvent(new CustomEvent('midwife:statechange'));
}

export function openReasonPrompt() {
  const reasonModal = document.getElementById('midwife-reason-modal');
  if (reasonModal) {
    reasonModal.classList.add('active');
  }
}

export function closeReasonPrompt() {
  const reasonModal = document.getElementById('midwife-reason-modal');
  if (reasonModal) {
    reasonModal.classList.remove('active');
  }
}

export function stopListeningWithReason(reason) {
  const deviceWrapper = document.querySelector('.device-wrapper');
  const actionText = document.getElementById('midwife-duty-action-text');
  const statusSub = document.getElementById('midwife-duty-status-sub');

  midwifeState.isListening = false;
  midwifeState.currentReason = reason;

  closeReasonPrompt();

  if (deviceWrapper) {
    deviceWrapper.classList.remove('midwife-listening-mode');
  }
  if (actionText) actionText.textContent = 'Start Listening';
  if (statusSub) statusSub.textContent = 'Tap to Receive Calls';

  console.log(`[791 Midwife] Status: STOPPED - Reason: ${reason}`);
  window.dispatchEvent(new CustomEvent('midwife:statechange'));
}

export function resetDutyStateToPrompt() {
  midwifeState.isListening = false;
  midwifeState.currentReason = 'Busy';
  const deviceWrapper = document.querySelector('.device-wrapper');
  const actionText = document.getElementById('midwife-duty-action-text');
  const statusSub = document.getElementById('midwife-duty-status-sub');

  if (deviceWrapper) {
    deviceWrapper.classList.remove('midwife-listening-mode');
    deviceWrapper.classList.remove('drawer-open');
  }

  if (actionText) actionText.textContent = 'Start Listening';
  if (statusSub) statusSub.textContent = 'Tap to Receive Calls';

  window.dispatchEvent(new CustomEvent('midwife:statechange'));
}

export function handleSignOut() {
  midwifeState.isLoggedIn = false;
  midwifeState.isListening = false;
  sessionStorage.removeItem('791_midwife_session');

  const deviceWrapper = document.querySelector('.device-wrapper');
  if (deviceWrapper) {
    deviceWrapper.classList.remove('midwife-listening-mode');
    deviceWrapper.classList.remove('drawer-open');
  }

  const loginSection = document.getElementById('midwife-login-view');
  const appContentView = document.getElementById('midwife-app-content');

  if (appContentView) appContentView.style.display = 'none';
  if (loginSection) loginSection.style.display = 'flex';

  console.log('[791 Midwife] Signed out of shift.');
}

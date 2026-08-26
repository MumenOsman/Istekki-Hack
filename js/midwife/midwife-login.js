/**
 * Midwife Clinician Login Controller
 */
import { midwifeState, resetDutyStateToPrompt } from './midwife-duty-controller.js';
import { goToScreen } from './midwife-navigation.js';

export function initMidwifeLogin() {
  const loginForm = document.getElementById('midwife-login-form');
  const staffInput = document.getElementById('midwife-staff-id');

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleMidwifeLogin({
        staffId: staffInput?.value || '502941',
        name: 'Laura Hakala'
      });
    });
  }
}

function handleMidwifeLogin(clinicianData) {
  console.log('[791 Midwife] Clinician signed in:', clinicianData);
  midwifeState.isLoggedIn = true;
  midwifeState.staffId = clinicianData.staffId;
  midwifeState.practitionerName = clinicianData.name;

  sessionStorage.setItem('791_midwife_session', JSON.stringify(clinicianData));

  const loginSection = document.getElementById('midwife-login-view');
  const appContentView = document.getElementById('midwife-app-content');
  const nameDisplay = document.getElementById('duty-practitioner-name');
  const idDisplay = document.getElementById('duty-practitioner-id');

  if (nameDisplay) nameDisplay.textContent = clinicianData.name;
  if (idDisplay) idDisplay.textContent = `ID: ${clinicianData.staffId}`;

  // Reset duty toggle state to 'Start Listening'
  resetDutyStateToPrompt();

  if (loginSection) loginSection.style.display = 'none';
  if (appContentView) appContentView.style.display = 'flex';

  // Navigate to Screen 1 (Duty)
  setTimeout(() => {
    goToScreen(1, false);
  }, 50);
}

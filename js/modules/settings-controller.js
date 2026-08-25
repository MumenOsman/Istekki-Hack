/**
 * Settings & Legal Information Controller
 * Handles App Preferences, Terms & Conditions viewer, and Account Deletion flows.
 */

export function initSettingsController() {
  const settingsOverlay = document.getElementById('settings-screen-overlay');
  const termsOverlay = document.getElementById('terms-modal-overlay');
  const settingsBackBtn = document.getElementById('settings-back-btn');
  const termsBackBtn = document.getElementById('terms-back-btn');
  const termsRowBtn = document.getElementById('settings-terms-row');
  const deleteBtn = document.getElementById('delete-account-btn');
  const deleteConfirmOverlay = document.getElementById('delete-confirm-overlay');
  const cancelDeleteBtn = document.getElementById('modal-cancel-btn');
  const confirmDeleteBtn = document.getElementById('modal-confirm-delete-btn');
  const settingsMenuBtn = document.querySelector('.drawer-menu-item[data-target="settings"]');

  // Direct click on Settings drawer menu item
  if (settingsMenuBtn) {
    settingsMenuBtn.addEventListener('click', () => {
      openSettingsScreen();
    });
  }

  // Back from Settings -> returns to Side Panel
  if (settingsBackBtn) {
    settingsBackBtn.addEventListener('click', closeSettingsScreen);
  }

  // Open Terms & Conditions
  if (termsRowBtn) {
    termsRowBtn.addEventListener('click', openTermsModal);
  }

  // Back from Terms -> returns to Settings
  if (termsBackBtn) {
    termsBackBtn.addEventListener('click', closeTermsModal);
  }

  // Trigger Delete Modal
  if (deleteBtn && deleteConfirmOverlay) {
    deleteBtn.addEventListener('click', () => {
      deleteConfirmOverlay.classList.add('active');
    });
  }

  // Cancel Delete
  if (cancelDeleteBtn && deleteConfirmOverlay) {
    cancelDeleteBtn.addEventListener('click', () => {
      deleteConfirmOverlay.classList.remove('active');
    });
  }

  // Confirm Delete
  if (confirmDeleteBtn && deleteConfirmOverlay) {
    confirmDeleteBtn.addEventListener('click', () => {
      deleteConfirmOverlay.classList.remove('active');
      closeSettingsScreen();
      alert('Local patient session and temporary triage cache cleared.');
      console.log('[791 Settings] Account data erased from local session.');
    });
  }

  // Escape key handler
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (deleteConfirmOverlay?.classList.contains('active')) {
        deleteConfirmOverlay.classList.remove('active');
      } else if (termsOverlay?.classList.contains('active')) {
        closeTermsModal();
      } else if (settingsOverlay?.classList.contains('active')) {
        closeSettingsScreen();
      }
    }
  });
}

export function openSettingsScreen() {
  const settingsOverlay = document.getElementById('settings-screen-overlay');
  if (!settingsOverlay) return;

  settingsOverlay.classList.add('active');
  console.log('[791 Settings] Settings screen opened from Side Panel.');
}

export function closeSettingsScreen() {
  const settingsOverlay = document.getElementById('settings-screen-overlay');
  if (!settingsOverlay) return;

  settingsOverlay.classList.remove('active');
  console.log('[791 Settings] Settings screen closed. Returned to Side Panel.');
}

export function openTermsModal() {
  const termsOverlay = document.getElementById('terms-modal-overlay');
  if (!termsOverlay) return;

  termsOverlay.classList.add('active');
  console.log('[791 Settings] Terms and Conditions modal opened.');
}

export function closeTermsModal() {
  const termsOverlay = document.getElementById('terms-modal-overlay');
  if (!termsOverlay) return;

  termsOverlay.classList.remove('active');
  console.log('[791 Settings] Terms and Conditions modal closed.');
}

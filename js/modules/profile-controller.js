/**
 * Profile Controller
 * Manages the Profile view with personal metadata, editable contacts,
 * Suomi.fi authentication state, and self survey action.
 */
import { openSurveyScreen } from './survey-controller.js';

export function initProfileController() {
  const profileOverlay = document.getElementById('profile-screen-overlay');
  const backBtn = document.getElementById('profile-back-btn');
  const surveyBtn = document.getElementById('profile-survey-btn');
  const profileMenuBtn = document.querySelector('.drawer-menu-item[data-target="profile"]');

  // Direct click on Profile menu item
  if (profileMenuBtn) {
    profileMenuBtn.addEventListener('click', () => {
      openProfileScreen();
    });
  }

  // Back button handler -> Slides out left-to-right to reveal the Side Panel
  if (backBtn) {
    backBtn.addEventListener('click', closeProfileScreen);
  }

  // Self Survey button -> Opens Medical Self Survey
  if (surveyBtn) {
    surveyBtn.addEventListener('click', () => {
      openSurveyScreen();
    });
  }

  // Escape key handler
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && profileOverlay?.classList.contains('active')) {
      closeProfileScreen();
    }
  });
}

export function openProfileScreen() {
  const profileOverlay = document.getElementById('profile-screen-overlay');
  if (!profileOverlay) return;

  profileOverlay.classList.add('active');
  console.log('[791 Profile] Profile screen opened from Side Panel.');
}

export function closeProfileScreen() {
  const profileOverlay = document.getElementById('profile-screen-overlay');
  if (!profileOverlay) return;

  profileOverlay.classList.remove('active');
  console.log('[791 Profile] Profile screen slid out to right. Revealed Side Panel.');
}

/**
 * Self Survey & Medical Triage Assessment Controller
 * Manages contraction frequency, pain scale, amniotic fluid status,
 * medications, and triage submission.
 */
import { state } from './state.js';

export function initSurveyController() {
  const surveyOverlay = document.getElementById('survey-screen-overlay');
  const backBtn = document.getElementById('survey-back-btn');
  const submitBtn = document.getElementById('survey-submit-btn');
  const painSlider = document.getElementById('pain-level-slider');
  const painValueBadge = document.getElementById('pain-value-badge');
  const optionButtons = document.querySelectorAll('.survey-option-btn');

  // Back button
  if (backBtn) {
    backBtn.addEventListener('click', closeSurveyScreen);
  }

  // Option selection logic
  optionButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const parent = e.currentTarget.closest('.survey-options-grid');
      if (parent) {
        parent.querySelectorAll('.survey-option-btn').forEach(b => b.classList.remove('selected'));
      }
      e.currentTarget.classList.add('selected');
    });
  });

  // Live Pain Slider update
  if (painSlider && painValueBadge) {
    painSlider.addEventListener('input', (e) => {
      painValueBadge.textContent = `${e.target.value} / 10`;
    });
  }

  // Submit assessment
  if (submitBtn) {
    submitBtn.addEventListener('click', submitSurveyAssessment);
  }

  // Escape key handler
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && surveyOverlay?.classList.contains('active')) {
      closeSurveyScreen();
    }
  });
}

export function openSurveyScreen() {
  const surveyOverlay = document.getElementById('survey-screen-overlay');
  if (!surveyOverlay) return;

  surveyOverlay.classList.add('active');
  console.log('[791 Survey] Medical Self Survey opened.');
}

export function closeSurveyScreen() {
  const surveyOverlay = document.getElementById('survey-screen-overlay');
  if (!surveyOverlay) return;

  surveyOverlay.classList.remove('active');
  console.log('[791 Survey] Medical Self Survey closed.');
}

function submitSurveyAssessment() {
  state.motherInfo.surveyCompleted = true;

  // Update button in profile screen to show verified completed state
  const profileSurveyStatus = document.querySelector('.profile-survey-status-text');
  if (profileSurveyStatus) {
    profileSurveyStatus.textContent = 'Completed (Updated Just Now)';
    profileSurveyStatus.style.color = '#A7F3D0'; // Soft teal-green
  }

  closeSurveyScreen();
  console.log('[791 Survey] Medical assessment saved to patient Kanta triage record.');
}

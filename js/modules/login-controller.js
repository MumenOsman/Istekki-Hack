/**
 * Mother App Login Controller
 */

export function initLoginController() {
  const loginView = document.getElementById('mother-login-view');
  const loginForm = document.getElementById('mother-login-form');

  if (!loginView || !loginForm) return;

  // Check existing session
  const isAuthenticated = sessionStorage.getItem('791_mother_authenticated');
  if (isAuthenticated === 'true') {
    loginView.classList.add('hidden');
  } else {
    loginView.classList.remove('hidden');
  }

  // Handle Form Submit
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('[791 Mother] Sign in submitted.');
    sessionStorage.setItem('791_mother_authenticated', 'true');
    loginView.classList.add('hidden');
  });
}

export function motherSignOut() {
  sessionStorage.removeItem('791_mother_authenticated');
  const loginView = document.getElementById('mother-login-view');
  if (loginView) {
    loginView.classList.remove('hidden');
  }
}

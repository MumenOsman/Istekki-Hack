/**
 * Navigation Drawer Controller
 * Handles opening, closing, and menu item routing
 */
export function initDrawerController() {
  const openBtn = document.getElementById('menu-toggle-btn');
  const closeBtn = document.getElementById('drawer-close-btn');
  const drawer = document.getElementById('drawer-menu');
  const deviceWrapper = document.querySelector('.device-wrapper');
  const menuItems = document.querySelectorAll('.drawer-menu-item');

  if (!drawer) return;

  // Open drawer
  if (openBtn) {
    openBtn.addEventListener('click', () => {
      openDrawer();
    });
  }

  // Close drawer button
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      closeDrawer();
    });
  }

  // Close on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });

  // Menu items click handling
  menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const target = e.currentTarget.getAttribute('data-target');
      console.log(`[791 Menu] Navigating to: ${target}`);
      closeDrawer();
      window.dispatchEvent(new CustomEvent('drawer:navigate', { detail: { target } }));
    });
  });

  function openDrawer() {
    drawer.classList.add('open');
    if (deviceWrapper) {
      deviceWrapper.classList.add('drawer-open');
    }
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    if (deviceWrapper) {
      deviceWrapper.classList.remove('drawer-open');
    }
  }
}

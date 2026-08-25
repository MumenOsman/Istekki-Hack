/**
 * Navigation Module - Interactive 1:1 Touch & Drag Gesture Physics
 * Dynamically tracks finger/cursor movement with real-time translation and smooth snapping.
 * Locks navigation when in Zen Mode or during an active emergency call.
 */
import { state } from './state.js';

export function initNavigation() {
  const dots = document.querySelectorAll('.dot');
  const viewport = document.getElementById('screens-viewport');
  const appScreen = document.querySelector('.app-screen');
  
  if (!dots.length || !viewport || !appScreen) return;

  let startX = 0;
  let currentDeltaX = 0;
  let isDragging = false;
  let screenWidth = appScreen.clientWidth || 390;

  // Initialize initial viewport position
  snapToScreen(state.activeScreenIndex, false);

  // Pagination Dot Clicks
  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      if (isNavigationLocked()) return;
      const targetIndex = parseInt(e.currentTarget.getAttribute('data-index'), 10);
      snapToScreen(targetIndex, true);
    });
  });

  // --- TOUCH GESTURES ---
  viewport.addEventListener('touchstart', onTouchStart, { passive: true });
  viewport.addEventListener('touchmove', onTouchMove, { passive: false });
  viewport.addEventListener('touchend', onTouchEnd, { passive: true });
  viewport.addEventListener('touchcancel', onTouchEnd, { passive: true });

  // --- MOUSE DRAG GESTURES ---
  viewport.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);

  // --- KEYBOARD ARROWS ---
  window.addEventListener('keydown', (e) => {
    if (isNavigationLocked()) return;
    if (e.key === 'ArrowLeft' && state.activeScreenIndex > 0) {
      snapToScreen(state.activeScreenIndex - 1, true);
    } else if (e.key === 'ArrowRight' && state.activeScreenIndex < dots.length - 1) {
      snapToScreen(state.activeScreenIndex + 1, true);
    }
  });

  function isNavigationLocked() {
    return state.callStatus === 'connecting' || state.callStatus === 'connected' || state.emergencyActive;
  }

  function onTouchStart(e) {
    if (isNavigationLocked()) return;
    startX = e.touches[0].clientX;
    currentDeltaX = 0;
    isDragging = true;
    screenWidth = appScreen.clientWidth || 390;
    viewport.style.transition = 'none';
  }

  function onTouchMove(e) {
    if (!isDragging || isNavigationLocked()) return;
    const currentX = e.touches[0].clientX;
    currentDeltaX = currentX - startX;
    updateDragPosition();
  }

  function onTouchEnd() {
    if (!isDragging) return;
    isDragging = false;
    if (isNavigationLocked()) return;
    handleGestureRelease();
  }

  function onMouseDown(e) {
    if (isNavigationLocked()) return;
    startX = e.clientX;
    currentDeltaX = 0;
    isDragging = true;
    screenWidth = appScreen.clientWidth || 390;
    viewport.style.transition = 'none';
    viewport.style.cursor = 'grabbing';
  }

  function onMouseMove(e) {
    if (!isDragging || isNavigationLocked()) return;
    const currentX = e.clientX;
    currentDeltaX = currentX - startX;
    updateDragPosition();
  }

  function onMouseUp() {
    if (!isDragging) return;
    isDragging = false;
    viewport.style.cursor = '';
    if (isNavigationLocked()) return;
    handleGestureRelease();
  }

  /**
   * Translates the viewport in real-time 1:1 with finger position
   */
  function updateDragPosition() {
    let effectiveDelta = currentDeltaX;
    if (state.activeScreenIndex === 0 && effectiveDelta > 0) {
      effectiveDelta *= 0.3; // Resistance on left edge
    } else if (state.activeScreenIndex === dots.length - 1 && effectiveDelta < 0) {
      effectiveDelta *= 0.3; // Resistance on right edge
    }

    const baseOffsetPercent = state.activeScreenIndex * -100;
    viewport.style.transform = `translateX(calc(${baseOffsetPercent}% + ${effectiveDelta}px))`;
  }

  /**
   * Calculates snap target on finger release based on distance dragged
   */
  function handleGestureRelease() {
    const snapThreshold = screenWidth * 0.18;

    if (currentDeltaX > snapThreshold && state.activeScreenIndex > 0) {
      snapToScreen(state.activeScreenIndex - 1, true);
    } else if (currentDeltaX < -snapThreshold && state.activeScreenIndex < dots.length - 1) {
      snapToScreen(state.activeScreenIndex + 1, true);
    } else {
      snapToScreen(state.activeScreenIndex, true);
    }

    currentDeltaX = 0;
  }

  /**
   * Snaps viewport smoothly to target screen
   */
  function snapToScreen(index, animate = true) {
    state.activeScreenIndex = index;
    
    if (animate) {
      viewport.style.transition = 'transform 0.28s cubic-bezier(0.25, 1, 0.5, 1)';
    } else {
      viewport.style.transition = 'none';
    }

    viewport.style.transform = `translateX(-${index * 100}%)`;

    // Update pagination dots
    dots.forEach((dot, idx) => {
      if (idx === index) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    window.dispatchEvent(new CustomEvent('screen:changed', { detail: { index } }));
  }
}

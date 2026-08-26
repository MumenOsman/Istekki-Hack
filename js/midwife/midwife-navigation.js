/**
 * Midwife Swipe Navigation Controller
 * Handles 1:1 touch/pointer tracking between Screen 0 (Team) and Screen 1 (Duty).
 * Allows unobstructed horizontal and vertical scrolling inside tables.
 */

let currentIndex = 1; // Default to Screen 1 (Duty) upon login
let startX = 0;
let currentTranslate = 0;
let prevTranslate = 0;
let isDragging = false;
let startTime = 0;

export function initMidwifeNavigation() {
  const viewport = document.getElementById('midwife-screens-viewport');
  const dots = document.querySelectorAll('.midwife-dot');

  if (!viewport) return;

  // Touch Events
  viewport.addEventListener('touchstart', touchStart, { passive: true });
  viewport.addEventListener('touchmove', touchMove, { passive: false });
  viewport.addEventListener('touchend', touchEnd);

  // Pointer / Mouse Events
  viewport.addEventListener('pointerdown', pointerDown);
  window.addEventListener('pointermove', pointerMove);
  window.addEventListener('pointerup', pointerUp);
  window.addEventListener('pointercancel', pointerUp);

  // Pagination Dot Clicks
  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      const index = parseInt(e.currentTarget.getAttribute('data-index'), 10);
      goToScreen(index);
    });
  });

  // Set initial position to Screen 1 (Duty)
  goToScreen(1, false);
}

export function goToScreen(index, animate = true) {
  const viewport = document.getElementById('midwife-screens-viewport');
  const dots = document.querySelectorAll('.midwife-dot');

  currentIndex = Math.max(0, Math.min(1, index));
  const offset = -currentIndex * 100;

  if (viewport) {
    viewport.style.transition = animate ? 'transform 0.32s cubic-bezier(0.16, 1, 0.3, 1)' : 'none';
    viewport.style.transform = `translateX(${offset}%)`;
  }

  dots.forEach(dot => {
    const dotIdx = parseInt(dot.getAttribute('data-index'), 10);
    if (dotIdx === currentIndex) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });

  prevTranslate = offset;
}

function touchStart(e) {
  // Allow normal scrolling if touching inside tables or interactive elements
  if (e.target.closest('table, .midwife-table-wrapper, .midwife-logs-table-wrapper, button, input, select')) {
    isDragging = false;
    return;
  }
  startX = e.touches[0].clientX;
  startDrag();
}

function touchMove(e) {
  if (!isDragging) return;
  const currentX = e.touches[0].clientX;
  handleMove(currentX);
  e.preventDefault();
}

function touchEnd(e) {
  if (!isDragging) return;
  const endX = e.changedTouches[0].clientX;
  endDrag(endX);
}

function pointerDown(e) {
  // Allow normal scrolling and interactions inside tables or buttons
  if (e.target.closest('table, .midwife-table-wrapper, .midwife-logs-table-wrapper, button, input, select')) return;
  startX = e.clientX;
  startDrag();
}

function pointerMove(e) {
  if (!isDragging) return;
  handleMove(e.clientX);
}

function pointerUp(e) {
  if (!isDragging) return;
  endDrag(e.clientX);
}

function startDrag() {
  const viewport = document.getElementById('midwife-screens-viewport');
  isDragging = true;
  startTime = Date.now();
  if (viewport) {
    viewport.style.transition = 'none';
  }
}

function handleMove(currentX) {
  const viewport = document.getElementById('midwife-screens-viewport');
  const diff = currentX - startX;
  const viewportWidth = viewport ? viewport.offsetWidth : 390;
  const diffPercent = (diff / viewportWidth) * 100;

  currentTranslate = prevTranslate + diffPercent;

  // Resistance past bounds
  if (currentTranslate > 0) {
    currentTranslate = currentTranslate * 0.3;
  } else if (currentTranslate < -100) {
    currentTranslate = -100 + (currentTranslate + 100) * 0.3;
  }

  if (viewport) {
    viewport.style.transform = `translateX(${currentTranslate}%)`;
  }
}

function endDrag(endX) {
  isDragging = false;
  const diff = endX - startX;
  const timeElapsed = Date.now() - startTime;
  const velocity = Math.abs(diff) / timeElapsed;

  // Flick gesture or > 18% distance threshold
  if (velocity > 0.4 || Math.abs(diff) > 60) {
    if (diff > 0) {
      goToScreen(0); // Swiped right -> Team screen
    } else {
      goToScreen(1); // Swiped left -> Duty screen
    }
  } else {
    goToScreen(currentIndex);
  }
}

/**
 * Midwife Table Grab & Swipe Gesture Controller
 * Enables mouse grab-to-scroll and touch swiping on tables with smooth momentum.
 */

export function initTableDragScroll() {
  const tableWrappers = document.querySelectorAll('.midwife-table-wrapper, .midwife-logs-table-wrapper');

  tableWrappers.forEach(slider => {
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let velX = 0;
    let momentumID = null;

    slider.addEventListener('pointerdown', (e) => {
      isDown = true;
      slider.classList.add('grabbing');
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
      cancelMomentumTracking();
    });

    slider.addEventListener('pointerleave', () => {
      if (!isDown) return;
      isDown = false;
      slider.classList.remove('grabbing');
      beginMomentumTracking();
    });

    slider.addEventListener('pointerup', () => {
      if (!isDown) return;
      isDown = false;
      slider.classList.remove('grabbing');
      beginMomentumTracking();
    });

    slider.addEventListener('pointermove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 1.2; // 1:1.2 speed multiplier
      const prevScroll = slider.scrollLeft;
      slider.scrollLeft = scrollLeft - walk;
      velX = slider.scrollLeft - prevScroll;
    });

    function beginMomentumTracking() {
      cancelMomentumTracking();
      momentumID = requestAnimationFrame(momentumLoop);
    }

    function cancelMomentumTracking() {
      if (momentumID) {
        cancelAnimationFrame(momentumID);
        momentumID = null;
      }
    }

    function momentumLoop() {
      slider.scrollLeft += velX;
      velX *= 0.92; // Friction deceleration
      if (Math.abs(velX) > 0.5) {
        momentumID = requestAnimationFrame(momentumLoop);
      } else {
        cancelMomentumTracking();
      }
    }
  });
}

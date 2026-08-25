/**
 * Map & Navigation Controller
 * Manages:
 * 1. Emergency Turn-by-Turn Navigation Map (triggered from Emergency Call / Video Call)
 * 2. Healthcare Explorer & Swipable Saved Locations Sheet (triggered from Clinic Main Screen)
 */
import { state } from './state.js';

let navMap = null;
let explorerMap = null;
let explorerMarkers = [];
let navOpenedFrom = 'audio'; // 'audio' | 'video'

// Saved Healthcare Locations in Kuopio
export const SAVED_HEALTHCARE_LOCATIONS = [
  {
    id: 'niiralan-neuvola',
    name: 'Niiralan neuvola',
    address: 'Juontotie 8, 70150 Kuopio',
    tag: 'Primary Maternity Clinic',
    coords: [62.8895, 27.6535]
  },
  {
    id: 'kys-hospital',
    name: 'Kuopion yliopistollinen sairaala (KYS)',
    address: 'Puijonlaaksontie 2, 70210 Kuopio',
    tag: 'Hospital & Birth Delivery Unit',
    coords: [62.8995, 27.6530]
  },
  {
    id: 'puijonlaakso-neuvola',
    name: 'Puijonlaakson lääkäriasema',
    address: 'Sammakkolammentie 12, 70200 Kuopio',
    tag: 'Community Health Station',
    coords: [62.9050, 27.6430]
  }
];

const NAVIGATION_ROUTE_POINTS = [
  [62.8940, 27.6620],
  [62.8925, 27.6590],
  [62.8910, 27.6560],
  [62.8895, 27.6535]
];

export function initMapController() {
  const navMapOverlay = document.getElementById('map-view-overlay');
  const explorerMapOverlay = document.getElementById('explorer-map-overlay');
  const navCloseBtn = document.getElementById('map-close-btn');
  const explorerBackBtn = document.getElementById('explorer-back-btn');
  const mapFabBtn = document.getElementById('map-fab-btn');
  const callMapBtn = document.getElementById('call-map-btn');
  const videoMapBtn = document.getElementById('video-map-btn');
  const searchInput = document.getElementById('explorer-search-input');

  // 1. Trigger from Audio Call Screen -> Opens Emergency Navigation Map
  if (callMapBtn) {
    callMapBtn.addEventListener('click', () => {
      openEmergencyNavMap(state.motherInfo, 'audio');
    });
  }

  // 2. Trigger from Video Call Screen -> Opens Emergency Navigation Map
  if (videoMapBtn) {
    videoMapBtn.addEventListener('click', () => {
      openEmergencyNavMap(state.motherInfo, 'video');
    });
  }

  // 3. Trigger from Clinic Screen -> Opens Healthcare Explorer Map
  if (mapFabBtn) {
    mapFabBtn.addEventListener('click', () => {
      openExplorerMap();
    });
  }

  // Close handlers
  if (navCloseBtn) {
    navCloseBtn.addEventListener('click', closeEmergencyNavMap);
  }

  if (explorerBackBtn) {
    explorerBackBtn.addEventListener('click', closeExplorerMap);
  }

  // Search input filtering
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      filterSavedLocations(e.target.value.toLowerCase().trim());
    });
  }

  // Bind clicks on saved location cards
  setupSavedLocationCards();

  // Initialize Swipable Bottom Sheet with flick & low-threshold push physics
  initSwipableBottomSheet();

  // Escape key handler
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (navMapOverlay?.classList.contains('active')) closeEmergencyNavMap();
      if (explorerMapOverlay?.classList.contains('active')) closeExplorerMap();
    }
  });
}

// ---------------------------------------------------------------------------
// 1. EMERGENCY TURN-BY-TURN NAVIGATION MAP
// ---------------------------------------------------------------------------
export function openEmergencyNavMap(destinationInfo, source = 'audio') {
  const navMapOverlay = document.getElementById('map-view-overlay');
  const destinationEl = document.getElementById('map-destination-text');

  if (!navMapOverlay) return;

  navOpenedFrom = source; // Remember if opened from 'audio' or 'video'

  if (destinationEl && destinationInfo?.currentLocation) {
    destinationEl.textContent = destinationInfo.currentLocation;
  }

  navMapOverlay.classList.add('active');

  if (!navMap && typeof L !== 'undefined') {
    navMap = L.map('leaflet-map', {
      zoomControl: true,
      attributionControl: false
    }).setView([62.8918, 27.6578], 15);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(navMap);

    L.polyline(NAVIGATION_ROUTE_POINTS, {
      color: '#E52E2E',
      weight: 6,
      opacity: 0.95,
      lineJoin: 'round',
      lineCap: 'round'
    }).addTo(navMap);

    const userIcon = L.divIcon({
      className: 'user-nav-marker-wrapper',
      html: `<div class="user-nav-marker"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    L.marker([62.8940, 27.6620], { icon: userIcon }).addTo(navMap);

    const clinicIcon = L.divIcon({
      className: 'destination-clinic-marker-wrapper',
      html: `
        <div class="destination-clinic-marker">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });
    L.marker([62.8895, 27.6535], { icon: clinicIcon }).addTo(navMap);
  }

  setTimeout(() => {
    if (navMap) {
      navMap.invalidateSize();
      navMap.fitBounds(NAVIGATION_ROUTE_POINTS, { padding: [80, 40] });
    }
  }, 100);

  console.log(`[791 Map] Emergency Navigation View active (Opened from: ${source}).`);
}

export function closeEmergencyNavMap() {
  const navMapOverlay = document.getElementById('map-view-overlay');
  if (navMapOverlay) {
    navMapOverlay.classList.remove('active');
  }

  console.log(`[791 Map] Navigation closed. Returned to ${navOpenedFrom} call screen.`);
}

// ---------------------------------------------------------------------------
// 2. HEALTHCARE EXPLORER & SAVED LOCATIONS MAP
// ---------------------------------------------------------------------------
export function openExplorerMap() {
  const explorerOverlay = document.getElementById('explorer-map-overlay');
  if (!explorerOverlay) return;

  explorerOverlay.classList.add('active');

  if (!explorerMap && typeof L !== 'undefined') {
    explorerMap = L.map('explorer-leaflet-map', {
      zoomControl: true,
      attributionControl: false
    }).setView([62.8950, 27.6530], 14);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(explorerMap);

    SAVED_HEALTHCARE_LOCATIONS.forEach(loc => {
      const pinIcon = L.divIcon({
        className: 'explorer-pin-wrapper',
        html: `
          <div class="destination-clinic-marker" title="${loc.name}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });

      const marker = L.marker(loc.coords, { icon: pinIcon })
        .addTo(explorerMap)
        .bindPopup(`<b>${loc.name}</b><br>${loc.address}`);

      explorerMarkers.push({ id: loc.id, marker });
    });
  }

  setTimeout(() => {
    if (explorerMap) {
      explorerMap.invalidateSize();
      const allCoords = SAVED_HEALTHCARE_LOCATIONS.map(l => l.coords);
      explorerMap.fitBounds(allCoords, { padding: [80, 50] });
    }
  }, 100);

  console.log('[791 Map] Healthcare Location Explorer active.');
}

export function closeExplorerMap() {
  const explorerOverlay = document.getElementById('explorer-map-overlay');
  if (explorerOverlay) explorerOverlay.classList.remove('active');
}

function setupSavedLocationCards() {
  const cards = document.querySelectorAll('.saved-location-card');
  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      const locId = e.currentTarget.getAttribute('data-id');
      const location = SAVED_HEALTHCARE_LOCATIONS.find(l => l.id === locId);
      if (location && explorerMap) {
        explorerMap.setView(location.coords, 16, { animate: true });
        const targetMarker = explorerMarkers.find(m => m.id === locId);
        if (targetMarker) {
          targetMarker.marker.openPopup();
        }
      }
    });
  });
}

function filterSavedLocations(query) {
  const cards = document.querySelectorAll('.saved-location-card');
  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    if (!query || text.includes(query)) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

/**
 * Enhanced Swipable Bottom Sheet with Low Push Threshold and Velocity Flick Physics
 */
function initSwipableBottomSheet() {
  const sheet = document.getElementById('saved-locations-sheet');
  const dragZone = document.getElementById('saved-sheet-drag-zone');
  if (!sheet || !dragZone) return;

  let startY = 0;
  let startTime = 0;
  let currentDeltaY = 0;
  let isDragging = false;
  let isCollapsed = false;
  const COLLAPSED_OFFSET_PX = 270;

  dragZone.addEventListener('click', () => {
    if (Math.abs(currentDeltaY) < 6) {
      toggleSheet();
    }
  });

  dragZone.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY;
    startTime = Date.now();
    currentDeltaY = 0;
    isDragging = true;
    sheet.style.transition = 'none';
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    currentDeltaY = currentY - startY;
    updateDrag();
  }, { passive: true });

  window.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;
    handleRelease();
  });

  dragZone.addEventListener('mousedown', (e) => {
    startY = e.clientY;
    startTime = Date.now();
    currentDeltaY = 0;
    isDragging = true;
    sheet.style.transition = 'none';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const currentY = e.clientY;
    currentDeltaY = currentY - startY;
    updateDrag();
  });

  window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    handleRelease();
  });

  function updateDrag() {
    const baseOffset = isCollapsed ? COLLAPSED_OFFSET_PX : 0;
    let targetOffset = baseOffset + currentDeltaY;
    if (targetOffset < 0) targetOffset *= 0.2;
    if (targetOffset > COLLAPSED_OFFSET_PX + 30) targetOffset = COLLAPSED_OFFSET_PX + (targetOffset - COLLAPSED_OFFSET_PX) * 0.2;

    sheet.style.transform = `translateY(${targetOffset}px)`;
  }

  function handleRelease() {
    sheet.style.transition = 'transform 0.28s cubic-bezier(0.2, 1, 0.3, 1)';
    const duration = Math.max(1, Date.now() - startTime);
    const velocity = currentDeltaY / duration;

    const distanceThreshold = 18;
    const flickVelocityThreshold = 0.2;

    if (!isCollapsed) {
      if (currentDeltaY > distanceThreshold || velocity > flickVelocityThreshold) {
        collapseSheet();
      } else {
        expandSheet();
      }
    } else {
      if (currentDeltaY < -distanceThreshold || velocity < -flickVelocityThreshold) {
        expandSheet();
      } else {
        collapseSheet();
      }
    }

    currentDeltaY = 0;
  }

  function toggleSheet() {
    if (isCollapsed) expandSheet();
    else collapseSheet();
  }

  function collapseSheet() {
    isCollapsed = true;
    sheet.style.transform = `translateY(${COLLAPSED_OFFSET_PX}px)`;
    sheet.classList.add('collapsed');
  }

  function expandSheet() {
    isCollapsed = false;
    sheet.style.transform = `translateY(0)`;
    sheet.classList.remove('collapsed');
  }
}

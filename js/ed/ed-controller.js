/**
 * 791 Emergency Dispatcher (ED / 112 CAD) Controller
 * Real-time integration with Mother SOS, Midwife triage recommendations,
 * and EMS Ambulance dispatch coordination.
 */

let channel = null;
let incidentStartTime = null;
let incidentTimerInterval = null;
let isDispatched = false;

export function initEDController() {
  const dispatchBtn = document.getElementById('btn-dispatch-unit');
  const micBtn = document.getElementById('ed-backchannel-mic-btn');

  // Initialize Cross-Tab Emergency Broadcast Bus
  try {
    channel = new BroadcastChannel('791_emergency_bus');
    channel.onmessage = (event) => {
      handleBusEvent(event.data);
    };
  } catch (err) {
    console.warn('[791 ED Bus] BroadcastChannel not supported:', err);
  }

  // LocalStorage sync fallback
  window.addEventListener('storage', (e) => {
    if (e.key === '791_emergency_sync' && e.newValue) {
      try {
        const data = JSON.parse(e.newValue);
        handleBusEvent(data);
      } catch (err) {
        // ignore
      }
    }
  });

  // 1-Click Ambulance Dispatch Button
  if (dispatchBtn) {
    dispatchBtn.addEventListener('click', () => {
      confirmAmbulanceDispatch();
    });
  }

  // Backchannel Microphone Toggle
  if (micBtn) {
    micBtn.addEventListener('click', () => {
      const isMuted = micBtn.classList.toggle('active-talk');
      micBtn.innerHTML = isMuted 
        ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg> Talking with Midwife`
        : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg> Muted Backchannel`;
      
      addLogEntry(isMuted ? 'ED opened private audio bridge with Midwife Laura Hakala' : 'ED muted private audio bridge');
    });
  }

  // Check if call was already active
  const lastSync = localStorage.getItem('791_emergency_sync');
  if (lastSync) {
    try {
      const data = JSON.parse(lastSync);
      if (data.type === 'SOS_INITIATED' || data.type === 'SOS_ACTIVATED' || data.type === 'CALL_ANSWERED') {
        activateIncident(data.startTime || Date.now());
      }
    } catch (e) {
      // ignore
    }
  }
}

function handleBusEvent(data) {
  if (!data) return;
  console.log('[791 ED Bus] Received event:', data);

  if (data.type === 'SOS_INITIATED' || data.type === 'SOS_ACTIVATED') {
    activateIncident(data.startTime || Date.now());
    addLogEntry('Incoming 791 Maternal SOS alert received from Juontotie 8, Kuopio');
  } else if (data.type === 'CALL_ANSWERED') {
    updateMidwifeState('Connected on call with Mother (Maria Nieminen)');
    addLogEntry('Midwife Laura Hakala answered triage call with Mother');
  } else if (data.type === 'CALL_TRANSFERRED') {
    updateMidwifeState(`Transferred to: ${data.newResponder?.name || 'Sari Korhonen'}`);
    addLogEntry(`Call transferred to ${data.newResponder?.name || 'Sari Korhonen'}`);
  } else if (data.type === 'TRIAGE_RECOMMENDATION') {
    setMidwifeRecommendation(data.action);
  } else if (data.type === 'MIDWIFE_MIC_TOGGLE') {
    addLogEntry(data.isMuted ? 'Midwife Laura Hakala toggled backchannel mic to MUTED' : 'Midwife Laura Hakala unmuted backchannel mic');
  } else if (data.type === 'ED_CALL_TOGGLE') {
    addLogEntry(data.isCallState ? 'Midwife Laura Hakala opened direct line with ED Dispatcher' : 'Midwife Laura Hakala closed direct line with ED Dispatcher');
  } else if (data.type === 'CALL_ENDED') {
    onCallEnded();
  }
}

export function activateIncident(startTime) {
  incidentStartTime = startTime || Date.now();
  startIncidentTimer();

  const banner = document.getElementById('ed-alert-banner');
  const alertHeadline = document.getElementById('alert-headline');
  const alertCode = document.getElementById('alert-code');

  if (banner) {
    banner.className = 'ed-alert-banner standby';
  }
  if (alertCode) {
    alertCode.className = 'alert-code code-blue';
    alertCode.textContent = '791 Triage Alert &bull; In Progress';
  }
  if (alertHeadline) {
    alertHeadline.textContent = 'Maternal Triage Active — Juontotie 8, Kuopio';
  }
}

export function setMidwifeRecommendation(action) {
  const banner = document.getElementById('ed-alert-banner');
  const alertCode = document.getElementById('alert-code');
  const alertHeadline = document.getElementById('alert-headline');
  const recIcon = document.getElementById('recommendation-icon');
  const recMain = document.getElementById('recommendation-main');
  const recSub = document.getElementById('recommendation-sub');

  if (action === 'ambulance') {
    if (banner) banner.className = 'ed-alert-banner emergency';
    if (alertCode) {
      alertCode.className = 'alert-code code-red';
      alertCode.textContent = 'CODE A (RED) &bull; Urgent EMS Required';
    }
    if (alertHeadline) {
      alertHeadline.textContent = 'Imminent Out-of-Hospital Delivery Risk';
    }
    if (recIcon) {
      recIcon.className = 'recommendation-icon red';
      recIcon.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M14 8h4l3 3v6a1 1 0 0 1-1 1h-2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>`;
    }
    if (recMain) recMain.textContent = 'Midwife Action: Dispatch Ambulance (Code A)';
    if (recSub) recSub.textContent = 'Contractions every 3 min, VAS 7/10, multipara progression.';

    addLogEntry('CRITICAL: Midwife Laura Hakala flagged CODE A — Ambulance Required');
  } else if (action === 'timer' || action === 'wait') {
    if (banner) banner.className = 'ed-alert-banner observing';
    if (alertCode) {
      alertCode.className = 'alert-code code-amber';
      alertCode.textContent = 'CODE C (AMBER) &bull; Home Observation';
    }
    if (alertHeadline) {
      alertHeadline.textContent = 'Observation / Progress Monitoring';
    }
    if (recIcon) {
      recIcon.className = 'recommendation-icon amber';
      recIcon.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 22h14M5 2h14m-2 0v4.172a2 2 0 0 0-.586 1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>`;
    }
    if (recMain) recMain.textContent = 'Midwife Action: Wait & Home Observation';
    if (recSub) recSub.textContent = 'Amniotic fluid intact, contractions stable, no transport needed yet.';

    addLogEntry('INFO: Midwife Laura Hakala selected Home Observation / Wait');
  }
}

export function confirmAmbulanceDispatch() {
  const dispatchBtn = document.getElementById('btn-dispatch-unit');
  const stepDispatched = document.getElementById('step-dispatched');
  const stepEnRoute = document.getElementById('step-enroute');
  const unitCodeEl = document.getElementById('assigned-unit-code');

  isDispatched = true;

  if (dispatchBtn) {
    dispatchBtn.className = 'btn-dispatch-ambulance dispatched';
    dispatchBtn.innerHTML = `<span>&#10003;</span> Unit ENS-121 Dispatched &bull; En Route (ETA ~8m)`;
    dispatchBtn.disabled = true;
  }

  if (stepDispatched) stepDispatched.classList.add('active');
  if (stepEnRoute) stepEnRoute.classList.add('active');
  if (unitCodeEl) unitCodeEl.textContent = 'ENS-121 (En Route)';

  addLogEntry('MISSION DISPATCHED: Ambulance Unit ENS-121 assigned to Juontotie 8, Kuopio (ETA: 8 min)');
}

function updateMidwifeState(text) {
  const subEl = document.getElementById('midwife-status-sub');
  if (subEl) subEl.textContent = text;
}

function onCallEnded() {
  stopIncidentTimer();
  addLogEntry('Incident call closed / Standby restored.');
}

function startIncidentTimer() {
  stopIncidentTimer();
  const timerEl = document.getElementById('alert-time-badge');
  const start = incidentStartTime || Date.now();

  function update() {
    const elapsedSec = Math.floor(Math.max(0, Date.now() - start) / 1000);
    const mins = String(Math.floor(elapsedSec / 60)).padStart(2, '0');
    const secs = String(elapsedSec % 60).padStart(2, '0');
    if (timerEl) timerEl.textContent = `${mins}:${secs}`;
  }

  update();
  incidentTimerInterval = setInterval(update, 1000);
}

function stopIncidentTimer() {
  if (incidentTimerInterval) {
    clearInterval(incidentTimerInterval);
    incidentTimerInterval = null;
  }
}

function addLogEntry(text) {
  const logList = document.getElementById('ed-event-logs');
  if (!logList) return;

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  const row = document.createElement('div');
  row.className = 'log-item';
  row.innerHTML = `<span class="time">[${timeStr}]</span> <span class="msg">${text}</span>`;

  logList.appendChild(row);
  logList.scrollTop = logList.scrollHeight;
}

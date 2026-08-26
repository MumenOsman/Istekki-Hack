/**
 * Midwife Call Logs Controller
 * Manages Call Logs overlay with right-to-left slide animation,
 * returning directly to the open Side Menu (Drawer) on clicking Back.
 */

export const SAMPLE_CALL_LOGS = [
  {
    patientName: 'Maria Nieminen',
    time: 'Today 09:14',
    duration: '4m 12s',
    type: 'Video',
    outcome: 'Dispatched Ambulance',
    outcomeClass: 'ambulance'
  },
  {
    patientName: 'Sofia Laine',
    time: 'Today 08:32',
    duration: '2m 45s',
    type: 'Voice',
    outcome: 'Home Monitoring',
    outcomeClass: 'monitoring'
  },
  {
    patientName: 'Aino Korhonen',
    time: 'Yesterday 23:45',
    duration: '6m 18s',
    type: 'Video',
    outcome: 'Hospital Admission',
    outcomeClass: 'admitted'
  },
  {
    patientName: 'Emma Heikkinen',
    time: 'Yesterday 21:10',
    duration: '1m 50s',
    type: 'Voice',
    outcome: 'Routine Triage',
    outcomeClass: 'resolved'
  },
  {
    patientName: 'Helmi Koskinen',
    time: 'Yesterday 18:25',
    duration: '3m 34s',
    type: 'Video',
    outcome: 'Dispatched Ambulance',
    outcomeClass: 'ambulance'
  },
  {
    patientName: 'Venla Rantanen',
    time: '24.08. 14:15',
    duration: '5m 02s',
    type: 'Voice',
    outcome: 'Home Monitoring',
    outcomeClass: 'monitoring'
  },
  {
    patientName: 'Kerttu Salminen',
    time: '24.08. 11:40',
    duration: '2m 10s',
    type: 'Voice',
    outcome: 'Routine Triage',
    outcomeClass: 'resolved'
  }
];

export function initMidwifeCallLogsController() {
  const callLogsOverlay = document.getElementById('midwife-call-logs-overlay');
  const backBtn = document.getElementById('midwife-logs-back-btn');
  const callLogsMenuItem = document.getElementById('midwife-menu-call-logs');
  const drawer = document.getElementById('midwife-drawer-menu');
  const deviceWrapper = document.querySelector('.device-wrapper');

  renderCallLogsTable();

  // Open Call Logs from Drawer (Drawer stays open underneath)
  if (callLogsMenuItem) {
    callLogsMenuItem.addEventListener('click', () => {
      openCallLogs();
    });
  }

  // Back Button to Close Call Logs -> Returns directly to Side Menu
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      closeCallLogs();
      // Ensure drawer is visible and status bar is green
      drawer?.classList.add('open');
      deviceWrapper?.classList.add('drawer-open');
    });
  }

  // Escape key closes overlay
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && callLogsOverlay?.classList.contains('open')) {
      closeCallLogs();
    }
  });
}

export function openCallLogs() {
  const overlay = document.getElementById('midwife-call-logs-overlay');
  if (overlay) {
    overlay.classList.add('open');
  }
}

export function closeCallLogs() {
  const overlay = document.getElementById('midwife-call-logs-overlay');
  if (overlay) {
    overlay.classList.remove('open');
  }
}

export function renderCallLogsTable() {
  const tbody = document.getElementById('midwife-call-logs-tbody');
  if (!tbody) return;

  tbody.innerHTML = SAMPLE_CALL_LOGS.map(log => `
    <tr>
      <td>
        <span class="patient-name-text">${log.patientName}</span>
      </td>
      <td>
        <span class="call-time-text">${log.time}</span>
      </td>
      <td>
        <span class="call-duration-text">${log.duration} &bull; ${log.type}</span>
      </td>
      <td>
        <span class="log-outcome-badge ${log.outcomeClass}">${log.outcome}</span>
      </td>
    </tr>
  `).join('');
}

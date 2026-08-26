/**
 * Midwife Team On-Duty Status Table Controller
 * Manages team status table rendering with green/red circles and busy/break reasons.
 */
import { midwifeState } from './midwife-duty-controller.js';

export const MIDWIFE_TEAM = [
  {
    id: '502941',
    name: 'Laura Hakala',
    isCurrentUser: true
  },
  {
    id: '502812',
    name: 'Sari Korhonen',
    isListening: true
  },
  {
    id: '503104',
    name: 'Juha Niemelä',
    isListening: false,
    reason: 'Busy'
  },
  {
    id: '501990',
    name: 'Elina Virtanen',
    isListening: false,
    reason: 'Break'
  },
  {
    id: '504221',
    name: 'Hanna Mäkinen',
    isListening: true
  },
  {
    id: '503774',
    name: 'Mikko Laine',
    isListening: false,
    reason: 'Busy'
  }
];

export function initMidwifeTeamController() {
  renderTeamTable();

  // Re-render when listening state changes
  window.addEventListener('midwife:statechange', () => {
    renderTeamTable();
  });
}

export function renderTeamTable() {
  const tableBody = document.getElementById('midwife-team-tbody');
  if (!tableBody) return;

  tableBody.innerHTML = MIDWIFE_TEAM.map(member => {
    const isListening = member.isCurrentUser ? midwifeState.isListening : member.isListening;
    const statusClass = isListening ? 'listening' : 'not-listening';
    
    // Status text: 'Listening' when green, or specific reason ('Busy' / 'Break') when red
    let reasonText = 'Listening';
    if (!isListening) {
      if (member.isCurrentUser) {
        reasonText = midwifeState.currentReason || 'Busy';
      } else {
        reasonText = member.reason || 'Busy';
      }
    }

    return `
      <tr class="${member.isCurrentUser ? 'current-user-row' : ''}">
        <td>
          <div class="midwife-table-name">
            <span>${member.name}</span>
            ${member.isCurrentUser ? '<span class="midwife-you-badge">You</span>' : ''}
          </div>
        </td>
        <td>
          <span class="midwife-table-id">${member.id}</span>
        </td>
        <td>
          <div class="status-cell-content">
            <div class="status-circle-dot ${statusClass}"></div>
            <span class="status-text-label ${statusClass}">${reasonText}</span>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

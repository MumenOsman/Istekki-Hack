/**
 * Health History & Medical Reports Controller
 * Manages clinical consultation notes and laboratory diagnostic records.
 */

// Authentic Medical Records (Kanta / Finnish Healthcare Format)
export const MEDICAL_REPORTS = [
  {
    id: 'neuvola-36-checkup',
    type: 'clinic',
    date: '12.08.2026 10:15',
    title: 'Maternity Clinic Consultation (36+2 wk)',
    facility: 'Pohjois-Savon hyvinvointialue / Niiralan neuvola',
    practitioner: 'Laura Hakala, Terveydenhoitaja / Kätilö',
    summary: 'Normal third-trimester progression. Cephalic presentation confirmed.',
    htmlContent: `
      <table class="clinical-meta-table">
        <tr><td class="clinical-meta-label">Patient:</td><td class="clinical-meta-value">Sofia Korhonen (210495-XXXX)</td></tr>
        <tr><td class="clinical-meta-label">Date & Time:</td><td class="clinical-meta-value">12.08.2026 at 10:15</td></tr>
        <tr><td class="clinical-meta-label">Organization:</td><td class="clinical-meta-value">Pohjois-Savon hyvinvointialue / Niiralan neuvola</td></tr>
        <tr><td class="clinical-meta-label">Practitioner:</td><td class="clinical-meta-value">Laura Hakala, Terveydenhoitaja / Kätilö</td></tr>
        <tr><td class="clinical-meta-label">Diagnosis:</td><td class="clinical-meta-value">Z34.8 Normaalin moniraskauden tai ensiraskauden seuranta (36+2)</td></tr>
      </table>

      <div class="clinical-section">
        <h4 class="clinical-section-heading">Clinical Examination & Vitals</h4>
        <p class="clinical-text-block">
Gestational age: 36 weeks + 2 days
Weight change: +450 g/week (Total +11.2 kg)
Blood pressure: 118/74 mmHg (Sitting, right arm)
Urine dipstick: Albumin neg, Glucose neg, Nitrite neg
Symphysis-fundal (SF) height: 33.0 cm (on median curve)
Fetal presentation: RT (Cephalic / pää tarjoutuu), fixed
Fetal heart rate (FHR): 142 bpm, regular, positive accelerations
Fetal movements: ++ (Normal daily movement reported)
Edema: + (Mild ankle edema in evenings, normal)
        </p>
      </div>

      <div class="clinical-section">
        <h4 class="clinical-section-heading">Midwife Assessment & Care Plan</h4>
        <p class="clinical-text-block">
General condition excellent. Braxton Hicks contractions reported occasionally, painless.
Patient given instructions for signs of labor onset and when to contact KYS delivery unit.
Emergency 791 application verified and linked with mobile triage ID.
Next scheduled appointment: 26.08.2026 at Niiralan neuvola.
        </p>
      </div>

      <div class="clinical-signature-block">
        <span>Electronically signed: Laura Hakala (Valvira ID: 502941)</span>
        <span>Record transmitted to National Kanta Patient Data Repository</span>
      </div>
    `
  },
  {
    id: 'lab-blood-ferritin',
    type: 'lab',
    date: '04.08.2026 08:30',
    title: 'Laboratory Panel: Complete Blood Count & Ferritin',
    facility: 'ISLAB Hyvinvointiyhtymä / Kuopio Keskuslaboratorio',
    practitioner: 'ISLAB Laboratoriokeskus',
    summary: 'B-Hb 128 g/l (Normal), P-Ferrit 42 µg/l (Adequate reserves).',
    htmlContent: `
      <table class="clinical-meta-table">
        <tr><td class="clinical-meta-label">Patient:</td><td class="clinical-meta-value">Sofia Korhonen (210495-XXXX)</td></tr>
        <tr><td class="clinical-meta-label">Sample Time:</td><td class="clinical-meta-value">04.08.2026 at 08:30</td></tr>
        <tr><td class="clinical-meta-label">Laboratory:</td><td class="clinical-meta-value">ISLAB Kuopio Keskuslaboratorio</td></tr>
        <tr><td class="clinical-meta-label">Referring Unit:</td><td class="clinical-meta-value">Niiralan neuvola (Laura Hakala)</td></tr>
      </table>

      <div class="clinical-section">
        <h4 class="clinical-section-heading">Diagnostic Laboratory Results</h4>
        <table class="clinical-lab-table">
          <thead>
            <tr><th>Analysis</th><th>Result</th><th>Unit</th><th>Reference Range</th></tr>
          </thead>
          <tbody>
            <tr><td><b>B -Hb (Hemoglobin)</b></td><td><b>128</b></td><td>g/l</td><td>117 - 155</td></tr>
            <tr><td><b>B -Eryt (Erythrocytes)</b></td><td>4.12</td><td>x10¹²/l</td><td>3.90 - 5.20</td></tr>
            <tr><td><b>B -Hkr (Hematocrit)</b></td><td>0.38</td><td></td><td>0.35 - 0.46</td></tr>
            <tr><td><b>B -Leuk (Leukocytes)</b></td><td>7.8</td><td>x10⁹/l</td><td>3.4 - 8.2</td></tr>
            <tr><td><b>B -Trom (Thrombocytes)</b></td><td>215</td><td>x10⁹/l</td><td>150 - 360</td></tr>
            <tr><td><b>P -Ferrit (Ferritin)</b></td><td><b>42</b></td><td>µg/l</td><td>15 - 150</td></tr>
            <tr><td><b>P -CRP (C-reactive protein)</b></td><td>&lt; 3</td><td>mg/l</td><td>&lt; 10</td></tr>
          </tbody>
        </table>
      </div>

      <div class="clinical-section">
        <h4 class="clinical-section-heading">Laboratory Physician Statement</h4>
        <p class="clinical-text-block">
Red blood cell parameters within physiological pregnancy ranges. No signs of anemia. Iron reserves adequate on current oral maintenance dosage.
        </p>
      </div>

      <div class="clinical-signature-block">
        <span>Verified by: ISLAB Autovalidation System / Lääk. Mikrobiologia</span>
        <span>Kanta Archive Confirmation Code: FI-ISLAB-2026-884912</span>
      </div>
    `
  },
  {
    id: 'ultrasound-32-scan',
    type: 'clinic',
    date: '15.07.2026 13:00',
    title: 'Ultrasound Growth & Biometry Screening (32 wk)',
    facility: 'KYS Naistenkeskus / Sikiötutkimusyksikkö',
    practitioner: 'Dr. Antti Rissanen, Erikoislääkäri (OB/GYN)',
    summary: 'Estimated fetal weight: 1980g (+1.1 SD). Amniotic fluid AFI 14.2 cm (Normal).',
    htmlContent: `
      <table class="clinical-meta-table">
        <tr><td class="clinical-meta-label">Patient:</td><td class="clinical-meta-value">Sofia Korhonen (210495-XXXX)</td></tr>
        <tr><td class="clinical-meta-label">Examination Date:</td><td class="clinical-meta-value">15.07.2026 at 13:00</td></tr>
        <tr><td class="clinical-meta-label">Unit:</td><td class="clinical-meta-value">Kuopion yliopistollinen sairaala / Naistenkeskus</td></tr>
        <tr><td class="clinical-meta-label">Physician:</td><td class="clinical-meta-value">Dr. Antti Rissanen (Erikoislääkäri)</td></tr>
      </table>

      <div class="clinical-section">
        <h4 class="clinical-section-heading">Biometric Measurements (32+0 wk)</h4>
        <p class="clinical-text-block">
Biparietal diameter (BPD): 84 mm
Head circumference (HC): 298 mm
Abdominal circumference (AC): 280 mm
Femur length (FL): 62 mm
Estimated Fetal Weight (EFW): 1980 g (+1.1 SD, normal growth curve)
Placental location: Posterior (Takaseinässä), no previa (korkealla)
Amniotic fluid index (AFI): 14.2 cm (Normal fluid volume)
Umbilical artery Doppler: PI 0.88, RI 0.58 (Normal resistance)
        </p>
      </div>

      <div class="clinical-section">
        <h4 class="clinical-section-heading">Conclusion</h4>
        <p class="clinical-text-block">
Normally developing fetus matching gestational age. Normal fetal anatomy and amniotic fluid quantity. Normal Doppler flow parameters.
        </p>
      </div>

      <div class="clinical-signature-block">
        <span>Dr. Antti Rissanen, Naistentautien ja synnytysten erikoislääkäri</span>
      </div>
    `
  },
  {
    id: 'lab-ogtt-glucose',
    type: 'lab',
    date: '18.06.2026 09:00',
    title: 'Laboratory: Oral Glucose Tolerance Test (2h OGTT)',
    facility: 'ISLAB Kuopio / Niirala Näytteenotto',
    practitioner: 'ISLAB Laboratoriokeskus',
    summary: 'Fasting: 4.6 mmol/l, 1h: 6.8 mmol/l, 2h: 5.4 mmol/l - Normal screening.',
    htmlContent: `
      <table class="clinical-meta-table">
        <tr><td class="clinical-meta-label">Patient:</td><td class="clinical-meta-value">Sofia Korhonen (210495-XXXX)</td></tr>
        <tr><td class="clinical-meta-label">Date & Time:</td><td class="clinical-meta-value">18.06.2026 at 09:00</td></tr>
        <tr><td class="clinical-meta-label">Test Type:</td><td class="clinical-meta-value">75g Oral Glucose Tolerance Test (Raskauden glukoosirasituskoe)</td></tr>
      </table>

      <div class="clinical-section">
        <h4 class="clinical-section-heading">Plasma Glucose Values</h4>
        <table class="clinical-lab-table">
          <thead>
            <tr><th>Measurement</th><th>Result</th><th>Unit</th><th>Reference (Threshold)</th></tr>
          </thead>
          <tbody>
            <tr><td><b>Pt-Gluk-0 (Fasting 0h)</b></td><td><b>4.6</b></td><td>mmol/l</td><td>&lt; 5.3</td></tr>
            <tr><td><b>Pt-Gluk-1 (1 hour post)</b></td><td><b>6.8</b></td><td>mmol/l</td><td>&lt; 10.0</td></tr>
            <tr><td><b>Pt-Gluk-2 (2 hours post)</b></td><td><b>5.4</b></td><td>mmol/l</td><td>&lt; 8.6</td></tr>
          </tbody>
        </table>
      </div>

      <div class="clinical-section">
        <h4 class="clinical-section-heading">Diagnosis & Interpretation</h4>
        <p class="clinical-text-block">
Normal glucose metabolism. Gestational diabetes mellitus (GDM) ruled out. No dietary intervention required.
        </p>
      </div>

      <div class="clinical-signature-block">
        <span>Verified by: ISLAB Kliininen Kemia / Kanta Arkisto</span>
      </div>
    `
  }
];

export function initHealthController() {
  const healthOverlay = document.getElementById('health-screen-overlay');
  const reportDetailOverlay = document.getElementById('medical-report-overlay');
  const healthBackBtn = document.getElementById('health-back-btn');
  const reportBackBtn = document.getElementById('report-detail-back-btn');
  const healthMenuBtn = document.querySelector('.drawer-menu-item[data-target="health-history"]');

  // Direct click on Health History drawer menu item
  if (healthMenuBtn) {
    healthMenuBtn.addEventListener('click', () => {
      openHealthScreen();
    });
  }

  // Back from Health list -> returns to Side Panel
  if (healthBackBtn) {
    healthBackBtn.addEventListener('click', closeHealthScreen);
  }

  // Back from Report detail -> returns to Health list
  if (reportBackBtn) {
    reportBackBtn.addEventListener('click', closeMedicalReportDetail);
  }

  // Bind report card clicks
  setupReportCards();

  // Escape key handler
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (reportDetailOverlay?.classList.contains('active')) {
        closeMedicalReportDetail();
      } else if (healthOverlay?.classList.contains('active')) {
        closeHealthScreen();
      }
    }
  });
}

export function openHealthScreen() {
  const healthOverlay = document.getElementById('health-screen-overlay');
  if (!healthOverlay) return;

  healthOverlay.classList.add('active');
  console.log('[791 Health] Health History screen opened from Side Panel.');
}

export function closeHealthScreen() {
  const healthOverlay = document.getElementById('health-screen-overlay');
  if (!healthOverlay) return;

  healthOverlay.classList.remove('active');
  console.log('[791 Health] Health History closed. Returned to Side Panel.');
}

function setupReportCards() {
  const cards = document.querySelectorAll('.report-card-item');
  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      const reportId = e.currentTarget.getAttribute('data-id');
      const report = MEDICAL_REPORTS.find(r => r.id === reportId);
      if (report) {
        openMedicalReportDetail(report);
      }
    });
  });
}

export function openMedicalReportDetail(report) {
  const reportDetailOverlay = document.getElementById('medical-report-overlay');
  const reportTitleEl = document.getElementById('report-detail-title');
  const reportContentEl = document.getElementById('report-detail-content');

  if (!reportDetailOverlay || !reportContentEl) return;

  if (reportTitleEl) {
    reportTitleEl.textContent = report.title;
  }

  reportContentEl.innerHTML = report.htmlContent;
  reportDetailOverlay.classList.add('active');

  console.log('[791 Health] Clinical report opened:', report.title);
}

export function closeMedicalReportDetail() {
  const reportDetailOverlay = document.getElementById('medical-report-overlay');
  if (!reportDetailOverlay) return;

  reportDetailOverlay.classList.remove('active');
  console.log('[791 Health] Closed clinical report detail. Returned to Health History list.');
}

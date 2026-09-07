/**
 * AC ADEXA - Regulation Information Page Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  StorageManager.applyTheme(StorageManager.getTheme());
  renderNavbar('regulation');
  initRegulationSelector();
  ModalManager.initModalTriggers();
  initFeedbackModal();

  const r21Container = document.getElementById('r21-info-container');
  const r25Container = document.getElementById('r25-info-container');

  if (r21Container) {
    const r21 = REGULATIONS.R21;
    r21Container.innerHTML = `
      <div class="card mb-4">
        <h3 class="card-title mb-2">Regulation 21 (R21) Grading Structure</h3>
        <p class="text-xs text-muted mb-3">${r21.description}</p>
        <table class="w-full text-sm" style="border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 2px solid var(--border-color); text-align: left;">
              <th style="padding: 8px;">Grade</th>
              <th style="padding: 8px;">Marks Range</th>
              <th style="padding: 8px;">Grade Point</th>
              <th style="padding: 8px;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${r21.grading.map(g => `
              <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 8px;"><strong>${g.grade}</strong></td>
                <td style="padding: 8px;">${g.min}–${g.max}</td>
                <td style="padding: 8px;">${g.point}</td>
                <td style="padding: 8px;">${g.grade === 'RA' ? '🔴 FAIL' : '🟢 PASS'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="card mb-4">
        <h3 class="card-title mb-2">R21 Assessment Weightages</h3>
        <ul class="text-sm text-muted pl-4" style="line-height: 1.8;">
          <li><strong>Fully Theory:</strong> CIA 40 (Test Avg /30 + Assign /5 + Att /5) | SEE Written 60</li>
          <li><strong>Fully Lab:</strong> CIA 40 (Model Lab /25 + Record/Obs/Exp/Att /15) | SEE Practical 60</li>
          <li><strong>Integrated Course:</strong> CIA 40 ((Mid1+Mid2)/4 + Model Lab /20 + Assign /5 + Att /5) | SEE 60</li>
        </ul>
      </div>
    `;
  }

  if (r25Container) {
    const r25 = REGULATIONS.R25;
    r25Container.innerHTML = `
      <div class="card mb-4">
        <h3 class="card-title mb-2">Regulation 25 (R25) Grading Structure</h3>
        <p class="text-xs text-muted mb-3">${r25.description}</p>
        <table class="w-full text-sm" style="border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 2px solid var(--border-color); text-align: left;">
              <th style="padding: 8px;">Grade</th>
              <th style="padding: 8px;">Marks Range</th>
              <th style="padding: 8px;">Grade Point</th>
              <th style="padding: 8px;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${r25.grading.map(g => `
              <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 8px;"><strong>${g.grade}</strong></td>
                <td style="padding: 8px;">${g.min}–${g.max}</td>
                <td style="padding: 8px;">${g.point}</td>
                <td style="padding: 8px;">${g.grade === 'RA' ? '🔴 FAIL' : '🟢 PASS'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="card mb-4">
        <h3 class="card-title mb-2">R25 Mandatory Pass Conditions</h3>
        <div class="card p-3 bg-muted text-sm mb-3">
          <p>A student passes an R25 course only when <strong>BOTH</strong> conditions are satisfied:</p>
          <ul class="pl-4 mt-2 font-semibold">
            <li>1. Minimum SEE Mark: <strong>25 / 50</strong></li>
            <li>2. Minimum Overall Total Mark (CIA + SEE): <strong>50 / 100</strong></li>
          </ul>
        </div>
        <p class="text-xs text-muted">
          If either requirement is not satisfied, Grade = <strong>RA</strong> (Grade Point = 0, Status = FAIL).
        </p>
      </div>

      <div class="card mb-4">
        <h3 class="card-title mb-2">R25 Assessment Weightages (50 CIA + 50 SEE = 100 Total)</h3>
        <ul class="text-sm text-muted pl-4" style="line-height: 1.8;">
          <li><strong>Theory:</strong> CIA-1 (20) + CIA-2 (20) + Assign (5) + Att (5) = 50 | SEE Written 50</li>
          <li><strong>Laboratory:</strong> Avg Experiments (25) + Model Exam/Report (20) + Att (5) = 50 | SEE Practical 50</li>
          <li><strong>Theory (D) + Practical:</strong> CIA-1 (10) + CIA-2 (10) + Assign (5) + Avg Exp (10) + Model Exam (10) + Att (5) = 50 | SEE Written 50</li>
          <li><strong>Theory + Practical (D):</strong> Assign (5) + Avg Exp (15) + Model Exam (25) + Att (5) = 50 | SEE Practical 50</li>
          <li><strong>Projects (Community/Minor/Industry/Major):</strong> Review 1 (15) + Review 2 (15) + Report+Viva (15) + Att (5) = 50 | SEE Demo (40) + Viva (10) = 50</li>
          <li><strong>SEC / AEC / VAC / IHL / IPT:</strong> Department-specific assessment.</li>
        </ul>
      </div>
    `;
  }
});

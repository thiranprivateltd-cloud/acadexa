/**
 * AC ADEXA - CGPA Calculator & Planner Page Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  StorageManager.applyTheme(StorageManager.getTheme());
  renderNavbar('cgpa');
  initRegulationSelector(() => {
    calculateAndRenderCGPA();
  });
  ModalManager.initModalTriggers();
  initFeedbackModal();

  const data = StorageManager.loadData();
  const reg = data.regulation || 'R25';

  let semesters = data.semesters && data.semesters.length > 0 ? JSON.parse(JSON.stringify(data.semesters)) : [];

  const semListContainer = document.getElementById('sem-list-container');
  const addSemBtn = document.getElementById('add-sem-btn');
  const cgpaResultContainer = document.getElementById('cgpa-result-container');

  // Planner DOM
  const planCompletedCreditsInput = document.getElementById('plan-completed-credits');
  const planCurrentCGPAInput = document.getElementById('plan-current-cgpa');
  const planRemainingCreditsInput = document.getElementById('plan-remaining-credits');
  const planTargetCGPAInput = document.getElementById('plan-target-cgpa');
  const plannerResultContainer = document.getElementById('cgpa-planner-result-container');

  function renderSemList() {
    if (!semListContainer) return;
    semListContainer.innerHTML = semesters.map((s, idx) => `
      <div class="card mb-3 p-3 sem-row" data-sem-index="${idx}">
        <div class="grid grid-cols-3 gap-3 items-center">
          <div class="form-group mb-0">
            <label class="form-label text-xs">Semester</label>
            <input type="number" min="1" max="12" class="form-control sem-num-input" value="${s.semester}" required />
          </div>
          <div class="form-group mb-0">
            <label class="form-label text-xs">SGPA *</label>
            <input type="number" step="0.01" min="0" max="10" class="form-control sem-sgpa-input" value="${s.sgpa}" required />
          </div>
          <div class="form-group mb-0">
            <label class="form-label text-xs">Credits *</label>
            <input type="number" step="0.5" min="1" max="40" class="form-control sem-credits-input" value="${s.credits}" required />
          </div>
        </div>
        <div class="flex justify-end mt-2 pt-2" style="border-top: 1px solid var(--border-color);">
          <button type="button" class="btn btn-sm btn-outline remove-sem-btn" style="color: #ef4444; border-color: #ef4444;">
            &times; Remove Semester
          </button>
        </div>
      </div>
    `).join('');
  }

  function syncSemestersFromDOM() {
    const rows = document.querySelectorAll('.sem-row');
    const updated = [];
    rows.forEach((row, idx) => {
      const semester = Number(row.querySelector('.sem-num-input').value) || (idx + 1);
      const sgpa = Number(row.querySelector('.sem-sgpa-input').value) || 0;
      const credits = Number(row.querySelector('.sem-credits-input').value) || 0;

      // Retain existing course list if available from previous state
      const existing = semesters[idx] || (data.semesters || []).find(s => Number(s.semester) === semester);
      const courses = (existing && existing.courses) ? existing.courses : [];

      updated.push({ semester, sgpa, credits, courses });
    });
    semesters = updated;
  }

  function calculateAndRenderCGPA() {
    syncSemestersFromDOM();
    const currentReg = StorageManager.getRegulation();
    const result = calculateCGPA(semesters, currentReg);

    if (semesters.length === 0 || result.totalCredits === 0) {
      cgpaResultContainer.innerHTML = `
        <div class="card p-6 text-center text-muted">
          Add at least one completed semester to calculate cumulative CGPA.
        </div>
      `;
      return;
    }

    let extraBadge = '';
    if (result.equivalentPercentage !== null) {
      extraBadge = `<span class="status-badge info ml-2">Equivalent: ${result.equivalentPercentage.toFixed(2)}% (CGPA×10)</span>`;
    }

    cgpaResultContainer.innerHTML = renderResultCard({
      title: 'Cumulative CGPA',
      value: result.cgpa.toFixed(2),
      statusClass: result.cgpa >= 7.5 ? 'pass' : (result.cgpa >= 6.0 ? 'warning' : 'fail'),
      badgeIcon: result.cgpa >= 7.5 ? '🟢' : (result.cgpa >= 6.0 ? '🟡' : '🔴'),
      statusText: `Total Cumulative Credits: ${result.totalCredits} ${result.equivalentPercentage !== null ? '| ' + result.equivalentPercentage.toFixed(2) + '%' : ''}`,
      explanation: result.explanation,
      actionsHTML: `
        <button id="save-cgpa-btn" class="btn btn-primary btn-sm">💾 Save Semesters Progress</button>
      `
    });

    // Auto sync CGPA Planner inputs
    if (planCurrentCGPAInput && !planCurrentCGPAInput.value) planCurrentCGPAInput.value = result.cgpa;
    if (planCompletedCreditsInput && !planCompletedCreditsInput.value) planCompletedCreditsInput.value = result.totalCredits;

    const saveBtn = document.getElementById('save-cgpa-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        data.semesters = semesters;
        StorageManager.saveData(data);
        alert('Semester history & CGPA saved!');
      });
    }
  }

  function calculatePlanner() {
    const currentCGPA = Number(planCurrentCGPAInput?.value) || 0;
    const completedCredits = Number(planCompletedCreditsInput?.value) || 0;
    const remainingCredits = Number(planRemainingCreditsInput?.value) || 0;
    const targetCGPA = Number(planTargetCGPAInput?.value) || 0;

    if (remainingCredits <= 0 || targetCGPA <= 0) {
      if (plannerResultContainer) {
        plannerResultContainer.innerHTML = `
          <div class="card p-4 text-center text-muted">
            Fill in remaining credits and target CGPA above to view projection analysis.
          </div>
        `;
      }
      return;
    }

    const currentReg = StorageManager.getRegulation();
    const proj = projectCGPA(currentCGPA, completedCredits, remainingCredits, targetCGPA, currentReg);

    let scenariosHTML = proj.scenarios.map(s => `
      <tr style="border-bottom: 1px solid var(--border-color);">
        <td style="padding: 6px 10px;">Average ${s.avgSGPA.toFixed(1)} SGPA</td>
        <td style="padding: 6px 10px; font-weight: 700;">${s.projectedCGPA.toFixed(2)}</td>
        <td style="padding: 6px 10px; color: ${s.diff >= 0 ? '#16a34a' : '#dc2626'};">${s.diff >= 0 ? '+' : ''}${s.diff.toFixed(2)}</td>
      </tr>
    `).join('');

    plannerResultContainer.innerHTML = renderResultCard({
      title: 'Required Average SGPA in Remaining Credits',
      value: proj.isTargetAchievable ? proj.requiredSGPA.toFixed(2) : 'N/A',
      statusClass: proj.statusClass,
      badgeIcon: proj.badgeIcon,
      statusText: proj.statusText,
      explanation: proj.explanation,
      actionsHTML: ''
    }) + `
      <div class="card mt-4">
        <h4 class="font-bold text-sm mb-3">"What if I average..." Benchmark CGPA Projections</h4>
        <table style="width: 100%; font-size: 0.85rem; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 2px solid var(--border-color); text-align: left;">
              <th style="padding: 6px 10px;">Target Avg SGPA</th>
              <th style="padding: 6px 10px;">Projected CGPA</th>
              <th style="padding: 6px 10px;">Impact</th>
            </tr>
          </thead>
          <tbody>
            ${scenariosHTML}
          </tbody>
        </table>
      </div>
    `;
  }

  // Event Listeners
  if (addSemBtn) {
    addSemBtn.addEventListener('click', () => {
      syncSemestersFromDOM();
      semesters.push({ semester: semesters.length + 1, sgpa: 8.0, credits: 24 });
      renderSemList();
      calculateAndRenderCGPA();
    });
  }

  if (semListContainer) {
    semListContainer.addEventListener('input', calculateAndRenderCGPA);
    semListContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-sem-btn')) {
        const row = e.target.closest('.sem-row');
        const index = Number(row.getAttribute('data-sem-index'));
        syncSemestersFromDOM();
        semesters.splice(index, 1);
        renderSemList();
        calculateAndRenderCGPA();
      }
    });
  }

  [planCompletedCreditsInput, planCurrentCGPAInput, planRemainingCreditsInput, planTargetCGPAInput].forEach(input => {
    if (input) input.addEventListener('input', calculatePlanner);
  });

  renderSemList();
  calculateAndRenderCGPA();
  calculatePlanner();
});

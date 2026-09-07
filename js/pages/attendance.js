/**
 * AC ADEXA - Attendance Calculator & Planner Page Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  StorageManager.applyTheme(StorageManager.getTheme());
  renderNavbar('attendance');
  initRegulationSelector();
  ModalManager.initModalTriggers();
  initFeedbackModal();

  const data = StorageManager.loadData();
  const conductedInput = document.getElementById('att-conducted');
  const attendedInput = document.getElementById('att-attended');
  const calcForm = document.getElementById('att-calc-form');

  const plannerUpcomingInput = document.getElementById('planner-upcoming');
  const plannerTargetInput = document.getElementById('planner-target');
  const plannerForm = document.getElementById('att-planner-form');

  const resultContainer = document.getElementById('att-result-container');
  const plannerResultContainer = document.getElementById('planner-result-container');

  // Pre-fill from storage if present
  if (data.attendance) {
    if (conductedInput) conductedInput.value = data.attendance.conducted || '';
    if (attendedInput) attendedInput.value = data.attendance.attended || '';
  }

  function updateAttendance() {
    const C = Number(conductedInput.value) || 0;
    const P = Number(attendedInput.value) || 0;

    if (P > C) {
      resultContainer.innerHTML = `
        <div class="card bg-surface p-4 text-center">
          <span class="status-badge fail">🔴 FAIL / ERROR</span>
          <p class="text-sm font-semibold mt-2 text-red-600">❌ Classes attended cannot exceed total classes conducted.</p>
        </div>
      `;
      return;
    }

    const res = calculateAttendance(C, P);
    if (C === 0) {
      resultContainer.innerHTML = `
        <div class="card p-4 text-center text-muted">
          Enter conducted and attended classes above to view attendance metrics.
        </div>
      `;
      return;
    }

    resultContainer.innerHTML = renderResultCard({
      title: 'Current Attendance Percentage',
      value: `${res.percentage.toFixed(2)}%`,
      statusClass: res.statusClass,
      badgeIcon: res.badgeIcon,
      statusText: res.statusText,
      explanation: res.explanation,
      actionsHTML: `
        <button id="save-att-btn" class="btn btn-primary btn-sm">💾 Save Progress</button>
      `
    });

    const saveBtn = document.getElementById('save-att-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        data.attendance = { conducted: C, attended: P };
        StorageManager.saveData(data);
        alert('Attendance progress saved successfully!');
      });
    }
  }

  function updatePlanner() {
    const C = Number(conductedInput.value) || 0;
    const P = Number(attendedInput.value) || 0;
    const U = Number(plannerUpcomingInput.value) || 0;
    const T = Number(plannerTargetInput.value) || 75;

    if (U <= 0) {
      plannerResultContainer.innerHTML = `
        <div class="card p-4 text-center text-muted">
          Enter upcoming classes above to calculate future attendance requirements.
        </div>
      `;
      return;
    }

    const plan = planAttendance(C, P, U, T);

    plannerResultContainer.innerHTML = `
      <div class="card">
        <h3 class="card-title mb-3">📅 Attendance Projection Plan</h3>
        <div class="grid grid-cols-2 gap-4 text-center my-3">
          <div class="card p-3 bg-muted">
            <div class="text-xs text-muted uppercase font-bold">Must Attend</div>
            <div class="text-2xl font-bold text-green-600">${plan.minAttend} classes</div>
          </div>
          <div class="card p-3 bg-muted">
            <div class="text-xs text-muted uppercase font-bold">Can Miss Up To</div>
            <div class="text-2xl font-bold text-red-500">${plan.maxMiss} classes</div>
          </div>
        </div>
        <p class="text-sm text-center font-semibold mt-2">
          Projected Attendance: <strong>${plan.projectedPercentage.toFixed(2)}%</strong>
        </p>
        <div class="calc-explanation">
          <button type="button" class="calc-toggle" onclick="document.getElementById('plan-exp').classList.toggle('open')">
            <span>📐 How is this planned?</span>
            <span>▼</span>
          </button>
          <div id="plan-exp" class="calc-details text-left mt-2">
${plan.explanation}
          </div>
        </div>
      </div>
    `;
  }

  if (calcForm) {
    calcForm.addEventListener('input', updateAttendance);
    calcForm.addEventListener('submit', (e) => { e.preventDefault(); updateAttendance(); });
  }

  if (plannerForm) {
    plannerForm.addEventListener('input', updatePlanner);
    plannerForm.addEventListener('submit', (e) => { e.preventDefault(); updatePlanner(); });
  }

  updateAttendance();
});

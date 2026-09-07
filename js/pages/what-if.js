/**
 * AC ADEXA - What-If Academic Simulator Page Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  StorageManager.applyTheme(StorageManager.getTheme());
  renderNavbar('what-if');
  initRegulationSelector((newReg) => {
    simulator.regulationKey = newReg;
    renderSimulator();
  });
  ModalManager.initModalTriggers();
  initFeedbackModal();

  const data = StorageManager.loadData();
  const reg = data.regulation || 'R25';

  const defaultCourses = data.courses && data.courses.length > 0 ? data.courses : [];

  const simulator = new WhatIfSimulator(defaultCourses, reg);

  const courseListContainer = document.getElementById('whatif-course-list');
  const addCourseBtn = document.getElementById('whatif-add-course-btn');
  const resultContainer = document.getElementById('whatif-result-container');
  const resetBtn = document.getElementById('whatif-reset-btn');
  const applyBtn = document.getElementById('whatif-apply-btn');

  function renderSimulator() {
    const res = simulator.evaluate();
    const currentReg = StorageManager.getRegulation();

    if (courseListContainer) {
      courseListContainer.innerHTML = simulator.simulatedCourses.map((c, idx) => {
        const regObj = getRegulation(currentReg);
        const gradeOptions = regObj.grading.map(g => `
          <option value="${g.grade}" ${g.grade === c.grade ? 'selected' : ''}>${g.grade} (${g.point} GP)</option>
        `).join('');

        return `
          <div class="card mb-3 p-3 whatif-row" data-index="${idx}">
            <div class="grid grid-cols-3 gap-3 items-center">
              <div>
                <label class="form-label text-xs">Course Name</label>
                <input type="text" class="form-control whatif-name" value="${c.name}" />
              </div>
              <div>
                <label class="form-label text-xs">Credits</label>
                <input type="number" step="0.5" class="form-control whatif-credits" value="${c.credits}" min="1" max="20" />
              </div>
              <div>
                <label class="form-label text-xs">Simulated Grade</label>
                <select class="form-control whatif-grade-select">
                  ${gradeOptions}
                </select>
              </div>
            </div>
            <div class="flex justify-between items-center mt-2 pt-2 text-xs text-muted" style="border-top: 1px solid var(--border-color);">
              <span>Original: <strong>${simulator.originalCourses[idx] ? simulator.originalCourses[idx].grade : 'New'}</strong></span>
              <button type="button" class="btn btn-sm btn-outline whatif-remove-btn" style="color: #ef4444; border-color: #ef4444;">&times; Remove</button>
            </div>
          </div>
        `;
      }).join('');
    }

    if (resultContainer) {
      resultContainer.innerHTML = `
        <div class="card bg-surface p-4 text-center mb-4">
          <div class="text-xs text-muted font-bold uppercase">Simulation Summary</div>
          <div class="grid grid-cols-3 gap-3 my-3">
            <div>
              <div class="text-xs text-muted">Current SGPA</div>
              <div class="text-2xl font-bold">${res.originalSGPA.toFixed(2)}</div>
            </div>
            <div>
              <div class="text-xs text-muted">Simulated SGPA</div>
              <div class="text-2xl font-bold text-teal-600">${res.simulatedSGPA.toFixed(2)}</div>
            </div>
            <div>
              <div class="text-xs text-muted">Improvement</div>
              <div class="text-2xl font-bold" style="color: ${res.diff >= 0 ? '#16a34a' : '#dc2626'};">${res.diffText}</div>
            </div>
          </div>
          <p class="text-xs text-muted mt-2">
            💡 <em>Simulation only — your saved academic record is currently unchanged.</em>
          </p>
        </div>
      `;
    }
  }

  function syncDOMToSimulator() {
    const rows = document.querySelectorAll('.whatif-row');
    rows.forEach((row, idx) => {
      const name = row.querySelector('.whatif-name').value;
      const credits = Number(row.querySelector('.whatif-credits').value) || 0;
      const grade = row.querySelector('.whatif-grade-select').value;

      if (simulator.simulatedCourses[idx]) {
        simulator.simulatedCourses[idx].name = name;
        simulator.simulatedCourses[idx].credits = credits;
        simulator.setCourseGrade(idx, grade);
      }
    });
  }

  if (courseListContainer) {
    courseListContainer.addEventListener('change', (e) => {
      syncDOMToSimulator();
      renderSimulator();
    });
    courseListContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('whatif-remove-btn')) {
        const row = e.target.closest('.whatif-row');
        const idx = Number(row.getAttribute('data-index'));
        simulator.removeCourse(idx);
        renderSimulator();
      }
    });
  }

  if (addCourseBtn) {
    addCourseBtn.addEventListener('click', () => {
      syncDOMToSimulator();
      simulator.addCourse('New Course', 3, 'A');
      renderSimulator();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      simulator.reset();
      renderSimulator();
    });
  }

  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      syncDOMToSimulator();
      if (confirm('Apply this simulated course & grade scenario to your main saved academic record?')) {
        data.courses = simulator.simulatedCourses;
        StorageManager.saveData(data);
        alert('Simulated scenario successfully applied to your saved record!');
        window.location.href = 'sgpa.html';
      }
    });
  }

  renderSimulator();
});

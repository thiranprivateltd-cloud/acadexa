/**
 * AC ADEXA - SGPA Calculator Page Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  StorageManager.applyTheme(StorageManager.getTheme());
  renderNavbar('sgpa');
  initRegulationSelector((newReg) => {
    renderCourseList();
    calculateAndRenderSGPA();
  });
  ModalManager.initModalTriggers();
  initFeedbackModal();

  const data = StorageManager.loadData();
  const reg = data.regulation || 'R25';

  let currentCourses = data.courses && data.courses.length > 0 ? JSON.parse(JSON.stringify(data.courses)) : [];

  const courseListContainer = document.getElementById('course-list-container');
  const addCourseBtn = document.getElementById('add-course-btn');
  const sgpaResultContainer = document.getElementById('sgpa-result-container');
  const gradeChartContainer = document.getElementById('grade-chart-container');

  function renderCourseList() {
    if (!courseListContainer) return;
    const currentReg = StorageManager.getRegulation();
    courseListContainer.innerHTML = currentCourses.map((c, idx) => createCourseInputRow(c, currentReg, idx)).join('');
  }

  function syncCoursesFromDOM() {
    const rows = document.querySelectorAll('.course-input-row');
    const updated = [];
    rows.forEach((row) => {
      const name = row.querySelector('.course-name-input').value;
      const credits = Number(row.querySelector('.course-credits-input').value) || 0;
      const grade = row.querySelector('.course-grade-select').value;
      const gp = getGradePointForGrade(grade, StorageManager.getRegulation());

      updated.push({ name, credits, grade, gradePoint: gp });
    });
    currentCourses = updated;
  }

  function calculateAndRenderSGPA() {
    syncCoursesFromDOM();
    const currentReg = StorageManager.getRegulation();
    const result = calculateSGPA(currentCourses, currentReg);

    if (currentCourses.length === 0 || result.totalCredits === 0) {
      sgpaResultContainer.innerHTML = `
        <div class="card p-6 text-center text-muted">
          Add at least one course with valid credits to calculate SGPA.
        </div>
      `;
      if (gradeChartContainer) gradeChartContainer.innerHTML = '';
      return;
    }

    sgpaResultContainer.innerHTML = renderResultCard({
      title: 'Semester SGPA',
      value: result.sgpa.toFixed(2),
      statusClass: result.sgpa >= 7.5 ? 'pass' : (result.sgpa >= 6.0 ? 'warning' : 'fail'),
      badgeIcon: result.sgpa >= 7.5 ? '🟢' : (result.sgpa >= 6.0 ? '🟡' : '🔴'),
      statusText: `Total Credits: ${result.totalCredits} | Credit Points: ${result.totalCreditPoints}`,
      explanation: result.explanation,
      actionsHTML: `
        <button id="share-sgpa-btn" class="btn btn-outline btn-sm">📤 Share Result</button>
        <button id="save-sgpa-btn" class="btn btn-primary btn-sm">💾 Save Progress</button>
      `
    });

    // Render Grade Distribution Chart
    if (gradeChartContainer) {
      const gradeCounts = {};
      const regObj = getRegulation(currentReg);
      regObj.grading.forEach(g => { gradeCounts[g.grade] = 0; });
      result.coursesProcessed.forEach(c => {
        gradeCounts[c.grade] = (gradeCounts[c.grade] || 0) + 1;
      });
      AcademicCharts.renderGradeBarChart(gradeChartContainer, gradeCounts);
    }

    // Attach actions
    const saveBtn = document.getElementById('save-sgpa-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        data.courses = currentCourses;
        StorageManager.saveData(data);
        alert('Semester course & SGPA progress saved!');
      });
    }

    const shareBtn = document.getElementById('share-sgpa-btn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        ResultSharer.shareResultImage({
          sgpa: result.sgpa,
          semester: data.currentSemester || 1,
          regulation: currentReg,
          studentName: data.student?.name,
          showName: true,
          showRegulation: true
        });
      });
    }
  }

  // Event Listeners
  if (addCourseBtn) {
    addCourseBtn.addEventListener('click', () => {
      syncCoursesFromDOM();
      currentCourses.push({ name: '', credits: 3, grade: 'A' });
      renderCourseList();
      calculateAndRenderSGPA();
    });
  }

  if (courseListContainer) {
    courseListContainer.addEventListener('input', () => {
      calculateAndRenderSGPA();
    });
    courseListContainer.addEventListener('change', (e) => {
      if (e.target.classList.contains('course-grade-select')) {
        const row = e.target.closest('.course-input-row');
        const gpIndicator = row.querySelector('.course-gp-indicator');
        if (gpIndicator) {
          const gp = getGradePointForGrade(e.target.value, StorageManager.getRegulation());
          gpIndicator.textContent = `Grade Point: ${gp}`;
        }
      }
      calculateAndRenderSGPA();
    });
    courseListContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-course-btn') || e.target.closest('.remove-course-btn')) {
        const row = e.target.closest('.course-input-row');
        const index = Number(row.getAttribute('data-course-index'));
        syncCoursesFromDOM();
        currentCourses.splice(index, 1);
        renderCourseList();
        calculateAndRenderSGPA();
      }
    });
  }

  renderCourseList();
  calculateAndRenderSGPA();
});

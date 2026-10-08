/**
 * AC ADEXA - SGPA Calculator Page Controller
 * Supports multi-semester navigation, separate per-semester courses and SGPA calculation,
 * and persistent saving across all semesters.
 */

document.addEventListener('DOMContentLoaded', () => {
  StorageManager.applyTheme(StorageManager.getTheme());
  renderNavbar('sgpa');
  initRegulationSelector((newReg) => {
    renderCourseList();
    calculateAndRenderSGPA();
    renderSemesterTabs();
  });
  ModalManager.initModalTriggers();
  initFeedbackModal();

  let data = StorageManager.loadData();
  let currentReg = StorageManager.getRegulation();

  // Current active semester number
  let currentSemester = Number(data.currentSemester) || 1;

  // Initialize semester array if empty
  if (!data.semesters || data.semesters.length === 0) {
    const initCourses = data.courses && data.courses.length > 0 ? JSON.parse(JSON.stringify(data.courses)) : [];
    const initCalc = calculateSGPA(initCourses, currentReg);
    data.semesters = [
      {
        semester: currentSemester,
        sgpa: initCalc.sgpa,
        credits: initCalc.totalCredits,
        courses: initCourses
      }
    ];
    StorageManager.saveData(data);
  }

  // Ensure active semester exists in data.semesters
  let activeSemObj = data.semesters.find(s => Number(s.semester) === currentSemester);
  if (!activeSemObj) {
    activeSemObj = data.semesters[0] || { semester: 1, sgpa: 0, credits: 0, courses: [] };
    currentSemester = activeSemObj.semester;
  }

  // Local state for current active semester's courses
  let currentCourses = activeSemObj.courses && activeSemObj.courses.length > 0 
    ? JSON.parse(JSON.stringify(activeSemObj.courses)) 
    : [];

  const semTabsBar = document.getElementById('sem-tabs-bar');
  const addSemTabBtn = document.getElementById('add-sem-tab-btn');
  const deleteCurrSemBtn = document.getElementById('delete-curr-sem-btn');
  const activeSemBadge = document.getElementById('active-sem-badge');
  const semHeading = document.getElementById('sem-heading');
  const courseCountBadge = document.getElementById('course-count-badge');
  const courseListContainer = document.getElementById('course-list-container');
  const addCourseBtn = document.getElementById('add-course-btn');
  const sgpaResultContainer = document.getElementById('sgpa-result-container');
  const gradeChartContainer = document.getElementById('grade-chart-container');

  function renderSemesterTabs() {
    if (!semTabsBar) return;
    data = StorageManager.loadData();
    const semesters = data.semesters || [];

    semTabsBar.innerHTML = semesters.map(s => {
      const isActive = Number(s.semester) === currentSemester;
      const calc = (s.courses && s.courses.length > 0)
        ? calculateSGPA(s.courses, StorageManager.getRegulation())
        : { sgpa: Number(s.sgpa) || 0, totalCredits: Number(s.credits) || 0 };

      const sgpaLabel = calc.sgpa > 0 ? calc.sgpa.toFixed(2) : '--';

      return `
        <button type="button" class="sem-tab-btn ${isActive ? 'active' : ''}" data-sem="${s.semester}">
          <span>Sem ${s.semester}</span>
          <span class="sem-tab-sgpa">${sgpaLabel}</span>
        </button>
      `;
    }).join('');

    if (activeSemBadge) {
      activeSemBadge.textContent = `Viewing Semester ${currentSemester}`;
    }
    if (semHeading) {
      semHeading.textContent = `Semester ${currentSemester} Courses`;
    }
    if (courseCountBadge) {
      courseCountBadge.textContent = `${currentCourses.length} course${currentCourses.length === 1 ? '' : 's'}`;
    }
  }

  function renderCourseList() {
    if (!courseListContainer) return;
    const reg = StorageManager.getRegulation();
    if (currentCourses.length === 0) {
      courseListContainer.innerHTML = `
        <div class="card p-6 text-center text-muted">
          No courses added for Semester ${currentSemester} yet.<br/>
          Click <strong>"+ Add Course"</strong> above to begin entering courses.
        </div>
      `;
    } else {
      courseListContainer.innerHTML = currentCourses.map((c, idx) => createCourseInputRow(c, reg, idx)).join('');
    }

    if (courseCountBadge) {
      courseCountBadge.textContent = `${currentCourses.length} course${currentCourses.length === 1 ? '' : 's'}`;
    }
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

  function persistCurrentSemesterState(silent = false) {
    syncCoursesFromDOM();
    const reg = StorageManager.getRegulation();
    const savedObj = StorageManager.saveSemesterCourses(currentSemester, currentCourses, reg);
    data = StorageManager.loadData();
    renderSemesterTabs();
    if (!silent) {
      alert(`Semester ${currentSemester} courses & SGPA (${savedObj.sgpa.toFixed(2)}) saved successfully!`);
    }
  }

  function switchSemester(semNum) {
    syncCoursesFromDOM();
    // Auto-save previous semester before switching
    StorageManager.saveSemesterCourses(currentSemester, currentCourses, StorageManager.getRegulation());

    currentSemester = Number(semNum);
    data = StorageManager.loadData();
    data.currentSemester = currentSemester;
    StorageManager.saveData(data);

    // Load newly selected semester's courses
    const targetSem = (data.semesters || []).find(s => Number(s.semester) === currentSemester);
    currentCourses = (targetSem && targetSem.courses) ? JSON.parse(JSON.stringify(targetSem.courses)) : [];

    renderSemesterTabs();
    renderCourseList();
    calculateAndRenderSGPA();
  }

  function calculateAndRenderSGPA() {
    syncCoursesFromDOM();
    const reg = StorageManager.getRegulation();
    const result = calculateSGPA(currentCourses, reg);

    if (currentCourses.length === 0 || result.totalCredits === 0) {
      sgpaResultContainer.innerHTML = `
        <div class="card p-6 text-center text-muted">
          Add at least one course with valid credits to calculate Semester ${currentSemester} SGPA.
        </div>
      `;
      if (gradeChartContainer) gradeChartContainer.innerHTML = '';
      return;
    }

    sgpaResultContainer.innerHTML = renderResultCard({
      title: `Semester ${currentSemester} SGPA`,
      value: result.sgpa.toFixed(2),
      statusClass: result.sgpa >= 7.5 ? 'pass' : (result.sgpa >= 6.0 ? 'warning' : 'fail'),
      badgeIcon: result.sgpa >= 7.5 ? '🟢' : (result.sgpa >= 6.0 ? '🟡' : '🔴'),
      statusText: `Total Credits: ${result.totalCredits} | Credit Points: ${result.totalCreditPoints}`,
      explanation: result.explanation,
      actionsHTML: `
        <button id="share-sgpa-btn" class="btn btn-outline btn-sm">📤 Share Result</button>
        <button id="save-sgpa-btn" class="btn btn-primary btn-sm">💾 Save Semester ${currentSemester}</button>
      `
    });

    // Render Grade Distribution Chart
    if (gradeChartContainer) {
      const gradeCounts = {};
      const regObj = getRegulation(reg);
      regObj.grading.forEach(g => { gradeCounts[g.grade] = 0; });
      result.coursesProcessed.forEach(c => {
        gradeCounts[c.grade] = (gradeCounts[c.grade] || 0) + 1;
      });
      AcademicCharts.renderGradeBarChart(gradeChartContainer, gradeCounts);
    }

    // Update tab preview label dynamically
    const activeTab = document.querySelector(`.sem-tab-btn[data-sem="${currentSemester}"] .sem-tab-sgpa`);
    if (activeTab) {
      activeTab.textContent = result.sgpa.toFixed(2);
    }

    // Attach button listeners
    const saveBtn = document.getElementById('save-sgpa-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        persistCurrentSemesterState(false);
      });
    }

    const shareBtn = document.getElementById('share-sgpa-btn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        ResultSharer.shareResultImage({
          sgpa: result.sgpa,
          semester: currentSemester,
          regulation: reg,
          studentName: data.student?.name,
          showName: true,
          showRegulation: true
        });
      });
    }
  }

  // Add Semester Handler
  if (addSemTabBtn) {
    addSemTabBtn.addEventListener('click', () => {
      syncCoursesFromDOM();
      StorageManager.saveSemesterCourses(currentSemester, currentCourses, StorageManager.getRegulation());

      data = StorageManager.loadData();
      const existingSemNums = (data.semesters || []).map(s => Number(s.semester));
      let nextSem = 1;
      while (existingSemNums.includes(nextSem)) {
        nextSem++;
      }

      const input = prompt(`Enter semester number to add:`, nextSem);
      if (input === null) return;
      const semNumber = parseInt(input, 10);
      if (isNaN(semNumber) || semNumber < 1 || semNumber > 16) {
        alert('Please enter a valid semester number (1 - 16).');
        return;
      }

      if (existingSemNums.includes(semNumber)) {
        alert(`Semester ${semNumber} already exists. Switching to Semester ${semNumber}.`);
        switchSemester(semNumber);
        return;
      }

      // Add new semester
      const newSemObj = {
        semester: semNumber,
        sgpa: 0,
        credits: 0,
        courses: [
          { name: '', credits: 3, grade: 'A' }
        ]
      };
      if (!data.semesters) data.semesters = [];
      data.semesters.push(newSemObj);
      data.semesters.sort((a, b) => Number(a.semester) - Number(b.semester));
      data.currentSemester = semNumber;
      data.courses = newSemObj.courses;
      StorageManager.saveData(data);

      currentSemester = semNumber;
      currentCourses = JSON.parse(JSON.stringify(newSemObj.courses));

      renderSemesterTabs();
      renderCourseList();
      calculateAndRenderSGPA();
    });
  }

  // Delete Current Semester Handler
  if (deleteCurrSemBtn) {
    deleteCurrSemBtn.addEventListener('click', () => {
      data = StorageManager.loadData();
      if ((data.semesters || []).length <= 1) {
        alert('You must have at least one semester. You can clear or edit its courses instead.');
        return;
      }

      if (confirm(`Are you sure you want to delete Semester ${currentSemester} and all its course records?`)) {
        StorageManager.deleteSemester(currentSemester);
        data = StorageManager.loadData();
        const remaining = data.semesters || [];
        const nextTarget = remaining[0] ? remaining[0].semester : 1;
        switchSemester(nextTarget);
      }
    });
  }

  // Semester Tab Click Switching
  if (semTabsBar) {
    semTabsBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.sem-tab-btn');
      if (btn) {
        const sem = Number(btn.getAttribute('data-sem'));
        if (sem && sem !== currentSemester) {
          switchSemester(sem);
        }
      }
    });
  }

  // Add Course Handler
  if (addCourseBtn) {
    addCourseBtn.addEventListener('click', () => {
      syncCoursesFromDOM();
      currentCourses.push({ name: '', credits: 3, grade: 'A' });
      renderCourseList();
      calculateAndRenderSGPA();
      persistCurrentSemesterState(true);
    });
  }

  // Course Inputs & Removal Handler
  if (courseListContainer) {
    courseListContainer.addEventListener('input', () => {
      calculateAndRenderSGPA();
      persistCurrentSemesterState(true);
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
      persistCurrentSemesterState(true);
    });

    courseListContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-course-btn') || e.target.closest('.remove-course-btn')) {
        const row = e.target.closest('.course-input-row');
        const index = Number(row.getAttribute('data-course-index'));
        syncCoursesFromDOM();
        currentCourses.splice(index, 1);
        renderCourseList();
        calculateAndRenderSGPA();
        persistCurrentSemesterState(true);
      }
    });
  }

  renderSemesterTabs();
  renderCourseList();
  calculateAndRenderSGPA();
});

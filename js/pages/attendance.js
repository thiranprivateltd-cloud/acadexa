/**
 * AC ADEXA - Attendance Calculator & Planner Page Controller
 * Supports:
 * 1. Subject-wise attendance tracking & consistency for each semester
 * 2. Critical subject safety alerts with exact consecutive classes needed to become safe (≥75%)
 * 3. Individual Subject-wise Attendance Projection Planner (upcoming classes per subject)
 * 4. Overall Semester consistency rating and transparent math breakdowns.
 */

document.addEventListener('DOMContentLoaded', () => {
  StorageManager.applyTheme(StorageManager.getTheme());
  renderNavbar('attendance');
  initRegulationSelector();
  ModalManager.initModalTriggers();
  initFeedbackModal();

  let data = StorageManager.loadData();
  let currentSemester = Number(data.currentSemester) || 1;
  let targetPercentage = 75;

  // Initialize semester attendance records if empty
  if (!data.semesterAttendance) {
    data.semesterAttendance = {};
  }

  // Get or initialize current semester subjects
  let currentSubjects = [];
  const existingSemAtt = StorageManager.getAttendanceData(currentSemester);
  if (existingSemAtt && existingSemAtt.subjects && existingSemAtt.subjects.length > 0) {
    currentSubjects = JSON.parse(JSON.stringify(existingSemAtt.subjects));
  } else {
    currentSubjects = [
      { name: 'Mathematics', conducted: 40, attended: 35, upcoming: 15 },
      { name: 'Operating Systems', conducted: 35, attended: 22, upcoming: 15 }
    ];
    StorageManager.saveAttendanceData(currentSemester, currentSubjects);
  }

  // DOM Elements
  const semTabsBar = document.getElementById('att-sem-tabs-bar');
  const addSemBtn = document.getElementById('add-att-sem-btn');
  const deleteSemBtn = document.getElementById('delete-att-sem-btn');
  const activeSemBadge = document.getElementById('att-active-sem-badge');
  const semHeading = document.getElementById('att-sem-heading');
  const subjectCountBadge = document.getElementById('att-subject-count-badge');
  const criticalAlertContainer = document.getElementById('critical-alert-container');
  const subjectListContainer = document.getElementById('subject-list-container');
  const addSubjectBtn = document.getElementById('add-subject-btn');
  const overallResultContainer = document.getElementById('att-overall-result-container');
  const globalTargetInput = document.getElementById('global-target-input');
  const subjectPlannerList = document.getElementById('subject-planner-list');
  const subjectOverviewList = document.getElementById('subject-overview-list');

  function getExistingSemestersList() {
    data = StorageManager.loadData();
    const semKeys = new Set();
    if (data.semesterAttendance) {
      Object.keys(data.semesterAttendance).forEach(k => semKeys.add(Number(k)));
    }
    if (data.semesters) {
      data.semesters.forEach(s => semKeys.add(Number(s.semester)));
    }
    semKeys.add(currentSemester);
    return Array.from(semKeys).sort((a, b) => a - b);
  }

  function renderSemesterTabs() {
    if (!semTabsBar) return;
    const semesters = getExistingSemestersList();

    semTabsBar.innerHTML = semesters.map(semNum => {
      const isActive = Number(semNum) === currentSemester;
      const semAtt = StorageManager.getAttendanceData(semNum);
      const semSubs = (semAtt && semAtt.subjects) ? semAtt.subjects : [];
      const calc = calculateSemesterAttendance(semSubs);
      const attLabel = calc.totalConducted > 0 ? `${calc.overallPercentage.toFixed(1)}%` : '--';

      return `
        <button type="button" class="sem-tab-btn ${isActive ? 'active' : ''}" data-sem="${semNum}">
          <span>Sem ${semNum}</span>
          <span class="sem-tab-sgpa">${attLabel}</span>
        </button>
      `;
    }).join('');

    if (activeSemBadge) activeSemBadge.textContent = `Viewing Semester ${currentSemester}`;
    if (semHeading) semHeading.textContent = `Semester ${currentSemester} Subjects`;
    if (subjectCountBadge) {
      subjectCountBadge.textContent = `${currentSubjects.length} subject${currentSubjects.length === 1 ? '' : 's'}`;
    }
  }

  function createSubjectInputCard(sub, index) {
    const conducted = sub.conducted !== undefined ? sub.conducted : 0;
    const attended = sub.attended !== undefined ? sub.attended : 0;
    const metrics = calculateAttendance(conducted, attended);
    const consistency = evaluateConsistency(metrics.percentage, conducted);
    const isOverAttended = attended > conducted;

    let helperText = '';
    if (isOverAttended) {
      helperText = '<span style="color: #ef4444; font-weight: 700;">❌ Attended classes cannot exceed conducted!</span>';
    } else if (conducted > 0) {
      if (metrics.percentage >= targetPercentage) {
        helperText = `<span style="color: #10b981; font-weight: 600;">✓ Safe: Can miss up to <strong>${metrics.maxMissable}</strong> class(es)</span>`;
      } else {
        helperText = `<span style="color: #ef4444; font-weight: 700;">⚠️ Must attend <strong>${metrics.requiredConsecutive}</strong> consecutive class(es) for ${targetPercentage}%</span>`;
      }
    }

    return `
      <div class="att-subject-row" data-subject-index="${index}">
        <div class="flex justify-between items-center mb-2 flex-wrap gap-2">
          <div class="font-bold text-sm" style="flex: 1; min-width: 160px;">
            <input type="text" class="form-control sub-name-input" value="${sub.name || `Subject ${index + 1}`}" placeholder="Subject Name (e.g. Mathematics)" style="font-weight: 700; padding: 0.35rem 0.6rem; font-size: 0.9rem;" />
          </div>
          <div class="flex items-center gap-2">
            <span class="consistency-badge ${consistency.colorClass}" style="background-color: var(--bg-muted); border: 1px solid var(--border-color);" title="Consistency: ${consistency.description}">
              ${consistency.badge} ${consistency.level}
            </span>
            <span class="status-badge ${isOverAttended ? 'fail' : metrics.statusClass}" style="font-size: 0.75rem; padding: 0.2rem 0.5rem;">
              ${isOverAttended ? '🔴 ERROR' : `${metrics.badgeIcon} ${metrics.percentage.toFixed(1)}%`}
            </span>
            <button type="button" class="btn btn-sm btn-outline remove-subject-btn" style="color: #ef4444; border-color: #ef4444; padding: 0.2rem 0.5rem; font-size: 0.75rem;" title="Remove Subject">
              &times;
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 mb-2">
          <div class="form-group mb-0">
            <label class="form-label text-xs">Conducted Classes *</label>
            <input type="number" min="0" max="300" class="form-control sub-conducted-input" value="${conducted}" placeholder="e.g. 40" />
          </div>
          <div class="form-group mb-0">
            <label class="form-label text-xs">Attended Classes *</label>
            <input type="number" min="0" max="300" class="form-control sub-attended-input" value="${attended}" placeholder="e.g. 32" />
          </div>
        </div>

        <div class="att-progress-track">
          <div class="att-progress-bar ${isOverAttended ? 'fail' : metrics.statusClass}" style="width: ${Math.min(100, metrics.percentage)}%;"></div>
        </div>

        <div class="flex justify-between items-center mt-2 text-xs text-muted">
          <span>${helperText}</span>
          <span style="font-weight: 600;">${attended}/${conducted} Classes</span>
        </div>
      </div>
    `;
  }

  function renderSubjectList() {
    if (!subjectListContainer) return;
    if (currentSubjects.length === 0) {
      subjectListContainer.innerHTML = `
        <div class="card p-6 text-center text-muted">
          No subjects added for Semester ${currentSemester} yet.<br/>
          Click <strong>"+ Add Subject"</strong> to start tracking attendance.
        </div>
      `;
    } else {
      subjectListContainer.innerHTML = currentSubjects.map((sub, idx) => createSubjectInputCard(sub, idx)).join('');
    }

    if (subjectCountBadge) {
      subjectCountBadge.textContent = `${currentSubjects.length} subject${currentSubjects.length === 1 ? '' : 's'}`;
    }
  }

  function syncSubjectsFromDOM() {
    const rows = document.querySelectorAll('.att-subject-row');
    const updated = [];
    rows.forEach((row, idx) => {
      const name = row.querySelector('.sub-name-input').value.trim();
      const conducted = Number(row.querySelector('.sub-conducted-input').value) || 0;
      const attended = Number(row.querySelector('.sub-attended-input').value) || 0;
      const prevUpcoming = (currentSubjects[idx] && currentSubjects[idx].upcoming !== undefined) ? currentSubjects[idx].upcoming : 15;
      updated.push({ name, conducted, attended, upcoming: prevUpcoming });
    });
    if (rows.length > 0) {
      currentSubjects = updated;
    }
  }

  function persistCurrentState(silent = false) {
    syncSubjectsFromDOM();
    StorageManager.saveAttendanceData(currentSemester, currentSubjects);
    renderSemesterTabs();
    if (!silent) {
      alert(`Semester ${currentSemester} attendance saved successfully!`);
    }
  }

  function switchSemester(semNum) {
    syncSubjectsFromDOM();
    StorageManager.saveAttendanceData(currentSemester, currentSubjects);

    currentSemester = Number(semNum);
    data = StorageManager.loadData();
    data.currentSemester = currentSemester;
    StorageManager.saveData(data);

    const semAtt = StorageManager.getAttendanceData(currentSemester);
    currentSubjects = (semAtt && semAtt.subjects) ? JSON.parse(JSON.stringify(semAtt.subjects)) : [];

    renderSemesterTabs();
    renderSubjectList();
    calculateAndRenderAll();
  }

  function calculateAndRenderAll() {
    syncSubjectsFromDOM();
    const result = calculateSemesterAttendance(currentSubjects);
    const overallConsistency = evaluateConsistency(result.overallPercentage, result.totalConducted);

    // 1. Critical Alert Banner: Identify subjects in danger / critical zone
    const criticalSubjects = result.subjects.filter(s => s.conducted > 0 && s.percentage < 65);
    const warningSubjects = result.subjects.filter(s => s.conducted > 0 && s.percentage >= 65 && s.percentage < targetPercentage);

    if (criticalAlertContainer) {
      if (criticalSubjects.length > 0) {
        criticalAlertContainer.innerHTML = `
          <div class="critical-alert-card mb-4">
            <div class="flex items-center gap-2 mb-2 font-bold text-red-600">
              <span>🚨 ATTENDANCE DEFICIT ALERT</span>
              <span class="status-badge fail text-xs">${criticalSubjects.length} Critical Subject(s)</span>
            </div>
            <p class="text-xs text-muted mb-2">The following subject(s) are below the mandatory threshold. Here is the exact number of consecutive classes you must attend to become safe (≥${targetPercentage}%):</p>
            <div class="flex flex-col gap-2">
              ${criticalSubjects.map(s => `
                <div class="card p-2 bg-surface flex justify-between items-center" style="border-left: 3px solid #ef4444;">
                  <div>
                    <strong class="text-sm">${s.name}</strong>: <span class="text-xs text-muted font-bold">${s.percentage.toFixed(1)}% (${s.attended}/${s.conducted})</span>
                  </div>
                  <div>
                    <span class="status-badge fail text-xs font-bold">
                      👉 Must attend <strong>${s.requiredConsecutive}</strong> consecutive class(es)
                    </span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      } else if (warningSubjects.length > 0) {
        criticalAlertContainer.innerHTML = `
          <div class="card mb-4 p-3" style="border-left: 4px solid #f59e0b; background-color: rgba(245, 158, 11, 0.08);">
            <div class="flex items-center gap-2 font-bold" style="color: #d97706;">
              <span>⚠️ Notice: ${warningSubjects.length} subject(s) in Warning Zone (65%–${targetPercentage}%)</span>
            </div>
            <div class="mt-2 text-xs flex flex-wrap gap-2">
              ${warningSubjects.map(s => `
                <span class="status-badge warning text-xs">
                  ${s.name}: Need ${s.requiredConsecutive} class(es)
                </span>
              `).join('')}
            </div>
          </div>
        `;
      } else {
        criticalAlertContainer.innerHTML = '';
      }
    }

    // 2. Overall Semester Attendance Card with Consistency
    if (overallResultContainer) {
      if (currentSubjects.length === 0 || result.totalConducted === 0) {
        overallResultContainer.innerHTML = `
          <div class="card p-6 text-center text-muted mb-4">
            Add at least one subject with conducted classes to view Semester ${currentSemester} attendance analytics.
          </div>
        `;
      } else {
        overallResultContainer.innerHTML = renderResultCard({
          title: `Semester ${currentSemester} Overall Attendance`,
          value: `${result.overallPercentage.toFixed(2)}%`,
          statusClass: result.statusClass,
          badgeIcon: result.badgeIcon,
          statusText: `${result.statusText} (${result.totalAttended}/${result.totalConducted} classes)`,
          explanation: result.explanation + `\n\nConsistency Rating: ${overallConsistency.level} (${overallConsistency.description})`,
          actionsHTML: `
            <div class="flex items-center gap-2 mb-2">
              <span class="consistency-badge ${overallConsistency.colorClass}">
                ${overallConsistency.badge} Semester Consistency: ${overallConsistency.level}
              </span>
            </div>
            <div class="flex gap-2 justify-center w-full mt-2">
              <button id="save-att-btn" class="btn btn-primary btn-sm">💾 Save Semester ${currentSemester}</button>
            </div>
          `
        });

        const saveBtn = document.getElementById('save-att-btn');
        if (saveBtn) {
          saveBtn.addEventListener('click', () => persistCurrentState(false));
        }
      }
    }

    // 3. Per-Subject Attendance Planner List
    if (subjectPlannerList) {
      if (currentSubjects.length === 0) {
        subjectPlannerList.innerHTML = '<p class="text-xs text-muted text-center py-2">Add subjects on the left to plan upcoming classes.</p>';
      } else {
        subjectPlannerList.innerHTML = currentSubjects.map((sub, idx) => {
          const C = Number(sub.conducted) || 0;
          const P = Number(sub.attended) || 0;
          const U = sub.upcoming !== undefined ? Number(sub.upcoming) : 15;
          const plan = planSubjectAttendance(C, P, U, targetPercentage);
          const consistency = evaluateConsistency(plan.currentPercentage, C);

          let guidanceHTML = '';
          if (plan.isCritical) {
            guidanceHTML = `
              <div class="text-xs font-bold text-red-600 mt-1">
                🚨 CRITICAL: Attend at least <strong>${plan.neededToSafeNow}</strong> consecutive class(es) immediately to reach ${targetPercentage}%.
              </div>
            `;
          } else if (plan.isBelowTarget) {
            guidanceHTML = `
              <div class="text-xs font-bold text-amber-600 mt-1">
                ⚠️ WARNING: Need <strong>${plan.neededToSafeNow}</strong> consecutive class(es) to enter safe zone.
              </div>
            `;
          } else {
            guidanceHTML = `
              <div class="text-xs font-bold text-emerald-600 mt-1">
                ✓ SAFE: You have a buffer of <strong>${calculateAttendance(C, P).maxMissable}</strong> class(es) you can miss right now.
              </div>
            `;
          }

          return `
            <div class="plan-subject-card" data-plan-index="${idx}">
              <div class="flex justify-between items-center mb-2 flex-wrap gap-2">
                <div>
                  <strong class="text-sm">${sub.name || `Subject ${idx + 1}`}</strong>
                  <span class="consistency-badge ${consistency.colorClass} text-xs ml-1">${consistency.badge} ${consistency.level}</span>
                </div>
                <div class="text-xs font-bold">
                  Current: <span class="status-badge ${plan.statusClass}" style="padding: 0.15rem 0.4rem; font-size: 0.75rem;">${plan.currentPercentage.toFixed(1)}%</span>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3 items-center mb-2">
                <div class="form-group mb-0">
                  <label class="form-label text-xs">Upcoming Classes:</label>
                  <input type="number" min="0" max="100" class="form-control sub-upcoming-input" value="${U}" style="padding: 0.35rem 0.6rem; font-size: 0.85rem;" />
                </div>
                <div>
                  <div class="text-xs text-muted font-semibold">Projection (${U} Upcoming):</div>
                  <div class="text-base font-bold ${plan.projectedPercentage >= targetPercentage ? 'text-green-600' : 'text-red-500'}">
                    ${plan.projectedPercentage.toFixed(1)}% Projected
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-2 text-center my-2 p-2 bg-muted rounded">
                <div>
                  <div class="text-xs text-muted font-bold uppercase">Must Attend</div>
                  <div class="text-base font-bold text-emerald-600">${plan.minAttend} / ${U}</div>
                </div>
                <div>
                  <div class="text-xs text-muted font-bold uppercase">Can Miss Up To</div>
                  <div class="text-base font-bold text-red-500">${plan.maxMiss} class(es)</div>
                </div>
              </div>

              ${guidanceHTML}
            </div>
          `;
        }).join('');
      }
    }

    // 4. Detailed Summary & Consistency Breakdown Table
    if (subjectOverviewList) {
      if (result.subjects.length === 0) {
        subjectOverviewList.innerHTML = '<p class="text-xs text-muted text-center py-2">No subjects entered.</p>';
      } else {
        subjectOverviewList.innerHTML = `
          <div style="overflow-x: auto;">
            <table style="width: 100%; font-size: 0.825rem; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 2px solid var(--border-color); text-align: left; color: var(--text-muted);">
                  <th style="padding: 0.5rem;">Subject</th>
                  <th style="padding: 0.5rem; text-align: center;">Attended</th>
                  <th style="padding: 0.5rem; text-align: center;">%</th>
                  <th style="padding: 0.5rem; text-align: center;">Consistency</th>
                  <th style="padding: 0.5rem; text-align: right;">Safety Advice</th>
                </tr>
              </thead>
              <tbody>
                ${result.subjects.map(s => {
                  const cons = evaluateConsistency(s.percentage, s.conducted);
                  return `
                    <tr style="border-bottom: 1px solid var(--border-color);">
                      <td style="padding: 0.55rem 0.5rem; font-weight: 600;">${s.name}</td>
                      <td style="padding: 0.55rem 0.5rem; text-align: center; font-family: var(--font-mono);">${s.attended}/${s.conducted}</td>
                      <td style="padding: 0.55rem 0.5rem; text-align: center; font-weight: 700;">${s.conducted > 0 ? s.percentage.toFixed(1) + '%' : '--'}</td>
                      <td style="padding: 0.55rem 0.5rem; text-align: center;">
                        <span class="consistency-badge ${cons.colorClass}" style="font-size: 0.72rem; padding: 0.15rem 0.45rem;">
                          ${cons.badge} ${cons.level}
                        </span>
                      </td>
                      <td style="padding: 0.55rem 0.5rem; text-align: right; font-weight: 600;">
                        ${s.conducted === 0 ? '<span class="text-muted">No classes</span>' : (
                          s.percentage >= targetPercentage
                            ? `<span style="color: #10b981;">Can miss ${s.maxMissable}</span>`
                            : `<span style="color: #ef4444;">Must attend ${s.requiredConsecutive}</span>`
                        )}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `;
      }
    }
  }

  // Add Semester Button Handler
  if (addSemBtn) {
    addSemBtn.addEventListener('click', () => {
      syncSubjectsFromDOM();
      StorageManager.saveAttendanceData(currentSemester, currentSubjects);

      const existing = getExistingSemestersList();
      let nextSem = 1;
      while (existing.includes(nextSem)) nextSem++;

      const input = prompt('Enter semester number to add for attendance tracking:', nextSem);
      if (input === null) return;
      const semNum = parseInt(input, 10);
      if (isNaN(semNum) || semNum < 1 || semNum > 16) {
        alert('Please enter a valid semester number (1 - 16).');
        return;
      }

      if (existing.includes(semNum)) {
        alert(`Semester ${semNum} already exists. Switching to Semester ${semNum}.`);
        switchSemester(semNum);
        return;
      }

      const initialSubs = [
        { name: 'Subject 1', conducted: 0, attended: 0, upcoming: 15 },
        { name: 'Subject 2', conducted: 0, attended: 0, upcoming: 15 }
      ];
      StorageManager.saveAttendanceData(semNum, initialSubs);
      currentSemester = semNum;
      currentSubjects = JSON.parse(JSON.stringify(initialSubs));

      renderSemesterTabs();
      renderSubjectList();
      calculateAndRenderAll();
    });
  }

  // Delete Semester Button Handler
  if (deleteSemBtn) {
    deleteSemBtn.addEventListener('click', () => {
      const existing = getExistingSemestersList();
      if (existing.length <= 1) {
        alert('You must keep at least one semester. You can clear or remove individual subjects.');
        return;
      }

      if (confirm(`Are you sure you want to delete Semester ${currentSemester} attendance records?`)) {
        data = StorageManager.loadData();
        if (data.semesterAttendance) {
          delete data.semesterAttendance[currentSemester];
          StorageManager.saveData(data);
        }
        const remaining = getExistingSemestersList();
        switchSemester(remaining[0] || 1);
      }
    });
  }

  // Semester Tab Switching Click
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

  // Add Subject Button
  if (addSubjectBtn) {
    addSubjectBtn.addEventListener('click', () => {
      syncSubjectsFromDOM();
      currentSubjects.push({
        name: `Subject ${currentSubjects.length + 1}`,
        conducted: 30,
        attended: 25,
        upcoming: 15
      });
      renderSubjectList();
      calculateAndRenderAll();
      persistCurrentState(true);
    });
  }

  // Subject List Live Input & Removal Handlers
  if (subjectListContainer) {
    subjectListContainer.addEventListener('input', () => {
      calculateAndRenderAll();
      persistCurrentState(true);
    });

    subjectListContainer.addEventListener('click', (e) => {
      const removeBtn = e.target.closest('.remove-subject-btn');
      if (removeBtn) {
        const row = removeBtn.closest('.att-subject-row');
        const idx = Number(row.getAttribute('data-subject-index'));
        syncSubjectsFromDOM();
        currentSubjects.splice(idx, 1);
        renderSubjectList();
        calculateAndRenderAll();
        persistCurrentState(true);
      }
    });
  }

  // Per-Subject Upcoming Input Handlers in Planner
  if (subjectPlannerList) {
    subjectPlannerList.addEventListener('input', (e) => {
      if (e.target.classList.contains('sub-upcoming-input')) {
        const card = e.target.closest('.plan-subject-card');
        const idx = Number(card.getAttribute('data-plan-index'));
        if (currentSubjects[idx]) {
          currentSubjects[idx].upcoming = Number(e.target.value) || 0;
          calculateAndRenderAll();
          persistCurrentState(true);
        }
      }
    });
  }

  // Global Target Percentage Change Handler
  if (globalTargetInput) {
    globalTargetInput.addEventListener('input', (e) => {
      targetPercentage = Number(e.target.value) || 75;
      calculateAndRenderAll();
    });
  }

  // Initial Run
  renderSemesterTabs();
  renderSubjectList();
  calculateAndRenderAll();
});



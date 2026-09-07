/**
 * AC ADEXA - Marks & Target Grade Calculator Page Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  StorageManager.applyTheme(StorageManager.getTheme());
  renderNavbar('marks');
  initRegulationSelector((newReg) => {
    populateCourseTypes();
    renderDynamicForm();
    calculateMarks();
  });
  ModalManager.initModalTriggers();
  initFeedbackModal();

  const courseTypeSelect = document.getElementById('marks-course-type');
  const dynamicFormContainer = document.getElementById('marks-dynamic-fields');
  const marksResultContainer = document.getElementById('marks-result-container');

  // Target Grade Solver DOM
  const targetCIAInput = document.getElementById('target-cia-input');
  const targetGradeSelect = document.getElementById('target-grade-select');
  const targetResultContainer = document.getElementById('target-result-container');

  function populateCourseTypes() {
    if (!courseTypeSelect) return;
    const currentReg = StorageManager.getRegulation();
    const regObj = getRegulation(currentReg);

    courseTypeSelect.innerHTML = Object.values(regObj.courseTypes).map(ct => `
      <option value="${ct.id}">${ct.name}</option>
    `).join('');

    populateTargetGradeOptions();
  }

  function populateTargetGradeOptions() {
    if (!targetGradeSelect) return;
    const currentReg = StorageManager.getRegulation();
    const regObj = getRegulation(currentReg);

    targetGradeSelect.innerHTML = regObj.grading.map(g => `
      <option value="${g.grade}">${g.grade} (${g.min}-${g.max} Marks, GP ${g.point})</option>
    `).join('');
  }

  function renderDynamicForm() {
    if (!dynamicFormContainer || !courseTypeSelect) return;
    const currentReg = StorageManager.getRegulation();
    const regObj = getRegulation(currentReg);
    const selectedTypeId = courseTypeSelect.value;
    const courseType = regObj.courseTypes[selectedTypeId] || Object.values(regObj.courseTypes)[0];

    if (courseType.isDepartmentSpecific) {
      dynamicFormContainer.innerHTML = `
        <div class="card p-4 bg-muted text-center">
          <span class="status-badge info mb-2">🔵 Department-Specific Assessment</span>
          <p class="text-sm font-semibold mt-2 text-muted">
            ${courseType.description}
          </p>
        </div>
      `;
      if (marksResultContainer) {
        marksResultContainer.innerHTML = renderResultCard({
          title: 'Assessment Information',
          value: 'Departmental',
          statusClass: 'info',
          badgeIcon: '🔵',
          statusText: 'INFO',
          explanation: 'This course type cannot be calculated automatically unless the applicable departmental assessment structure is provided.'
        });
      }
      return;
    }

    let fieldsHTML = '<div class="card mb-4"><h3 class="card-title mb-3">Internal Assessment Components (CIA)</h3><div class="grid grid-cols-2 gap-3">';

    courseType.ciaComponents.forEach(comp => {
      fieldsHTML += `
        <div class="form-group mb-2">
          <label class="form-label text-xs">${comp.label} (Max ${comp.max})</label>
          <input type="number" step="0.5" min="0" max="${comp.max}" class="form-control cia-input" data-comp-id="${comp.id}" value="${Math.round(comp.max * 0.8)}" required />
        </div>
      `;
    });

    fieldsHTML += '</div></div>';

    fieldsHTML += '<div class="card mb-4"><h3 class="card-title mb-3">End Semester Examination (SEE)</h3><div class="grid grid-cols-2 gap-3">';

    courseType.seeComponents.forEach(comp => {
      fieldsHTML += `
        <div class="form-group mb-2" style="grid-column: span ${courseType.seeComponents.length === 1 ? '2' : '1'};">
          <label class="form-label text-xs">${comp.label} (Max ${comp.max})</label>
          <input type="number" step="0.5" min="0" max="${comp.max}" class="form-control see-input" data-comp-id="${comp.id}" value="${Math.round(comp.max * 0.75)}" required />
        </div>
      `;
    });

    fieldsHTML += '</div></div>';

    dynamicFormContainer.innerHTML = fieldsHTML;

    // Attach input event listeners for live recalculation
    dynamicFormContainer.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', calculateMarks);
    });
  }

  function calculateMarks() {
    if (!courseTypeSelect || !dynamicFormContainer) return;
    const currentReg = StorageManager.getRegulation();
    const selectedTypeId = courseTypeSelect.value;
    const regObj = getRegulation(currentReg);
    const courseType = regObj.courseTypes[selectedTypeId];

    if (courseType && courseType.isDepartmentSpecific) return;

    const componentInputs = {};
    dynamicFormContainer.querySelectorAll('.cia-input, .see-input').forEach(input => {
      const compId = input.getAttribute('data-comp-id');
      componentInputs[compId] = Number(input.value) || 0;
    });

    const result = calculateCourseMarks(componentInputs, selectedTypeId, currentReg);

    if (marksResultContainer) {
      marksResultContainer.innerHTML = renderResultCard({
        title: 'Final Total Mark & Grade',
        value: `${result.finalMark.toFixed(2)} / 100`,
        statusClass: result.gradeResult.statusClass,
        badgeIcon: result.gradeResult.badgeIcon,
        statusText: `Grade: ${result.gradeResult.grade} (GP: ${result.gradeResult.gradePoint}) | ${result.gradeResult.statusText}`,
        explanation: result.explanation
      });
    }

    // Auto update target solver CIA input
    if (targetCIAInput && result.cia !== null) {
      targetCIAInput.value = result.cia;
      calculateTargetMarks();
    }
  }

  function calculateTargetMarks() {
    if (!targetCIAInput || !targetGradeSelect || !targetResultContainer) return;
    const cia = Number(targetCIAInput.value) || 0;
    const targetGrade = targetGradeSelect.value;
    const currentReg = StorageManager.getRegulation();
    const regObj = getRegulation(currentReg);
    const selectedTypeId = courseTypeSelect ? courseTypeSelect.value : 'theory';
    const courseType = regObj.courseTypes[selectedTypeId] || regObj.courseTypes['theory'];
    const seeMax = courseType.seeMax || 50;

    const res = calculateRequiredMarks(cia, targetGrade, currentReg, seeMax);

    targetResultContainer.innerHTML = renderResultCard({
      title: `Required SEE Mark for Grade ${targetGrade}`,
      value: res.isAchievable ? `${res.requiredSEE} / ${seeMax}` : 'N/A',
      statusClass: res.statusClass,
      badgeIcon: res.badgeIcon,
      statusText: res.statusText,
      explanation: res.explanation
    });
  }

  if (courseTypeSelect) {
    courseTypeSelect.addEventListener('change', () => {
      renderDynamicForm();
      calculateMarks();
    });
  }

  if (targetCIAInput) targetCIAInput.addEventListener('input', calculateTargetMarks);
  if (targetGradeSelect) targetGradeSelect.addEventListener('change', calculateTargetMarks);

  populateCourseTypes();
  renderDynamicForm();
  calculateMarks();
});

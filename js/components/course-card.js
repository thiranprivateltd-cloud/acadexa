/**
 * ACADEXA - Course Row Input Component for SGPA & What-If
 * Visual Direction: Direction C: Graphite & Emerald
 */

function createCourseInputRow(courseData = {}, regulationKey = 'R25', index = 0, isWhatIf = false) {
  const name = courseData.name || '';
  const credits = courseData.credits !== undefined ? courseData.credits : 3;
  const grade = courseData.grade || 'A';

  const reg = getRegulation(regulationKey);
  const gradeOptionsHTML = reg.grading.map(g => `
    <option value="${g.grade}" ${g.grade === grade ? 'selected' : ''}>
      ${g.grade} (${g.point} Points)
    </option>
  `).join('');

  return `
    <div class="course-input-row card mb-3" data-course-index="${index}" style="padding: 0.95rem;">
      <div class="grid grid-cols-3 gap-3 items-center">
        <div class="form-group mb-0" style="grid-column: span 1;">
          <label class="form-label text-xs">Course Name ${isWhatIf ? '' : '(Optional)'}</label>
          <input type="text" class="form-control course-name-input" value="${name}" placeholder="e.g. DBMS" style="font-size: 0.825rem;" />
        </div>
        <div class="form-group mb-0">
          <label class="form-label text-xs">Credits *</label>
          <input type="number" step="0.5" min="0.5" max="20" class="form-control course-credits-input" value="${credits}" required style="font-size: 0.825rem;" />
        </div>
        <div class="form-group mb-0">
          <label class="form-label text-xs">Grade *</label>
          <select class="form-control course-grade-select" style="font-size: 0.825rem;">
            ${gradeOptionsHTML}
          </select>
        </div>
      </div>
      <div class="flex justify-between items-center mt-2 pt-2 border-t" style="border-color: var(--border-color);">
        <span class="text-xs text-muted course-gp-indicator font-mono">Grade Point: ${getGradePointForGrade(grade, regulationKey)}</span>
        <button type="button" class="btn btn-sm btn-outline remove-course-btn" style="color: var(--status-fail-text); border-color: rgba(248, 113, 113, 0.3); padding: 0.15rem 0.45rem; font-size: 0.725rem;">
          &times; Remove Course
        </button>
      </div>
    </div>
  `;
}

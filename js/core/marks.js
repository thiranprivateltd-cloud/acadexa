/**
 * AC ADEXA - Core Marks & Target Assessment Engine
 */

/**
 * Calculate CIA, SEE, Final Mark, Grade, and Pass Status for any course dynamic components.
 * @param {object} componentInputs - Object mapping component ID -> numerical input value
 * @param {string} courseTypeId - e.g. 'theory', 'laboratory', 'integrated', etc.
 * @param {string} regulationKey - 'R21' or 'R25'
 * @returns {object} Calculated result & step-by-step breakdown
 */
function calculateCourseMarks(componentInputs, courseTypeId, regulationKey = 'R25') {
  const reg = getRegulation(regulationKey);
  const courseType = reg.courseTypes[courseTypeId] || reg.courseTypes['theory'];

  if (courseType.isDepartmentSpecific) {
    return {
      isDepartmentSpecific: true,
      message: 'Department-Specific Assessment. CIA & SEE are conducted according to departmental rules.',
      cia: null,
      see: null,
      finalMark: null,
      gradeResult: { grade: 'N/A', gradePoint: 0, isPass: false, statusText: 'INFO', statusClass: 'info', badgeIcon: '🔵', reason: 'Department-specific course' }
    };
  }

  let cia = 0;
  let see = 0;
  let breakdownLines = [];

  if (regulationKey === 'R21') {
    if (courseTypeId === 'theory') {
      const t1 = Number(componentInputs.t1) || 0;
      const t2 = Number(componentInputs.t2) || 0;
      const t3 = Number(componentInputs.t3) || 0;
      const assignment = Number(componentInputs.assignment) || 0;
      const attendance = Number(componentInputs.attendance) || 0;
      see = Number(componentInputs.see) || 0;

      const testAvg = (t1 + t2 + t3) / 3;
      cia = testAvg + assignment + attendance;

      breakdownLines.push(`Test Average = (${t1} + ${t2} + ${t3}) / 3 = ${testAvg.toFixed(2)}`);
      breakdownLines.push(`CIA = ${testAvg.toFixed(2)} + ${assignment} + ${attendance} = ${cia.toFixed(2)} / 40`);
      breakdownLines.push(`SEE = ${see} / 60`);
    } else if (courseTypeId === 'laboratory') {
      const modelLab = Number(componentInputs.modelLab) || 0;
      const recordObsExpAtt = Number(componentInputs.recordObsExpAtt) || 0;
      see = Number(componentInputs.see) || 0;

      cia = modelLab + recordObsExpAtt;
      breakdownLines.push(`CIA = Model Lab (${modelLab}) + Record/Obs/Exp/Att (${recordObsExpAtt}) = ${cia.toFixed(2)} / 40`);
      breakdownLines.push(`SEE = ${see} / 60`);
    } else if (courseTypeId === 'integrated') {
      const mid1 = Number(componentInputs.mid1) || 0;
      const mid2 = Number(componentInputs.mid2) || 0;
      const modelLab = Number(componentInputs.modelLab) || 0;
      const assignment = Number(componentInputs.assignment) || 0;
      const attendance = Number(componentInputs.attendance) || 0;
      see = Number(componentInputs.see) || 0;

      const midComp = (mid1 + mid2) / 4;
      cia = midComp + modelLab + assignment + attendance;

      breakdownLines.push(`Mid Test Component = (${mid1} + ${mid2}) / 4 = ${midComp.toFixed(2)}`);
      breakdownLines.push(`CIA = ${midComp.toFixed(2)} + Model Lab (${modelLab}) + Assignment (${assignment}) + Attendance (${attendance}) = ${cia.toFixed(2)} / 40`);
      breakdownLines.push(`SEE = ${see} / 60`);
    }
  } else {
    // R25 course calculations
    let ciaSum = 0;
    courseType.ciaComponents.forEach(comp => {
      const val = Number(componentInputs[comp.id]) || 0;
      ciaSum += val;
      breakdownLines.push(`${comp.label}: ${val} / ${comp.max}`);
    });
    cia = ciaSum;
    breakdownLines.push(`Total CIA = ${cia.toFixed(2)} / ${courseType.ciaMax}`);

    let seeSum = 0;
    if (courseType.seeComponents.length === 1) {
      see = Number(componentInputs.see) || 0;
      breakdownLines.push(`SEE Written/Practical = ${see} / ${courseType.seeMax}`);
    } else {
      courseType.seeComponents.forEach(comp => {
        const val = Number(componentInputs[comp.id]) || 0;
        seeSum += val;
        breakdownLines.push(`${comp.label}: ${val} / ${comp.max}`);
      });
      see = seeSum;
      breakdownLines.push(`Total SEE = ${see.toFixed(2)} / ${courseType.seeMax}`);
    }
  }

  const finalMark = Math.min(100, cia + see);
  breakdownLines.push(`Final Total Mark = CIA (${cia.toFixed(2)}) + SEE (${see.toFixed(2)}) = ${finalMark.toFixed(2)} / 100`);

  const gradeResult = evaluateGrade(finalMark, regulationKey, see);
  breakdownLines.push(`Grade: ${gradeResult.grade} (Grade Point: ${gradeResult.gradePoint})`);
  breakdownLines.push(`Status: ${gradeResult.badgeIcon} ${gradeResult.statusText}`);

  return {
    isDepartmentSpecific: false,
    cia: Math.round(cia * 100) / 100,
    see: Math.round(see * 100) / 100,
    finalMark: Math.round(finalMark * 100) / 100,
    gradeResult,
    explanation: breakdownLines.join('\n')
  };
}

/**
 * Calculate required SEE mark for a target grade
 * @param {number} currentCIA - CIA obtained so far
 * @param {string} targetGrade - e.g. 'A+', 'O', 'A'
 * @param {string} regulationKey - 'R21' or 'R25'
 * @param {number} seeMax - Maximum SEE marks (default 60 for R21, 50 for R25)
 * @returns {object} Target calculation breakdown
 */
function calculateRequiredMarks(currentCIA, targetGrade, regulationKey = 'R25', seeMax = 50) {
  const reg = getRegulation(regulationKey);
  const cia = Number(currentCIA) || 0;

  const targetGradeObj = reg.grading.find(g => g.grade.toUpperCase() === targetGrade.toUpperCase());
  if (!targetGradeObj) {
    return {
      isAchievable: false,
      reason: 'Invalid target grade specified'
    };
  }

  const requiredFinalMark = targetGradeObj.min;
  let requiredSEE = requiredFinalMark - cia;
  const maxPossibleMark = Math.min(100, cia + seeMax);
  const maxAchievableGradeResult = evaluateGrade(maxPossibleMark, regulationKey, seeMax);

  let isAchievable = true;
  let reasonLines = [];

  if (requiredSEE > seeMax) {
    isAchievable = false;
    reasonLines.push(`Required SEE (${requiredSEE.toFixed(2)}) exceeds maximum possible SEE (${seeMax}).`);
  }

  if (regulationKey === 'R25') {
    if (requiredSEE < 25 && requiredFinalMark >= 50) {
      // Must score at least 25 in SEE to pass R25 even if target final mark would otherwise be reached
      requiredSEE = 25;
      reasonLines.push(`Adjusted to minimum mandatory SEE threshold of 25/50 for Regulation 25.`);
    }
  }

  if (cia + seeMax < requiredFinalMark) {
    isAchievable = false;
  }

  let statusClass = isAchievable ? 'pass' : 'fail';
  let badgeIcon = isAchievable ? '🟢' : '🔴';
  let statusText = isAchievable ? 'TARGET ACHIEVABLE' : 'TARGET UNREACHABLE';

  const explanation = `Current CIA: ${cia}\n` +
    `Target Grade: ${targetGrade} (Requires minimum ${requiredFinalMark} total marks)\n` +
    `Required Final Mark: ${requiredFinalMark}\n` +
    `Required SEE Mark: ${requiredSEE <= 0 ? 0 : requiredSEE.toFixed(2)} / ${seeMax}\n` +
    `Maximum Possible Mark with Full SEE (${seeMax}): ${maxPossibleMark.toFixed(2)} / 100\n` +
    `Maximum Achievable Grade: ${maxAchievableGradeResult.grade}\n` +
    (reasonLines.length ? reasonLines.join('\n') : `You need to score at least ${Math.max(0, requiredSEE).toFixed(2)} out of ${seeMax} in the SEE.`);

  return {
    isAchievable,
    currentCIA: cia,
    targetGrade,
    requiredFinalMark,
    requiredSEE: Math.max(0, Math.round(requiredSEE * 100) / 100),
    maxPossibleMark,
    maxAchievableGrade: maxAchievableGradeResult.grade,
    statusClass,
    badgeIcon,
    statusText,
    explanation
  };
}

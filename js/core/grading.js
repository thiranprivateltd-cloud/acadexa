/**
 * AC ADEXA - Core Grading Functions
 * Evaluates grades, grade points, and pass/fail statuses strictly according to regulation rules.
 */

/**
 * Determine grade, grade point, and status from final marks and optional SEE mark.
 * @param {number} finalMark - Total mark out of 100
 * @param {string} regulationKey - 'R21' or 'R25'
 * @param {number|null} seeMark - End Semester Examination mark (required for R25 pass check)
 * @returns {object} { grade, gradePoint, isPass, statusText, statusClass, reason }
 */
function evaluateGrade(finalMark, regulationKey = 'R25', seeMark = null) {
  const reg = getRegulation(regulationKey);
  const roundedMark = Math.round(finalMark * 100) / 100;

  // Check R25 specific pass condition: SEE >= 25 AND Total >= 50
  if (regulationKey === 'R25') {
    const minSee = reg.pass.minSee; // 25
    const minTotal = reg.pass.minTotal; // 50

    const seePassed = seeMark === null || seeMark >= minSee;
    const totalPassed = roundedMark >= minTotal;

    if (!seePassed || !totalPassed) {
      let reason = [];
      if (seeMark !== null && seeMark < minSee) {
        reason.push(`SEE mark (${seeMark}/50) is below the minimum required 25`);
      }
      if (roundedMark < minTotal) {
        reason.push(`Total mark (${roundedMark}/100) is below minimum 50`);
      }

      return {
        grade: 'RA',
        gradePoint: 0,
        isPass: false,
        statusText: 'FAIL',
        statusClass: 'fail',
        badgeIcon: '🔴',
        reason: reason.join(' & ')
      };
    }
  }

  // R21 Pass condition check
  if (regulationKey === 'R21' && roundedMark < reg.pass.minTotal) {
    return {
      grade: 'RA',
      gradePoint: 0,
      isPass: false,
      statusText: 'FAIL',
      statusClass: 'fail',
      badgeIcon: '🔴',
      reason: `Total mark (${roundedMark}/100) is below minimum 50`
    };
  }

  // Find matching grade boundary
  for (const item of reg.grading) {
    if (roundedMark >= item.min && roundedMark <= item.max) {
      const isRA = item.grade === 'RA';
      return {
        grade: item.grade,
        gradePoint: item.point,
        isPass: !isRA,
        statusText: isRA ? 'FAIL' : 'PASS',
        statusClass: isRA ? 'fail' : 'pass',
        badgeIcon: isRA ? '🔴' : '🟢',
        reason: isRA ? 'Total mark below 50' : 'Satisfies all passing criteria'
      };
    }
  }

  // Fallback for edge cases (e.g. mark > 100 or < 0)
  if (roundedMark > 100) {
    const topGrade = reg.grading[0];
    return {
      grade: topGrade.grade,
      gradePoint: topGrade.point,
      isPass: true,
      statusText: 'PASS',
      statusClass: 'pass',
      badgeIcon: '🟢',
      reason: 'Maximum grade assigned'
    };
  }

  return {
    grade: 'RA',
    gradePoint: 0,
    isPass: false,
    statusText: 'FAIL',
    statusClass: 'fail',
    badgeIcon: '🔴',
    reason: 'Mark invalid or failed'
  };
}

/**
 * Get grade point from a given grade string and regulation
 */
function getGradePointForGrade(gradeStr, regulationKey = 'R25') {
  const reg = getRegulation(regulationKey);
  const match = reg.grading.find(g => g.grade.toUpperCase() === gradeStr.toUpperCase());
  return match ? match.point : 0;
}

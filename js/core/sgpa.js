/**
 * AC ADEXA - Core SGPA Calculator Engine
 */

/**
 * Calculate SGPA from array of courses
 * @param {Array<object>} courses - Array of { name, credits, grade, gradePoint }
 * @param {string} regulationKey - 'R21' or 'R25'
 * @returns {object} SGPA calculation breakdown
 */
function calculateSGPA(courses, regulationKey = 'R25') {
  if (!courses || courses.length === 0) {
    return {
      sgpa: 0,
      totalCredits: 0,
      totalCreditPoints: 0,
      coursesProcessed: [],
      explanation: 'No courses added yet.'
    };
  }

  let totalCredits = 0;
  let totalCreditPoints = 0;
  let lines = [];
  let processed = [];

  courses.forEach((c, index) => {
    const credits = Number(c.credits) || 0;
    const grade = (c.grade || 'RA').toUpperCase();
    const gp = c.gradePoint !== undefined ? Number(c.gradePoint) : getGradePointForGrade(grade, regulationKey);
    const creditPoints = credits * gp;

    totalCredits += credits;
    totalCreditPoints += creditPoints;

    processed.push({
      name: c.name || `Course ${index + 1}`,
      credits,
      grade,
      gradePoint: gp,
      creditPoints,
      isPass: gp > 0
    });

    lines.push(`${c.name || 'Course ' + (index + 1)}: ${credits} credits × Grade ${grade} (${gp} GP) = ${creditPoints} points`);
  });

  if (totalCredits <= 0) {
    return {
      sgpa: 0,
      totalCredits: 0,
      totalCreditPoints: 0,
      coursesProcessed: processed,
      explanation: 'Total credits is 0. Unable to calculate SGPA.'
    };
  }

  const rawSGPA = totalCreditPoints / totalCredits;
  const sgpa = Math.round(rawSGPA * 100) / 100; // 2 decimal places

  lines.push('----------------------------------------');
  lines.push(`Total Credits: ${totalCredits}`);
  lines.push(`Total Credit Points: ${totalCreditPoints}`);
  lines.push(`SGPA Formula = Σ(Credits × Grade Point) / Σ(Credits)`);
  lines.push(`SGPA Calculation = ${totalCreditPoints} / ${totalCredits} = ${rawSGPA.toFixed(4)}`);
  lines.push(`Final Displayed SGPA = ${sgpa.toFixed(2)}`);

  return {
    sgpa,
    totalCredits,
    totalCreditPoints,
    coursesProcessed: processed,
    explanation: lines.join('\n')
  };
}

/**
 * AC ADEXA - Core CGPA Engine
 */

/**
 * Calculate CGPA across semesters
 * @param {Array<object>} semesters - Array of { semester, sgpa, credits }
 * @param {string} regulationKey - 'R21' or 'R25'
 * @returns {object} CGPA analysis & R25 equivalent percentage
 */
function calculateCGPA(semesters, regulationKey = 'R25') {
  if (!semesters || semesters.length === 0) {
    return {
      cgpa: 0,
      totalCredits: 0,
      equivalentPercentage: null,
      explanation: 'No semester data available.'
    };
  }

  let totalCredits = 0;
  let totalPoints = 0;
  let lines = [];

  semesters.forEach((s) => {
    const sgpa = Number(s.sgpa) || 0;
    const credits = Number(s.credits) || 0;
    const semPoints = sgpa * credits;

    totalCredits += credits;
    totalPoints += semPoints;

    lines.push(`Semester ${s.semester}: SGPA ${sgpa.toFixed(2)} × ${credits} Credits = ${semPoints.toFixed(2)} points`);
  });

  if (totalCredits <= 0) {
    return {
      cgpa: 0,
      totalCredits: 0,
      equivalentPercentage: null,
      explanation: 'Total cumulative credits is 0.'
    };
  }

  const rawCGPA = totalPoints / totalCredits;
  const cgpa = Math.round(rawCGPA * 100) / 100;

  lines.push('----------------------------------------');
  lines.push(`Total Cumulative Credits: ${totalCredits}`);
  lines.push(`Total Weighted Points: ${totalPoints.toFixed(2)}`);
  lines.push(`CGPA Formula = Σ(SGPA × Credits) / Σ(Credits)`);
  lines.push(`CGPA Calculation = ${totalPoints.toFixed(2)} / ${totalCredits} = ${rawCGPA.toFixed(4)}`);
  lines.push(`Final CGPA = ${cgpa.toFixed(2)}`);

  let equivalentPercentage = null;
  const reg = getRegulation(regulationKey);

  if (reg.hasPercentageEquivalence) {
    equivalentPercentage = Math.round(cgpa * reg.percentageMultiplier * 100) / 100;
    lines.push(`Regulation ${regulationKey} Equivalent Percentage = CGPA × ${reg.percentageMultiplier} = ${equivalentPercentage.toFixed(2)}%`);
  }

  return {
    cgpa,
    totalCredits,
    equivalentPercentage,
    explanation: lines.join('\n')
  };
}

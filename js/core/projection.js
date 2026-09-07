/**
 * AC ADEXA - Core CGPA Projection & Target Planner Engine
 */

/**
 * Solve for required average remaining SGPA and calculate projected CGPAs
 * @param {number} currentCGPA
 * @param {number} completedCredits
 * @param {number} remainingCredits
 * @param {number} targetCGPA
 * @param {string} regulationKey
 */
function projectCGPA(currentCGPA, completedCredits, remainingCredits, targetCGPA, regulationKey = 'R25') {
  const current = Number(currentCGPA) || 0;
  const completed = Number(completedCredits) || 0;
  const remaining = Number(remainingCredits) || 0;
  const target = Number(targetCGPA) || 0;

  const totalCredits = completed + remaining;
  const maxGP = 10.0; // Maximum achievable grade point

  if (totalCredits <= 0 || remaining <= 0) {
    return {
      isTargetAchievable: false,
      requiredSGPA: 0,
      maxPossibleCGPA: current,
      scenarios: [],
      explanation: 'Remaining credits must be greater than 0.'
    };
  }

  // Required SGPA formula = [Target * Total - Current * Completed] / Remaining
  const targetPointsNeeded = target * totalCredits;
  const currentPoints = current * completed;
  const remainingPointsNeeded = targetPointsNeeded - currentPoints;
  const rawRequiredSGPA = remainingPointsNeeded / remaining;
  const requiredSGPA = Math.round(rawRequiredSGPA * 100) / 100;

  const isTargetAchievable = rawRequiredSGPA <= maxGP && rawRequiredSGPA >= 0;

  // Maximum Possible CGPA assuming student gets 10.0 in all remaining credits
  const maxPossiblePoints = currentPoints + (maxGP * remaining);
  const maxPossibleCGPA = Math.round((maxPossiblePoints / totalCredits) * 100) / 100;

  let explanationLines = [
    `Current CGPA: ${current.toFixed(2)} (${completed} completed credits)`,
    `Remaining Credits: ${remaining}`,
    `Target CGPA: ${target.toFixed(2)}`,
    `Total Cumulative Credits: ${totalCredits}`,
    `Total Points Required for Target: ${target.toFixed(2)} × ${totalCredits} = ${targetPointsNeeded.toFixed(2)}`,
    `Points Earned So Far: ${current.toFixed(2)} × ${completed} = ${currentPoints.toFixed(2)}`,
    `Points Needed in Remaining Credits: ${targetPointsNeeded.toFixed(2)} - ${currentPoints.toFixed(2)} = ${remainingPointsNeeded.toFixed(2)}`,
    `Required Average SGPA = ${remainingPointsNeeded.toFixed(2)} / ${remaining} = ${rawRequiredSGPA.toFixed(4)}`,
    `Rounded Required SGPA: ${requiredSGPA.toFixed(2)}`
  ];

  if (!isTargetAchievable) {
    explanationLines.push('----------------------------------------');
    explanationLines.push(`❌ TARGET UNREACHABLE! Required SGPA (${requiredSGPA.toFixed(2)}) exceeds maximum available Grade Point of 10.00.`);
    explanationLines.push(`Maximum Achievable CGPA (scoring 10.00 in all remaining credits): ${maxPossibleCGPA.toFixed(2)}`);
  } else {
    explanationLines.push('----------------------------------------');
    explanationLines.push(`🟢 TARGET ACHIEVABLE! You need an average SGPA of ${requiredSGPA.toFixed(2)} in remaining ${remaining} credits.`);
  }

  // Benchmark "What if I average..." scenarios
  const benchmarkSGPAs = [8.0, 8.5, 9.0, 9.5, 10.0];
  const scenarios = benchmarkSGPAs.map(avgSGPA => {
    const projectedPoints = currentPoints + (avgSGPA * remaining);
    const projectedCGPA = Math.round((projectedPoints / totalCredits) * 100) / 100;
    return {
      avgSGPA,
      projectedCGPA,
      diff: Math.round((projectedCGPA - current) * 100) / 100
    };
  });

  return {
    isTargetAchievable,
    requiredSGPA: Math.max(0, requiredSGPA),
    maxPossibleCGPA,
    scenarios,
    statusClass: isTargetAchievable ? 'pass' : 'fail',
    badgeIcon: isTargetAchievable ? '🟢' : '🔴',
    statusText: isTargetAchievable ? 'TARGET ACHIEVABLE' : 'TARGET UNREACHABLE',
    explanation: explanationLines.join('\n')
  };
}

/**
 * AC ADEXA - Core Attendance Calculator & Planner Functions
 */

/**
 * Calculate attendance metrics for a single subject / course or aggregate total
 * @param {number} conducted - Total classes conducted
 * @param {number} attended - Total classes attended
 * @returns {object} Calculated attendance analysis
 */
function calculateAttendance(conducted, attended) {
  const C = Number(conducted) || 0;
  const P = Number(attended) || 0;

  if (C <= 0) {
    return {
      conducted: 0,
      attended: 0,
      percentage: 0,
      status: 'INFO',
      statusClass: 'info',
      badgeIcon: '🔵',
      statusText: 'NO CLASSES',
      maxMissable: 0,
      requiredConsecutive: 0,
      explanation: 'No classes have been conducted yet.'
    };
  }

  const percentage = Math.round((P / C) * 10000) / 100; // 2 decimal places

  let statusClass = 'pass';
  let badgeIcon = '🟢';
  let statusText = 'SAFE';

  if (percentage < 65) {
    statusClass = 'fail';
    badgeIcon = '🔴';
    statusText = 'CRITICAL';
  } else if (percentage < 75) {
    statusClass = 'warning';
    badgeIcon = '🟡';
    statusText = 'WARNING';
  }

  let maxMissable = 0;
  let requiredConsecutive = 0;

  if (percentage >= 75) {
    // Find largest integer M such that P / (C + M) >= 0.75
    maxMissable = Math.max(0, Math.floor((P - 0.75 * C) / 0.75));
  } else {
    // Find smallest integer X such that (P + X) / (C + X) >= 0.75
    requiredConsecutive = Math.max(0, Math.ceil((0.75 * C - P) / 0.25));
  }

  const explanation = `Attendance = (${P} / ${C}) × 100 = ${percentage.toFixed(2)}%\n` +
    (percentage >= 75
      ? `You can miss up to ${maxMissable} consecutive class(es) while maintaining ≥ 75%.`
      : `You need to attend at least ${requiredConsecutive} consecutive class(es) to reach 75%.`);

  return {
    conducted: C,
    attended: P,
    percentage,
    statusClass,
    badgeIcon,
    statusText,
    maxMissable,
    requiredConsecutive,
    explanation
  };
}

/**
 * Calculate multi-subject semester attendance
 * @param {Array<object>} subjects - Array of { name, conducted, attended }
 * @returns {object} Aggregate and per-subject breakdown
 */
function calculateSemesterAttendance(subjects = []) {
  let totalConducted = 0;
  let totalAttended = 0;
  let safeCount = 0;
  let warningCount = 0;
  let criticalCount = 0;

  const subjectResults = subjects.map((sub, idx) => {
    const name = sub.name?.trim() || `Subject ${idx + 1}`;
    const conducted = Number(sub.conducted) || 0;
    const attended = Number(sub.attended) || 0;
    const res = calculateAttendance(conducted, attended);

    totalConducted += conducted;
    totalAttended += attended;

    if (res.percentage >= 75) safeCount++;
    else if (res.percentage >= 65) warningCount++;
    else if (conducted > 0) criticalCount++;

    return {
      name,
      conducted,
      attended,
      ...res
    };
  });

  const overall = calculateAttendance(totalConducted, totalAttended);

  let explanation = `Overall Semester Attendance = (${totalAttended} / ${totalConducted}) × 100 = ${overall.percentage.toFixed(2)}%\n` +
    `Total Subjects Tracked: ${subjects.length}\n` +
    `Safe (≥75%): ${safeCount} | Warning (65-74%): ${warningCount} | Critical (<65%): ${criticalCount}\n\n` +
    (overall.percentage >= 75
      ? `Across all subjects combined, you can miss up to ${overall.maxMissable} class(es) while staying ≥ 75%.`
      : `Across all subjects combined, you need to attend ${overall.requiredConsecutive} consecutive class(es) to reach 75%.`);

  return {
    totalConducted,
    totalAttended,
    overallPercentage: overall.percentage,
    statusClass: overall.statusClass,
    badgeIcon: overall.badgeIcon,
    statusText: overall.statusText,
    maxMissable: overall.maxMissable,
    requiredConsecutive: overall.requiredConsecutive,
    safeCount,
    warningCount,
    criticalCount,
    subjects: subjectResults,
    explanation
  };
}

/**
 * Calculate attendance consistency index & badge
 * @param {number} percentage
 * @param {number} conducted
 * @returns {object} consistency level, score, badge, color, and description
 */
function evaluateConsistency(percentage, conducted) {
  if (!conducted || conducted <= 0) {
    return {
      score: 0,
      level: 'NO DATA',
      badge: '⚪',
      colorClass: 'info',
      description: 'Classes have not started yet.'
    };
  }

  const p = Number(percentage) || 0;
  if (p >= 90) {
    return {
      score: Math.min(100, Math.round(p)),
      level: 'EXCELLENT',
      badge: '🌟',
      colorClass: 'pass',
      description: 'Exceptional regularity and highest attendance buffer.'
    };
  } else if (p >= 80) {
    return {
      score: Math.round(p),
      level: 'CONSISTENT',
      badge: '🟢',
      colorClass: 'pass',
      description: 'Very steady attendance, comfortably above required minimum.'
    };
  } else if (p >= 75) {
    return {
      score: Math.round(p),
      level: 'STABLE',
      badge: '🔵',
      colorClass: 'pass',
      description: 'Meeting university minimum, keep up regularity.'
    };
  } else if (p >= 65) {
    return {
      score: Math.round(p),
      level: 'AT RISK',
      badge: '🟡',
      colorClass: 'warning',
      description: 'In danger zone! Immediate regular attendance required.'
    };
  } else {
    return {
      score: Math.round(p),
      level: 'CRITICAL',
      badge: '🔴',
      colorClass: 'fail',
      description: 'Severely short. Must attend consecutive classes to prevent detention.'
    };
  }
}

/**
 * Plan upcoming attendance targets for a single subject
 * @param {number} conducted
 * @param {number} attended
 * @param {number} upcoming
 * @param {number} targetPercentage (default 75)
 */
function planSubjectAttendance(conducted, attended, upcoming = 0, targetPercentage = 75) {
  const C = Number(conducted) || 0;
  const P = Number(attended) || 0;
  const U = Number(upcoming) || 0;
  const T = Number(targetPercentage) || 75;

  const currentMetrics = calculateAttendance(C, P);
  const totalFutureConducted = C + U;

  if (totalFutureConducted <= 0) {
    return {
      currentPercentage: 0,
      minAttend: 0,
      maxMiss: 0,
      projectedPercentage: 0,
      neededToSafeNow: 0,
      isCritical: false,
      statusClass: 'info'
    };
  }

  // Exact needed to be safe right now (from current C)
  const neededToSafeNow = currentMetrics.requiredConsecutive;
  const isCritical = currentMetrics.percentage < 65 && C > 0;
  const isBelowTarget = currentMetrics.percentage < T && C > 0;

  // Projection with upcoming U classes
  const requiredTotalAttended = Math.ceil(totalFutureConducted * (T / 100));
  const minAttend = Math.max(0, requiredTotalAttended - P);
  const maxMiss = Math.max(0, U - minAttend);
  const canMeetTarget = (P + U) >= requiredTotalAttended;

  const projectedPercentage = U > 0
    ? Math.round(((P + Math.min(U, minAttend)) / totalFutureConducted) * 10000) / 100
    : currentMetrics.percentage;

  return {
    conducted: C,
    attended: P,
    upcoming: U,
    target: T,
    totalFutureConducted,
    currentPercentage: currentMetrics.percentage,
    neededToSafeNow,
    isCritical,
    isBelowTarget,
    minAttend: Math.min(U, minAttend),
    maxMiss: canMeetTarget ? maxMiss : 0,
    canMeetTarget,
    projectedPercentage,
    statusClass: currentMetrics.statusClass,
    badgeIcon: currentMetrics.badgeIcon
  };
}

/**
 * Plan upcoming attendance targets for overall semester
 * @param {number} conducted
 * @param {number} attended
 * @param {number} upcoming
 * @param {number} targetPercentage (default 75)
 */
function planAttendance(conducted, attended, upcoming, targetPercentage = 75) {
  return planSubjectAttendance(conducted, attended, upcoming, targetPercentage);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { calculateAttendance, calculateSemesterAttendance, planAttendance, evaluateConsistency, planSubjectAttendance };
}




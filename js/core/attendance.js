/**
 * AC ADEXA - Core Attendance Calculator & Planner Functions
 */

/**
 * Calculate attendance metrics
 * @param {number} conducted - Total classes conducted
 * @param {number} attended - Total classes attended
 * @returns {object} Calculated attendance analysis
 */
function calculateAttendance(conducted, attended) {
  const C = Number(conducted) || 0;
  const P = Number(attended) || 0;

  if (C <= 0) {
    return {
      percentage: 0,
      status: 'INFO',
      statusClass: 'info',
      badgeIcon: '🔵',
      statusText: 'NO CLASSES CONDUCTED',
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
    // P >= 0.75*C + 0.75*M  =>  0.75*M <= P - 0.75*C  => M = floor((P - 0.75*C) / 0.75)
    maxMissable = Math.max(0, Math.floor((P - 0.75 * C) / 0.75));
  } else {
    // Find smallest integer X such that (P + X) / (C + X) >= 0.75
    // P + X >= 0.75*C + 0.75*X => 0.25*X >= 0.75*C - P => X = ceil((0.75*C - P) / 0.25)
    requiredConsecutive = Math.max(0, Math.ceil((0.75 * C - P) / 0.25));
  }

  const explanation = `Attendance = (${P} / ${C}) × 100 = ${percentage.toFixed(2)}%\n` +
    (percentage >= 75
      ? `You can miss up to ${maxMissable} consecutive class(es) while keeping attendance ≥ 75%.`
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
 * Plan upcoming attendance targets
 * @param {number} conducted
 * @param {number} attended
 * @param {number} upcoming
 * @param {number} targetPercentage (default 75)
 */
function planAttendance(conducted, attended, upcoming, targetPercentage = 75) {
  const C = Number(conducted) || 0;
  const P = Number(attended) || 0;
  const U = Number(upcoming) || 0;
  const T = Number(targetPercentage) || 75;

  const totalConducted = C + U;
  if (totalConducted <= 0) {
    return {
      minAttend: 0,
      maxMiss: 0,
      projectedPercentage: 0,
      explanation: 'No total classes.'
    };
  }

  const requiredTotalAttended = Math.ceil(totalConducted * (T / 100));
  const minAttend = Math.max(0, requiredTotalAttended - P);
  const maxMiss = Math.max(0, U - minAttend);

  const projectedPercentage = Math.round(((P + minAttend) / totalConducted) * 10000) / 100;

  const explanation = `Target: ${T}%\n` +
    `Total Conducted (Current + Upcoming): ${C} + ${U} = ${totalConducted}\n` +
    `Required Total Attended: ceil(${totalConducted} × ${T}%) = ${requiredTotalAttended}\n` +
    `Minimum Classes to Attend from Upcoming ${U}: ${minAttend}\n` +
    `Maximum Classes You Can Miss: ${maxMiss}\n` +
    `Projected Attendance: ${projectedPercentage.toFixed(2)}%`;

  return {
    totalConducted,
    minAttend,
    maxMiss,
    projectedPercentage,
    explanation
  };
}

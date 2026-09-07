/**
 * AC ADEXA - Insights & Performance Analytics Page Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  StorageManager.applyTheme(StorageManager.getTheme());
  renderNavbar('insights');
  initRegulationSelector(() => { renderInsights(); });
  ModalManager.initModalTriggers();
  initFeedbackModal();

  function renderInsights() {
    const data = StorageManager.loadData();
    const reg = StorageManager.getRegulation();

    const courses = data.courses || [];
    const semesters = data.semesters || [];

    const sgpaRes = calculateSGPA(courses, reg);
    const cgpaRes = calculateCGPA(semesters, reg);
    const attRes = calculateAttendance(data.attendance?.conducted || 0, data.attendance?.attended || 0);

    // 1. Render Grade Distribution Chart
    const barChartContainer = document.getElementById('insights-grade-chart');
    if (barChartContainer) {
      const regObj = getRegulation(reg);
      const gradeCounts = {};
      regObj.grading.forEach(g => { gradeCounts[g.grade] = 0; });
      sgpaRes.coursesProcessed.forEach(c => {
        gradeCounts[c.grade] = (gradeCounts[c.grade] || 0) + 1;
      });
      AcademicCharts.renderGradeBarChart(barChartContainer, gradeCounts);
    }

    // 2. Render Semester Trend Line Chart
    const trendChartContainer = document.getElementById('insights-trend-chart');
    const trendTextContainer = document.getElementById('insights-trend-text');

    if (semesters.length > 0) {
      const labels = semesters.map(s => `Sem ${s.semester}`);
      const points = semesters.map(s => Number(s.sgpa));
      AcademicCharts.renderTrendLineChart(trendChartContainer, labels, points, '#0d9488');

      if (trendTextContainer && semesters.length >= 2) {
        const firstSem = semesters[0].sgpa;
        const lastSem = semesters[semesters.length - 1].sgpa;
        const diff = Math.round((lastSem - firstSem) * 100) / 100;
        const text = diff >= 0
          ? `📈 Your SGPA increased by ${diff.toFixed(2)} since Semester 1 (${firstSem.toFixed(2)} → ${lastSem.toFixed(2)}).`
          : `📉 Your SGPA dropped by ${Math.abs(diff).toFixed(2)} since Semester 1 (${firstSem.toFixed(2)} → ${lastSem.toFixed(2)}).`;
        trendTextContainer.textContent = text;
      }
    } else if (trendChartContainer) {
      trendChartContainer.innerHTML = '<p class="text-center text-muted p-4">Add saved past semesters in CGPA page to view performance trends.</p>';
    }

    // 3. Rule-based Deterministic Insights
    const insightsContainer = document.getElementById('rule-insights-container');
    if (insightsContainer) {
      let cardsHTML = '';

      // Attendance Insight
      if (attRes.conducted > 0) {
        cardsHTML += `
          <div class="card mb-3 p-3">
            <div class="flex items-center gap-2 mb-1">
              <span class="status-badge ${attRes.statusClass}">${attRes.badgeIcon} Attendance</span>
            </div>
            <p class="text-sm font-semibold">
              ${attRes.percentage.toFixed(1)}% — ${attRes.percentage >= 75 ? 'Above the 75% university requirement.' : 'Below 75% mandatory threshold!'}
            </p>
            <p class="text-xs text-muted mt-1">${attRes.explanation}</p>
          </div>
        `;
      }

      // SGPA vs CGPA Insight
      if (sgpaRes.sgpa > 0 && cgpaRes.cgpa > 0) {
        const isHigher = sgpaRes.sgpa >= cgpaRes.cgpa;
        cardsHTML += `
          <div class="card mb-3 p-3">
            <div class="flex items-center gap-2 mb-1">
              <span class="status-badge ${isHigher ? 'pass' : 'warning'}">${isHigher ? '🟢' : '🟡'} SGPA vs CGPA</span>
            </div>
            <p class="text-sm font-semibold">
              SGPA (${sgpaRes.sgpa.toFixed(2)}) is ${isHigher ? 'higher than' : 'below'} your cumulative CGPA (${cgpaRes.cgpa.toFixed(2)}).
            </p>
            <p class="text-xs text-muted mt-1">
              ${isHigher ? 'Great job! This semester is boosting your overall CGPA.' : 'Focus on upcoming credits to elevate your cumulative CGPA.'}
            </p>
          </div>
        `;
      }

      // Target CGPA Insight
      if (cgpaRes.cgpa > 0 && data.targetCGPA) {
        cardsHTML += `
          <div class="card mb-3 p-3">
            <div class="flex items-center gap-2 mb-1">
              <span class="status-badge info">🔵 Target Goal</span>
            </div>
            <p class="text-sm font-semibold">
              Current CGPA: ${cgpaRes.cgpa.toFixed(2)} | Target CGPA: ${Number(data.targetCGPA).toFixed(2)}
            </p>
            <p class="text-xs text-muted mt-1">
              Use the CGPA Planner to compute exact SGPA targets for your remaining credits.
            </p>
          </div>
        `;
      }

      if (!cardsHTML) {
        cardsHTML = '<p class="text-center text-muted p-4">Complete your attendance, SGPA, or CGPA entries to generate rule-based insights.</p>';
      }

      insightsContainer.innerHTML = cardsHTML;
    }
  }

  renderInsights();
});

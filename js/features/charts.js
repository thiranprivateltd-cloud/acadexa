/**
 * AC ADEXA - Native SVG & Canvas Performance Charting Engine
 * Zero external dependencies. Works 100% offline with crisp vector charts.
 */

class AcademicCharts {
  /**
   * Render SVG Bar Chart for Grade Distribution
   * @param {HTMLElement|string} container - Element or selector
   * @param {object} gradeCounts - e.g. { 'O': 4, 'A+': 3, 'A': 2, 'B+': 1, 'RA': 0 }
   */
  static renderGradeBarChart(container, gradeCounts) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return;

    const keys = Object.keys(gradeCounts);
    const values = Object.values(gradeCounts);
    const maxVal = Math.max(...values, 1);

    const svgWidth = 500;
    const svgHeight = 220;
    const padding = 40;
    const chartWidth = svgWidth - padding * 2;
    const chartHeight = svgHeight - padding * 2;

    const barWidth = (chartWidth / keys.length) * 0.6;
    const gap = (chartWidth / keys.length) * 0.4;

    let barsHTML = '';
    keys.forEach((key, index) => {
      const val = gradeCounts[key] || 0;
      const barH = (val / maxVal) * chartHeight;
      const x = padding + index * (barWidth + gap) + gap / 2;
      const y = svgHeight - padding - barH;

      const barColor = key === 'RA' ? '#ef4444' : '#2563eb';

      barsHTML += `
        <rect x="${x}" y="${y}" width="${barWidth}" height="${barH}" rx="4" fill="${barColor}" opacity="0.85">
          <title>${key}: ${val} courses</title>
        </rect>
        <text x="${x + barWidth / 2}" y="${y - 8}" text-anchor="middle" font-size="12" font-weight="700" fill="var(--text-main)">${val}</text>
        <text x="${x + barWidth / 2}" y="${svgHeight - padding + 20}" text-anchor="middle" font-size="12" font-weight="600" fill="var(--text-muted)">${key}</text>
      `;
    });

    el.innerHTML = `
      <svg viewBox="0 0 ${svgWidth} ${svgHeight}" width="100%" height="100%" style="overflow: visible;">
        <line x1="${padding}" y1="${svgHeight - padding}" x2="${svgWidth - padding}" y2="${svgHeight - padding}" stroke="var(--border-color)" stroke-width="2" />
        ${barsHTML}
      </svg>
    `;
  }

  /**
   * Render SVG Line Chart for SGPA / CGPA Trends
   * @param {HTMLElement|string} container
   * @param {Array<string>} labels - e.g. ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4']
   * @param {Array<number>} dataPoints - e.g. [7.82, 8.14, 8.31, 8.63]
   * @param {string} lineColor - Hex code or CSS var
   */
  static renderTrendLineChart(container, labels, dataPoints, lineColor = '#0d9488') {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return;

    if (!dataPoints || dataPoints.length === 0) {
      el.innerHTML = '<p class="text-center text-muted py-4">No semester trend data available yet.</p>';
      return;
    }

    const svgWidth = 500;
    const svgHeight = 220;
    const padding = 45;
    const chartWidth = svgWidth - padding * 2;
    const chartHeight = svgHeight - padding * 2;

    const minVal = 0;
    const maxVal = 10;

    const coords = dataPoints.map((val, idx) => {
      const x = dataPoints.length === 1 ? svgWidth / 2 : padding + (idx / (dataPoints.length - 1)) * chartWidth;
      const y = svgHeight - padding - ((val - minVal) / (maxVal - minVal)) * chartHeight;
      return { x, y, val, label: labels[idx] || `Sem ${idx + 1}` };
    });

    let pathD = '';
    coords.forEach((pt, idx) => {
      if (idx === 0) pathD += `M ${pt.x} ${pt.y}`;
      else pathD += ` L ${pt.x} ${pt.y}`;
    });

    let pointsHTML = '';
    coords.forEach((pt) => {
      pointsHTML += `
        <circle cx="${pt.x}" cy="${pt.y}" r="6" fill="${lineColor}" stroke="var(--bg-surface)" stroke-width="2">
          <title>${pt.label}: ${pt.val}</title>
        </circle>
        <text x="${pt.x}" y="${pt.y - 12}" text-anchor="middle" font-size="11" font-weight="700" fill="var(--text-main)">${pt.val.toFixed(2)}</text>
        <text x="${pt.x}" y="${svgHeight - padding + 22}" text-anchor="middle" font-size="12" font-weight="600" fill="var(--text-muted)">${pt.label}</text>
      `;
    });

    el.innerHTML = `
      <svg viewBox="0 0 ${svgWidth} ${svgHeight}" width="100%" height="100%" style="overflow: visible;">
        <!-- Grid lines for 5 and 10 GP -->
        <line x1="${padding}" y1="${svgHeight - padding - (5 / 10) * chartHeight}" x2="${svgWidth - padding}" y2="${svgHeight - padding - (5 / 10) * chartHeight}" stroke="var(--border-color)" stroke-dasharray="4 4" stroke-width="1" />
        <text x="${padding - 8}" y="${svgHeight - padding - (5 / 10) * chartHeight + 4}" text-anchor="end" font-size="10" fill="var(--text-subtle)">5.0</text>
        
        <line x1="${padding}" y1="${svgHeight - padding}" x2="${svgWidth - padding}" y2="${svgHeight - padding}" stroke="var(--border-color)" stroke-width="2" />
        
        <path d="${pathD}" fill="none" stroke="${lineColor}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />
        ${pointsHTML}
      </svg>
    `;
  }
}

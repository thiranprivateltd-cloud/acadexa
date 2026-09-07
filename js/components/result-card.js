/**
 * AC ADEXA - Result Card & Transparent Math Explanation Component
 */

function renderResultCard(params) {
  const { title, value, unit, statusClass, badgeIcon, statusText, explanation, actionsHTML } = params;

  const uniqueId = 'calc-exp-' + Math.random().toString(36).substr(2, 9);

  return `
    <div class="result-hero card">
      <div class="result-hero-label">${title}</div>
      <div class="result-hero-value">${value} ${unit ? `<span style="font-size: 1.5rem;">${unit}</span>` : ''}</div>
      ${statusText ? `
        <div class="mt-2">
          <span class="status-badge ${statusClass || 'info'}">${badgeIcon || '🔵'} ${statusText}</span>
        </div>
      ` : ''}

      ${explanation ? `
        <div class="calc-explanation">
          <button type="button" class="calc-toggle" onclick="document.getElementById('${uniqueId}').classList.toggle('open')">
            <span>📐 How is this calculated?</span>
            <span style="font-size: 0.75rem;">▼</span>
          </button>
          <div id="${uniqueId}" class="calc-details text-left mt-2">
${explanation}
          </div>
        </div>
      ` : ''}

      ${actionsHTML ? `
        <div class="mt-4 flex gap-2 justify-center flex-wrap">
          ${actionsHTML}
        </div>
      ` : ''}
    </div>
  `;
}

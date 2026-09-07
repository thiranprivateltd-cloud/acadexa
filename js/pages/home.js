/**
 * AC ADEXA - Homepage Controller (js/pages/home.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Storage & Theme
  const currentTheme = StorageManager.getTheme();
  StorageManager.applyTheme(currentTheme);

  // Render Navigation Header & Mobile Bottom Bar
  renderNavbar('home');
  initRegulationSelector();
  ModalManager.initModalTriggers();
  initFeedbackModal();

  // Load Saved Academic Progress
  const data = StorageManager.loadData();
  const reg = data.regulation || 'R25';

  const sgpaResult = calculateSGPA(data.courses || [], reg);
  const cgpaResult = calculateCGPA(data.semesters || [], reg);
  const attResult = calculateAttendance(data.attendance?.conducted || 0, data.attendance?.attended || 0);

  const savedCardContainer = document.getElementById('saved-progress-container');
  if (savedCardContainer) {
    if ((data.courses && data.courses.length > 0) || (data.semesters && data.semesters.length > 0) || data.attendance?.conducted > 0) {
      savedCardContainer.innerHTML = `
        <div class="card bg-surface mb-6">
          <div class="card-header">
            <h2 class="card-title">👋 Welcome Back</h2>
            <span class="status-badge info">🔵 ${reg}</span>
          </div>
          <div class="grid grid-cols-3 gap-4 text-center my-3">
            <div>
              <div class="text-xs text-muted font-semibold uppercase">SGPA</div>
              <div class="text-2xl font-bold" style="color: var(--primary-600);">${sgpaResult.sgpa > 0 ? sgpaResult.sgpa.toFixed(2) : '--'}</div>
            </div>
            <div>
              <div class="text-xs text-muted font-semibold uppercase">CGPA</div>
              <div class="text-2xl font-bold" style="color: var(--teal-600);">${cgpaResult.cgpa > 0 ? cgpaResult.cgpa.toFixed(2) : '--'}</div>
            </div>
            <div>
              <div class="text-xs text-muted font-semibold uppercase">Attendance</div>
              <div class="text-2xl font-bold">${attResult.conducted > 0 ? attResult.percentage.toFixed(1) + '%' : '--'}</div>
            </div>
          </div>
          <div class="text-xs text-muted text-center mb-3">
            Last updated: ${data.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : 'Just now'}
          </div>
          <div class="flex gap-2">
            <a href="sgpa.html" class="btn btn-primary btn-block">Continue Progress</a>
            <button id="start-fresh-btn" class="btn btn-secondary btn-block">Start Fresh</button>
          </div>
        </div>
      `;

      const freshBtn = document.getElementById('start-fresh-btn');
      if (freshBtn) {
        freshBtn.addEventListener('click', () => {
          if (confirm('Are you sure you want to clear current active session data? Saved past semesters will remain intact.')) {
            data.courses = [];
            data.attendance = { conducted: 0, attended: 0 };
            StorageManager.saveData(data);
            window.location.reload();
          }
        });
      }
    } else {
      savedCardContainer.innerHTML = `
        <div class="card text-center p-6 mb-6">
          <h3 class="text-lg font-bold mb-2">No Saved Academic Progress Yet</h3>
          <p class="text-sm text-muted mb-4">Start by calculating your SGPA, CGPA, or Attendance.</p>
          <a href="sgpa.html" class="btn btn-primary">Start New Calculation</a>
        </div>
      `;
    }
  }
});

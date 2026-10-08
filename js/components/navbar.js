/**
 * AC ADEXA - Unified Header & Responsive Mobile Bottom Navigation Component
 */

function renderNavbar(activePageKey = 'home') {
  const navHeaderEl = document.getElementById('navbar-container');
  const mobileNavEl = document.getElementById('mobile-nav-bar');

  const reg = StorageManager.getRegulation();

  if (navHeaderEl) {
    navHeaderEl.innerHTML = `
      <a href="index.html" class="brand-link">
        <img src="assets/logo.png" alt="AC ADEXA Logo" style="height: 42px; width: auto; object-fit: contain;" />
      </a>
      <ul class="nav-links">
        <li><a href="index.html" class="nav-link ${activePageKey === 'home' ? 'active' : ''}">Home</a></li>
        <li><a href="attendance.html" class="nav-link ${activePageKey === 'attendance' ? 'active' : ''}">Attendance</a></li>
        <li><a href="sgpa.html" class="nav-link ${activePageKey === 'sgpa' ? 'active' : ''}">SGPA</a></li>
        <li><a href="cgpa.html" class="nav-link ${activePageKey === 'cgpa' ? 'active' : ''}">CGPA</a></li>
        <li><a href="marks.html" class="nav-link ${activePageKey === 'marks' ? 'active' : ''}">Marks</a></li>
        <li><a href="what-if.html" class="nav-link ${activePageKey === 'what-if' ? 'active' : ''}">What-If</a></li>
        <li><a href="insights.html" class="nav-link ${activePageKey === 'insights' ? 'active' : ''}">Insights</a></li>
        <li><a href="reports.html" class="nav-link ${activePageKey === 'reports' ? 'active' : ''}">Reports</a></li>
        <li><a href="settings.html" class="nav-link ${activePageKey === 'settings' ? 'active' : ''}">Settings</a></li>
      </ul>
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <button id="reg-selector-btn" class="reg-selector-pill" title="Click to switch regulation">
          <span>${reg}</span>
          <span style="font-size: 0.7rem;">▼</span>
        </button>
      </div>
    `;
  }

  if (mobileNavEl) {
    mobileNavEl.innerHTML = `
      <a href="index.html" class="mobile-nav-item ${activePageKey === 'home' ? 'active' : ''}">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
        <span>Home</span>
      </a>
      <a href="sgpa.html" class="mobile-nav-item ${['sgpa', 'cgpa', 'attendance', 'marks'].includes(activePageKey) ? 'active' : ''}">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
        <span>Calculate</span>
      </a>
      <a href="insights.html" class="mobile-nav-item ${activePageKey === 'insights' ? 'active' : ''}">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
        <span>Insights</span>
      </a>
      <a href="settings.html" class="mobile-nav-item ${['settings', 'reports', 'regulation'].includes(activePageKey) ? 'active' : ''}">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
        <span>More</span>
      </a>
    `;
  }
}

// Auto-register service worker across all pages cleanly
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(reg => {
        reg.update();
      })
      .catch(err => console.debug('SW reg info:', err));
  });
}


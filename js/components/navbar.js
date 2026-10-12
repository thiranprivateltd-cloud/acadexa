/**
 * ACADEXA - Shared Application Shell (Sidebar + Topbar + Mobile Navigation)
 * Visual Direction: Direction C: Graphite & Emerald
 */

function renderNavbar(activePageKey = 'home') {
  const sidebarContainer = document.getElementById('sidebar-container');
  const topbarContainer = document.getElementById('topbar-container');
  const mobileNavEl = document.getElementById('mobile-nav-bar');

  const reg = typeof StorageManager !== 'undefined' ? StorageManager.getRegulation() : 'R25';

  const navItems = [
    { key: 'home', label: 'Dashboard', href: 'index.html', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>', group: 'core' },
    { key: 'attendance', label: 'Attendance', href: 'attendance.html', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>', group: 'core' },
    { key: 'sgpa', label: 'SGPA Calculator', href: 'sgpa.html', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>', group: 'calculators' },
    { key: 'cgpa', label: 'CGPA & Planner', href: 'cgpa.html', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>', group: 'calculators' },
    { key: 'marks', label: 'Marks & SEE', href: 'marks.html', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>', group: 'calculators' },
    { key: 'timetable', label: 'Timetable', href: 'timetable.html', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>', group: 'academic' },
    { key: 'what-if', label: 'What-If Simulator', href: 'what-if.html', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>', group: 'academic' },
    { key: 'insights', label: 'Insights & Trends', href: 'insights.html', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>', group: 'analysis' },
    { key: 'reports', label: 'Semester Reports', href: 'reports.html', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>', group: 'analysis' },
    { key: 'regulation', label: 'Regulations', href: 'regulation.html', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>', group: 'config' },
    { key: 'settings', label: 'Settings', href: 'settings.html', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>', group: 'config' }
  ];

  const pageTitleMap = {
    'home': 'Academic Dashboard',
    'attendance': 'Attendance Calculator & Planner',
    'sgpa': 'SGPA Calculator',
    'cgpa': 'CGPA Calculator & Target Planner',
    'marks': 'CIA & SEE Marks Calculator',
    'timetable': 'Official Timetable',
    'what-if': 'What-If Academic Simulator',
    'insights': 'Academic Insights & Trends',
    'reports': 'Semester Reports & Export',
    'regulation': 'Regulation Information',
    'settings': 'Settings & Data Backup'
  };

  const currentPageTitle = pageTitleMap[activePageKey] || 'Academic Productivity';

  // Render Sidebar
  if (sidebarContainer) {
    sidebarContainer.innerHTML = `
      <aside class="app-sidebar" id="app-sidebar">
        <div class="sidebar-header">
          <a href="index.html" class="sidebar-brand">
            <div class="sidebar-brand-mark">A</div>
            <div class="sidebar-brand-title">
              <span class="sidebar-brand-name">ACADEXA</span>
              <span class="sidebar-brand-tagline">Academic Suite</span>
            </div>
          </a>
        </div>

        <nav class="sidebar-nav">
          <div class="sidebar-nav-group-label">Overview</div>
          ${navItems.filter(i => i.group === 'core').map(item => `
            <a href="${item.href}" class="sidebar-nav-item ${activePageKey === item.key ? 'active' : ''}">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">${item.icon}</svg>
              <span>${item.label}</span>
            </a>
          `).join('')}

          <div class="sidebar-nav-group-label">Grading & Planning</div>
          ${navItems.filter(i => i.group === 'calculators' || i.group === 'academic').map(item => `
            <a href="${item.href}" class="sidebar-nav-item ${activePageKey === item.key ? 'active' : ''}">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">${item.icon}</svg>
              <span>${item.label}</span>
            </a>
          `).join('')}

          <div class="sidebar-nav-group-label">Insights & System</div>
          ${navItems.filter(i => i.group === 'analysis' || i.group === 'config').map(item => `
            <a href="${item.href}" class="sidebar-nav-item ${activePageKey === item.key ? 'active' : ''}">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">${item.icon}</svg>
              <span>${item.label}</span>
            </a>
          `).join('')}
        </nav>

        <div class="sidebar-footer">
          <div class="flex items-center justify-between text-xs text-muted">
            <span>Offline-Ready</span>
            <span class="status-badge pass" style="padding: 0.15rem 0.4rem; font-size: 0.7rem;">Active</span>
          </div>
        </div>
      </aside>
      <div class="sidebar-backdrop" id="sidebar-backdrop"></div>
    `;
  }

  // Render Topbar
  if (topbarContainer) {
    topbarContainer.innerHTML = `
      <header class="app-topbar">
        <div class="topbar-left">
          <button class="mobile-menu-toggle" id="mobile-sidebar-toggle" aria-label="Toggle navigation drawer">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div class="topbar-context">
            <nav class="topbar-breadcrumb" aria-label="Breadcrumb">
              <a href="index.html">Acadexa</a>
              <span class="topbar-breadcrumb-separator">/</span>
              <span class="topbar-current-page">${currentPageTitle}</span>
            </nav>
          </div>
        </div>

        <div class="topbar-right">
          <button id="reg-selector-btn" class="reg-selector-pill" title="Click to switch academic regulation">
            <span style="color: var(--emerald-primary); font-family: var(--font-mono);">${reg}</span>
            <span style="font-size: 0.65rem; color: var(--text-muted);">▼</span>
          </button>
        </div>
      </header>
    `;
  }

  // Render Mobile Bottom Bar
  if (mobileNavEl) {
    mobileNavEl.innerHTML = `
      <a href="index.html" class="mobile-nav-item ${activePageKey === 'home' ? 'active' : ''}">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
        <span>Home</span>
      </a>
      <a href="attendance.html" class="mobile-nav-item ${activePageKey === 'attendance' ? 'active' : ''}">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
        <span>Attendance</span>
      </a>
      <a href="sgpa.html" class="mobile-nav-item ${['sgpa', 'cgpa', 'marks'].includes(activePageKey) ? 'active' : ''}">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
        <span>Grades</span>
      </a>
      <a href="timetable.html" class="mobile-nav-item ${activePageKey === 'timetable' ? 'active' : ''}">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
        <span>Timetable</span>
      </a>
      <a href="settings.html" class="mobile-nav-item ${['settings', 'reports', 'insights', 'what-if', 'regulation'].includes(activePageKey) ? 'active' : ''}">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M4 6h16M4 12h16M4 18h16"/></svg>
        <span>More</span>
      </a>
    `;
  }

  // Bind Mobile Drawer toggle events
  const mobileToggle = document.getElementById('mobile-sidebar-toggle');
  const sidebarEl = document.getElementById('app-sidebar');
  const backdropEl = document.getElementById('sidebar-backdrop');

  if (mobileToggle && sidebarEl && backdropEl) {
    mobileToggle.addEventListener('click', () => {
      sidebarEl.classList.toggle('open');
      backdropEl.classList.toggle('active');
    });

    backdropEl.addEventListener('click', () => {
      sidebarEl.classList.remove('open');
      backdropEl.classList.remove('active');
    });
  }
}

// Auto-register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(reg => {
        reg.update();
      })
      .catch(err => console.debug('SW reg info:', err));
  });
}

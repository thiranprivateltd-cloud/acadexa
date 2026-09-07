/**
 * AC ADEXA - Static-site Compatible Issue & Typo Reporter
 */

function initFeedbackModal() {
  // Inject floating FAB button
  if (!document.getElementById('fab-issue-btn')) {
    const fabBtn = document.createElement('button');
    fabBtn.id = 'fab-issue-btn';
    fabBtn.className = 'fab-issue';
    fabBtn.innerHTML = `💬 <span>Report an Issue</span>`;
    document.body.appendChild(fabBtn);
  }

  // Inject modal markup
  if (!document.getElementById('feedback-modal')) {
    const modalDiv = document.createElement('div');
    modalDiv.id = 'feedback-modal';
    modalDiv.className = 'modal-backdrop';
    modalDiv.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">Report an Issue or Typo</h3>
          <button class="modal-close" data-close-modal>&times;</button>
        </div>
        <form id="feedback-form">
          <div class="modal-body">
            <p class="text-sm text-muted mb-4">
              Found a calculation error, regulation issue, or typo? Help us improve AC ADEXA.
            </p>

            <div class="form-group">
              <label class="form-label">Issue Type</label>
              <select id="feedback-type" class="form-control" required>
                <option value="Calculation">Calculation Error</option>
                <option value="Regulation / Formula">Regulation / Formula Issue</option>
                <option value="Typo">Typo / Wording</option>
                <option value="UI / Design">UI / Design Layout</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea id="feedback-desc" class="form-control" rows="4" placeholder="Please describe what went wrong or what you observed..." required></textarea>
            </div>

            <div class="card p-3 bg-muted text-xs text-muted mb-3">
              <div><strong>Page:</strong> <span id="fb-meta-page"></span></div>
              <div><strong>Regulation:</strong> <span id="fb-meta-reg"></span></div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-close-modal>Cancel</button>
            <button type="submit" class="btn btn-primary">Submit Report</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modalDiv);
  }

  // Click handler for FAB
  document.addEventListener('click', (e) => {
    if (e.target && e.target.closest('#fab-issue-btn')) {
      const pageEl = document.getElementById('fb-meta-page');
      const regEl = document.getElementById('fb-meta-reg');
      if (pageEl) pageEl.textContent = window.location.pathname.split('/').pop() || 'index.html';
      if (regEl) regEl.textContent = StorageManager.getRegulation();

      ModalManager.openModal('feedback-modal');
    }
  });

  // Handle Submit
  const form = document.getElementById('feedback-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const type = document.getElementById('feedback-type').value;
      const desc = document.getElementById('feedback-desc').value;
      const page = window.location.pathname.split('/').pop() || 'index.html';
      const reg = StorageManager.getRegulation();

      const subject = encodeURIComponent(`[AC ADEXA Issue] ${type} on ${page} (${reg})`);
      const body = encodeURIComponent(
        `Issue Type: ${type}\n` +
        `Page: ${page}\n` +
        `Regulation: ${reg}\n\n` +
        `Description:\n${desc}\n\n` +
        `-- Sent via AC ADEXA Feedback Tool`
      );

      // Open mailto link
      window.location.href = `mailto:feedback@acadexa.app?subject=${subject}&body=${body}`;

      ModalManager.closeModal('feedback-modal');
      alert('Thank you! Your feedback report has been prepared.');
    });
  }
}

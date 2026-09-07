/**
 * AC ADEXA - Regulation Switcher Component with Safety Confirmation Modal
 */

function initRegulationSelector(onRegulationChangedCallback = null) {
  const currentReg = StorageManager.getRegulation();

  // Create modal element if not present in DOM
  if (!document.getElementById('reg-switch-modal')) {
    const modalDiv = document.createElement('div');
    modalDiv.id = 'reg-switch-modal';
    modalDiv.className = 'modal-backdrop';
    modalDiv.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">Switch Academic Regulation</h3>
          <button class="modal-close" data-close-modal>&times;</button>
        </div>
        <div class="modal-body">
          <p class="mb-4">
            ⚠️ <strong>Warning:</strong> Changing regulation will update grading schemas, assessment weightages, and pass thresholds.
          </p>
          <div class="form-group mb-4">
            <label class="form-label">Select Regulation</label>
            <select id="reg-switch-select" class="form-control">
              <option value="R25">Regulation 25 (R25)</option>
              <option value="R21">Regulation 21 (R21)</option>
            </select>
          </div>
          <p class="text-sm text-muted">
            Incompatible grading fields will be safely converted and recalculated according to the new regulation rules.
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" data-close-modal>Cancel</button>
          <button id="confirm-reg-switch-btn" class="btn btn-primary">Continue & Switch</button>
        </div>
      </div>
    `;
    document.body.appendChild(modalDiv);
  }

  // Bind click listener on navbar button
  document.addEventListener('click', (e) => {
    if (e.target && e.target.closest('#reg-selector-btn')) {
      const selectEl = document.getElementById('reg-switch-select');
      if (selectEl) selectEl.value = StorageManager.getRegulation();
      ModalManager.openModal('reg-switch-modal');
    }
  });

  const confirmBtn = document.getElementById('confirm-reg-switch-btn');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      const selectEl = document.getElementById('reg-switch-select');
      const targetReg = selectEl ? selectEl.value : 'R25';

      StorageManager.setRegulation(targetReg);
      ModalManager.closeModal('reg-switch-modal');

      // Update button pill label
      const pillLabel = document.querySelector('#reg-selector-btn span:first-child');
      if (pillLabel) pillLabel.textContent = targetReg;

      if (typeof onRegulationChangedCallback === 'function') {
        onRegulationChangedCallback(targetReg);
      } else {
        window.location.reload();
      }
    });
  }
}

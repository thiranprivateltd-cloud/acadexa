/**
 * AC ADEXA - Settings & Data Management Page Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  StorageManager.applyTheme(StorageManager.getTheme());
  renderNavbar('settings');
  initRegulationSelector((newReg) => {
    const regSelect = document.getElementById('setting-default-reg');
    if (regSelect) regSelect.value = newReg;
  });
  ModalManager.initModalTriggers();
  initFeedbackModal();

  const data = StorageManager.loadData();

  // Populate Theme Radios
  const themeRadios = document.querySelectorAll('input[name="theme"]');
  const currentTheme = StorageManager.getTheme();
  themeRadios.forEach(radio => {
    if (radio.value === currentTheme) radio.checked = true;
    radio.addEventListener('change', (e) => {
      StorageManager.setTheme(e.target.value);
    });
  });

  // Default Regulation Select
  const regSelect = document.getElementById('setting-default-reg');
  if (regSelect) {
    regSelect.value = StorageManager.getRegulation();
    regSelect.addEventListener('change', (e) => {
      StorageManager.setRegulation(e.target.value);
      alert(`Default regulation updated to ${e.target.value}`);
    });
  }

  // Student Profile Inputs
  const nameInput = document.getElementById('setting-student-name');
  const regNumInput = document.getElementById('setting-register-num');
  const saveProfileBtn = document.getElementById('save-profile-btn');

  if (nameInput) nameInput.value = data.student?.name || '';
  if (regNumInput) regNumInput.value = data.student?.registerNumber || '';

  if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', () => {
      data.student = {
        name: nameInput ? nameInput.value.trim() : '',
        registerNumber: regNumInput ? regNumInput.value.trim() : ''
      };
      StorageManager.saveData(data);
      alert('Student profile details saved!');
    });
  }

  // Export Data
  const exportBtn = document.getElementById('export-data-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      StorageManager.exportJSON();
    });
  }

  // Import Data
  const importInput = document.getElementById('import-file-input');
  if (importInput) {
    importInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = StorageManager.importJSON(event.target.result);
        if (result.success) {
          alert('Academic backup restored successfully!');
          window.location.reload();
        } else {
          alert(`❌ ${result.error || 'Invalid AC ADEXA backup file.'}`);
        }
      };
      reader.readAsText(file);
    });
  }

  // Clear All Data
  const clearBtn = document.getElementById('confirm-clear-everything-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      StorageManager.clearAllData();
      alert('All local AC ADEXA data has been permanently cleared.');
      window.location.href = 'index.html';
    });
  }
});

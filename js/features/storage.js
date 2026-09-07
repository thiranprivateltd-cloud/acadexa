/**
 * AC ADEXA - LocalStorage Data Manager
 * Handles local persistence, JSON backup import/export, regulation switching, and schema migration.
 */

const STORAGE_KEY = 'AC_ADEXA_APP_DATA';
const THEME_KEY = 'AC_ADEXA_THEME';

const DEFAULT_APP_DATA = {
  regulation: 'R25',
  student: {
    name: '',
    registerNumber: ''
  },
  currentSemester: 1,
  attendance: {
    conducted: 0,
    attended: 0
  },
  courses: [], // Array of current active semester courses: { name, type, credits, grade, gradePoint }
  semesters: [], // Array of saved past semesters: { semester: 1, sgpa: 8.12, credits: 24, courses: [] }
  whatIf: {
    courses: []
  },
  targetCGPA: 8.5,
  lastUpdated: null
};

class StorageManager {
  static loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_APP_DATA };
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_APP_DATA, ...parsed };
    } catch (e) {
      console.error('Failed to load AC ADEXA data from localStorage', e);
      return { ...DEFAULT_APP_DATA };
    }
  }

  static saveData(data) {
    try {
      data.lastUpdated = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Failed to save AC ADEXA data', e);
      return false;
    }
  }

  static getRegulation() {
    const data = this.loadData();
    return data.regulation || 'R25';
  }

  static setRegulation(newRegulation) {
    const data = this.loadData();
    data.regulation = newRegulation;
    // Reset grade points on courses according to new regulation
    if (data.courses) {
      data.courses.forEach(c => {
        if (c.grade) {
          c.gradePoint = getGradePointForGrade(c.grade, newRegulation);
        }
      });
    }
    this.saveData(data);
  }

  static exportJSON() {
    const data = this.loadData();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ac-adexa-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  static importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') return { success: false, error: 'Invalid file format' };
      if (!parsed.regulation && !parsed.semesters && !parsed.courses) {
        return { success: false, error: 'Invalid AC ADEXA backup file schema' };
      }
      const merged = { ...DEFAULT_APP_DATA, ...parsed };
      this.saveData(merged);
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Malformed JSON file' };
    }
  }

  static clearAllData() {
    localStorage.removeItem(STORAGE_KEY);
  }

  static getTheme() {
    return localStorage.getItem(THEME_KEY) || 'system';
  }

  static setTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
    this.applyTheme(theme);
  }

  static applyTheme(theme) {
    let effective = theme;
    if (theme === 'system') {
      effective = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', effective);
  }
}

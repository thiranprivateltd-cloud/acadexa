/**
 * AC ADEXA - Semester PDF Report Generator
 * Builds multi-page structured academic reports for download or printing.
 */

class ReportGenerator {
  /**
   * Generate clean multi-page semester report HTML for printable PDF
   * @param {object} appData - Full application state from LocalStorage
   */
  static generateReportHTML(appData) {
    const student = appData.student || {};
    const reg = appData.regulation || 'R25';
    const courses = appData.courses || [];
    const semesters = appData.semesters || [];

    const sgpaResult = calculateSGPA(courses, reg);
    const cgpaResult = calculateCGPA(semesters, reg);
    const attResult = calculateAttendance(appData.attendance?.conducted || 0, appData.attendance?.attended || 0);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>AC ADEXA Semester Report</title>
        <style>
          @page { size: A4; margin: 20mm; }
          body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #0f172a; line-height: 1.5; padding: 20px; }
          .report-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 25px; }
          .brand-title { font-size: 26px; font-weight: 900; color: #0f172a; margin: 0; }
          .brand-sub { font-size: 12px; font-weight: 700; color: #0d9488; letter-spacing: 1px; }
          .section-title { font-size: 18px; font-weight: 700; color: #1e3a8a; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; margin-top: 25px; margin-bottom: 15px; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e2e8f0; }
          .meta-item { font-size: 13px; }
          .meta-item strong { color: #475569; }
          .metric-cards { display: flex; gap: 15px; margin-bottom: 25px; }
          .metric-card { flex: 1; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 15px; text-align: center; }
          .metric-value { font-size: 32px; font-weight: 800; color: #1d4ed8; }
          .metric-label { font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 13px; }
          th, td { border: 1px solid #cbd5e1; padding: 10px 12px; text-align: left; }
          th { background-color: #f1f5f9; font-weight: 700; color: #1e293b; }
          .page-break { page-break-after: always; }
          .footer-note { font-size: 10px; color: #64748b; text-align: center; border-top: 1px stroke #e2e8f0; padding-top: 15px; margin-top: 40px; }
          .badge-pass { color: #15803d; font-weight: 700; }
          .badge-fail { color: #b91c1c; font-weight: 700; }
        </style>
      </head>
      <body>
        <!-- PAGE 1 — ACADEMIC SUMMARY -->
        <div class="report-header">
          <div>
            <h1 class="brand-title">AC ADEXA</h1>
            <div class="brand-sub">YOUR ACADEMIC COMPANION</div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: 700; font-size: 14px;">SEMESTER PERFORMANCE REPORT</div>
            <div style="font-size: 12px; color: #64748b;">${new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <div class="meta-grid">
          <div class="meta-item"><strong>Student Name:</strong> ${student.name || 'N/A'}</div>
          <div class="meta-item"><strong>Register Number:</strong> ${student.registerNumber || 'N/A'}</div>
          <div class="meta-item"><strong>Regulation:</strong> ${reg}</div>
          <div class="meta-item"><strong>Semester:</strong> ${appData.currentSemester || 1}</div>
        </div>

        <div class="metric-cards">
          <div class="metric-card">
            <div class="metric-label">Semester SGPA</div>
            <div class="metric-value">${sgpaResult.sgpa.toFixed(2)}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Cumulative CGPA</div>
            <div class="metric-value">${cgpaResult.cgpa ? cgpaResult.cgpa.toFixed(2) : 'N/A'}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Attendance</div>
            <div class="metric-value">${attResult.percentage.toFixed(1)}%</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Total Credits</div>
            <div class="metric-value">${sgpaResult.totalCredits}</div>
          </div>
        </div>

        <!-- PAGE 2 — COURSE PERFORMANCE -->
        <h2 class="section-title">Course Performance Breakdown</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Course Name</th>
              <th>Credits</th>
              <th>Grade</th>
              <th>Grade Point</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${courses.length ? courses.map((c, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${c.name || 'Course ' + (i + 1)}</td>
                <td>${c.credits}</td>
                <td><strong>${c.grade || 'N/A'}</strong></td>
                <td>${c.gradePoint !== undefined ? c.gradePoint : getGradePointForGrade(c.grade, reg)}</td>
                <td class="${c.grade === 'RA' ? 'badge-fail' : 'badge-pass'}">${c.grade === 'RA' ? 'FAIL' : 'PASS'}</td>
              </tr>
            `).join('') : '<tr><td colspan="6" style="text-align:center;">No courses entered for this semester.</td></tr>'}
          </tbody>
        </table>

        <!-- PAGE 3 — ACADEMIC HISTORY & TRENDS -->
        ${semesters.length ? `
          <h2 class="section-title">Semester History</h2>
          <table>
            <thead>
              <tr>
                <th>Semester</th>
                <th>SGPA</th>
                <th>Credits</th>
                <th>Equivalent % ${reg === 'R25' ? '(CGPA×10)' : ''}</th>
              </tr>
            </thead>
            <tbody>
              ${semesters.map(s => `
                <tr>
                  <td>Semester ${s.semester}</td>
                  <td>${Number(s.sgpa).toFixed(2)}</td>
                  <td>${s.credits}</td>
                  <td>${reg === 'R25' ? (Number(s.sgpa) * 10).toFixed(2) + '%' : 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}

        <div class="footer-note">
          Generated by AC ADEXA — Your Academic Companion.<br/>
          This is an informational calculation report and does not constitute an official university transcript.
        </div>
      </body>
      </html>
    `;
  }

  static printReport(appData) {
    const html = this.generateReportHTML(appData);
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
    }, 250);
  }
}

/**
 * AC ADEXA - Centralized Regulation Engine Data & Helpers
 * All academic rules, grading schemas, assessment structures, and boundary checks for R21 & R25.
 */

const REGULATIONS = {
  R21: {
    id: 'R21',
    name: 'Regulation 21',
    description: 'R21 Grading System & 40-CIA / 60-SEE Assessment Scheme',
    hasPercentageEquivalence: false,
    grading: [
      { grade: 'S', min: 90, max: 100, point: 10, label: 'Outstanding / Pass' },
      { grade: 'A', min: 80, max: 89, point: 9, label: 'Excellent / Pass' },
      { grade: 'B', min: 70, max: 79, point: 8, label: 'Very Good / Pass' },
      { grade: 'C', min: 60, max: 69, point: 7, label: 'Good / Pass' },
      { grade: 'D', min: 50, max: 59, point: 6, label: 'Satisfactory / Pass' },
      { grade: 'RA', min: 0, max: 49, point: 0, label: 'Reappear / Fail' }
    ],
    pass: {
      minSee: 0, // No separate minimum SEE rule provided for R21, relies on overall final mark >= 50
      minTotal: 50
    },
    courseTypes: {
      theory: {
        id: 'theory',
        name: 'Fully Theory',
        ciaMax: 40,
        seeMax: 60,
        ciaComponents: [
          { id: 't1', label: 'Test 1', max: 30, type: 'test' },
          { id: 't2', label: 'Test 2', max: 30, type: 'test' },
          { id: 't3', label: 'Test 3', max: 30, type: 'test' },
          { id: 'assignment', label: 'Assignment', max: 5, type: 'direct' },
          { id: 'attendance', label: 'Attendance', max: 5, type: 'direct' }
        ],
        seeComponents: [
          { id: 'see', label: 'End Semester Exam (Written)', max: 60 }
        ]
      },
      laboratory: {
        id: 'laboratory',
        name: 'Fully Lab',
        ciaMax: 40,
        seeMax: 60,
        ciaComponents: [
          { id: 'modelLab', label: 'Model Lab', max: 25, type: 'direct' },
          { id: 'recordObsExpAtt', label: 'Record + Observation + Experiment + Attendance', max: 15, type: 'direct' }
        ],
        seeComponents: [
          { id: 'see', label: 'End Semester Practical Exam', max: 60 }
        ]
      },
      integrated: {
        id: 'integrated',
        name: 'Integrated Course (Theory + Lab)',
        ciaMax: 40,
        seeMax: 60,
        ciaComponents: [
          { id: 'mid1', label: 'Mid Test 1', max: 20, type: 'mid' },
          { id: 'mid2', label: 'Mid Test 2', max: 20, type: 'mid' },
          { id: 'modelLab', label: 'Model Lab', max: 20, type: 'direct' },
          { id: 'assignment', label: 'Assignment', max: 5, type: 'direct' },
          { id: 'attendance', label: 'Attendance', max: 5, type: 'direct' }
        ],
        seeComponents: [
          { id: 'see', label: 'End Semester Exam', max: 60 }
        ]
      }
    }
  },

  R25: {
    id: 'R25',
    name: 'Regulation 25',
    description: 'R25 Grading System (O-Grade) & 50-CIA / 50-SEE Assessment Scheme',
    hasPercentageEquivalence: true,
    percentageMultiplier: 10, // Equivalent Percentage = CGPA * 10
    grading: [
      { grade: 'O', min: 91, max: 100, point: 10, label: 'Outstanding / Pass' },
      { grade: 'A+', min: 81, max: 90, point: 9, label: 'Excellent / Pass' },
      { grade: 'A', min: 71, max: 80, point: 8, label: 'Very Good / Pass' },
      { grade: 'B+', min: 61, max: 70, point: 7, label: 'Good / Pass' },
      { grade: 'B', min: 56, max: 60, point: 6, label: 'Above Average / Pass' },
      { grade: 'C', min: 50, max: 55, point: 5, label: 'Average / Pass' },
      { grade: 'RA', min: 0, max: 49, point: 0, label: 'Reappear / Fail' }
    ],
    pass: {
      minSee: 25,   // Minimum 25 out of 50 in SEE
      minTotal: 50  // Minimum 50 out of 100 overall
    },
    courseTypes: {
      theory: {
        id: 'theory',
        name: 'Theory',
        ciaMax: 50,
        seeMax: 50,
        ciaComponents: [
          { id: 'cia1', label: 'CIA-1', max: 20, type: 'direct' },
          { id: 'cia2', label: 'CIA-2', max: 20, type: 'direct' },
          { id: 'assignment', label: 'Assignment', max: 5, type: 'direct' },
          { id: 'attendance', label: 'Attendance', max: 5, type: 'direct' }
        ],
        seeComponents: [
          { id: 'see', label: 'Written Examination', max: 50 }
        ]
      },
      laboratory: {
        id: 'laboratory',
        name: 'Laboratory',
        ciaMax: 50,
        seeMax: 50,
        ciaComponents: [
          { id: 'avgExp', label: 'Average of Marks for Experiments', max: 25, type: 'direct' },
          { id: 'modelReport', label: 'Model Exam / Report', max: 20, type: 'direct' },
          { id: 'attendance', label: 'Attendance', max: 5, type: 'direct' }
        ],
        seeComponents: [
          { id: 'see', label: 'Practical Examination', max: 50 }
        ]
      },
      theoryDPractical: {
        id: 'theoryDPractical',
        name: 'Theory (Dominant) + Practical',
        ciaMax: 50,
        seeMax: 50,
        ciaComponents: [
          { id: 'cia1', label: 'CIA-1', max: 10, type: 'direct' },
          { id: 'cia2', label: 'CIA-2', max: 10, type: 'direct' },
          { id: 'assignment', label: 'Assignment', max: 5, type: 'direct' },
          { id: 'avgExp', label: 'Average of Marks for Experiments', max: 10, type: 'direct' },
          { id: 'modelReport', label: 'Model Exam / Report', max: 10, type: 'direct' },
          { id: 'attendance', label: 'Attendance', max: 5, type: 'direct' }
        ],
        seeComponents: [
          { id: 'see', label: 'Written Examination', max: 50 }
        ]
      },
      theoryPracticalD: {
        id: 'theoryPracticalD',
        name: 'Theory + Practical (Dominant)',
        ciaMax: 50,
        seeMax: 50,
        ciaComponents: [
          { id: 'assignment', label: 'Assignment', max: 5, type: 'direct' },
          { id: 'avgExp', label: 'Average of Marks for Experiments', max: 15, type: 'direct' },
          { id: 'modelReport', label: 'Model Exam / Report', max: 25, type: 'direct' },
          { id: 'attendance', label: 'Attendance', max: 5, type: 'direct' }
        ],
        seeComponents: [
          { id: 'see', label: 'Practical Examination', max: 50 }
        ]
      },
      communityServiceProject: {
        id: 'communityServiceProject',
        name: 'Community Service Project',
        ciaMax: 50,
        seeMax: 50,
        ciaComponents: [
          { id: 'review1', label: 'Review 1', max: 15, type: 'direct' },
          { id: 'review2', label: 'Review 2', max: 15, type: 'direct' },
          { id: 'projectReportViva', label: 'Project Report + Viva', max: 15, type: 'direct' },
          { id: 'attendance', label: 'Attendance', max: 5, type: 'direct' }
        ],
        seeComponents: [
          { id: 'seeDemo', label: 'Project Demo + Report', max: 40, type: 'seeSub' },
          { id: 'seeViva', label: 'Project Viva-voce', max: 10, type: 'seeSub' }
        ]
      },
      minorProject: {
        id: 'minorProject',
        name: 'Minor Project',
        ciaMax: 50,
        seeMax: 50,
        ciaComponents: [
          { id: 'review1', label: 'Review 1', max: 15, type: 'direct' },
          { id: 'review2', label: 'Review 2', max: 15, type: 'direct' },
          { id: 'projectReportViva', label: 'Project Report + Viva', max: 15, type: 'direct' },
          { id: 'attendance', label: 'Attendance', max: 5, type: 'direct' }
        ],
        seeComponents: [
          { id: 'seeDemo', label: 'Project Demo + Report', max: 40, type: 'seeSub' },
          { id: 'seeViva', label: 'Project Viva-voce', max: 10, type: 'seeSub' }
        ]
      },
      industryProject: {
        id: 'industryProject',
        name: 'Industry Project',
        ciaMax: 50,
        seeMax: 50,
        ciaComponents: [
          { id: 'review1', label: 'Review 1', max: 15, type: 'direct' },
          { id: 'review2', label: 'Review 2', max: 15, type: 'direct' },
          { id: 'projectReportViva', label: 'Project Report + Viva', max: 15, type: 'direct' },
          { id: 'attendance', label: 'Attendance', max: 5, type: 'direct' }
        ],
        seeComponents: [
          { id: 'seeDemo', label: 'Project Demo + Report', max: 40, type: 'seeSub' },
          { id: 'seeViva', label: 'Project Viva-voce', max: 10, type: 'seeSub' }
        ]
      },
      majorProject: {
        id: 'majorProject',
        name: 'Major Project',
        ciaMax: 50,
        seeMax: 50,
        ciaComponents: [
          { id: 'review1', label: 'Review 1', max: 15, type: 'direct' },
          { id: 'review2', label: 'Review 2', max: 15, type: 'direct' },
          { id: 'projectReportViva', label: 'Project Report + Viva', max: 15, type: 'direct' },
          { id: 'attendance', label: 'Attendance', max: 5, type: 'direct' }
        ],
        seeComponents: [
          { id: 'seeDemo', label: 'Project Demo + Report', max: 40, type: 'seeSub' },
          { id: 'seeViva', label: 'Project Viva-voce', max: 10, type: 'seeSub' }
        ]
      },
      departmentSpecific: {
        id: 'departmentSpecific',
        name: 'SEC / AEC / VAC / IHL / IPT (Department-Specific)',
        isDepartmentSpecific: true,
        description: 'Department-specific assessment. CIA & SEE are conducted according to departmental rules. Automatic calculation is unavailable without department rules.'
      }
    }
  }
};

/**
 * Get regulation schema object
 */
function getRegulation(regulationKey) {
  return REGULATIONS[regulationKey] || REGULATIONS['R25'];
}

/**
 * Get available grade options for a regulation
 */
function getGradeOptions(regulationKey) {
  const reg = getRegulation(regulationKey);
  return reg.grading.map(g => ({
    grade: g.grade,
    point: g.point,
    min: g.min,
    max: g.max,
    label: `${g.grade} (${g.point} Points, ${g.min}-${g.max} Marks)`
  }));
}

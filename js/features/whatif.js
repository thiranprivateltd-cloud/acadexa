/**
 * AC ADEXA - What-If Academic Simulator Engine
 * Non-destructive simulation sandbox for experimenting with grades.
 */

class WhatIfSimulator {
  constructor(initialCourses = [], regulationKey = 'R25') {
    this.regulationKey = regulationKey;
    this.originalCourses = JSON.parse(JSON.stringify(initialCourses));
    // Clone courses into simulated sandbox array
    this.simulatedCourses = JSON.parse(JSON.stringify(initialCourses));
  }

  setCourseGrade(index, newGrade) {
    if (this.simulatedCourses[index]) {
      this.simulatedCourses[index].grade = newGrade;
      this.simulatedCourses[index].gradePoint = getGradePointForGrade(newGrade, this.regulationKey);
    }
  }

  addCourse(name, credits, grade) {
    const gp = getGradePointForGrade(grade, this.regulationKey);
    const newCourse = { name: name || `Course ${this.simulatedCourses.length + 1}`, credits: Number(credits) || 3, grade, gradePoint: gp };
    this.originalCourses.push({ ...newCourse });
    this.simulatedCourses.push({ ...newCourse });
  }

  removeCourse(index) {
    this.originalCourses.splice(index, 1);
    this.simulatedCourses.splice(index, 1);
  }

  reset() {
    this.simulatedCourses = JSON.parse(JSON.stringify(this.originalCourses));
  }

  evaluate() {
    const originalResult = calculateSGPA(this.originalCourses, this.regulationKey);
    const simulatedResult = calculateSGPA(this.simulatedCourses, this.regulationKey);

    const diff = Math.round((simulatedResult.sgpa - originalResult.sgpa) * 100) / 100;
    const diffText = diff >= 0 ? `+${diff.toFixed(2)}` : `${diff.toFixed(2)}`;

    return {
      originalSGPA: originalResult.sgpa,
      simulatedSGPA: simulatedResult.sgpa,
      diff,
      diffText,
      totalCredits: simulatedResult.totalCredits,
      courses: this.simulatedCourses.map((c, i) => ({
        name: c.name,
        credits: c.credits,
        originalGrade: this.originalCourses[i] ? this.originalCourses[i].grade : c.grade,
        simulatedGrade: c.grade,
        isModified: this.originalCourses[i] ? this.originalCourses[i].grade !== c.grade : false
      }))
    };
  }
}

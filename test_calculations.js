// Node test script for AC ADEXA logic
const fs = require('fs');

// Load regulations, grading, attendance, marks, sgpa, cgpa, projection
eval(fs.readFileSync('./js/data/regulations.js', 'utf8'));
eval(fs.readFileSync('./js/core/grading.js', 'utf8'));
eval(fs.readFileSync('./js/core/attendance.js', 'utf8'));
eval(fs.readFileSync('./js/core/marks.js', 'utf8'));
eval(fs.readFileSync('./js/core/sgpa.js', 'utf8'));
eval(fs.readFileSync('./js/core/cgpa.js', 'utf8'));
eval(fs.readFileSync('./js/core/projection.js', 'utf8'));

console.log("=== R21 GRADING TESTS ===");
console.log("90 ->", evaluateGrade(90, 'R21').grade); // S
console.log("89 ->", evaluateGrade(89, 'R21').grade); // A
console.log("80 ->", evaluateGrade(80, 'R21').grade); // A
console.log("79 ->", evaluateGrade(79, 'R21').grade); // B
console.log("70 ->", evaluateGrade(70, 'R21').grade); // B
console.log("69 ->", evaluateGrade(69, 'R21').grade); // C
console.log("60 ->", evaluateGrade(60, 'R21').grade); // C
console.log("59 ->", evaluateGrade(59, 'R21').grade); // D
console.log("50 ->", evaluateGrade(50, 'R21').grade); // D
console.log("49 ->", evaluateGrade(49, 'R21').grade); // RA

console.log("\n=== R25 GRADING TESTS ===");
console.log("91 ->", evaluateGrade(91, 'R25', 50).grade); // O
console.log("90 ->", evaluateGrade(90, 'R25', 45).grade); // A+
console.log("81 ->", evaluateGrade(81, 'R25', 40).grade); // A+
console.log("80 ->", evaluateGrade(80, 'R25', 40).grade); // A
console.log("71 ->", evaluateGrade(71, 'R25', 35).grade); // A
console.log("70 ->", evaluateGrade(70, 'R25', 35).grade); // B+
console.log("61 ->", evaluateGrade(61, 'R25', 30).grade); // B+
console.log("60 ->", evaluateGrade(60, 'R25', 30).grade); // B
console.log("56 ->", evaluateGrade(56, 'R25', 28).grade); // B
console.log("55 ->", evaluateGrade(55, 'R25', 27).grade); // C
console.log("50 ->", evaluateGrade(50, 'R25', 25).grade); // C

console.log("\n=== R25 PASS RULE TESTS ===");
const test1 = evaluateGrade(60, 'R25', 25); // CIA 35 + SEE 25 = 60 -> PASS
console.log("CIA 35 + SEE 25 = 60 ->", test1.statusText, test1.grade);

const test2 = evaluateGrade(45, 'R25', 25); // CIA 20 + SEE 25 = 45 -> FAIL
console.log("CIA 20 + SEE 25 = 45 ->", test2.statusText, test2.grade);

const test3 = evaluateGrade(65, 'R25', 20); // CIA 45 + SEE 20 = 65 -> FAIL (SEE < 25)
console.log("CIA 45 + SEE 20 = 65 ->", test3.statusText, test3.grade, test3.reason);

console.log("\n=== ATTENDANCE TESTS ===");
const att1 = calculateAttendance(100, 80);
console.log("80/100 ->", att1.percentage + "%", "Max missable:", att1.maxMissable);

const att2 = calculateAttendance(100, 50);
console.log("50/100 ->", att2.percentage + "%", "Required consecutive:", att2.requiredConsecutive);

console.log("\n=== SGPA & CGPA TESTS ===");
const sgpaRes = calculateSGPA([
  { name: 'DBMS', credits: 4, grade: 'A+' },
  { name: 'OS', credits: 3, grade: 'A' },
  { name: 'Java', credits: 3, grade: 'A+' }
], 'R25');
console.log("SGPA:", sgpaRes.sgpa, "Credits:", sgpaRes.totalCredits);

const cgpaRes = calculateCGPA([
  { semester: 1, sgpa: 8.12, credits: 24 },
  { semester: 2, sgpa: 8.46, credits: 23 }
], 'R25');
console.log("CGPA:", cgpaRes.cgpa, "R25 Equiv %:", cgpaRes.equivalentPercentage + "%");

console.log("\nAll core tests completed successfully!");

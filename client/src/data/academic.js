export const SEMESTER_HISTORY = [
  {
    semester: "Fall 2024", gpa: 3.45, credits: 15,
    courses: [
      { code: "CS 101", name: "Intro to Computer Science", credits: 3, grade: 92, letter: "A-", instructor: "Dr. Adams" },
      { code: "MATH 201", name: "Calculus II", credits: 4, grade: 85, letter: "B", instructor: "Prof. Lee" },
      { code: "ENG 101", name: "English Composition", credits: 3, grade: 88, letter: "B+", instructor: "Dr. Rivera" },
      { code: "PHYS 101", name: "Physics I", credits: 4, grade: 78, letter: "C+", instructor: "Prof. Chen" },
      { code: "CS 100", name: "CS Freshman Seminar", credits: 1, grade: 95, letter: "A", instructor: "Dr. Patel" },
    ],
  },
  {
    semester: "Spring 2025", gpa: 3.28, credits: 16,
    courses: [
      { code: "CS 201", name: "Object-Oriented Programming", credits: 3, grade: 90, letter: "A-", instructor: "Dr. Kim" },
      { code: "MATH 301", name: "Linear Algebra", credits: 4, grade: 82, letter: "B-", instructor: "Prof. Gupta" },
      { code: "CS 210", name: "Discrete Mathematics", credits: 3, grade: 87, letter: "B+", instructor: "Dr. Adams" },
      { code: "PHYS 102", name: "Physics II", credits: 4, grade: 76, letter: "C", instructor: "Prof. Chen" },
      { code: "HIST 150", name: "World History", credits: 2, grade: 91, letter: "A-", instructor: "Prof. Torres" },
    ],
  },
  {
    semester: "Fall 2025", gpa: 3.10, credits: 14,
    courses: [
      { code: "CS 250", name: "Computer Architecture", credits: 3, grade: 84, letter: "B", instructor: "Prof. Nguyen" },
      { code: "CS 280", name: "Database Systems", credits: 3, grade: 88, letter: "B+", instructor: "Dr. Kim" },
      { code: "MATH 310", name: "Probability & Statistics", credits: 3, grade: 79, letter: "C+", instructor: "Prof. Lee" },
      { code: "CS 270", name: "Web Development", credits: 3, grade: 93, letter: "A", instructor: "Dr. Rivera" },
      { code: "PHIL 200", name: "Ethics in Technology", credits: 2, grade: 72, letter: "C-", instructor: "Prof. Hall" },
    ],
  },
  { semester: "Spring 2026", gpa: 2.47, credits: 11 },
];

export const ACADEMIC_DATES = {
  dropDeadline: "April 5, 2026",
  dropDaysLeft: 12,
  withdrawDeadline: "April 20, 2026",
  withdrawDaysLeft: 27,
  fallRegistrationOpen: "April 15, 2026",
  fallRegistrationClose: "April 30, 2026",
  catalogYear: "2025-2026",
};

export const DEGREE_REQUIREMENTS = {
  major: {
    name: "Computer Science B.S.",
    totalCredits: 42,
    completedCredits: 30,
    required: [
      { code: "CS 101", name: "Intro to CS", credits: 3, status: "done" },
      { code: "CS 201", name: "Object-Oriented Programming", credits: 3, status: "done" },
      { code: "CS 210", name: "Discrete Mathematics", credits: 3, status: "done" },
      { code: "CS 250", name: "Computer Architecture", credits: 3, status: "done" },
      { code: "CS 270", name: "Web Development", credits: 3, status: "done" },
      { code: "CS 280", name: "Database Systems", credits: 3, status: "done" },
      { code: "CS 301", name: "Data Structures & Algorithms", credits: 3, status: "in-progress" },
      { code: "CS 355", name: "Operating Systems", credits: 3, status: "in-progress" },
      { code: "CS 420", name: "Software Engineering", credits: 3, status: "in-progress" },
      { code: "CS 450", name: "Machine Learning", credits: 3, status: "needed" },
      { code: "CS 460", name: "Distributed Systems", credits: 3, status: "needed" },
      { code: "CS 490", name: "Senior Capstone", credits: 3, status: "needed" },
      { code: "CS 4XX", name: "CS Elective (any 400-level)", credits: 3, status: "needed" },
    ],
  },
  minor: {
    name: "Mathematics Minor",
    totalCredits: 18,
    completedCredits: 11,
    required: [
      { code: "MATH 201", name: "Calculus II", credits: 4, status: "done" },
      { code: "MATH 301", name: "Linear Algebra", credits: 4, status: "done" },
      { code: "MATH 310", name: "Probability & Statistics", credits: 3, status: "done" },
      { code: "MATH 401", name: "Real Analysis", credits: 4, status: "needed" },
      { code: "MATH 415", name: "Number Theory", credits: 3, status: "needed" },
    ],
  },
  genEd: {
    name: "General Education",
    totalCredits: 24,
    completedCredits: 21,
    required: [
      { code: "ENG 101", name: "English Composition", credits: 3, status: "done" },
      { code: "ENG 310", name: "Technical Writing", credits: 2, status: "in-progress" },
      { code: "PHYS 101", name: "Physics I", credits: 4, status: "done" },
      { code: "PHYS 102", name: "Physics II", credits: 4, status: "done" },
      { code: "HIST 150", name: "World History", credits: 2, status: "done" },
      { code: "PHIL 200", name: "Ethics in Technology", credits: 2, status: "done" },
      { code: "ART/MUS", name: "Arts Elective", credits: 3, status: "needed" },
      { code: "SOC/PSY", name: "Social Science Elective", credits: 3, status: "done" },
    ],
  },
};

export const COURSE_CATALOG = [
  { code: "CS 450", name: "Machine Learning", credits: 3, instructor: "Dr. Adams", schedule: "MWF 10–11am", prereqs: ["CS 301", "MATH 310"], fills: ["major"], difficulty: "Hard", rating: 4.5, seats: 12 },
  { code: "CS 460", name: "Distributed Systems", credits: 3, instructor: "Prof. Nguyen", schedule: "TTh 1–2:30pm", prereqs: ["CS 355"], fills: ["major"], difficulty: "Hard", rating: 4.3, seats: 8 },
  { code: "CS 490", name: "Senior Capstone", credits: 3, instructor: "Dr. Kim", schedule: "MW 3–4:30pm", prereqs: ["CS 420"], fills: ["major"], difficulty: "Medium", rating: 4.7, seats: 20 },
  { code: "CS 440", name: "Computer Networks", credits: 3, instructor: "Dr. Patel", schedule: "TTh 10–11:30am", prereqs: ["CS 355"], fills: ["major-elective"], difficulty: "Medium", rating: 4.1, seats: 15 },
  { code: "CS 470", name: "Artificial Intelligence", credits: 3, instructor: "Dr. Adams", schedule: "MWF 1–2pm", prereqs: ["CS 301", "MATH 310"], fills: ["major-elective"], difficulty: "Hard", rating: 4.6, seats: 10 },
  { code: "CS 430", name: "Compiler Design", credits: 3, instructor: "Prof. Hall", schedule: "TTh 3–4:30pm", prereqs: ["CS 301"], fills: ["major-elective"], difficulty: "Hard", rating: 3.8, seats: 18 },
  { code: "MATH 401", name: "Real Analysis", credits: 4, instructor: "Prof. Gupta", schedule: "MWF 9–10am", prereqs: ["MATH 201"], fills: ["minor"], difficulty: "Hard", rating: 3.9, seats: 22 },
  { code: "MATH 415", name: "Number Theory", credits: 3, instructor: "Prof. Lee", schedule: "TTh 11am–12:30pm", prereqs: ["MATH 301"], fills: ["minor"], difficulty: "Medium", rating: 4.2, seats: 25 },
  { code: "COMM 200", name: "Professional Communication", credits: 2, instructor: "Dr. Rivera", schedule: "MW 11am–12pm", prereqs: ["ENG 101"], fills: ["gen-ed"], difficulty: "Easy", rating: 4.4, seats: 30, replaces: "ENG 310" },
  { code: "ENG 320", name: "Business Writing", credits: 2, instructor: "Prof. Torres", schedule: "TTh 9–10am", prereqs: ["ENG 101"], fills: ["gen-ed"], difficulty: "Easy", rating: 4.0, seats: 28, replaces: "ENG 310" },
  { code: "ART 101", name: "Intro to Visual Arts", credits: 3, instructor: "Prof. Martinez", schedule: "MW 2–3:30pm", prereqs: [], fills: ["gen-ed"], difficulty: "Easy", rating: 4.3, seats: 35 },
  { code: "MUS 101", name: "Music Appreciation", credits: 3, instructor: "Dr. Williams", schedule: "TTh 2–3:30pm", prereqs: [], fills: ["gen-ed"], difficulty: "Easy", rating: 4.5, seats: 40 },
  { code: "ECON 101", name: "Intro to Economics", credits: 3, instructor: "Prof. Shah", schedule: "MWF 11am–12pm", prereqs: [], fills: ["gen-ed", "econ-minor"], difficulty: "Medium", rating: 4.1, seats: 50 },
  { code: "ECON 201", name: "Microeconomics", credits: 3, instructor: "Prof. Shah", schedule: "TTh 10–11:30am", prereqs: ["ECON 101"], fills: ["econ-minor"], difficulty: "Medium", rating: 4.0, seats: 35 },
];

export const COURSE_GUIDELINES = {
  difficultyRatings: {
    "CS 301": { avgGPA: 2.6, difficulty: "Hard", passRate: 0.78 },
    "CS 355": { avgGPA: 3.1, difficulty: "Medium", passRate: 0.88 },
    "CS 420": { avgGPA: 3.3, difficulty: "Medium", passRate: 0.92 },
    "ENG 310": { avgGPA: 3.0, difficulty: "Easy", passRate: 0.90 },
    "COMM 200": { avgGPA: 3.5, difficulty: "Easy", passRate: 0.95 },
    "ENG 320": { avgGPA: 3.2, difficulty: "Easy", passRate: 0.93 },
  },
  replacementComparisons: {
    "ENG 310→COMM 200": { currentDifficulty: "Easy", replacementDifficulty: "Easy", avgGPADiff: +0.5 },
    "ENG 310→ENG 320": { currentDifficulty: "Easy", replacementDifficulty: "Easy", avgGPADiff: +0.2 },
  },
  gpaStrategies: [
    { id: "focus-high-weight", title: "Focus on High-Weight Assignments", description: "Prioritize upcoming exams and projects worth the most points." },
    { id: "recover-missing", title: "Recover Missing Work", description: "Submit overdue assignments even for partial credit." },
    { id: "office-hours", title: "Attend Office Hours", description: "Get targeted help on weak topics before exams." },
  ],
  minorOptions: [
    {
      name: "Economics Minor",
      requiredCourses: ["ECON 101", "ECON 201", "ECON 301", "ECON 310"],
      totalCredits: 12,
      eligibility: "Open to all majors with GPA ≥ 2.5",
    },
  ],
};

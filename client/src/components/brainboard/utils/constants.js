// Shared constants for BrainBoard components

export const API_BASE = "/api";

export const STATIC_ACTIONS = {
  grades: { icon: "🎯", label: "Open Grade Calculator", path: "/grades" },
  assignments: { icon: "📋", label: "View Assignments", path: "/assignments" },
  calendar: { icon: "📅", label: "Open Calendar", path: "/calendar" },
  profile: { icon: "👤", label: "View Profile", path: "/profile" },
  dashboard: { icon: "🏠", label: "Go to Dashboard", path: "/" },
};

export const DEFAULT_MSG = {
  role: "assistant",
  content: "👋 Hi Alex! I'm BrainBoard — your AI academic advisor. I can see all your grades, assignments, trends, and history. What can I help with?",
  chips: [],
};

export const QUICK_PROMPTS = [
  "Which class needs the most attention?",
  "How can I fix my CS 301 grade?",
  "What's due this week?",
  "Can I still hit a 3.0 GPA?",
  "What should I prioritize today?",
];

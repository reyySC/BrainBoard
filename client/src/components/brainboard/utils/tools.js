import { buildFullStudentData } from "./studentData";

const DATA_TOOLS = {
  get_student_data: {
    desc: "Get ALL student academic data — courses, grades, assignments, projections, GPA, office hours, semester history. Use this for ANY academic question.",
    params: "none",
    fn: () => buildFullStudentData(),
  },
};

// Parse [TOOL: name(param)] from LLM response — flexible matching
export function parseTool(text) {
  const patterns = [
    /\[TOOL:\s*(\w+)\(([^)]*)\)\]/i,
    /\[TOOL:\s*(\w+)\s*\(\s*([^)]*)\s*\)\s*\]/i,
    /\[TOOL:\s*(\w+)\s*,\s*([^\]]*)\]/i,
    /TOOL:\s*(\w+)\(([^)]*)\)/i,
    /\[(\w+)\(([^)]*)\)\]/i,
  ];
  for (const regex of patterns) {
    const match = text.match(regex);
    if (match && DATA_TOOLS[match[1]]) {
      const fullMatch = match[0];
      const cleanText = text.replace(fullMatch, "").replace(/\n+$/, "").trim();
      return { name: match[1], param: match[2].trim().replace(/['"]/g, ""), cleanText };
    }
  }
  return null;
}

export function executeTool(name, param) {
  const tool = DATA_TOOLS[name];
  if (!tool) return `Unknown tool: ${name}. Available: ${Object.keys(DATA_TOOLS).join(", ")}`;
  return tool.fn(param);
}

export function buildToolPrompt() {
  return Object.entries(DATA_TOOLS).map(([name, t]) => `- ${name}(${t.params}): ${t.desc}`).join("\n");
}

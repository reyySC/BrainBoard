import { COURSES } from "../../../data/mockData";
import { STATIC_ACTIONS } from "./constants";

// Dynamically build the full action map from current student data
export function buildActionMap() {
  const map = { ...STATIC_ACTIONS };
  COURSES.forEach((c) => {
    map[c.id] = { icon: "📘", label: `View ${c.code}`, path: `/course/${c.id}` };
  });
  return map;
}

// Build the action list string for the LLM prompt dynamically
export function buildActionPrompt() {
  const map = buildActionMap();
  return Object.entries(map).map(([k, v]) => `${k} → "${v.label}"`).join(", ");
}

// Parse [ACTIONS: key1, key2] from end of AI response
export function parseActions(rawText) {
  const actionMap = buildActionMap();
  const match = rawText.match(/\[ACTIONS?:\s*([^\]]+)\]\s*$/i);
  if (!match) return { text: rawText.trim(), chips: [] };
  const cleanText = rawText.replace(/\n?\[ACTIONS?:\s*[^\]]+\]\s*$/i, "").trim();
  const keys = match[1].split(",").map((k) => k.trim().toLowerCase());
  const chips = keys.map((k) => actionMap[k]).filter(Boolean).slice(0, 3);
  return { text: cleanText, chips };
}

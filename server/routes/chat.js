import express from "express";
import { callGroq } from "../lib/groqClient.js";

const router = express.Router();

// Safely extract JSON from LLM output
function safeParseJSON(text) {
  let clean = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  try { return JSON.parse(clean); } catch {}

  // Extract first JSON object or array
  const objMatch = clean.match(/(\{[\s\S]*\})/);
  if (objMatch) try { return JSON.parse(objMatch[1]); } catch {}
  const arrMatch = clean.match(/(\[[\s\S]*\])/);
  if (arrMatch) try { return JSON.parse(arrMatch[1]); } catch {}

  // Fix trailing commas
  const fixed = clean.replace(/,\s*([}\]])/g, "$1");
  try { return JSON.parse(fixed); } catch {}

  // Try closing truncated JSON — count open braces/brackets and close them
  let attempt = clean.replace(/,\s*$/, ""); // remove trailing comma
  const opens = (attempt.match(/\{/g) || []).length;
  const closes = (attempt.match(/\}/g) || []).length;
  const openBrackets = (attempt.match(/\[/g) || []).length;
  const closeBrackets = (attempt.match(/\]/g) || []).length;
  attempt += "]".repeat(Math.max(0, openBrackets - closeBrackets));
  attempt += "}".repeat(Math.max(0, opens - closes));
  try { return JSON.parse(attempt); } catch {}

  return null;
}

// AI Chat endpoint
router.post("/chat", async (req, res) => {
  const { messages, systemPrompt } = req.body;
  const groqMessages = [];
  if (systemPrompt) groqMessages.push({ role: "system", content: systemPrompt });
  for (const msg of messages) {
    groqMessages.push({ role: msg.role, content: msg.content });
  }
  try {
    const text = await callGroq(groqMessages);
    res.json({ reply: text || "Sorry, I couldn't respond." });
  } catch (err) {
    console.error("Chat error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Study plan generation
router.post("/study-plan", async (req, res) => {
  const { prompt } = req.body;
  try {
    const text = await callGroq([
      { role: "system", content: "You are an academic advisor AI. Return ONLY valid JSON, no markdown fences. Keep task descriptions short (under 15 words each) to stay within token limits." },
      { role: "user", content: prompt },
    ], 0.6, 4096);
    console.log("[study-plan] Raw LLM response (first 100 chars):", text.slice(0, 100));
    console.log("[study-plan] Raw LLM response (last 200 chars):", text.slice(-200));
    console.log("[study-plan] Response length:", text.length);
    const plan = safeParseJSON(text);
    if (!plan) throw new Error("Could not parse study plan JSON");
    res.json({ plan });
  } catch (err) {
    console.error("Plan error:", err.message);
    res.status(500).json({ error: "Failed to generate study plan" });
  }
});

// AI Alerts generation
router.post("/alerts", async (req, res) => {
  const { studentContext } = req.body;
  const prompt = `Analyze this student's data and generate 3-5 academic alerts.

${studentContext}

Return ONLY valid JSON array. Each alert has: level ("red", "amber", or "green"), title (course code + name + grade), msg (2-3 sentence actionable advice).
Red = failing/at-risk, Amber = needs attention, Green = doing well.
Sort by urgency (red first). Be specific about what to do, not generic.`;

  try {
    const text = await callGroq([
      { role: "system", content: "You are BrainBoard, an AI academic advisor. Return ONLY valid JSON, no markdown." },
      { role: "user", content: prompt },
    ], 0.5);
    const alerts = safeParseJSON(text);
    if (!alerts) throw new Error("Could not parse alerts JSON");
    res.json({ alerts });
  } catch (err) {
    console.error("Alerts error:", err.message);
    res.status(500).json({ error: "Failed to generate alerts" });
  }
});

// AI Score projection
router.post("/projection", async (req, res) => {
  const { studentContext, question } = req.body;
  try {
    const text = await callGroq([
      { role: "system", content: `You are BrainBoard, an AI academic advisor. ${studentContext}` },
      { role: "user", content: question },
    ]);
    res.json({ answer: text });
  } catch (err) {
    console.error("Projection error:", err.message);
    res.status(500).json({ error: "Failed to generate projection" });
  }
});

export default router;

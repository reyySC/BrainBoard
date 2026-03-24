import express from "express";
import { callGroq } from "../lib/groqClient.js";

const router = express.Router();

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
      { role: "system", content: "You are an academic advisor AI. Return ONLY valid JSON, no markdown fences." },
      { role: "user", content: prompt },
    ], 0.6);
    const clean = text.replace(/```json|```/g, "").trim();
    res.json({ plan: JSON.parse(clean) });
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
    const clean = text.replace(/```json|```/g, "").trim();
    res.json({ alerts: JSON.parse(clean) });
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

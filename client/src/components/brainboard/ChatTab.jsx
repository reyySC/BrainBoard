import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { STUDENT, COURSES } from "../../data/mockData";
import RenderMessage from "./RenderMessage";
import { API_BASE, QUICK_PROMPTS } from "./utils/constants";
import { buildActionPrompt, parseActions } from "./utils/actions";
import { parseTool, executeTool } from "./utils/tools";

export default function ChatTab({ messages, setMessages }) {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const chatRef = useRef(null);
  const bottomRef = useRef(null);
  const streamingRef = useRef(false);
  const inputRef = useRef(null);

  function scrollIfNearBottom() {
    const el = chatRef.current;
    if (!el) return;
    const threshold = 80;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    if (isNearBottom) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }

  function scrollToBottom() {
    const el = chatRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }

  function typewriterReveal(fullText, chips) {
    const words = fullText.split(/(\s+)/);
    let revealed = "";
    let idx = 0;
    streamingRef.current = true;
    setStreaming(true);

    setMessages((prev) => [...prev, { role: "assistant", content: "", chips: [] }]);

    const speed = Math.max(15, Math.min(35, 2000 / words.length));

    function tick() {
      if (idx >= words.length || !streamingRef.current) {
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: fullText, chips };
          return copy;
        });
        setStreaming(false);
        streamingRef.current = false;
        setTimeout(() => inputRef.current?.focus(), 50);
        return;
      }
      revealed += words[idx];
      idx++;
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: "assistant", content: revealed, chips: [] };
        return copy;
      });
      scrollIfNearBottom();
      setTimeout(tick, speed);
    }
    tick();
  }

  const actionList = buildActionPrompt();

  async function send(text) {
    const msg = text || input.trim();
    if (!msg || loading || streaming) return;
    setInput("");

    const newMessages = [...messages, { role: "user", content: msg, chips: [] }];
    setMessages(newMessages);
    setLoading(true);
    setTimeout(scrollToBottom, 50);
    setTimeout(() => inputRef.current?.focus(), 50);

    const systemPrompt = `You are BrainBoard, a warm, caring, and practical AI academic guidance counselor inside BrainBoard. You genuinely care about the student as a person, not just their grades.

CONVERSATION STYLE — THIS IS THE #1 RULE, OVERRIDE EVERYTHING ELSE:
- Read the student's LATEST message ONLY to determine your response style.
- If the latest message is casual (hi, hello, hey, thanks, ok, cool, lol, etc.) → respond in 1 short casual sentence. NO academic data. NO tools. NO action chips. NO advice. Just be friendly.
- IGNORE all previous messages in the conversation when deciding tone. Even if the last 5 messages were about grades, if the student now says "hello", just say hello back.
- Only discuss academics when the LATEST message specifically asks an academic question.

EMOTIONAL INTELLIGENCE — EQUALLY IMPORTANT:
- If the student mentions stress, burnout, needing a break, mental health, feeling overwhelmed, vacation, or anything emotional → BE EMPATHETIC FIRST. Do NOT immediately dump grades and deadlines on them.
- Lead with understanding and validation ("That's completely valid", "Taking care of yourself matters", "I hear you").
- Then offer SUPPORTIVE OPTIONS like:
  - Talking to professors about extensions or accommodations
  - Visiting the university counseling center or student wellness services
  - Speaking with their academic advisor about options (incomplete grades, reduced load, etc.)
  - Planning a short structured break that balances rest with responsibilities
  - Study groups or tutoring to reduce the feeling of doing it alone
- Only mention specific grades/deadlines if the student asks, or very briefly as context — NOT as a data dump.
- NEVER make the student feel guilty for wanting a break. College is hard. Mental health matters.
- Do NOT use the data tool for emotional/personal messages.

STUDENT OVERVIEW (you know this already — no tool needed for basic facts):
Name: ${STUDENT.name}, CS Senior, ${STUDENT.semester}, Week ${STUDENT.week}/${STUDENT.totalWeeks}
Courses: ${COURSES.map(c => c.code + " " + c.grade + "%").join(", ")}
${COURSES.filter(c => c.alert).map(c => "⚠️ " + c.code + ": " + c.alertMsg).join("\n")}

GETTING DETAILED DATA:
When the student asks a specific academic question that needs data (grades, assignments, projections, GPA, office hours, what's due, semester history), fetch the full student database by appending this at the END of your message:
[TOOL: get_student_data()]
This returns everything — courses, assignments, projections, GPA, office hours, history. Use your judgment to present only what's relevant.
Do NOT use the tool for: greetings, casual chat, emotional support, general advice, or non-academic questions.

IMPORTANT — BE SMART WITH THE DATA:
- Answer ONLY what was asked. "What homework is coming up" → show upcoming work only, not completed.
- One course question → focus on that course. Broad question → cover all courses.
- You are the intelligent filter. The tool gives everything; you decide what matters.

RULES:
- Be concise — match response length to the complexity of the question
- Simple questions: 1-2 sentences. Detailed requests: 3-6 sentences with data.
- Reference specific data from tool results — do NOT make up numbers
- Be supportive and honest
- Give actionable, specific advice when asked (not generic platitudes)
- Use the student's name (Alex) naturally but not in every message

FORMATTING (only for longer academic responses):
- Use **bold** for emphasis on key numbers or important terms
- Use bullet points (- item) when listing multiple things
- Use numbered lists (1. item) for step-by-step advice
- Keep paragraphs short (2-3 sentences max)
- Never use markdown headers (#) — just bold text for section labels

SUGGESTED ACTIONS:
Only when your response directly relates to a page in the app, append at the very end:
[ACTIONS: key1, key2]
Available action keys: ${actionList}
Do NOT include actions for greetings, casual chat, emotional support, or general advice. Maximum 3 actions.
IMPORTANT: Never include both [TOOL:...] and [ACTIONS:...] in the same message.`;

    try {
      const MAX_HISTORY = 10;
      const trimmed = newMessages.slice(-MAX_HISTORY);
      let apiMessages = trimmed.map((m) => ({ role: m.role, content: m.content }));
      let reply = "";

      const res1 = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, systemPrompt }),
      });
      const data1 = await res1.json();
      reply = data1.reply || "Sorry, something went wrong!";

      const toolCall = parseTool(reply);
      if (toolCall) {
        const toolResult = executeTool(toolCall.name, toolCall.param);
        const followUp = [
          ...apiMessages,
          { role: "assistant", content: toolCall.cleanText || "Let me look that up..." },
          { role: "user", content: `[TOOL RESULT for ${toolCall.name}]:\n${toolResult}\n\nNow use this data to give me a complete, accurate answer. Remember to use the FORMATTING rules and optionally append [ACTIONS:...] if relevant.` },
        ];

        const res2 = await fetch(`${API_BASE}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: followUp, systemPrompt }),
        });
        const data2 = await res2.json();
        reply = data2.reply || reply;
      }

      const { text: cleanText, chips } = parseActions(reply);
      const finalText = cleanText.replace(/\n?\[TOOL:\s*\w+\([^)]*\)\]\s*$/i, "").trim();
      setLoading(false);
      typewriterReveal(finalText, chips);
    } catch {
      setLoading(false);
      setMessages((prev) => [...prev, { role: "assistant", content: "Couldn't connect to the AI server. Make sure the backend is running on port 3001.", chips: [] }]);
    }
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div ref={chatRef} style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, padding: 14 }}>
        {messages.map((m, i) => {
          const isUser = m.role === "user";
          const chips = m.chips || [];
          return (
            <div key={i} style={{ alignSelf: isUser ? "flex-end" : "flex-start", maxWidth: "82%" }}>
              <div style={{
                padding: "10px 14px", borderRadius: 14, fontSize: 13, lineHeight: 1.6,
                background: isUser ? "var(--navy)" : "var(--light)",
                color: isUser ? "white" : "var(--text)",
                borderBottomLeftRadius: !isUser ? 4 : 14,
                borderBottomRightRadius: isUser ? 4 : 14,
              }}><RenderMessage text={m.content} isUser={isUser} /></div>
              {chips.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 6 }}>
                  {chips.map((chip, ci) => (
                    <button key={ci} onClick={() => navigate(chip.path)} style={{
                      background: "white", border: "1.5px solid var(--border)", borderRadius: 20,
                      padding: "4px 11px", fontSize: 11, fontWeight: 600, color: "var(--navy)",
                      cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                      display: "flex", alignItems: "center", gap: 4, transition: "all .15s",
                    }}>{chip.icon} {chip.label}</button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {loading && (
          <div style={{ display: "flex", gap: 5, padding: 14, background: "var(--light)", borderRadius: 14, width: "fit-content" }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--slate)", animation: `bounce 1.2s ${i * 0.2}s infinite` }} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length === 1 && (
        <div style={{ padding: "0 14px 10px", display: "flex", flexWrap: "wrap", gap: 6 }}>
          {QUICK_PROMPTS.map((q, i) => (
            <button key={i} onClick={() => send(q)} style={{
              background: "white", border: "1.5px solid var(--border)", borderRadius: 20,
              padding: "5px 12px", fontSize: 11, fontWeight: 600, color: "var(--navy)",
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            }}>{q}</button>
          ))}
        </div>
      )}

      <div style={{ padding: "12px 14px", borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
        <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={streaming ? "BrainBoard is typing..." : "Ask BrainBoard anything..."}
          disabled={loading || streaming}
          style={{
            flex: 1, padding: "10px 14px", border: "1.5px solid var(--border)",
            borderRadius: 10, fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none",
            opacity: (loading || streaming) ? 0.6 : 1,
          }} />
        <button onClick={() => send()} disabled={loading || streaming} style={{
          background: "var(--navy)", color: "white", border: "none",
          borderRadius: 10, padding: "0 14px", fontSize: 16, cursor: "pointer",
          opacity: (loading || streaming) ? 0.6 : 1,
        }}>→</button>
      </div>
    </div>
  );
}

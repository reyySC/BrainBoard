import fetch from "node-fetch";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

export { GROQ_URL, MODEL };

export async function callGroq(messages, temperature = 0.7, maxTokens = 1024) {
  const GROQ_KEY = process.env.GROQ_API_KEY;
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({ model: MODEL, messages, temperature, max_tokens: maxTokens }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || "Groq API error");
  return data.choices?.[0]?.message?.content || "";
}

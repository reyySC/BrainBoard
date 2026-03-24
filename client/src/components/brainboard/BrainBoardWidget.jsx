import { useState, useRef, useEffect } from "react";
import ChatTab from "./ChatTab";
import AlertsTab from "./AlertsTab";
import PlanTab from "./PlanTab";
import { DEFAULT_MSG } from "./utils/constants";

export default function BrainBoardWidget({ onClose, visible }) {
  const [tab, setTab] = useState("chat");
  const [messages, setMessages] = useState([DEFAULT_MSG]);
  const [dims, setDims] = useState({ width: 400, height: 560 });
  const resizingRef = useRef(null);

  function newChat() {
    setMessages([DEFAULT_MSG]);
  }

  useEffect(() => {
    function onMouseMove(e) {
      if (!resizingRef.current) return;
      const dir = resizingRef.current;
      setDims((prev) => {
        let { width, height } = prev;
        if (dir.includes("left")) width = Math.max(320, Math.min(window.innerWidth - 40, width - e.movementX));
        if (dir.includes("top")) height = Math.max(400, Math.min(window.innerHeight - 40, height - e.movementY));
        if (dir.includes("right")) width = Math.max(320, Math.min(window.innerWidth - 40, width + e.movementX));
        if (dir.includes("bottom")) height = Math.max(400, Math.min(window.innerHeight - 40, height + e.movementY));
        return { width, height };
      });
    }
    function onMouseUp() { resizingRef.current = null; document.body.style.cursor = ""; document.body.style.userSelect = ""; }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => { window.removeEventListener("mousemove", onMouseMove); window.removeEventListener("mouseup", onMouseUp); };
  }, []);

  function startResize(dir) {
    return (e) => { e.preventDefault(); resizingRef.current = dir; document.body.style.cursor = dir.includes("left") || dir.includes("right") ? "ew-resize" : dir.includes("top") || dir.includes("bottom") ? "ns-resize" : "nwse-resize"; document.body.style.userSelect = "none"; };
  }

  if (!visible) return null;

  const edgeSize = 6;
  const edgeStyle = (cursor, pos) => ({
    position: "absolute", zIndex: 2, ...pos,
    cursor, background: "transparent",
  });

  const isFullscreen = dims.width >= window.innerWidth - 10;

  return (
    <div style={{
      position: "fixed", bottom: isFullscreen ? 0 : 100, right: isFullscreen ? 0 : 28, zIndex: 499,
      width: dims.width, height: dims.height, background: "white",
      borderRadius: isFullscreen ? 0 : 20, boxShadow: isFullscreen ? "none" : "0 20px 60px rgba(0,0,0,.2)",
      display: "flex", flexDirection: "column", overflow: "visible",
      border: isFullscreen ? "none" : "1px solid var(--border)",
      animation: "fadeIn .25s ease", transition: "border-radius .2s, bottom .2s, right .2s",
    }}>
      {/* Resize handles */}
      <div onMouseDown={startResize("left")} style={edgeStyle("ew-resize", { left: -edgeSize / 2, top: edgeSize, width: edgeSize, bottom: edgeSize })} />
      <div onMouseDown={startResize("top")} style={edgeStyle("ns-resize", { top: -edgeSize / 2, left: edgeSize, right: edgeSize, height: edgeSize })} />
      <div onMouseDown={startResize("top-left")} style={edgeStyle("nwse-resize", { top: -edgeSize / 2, left: -edgeSize / 2, width: edgeSize * 2, height: edgeSize * 2 })} />
      <div onMouseDown={startResize("top-right")} style={edgeStyle("nesw-resize", { top: -edgeSize / 2, right: -edgeSize / 2, width: edgeSize * 2, height: edgeSize * 2 })} />

      <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", borderRadius: isFullscreen ? 0 : 20 }}>

      {/* Header */}
      <div style={{ background: "var(--navy)", padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0, borderRadius: isFullscreen ? 0 : "20px 20px 0 0" }}>
        <span style={{ fontSize: 20 }}>🧠</span>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "white", margin: 0 }}>BrainBoard</h3>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,.5)", margin: 0 }}>AI Academic Guidance · Powered by Groq</p>
        </div>
        <button onClick={newChat} title="New Chat" style={{
          background: "rgba(255,255,255,.12)", border: "none", color: "rgba(255,255,255,.85)",
          padding: "5px 12px", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 600,
          fontFamily: "'DM Sans', sans-serif",
          display: "flex", alignItems: "center", gap: 5,
        }}>+ New Chat</button>
        <button onClick={() => {
          if (dims.width === window.innerWidth && dims.height === window.innerHeight) {
            setDims({ width: 400, height: 560 });
          } else {
            setDims({ width: window.innerWidth, height: window.innerHeight });
          }
        }} title="Fullscreen" style={{
          background: "rgba(255,255,255,.12)", border: "none", color: "rgba(255,255,255,.7)",
          width: 28, height: 28, borderRadius: 8, cursor: "pointer", fontSize: 13,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>{isFullscreen ? "⊗" : "⛶"}</button>
        <button onClick={onClose} style={{
          background: "none", border: "none", color: "rgba(255,255,255,.5)",
          fontSize: 18, cursor: "pointer", width: 28, height: 28,
          display: "flex", alignItems: "center", justifyContent: "center",
        }} aria-label="Close BrainBoard">✕</button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        {[["chat", "💬 Advisor"], ["alerts", "⚠️ Alerts"], ["plan", "🗓 Study Plan"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            flex: 1, padding: 10, border: "none", background: "none",
            fontSize: 12, fontWeight: 600, cursor: "pointer",
            color: tab === id ? "var(--navy)" : "var(--slate)",
            borderBottom: `2.5px solid ${tab === id ? "var(--navy)" : "transparent"}`,
            fontFamily: "'DM Sans', sans-serif",
          }}>{label}</button>
        ))}
      </div>

      {tab === "chat" && <ChatTab messages={messages} setMessages={setMessages} />}
      {tab === "alerts" && <AlertsTab />}
      {tab === "plan" && <PlanTab />}
      </div>
    </div>
  );
}

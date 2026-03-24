import { useState } from "react";

export default function Login({ onLogin }) {
  const [email] = useState("alex.johnson@meridian.edu");

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "linear-gradient(135deg, #0F2044 0%, #1A3260 60%, #1E4B8F 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "white", borderRadius: 20, padding: "48px 44px",
        width: 420, boxShadow: "0 40px 80px rgba(0,0,0,0.35)",
        animation: "slideUp .5s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <div style={{
            width: 46, height: 46, background: "var(--navy)", borderRadius: 12,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
          }}>🎓</div>
          <div>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: "var(--navy)", lineHeight: 1.1 }}>BrainBoard</h1>
            <span style={{ fontSize: 11, color: "var(--slate)", letterSpacing: 0.5 }}>MERIDIAN UNIVERSITY · STUDENT PORTAL</span>
          </div>
        </div>

        <h2 style={{ fontSize: 26, fontWeight: 700, color: "var(--navy)", marginBottom: 6 }}>Welcome back</h2>
        <p style={{ color: "var(--slate)", fontSize: 14, marginBottom: 28 }}>Sign in to access your courses, grades, and more.</p>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>University Email</label>
          <input
            type="email"
            value={email}
            readOnly
            style={{
              width: "100%", padding: "12px 14px", border: "1.5px solid var(--border)",
              borderRadius: 10, fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none",
            }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Password</label>
          <input
            type="password"
            defaultValue="password"
            style={{
              width: "100%", padding: "12px 14px", border: "1.5px solid var(--border)",
              borderRadius: 10, fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none",
            }}
          />
        </div>

        <button
          onClick={onLogin}
          style={{
            width: "100%", padding: 13, background: "var(--navy)", color: "white",
            border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700,
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif", marginTop: 8,
          }}
        >
          Sign In →
        </button>
        <p style={{ textAlign: "center", marginTop: 18, fontSize: 12, color: "var(--muted)" }}>
          Demo credentials pre-filled. Just click Sign In.
        </p>
      </div>
    </div>
  );
}

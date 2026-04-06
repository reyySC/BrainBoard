# BrainBoard — AI-Powered Academic Advisor

A learning management system with an AI academic advisor powered by Groq (Llama 3.3 70B).

## What You Need Before Starting

1. **Node.js** (version 18 or higher) — Download and install from [nodejs.org](https://nodejs.org/). Pick the "LTS" version. This lets your computer run the app.

2. **A Groq API Key** (free) — Go to [console.groq.com/keys](https://console.groq.com/keys), create a free account, and click "Create API Key". Copy the key — you'll need it in Step 3.

3. **A code editor or terminal** — On Mac, open the built-in app called "Terminal". On Windows, open "Command Prompt" or "PowerShell".

---

## Step-by-Step Setup

### Step 1: Download the project

Open your terminal and paste these commands one at a time, pressing Enter after each:

```bash
git clone https://github.com/reyySC/BrainBoard.git
```

This downloads the project to your computer.

### Step 2: Install backend dependencies

Now navigate into the server folder and install what it needs:

```bash
cd BrainBoard/server
npm install
```

> **What this does:** `cd` means "change directory" — it moves you into the server folder. `npm install` downloads all the libraries the backend needs.

### Step 3: Add your API key

While still in the `BrainBoard/server` folder, create a file called `.env`:

**On Mac/Linux:**
```bash
echo "GROQ_API_KEY=paste_your_key_here" > .env
```

**On Windows (PowerShell):**
```powershell
"GROQ_API_KEY=paste_your_key_here" | Out-File -Encoding utf8 .env
```

> **Important:** Replace `paste_your_key_here` with the actual API key you copied from Groq in Step 1. No quotes around the key.

### Step 4: Start the backend server

Still in the `BrainBoard/server` folder, run:

```bash
node server.js
```

You should see:
```
Server running on http://localhost:3001
```

> **Leave this terminal window open and running.** Don't close it — the backend needs to stay on.

### Step 5: Install frontend dependencies

**Open a NEW terminal window** (don't close the first one). Then navigate to the client folder:

```bash
cd BrainBoard/client
npm install
```

> **Why a new terminal?** The backend is running in the first terminal. You need a second one for the frontend.

### Step 6: Start the frontend

Still in the `BrainBoard/client` folder, run:

```bash
npx vite --port 5173
```

You should see:
```
VITE ready
➜  Local: http://localhost:5173/
```

### Step 7: Open the app

Open your web browser (Chrome, Firefox, Safari, etc.) and go to:

```
http://localhost:5173
```

You should see the BrainBoard login screen. Click "Sign In" to enter the demo.

---

## Quick Reference

| What | Where | Command |
|------|-------|---------|
| Start backend | Terminal 1, in `BrainBoard/server` | `node server.js` |
| Start frontend | Terminal 2, in `BrainBoard/client` | `npx vite --port 5173` |
| Open app | Browser | `http://localhost:5173` |

---

## Troubleshooting

**"command not found: node"**
→ Node.js isn't installed. Download it from [nodejs.org](https://nodejs.org/) and restart your terminal.

**"command not found: git"**
→ Git isn't installed. Download it from [git-scm.com](https://git-scm.com/) and restart your terminal.

**"GROQ_API_KEY is not set" or AI features don't work**
→ Make sure you created the `.env` file in the `server` folder (Step 3) with your actual API key.

**"Port 3001 already in use"**
→ Another process is using that port. On Mac/Linux run: `lsof -ti:3001 | xargs kill -9`
→ On Windows: close any other terminal windows running the server, then try again.

**The app loads but AI features show errors**
→ Make sure both terminals are running (backend on 3001, frontend on 5173). The frontend needs the backend to be running for AI features.

---

## Features

- Dashboard with course cards, GPA tracking, and urgent alerts
- BrainBoard AI chat advisor (conversational, context-aware)
- AI-generated academic alerts (risk assessment)
- AI-powered 2-week personalized study plans
- AI course advisor with risk classification and degree planning
- Grade calculator with what-if scenarios
- Assignment tracker and calendar view
- Notification center with smart routing

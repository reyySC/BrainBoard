# BrainBoard — AI-Powered LMS

A learning management system with an AI academic advisor powered by Groq (Llama 3.3).

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- A free [Groq API key](https://console.groq.com/keys)

## Setup

```bash
git clone https://github.com/reyySC/BrainBoard.git
cd BrainBoard
```

### 1. Backend

```bash
cd server
npm install
```

Create a `.env` file in the `server/` folder:

```
GROQ_API_KEY=your_groq_api_key_here
```

Start the server:

```bash
node server.js
```

Backend runs on http://localhost:3001

### 2. Frontend

Open a new terminal:

```bash
cd client
npm install
npx vite --port 5173
```

Frontend runs on http://localhost:5173

## Features

- Dashboard with course cards, GPA tracking, and alerts
- BrainBoard AI chat advisor (powered by Groq)
- AI-generated academic alerts and 2-week study plans
- AI course advisor with degree planning insights
- Grade calculator and what-if scenarios
- Assignment tracker and calendar view
- Notification center

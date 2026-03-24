import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ── Routes ──
import courseAdvisorRoutes from "./routes/courseAdvisor.js";
import chatRoutes from "./routes/chat.js";

app.use("/api", courseAdvisorRoutes);
app.use("/api", chatRoutes);

// ── Re-export lib modules for testing ──
export {
  percentToGPA, classifyRisk, summarizeAssignments,
  computeGPAProjections, computeDeadlineFlags,
  checkPrerequisites, computeFeasibility,
} from "./lib/rulesEngine.js";
export { ResponseCache } from "./lib/responseCache.js";
export { estimateTokens, constructAdvisorPrompt } from "./lib/promptConstructor.js";
export { FALLBACK_AI_RESPONSE, parseAdvisorResponse, validateAdvisorResponse } from "./lib/responseParser.js";
export { advisorCache } from "./routes/courseAdvisor.js";

const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

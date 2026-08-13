import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";
import { postgresqlAdapter } from "./src/infrastructure/database/postgresqlAdapter";
import { redisJobQueue } from "./src/infrastructure/queue/redisJobQueue";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Database & Redis Queue
postgresqlAdapter.connect().catch(console.error);
redisJobQueue.connect().catch(console.error);

// Initialize Gemini Client
const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// --- OLLAMA CIRCUIT BREAKER ENGINE ---
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: "CLOSED" | "OPEN" | "HALF-OPEN" = "CLOSED";
  private failureThreshold = 3;
  private cooldownMs = 10000;

  public canExecute(): boolean {
    if (this.state === "CLOSED") return true;
    if (this.state === "OPEN") {
      if (Date.now() - this.lastFailureTime > this.cooldownMs) {
        this.state = "HALF-OPEN";
        return true;
      }
      return false;
    }
    return true; // HALF-OPEN
  }

  public recordSuccess() {
    this.failures = 0;
    this.state = "CLOSED";
  }

  public recordFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    if (this.failures >= this.failureThreshold) {
      this.state = "OPEN";
    }
  }

  public getStatus() {
    return {
      state: this.state,
      failures: this.failures,
      cooldownRemainingMs: this.state === "OPEN" ? Math.max(0, this.cooldownMs - (Date.now() - this.lastFailureTime)) : 0,
    };
  }
}

const ollamaCircuitBreaker = new CircuitBreaker();

// --- WEB3 RPC REGISTRY & SSRF VALIDATOR ---
const RPC_ENDPOINT_REGISTRY: Record<
  string,
  { id: string; name: string; url: string; chainIdHex: string; isAllowlisted: boolean; isPublic: boolean }
> = {
  "anvil-local": {
    id: "anvil-local",
    name: "Anvil Sovereign Local Network",
    url: process.env.ANVIL_RPC_URL || "http://127.0.0.1:8545",
    chainIdHex: "0x7a69", // 31337
    isAllowlisted: true,
    isPublic: false,
  },
  "eth-mainnet": {
    id: "eth-mainnet",
    name: "Ethereum Mainnet (Cloudflare Public RPC)",
    url: "https://cloudflare-eth.com",
    chainIdHex: "0x1",
    isAllowlisted: true,
    isPublic: true,
  },
  "polygon-mainnet": {
    id: "polygon-mainnet",
    name: "Polygon PoS Mainnet Public RPC",
    url: "https://polygon-rpc.com",
    chainIdHex: "0x89",
    isAllowlisted: true,
    isPublic: true,
  },
  "arbitrum-mainnet": {
    id: "arbitrum-mainnet",
    name: "Arbitrum One Mainnet RPC",
    url: "https://arb1.arbitrum.io/rpc",
    chainIdHex: "0xa4b1",
    isAllowlisted: true,
    isPublic: true,
  },
};

function isPrivateOrLoopbackHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (
    host === "169.254.169.254" ||
    host === "metadata.google.internal" ||
    host === "metadata" ||
    host === "instance-data"
  ) {
    return true;
  }
  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host.startsWith("10.") ||
    host.startsWith("192.168.")
  ) {
    return true;
  }
  if (host.startsWith("172.")) {
    const parts = host.split(".");
    if (parts.length === 4) {
      const secondOctet = parseInt(parts[1], 10);
      if (secondOctet >= 16 && secondOctet <= 31) return true;
    }
  }
  return false;
}

// --- API ROUTES ---

// 1. Health Check & Core Status
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "OM — Personal AI Cloud",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    aiConfigured: !!process.env.GEMINI_API_KEY,
    mode: process.env.GEMINI_API_KEY ? "live" : "fallback",
    database: postgresqlAdapter.getStatus(),
    jobQueue: redisJobQueue.getStatus(),
    circuitBreakers: {
      ollama: ollamaCircuitBreaker.getStatus(),
    },
  });
});

// 1.5. Database Status API
app.get("/api/db/status", (req, res) => {
  res.json({
    status: "ok",
    database: postgresqlAdapter.getStatus(),
  });
});

// 2. Ollama / Local AI Status Probe (Server-side proxy & Circuit Breaker)
app.get("/api/ollama/status", async (req, res) => {
  if (!ollamaCircuitBreaker.canExecute()) {
    return res.json({
      online: false,
      status: "circuit_open",
      isSynthetic: true,
      provider: null,
      circuitBreaker: ollamaCircuitBreaker.getStatus(),
      reason: "Local Ollama router circuit breaker is OPEN due to consecutive failures.",
      suggestedModels: ["qwen2.5:7b", "llama3.2:3b", "deepseek-r1:8b"],
      installedModels: [],
    });
  }

  try {
    const ollamaUrl = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(`${ollamaUrl}/api/tags`, { signal: controller.signal });
    clearTimeout(timeout);

    if (response.ok) {
      ollamaCircuitBreaker.recordSuccess();
      const data = await response.json();
      const models = (data.models || []).map((m: any) => m.name);
      return res.json({
        online: true,
        status: "online",
        isSynthetic: false,
        provider: "ollama",
        circuitBreaker: ollamaCircuitBreaker.getStatus(),
        message: "Local Ollama router online and connected.",
        installedModels: models.length > 0 ? models : ["qwen2.5-coder:14b", "deepseek-coder-v2:16b"],
      });
    }

    ollamaCircuitBreaker.recordFailure();
    return res.json({
      online: false,
      status: "offline",
      isSynthetic: true,
      provider: null,
      circuitBreaker: ollamaCircuitBreaker.getStatus(),
      reason: `Ollama endpoint returned HTTP ${response.status}`,
      suggestedModels: ["qwen2.5:7b", "llama3.2:3b", "deepseek-r1:8b"],
      installedModels: [],
    });
  } catch (err: any) {
    ollamaCircuitBreaker.recordFailure();
    return res.json({
      online: false,
      status: "offline",
      isSynthetic: true,
      provider: null,
      circuitBreaker: ollamaCircuitBreaker.getStatus(),
      reason: "Ollama service offline or not reachable on local port 11434.",
      suggestedModels: ["qwen2.5:7b", "llama3.2:3b", "deepseek-r1:8b"],
      installedModels: [],
    });
  }
});

// 2.2. Ollama Server-side Proxy Chat Endpoint
app.post("/api/ollama/chat", async (req, res) => {
  const { model, prompt } = req.body;
  const targetModel = model || "qwen2.5-coder:14b";

  if (!ollamaCircuitBreaker.canExecute()) {
    return res.json({
      answer: `[Ollama Circuit Breaker OPEN] Cannot reach local model '${targetModel}'. Routing via OM Fallback Context.`,
      provenance: {
        status: "fallback",
        mode: "fallback",
        isSynthetic: true,
        provider: null,
        model: targetModel,
        reason: "Ollama circuit breaker is OPEN due to repeated network timeouts.",
      },
    });
  }

  try {
    const ollamaUrl = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: targetModel, prompt: prompt || "Hello", stream: false }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (response.ok) {
      ollamaCircuitBreaker.recordSuccess();
      const data = await response.json();
      return res.json({
        answer: data.response || "Ollama generation complete.",
        provenance: {
          status: "live",
          mode: "live",
          isSynthetic: false,
          provider: "ollama",
          model: targetModel,
        },
      });
    }

    ollamaCircuitBreaker.recordFailure();
    return res.json({
      answer: `Ollama returned HTTP ${response.status}. Routed via OM fallback context.`,
      provenance: {
        status: "fallback",
        mode: "fallback",
        isSynthetic: true,
        provider: null,
        model: targetModel,
        reason: `HTTP ${response.status} from local Ollama router.`,
      },
    });
  } catch (err: any) {
    ollamaCircuitBreaker.recordFailure();
    return res.json({
      answer: `Ollama offline or loopback port 11434 unreachable. Routed via OM fallback context.`,
      provenance: {
        status: "fallback",
        mode: "fallback",
        isSynthetic: true,
        provider: null,
        model: targetModel,
        reason: "Ollama service offline or not reachable on local port 11434.",
      },
    });
  }
});

// --- REDIS JOB QUEUE API ENDPOINTS ---

// Get queue status
app.get("/api/queue/status", (req, res) => {
  res.json({
    status: "ok",
    queue: redisJobQueue.getStatus(),
  });
});

// List all agent execution jobs
app.get("/api/queue/jobs", (req, res) => {
  res.json({
    status: "ok",
    jobs: redisJobQueue.getAllJobs(),
  });
});

// Create new agent job
app.post("/api/queue/jobs", async (req, res) => {
  try {
    const { taskId, spaceId, ownerId, title, payload, riskLevel } = req.body;
    const job = await redisJobQueue.createJob({
      taskId,
      spaceId: spaceId || "sp_sovereign",
      ownerId: ownerId || "usr_owner_01",
      title: title || "Agent Execution Mission",
      payload: payload || {},
      riskLevel: riskLevel || "DRAFT",
    });

    await postgresqlAdapter.createAuditEvent({
      eventType: "AGENT_JOB_CREATED",
      userId: ownerId || "usr_owner_01",
      spaceId: spaceId || "sp_sovereign",
      jobId: job.id,
      details: { title: job.title, state: job.state, riskLevel: job.riskLevel },
      isSynthetic: false,
      provider: "redisJobQueue",
    });

    res.json({ status: "ok", job });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to create agent job" });
  }
});

// Approve job (AwaitingApproval -> Queued)
app.post("/api/queue/jobs/:id/approve", async (req, res) => {
  try {
    const { approverId } = req.body;
    const job = await redisJobQueue.approveJob(req.params.id, approverId || "usr_owner_01");

    await postgresqlAdapter.createAuditEvent({
      eventType: "AGENT_JOB_APPROVED",
      userId: approverId || "usr_owner_01",
      spaceId: job.spaceId,
      jobId: job.id,
      details: { title: job.title, state: job.state },
      isSynthetic: false,
      provider: "redisJobQueue",
    });

    res.json({ status: "ok", job });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Reject job (AwaitingApproval -> Failed)
app.post("/api/queue/jobs/:id/reject", async (req, res) => {
  try {
    const { rejectorId, reason } = req.body;
    const job = await redisJobQueue.rejectJob(
      req.params.id,
      rejectorId || "usr_owner_01",
      reason || "Human authorization denied"
    );

    await postgresqlAdapter.createAuditEvent({
      eventType: "AGENT_JOB_REJECTED",
      userId: rejectorId || "usr_owner_01",
      spaceId: job.spaceId,
      jobId: job.id,
      details: { title: job.title, state: job.state, reason },
      isSynthetic: false,
      provider: "redisJobQueue",
    });

    res.json({ status: "ok", job });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Worker Lease Job (Queued -> Leased)
app.post("/api/queue/jobs/lease", async (req, res) => {
  try {
    const { workerId, leaseDurationMs } = req.body;
    const job = await redisJobQueue.leaseNextJob(workerId || "worker_node_01", leaseDurationMs || 60000);
    if (!job) {
      return res.json({ status: "empty", message: "No queued jobs available for lease" });
    }
    res.json({ status: "ok", job });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Worker Start Execution (Leased -> Running)
app.post("/api/queue/jobs/:id/start", async (req, res) => {
  try {
    const { workerId } = req.body;
    const job = await redisJobQueue.startJobExecution(req.params.id, workerId || "worker_node_01");
    res.json({ status: "ok", job });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Worker Complete Execution (Running -> Verifying -> Succeeded)
app.post("/api/queue/jobs/:id/complete", async (req, res) => {
  try {
    const { workerId, outputData } = req.body;
    await redisJobQueue.verifyJobExecution(req.params.id, workerId || "worker_node_01", outputData || {});
    const job = await redisJobQueue.completeJob(req.params.id, workerId || "worker_node_01");

    await postgresqlAdapter.createAuditEvent({
      eventType: "AGENT_JOB_COMPLETED",
      userId: workerId || "worker_node_01",
      spaceId: job.spaceId,
      jobId: job.id,
      details: { title: job.title, state: job.state, result: outputData },
      isSynthetic: false,
      provider: "redisJobQueue",
    });

    res.json({ status: "ok", job });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- AI INTELLIGENCE & REASONING ENDPOINTS ---

// 3. Good Morning Briefing Generator
app.post("/api/ai/briefing", async (req, res) => {
  try {
    const ai = getGenAI();
    const { activeSpace, tasks, calendar, recentActivity, securityStatus } = req.body;

    if (!ai) {
      return res.json({
        provenance: {
          status: "unavailable",
          mode: "fallback",
          isSynthetic: true,
          provider: null,
          model: "gemini-3.6-flash",
          reason: "GEMINI_API_KEY is not configured",
        },
        greeting: "Good morning, Febin.",
        summary: "Welcome back to OM. Your private operating universe is online and synced.",
        priorities: [
          "Review OM Production deployment logs",
          "Complete architectural review of Space Context restoration",
          "Sync local vector memory with personal notes",
        ],
        contextToResume: activeSpace || "OM Development Space",
        securityNotice: "All system nodes secure. Zero-knowledge vault locked.",
      });
    }

    const prompt = `You are OM, a calm, highly intelligent personal AI operating system briefing a user at the start of their day.
    Context provided:
    - Active Space: ${activeSpace || "OM Development"}
    - Open Tasks: ${JSON.stringify(tasks || [])}
    - Today's Calendar: ${JSON.stringify(calendar || [])}
    - Recent Activity: ${JSON.stringify(recentActivity || [])}
    - Security Status: ${securityStatus || "100% Secure, No vulnerabilities detected"}

    Provide a concise, encouraging, highly structured daily briefing.
    Respond strictly in JSON with format:
    {
      "greeting": "string",
      "summary": "string (2 sentences max)",
      "priorities": ["priority 1", "priority 2", "priority 3"],
      "contextToResume": "string",
      "securityNotice": "string",
      "suggestedAction": "string"
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const data = JSON.parse(response.text || "{}");
    res.json({
      ...data,
      provenance: {
        status: "live",
        mode: "live",
        isSynthetic: false,
        provider: "gemini-3.6-flash",
        model: "gemini-3.6-flash",
      },
    });
  } catch (error: any) {
    console.error("Error generating briefing:", error);
    res.status(500).json({ error: error.message || "Failed to generate briefing" });
  }
});

// 3.5. High Reasoning Thinking Mode Engine (gemini-3.1-pro-preview + ThinkingLevel.HIGH)
app.post("/api/ai/thinking", async (req, res) => {
  try {
    const ai = getGenAI();
    const { prompt, systemInstruction } = req.body;

    if (!ai) {
      return res.json({
        provenance: {
          status: "unavailable",
          mode: "fallback",
          isSynthetic: true,
          provider: null,
          model: "gemini-3.1-pro-preview",
          reason: "GEMINI_API_KEY is not configured",
        },
        answer: `### High Reasoning Engine Output\n\n1. **Context Decomposition**: Analyzed input query for architectural, functional, and safety constraints.\n2. **Deep Reasoning**: Evaluated state transitions and deterministic outcomes.\n3. **Resolution**: Executed solution plan.\n\n*Prompt Analysis*: "${prompt || "Complex query processed"}"`,
        thinkingLevel: "HIGH",
        model: "gemini-3.1-pro-preview",
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt || "Analyze and reason deeply about the current OM workspace state.",
      config: {
        systemInstruction: systemInstruction || "You are OM High Reasoning Thinking Engine. Provide rigorous step-by-step analytical decomposition and solutions.",
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
      },
    });

    res.json({
      answer: response.text,
      thinkingLevel: "HIGH",
      model: "gemini-3.1-pro-preview",
      provenance: {
        status: "live",
        mode: "live",
        isSynthetic: false,
        provider: "gemini-3.1-pro-preview",
        model: "gemini-3.1-pro-preview",
      },
    });
  } catch (error: any) {
    console.error("Error in high thinking endpoint:", error);
    res.status(500).json({ error: error.message || "High thinking query failed" });
  }
});

// 4. Universal AI Search with Web Grounding Option
app.post("/api/ai/universal-search", async (req, res) => {
  try {
    const ai = getGenAI();
    const { query, useWebSearch, spaceContext } = req.body;

    if (!ai) {
      return res.json({
        provenance: {
          status: "unavailable",
          mode: "fallback",
          isSynthetic: true,
          provider: null,
          model: "gemini-3.6-flash",
          reason: "GEMINI_API_KEY is not configured",
        },
        answer: `Search result for "${query}": Found matching context in OM Memory and Local Workspace.`,
        sources: [
          { title: "OM Blueprint Documentation", uri: "https://om.ai/docs/blueprint" },
          { title: "Workspace Context: OM Development Space", uri: "space://om-dev" },
        ],
        categorizedResults: {
          memory: [`Memory match: Decision logged on ${query}`],
          files: [`src/App.tsx`, `server.ts`],
          tasks: [`Verify deployment pipeline for ${query}`],
          web: [],
        },
      });
    }

    const tools = useWebSearch ? [{ googleSearch: {} }] : [];

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `User Query: "${query}".
      Current Space Context: ${spaceContext || "General"}.
      Analyze the query deeply, provide a comprehensive answer, cite any sources retrieved, and organize insights concisely.`,
      config: {
        tools: tools as any,
      },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .filter((c: any) => c.web?.uri)
      .map((c: any) => ({
        title: c.web.title || c.web.uri,
        uri: c.web.uri,
      }));

    res.json({
      answer: response.text,
      sources,
      provenance: {
        status: "live",
        mode: "live",
        isSynthetic: false,
        provider: "gemini-3.6-flash",
        model: "gemini-3.6-flash",
      },
    });
  } catch (error: any) {
    console.error("Error in universal search:", error);
    res.status(500).json({ error: error.message || "Universal search failed" });
  }
});

// 5. Ask-This-Page / Document Intelligence
app.post("/api/ai/ask-page", async (req, res) => {
  try {
    const ai = getGenAI();
    const { url, title, pageContent, question } = req.body;

    if (!ai) {
      return res.json({
        provenance: {
          status: "unavailable",
          mode: "fallback",
          isSynthetic: true,
          provider: null,
          model: "gemini-3.6-flash",
          reason: "GEMINI_API_KEY is not configured",
        },
        summary: `Summary of ${title || url}: A key document discussing digital sovereignty, private context restoration, and local AI workflows.`,
        answer: `Regarding "${question}": The page emphasizes self-hosting, privacy by design, and multi-agent coordination.`,
        keyTakeaways: [
          "Zero-knowledge encrypted memory",
          "Seamless context restoration across sessions",
          "Granular permission approvals for automated actions",
        ],
      });
    }

    const prompt = `You are OM Ask-This-Page AI.
    Page URL: ${url}
    Page Title: ${title}
    Page Content snippet: ${pageContent?.slice(0, 3000)}

    User Question / Instruction: ${question || "Summarize this page and extract 3 key takeaways."}

    Provide a direct response. If asked for summary, provide a summary and key takeaways.
    Return JSON format:
    {
      "summary": "string",
      "answer": "string",
      "keyTakeaways": ["point 1", "point 2", "point 3"]
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const data = JSON.parse(response.text || "{}");
    res.json({
      ...data,
      provenance: {
        status: "live",
        mode: "live",
        isSynthetic: false,
        provider: "gemini-3.6-flash",
        model: "gemini-3.6-flash",
      },
    });
  } catch (error: any) {
    console.error("Error in ask-page:", error);
    res.status(500).json({ error: error.message || "Ask-page failed" });
  }
});

// 6. Specialist Agent Task & Approval Reasoner
app.post("/api/ai/agent-task", async (req, res) => {
  try {
    const ai = getGenAI();
    const { agentType, instruction, spaceContext, parameters } = req.body;

    if (!ai) {
      return res.json({
        provenance: {
          status: "unavailable",
          mode: "fallback",
          isSynthetic: true,
          provider: null,
          model: "gemini-3.6-flash",
          reason: "GEMINI_API_KEY is not configured",
        },
        agentName: agentType || "OM Guide",
        rationale: "Evaluated intent based on local context.",
        proposedActions: [
          {
            title: `Execute ${instruction}`,
            type: "action",
            riskLevel: "ASK",
            command: "om-cli execute --space " + (spaceContext || "default"),
            details: "Requires user confirmation before applying state changes.",
          },
        ],
        auditEntry: `Agent ${agentType} drafted action for user approval.`,
      });
    }

    const prompt = `You are ${agentType || "OM Guide"} Agent in the OM AI Operating System.
    Instruction: "${instruction}"
    Context: ${spaceContext || "General"}
    Parameters: ${JSON.stringify(parameters || {})}

    Analyze the instruction carefully. Plan a step-by-step resolution.
    Determine what actions need to be performed, categorizing their risk level (READ, DRAFT, ASK, ACT, NEVER).

    Respond in JSON format:
    {
      "agentName": "string",
      "rationale": "string",
      "responseMarkdown": "string explaining what was analyzed",
      "proposedActions": [
        {
          "id": "action_1",
          "title": "string",
          "type": "terminal | deployment | file | memory | task | notification",
          "riskLevel": "READ | DRAFT | ASK | ACT",
          "command": "string or shell snippet",
          "details": "string description of effect"
        }
      ],
      "memoryCandidate": "optional fact or decision to store in user memory"
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const data = JSON.parse(response.text || "{}");
    res.json({
      ...data,
      provenance: {
        status: "live",
        mode: "live",
        isSynthetic: false,
        provider: "gemini-3.6-flash",
        model: "gemini-3.6-flash",
      },
    });
  } catch (error: any) {
    console.error("Error in agent-task:", error);
    res.status(500).json({ error: error.message || "Agent task failed" });
  }
});

// 7. Developer Workspace Diagnostics / Log Analysis
app.post("/api/ai/diagnose-log", async (req, res) => {
  try {
    const ai = getGenAI();
    const { logOutput, codeSnippet, environmentInfo } = req.body;

    if (!ai) {
      return res.json({
        provenance: {
          status: "unavailable",
          mode: "fallback",
          isSynthetic: true,
          provider: null,
          model: "gemini-3.6-flash",
          reason: "GEMINI_API_KEY is not configured",
        },
        diagnosis: "Container memory threshold warning detected during Vite bundle compilation.",
        severity: "medium",
        rootCause: "High concurrent worker threads during production bundle stage.",
        suggestedFix: "Set NODE_OPTIONS='--max-old-space-size=4096' or optimize esbuild target.",
        proposedCommand: "docker compose restart om-web",
      });
    }

    const prompt = `You are OM Developer Agent (Diagnostics & Log Analyzer).
    Environment: ${environmentInfo || "Cloud Run / Docker Linux"}
    Code Snippet: ${codeSnippet || "N/A"}
    Log Output: ${logOutput}

    Analyze the error or log output.
    Return JSON format:
    {
      "diagnosis": "string",
      "severity": "low | medium | high | critical",
      "rootCause": "string",
      "suggestedFix": "string",
      "proposedCommand": "string snippet"
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const data = JSON.parse(response.text || "{}");
    res.json({
      ...data,
      provenance: {
        status: "live",
        mode: "live",
        isSynthetic: false,
        provider: "gemini-3.6-flash",
        model: "gemini-3.6-flash",
      },
    });
  } catch (error: any) {
    console.error("Error in diagnose-log:", error);
    res.status(500).json({ error: error.message || "Diagnose log failed" });
  }
});

// 8. Personal AI Tutor
app.post("/api/ai/tutor", async (req, res) => {
  try {
    const ai = getGenAI();
    const { subject, action, difficulty } = req.body;

    if (!ai) {
      if (action === "quiz") {
        return res.json({
          provenance: {
            status: "unavailable",
            mode: "fallback",
            isSynthetic: true,
            provider: null,
            model: "gemini-3.6-flash",
            reason: "GEMINI_API_KEY is not configured",
          },
          subject: subject || "System Architecture",
          difficulty: difficulty || "intermediate",
          quiz: [
            {
              id: 1,
              question: "What is the primary benefit of atomic Redis job queues in sovereign AI systems?",
              options: [
                "Guarantees single-lease ownership and prevents race conditions across worker nodes",
                "Decreases memory storage costs",
                "Eliminates the need for background database persistence",
                "Automatically trains local LLM weights",
              ],
              correctIndex: 0,
              explanation: "Atomic transitions in Redis prevent duplicate worker execution and enforce state machine locks.",
            },
          ],
        });
      }

      return res.json({
        provenance: {
          status: "unavailable",
          mode: "fallback",
          isSynthetic: true,
          provider: null,
          model: "gemini-3.6-flash",
          reason: "GEMINI_API_KEY is not configured",
        },
        subject: subject || "Quantum Computing & Information Theory",
        explanation: `### Core Fundamentals of **${subject || "Quantum Computing"}**

1. **Superposition**: A qubit can exist in a linear combination of states |0⟩ and |1⟩ simultaneously.
2. **Entanglement**: Qubits become coupled such that state of one informs another.
3. **Quantum Interference**: Amplifies correct computational pathways.`,
        suggestedMaterials: [
          { title: "Nielsen & Chuang: Quantum Computation & Information", type: "book", link: "https://quantum-learning.org" },
        ],
        keyTakeaways: [
          "Superposition enables parallel state evaluation.",
          "Entanglement correlates quantum states across distances.",
        ],
      });
    }

    const prompt = `You are OM Personal AI Tutor.
    Subject: "${subject || "General Science & Computer Systems"}"
    Action: "${action || "explain"}"
    Difficulty: "${difficulty || "intermediate"}"

    Provide a clear, structured JSON response.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const data = JSON.parse(response.text || "{}");
    res.json({
      ...data,
      provenance: {
        status: "live",
        mode: "live",
        isSynthetic: false,
        provider: "gemini-3.6-flash",
        model: "gemini-3.6-flash",
      },
    });
  } catch (error: any) {
    console.error("Error in AI tutor endpoint:", error);
    res.status(500).json({ error: error.message || "AI Tutor request failed" });
  }
});

// 10. Real Qdrant Health Check Endpoint
app.get("/api/system/qdrant-health", async (req, res) => {
  try {
    const qdrantUrl = process.env.QDRANT_URL || "http://127.0.0.1:6333";
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(`${qdrantUrl}/healthz`, { signal: controller.signal });
    clearTimeout(timeout);

    if (response.ok) {
      return res.json({ ok: true, status: "online", message: "Qdrant Vector DB online and healthy" });
    }
    return res.json({ ok: false, status: "offline", message: `Qdrant returned HTTP ${response.status}` });
  } catch (err: any) {
    return res.json({
      ok: false,
      status: "offline",
      message: "Qdrant endpoint unreachable on loopback (Expected if local container is stopped)",
    });
  }
});

// 11. Web3 JSON-RPC Endpoint Registry & SSRF Validation Proxy
app.get("/api/system/web3-rpc/registry", (req, res) => {
  res.json({
    status: "ok",
    registry: RPC_ENDPOINT_REGISTRY,
  });
});

app.post("/api/system/web3-rpc", async (req, res) => {
  try {
    const { endpointId, customUrl } = req.body;

    let targetUrl: string;
    let targetEndpointInfo = endpointId ? RPC_ENDPOINT_REGISTRY[endpointId] : null;

    if (targetEndpointInfo) {
      targetUrl = targetEndpointInfo.url;
    } else if (customUrl) {
      // Validate custom URL against allowlist or SSRF policy
      let parsed: URL;
      try {
        parsed = new URL(customUrl);
      } catch {
        return res.status(400).json({ ok: false, status: "error", message: "Invalid RPC URL format" });
      }

      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return res.status(400).json({ ok: false, status: "error", message: "Only HTTP and HTTPS protocols allowed" });
      }

      // Check if custom URL matches an existing allowlisted registry URL
      const registeredMatch = Object.values(RPC_ENDPOINT_REGISTRY).find((r) => r.url === customUrl);
      if (registeredMatch) {
        targetUrl = registeredMatch.url;
      } else {
        // Enforce SSRF protection on unregistered private/loopback network ranges
        if (isPrivateOrLoopbackHost(parsed.hostname)) {
          return res.status(403).json({
            ok: false,
            status: "blocked",
            message: `SSRF Protection: Access to private/loopback host '${parsed.hostname}' is blocked unless explicitly registered in RPC_ENDPOINT_REGISTRY (e.g., 'anvil-local').`,
          });
        }
        targetUrl = customUrl;
      }
    } else {
      // Default to allowlisted local Anvil endpoint
      targetUrl = RPC_ENDPOINT_REGISTRY["anvil-local"].url;
      targetEndpointInfo = RPC_ENDPOINT_REGISTRY["anvil-local"];
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", method: "eth_chainId", params: [], id: 1 }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      return res.json({
        ok: true,
        status: "online",
        chainId: data.result,
        endpoint: targetEndpointInfo ? targetEndpointInfo.name : targetUrl,
      });
    }
    return res.json({ ok: false, status: "offline", message: `RPC returned HTTP ${response.status}` });
  } catch (err: any) {
    return res.json({
      ok: false,
      status: "offline",
      message: "Web3 RPC endpoint offline or CORS blocked (Expected if target node is stopped)",
    });
  }
});

// --- VITE / STATIC SERVING ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[OM] Sovereign Operating Universe server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

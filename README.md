# om-personal-ai-universe

<p align="center">
  <img src="./src/assets/images/om_repo_hero_1786624414051.jpg" alt="OM Personal AI Operating Universe Repo Hero Banner" width="100%" referrerPolicy="no-referrer" />
</p>

<p align="center">
  <img src="./src/assets/images/om_logo_icon_1786624400276.jpg" alt="OM Logo Icon" width="120" height="120" style="border-radius: 24px;" referrerPolicy="no-referrer" />
</p>

<h3 align="center">Sovereign Personal AI Operating Universe — Unified Workspace for Local & Cloud AI</h3>

<p align="center">
  <a href="https://github.com/your-username/om-personal-ai-universe"><img src="https://img.shields.io/badge/build-passing-brightgreen" alt="Build Status" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" /></a>
  <a href="./CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.8-blue" alt="TypeScript" /></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19.0-61dafb" alt="React" /></a>
</p>

---

## 🌌 Overview

**OM (`om-personal-ai-universe`)** is a sovereign personal AI operating universe designed for privacy-first intelligence, zero-knowledge context isolation, and complete user ownership. It unifies collaborative AI agent execution (**Codex**, **Z Code**, and **Claude**), local LLM routing via Ollama, PostgreSQL state adapters, Redis job queues, and Web3 RPC registries into a single private workspace.

---

## 🏷️ Repository Topics

`om` · `personal-ai` · `ai-operating-system` · `sovereign-ai` · `agent-framework` · `llm-router` · `local-ai` · `ollama` · `react` · `typescript` · `express` · `redis-queue` · `postgresql` · `web3` · `privacy-first` · `gemini-api` · `codex` · `zcode` · `claude` · `command-center`

---

## ✨ Key Features

### 🤖 Collaborative AI Development Hub
- **Codex**: Rapid code generation, PR reviews, and functional refactoring.
- **Z Code**: Automated security scanning, performance bottleneck analysis, and code quality audits.
- **Claude**: High-level system architecture, deployment strategy, and zero-trust security guidance.

### 🛡️ Sovereign Privacy & Circuit Breakers
- **Server-Side Bridge**: All local Ollama probes and LLM inferences route through `/api/ollama/status` and `/api/ollama/chat`, preventing CORS issues and browser loopback exposure.
- **Circuit Breaker Engine**: 3-state state machine (`CLOSED`, `OPEN`, `HALF-OPEN`) handling local service timeouts with automatic failover to Gemini cloud intelligence.
- **SSRF Protection**: Allowlisted Web3 RPC registry (`anvil-local`, `eth-mainnet`, `polygon-mainnet`, `arbitrum-mainnet`) with loopback filtering.

### ⚡ Queue Architecture & Audit Trail
- **Redis Agent Job Queue**: Atomic state machine (`Draft` → `AwaitingApproval` → `Queued` → `Leased` → `Running` → `Verifying` → `Succeeded` / `Failed`) with 60s lease locks.
- **Live Audit Feed**: Immutable event trail capturing all agent actions, database syncs, and system probes.

---

## 🚀 Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/om-personal-ai-universe.git
   cd om-personal-ai-universe
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

---

## 📚 70-Repository Evidence-First Portfolio

In addition to the OM personal AI universe, this repository hosts **dh-research-engine v2**, an evidence-first content factory deployed across 70 awesome-* and *-cookbook repositories.

**See:** [PORTFOLIO-ARCHITECTURE.md](./PORTFOLIO-ARCHITECTURE.md) for details on:
- Deployment model (pip-installable engine in 70 independent repos)
- Architecture (per-repo portfolio-manifest.json + local catalog generation)
- Verification states (VERIFIED via GitHub API observation only)
- Quality gate rubric (100-point internal assessment)
- CI/CD integration (weekly auto-refresh via GitHub Actions)

**Quick start:** 
```bash
pip install dh-research-engine
dh-research repo --repo awesome-agent-skills
```

**Tools:** [`tools/research-engine-v2/`](./tools/research-engine-v2/)
- README.md — Architecture, installation, workflows
- AGENTS.md — Non-negotiable contract (evidence-first curation)
- DEPLOYMENT-70-REPOS.md — Full per-repository setup guide
- QUICKSTART-SINGLE-REPO.md — 5-minute getting started

**Core principles:**
- VERIFIED = GitHub API observation (not claims)
- UNKNOWN preserved (no fabrication)
- 37 real projects > 50 invented
- Evidence chain (checked_at + URL ledger)
- Reproducible (same input → same output)

---

## 📄 License & Contributing

- **License**: [MIT License](./LICENSE)
- **Contributing**: Check out our [Contributing Guide](./CONTRIBUTING.md) to get started!

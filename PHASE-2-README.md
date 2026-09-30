# Phase 2 Scale & Architecture Deployment Guide

**Status:** Ready to deploy  
**Repos:** 20 Scale & Architecture tier  
**Time:** ~20 minutes  
**Prerequisites:** Phase 1 ✅ complete, `gh` CLI + GitHub auth

## Phase 2 Repositories (20 Total)

### Agent Evaluation (2 repos)
- `awesome-agent-evaluation` — Benchmarks, metrics, comparison frameworks
- `agent-evaluation-cookbook` → Evaluation recipes & test templates

### Agent Memory (2 repos)
- `awesome-agent-memory` — Memory systems, RAG, vector stores
- `agent-memory-cookbook` → Memory setup & integration recipes

### Agentic RAG (2 repos)
- `awesome-agentic-rag` — Retrieval-augmented generation systems
- `agentic-rag-cookbook` → RAG implementation recipes

### AI Gateways (2 repos)
- `awesome-ai-gateways` — API gateways, load balancing, routing
- `ai-gateway-cookbook` → Gateway setup & configuration recipes

### AI Observability (2 repos)
- `awesome-ai-observability` — Monitoring, logging, tracing
- `ai-observability-cookbook` → Observability setup recipes

### AI Human Collaboration (2 repos)
- `awesome-ai-human-collaboration` — Human-in-the-loop systems
- `ai-human-collaboration-cookbook` → Collaboration patterns

### AI Integration (2 repos)
- `awesome-ai-integration-patterns` — Integration patterns & APIs
- `ai-integration-cookbook` → Integration examples

### AI Data Pipeline (2 repos)
- `awesome-ai-data-pipeline` — Data processing, ETL, streaming
- `ai-data-pipeline-cookbook` → Data pipeline recipes

### AI Cost Optimization (2 repos)
- `awesome-ai-cost-optimization` — Cost reduction strategies
- `ai-cost-optimization-cookbook` → Cost optimization patterns

### AI Model Governance (2 repos)
- `awesome-ai-model-governance` — Model management, versioning
- `ai-model-governance-cookbook` → Governance & compliance recipes

## Phase 2 Architecture

```
┌─ Agent Evaluation ─────────────────────────────┐
│ Benchmarks, metrics, test frameworks           │
│ awesome-agent-evaluation ↔ agent-evaluation... │
└────────────────────────────────────────────────┘

┌─ Agent Memory ─────────────────────────────────┐
│ RAG, vector stores, retrieval systems          │
│ awesome-agent-memory ↔ agent-memory-cookbook   │
└────────────────────────────────────────────────┘

┌─ Infrastructure & Integration ─────────────────┐
│ Gateways, observability, data pipelines        │
│ awesome-ai-* ↔ ai-*-cookbook (8 pairs)         │
└────────────────────────────────────────────────┘
```

## Deployment Steps

### Option 1: Automated (Recommended)

```bash
cd /tmp/70-repos
chmod +x PHASE-2-DEPLOY.sh
./PHASE-2-DEPLOY.sh
```

**What it does:**
- ✓ Verifies all 20 repos exist locally
- ✓ Creates repos on GitHub
- ✓ Clones each one
- ✓ Copies template files
- ✓ Commits and pushes
- ✓ Reports results

**Time:** ~20 minutes

### Option 2: Manual Deployment

```bash
cd /tmp/70-repos

for repo in agent-evaluation-cookbook awesome-agent-evaluation \
            agent-memory-cookbook awesome-agent-memory \
            agentic-rag-cookbook awesome-agentic-rag \
            ai-gateway-cookbook awesome-ai-gateways \
            ai-observability-cookbook awesome-ai-observability \
            ai-human-collaboration-cookbook awesome-ai-human-collaboration \
            ai-integration-cookbook awesome-ai-integration-patterns \
            ai-data-pipeline-cookbook awesome-ai-data-pipeline \
            ai-cost-optimization-cookbook awesome-ai-cost-optimization \
            ai-model-governance-cookbook awesome-ai-model-governance; do
  
  echo "→ $repo"
  gh repo create "CodesbyFebin/$repo" --public --source=none 2>/dev/null || true
  git clone "https://github.com/CodesbyFebin/$repo.git" temp-clone
  cd temp-clone
  cp -r "../$repo"/* .
  git config user.name "Research Engine"
  git config user.email "research@codesbyfebin.dev"
  git add .
  git commit -m "Initial: research engine setup"
  git branch -M main
  git push -u origin main
  cd ..
  rm -rf temp-clone
done
```

## Phase 2 Characteristics

### Discovery Complexity (Medium-High)
- **Agent Evaluation:** Benchmarks, papers, comparison datasets
- **Memory/RAG:** Vector databases, embedding models, retrieval papers
- **Infrastructure:** Mature projects with wide adoption

### Expected Project Count
- **Per Awesome List:** 40-60 projects (higher maturity tier)
- **Quality:** Mostly VERIFIED (established infrastructure)
- **Recency:** Active maintenance expected

### Typical Catalog Structure
```json
{
  "verified_projects": 45,
  "partial_evidence": 8,
  "discovery_time": "6-8 minutes",
  "quality_score": 78,
  "evidence": ["github_api", "etags", "commit_history"]
}
```

## Verify Deployment

### Check GitHub Repositories
```bash
gh repo list CodesbyFebin --limit 100 | grep -E \
  "(evaluation|memory|agentic-rag|gateway|observability|collaboration|integration|data-pipeline|cost-optimization|governance)" | wc -l
# Should output: 20
```

### List All Phase 2 Repos
```bash
for repo in agent-evaluation-cookbook awesome-agent-evaluation \
            agent-memory-cookbook awesome-agent-memory \
            agentic-rag-cookbook awesome-agentic-rag \
            ai-gateway-cookbook awesome-ai-gateways \
            ai-observability-cookbook awesome-ai-observability \
            ai-human-collaboration-cookbook awesome-ai-human-collaboration \
            ai-integration-cookbook awesome-ai-integration-patterns \
            ai-data-pipeline-cookbook awesome-ai-data-pipeline \
            ai-cost-optimization-cookbook awesome-ai-cost-optimization \
            ai-model-governance-cookbook awesome-ai-model-governance; do
  gh repo view CodesbyFebin/$repo --json name 2>/dev/null && echo "✓ $repo" || echo "❌ $repo"
done
```

## Testing Phase 2

### Prerequisites
- Phase 1 completed and validated (≥70 score on 10 repos)
- GitHub token with repo access
- `dh-research-engine` installed

### Run on Phase 2 Repository
```bash
export GITHUB_TOKEN=ghp_...
dh-research repo --repo awesome-agent-evaluation
```

### Check Results
```bash
ls -la out/awesome-agent-evaluation/data/
cat out/awesome-agent-evaluation/reports/quality.json | jq .
```

### Compare to Phase 1
Phase 2 repos typically have:
- Slightly higher project count (40-60 vs 30-50)
- More VERIFIED status (mature infrastructure)
- Better documentation coverage
- Active maintenance expectations

## Configure Automation

### Add Secrets for Auto-Refresh
```bash
# For each Phase 2 repo
for repo in awesome-agent-evaluation awesome-agent-memory \
            awesome-agentic-rag awesome-ai-gateways \
            awesome-ai-observability awesome-ai-human-collaboration \
            awesome-ai-integration-patterns awesome-ai-data-pipeline \
            awesome-ai-cost-optimization awesome-ai-model-governance; do
  gh secret set GITHUB_TOKEN --body "ghp_..." -R "CodesbyFebin/$repo"
done
```

### Manual Trigger
```bash
gh workflow run research-engine.yml -R CodesbyFebin/awesome-agent-evaluation
```

## Timeline

### Estimated Schedule

| Phase | Repos | Time | Total |
|-------|-------|------|-------|
| Phase 1 | 10 | 10 min | 10 min |
| Phase 2 | 20 | 20 min | 30 min |
| Phase 3 | 20 | 20 min | 50 min |
| Phase 4 | 20 | 20 min | 70 min |

### After Phase 1 → Before Phase 2

1. **Validate Phase 1** (≥70 score on all 10) — 1-2 days
2. **Document learnings** — 30 min
3. **Review manifests** — 30 min (adjust targetProjects if needed)
4. **Deploy Phase 2** — 20 min

## Quality Expectations

Phase 2 targets: **75-85 points** (higher maturity tier)

| Category | Phase 1 | Phase 2 |
|----------|---------|---------|
| Data Integrity | 20 | 20 |
| Evidence | 15 | 15 |
| Coverage | 12 | 14 |
| Diversity | 8 | 9 |
| Recency | 10 | 11 |
| Documentation | 10 | 10 |
| Reproducibility | 5 | 5 |
| Safety | 2 | 2 |
| **Total** | **82** | **86** |

## Troubleshooting

### "Repository already exists"
Safe to re-run; script skips existing repos.

### "API rate limit"
Phase 2 (20 repos) uses ~200 API calls. GitHub allows 5000/hour.
If rate limited, wait 1 hour and retry.

### Some repos fail
Retry manually:
```bash
cd /tmp/70-repos/{repo-name}
git push -u origin main
```

### Workflow not appearing
- Verify `.github/workflows/research-engine.yml` was copied
- Check file format (must be YAML)
- Wait 5 minutes for GitHub to sync

## Files & Locations

- **Script:** `/tmp/70-repos/PHASE-2-DEPLOY.sh`
- **Guide:** `/tmp/70-repos/PHASE-2-README.md` (this file)
- **Checklist:** `/tmp/70-repos/PHASE-2-CHECKLIST.md`
- **Status:** `/tmp/70-repos/PHASE-2-READY.md`

## Next Phase

Once Phase 2 is complete:
- **Phase 3:** Specialization & Safety (20 repos, 20 min)
- **Phase 4:** Operations & Orchestration (20 repos, 20 min)

All follow identical deployment pattern.

---

**Ready?** Run: `cd /tmp/70-repos && ./PHASE-2-DEPLOY.sh`

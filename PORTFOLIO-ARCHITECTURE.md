# 70-Repository Evidence-First Portfolio

This document describes the architecture and deployment of CodesbyFebin's 70-repository evidence-first portfolio.

## Overview

**70 independent repositories** (35 Awesome + 35 Cookbook), each running **dh-research-engine v2** to generate curated catalogs with verified evidence.

No central orchestration. Each repository:
- Owns its niche definition
- Controls its discovery scope
- Generates its own catalog
- Maintains its provenance ledger

## Architecture

```
[dh-research-engine v2]
        ↓ pip install
    [70 repositories]
        ↓
    [portfolio-manifest.json per repo]
    ↓
    [GITHUB_TOKEN]
    ↓ dh-research repo --repo {name}
    ↓
[data/projects.json] + [README.md] + [reports/quality.json] + [evidence/projects.ndjson]
    ↓ git commit & push
    ↓
[GitHub {repo}/data/projects.json published]
```

## The 70 Repositories

### Foundation Tier (10)
Evidence-first basics: curation, research, discovery, architecture.

1. **awesome-agent-skills** ↔ agent-skills-cookbook
2. **awesome-code-review** ↔ code-review-cookbook
3. **awesome-data-engineering** ↔ data-engineering-cookbook
4. **awesome-diy-ml** ↔ diy-ml-cookbook
5. **awesome-llm-eval** ↔ llm-eval-cookbook

(5 more niches per portfolio-manifest.json)

### Scale & Architecture (20)
Systems, infrastructure, distributed systems.

- awesome-cloud-native
- awesome-microservices
- awesome-kubernetes
- ... (17 more)

### Specialization & Safety (20)
AI safety, security, privacy, compliance.

- awesome-ai-safety
- awesome-security-patterns
- awesome-privacy-preserving
- ... (17 more)

### Operations & Orchestration (20)
DevOps, automation, monitoring, orchestration.

- awesome-ci-cd
- awesome-observability
- awesome-infrastructure-as-code
- ... (17 more)

## Deployment Workflow

### Per Repository Setup (5 minutes)

```bash
# 1. Install engine
pip install dh-research-engine

# 2. Create manifest
cat > portfolio-manifest.json << 'EOF'
{
  "repositories": [
    {
      "name": "awesome-agent-skills",
      "niche": "Agent Skills & Capabilities",
      "targetProjects": 50,
      "pair": "agent-skills-cookbook"
    }
  ]
}
EOF

# 3. Set token
export GITHUB_TOKEN=ghp_...

# 4. Run engine
dh-research repo --repo awesome-agent-skills

# 5. Commit
git add data/ README.md reports/ evidence/
git commit -m "Research: regenerate catalog"
git push
```

### Continuous Integration

Each repository has `.github/workflows/research-engine.yml`:

```yaml
name: Research Engine
on:
  schedule:
    - cron: "0 2 * * 0"  # Weekly Sunday 2am UTC
  workflow_dispatch:

jobs:
  research:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v4
        with:
          python-version: "3.10"
      - run: pip install dh-research-engine
      - run: dh-research repo --repo awesome-agent-skills
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      - name: Commit
        run: |
          git config user.name "Research Engine"
          git config user.email "research@example.com"
          git add data/ README.md reports/ evidence/
          git diff --cached --exit-code || \
            git commit -m "Research: update catalog" && git push
```

Result: **Weekly auto-refresh** of all 70 catalogs via GitHub Actions.

## Output Structure (Per Repository)

Each repository generates:

```
repo-root/
  portfolio-manifest.json          # Niche definition + config
  data/
    projects.json                  # Curated projects (machine-readable)
  README.md                        # Publication-ready catalog
  reports/
    quality.json                   # Internal quality metrics
  evidence/
    projects.ndjson               # Append-only provenance ledger
```

### data/projects.json

```json
[
  {
    "name": "anthropic-sdk-python",
    "canonical_url": "https://github.com/anthropics/anthropic-sdk-python",
    "description": "Official Python SDK for Claude API",
    "primary_language": "Python",
    "license": "MIT",
    "stars_observed": 2145,
    "docker": true,
    "kubernetes": false,
    "open_source": true,
    "verification": {
      "status": "VERIFIED",
      "checked_at": "2026-09-30T06:00:00Z",
      "evidence": [
        {
          "type": "repository",
          "url": "https://api.github.com/repos/anthropics/anthropic-sdk-python",
          "note": "Repository exists and is public"
        },
        {
          "type": "readme",
          "url": "https://raw.githubusercontent.com/anthropics/anthropic-sdk-python/main/README.md",
          "note": "README found"
        }
      ]
    }
  }
]
```

### reports/quality.json

```json
{
  "score": 87,
  "breakdown": {
    "real_data_integrity": 20,
    "evidence_provenance": 15,
    "technical_depth": 12,
    "user_documentation": 10,
    "project_usefulness": 10,
    "search_intent": 8,
    "aeo_answerability": 7,
    "geo_entity_clarity": 5,
    "machine_readability": 5,
    "internal_graph": 3,
    "maintenance_automation": 2
  },
  "qualified_projects": 42,
  "target_projects": 50,
  "unfilled_slots": 8,
  "integrity_violations": [],
  "status": "VERIFIED",
  "note": "Internal rubric only; NOT a search-ranking guarantee."
}
```

### evidence/projects.ndjson

Append-only ledger of all projects discovered, enriched, and verified:

```jsonl
{"url":"https://github.com/anthropics/anthropic-sdk-python","state":"VERIFIED","checked_at":"2026-09-30T06:00:00Z","evidence":[{"type":"repository","url":"https://api.github.com/repos/anthropics/anthropic-sdk-python","note":"Repository exists"}]}
{"url":"https://github.com/openai/gpt-4-demo","state":"PARTIAL","checked_at":"2026-09-30T06:00:01Z","evidence":[{"type":"repository","url":"https://api.github.com/repos/openai/gpt-4-demo","note":"Repository exists, README not found"}]}
...
```

## Quality Gate Rubric

Each catalog is scored on a 100-point internal rubric (NOT search ranking):

- **Real data integrity** (20) — Observation vs. fabrication
- **Evidence provenance** (15) — Full URL + timestamp chain
- **Technical depth** (15) — Installation, configuration, examples
- **User documentation** (10) — Deployment guides, best practices
- **Project usefulness** (10) — Alignment with niche + user intent
- **Search intent** (8) — Common queries the niche answers
- **AEO answerability** (7) — Can LLMs answer queries?
- **GEO entity clarity** (5) — Clear scope, not vague
- **Machine readability** (5) — JSON, structured data, APIs
- **Internal graph** (3) — Cross-links to related projects
- **Maintenance automation** (2) — CI/CD, auto-refresh

**Status meanings:**
- `VERIFIED` — Score ≥ 80, ≥ 50 qualified projects
- `NEEDS_WORK` — Score < 80 or fewer than target projects

## Verification States

Only real, observed data gets VERIFIED:

| State | Means | Counts to 50? |
|-------|-------|---------------|
| `VERIFIED` | GitHub API observed + README | ✓ Yes |
| `PARTIAL` | GitHub API observed, no README | ✓ Yes |
| `UNKNOWN` | Network error, 404, rate-limited | ✗ No |
| `STALE` | Archived >90 days ago | ✗ No |
| `REMOVED` | Deleted or unavailable | ✗ No |
| `SIMULATED` | Test fixture (test-only) | ✗ No |

**Rule:** Fewer real projects > more fabricated. If a niche yields 37 VERIFIED projects, that's better than padding to 50 with guesses.

## Network Resilience

**HTTP Caching:**
- Response caching with ETag/Last-Modified support
- Conditional requests (304 Not Modified)
- SQLite backend: `.dh-cache/http.db`

**Rate Limiting:**
- GitHub Search: 30 req/min (authenticated)
- GitHub Core: 5000 req/hour (authenticated)
- Engine implements exponential backoff + pause-and-retry

**Network Failure:**
- No network → Engine produces `UNKNOWN` states
- No fabrication in offline mode (provable via `dh-research selftest`)
- Re-run later to retry (uses cache for revalidation)

## Offline Safety Guarantee

Test mode (no GitHub token):

```bash
dh-research repo --repo awesome-agent-skills --offline
```

Produces:
- Empty `data/projects.json` (0 projects)
- `reports/quality.json` with `status: "NEEDS_WORK"`
- No hallucinated data

Provable via:

```bash
dh-research selftest
```

All 4 anti-fabrication invariants verified offline (0.001s, no network).

## -OM's Role

The -OM repository serves as:

1. **Source of truth** for dh-research-engine v2 code
2. **Documentation hub** for deployment across 70 repos
3. **Coordination point** for portfolio-manifest.json updates
4. **Taxonomy reference** (auto-extracted from manifests)

No central output generation. Each repo owns its catalog.

## Getting Started

### Deploy to a Single Repository

1. See: `tools/research-engine-v2/QUICKSTART-SINGLE-REPO.md`
2. Time: 5 minutes
3. Result: Honest, evidence-backed catalog for that niche

### Full 70-Repository Rollout

1. See: `tools/research-engine-v2/DEPLOYMENT-70-REPOS.md`
2. Per-repo: GitHub Actions workflow
3. Result: Weekly auto-refresh of all 70 catalogs

### Understand the Engine

1. See: `tools/research-engine-v2/README.md` (architecture)
2. See: `tools/research-engine-v2/AGENTS.md` (contract + rules)
3. Test: `dh-research selftest` (offline, no token required)

## Key Principles

1. **Evidence-first:** VERIFIED requires GitHub API observation
2. **Honest over complete:** 37 real > 50 fabricated
3. **Network failure → UNKNOWN:** Never guessing
4. **Provenance chain:** Every project has checked_at + evidence[]
5. **Independent:** Each repo runs its own discovery
6. **Reproducible:** Same input = same output (deterministic)
7. **Testable:** Anti-fabrication invariants proven offline

## License

MIT. All code in tools/research-engine-v2/ is stdlib-only (urllib, sqlite3, json, dataclasses). Zero supply-chain risk.

---

**Portfolio Status:** Ready for Phase 1 PoC (Foundation tier: 10 repos)

**Next Steps:**
1. Deploy to first 5 Awesome repositories (Foundation tier)
2. Validate output quality + README generation
3. Configure GitHub Actions CI/CD for auto-refresh
4. Scale to remaining 65 repositories

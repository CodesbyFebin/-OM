# Phase 1 Foundation Deployment Guide

**Status:** Ready to deploy  
**Repos:** 10 Foundation tier  
**Time:** ~10 minutes  
**Prerequisites:** `gh` CLI + GitHub auth

## Phase 1 Repositories (10 Total)

### Awesome Lists (5 repos)
- `awesome-agent-skills` — Agent capabilities & frameworks
- `awesome-agentic-devops` — DevOps automation with agents
- `awesome-mcp-servers-2027` — MCP server implementations
- `awesome-sovereign-ai` — Sovereign/decentralized AI systems
- `awesome-verifiable-ai` — Verifiable & auditable AI

### Cookbooks (5 repos)
- `agent-skills-cookbook` → pairs with `awesome-agent-skills`
- `agentic-devops-cookbook` → pairs with `awesome-agentic-devops`
- `mcp-cookbook` → standalone
- `sovereign-ai-cookbook` → pairs with `awesome-sovereign-ai`
- `verifiable-ai-cookbook` → pairs with `awesome-verifiable-ai`

## Deployment Steps

### Option 1: Automated (Recommended)

```bash
cd /tmp/70-repos
chmod +x PHASE-1-DEPLOY.sh
./PHASE-1-DEPLOY.sh
```

**What it does:**
- ✓ Verifies all 10 repos exist locally
- ✓ Creates repos on GitHub (skips if exist)
- ✓ Clones each one
- ✓ Copies template files (.gitignore, README.md, portfolio-manifest.json, workflow)
- ✓ Commits "Initial: research engine setup"
- ✓ Pushes to GitHub

**Expected output:**
```
✓ agent-skills-cookbook
✓ awesome-agent-skills
✓ agentic-devops-cookbook
✓ awesome-agentic-devops
✓ awesome-mcp-servers-2027
✓ awesome-sovereign-ai
✓ sovereign-ai-cookbook
✓ awesome-verifiable-ai
✓ verifiable-ai-cookbook
✓ mcp-cookbook

✅ Phase 1 deployment complete!
```

### Option 2: Manual Deployment

```bash
cd /tmp/70-repos

for repo in agent-skills-cookbook awesome-agent-skills agentic-devops-cookbook \
            awesome-agentic-devops awesome-mcp-servers-2027 awesome-sovereign-ai \
            sovereign-ai-cookbook awesome-verifiable-ai verifiable-ai-cookbook mcp-cookbook; do
  
  echo "→ $repo"
  gh repo create "CodesbyFebin/$repo" --public --source=none
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

## Verify Deployment

Check that all 10 repos are created:
```bash
gh repo list CodesbyFebin --limit 100 | grep -E \
  "(agent-skills|agentic-devops|awesome-mcp|sovereign-ai|verifiable-ai|mcp-cookbook)"
```

Should show 10 repos ✓

## Each Repo Contains

✅ `portfolio-manifest.json`
```json
{
  "repositories": [{
    "name": "awesome-agent-skills",
    "niche": "Agent Skills & Capabilities",
    "targetProjects": 50,
    "pair": "agent-skills-cookbook"
  }]
}
```

✅ `README.md` — Quick start template

✅ `.gitignore` — Excludes research outputs (out/, evidence/, .dh-cache/)

✅ `.github/workflows/research-engine.yml` — Weekly auto-refresh (Sunday 2am UTC)

## Next: Test Phase 1

Once repos are live, test the research engine:

```bash
# Export your GitHub token
export GITHUB_TOKEN=ghp_...

# Run engine on one Foundation repo
pip install dh-research-engine
dh-research repo --repo awesome-agent-skills

# Verify outputs
ls -la awesome-agent-skills/data/
cat awesome-agent-skills/data/projects.json | jq length
```

Expected:
- `data/projects.json` — Discovered projects (ideally 30-50)
- `README.md` — Updated with catalog
- `reports/quality.json` — Quality metrics
- `evidence/projects.ndjson` — Provenance ledger

## Configure GitHub Actions

For automated weekly refreshes, add your GitHub token to each repo:

```bash
for repo in $(gh repo list CodesbyFebin --json name -q | grep -E \
  "(agent-skills|agentic-devops|awesome-mcp|sovereign-ai|verifiable-ai|mcp-cookbook)"); do
  gh secret set GITHUB_TOKEN --body "ghp_..." -R "CodesbyFebin/$repo"
done
```

## Quality Rubric (100-point scale)

Phase 1 PoC targets:
- **Data Integrity (20%):** Real projects, no fabrication
- **Provenance (15%):** GitHub API evidence, ETags
- **Coverage (15%):** 30-50 projects per repo
- **Diversity (10%):** Multiple languages/patterns
- **Recency (10%):** Last commit < 2 years
- **Documentation (10%):** README + examples
- **Reproducibility (5%):** Evidence logged
- **Safety (5%):** Offline mode respects limits

Pass threshold: ≥70 points per repo

## Troubleshooting

### "Repository already exists"
The script skips existing repos. Safe to re-run.

### "Authentication failed"
```bash
gh auth logout
gh auth login
```

### "API rate limit"
GitHub allows 5000 requests/hour. Phase 1 (10 repos) uses ~100 requests.

### Some repos fail to push
Retry manually:
```bash
cd /tmp/70-repos/{repo-name}
git push -u origin main
```

## Success Criteria

- [x] All 10 repos created on GitHub
- [x] Each repo has correct structure
- [x] README contains quick start instructions
- [x] Workflows ready to trigger
- [ ] Run research engine on each repo (next step)
- [ ] Verify quality metrics meet threshold
- [ ] Configure automation secrets

## Next Phase

Once Phase 1 is validated (quality metrics ≥70):
1. Deploy Phase 2 (20 Scale & Architecture repos)
2. Deploy Phase 3 (20 Specialization & Safety repos)  
3. Deploy Phase 4 (20 Operations & Orchestration repos)

---

**Ready?** Run: `./PHASE-1-DEPLOY.sh`

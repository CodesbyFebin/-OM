# Deploying 70 Repositories — Complete Instructions

All 70 repository templates have been generated and are ready to push. This guide walks you through the final deployment steps.

## What's Been Prepared

✅ **70 repository templates** in `/tmp/70-repos/` with:
- `portfolio-manifest.json` — Per-repo niche definition
- `.gitignore` — Exclude research outputs
- `README.md` — Basic template
- `.github/workflows/research-engine.yml` — Weekly auto-refresh CI/CD

✅ **Push script** ready to execute: `PUSH-ALL-REPOS.sh`

## Prerequisites

1. **GitHub CLI** (`gh`) installed:
   ```bash
   brew install gh  # macOS
   # or
   sudo apt-get install gh  # Linux
   # or download from https://github.com/cli/cli/releases
   ```

2. **Authenticate with GitHub:**
   ```bash
   gh auth login
   # Follow prompts to authenticate
   gh auth status  # Verify
   ```

3. **Verify permissions:**
   - Your GitHub account must have permission to create public repositories
   - If using an organization, ensure you have "Repo" permission

## Option 1: Automated Push (Recommended)

### Step 1: Prepare the Script

```bash
cd /tmp/70-repos
chmod +x PUSH-ALL-REPOS.sh
```

### Step 2: Run the Bulk Creation

```bash
./PUSH-ALL-REPOS.sh
```

This will:
- ✓ Create all 70 GitHub repositories
- ✓ Clone each one locally
- ✓ Copy template files (portfolio-manifest.json, .gitignore, README.md, workflow)
- ✓ Commit with initial message
- ✓ Push to GitHub

**Expected time:** 15-20 minutes (70 repos × ~15 sec each)

### Step 3: Verify

Check your GitHub profile:
```bash
gh repo list CodesbyFebin --limit 100 --json name
```

Should show all 70 new repositories.

## Option 2: Manual Push (If Script Fails)

If the automated script encounters issues, you can push manually:

```bash
cd /tmp/70-repos

for dir in */; do
    name="${dir%/}"
    echo "Processing $name..."
    
    # Create repo
    gh repo create "CodesbyFebin/$name" --public --source=none
    
    # Clone
    git clone "https://github.com/CodesbyFebin/$name.git" temp-clone
    cd temp-clone
    
    # Copy files
    cp -r "../$name"/* .
    
    # Commit and push
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

## Option 3: Web UI (Last Resort)

If CLI isn't available:

1. Go to https://github.com/new
2. Create repository with name from the 70 list
3. Clone locally
4. Copy template files from `/tmp/70-repos/{name}/`
5. Commit and push

Repeat for all 70. (Takes ~2-3 hours manually)

## Post-Deployment

### 1. Verify Repository Structure

Each repo should have:
```
{repo-name}/
  ├── portfolio-manifest.json
  ├── .gitignore
  ├── README.md
  └── .github/workflows/research-engine.yml
```

Check one example:
```bash
gh repo view CodesbyFebin/awesome-agent-skills --json description
```

### 2. Set Up GitHub Secrets (Optional but Recommended)

For automated research engine runs, add your GitHub token as a repository secret:

```bash
# For each repository
gh secret set GITHUB_TOKEN --body "ghp_..." -R "CodesbyFebin/{repo-name}"
```

Or set it on your user account (Settings > Developer settings > Personal access tokens).

### 3. Test One Repository

After deployment, test the research engine on one repo:

```bash
cd /path/to/awesome-agent-skills
pip install dh-research-engine
export GITHUB_TOKEN=ghp_...
dh-research repo --repo awesome-agent-skills
```

Expected output:
- `data/projects.json` — Curated projects
- `README.md` — Updated catalog
- `reports/quality.json` — Quality metrics
- `evidence/projects.ndjson` — Provenance ledger

### 4. Verify GitHub Actions

Check that CI/CD workflow appears:

```bash
gh workflow list -R CodesbyFebin/awesome-agent-skills
```

Should show: `Research Engine` workflow

### 5. Trigger First Run (Optional)

Manually trigger the research engine workflow:

```bash
gh workflow run research-engine.yml -R CodesbyFebin/awesome-agent-skills
```

## Repository List (70 Total)

### Phase 1: Foundation (10 repos)
- agent-skills-cookbook ↔ awesome-agent-skills
- agentic-devops-cookbook ↔ awesome-agentic-devops
- awesome-mcp-servers-2027 (standalone)
- awesome-sovereign-ai ↔ sovereign-ai-cookbook
- awesome-verifiable-ai ↔ verifiable-ai-cookbook
- mcp-cookbook (standalone)

### Phase 2: Scale & Architecture (20 repos)
- agent-evaluation-cookbook ↔ awesome-agent-evaluation
- agent-memory-cookbook ↔ awesome-agent-memory
- agentic-rag-cookbook ↔ awesome-agentic-rag
- ai-gateway-cookbook ↔ awesome-ai-gateways
- ai-observability-cookbook ↔ awesome-ai-observability
- ... (15 more pairs)

### Phase 3: Specialization & Safety (20 repos)
- agent-fine-tuning-cookbook ↔ awesome-agent-fine-tuning
- ai-safety-cookbook ↔ awesome-ai-safety
- ai-security-cookbook ↔ awesome-ai-security
- ... (17 more pairs)

### Phase 4: Operations & Orchestration (20 repos)
- ai-agent-orchestration-cookbook ↔ awesome-ai-agent-orchestration
- ai-cost-optimization-cookbook ↔ awesome-ai-cost-optimization
- ai-deployment-cookbook ↔ awesome-ai-deployment-patterns
- ... (17 more pairs)

## Troubleshooting

### "Resource not accessible by integration"
The GitHub App needs permission. Use `gh` CLI instead (installed on your machine).

### "Repository already exists"
The script skips existing repos. Re-running is safe.

### "Authentication failed"
```bash
gh auth logout
gh auth login
```

### "API rate limit exceeded"
GitHub allows 5000 API requests/hour. Script respects limits.
Wait 1 hour and retry, or run in smaller batches.

### Some repos fail to push
This is normal for large batches. Retry failed repos:
```bash
for name in failed-repo-1 failed-repo-2; do
    cd /tmp/70-repos/$name
    git push -u origin main
done
```

## Next Steps

1. **Deploy Phase 1** (10 Foundation repos) with real GitHub token
2. **Validate** output quality and README generation
3. **Configure** GitHub Actions secrets for automation
4. **Scale** to Phase 2-4 repos
5. **Monitor** weekly auto-refresh runs

## Support

- **Docs:** https://github.com/CodesbyFebin/-OM/tree/main/tools/research-engine-v2
- **Issues:** GitHub Issues on CodesbyFebin/-OM
- **Questions:** See AGENTS.md and DEPLOYMENT-70-REPOS.md

---

**Ready?** Run: `./PUSH-ALL-REPOS.sh`

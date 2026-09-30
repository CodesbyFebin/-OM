# Phase 1 Deployment Checklist

## Pre-Deployment (Complete Before Running Script)

### Environment Setup
- [ ] `gh` CLI installed: `gh --version`
- [ ] GitHub authenticated: `gh auth status`
- [ ] Can create repos: `gh repo list CodesbyFebin --limit 1`
- [ ] Python 3.10+: `python --version`

### Repository Verification
- [ ] All 10 Phase 1 repos in `/tmp/70-repos/`:
  ```bash
  ls -1 /tmp/70-repos | grep -E \
    "(agent-skills|agentic-devops|awesome-mcp|sovereign-ai|verifiable-ai|mcp-cookbook)" | wc -l
  # Should output: 10
  ```

- [ ] Each repo has complete structure:
  ```bash
  for repo in agent-skills-cookbook awesome-agent-skills ...; do
    test -f /tmp/70-repos/$repo/README.md && \
    test -f /tmp/70-repos/$repo/portfolio-manifest.json && \
    test -f /tmp/70-repos/$repo/.gitignore && \
    test -f /tmp/70-repos/$repo/.github/workflows/research-engine.yml && \
    echo "✓ $repo" || echo "❌ $repo"
  done
  ```

- [ ] Scripts are executable:
  ```bash
  test -x /tmp/70-repos/PHASE-1-DEPLOY.sh && echo "✓ PHASE-1-DEPLOY.sh"
  test -x /tmp/70-repos/PUSH-ALL-REPOS.sh && echo "✓ PUSH-ALL-REPOS.sh"
  ```

## Deployment Execution

### Option A: Automated (Recommended)
```bash
cd /tmp/70-repos
./PHASE-1-DEPLOY.sh
```

**Time:** ~10 minutes  
**Monitoring:** Watch for ✓ and ❌ indicators

### Option B: Manual Verification
- [ ] Script runs without errors
- [ ] All 10 repos show ✓
- [ ] No authentication errors
- [ ] Git commits successful
- [ ] GitHub pushes successful

## Post-Deployment Verification

### Repo Creation
```bash
gh repo list CodesbyFebin --limit 100 | grep -E \
  "(agent-skills|agentic-devops|awesome-mcp|sovereign-ai|verifiable-ai|mcp-cookbook)"
```
- [ ] Shows 10 repos
- [ ] All public
- [ ] Correct names

### Structure Verification (Pick one repo)
```bash
gh repo view CodesbyFebin/awesome-agent-skills --json description
gh api repos/CodesbyFebin/awesome-agent-skills/contents/.github/workflows/research-engine.yml
```
- [ ] README visible on GitHub web UI
- [ ] Workflow file present
- [ ] `.gitignore` active

### Workflow Configuration
```bash
gh workflow list -R CodesbyFebin/awesome-agent-skills
```
- [ ] `Research Engine` workflow visible
- [ ] Status: Active

## Testing Phase 1 Engine

### Install Research Engine
```bash
pip install dh-research-engine
export GITHUB_TOKEN=ghp_...  # Your real token
cd /tmp/test-phase-1
```

### Test on Foundation Repo
```bash
dh-research repo --repo awesome-agent-skills
```

- [ ] Command completes without errors
- [ ] Creates `out/awesome-agent-skills/` directory
- [ ] Generates `data/projects.json` (30-50 projects expected)
- [ ] Generates `README.md`
- [ ] Generates `reports/quality.json`
- [ ] Generates `evidence/projects.ndjson`

### Quality Assessment
```bash
cat out/awesome-agent-skills/reports/quality.json | jq .
```

- [ ] Status: `COMPLETE` or `PARTIAL`
- [ ] Score ≥ 70
- [ ] Breakdown by category visible
- [ ] No "NEEDS_WORK" status

## GitHub Actions Setup (Optional but Recommended)

### Add Secrets to Each Phase 1 Repo
```bash
gh secret set GITHUB_TOKEN --body "ghp_..." -R CodesbyFebin/awesome-agent-skills
gh secret set GITHUB_TOKEN --body "ghp_..." -R CodesbyFebin/awesome-agentic-devops
# ... repeat for all 10
```

- [ ] Secrets set in all 10 repos
- [ ] No "ghp_" prefix leaks in logs

### Manual Trigger Test
```bash
gh workflow run research-engine.yml -R CodesbyFebin/awesome-agent-skills
# Wait 2-3 minutes
gh run list -R CodesbyFebin/awesome-agent-skills --limit 1
```

- [ ] Workflow runs successfully
- [ ] Generates data/ outputs
- [ ] Auto-commits results

## Success Criteria

All conditions must be met to proceed to Phase 2:

### Deployment
- [ ] 10 repos created on GitHub
- [ ] Each has correct template files
- [ ] Initial commit pushed to main

### Data Generation
- [ ] Research engine runs without errors
- [ ] Generates 30-50 projects per repo
- [ ] Quality score ≥ 70 per repo

### Automation
- [ ] Workflows appear in GitHub
- [ ] Secrets configured (if using auto-refresh)
- [ ] Manual trigger test passes

### Quality Metrics
- [ ] All projects verified (no UNKNOWN at VERIFIED threshold)
- [ ] No fabrication (offline mode passes selftest)
- [ ] Evidence logged in projects.ndjson
- [ ] README updated with catalog

## Rollback (If Needed)

If Phase 1 repos have issues:

```bash
# Delete a single repo
gh repo delete CodesbyFebin/awesome-agent-skills --confirm

# Or keep repos and clear data
cd awesome-agent-skills
rm -rf data/ evidence/ out/
git add -A
git commit -m "Clear test data"
git push
```

## Next Steps (After Successful Phase 1)

1. **Document Results** — Screenshot quality metrics
2. **Review Outputs** — Manually audit 2-3 repos
3. **Update Manifests** — Adjust targetProjects based on actual discovery
4. **Deploy Phase 2** — Same process for 20 Scale repos
5. **Configure Automation** — Set up scheduled weekly refreshes

## Important Notes

- **Token Security:** Never commit GitHub tokens to repos
- **Rate Limits:** Phase 1 uses ~100 API requests (5000/hour limit)
- **Re-runs:** Safe to re-run scripts; existing repos are skipped
- **Data**: Research outputs are in `data/` (git-ignored, so local only)
- **Evidence**: Provenance is in `evidence/projects.ndjson` (git-ignored)

## Support

If something fails:
1. Check error message in script output
2. Verify prerequisites (gh auth, Python version)
3. Try manual deployment for failing repo
4. Re-run script (safe to retry)

Documentation:
- `/tmp/70-repos/PHASE-1-README.md` — Full deployment guide
- `/tmp/70-repos/DEPLOYMENT-INSTRUCTIONS.md` — All phases
- `/home/user/-OM/tools/research-engine-v2/QUICKSTART-SINGLE-REPO.md` — Per-repo usage

---

**Status:** Ready to deploy Phase 1 ✅

**Command:** `cd /tmp/70-repos && ./PHASE-1-DEPLOY.sh`

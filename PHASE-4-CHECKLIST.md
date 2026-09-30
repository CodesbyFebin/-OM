# Phase 4 Deployment Checklist

## Prerequisites: Phase 3 Complete ✅

Before deploying Phase 4, verify Phase 3 success:

- [ ] All 20 Phase 3 repos exist on GitHub
- [ ] Research engine runs on Phase 3 repos without errors
- [ ] Quality score ≥75 on most repos (15+ ideally)
- [ ] No fabrication issues (selftest passes)
- [ ] Total: 50 repos deployed (10 Phase 1 + 20 Phase 2 + 20 Phase 3)

If Phase 3 has issues, resolve before proceeding.

## Pre-Deployment (Complete Before Running Script)

### Environment Setup
- [ ] `gh` CLI installed and authenticated
- [ ] Can list repos: `gh repo list CodesbyFebin --limit 1`
- [ ] Python 3.10+: `python --version`
- [ ] GitHub token available: `echo $GITHUB_TOKEN`

### Repository Verification
- [ ] All 20 Phase 4 repos verified locally:
  ```bash
  cd /tmp/70-repos
  cat PHASE-4-REPOS.txt | while read repo; do
    [ -d "$repo" ] && echo "✓ $repo" || echo "❌ $repo"
  done | grep -c "✓"
  # Should output: 20
  ```

- [ ] Each repo has complete structure:
  ```bash
  for repo in $(cat PHASE-4-REPOS.txt | head -3); do
    [ -f "$repo/README.md" ] && \
    [ -f "$repo/portfolio-manifest.json" ] && \
    [ -f "$repo/.gitignore" ] && \
    [ -f "$repo/.github/workflows/research-engine.yml" ] && \
    echo "✓ $repo complete" || echo "❌ $repo incomplete"
  done
  ```

- [ ] Script is executable:
  ```bash
  test -x /tmp/70-repos/PHASE-4-DEPLOY.sh && echo "✓ Script ready"
  ```

## Deployment Execution

### Run Automated Deployment
```bash
cd /tmp/70-repos
./PHASE-4-DEPLOY.sh
```

**Monitoring:**
- [ ] Script starts without errors
- [ ] Verifies all 20 repos
- [ ] Creates repos on GitHub (✓ or ⚠️ for existing)
- [ ] Clones, copies, commits, pushes each repo
- [ ] Shows ✓ for success, ❌ for failures
- [ ] Reports final summary (20/20 success)

**Time:** 20-30 minutes (depends on network)

### If Using Manual Deployment
Follow steps in PHASE-4-README.md instead.

## Post-Deployment Verification (Immediate)

### Repo Count
```bash
gh repo list CodesbyFebin --limit 100 | wc -l
```
- [ ] Should be ≥70 total (full portfolio complete!)
  - 10 Phase 1 + 20 Phase 2 + 20 Phase 3 + 20 Phase 4 = 70

### GitHub Verification
```bash
for repo in ai-agent-orchestration-cookbook awesome-ai-agent-orchestration \
            ai-deployment-cookbook awesome-ai-deployment-patterns; do
  gh repo view CodesbyFebin/$repo --json name
done
```
- [ ] Shows repo names without errors
- [ ] Repos are public
- [ ] Correct names (no typos)

### File Presence
```bash
gh api repos/CodesbyFebin/awesome-ai-agent-orchestration/contents/.github/workflows
```
- [ ] `research-engine.yml` file present
- [ ] YAML format valid
- [ ] Workflow visible in GitHub UI

### Branch Status
```bash
gh api repos/CodesbyFebin/awesome-ai-agent-orchestration/branches/main
```
- [ ] main branch exists
- [ ] Initial commit present
- [ ] Ready for research engine

## Testing Phase 4 Engine (2-3 hours after deployment)

### Install Latest Package
```bash
pip install --upgrade dh-research-engine
dh-research --help  # Verify installation
```

### Test on One Repository
```bash
export GITHUB_TOKEN=ghp_...
cd /tmp/test-phase-4
dh-research repo --repo awesome-ai-agent-orchestration
```

- [ ] Command executes without authentication errors
- [ ] Takes 5-10 minutes (normal for Phase 4 discovery)
- [ ] Creates `out/awesome-ai-agent-orchestration/` directory
- [ ] No rate limit errors

### Verify Outputs
```bash
ls -la out/awesome-ai-agent-orchestration/
# Should show: data/, README.md, reports/, evidence/
```

- [ ] `data/projects.json` exists and contains projects
- [ ] `reports/quality.json` exists
- [ ] `evidence/projects.ndjson` exists
- [ ] `README.md` updated with catalog

### Check Quality Metrics
```bash
cat out/awesome-ai-agent-orchestration/reports/quality.json | jq '.'
```

- [ ] `status`: COMPLETE or PARTIAL
- [ ] `score`: ≥78 (Phase 4 target — highest maturity)
- [ ] `breakdown` shows all dimensions
- [ ] Evidence includes API observations

### Phase 4 Characteristics (Mature Infrastructure)
```bash
# Phase 4 should show most mature tier discoveries
cat out/awesome-ai-agent-orchestration/data/projects.json | jq 'length'
# Expected: 45-60 projects (highest tier, most mature)

cat out/awesome-ai-agent-orchestration/reports/quality.json | jq '.breakdown'
# Should emphasize: production tools, mature frameworks, wide adoption
```

- [ ] Project count: 45-60 (mature tier — highest)
- [ ] Quality score: 78-88 (highest maturity)
- [ ] Evidence: Production tools, widely adopted frameworks, battle-tested implementations

### Compare Across All Phases
```bash
echo "Phase 1 avg:" && cat out/awesome-agent-skills/reports/quality.json | jq '.score'
echo "Phase 2 avg:" && cat out/awesome-agent-evaluation/reports/quality.json | jq '.score'
echo "Phase 3 avg:" && cat out/awesome-agent-fine-tuning/reports/quality.json | jq '.score'
echo "Phase 4 avg:" && cat out/awesome-ai-agent-orchestration/reports/quality.json | jq '.score'
```

- [ ] Phase 1: ~70-80 (Emerging)
- [ ] Phase 2: ~75-85 (Growing)
- [ ] Phase 3: ~75-80 (Specialized)
- [ ] Phase 4: ~78-88 (Mature) — highest tier

### Verify Anti-Fabrication
```bash
dh-research selftest  # Should pass
```

- [ ] Offline mode produces honest empty catalog
- [ ] No fabrication even without network
- [ ] All assertions pass

## GitHub Actions Setup (Optional but Recommended)

### Add Secrets (For Awesome repos only)
```bash
for repo in $(cat PHASE-4-REPOS.txt | grep "^awesome-"); do
  gh secret set GITHUB_TOKEN --body "ghp_..." -R "CodesbyFebin/$repo"
  echo "✓ Secret set for $repo"
done
```

- [ ] Secrets set for all 10 Awesome repos
- [ ] No "ghp_" prefixes leak in logs

### Manual Trigger Test (Pick One)
```bash
gh workflow run research-engine.yml -R CodesbyFebin/awesome-ai-agent-orchestration
sleep 5
gh run list -R CodesbyFebin/awesome-ai-agent-orchestration --limit 1
```

- [ ] Workflow run appears in UI
- [ ] Status shows "in progress" or "completed"
- [ ] Wait 2-3 minutes for completion

### Check Run Results
```bash
gh run view <run-id> -R CodesbyFebin/awesome-ai-agent-orchestration
```

- [ ] Run completed successfully
- [ ] No errors in logs
- [ ] Outputs generated (check artifacts if available)

## Success Criteria for Phase 4

All must pass for full portfolio completion:

### Deployment ✅
- [ ] 20 repos created on GitHub
- [ ] All have correct template files
- [ ] Initial commit pushed to main
- [ ] No failed repos (0/20 failures)
- [ ] **Total: 70 repos deployed** ✅

### Data Generation (Spot Check)
- [ ] Ran on ≥2 Phase 4 repos successfully
- [ ] Generated 45-60 projects per repo (mature tier)
- [ ] Quality score ≥78 on most repos (highest tier)
- [ ] All outputs present (data, reports, evidence)

### Automation (Optional)
- [ ] Workflows appear in GitHub
- [ ] Secrets configured
- [ ] Manual trigger test successful

### Quality Validation
- [ ] No unknown projects at VERIFIED threshold
- [ ] Evidence logged properly
- [ ] README updated with catalog
- [ ] No false claims in descriptions
- [ ] Production-grade tooling evident (mature frameworks, wide adoption)

### Full Portfolio Validation ✅
- [ ] All 70 repos on GitHub (10 + 20 + 20 + 20)
- [ ] All have correct structure
- [ ] Average quality score ≥76 across portfolio
- [ ] Phase maturity progression evident (70→80→75→80+)
- [ ] No UNKNOWN at VERIFIED threshold
- [ ] Evidence logged properly
- [ ] Anti-fabrication guarantee verified

## Phase 4 Niches (20 repos, 10 pairs)

| Niche | Awesome Repo | Cookbook Repo |
|-------|--------------|---------------|
| Orchestration | awesome-ai-agent-orchestration | ai-agent-orchestration-cookbook |
| Cost Optimization | awesome-ai-cost-optimization | ai-cost-optimization-cookbook |
| Data Pipeline | awesome-ai-data-pipeline | ai-data-pipeline-cookbook |
| Deployment | awesome-ai-deployment-patterns | ai-deployment-cookbook |
| Monitoring | awesome-ai-monitoring-alerting | ai-monitoring-alerting-cookbook |
| Platform Engineering | awesome-ai-platform-engineering | ai-platform-engineering-cookbook |
| Economics | awesome-ai-economics | ai-economics-cookbook |
| MLOps | awesome-ai-mlops | ai-mlops-cookbook |
| Infrastructure | awesome-ai-infrastructure | ai-infrastructure-cookbook |
| Operations | awesome-ai-operations | ai-operations-cookbook |

**Key characteristics:**
- Most mature / operations-focused
- Production-grade infrastructure
- Largest ecosystems (45-60 projects)
- Battle-tested implementations
- Highest quality scores (78-88)

## Rollback (If Issues Found)

### Delete Individual Repo
```bash
gh repo delete CodesbyFebin/awesome-ai-agent-orchestration --confirm
```

### Delete All Phase 4 Repos
```bash
for repo in $(cat PHASE-4-REPOS.txt); do
  gh repo delete "CodesbyFebin/$repo" --confirm
  sleep 1  # Rate limit friendly
done
```

### Re-run Deployment
Once issues are resolved, re-run script (safe to retry).

## Common Issues

### "Repository already exists"
- Script continues; repos are skipped
- Safe to re-run
- If stuck, manually delete with `gh repo delete`

### "Authentication failed"
- Run `gh auth login`
- Verify token has repo creation permission
- Check GITHUB_TOKEN env var is set

### "API rate limit exceeded"
- Phase 4 uses ~200 API calls (5000/hour limit)
- Unlikely to hit
- If rate limited, wait 1 hour and retry

### Workflow not visible
- Wait 5 minutes for GitHub sync
- Refresh browser page
- Verify `.github/workflows/research-engine.yml` was copied

### Push failed for repo
- Manually retry: `cd /tmp/70-repos/{repo} && git push -u origin main`
- Check git config (email/name)
- Verify internet connection

### Research engine errors
- Verify `pip install --upgrade dh-research-engine`
- Check GitHub token is set: `echo $GITHUB_TOKEN`
- Run `dh-research selftest` to verify package
- For large ecosystems, may need patience for discovery (10+ min)

## After Successful Phase 4 — Portfolio Complete! 🎉

### Document Full Portfolio Results
- [ ] Screenshot quality scores for all 70 repos
- [ ] Calculate portfolio average: sum / 70
- [ ] Note total projects discovered: sum of all projects.json
- [ ] Document phase progression (quality by tier)

### Portfolio Analytics
```bash
# Count total projects across portfolio
for repo in $(cat ALL_REPOS.txt); do
  count=$(cat out/$repo/data/projects.json 2>/dev/null | jq 'length' || echo 0)
  echo "$repo: $count"
done | awk -F: '{sum += $2} END {print "Total discovered: " sum}'
```

- [ ] Total projects discovered (target: 2000-3000 across 70 repos)
- [ ] Average per repo: 28-42 (varies by maturity)
- [ ] Coverage by tier:
  - Phase 1 (10 repos): ~350-500 projects
  - Phase 2 (20 repos): ~800-1200 projects
  - Phase 3 (20 repos): ~700-1000 projects
  - Phase 4 (20 repos): ~900-1200 projects

### Update Portfolio Manifest
- [ ] Verify all 70 repos in portfolio-manifest.json
- [ ] Check niche definitions accurate
- [ ] Validate pair assignments (Awesome ↔ Cookbook)
- [ ] Note targetProjects vs. actual discovery

### Configure Portfolio-Wide Automation
```bash
# Apply to all 70 repos for weekly auto-refresh
for repo in $(cat ALL_REPOS.txt | grep "^awesome-"); do
  gh secret set GITHUB_TOKEN --body "ghp_..." -R "CodesbyFebin/$repo"
done

echo "✓ Automation configured for 35 Awesome repos"
```

- [ ] Secrets configured for all 35 Awesome repos
- [ ] No credentials exposed
- [ ] Weekly refresh scheduled (Sunday 2am UTC)

### Generate Portfolio Report
- [ ] Average quality score: (sum of all scores) / 70
- [ ] Quality by phase:
  - Phase 1: 70-80
  - Phase 2: 75-85
  - Phase 3: 75-80
  - Phase 4: 78-88
- [ ] Total verified projects (VERIFIED status)
- [ ] Coverage metrics (languages, frameworks, patterns)

### Full Portfolio Validation Summary

| Metric | Target | Actual |
|--------|--------|--------|
| Repos Deployed | 70 | __ |
| Quality Avg | ≥76 | __ |
| Projects Discovered | 2000-3000 | __ |
| VERIFIED %age | ≥80 | __ |
| Phase 1 Avg | 70-80 | __ |
| Phase 2 Avg | 75-85 | __ |
| Phase 3 Avg | 75-80 | __ |
| Phase 4 Avg | 78-88 | __ |

### Archive & Document
- [ ] Save portfolio quality report to GitHub
- [ ] Document discovery patterns per niche
- [ ] Create portfolio showcase README
- [ ] Enable GitHub Pages if desired
- [ ] Set up scheduled reports (email, dashboard)

## Timeline for Full Portfolio

| Phase | Repos | Time | Cumulative |
|-------|-------|------|-----------|
| Phase 1 | 10 | 25 min | 25 min |
| Phase 2 | 20 | 40 min | 65 min |
| Phase 3 | 20 | 40 min | 105 min |
| Phase 4 | 20 | 40 min | 145 min |
| **Full Portfolio** | **70** | **~2.5 hours** | **~2.5 hrs** |

*Including testing, but not including manual validation time*

## Support & Resources

- **Deployment:** PHASE-4-README.md (create when deploying)
- **This checklist:** PHASE-4-CHECKLIST.md
- **Ready status:** PHASE-4-READY.md (create when deploying)
- **Quick reference:** QUICKSTART-SINGLE-REPO.md
- **Full docs:** DEPLOYMENT-INSTRUCTIONS.md
- **Architecture:** /home/user/-OM/PORTFOLIO-ARCHITECTURE.md

---

**Status:** ✅ **READY TO DEPLOY PHASE 4 (after Phase 3 succeeds)**

**Command:** `cd /tmp/70-repos && ./PHASE-4-DEPLOY.sh`

**Prerequisite:** Phase 3 must be complete and validated (≥75 score on 15+ repos)

**Milestone:** 🎉 **Full 70-repo portfolio deployment complete!**

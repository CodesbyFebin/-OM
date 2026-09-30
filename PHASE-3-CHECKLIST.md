# Phase 3 Deployment Checklist

## Prerequisites: Phase 2 Complete ✅

Before deploying Phase 3, verify Phase 2 success:

- [ ] All 20 Phase 2 repos exist on GitHub
- [ ] Research engine runs on Phase 2 repos without errors
- [ ] Quality score ≥75 on most repos (15+ ideally)
- [ ] No fabrication issues (selftest passes)
- [ ] Total: 30 repos deployed (10 Phase 1 + 20 Phase 2)

If Phase 2 has issues, resolve before proceeding.

## Pre-Deployment (Complete Before Running Script)

### Environment Setup
- [ ] `gh` CLI installed and authenticated
- [ ] Can list repos: `gh repo list CodesbyFebin --limit 1`
- [ ] Python 3.10+: `python --version`
- [ ] GitHub token available: `echo $GITHUB_TOKEN`

### Repository Verification
- [ ] All 20 Phase 3 repos verified locally:
  ```bash
  cd /tmp/70-repos
  cat PHASE-3-REPOS.txt | while read repo; do
    [ -d "$repo" ] && echo "✓ $repo" || echo "❌ $repo"
  done | grep -c "✓"
  # Should output: 20
  ```

- [ ] Each repo has complete structure:
  ```bash
  for repo in $(cat PHASE-3-REPOS.txt | head -3); do
    [ -f "$repo/README.md" ] && \
    [ -f "$repo/portfolio-manifest.json" ] && \
    [ -f "$repo/.gitignore" ] && \
    [ -f "$repo/.github/workflows/research-engine.yml" ] && \
    echo "✓ $repo complete" || echo "❌ $repo incomplete"
  done
  ```

- [ ] Script is executable:
  ```bash
  test -x /tmp/70-repos/PHASE-3-DEPLOY.sh && echo "✓ Script ready"
  ```

## Deployment Execution

### Run Automated Deployment
```bash
cd /tmp/70-repos
./PHASE-3-DEPLOY.sh
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
Follow steps in PHASE-3-README.md instead.

## Post-Deployment Verification (Immediate)

### Repo Count
```bash
gh repo list CodesbyFebin --limit 100 | wc -l
```
- [ ] Should be ≥50 total (10 Phase 1 + 20 Phase 2 + 20 Phase 3)

### GitHub Verification
```bash
for repo in agent-fine-tuning-cookbook awesome-agent-fine-tuning \
            ai-safety-cookbook awesome-ai-safety; do
  gh repo view CodesbyFebin/$repo --json name
done
```
- [ ] Shows repo names without errors
- [ ] Repos are public
- [ ] Correct names (no typos)

### File Presence
```bash
gh api repos/CodesbyFebin/awesome-agent-fine-tuning/contents/.github/workflows
```
- [ ] `research-engine.yml` file present
- [ ] YAML format valid
- [ ] Workflow visible in GitHub UI

### Branch Status
```bash
gh api repos/CodesbyFebin/awesome-agent-fine-tuning/branches/main
```
- [ ] main branch exists
- [ ] Initial commit present
- [ ] Ready for research engine

## Testing Phase 3 Engine (2-3 hours after deployment)

### Install Latest Package
```bash
pip install --upgrade dh-research-engine
dh-research --help  # Verify installation
```

### Test on One Repository
```bash
export GITHUB_TOKEN=ghp_...
cd /tmp/test-phase-3
dh-research repo --repo awesome-agent-fine-tuning
```

- [ ] Command executes without authentication errors
- [ ] Takes 5-10 minutes (normal for Phase 3 discovery)
- [ ] Creates `out/awesome-agent-fine-tuning/` directory
- [ ] No rate limit errors

### Verify Outputs
```bash
ls -la out/awesome-agent-fine-tuning/
# Should show: data/, README.md, reports/, evidence/
```

- [ ] `data/projects.json` exists and contains projects
- [ ] `reports/quality.json` exists
- [ ] `evidence/projects.ndjson` exists
- [ ] `README.md` updated with catalog

### Check Quality Metrics
```bash
cat out/awesome-agent-fine-tuning/reports/quality.json | jq '.'
```

- [ ] `status`: COMPLETE or PARTIAL
- [ ] `score`: ≥75 (Phase 3 target)
- [ ] `breakdown` shows all dimensions
- [ ] Evidence includes API observations

### Phase 3 Characteristics (Specialist Domains)
```bash
# Phase 3 should show specialized discoveries
cat out/awesome-agent-fine-tuning/data/projects.json | jq 'length'
# Expected: 35-50 projects (slightly lower than Phase 2, more specialized)

cat out/awesome-agent-fine-tuning/reports/quality.json | jq '.breakdown'
# Should emphasize: expert domains, specialized tooling, research papers
```

- [ ] Project count: 35-50 (specialized tier)
- [ ] Quality score: 75-80 (expert domains)
- [ ] Evidence: Papers, frameworks, research implementations

### Compare to Phase 2
```bash
# Phase 2 is broader infrastructure, Phase 3 is specialized
echo "Phase 2 sample:" && cat out/awesome-agent-evaluation/reports/quality.json | jq '.score'
echo "Phase 3 sample:" && cat out/awesome-agent-fine-tuning/reports/quality.json | jq '.score'
```

- [ ] Both have similar scores (75+)
- [ ] Phase 2 typically has more projects (broader)
- [ ] Phase 3 has more specialized implementations (papers, focused tools)

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
for repo in $(cat PHASE-3-REPOS.txt | grep "^awesome-"); do
  gh secret set GITHUB_TOKEN --body "ghp_..." -R "CodesbyFebin/$repo"
  echo "✓ Secret set for $repo"
done
```

- [ ] Secrets set for all 10 Awesome repos
- [ ] No "ghp_" prefixes leak in logs

### Manual Trigger Test (Pick One)
```bash
gh workflow run research-engine.yml -R CodesbyFebin/awesome-agent-fine-tuning
sleep 5
gh run list -R CodesbyFebin/awesome-agent-fine-tuning --limit 1
```

- [ ] Workflow run appears in UI
- [ ] Status shows "in progress" or "completed"
- [ ] Wait 2-3 minutes for completion

### Check Run Results
```bash
gh run view <run-id> -R CodesbyFebin/awesome-agent-fine-tuning
```

- [ ] Run completed successfully
- [ ] No errors in logs
- [ ] Outputs generated (check artifacts if available)

## Success Criteria for Phase 3

All must pass to proceed to Phase 4:

### Deployment
- [ ] 20 repos created on GitHub
- [ ] All have correct template files
- [ ] Initial commit pushed to main
- [ ] No failed repos (0/20 failures)

### Data Generation (Spot Check)
- [ ] Ran on ≥2 Phase 3 repos successfully
- [ ] Generated 35-50 projects per repo (specialized tier)
- [ ] Quality score ≥75 on most repos
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
- [ ] Specialized domain coverage evident (papers, focused tools)

## Phase 3 Niches (20 repos, 10 pairs)

| Niche | Awesome Repo | Cookbook Repo |
|-------|--------------|---------------|
| Fine-tuning | awesome-agent-fine-tuning | agent-fine-tuning-cookbook |
| Safety | awesome-ai-safety | ai-safety-cookbook |
| Security | awesome-ai-security | ai-security-cookbook |
| Compliance | awesome-ai-compliance | ai-compliance-cookbook |
| Privacy | awesome-ai-privacy | ai-privacy-cookbook |
| Federated Learning | awesome-ai-federated-learning | ai-federated-learning-cookbook |
| Ethics | awesome-ai-ethics | ai-ethics-cookbook |
| Bias Detection | awesome-ai-bias-detection | ai-bias-detection-cookbook |
| Explainability | awesome-ai-explainability | ai-explainability-cookbook |
| Robustness | awesome-ai-robustness | ai-robustness-cookbook |

**Key characteristics:**
- Specialized/expert domains
- More focused than Phase 2 (smaller ecosystem)
- Research-heavy (papers, benchmarks)
- 35-50 projects per repo expected

## Rollback (If Issues Found)

### Delete Individual Repo
```bash
gh repo delete CodesbyFebin/awesome-agent-fine-tuning --confirm
```

### Delete All Phase 3 Repos
```bash
for repo in $(cat PHASE-3-REPOS.txt); do
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
- Phase 3 uses ~200 API calls (5000/hour limit)
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
- For specialized domains, may need patience for discovery

## After Successful Phase 3

### Document Results
- [ ] Screenshot quality scores (example: 76, 79, 77, ...)
- [ ] Note project counts per niche
- [ ] Record any specialized domain insights (papers found, frameworks discovered)

### Review Manifests
- [ ] Adjust `targetProjects` if discovery differs from Phase 2
- [ ] Update niche definitions if needed
- [ ] Note specialized tooling patterns

### Update Progress
- [ ] Phase 1: ✅ Complete (10 repos)
- [ ] Phase 2: ✅ Complete (20 repos)
- [ ] Phase 3: ✅ Complete (20 repos)
- [ ] Phase 4: ⏳ Pending (20 repos)

### Prepare Phase 4
- [ ] Review PHASE-4-CHECKLIST.md
- [ ] Verify 20 Phase 4 repos exist in `/tmp/70-repos/`
- [ ] Run `./PHASE-4-DEPLOY.sh` when ready

## Timeline

| Step | Time | Cumulative |
|------|------|-----------|
| Pre-deployment check | 5 min | 5 min |
| Run PHASE-3-DEPLOY.sh | 20 min | 25 min |
| Post-deployment verify | 10 min | 35 min |
| Test on 2 repos | 20 min | 55 min |
| Configure automation | 10 min | 65 min |
| **Total** | **65 min** | **65 min** |

*Waiting for research engine runs (5-10 min each) happens in parallel*

## Support & Resources

- **Deployment:** PHASE-3-README.md (create when deploying)
- **This checklist:** PHASE-3-CHECKLIST.md
- **Ready status:** PHASE-3-READY.md (create when deploying)
- **Quick reference:** QUICKSTART-SINGLE-REPO.md
- **Full docs:** DEPLOYMENT-INSTRUCTIONS.md

---

**Status:** ✅ **READY TO DEPLOY PHASE 3 (after Phase 2 succeeds)**

**Command:** `cd /tmp/70-repos && ./PHASE-3-DEPLOY.sh`

**Prerequisite:** Phase 2 must be complete and validated (≥75 score on 15+ repos)

**Next:** Phase 4 deployment (20 Operations & Orchestration repos)

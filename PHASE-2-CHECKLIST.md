# Phase 2 Deployment Checklist

## Prerequisites: Phase 1 Complete ✅

Before deploying Phase 2, verify Phase 1 success:

- [ ] All 10 Phase 1 repos exist on GitHub
- [ ] Research engine runs on Phase 1 repos without errors
- [ ] Quality score ≥70 on most repos
- [ ] No fabrication issues (selftest passes)

If Phase 1 has issues, resolve before proceeding.

## Pre-Deployment (Complete Before Running Script)

### Environment Setup
- [ ] `gh` CLI installed and authenticated
- [ ] Can list repos: `gh repo list CodesbyFebin --limit 1`
- [ ] Python 3.10+: `python --version`
- [ ] GitHub token available: `echo $GITHUB_TOKEN`

### Repository Verification
- [ ] All 20 Phase 2 repos verified locally:
  ```bash
  cd /tmp/70-repos
  cat PHASE-2-REPOS.txt | while read repo; do
    [ -d "$repo" ] && echo "✓ $repo" || echo "❌ $repo"
  done | grep -c "✓"
  # Should output: 20
  ```

- [ ] Each repo has complete structure:
  ```bash
  for repo in $(cat PHASE-2-REPOS.txt | head -3); do
    [ -f "$repo/README.md" ] && \
    [ -f "$repo/portfolio-manifest.json" ] && \
    [ -f "$repo/.gitignore" ] && \
    [ -f "$repo/.github/workflows/research-engine.yml" ] && \
    echo "✓ $repo complete" || echo "❌ $repo incomplete"
  done
  ```

- [ ] Script is executable:
  ```bash
  test -x /tmp/70-repos/PHASE-2-DEPLOY.sh && echo "✓ Script ready"
  ```

## Deployment Execution

### Run Automated Deployment
```bash
cd /tmp/70-repos
./PHASE-2-DEPLOY.sh
```

**Monitoring:**
- [ ] Script starts without errors
- [ ] Verifies all 20 repos
- [ ] Creates repos on GitHub (✓ or ⚠️ for existing)
- [ ] Clones, copies, commits, pushes each repo
- [ ] Shows ✓ for success, ❌ for failures
- [ ] Reports final summary (20/20 success)

**Time:** 15-25 minutes (depends on network)

### If Using Manual Deployment
Follow steps in PHASE-2-README.md instead.

## Post-Deployment Verification (Immediate)

### Repo Count
```bash
gh repo list CodesbyFebin --limit 100 | wc -l
```
- [ ] Should be ≥30 total (10 Phase 1 + 20 Phase 2)

### GitHub Verification
```bash
for repo in agent-evaluation-cookbook awesome-agent-evaluation \
            agent-memory-cookbook awesome-agent-memory; do
  gh repo view CodesbyFebin/$repo --json name
done
```
- [ ] Shows repo names without errors
- [ ] Repos are public
- [ ] Correct names (no typos)

### File Presence
```bash
gh api repos/CodesbyFebin/awesome-agent-evaluation/contents/.github/workflows
```
- [ ] `research-engine.yml` file present
- [ ] YAML format valid
- [ ] Workflow visible in GitHub UI

### Branch Status
```bash
gh api repos/CodesbyFebin/awesome-agent-evaluation/branches/main
```
- [ ] main branch exists
- [ ] Initial commit present
- [ ] Ready for research engine

## Testing Phase 2 Engine (2-3 hours after deployment)

### Install Latest Package
```bash
pip install --upgrade dh-research-engine
dh-research --help  # Verify installation
```

### Test on One Repository
```bash
export GITHUB_TOKEN=ghp_...
cd /tmp/test-phase-2
dh-research repo --repo awesome-agent-evaluation
```

- [ ] Command executes without authentication errors
- [ ] Takes 5-10 minutes (normal for Phase 2 discovery)
- [ ] Creates `out/awesome-agent-evaluation/` directory
- [ ] No rate limit errors

### Verify Outputs
```bash
ls -la out/awesome-agent-evaluation/
# Should show: data/, README.md, reports/, evidence/
```

- [ ] `data/projects.json` exists and contains projects
- [ ] `reports/quality.json` exists
- [ ] `evidence/projects.ndjson` exists
- [ ] `README.md` updated with catalog

### Check Quality Metrics
```bash
cat out/awesome-agent-evaluation/reports/quality.json | jq '.'
```

- [ ] `status`: COMPLETE or PARTIAL
- [ ] `score`: ≥75 (Phase 2 target)
- [ ] `breakdown` shows all dimensions
- [ ] Evidence includes API observations

### Compare to Phase 1
```bash
# If you have Phase 1 results
cat out/awesome-agent-skills/reports/quality.json | jq '.score'
cat out/awesome-agent-evaluation/reports/quality.json | jq '.score'
```

- [ ] Phase 2 scores similar or higher (more mature)
- [ ] Both have VERIFIED projects

### Verify Anti-Fabrication
```bash
dh-research selftest  # Should pass
```

- [ ] Offline mode produces honest empty catalog
- [ ] No fabrication even without network
- [ ] All assertions pass

## GitHub Actions Setup (Optional but Recommended)

### Add Secrets (One-time for Phase 2)
```bash
for repo in $(cat PHASE-2-REPOS.txt | grep "^awesome-"); do
  gh secret set GITHUB_TOKEN --body "ghp_..." -R "CodesbyFebin/$repo"
  echo "✓ Secret set for $repo"
done
```

- [ ] Secrets set for all 10 Awesome repos
- [ ] No "ghp_" prefixes leak in logs

### Manual Trigger Test (Pick One)
```bash
gh workflow run research-engine.yml -R CodesbyFebin/awesome-agent-evaluation
sleep 5
gh run list -R CodesbyFebin/awesome-agent-evaluation --limit 1
```

- [ ] Workflow run appears in UI
- [ ] Status shows "in progress" or "completed"
- [ ] Wait 2-3 minutes for completion

### Check Run Results
```bash
gh run view <run-id> -R CodesbyFebin/awesome-agent-evaluation
```

- [ ] Run completed successfully
- [ ] No errors in logs
- [ ] Outputs generated (check artifacts if available)

## Success Criteria for Phase 2

All must pass to proceed to Phase 3:

### Deployment
- [ ] 20 repos created on GitHub
- [ ] All have correct template files
- [ ] Initial commit pushed to main
- [ ] No failed repos (0/20 failures)

### Data Generation (Spot Check)
- [ ] Ran on ≥2 Phase 2 repos successfully
- [ ] Generated 40-60 projects per repo
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

## Rollback (If Issues Found)

### Delete Individual Repo
```bash
gh repo delete CodesbyFebin/awesome-agent-evaluation --confirm
```

### Delete All Phase 2 Repos
```bash
for repo in $(cat PHASE-2-REPOS.txt); do
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
- Phase 2 uses ~200 API calls (5000/hour limit)
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

## After Successful Phase 2

### Document Results
- [ ] Screenshot quality scores (example: 78, 82, 79, ...)
- [ ] Note project counts per niche
- [ ] Record any discoveries (e.g., top project, new pattern)

### Review Manifests
- [ ] Adjust `targetProjects` if discovery differs
- [ ] Update niche definitions if needed
- [ ] Add related repos if discovered

### Update Progress
- [ ] Phase 1: ✅ Complete (10 repos)
- [ ] Phase 2: ✅ Complete (20 repos)
- [ ] Phase 3: ⏳ Pending (20 repos)
- [ ] Phase 4: ⏳ Pending (20 repos)

### Prepare Phase 3
- [ ] Review PHASE-3-README.md
- [ ] Verify 20 Phase 3 repos exist in `/tmp/70-repos/`
- [ ] Run `./PHASE-3-DEPLOY.sh` when ready

## Timeline

| Step | Time | Cumulative |
|------|------|-----------|
| Pre-deployment check | 5 min | 5 min |
| Run PHASE-2-DEPLOY.sh | 20 min | 25 min |
| Post-deployment verify | 10 min | 35 min |
| Test on 2 repos | 20 min | 55 min |
| Configure automation | 10 min | 65 min |
| **Total** | **65 min** | **65 min** |

*Waiting for research engine runs (5-10 min each) happens in parallel*

## Support & Resources

- **Deployment:** PHASE-2-README.md
- **This checklist:** PHASE-2-CHECKLIST.md
- **Ready status:** PHASE-2-READY.md
- **Quick reference:** QUICKSTART-SINGLE-REPO.md
- **Full docs:** DEPLOYMENT-INSTRUCTIONS.md

---

**Status:** ✅ **READY TO DEPLOY PHASE 2 (after Phase 1 succeeds)**

**Command:** `cd /tmp/70-repos && ./PHASE-2-DEPLOY.sh`

**Prerequisite:** Phase 1 must be complete and validated (≥70 score on 10 repos)

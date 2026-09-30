# Setup Deployment Scripts Locally

You're on a different machine than the cloud session. Here's how to get the deployment files:

## Option 1: Clone the -OM Repository (Recommended)

```bash
# Clone the repository
git clone https://github.com/CodesbyFebin/-OM.git
cd -OM

# Switch to main and pull latest
git checkout main
git pull origin main

# Merge PR #2
git merge claude/profile-readme-2026-qccd4v

# Push to GitHub
git push origin main

# Verify - all deployment scripts should now be in repo root
ls -la PHASE-*-DEPLOY.sh DEPLOY-ALL-70-FAST.sh
```

## Option 2: Copy From Cloud Session (If You Have SSH Access)

If you have SSH access to this cloud environment:

```bash
# From your local machine
scp -r user@cloud:/tmp/70-repos ~/70-repos-deploy

cd ~/70-repos-deploy
chmod +x DEPLOY-ALL-70-FAST.sh
./DEPLOY-ALL-70-FAST.sh
```

## Option 3: Use GitHub Actions or Another Transfer Method

After merging PR #2, the scripts will be on GitHub and you can access them from any machine.

---

## Key Files You Need

- `DEPLOY-ALL-70-FAST.sh` — Main parallel deployment script
- `DEPLOY-ALL-AND-OPTIMIZE.md` — Complete deployment guide
- All 70 repository templates (should be in `70-repos/` subdirectory)

## Quick Status

✅ All 70 repository templates are ready in cloud session at `/tmp/70-repos`
✅ Deployment scripts ready: DEPLOY-ALL-70-FAST.sh + guides
✅ Need: PR #2 merged + scripts in your local clone

## Next Action

1. **Clone the repo or find your existing clone**
2. **Merge PR #2** locally
3. **Push to GitHub**
4. **Run DEPLOY-ALL-70-FAST.sh**

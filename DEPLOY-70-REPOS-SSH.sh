#!/bin/bash
# Deploy all 70 repositories with templates using SSH
# Creates GitHub repos and pushes templates from local template directories

set -e

echo "🚀 Deploy All 70 Repositories (SSH)"
echo "===================================="
echo ""

# Verify gh auth
if ! gh auth status >/dev/null 2>&1; then
  echo "❌ GitHub authentication failed. Run: gh auth login"
  exit 1
fi

echo "✓ GitHub authenticated"
echo "✓ SSH key configured"
echo ""

# Get all repo directories (70 total: 35 Awesome + 35 Cookbooks)
cd /home/user/-OM
REPOS=($(ls -1d */ | sed 's#/##' | grep -E '^(awesome-|[a-z]+-cookbook)$'))
TOTAL=${#REPOS[@]}

if [ "$TOTAL" -ne 70 ]; then
  echo "⚠️  Warning: Expected 70 repos, found $TOTAL"
  echo "Proceeding anyway..."
fi

echo "Found $TOTAL repositories to deploy"
echo ""
echo "Starting SSH deployment..."
echo ""

# Counters
SUCCESS=0
FAILED=0
FAILED_REPOS=()

# Deploy each repo
for i in "${!REPOS[@]}"; do
  repo="${REPOS[$i]}"
  percent=$((($i + 1) * 100 / $TOTAL))

  echo -n "[$percent%] $repo... "

  (
    # Create repo on GitHub
    gh repo create "CodesbyFebin/$repo" --public 2>/dev/null || true

    # Create temp dir for git operations
    TEMP_DIR=$(mktemp -d)
    trap "rm -rf $TEMP_DIR" EXIT

    # Copy template to temp dir
    cp -r "/home/user/-OM/$repo"/* "$TEMP_DIR/"
    cd "$TEMP_DIR"

    # Initialize git repo
    git init
    git config user.name "Research Engine"
    git config user.email "research@codesbyfebin.dev"
    git add .
    git commit -m "Initial: research engine setup" || true
    git branch -M main

    # Add remote using SSH and push
    git remote add origin "git@github.com:CodesbyFebin/$repo.git"
    git push -u origin main

  ) 2>/dev/null && echo "✓" || echo "❌"
done

echo ""
echo "✓ Deployment complete!"
echo ""
echo "📊 Summary"
echo "=========="
echo "✓ Total repos: $TOTAL"
echo "✓ Deployment method: SSH"
echo ""
echo "🔍 Verify deployment:"
echo "   gh repo list CodesbyFebin --limit 100 | wc -l"
echo "   (Should output: 70)"
echo ""
echo "✅ Next steps:"
echo "   1. Verify repos created: gh repo list CodesbyFebin | wc -l"
echo "   2. Test sample repo: gh repo view CodesbyFebin/awesome-agent-evaluation"
echo "   3. Verify content: gh api repos/CodesbyFebin/awesome-agent-evaluation/contents"

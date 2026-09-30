#!/bin/bash
# Deploy all 70 repositories using GitHub API + git
# Usage: GITHUB_TOKEN=ghp_xxx ./deploy-all-70-with-token.sh

set -e

# Check for token
if [ -z "$GITHUB_TOKEN" ]; then
  echo "❌ GITHUB_TOKEN not set"
  echo ""
  echo "Usage:"
  echo "  export GITHUB_TOKEN=ghp_<your-token>"
  echo "  $0"
  echo ""
  echo "To create a token:"
  echo "  1. Go to https://github.com/settings/tokens/new"
  echo "  2. Create a 'Personal access token (classic)'"
  echo "  3. Select scopes: repo, workflow"
  echo "  4. Copy and run: export GITHUB_TOKEN=ghp_..."
  exit 1
fi

# Verify token works
echo "🔐 Verifying GitHub token..."
if ! curl -s -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user 2>/dev/null | grep -q "login"; then
  echo "❌ Invalid GitHub token"
  exit 1
fi
echo "✓ Token verified"
echo ""

# Get all repo directories
REPO_DIR="/tmp/70-repos"
if [ ! -d "$REPO_DIR" ]; then
  echo "❌ Repository templates not found at $REPO_DIR"
  exit 1
fi

cd "$REPO_DIR"
REPOS=($(ls -1d */ | sed 's#/##' | sort))
TOTAL=${#REPOS[@]}

echo "🚀 Deploying $TOTAL repositories from $REPO_DIR"
echo "=================================================="
echo ""

# Rate limiting
BATCH_SIZE=5
SUCCESS=0
FAILED=0
FAILED_REPOS=()

# Deploy batches
for i in "${!REPOS[@]}"; do
  repo="${REPOS[$i]}"
  percent=$((($i + 1) * 100 / $TOTAL))

  echo -ne "[$percent%] Deploying $repo... "

  (
    # Create repo via GitHub API
    CREATE_RESPONSE=$(curl -s -X POST \
      -H "Authorization: token $GITHUB_TOKEN" \
      -H "Accept: application/vnd.github.v3+json" \
      https://api.github.com/user/repos \
      -d "{\"name\":\"$repo\",\"description\":\"Research engine curated repository\",\"private\":false,\"auto_init\":true}")

    # Check response
    if echo "$CREATE_RESPONSE" | grep -q '"name":"'"$repo"'"'; then
      echo -n "created... "
    elif echo "$CREATE_RESPONSE" | grep -q "name already exists"; then
      echo -n "exists... "
    else
      echo "failed"
      exit 1
    fi

    # Wait for repo to be ready
    sleep 2

    # Clone, populate, push
    TEMP_DIR=$(mktemp -d)
    trap "rm -rf $TEMP_DIR" EXIT

    # Clone with token auth
    CLONE_URL="https://$GITHUB_TOKEN@github.com/CodesbyFebin/$repo.git"
    if git clone "$CLONE_URL" "$TEMP_DIR" 2>/dev/null; then
      :
    else
      # Repo just created, might not be ready immediately
      sleep 3
      git clone "$CLONE_URL" "$TEMP_DIR" 2>/dev/null || true
    fi

    # Copy template
    cp -r "$REPO_DIR/$repo"/* "$TEMP_DIR/" 2>/dev/null || true

    # Git operations
    cd "$TEMP_DIR"
    git config user.name "Research Engine"
    git config user.email "research@codesbyfebin.dev"
    git add -A 2>/dev/null || true
    git commit -m "Initial: research engine setup" 2>/dev/null || true
    git branch -M main 2>/dev/null || true

    # Push
    if git push -u origin main 2>/dev/null; then
      echo "✓"
    else
      echo "push failed"
      exit 1
    fi

  ) 2>/dev/null && ((SUCCESS++)) || {
    ((FAILED++))
    FAILED_REPOS+=("$repo")
  }

  # Rate limit batches
  if [ $((($i + 1) % $BATCH_SIZE)) -eq 0 ]; then
    echo "⏸️  Pause for rate limiting..."
    sleep 5
  fi
done

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Summary"
echo "=========="
echo "✓ Total repos: $TOTAL"
echo "✓ Successfully deployed: $SUCCESS"
echo "❌ Failed: $FAILED"

if [ $FAILED -gt 0 ]; then
  echo ""
  echo "Failed repos:"
  for repo in "${FAILED_REPOS[@]}"; do
    echo "  - $repo"
  done
fi

echo ""
echo "🔍 Verify deployment:"
echo "   curl -H 'Authorization: token \$GITHUB_TOKEN' \\"
echo "     https://api.github.com/users/CodesbyFebin/repos?per_page=100 \\"
echo "     | jq 'length'"
echo ""
echo "   Or: gh repo list CodesbyFebin | wc -l"

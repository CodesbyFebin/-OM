#!/bin/bash
# Deploy all 70 repositories using GitHub API + git
# Usage: GITHUB_TOKEN=ghp_xxx ./deploy-70-repos-with-token.sh

set -e

# Check for token
if [ -z "$GITHUB_TOKEN" ]; then
  echo "❌ GITHUB_TOKEN not set"
  echo ""
  echo "Usage:"
  echo "  export GITHUB_TOKEN=ghp_<your-token>"
  echo "  ./deploy-70-repos-with-token.sh"
  echo ""
  echo "To create a token:"
  echo "  1. Go to https://github.com/settings/tokens"
  echo "  2. Create a 'Personal access token (classic)'"
  echo "  3. Select scopes: repo, workflow"
  echo "  4. Copy the token and run: export GITHUB_TOKEN=ghp_..."
  exit 1
fi

# Verify token works
echo "🔐 Verifying GitHub token..."
if ! curl -s -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user | grep -q "login"; then
  echo "❌ Invalid GitHub token"
  exit 1
fi
echo "✓ Token verified"
echo ""

# Get all repo directories (70 total)
cd /home/user/-OM
REPOS=($(ls -1d */ | sed 's#/##' | grep -E '^(awesome-|[a-z]+-cookbook)$'))
TOTAL=${#REPOS[@]}

echo "🚀 Deploying $TOTAL repositories"
echo "=================================="
echo ""

# Deploy each repo
SUCCESS=0
FAILED=0
FAILED_REPOS=()

for i in "${!REPOS[@]}"; do
  repo="${REPOS[$i]}"
  percent=$((($i + 1) * 100 / $TOTAL))

  echo -ne "[$percent%] Creating $repo... "

  # Create repo via API
  RESPONSE=$(curl -s -X POST \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    https://api.github.com/user/repos \
    -d "{
      \"name\": \"$repo\",
      \"description\": \"Research engine curated repository\",
      \"private\": false,
      \"auto_init\": true
    }")

  # Check if repo was created (or already exists)
  if echo "$RESPONSE" | grep -q '"name":"'"$repo"'"'; then
    echo -ne "created... "
  elif echo "$RESPONSE" | grep -q "already exists"; then
    echo -ne "exists... "
  else
    echo "❌ Failed"
    FAILED=$((FAILED + 1))
    FAILED_REPOS+=("$repo")
    continue
  fi

  # Wait for repo to be ready
  sleep 1

  # Clone and populate
  TEMP_DIR=$(mktemp -d)
  git clone https://$GITHUB_TOKEN@github.com/CodesbyFebin/$repo.git "$TEMP_DIR" 2>/dev/null || true

  # Copy template
  cp -r "/home/user/-OM/$repo"/* "$TEMP_DIR/" 2>/dev/null || true

  # Push
  cd "$TEMP_DIR"
  git config user.name "Research Engine"
  git config user.email "research@codesbyfebin.dev"
  git add . 2>/dev/null || true
  git commit -m "Initial: research engine setup" 2>/dev/null || true
  git branch -M main 2>/dev/null || true
  git push -u origin main 2>/dev/null && echo "✓" || echo "push failed"

  cd - > /dev/null
  rm -rf "$TEMP_DIR"

  SUCCESS=$((SUCCESS + 1))
done

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Summary"
echo "=========="
echo "✓ Total repos deployed: $SUCCESS/$TOTAL"
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
echo "   curl -H 'Authorization: token \$GITHUB_TOKEN' https://api.github.com/users/CodesbyFebin/repos | jq 'length'"
echo "   Should output: 70+"

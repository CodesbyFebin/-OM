#!/bin/bash
set -e

OWNER="CodesbyFebin"
REPOS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MANIFEST="$REPOS_DIR/../portfolio-manifest.json"

if [ ! -f "$MANIFEST" ]; then
    echo "❌ Error: portfolio-manifest.json not found at $MANIFEST"
    exit 1
fi

echo "════════════════════════════════════════════"
echo "🚀 Bulk Create & Push 70 Repositories"
echo "════════════════════════════════════════════"
echo ""
echo "Prerequisites:"
echo "  ✓ GitHub CLI (gh) installed"
echo "  ✓ GitHub authentication: gh auth status"
echo "  ✓ Sufficient API quota"
echo ""
read -p "Ready to create 70 repos? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

echo ""
echo "Starting bulk creation..."
echo ""

TOTAL=$(jq '.total_repositories' "$MANIFEST")
CREATED=0
FAILED=0
SKIPPED=0

jq -r '.repositories[] | @json' "$MANIFEST" | while read -r repo_json; do
    repo=$(echo "$repo_json" | jq '.')

    name=$(echo "$repo" | jq -r '.name')
    niche=$(echo "$repo" | jq -r '.niche')
    type_label=$(echo "$repo" | jq -r '.type')
    phase=$(echo "$repo" | jq -r '.phase')

    echo "[$phase] $name..."

    # Create repository
    if gh repo create "$OWNER/$name" \
        --public \
        --description "$niche" \
        --source=none 2>/dev/null; then

        echo "  ✓ Created"
        ((CREATED++))
    else
        # Check if it already exists
        if gh repo view "$OWNER/$name" &>/dev/null; then
            echo "  ⚠ Already exists"
            ((SKIPPED++))
        else
            echo "  ❌ Failed"
            ((FAILED++))
        fi
    fi

    # Clone and push
    if [ -d "/tmp/repo-push-$$/$name" ]; then
        rm -rf "/tmp/repo-push-$$/$name"
    fi

    git clone "https://github.com/$OWNER/$name.git" "/tmp/repo-push-$$/$name" 2>/dev/null || {
        echo "  ⚠ Clone failed (may need permission)"
        continue
    }

    cd "/tmp/repo-push-$$/$name"

    # Copy template files
    cp -r "$REPOS_DIR/$name"/* . 2>/dev/null || true

    # Commit and push
    git config user.name "Research Engine Setup"
    git config user.email "research@codesbyfebin.dev"
    git add .

    if git commit -m "Initial: research engine setup

- portfolio-manifest.json with niche definition
- .gitignore for research outputs
- GitHub Actions workflow for weekly auto-refresh
- Basic README

See: https://github.com/CodesbyFebin/-OM/tree/main/tools/research-engine-v2" 2>/dev/null; then
        git branch -M main
        git push -u origin main 2>/dev/null || echo "    ⚠ Push pending"
        echo "  ✓ Pushed"
    fi

    cd "$REPOS_DIR"
done

echo ""
echo "════════════════════════════════════════════"
echo "Summary:"
echo "  Created:  $CREATED"
echo "  Skipped:  $SKIPPED"
echo "  Failed:   $FAILED"
echo "  Total:    $(($CREATED + $SKIPPED + $FAILED))"
echo "════════════════════════════════════════════"
echo ""
echo "Next steps:"
echo "  1. Verify repos on GitHub: https://github.com/$OWNER?tab=repositories"
echo "  2. Set up CI/CD: GitHub Actions workflows are already in place"
echo "  3. Get GITHUB_TOKEN for automation (Settings > Developer settings > Tokens)"
echo "  4. Deploy research engine: dh-research repo --repo {name}"
echo ""

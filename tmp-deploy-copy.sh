#!/bin/bash
# Copy all 70 repos from cloud session to local deployment directory
# This script copies the 70 template repositories from /tmp/70-repos to your local machine

set -e

DEPLOY_DIR="$1"
if [ -z "$DEPLOY_DIR" ]; then
  DEPLOY_DIR="$HOME/70-repos-deploy"
fi

echo "Copying 70 repository templates..."
echo "Source: /tmp/70-repos"
echo "Destination: $DEPLOY_DIR"
echo ""

# Create main deployment directory
mkdir -p "$DEPLOY_DIR"

# Copy all 70 repo templates
cp -r /tmp/70-repos/* "$DEPLOY_DIR/"

# Make deployment scripts executable
chmod +x "$DEPLOY_DIR"/*.sh 2>/dev/null || true

echo "✓ Copied $(ls -1d "$DEPLOY_DIR"/*/ 2>/dev/null | wc -l) repository templates"
echo "✓ Copied deployment scripts"
echo ""
echo "Ready to deploy! Next steps:"
echo "  cd $DEPLOY_DIR"
echo "  chmod +x DEPLOY-ALL-70-FAST.sh"
echo "  ./DEPLOY-ALL-70-FAST.sh"

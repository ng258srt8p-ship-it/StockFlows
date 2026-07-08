#!/bin/bash
# StockFlows /loop - Automated audit, fix, and deploy cycle
# Runs every 30 minutes to continuously improve the live site

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PNPM="/Users/georgetozer/Library/pnpm/store/v11/links/@/pnpm/9.15.0/b9c4197fdf141246da3a65e0d60295514c68764dd2a9d8c92bb7028a65180aa2/bin/pnpm"
CLOUDFLARE_TOKEN="${CLOUDFLARE_API_TOKEN:?Set CLOUDFLARE_API_TOKEN environment variable}"
LOG_FILE="$PROJECT_DIR/loop.log"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

cd "$PROJECT_DIR"

log "=== /loop cycle started ==="

# Step 1: Run audit
log "Step 1: Running Playwright audit..."
"$PNPM" exec playwright test e2e/audit/audit.spec.ts --project=chromium 2>&1 | tee -a "$LOG_FILE"

# Read gap count from report
GAP_COUNT=0
if [ -f audit-report.md ]; then
  GAP_COUNT=$(grep -o 'Total gaps found: [0-9]*' audit-report.md | grep -o '[0-9]*' || echo "0")
fi

log "Audit complete: $GAP_COUNT gaps found"

if [ "$GAP_COUNT" = "0" ]; then
  log "No gaps found. Site is clean."
else
  log "Gaps detected. Attempting fixes..."
  # Gaps are fixed by the agent in the conversation loop.
  # This script triggers the audit; the agent handles fixes.
fi

# Step 2: Rebuild packages
log "Step 2: Rebuilding packages..."
cd "$PROJECT_DIR/packages/stockflows-ui"
"$PNPM" build 2>&1 | tee -a "$LOG_FILE"

cd "$PROJECT_DIR/packages/website"
"$PNPM" build 2>&1 | tee -a "$LOG_FILE"

cd "$PROJECT_DIR/packages/demo"
"$PNPM" build 2>&1 | tee -a "$LOG_FILE"

# Step 3: Deploy to Cloudflare Pages
log "Step 3: Deploying to Cloudflare Pages..."
cd "$PROJECT_DIR"
rm -rf pages-dist
mkdir -p pages-dist
cp -r packages/website/dist/* pages-dist/
mkdir -p pages-dist/demo
cp -r packages/demo/dist/* pages-dist/demo/
echo "deploy-$(date +%s)" > pages-dist/deploy-timestamp.txt

CLOUDFLARE_API_TOKEN="$CLOUDFLARE_TOKEN" npx wrangler pages deploy pages-dist --project-name=stockflows 2>&1 | tee -a "$LOG_FILE"

# Step 4: Deploy to Fly.io (only if Dockerfile changed since last deploy)
log "Step 4: Checking Fly.io deployment..."
if command -v flyctl &> /dev/null; then
  cd "$PROJECT_DIR"
  DOCKERFILE_CHANGED=$(git diff HEAD~1 --name-only 2>/dev/null | grep -c "Dockerfile" || echo "0")
  if [ "$DOCKERFILE_CHANGED" -gt "0" ]; then
    flyctl deploy --app stockflows 2>&1 | tee -a "$LOG_FILE" || log "Fly.io deploy failed"
  else
    log "No Dockerfile changes, skipping Fly.io deploy"
  fi
else
  log "flyctl not found, skipping Fly.io deploy"
fi

# Step 5: Run live e2e tests
log "Step 5: Running live e2e tests..."
cd "$PROJECT_DIR"
"$PNPM" exec playwright test e2e/live/live.spec.ts --project=chromium 2>&1 | tee -a "$LOG_FILE"

# Step 6: Commit and push to GitHub
log "Step 6: Committing and pushing to GitHub..."
cd "$PROJECT_DIR"
git add -A
if git diff --cached --quiet; then
  log "No changes to commit"
else
  git commit -m "loop: automated audit cycle $(date '+%Y-%m-%d %H:%M:%S')" 2>&1 | tee -a "$LOG_FILE"
  git push 2>&1 | tee -a "$LOG_FILE" || log "Git push failed"
fi

log "=== /loop cycle complete ==="

#!/bin/bash

# StockFlows Deployment Verification Script
# ==========================================
#
# Verifies a live deployment of the StockFlows Shopify app:
#   - Health endpoint returns {"status":"alive"}
#   - All 6 main app routes return HTTP 200
#   - Webhook endpoint accepts POST
#   - Static assets (manifest JS) are served correctly
#
# USAGE:
#   ./scripts/verify-deployment.sh                    # default: https://stockflows.fly.dev
#   ./scripts/verify-deployment.sh https://myapp.example.com
#
# DEPENDENCIES:
#   - curl
#   - jq (optional, for JSON pretty-printing)

set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
BASE_URL="${1:-https://stockflows.fly.dev}"
TIMEOUT=10          # seconds per request
PASS=0
FAIL=0
WARN=0

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
pass() { ((PASS++)); echo -e "  ${GREEN}✔ PASS${NC}  $1"; }
fail() { ((FAIL++)); echo -e "  ${RED}✘ FAIL${NC}  $1"; }
warn() { ((WARN++)); echo -e "  ${YELLOW}⚠ WARN${NC}  $1"; }
info() { echo -e "${CYAN}  ℹ  $1${NC}"; }

section() { echo -e "\n${BOLD}── $1 ──${NC}"; }

# ---------------------------------------------------------------------------
# 1. Health endpoint
# ---------------------------------------------------------------------------
section "1. Health Endpoint"

HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT" "$BASE_URL/health" 2>/dev/null || echo "000")
HEALTH_BODY=$(curl -s --max-time "$TIMEOUT" "$BASE_URL/health" 2>/dev/null || echo "")

if [ "$HEALTH_STATUS" = "200" ]; then
    # Check body contains "alive"
    if echo "$HEALTH_BODY" | grep -q '"status"'; then
        if echo "$HEALTH_BODY" | grep -q 'alive'; then
            pass "GET /health → 200  |  body: $HEALTH_BODY"
        else
            fail "GET /health → 200  but body missing 'alive': $HEALTH_BODY"
        fi
    else
        fail "GET /health → 200  but body missing 'status' field: $HEALTH_BODY"
    fi
else
    fail "GET /health → expected 200, got $HEALTH_STATUS"
fi

# ---------------------------------------------------------------------------
# 2. Route availability (HTTP 200)
# ---------------------------------------------------------------------------
section "2. Route Availability"

ROUTES=(
    "/app"
    "/app/inventory"
    "/app/purchasing"
    "/app/forecasting"
    "/app/reports"
    "/app/settings"
)

for route in "${ROUTES[@]}"; do
    CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT" "$BASE_URL$route" 2>/dev/null || echo "000")
    if [ "$CODE" = "200" ]; then
        pass "GET $route → 200"
    elif [ "$CODE" = "000" ]; then
        fail "GET $route → connection failed (timeout or DNS)"
    else
        fail "GET $route → expected 200, got $CODE"
    fi
done

# ---------------------------------------------------------------------------
# 3. Webhook endpoint accepts POST
# ---------------------------------------------------------------------------
section "3. Webhook Endpoint"

# Shopify webhooks typically POST to /webhooks or use HMAC headers.
# Test common webhook paths.
WEBHOOK_PATHS=(
    "/webhooks"
    "/api/webhooks"
    "/webhooks/shopify"
)

WEBHOOK_FOUND=false

for path in "${WEBHOOK_PATHS[@]}"; do
    CODE=$(curl -s -o /dev/null -w "%{http_code}" \
        --max-time "$TIMEOUT" \
        -X POST \
        -H "Content-Type: application/json" \
        -d '{}' \
        "$BASE_URL$path" 2>/dev/null || echo "000")

    if [ "$CODE" = "000" ]; then
        fail "POST $path → connection failed"
    elif [ "$CODE" = "400" ] || [ "$CODE" = "401" ] || [ "$CODE" = "403" ] || [ "$CODE" = "404" ]; then
        # Non-200 but the route exists and responded — the endpoint is reachable.
        # 400 = bad body (expected), 401/403 = HMAC validation (expected), 404 = route not found.
        if [ "$CODE" = "404" ]; then
            warn "POST $path → 404 (route not configured)"
        else
            pass "POST $path → $CODE (endpoint reachable; rejected as expected without valid payload/HMAC)"
            WEBHOOK_FOUND=true
        fi
    elif [ "$CODE" = "200" ] || [ "$CODE" = "201" ]; then
        pass "POST $path → $CODE (accepted)"
        WEBHOOK_FOUND=true
    else
        info "POST $path → $CODE (unexpected status code)"
    fi
done

if [ "$WEBHOOK_FOUND" = false ]; then
    warn "No confirmed webhook endpoint found. Check SHOPIFY_WEBHOOKS config."
fi

# ---------------------------------------------------------------------------
# 4. Static assets
# ---------------------------------------------------------------------------
section "4. Static Assets"

# Remix builds hashed JS chunks into /build/client/assets/.
# We probe a known entry-point chunk pattern.
ASSET_PATHS=(
    "/assets/app-"
    "/assets/app._index-"
)

ASSET_FOUND=false

for prefix in "${ASSET_PATHS[@]}"; do
    # Try to find a matching asset via the HTML source of the main route
    HTML=$(curl -s --max-time "$TIMEOUT" "$BASE_URL/app" 2>/dev/null || echo "")

    if [ -n "$HTML" ]; then
        # Extract JS asset paths from <script> tags
        SCRIPTS=$(echo "$HTML" | grep -oE '/assets/[^"]+\.js' | head -20)

        if [ -n "$SCRIPTS" ]; then
            # Pick the first script that starts with /assets/app
            MATCHED=$(echo "$SCRIPTS" | grep -E "^/assets/app" | head -1)

            if [ -n "$MATCHED" ]; then
                ASSET_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT" "$BASE_URL$MATCHED" 2>/dev/null || echo "000")
                if [ "$ASSET_CODE" = "200" ]; then
                    pass "GET $MATCHED → 200 (JS chunk served)"
                    ASSET_FOUND=true
                else
                    fail "GET $MATCHED → expected 200, got $ASSET_CODE"
                fi
                break
            fi
        fi
    fi
done

if [ "$ASSET_FOUND" = false ]; then
    # Fallback: check for common static files in public/
    FALLBACK_ASSETS=("/favicon.png" "/style.css" "/tailwind-styles.css")

    for asset in "${FALLBACK_ASSETS[@]}"; do
        CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT" "$BASE_URL$asset" 2>/dev/null || echo "000")
        if [ "$CODE" = "200" ]; then
            pass "GET $asset → 200 (static file served)"
            ASSET_FOUND=true
            break
        fi
    done

    if [ "$ASSET_FOUND" = false ]; then
        warn "Could not verify any static assets"
    fi
fi

# Also check that a CSS asset loads
CSS_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT" "$BASE_URL/tailwind-styles.css" 2>/dev/null || echo "000")
if [ "$CSS_CODE" = "200" ]; then
    pass "GET /tailwind-styles.css → 200"
else
    warn "GET /tailwind-styles.css → $CSS_CODE"
fi

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
echo ""
echo -e "${BOLD}═══════════════════════════════════════════${NC}"
echo -e "${BOLD}  Results for ${CYAN}$BASE_URL${NC}"
echo -e "${BOLD}═══════════════════════════════════════════${NC}"
echo -e "  ${GREEN}✔ Passed: $PASS${NC}"
echo -e "  ${RED}✘ Failed: $FAIL${NC}"
echo -e "  ${YELLOW}⚠ Warnings: $WARN${NC}"
echo -e "${BOLD}═══════════════════════════════════════════${NC}"

if [ $FAIL -gt 0 ]; then
    echo -e "\n${RED}${BOLD}Deployment verification FAILED${NC} — $FAIL check(s) did not pass.\n"
    exit 1
else
    echo -e "\n${GREEN}${BOLD}Deployment verification PASSED${NC} — all critical checks OK.\n"
    exit 0
fi

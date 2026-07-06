#!/bin/bash
set -e
BASE="/Users/georgetozer/Development/Shopify Apps/stockflows"
cd "$BASE"

echo "=== Building website ==="
pnpm --filter @stockflows/website build

echo "=== Building demo ==="
pnpm --filter @stockflows/demo build

echo "=== Assembling pages-dist ==="
rm -rf "$BASE/pages-dist"
mkdir -p "$BASE/pages-dist/demo"

# Website is at packages/website/
cp -r "$BASE/packages/website/dist/index.html" "$BASE/pages-dist/"
cp -r "$BASE/packages/website/dist/assets" "$BASE/pages-dist/"

# Demo is at demo/ (not packages/demo/)
cp -r "$BASE/demo/dist/index.html" "$BASE/pages-dist/demo/"
cp -r "$BASE/demo/dist/assets" "$BASE/pages-dist/demo/"

echo "=== pages-dist assembled ==="
ls -la "$BASE/pages-dist/"
ls -la "$BASE/pages-dist/demo/"
echo "=== Done ==="

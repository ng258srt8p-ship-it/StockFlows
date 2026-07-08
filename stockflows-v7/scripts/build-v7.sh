#!/bin/bash
set -e

echo "Building StockFlows v7..."
pnpm run build:v7

echo "Build complete. Deploy with:"
echo "  flyctl deploy --app stockflows"
echo "  npx wrangler pages deploy packages/website/dist --project-name=stockflows-website"
echo "  npx wrangler pages deploy packages/demo/dist --project-name=stockflows-tour"

# Deploy StockFlows Tour to GitHub + Cloudflare Pages

## Prerequisites

1. **GitHub account** + `gh` CLI authenticated (`gh auth login`)
2. **Cloudflare account** with Pages enabled
3. **Domain purchased**: stockflows.app (on Cloudflare Registrar or transferred)

## One-Command Deploy

```bash
cd stockflows
npx tsx scripts/deploy-tour.ts
```

## Manual Steps (if automation fails)

### Step 1: Create GitHub Repo

```bash
# Authenticate
gh auth login

# Create and push
gh repo create stockflows --public --description "Inventory management for Shopify" --source=. --remote=origin --push
```

Or manually:
1. Go to https://github.com/new
2. Name: `stockflows`
3. Create repo
4. Then:
```bash
git remote add origin git@github.com:YOUR_USER/stockflows.git
git push -u origin main
```

### Step 2: Deploy to Cloudflare Pages

```bash
# Install wrangler if needed
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
npx wrangler pages deploy public --project-name=stockflows-tour --branch=main
```

This deploys the `public/` directory (tour.html, privacy.html) to Cloudflare Pages.

### Step 3: Set Up Custom Domain

1. Go to https://dash.cloudflare.com
2. Navigate to **Workers & Pages** > **stockflows-tour**
3. Click **Custom domains**
4. Click **Set up a custom domain**
5. Enter: `stockflows.app`
6. Cloudflare auto-adds DNS records and provisions SSL
7. Wait 1-5 minutes for propagation
8. Verify: https://stockflows.app

### Step 4: Verify

```bash
# Check the site is live
curl -s -o /dev/null -w "%{http_code}" https://stockflows.app
# Should return 200

# Check privacy page
curl -s -o /dev/null -w "%{http_code}" https://stockflows.app/privacy.html
# Should return 200
```

## Updating the Tour

After making changes to `public/tour.html`:

```bash
# Commit changes
git add public/
git commit -m "Update tour: DESCRIPTION"
git push origin main

# Deploy to Cloudflare
npx wrangler pages deploy public --project-name=stockflows-tour --branch=main
```

The deployment takes ~30 seconds and propagates globally within minutes.

## Environment Variables (Cloudflare Pages)

Set these in the Cloudflare dashboard under Pages > stockflows-tour > Settings > Environment variables:

| Variable | Value | Required |
|----------|-------|----------|
| `OPENCODE_API_KEY` | Your OpenCode API key | For AI features |
| `RESEND_API_KEY` | Your Resend API key | For email alerts |
| `TWILIO_ACCOUNT_SID` | Your Twilio Account SID | For SMS alerts |
| `SLACK_WEBHOOK_URL` | Your Slack webhook URL | For Slack alerts |
| `SENTRY_DSN` | Your Sentry DSN | For error tracking |

Note: The tour page (static HTML) doesn't use these — they're for the production Remix app.

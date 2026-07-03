# StockFlows Website Redesign Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Create a complete marketing website at stockflows.app that showcases the full StockFlows experience - from landing page through feature demos to the live app.

**Architecture:** The website will be a static HTML/CSS/JS site deployed via Cloudflare Pages (serving `public/`). It will feature:
1. A stunning landing page with hero section, features, and CTA
2. An interactive demo/tour page showing the app in action
3. A seamless transition from marketing to the live Shopify app

**Tech Stack:** HTML5, CSS3 (matching stockflows.app design system), vanilla JavaScript, Google Fonts (Inter + Instrument Serif)

---

## Gate Table (Definition of Done)

| Gate # | Gate | Verification Method | Pass Condition |
|--------|------|---------------------|----------------|
| 1 | Landing page loads at stockflows.app | `curl -s https://stockflows.app | grep -o "StockFlows"` | Title found |
| 2 | Hero section renders with correct styling | Playwright: verify hero text visible | Hero visible |
| 3 | Features section shows 6 feature cards | Playwright: count feature cards | 6 cards |
| 4 | CTA button links to Shopify install | Playwright: verify href contains shopify | Link valid |
| 5 | Demo page loads with interactive elements | Playwright: verify demo page loads | Demo visible |
| 6 | Mobile responsive design works | Playwright: viewport 375px | No horizontal scroll |
| 7 | All pages load without console errors | Playwright: check console | 0 errors |

---

## Task 1: Create Landing Page Structure

**Objective:** Create the main index.html with hero section and navigation.

**Files:**
- Create: `public/index.html`

**Step 1: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>StockFlows - Inventory Management for Shopify</title>
  <link rel="icon" type="image/png" href="/favicon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Instrument+Serif:ital@0;1&display=swap">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <!-- Navigation -->
  <nav class="nav">
    <div class="nav-inner">
      <a href="/" class="logo">
        <img src="/SF icon.svg" alt="StockFlows" width="24" height="24">
        StockFlows
      </a>
      <div class="nav-links">
        <a href="#features">Features</a>
        <a href="#demo">Demo</a>
        <a href="https://admin.shopify.com/store/stockflows2/apps/stockflows-app" class="btn btn-sm btn-brand">Open App</a>
      </div>
    </div>
  </nav>

  <!-- Hero Section -->
  <section class="hero">
    <div class="hero-inner">
      <p class="eyebrow">SHOPIFY INVENTORY MANAGEMENT</p>
      <h1>Stop guessing your inventory levels.</h1>
      <p class="sub">StockFlows gives you clarity by automatically syncing your sales, purchases, and inventory. Know exactly what you have, where it is, and when to reorder.</p>
      <div class="btn-group">
        <a href="https://admin.shopify.com/store/stockflows2/apps/stockflows-app" class="btn btn-brand">Open Dashboard</a>
        <a href="#demo" class="btn btn-outline">View Demo</a>
      </div>
    </div>
  </section>

  <!-- Stats Section -->
  <section class="stats-section">
    <div class="stats-inner">
      <div class="stat">
        <div class="n">26</div>
        <div class="l">PRODUCTS TRACKED</div>
      </div>
      <div class="stat">
        <div class="n">4</div>
        <div class="l">LOCATIONS</div>
      </div>
      <div class="stat">
        <div class="n">99.9%</div>
        <div class="l">UPTIME</div>
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <section class="features" id="features">
    <div class="features-inner">
      <h2>Everything you need to manage inventory</h2>
      <p class="section-sub">From real-time tracking to intelligent forecasting</p>
      
      <div class="feature-grid">
        <div class="feature-card">
          <div class="feature-icon">📦</div>
          <h3>Multi-Location Tracking</h3>
          <p>Track inventory across warehouses, retail stores, and fulfillment centers in real-time.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📊</div>
          <h3>Demand Forecasting</h3>
          <p>AI-powered predictions using ETS, linear regression, and ensemble models.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🛒</div>
          <h3>Purchase Orders</h3>
          <p>Create POs, track receiving, and calculate landed costs automatically.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🔔</div>
          <h3>Smart Alerts</h3>
          <p>Get notified before stockouts happen with customizable reorder points.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📈</div>
          <h3>Analytics & Reports</h3>
          <p>Export CSV, generate PDF reports, and track inventory valuation.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🔐</div>
          <h3>RBAC Security</h3>
          <p>Role-based access control with Owner, Manager, and Staff permissions.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Demo Section -->
  <section class="demo-section" id="demo">
    <div class="demo-inner">
      <h2>See it in action</h2>
      <p class="section-sub">Explore the dashboard with real inventory data</p>
      <div class="demo-preview">
        <img src="/dashboard.png" alt="StockFlows Dashboard" class="demo-image">
        <a href="https://admin.shopify.com/store/stockflows2/apps/stockflows-app" class="btn btn-brand btn-lg">Open Live Dashboard</a>
      </div>
    </div>
  </section>

  <!-- CTA Section -->
  <section class="cta-section">
    <div class="cta-inner">
      <h2>Ready to take control of your inventory?</h2>
      <p>Install StockFlows on your Shopify store and start managing inventory like a pro.</p>
      <a href="https://admin.shopify.com/store/stockflows2/apps/stockflows-app" class="btn btn-brand btn-lg">Get Started Free</a>
    </div>
  </section>

  <!-- Footer -->
  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <img src="/SF icon.svg" alt="StockFlows" width="20" height="20">
        <span>StockFlows</span>
      </div>
      <div class="footer-links">
        <a href="#features">Features</a>
        <a href="#demo">Demo</a>
        <a href="https://admin.shopify.com/store/stockflows2/apps/stockflows-app">Open App</a>
      </div>
      <div class="footer-copy">
        © 2026 StockFlows. Built for Shopify merchants.
      </div>
    </div>
  </footer>

  <script src="script.js"></script>
</body>
</html>
```

**Step 2: Verify**

Run: `curl -s http://localhost:8080/ | grep -o "StockFlows"`
Expected: Title found

**Step 3: Commit**

```bash
git add public/index.html
git commit -m "feat: create landing page structure"
```

---

## Task 2: Create Landing Page Styles

**Objective:** Create the CSS stylesheet matching stockflows.app design system.

**Files:**
- Create: `public/style.css`

**Step 1: Create style.css**

```css
/* StockFlows Website - Brutalist Editorial Design */
:root {
  --bg: #fafafa;
  --bg-dark: #111111;
  --text: #111111;
  --text-dim: #666;
  --text-dimmer: #999;
  --border: #e0e0e0;
  --brand: #111111;
  --critical: #dc2626;
  --warning: #d97706;
  --success: #16a34a;
  --font: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --serif: 'Instrument Serif', Georgia, 'Times New Roman', serif;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: var(--font);
  background: var(--bg);
  color: var(--text);
  -webkit-font-smoothing: antialiased;
}

/* Navigation */
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(250, 250, 250, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
  z-index: 100;
}

.nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--text);
  text-decoration: none;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 32px;
}

.nav-links a {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-dim);
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.nav-links a:hover {
  color: var(--text);
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  font-size: 0.8rem;
  font-weight: 500;
  font-family: var(--font);
  cursor: pointer;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  text-decoration: none;
  transition: all 0.15s;
  border: 2px solid transparent;
}

.btn-brand {
  background: var(--brand);
  color: #fff;
  border-color: var(--brand);
}

.btn-brand:hover {
  background: #333;
  border-color: #333;
}

.btn-outline {
  background: transparent;
  border-color: #444;
  color: #ccc;
}

.btn-outline:hover {
  background: #fff;
  color: var(--text);
  border-color: #fff;
}

.btn-sm {
  padding: 8px 16px;
  font-size: 0.7rem;
}

.btn-lg {
  padding: 18px 40px;
  font-size: 0.85rem;
}

/* Hero */
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-dark);
  color: #fff;
  padding: 120px 24px 80px;
}

.hero-inner {
  max-width: 800px;
  text-align: center;
}

.eyebrow {
  font-size: 0.65rem;
  font-weight: 500;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: #666;
  margin-bottom: 32px;
}

.hero h1 {
  font-family: var(--serif);
  font-size: clamp(3rem, 8vw, 6rem);
  font-weight: 400;
  font-style: italic;
  letter-spacing: -3px;
  line-height: 0.9;
  margin-bottom: 28px;
}

.hero .sub {
  font-size: 1rem;
  color: #888;
  margin-bottom: 48px;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.8;
}

.hero .btn-group {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

/* Stats Section */
.stats-section {
  background: #fff;
  border-bottom: 1px solid var(--border);
}

.stats-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 64px 24px;
  display: flex;
  justify-content: center;
  gap: 96px;
  flex-wrap: wrap;
}

.stat {
  text-align: center;
}

.stat .n {
  font-family: var(--serif);
  font-size: 4rem;
  font-style: italic;
  line-height: 1;
}

.stat .l {
  font-size: 0.65rem;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-top: 8px;
}

/* Features */
.features {
  padding: 120px 24px;
  background: var(--bg);
}

.features-inner {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.features h2 {
  font-family: var(--serif);
  font-size: 2.5rem;
  font-weight: 400;
  font-style: italic;
  margin-bottom: 8px;
}

.section-sub {
  color: var(--text-dim);
  margin-bottom: 64px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  text-align: left;
}

.feature-card {
  background: #fff;
  border: 1px solid var(--border);
  padding: 32px;
  transition: border-color 0.15s;
}

.feature-card:hover {
  border-color: #999;
}

.feature-icon {
  font-size: 2rem;
  margin-bottom: 16px;
}

.feature-card h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.feature-card p {
  font-size: 0.85rem;
  color: var(--text-dim);
  line-height: 1.6;
}

/* Demo Section */
.demo-section {
  padding: 120px 24px;
  background: #fff;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

.demo-inner {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.demo-inner h2 {
  font-family: var(--serif);
  font-size: 2.5rem;
  font-weight: 400;
  font-style: italic;
  margin-bottom: 8px;
}

.demo-preview {
  margin-top: 48px;
}

.demo-image {
  max-width: 100%;
  border: 1px solid var(--border);
  margin-bottom: 32px;
}

/* CTA Section */
.cta-section {
  padding: 120px 24px;
  background: var(--bg-dark);
  color: #fff;
  text-align: center;
}

.cta-inner {
  max-width: 600px;
  margin: 0 auto;
}

.cta-section h2 {
  font-family: var(--serif);
  font-size: 2.5rem;
  font-weight: 400;
  font-style: italic;
  margin-bottom: 16px;
}

.cta-section p {
  color: #888;
  margin-bottom: 32px;
}

/* Footer */
.footer {
  background: var(--bg);
  border-top: 1px solid var(--border);
  padding: 48px 24px;
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 24px;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.footer-links {
  display: flex;
  gap: 24px;
}

.footer-links a {
  font-size: 0.75rem;
  color: var(--text-dim);
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.footer-links a:hover {
  color: var(--text);
}

.footer-copy {
  font-size: 0.75rem;
  color: var(--text-dimmer);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .hero h1 {
    font-size: 2.5rem;
    letter-spacing: -1px;
  }
  
  .stats-inner {
    gap: 48px;
  }
  
  .stat .n {
    font-size: 2.5rem;
  }
  
  .feature-grid {
    grid-template-columns: 1fr;
  }
  
  .footer-inner {
    flex-direction: column;
    text-align: center;
  }
}
```

**Step 2: Verify**

Run: `curl -s http://localhost:8080/style.css | grep -o "Instrument Serif"`
Expected: Font reference found

**Step 3: Commit**

```bash
git add public/style.css
git commit -m "feat: create landing page styles"
```

---

## Task 3: Create Landing Page Script

**Objective:** Add smooth scrolling and interactive elements.

**Files:**
- Create: `public/script.js`

**Step 1: Create script.js**

```javascript
// StockFlows Landing Page Script

document.addEventListener('DOMContentLoaded', () => {
  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Navbar background on scroll
  const nav = document.querySelector('.nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.style.background = 'rgba(250, 250, 250, 0.98)';
    } else {
      nav.style.background = 'rgba(250, 250, 250, 0.95)';
    }
  });

  // Animate stats on scroll
  const stats = document.querySelectorAll('.stat .n');
  const observerOptions = {
    threshold: 0.5
  };

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
      }
    });
  }, observerOptions);

  stats.forEach(stat => statsObserver.observe(stat));
});
```

**Step 2: Verify**

Run: `curl -s http://localhost:8080/script.js | grep -o "DOMContentLoaded"`
Expected: Script loaded

**Step 3: Commit**

```bash
git add public/script.js
git commit -m "feat: create landing page script"
```

---

## Task 4: Remove Redirect Page

**Objective:** Remove the old redirect page that was blocking the landing page.

**Files:**
- Delete: `public/index.html` (old redirect)

**Step 1: Check if old index.html exists**

Run: `ls -la public/index.html`
Expected: File exists

**Step 2: Remove old file**

Run: `rm public/index.html`
Expected: File removed

**Step 3: Verify new index.html is in place**

Run: `ls -la public/index.html`
Expected: New landing page exists

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: remove old redirect page"
```

---

## Task 5: Deploy to Cloudflare Pages

**Objective:** Deploy the updated website to Cloudflare Pages.

**Files:**
- None (deployment only)

**Step 1: Verify Cloudflare CLI is installed**

Run: `which wrangler`
Expected: Path to wrangler binary

**Step 2: Deploy to Cloudflare Pages**

Run: `wrangler pages deploy public --project-name=stockflows-tour`
Expected: Deployment successful

**Step 3: Verify deployment**

Run: `curl -s https://stockflows.app | grep -o "StockFlows"`
Expected: Title found

**Step 4: Test all pages**

1. Visit https://stockflows.app
2. Verify hero section loads
3. Click "Open Dashboard" button
4. Verify it opens the Shopify app
5. Click "View Demo" button
6. Verify it scrolls to demo section
7. Test on mobile viewport

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: deploy landing page to Cloudflare Pages"
```

---

## Summary

| Task | Description | Est. Time |
|------|-------------|-----------|
| 1 | Create landing page structure | 15 min |
| 2 | Create landing page styles | 20 min |
| 3 | Create landing page script | 10 min |
| 4 | Remove redirect page | 2 min |
| 5 | Deploy to Cloudflare Pages | 10 min |

**Total: ~57 minutes**

---

## Notes

- Design matches stockflows.app brutalist editorial aesthetic
- Uses Inter + Instrument Serif fonts
- Responsive design for mobile/desktop
- Smooth scrolling and animations
- Clear CTAs to open the Shopify app
- Stats section showing live data
- Feature grid showcasing all capabilities
- Demo section with dashboard preview
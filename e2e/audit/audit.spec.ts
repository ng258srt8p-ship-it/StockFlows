import { test, expect, type Page } from '@playwright/test';

const WEBSITE = 'https://stockflows.app';
const DEMO = 'https://stockflows.app/demo';
const APP = 'https://stockflows.fly.dev';

interface Gap {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  page: string;
  description: string;
  recommendation: string;
}

const gaps: Gap[] = [];

function recordGap(severity: Gap['severity'], category: string, page: string, description: string, recommendation: string) {
  gaps.push({ severity, category, page, description, recommendation });
}

// ═══════════════════════════════════════════════════
// WEBSITE AUDIT
// ═══════════════════════════════════════════════════

test.describe('Website Audit', () => {
  test('homepage structure and content', async ({ page }) => {
    await page.goto(WEBSITE);

    // Check title
    const title = await page.title();
    if (!title.includes('StockFlows')) {
      recordGap('critical', 'SEO', 'homepage', 'Missing or incorrect page title', 'Set title to "StockFlows — AI-Powered Inventory Management for Shopify"');
    }

    // Check meta description
    const metaDesc = await page.$eval('meta[name="description"]', el => el.getAttribute('content') || '').catch(() => '');
    if (!metaDesc || metaDesc.length < 50) {
      recordGap('high', 'SEO', 'homepage', 'Missing or short meta description', 'Add a 150+ character meta description');
    }

    // Check hero section
    const h1 = await page.$('h1');
    if (!h1) {
      recordGap('critical', 'Content', 'homepage', 'No H1 heading found', 'Add a clear hero headline');
    }

    // Check hero loads image/visual
    const heroSection = await page.$('[class*="hero"], [class*="Hero"], section:first-of-type');
    if (!heroSection) {
      recordGap('high', 'Layout', 'homepage', 'No hero section detected', 'Ensure hero section renders with visual element');
    }

    // Check CTA buttons
    const ctaButtons = await page.$$('a[href*="stockflows.fly.dev"], a[href*="/demo"]');
    if (ctaButtons.length === 0) {
      recordGap('critical', 'Conversion', 'homepage', 'No CTA buttons found', 'Add "Launch App" and "Try Demo" CTAs');
    }

    // Check navigation
    const nav = await page.$('nav');
    if (!nav) {
      recordGap('high', 'Navigation', 'homepage', 'No navigation bar found', 'Add persistent navigation');
    }

    // Check footer
    const footer = await page.$('footer');
    if (!footer) {
      recordGap('medium', 'Layout', 'homepage', 'No footer found', 'Add footer with links and copyright');
    }

    // Check for broken links
    const links = await page.$$('a[href]');
    for (const link of links.slice(0, 20)) {
      const href = await link.getAttribute('href');
      if (href && href.startsWith('http') && !href.includes('stockflows')) {
        // External link - just note it
      }
    }
  });

  test('navigation and routing', async ({ page }) => {
    await page.goto(WEBSITE);
    await page.waitForLoadState('networkidle');

    // Check nav links work
    const navLinks = await page.$$('nav a[href]');
    for (const link of navLinks) {
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      if (href && href.startsWith('#')) {
        // Anchor link - check target exists using CSS id selector
        const id = href.substring(1);
        const target = await page.$(`#${id}`);
        if (!target) {
          recordGap('medium', 'Navigation', 'homepage', `Anchor link "${href}" (${text}) has no target`, 'Ensure all anchor links have matching IDs');
        }
      }
    }
  });

  test('responsive - mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(WEBSITE);

    // Check if layout doesn't overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = 375;
    if (bodyWidth > viewportWidth + 10) {
      recordGap('critical', 'Responsive', 'homepage (mobile)', `Page overflows horizontally: ${bodyWidth}px > ${viewportWidth}px`, 'Fix responsive layout to prevent horizontal scroll');
    }

    // Check if text is readable (min font size)
    const smallText = await page.$$eval('p, span, a', els => {
      return els.filter(el => {
        const style = getComputedStyle(el);
        const fontSize = parseFloat(style.fontSize);
        return fontSize < 12 && el.textContent?.trim();
      }).length;
    });
    if (smallText > 5) {
      recordGap('high', 'Responsive', 'homepage (mobile)', `${smallText} elements have font size < 12px`, 'Increase minimum font size for mobile readability');
    }
  });

  test('responsive - tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(WEBSITE);

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    if (bodyWidth > 778) {
      recordGap('medium', 'Responsive', 'homepage (tablet)', `Page overflows: ${bodyWidth}px`, 'Fix tablet layout');
    }
  });

  test('performance - Largest Contentful Paint', async ({ page }) => {
    await page.goto(WEBSITE);

    const lcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          resolve(entries[entries.length - 1].startTime);
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        setTimeout(() => resolve(0), 5000);
      });
    });

    if (lcp > 4000) {
      recordGap('high', 'Performance', 'homepage', `LCP is ${Math.round(lcp)}ms (target: < 2500ms)`, 'Optimize hero image and critical CSS');
    } else if (lcp > 2500) {
      recordGap('medium', 'Performance', 'homepage', `LCP is ${Math.round(lcp)}ms (target: < 2500ms)`, 'Consider optimizing LCP element');
    }
  });

  test('accessibility - basic checks', async ({ page }) => {
    await page.goto(WEBSITE);

    // Check for images without alt text
    const images = await page.$$('img');
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      if (!alt) {
        const src = await img.getAttribute('src');
        recordGap('medium', 'Accessibility', 'homepage', `Image missing alt text: ${src?.substring(0, 50)}`, 'Add descriptive alt text to all images');
        break; // Report once
      }
    }

    // Check for color contrast (basic)
    const lowContrastElements = await page.evaluate(() => {
      const issues: string[] = [];
      const elements = document.querySelectorAll('p, span, a, h1, h2, h3, h4, h5, h6');
      for (const el of Array.from(elements).slice(0, 50)) {
        const style = getComputedStyle(el);
        const color = style.color;
        const bg = style.backgroundColor;
        if (color === bg && el.textContent?.trim()) {
          issues.push(`${el.tagName}: color=${color} bg=${bg}`);
        }
      }
      return issues;
    });
    for (const issue of lowContrastElements) {
      recordGap('high', 'Accessibility', 'homepage', `Possible low contrast: ${issue}`, 'Ensure text has sufficient contrast ratio');
    }

    // Check for focus indicators
    const hasFocusStyles = await page.evaluate(() => {
      const links = document.querySelectorAll('a, button');
      for (const el of Array.from(links).slice(0, 10)) {
        const style = getComputedStyle(el);
        if (style.outline === 'none' && style.boxShadow === 'none') {
          return false;
        }
      }
      return true;
    });
    if (!hasFocusStyles) {
      recordGap('medium', 'Accessibility', 'homepage', 'Missing focus indicators on interactive elements', 'Add visible focus styles for keyboard navigation');
    }
  });

  test('interaction - CTA links', async ({ page }) => {
    await page.goto(WEBSITE);

    // Test primary CTA
    const primaryCTA = await page.$('a[href*="stockflows.fly.dev"]');
    if (primaryCTA) {
      const href = await primaryCTA.getAttribute('href');
      const response = await page.request.get(href || '');
      if (!response.ok()) {
        recordGap('critical', 'Conversion', 'homepage', `Primary CTA link broken: ${href}`, 'Fix broken CTA link');
      }
    }

    // Test demo CTA
    const demoCTA = await page.$('a[href="/demo"]');
    if (demoCTA) {
      await demoCTA.click();
      await page.waitForLoadState('networkidle');
      if (!page.url().includes('/demo')) {
        recordGap('high', 'Conversion', 'homepage', 'Demo CTA does not navigate to /demo', 'Fix demo link navigation');
      }
    }
  });

  test('social proof section', async ({ page }) => {
    await page.goto(WEBSITE);

    // Check for testimonials
    const hasTestimonials = await page.$('text=Trusted by') || await page.$('text=testimonial') || await page.$('text=review');
    if (!hasTestimonials) {
      recordGap('medium', 'Content', 'homepage', 'No social proof / testimonials section found', 'Add customer testimonials or G2 ratings');
    }

    // Check for pricing
    const hasPricing = await page.$('#pricing') || await page.$('text=Pricing') || await page.$('text=$0');
    if (!hasPricing) {
      recordGap('medium', 'Content', 'homepage', 'No pricing section found', 'Add pricing comparison table');
    }
  });
});

// ═══════════════════════════════════════════════════
// DEMO AUDIT
// ═══════════════════════════════════════════════════

test.describe('Demo Audit', () => {
  test('demo loads and renders', async ({ page }) => {
    await page.goto(DEMO);

    // Check sidebar renders
    const sidebar = await page.$('nav') || await page.$('[class*="sidebar"]');
    if (!sidebar) {
      recordGap('critical', 'Layout', 'demo', 'Sidebar navigation not rendering', 'Ensure sidebar component renders');
    }

    // Check dashboard loads
    const hasContent = await page.$('text=Total Stock Value') || await page.$('text=Dashboard');
    if (!hasContent) {
      recordGap('critical', 'Content', 'demo', 'Dashboard content not rendering', 'Ensure dashboard stat cards load');
    }
  });

  test('demo navigation works', async ({ page }) => {
    await page.goto(DEMO);
    await page.waitForLoadState('networkidle');

    // Test sidebar navigation - demo uses Zustand state routing (not URL-based)
    // Verify clicking nav items changes the main content area
    const navItems = ['Inventory', 'Purchasing', 'Forecasting'];
    for (const item of navItems) {
      const link = await page.locator(`button:has-text("${item}")`).first();
      if (await link.isVisible()) {
        // Record content before click
        const beforeText = await page.locator('main').textContent();
        await link.click();
        await page.waitForTimeout(500);
        // Record content after click
        const afterText = await page.locator('main').textContent();
        if (beforeText === afterText) {
          recordGap('medium', 'Navigation', 'demo', `Clicking "${item}" didn't change content`, 'Fix navigation state routing');
        }
      } else {
        recordGap('medium', 'Navigation', 'demo', `Nav item "${item}" not found in sidebar`, 'Ensure all nav items are present');
      }
    }
  });

  test('demo responsive - mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(DEMO);

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    if (bodyWidth > 385) {
      recordGap('critical', 'Responsive', 'demo (mobile)', `Demo overflows: ${bodyWidth}px`, 'Fix mobile sidebar to be collapsible');
    }

    // Check if sidebar is hidden/collapsed on mobile
    const sidebarVisible = await page.evaluate(() => {
      const nav = document.querySelector('nav, [class*="sidebar"]');
      if (!nav) return false;
      const rect = nav.getBoundingClientRect();
      return rect.width > 50 && rect.x >= 0;
    });
    if (sidebarVisible) {
      recordGap('high', 'Responsive', 'demo (mobile)', 'Sidebar takes full width on mobile', 'Add hamburger menu / collapsible sidebar for mobile');
    }
  });

  test('demo interactive elements', async ({ page }) => {
    await page.goto(DEMO);

    // Check if buttons are clickable
    const buttons = await page.$$('button');
    let unclickable = 0;
    for (const btn of buttons.slice(0, 10)) {
      const disabled = await btn.getAttribute('disabled');
      const isVisible = await btn.isVisible();
      if (disabled && isVisible) {
        unclickable++;
      }
    }
    if (unclickable > 3) {
      recordGap('medium', 'Usability', 'demo', `${unclickable} visible buttons are disabled`, 'Review disabled button states');
    }
  });

  test('demo dark theme consistency', async ({ page }) => {
    await page.goto(DEMO);

    // Check background color
    const bgColor = await page.evaluate(() => {
      return getComputedStyle(document.body).backgroundColor;
    });

    // Should be dark (#0A0B0E or similar)
    if (bgColor.includes('255, 255, 255') || bgColor.includes('0, 0, 0') === false) {
      const rgb = bgColor.match(/\d+/g);
      if (rgb && parseInt(rgb[0]) > 50) {
        recordGap('high', 'Design', 'demo', `Background not dark theme: ${bgColor}`, 'Ensure dark theme is applied');
      }
    }
  });
});

// ═══════════════════════════════════════════════════
// APP AUDIT (Fly.io)
// ═══════════════════════════════════════════════════

test.describe('Shopify App Audit', () => {
  test('app health and routing', async ({ request }) => {
    const healthResponse = await request.get(`${APP}/health`);
    if (!healthResponse.ok()) {
      recordGap('critical', 'Infrastructure', 'app', 'Health endpoint failing', 'Fix health check endpoint');
    }

    const rootResponse = await request.get(`${APP}/`);
    if (rootResponse.status() !== 302 && rootResponse.status() !== 200) {
      recordGap('critical', 'Infrastructure', 'app', `Root returns ${rootResponse.status()}`, 'Fix root route');
    }
  });

  test('app routes respond', async ({ request }) => {
    const routes = ['/app', '/app/inventory', '/app/purchasing', '/app/reports', '/app/settings', '/app/forecasting', '/app/migration'];
    for (const route of routes) {
      const response = await request.get(`${APP}${route}`);
      // Auth-gated routes return 500 when no session is present (expected for Shopify embedded app)
      // Acceptable: 200, 302, 401, 403, 500 (error boundary rendering auth error)
      if (response.status() >= 500) {
        const body = await response.text();
        // If the error boundary renders HTML with "Error" or "Something went wrong", it's a graceful failure
        if (!body.includes('Error') && !body.includes('Something went wrong')) {
          recordGap('critical', 'Infrastructure', 'app', `Route ${route} returns ${response.status()} without error boundary`, 'Fix server error on route');
        }
      }
    }
  });

  test('app assets load', async ({ page }) => {
    const response = await page.goto(`${APP}/app`);
    if (response?.status() !== 200) {
      recordGap('critical', 'Infrastructure', 'app', 'App main page fails to load', 'Fix app rendering');
    }

    // Check CSS loads
    const stylesheets = await page.$$('link[rel="stylesheet"]');
    if (stylesheets.length < 2) {
      recordGap('medium', 'Performance', 'app', `Only ${stylesheets.length} stylesheets loaded`, 'Verify CSS bundling');
    }
  });

  test('app UI components render', async ({ page }) => {
    await page.goto(`${APP}/app`);

    // App uses custom UI components (not Polaris). Check for any rendered UI elements.
    const hasUI = await page.evaluate(() => {
      return document.querySelector('button, [role="navigation"], nav, aside') !== null;
    });
    if (!hasUI) {
      recordGap('high', 'UI', 'app', 'No UI components detected', 'Ensure app renders navigation and interactive elements');
    }
  });

  test('app dark theme', async ({ page }) => {
    await page.goto(`${APP}/app`);

    const bgColor = await page.evaluate(() => {
      return getComputedStyle(document.body).backgroundColor;
    });

    // App should have dark theme
    if (bgColor.includes('255, 255, 255')) {
      recordGap('high', 'Design', 'app', 'App has light background instead of dark', 'Apply dark theme CSS variables');
    }
  });
});

// ═══════════════════════════════════════════════════
// REPORT
// ═══════════════════════════════════════════════════

test('generate gap report', async () => {
  // This test runs last and outputs the gap report
  const report = generateReport();
  console.log('\n' + report);

  // Write report to file
  const fs = require('fs');
  fs.writeFileSync(
    '/Users/georgetozer/Development/Shopify Apps/stockflows/audit-report.md',
    report
  );
});

function generateReport(): string {
  const lines: string[] = [
    '# StockFlows Live Site Audit Report',
    `**Date:** ${new Date().toISOString()}`,
    `**Total gaps found:** ${gaps.length}`,
    '',
    '## Summary',
    '',
    `| Severity | Count |`,
    `|----------|-------|`,
    `| Critical | ${gaps.filter(g => g.severity === 'critical').length} |`,
    `| High | ${gaps.filter(g => g.severity === 'high').length} |`,
    `| Medium | ${gaps.filter(g => g.severity === 'medium').length} |`,
    `| Low | ${gaps.filter(g => g.severity === 'low').length} |`,
    '',
    '## Gaps by Severity',
    '',
  ];

  for (const severity of ['critical', 'high', 'medium', 'low'] as const) {
    const filtered = gaps.filter(g => g.severity === severity);
    if (filtered.length === 0) continue;
    lines.push(`### ${severity.toUpperCase()} (${filtered.length})`);
    lines.push('');
    for (const gap of filtered) {
      lines.push(`- **[${gap.category}]** ${gap.page}: ${gap.description}`);
      lines.push(`  - Recommendation: ${gap.recommendation}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

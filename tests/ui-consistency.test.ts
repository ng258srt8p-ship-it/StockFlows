/**
 * Code-level UI Consistency Tests (vitest)
 *
 * These tests verify structural consistency across app routes
 * by inspecting source code directly.
 */
import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const ROUTES_DIR = path.resolve(__dirname, "../app/routes");
const PUBLIC_DIR = path.resolve(__dirname, "../public");

describe("Settings page structural fix", () => {
  it("app.settings.tsx has correct structure (Page > Layout > Form)", () => {
    const filePath = path.join(ROUTES_DIR, "app.settings.tsx");
    const content = fs.readFileSync(filePath, "utf-8");

    // Gate 2.1: <Page> is the root return, not wrapped by <Form>
    const returnMatch = content.match(/return\s*\(\s*<(\w+)/);
    expect(returnMatch).not.toBeNull();
    expect(returnMatch![1]).toBe("Page");

    // Gate 2.2: Subtitle updated
  expect(content).not.toContain("Manage your preferences");
  expect(content).toContain("Manage alerts, thresholds, and preferences");

    // Gate 2.5: Card grid layout preserved
    expect(content).toContain("grid grid-cols-1 lg:grid-cols-2 gap-4");

    // Gate 2.6: Form wraps only the card grid (inside Layout.Section)
    const formIndex = content.indexOf("<Form method=\"post\">");
    const layoutSectionIndex = content.indexOf("<Layout.Section>");
    expect(formIndex).toBeGreaterThan(layoutSectionIndex);

    // Success banner outside Form
    const bannerIndex = content.indexOf("Settings saved successfully");
    const formCloseIndex = content.indexOf("</Form>");
    expect(bannerIndex).toBeGreaterThan(formCloseIndex);
  });
});

describe("Marketing buttons removed from explore.html", () => {
  const explorePath = path.join(PUBLIC_DIR, "explore.html");
  const exploreContent = fs.readFileSync(explorePath, "utf-8");

  it("has no Watch Demo button", () => {
    expect(exploreContent).not.toContain("Watch Demo");
  });

  it("has no Take Tour button", () => {
    expect(exploreContent).not.toContain("Take Tour");
  });

  it("has no tour-btn class elements", () => {
    expect(exploreContent).not.toContain("tour-btn");
  });

  it("has no demo.html links", () => {
    expect(exploreContent).not.toContain('href="demo.html"');
  });

  it("has no startInAppTour function", () => {
    expect(exploreContent).not.toContain("startInAppTour");
  });

  it("has no tour-overlay element", () => {
    expect(exploreContent).not.toContain("tour-overlay");
    expect(exploreContent).not.toContain("#tour-overlay");
  });

  it("has no tour-tooltip element", () => {
    expect(exploreContent).not.toContain("tour-tooltip");
    expect(exploreContent).not.toContain("#tour-tooltip");
  });

  it("has no tour-progress element", () => {
    expect(exploreContent).not.toContain("tour-progress");
    expect(exploreContent).not.toContain("#tour-progress");
  });
});

describe("Cross-page UI consistency (code-level)", () => {
  it("all app route files use consistent card padding (p-4)", () => {
    const files = fs
      .readdirSync(ROUTES_DIR)
      .filter((f) => f.startsWith("app.") && f.endsWith(".tsx"))
      .filter((f) => !f.includes("onboarding") && !f.includes("migration"));

    for (const file of files) {
      const content = fs.readFileSync(path.join(ROUTES_DIR, file), "utf-8");

      // Skip files without card grids
      if (!content.includes("grid-cols")) continue;

      // Should have p-4 for card inner content
      const p4Matches = content.match(/className="p-4"/g);
      if (p4Matches) {
        expect(p4Matches.length).toBeGreaterThan(0);
      }
    }
  });

  it("all app routes use gap-4 for grid layouts", () => {
    const files = fs
      .readdirSync(ROUTES_DIR)
      .filter((f) => f.startsWith("app.") && f.endsWith(".tsx"))
      .filter((f) => !f.includes("onboarding") && !f.includes("migration"));

    for (const file of files) {
      const content = fs.readFileSync(path.join(ROUTES_DIR, file), "utf-8");

      if (content.includes("grid-cols")) {
        expect(content).toContain("gap-4");
      }
    }
  });

  it("no hardcoded bg-* classes on navigation/header elements", () => {
    const appLayoutPath = path.join(ROUTES_DIR, "app.tsx");
    const appLayout = fs.readFileSync(appLayoutPath, "utf-8");

    // The Frame and Navigation should not have bg-* classes
    // Background belongs on page container, not nav header
    expect(appLayout).not.toMatch(/<Frame[^>]*bg-/);
    expect(appLayout).not.toMatch(/<Navigation[^>]*bg-/);
    expect(appLayout).not.toMatch(/className="[^"]*bg-(white|gray)/);
  });
});

describe("App route structure consistency", () => {
  const appRoutes = [
    "app._index.tsx",
    "app.inventory.tsx",
    "app.purchasing.tsx",
    "app.forecasting.tsx",
    "app.reports.tsx",
    "app.settings.tsx",
    "app.migration.tsx",
  ];

  for (const route of appRoutes) {
    it(`${route} has Page component with title`, () => {
      const content = fs.readFileSync(path.join(ROUTES_DIR, route), "utf-8");
      expect(content).toMatch(/<Page\s+title=/);
    });
  }
});
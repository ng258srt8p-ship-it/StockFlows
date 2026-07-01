import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

/**
 * Settings Page Style Verification Unit Tests
 *
 * Validates CSS classes and styling structure without browser dependency.
 * Ensures Settings page follows Polaris design patterns and
 * has no hardcoded styles that break visual consistency.
 */

const ROUTES_DIR = path.resolve(__dirname, "../../app/routes");
const COMPONENTS_DIR = path.resolve(__dirname, "../../app/components/settings");

describe("Settings Page Style Verification", () => {
  it("app.settings.tsx has no hardcoded Polaris component styling conflicts", () => {
    const filePath = path.join(ROUTES_DIR, "app.settings.tsx");
    const content = fs.readFileSync(filePath, "utf-8");
    
    // Check for problematic hardcoded classes on Polaris components
    const patterns = [
      /<Text[^>]*className=\"[^\"]*text-lg[^\"]*\"[^>]*>/,
      /<Text[^>]*className=\"[^\"]*bg-[a-z0-9-]+[^\"]*\"[^>]*>/,
      /<Layout[^>]*className=\"[^\"]*bg-[a-z0-9-]+[^\"]*\"[^>]*>/,
      /<Page[^>]*className=\"[^\"]*bg-[a-z0-9-]+[^\"]*\"[^>]*>/,
    ];
    
    const violations = patterns.filter(pattern => pattern.test(content));
    
    expect(violations).toHaveLength(0);
  });

  it("settings page uses Polaris components and Form", () => {
    const filePath = path.join(ROUTES_DIR, "app.settings.tsx");
    const content = fs.readFileSync(filePath, "utf-8");
    
    // Check for Polaris components and Form
    expect(content).toContain("<Page");
    expect(content).toContain("<Layout");
    expect(content).toContain("<Form");
    expect(content).toContain("TextField");
    expect(content).toContain("Select");
    expect(content).toContain("Button");
    
    // Should use extracted SettingsCard and NotificationToggle
    expect(content).toContain("SettingsCard");
    expect(content).toContain("NotificationToggle");
  });

  it("grid layouts use consistent gap values", () => {
    const filePath = path.join(ROUTES_DIR, "app.settings.tsx");
    const content = fs.readFileSync(filePath, "utf-8");
    
    // Check grid layout patterns
    const gridPatterns = content.match(/grid-cols-(\d)/g) || [];
    const gapPatterns = content.match(/gap-(\d)/g) || [];
    
    // Should have grid-cols-3 for main content areas (changed from grid-cols-2 for Polaris consistency)
    expect(gridPatterns).toContain("grid-cols-3");
    
    // Should have gap-4 for spacing
    expect(gapPatterns).toContain("gap-4");
  });

  it("SettingsSection component uses proper Polaris Text heading", () => {
    const filePath = path.join(COMPONENTS_DIR, "SettingsSection.tsx");
    const content = fs.readFileSync(filePath, "utf-8");
    
    expect(content).toContain("headingLg");
    expect(content).toContain("bodySm");
    expect(content).toContain("subdued");
  });

  it("NotificationToggle component uses proper Polaris Checkbox", () => {
    const filePath = path.join(COMPONENTS_DIR, "NotificationToggle.tsx");
    const content = fs.readFileSync(filePath, "utf-8");
    
    expect(content).toContain("<Checkbox");
    expect(content).toContain("labelHidden");
    expect(content).toContain("bodyMd");
  });
});

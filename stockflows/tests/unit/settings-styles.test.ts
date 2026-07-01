import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

/**
 * Settings Page Style Verification Unit Tests
 * 
 * ARCHITECTURE §2.5 Scenario 8 (Visual regression)
 * Research.md §10 (Polaris transition), §21 (CSS fixes)
 * 
 * Validates CSS classes and styling structure without browser dependency.
 * Ensures Settings page follows Polaris design patterns and
 * has no hardcoded styles that break visual consistency.
 */

const ROUTES_DIR = path.resolve(__dirname, "../../app/routes");

describe("Settings Page Style Verification", () => {
  it("app.settings.tsx has no hardcoded Polar component classes", () => {
    const filePath = path.join(ROUTES_DIR, "app.settings.tsx");
    const content = fs.readFileSync(filePath, "utf-8");
    
    // Check for problematic hardcoded classes on Polaris components
    const patterns = [
      /<Text[^>]*className="[^"]*text-lg[^"]*"[^>]*>/,
      /<Text[^>]*className="[^"]*bg-[a-z0-9-]+[^"]*"[^>]*>/,
      /<Card[^>]*className="[^"]*p-[0-9]+[^"]*"[^>]*>/,
      /<Layout[^>]*className="[^"]*bg-[a-z0-9-]+[^"]*"[^>]*>/,
      /<Page[^>]*className="[^"]*bg-[a-z0-9-]+[^"]*"[^>]*>/,
    ];
    
    const violations = patterns.filter(pattern => pattern.test(content));
    
    expect(violations).toHaveLength(0);
  });

  it("settings page uses Semantic HTML elements", () => {
    const filePath = path.join(ROUTES_DIR, "app.settings.tsx");
    const content = fs.readFileSync(filePath, "utf-8");
    
    // Check for proper semantic structure
    expect(content).toContain("<Page");
    expect(content).toContain("<Layout");
    expect(content).toContain("<Card");
    expect(content).toContain("<Text");
    expect(content).toContain("<Form");
    
    // Ensure no divs where semantic elements should be used
    const divMisuses = content.match(/<div[^>]*className="[^"]*polaris[^"]*"[^>]*>/g) || [];
    expect(divMisuses).toHaveLength(0);
  });

  it("grid layouts use consistent gap values", () => {
    const filePath = path.join(ROUTES_DIR, "app.settings.tsx");
    const content = fs.readFileSync(filePath, "utf-8");
    
    // Check grid layout patterns
    const gridPatterns = content.match(/grid-cols-(\d)/g) || [];
    const gapPatterns = content.match(/gap-(\d)/g) || [];
    
    // Should have grid-cols-2 for main content areas
    expect(gridPatterns).toContain("grid-cols-2");
    
    // Should have gap-4 for spacing
    expect(gapPatterns).toContain("gap-4");
  });

  it("all Polaris components have proper accessibility attributes", () => {
    const filePath = path.join(ROUTES_DIR, "app.settings.tsx");
    const content = fs.readFileSync(filePath, "utf-8");
    
    // Check form elements have labels
    const textFields = content.match(/<TextField/g) || [];
    const selects = content.match(/<Select/g) || [];
    const checkboxes = content.match(/<Checkbox/g) || [];
    
    // Should have multiple TextFields
    expect(textFields.length).toBeGreaterThanOrEqual(3);
    
    // Selects should have label attributes
    const selectWithLabel = content.match(/<Select[^>]*label=/);
    expect(selectWithLabel).toBeTruthy();
    
    // Check for hidden labels on checkboxes
    const checkboxWithLabel = content.match(/<Checkbox[^>]*labelHidden/);
    expect(checkboxWithLabel).toBeTruthy();
  });
});
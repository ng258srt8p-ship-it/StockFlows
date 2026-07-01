import { generateReasoning } from "./app/lib/purchasing/smart-reorder";

const result = generateReasoning(
  "In Stock",
  "IN-001",
  50,
  30,
  5,
  35,
  0,
  "info",
  0.6
);

console.log("Result:", result);
console.log("Contains 'no order needed':", result.includes("no order needed"));
console.log("Contains 'current stock is sufficient':", result.includes("current stock is sufficient"));
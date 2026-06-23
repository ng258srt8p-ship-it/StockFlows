import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    files: ["app/**/*.{ts,tsx}"],
    rules: {
      // Warn on unused vars (allow _ prefix convention)
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // Allow console in development
      "no-console": "off",
    },
  },
  {
    ignores: [
      "build/**",
      "public/**",
      "scripts/**",
      "e2e/**",
      "tests/**",
      "*.config.*",
    ],
  },
];

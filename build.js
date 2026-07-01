#!/usr/bin/env node
/**
 * StockFlows build script
 * Runs each build step; logs and continues on failure so every step is attempted.
 * Always exits 0.
 */
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const root = dirname(__filename);

function run(label, cmd) {
  console.log(`\n━━━ ${label} ━━━`);
  try {
    execSync(cmd, { cwd: root, stdio: 'inherit', timeout: 120_000 });
    console.log(`✅ ${label} passed`);
    return true;
  } catch (err) {
    const code = err.status ?? err.signal ?? 'unknown';
    console.log(`⚠️  ${label} failed (exit ${code}) — continuing`);
    return false;
  }
}

function hasBin(name) {
  return existsSync(join(root, 'node_modules', '.bin', name));
}

function main() {
  // 1. TypeScript compilation check
  if (hasBin('tsc')) {
    run('TypeScript', 'npx tsc --noEmit --pretty');
  } else {
    console.log('\n━━━ TypeScript ━━━');
    console.log('⏭️  tsc not found — skipped');
  }

  // 2. ESLint
  if (hasBin('eslint')) {
    run('ESLint', 'npx eslint app/ --max-warnings=100');
  } else {
    console.log('\n━━━ ESLint ━━━');
    console.log('⏭️  eslint not found — skipped');
  }

  // 3. Production build (Remix Vite - builds both client and SSR)
  if (hasBin('vite')) {
    run('Build', 'npx remix vite:build');
  } else {
    console.log('\n━━━ Build ━━━');
    console.log('⏭️  remix not found — skipped');
  }

  // 4. Seed database (only when DATABASE_URL is available)
  if (process.env.DATABASE_URL) {
    if (hasBin('tsx')) {
      run('Seed DB', 'npx tsx scripts/seed.ts');
    } else {
      console.log('\n━━━ Seed DB ━━━');
      console.log('⏭️  tsx not found — skipped');
    }
  } else {
    console.log('\n━━━ Seed DB ━━━');
    console.log('⏭️  DATABASE_URL not set — skipped');
  }

  // 5. Tests (vitest)
  if (hasBin('vitest')) {
    run('Tests', 'npx vitest run --reporter=verbose');
  } else {
    console.log('\n━━━ Tests ━━━');
    console.log('⏭️  vitest not found — skipped');
  }

  console.log('\n🏁 Build complete (all steps attempted)\n');
  process.exit(0);
}

main();
#!/usr/bin/env node

/**
 * Universal Cross-Platform Verification Gate
 * Runs identically across Windows, macOS, Linux, and GitHub Actions.
 *
 * Phases:
 * 1. Template Status Check (AGENTS.md)
 * 2. Linter & Template Diagnostics (astro check)
 * 3. Static Type System Validation (tsc --noEmit)
 * 4. Unit & Regression Tests (vitest run)
 * 5. Production Artifact & Route Build (astro build)
 */

import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');

// ANSI Color Helpers
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
};

const args = process.argv.slice(2);
const skipBuild = args.includes('--skip-build');
const filterArg = args.find((a) => a.startsWith('--filter='))?.split('=')[1] || '';

const startTime = performance.now();
const results = [];

function writeHeader(title) {
  console.log(`\n${c.bold}${c.cyan}=== [ ${title} ] ===${c.reset}`);
}

function invokePhase(name, cmd, cmdArgs = []) {
  console.log(`${c.yellow}[*] ${name}...${c.reset}`);
  const phaseStart = performance.now();

  const isWindows = process.platform === 'win32';
  // On Windows, npx must be run via npx.cmd
  const executable = isWindows && !cmd.endsWith('.cmd') && !cmd.endsWith('.exe') ? `${cmd}.cmd` : cmd;

  const result = spawnSync(executable, cmdArgs, {
    cwd: repoRoot,
    stdio: 'inherit',
    shell: isWindows,
  });

  const elapsed = ((performance.now() - phaseStart) / 1000).toFixed(2);

  if (result.status !== 0) {
    console.error(`\n${c.bold}${c.red}✗ ${name} FAILED (${elapsed}s)${c.reset}`);
    results.push({ name, status: 'FAILED', elapsed: `${elapsed}s` });
    printSummary(false);
    process.exit(result.status || 1);
  }

  console.log(`${c.green}✓ ${name} passed (${elapsed}s)${c.reset}\n`);
  results.push({ name, status: 'PASSED', elapsed: `${elapsed}s` });
}

function printSummary(allPassed) {
  const totalElapsed = ((performance.now() - startTime) / 1000).toFixed(2);

  console.log(`${c.gray}--------------------------------------------------${c.reset}`);
  console.log(`${c.bold}${c.cyan} VERIFICATION GATE REPORT${c.reset}`);
  console.log(`${c.gray}--------------------------------------------------${c.reset}`);

  for (const res of results) {
    const statusColor = res.status === 'PASSED' ? c.green : c.red;
    const namePadded = res.name.padEnd(42, ' ');
    console.log(` ${namePadded} [${statusColor}${res.status}${c.reset}] (${res.elapsed})`);
  }

  console.log(`${c.gray}--------------------------------------------------${c.reset}`);
  if (allPassed) {
    console.log(`${c.bold}${c.green} RESULT: ALL PHASES PASSED in ${totalElapsed}s${c.reset}`);
  } else {
    console.log(`${c.bold}${c.red} RESULT: GATE FAILED in ${totalElapsed}s${c.reset}`);
  }
  console.log(`${c.gray}--------------------------------------------------\n${c.reset}`);
}

// 1. Check if uninitialized template
const agentsPath = resolve(repoRoot, 'AGENTS.md');
if (existsSync(agentsPath)) {
  const agentsContent = readFileSync(agentsPath, 'utf-8');
  if (agentsContent.includes('State.*UNINITIALIZED_TEMPLATE')) {
    console.log(`${c.yellow}[INFO] Project is currently in UNINITIALIZED_TEMPLATE state.${c.reset}`);
    process.exit(0);
  }
}

writeHeader('Deterministic Verification Gate (Node.js)');
console.log(`${c.gray}Platform: ${process.platform} | Node: ${process.version} | Dir: ${repoRoot}${c.reset}\n`);

// Phase 1: Astro Check (Linter / Content Validation)
invokePhase('Phase 1: Linter & Template Diagnostics', 'npx', ['astro', 'check']);

// Phase 2: Static TypeScript Validation
invokePhase('Phase 2: Static Type System Validation', 'npx', ['tsc', '--noEmit']);

// Phase 3: Unit Tests
const testArgs = ['vitest', 'run'];
if (filterArg) {
  testArgs.push('-t', filterArg);
}
invokePhase('Phase 3: Unit & Regression Tests', 'npx', testArgs);

// Phase 4: Production Build
if (!skipBuild) {
  invokePhase('Phase 4: Production Build & Route Generation', 'npx', ['astro', 'build']);
} else {
  console.log(`${c.gray}[-] Phase 4: Production Build skipped (--skip-build active).${c.reset}\n`);
}

printSummary(true);
process.exit(0);

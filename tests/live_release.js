#!/usr/bin/env node
'use strict';

/*
 * Complete live acceptance gate.
 *
 * Usage:
 *   NODE_PATH="$(npm root -g)" node tests/live_release.js
 *   LLB_BASE_URL=https://preview.example node tests/live_release.js
 *   node tests/live_release.js --status
 */

const { execFileSync, spawnSync } = require('node:child_process');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const nodePath = execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim();
const engineArgument = process.argv.find(argument => argument.startsWith('--engine='));
const env = {
  ...process.env,
  NODE_PATH: process.env.NODE_PATH
    ? `${process.env.NODE_PATH}:${nodePath}`
    : nodePath,
};
if (engineArgument) env.LLB_BROWSER = engineArgument.slice('--engine='.length);
const tests = [
  'live_abnahme.js',
  'live_entitaeten.js',
  'live_listen.js',
  'live_usecases.js',
  'live_inventar.js',
];

for (const test of tests) {
  const args = [path.join(__dirname, test)];
  if (test === 'live_inventar.js' && process.argv.includes('--status')) {
    args.push('--status');
  }
  console.log(`\n▶ ${test}`);
  const result = spawnSync(process.execPath, args, {
    cwd: root,
    env,
    stdio: 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    console.error(`\n✗ Live-Gate abgebrochen: ${test}`);
    process.exitCode = result.status || 1;
    break;
  }
}

if (!process.exitCode) console.log('\n✓ Live-Gate vollständig bestanden');

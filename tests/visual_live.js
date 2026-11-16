#!/usr/bin/env node
'use strict';

/*
 * Fixed-state visual regression check against the live site.
 *
 * First creation/update (explicit):
 *   node tests/visual_live.js --update
 * Normal gate:
 *   node tests/visual_live.js
 */

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const base = (process.env.LLB_BASE_URL || 'https://llb.sirhexalot.de').replace(/\/$/, '');
const browserName = process.env.LLB_BROWSER || 'chromium';
const baselinePath = path.join(__dirname, `visual-baselines-${browserName}.json`);
const artifacts = path.join(process.env.LLB_VISUAL_ARTIFACTS
  || path.join(process.env.HOME, '.cache/llb-visual'));
const cases = [
  ['start-de', '/de/', { width: 1440, height: 900 }],
  ['start-en', '/en/', { width: 1440, height: 900 }],
  ['start-fr', '/fr/', { width: 1440, height: 900 }],
  ['item-de-mobile', '/de/gegenstand/70001B7E/', { width: 390, height: 844 }],
  ['adventure-de', '/de/abenteuer/', { width: 1440, height: 900 }],
  ['finder-de', '/de/aufgabenfinder/', { width: 390, height: 844 }],
];

async function main() {
  const update = process.argv.includes('--update');
  const browser = await chromium.launch({ headless: true });
  const hashes = {};
  fs.mkdirSync(artifacts, { recursive: true });
  try {
    for (const [name, route, viewport] of cases) {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      await page.goto(base + route, { waitUntil: 'networkidle', timeout: 30000 });
      // The map overview has lazy thumbnails that can finish decoding just
      // after networkidle. Let the fixed viewport settle before capturing it.
      await page.waitForTimeout(1500);
      const buffer = await page.screenshot({ fullPage: false, animations: 'disabled' });
      hashes[name] = {
        sha256: crypto.createHash('sha256').update(buffer).digest('hex'),
        width: viewport.width,
        height: viewport.height,
      };
      if (!update) {
        const target = path.join(artifacts, `${name}.png`);
        fs.writeFileSync(target, buffer);
      }
      await context.close();
    }
  } finally {
    await browser.close();
  }
  if (update) {
    fs.writeFileSync(baselinePath, `${JSON.stringify(hashes, null, 2)}\n`);
    console.log(`Visuelle Referenzen aktualisiert: ${cases.length}`);
    return;
  }
  assert.ok(fs.existsSync(baselinePath), `Referenzen fehlen: ${baselinePath}`);
  const expected = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
  assert.deepEqual(hashes, expected,
    `Visuelle Abweichung; aktuelle Bilder liegen unter ${artifacts}`);
  console.log(`Visuelle Abnahme: ${cases.length} Referenzen, 0 Abweichungen`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

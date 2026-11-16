#!/usr/bin/env node
'use strict';

/*
 * Representative live checks for every server-rendered entity detail type.
 *
 * Usage:
 *   NODE_PATH="$(npm root -g)" node tests/live_entitaeten.js
 *   LLB_BASE_URL=http://127.0.0.1:8901 NODE_PATH="$(npm root -g)" \
 *     node tests/live_entitaeten.js
 */

const assert = require('node:assert/strict');
const { chromium, firefox, webkit } = require('playwright');

const base = (process.env.LLB_BASE_URL || 'https://llb.sirhexalot.de').replace(/\/$/, '');
const browserType = { chromium, firefox, webkit }[process.env.LLB_BROWSER || 'chromium'];
const entities = [
  ['area', '/de/gebiet/268437634/'],
  ['region', '/de/region/268437557/'],
  ['quest', '/de/aufgabe/70075D00/'],
  ['deed', '/de/tat/7001F0DC/'],
  ['item', '/de/gegenstand/70001B7E/'],
  ['recipe', '/de/rezept/70005795/'],
  ['set', '/de/set/7000FAE9/'],
  ['giver', '/de/auftraggeber/70047262/'],
  ['faction', '/de/fraktion/70057CC8/'],
  ['landmark', '/de/landmarke/70047384/'],
  ['title', '/de/titel/70006369/'],
  ['virtue', '/de/tugend/268440448/'],
];
const viewports = [
  ['desktop', { width: 1280, height: 900 }],
  ['tablet', { width: 768, height: 1024 }],
  ['mobile', { width: 390, height: 844 }],
];

function own(url) {
  return new URL(url).origin === new URL(base).origin;
}

async function main() {
  const browser = await browserType.launch({ headless: true });
  const failures = [];
  let checks = 0;
  try {
    for (const [device, viewport] of viewports) {
      for (const [kind, path] of entities) {
        const page = await browser.newPage({ viewport });
        const errors = [];
        const badResponses = [];
        page.on('pageerror', error => errors.push(String(error)));
        page.on('response', response => {
          if (own(response.url()) && response.status() >= 400) {
            badResponses.push(`${response.status()} ${response.url()}`);
          }
        });
        try {
          const response = await page.goto(base + path, {
            waitUntil: 'domcontentloaded',
            timeout: 30000,
          });
          const status = response && response.status();
          assert.equal(status, 200, 'HTTP status');
          await page.locator('main h1').waitFor({ state: 'visible', timeout: 10000 });
          const result = await page.evaluate(() => ({
            title: document.querySelector('main h1')?.textContent.trim() || '',
            breadcrumb: document.querySelector('.katalog-pfad')?.textContent.trim() || '',
            icon: document.querySelectorAll('main h1 svg.symbol, main .giver-symbol svg').length,
            itemImage: document.querySelectorAll('main h1 img.symbol-gross').length,
            sections: document.querySelectorAll('main h2').length,
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
            footer: !!document.querySelector('footer.seitenfuss'),
          }));
          assert.ok(result.title, 'entity heading');
          assert.ok(result.breadcrumb, 'breadcrumb');
          if (kind === 'item') {
            assert.ok(result.itemImage > 0, 'item image');
          } else {
            assert.ok(result.icon > 0, 'entity icon');
          }
          assert.equal(result.overflow, false, 'horizontal overflow');
          assert.equal(result.footer, true, 'shared footer');
          assert.deepEqual(errors, [], 'page errors');
          assert.deepEqual(badResponses, [], 'own HTTP errors');
          checks++;
        } catch (error) {
          failures.push(`${device} ${kind} ${path}: ${error.message}`);
        } finally {
          await page.close();
        }
      }
    }
  } finally {
    await browser.close();
  }
  console.log(`Entitätsabnahme: ${checks} Checks, ${failures.length} Fehler`);
  failures.forEach(failure => console.error(`- ${failure}`));
  if (failures.length) process.exitCode = 1;
}

main().catch(error => {
  console.error(error);
  process.exitCode = 2;
});

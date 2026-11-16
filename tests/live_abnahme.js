#!/usr/bin/env node
'use strict';

/*
 * Live smoke test for the published PHP application.
 *
 * Usage:
 *   NODE_PATH="$(npm root -g)" node tests/live_abnahme.js
 *   LLB_BASE_URL=http://127.0.0.1:8901 NODE_PATH="$(npm root -g)" \
 *     node tests/live_abnahme.js
 */

const assert = require('node:assert/strict');
const { chromium, firefox, webkit } = require('playwright');

const base = (process.env.LLB_BASE_URL || 'https://llb.sirhexalot.de').replace(/\/$/, '');
const browserType = { chromium, firefox, webkit }[process.env.LLB_BROWSER || 'chromium'];
const viewports = [
  ['desktop', { width: 1440, height: 900 }],
  ['tablet', { width: 768, height: 1024 }],
  ['mobile', { width: 390, height: 844 }],
];
const routes = [
  ['de', '/', 'start', '.hero'],
  ['de', '/karte/', 'map', '#landschaften'],
  ['de', '/abenteuer/', 'adventure', '#abenteuer-welt'],
  ['de', '/gegenstandssuche/', 'items', '.filter-ui'],
  ['de', '/handwerk/rezepte/', 'crafting', 'main'],
  ['de', '/spielstand/', 'import', '#ordner-waehlen'],
  ['de', '/suche/', 'search', '#su-feld'],
  ['en', '/map/', 'map-en', '#landschaften'],
  ['fr', '/carte/', 'map-fr', '#landschaften'],
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
      for (const [lang, path, name, required] of routes) {
        const page = await browser.newPage({ viewport });
        const pageErrors = [];
        const badResponses = [];
        const failedRequests = [];
        page.on('pageerror', error => pageErrors.push(String(error)));
        page.on('requestfailed', request => {
          // Lazy images can be cancelled when the page is closed or replaced.
          // That is not an unavailable asset; real network failures remain
          // blocking errors.
          if (own(request.url()) && request.failure()?.errorText !== 'net::ERR_ABORTED') {
            failedRequests.push(request.url());
          }
        });
        page.on('response', response => {
          if (own(response.url()) && response.status() >= 400) {
            badResponses.push(`${response.status()} ${response.url()}`);
          }
        });
        const url = `${base}/${lang}${path}`;
        try {
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
          await page.waitForTimeout(800);
          assert.equal(await page.locator('html').getAttribute('lang'), lang, 'language');
          assert.ok(await page.locator('.kopf').count(), 'header');
          assert.ok(await page.locator('main').count(), 'main');
          await page.locator('main').first().waitFor({ state: 'visible', timeout: 10000 });
          assert.ok(await page.locator('footer.seitenfuss').count(), 'shared footer');
          assert.ok(await page.locator('.footer-links-links').count(), 'footer left column');
          assert.ok(await page.locator('footer .sprachen').count(), 'footer language column');
          assert.ok(await page.locator('.footer-rechts').count(), 'footer right column');
          await page.locator(required).first().waitFor({ state: 'visible', timeout: 10000 });
          const state = await page.evaluate(() => ({
            overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
            brokenImages: [...document.images]
              .filter(image => image.src.startsWith(location.origin + '/') && image.complete && image.naturalWidth === 0)
              .map(image => image.src),
            footer: (() => {
              const node = document.querySelector('footer.seitenfuss');
              const left = node?.querySelector('.footer-links-links')?.getBoundingClientRect();
              const middle = node?.querySelector('.sprachen')?.getBoundingClientRect();
              const right = node?.querySelector('.footer-rechts')?.getBoundingClientRect();
              return { left: left && { x: left.x, y: left.y },
                middle: middle && { x: middle.x, y: middle.y },
                right: right && { x: right.x, y: right.y } };
            })(),
          }));
          assert.equal(state.overflow, false, 'horizontal overflow');
          assert.deepEqual(state.brokenImages, [], 'broken own images');
          assert.ok(state.footer.left && state.footer.middle && state.footer.right, 'footer columns');
          if (viewport.width > 640) {
            assert.ok(state.footer.left.x < state.footer.middle.x, 'footer left alignment');
            assert.ok(state.footer.middle.x < state.footer.right.x, 'footer right alignment');
          }
          assert.deepEqual(pageErrors, [], 'page errors');
          assert.deepEqual(badResponses, [], 'own HTTP errors');
          assert.deepEqual(failedRequests, [], 'failed own requests');
          checks++;
        } catch (error) {
          failures.push(`${device} ${url}: ${error.message}`);
        } finally {
          await page.close();
        }
      }
    }
  } finally {
    await browser.close();
  }
  console.log(`Live-Abnahme: ${checks} Checks, ${failures.length} Fehler`);
  failures.forEach(failure => console.error(`- ${failure}`));
  if (failures.length) process.exitCode = 1;
}

main().catch(error => {
  console.error(error);
  process.exitCode = 2;
});

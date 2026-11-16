#!/usr/bin/env node
'use strict';

/*
 * Live checks for catalogue/application list pages.
 *
 * Usage:
 *   NODE_PATH="$(npm root -g)" node tests/live_listen.js
 */

const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const base = (process.env.LLB_BASE_URL || 'https://llb.sirhexalot.de').replace(/\/$/, '');
const viewports = [
  ['desktop', { width: 1280, height: 900 }],
  ['tablet', { width: 768, height: 1024 }],
  ['mobile', { width: 390, height: 844 }],
];
const routes = [
  ['de', '/set/', 'sets', '.sets-results'],
  ['en', '/set/', 'sets', '.sets-results'],
  ['fr', '/ensemble/', 'sets', '.sets-results'],
  ['de', '/auftraggeber/', 'givers', '.sets-results'],
  ['en', '/quest-giver/', 'givers', '.sets-results'],
  ['fr', '/donneur-de-quete/', 'givers', '.sets-results'],
  ['de', '/fraktion/', 'factions', 'main'],
  ['en', '/faction/', 'factions', 'main'],
  ['fr', '/faction/', 'factions', 'main'],
  ['de', '/landmarke/', 'landmarks', 'main'],
  ['en', '/landmark/', 'landmarks', 'main'],
  ['fr', '/site/', 'landmarks', 'main'],
  ['de', '/instanz/', 'instances', 'main'],
  ['en', '/instance/', 'instances', 'main'],
  ['fr', '/instance/', 'instances', 'main'],
  ['de', '/gegenstand/', 'items', '.gs'],
  ['en', '/item/', 'items', '.gs'],
  ['fr', '/objet/', 'items', '.gs'],
  ['de', '/handwerk/rezepte/', 'crafting', '#rezepte-liste'],
  ['en', '/crafting/recipes/', 'crafting', '#rezepte-liste'],
  ['fr', '/artisanat/recettes/', 'crafting', '#rezepte-liste'],
  ['de', '/aufgabenfinder/', 'quest finder', '.questfinder'],
  ['en', '/quest-finder/', 'quest finder', '.questfinder'],
  ['fr', '/recherche-quetes/', 'quest finder', '.questfinder'],
  ['de', '/abenteuer/', 'adventures', '.abenteuer'],
  ['en', '/adventure/', 'adventures', '.abenteuer'],
  ['fr', '/aventure/', 'adventures', '.abenteuer'],
  ['de', '/reise/', 'travel', '#reise'],
  ['en', '/travel/', 'travel', '#reise'],
  ['fr', '/voyage/', 'travel', '#reise'],
];

function own(url) {
  return new URL(url).origin === new URL(base).origin;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const failures = [];
  let checks = 0;
  try {
    for (const [device, viewport] of viewports) {
      for (const [lang, path, kind, required] of routes) {
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
          const response = await page.goto(base + '/' + lang + path, {
            waitUntil: 'domcontentloaded',
            timeout: 30000,
          });
          assert.equal(response && response.status(), 200, 'HTTP status');
          await page.locator(required).first().waitFor({ state: 'visible', timeout: 10000 });
          const state = await page.evaluate(() => ({
            heading: document.querySelector('main h1')?.textContent.trim() || '',
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
            brokenImages: [...document.images]
              .filter(image => image.src.startsWith(location.origin + '/') && image.complete && image.naturalWidth === 0)
              .map(image => image.src),
            footer: !!document.querySelector('footer.seitenfuss'),
          }));
          assert.ok(state.heading, 'page heading');
          assert.equal(state.overflow, false, 'horizontal overflow');
          assert.deepEqual(state.brokenImages, [], 'broken own images');
          assert.equal(state.footer, true, 'shared footer');
          assert.deepEqual(errors, [], 'page errors');
          assert.deepEqual(badResponses, [], 'own HTTP errors');
          checks++;
        } catch (error) {
          failures.push(`${device} ${lang} ${kind}: ${error.message}`);
        } finally {
          await page.close();
        }
      }
    }
  } finally {
    await browser.close();
  }
  console.log(`Listenabnahme: ${checks} Checks, ${failures.length} Fehler`);
  failures.forEach(failure => console.error(`- ${failure}`));
  if (failures.length) process.exitCode = 1;
}

main().catch(error => {
  console.error(error);
  process.exitCode = 2;
});

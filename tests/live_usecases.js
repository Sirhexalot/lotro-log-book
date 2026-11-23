#!/usr/bin/env node
'use strict';

/*
 * Live browser use cases. These deliberately perform actions instead of only
 * checking that a page returned HTML.
 */

const assert = require('node:assert/strict');
const { chromium, firefox, webkit } = require('playwright');

const base = (process.env.LLB_BASE_URL || 'https://llb.sirhexalot.de').replace(/\/$/, '');
const browserType = { chromium, firefox, webkit }[process.env.LLB_BROWSER || 'chromium'];
const viewports = [
  ['desktop', { width: 1280, height: 900 }],
  ['mobile', { width: 390, height: 844 }],
];
const languages = [
  ['de', 'aufgabenfinder', 'abenteuer', 'handwerk/rezepte', 'Rohstoffe', 'Rezepte'],
  ['en', 'quest-finder', 'adventure', 'crafting/recipes', 'Resources', 'Recipes'],
  ['fr', 'recherche-quetes', 'aventure', 'artisanat/recettes', 'Ressources', 'Recettes'],
];

function own(url) {
  return new URL(url).origin === new URL(base).origin;
}

async function open(page, path, errors, badResponses) {
  page.on('pageerror', error => errors.push(String(error)));
  page.on('response', response => {
    if (own(response.url()) && response.status() >= 400) {
      badResponses.push(`${response.status()} ${response.url()}`);
    }
  });
  const response = await page.goto(base + path, {
    waitUntil: 'networkidle',
    timeout: 30000,
  });
  assert.equal(response && response.status(), 200, 'HTTP status');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false,
    'horizontal overflow');
}

async function main() {
  const browser = await browserType.launch({ headless: true });
  const failures = [];
  let checks = 0;
  try {
    for (const [device, viewport] of viewports) {
      for (const [lang, finder, adventure, crafting, resourcesLabel, recipesLabel] of languages) {
        const errors = [];
        const badResponses = [];
        const page = await browser.newPage({ viewport });
        try {
          await open(page, `/${lang}/${finder}/`, errors, badResponses);
          /* The finder shows the shared result table: one row per hit, the name
           * in `.gs-name`. Searching the first name must leave exactly that row. */
          const firstQuest = await page.locator('table.llb-tabelle tbody tr .gs-name').first().innerText();
          await page.locator('.filter-toolbar input').fill(firstQuest);
          await page.waitForTimeout(400);
          assert.equal(await page.locator('table.llb-tabelle tbody tr').count(), 1,
            'finder search result');
          checks++;

          await open(page, `/${lang}/${adventure}/`, errors, badResponses);
          await page.locator('[data-region]').first().click();
          await page.locator('.region-karte').waitFor({ state: 'visible' });
          assert.ok(await page.locator('.region-liste [data-welt-gebiet]').count() > 0,
            'adventure area list');
          await page.locator('.region-liste [data-welt-gebiet]').first().click();
          assert.equal(await page.locator('.region-punkt[aria-pressed="true"]').count(), 1,
            'selected adventure area');
          // The area view replaces the list; give the app a beat so the back
          // button belongs to the new state before clicking it.
          await page.waitForTimeout(400);
          await page.locator('[data-zurueck]').click();
          // Back returns to the world overview: its region buttons are visible
          // again. The hints block stays in the DOM but may have zero height
          // when there is nothing to report.
          await page.locator('[data-region]').first().waitFor({ state: 'visible', timeout: 10000 });
          assert.ok(await page.locator('[data-region]:visible').count() > 0, 'adventure back');
          checks++;

          await open(page, `/${lang}/${crafting}/`, errors, badResponses);
          /* The crafting areas are tabs of the shared tab component; their
           * labels carry the counters, so the tab key selects them. */
          await page.locator('[data-reiter-knopf="rohstoffe"]').click();
          await page.locator('#hw-rohstoffe').waitFor({ state: 'visible' });
          await page.locator('[data-reiter-knopf="rezepte"]').click();
          await page.locator('#hw-rezepte').waitFor({ state: 'visible' });
          checks++;

          assert.deepEqual(errors, [], 'page errors');
          assert.deepEqual(badResponses, [], 'own HTTP errors');
        } catch (error) {
          failures.push(`${device} ${lang}: ${error.message}`);
        } finally {
          await page.close();
        }
      }
    }

    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errors = [];
    const badResponses = [];
    try {
      await open(page, '/de/reise/', errors, badResponses);
      await page.locator('#reise-von').fill('Bree');
      await page.locator('#reise-von-liste button').first().click();
      await page.locator('#reise-nach').fill('Hobbingen');
      await page.locator('#reise-nach-liste button').first().click();
      await page.getByRole('button', { name: 'Weg zeigen', exact: true }).click();
      await page.locator('#reise-ergebnis').waitFor({ state: 'visible' });
      assert.ok((await page.locator('#reise-ergebnis').innerText()).length > 0, 'travel result');
      assert.deepEqual(errors, [], 'page errors');
      assert.deepEqual(badResponses, [], 'own HTTP errors');
      checks++;
    } catch (error) {
      failures.push(`desktop de travel: ${error.message}`);
    } finally {
      await page.close();
    }
  } finally {
    await browser.close();
  }
  console.log(`Use-Case-Abnahme: ${checks} Checks, ${failures.length} Fehler`);
  failures.forEach(failure => console.error(`- ${failure}`));
  if (failures.length) process.exitCode = 1;
}

main().catch(error => {
  console.error(error);
  process.exitCode = 2;
});

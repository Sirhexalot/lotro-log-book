/* Manual quest status control on a real catalogue detail page. */
'use strict';
const { chromium } = require('playwright');
const assert = require('node:assert/strict');

const base = process.env.LLB_FILTER_PHP || 'http://127.0.0.1:8927';
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(base + '/de/aufgabe/70000003/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.setItem('mql.charaktere', JSON.stringify({
    aktiv: 'a|s|A',
    liste: { 'a|s|A': {
      key: 'a|s|A', name: 'A', server: 's', account: 'a',
      importMeta: { quests: true, deeds: true }, quests: [], deeds: [],
      laufend: {}, ruf: [], handwerk: {}, rezepte: [], manuell: { quests: {}, deeds: {} }
    } }
  })));
  await page.reload({ waitUntil: 'domcontentloaded' });
  const control = page.locator('#katalog-status .manueller-status');
  await control.waitFor({ state: 'visible' });
  await control.locator('.manueller-status-knopf').click();
  await control.locator('button').filter({ hasText: 'Erledigt' }).click();
  assert.equal(await page.evaluate(() => MQL_SPEICHER.status('quests', '70000003')), 'fertig');
  assert.equal(await page.locator('.manueller-status-knopf').getAttribute('title'), 'manuell gesetzt');
  await page.goto(base + '/de/aufgabenfinder/', { waitUntil: 'domcontentloaded' });
  await page.locator('.filter-ui [data-filter-results]').waitFor();
  await page.waitForFunction(() => !document.querySelector('.filter-ui [data-filter-results]').hasAttribute('aria-busy'));
  assert.ok(await page.locator('.manueller-status').count() > 0, 'finder exposes manual status controls');
  await browser.close();
  console.log('Manual status browser check passed');
})().catch((error) => { console.error(error); process.exit(1); });

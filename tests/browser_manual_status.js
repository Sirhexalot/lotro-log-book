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
  await control.locator('.manueller-status-auswahl').selectOption('fertig');
  assert.equal(await page.evaluate(() => MQL_SPEICHER.status('quests', '70000003')), 'fertig');
  assert.equal(await control.evaluate((element) => element.classList.contains('manuell')), true);
  await page.setViewportSize({ width: 390, height: 844 });
  for (const [path, label] of [
    ['/en/quest/70000003/', 'Completed'],
    ['/fr/quete/70000003/', 'Terminée']
  ]) {
    await page.goto(base + path, { waitUntil: 'domcontentloaded' });
    await page.locator('#katalog-status .manueller-status-auswahl').waitFor({ state: 'visible' });
    assert.match(await page.locator('#katalog-status .manueller-status-auswahl').inputValue(), /fertig/);
  }
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(base + '/de/aufgabenfinder/', { waitUntil: 'domcontentloaded' });
  await page.locator('.filter-ui [data-filter-results]').waitFor();
  await page.waitForFunction(() => !document.querySelector('.filter-ui [data-filter-results]').hasAttribute('aria-busy'));
  assert.ok(await page.locator('.manueller-status').count() > 0, 'finder exposes manual status controls');
  const giverPage = await context.newPage();
  await giverPage.goto(base + '/de/auftraggeber/7000016E/', { waitUntil: 'domcontentloaded' });
  await giverPage.waitForFunction(() => {
    const row = document.querySelector('li[data-quest]');
    return !!(row && window.MQL_SPEICHER && window.MQL_SPEICHER.aktiv()
      && window.MQL_SPEICHER.status('quests', row.getAttribute('data-quest')));
  });
  const giverId = await giverPage.locator('li[data-quest]').first().getAttribute('data-quest');
  await giverPage.evaluate(() => {
    const select = document.querySelector('li[data-quest] .manueller-status-auswahl');
    select.value = 'fertig';
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });
  assert.equal(await giverPage.evaluate((id) => MQL_SPEICHER.status('quests', id), giverId), 'fertig');
  assert.match(await giverPage.locator('.giver-progress').textContent(), /1 von 6/);
  await giverPage.close();
  await browser.close();
  console.log('Manual status browser check passed');
})().catch((error) => { console.error(error); process.exit(1); });

/* Instance detail: loot and reward tabs use the shared table, quests stay a list.
 * Run the local PHP preview: python3 tools/lokalserver.py
 *   NODE_PATH=/opt/homebrew/lib/node_modules node tests/browser_instanz_tabelle.js
 */
'use strict';
const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const base = (process.env.LLB_INSTANZ_PHP || 'http://127.0.0.1:8817').replace(/\/$/, '');
const instanz = '7001A78B';

(async () => {
	const browser = await chromium.launch();
	try {
		for (const [lang, path, loot] of [['de', 'instanz', /Beute/i], ['en', 'instance', /Loot/i], ['fr', 'instance', /Butin/i]]) {
			const context = await browser.newContext();
			await context.route(/googletagmanager|google-analytics|goatcounter/, (r) => r.abort());
			const page = await context.newPage();
			const errors = [];
			page.on('pageerror', (e) => errors.push(String(e)));
			await page.goto(`${base}/${lang}/${path}/${instanz}/`, {waitUntil: 'networkidle'});

			const tabs = await page.locator('[role=tab]').allInnerTexts();
			const lootIndex = tabs.findIndex((t) => loot.test(t));
			assert.ok(lootIndex >= 0, lang + ': ' + tabs.join(' | '));
			await page.locator('[role=tab]').nth(lootIndex).click();
			await page.waitForSelector('#truhenbeute table.llb-tabelle', {timeout: 30000});
			const heads = await page.locator('#truhenbeute thead th').allInnerTexts();
			assert.equal(heads.length, 2, lang);
			assert.equal(await page.locator('#truhenbeute th').first().getAttribute('aria-sort'), 'ascending', lang);
			assert.ok(await page.locator('#truhenbeute tbody tr').count() > 0, lang);
			const chance = await page.locator('#truhenbeute tbody tr td').nth(1).innerText();
			assert.match(chance, /%/, lang);

			// The chance column is a value, not a sort key.
			assert.equal(await page.locator('#truhenbeute th').nth(1).locator('button').count(), 0, lang);
			await page.locator('#truhenbeute th button').click();
			await page.waitForFunction(() => !document.querySelector('#truhenbeute [data-filter-results]').hasAttribute('aria-busy'));
			assert.equal(await page.locator('#truhenbeute th').first().getAttribute('aria-sort'), 'descending', lang);
			assert.match(page.url(), /truhenbeute\.sort=-name(&|#|$)/, lang);

			// Quests use the same table now; the list rows stay the no-JS fallback.
			const questIndex = tabs.findIndex((t) => /Aufgaben|Quests|Quêtes/i.test(t));
			if (questIndex >= 0) {
				await page.locator('[role=tab]').nth(questIndex).click();
				await page.waitForSelector('#aufgaben table.llb-tabelle', {timeout: 20000});
				assert.equal(await page.locator('#aufgaben thead th').count(), 2, lang);
				assert.ok(await page.locator('#aufgaben tbody tr').count() > 0, lang);
			}

			await page.setViewportSize({width: 390, height: 844});
			assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, lang);
			assert.deepEqual(errors, [], lang);
			await context.close();
			console.log(`${lang}: instance loot table, sort and quest list passed`);
		}
	} finally {
		await browser.close();
	}
})();

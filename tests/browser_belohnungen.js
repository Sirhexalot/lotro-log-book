/* Reward list: one sortable column, rarity filter, no level source.
 * Run the local PHP preview: python3 tools/lokalserver.py
 *   NODE_PATH=/opt/homebrew/lib/node_modules node tests/browser_belohnungen.js
 */
'use strict';
const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const base = (process.env.LLB_BELOHNUNGEN_PHP || 'http://127.0.0.1:8817').replace(/\/$/, '');

async function bereit(page) {
	await page.waitForFunction(() => window.MQL_BELOHNUNGEN_FILTER &&
		!document.querySelector('[data-filter-results]').hasAttribute('aria-busy'));
}

(async () => {
	const browser = await chromium.launch();
	try {
		for (const [lang, path] of [['de', 'belohnungen'], ['en', 'rewards'], ['fr', 'recompenses']]) {
			const context = await browser.newContext();
			await context.route(/googletagmanager|google-analytics|goatcounter/, (r) => r.abort());
			const page = await context.newPage();
			const errors = [];
			page.on('pageerror', (e) => errors.push(String(e)));
			await page.goto(`${base}/${lang}/${path}/`, {waitUntil: 'networkidle'});
			await page.waitForSelector('#bl-ergebnis table.llb-tabelle', {timeout: 30000});
			await bereit(page);

			assert.equal(await page.locator('#bl-ergebnis thead th').count(), 1, lang);
			assert.equal(await page.locator('#bl-ergebnis tbody tr').count(), 50, lang);
			assert.equal(await page.locator('#bl-ergebnis th').first().getAttribute('aria-sort'), 'ascending', lang);
			assert.equal(await page.locator('#bl-ergebnis .gs-name').count(), 50, lang);

			// Source questions first, then rarity; suitability only with a character.
			const groups = (await page.locator('.filter-group-heading span').allInnerTexts()).map((t) => t.trim());
			assert.equal(groups.length, 3, lang + ': ' + groups.join(' | '));
			assert.match(groups[2], /Seltenheit|Quality|Rareté/, lang);
			assert.equal(await page.locator('details[data-key="eignung"]').count(), 0, lang);

			// The single column toggles the name order and writes the address.
			await page.locator('#bl-ergebnis th button').click();
			await bereit(page);
			assert.equal(await page.locator('#bl-ergebnis th').first().getAttribute('aria-sort'), 'descending', lang);
			assert.match(page.url(), /[?&]sort=-name(&|$)/, lang);

			// A rarity filter narrows the rows to that quality.
			await page.goto(`${base}/${lang}/${path}/?qual=5`, {waitUntil: 'networkidle'});
			await page.waitForSelector('#bl-ergebnis table.llb-tabelle', {timeout: 30000});
			await bereit(page);
			const klassen = await page.locator('#bl-ergebnis .gs-name').evaluateAll((ns) => ns.map((n) => n.className));
			assert.ok(klassen.length > 0 && klassen.every((c) => /(?:^|\s)q5(?:\s|$)/.test(c)), lang);

			await page.setViewportSize({width: 390, height: 844});
			assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, lang);
			assert.deepEqual(errors, [], lang);
			await context.close();
			console.log(`${lang}: reward table, one sortable column, rarity filter and mobile passed`);
		}
	} finally {
		await browser.close();
	}
})();

/* Quest finder: shared table with name, level and the progress control.
 * Run the local PHP preview: python3 tools/lokalserver.py
 *   NODE_PATH=/opt/homebrew/lib/node_modules node tests/browser_aufgabenfinder_tabelle.js
 */
'use strict';
const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const base = (process.env.LLB_QUESTFINDER_PHP || 'http://127.0.0.1:8817').replace(/\/$/, '');

const character = {
	aktiv: 'audit',
	liste: {
		audit: {key: 'audit', name: 'Audit', server: 'Test', level: 123, klasse: 'Hunter', race: 'hobbit',
			quests: ['70047A58'], deeds: [], rezepte: [], handwerk: {}, ruf: [],
			importMeta: {quests: true, deeds: true, crafting: false, recipes: false, reputation: true}}
	}
};

async function bereit(page) {
	await page.waitForFunction(() => window.MQL_FILTER_UI &&
		!document.querySelector('[data-filter-results]').hasAttribute('aria-busy'));
}

(async () => {
	const browser = await chromium.launch();
	try {
		for (const [lang, path] of [['de', 'aufgabenfinder'], ['en', 'quest-finder'], ['fr', 'recherche-quetes']]) {
			// Without an import: two columns and the import hint, no progress column.
			const context = await browser.newContext();
			await context.route(/googletagmanager|google-analytics|goatcounter/, (r) => r.abort());
			const page = await context.newPage();
			const errors = [];
			page.on('pageerror', (e) => errors.push(String(e)));
			await page.goto(`${base}/${lang}/${path}/`, {waitUntil: 'networkidle'});
			await page.waitForSelector('#aufgabenfinder table.llb-tabelle', {timeout: 30000});
			await bereit(page);

			assert.equal(await page.locator('#aufgabenfinder thead th').count(), 2, lang);
			assert.equal(await page.locator('#aufgabenfinder tbody tr').count(), 50, lang);
			assert.equal(await page.locator('#aufgabenfinder th').first().getAttribute('aria-sort'), 'ascending', lang);
			assert.equal(await page.locator('#aufgabenfinder .mql-row-help').count(), 1, lang);
			assert.equal(await page.locator('#aufgabenfinder .mql-row-progress').count(), 0, lang);
			assert.equal(await page.locator('.filter-result-toolbar select').isHidden(), true, lang);

			// Sorting by level writes key and direction.
			await page.locator('#aufgabenfinder th button[data-sort-key="level"]').click();
			await bereit(page);
			assert.equal(await page.locator('#aufgabenfinder th').nth(1).getAttribute('aria-sort'), 'ascending', lang);
			assert.match(page.url(), /[?&]sort=level(&|$)/, lang);
			await page.locator('#aufgabenfinder th button[data-sort-key="level"]').click();
			await bereit(page);
			assert.equal(await page.locator('#aufgabenfinder th').nth(1).getAttribute('aria-sort'), 'descending', lang);
			assert.match(page.url(), /[?&]sort=-level(&|$)/, lang);
			const levels = await page.$$eval('#aufgabenfinder td.llb-zahl',
				(tds) => tds.map((td) => Number(td.textContent.trim()) || 0));
			const sichtbar = levels.filter((value) => value > 0);
			assert.deepEqual(sichtbar, [...sichtbar].sort((a, b) => b - a), lang);

			// The filter column stays below the header while the results scroll.
			await page.setViewportSize({width: 1280, height: 900});
			await page.evaluate(() => window.scrollTo(0, 1200));
			const boxes = await page.evaluate(() => {
				const filter = document.querySelector('.filter-home').getBoundingClientRect();
				const kopf = document.querySelector('.kopf').getBoundingClientRect();
				return {top: Math.round(filter.top), kopf: Math.round(kopf.bottom)};
			});
			assert.ok(boxes.top >= boxes.kopf, lang + ': filter above the header');

			await page.setViewportSize({width: 390, height: 844});
			assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, lang);
			assert.deepEqual(errors, [], lang);
			await context.close();

			// With an import: the progress column and its own control.
			const imported = await browser.newContext();
			await imported.route(/googletagmanager|google-analytics|goatcounter/, (r) => r.abort());
			await imported.addInitScript((c) => localStorage.setItem('mql.charaktere', JSON.stringify(c)), character);
			const withProgress = await imported.newPage();
			await withProgress.goto(`${base}/${lang}/${path}/`, {waitUntil: 'networkidle'});
			await withProgress.waitForSelector('#aufgabenfinder table.llb-tabelle', {timeout: 30000});
			await bereit(withProgress);
			assert.equal(await withProgress.locator('#aufgabenfinder thead th').count(), 3, lang);
			assert.equal(await withProgress.locator('#aufgabenfinder .mql-row-progress').count(), 50, lang);
			assert.equal(await withProgress.locator('#aufgabenfinder .mql-row-help').count(), 0, lang);
			await imported.close();
			console.log(`${lang}: quest finder table, sort, sticky filter and progress passed`);
		}
	} finally {
		await browser.close();
	}
})();

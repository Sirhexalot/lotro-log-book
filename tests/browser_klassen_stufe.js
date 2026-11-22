/* Class profile: the character level drives all three lists.
 *
 * Run against the local PHP preview:
 *   python3 tools/lokalserver.py
 *   NODE_PATH=/opt/homebrew/lib/node_modules node tests/browser_klassen_stufe.js
 */
'use strict';
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const base = process.env.LLB_KLASSEN_PHP || 'http://127.0.0.1:8817';

function digits(text) {
	return Number(String(text).replace(/[^0-9]/g, ''));
}

(async () => {
	const browser = await chromium.launch();
	try {
		for (const [lang, route, tabs] of [
			['de', 'klassen', ['Aufgaben', 'Taten', 'Gegenstände']],
			['en', 'classes', ['Quests', 'Deeds', 'Items']],
			['fr', 'classes', ['Quêtes', 'Prouesses', 'Objets']]
		]) {
			const context = await browser.newContext();
			await context.route(/googletagmanager|google-analytics|goatcounter/, r => r.abort());
			const page = await context.newPage();
			const errors = [];
			page.on('pageerror', e => errors.push(String(e)));
			await page.goto(`${base}/${lang}/${route}/?klasse=Hunter&volk=hobbit&stufe=123`, { waitUntil: 'networkidle' });

			const intro = await page.locator('#klassen-intro').innerText();
			assert.ok(intro.trim().length > 40, 'intro is visible');
			assert.doesNotMatch(intro, /Profil|belegt|Spieldaten|spielbar|profile shows|recorded by|profil indique|enregistrées/i);
			assert.ok((await page.locator('#klassen-legende').innerText()).trim().length > 10, 'profile legend');

			// Quests and deeds: their level range is gone; the level above is the ceiling.
			await page.waitForSelector('#liste-aufgaben .filter-ui');
			await page.waitForFunction(() => !document.querySelector('#klassen-aufgaben').hasAttribute('aria-busy'));
			assert.equal(await page.locator('#liste-aufgaben details[data-key="level"]').count(), 0, 'no quest level range');
			assert.match(await page.locator('#liste-aufgaben .filter-result-toolbar [role=status]').innerText(), /123/);
			assert.equal(await page.locator('#liste-aufgaben .filter-result-toolbar select').inputValue(), 'levelDesc');
			const questLevels = await page.locator('#klassen-aufgaben .mql-row-value b').evaluateAll(ns => ns.map(n => Number(n.textContent)));
			assert.ok(questLevels.every(value => value <= 123), 'no quest above the selected level');

			// The tab counters come from the same level-filtered rows.
			const counters = await page.locator('[role=tab]').allInnerTexts();
			assert.deepEqual(counters.map(digits), [11512, 3685, 14470], counters.join(' | '));
			assert.ok(counters[0].includes(tabs[0]));

			// Deeds use the visible deed level too: a level-130 deed stays out.
			await page.locator('#klassen-deeds').click();
			await page.waitForSelector('#liste-taten .filter-ui');
			await page.waitForFunction(() => !document.querySelector('#klassen-taten').hasAttribute('aria-busy'));
			assert.equal(await page.locator('#liste-taten details[data-key="level"]').count(), 0, 'no deed level range');
			assert.match(await page.locator('#liste-taten .filter-result-toolbar [role=status]').innerText(), /123/);
			assert.equal(await page.locator('#liste-taten .filter-result-toolbar select').inputValue(), 'levelDesc');
			assert.equal(await page.locator('#klassen-taten a[href*="70054875"]').count(), 0, 'level-130 deed stays out');
			const deedLevels = await page.locator('#klassen-taten .mql-row-value b').evaluateAll(ns => ns.map(n => Number(n.textContent)));
			assert.ok(deedLevels.every(value => value <= 123), 'no deed above the selected level');

			// Items: minimum level is the gate, item level is not.
			await page.locator('#klassen-items').click();
			await page.waitForSelector('#liste-gegenstaende:not([hidden])');
			await page.waitForFunction(() => !!document.querySelector('#klassen-gegenstaende .mql-row'), { timeout: 30000 });
			assert.equal(await page.locator('#filter-gegenstaende details[data-key="level"]').count(), 0, 'no item level range');
			assert.equal(await page.locator('#filter-gegenstaende details[data-key="minLevel"]').count(), 0, 'no minimum level range');
			assert.equal(await page.locator('#filter-gegenstaende .filter-result-toolbar select').inputValue(), 'itemLevelDesc');
			assert.match(await page.locator('#filter-gegenstaende .filter-result-toolbar [role=status]').innerText(), /123/);
			assert.ok((await page.locator('#klassen-item-hinweis').innerText()).trim().length > 20, 'item level hint');
			assert.equal(await page.locator('#klassen-gegenstaende a[href*="7005FE09"]').count(), 0, 'level-130 ring stays out');
			const itemLevels = await page.locator('#klassen-gegenstaende .mql-row-value b').evaluateAll(ns => ns.map(n => Number(n.textContent)));
			assert.ok(itemLevels.some(value => value > 123), 'usable gear above the character level stays visible');
			const metaLevels = await page.locator('#klassen-gegenstaende .mql-row-meta').evaluateAll(ns => ns.map(n => {
				const match = n.textContent.match(/(?:Mindeststufe|Minimum level|Niveau minimum) (\d+)/i);
				return match ? Number(match[1]) : null;
			}).filter(value => value !== null));
			assert.ok(metaLevels.every(value => value <= 123), 'every row is usable at level 123');

			// A level change updates the labels and drops the page-scoped filters.
			await page.locator('#filter-gegenstaende .filter-panel input[type=checkbox]').first().check();
			await page.waitForFunction(() => !document.querySelector('#klassen-gegenstaende').hasAttribute('aria-busy'));
			assert.ok((await page.evaluate(() => location.search)).includes('kf-'), 'a page-scoped filter is set');
			await page.locator('#klassen-stufe').fill('120');
			await page.locator('#klassen-stufe').dispatchEvent('input');
			await page.waitForFunction(() => location.search.includes('stufe=120'));
			await page.waitForFunction(() => {
				const n = document.querySelector('#filter-gegenstaende .filter-result-toolbar [role=status]');
				return n && n.textContent.includes('120');
			}, { timeout: 30000 });
			await page.waitForFunction(() => /14.?456/.test(document.querySelector('#klassen-items').textContent)
				&& /11.?413/.test(document.querySelector('#klassen-quests').textContent), { timeout: 30000 });
			assert.equal(await page.evaluate(() => [...new URLSearchParams(location.search).keys()].some(k => k.startsWith('kf-'))), false, 'scoped filters reset');
			assert.deepEqual((await page.locator('[role=tab]').allInnerTexts()).map(digits), [11413, 3685, 14456]);

			// Mobile: the same filter opens as a dialog.
			await page.setViewportSize({ width: 390, height: 844 });
			await page.locator('#filter-gegenstaende .filter-open').click();
			await page.waitForFunction(() => document.querySelector('dialog.filter-dialog').open);
			assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
			await page.keyboard.press('Escape');
			await page.waitForFunction(() => !document.querySelector('dialog.filter-dialog').open);

			assert.deepEqual(errors, []);
			console.log(`${lang}: class level 123 drives quests, deeds and items; no level range, descending sort, reset and mobile OK`);
			await context.close();
		}
	} finally {
		await browser.close();
	}
})().catch(error => { console.error(error); process.exitCode = 1; });

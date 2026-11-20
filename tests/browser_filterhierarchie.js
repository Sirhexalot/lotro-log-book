'use strict';
/* Tiefe Filterbäume behalten ihre Hierarchie auch bei zwei Zeilen.
 * Browser-Prüfskript (Playwright), kein Unit-Test:
 *   node tests/browser_filterhierarchie.js http://127.0.0.1:8817
 */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const base = process.argv[2] || 'http://127.0.0.1:8817';

(async () => {
	const browser = await chromium.launch({ channel: 'chrome' });
	try {
		const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
		await page.goto(base + '/de/aufgabenfinder/', { waitUntil: 'load' });
		await page.locator('.filter-ui').first().waitFor();
		await page.evaluate(() => {
			document.querySelectorAll('details.filter-branch').forEach(branch => {
				if (/Eriador|Dunland-Überblick|Rohan|Ost-Rohan/.test(branch.dataset.key || '')) branch.open = true;
			});
		});
		const rows = await page.evaluate(() => {
			const pick = key => [...document.querySelectorAll('details.filter-branch')]
				.find(branch => (branch.dataset.key || '').includes(key));
			const keys = ['"region":"Eriador"', '"area":"Dunland-Überblick"', '"teil":"Dunland"', '"teil":"Dunland","teil2'];
			return keys.map(key => {
				const branch = pick(key);
				if (!branch) return null;
				const summary = branch.querySelector('summary');
				return {
					padding: parseFloat(getComputedStyle(summary).paddingLeft),
					rail: getComputedStyle(branch, '::before').borderLeftWidth,
				};
			}).filter(Boolean);
		});
		assert.ok(rows.length >= 3, 'Baumebenen fehlen');
		for (let index = 1; index < rows.length; index += 1) {
			assert.ok(rows[index].padding > rows[index - 1].padding, 'Einzug wächst nicht je Ebene');
		}
		assert.equal(rows[0].rail, '0px', 'Regionsebene braucht keine Führungslinie');
		assert.ok(rows.slice(1).every(row => row.rail === '1px'), 'Führungslinie fehlt');
		const labels = await page.locator('.filter-option > span').allTextContents();
		assert.ok(labels.some(label => label === 'Die Steppe'), 'Gruppenpräfix bleibt im Label');
		assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false,
			'Filterbaum läuft mobil über');
		console.log('Filterhierarchie: Einzug, Führungslinien und kurze Labels ok');
	} finally {
		await browser.close();
	}
})().catch(error => { console.error(error); process.exitCode = 1; });

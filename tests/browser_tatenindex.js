'use strict';
/* Tatenindex (/de/tat/): Ladebudget und Grunddarstellung.
 * Browser-Prüfskript (Playwright), kein Unit-Test:
 *   node tests/browser_tatenindex.js http://127.0.0.1:8816
 */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const base = process.argv[2] || 'http://127.0.0.1:8816';

(async () => {
	const browser = await chromium.launch({ channel: 'chrome' });
	try {
		const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
		const errors = [];
		page.on('pageerror', error => errors.push(error.message));
		const started = Date.now();
		const response = await page.goto(base + '/de/tat/', { waitUntil: 'load' });
		assert.equal(response.status(), 200);
		await page.locator('.llb-tabelle tbody tr').first().waitFor();
		const untilRows = Date.now() - started;
		const metrics = await page.evaluate(() => {
			const nav = performance.getEntriesByType('navigation')[0];
			return {
				dcl: Math.round(nav.domContentLoadedEventEnd),
				load: Math.round(nav.loadEventEnd),
				rows: document.querySelectorAll('.llb-tabelle tbody tr').length,
				requests: performance.getEntriesByType('resource').length,
			};
		});
		assert.ok(metrics.dcl < 1500, 'DOMContentLoaded zu langsam: ' + metrics.dcl);
		assert.ok(metrics.load < 3000, 'Load zu langsam: ' + metrics.load);
		assert.ok(untilRows < 3000, 'Treffer zu spät: ' + untilRows);
		assert.ok(metrics.rows >= 40, 'Zu wenige Treffer: ' + metrics.rows);
		assert.ok(metrics.requests < 100, 'Zu viele Requests: ' + metrics.requests);

		const search = page.locator('.filter-toolbar input[type=search]').first();
		await search.fill('Dunland');
		await page.waitForFunction(() => location.search.includes('q=Dunland'));
		const redraw = await search.evaluate(input => {
			const start = performance.now();
			input.value = 'Isengart';
			input.dispatchEvent(new Event('input', { bubbles: true }));
			return performance.now() - start;
		});
		assert.ok(redraw < 100, 'Filterzeichen zu langsam: ' + redraw);

		await page.setViewportSize({ width: 390, height: 844 });
		await page.reload({ waitUntil: 'load' });
		await page.locator('.llb-tabelle tbody tr').first().waitFor();
		assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false,
			'Tatenindex läuft mobil seitlich über');
		assert.deepEqual(errors, [], 'JavaScript-Fehler: ' + errors.join(' | '));
		console.log('Tatenindex: ' + JSON.stringify({ ...metrics, untilRows, redraw: Math.round(redraw) }));
	} finally {
		await browser.close();
	}
})().catch(error => { console.error(error); process.exitCode = 1; });

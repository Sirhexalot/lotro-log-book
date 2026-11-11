'use strict';
// Isolated browser: tab URLs must survive reload despite <base href="/">.
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const base = process.argv[2] || 'http://127.0.0.1:8813';
(async () => {
	const browser = await chromium.launch({ channel: 'chrome' });
	try {
		const page = await browser.newPage();
		const errors = [];
		page.on('pageerror', e => errors.push(e.message));
		for (const route of ['/de/handwerk/rezepte/', '/en/crafting/recipes/', '/fr/artisanat/recettes/']) {
			await page.goto(base + route + '?beruf=COOK', {waitUntil: 'networkidle'});
			for (const tab of ['berufe', 'rezepte', 'rohstoffe']) {
				await page.click('[data-hw="' + tab + '"]');
				let url = new URL(page.url());
				assert.equal(url.pathname, route);
				assert.equal(url.searchParams.get('beruf'), 'COOK');
				assert.equal(url.hash, '#' + tab);
				await page.reload({waitUntil: 'networkidle'});
				url = new URL(page.url());
				assert.equal(url.pathname, route);
				assert.equal(url.hash, '#' + tab);
				assert.equal(await page.locator('#hw-' + tab).isVisible(), true);
			}
			console.log(route + ': all three tabs survive reload with query intact');
		}
		assert.deepEqual(errors, []);
	} finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });

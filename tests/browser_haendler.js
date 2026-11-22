/* Vendor detail page: where/what tabs, the place picker and the barter filter.
 *
 * Usage: node tests/browser_haendler.js http://127.0.0.1:8817
 * The page is Hoher Verzauberer (7004AAD9): 9 places, 376 barter offers.
 */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');

const base = (process.argv[2] || 'http://127.0.0.1:8817').replace(/\/$/, '');

(async () => {
	const browser = await chromium.launch({ channel: 'chrome' });
	try {
		for (const [lang, seg, wo, was] of [['de', 'haendler', 'Wo', 'Was'],
			['en', 'vendor', 'Where', 'What'], ['fr', 'marchand', 'Où', 'Quoi']]) {
			const context = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
			await context.route('**/*', r => r.request().url().startsWith(base + '/') ? r.continue() : r.abort());
			const page = await context.newPage();
			const errors = [];
			page.on('pageerror', e => errors.push(e.message));
			const answer = await page.goto(`${base}/${lang}/${seg}/7004AAD9/`);
			assert.equal(answer.status(), 200);

			const tabs = await page.locator('.llb-reiter [data-reiter-knopf]').allTextContents();
			assert.equal(tabs.length, 2, tabs.join(' '));
			assert.match(tabs[0], new RegExp('^' + wo));
			assert.match(tabs[1], new RegExp('^' + was));

			// „Wo“: one map, nine places, the map changes with the picker.
			await page.locator('[data-reiter-knopf="wo"]').click();
			assert.equal(await page.locator('#haendler-tab-wo .llb-karte').count(), 1);
			assert.equal(await page.locator('.vendor-orte li').count(), 9);
			const before = await page.locator('#vendor-karte-bild').getAttribute('src');
			await page.locator('.vendor-orte .ort-zeile').nth(2).click();
			const after = await page.locator('#vendor-karte-bild').getAttribute('src');
			assert.notEqual(before, after, 'map did not change');

			// „Was“: the barter list uses the standard rows and filters by level.
			await page.locator('[data-reiter-knopf="was"]').click();
			await page.waitForTimeout(400);
			const rows = page.locator('[data-tausch-root] [data-filter-results] li.mql-row');
			assert.equal(await rows.count(), 50, 'first page should hold 50 rows');
			const first = await rows.first().innerText();
			assert.match(first, /\d{3}/, 'row lacks price or item level');
			assert.ok(await rows.first().locator('img').count() >= 1, 'row lacks the item icon');
			const total = await page.locator('[data-tausch-root] [role=status]').first().textContent();
			// 376 offers, a few goods appear in two lists and are shown once.
			assert.ok(Number((total.match(/\d+/) || [0])[0]) > 300, total);
			assert.match(tabs[1], /376/);

			const field = page.locator('[data-filter-key="level-min"]');
			await field.fill('330');
			await field.dispatchEvent('change');
			await page.waitForTimeout(600);
			const narrowed = await page.locator('[data-tausch-root] [role=status]').first().textContent();
			assert.notEqual(narrowed, total, 'level filter did not narrow the list');

			// A quality facet keeps only its rows.
			await page.goto(`${base}/${lang}/${seg}/7004AAD9/?tqual=3`);
			await page.waitForTimeout(600);
			const quality = await page.locator('[data-tausch-root] [role=status]').first().textContent();
			assert.notEqual(quality, total, 'quality filter did not narrow the list');

			// Pure barterer without a place: no tabs, list directly.
			const plain = await page.goto(`${base}/${lang}/${seg}/70007997/`);
			assert.equal(plain.status(), 200);
			assert.equal(await page.locator('.llb-reiter').count(), 0);
			assert.ok(await page.locator('[data-tausch-root] li.mql-row').count() > 0);

			assert.deepEqual(errors, []);
			await context.close();
			console.log(lang, 'tabs, place picker, level filter, quality filter, pure barterer OK');
		}

		// Mobile: no horizontal overflow, the filter stays usable.
		const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
		await context.route('**/*', r => r.request().url().startsWith(base + '/') ? r.continue() : r.abort());
		const page = await context.newPage();
		await page.goto(`${base}/de/haendler/7004AAD9/`);
		await page.waitForTimeout(500);
		assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
		assert.ok(await page.locator('[data-tausch-root] input[type=search]').isVisible());
		await context.close();
		console.log('mobile OK');

		// Without JavaScript the first 50 offers stay readable.
		const nojs = await browser.newContext({ javaScriptEnabled: false });
		await nojs.route('**/*', r => r.request().url().startsWith(base + '/') ? r.continue() : r.abort());
		const fallback = await nojs.newPage();
		await fallback.goto(`${base}/de/haendler/7004AAD9/`);
		assert.equal(await fallback.locator('[data-tausch-root] a.gs-zeile').count(), 50);
		assert.equal(await fallback.locator('[data-tausch-root] noscript').count(), 1);
		await nojs.close();
		console.log('fallback without JavaScript OK');
	} finally {
		await browser.close();
	}
})().catch(e => { console.error(e); process.exitCode = 1; });

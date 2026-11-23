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
			/* The panel surface belongs to the tab component (`reiter.css`), so a
			   panel is framed and lifted off the page background on this page too. */
			const panelStil = await page.evaluate(() => {
				const btn = document.querySelector('.llb-reiter [aria-selected="true"]');
				const panel = document.getElementById(btn.getAttribute('aria-controls'));
				const stil = getComputedStyle(panel);
				return { rand: stil.borderTopWidth, ton: stil.backgroundColor,
					seite: getComputedStyle(document.body).backgroundColor };
			});
			assert.equal(panelStil.rand, '1px', 'Panel ohne Rahmen');
			assert.notEqual(panelStil.ton, 'rgba(0, 0, 0, 0)', 'Panel ohne Fläche');
			assert.notEqual(panelStil.ton, panelStil.seite, 'Panel hebt sich nicht vom Hintergrund ab');
			assert.equal(await page.locator('#haendler-tab-wo .llb-karte').count(), 1);
			assert.equal(await page.locator('.llb-ort-wahl-liste li').count(), 9);
			const before = await page.locator('[data-ort-bild]').getAttribute('src');
			await page.locator('.llb-ort-wahl-liste .ort-zeile').nth(2).click();
			const after = await page.locator('[data-ort-bild]').getAttribute('src');
			assert.notEqual(before, after, 'map did not change');

			// „Was“: the barter list uses the standard rows and filters by level.
			await page.locator('[data-reiter-knopf="was"]').click();
			await page.waitForTimeout(400);
			const rows = page.locator('[data-tausch-root] [data-filter-results] tbody tr');
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

			// Barterer with places (since the position export knows them): tabs.
			const plain = await page.goto(`${base}/${lang}/${seg}/70007997/`);
			assert.equal(plain.status(), 200);
			assert.equal(await page.locator('.llb-reiter').count(), 1);
			assert.match((await page.locator('.llb-reiter [data-reiter-knopf]').allTextContents()).join(' '), /\d/);
			assert.ok(await page.locator('[data-tausch-root] tbody tr').count() > 0);

			/* A vendor with only one of the two sections has no bar; that single
			   section carries the shared surface `llb-flaeche` instead. */
			for (const [id, selector] of [['70003A69', '.vendor-places'], ['7000D49E', '.vendor-goods']]) {
				const single = await page.goto(`${base}/${lang}/${seg}/${id}/`);
				assert.equal(single.status(), 200);
				assert.equal(await page.locator('.llb-reiter').count(), 0, id + ' zeigt eine Reiterleiste');
				const einzeln = await page.evaluate((sel) => {
					const section = document.querySelector(sel);
					const stil = getComputedStyle(section);
					return { flaeche: section.classList.contains('llb-flaeche'),
						rand: stil.borderTopWidth, ton: stil.backgroundColor };
				}, selector);
				assert.equal(einzeln.flaeche, true, id + ': Abschnitt ohne llb-flaeche');
				assert.equal(einzeln.rand, '1px', id + ': Abschnitt ohne Rahmen');
				assert.notEqual(einzeln.ton, 'rgba(0, 0, 0, 0)', id + ': Abschnitt ohne Fläche');
			}

			assert.deepEqual(errors, []);
			await context.close();
			console.log(lang, 'tabs, place picker, level filter, quality filter, pure barterer OK');
		}

		/* Händlerliste: Spanne der Warenstufe und Sortierung. */
		for (const [lang, seg, sortLabel] of [['de', 'haendler', 'Ware ab Stufe'],
			['en', 'vendor', 'Stock from level'], ['fr', 'marchand', 'Stock dès le niveau']]) {
			const context = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
			await context.route('**/*', r => r.request().url().startsWith(base + '/') ? r.continue() : r.abort());
			const page = await context.newPage();
			const answer = await page.goto(`${base}/${lang}/${seg}/?type[]=barter`);
			assert.equal(answer.status(), 200);
			await page.waitForFunction(() => /\d/.test((document.querySelector('[role=status]') || {}).textContent || ''));
			const total = Number(((await page.locator('.filter-result-toolbar [role=status]').first().textContent()) || '').replace(/\D/g, ''));
			assert.ok(total > 900, `${lang}: ${total}`);

			// The stock level is a table column since 23.11.2026; its head sorts.
			await page.evaluate(() => document.querySelector('.filter-ui thead [data-sort-key="stufe"]').click());
			await page.waitForFunction(() => document.querySelector('.filter-ui thead th:nth-child(2)')?.getAttribute('aria-sort') === 'ascending');
			assert.match(decodeURIComponent(page.url()), /sort=stufe/);
			const stufen = (await page.locator('.filter-ui tbody td.llb-zahl').allTextContents())
				.map(text => Number(String(text).split('–')[0]));
			assert.ok(stufen.length > 1, lang);
			const sortiert = stufen.slice().sort((a, b) => a - b);
			assert.deepEqual(stufen, sortiert, `${lang}: not ascending`);

			const felder = page.locator('.filter-ui input[type=number]');
			assert.equal(await felder.count(), 2, lang);
			await felder.nth(0).fill('100');
			await felder.nth(0).dispatchEvent('change');
			await felder.nth(1).fill('120');
			await felder.nth(1).dispatchEvent('change');
			await page.waitForTimeout(900);
			const url = decodeURIComponent(page.url());
			assert.match(url, /from=100/);
			assert.match(url, /to=120/);
			const eng = Number(((await page.locator('[role=status]').first().textContent()) || '').replace(/\D/g, ''));
			assert.ok(eng > 0 && eng < total, `${lang}: ${eng} of ${total}`);
			await context.close();
			console.log(lang, 'listing: range 100–120 and sort by stock level OK');
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

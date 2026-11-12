'use strict';
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const base = process.argv[2] || 'http://127.0.0.1:8813';
const artifacts = path.join(require('node:os').homedir(), '.cache/llb-related-tests');

(async () => {
	fs.mkdirSync(artifacts, { recursive: true });
	const browser = await chromium.launch({ channel: 'chrome' });
	try {
		const errors = [];
		for (const width of [1280, 390]) {
			for (const lang of ['de', 'en', 'fr']) {
				const page = await browser.newPage({ viewport: { width, height: 900 } });
				page.on('pageerror', e => errors.push(e.message));
				const downloads = [];
				page.on('request', r => { if (/\/(rezepte|gegenstaende|daten(?:-taten)?)-(de|en|fr)\.js/.test(r.url())) downloads.push(r.url()); });
				const segments = { de: ['gegenstand', 'gebiet', 'region', 'titel', 'tugend', 'fraktion', 'landmarke'], en: ['item', 'area', 'region', 'title', 'virtue', 'faction', 'landmark'], fr: ['objet', 'zone', 'region', 'titre', 'vertu', 'faction', 'site'] }[lang];
				async function open(segment, id, hash = '') {
					const response = await page.goto(`${base}/${lang}/${segment}/${id}/${hash}`, { waitUntil: 'networkidle' });
					assert.equal(response.status(), 200);
					await page.waitForFunction(() => window.MQL_RELATED_FILTER && document.querySelector('.filter-result-toolbar [role=status]')?.textContent.match(/\d/));
					assert.equal(await page.locator('.filter-ui').count(), 1);
					assert.equal(await page.locator('.filter-error:visible').count(), 0);
					assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${lang}/${segment} overflow at ${width}`);
				}
				await open(segments[0], '70001B7E');
				assert.match(await page.locator('.filter-result-toolbar').innerText(), /95/);
				assert.equal(await page.locator('.related-results tbody tr').count(), 50);
				const recipeIds = await page.evaluate(() => JSON.parse(document.getElementById('related-lists').textContent).recipe.rows.map(r => r[10]));
				assert.equal(recipeIds.length, 95);
				await page.evaluate(() => window.MQL_RELATED_FILTER.dispatch({ type: 'more' }));
				assert.equal(await page.locator('.related-results tbody tr').count(), 95);
				const tail = await page.evaluate(() => JSON.parse(document.getElementById('related-lists').textContent).recipe.rows.at(-1)[0]);
				await page.evaluate(value => window.MQL_RELATED_FILTER.dispatch({ type: 'searchSubmit', value }), tail);
				assert.ok(await page.locator('.related-results tbody tr').count() > 0, 'search beyond first 50');
				await page.reload({ waitUntil: 'networkidle' });
				assert.equal(await page.evaluate(() => window.MQL_RELATED_FILTER.getState().q), tail);
				await page.evaluate(() => window.MQL_RELATED_FILTER.dispatch({ type: 'reset' }));
				assert.match(await page.locator('.filter-result-toolbar').innerText(), /95/);
				assert.equal(new URL(page.url()).pathname, `/${lang}/${segments[0]}/70001B7E/`);
				await page.screenshot({ path: path.join(artifacts, `item-${lang}-${width}.png`), fullPage: false });

				await open(segments[1], '268437634', '#q');
				await page.evaluate(() => window.MQL_RELATED_FILTER.dispatch({ type: 'searchSubmit', value: '700' }));
				await page.locator('[data-related-type=i]').click();
				await page.waitForFunction(() => window.MQL_RELATED_FILTER.config.area.startsWith('related-i'));
				assert.equal(await page.evaluate(() => window.MQL_RELATED_FILTER.getState().q), '');
				assert.ok(await page.locator('.filter-group').count() > 0, 'Gegenstandsbaum fehlt');
				await page.evaluate(() => window.MQL_RELATED_FILTER.dispatch({ type: 'searchSubmit', value: '70001' }));
				await page.locator('[data-related-type=q]').click();
				await page.waitForFunction(() => window.MQL_RELATED_FILTER.config.area.startsWith('related-q'));
				assert.equal(await page.evaluate(() => window.MQL_RELATED_FILTER.getState().q), '700');
				await page.goBack({ waitUntil: 'networkidle' });
				await page.waitForFunction(() => window.MQL_RELATED_FILTER.config.area.startsWith('related-i'));
				assert.equal(await page.evaluate(() => window.MQL_RELATED_FILTER.getState().q), '70001');
				await page.reload({ waitUntil: 'networkidle' });
				assert.equal(await page.locator('[aria-selected=true]').getAttribute('data-related-type'), 'i');
				await page.screenshot({ path: path.join(artifacts, `area-${lang}-${width}.png`), fullPage: false });
				for (const [index, id] of [[2, '268437557'], [3, '70006369'], [4, '268440448'], [5, '70057CC8'], [6, '70047384']]) {
					await open(segments[index], id);
				}
				if (width === 390 && await page.locator('.filter-open:visible').count()) {
					await page.locator('.filter-open').click();
					assert.equal(await page.locator('dialog[open]').count(), 1);
					await page.keyboard.press('Escape');
					await page.waitForFunction(() => !document.querySelector('dialog[open]'));
					// A relation without filter groups must not open an empty dialog.
				} else if (width === 390) {
					assert.equal(await page.locator('.filter-group').count(), 0, 'leerer Filterdialog ohne Gruppen');
				}
				assert.deepEqual(downloads, [], 'detail must not load global catalogues');
				console.log(`${lang} ${width}px: 7 types, context/reset, whole-list search, tabs/history and mobile OK`);
				await page.close();
			}
		}
		const noJS = await browser.newPage({ javaScriptEnabled: false });
		await noJS.goto(base + '/de/gegenstand/70001B7E/');
		assert.equal(await noJS.locator('[data-quellen-liste] li').count(), 95, 'all recipe links without JS');
		await noJS.goto(base + '/de/gebiet/268437634/');
		assert.equal(await noJS.locator('#gebiet-buehne li').count(), 266 + 23 + 198, 'all members without JS');
		await noJS.close();
		assert.deepEqual(errors, []);
	} finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });

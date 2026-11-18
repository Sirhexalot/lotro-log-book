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
					const response = await page.goto(`${base}/${lang}/${segment}/${id}/${hash}`, { waitUntil: 'domcontentloaded' });
					assert.equal(response.status(), 200);
					assert.equal(await page.locator('.katalog-inhalt').getAttribute('data-related-filter-limit'), '5');
					await page.waitForFunction(() => window.MQL_RELATED_FILTER ||
						document.querySelector('.related-results'));
					const hasFilter = await page.locator('.filter-ui').count() === 1;
					if (!hasFilter) {
						assert.equal(await page.locator('.related-results').count(), 1);
						return false;
					}
					// A relation may live in a tab panel that starts hidden; reveal
					// its tab before measuring the filter's width.
					await page.evaluate(() => {
						const filter = document.querySelector('.filter-ui');
						const panel = filter.closest('[data-item-tab-panel]');
						if (panel && panel.hidden) {
							const tab = document.querySelector('[data-item-tab][aria-controls="' + panel.id + '"]');
							if (tab) { tab.click(); }
						}
					});
					await page.waitForFunction(() => document.querySelector('.filter-result-toolbar [role=status]')?.textContent.match(/\d/));
					const widths = await page.evaluate(() => {
						const filter = document.querySelector('.filter-ui');
						const article = filter.closest('article');
						const search = filter.querySelector('.filter-toolbar');
						const input = search && search.querySelector('input');
						const resultBar = filter.querySelector('.filter-result-toolbar');
						return { filter: filter.getBoundingClientRect().width, article: article.getBoundingClientRect().width,
							search: search && search.getBoundingClientRect().width,
							input: input && input.getBoundingClientRect().width,
							resultBar: resultBar && resultBar.getBoundingClientRect().width,
							maxWidth: getComputedStyle(article).maxWidth,
							overflow: document.documentElement.scrollWidth > innerWidth };
					});
					assert.ok(Math.abs(widths.filter - widths.article) <= 1, `${lang}/${segment} filter is not full width at ${width}px`);
					assert.ok(Math.abs(widths.search - widths.filter) <= 1, `${lang}/${segment} search is not full width at ${width}px`);
					assert.ok(widths.input > 0 && widths.input <= widths.search + 1, `${lang}/${segment} search input breaks out`);
					assert.ok(widths.resultBar <= widths.filter + 1, `${lang}/${segment} result toolbar breaks out`);
					assert.equal(widths.overflow, false, `${lang}/${segment} filter causes horizontal overflow`);
					assert.equal(widths.maxWidth, 'none', `${lang}/${segment} detail article keeps prose width`);
					assert.equal(await page.locator('.filter-error:visible').count(), 0);
					assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${lang}/${segment} overflow at ${width}`);
					return true;
				}
				assert.equal(await open(segments[0], '70001B7E'), true);
				assert.deepEqual(await page.evaluate(() => [
					window.MQL_RELATED_NEEDS_FILTER(5),
					window.MQL_RELATED_NEEDS_FILTER(6),
					window.MQL_RELATED_FILTER_LIMIT
				]), [false, true, 5], 'globale 5/6-Schwelle');
				assert.match(await page.locator('.filter-result-toolbar').innerText(), /91/);
				assert.equal(await page.locator('.related-results tbody tr').count(), 50);
				assert.deepEqual(await page.evaluate(() => {
					const lists = JSON.parse(document.getElementById('related-lists').textContent);
					return [lists.recipe.rows.length, lists.recipe_made.rows.length];
				}), [91, 4], 'Wofür und Herstellung bleiben getrennt');
				const recipeIds = await page.evaluate(() => JSON.parse(document.getElementById('related-lists').textContent).recipe.rows.map(r => r[10]));
				assert.equal(recipeIds.length, 91);
				await page.evaluate(() => window.MQL_RELATED_FILTER.dispatch({ type: 'more' }));
				assert.equal(await page.locator('.related-results tbody tr').count(), 91);
				const tail = await page.evaluate(() => JSON.parse(document.getElementById('related-lists').textContent).recipe.rows.at(-1)[0]);
				await page.evaluate(value => window.MQL_RELATED_FILTER.dispatch({ type: 'searchSubmit', value }), tail);
				assert.ok(await page.locator('.related-results tbody tr').count() > 0, 'search beyond first 50');
				await page.reload({ waitUntil: 'networkidle' });
				assert.equal(await page.evaluate(() => window.MQL_RELATED_FILTER.getState().q), tail);
				await page.evaluate(() => window.MQL_RELATED_FILTER.dispatch({ type: 'reset' }));
				assert.match(await page.locator('.filter-result-toolbar').innerText(), /91/);
				assert.equal(new URL(page.url()).pathname, `/${lang}/${segments[0]}/70001B7E/`);
				await page.screenshot({ path: path.join(artifacts, `item-${lang}-${width}.png`), fullPage: false });

				await open(segments[1], '268437634', '#q');
				await page.evaluate(() => window.MQL_RELATED_FILTER.dispatch({ type: 'searchSubmit', value: '700' }));
				await page.locator('[data-related-type=i]').click();
				await page.waitForFunction(() => window.MQL_RELATED_FILTER.config.area.startsWith('related-i') &&
					!document.querySelector('[data-filter-results]').hasAttribute('aria-busy'));
				assert.equal(await page.evaluate(() => window.MQL_RELATED_FILTER.getState().q), '');
				assert.ok(await page.locator('.filter-group').count() > 0, 'Gegenstandsbaum fehlt');
				await page.evaluate(() => window.MQL_RELATED_FILTER.dispatch({ type: 'searchSubmit', value: '70001' }));
				await page.locator('[data-related-type=q]').click();
				await page.waitForFunction(() => window.MQL_RELATED_FILTER.config.area.startsWith('related-q') &&
					!document.querySelector('[data-filter-results]').hasAttribute('aria-busy'));
				assert.equal(await page.evaluate(() => window.MQL_RELATED_FILTER.getState().q), '700');
				await page.goBack({ waitUntil: 'domcontentloaded' });
				await page.waitForFunction(() => window.MQL_RELATED_FILTER.config.area.startsWith('related-i'));
				assert.equal(await page.evaluate(() => window.MQL_RELATED_FILTER.getState().q), '70001');
				await page.reload({ waitUntil: 'domcontentloaded' });
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
		// An item whose only relation is "Herstellung" keeps its article: the
		// group mounts inside its section, the heading and icon stay visible,
		// and the two recipe directions never merge.
		const made = await browser.newPage({ viewport: { width: 1280, height: 900 } });
		await made.goto(base + '/de/gegenstand/70047510/', { waitUntil: 'domcontentloaded' });
		await made.waitForTimeout(1500);
		assert.equal(await made.locator('h1').evaluate((n) => n.getBoundingClientRect().width > 0), true,
			'item heading stays visible');
		assert.equal(await made.locator('.filter-ui').count(), 1, 'one crafting filter');
		assert.ok(await made.locator('#recipe-made-panel tbody tr').count() > 0, 'crafting rows mounted');
		assert.deepEqual(await made.evaluate(() =>
			Object.keys(JSON.parse(document.getElementById('related-lists').textContent))), ['recipe_made']);
		await made.close();

		const noJS = await browser.newPage({ javaScriptEnabled: false });
		await noJS.goto(base + '/de/gebiet/268437634/');
		const areaRows = await noJS.locator('#related-lists').textContent()
			.then((text) => Object.values(JSON.parse(text)).reduce((sum, group) => sum + group.rows.length, 0));
		assert.equal(await noJS.locator('#gebiet-buehne li').count(), areaRows, 'all members without JS');
		await noJS.close();
		assert.deepEqual(errors, []);
	} finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });

'use strict';
// Crafting category filter: bucket → base type → exact category.
// Checks the collapsed tree, the counters, selection on all three levels,
// the chip label and the deep link in DE, EN and FR.
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const base = process.argv[2] || 'http://127.0.0.1:8817';
const seiten = ['/de/handwerk/rezepte/', '/en/crafting/recipes/', '/fr/artisanat/recettes/'];

function zahl(text) {
	return Number(String(text).replace(/[^\d]/g, ''));
}

(async () => {
	const browser = await chromium.launch({ channel: 'chrome' });
	try {
		const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
		const errors = [];
		page.on('pageerror', e => errors.push(e.message));
		for (const route of seiten) {
			await page.goto(base + route, { waitUntil: 'networkidle' });
			await page.waitForSelector('.filter-group[data-key=ziel]');

			const start = await page.evaluate(() => {
				const gruppe = document.querySelector('.filter-group[data-key=ziel]');
				const zweige = [...gruppe.querySelectorAll(':scope > .filter-branch')];
				return {
					buckets: zweige.length,
					offen: zweige.filter(z => z.open).length,
					erste: zweige[0] ? {
						label: zweige[0].querySelector(':scope > summary').textContent.trim(),
						zahl: zweige[0].querySelector(':scope > summary small').textContent
					} : null,
					leer: gruppe.querySelectorAll(':scope > .filter-option').length
				};
			});
			assert.ok(start.buckets >= 10, route + ': Bereichsebene fehlt');
			assert.equal(start.offen, 0, route + ': Bereiche starten zugeklappt');
			assert.equal(start.leer, 0, route + ': Kategorien stehen nicht flach in der Liste');

			// Open the first bucket: its base types are ordered by recipe count.
			const typen = await page.evaluate(async () => {
				const zweig = document.querySelector('.filter-group[data-key=ziel] > .filter-branch');
				zweig.querySelector(':scope > summary').click();
				await new Promise(r => setTimeout(r, 250));
				return [...zweig.querySelectorAll(':scope > .filter-branch')].map(z => ({
					label: z.querySelector(':scope > summary').textContent.trim(),
					zahl: z.querySelector(':scope > summary small').textContent
				}));
			});
			assert.ok(typen.length >= 1, route + ': Grundarten fehlen');
			const zahlen = typen.map(t => zahl(t.zahl));
			assert.deepEqual(zahlen, zahlen.slice().sort((a, b) => b - a),
				route + ': Grundarten stehen nicht nach Anzahl');

			// Select the first base type: the result count matches its counter.
			const gewaehlt = await page.evaluate(async () => {
				const zweig = document.querySelector('.filter-group[data-key=ziel] > .filter-branch > .filter-branch');
				const zahl = zweig.querySelector(':scope > summary small').textContent;
				zweig.querySelector(':scope > summary label input').click();
				await new Promise(r => setTimeout(r, 800));
				return {
					zahl,
					url: location.search,
					treffer: document.querySelector('.filter-result-toolbar [role=status]').textContent
				};
			});
			assert.match(gewaehlt.url, /grund(%5B%5D|\[\])=/, route + ': Grundart steht nicht in der Adresse');
			assert.equal(zahl(gewaehlt.treffer), zahl(gewaehlt.zahl),
				route + ': Trefferzahl weicht vom Zähler ab');

			// A leaf shows its full category name as chip, not only the qualifier.
			const blatt = await page.evaluate(async () => {
				const zweig = document.querySelector('.filter-group[data-key=ziel] > .filter-branch > .filter-branch');
				const option = [...zweig.querySelectorAll(':scope > .filter-option')]
					.find(o => o.querySelector('input').checked === false);
				const name = option.querySelector('input').dataset.filterKey;
				option.querySelector('input').click();
				await new Promise(r => setTimeout(r, 800));
				return {
					name,
					chips: [...document.querySelectorAll('.filter-chips button')].map(b => b.textContent.trim())
				};
			});
			const vollerName = JSON.parse(blatt.name.split(':', 2).slice(1).join(':'));
			assert.ok(blatt.chips.some(c => c.startsWith(vollerName + ' ×')),
				route + ': Chip nennt nicht die volle Kategorie (' + vollerName + ')');

			// The deep link opens the way to the selection after a reload.
			await page.reload({ waitUntil: 'networkidle' });
			await page.waitForSelector('.filter-group[data-key=ziel]');
			const nachReload = await page.evaluate(() => ({
				offen: [...document.querySelectorAll('.filter-group[data-key=ziel] .filter-branch')]
					.filter(z => z.open).length,
				chips: [...document.querySelectorAll('.filter-chips button')].length
			}));
			assert.ok(nachReload.offen >= 2, route + ': Adresse öffnet den Zweig nicht');
			assert.ok(nachReload.chips >= 2, route + ': Adresse stellt die Auswahl nicht her');

			// Reset removes all three levels.
			await page.evaluate(() => document.querySelector('.filter-panel > button').click());
			await page.waitForTimeout(600);
			const zurueck = await page.evaluate(() => ({
				url: location.search,
				chips: [...document.querySelectorAll('.filter-chips button')].length
			}));
			assert.ok(!/ziel|grund|kategorie/.test(zurueck.url), route + ': Zurücksetzen lässt die Kategorie stehen');
			assert.equal(zurueck.chips, 0, route + ': Zurücksetzen lässt Chips stehen');
			console.log(route + ': category tree, counters, selection, chip and deep link ok');
		}

		// Mobile: the same tree in the filter dialog.
		const mobil = await browser.newPage({ viewport: { width: 390, height: 844 } });
		mobil.on('pageerror', e => errors.push(e.message));
		await mobil.goto(base + seiten[0], { waitUntil: 'networkidle' });
		await mobil.click('.filter-open');
		await mobil.waitForSelector('dialog.filter-dialog[open]');
		const dialog = await mobil.evaluate(() => {
			const gruppe = document.querySelector('dialog.filter-dialog .filter-group[data-key=ziel]');
			return {vorhanden: !!gruppe, buckets: gruppe ? gruppe.querySelectorAll(':scope > .filter-branch').length : 0};
		});
		assert.equal(dialog.vorhanden, true, 'Mobil: Kategoriebaum fehlt im Dialog');
		assert.ok(dialog.buckets >= 10, 'Mobil: Bereichsebene fehlt');
		console.log('mobile: category tree renders in the filter dialog');

		assert.deepEqual(errors, []);
	} finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });

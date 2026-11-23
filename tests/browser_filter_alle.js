'use strict';
/* Every filter surface at once: main lists, server lists, the map and the
 * detail relation lists. One run validates the shared mechanics (facets,
 * counts, selection, chip, reset, sortable head, sticky column, mobile) and
 * prints one line per surface.
 *
 *   node tests/browser_filter_alle.js http://127.0.0.1:8817
 *
 * Detail pages use a fixed example each; the numbers in the names are the
 * current counts and may change with the data.
 */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const base = (process.argv[2] || process.env.LLB_URL || 'http://127.0.0.1:8817').replace(/\/$/, '');

async function tab(page, key) {
	const button = page.locator('[data-reiter-knopf="' + key + '"]').first();
	if (await button.count()) {
		await button.click();
		await page.waitForTimeout(400);
	}
}

const FLAECHEN = [
	{name: 'Gegenstandssuche', path: '/de/gegenstandssuche/', table: true, filter: true},
	{name: 'Klassenprofil · Aufgaben', path: '/de/klassen/', tab: 'quests', filter: true},
	{name: 'Klassenprofil · Taten', path: '/de/klassen/', tab: 'deeds', filter: true},
	{name: 'Klassenprofil · Gegenstände', path: '/de/klassen/', tab: 'items', filter: true},
	{name: 'Aufgabenfinder', path: '/de/aufgabenfinder/', table: true, filter: true},
	{name: 'Tatenindex', path: '/de/tat/', table: true, filter: true},
	{name: 'Belohnungen', path: '/de/belohnungen/', table: true, filter: true},
	{name: 'Handwerk · Rezepte', path: '/de/handwerk/rezepte/', table: true, filter: true},
	{name: 'Handwerk · Rohstoffe', path: '/de/handwerk/rezepte/#rohstoffe', table: true, filter: true},
	{name: 'Sets', path: '/de/set/', filter: true},
	{name: 'Titel', path: '/de/titel/', table: true, filter: true},
	{name: 'Fraktionen', path: '/de/fraktion/', table: true, filter: true},
	{name: 'Landmarken', path: '/de/landmarke/', table: true, filter: true},
	{name: 'Händler', path: '/de/haendler/', table: true, filter: true},
	{name: 'Instanzen', path: '/de/instanz/', table: true, filter: true},
	{name: 'Auftraggeber', path: '/de/auftraggeber/', table: true, filter: true},
	{name: 'Gegenstand · Woher', path: '/de/gegenstand/7002B017/', filter: true},
	{name: 'Gegenstand · Wofür', path: '/de/gegenstand/70001B7E/', tab: 'wofuer', filter: true},
	{name: 'Händler · Warenangebot', path: '/de/haendler/700684E8/', tab: 'was', filter: true},
	{name: 'Fraktion · Rufquellen', path: '/de/fraktion/70020A60/', tab: 'q', filter: true},
	{name: 'Landmarke · Aufgaben', path: '/de/landmarke/70047384/', tab: 'q', filter: true},
	{name: 'Auftraggeber · Aufgaben', path: '/de/auftraggeber/70047E45/', filter: true},
	{name: 'Tat · Beziehungen', path: '/de/tat/70018A4F/', filter: true},
	{name: 'Instanz · Aufgaben', path: '/de/instanz/7001CD6C/', tab: 'aufgaben', filter: true},
	{name: 'Instanz · Beute', path: '/de/instanz/7001CD6C/', tab: 'truhenbeute', filter: true},
	{name: 'Titel · Quellen', path: '/de/titel/70009C09/', filter: false},
	{name: 'Karte · Aufgaben', path: '/de/karte/#map-268453374', kind: 'map'},
	{name: 'Karte · Taten', path: '/de/karte/taten/#map-268453374', kind: 'map'},
	{name: 'Epische Geschichte', path: '/de/karte/?gebiet=Epische%20Geschichte', kind: 'map'},
];

(async () => {
	const browser = await chromium.launch();
	const zeilen = [], fehler = [];
	try {
		for (const flaeche of FLAECHEN) {
			const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
			await context.route(/googletagmanager|google-analytics|goatcounter|gc\.zgo\.at/, (r) => r.abort());
			const page = await context.newPage();
			const js = [];
			page.on('pageerror', (e) => js.push(e.message));
			try {
				await page.goto(base + flaeche.path, { waitUntil: 'domcontentloaded' });
				if (flaeche.tab) { await tab(page, flaeche.tab); }
				await page.waitForTimeout(1500);

				if (flaeche.kind === 'map') {
					await page.evaluate(() => document.getElementById('filter-knopf').click());
					await page.waitForSelector('#filter[open]');
					assert.ok(await page.locator('[data-filterzahl]').count() >= 4, 'Kartenfilter ohne Stufen');
					await page.locator('input[name=kartenfortschritt][value=offen]').check();
					await page.waitForTimeout(600);
					assert.ok(await page.locator('#filter-anzahl').innerText(), 'Kartenfilter ohne Zahl');
					await page.evaluate(() => document.getElementById('filter-knopf').click());
					await page.waitForTimeout(200);
					await page.evaluate(() => document.getElementById('kartenfilter-reset').click());
					await page.waitForTimeout(300);
				} else if (flaeche.kind === 'rep') {
					await page.waitForSelector('#filter:visible');
					await page.locator('#filter').fill('a');
					await page.waitForTimeout(300);
					assert.equal(await page.locator('#filter').inputValue(), 'a');
					await page.locator('#nur-begonnen').check();
					await page.waitForTimeout(300);
				}

				const filter = await page.locator('.filter-ui:visible').count();
				if (flaeche.filter) { assert.ok(filter > 0, 'kein Filter'); }

				let gruppen = 0, zahlen = 0, sortiert = '-';
				if (filter > 0) {
					const aktiv = page.locator('.filter-ui:visible').first();
					gruppen = await aktiv.locator('.filter-group').count();
					assert.ok(gruppen > 0, 'keine Filtergruppe');
					zahlen = await aktiv.locator('.filter-option small, .filter-count').count();
					assert.ok(zahlen > 0, 'keine Zähler');

					// Erste sichtbare Auswahl setzen und den Chip prüfen.
					const box = aktiv.locator('input[type=checkbox]:visible').first();
					if (await box.count()) {
						const before = page.url();
						await box.check();
						await page.waitForTimeout(1000);
						assert.ok(page.url() !== before || await page.locator('.filter-chips button').count() > 0,
							'Auswahl ohne Wirkung');
						assert.ok(await page.locator('.filter-chips button').count() > 0, 'kein Chip');
						await aktiv.locator('.filter-panel button').last().click();
						await page.waitForTimeout(800);
					}
					if (await aktiv.locator('thead [data-sort-key]:visible').count()) {
						const kopf = aktiv.locator('thead th').first();
						const vorher = await kopf.getAttribute('aria-sort');
						await aktiv.locator('thead [data-sort-key]:visible').first().click();
						await page.waitForTimeout(800);
						const nachher = await aktiv.locator('thead th').first().getAttribute('aria-sort');
						assert.notEqual(nachher, vorher, 'Sortierkopf ohne Wirkung');
						sortiert = nachher;
					}
				}

				await page.setViewportSize({ width: 390, height: 844 });
				await page.waitForTimeout(300);
				assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false,
					'Seitenbreite mobil');
				await page.setViewportSize({ width: 1280, height: 900 });

				assert.deepEqual(js, [], 'JavaScript-Fehler: ' + js.join(' | '));
				zeilen.push([flaeche.name, flaeche.path,
					(flaeche.kind ? 'eigener Filter' : filter ? 'Filter' : 'kein Filter'),
					gruppen, sortiert, 'ok']);
				await context.close();
			} catch (error) {
				fehler.push(flaeche.name + ': ' + error.message);
				zeilen.push([flaeche.name, flaeche.path, (flaeche.filter ? 'Filter' : 'kein Filter'),
					0, '-', 'FEHLER']);
				await context.close();
			}
		}

		// Mit Spielstand: Fortschrittsgruppe, Spalte und Steuerung.
		const fortschritt = [
			{name: 'Aufgabenfinder · mit Spielstand', path: '/de/aufgabenfinder/'},
			{name: 'Tatenindex · mit Spielstand', path: '/de/tat/'},
			{name: 'Klassenprofil · Aufgaben mit Spielstand', path: '/de/klassen/', tab: 'quests'},
			{name: 'Klassenprofil · Taten mit Spielstand', path: '/de/klassen/', tab: 'deeds'},
			{name: 'Karte · mit Spielstand', path: '/de/karte/#map-268453374', kind: 'map'},
			{name: 'Ruf · mit Spielstand', path: '/de/ruf/', kind: 'rep'},
			{name: 'Gegenstand · Woher mit Spielstand', path: '/de/gegenstand/7002B017/'},
			{name: 'Auftraggeber · mit Spielstand', path: '/de/auftraggeber/70047E45/'},
		];
		for (const flaeche of fortschritt) {
			const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
			await context.addInitScript(() => localStorage.setItem('mql.charaktere', JSON.stringify({
				aktiv: 'T|T|T', liste: {'T|T|T': {key: 'T|T|T', name: 'Test', server: 'T',
					quests: ['70047A58'], deeds: ['70018A4F'], rezepte: [], handwerk: {},
					ruf: [['70020A60', 3, 100]],
					importMeta: {quests: true, deeds: true, reputation: true}}}
			})));
			await context.route(/googletagmanager|google-analytics|goatcounter|gc\.zgo\.at/, (r) => r.abort());
			const page = await context.newPage();
			const js = [];
			page.on('pageerror', (e) => js.push(e.message));
			try {
				await page.goto(base + flaeche.path, { waitUntil: 'domcontentloaded' });
				if (flaeche.tab) { await tab(page, flaeche.tab); }
				await page.waitForTimeout(1600);
				if (flaeche.kind === 'map') {
					await page.evaluate(() => document.getElementById('filter-knopf').click());
					await page.waitForSelector('#filter[open]');
					assert.ok(await page.locator('[data-filterzahl]:not([hidden])').count() >= 4, 'Kartenfilter ohne Fortschrittszahlen');
					await page.evaluate(() => document.getElementById('kartenfilter-reset').click());
				} else if (flaeche.kind === 'rep') {
					await page.waitForSelector('#filter:visible');
					await page.locator('#filter').fill('a');
					await page.locator('#nur-begonnen').check();
					await page.waitForTimeout(400);
					assert.ok(await page.locator('#zeilen tr').count() > 0, 'Ruf ohne Zeilen');
				} else {
					assert.ok(await page.locator('.mql-row-progress').count() > 0, 'keine Fortschrittsspalte');
					const gruppe = page.locator('.filter-group').filter({hasText: 'Fortschritt'}).filter({visible: true}).first();
					assert.equal(await gruppe.count(), 1, 'keine Fortschrittsgruppe');
					const offen = gruppe.locator('input[type=radio]').nth(1);
					if (await offen.count()) {
						await offen.check();
						await page.waitForTimeout(800);
						assert.ok(await page.locator('.filter-chips button').count() > 0, 'Fortschritt ohne Chip');
					}
				}
				assert.deepEqual(js, [], flaeche.name + ': ' + js.join(' | '));
				zeilen.push([flaeche.name, flaeche.path, 'Fortschritt', 1, '-', 'ok']);
				await context.close();
			} catch (error) {
				fehler.push(flaeche.name + ': ' + error.message);
				zeilen.push([flaeche.name, flaeche.path, 'Fortschritt', 0, '-', 'FEHLER']);
				await context.close();
			}
		}

		console.log('| Fläche | Pfad | Filter | Gruppen | Sortierung | Stand |');
		console.log('| --- | --- | --- | --- | --- | --- |');
		for (const z of zeilen) { console.log('| ' + z.join(' | ') + ' |'); }
		if (fehler.length) { console.log('\nFEHLER:\n- ' + fehler.join('\n- ')); process.exitCode = 1; }
	} finally {
		await browser.close();
	}
})();

'use strict';
/* Kartenfilter: Zahlen je Fortschrittsoption, und eine Kartenadresse mit nur
 * einer Karten-ID muss die Liste dieser Karte zeigen.
 *
 *   node tests/browser_karte_filter.js http://127.0.0.1:8817
 */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const base = (process.argv[2] || process.env.LLB_URL || 'http://127.0.0.1:8817').replace(/\/$/, '');
/* Besieged Mordor: 81 entries, two of them completed by the test character. */
const KARTE = '#map-268453374';
const ERLEDIGT = ['700537B7', '700537B9'];

async function zahlen(page) {
	return page.evaluate(() => Object.fromEntries(
		Array.from(document.querySelectorAll('[data-filterzahl]'))
			.map((feld) => [feld.dataset.filterzahl, feld.hidden ? null : feld.textContent])));
}

async function zeilen(page) {
	return page.locator('#liste > li').count();
}

(async () => {
	const browser = await chromium.launch({ channel: 'chrome' });
	try {
		for (const design of ['dark', 'light']) {
			const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
			const page = await context.newPage();
			const fehler = [];
			page.on('pageerror', (e) => fehler.push(design + ': ' + e.message));
			await page.addInitScript((daten) => {
				try { localStorage.setItem('mql.theme', daten.design); } catch (e) { /* egal */ }
				try {
					localStorage.setItem('mql.charaktere', JSON.stringify({
						aktiv: 'filter', liste: { filter: {
							key: 'filter', name: 'Filterprobe', server: 'Test', level: '125',
							quests: daten.erledigt, deeds: [], rezepte: [], handwerk: {}, ruf: [],
							importMeta: { quests: true },
						} },
					}));
				} catch (e) { /* egal */ }
			}, { design, erledigt: ERLEDIGT });

			await page.goto(base + '/de/karte/' + KARTE, { waitUntil: 'load' });
			await page.waitForFunction(() => document.querySelectorAll('#liste > li').length > 50,
				null, { timeout: 30000 });

			/* The bare map ID opens the map's own list, not an empty column. */
			assert.equal(await zeilen(page), 81, design + ': Kartenadresse zeigt die Liste nicht');
			assert.equal(await page.locator('#liste-titel').innerText(), 'Belagertes Mordor');

			/* Filter button and search field share one height; a 4 px step made the
			   row look crooked. */
			const hoehen = await page.evaluate(() => ({
				knopf: document.querySelector('#filter-knopf').getBoundingClientRect().height,
				suche: document.querySelector('.aufgaben-suche').getBoundingClientRect().height }));
			assert.equal(Math.round(hoehen.knopf), Math.round(hoehen.suche),
				design + ': Filterknopf und Suchfeld sind unterschiedlich hoch');

			/* Numbers per state; "Alle" is the whole map list. */
			let stand = await zahlen(page);
			assert.equal(stand.alle, '81', design + ': Zahl aller Einträge');
			assert.equal(stand.erledigt, '2', design + ': Zahl der erledigten Einträge');
			assert.equal(stand.offen, '79', design + ': Zahl der offenen Einträge');
			assert.equal(stand.laufend, '0', design + ': Zahl der begonnenen Einträge');

			/* The search narrows the numbers, not the chosen state. */
			await page.fill('#aufgaben-suche', 'Kapitel');
			await page.waitForTimeout(600);
			stand = await zahlen(page);
			assert.equal(stand.alle, '10', design + ': Suche zählt nicht mit');
			assert.equal(stand.erledigt, '2', design + ': Suche verliert den Abschluss');
			await page.fill('#aufgaben-suche', '');
			await page.waitForTimeout(600);

			/* Choosing a state filters the list but keeps its own number. */
			await page.click('#filter-knopf');
			await page.check('input[name="kartenfortschritt"][value="erledigt"]');
			await page.waitForTimeout(600);
			assert.equal(await zeilen(page), 2, design + ': Fortschrittsfilter wirkt nicht');
			stand = await zahlen(page);
			assert.equal(stand.alle, '81', design + ': Zahlen ändern sich beim Filtern');
			assert.equal(stand.erledigt, '2', design + ': erledigt verliert seine Zahl');

			assert.deepEqual(fehler, [], 'JS-Fehler: ' + fehler.join(' | '));
			await context.close();
		}
		console.log('Kartenfilter: Zahlen je Fortschritt, Suche zählt mit, Kartenadresse zeigt die Liste');
	} finally {
		await browser.close();
	}
})().catch((error) => { console.error(error); process.exitCode = 1; });

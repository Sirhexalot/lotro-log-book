'use strict';
/* Epische Geschichte: Bände klappen in der Liste auf, statt die Ansicht zu
 * ersetzen. Die zehn Bände bleiben sichtbar, Bücher und Kapitel wachsen darunter.
 *
 *   node tests/browser_epik.js http://127.0.0.1:8817
 */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const base = (process.argv[2] || process.env.LLB_URL || 'http://127.0.0.1:8817').replace(/\/$/, '');
const START = '/de/karte/?gebiet=Epische+Geschichte';

async function bereit(page, breite) {
	await page.waitForFunction(() => document.querySelectorAll('#liste li.epik-band').length === 10,
		null, { timeout: 30000 });
	/* On desktop the special view opens in the terrain; its tiles load after the
	   map. On a phone the list tab is in front, so the stage is not drawn yet. */
	if (breite > 700) {
		await page.waitForFunction(() => document.querySelectorAll('.gelaende-kacheln img').length > 0,
			null, { timeout: 20000 });
	}
}

async function zustand(page) {
	return page.evaluate(() => ({
		baender: document.querySelectorAll('#liste li.epik-band').length,
		buecher: document.querySelectorAll('#liste ul.epik-buecher').length,
		buchKoepfe: document.querySelectorAll('#liste ul.epik-buecher li.abschnitt').length,
		aufgaben: document.querySelectorAll('#liste ul.epik-buecher li:not(.abschnitt):not(.listen-hinweis)').length,
		titel: document.getElementById('liste-titel')?.textContent?.trim() || '',
		url: location.search,
		detail: document.getElementById('detail')?.querySelector('.detail-titel')?.textContent?.trim() || '',
		bild: document.getElementById('bild')?.getAttribute('src') || '',
		ansicht: !document.getElementById('kartenansicht')?.hidden,
		legende: !document.getElementById('legende')?.hidden,
		punkte: document.querySelectorAll('#marker .punkt').length,
		kacheln: document.querySelectorAll('.gelaende-kacheln > *').length,
		lage: document.getElementById('welt')?.dataset.kartenansicht || '',
		zahlen: Object.fromEntries(Array.from(document.querySelectorAll('[data-filterzahl]'))
			.map((feld) => [feld.dataset.filterzahl, feld.hidden ? null : feld.textContent])),
	}));
}

(async () => {
	const browser = await chromium.launch({ channel: 'chrome' });
	try {
		for (const design of ['dark', 'light']) {
			const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
			const page = await context.newPage();
			const fehler = [];
			page.on('pageerror', (e) => fehler.push(design + ': ' + e.message));
			await page.addInitScript((wert) => {
				try { localStorage.setItem('mql.theme', wert); } catch (e) { /* egal */ }
				/* One chapter as done, so the progress filter has numbers. */
				try {
					localStorage.setItem('mql.charaktere', JSON.stringify({
						aktiv: 'epik', liste: { epik: {
							key: 'epik', name: 'Epikprobe', server: 'Test', level: '128',
							quests: ['700000A8'], deeds: [], rezepte: [], handwerk: {}, ruf: [],
							importMeta: { quests: true },
						} },
					}));
				} catch (e) { /* egal */ }
			}, design);

			for (const breite of [1280, 390]) {
				await page.setViewportSize({ width: breite, height: breite > 700 ? 900 : 844 });
				await page.goto(base + START, { waitUntil: 'load' });
				await bereit(page, breite);

				let stand = await zustand(page);
				assert.equal(stand.baender, 10, design + ': nicht zehn Bände');
				assert.equal(stand.buecher, 0, design + ': ein Band startet offen');
				assert.equal(stand.titel, 'Epische Geschichte', design + ': Listentitel');
				/* Die Epik öffnet auf der großen Karte, mit Umschalter und Punkten. */
				assert.match(stand.bild, /268437557/, design + ': falsche Karte');
				assert.equal(stand.ansicht, true, design + ': Kartenumschalter fehlt');
				assert.equal(stand.legende, true, design + ': Legende fehlt');
				assert.ok(stand.punkte > 0, design + ': keine Kartenpunkte');
				assert.ok(Number(stand.zahlen.alle) > 150 && Number(stand.zahlen.alle) <= 225,
					design + ': Zahl aller Kapitel unplausibel: ' + stand.zahlen.alle);
				assert.equal(stand.zahlen.erledigt, '1', design + ': Zahl der erledigten Kapitel');

				/* Die Epik ist eine Sonderansicht: sie startet im Gelände, die
				   Spielkarte bleibt umschaltbar, die Punkte bleiben. */
				assert.equal(stand.lage, 'gelaende', design + ': Epik startet nicht im Gelände');
				if (breite > 700) { assert.ok(stand.kacheln > 0, design + ': keine Geländekacheln'); }
				if (breite > 700) {
					await page.locator('[data-kartenansicht="karte"]').click();
					await page.waitForTimeout(800);
					stand = await zustand(page);
					assert.equal(stand.lage, 'karte', design + ': Spielkarte schaltet nicht um');
					assert.ok(stand.punkte > 0, design + ': Punkte verschwinden auf der Spielkarte');
					await page.locator('[data-kartenansicht="gelaende"]').click();
					await page.waitForTimeout(900);
				}

				/* Band aufklappen: die Bände bleiben, die Bücher kommen darunter. */
				await page.locator('#liste li.epik-band').nth(2).click();
				stand = await zustand(page);
				assert.equal(stand.baender, 10, design + ': Bände verschwinden beim Aufklappen');
				assert.equal(stand.buecher, 1, design + ': Band klappt nicht auf');
				assert.equal(stand.buchKoepfe > 0, true, design + ': keine Bücher im Band');
				assert.equal(stand.url, '?gebiet=Epische+Geschichte', design + ': Adresse springt beim Aufklappen');

				/* Buch aufklappen: Kapitel/Aufgaben erscheinen darunter. */
				const vorher = stand.aufgaben;
				await page.locator('#liste ul.epik-buecher li.abschnitt').first().click();
				stand = await zustand(page);
				assert.ok(stand.aufgaben > vorher, design + ': Buch klappt keine Aufgaben auf');

				/* Aufgabe wählen: Detailspalte zeigt sie, die Liste bleibt. */
				await page.locator('#liste ul.epik-buecher li:not(.abschnitt):not(.listen-hinweis)').first().click();
				stand = await zustand(page);
				assert.ok(stand.detail, design + ': Detailspalte bleibt leer');
				assert.equal(stand.baender, 10, design + ': Bände nach Aufgabenwahl weg');
				/* Auf dem Handy schaltet die Aufgabenwahl auf die Detailspalte um. */
				if (breite < 1000) {
					await page.locator('#mobil-reiter [data-pane="liste"]').click();
				}

				/* Band wieder zuklappen. */
				await page.locator('#liste li.epik-band').nth(2).click();
				stand = await zustand(page);
				assert.equal(stand.buecher, 0, design + ': Band klappt nicht zu');
				assert.equal(stand.baender, 10, design + ': Bände nach Zuklappen weg');
			}

			/* Suche öffnet die passenden Bände und blendet den Rest aus. */
			await page.setViewportSize({ width: 1280, height: 900 });
			await page.goto(base + START, { waitUntil: 'load' });
			await bereit(page);
			await page.fill('#aufgaben-suche', 'Schlüssel');
			await page.waitForTimeout(600);
			const treffer = await zustand(page);
			assert.ok(treffer.baender >= 1 && treffer.baender < 10, design + ': Suche filtert die Bände nicht');
			assert.equal(treffer.buecher, treffer.baender, design + ': Treffer-Band nicht aufgeklappt');

			/* Der Prolog ist ein Einstiegsblock mit Hinweis; seine Instanz hängt
			   am Kapitel und steht nicht als eigene Aufgabe in der Liste. */
			await page.fill('#aufgaben-suche', '');
			await page.waitForTimeout(500);
			await page.locator('#liste li.epik-band').first().click();
			await page.waitForTimeout(400);
			const prolog = page.locator('#liste ul.epik-buecher > li.abschnitt').filter({ hasText: /Prolog/ }).first();
			await prolog.click();
			await page.waitForTimeout(400);
			const hinweis = await page.evaluate(() =>
				document.querySelector('#liste ul.epik-buecher li.listen-hinweis')?.textContent?.trim() || '');
			assert.match(hinweis, /zählt aber nicht|counts|compte/i, design + ': Prolog-Hinweis fehlt');
			const kapitelZeile = page.locator('#liste ul.epik-buecher > li').filter({ hasText: /Prolog: Hilfe für einen Waldläufer/ }).first();
			assert.match(await kapitelZeile.locator('.instanz-teil').first().textContent(), /Instanz|Instance/i,
				design + ': Kapitel nennt seine Instanz nicht');
			const doppelt = await page.evaluate(() =>
				Array.from(document.querySelectorAll('#liste ul.epik-buecher > li'))
					.filter((zeile) => /^\s*(?:○|✓|◐)?\s*Instanz:\s*Hilfe für einen Waldläufer/i.test(zeile.textContent)).length);
			assert.equal(doppelt, 0, design + ': Instanz steht doppelt neben ihrem Kapitel');

			/* Eine gewählte Aufgabe springt auf ihre genaue Karte, nicht auf die
			   große Übersicht. */
			await page.fill('#aufgaben-suche', 'Buch 1, Kapitel 1:');
			await page.waitForTimeout(800);
			await page.locator('#liste ul.epik-buecher li:not(.abschnitt):not(.listen-hinweis)').first().click();
			await page.waitForTimeout(1200);
			const karte = await page.evaluate(() =>
				(document.getElementById('bild').getAttribute('src') || '').match(/(\d+)\.webp/)?.[1] || '');
			assert.notEqual(karte, '268437557', design + ': Epik-Aufgabe springt nicht auf ihre Karte');
			assert.ok(karte, design + ': Epik-Aufgabe ohne Karte');

			assert.deepEqual(fehler, [], 'JS-Fehler: ' + fehler.join(' | '));
			await context.close();
		}
		console.log('Epische Geschichte: Bände klappen auf, Suche öffnet Treffer, dunkel und hell');
	} finally {
		await browser.close();
	}
})().catch((error) => { console.error(error); process.exitCode = 1; });

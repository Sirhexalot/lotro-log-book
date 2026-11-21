'use strict';
/* Kartenansicht: Aufgabendetail und Tatendarstellung in der Detailspalte.
 *
 * Beide Designs, Desktop und Handy. Geprüft werden die Bausteine der
 * Detailspalte (Fläche, Fakten, Klappe, Icon-Kachel) und der Aufbau:
 * Landschaft öffnen, ersten Eintrag wählen, Detail lesen.
 *
 *   node tests/browser_karte_entity.js http://127.0.0.1:8817
 */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const base = (process.argv[2] || 'http://127.0.0.1:8817').replace(/\/$/, '');

async function landschaftOeffnen(page, pfad, name) {
	await page.goto(base + pfad, { waitUntil: 'load' });
	const karte = page.locator('#landschaften button').filter({ hasText: new RegExp('^' + name) }).first();
	await karte.waitFor({ timeout: 20000 });
	await karte.click();
	await page.waitForFunction(() => document.querySelectorAll('#liste li .qname').length > 0, null, { timeout: 20000 });
}

async function eintragOeffnen(page, art) {
	await page.evaluate(() => {
		const zeile = Array.from(document.querySelectorAll('#liste li')).find((li) => li.querySelector('.qname'));
		zeile.querySelector('.qname').click();
	});
	/* Erst wenn die Detailspalte den erwarteten Typ zeigt, ist der Klick angekommen;
	 * sonst würde die Zusammenfassung der Landschaft als Treffer gelten. */
	await page.waitForFunction((erwartet) => {
		const detail = document.getElementById('detail');
		const art = detail?.querySelector('.detail-art')?.textContent?.trim().toLocaleLowerCase();
		return art === erwartet && detail.innerText.trim().length > 40;
	}, art.toLocaleLowerCase(), { timeout: 20000 });
}

async function detailPruefen(page, art, breite) {
	/* Die Detailspalte füllt sich nach dem Klick nachgeladen; erst messen, wenn
	 * die Abschnitte stehen (sonst zählt man den Zwischenstand). */
	await page.waitForFunction(() => document.querySelectorAll('#detail .llb-flaeche').length >= 3,
		null, { timeout: 10000 }).catch(() => {});
	const stand = await page.evaluate(() => {
		const detail = document.getElementById('detail');
		const kachel = detail.querySelector('.mql-row-icon, .mql-kachel, .llb-kachel');
		return {
			titel: detail.querySelector('.detail-titel')?.textContent?.trim() || '',
			flaechen: detail.querySelectorAll('.llb-flaeche').length,
			fakten: detail.querySelectorAll('.llb-fakten').length,
			klappen: detail.querySelectorAll('details, .llb-klappe').length,
			kachel: kachel ? Math.round(kachel.getBoundingClientRect().width) : null,
			ueberlauf: document.documentElement.scrollWidth > innerWidth + 1,
		};
	});
	assert.ok(stand.titel, art + ': Titel fehlt');
	assert.ok(stand.flaechen >= 3, art + ': zu wenige Flächen (' + stand.flaechen + ') bei „' + stand.titel + '“ / ' + breite + ' px');
	assert.ok(stand.fakten >= 1, art + ': Fakten fehlen');
	if (stand.kachel !== null) {
		assert.equal(stand.kachel, breite > 700 ? 64 : 54, art + ': Icon-Kachel-Größe');
	}
	assert.equal(stand.ueberlauf, false, art + ': Überlauf (' + breite + 'px)');
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
			}, design);

			for (const breite of [1280, 390]) {
				await page.setViewportSize({ width: breite, height: breite > 700 ? 900 : 844 });
				await landschaftOeffnen(page, '/de/karte/', 'Breeland');
				await eintragOeffnen(page, 'Aufgabe');
				await detailPruefen(page, 'Aufgabe', breite);

				await landschaftOeffnen(page, '/de/karte/taten/', 'Breeland');
				await eintragOeffnen(page, 'Tat');
				await detailPruefen(page, 'Tat', breite);
			}
			assert.deepEqual(fehler, [], 'JS-Fehler: ' + fehler.join(' | '));
			await context.close();
		}
		console.log('Karte: Aufgabendetail und Tatendarstellung in dunkel und hell, Desktop und Handy geprüft');
	} finally {
		await browser.close();
	}
})().catch((error) => { console.error(error); process.exitCode = 1; });

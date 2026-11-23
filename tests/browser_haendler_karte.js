/* Vendor layer on the map, and the two dead ends it replaced.
 *
 * Usage: node tests/browser_haendler_karte.js http://127.0.0.1:8817
 *
 * Checks:
 *   - "Auf Karte zeigen" on a vendor page opens a vendor view: that vendor only,
 *     its name under the dot, no quest dots, and a way back to the quest map;
 *   - the toolbar switch stays hidden and the legend names vendor points;
 *   - several vendors on one spot become one dot with a count and a list;
 *   - a vendor inside a room links no map and no route, and the travel planner
 *     answers an interior coordinate with "no stable-master nearby" instead of
 *     routing to a stable several landscapes away;
 *   - on a phone the tool row stays one row (the switch moves out of it there).
 */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');

const base = (process.argv[2] || 'http://127.0.0.1:8817').replace(/\/$/, '');
// Bree-land (268437653) with "Georg Lerchensporn" (70003BD7) on it.
const KARTE = '268437653';
const HAENDLER = '70003BD7';

(async () => {
	const browser = await chromium.launch({ channel: 'chrome' });
	try {
		const context = await browser.newContext({ viewport: { width: 1400, height: 950 } });
		await context.route('**/*', r => r.request().url().startsWith(base + '/') ? r.continue() : r.abort());
		const page = await context.newPage();
		const errors = [];
		page.on('pageerror', e => errors.push(e.message));

		// 1) The link from the vendor page opens a map with that vendor only.
		const antwort = await page.goto(`${base}/de/karte/?vorkarte=${KARTE}&haendler=${HAENDLER}`);
		assert.equal(antwort.status(), 200);
		await page.waitForSelector('.punkt.haendler', { timeout: 20000 });
		await page.waitForTimeout(600);
		assert.equal(await page.locator('#haendler-schalter').getAttribute('aria-pressed'), 'true',
			'Händler-Ebene nicht eingeschaltet');
		assert.equal(await page.locator('.punkt:not(.haendler)').count(), 0,
			'Vendor-Ansicht zeigt noch Aufgabenpunkte');
		assert.equal(await page.locator('.punkt.haendler').count(), 1,
			'Vendor-Ansicht zeigt mehr als einen Händler');
		assert.equal((await page.locator('#liste-titel').textContent()).trim(), 'Händleransicht');
		assert.match(await page.locator('#detail').textContent(), /Georg Lerchensporn/);
		const schilder = await page.locator('.marker-schild').allTextContents();
		assert.ok(schilder.some(t => t.includes('Georg')), 'Name am Punkt fehlt: ' + schilder.join('|'));

		// A stale area in the address must not override the explicit map ID.
		// This is the real failure mode from an older map state:
		// Lothlórien is 268442330, while the stale area points at Breeland.
		await page.goto(`${base}/de/karte/?vorkarte=268442330&haendler=70016BEB&gebiet=Eriador%7CBreeland`);
		await page.waitForSelector('.punkt.haendler', { timeout: 20000 });
		await page.waitForTimeout(600);
		assert.equal((await page.locator('#liste-titel').textContent()).trim(), 'Händleransicht',
			'veraltetes gebiet überschreibt vorkarte');
		assert.equal(await page.locator('.punkt:not(.haendler)').count(), 0,
			'veraltetes gebiet zeigt Aufgabenpunkte in der Händleransicht');
		assert.equal(await page.locator('.punkt.haendler').count(), 1,
			'Händlerlink auf der expliziten vorkarte nicht isoliert');
		assert.match(await page.locator('#bild').getAttribute('src'), /268442330/,
			'Bild entspricht nicht der expliziten vorkarte');

		// 2) "Alle Aufgaben zeigen" gives back the quest map, all vendors included.
		await page.locator('.hinweis-aktionen button').click();
		await page.waitForTimeout(800);
		assert.ok(await page.locator('.punkt:not(.haendler)').count() > 0,
			'Aufgabenpunkte kommen nicht zurück');
		assert.ok(!/haendler=/.test(page.url()), 'Händler-Parameter bleibt in der Adresse');
		assert.ok(await page.locator('.punkt.haendler').count() > 1, 'Händler-Ebene ist aus');

		// 3) Vendor points remain available through the vendor-page map link,
		//    while the optional switch is hidden from the toolbar.
		const anzahl = await page.locator('.punkt.haendler').count();
		assert.ok(anzahl > 0, 'keine Händlerpunkte');
		assert.equal(await page.locator('#haendler-schalter').isVisible(), false,
			'Händler-Schalter steht noch in der Werkzeugleiste');
		await page.locator('#legende-mehr').click();
		const legende = await page.locator('#legende-voll').textContent();
		assert.match(legende, /Händler/, 'Legende nennt die Händler nicht');

		// 4) Vendors sharing a spot: one dot with a count, its list links each page.
		const stapel = page.locator('.punkt.haendler.stapel').first();
		if (await stapel.count()) {
			await stapel.click();
			await page.waitForSelector('.haufen a');
			const zeilen = await page.locator('.haufen a').count();
			assert.ok(zeilen > 1, 'Stapel zeigt keine Liste');
			await page.locator('.haufen a').first().click();
			await page.waitForLoadState('domcontentloaded');
			assert.match(page.url(), /\/de\/haendler\/[0-9A-F]{8}\//, 'Liste führt nicht zur Händlerseite');
		}

		// 5) A long place list: the rows scroll in their own field, so the
		//    picture stays visible when a row far down is picked.
		await page.goto(`${base}/de/haendler/7002AA91/`);
		await page.waitForTimeout(300);
		if (await page.locator('[data-reiter-knopf="wo"]').count()) {
			await page.locator('[data-reiter-knopf="wo"]').click();
		}
		await page.waitForTimeout(300);
		const reihen = page.locator('.llb-ort-wahl-liste button.ort-zeile');
		assert.ok(await reihen.count() > 10, 'zu wenige Standorte für die Probe');
		const altesBild = await page.locator('[data-ort-bild]').getAttribute('src');
		await reihen.nth(19).click();
		await page.waitForTimeout(400);
		assert.notEqual(await page.locator('[data-ort-bild]').getAttribute('src'), altesBild,
			'Klick wechselt das Bild nicht');
		const sicht = await page.evaluate(() => {
			const karte = document.querySelector('.llb-ort-wahl .llb-karte').getBoundingClientRect();
			const liste = document.querySelector('.llb-ort-wahl-liste');
			return { sichtbar: karte.top >= 0 && karte.bottom <= window.innerHeight,
				scrollt: liste.scrollHeight > liste.clientHeight + 2 };
		});
		assert.ok(sicht.sichtbar, 'Bild ist nach dem Klick außer Sicht');
		assert.ok(sicht.scrollt, 'lange Liste scrollt nicht im eigenen Feld');

		// 6) A vendor inside a hall: the hall's own picture with the pin, no
		//    map link and no route (its coordinates are interior ones).
		await page.goto(`${base}/de/haendler/70000068/`);
		await page.waitForTimeout(400);
		const bild = page.locator('[data-ort-bild]');
		assert.equal(await bild.count(), 1, 'Innenraum ohne Bild');
		assert.match(await bild.getAttribute('src'), /\/karten\/de\/\d+\.webp$/);
		assert.ok(await bild.evaluate(img => img.complete && img.naturalWidth > 0),
			'Innenraum-Bild lädt nicht');
		assert.ok(await page.locator('[data-ort-pin]').isVisible(), 'Pin fehlt');
		assert.match(await page.locator('.ort-name').nth(1).textContent(), /Thorins Halle/);
		/* One picture is no picker: nothing on this page may look clickable. */
		assert.equal(await page.locator('.llb-ort-wahl-liste button.ort-zeile').count(), 0,
			'Standortzeile ist ein Knopf, obwohl es nur ein Bild gibt');

		// 7) Several rooms: the rows are a picker and swap picture and pin.
		await page.goto(`${base}/de/haendler/7002AA91/`);
		await page.waitForTimeout(300);
		if (await page.locator('[data-reiter-knopf="wo"]').count()) {
			await page.locator('[data-reiter-knopf="wo"]').click();
		}
		await page.waitForTimeout(300);
		const knoepfe = page.locator('.llb-ort-wahl-liste button.ort-zeile');
		assert.ok(await knoepfe.count() > 1, 'Wechsler fehlt bei mehreren Bildern');
		const vorher = await page.locator('[data-ort-bild]').getAttribute('src');
		await knoepfe.nth(2).click();
		await page.waitForTimeout(250);
		const nachher = await page.locator('[data-ort-bild]').getAttribute('src');
		assert.notEqual(nachher, vorher, 'Klick wechselt das Bild nicht');
		assert.ok(await knoepfe.nth(2).evaluate(el => el.closest('li').classList.contains('ist-aktiv')),
			'aktive Zeile nicht markiert');

		// 8) A vendor inside a room: no map link, no route, and the planner says so.
		await page.goto(`${base}/de/haendler/7003DFFE/`);
		await page.locator('[data-reiter-knopf="wo"]').click();
		const ortszeile = await page.locator('.ort-name').first().textContent();
		assert.match(ortszeile, /Wachsamen Auge|Eyes and Guard|Yeux du Garde/,
			'Innenraum nicht benannt: ' + ortszeile);
		assert.equal(await page.locator('.ort-aktionen a').count(), 0,
			'toter Karten-/Routenlink steht noch auf der Seite');

		await page.goto(`${base}/de/reise/?nach=${encodeURIComponent('1.2S 50.7E')}`);
		await page.waitForTimeout(800);
		const reise = await page.locator('#reise-ergebnis').textContent();
		assert.ok(!/Hrimbarg/.test(reise || ''), 'Reiseplaner führt weiter nach Hrimbarg');
		assert.match(reise || '', /kein Stallmeister|keine Reise-Station/,
			'kein Hinweis auf fehlende Station: ' + reise);

		// 9) Phone: the tool row keeps one row and nothing sticks out.
		const klein = await browser.newContext({ viewport: { width: 390, height: 844 } });
		await klein.route('**/*', r => r.request().url().startsWith(base + '/') ? r.continue() : r.abort());
		const telefon = await klein.newPage();
		await telefon.goto(`${base}/de/karte/?vorkarte=${KARTE}&haendler=${HAENDLER}`);
		await telefon.locator('#mobil-reiter [data-pane="karte"]').click();
		await telefon.waitForSelector('.punkt.haendler', { state: 'attached' });
		const masse = await telefon.evaluate(() => {
			const kopf = document.querySelector('.kartenkopf').getBoundingClientRect();
			const leiste = document.querySelector('.kartenkopf-links').getBoundingClientRect();
			return { hoehe: Math.round(kopf.height), breite: Math.round(leiste.width),
				inhalt: document.querySelector('.kartenkopf-links').scrollWidth,
				schalter: document.getElementById('haendler-schalter').offsetParent !== null,
				seite: document.documentElement.scrollWidth };
		});
		assert.ok(masse.hoehe < 70, 'Werkzeugleiste bricht auf dem Handy um: ' + masse.hoehe);
		assert.ok(masse.inhalt <= masse.breite + 2, 'Werkzeugleiste läuft über: ' + JSON.stringify(masse));
		assert.equal(masse.schalter, false, 'Händler-Schalter steht auf dem Handy in der Leiste');
		assert.ok(masse.seite <= 390, 'Seite ist breiter als der Bildschirm');
		await klein.close();

		assert.deepEqual(errors, [], 'JavaScript-Fehler: ' + errors.join(' | '));
		console.log('Händlerkarte: Link, Schalter, Stapel, Innenraum, Reise und Handy ok');
	} finally {
		await browser.close();
	}
})().catch(fehler => { console.error(fehler); process.exit(1); });

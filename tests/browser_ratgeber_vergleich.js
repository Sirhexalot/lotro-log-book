'use strict';
/* Ratgeber-Vergleich: Bezugsstufe, Vergleichsart, Skalierung, Umschmieden.
 *
 *   node tests/browser_ratgeber_vergleich.js http://127.0.0.1:8817
 *
 * The import folder is synthesised: a level-123 hunter wearing a catalogue leg
 * piece whose item level is missing in the export (402 comes from the client
 * reference) and a legendary weapon. No personal export is read.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright');

const base = (process.argv[2] || process.env.LLB_URL || 'http://127.0.0.1:8817').replace(/\/$/, '');

const SUMMARY = `<?xml version="1.0" encoding="UTF-8"?>
<character name="Vergleich" server="Testserver" account="Testkonto" class="Hunter" race="hobbit" level="123" importDate="1795366744469"/>`;

const QUESTS = `<?xml version="1.0" encoding="UTF-8"?>
<questsStatus>
	<questStatus key="1879048193" name="Auftrag der Probe" state="COMPLETED" completionCount="1"/>
</questsStatus>`;

const GEAR = `<?xml version="1.0" encoding="UTF-8"?>
<character name="Vergleich" level="123" date="1795366744469" version="1">
	<equipment>
		<equipmentSlot name="LEGS">
			<item key="1879397603" name="Überhose des Helden" durability="51" instanceId="01"/>
		</equipmentSlot>
		<equipmentSlot name="MAIN_MELEE">
			<item key="1879424218" name="Jäger-Schwert der Legenden" level="415" durability="76" instanceId="02" dps="253.6"/>
		</equipmentSlot>
		<equipmentSlot name="OTHER_MELEE">
			<item key="1879397674" name="Dolch des Helden" durability="68" instanceId="03"/>
		</equipmentSlot>
	</equipment>
</character>`;

(async () => {
	const ordner = fs.mkdtempSync(path.join(os.tmpdir(), 'llb-vergleich-'));
	const toon = path.join(ordner, 'characters', 'toon-00002');
	fs.mkdirSync(toon, { recursive: true });
	fs.writeFileSync(path.join(toon, 'summary.xml'), SUMMARY);
	fs.writeFileSync(path.join(toon, 'questsStatus.xml'), QUESTS);
	fs.writeFileSync(path.join(toon, 'current.xml'), GEAR);

	const browser = await chromium.launch({ channel: 'chrome' });
	try {
		const context = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
		const page = await context.newPage();
		const fehler = [];
		page.on('pageerror', (e) => fehler.push(String(e)));

		await page.goto(base + '/de/spielstand/', { waitUntil: 'load' });
		await page.setInputFiles('#ordner', ordner);
		await page.waitForTimeout(3500);
		await page.goto(base + '/de/ratgeber/', { waitUntil: 'load' });
		await page.waitForTimeout(1500);

		const bereit = () => page.waitForFunction(
			() => !/laden|Loading|Chargement/.test(
				document.getElementById('rat-kandidaten-hinweis').textContent),
			{ timeout: 90000 });

		const oeffne = async (platz) => {
			await page.locator(`.rat-platz[data-platz="${platz}"]`).click();
			await page.waitForTimeout(300);
			await page.click('#rat-kandidaten-knopf');
			await bereit();
			return page.evaluate(() => ({
				stufe: document.getElementById('rat-detail-werte').textContent.trim().split('\n')[0],
				titel: document.getElementById('rat-kandidaten-titel').textContent,
				hinweis: document.getElementById('rat-kandidaten-hinweis').textContent,
				zeilen: Array.from(document.querySelectorAll('#rat-kandidaten-liste li'))
					.map((li) => li.textContent.trim())
			}));
		};

		/* The export has no item level for this piece; the client reference does. */
		const beine = await oeffne('LEGS');
		assert.match(beine.stufe, /402/, 'Bezugsstufe fehlt: ' + beine.stufe);
		assert.match(beine.stufe, /Referenz/, 'Herkunft der Stufe wird nicht genannt');
		assert.ok(beine.zeilen.length > 0, 'keine Vorschläge für die Beine');

		/* Die Zeilen sind die Entitätsdarstellung: Kopfzeile einmal, Symbolkachel,
		   Name, Meta, Stufenspalte – und kein Eignungs-Chip, weil er die
		   Mindeststufe misst und hier die Gegenstandsstufe zählt. */
		const form = await page.evaluate(() => ({
			kopf: document.querySelectorAll('#rat-kandidaten-liste .mql-row-heading').length,
			zeilen: document.querySelectorAll('#rat-kandidaten-liste .mql-row').length,
			symbole: Array.from(document.querySelectorAll('#rat-kandidaten-liste .mql-row'))
				.filter((li) => li.querySelector('.mql-row-icon')).length,
			namen: document.querySelectorAll('#rat-kandidaten-liste .mql-row-name').length,
			meta: document.querySelectorAll('#rat-kandidaten-liste .mql-row-meta').length,
			chips: document.querySelectorAll('#rat-kandidaten-liste .eignung-chip').length,
			anzahl: document.getElementById('rat-kandidaten-anzahl').textContent.trim(),
			werte: Array.from(document.querySelectorAll('#rat-kandidaten-liste .mql-row-value b'))
				.map((b) => Number(b.textContent.replace(/[^\d]/g, '')))
		}));
		assert.equal(form.kopf, 1, 'Kopfzeile nicht genau einmal');
		assert.equal(form.zeilen, 8, 'nicht acht Zeilen: ' + form.zeilen);
		assert.equal(form.namen, form.zeilen, 'Namensspalte fehlt');
		assert.equal(form.meta, form.zeilen, 'Meta-Zeile fehlt');
		assert.equal(form.symbole, form.zeilen, 'Symbolkachel fehlt');
		assert.equal(form.chips, 0, 'Eignungs-Chip widerspricht der Stufe');
		assert.match(form.anzahl, /^\d+ von \d+ /, 'Zähler fehlt: ' + form.anzahl);

		const stufen = form.werte;
		stufen.forEach((stufe) => assert.ok(stufe > 402,
			'Vorschlag ohne höhere Stufe: ' + stufe));
		// Der Client-Katalog führt für das Stück 474; wirksam sind bei Stufe 123
		// höchstens 411. Eine 474 wäre die alte, falsche Behauptung.
		stufen.forEach((stufe) => assert.ok(stufe < 474,
			'Katalog-Obergrenze statt wirksamer Stufe: ' + stufe));
		const namen = beine.zeilen.map((zeile) => zeile.split('·')[0].trim());
		assert.equal(new Set(namen).size, namen.length, 'doppelte Vorschläge: ' + namen.join(', '));

		/* Legendary: reforge, not a list of unrelated items. */
		const haupt = await oeffne('MAIN_MELEE');
		assert.match(haupt.titel, /Umschmieden/, 'kein Umschmieden-Hinweis');
		assert.match(haupt.hinweis, /126/, 'nächste Umschmiedestufe fehlt: ' + haupt.hinweis);
		assert.match(haupt.hinweis, /449/, 'nächste Gegenstandsstufe fehlt');
		assert.equal(haupt.zeilen.length, 0, 'legendäre Waffe bekommt eine Ersatzliste');

		/* A dagger in the client is EITHER_HAND: the off hand must offer items. */
		const neben = await oeffne('OTHER_MELEE');
		assert.ok(neben.zeilen.length > 0, 'Nebenhand bleibt leer');

		/* Mobile stays inside the screen. */
		await page.setViewportSize({ width: 390, height: 844 });
		assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1),
			false, 'Vergleich läuft mobil seitlich über');

		assert.deepEqual(fehler, [], 'JavaScript-Fehler: ' + fehler.join(' | '));
		console.log('Ratgeber-Vergleich: Bezugsstufe, Vergleichsart, Skalierung und Umschmieden ok');
	} finally {
		await browser.close();
		fs.rmSync(ordner, { recursive: true, force: true });
	}
})().catch((error) => { console.error(error); process.exitCode = 1; });

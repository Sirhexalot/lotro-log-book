'use strict';
/* Ratgeber: angelegte Ausrüstung, Taschen und Bank aus einem lokalen Import.
 *
 *   node tests/browser_ratgeber.js http://127.0.0.1:8817
 *
 * The import folder is synthesised here, so the test needs no personal export:
 * one character, two gear slots, two bag rows, an empty vault.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright');

const base = (process.argv[2] || process.env.LLB_URL || 'http://127.0.0.1:8817').replace(/\/$/, '');

const SUMMARY = `<?xml version="1.0" encoding="UTF-8"?>
<character name="Testchar" server="Testserver" account="Testkonto" class="Hunter" race="hobbit" level="42" importDate="1793686744469"/>`;

const QUESTS = `<?xml version="1.0" encoding="UTF-8"?>
<questsStatus>
	<questStatus key="1879048193" name="Auftrag der Probe" state="COMPLETED" completionCount="1"/>
</questsStatus>`;

const DEEDS = `<?xml version="1.0" encoding="UTF-8"?>
<deedsStatus>
	<deedStatus key="1879048194" name="Tat der Probe" state="COMPLETED" completionCount="1"/>
</deedsStatus>`;

const GEAR = `<?xml version="1.0" encoding="UTF-8"?>
<character name="Testchar" level="42" date="1793686744469" version="1">
	<equipment>
		<equipmentSlot name="HEAD">
			<item key="1879113729" name="Helm der Probe" level="42" minLevel="40" durability="100" instanceId="01" boundTo="02">
				<stats mode="AUTO">
					<defautStats><stat name="AGILITY" value="120"/></defautStats>
					<resultStats><stat name="AGILITY" value="120"/><stat name="MORALE" value="300"/></resultStats>
				</stats>
			</item>
		</equipmentSlot>
		<equipmentSlot name="MAIN_MELEE">
			<item key="1879113730" name="Testbogen" level="42" dps="12.5" maxDamage="30" instanceId="03">
				<legendary2>
					<socket index="0" traceryId="1879113731" traceryName="Wappen der Probe" itemLevel="45"/>
				</legendary2>
			</item>
		</equipmentSlot>
	</equipment>
</character>`;

const INVENTORY = `<?xml version="1.0" encoding="UTF-8"?>
<bags max="100">
	<status time="1793686744770"/>
	<slot index="0"><item key="1879113732" name="Ersatzbogen" instanceId="04"/></slot>
	<slot index="1" count="3"><item key="1879113733" name="Heiltrank" instanceId="05"/></slot>
</bags>`;

const VAULT = `<?xml version="1.0" encoding="UTF-8"?>
<vault used="0" max="0"/>`;

(async () => {
	const ordner = fs.mkdtempSync(path.join(os.tmpdir(), 'llb-ratgeber-'));
	const toon = path.join(ordner, 'characters', 'toon-00001');
	fs.mkdirSync(toon, { recursive: true });
	fs.writeFileSync(path.join(toon, 'summary.xml'), SUMMARY);
	fs.writeFileSync(path.join(toon, 'questsStatus.xml'), QUESTS);
	fs.writeFileSync(path.join(toon, 'deedsStatus.xml'), DEEDS);
	fs.writeFileSync(path.join(toon, 'current.xml'), GEAR);
	fs.writeFileSync(path.join(toon, 'inventory.xml'), INVENTORY);
	fs.writeFileSync(path.join(toon, 'characterVault.xml'), VAULT);

	const browser = await chromium.launch({ channel: 'chrome' });
	try {
		const context = await browser.newContext({ viewport: { width: 1280, height: 950 } });
		const page = await context.newPage();
		const fehler = [];
		page.on('pageerror', (e) => fehler.push(e.message));

		/* Without an import the page says what it needs. */
		await page.goto(base + '/de/ratgeber/', { waitUntil: 'load' });
		await page.waitForTimeout(500);
		assert.equal(await page.evaluate(() => document.getElementById('rat-ohne').hidden), false,
			'ohne Import fehlt der Hinweis');
		assert.equal(await page.evaluate(() => document.getElementById('rat-inhalt').hidden), true,
			'ohne Import zeigt die Seite trotzdem Inhalt');

		/* Import the synthesised folder, then read the page. */
		await page.goto(base + '/de/spielstand/', { waitUntil: 'load' });
		await page.setInputFiles('#ordner', ordner);
		await page.waitForTimeout(3500);
		await page.goto(base + '/de/ratgeber/', { waitUntil: 'load' });
		await page.waitForTimeout(800);

		const stand = await page.evaluate(() => ({
			name: document.getElementById('rat-name').textContent,
			klasse: document.getElementById('rat-klasse').textContent,
			plaetze: document.querySelectorAll('.rat-platz').length,
			belegt: document.querySelectorAll('.rat-platz.belegt').length,
			ohne: document.getElementById('rat-ohne').hidden }));
		assert.match(stand.name, /Testchar/, 'Charaktername fehlt');
		assert.match(stand.klasse, /Jäger|Hunter|Chasseur/, 'Klasse nicht übersetzt');
		assert.match(stand.klasse, /42/, 'Stufe fehlt');
		assert.equal(stand.ohne, true, 'Hinweis ohne Import bleibt sichtbar');
		assert.ok(stand.plaetze >= 21, 'Ausrüstungsplätze fehlen: ' + stand.plaetze);
		assert.equal(stand.belegt, 2, 'belegte Plätze falsch: ' + stand.belegt);

		/* A worn item shows its own values; the legendary one its traceries. */
		await page.locator('.rat-platz[data-platz="HEAD"]').click();
		await page.waitForTimeout(200);
		assert.equal(await page.locator('#rat-detail-text').innerText(), 'Helm der Probe');
		const werte = await page.locator('#rat-detail-werte li').allInnerTexts();
		assert.ok(werte.some((zeile) => /120/.test(zeile)), 'Werte des Helms fehlen');
		await page.locator('.rat-platz[data-platz="MAIN_MELEE"]').click();
		await page.waitForTimeout(200);
		assert.equal(await page.locator('#rat-detail-muster li').count(), 1, 'Muster fehlen');
		await page.click('#rat-kandidaten-knopf');
		await page.waitForFunction(() =>
			document.getElementById('rat-kandidaten-hinweis').textContent !== 'Gegenstände werden geladen …' &&
			document.getElementById('rat-kandidaten-hinweis').textContent !== 'Loading items …' &&
			document.getElementById('rat-kandidaten-hinweis').textContent !== 'Chargement des objets …',
		{ timeout: 30000 });
		assert.ok(await page.locator('#rat-kandidaten-liste li').count() > 0,
			'passende Gegenstände werden nicht vorgeschlagen');
		assert.match(await page.locator('#rat-kandidaten-liste a').first().getAttribute('href'),
			/^\/de\/gegenstand\/[A-F0-9]{8}\/$/, 'Vorschlag führt nicht zur Gegenstandsseite');
		assert.match(await page.locator('#rat-kandidaten-hinweis').innerText(), /Gegenstandsstufe/,
			'Vergleichsgrenze wird nicht erklärt');

		/* Bags: rows, then the search narrows them. */
		await page.click('[data-reiter-knopf="taschen"]');
		await page.waitForTimeout(300);
		/* The panel surface belongs to the tab component (`reiter.css`), so every
		   panel is framed and lifted off the page background. */
		const flaeche = await page.evaluate(() => {
			const btn = document.querySelector('.llb-reiter [aria-selected="true"]');
			const panel = document.getElementById(btn.getAttribute('aria-controls'));
			const stil = getComputedStyle(panel);
			return { rand: stil.borderTopWidth, ton: stil.backgroundColor,
				seite: getComputedStyle(document.body).backgroundColor };
		});
		assert.equal(flaeche.rand, '1px', 'Panel ohne Rahmen');
		assert.notEqual(flaeche.ton, 'rgba(0, 0, 0, 0)', 'Panel ohne Fläche');
		assert.notEqual(flaeche.ton, flaeche.seite, 'Panel hebt sich nicht vom Hintergrund ab');
		assert.equal(await page.locator('.rat-stueck').count(), 2, 'Taschenzeilen fehlen');
		await page.fill('#rat-suche-feld', 'Ersatz');
		await page.waitForTimeout(300);
		assert.equal(await page.locator('.rat-stueck').count(), 1, 'Suche grenzt nicht ein');
		await page.fill('#rat-suche-feld', 'gibtsnicht');
		await page.waitForTimeout(300);
		assert.equal(await page.evaluate(() => document.getElementById('rat-leer').hidden), false,
			'leere Suche meldet keinen Hinweis');

		/* The vault was read and is empty: say so instead of hiding it. */
		await page.locator('.rat-lagerknopf', { hasText: /Charakterbank|Character vault|Coffre/ }).click();
		await page.waitForTimeout(300);
		assert.equal(await page.evaluate(() => document.getElementById('rat-lager-hinweis').hidden), false,
			'leere Bank wird nicht erklärt');

		/* Mobile: one column, nothing wider than the screen. */
		await page.setViewportSize({ width: 390, height: 844 });
		await page.click('[data-reiter-knopf="ausruestung"]');
		await page.waitForTimeout(300);
		assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false,
			'Ratgeber läuft mobil seitlich über');

		assert.deepEqual(fehler, [], 'JavaScript-Fehler: ' + fehler.join(' | '));
		console.log('Ratgeber: Ausrüstungsvorschläge, Taschen, Bank und Suche ok');
	} finally {
		await browser.close();
		fs.rmSync(ordner, { recursive: true, force: true });
	}
})().catch((error) => { console.error(error); process.exitCode = 1; });

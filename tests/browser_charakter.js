#!/usr/bin/env node
/* End-to-end check of the character round trip, in a real browser.
 *
 * It drives Google Chrome over its debugging protocol: the import path
 * (MQL_SPEICHER.uebernimm), the backup download (sicherung), loading a backup
 * back (ladeSicherung) and the progress marker a catalogue page shows.
 *
 *    node tests/browser_charakter.js [http://127.0.0.1:8901]
 */
const { spawn } = require('node:child_process');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9333;
const basis = (process.argv[2] || 'http://127.0.0.1:8901').replace(/\/$/, '');

const profile = mkdtempSync(join(tmpdir(), 'llb-chrome-'));
const chrome = spawn(CHROME, [
  '--headless=new', '--remote-debugging-port=' + PORT, '--user-data-dir=' + profile,
  '--no-first-run', '--no-default-browser-check', '--disable-gpu', 'about:blank',
], { stdio: 'ignore' });

const warte = (ms) => new Promise((fertig) => setTimeout(fertig, ms));

async function ziel() {
  for (let i = 0; i < 60; i++) {
    try {
      const antwort = await fetch('http://127.0.0.1:' + PORT + '/json/list');
      const seiten = (await antwort.json()).filter((s) => s.type === 'page');
      if (seiten.length) return seiten[0].webSocketDebuggerUrl;
    } catch (fehler) { /* Chrome startet noch */ }
    await warte(250);
  }
  throw new Error('Chrome hat sich nicht gemeldet');
}

async function verbinde(url) {
  const ws = new WebSocket(url);
  await new Promise((fertig, scheitern) => {
    ws.onopen = fertig;
    ws.onerror = scheitern;
  });
  let nummer = 0;
  const offen = new Map();
  ws.onmessage = (ereignis) => {
    const nachricht = JSON.parse(ereignis.data);
    if (nachricht.id && offen.has(nachricht.id)) {
      const { fertig, scheitern } = offen.get(nachricht.id);
      offen.delete(nachricht.id);
      nachricht.error ? scheitern(new Error(nachricht.error.message)) : fertig(nachricht.result);
    }
  };
  const senden = (method, params = {}) => new Promise((fertig, scheitern) => {
    const id = ++nummer;
    offen.set(id, { fertig, scheitern });
    ws.send(JSON.stringify({ id, method, params }));
  });
  return { senden, schliessen: () => ws.close() };
}

async function main() {
  const seite = await verbinde(await ziel());
  await seite.senden('Page.enable');
  await seite.senden('Runtime.enable');

  const js = async (ausdruck) => {
    const ergebnis = await seite.senden('Runtime.evaluate', {
      expression: ausdruck, returnByValue: true, awaitPromise: true,
    });
    if (ergebnis.exceptionDetails) {
      throw new Error(ergebnis.exceptionDetails.text + ': ' + (ergebnis.exceptionDetails.exception?.description || ''));
    }
    return ergebnis.result.value;
  };
  // Wait for the real page instead of guessing a delay: navigation, load and
  // the script that writes the progress marker.
  const gehe = async (pfad) => {
    const ziel = basis + pfad;
    await seite.senden('Page.navigate', { url: ziel });
    for (let i = 0; i < 100; i++) {
      const stand = await js('({ url: location.href, fertig: document.readyState, '
        + 'marker: !!document.getElementById("katalog-status") '
        + '&& document.getElementById("katalog-status").dataset.done !== undefined })');
      if (stand.url === ziel && stand.fertig === 'complete'
          && (stand.marker || !ziel.includes('/de/'))) return;
      await warte(100);
    }
    throw new Error('Seite nicht bereit: ' + ziel);
  };

  const pruefungen = [];
  const pruefe = (name, echt, erwartet) => {
    const ok = JSON.stringify(echt) === JSON.stringify(erwartet);
    pruefungen.push({ name, ok, erwartet, echt });
    return ok;
  };

  // 1. Importseite lädt und der Speicher steht bereit.
  await gehe('/spielstand.html?lang=de');
  const bereit = await js('typeof window.MQL_SPEICHER === "object"');
  pruefe('Importseite lädt den Speicher', bereit, true);

  // 2. Ein Charakter kommt herein, wie aus Companion gelesen.
  const eintrag = `(() => {
    const neu = MQL_SPEICHER.uebernimm([{
      name: 'Testling', server: 'Gwaihir', account: 'konto', klasse: 'Hunter',
      level: '123', quests: ['70042F83', '7000006F'], deeds: ['70043FBD'],
      laufend: {}, ruf: [], handwerk: {}, rezepte: []
    }]);
    MQL_SPEICHER.setzeAktiv(MQL_SPEICHER.alle()[0].key);
    return neu;
  })()`;
  const importiert = await js(eintrag);
  // uebernimm meldet { ok, neu, aktualisiert }; je nach vorhandenem Eintrag
  // ist der Charakter neu oder wird aufgefrischt. Beides ist richtig.
  pruefe('Charakter übernommen',
    [importiert.ok, importiert.neu + importiert.aktualisiert], [true, 1]);

  // 3. Sicherung herunterladen (das ist der "Download" des Charakters).
  const sicherung = await js('MQL_SPEICHER.sicherung()');
  const inhalt = JSON.parse(sicherung);
  pruefe('Sicherung nennt Format und Version',
    [inhalt.format, inhalt.version], ['magic-quest-log-progress', 1]);
  pruefe('Sicherung enthält den Charakter', inhalt.charaktere.length, 1);

  // 4. Speicher leeren und die Sicherung wieder einlesen.
  const zurueck = await js(`(() => {
    localStorage.removeItem('mql.charaktere');
    return MQL_SPEICHER.ladeSicherung(${JSON.stringify(sicherung)});
  })()`);
  pruefe('Sicherung wieder eingelesen', zurueck, 1);

  // 5. Fortschritt auf einer Katalogseite (PHP) sichtbar.
  await gehe('/de/aufgabe/70042F83/');
  const erledigt = await js(`(() => {
    const el = document.getElementById('katalog-status');
    return { fertig: el.dataset.done, text: el.textContent.trim(), sichtbar: !el.hidden };
  })()`);
  pruefe('Aufgabe als erledigt markiert', [erledigt.fertig, erledigt.sichtbar, erledigt.text.includes('Testling')],
    ['true', true, true]);

  // 6. Eine nicht erledigte Aufgabe bleibt offen.
  await gehe('/de/aufgabe/700005BF/');
  const offen = await js(`(() => {
    const el = document.getElementById('katalog-status');
    return { fertig: el.dataset.done, text: el.textContent.trim() };
  })()`);
  pruefe('offene Aufgabe nicht als erledigt', offen.fertig, 'false');

  // 7. Tat aus derselben Sicherung.
  await gehe('/de/tat/70043FBD/');
  const tat = await js('document.getElementById("katalog-status").dataset.done');
  pruefe('Tat als erledigt markiert', tat, 'true');

  // 8. Charakterauswahl in der Kopfzeile.
  const auswahl = await js(`(() => {
    const s = document.getElementById('katalog-charakter');
    return s ? [...s.options].map(o => o.textContent) : null;
  })()`);
  pruefe('Charakter steht in der Auswahl', Array.isArray(auswahl) && auswahl.some((t) => t.includes('Testling')), true);

  // 9. Keine JavaScript-Fehler auf der Seite.
  const fehler = await js('window.__llbFehler ? window.__llbFehler.length : 0');
  pruefe('keine gemeldeten Seitenfehler', fehler, 0);

  seite.schliessen();
  let gescheitert = 0;
  for (const p of pruefungen) {
    if (!p.ok) gescheitert++;
    console.log((p.ok ? 'OK   ' : 'FEHL ').padEnd(5) + p.name + (p.ok ? '' : '\n      erwartet ' +
      JSON.stringify(p.erwartet) + ', bekommen ' + JSON.stringify(p.echt)));
  }
  console.log('\n%d Prüfungen, %d gescheitert', pruefungen.length, gescheitert);
  return gescheitert === 0 ? 0 : 1;
}

main()
function aufraeumen() {
  chrome.kill();
  // Chrome gibt das Profil erst kurz nach dem Signal frei.
  setTimeout(() => {
    try { rmSync(profile, { recursive: true, force: true }); } catch (fehler) { /* egal */ }
  }, 500);
}

main()
  .then((code) => { aufraeumen(); process.exit(code); })
  .catch((fehler) => {
    console.error('Abbruch:', fehler.message);
    aufraeumen();
    process.exit(2);
  });

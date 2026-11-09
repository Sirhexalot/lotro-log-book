#!/usr/bin/env node
/* Quick check of the application pages at their new addresses. */
const { spawn } = require('node:child_process');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9334;
const basis = (process.argv[2] || 'http://127.0.0.1:8901').replace(/\/$/, '');
const profile = mkdtempSync(join(tmpdir(), 'llb-apps-'));
const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=' + PORT,
  '--user-data-dir=' + profile, '--no-first-run', '--no-default-browser-check',
  '--disable-gpu', 'about:blank'], { stdio: 'ignore' });
const warte = (ms) => new Promise((f) => setTimeout(f, ms));

async function ws() {
  for (let i = 0; i < 60; i++) {
    try {
      const seiten = (await (await fetch('http://127.0.0.1:' + PORT + '/json/list')).json())
        .filter((s) => s.type === 'page');
      if (seiten.length) return seiten[0].webSocketDebuggerUrl;
    } catch (e) { /* startet noch */ }
    await warte(250);
  }
  throw new Error('Chrome meldet sich nicht');
}

async function main() {
  const socket = new WebSocket(await ws());
  await new Promise((f, s) => { socket.onopen = f; socket.onerror = s; });
  let nr = 0;
  const offen = new Map();
  socket.onmessage = (e) => {
    const n = JSON.parse(e.data);
    if (n.id && offen.has(n.id)) { const o = offen.get(n.id); offen.delete(n.id);
      n.error ? o.s(new Error(n.error.message)) : o.f(n.result); }
  };
  const senden = (method, params = {}) => new Promise((f, s) => {
    const id = ++nr; offen.set(id, { f, s }); socket.send(JSON.stringify({ id, method, params }));
  });
  await senden('Page.enable');
  await senden('Runtime.enable');
  const js = async (expr) => {
    const r = await senden('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
    return r.result.value;
  };
  const gehe = async (pfad) => {
    const ziel = basis + pfad;
    await senden('Page.navigate', { url: ziel });
    for (let i = 0; i < 400; i++) {
      const st = await js('({u:location.pathname,r:document.readyState})');
      if (st.u === new URL(ziel).pathname && st.r === 'complete') return;
      await warte(100);
    }
    throw new Error('nicht bereit: ' + ziel);
  };

  const zeilen = [];
  const pruefe = (name, wert) => zeilen.push([name, wert]);

  for (const pfad of ['/de/', '/de/karte/', '/de/karte/taten/', '/de/gegenstandssuche/',
    '/de/handwerk/rezepte/', '/de/reise/', '/de/ruf/', '/de/belohnungen/', '/de/spielstand/',
    '/de/companion/', '/de/plugin/', '/de/suche/', '/en/map/', '/fr/carte/']) {
    await gehe(pfad);
    const stand = await js(`(() => {
      const menue = [...document.querySelectorAll('#menue a')].map(a => a.getAttribute('href'));
      const alt = menue.filter(h => h && (h.includes('.html') || h.includes('?lang=')));
      return {
        sprache: document.documentElement.lang,
        menueLinks: menue.length,
        alteLinks: alt.length,
        titel: document.title,
        fehler: (window.__llb || []).length,
        kacheln: document.querySelectorAll('.landschaft-kachel').length,
        mangel: /nicht verfügbar|nicht verfÃ¼gbar/.test(document.body.textContent),
        bilder: document.querySelectorAll('img').length,
      };
    })()`);
    pruefe(pfad, stand);
  }

  for (const [pfad, stand] of zeilen) {
    const zeile = [pfad.padEnd(24), stand.sprache, 'Menülinks ' + stand.menueLinks,
      'alte Links ' + stand.alteLinks, 'Kacheln ' + stand.kacheln,
      stand.mangel ? 'MELDUNG' : 'ok', stand.titel.slice(0, 34)].join('  ');
    console.log(zeile);
  }
  const alt = zeilen.filter(([, s]) => s.alteLinks > 0 || s.menueLinks === 0);
  console.log('\n%d Seiten, %d mit alten Links oder ohne Menü', zeilen.length, alt.length);
  socket.close();
}

function ende(code) {
  chrome.kill();
  setTimeout(() => { try { rmSync(profile, { recursive: true, force: true }); } catch (e) {} }, 500);
  process.exit(code);
}
main().then(() => ende(0)).catch((f) => { console.error('Abbruch:', f.message); ende(2); });

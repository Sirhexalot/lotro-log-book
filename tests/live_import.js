#!/usr/bin/env node
'use strict';

/* Isolated progress/import round trip against the published application. */

const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const base = (process.env.LLB_BASE_URL || 'https://llb.sirhexalot.de').replace(/\/$/, '');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  await context.route(/googletagmanager|google-analytics|goatcounter/, route => route.abort());
  try {
    await page.goto(`${base}/de/spielstand/`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForFunction(() => typeof window.MQL_SPEICHER === 'object');
    const imported = await page.evaluate(() => window.MQL_SPEICHER.uebernimm([{
      name: 'Live-Testling',
      server: 'Testserver',
      account: 'isolated-account',
      klasse: 'Hunter',
      level: '123',
      quests: ['70042F83', '7000006F'],
      deeds: ['70043FBD'],
      laufend: {},
      ruf: [],
      handwerk: {},
      rezepte: [],
    }]));
    assert.equal(imported.ok, true, 'synthetic character import');
    assert.equal(await windowValue(page, 'MQL_SPEICHER.alle().length'), 1, 'isolated character count');

    const backup = await page.evaluate(() => window.MQL_SPEICHER.sicherung());
    const parsed = JSON.parse(backup);
    assert.deepEqual([parsed.format, parsed.version], ['magic-quest-log-progress', 1],
      'backup format');
    assert.equal(parsed.charaktere.length, 1, 'backup character count');

    const restored = await page.evaluate(value => {
      localStorage.removeItem('mql.charaktere');
      return window.MQL_SPEICHER.ladeSicherung(value);
    }, backup);
    assert.equal(restored, 1, 'backup restore');
    await page.goto(`${base}/de/aufgabe/70042F83/`, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    await page.waitForFunction(() => document.querySelector('#katalog-status')?.dataset.done);
    const status = await page.locator('#katalog-status').evaluate(node => ({
      done: node.dataset.done,
      visible: !node.hidden,
      text: node.textContent,
    }));
    assert.equal(status.done, 'true', 'completed quest status');
    assert.equal(status.visible, true, 'visible quest status');
    assert.match(status.text, /Live-Testling/);
    assert.deepEqual(errors, [], 'page errors');
    console.log('Importabnahme: isolierter Import, Sicherung, Wiederherstellung und Fortschrittsanzeige ok');
  } finally {
    await context.close();
    await browser.close();
  }
}

async function windowValue(page, expression) {
  return page.evaluate(source => Function(`return ${source}`)(), expression);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

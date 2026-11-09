/* Visitor copy: clear controls, complete translations and safe translated HTML.
 * Run with node tests/test_player_copy.js. No build or personal progress needed.
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const web = path.join(__dirname, '../web');
const context = { window: {} };
vm.createContext(context);
for (const file of ['texte.js', 'texte-spielstand.js', 'texte-logbuch.js', 'texte-site.js',
  'texte-companion.js', 'texte-plugin.js', 'texte-reise.js']) {
  vm.runInContext(fs.readFileSync(path.join(web, file), 'utf8'), context);
}
const texts = context.window.MQL_TEXTE;
const controls = {
  de: ['Spielstand importieren', 'Befehl kopieren', 'Companion-Ordner auswählen'],
  en: ['Import progress', 'Copy command', 'Select Companion folder'],
  fr: ['Importer la progression', 'Copier la commande', 'Choisir le dossier Companion']
};
for (const lang of ['de', 'en', 'fr']) {
  const copy = texts[lang];
  assert.deepEqual([copy.sp_titel, copy.sp_kopieren, copy.sp_ordner_waehlen], controls[lang]);
  assert.equal(copy.cp_kopieren, copy.sp_kopieren);
  for (const key of ['sp_mac', 'cp_mac']) {
    assert(copy[key].includes('⌘V'), `${lang}/${key}: paste instructions`);
    assert(copy[key].includes('Terminal'), `${lang}/${key}: name the program`);
    assert(copy[key].includes('LotRO Companion'), `${lang}/${key}: folder name`);
    assert(!/Wine|WINEPREFIX/.test(copy[key]), `${lang}/${key}: no Wine jargon`);
  }
  assert(!/build_daten\.py/.test(copy.keine_daten), `${lang}: developer error shown to player`);
  for (const [key, value] of Object.entries(copy)) {
    if (typeof value !== 'string') continue;
    const stack = [];
    for (const tag of value.matchAll(/<(\/?)([a-z][a-z0-9]*)\b[^>]*>/gi)) {
      const name = tag[2].toLowerCase();
      if (['br', 'img', 'input', 'hr'].includes(name)) continue;
      if (tag[1]) assert.equal(stack.pop(), name, `${lang}/${key}: mismatched HTML tag`);
      else stack.push(name);
    }
    assert.equal(stack.length, 0, `${lang}/${key}: unclosed HTML tag`);
  }
}
assert(!/\b(Tu|Ton|Ta)\b/.test(Object.values(texts.fr).join(' ')), 'French uses vous consistently');
console.log('PASS: player copy (DE/EN/FR controls, Mac instructions, errors and balanced HTML)');

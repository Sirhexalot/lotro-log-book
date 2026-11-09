/* Import and plugin pages: completion state, map navigation, and the split
 * between "load your progress" and "hand it to the plugin". No personal data.
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const web = path.join(__dirname, '../web');
const html = fs.readFileSync(path.join(web, 'spielstand.html'), 'utf8');
const pluginHtml = fs.readFileSync(path.join(web, 'plugin.html'), 'utf8');
const texts = { window: {} };
for (const name of ['texte-spielstand.js', 'texte-plugin.js']) {
  vm.runInNewContext(fs.readFileSync(path.join(web, name), 'utf8'), texts);
}

function page(language, characters) {
  function element() {
    return {
      hidden: false, children: [], events: {}, classList: { add() {}, remove() {} },
      appendChild(child) { this.children.push(child); },
      addEventListener(name, handler) { this.events[name] = handler; }
    };
  }
  const ids = {};
  for (const match of html.matchAll(/\bid="([^"]+)"/g)) ids[match[1]] = element();
  const window = {
    MQL_SPRACHE: language, MQL_COMPANION: {},
    MQL_T: key => texts.window.MQL_TEXTE[language][key] || key,
    MQL_SPEICHER: { alle: () => characters, aktiv: () => characters[0] },
    localStorage: { getItem: () => null, setItem() {} }, location: { href: '' }
  };
  const document = {
    getElementById(id) { assert.ok(ids[id], 'Unknown element: ' + id); return ids[id]; },
    querySelectorAll: () => [], createElement: element
  };
  vm.runInNewContext(fs.readFileSync(path.join(web, 'spielstand.js'), 'utf8'), {
    window, document, navigator: { platform: 'Win32' }
  });
  return { ids, window };
}

for (const language of ['de', 'en', 'fr']) {
  const copy = texts.window.MQL_TEXTE[language];
  for (const key of ['sp_voraussetzungen', 'sp_fertig', 'sp_zur_karte', 'sp_zum_plugin',
    'menue_plugin', 'menue_import_kurz', 'menue_suche_kurz']) {
    assert.ok(copy[key], language + ': missing ' + key);
  }
  for (const key of ['pl_titel', 'pl_install', 'pl_fortschritt', 'pl_schreiben', 'pl_zip',
    'pl_plugindata', 'pl_geschrieben', 'pl_ohne']) {
    assert.ok(copy[key], language + ': missing ' + key);
  }
  assert.ok(!/^\d\./.test(copy.sp_schritt4), language + ': plugin step still numbered');

  const empty = page(language, []);
  assert.equal(empty.ids['import-fertig'].hidden, true, language + ': completion shown without data');

  const loaded = page(language, [{
    key: 'test', name: 'Example', server: 'Example', klasse: 'Hunter', level: 1,
    quests: [], deeds: [], date: '2026-11-07'
  }]);
  assert.equal(loaded.ids['import-fertig'].hidden, false, language + ': no completion message');
  loaded.ids['fertig-karte'].events.click();
  assert.equal(loaded.window.location.href, 'index.html?lang=' + language);
  assert.equal(loaded.window.dataLayer, undefined, 'Viewing the guide must not count as an import');
}

// The plugin export lives on its own page; the import page only points there.
assert.ok(html.includes('data-ziel="plugin.html"'), 'Import page does not link to the plugin page');
for (const id of ['schreiben', 'zip', 'meldung-plugin', 'schreiben-hinweis']) {
  assert.ok(!html.includes('id="' + id + '"'), 'Import page still carries the plugin control: ' + id);
  assert.ok(pluginHtml.includes('id="' + id + '"'), 'Plugin page lacks: ' + id);
}
assert.ok(pluginHtml.includes('data-seite="plugin"'), 'Plugin page has no page marker');
assert.ok(pluginHtml.includes('texte-plugin.js'), 'Plugin page does not load its texts');

console.log('PASS: import and plugin pages (DE/EN/FR, completion, map link, split, no import event on view)');

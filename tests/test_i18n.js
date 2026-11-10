/* Run with node tests/test_i18n.js; no browser or game assets needed. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert/strict');
const root = path.join(__dirname, '..', 'web');
const context = { window: {} };
vm.createContext(context);
for (const file of ['texte.js', 'texte-spielstand.js', 'texte-logbuch.js', 'texte-site.js',
  'texte-companion.js', 'texte-plugin.js', 'texte-reise.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context);
}
const texts = context.window.MQL_TEXTE;
for (const lang of ['de', 'en', 'fr']) {
  assert.deepEqual(Object.keys(texts[lang]).sort(), Object.keys(texts.de).sort(), 'translation keys: ' + lang);
  for (const [key, value] of Object.entries(texts[lang])) {
    if (typeof value !== 'string') continue;
    assert(value.trim(), 'empty translation: ' + lang + '/' + key);
    assert.equal((value.match(/%s/g) || []).length, (String(texts.de[key]).match(/%s/g) || []).length,
      'placeholder mismatch: ' + lang + '/' + key);
  }
}
for (const file of fs.readdirSync(root).filter(f => f.endsWith('.html'))) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  if (!html.includes('sprache.js')) continue;
  assert(html.includes('texte-site.js'), file + ' must load shared page translations');
  for (const match of html.matchAll(/data-t(?:-html|-ph)?="([^"]+)"/g)) {
    if (match[1].startsWith('recht_')) continue; // Legal notice has its own inline translations.
    for (const lang of ['de', 'en', 'fr']) assert(match[1] in texts[lang], file + ': ' + lang + '/' + match[1]);
  }
}
for (const [lang, file] of [['de', 'start.html'], ['en', 'start-en.html'], ['fr', 'start-fr.html']]) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  assert.equal((html.match(/datetime="2026-11-09"/g) || []).length, 3, 'current dated news: ' + lang);
  const twig = fs.readFileSync(path.join(root, '../php/templates/app/start-' + lang + '.twig'), 'utf8');
  assert.equal(html.match(/<section class="neuigkeiten"[\s\S]*?<\/section>/)[0],
    twig.match(/<section class="neuigkeiten"[\s\S]*?<\/section>/)[0], 'PHP/static news parity: ' + lang);
  assert(html.includes('plugin.html?lang=' + lang), 'plugin guide link: ' + lang);
  assert(html.indexOf('class="einstieg"') < html.indexOf('class="bild"'), 'map entry before image: ' + lang);
  const counts = [...html.matchAll(/data-katalogzahl="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(counts, ['aufgaben', 'taten', 'gegenstaende', 'rezepte', 'titel', 'tugenden', 'stationen'],
    'build-managed catalogue counts: ' + lang);
  assert(!/JavaScript|\bID\b/.test(html), 'developer copy on landing page: ' + lang);
  assert.equal((html.match(/class="neuigkeit"/g) || []).length, 3, 'three news items: ' + lang);
}
assert.equal(texts.de.sp_titel, 'Spielstand importieren');
assert.equal(texts.en.sp_titel, 'Import progress');
assert.equal(texts.fr.sp_titel, 'Importer la progression');
const privacy = fs.readFileSync(path.join(root, 'datenschutz.html'), 'utf8');
for (const match of privacy.matchAll(/<p data-t-html="([^"]+)">([\s\S]*?)<\/p>/g)) {
  assert.equal(match[2], texts.de[match[1]], 'privacy must remain readable without JavaScript: ' + match[1]);
}
console.log('PASS: DE/EN/FR key parity, non-empty texts, placeholders, page bindings, news and import labels');

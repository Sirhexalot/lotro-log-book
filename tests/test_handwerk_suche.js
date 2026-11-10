/* Recipe filters and shareable state, without game data or a browser. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
class Element {
  constructor(tag) { this.tagName = tag; this.children = []; this.attributes = {}; this.events = {}; this.value = ''; this.classList = { toggle() {} }; }
  set textContent(value) { this.text = value; this.children = []; }
  get textContent() { return this.text || ''; }
  appendChild(node) { this.children.push(node); return node; }
  setAttribute(key, value) { this.attributes[key] = value; }
  getAttribute(key) { return this.attributes[key]; }
  addEventListener(key, fn) { this.events[key] = fn; }
}
function recipe(name, profession, tier, category, id) {
  return [name, 1, 1, profession, 'Tier ' + tier, category, [], [], '', profession,
    id, tier, 0, 0];
}
function page(query = '', character = null) {
  const root = new Element('div');
  function find(node, id) { return node.id === id ? node : node.children.map(n => find(n, id)).find(Boolean); }
  const location = new URL('http://localhost/de/handwerk/rezepte/' + query);
  const data = [recipe('Bow', 'WOODWORKER', 1, 'Weapons', '70000001'),
    recipe('Staff', 'WOODWORKER', 2, 'Weapons', '70000002'),
    recipe('Meal', 'COOK', 1, 'Food', '70000003')];
  const window = { MQL_T: key => key, MQL_ERSETZE: (key, values) => values.join('/'),
    MQL_SPRACHE: 'en', MQL_REZEPTE: {r: data}, MQL_SPEICHER: {aktiv: () => character}, location };
  const document = {getElementById: id => id === 'rezepte-liste' ? root : find(root, id),
    createElement: tag => new Element(tag), createTextNode: text => new Element(text), querySelectorAll: () => []};
  vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname, '../web/rezepte.js'), 'utf8'), {
    window, document, location, URL, URLSearchParams,
    history: {replaceState(_a, _b, url) { location.href = new URL(url, location.href).href; }}
  });
  return {root, get: id => find(root, id), location};
}
const view = page('?beruf=WOODWORKER');
assert.equal(view.get('rezept-anzahl').textContent, '2');
view.get('rezept-suche').value = 'Meal';
view.get('rezept-suche').events.input();
assert.equal(view.get('rezept-anzahl').textContent, '0', 'Search must keep profession');
assert.equal(view.location.searchParams.get('beruf'), 'WOODWORKER');
assert.equal(view.location.searchParams.get('q'), 'Meal');
const restored = page('?beruf=WOODWORKER&stufe=2&kategorie=Weapons');
assert.equal(restored.get('rezept-anzahl').textContent, '1');
assert.equal(restored.location.searchParams.get('stufe'), '2');
const own = page('?fehlend=1', {rezepte: ['70000001'], handwerk: {WOODWORKER: []}});
assert.equal(own.get('rezept-anzahl').textContent, '1', 'Only missing recipes of own professions');
assert.equal(own.location.searchParams.get('eigene'), '1');
const all = page();
assert.equal(all.get('rezept-anzahl').textContent, '3');
console.log('PASS: crafting search combines filters, restores URLs, and respects known recipes');

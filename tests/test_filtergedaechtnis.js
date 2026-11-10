/* The filter memory keeps one query string per list and language. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const code = fs.readFileSync(path.join(__dirname, '../web/filtergedaechtnis.js'), 'utf8');

function storage() {
  const data = new Map();
  return {
    data,
    getItem: key => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => { data.set(key, String(value)); },
    removeItem: key => { data.delete(key); }
  };
}

const local = storage();
const window = {localStorage: local};
vm.runInNewContext(code, {window});
const memory = window.MQL_FILTER;

assert.equal(memory.read('gegenstaende', 'de'), '', 'empty at start');
memory.write('gegenstaende', 'de', 'q=Schwert&sort=stufe');
assert.equal(memory.read('gegenstaende', 'de'), 'q=Schwert&sort=stufe');
assert.equal(memory.read('gegenstaende', 'en'), '', 'languages stay apart');
assert.equal(memory.read('auftraggeber', 'de'), '', 'lists stay apart');

// The stored value is a JSON object, not a raw string.
assert.match(local.data.get('mql.filter.gegenstaende.de'), /^\{"q":/);

memory.clear('gegenstaende', 'de');
assert.equal(memory.read('gegenstaende', 'de'), '');

// Broken values and a refusing storage never break the list.
local.setItem('mql.filter.rezepte.de', 'not json');
assert.equal(memory.read('rezepte', 'de'), '');
const blocked = {
  getItem() { throw new Error('blocked'); },
  setItem() { throw new Error('quota'); },
  removeItem() { throw new Error('blocked'); }
};
const second = {localStorage: blocked};
vm.runInNewContext(code, {window: second});
assert.equal(second.MQL_FILTER.read('rezepte', 'de'), '');
second.MQL_FILTER.write('rezepte', 'de', 'q=Ring');
assert.equal(second.MQL_FILTER.read('rezepte', 'de'), '');
second.MQL_FILTER.clear('rezepte', 'de');

console.log('PASS: filter memory (per list and language, clear, broken/blocked storage)');

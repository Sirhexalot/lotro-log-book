/* Manual quest/deed status storage, without a browser. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

let value = null;
let charaktereLesen = 0;
const listeners = {};
const context = {
  addEventListener: (name, listener) => { listeners[name] = listener; },
  localStorage: {
    getItem: (key) => {
      if (key === 'mql.charaktere') charaktereLesen += 1;
      return value;
    },
    setItem: (key, next) => { assert.equal(key, 'mql.charaktere'); value = next; },
    removeItem: () => {}
  }
};
vm.runInNewContext(fs.readFileSync('web/speicher.js', 'utf8'), context);
const store = context.MQL_SPEICHER;

assert.equal(store.aktiv(), null);
assert.ok(store.aktiviereManuell('Manual'));
assert.equal(store.aktiv().manuellOnly, true);
assert.equal(store.status('quests', '70000009'), null);
assert.equal(store.setzeStatus('quests', '70000009', 'fertig'), true);
assert.equal(store.status('quests', '70000009'), 'fertig');
assert.equal(store.entferneManuellenStatus('quests', '70000009'), true);
assert.equal(store.status('quests', '70000009'), null);
store.entferne('manual');

const q = '70000001';
const d = '70000002';
store.uebernimm([{
  key: 'a|s|A', name: 'A', server: 's', account: 'a',
  importMeta: { quests: true, deeds: true },
  quests: [q], deeds: [], laufend: {}, ruf: [], handwerk: {}
}]);
assert.equal(store.importStatus('quests', q), 'fertig');
assert.equal(store.status('quests', d), 'offen');
assert.equal(store.setzeStatus('quests', q, 'offen'), true);
assert.equal(store.status('quests', q), 'offen');
assert.equal(store.manuelleStatus('quests', q), 'offen');
const lesungenVorStatusabfragen = charaktereLesen;
for (let i = 0; i < 100; i += 1) {
  assert.equal(store.manuelleStatus('quests', q), 'offen');
}
assert.equal(charaktereLesen, lesungenVorStatusabfragen,
  'repeated status lookups reuse the parsed character data');
assert.equal(store.setzeStatus('deeds', d, 'laufend'), true);
assert.equal(store.status('deeds', d), 'laufend');
assert.equal(store.entferneManuellenStatus('deeds', d), true);
assert.equal(store.status('deeds', d), 'offen');

// A quest import replaces only quest manual statuses; deed statuses survive.
store.setzeStatus('quests', q, 'laufend');
store.setzeStatus('deeds', d, 'fertig');
store.uebernimm([{
  key: 'a|s|A', name: 'A', server: 's', account: 'a',
  importMeta: { quests: true, deeds: false },
  quests: [], deeds: [], laufend: {}, ruf: [], handwerk: {}
}]);
assert.equal(store.manuelleStatus('quests', q), null);
assert.equal(store.manuelleStatus('deeds', d), 'fertig');
assert.equal(store.status('quests', q), 'offen');
assert.equal(store.status('deeds', d), 'fertig');

// A backup keeps manual statuses, while an old backup without the field works.
const backup = store.sicherung();
store.entferneManuellenStatus('deeds', d);
assert.equal(store.ladeSicherung(backup), 1);
assert.equal(store.manuelleStatus('deeds', d), 'fertig');
assert.equal(store.ladeSicherung(JSON.stringify({
  format: 'magic-quest-log-progress', version: 1, charaktere: [{
    key: 'b|s|B', name: 'B', server: 's', account: 'b', quests: [q], deeds: []
  }]
})), 1);

// A change made in another tab invalidates the parsed snapshot exactly once.
value = JSON.stringify({
  aktiv: 'external|server|External',
  liste: {
    'external|server|External': {
      key: 'external|server|External', name: 'External', server: 'server',
      quests: [], deeds: [], rezepte: [], laufend: {}, ruf: [], handwerk: {}
    }
  }
});
listeners.storage({ key: 'mql.charaktere' });
const lesungenVorExternerAenderung = charaktereLesen;
assert.equal(store.aktiv().name, 'External');
assert.equal(charaktereLesen, lesungenVorExternerAenderung + 1);
assert.equal(store.aktiv().name, 'External');
assert.equal(charaktereLesen, lesungenVorExternerAenderung + 1,
  'external changes are parsed once, then cached');

console.log('PASS: speicher.js manual status precedence, scoped imports and backups');

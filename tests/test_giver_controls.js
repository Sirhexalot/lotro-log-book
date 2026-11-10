/* Imported progress on a quest-giver page: marks, counts, hide toggle. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const code = fs.readFileSync(path.join(__dirname, '../web/auftraggeber.js'), 'utf8');

function build(questIds) {
  const rows = questIds.map(id => {
    const state = {textContent: '', title: '', hidden: true};
    return {
      attrs: {'data-quest': id},
      state,
      getAttribute(name) { return this.attrs[name]; },
      setAttribute(name, value) { this.attrs[name] = String(value); },
      querySelector(selector) { return selector === '.giver-state' ? state : null; }
    };
  });
  const classes = new Set();
  const input = {checked: false};
  const toggle = {
    hidden: true, handlers: {},
    querySelector(selector) { return selector === 'input' ? input : null; },
    addEventListener(name, fn) { this.handlers[name] = fn; }
  };
  const progress = {textContent: '', hidden: true};
  const list = {querySelectorAll: selector => (selector === 'li[data-quest]' ? rows : [])};
  const box = {
    attrs: {
      'data-done-label': 'Erledigt',
      'data-open-label': 'Nicht als erledigt importiert',
      'data-progress': '%s von %s als erledigt importiert',
      'data-unknown': 'Kein Charakter importiert – der Abschluss ist nicht bekannt.',
      'data-hide-label': 'Erledigte ausblenden'
    },
    classList: {
      toggle(name, on) { if (on === undefined ? !classes.has(name) : on) { classes.add(name); } else { classes.delete(name); } },
      remove(name) { classes.delete(name); },
      contains(name) { return classes.has(name); }
    },
    getAttribute(name) { return this.attrs[name]; },
    querySelector(selector) {
      return {'.giver-list': list, '.giver-progress': progress, '.giver-hide': toggle}[selector] || null;
    }
  };
  return {box, rows, progress, toggle, input};
}

const page = build(['70000003', '70000004']);
let active = null;
const documentEvents = {};
const windowEvents = {};
const store = {aktiv: () => active};

vm.runInNewContext(code, {
  window: {MQL_SPEICHER: store, addEventListener: (name, fn) => { windowEvents[name] = fn; }},
  document: {
    querySelector: selector => (selector === '.giver-quests' ? page.box : null),
    addEventListener: (name, fn) => { documentEvents[name] = fn; }
  }
});

// No character: rows stay open, nothing is claimed, no dot column.
assert.equal(page.rows[0].attrs['data-state'], 'open');
assert.equal(page.rows[0].state.hidden, true);
assert.equal(page.progress.textContent, page.box.attrs['data-unknown']);
assert.equal(page.toggle.hidden, true);

// A character with one finished quest: one mark, the counter, the toggle.
active = {quests: ['70000003']};
documentEvents.change({target: {id: 'katalog-charakter'}});
assert.equal(page.rows[0].attrs['data-state'], 'done');
assert.equal(page.rows[1].attrs['data-state'], 'open');
assert.equal(page.rows[0].state.textContent, '✓');
assert.equal(page.rows[1].state.textContent, '·');
assert.equal(page.rows[0].state.hidden, false);
assert.equal(page.progress.textContent, '1 von 2 als erledigt importiert');
assert.equal(page.toggle.hidden, false);

// Hide completed quests.
page.toggle.handlers.change({target: {checked: true}});
assert.equal(page.box.classList.contains('giver-hide-done'), true);

// Removing the character resets marks and hiding.
active = null;
documentEvents.change({target: {id: 'katalog-charakter'}});
assert.equal(page.rows[0].attrs['data-state'], 'open');
assert.equal(page.progress.textContent, page.box.attrs['data-unknown']);
assert.equal(page.toggle.hidden, true);
assert.equal(page.box.classList.contains('giver-hide-done'), false);
assert.equal(page.input.checked, false);

// A storage event from another tab also re-renders.
active = {quests: ['70000004']};
windowEvents.storage({key: 'mql.charaktere'});
assert.equal(page.rows[1].attrs['data-state'], 'done');
assert.equal(page.progress.textContent, '1 von 2 als erledigt importiert');

console.log('PASS: giver progress (marks, counter, hide toggle, character switch, storage)');

/* Contextual recipe lists use the shared result row; the crafting page itself
 * renders the shared table (browser_handwerk_tabelle.js checks that). */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class Element {
  constructor(tag) { this.tagName = tag; this.children = []; this.className = ''; }
  appendChild(child) { this.children.push(child); return child; }
}

const root = new Element('div');
let renderedRows;
let rendered = false;
let rowOptions;
const data = [[
  '24 Months Aged Erebor Ham', 4, 373, 'Cook', 'Ironfold', 'Trail Food',
  [], [], '', 'COOK', '70051F89', 12, 0, 7, 0, 7, 1092395606
]];
const ui = {
  words: {professionLevel: 'Crafting tier', resultLevel: 'Result item level'},
  recipeHasProgressData: () => false,
  recipeHelp: () => '',
  header(list) {
    const header = new Element('li');
    list.appendChild(header);
  },
  row(_list, options) {
    rowOptions = options;
    return new Element('li');
  }
};
const window = {
  MQL_T: key => key,
  MQL_SPRACHE: 'en',
  MQL_REZEPTE: {r: data},
  MQL_SPEICHER: {aktiv: () => null},
  MQL_TREFFERZEILE: ui,
  MQL_HANDWERK_FILTER: {
    recipes(rows) {
      rendered = rows;
      renderedRows = window.MQL_RECIPE_CONTEXT_RESULTS(rows);
    }
  }
};
const document = {
  getElementById: id => id === 'rezepte-liste' ? root : null,
  createElement: tag => new Element(tag)
};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../web/rezepte.js'), 'utf8'), {
  window, document, URL
});

assert.deepEqual(rendered, data, 'the page hands its rows to the crafting filter');
assert.equal(renderedRows.className, 'mql-row-list');
assert.equal(rowOptions.name, data[0][0]);
assert.equal(rowOptions.meta, 'Cook');
assert.equal(rowOptions.image, data[0][16]);
assert.equal(rowOptions.href, '/en/recipe/70051F89/');
assert.deepEqual(
  JSON.parse(JSON.stringify(rowOptions.values)),
  [
    {label: 'Crafting tier', value: 'Ironfold'},
    {label: 'Result item level', value: 373}
  ]
);
console.log('PASS: contextual recipe lists use shared rows with profession and labelled levels');

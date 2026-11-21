/* Every row keeps the columns declared by its shared list header. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class Element {
  constructor(tag) {
    this.tagName = tag;
    this.children = [];
    this.attributes = {};
    this._className = '';
    this.classList = {
      add: value => {
        const classes = new Set(this._className.split(/\s+/).filter(Boolean));
        classes.add(value);
        this._className = Array.from(classes).join(' ');
      },
      contains: value => this._className.split(/\s+/).includes(value)
    };
  }
  set className(value) { this._className = value; }
  get className() { return this._className; }
  appendChild(child) { this.children.push(child); return child; }
  setAttribute(name, value) { this.attributes[name] = value; }
}

const document = {
  documentElement: {lang: 'de'},
  createElement: tag => new Element(tag)
};
const window = {};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../web/treffer-zeile.js'), 'utf8'), {
  window, document
});

const withProgress = new Element('ul');
window.MQL_TREFFERZEILE.header(withProgress, {progress: true});
const missingStatus = window.MQL_TREFFERZEILE.row(withProgress, {
  icon: 'gegenstand', name: 'Unknown status', values: [], progress: null
});
assert.ok(!missingStatus.classList?.contains('mql-row-no-progress'));
assert.equal(missingStatus.children.at(-1).className, 'mql-row-progress');
assert.equal(missingStatus.children.at(-1).attributes['aria-hidden'], 'true');

const withoutProgress = new Element('ul');
window.MQL_TREFFERZEILE.header(withoutProgress, {progress: false});
const noProgressRow = window.MQL_TREFFERZEILE.row(withoutProgress, {
  icon: 'gegenstand', name: 'No progress column', values: [], progress: null
});
assert.ok(noProgressRow.className.includes('mql-row-no-progress'));
assert.ok(!noProgressRow.children.some(child => child.className === 'mql-row-progress'));

console.log('PASS: shared result rows keep the header column grid consistent');

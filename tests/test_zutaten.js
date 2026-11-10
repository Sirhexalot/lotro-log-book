/* Provenance is lazy, same-origin, cached per stable item URL and retryable. */
'use strict';
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
class Element {
  constructor() { this.children = []; this.events = {}; this.open = false; }
  appendChild(child) { this.children.push(child); }
  addEventListener(event, fn) { this.events[event] = fn; }
  setAttribute() {}
  set textContent(value) { this.text = value; this.children = []; }
  get textContent() { return this.text; }
  querySelector() { return null; }
}
async function tick() { await new Promise(resolve => setImmediate(resolve)); }
(async () => {
  for (const lang of ['de', 'en', 'fr']) {
    const calls = [];
    let fail = false;
    const window = {};
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../web/zutaten.js'), 'utf8'), {
      window, URL, Map, document: {documentElement: {lang}, createElement: () => new Element(), querySelectorAll: () => []},
      location: {origin: 'https://example.org', href: 'https://example.org/de/handwerk/rezepte/'},
      fetch: async (url, options) => { calls.push({url, options}); return {ok: !fail, status: fail ? 503 : 200, text: async () => '<html></html>'}; },
      DOMParser: class { parseFromString() { return {querySelectorAll: () => []}; } }
    });
    const first = window.MQL_ZUTATEN_HERKUNFT('/de/gegenstand/70003975/');
    assert.equal(calls.length, 0, 'Creating a hint must not load anything');
    first.open = true; first.events.toggle(); await tick();
    assert.equal(calls.length, 1);
    assert.equal(calls[0].options.credentials, 'omit');
    const second = window.MQL_ZUTATEN_HERKUNFT('/de/gegenstand/70003975/');
    second.open = true; second.events.toggle(); await tick();
    assert.equal(calls.length, 1, 'Repeated ingredient must reuse the source request');
    const external = window.MQL_ZUTATEN_HERKUNFT('https://elsewhere.org/item');
    external.open = true; external.events.toggle(); await tick();
    assert.equal(calls.length, 1, 'Do not fetch external links');
    fail = true;
    const retry = window.MQL_ZUTATEN_HERKUNFT('/de/gegenstand/70000001/');
    retry.open = true; retry.events.toggle(); await tick();
    fail = false;
    retry.open = false; retry.events.toggle(); retry.open = true; retry.events.toggle(); await tick();
    assert.equal(calls.length, 3, 'Failed requests must be retryable');
  }
  console.log('PASS: ingredient provenance (DE/EN/FR, lazy, cached, same-origin, no credentials, retry)');
})().catch(error => { console.error(error); process.exitCode = 1; });

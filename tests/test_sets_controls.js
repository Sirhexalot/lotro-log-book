/* Checkbox changes request filtered results immediately; stale requests abort. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const code = fs.readFileSync(path.join(__dirname, '../web/sets.js'), 'utf8');

for (const lang of ['de', 'en', 'fr']) {
  const events = {}, windowEvents = {}, requests = [];
  const filters = {open: true};
  const apply = {hidden: false};
  let valid = true;
  const form = {
    action: 'https://example.org/' + lang + '/' + (lang === 'fr' ? 'ensemble' : 'set') + '/',
    values: [['q', 'Umbar'], ['class[]', 'Hunter'], ['from', ''], ['to', '']],
    querySelector: () => apply,
    addEventListener: (name, fn) => { events[name] = fn; },
    reportValidity: () => valid, setAttribute() {}, removeAttribute() {}
  };
  const location = {href: form.action + '?page=2'};
  const window = {fetch: true, AbortController, matchMedia: () => ({matches: false, addEventListener() {}}),
    addEventListener: (name, fn) => { windowEvents[name] = fn; }};
  vm.runInNewContext(code, {
    window, location, URL, AbortController,
    FormData: class { constructor(f) { this.f = f; } forEach(fn) { this.f.values.forEach(([name, value]) => fn(value, name)); } },
    document: {querySelector: selector => selector === '.sets-filters' ? filters : form},
    fetch: (url, options) => { requests.push({url: new URL(url), signal: options.signal}); return new Promise(() => {}); }
  });
  assert.equal(apply.hidden, true, 'No Apply button with enhanced filtering');
  events.change({target: {matches: () => true}});
  assert.equal(requests.length, 1, 'Checkbox must request results immediately');
  assert.deepEqual(requests[0].url.searchParams.getAll('class[]'), ['Hunter']);
  assert.equal(requests[0].url.searchParams.has('page'), false, 'Changed filters start on page one');
  assert.equal(requests[0].url.searchParams.has('from'), false, 'Omit empty fields');
  form.values.push(['armour[]', 'MEDIUM']);
  events.change({target: {matches: () => true}});
  assert.equal(requests[0].signal.aborted, true, 'Do not let older results replace newer results');
  assert.equal(requests[1].url.searchParams.get('armour[]'), 'MEDIUM');
  valid = false;
  events.change({target: {matches: () => true}});
  assert.equal(requests.length, 2, 'Invalid range must not send a request');
  events.submit();
  assert.equal(requests[1].signal.aborted, true, 'Native search submission cancels in-flight filtering');
  location.href = form.action;
  windowEvents.popstate();
  assert.equal(requests[2].url.search, '', 'Back navigation restores URL filters');
}
console.log('PASS: immediate set filters (DE/EN/FR, no Apply, abort stale results, reset pagination, back navigation)');

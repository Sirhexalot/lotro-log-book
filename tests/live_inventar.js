#!/usr/bin/env node
'use strict';

/*
 * Compare the published sitemap inventory with the build inventory.
 *
 * Usage:
 *   NODE_PATH="$(npm root -g)" node tests/live_inventar.js
 *   NODE_PATH="$(npm root -g)" node tests/live_inventar.js --status
 *
 * --status additionally requests every published entity URL. This is
 * deliberately opt-in because the current inventory contains more than
 * 280,000 URLs.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const base = (process.env.LLB_BASE_URL || 'https://llb.sirhexalot.de').replace(/\/$/, '');
const dataDir = process.env.LLB_PHP_DATA
  || process.env.LLB_DATA
  || path.join(process.env.HOME, '.cache/llb-php/phpdata');
const statusCheck = process.argv.includes('--status');
const sitemapNs = 'http://www.sitemaps.org/schemas/sitemap/0.9';

async function text(url) {
  const response = await fetch(url);
  assert.equal(response.status, 200, `Sitemap HTTP ${response.status}: ${url}`);
  return response.text();
}

function locations(xml) {
  return [...xml.matchAll(new RegExp(`<loc>([^<]+)</loc>`, 'g'))].map(match => match[1]);
}

async function readLiveSitemaps() {
  const queue = [base + '/sitemap.xml'];
  const sitemapUrls = new Set();
  const pageUrls = new Set();
  while (queue.length) {
    const sitemap = queue.shift();
    if (sitemapUrls.has(sitemap)) continue;
    sitemapUrls.add(sitemap);
    const found = locations(await text(sitemap));
    for (const url of found) {
      if (url.endsWith('.xml')) queue.push(url);
      else pageUrls.add(url);
    }
  }
  return { sitemapUrls, pageUrls };
}

function readBuildUrls() {
  const file = path.join(dataDir, 'sitemaps.json');
  const sections = JSON.parse(fs.readFileSync(file, 'utf8')).sections;
  const urls = [];
  for (const values of Object.values(sections)) {
    for (const value of values) urls.push(base + value);
  }
  return urls;
}

async function checkStatuses(urls) {
  const failures = [];
  let next = 0;
  async function worker() {
    while (true) {
      const index = next++;
      if (index >= urls.length) return;
      try {
        const response = await fetch(urls[index], { method: 'HEAD' });
        if (response.status !== 200) failures.push(`${response.status} ${urls[index]}`);
      } catch (error) {
        failures.push(`${error.message} ${urls[index]}`);
      }
      if ((index + 1) % 10000 === 0) console.log(`Status: ${index + 1}/${urls.length}`);
    }
  }
  await Promise.all(Array.from({ length: 8 }, worker));
  return failures;
}

async function main() {
  assert.ok(fs.existsSync(dataDir), `Build inventory missing: ${dataDir}`);
  const buildUrls = readBuildUrls();
  const buildSet = new Set(buildUrls);
  assert.equal(buildUrls.length, buildSet.size, 'duplicate build URLs');
  const live = await readLiveSitemaps();
  const missingLive = buildUrls.filter(url => !live.pageUrls.has(url));
  const unexpectedLive = [...live.pageUrls].filter(url => !buildSet.has(url));
  assert.deepEqual(missingLive, [], 'build URLs missing from live sitemap');
  assert.deepEqual(unexpectedLive, [], 'unexpected URLs in live sitemap');
  console.log(`Inventar: ${buildUrls.length} URLs, ${live.sitemapUrls.size} Sitemaps, 0 Abweichungen`);
  if (statusCheck) {
    const failures = await checkStatuses(buildUrls);
    console.log(`Statusprüfung: ${buildUrls.length} URLs, ${failures.length} Fehler`);
    failures.slice(0, 100).forEach(failure => console.error(`- ${failure}`));
    if (failures.length) process.exitCode = 1;
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

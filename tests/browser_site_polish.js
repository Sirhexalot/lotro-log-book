/* Pass this file to playwright-cli run-code after opening web/start.html or
 * dist-web/start.html. Checks the same pages in all three languages. */
async page => {
  const base = new URL('.', page.url()).href;
  // A character left over from an earlier run would change the crafting page.
  await page.evaluate(() => localStorage.removeItem('mql.charaktere'));
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  const results = [];
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const lang of ['de', 'en', 'fr']) {
    for (const name of ['start', 'spielstand', 'ruf', 'handwerk', 'belohnungen', 'datenschutz', 'impressum', 'index']) {
      const file = name === 'start' && lang !== 'de' ? 'start-' + lang : name;
      await page.goto(base + file + '.html?lang=' + lang);
      await page.waitForSelector('#menue a');
      await page.waitForSelector('footer a');
      if (name === 'index') await page.waitForSelector('.landschaft-kachel');
      const report = await page.evaluate(() => {
        const missing = [...document.querySelectorAll('[data-t],[data-t-html]')].filter(el => {
          const key = el.dataset.t || el.dataset.tHtml;
          return window.MQL_T(key) === key;
        }).map(el => el.dataset.t || el.dataset.tHtml);
        const small = [...document.querySelectorAll('main *, .kopf *, footer *')].filter(el =>
          !el.children.length && el.textContent.trim() && el.getBoundingClientRect().width &&
          parseFloat(getComputedStyle(el).fontSize) < 14
        ).map(el => el.tagName + '.' + el.className);
        return { lang: document.documentElement.lang, title: document.title, missing, small,
          footer: [...document.querySelectorAll('footer a')].map(a => a.textContent),
          overflow: document.documentElement.scrollWidth > innerWidth + 1 };
      });
      if (report.lang !== lang || report.missing.length || report.small.length ||
          report.footer.length !== 2 || report.overflow) throw Error(JSON.stringify({ name, lang, report }));
      if (name === 'start') {
        const action = await page.locator('.einstieg .knopf').first().boundingBox();
        if (action.y + action.height > 900) throw Error('Map action below the fold: ' + lang);
        await page.screenshot({ path: 'output/playwright/start-polish-' + lang + '.png' });
      }
      if (name === 'belohnungen') {
        await page.waitForSelector('.bl-karte');
        const reward = await page.evaluate(() => ({
          virtues: document.querySelectorAll('.bl-karte').length,
          label: document.getElementById('bl-anzahl').innerText,
          title: document.title,
        }));
        if (reward.virtues < 15 || !/Belohnungen|Rewards|Récompenses/.test(reward.title)) {
          throw Error('reward index incomplete: ' + JSON.stringify(reward));
        }
        await page.locator('[data-bl="t"]').click();
        await page.waitForSelector('.bl-titel');
        await page.locator('[data-bl="g"]').click();
        await page.waitForSelector('.bl-zeile');
        await page.selectOption('#bl-art', { index: 1 });
        await page.waitForTimeout(200);
        const filtered = await page.locator('#bl-anzahl').innerText();
        if (!/\d/.test(filtered)) throw Error('reward type filter broken');
        await page.selectOption('#bl-art', '');
      }
      if (name === 'handwerk') {
        await page.locator('[data-hw="rezepte"]').click();
        await page.waitForSelector('.rezept-knopf');
        const recipe = await page.evaluate(() => ({
          rows: document.querySelectorAll('#rezept-inhalt tbody tr').length,
          professions: document.querySelectorAll('#rezept-berufe .rezept-knopf').length,
          tiers: document.querySelectorAll('#rezept-stufen .rezept-knopf').length,
          label: document.getElementById('rezept-anzahl').innerText,
        }));
        if (recipe.professions < 5 || recipe.tiers < 1 || recipe.rows < 1) {
          throw Error('recipe browser incomplete: ' + JSON.stringify(recipe));
        }
      }
      if (name === 'spielstand') {
        await page.locator('[data-reiter="mac"]').click();
        if (!(await page.locator('#mac-befehl').isVisible())) throw Error('Mac instructions missing');
        await page.locator('[data-reiter="windows"]').click();
        await page.screenshot({ path: 'output/playwright/import-polish-' + lang + '.png' });
      }
      results.push({ name, lang, title: report.title });
    }
    await page.goto(base + 'index.html?art=taten&lang=' + lang + '&id=70005BD2');
    await page.waitForSelector('.ziele-schalter');
    await page.locator('.ziele-schalter').click();
    await page.waitForSelector('.jagdpunkt');
    const tinyControls = await page.evaluate(() => [...document.querySelectorAll('main *')].filter(el =>
      !el.children.length && el.textContent.trim() && el.getBoundingClientRect().width &&
      !el.closest('#marker') && parseFloat(getComputedStyle(el).fontSize) < 14
    ).map(el => el.tagName + '.' + el.className));
    if (tinyControls.length) throw Error('Small map controls: ' + tinyControls.join(', '));
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForFunction(() => {
      const map = document.getElementById('welt'), r = map.getBoundingClientRect();
      const p = map.parentElement.getBoundingClientRect();
      return r.width <= p.width + 1 && r.height <= p.height + 1 && Math.abs(r.width / r.height - 4 / 3) < .01;
    });
    if (await page.locator('footer').evaluate(el => el.getBoundingClientRect().bottom > innerHeight + 1)) {
      throw Error('Map footer outside viewport: ' + lang);
    }
    await page.setViewportSize({ width: 1440, height: 900 });
  }
  // Recipe browser with a loaded character: own professions only, and the
  // missing filter must span every tier instead of only the chosen one.
  await page.goto(base + 'handwerk.html?lang=de#rezepte');
  await page.waitForSelector('#rezept-berufe .rezept-knopf');
  await page.evaluate(() => {
    const rows = window.MQL_REZEPTE.r;
    const own = rows.find(row => row[9] === 'WOODWORKER');
    localStorage.setItem('mql.charaktere', JSON.stringify({ aktiv: 'T|T|T', liste: {
      'T|T|T': { key: 'T|T|T', name: 'T', server: 'T', handwerk: {
        WOODWORKER: [[1, 0, 1, 0, 1]], COOK: [[1, 0, 1, 0, 1]] }, rezepte: [own[10]] } } }));
  });
  await page.reload();
  await page.waitForSelector('#rezept-berufe .rezept-knopf');
  const crafting = await page.evaluate(() => ({
    professions: document.querySelectorAll('#rezept-berufe .rezept-knopf').length,
    checkboxes: document.querySelectorAll('.rezept-haken, .rezept-filter').length,
    filter: document.querySelector('.rezept-filter').innerText,
  }));
  if (crafting.professions !== 2 || crafting.checkboxes !== 2 ||
      !/fehlende Rezepte/.test(crafting.filter)) {
    throw Error('crafting professions not limited to the character: ' + JSON.stringify(crafting));
  }
  const stufeVorher = await page.evaluate(() =>
    document.querySelector('#rezept-stufen .rezept-knopf.aktiv').textContent);
  await page.locator('.rezept-filter input').click();
  await page.waitForTimeout(200);
  const missing = await page.evaluate(() => ({
    stufe: document.querySelector('#rezept-stufen .rezept-knopf.aktiv').textContent,
    rows: document.querySelectorAll('#rezept-inhalt tbody tr:not(.rezept-gruppe):not(.rezept-stufe)').length,
    label: document.getElementById('rezept-anzahl').innerText,
    headers: document.querySelectorAll('.rezept-tabelle thead').length,
    tierRow: !document.getElementById('rezept-stufen').hidden,
    alleBerufe: !!document.querySelector('.rezept-haken'),
  }));
  // Filtering keeps the chosen tier and the profession row untouched.
  if (missing.stufe !== stufeVorher || !missing.rows || !/fehlende von/.test(missing.label) ||
      missing.headers !== 1 || !missing.tierRow || !missing.alleBerufe) {
    throw Error('missing recipes view broken: ' + JSON.stringify(missing));
  }
  await page.locator('#rezept-stufen .rezept-knopf').first().click();
  await page.waitForTimeout(200);
  const alleStufen = await page.evaluate(() => ({
    stufenTitel: document.querySelectorAll('#rezept-inhalt tr.rezept-stufe').length,
    label: document.getElementById('rezept-anzahl').innerText,
    tierRow: !document.getElementById('rezept-stufen').hidden,
  }));
  if (alleStufen.stufenTitel < 2 || !alleStufen.tierRow || !/fehlende von/.test(alleStufen.label)) {
    throw Error('missing recipes across tiers broken: ' + JSON.stringify(alleStufen));
  }
  // Reputation filter: factions at their start tier are not "started", so the
  // filter must really drop rows (it once kept every faction).
  await page.goto(base + 'ruf.html?lang=de');
  await page.waitForSelector('#filter', { state: 'attached' });
  await page.evaluate(() => {
    const fraktionen = window.MQL_REFERENZ.fraktionen;
    const ids = Object.keys(fraktionen).slice(0, 10);
    const ruf = ids.map((id, index) => {
      const f = fraktionen[id];
      const tier = index < 6 ? f.start : Math.min(f.max || f.start + 1, f.start + 1);
      return [id, tier, index < 6 ? 0 : 1000];
    });
    localStorage.setItem('mql.charaktere', JSON.stringify({ aktiv: 'T|T|T', liste: {
      'T|T|T': { key: 'T|T|T', name: 'T', server: 'T', ruf: ruf, quests: [], deeds: [] } } }));
  });
  await page.reload();
  await page.waitForSelector('#zeilen tr', { state: 'visible' });
  const rufAlle = await page.evaluate(() => ({
    rows: document.querySelectorAll('#zeilen tr').length,
    label: document.getElementById('anzahl').innerText,
  }));
  await page.locator('#nur-begonnen').check();
  await page.waitForTimeout(200);
  const rufGefiltert = await page.evaluate(() => ({
    rows: document.querySelectorAll('#zeilen tr').length,
    label: document.getElementById('anzahl').innerText,
  }));
  if (rufAlle.rows !== 10 || rufGefiltert.rows !== 4 || !/von 10/.test(rufGefiltert.label)) {
    throw Error('reputation filter broken: ' + JSON.stringify({ rufAlle, rufGefiltert }));
  }
  await page.evaluate(() => localStorage.removeItem('mql.charaktere'));

  if (errors.length) throw Error(errors.join('\n'));
  return { checked: results.length, pages: results, mapLayout: 'PASS',
    crafting: { professions: crafting.professions, missingTiers: alleStufen.stufenTitel },
    reputation: { all: rufAlle.rows, started: rufGefiltert.rows }, errors };}

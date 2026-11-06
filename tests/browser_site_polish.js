/* Pass this file to playwright-cli run-code after opening web/start.html or
 * dist-web/start.html. Checks the same pages in all three languages. */
async page => {
  const base = new URL('.', page.url()).href;
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
        await page.waitForSelector('.bl-eintrag');
        const reward = await page.evaluate(() => ({
          virtues: document.querySelectorAll('.bl-eintrag').length,
          label: document.getElementById('bl-anzahl').innerText,
          title: document.title,
        }));
        if (reward.virtues < 15 || !/Belohnungen|Rewards|Récompenses/.test(reward.title)) {
          throw Error('reward index incomplete: ' + JSON.stringify(reward));
        }
        await page.locator('[data-bl="g"]').click();
        if (!(await page.locator('.bl-eintrag').count())) throw Error('reward items missing');
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
  if (errors.length) throw Error(errors.join('\n'));
  return { checked: results.length, pages: results, mapLayout: 'PASS', errors };
}

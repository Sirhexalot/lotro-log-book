# Operations

- **Check and build locally:** [Project guide](../../AGENTS.md#build-preview-and-tests)
- **Check every published address:** `python3 tools/pruefe_entitaeten.py` requests all addresses from `phpdata/sitemaps.json` against the local preview and requires 200 (about 20 minutes; report in `~/.cache/llb-status-fehler.txt`)
- **Publish:** [binding approval and upload rules](../../AGENTS.md#publication-privacy-and-rights)
- **Understand deployment:** [arc42 distribution view](../arc42/07-deployment-view.md) with artefacts, target paths, cache and open infrastructure details
- **Check titles and search engine descriptions:** [SEO rules](seo.md)
- **Daily report by mail:** [top ten entities of the month](tagesbericht.md) –
  `php/cron/report.php`, set up in the konsoleH cron manager

The original PHP switchover is documented in the [archive](../archiv/php-umbau.md). Its command sequence is not a guide for a regular release.

# 2. Constraints

### Technical constraints

- Composer requires PHP **8.1 or higher** and Twig `^3.8`; no further runtime packages are listed in `composer.json`.
- The PHP code uses a front controller and Twig, no PHP framework declared in `composer.json`.
- Python produces catalogue data, localised labels, page models and release files.
- The browser part consists of HTML, CSS and JavaScript. The application logic and filter modules live in `web/`.
- Website data is provided in JSON files. In the PHP runtime, no database connection is present in the data and routing paths that were inspected.

Evidence: `composer.json`, `php/public/index.php`, `php/src/Data.php`, `tools/build_php_data.py`.

### Product and operational boundaries

- The supported application languages are fixed to `de`, `en`, `fr` in `Catalogue::LANGS`.
- Quest/deed and item data is not extracted from the game client during the request; PHP reads prepared files.
- For the deed data, the website build explicitly invokes a shared generator from the separate `MagicQuestLog` repository (`tools/build_taten_daten.py`).
- `tools/build_release.py` produces a PHP release without `.htaccess`; the switchover or web server configuration is a separate operational step.

Evidence: `php/src/Catalogue.php`, `tools/build_taten_daten.py`, `tools/build_release.py`.

### Organisational, legal and external constraints

- Website, plugin and Companion/DAT export tools are separate projects. Their availability is no permission to change external repositories, game installations or character files.
- Local source data and build dependencies can lie outside a fresh checkout; their versioning and availability are not controlled by the HTTP request.
- Tracking and statistics are separate data paths. A complete legal assessment, data processing agreement or binding retention policy cannot be derived from this repository.
- Technical availability of game content, maps, trademarks or libraries does not evidence any rights of use. The clarification of rights lies outside this architecture description.
- Rewrite rules, hosting configuration, credentials and production permissions lie partly outside the release artefact.

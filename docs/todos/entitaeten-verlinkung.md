# Entitäten-Verlinkung vollständig überarbeiten

**Status:** teilweise umgesetzt; technischer URL-Audit bestanden (16.11.2026)
**Erstellt:** 15. November 2026
**Audit:** `docs/entitaeten-link-audit-2026-11-15.md`

## Ziel

Alle belegten Beziehungen zwischen Aufgaben, Taten, Gegenständen, Rezepten,
Gebieten, Regionen, Auftraggebern, Landmarken, Fraktionen, Titeln, Tugenden,
Sets und Instanzen sollen entweder auf eine kanonische Detailseite oder
begründet auf eine Anwendung verweisen. Nicht belegte oder bewusst
ausgeschlossene Beziehungen müssen als solche dokumentiert bleiben.

## Priorität 1: kaputte Ziele beheben

- [x] In `tools/php_viewmodel.py` die Landmarken-Elternkarte nicht mehr
      pauschal als `region` verlinken.
- [x] Kartenbaum-Regel zentralisieren: Top-Level-Karte → Region,
      Unterkarte/Gebiet → Gebiet; technische oder nicht veröffentlichte
      Karten bleiben Text.
- [x] Die 51 betroffenen Karten-IDs (153 sprachabhängige URLs) aus dem Audit automatisch gegen
      `phpdata/*/page-area` und `page-region` prüfen.
- [x] Alle 4.572 fehlerhaften URL-Felder nach dem Neubau auf 0 reduzieren.
      Folgeprüfung: 1.449.979 interne URLs, 0 nicht auflösbar.

## Priorität 2: vorhandene IDs tatsächlich verlinken

- [x] In Set-Mitgliedern (`tools/set_viewmodel.py`) vorhandene
      Item-IDs direkt auf Item-Detailseiten verlinken.
- [x] Für die ehemals 498 betroffenen Set-Mitglieder je Sprache prüfen, ob eine
      Item-Seite gebaut wird. Ergebnis: Für 10.654 von 11.152 Set-Mitgliedern
      je Sprache existiert eine Item-Seite; 498 IDs fehlen bereits im Item-
      Katalog und bleiben deshalb bewusst ohne Link.
- [x] Eine Regression ergänzen: `members[].id` mit vorhandener
      Item-Seite darf nicht `members[].url == null` sein.
- [x] Rohdaten für Titel-, Tugend-, Trait- und Emote-Belohnungen prüfen:
      stabile IDs ausgeben und auf Detailseiten verlinken, wenn die IDs
      eindeutig vorhanden sind. Der aktuelle Quest-/Deed-Export enthält bei
      diesen Belohnungsarten keine stabilen IDs; Namensauflösung bleibt
      ausgeschlossen.
- [ ] Gegenstands-, Rezept- und Tat-Belohnungen nach ID, Name und
      auswählbarer Variante getrennt auswerten; keine unsichere
      Namensauflösung erzwingen.

## Priorität 3: fachliche Fallbacks entscheiden

- [ ] Die 59 DNT-Quellen je Sprache (177 Einträge insgesamt) als bewusste
      Ausnahme dokumentieren und eine einheitliche Darstellung festlegen.
- [ ] Für `area_trail` die 39.694 Textfälle klassifizieren:
      veröffentlichte Gebietseite, technische Karte, fehlende Karten-ID oder
      bewusst nicht verlinkbare Hierarchie.
- [ ] Prüfen, ob Auftraggeber ohne `gi` weiterhin zur Suche führen sollen
      oder ob eine belegte Giver-ID aus den Quelldaten ergänzt werden kann.
- [ ] Anwendungspfade nur dort behalten, wo keine eindeutige Detailseite
      existiert: Karte, Reise, Gegenstandssuche, Handwerk, Ruf und
      Instanzenfinder.
- [ ] Keine Legacy-`.html`- oder nichtkanonischen Entitätslinks in neuen
      Viewmodels/Templates zulassen.

## Vollständige technische Prüfung

- [ ] Link-Matrix aus dem Audit gegen `php_viewmodel.py`,
      `RelatedLists.php`, alle Entity-Twig-Templates und die Generatoren
      abgleichen.
- [ ] Alle URL-Felder der `phpdata`-Seiten erneut prüfen:
      gültige Detailseite, gültige Anwendung, Legacy, 404.
- [ ] Zusätzlich Rohdaten-IDs prüfen, die im Viewmodel keinen URL-Eintrag
      erreichen.
- [ ] `RelatedLists.php` für Titel, Tugend, Set, Landmarke, Fraktion,
      Auftraggeber und Gebiet prüfen; URL-Erkennung und Listenfilter dürfen
      keine Beziehungen verlieren.
- [ ] JavaScript-Links und `data-*`-Ziele in Karten-, Such-, Handwerks- und
      Abenteueransichten getrennt vom serverseitigen JSON prüfen.
- [ ] Rücklinks und „Wird vorausgesetzt von“ in allen Entitätstypen prüfen.

## Sprach- und URL-Abnahme

- [ ] DE, EN und FR für jede korrigierte Beziehung prüfen.
- [ ] Kanonische Pfade anhand `php/src/Catalogue.php` prüfen.
- [ ] Groß-/Kleinschreibung, trailing slash, alte `.html`-Adressen und echte
      404 über `php/src/Router.php` testen.
- [ ] Statische No-JavaScript-Seiten prüfen: alle wichtigen Beziehungen
      müssen als HTML-Link oder nachvollziehbarer Text erscheinen.
- [ ] JavaScript-Ansichten auf Desktop und Mobil prüfen.

## Tests und Abnahmekriterien

- [x] Audit-Skript als reproduzierbaren Prüfbaustein
      ins Repository übernehmen.
- [x] `git diff --check`
- [x] `python3 -m unittest discover -s tests -p 'test_*.py'` (263 Tests)
- [ ] vorhandene PHP-/Katalog-Paritätstests ausführen.
- [x] Browserprüfung der korrigierten DE-/EN-/FR-Beziehungen und der
      veröffentlichten Set-Kacheln.
- [x] Keine kaputten Entitäts-URLs im gebauten Bestand (1.449.979 geprüft,
      0 nicht auflösbar).
- [ ] Jede verbleibende `url: null`-Beziehung ist vollständig klassifiziert und im
      Audit begründet.
- [ ] Nur kanonische interne Detailseiten werden als Entitätslinks erzeugt.
- [ ] Anwendungspfade sind bewusst und sprachparallel.

## Nicht Teil dieses TODOs

- Keine Änderung an den bereits uncommitteten Aufgaben-/Kartenänderungen
  ohne deren eigene TODOs.
- Keine neuen Spielinhalte oder Beziehungen aus externen Wikis ergänzen.
- Die geprüften Korrekturen wurden am 16.11.2026 veröffentlicht; weitere
  Linkbeziehungen bleiben außerhalb dieses abgeschlossenen Umfangs.

# TODO: Komponentenbasierte Releases und inkrementeller Upload

**Projekt:** LOTRO Log Book, ausschließlich Website
**Stand:** 17. November 2026
**Status:** Lokale Umsetzung vorhanden; vollständige Liveabnahme und
Veröffentlichungsfreigabe noch offen
**Vorgesehener Projektpfad:** `lotro-log-book/docs/todos/release-komponenten.md`

Plugin, persönliche Charakterdaten und Spielinstallation bleiben unberührt.

Die lokale Umsetzung besteht aus `tools/release_components.py`, dem erweiterten
`tools/build_release.py` und dem manifestbasierten Pfad in `upload.py`.
Ein echter Upload oder eine Hostingänderung ist damit nicht freigegeben.

## 1. Ziel

Programm-, Daten- und Assetupdates getrennt erkennen und veröffentlichen.
Ein CSS-Update darf weder alle Geländekacheln lokal durchlaufen noch deren
Verzeichnisse rekursiv per FTPS auflisten müssen.

Der vollständige Release bleibt prüfbar und reproduzierbar. Teiluploads
bestätigen ausschließlich die tatsächlich veröffentlichten Komponenten.
Manuelle „Assets geändert“- oder „Daten geändert“-Flags sind nicht nötig.

## 2. Geprüfter Ausgangspunkt

- `tools/build_release.py` erstellt einen vollständigen Releaseordner.
  Es kopiert Webdateien, Karten, Gelände, PHP, Bibliotheken und `phpdata`,
  erzeugt Vorschauen, Tracking und eine leere Fortschrittsdatei.
- `upload.py` hat SHA-256-Vergleich und einen lokalen Uploadstand unter
  `~/.config/mql-upload-state.json`.
- Der bisherige Vergleich liest rekursiv den Remote-Bestand per `LIST`.
  `--nur` und `--ohne` filtern lokale Dateien nach oberstem Pfadsegment,
  begrenzen bisher aber nicht automatisch diese vollständige Remote-Inventur.
- `phpdata/manifest.json` beschreibt Datenformat, Sprachen und Katalogarten,
  nicht den vollständigen veröffentlichten Dateibestand.
- Das Geländemanifest hat eine eigene fachliche Version. Diese bleibt erhalten.
- Daten werden nicht automatisch vollständig neu exportiert, nur weil ein
  Release gebaut wird.
- Bei der Prüfung am 16.11. hatte ein Release rund 97.780 ausgewählte Dateien;
  ein kompletter Vorabvergleich meldete 4.300 Änderungen und 223,6 MB.
- Eine spätere Bestandsaufnahme zeigte zusätzlich verschachtelte Ordner
  `release-2026-11-16` und `release-2026-11-17` im Releaseziel. Ursprung und
  aktuelle Nutzung vor weiterer Arbeit klären; nicht ungeprüft löschen.
- Größen und Dateizahlen sind datierte Beobachtungen, keine festen Sollwerte.

### Laufzeit bleibt unverändert

Eine Item-URL wird durch PHP aufgelöst. `Data::page()` liest den passenden
JSON-Shard, `Page::render()` übergibt das Modell an Twig. Es gibt nicht für
jedes Item eine eigene PHP-Datei. Die Änderung betrifft Bau und Veröffentlichung,
nicht dieses Renderingmodell.

## 3. Abgrenzung

Enthalten:

- zentrale Dateiklassifikation;
- deterministisches Build-Manifest;
- serverseitiger bestätigter Deploymentstand;
- Auswahl und Upload geänderter Dateien ohne globale FTP-Inventur;
- Fehlerbehandlung, Wiederaufnahme, Sperre, Versionierung;
- Tests, Betriebsdokumentation und Migration.

Nicht enthalten:

- Umstellung auf Datenbank oder anderes Hosting;
- Zusammenlegen der JSON-Shards;
- neuer DAT-Export;
- automatisches Löschen alter Serverdateien;
- atomare Umschaltung der ganzen Website;
- ungefragter Upload oder Wechsel der aktuellen Veröffentlichung;
- vorgezogene Änderungen am Plugin.

## 4. Zentrale Komponentenregeln

Ein gemeinsames Pythonmodul wird von Builder und Uploader verwendet.
Es klassifiziert relative Veröffentlichungspfade ausdrücklich.
Keine voneinander abweichenden Listen in mehreren Werkzeugen.

### Programm

- PHP-Code, Twig-Templates und deploybarer Einstiegspunkt;
- Composer-Laufzeitbibliotheken unter `vendor/`;
- CSS und tatsächlich ausführbarer Anwendungs-JavaScript-Code;
- Seitenhülle, Fehlerseite, Rechtstexte, Tracking und `robots.txt`.

### Daten

- `phpdata/` einschließlich fachlichem Datenmanifest;
- erzeugte Katalog-, Such-, Rezept-, Ruf-, Gebiets- und Instanzdaten;
- erzeugte kompakte Kartendaten und Sprachkataloge, soweit sie Daten sind;
- `vorkommen/`, `notizen/` und ihre erzeugten Einstiegsskripte.

### Assets

- `bild/`, Item-Symbole, Social-Vorschauen;
- `karten/` einschließlich Vorschaubildern;
- `gelaende/` einschließlich fachlicher Geländemanifeste.

### Sonderregeln

- `*.js` ist keine ausreichende Programmregel: `app.js` ist Code,
  `daten-de.js` ist Daten.
- UI-Übersetzungen gehören zusammen mit dem zugehörigen Programmcode versioniert;
  fachliche übersetzte Kataloge gehören zu Daten.
- Die leere `fortschritt.js` ist ein definierter Programm-Stub.
- Fachliche Manifeste bleiben Teil ihrer Komponente.
- Das neue Release-Manifest wird nicht in seine eigenen Inhaltsversionen
  eingerechnet.
- Laufzeitcache, Statistikdateien, Zugangsdaten, Uploadjournale, persönliche
  Fortschritte, Tests und alte Releasekopien werden nicht ausgeliefert.
- Jeder zulässige Releasepfad gehört genau einer Komponente an.
- Unbekannte oder mehrdeutige Pfade blockieren den Build mit konkreter Meldung.
- Alle aktuellen Rootdateien vor Umsetzung inventarisieren. Vorstehende Gruppen
  sind fachliche Regeln, keine bereits vollständige technische Allowlist.

## 5. Build-Manifest und Versionsbildung

Neue Datei im Build: `release-manifest.json`.

Inhalt:

- Manifestformat-Version;
- Build-Kennung und UTC-Erstellungszeit als Metadaten;
- je Komponente Inhaltsversion und Anzahl/Bytes;
- je Datei normalisierter relativer Pfad, Komponente, Größe, SHA-256;
- explizite Datenformat-/Kompatibilitätsanforderungen;
- bei Bedarf explizite erforderliche Veröffentlichungspfade.

Beispielstruktur, genaue Serialisierung bei Umsetzung festlegen:

```json
{
  "schema": 1,
  "build": "2026-11-17T120000Z",
  "components": {
    "programm": {"version": "<sha256>"},
    "daten": {"version": "<sha256>"},
    "assets": {"version": "<sha256>"}
  },
  "files": {
    "gemeinsam.css": {
      "component": "programm",
      "size": 12345,
      "sha256": "<sha256>"
    }
  },
  "compatibility": {}
}
```

Version = SHA-256 einer kanonisch serialisierten, nach Pfad sortierten Liste
aus Pfad, Größe und Dateihash einer Komponente. Zeitstempel, Build-Kennung,
absolute Pfade und Dateisystemreihenfolge beeinflussen die Version nicht.
Vollständige Hashes speichern, für Anzeigen kurze Präfixe verwenden.

Der Builder hasht Dateien, der Uploader übernimmt diese Hashes. Vor dem Senden
verifizieren, dass die ausgewählte Datei noch dem Manifest entspricht.
Ein während des Uploads veränderter Build darf nicht bestätigt werden.

## 6. Veröffentlichter Serverstand

Deployment-Metadaten in einem eigenen privaten Verzeichnis ablegen.
Bevorzugt außerhalb des Documentroots, wenn der FTPS-Zugang dies erlaubt.
Alternativ explizit per Hostingkonfiguration geschützter Pfad im Documentroot.
Den konkreten Pfad anhand des Hostings verifizieren, nicht voraussetzen.

Speichern:

- Metadatenformat-Version und Revision des Deploymentstands;
- zuletzt vollständig bestätigte Version pro Komponente;
- Dateihashes des bestätigten Bestands;
- Buildherkunft und Bestätigungszeit je Komponente;
- unvollständiger Upload mit Transaktionskennung und Fortschritt.

Ein Teilrelease kann Komponenten verschiedener Builds kombinieren. Der
Serverstand muss das ausdrücken; nicht einen alten Gesamtbuild als aktuell
deklarieren.

Schreibweise: neue Metadaten unter temporärem Namen hochladen und nach Prüfung
umbenennen. Verhalten des Hosts bei Rename/Ersetzen testen. Der letzte gültige
Stand muss bei Schreibfehler erhalten bleiben. Die Metadatenbestätigung ist
keine Zusicherung eines atomaren gesamten Websiteupdates.

## 7. Änderungserkennung und CLI

Vorgeschlagene Schnittstelle:

```bash
python3 upload.py --quelle <release> --gruppe programm --dry-run
python3 upload.py --quelle <release> --gruppe daten
python3 upload.py --quelle <release> --gruppe assets
python3 upload.py --quelle <release> --gruppe programm,daten
python3 upload.py --quelle <release> --gruppe alle
```

Ohne Gruppenauswahl: alle geänderten Komponenten des geprüften Builds anbieten.
Ein unveränderter Komponentenhash beendet den Vergleich dieser Komponente.
Bei Änderungen nur Manifest-Dateieinträge vergleichen, keine vollständige
Remote-Verzeichnisauflistung.

Vorschau zeigt:

- gewählte, unveränderte und ausgeschlossene Komponenten;
- Dateiänderungen, neue Dateien und Übertragungsbytes;
- Abhängigkeiten und blockierende Konflikte;
- entfallene Pfade als Meldung, ohne Löschung;
- Hinweis auf unvollständige oder anderweitig veränderte Serverstände.

`--nur`/`--ohne` erhalten oder kontrolliert ablösen. Kombinationen mit
`--gruppe` nicht stillschweigend mehrdeutig auswerten. Ein Einzeldateiupload
markiert eine Komponente nur dann vollständig, wenn ihr gesamter Sollbestand
nachweislich erreicht wurde; andernfalls als Teilstand erfassen.

`--dry-run` darf weder Remotezustand noch Sperren oder lokale bestätigte
Versionsstände verändern.

## 8. Abhängigkeiten und Veröffentlichungsreihenfolge

Keine pauschale Annahme „Programm kann immer alleine hochgeladen werden“.

- Datenformatvertrag: Programm deklariert unterstützte Schemaversionen;
  Daten deklarieren ihr Format.
- Neue referenzierte Asset-/Datenpfade: Existenz im bestätigten Serverbestand
  oder in derselben Uploadauswahl nachweisen.
- Alle betroffenen Komponenten einer Änderung explizit im Vorschauplan nennen.
- Die automatische Pfadprüfung kennt nur erfasste Abhängigkeiten. Sie ersetzt
  weder Tests noch eine Abnahme; dynamische JavaScript-Referenzen sind nicht
  durch beliebiges Textdurchsuchen vollständig beweisbar.

Neue Abhängigkeiten vor ihren Konsumenten veröffentlichen:

1. benötigte neue Bilder/Kacheln/Datenblöcke;
2. darauf verweisende Indizes, Programme und Templates;
3. aktivierende Manifeste, soweit die vorhandene Anwendung das unterstützt;
4. Deploymentbestätigung nach Abschluss und Prüfung.

Das fachliche Geländemanifest erst nach seinen referenzierten Kacheln
veröffentlichen. Neue referenzierte Item-Symbole vor den zugehörigen Daten.
Bei zyklischen oder inkompatiblen Schemaänderungen abbrechen und eigenen
abwärtskompatiblen Migrationsablauf verlangen.

## 9. Upload, Fehler und Wiederaufnahme

Vor Schreiboperationen einen exklusiven serverseitigen Upload-Lock erwerben.
Eine geeignete FTPS-Operation und deren Exklusivität auf dem Host prüfen
(z. B. Verzeichnisanlage). Nicht nur lokal sperren.

Lock enthält Kennung, Startzeit und vorgesehene Komponenten, keine Geheimnisse.
Paralleler Upload wird abgewiesen. Verwaiste Locks nur nach ausdrücklicher
Prüfung/Freigabe entfernen; kein automatisches gewaltsames Übernehmen.

Für geänderte Dateien:

- soweit unterstützt, temporär im Zielverzeichnis hochladen und umbenennen;
- erfolgreiche FTPS-Antwort und finale Remote-Größe prüfen;
- Ergebnis im Wiederaufnahmejournal erfassen;
- keine neue Gruppenversion nach Fehlern bestätigen.

Dateiübertragung ist bei Threadfehlern insgesamt fehlgeschlagen. Exceptions
aus Workern müssen im Hauptprozess ankommen und einen Exitcode ungleich null
erzwingen. Keine bloße Erfolgsmeldung nach gescheitertem Hintergrundworker.

Bei Abbruch bleibt die bestätigte Vorgängerversion erhalten, aber der Zustand
wird als teilweise verändert/unvollständig ausgewiesen. Der Server kann
bereits gemischte Dateien enthalten. Wiederaufnahme verifiziert Journaleinträge
mindestens gegen Remote-Größe und vorgesehenen Hashstand; nicht blind skippen.

Remote-SHA-256 nur behaupten, wenn der Host eine verlässlich geprüfte
Hashfunktion bietet. FTPS-Erfolg plus Größe ist keine vollständige unabhängige
Remote-Inhaltsprüfung. Ergänzend HTTP-Prüfungen und optionaler Downloadvergleich.

## 10. Bedeutung von „synchronisiert“

Eine Komponente ist synchronisiert, wenn ihr vollständiger gebauter Sollbestand
erfolgreich veröffentlicht und geprüft wurde und ihre Version bestätigt ist.

Das sagt nicht:

- dass Quelldaten frisch aus dem Spiel exportiert wurden;
- dass ausgeschlossene Komponenten ebenfalls aktuell sind;
- dass unverwaltete Altdateien gelöscht wurden;
- dass niemand nachträglich manuell Serverdateien geändert hat.

Beispielanzeige:

```text
Programm: synchronisiert, Version …
Daten: unverändert, Version …
Assets: nicht ausgewählt; bestätigte Version …
Upload: erfolgreich, 1 Datei übertragen
```

Fehlende Komponentenbestätigung niemals als „alles aktuell“ darstellen.

## 11. Migration und vollständiger Kontrolllauf

- Vorhandene lokale Uploadhistorie bewahren und sichern.
- Bestehende fachliche Manifeste nicht durch das Deploymentmanifest ersetzen.
- Bei fehlendem Servermanifest initialen Bestandsabgleich explizit ausführen.
- Ein lokaler Hash plus gleiche Remote-Größe beweist keinen identischen
  Remoteinhalt. Für eine belastbare Erstbestätigung Dateien verifizieren
  (Download/Hash) oder bewusst neu übertragen. Vertrauensübernahme aus der
  bisherigen Historie nur als ausdrücklich gekennzeichnete schwächere Option.
- Beschädigte oder unbekannte Manifestversion blockiert den schnellen Upload.
  Kein stiller Fallback auf „synchronisiert“.
- Gesonderter Auditmodus für manuelle Serveränderungen: Inventur und nach
  Bedarf Inhaltsvergleich, mit Aufwandshinweis.
- Teilupdates löschen nichts. Verwaistenprüfung nur aus vollständigem
  Sollbestand; Löschung bleibt eigene ausdrücklich freigegebene Operation.
- Rückfall: alte Deploymentmetadaten und passende Releasequellen aufbewahren.
  Ein echtes Rollback erfordert Rückübertragung alter Dateien, nicht bloß
  Zurücksetzen einer Versionsnummer.

## 12. Buildstrategie und Sicherheit

Stufe 1 behält den vollständigen Build und seine Prüfungen. Schneller Upload
und schneller Build sind getrennte Ziele.

Vorher prüfen:

- nur dedizierte, entbehrliche Buildziele verwenden;
- Quelle/Ziel/Unterverzeichnis-Konflikte vor dem bisherigen `rmtree` abweisen;
- alte Releasekopien, Cache und Laufzeitdaten nicht rekursiv mitnehmen;
- vollständigen Release vor Erzeugen des Manifests prüfen;
- Manifest nach Abschluss aller inhaltlichen Generatoren erstellen.

Keine Löschung unbekannter Bestände als Teil dieses Vorhabens.

Stufe 2 erst nach Messung: inkrementelles Zusammenstellen unveränderter Assets
und belastbares Hash-Caching. Immer einen vollständigen Vorschau-/Prüfbestand
erhalten; nicht drei unvollständige Websites als Testgrundlage verwenden.

## 13. Testkonzept

### Unit-Tests: Klassifikation und Manifest

- [x] Jeder zulässige Pfad gehört genau einer Komponente an.
- [x] Programm-JavaScript und generierte Daten-JavaScripts korrekt getrennt.
- [x] Vorkommen/Kartennotizen Daten; Bilder und Geländemanifest Assets.
- [x] Unbekannte und mehrdeutige Pfade werden abgelehnt.
- [x] Gleicher Inhalt ergibt trotz anderer Reihenfolge/Zeitstempel gleiche Version.
- [x] Änderung nur einer Komponente ändert nur deren Version.
- [x] Neuer und entfallener Pfad ändern die passende Version.
- [x] Manifest hat keinen Selbstbezug; kanonische Serialisierung stabil.
- [x] Absolute Pfade, `..`, Symlinks außerhalb des Builds und private Daten abweisen.
- [x] Verschachtelte Releasekopien und Laufzeitcache werden nicht ausgeliefert.
- [x] Während des Uploads veränderte Builddatei wird erkannt.

### Integration: simulierter FTPS-Server

Tests müssen ohne produktive Zugangsdaten und ohne Live-Schreibzugriffe laufen.
Ein instrumentierter Fake prüft Aufrufe; ein lokaler FTP/FTPS-Testserver
prüft insbesondere Rename, Fehlerantworten und Wiederaufnahme realitätsnah.

- [x] Unveränderter Release: null Dateiübertragungen.
- [x] Eine CSS-Änderung: nur eine Programmdatei plus nötige Deploymentmetadaten.
- [x] Itemänderung: nur tatsächlich geänderte Daten-Dateien.
- [ ] Neues Item-Symbol vor dem darauf verweisenden Datenstand.
- [x] Zeitstempeländerung allein: null Dateiübertragungen.
- [x] Programmupdate ruft keine rekursive Asset-Inventur auf.
- [x] Teilupdate erhält die Versionsstände aller anderen Komponenten.
- [ ] Einzeldateiupload behauptet keinen vollständigen Komponentenstand.
- [x] Netzwerkabbruch, falsche Remote-Größe und Renamefehler verhindern Bestätigung.
- [x] Workerfehler führen zu Fehlerexitcode und keinem falschen Erfolg.
- [x] Wiederaufnahme sendet fehlende Dateien und prüft vorhandene Journaleinträge.
- [x] Während eines Uploads geänderter Serverstand wird als Konflikt erkannt.
- [x] Paralleler Lock wird abgewiesen; verwaister Lock nicht automatisch entfernt.
- [x] Fehlendes/beschädigtes Manifest verlangt Migration oder Fehlerbehandlung.
- [x] Unterbrochene Metadatenbestätigung lässt den letzten gültigen Stand erhalten.
- [x] Teilupdates löschen keine Remote-Dateien.
- [x] Dry-run schreibt weder Lock noch Journal/Bestätigung.
- [x] Fehlende deklarierte Abhängigkeiten blockieren Upload.
- [ ] Fachliches Geländemanifest wird erst nach seinen Kacheln aktiviert.

### Bestehende Website-Tests

- [ ] Bestehende Python-/Node-/PHP-Tests unverändert weiterführen.
- [ ] Builderprüfung um Manifest, Ausschlüsse und Komponentenabdeckung erweitern.
- [ ] Vollständigen gebauten Release lokal in DE/EN/FR prüfen.
- [ ] Item, Aufgabe, Suche, Aufgabenfinder, Abenteuer und Handwerk stichprobenartig.
- [ ] Bei sichtbaren Änderungen Desktop/Mobil und relevante Importzustände prüfen.
- [ ] Persönliche Spielstände weder überschreiben noch in Artefakte übernehmen.

### Erste freigegebene Liveabnahme

- [ ] Schutz der Deploymentmetadaten über HTTP prüfen, ohne Inhalte offenzulegen.
- [ ] Exklusiver Lock und atomarer Metadatenersatz auf dem Host verifiziert.
- [ ] Reines Programmupdate: CSS/PHP/JS laden; keine fehlenden Assets.
- [ ] Datenupdate: Item und Aufgabe samt Verweisen, DE/EN/FR.
- [ ] Assetupdate: Symbol, Spielkarte und Gelände inklusive neuem Manifest.
- [ ] Bei Twigänderungen Cache nach Upload leeren und Seiten erneut prüfen.
- [ ] Erfolgsstatus gegen Servermanifest und ausgewählte Dateien abgleichen.

### Leistungsmessung

- [ ] Buildzeit getrennt von Vergleich, Netzwerk und Übertragung protokollieren.
- [ ] Anzahl `LIST`-, `SIZE`-, `STOR`- und Metadatenoperationen erfassen.
- [ ] Unveränderten, CSS-, Daten- und Assetfall mit gleichem Bestand vergleichen.
- [ ] Für Programmupdates nachweisen: keine Operationen auf unveränderten
      Asset-Dateibäumen; Aufwand hängt nicht von deren Dateizahl ab.
- [ ] Keine konkrete Beschleunigung versprechen, bevor Messwerte vorliegen.

## 14. Umsetzungsphasen

1. **Inventur:** aktuelle Quelldateien, Build-/Releasepfade, Datenarten und
   vorhandene Tests prüfen; fremde Änderungen bewahren.
2. **Vertrag:** Komponentenregeln, Manifestformate und Kompatibilitätsfelder
   festlegen; Unit-Tests schreiben.
3. **Builder:** vollständigen Release sicher erzeugen und manifestieren.
4. **Planung:** Manifestvergleich, Gruppenoptionen und reine Vorschau.
5. **Upload:** begrenzte Dateiübertragung, Journale, Lock und Fehlerpropagation.
6. **Bestätigung:** geschützten Serverstand und Verifikation integrieren.
7. **Migration/Audit:** vorhandenen Bestand übernehmen und Rückfall dokumentieren.
8. **Abnahme:** Tests, Messungen, lokale Gesamtprüfung; Livebetrieb nur auf
   ausdrücklichen Veröffentlichungsauftrag.
9. **Dokumentation:** README, AGENTS.md und dieses Projekt-TODO mit tatsächlichen
   Befehlen, Prüfergebnissen und Betriebsregeln aktualisieren.

Voraussichtlich betroffen: `upload.py`, `tools/build_release.py`, ein neues
gemeinsames Release-Modul, `tests/test_upload.py`, zusätzliche Manifest-/
Release-/Integrationstests und die Release-Dokumentation. Konkrete Namen erst
nach Prüfung vorhandener Muster festlegen.

## 15. Abnahmekriterien

Das Vorhaben ist erst fertig, wenn:

- automatische Inhaltsversionen manuelle Änderungsflags ersetzen;
- alle Release-Dateien eindeutig klassifiziert und private Daten ausgeschlossen sind;
- ein Programmupdate unveränderte Assetverzeichnisse nicht inventarisiert;
- erfolgreiche Teilupdates ausschließlich ihren tatsächlichen Stand bestätigen;
- abgebrochene Uploads wiederaufnehmbar und ausdrücklich unvollständig sind;
- keine neue Version nach Übertragungs-, Worker- oder Prüfungsfehlern bestätigt wird;
- Abhängigkeiten, Grenzen der FTP-Verifikation und nicht-atomare Gesamtupdates
  wahrheitsgemäß behandelt und dokumentiert sind;
- Migration und vollständiger Kontrolllauf verfügbar sind;
- sämtliche neuen automatisierten Tests und relevante Websiteprüfungen bestehen;
- keine Löschung, Veröffentlichung oder Hostingänderung ohne Freigabe erfolgt.

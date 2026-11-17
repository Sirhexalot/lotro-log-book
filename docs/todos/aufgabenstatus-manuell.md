# Umsetzungskonzept: Aufgabenstatus manuell setzen

**Umsetzungsstand:** Statussteuerung umgesetzt; abschließende Vollabnahme noch offen.

Bereits umgesetzt:

- getrennte Speicherung von manuellen Aufgaben- und Tatenstatus
- effektiver Status über eine zentrale `MQL_SPEICHER`-API
- bereichsweises Überschreiben durch Companion-Import
- Sicherung und Wiederherstellung des Feldes `manuell`
- Pluginexport mit effektivem Status ohne erfundene Teilzielzähler
- gemeinsame Statuskomponente auf Katalog-Detailseiten, Aufgabenfinder,
  Kartenliste und Aufgabendetail
- Statussteuerung in Auftraggeber- und Quellenlisten
- Statusänderungen lösen eine Neuberechnung von Finder-, Listen- und
  Fortschrittsanzeigen aus
- kompakte Auswahlfelder ohne zusätzliche Abschluss-Haken in den Listen
- manuelle Statuspflege auch ohne vorherigen Companion-Import über ein lokales
  Profil „Manuelle Angaben“
- Aufgaben-/Tatenquellen auf Titel-, Tugend-, Gebiets-, Regions- und
  Gegenstandsseiten sowie Rufquellen angeschlossen
- Abenteuerübersichten verwenden den effektiven manuellen Aufgabenstatus für
  ihre Summen und Empfehlungen
- erste Unit- und Browserprüfungen in `tests/test_speicher.js` und
  `tests/browser_manual_status.js`

Noch offen:

- vollständige Karten-/Finder-/Detailabnahme in DE/EN/FR, Desktop und Mobil
- Gegenstandsseiten nach dem aktuellen PHP-Umbau vollständig browserseitig
  abnehmen
- Sicherungs-/Importmeldungen und Pluginexport mit allen manuellen Fällen
  vollständig browserseitig abnehmen

## Ziel

Aufgaben und Taten sollen im Browser manuell auf **offen**, **in Arbeit** oder
**erledigt** gesetzt werden können. Die Angabe gilt bis zum nächsten passenden
Import aus LOTRO Companion. Der Import bleibt führend und ersetzt die
manuellen Angaben.

Die Daten bleiben wie bisher ausschließlich im Browser.

## Geltungsbereich

Die Statussteuerung wird für einzelne Aufgaben beziehungsweise Taten angeboten
an folgenden Stellen:

- Kartenansicht: Aufgabenliste links
- Kartenansicht: ausgewähltes Aufgabendetail rechts
- Aufgabenfinder
- einzelne Aufgaben-/Taten-Detailseite
- Listen einzelner Aufgaben bei Auftraggebern sowie Quellenlisten, sofern dort
  bereits ein Fortschrittsstatus angezeigt wird

Reine Summen, Gebietskacheln, Regionsfortschritte und Abenteuerübersichten
bekommen keine einzelne Statussteuerung. Ihre Zahlen ergeben sich automatisch
aus dem effektiven Status.

## Statusmodell

Importdaten und manuelle Angaben werden getrennt gespeichert.

Beispiel:

```js
{
  quests: ["70001234"],
  laufend: {
    "70005678": [[1, 0, 0, null]]
  },
  manuell: {
    quests: {
      "70009999": "laufend",
      "7000AAAA": "erledigt"
    },
    deeds: {}
  }
}
```

Erlaubte manuelle Werte:

- `offen`
- `laufend`
- `fertig`

Kein Eintrag in `manuell` bedeutet: Importstatus verwenden.

Die bestehende Importstruktur `quests`, `deeds` und `laufend` bleibt erhalten.
Das verhindert unnötige Änderungen an Sicherungen, Pluginexport und
Bestandsdaten.

## Vorrang und Importregeln

Während der Laufzeit hat eine manuelle Angabe Vorrang vor der Darstellung des
zuletzt importierten Spielstands.

Beim erneuten Import gilt:

1. Die importierten Daten des gelesenen Bereichs werden ersetzt.
2. Die manuellen Angaben dieses Bereichs werden gelöscht.
3. Der sichtbare Status kommt danach wieder ausschließlich aus dem Import.

Bereiche werden getrennt behandelt:

- `questsStatus.xml` ersetzt Aufgabenstatus und löscht `manuell.quests`.
- `deedsStatus.xml` ersetzt Tatenstatus und löscht `manuell.deeds`.
- Fehlt eine Datei im Import, darf der vorhandene Bereich nicht blind geleert
  werden.

Damit kann ein unvollständiger Import nicht versehentlich alle Angaben eines
Charakters verlieren.

Nach einem Import soll die Meldung die Zahl der verworfenen manuellen Angaben
nennen, zum Beispiel:

> 18 Aufgaben importiert. 3 manuelle Statusangaben wurden durch den Import
> ersetzt.

## Zentrale Speicher-API

`web/speicher.js` erhält zentrale Funktionen, damit Kartenansicht, Finder und
Katalog nicht jeweils eigene Statuslogik entwickeln:

- `status(art, id)` – effektiver Status: `offen`, `laufend`, `fertig` oder
  neutral/unbekannt
- `importStatus(art, id)` – Status nur aus dem Import
- `setzeStatus(art, id, status)` – manuelle Angabe speichern
- `entferneManuellenStatus(art, id)` – zurück auf Importstatus
- `manuelleStatus(art, id)` – prüft, ob eine manuelle Angabe vorhanden ist
- `loescheManuelleStatus(art)` – beim passenden Import aufrufen

Bestehende direkte Zugriffe auf `quests`, `deeds` und `laufend` werden in den
Darstellungsbereichen schrittweise durch die zentrale Statusabfrage ersetzt.
Die Importdaten selbst bleiben für Voraussetzungen, Machbarkeit und
Zielzähler separat verfügbar.

## UI-Steuerung

### Gemeinsame Statuskomponente

Der Status wird als kompaktes Auswahlfeld mit Symbol und Text dargestellt:

- `· offen`
- `◐ in Arbeit`
- `✓ erledigt`

Das Auswahlfeld enthält drei Zustände:

- Offen
- In Arbeit
- Erledigt

Eine manuelle Angabe wird dezent durch den goldenen Feldrand und eine
Rücksetzen-Aktion gekennzeichnet. Ein sichtbares „Import“-Label wird nicht
angezeigt; die Rücksetzen-Aktion verwendet wieder den Importstatus. Symbol und
Text bleiben immer sichtbar.

### Kartenliste

Das Statussymbol links und der Statusbereich bleiben ein eigener Klickbereich.
Ein Klick auf den Aufgabennamen öffnet weiterhin das Detail. Dadurch wird die
bestehende Zeilenauswahl nicht unbeabsichtigt ausgelöst.

### Aufgabendetail

Die aktuelle Statuszeile wird erweitert:

```text
Stufe 140 · von Cána · Angmar · Eriador · [◐ In Arbeit ▾] ⓘ
```

Das Info-Symbol erklärt den manuellen Status und die Importregel.

### Aufgabenfinder

Der bereits rechts angezeigte Status wird als Button umgesetzt:

```text
Sturm auf Gwathrenost                         ◐ In Arbeit ▾
```

Die Statusfilter verwenden weiterhin den effektiven Status.

### Detailseiten und Quellenlisten

Die vorhandene Statusanzeige wird um dieselbe Komponente ergänzt. Nur dort,
wo eine einzelne Aufgabe oder Tat eindeutig identifiziert ist, wird die
Änderung angeboten.

## Hilfe und Erklärung

Es braucht keinen großen separaten Hilfebereich und keine neue Hauptseite.
Empfohlen werden drei kleine Erklärungsebenen:

1. **ⓘ neben jedem Status**
   - Desktop: Tooltip bei Hover und Fokus
   - Mobil: Erklärung nach Tippen
2. **Details-Abschnitt auf der Spielstandseite**
   Titel: „Wie funktionieren manuelle Aufgabenstatus?“
3. **Kurzer Hinweis im Statusmenü**
   > Manuelle Angaben gelten bis zum nächsten passenden Import. Der Import
   > kann sie ersetzen.

Der Hilfeabschnitt erklärt:

- Offen, In Arbeit und Erledigt
- dass „In Arbeit“ keine importierten Teilziele erzeugt
- dass der nächste Companion-Import führend ist
- dass die Angaben nur im Browser gespeichert werden
- dass der Plugin-/Charakterexport den aktuellen effektiven Stand exportiert

Die Texte werden in Deutsch, Englisch und Französisch ergänzt.

## Sicherung und Export

### Browser-Sicherung

`manuell` wird in der bestehenden JSON-Sicherung mitgesichert. Alte
Sicherungen ohne dieses Feld werden als leere manuelle Statussammlung
eingelesen.

### Plugin-/Charakterexport

Der bestehende Pluginexport soll den zum Exportzeitpunkt effektiven Status
verwenden. Eine manuell auf „Erledigt“ gesetzte Aufgabe wird also bis zum
nächsten Import auch in den Pluginexport übernommen.

Bei „In Arbeit“ können die importierten Teilzielzähler fehlen. Der Export darf
deshalb keine erfundenen Zähler erzeugen; er exportiert den Status ohne
Teilzielinformationen.

## Betroffene Dateien

Voraussichtlich:

- `web/speicher.js`
- `web/companion.js`
- `web/app.js`
- `web/aufgaben-filter.js`
- `web/karten-aufgabenfilter.js`
- `web/katalog.js`
- `web/auftraggeber.js`
- `web/entitaeten-listen.js`
- `web/plugin.js` beziehungsweise die Exportfunktionen in
  `web/companion.js`
- gemeinsame Status-/Katalog-CSS-Dateien
- `web/texte*.js` und `web/texte-spielstand.js`
- Companion-, Speicher- und Finder-Tests

Vor der Umsetzung müssen die tatsächlich verwendeten Statusadapter und die
aktuelle Einbindung der drei Sprachdateien noch einmal geprüft werden.

## Tests und Abnahme

Automatisierte Tests:

- alter Charakterdatensatz ohne `manuell`
- manuell offen, laufend und erledigt
- Statuswechsel und Zurücksetzen
- Import von Aufgaben löscht nur manuelle Aufgabenstatus
- Import von Taten löscht nur manuelle Tatenstatus
- Import ohne `questsStatus.xml` oder `deedsStatus.xml` löscht den Bereich
  nicht
- Sicherung und Wiederherstellung
- Pluginexport mit effektivem Status
- Finder- und Kartenfilter verwenden denselben Status

Browserprüfung in DE, EN und FR:

- Kartenansicht Desktop und Mobil
- Finder Desktop und Mobil
- Detailseite
- Charakterwechsel
- Import nach manuellen Änderungen
- Sicherung und Pluginexport

## Umsetzungsschritte

1. Gemeinsame Status- und Speicherlogik in `speicher.js` festlegen.
2. Importzusammenführung mit bereichsweisem Löschen manueller Angaben
   umsetzen.
3. Statuskomponente und Info-Erklärung bauen.
4. Kartenliste und Aufgabendetail anschließen.
5. Aufgabenfinder und Detail-/Quellenlisten anschließen.
6. Sicherung und Pluginexport anpassen.
7. Übersetzungen ergänzen.
8. Unit-, Import- und Browserprüfungen durchführen.
9. Projekt-TODO unter `docs/todos/` mit den konkreten Abnahmepunkten anlegen
   beziehungsweise nach der Umsetzung aktualisieren.

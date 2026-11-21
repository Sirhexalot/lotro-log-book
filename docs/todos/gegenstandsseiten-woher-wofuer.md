# Konzept: Gegenstandsseiten mit „Woher“ und „Wofür“

Stand: 20.11.2026
Projekt: LOTRO Log Book
Status: Gegenstandsseiten umgesetzt; Tauschhändler, Behälter und Zerlegung
sind modelliert und warten auf die Anzeige (Datenmodell:
[tausch-behaelter-zerlegung.md](../datenraum/tausch-behaelter-zerlegung.md))

## 1. Anlass

Auf Gegenstandsseiten können unter „Woher“ sehr viele Aufgaben erscheinen.
Die Gegenstandssuche besitzt bereits Filter, die Quellenliste auf der
Gegenstandsseite aber nicht. Zusätzlich kann ein Gegenstand gleichzeitig
Quellen haben und in Rezepten verwendet werden.

Beispiele:

- `7005FD7A` – „Essenz des lebhaften Erkunders“-Kiste: drei Aufgabenquellen.
- `7001C51E` – „Armbrust der Kraft des Goldenen Heeres“: Verwendung in einem
  Rezept als kritischer Erfolg; diese Beziehung wird derzeit nicht vollständig
  als Herstellung angezeigt.

## 2. Ziel

Eine Gegenstandsseite soll auf einen Blick beantworten:

1. **Woher bekomme ich den Gegenstand?**
2. **Wofür brauche ich den Gegenstand?**
3. **Welche Eigenschaften und Zusammenhänge hat er?**

Die Seite soll bei wenigen Einträgen ruhig bleiben und bei vielen Einträgen
such- und filterbar werden. Quellen und Verwendungen dürfen nicht in einer
gemeinsamen, missverständlichen Liste vermischt werden.

## 3. Quantitative Grundlage

Für die Reiter sind drei Datenmengen zu unterscheiden:

- **152.088** benannte Items im vollständigen DAT-Export
- **52.798** Items in der aktuellen Web-Gegenstandssuche
- **40.755** Items mit ausführlichen Ausrüstungsdetails

Die Reiterlogik richtet sich nach den **52.798 Items der Websuche**.

### „Woher“

Mindestens eine belegte Quelle haben **16.032 Items**:

- **6.564** als Aufgaben-/Tat-Belohnung
  - 6.269 mit Aufgabenquellen
  - 442 mit Tatenquellen
  - 147 mit Aufgaben und Taten
- **8.410** als Rezeptergebnis
  - 6.707 normales Ergebnis
  - 4.084 kritisches Ergebnis
  - 2.381 in beiden Formen
- **2.693** mit Händlerzuordnung im Webbestand
  - Der vollständige Händlerexport umfasst 10.805 Items.

Die Beziehungen überschneiden sich:

- 216 Items sind Belohnung und Rezeptergebnis.
- 1.208 Items sind Rezeptergebnis und Händlerware.
- 310 Items sind Belohnung und Händlerware.
- 99 Items gehören allen drei Gruppen an.

### „Wofür“

Als Rezeptzutat werden **1.509 Items** verwendet:

- **1.370** normale Zutaten
- **149** optionale Zutaten
- 10 Items in beiden Rollen

Die Anzahl der Verwendungen ist stark verteilt:

- Median: 3 Rezepte
- 90 Prozent der Items: höchstens 41 Rezepte
- 95 Prozent: höchstens 76 Rezepte
- Maximum: 4.095 Rezepte

Für „Wofür“ sind Filter daher nicht nur für Einzelfälle, sondern für die
große Ausreißergruppe notwendig.

### Überschneidung

**1.271 Items** haben gleichzeitig mindestens eine „Woher“-Quelle und eine
„Wofür“-Verwendung. Bei diesen Items sind getrennte Reiter besonders
sinnvoll.

Die übrigen Items sollen nicht automatisch leere oder bedeutungslose Reiter
bekommen.

## 4. Datenabhängiges Reitermodell

Die Detailseite erhält eine lokale Abschnittsnavigation:

```text
[Übersicht] [Woher · n] [Wofür · n]
```

Die Reiter werden nur eingeblendet, wenn der jeweilige Bereich tatsächlich
Daten besitzt:

- keine Quelle: kein „Woher“
- keine Verwendung: kein „Wofür“
- Quelle und Verwendung: beide Reiter
- keine Beziehung: nur „Übersicht“

Die Zahl am Reiter zählt immer **alle tatsächlichen Einträge dieses Bereichs**,
nicht nur die Anzahl der Quellgruppen.

Beispiel:

```text
Woher · 3
  Aufgaben · 2
  Herstellung · 1
```

„Woher · 2“ wäre hier falsch, auch wenn es nur zwei Aufgabeneinträge gibt.

Die Reiter sind Sprungziele beziehungsweise eine sichtbare Abschnittswahl,
keine ausschließlich JavaScript-gesteuerte Einseitenanwendung. Alle Inhalte
bleiben im HTML erreichbar. Ohne JavaScript funktionieren Links, Überschriften
und Listen weiterhin.

### Übersicht

Enthält:

- Gegenstandsname, Icon, Qualität und Stufe
- Beschreibung
- Werte und Kampfwerte
- Bindung, Einzigartig, Skalierung
- Klasse/Beruf und Essenzplätze
- Set und Setboni
- Ausprägungen/Varianten

Sets, Varianten und Werte erhalten **keine eigenen Hauptreiter**. Sie gehören
zur Übersicht und werden nur als Abschnitte angezeigt, wenn Daten vorhanden
sind. Im Webbestand betreffen Sets etwa 10.661 Items und gleiche Namen mit
mehreren Ausprägungen etwa 19.370 Items; daraus ergibt sich aber keine
zusätzliche Suchrichtung wie bei Quelle und Verwendung.

### Woher – nur bei belegten Quellen

Enthält nur Wege, auf denen der Gegenstand erlangt werden kann:

- Aufgaben
- Taten
- feste Belohnungen
- wählbare Belohnungen
- Händler
- Tauschhändler
- Herstellung
- später gegebenenfalls Instanzen oder Beutetabellen, falls eindeutig belegt

### Wofür – nur bei belegten Verwendungen

Enthält nur Verwendungen:

- normale Rezeptzutat
- optionale Rezeptzutat
- Gegenstand als normales Rezeptergebnis
- Gegenstand als kritisches Rezeptergebnis
- gegebenenfalls Set- oder Systemverwendung, wenn sie belastbar aus den
  Spieldaten hervorgeht

Ein globaler Filter darf niemals Aufgabenquellen und Rezeptverwendungen
gleichzeitig filtern.

## 5. „Woher“ im Detail

### Gruppierung

Die Quellen werden nach Art gruppiert:

```text
Woher · 8 Quellen

Aufgaben · 5
  Aufgabe …
  Aufgabe …

Taten · 1
  Tat …

Händler · 1
  Händler … · Gebiet …

Herstellung · 1
  Rezept …
```

Eine Gruppe wird nur angezeigt, wenn sie mindestens einen belegten Eintrag
enthält. Keine künstlichen Aussagen wie „keine Quelle bekannt“ erzeugen.

### Aufgabenfilter

Bei mehr als einer sinnvollen Anzahl an Aufgaben erscheint direkt in der
Gruppe ein kompakter Filter:

- Suche im Aufgabennamen
- Region
- Gebiet
- Aufgabenstufe
- Aufgabenart/Thema
- Fortschritt, wenn ein Spielstand importiert ist
- Sortierung nach Name oder Stufe

Die Filter gelten ausschließlich für die Aufgaben-Untergruppe. Anfangs werden
beispielsweise 20 Einträge gezeigt; weitere Einträge erscheinen über
„Weitere anzeigen“ oder beim Nachladen.

Jede Aufgabenzeile zeigt möglichst:

- Aufgabentitel
- Gebiet beziehungsweise Region
- Statussymbol und Status, falls ein Spielstand vorhanden ist
- Kennzeichnung als feste oder wählbare Belohnung

Die Aufgabenliste darf nicht behaupten, dass eine wählbare Belohnung sicher
erhalten wird.

### Taten

Taten erhalten dieselbe Listenlogik wie Aufgaben, bleiben aber eine eigene
Gruppe. Die bestehende Tatenquelle und der vorhandene Tatenkatalog werden
wiederverwendet.

### Händler und Tauschhändler

Nicht nur „Beim Händler erhältlich“ ausgeben, sondern:

- lokalisierter Händlername
- Händlerart beziehungsweise Tätigkeit, sofern vorhanden
- Gebiet/Region, sofern der Standort eindeutig belegt ist
- Link „Auf der Karte öffnen“, sobald eine belastbare Position vorhanden ist

Mehrere Händler werden zusammengefasst, nicht als identische Wiederholungen
ausgegeben.

## 6. „Wofür“ im Detail

### Rezeptliste

Jede Rezeptzeile enthält:

- Rezeptname
- Beruf
- Stufe
- Handwerkskategorie
- normale oder optionale Zutat
- benötigte Menge
- Lernstand, sofern importiert

Beispiel:

```text
Armbrust der Schlagkraft
Drechsler · Stufe 6 · Fernkampfwaffen
```

### Ergebnisarten

Normales und kritisches Ergebnis müssen unterschieden werden:

```text
Normales Ergebnis: …
Kritischer Erfolg: Armbrust der Kraft des Goldenen Heeres
```

Damit wird `7001C51E` korrekt mit dem Rezept `7001C164` verbunden, obwohl der
Gegenstand nur im Feld `CraftRecipe_CriticalResultItem` steht.

### Rezeptfilter

Für viele Verwendungen sind folgende Filter sinnvoll:

- Beruf
- Stufe
- Kategorie
- normale Zutat
- optionale Zutat
- gelernt / nicht gelernt / fremder Beruf

Die vorhandene Query-Logik wie `recipe.eigene=0` bleibt erhalten und wird
sichtbar als Umschalter dargestellt:

```text
[Alle Rezepte] [Meine Berufe] [Nicht gelernt]
```

## 7. Datenmodell und Quellen

### Bereits im eigenen DAT-Export vorhanden

Der vollständige Item-Export umfasst rund 152.000 benannte Gegenstände und
liefert unter anderem:

- Name und Beschreibung in DE/EN/FR
- Kategorie, Slot, Waffen-/Rüstungsart
- Qualität, Stufe und Mindeststufe
- Stats, Rüstung, DPS, Schaden und Geschwindigkeit
- Bindung, Einzigartig, Skalierung
- erforderliche Klasse und Essenzplätze
- Setzugehörigkeit
- normale und kritische Rezeptergebnisse
- Zutaten und optionale Zutaten
- Icons

### Quellenexporte

Vorhandene Datenstände:

- 1.469 Händler
- 10.805 Gegenstände mit Händlerzuordnung
- 820 Gegenstände im aktuellen Ausrüstungsbestand mit Händler-IDs
- 7.924 Rezepte
- 4.230 Rezepte mit Händler-/Tauschquellen
- Quest-/Tat-Belohnungstabellen mit festen und wählbaren Gegenständen

Diese Daten sollen in einer gemeinsamen, nach Quellart getrennten
Viewmodel-Schicht zusammengeführt werden. Die Gegenstandsseite darf nicht
selbst unterschiedliche Rohdatenquellen interpretieren.

### Noch ausstehende Nutzung

1. Händlerdaten mit Namen und Standorten auf der Gegenstandsseite verwenden.
2. Tauschhändler aus `Barter_ItemListArray` ergänzen.
3. Rezeptquellen auf Rezept- und Gegenstandsseiten verbinden.
4. Feste und wählbare Quest-/Tat-Belohnungen unterscheiden.
5. Kritische Rezeptergebnisse als „hergestellt durch“ ausgeben.
6. Händlerpositionen aus dem DAT-Positions-Export nur bei belastbarer
   Zuordnung verlinken.

## 8. Rolle der LOTRO-Interface-Plugins

Item Treasury beziehungsweise die gepflegte Item-Treasury-Datenbank kann
für Abgleich und Lückenprüfung dienen. Sie enthält vor allem:

- Item-ID
- Name und Beschreibung
- Kategorie und Qualität
- Haltbarkeit
- magisch/einzigartig
- Icon- und Hintergrund-ID

Sie ist keine geeignete Primärquelle für Aufgaben-, Rezept-, Händler- oder
Tauschbeziehungen. Die eigene DAT-Auswertung bleibt die maßgebliche Quelle.

Item Scanner und Item-Link-Decoding sind nützlich für:

- neu entdeckte oder unbekannte Item-IDs
- aktuelle Patch-/Bullroarer-Gegenstände
- Abgleich von Item-ID, Name und Tooltip

Sie liefern aber keinen vollständigen Ersatz für die server-/DAT-seitigen
Beziehungstabellen. Fremde Plugin-Daten werden nicht ungeprüft in die Website
übernommen.

## 9. Umsetzungsphasen

### Phase 1: Datenabhängige Reiter und Quellenfilter

- [x] lokale Reiter/Anker „Übersicht“, „Woher“, „Wofür“
- [x] Reiter nur bei vorhandenen Daten einblenden
- [x] Zähler je Reiter aus den vorhandenen Einträgen berechnen
- [x] Gruppierung von „Woher“ nach Aufgaben, Taten, Vorkommen, Händler und Herstellung
- [x] einfacher Namensfilter für Aufgabenquellen sowie Namens-/Ergebnisfilter
  für Herstellungsbeziehungen
- Aufgabenfilter für Region, Gebiet, Stufe und Fortschritt
- Begrenzung langer Listen mit „Weitere anzeigen“
- [x] DE/EN/FR-Texte und mobile Grunddarstellung

Die lokale Navigation ist als HTML-Anker umgesetzt. Die ersten Filter laufen
ohne JavaScript-Abhängigkeit für die Liste; feinere Aufgabenfacetten folgen
mit den strukturierten Quellfeldern.

### Phase 2: Datenkorrekturen

- [x] normales und kritisches Rezeptergebnis im Itemmodell verbinden
- [x] normale und optionale Zutaten im Itemmodell kennzeichnen
- [x] Accountbindung von normaler Aufnahmbindung im Itemmodell unterscheiden
- feste und wählbare Belohnungen unterscheiden
- bestehende Filterzustände und Rücklinks erhalten

Die neuen Rückwärtsbeziehungen liegen in `daten/items.json` zunächst parallel
zu den Legacy-Feldern: `herstellung` enthält `regular_result` und
`critical_result`, `verwendung` enthält `ingredient` und
`optional_ingredient`. Die alte `b`-Bindung und die Felder `rezepte`/`zutat`
bleiben für die Übergangszeit erhalten.

### Phase 3: Händler und Tausch

- [x] konkrete Händlernamen aus dem Companion-Export
- [x] Händlerbeziehungen auf die bestehenden 52.798 Web-Item-IDs begrenzen
- [x] Händler als eigene kartenfähige Entität mit Itemlinks
- [ ] Tauschhändler und Barterquellen für direkt sichtbare Gegenstandsseiten
- [ ] Behälter als Quelle (Felder, Kisten, Reliktbehälter)
- [ ] Zerlegungsergebnis am Gegenstand
- Gebiet/Region
- Kartenlink nur bei eindeutigem Standort
- gegebenenfalls Filter nach Gebiet und Quellart

Der Vendor-Export belegt 2.693 bestehende Web-Items mit mindestens einem
konkreten Händler. Die vorhandenen Tauschquellen betreffen im aktuellen Export
keine dieser öffentlichen Gegenstandsseiten; deshalb werden sie nicht als
scheinbare Quellen angezeigt.

Händlerseiten verwenden die NPC-ID des Spiels als stabile ID. Der aktuelle
Export liefert 1.469 Händler, davon 1.466 mit Standort und 1.092 mit
zuordenbarer Webkarte. Händler erscheinen damit auf Itemseiten als Links und
zeigen ihrerseits den Kartenstandort sowie das belegte Warenangebot.

### Phase 4: zusätzliche Spielinhalte

- Prüfung von Kisten-/Auswahlgegenständen
- Untersuchung von Beutetabellen
- neue DAT-Stichproben nach Spielupdates
- Abgleich unbekannter Items mit Item Treasury/Item Scanner

## 10. Nicht Teil der ersten Umsetzung

- Besitzfilter für Gegenstände: Der Charakterimport enthält keinen vollständigen
  Taschen-/Bankbestand.
- behauptete Drop-Wahrscheinlichkeiten oder Mengen
- erfundene Händlerpositionen
- automatische Aussage, dass eine wählbare Belohnung sicher ist
- vollständige Öffnung der Inhalte von Kisten ohne belegte DAT-Beziehung
- Übernahme fremder Wiki-/Plugin-Listen als Website-Primärdaten

## 11. Abnahmekriterien

- Ein Gegenstand mit nur wenigen Quellen bleibt übersichtlich.
- Ein Gegenstand mit vielen Aufgaben besitzt einen funktionierenden
  Aufgabenfilter.
- Ein Gegenstand mit „Woher“ und „Wofür“ ist über beide Reiter klar
  navigierbar.
- Ein Gegenstand ohne Quellen erhält keinen leeren „Woher“-Reiter.
- Ein Gegenstand ohne Rezeptverwendung erhält keinen leeren „Wofür“-Reiter.
- Die Reiterzahl zählt alle Einträge, nicht nur Gruppen.
- Aufgaben und Rezepte werden nie in einer gemeinsamen Liste vermischt.
- `7005FD7A` zeigt seine drei Aufgaben unter „Woher“.
- `7001C51E` zeigt `7001C164` als kritisches Rezeptergebnis.
- Feste und wählbare Belohnungen sind unterscheidbar.
- Händler und Tauschhändler werden nur mit belegten Daten angezeigt.
- Seiten funktionieren ohne JavaScript und in DE/EN/FR.
- Filter, Zurücklinks und URL-Zustände bleiben erhalten.
- Keine Änderung an bestehenden Karten-, Aufgaben- oder Gegenstandssuchfiltern
  ohne eigenen Abnahmetest.

## 12. Datenstand 20.11.2026: drei Quellen und ergänzende Client-Items

Modell, Schemata und Grenzen stehen in
[`docs/datenraum/tausch-behaelter-zerlegung.md`](../datenraum/tausch-behaelter-zerlegung.md);
der Entitätenvertrag führt die Gruppen bereits als `open`.

### Tausch (`barters.xml`)

- 1.096 Tauschhändler, 3.469 Angebotsprofile (12.360 Verweise), 42.594
  Angebote mit 58.933 Abgaben und 42.590 Gaben.
- 36.096 verschiedene Gaben; **11.586** davon haben eine Katalogseite. Die
  übrigen 24.510 bleiben Namen ohne Link.
- 1.095 Händler haben eine Weltposition; 159 sind klassenbeschränkt, 565
  Profile verlangen eine Fraktion (`"<id>;<stufe>"`), 505 eine Aufgabe.
- Die bisherigen `tausch`-Einträge in `daten/items.json` stammen aus dem
  Rezeptquellen-Export und werden additiv zusammengeführt, nicht ersetzt.

### Behälter (`containers.xml`)

- 6.262 Behälter, davon 5.735 gewöhnliche und 527 Reliktbehälter.
- 4.626 mit Trophy-Liste, 926 mit Treasure-Liste, 494 mit beiden, 1.204 ohne
  Liste (bleiben ohne Pool).
- Auflösung über denselben Loot-Graphen wie die Instanz-Truhen
  (`tools/build_instanz_beute.py`, künftig `tools/lootgraph.py`).

### Zerlegung (`disenchantments.xml`)

- 27.333 Zeilen, 10.315 Quellen mit Katalogseite.
- 26.341 mit Ergebnis, 992 ohne; nur **45 verschiedene** Ergebnisse, sämtlich
  Umtauschgutscheine („Receipt of …“), 22 davon im Katalog.
- Zerlegen ist damit kein Beute-Ersatz und wird als eigene Gruppe geführt.

### Ergänzende Items aus dem eigenen Client-Export

- `items-2026-11-08/items.json` enthält 152.088 Gegenstände. Alle geprüften
  Tausch-, Zerlegungs- und Instanzbeute-IDs sind darin vorhanden.
- 27.652 dieser IDs fehlen im kuratierten Webkatalog. Ein geplanter schlanker
  Zusatzbestand liefert Name, Qualität, Stufe und Icon, ohne Suchtreffer oder
  Katalogseiten dafür zu erzeugen.
- Der Katalogeintrag gewinnt immer. Companion-Labels sind dafür nicht nötig.

### Ergänzte Abnahmekriterien

- Tauschangebote zeigen Abgaben mit Menge und Gaben mit Menge; fehlende Menge
  gilt als 1.
- Ein Gegenstand ohne Katalogseite wird genannt, aber nicht verlinkt.
- Behälter und Zerlegung erscheinen nur als Quelle bzw. Ergebnis, nie als
  eigene Entität.
- Behältnisse ohne Loot-Liste und Zerlegungen ohne Ergebnis erzeugen keine
  Zeile.
- Die Händlerseite trennt „Warenangebot“ (Silber) und „Tauschware“
  (Gegenstände).

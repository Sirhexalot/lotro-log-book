# TODO SEO: Mobile-Performance der Kartenansicht

Stand: 16.11.2026

## Umsetzungsstand

- [x] Unabhängige Karten-Startdaten (`gebiete` und `fortschritt`) werden
      parallel geladen.
- [x] Initiale Ziellisten werden für Aufgaben mit Auftraggeber nicht doppelt
      geladen; vollständige Ziele kommen bei der Auswahl aus `daten-*.js`.
- [x] Beschreibungen in den Initialdaten sind auf die sichtbare Vorschau
      begrenzt; vollständige Texte kommen bei der Auswahl nach.
- [x] Kartenbild mit festen 4:3-Abmessungen, asynchroner Dekodierung und hoher
      Ladepriorität versehen.
- [x] Unnötige erneute CSS-Anforderung nach dem Laden von `stand.js` entfernt.
- [x] ResizeObserver- und Resize-Ereignisse für Kartenlayout und Marker
      zusammengefasst.
- [x] Lokale Browserprüfung der Kartenansicht mit direkter Gebietsauswahl,
      Kartenbild, Markern und Terrain-Umschalter durchgeführt.

## Ausgangslage

PageSpeed Insights, Mobil, Bericht vom 16.11.2026:

| Messwert | Ergebnis | Bewertung |
| --- | ---: | --- |
| Leistung | **40/100** | kritisch |
| Barrierefreiheit | **96/100** | gut |
| Best Practices | **100/100** | gut |
| SEO | **100/100** | gut |
| First Contentful Paint | **2,6 s** | zu langsam |
| Largest Contentful Paint | **16,6 s** | sehr kritisch |
| Total Blocking Time | **1.330 ms** | kritisch |
| Speed Index | **6,6 s** | zu langsam |
| Cumulative Layout Shift | **0** | gut |

Weitere Hinweise aus dem Bericht:

- Hauptthread-Aufwand: etwa **3,1 s**
- JavaScript-Ausführungszeit: etwa **2,0 s**
- nicht verwendetes JavaScript: geschätzt **99 KiB**
- JavaScript-Komprimierung: geschätzt **11 KiB**
- erzwungener dynamischer Umbruch durch GTM: **68 ms**
- mögliche Bildkomprimierung bei einzelnen Landschaftsbildern: etwa **7,5 KiB**
  und **5,6 KiB**

PageSpeed zeigte als Ergebnis weiterhin:

```text
https://llb.sirhexalot.de/en/map/
```

Obwohl im Eingabefeld `https://sirhexalot.de/` stand. Das muss als erstes
geklärt werden. Startseite und Kartenansicht dürfen nicht mit einem Messwert
verwechselt werden.

## Ziel

Die Kartenansicht soll auf Mobilgeräten sichtbar und benutzbar werden, bevor
alle nicht notwendigen JavaScript-, Filter-, Marker- und Fortschrittsdaten
geladen und verarbeitet sind.

### Zielwerte

#### Erste Verbesserungsstufe

- LCP unter **4 Sekunden**
- TBT unter **600 ms**
- FCP unter **2 Sekunden**
- Speed Index unter **4 Sekunden**
- PageSpeed-Leistung mindestens **70**

#### Zweite Verbesserungsstufe

- LCP unter **2,5 Sekunden**
- TBT unter **300 ms**
- PageSpeed-Leistung mindestens **85**

CLS bleibt bei **0**.

## Arbeitspakete

### 1. Testadresse und Messgrundlage klären

- [ ] Prüfen, warum `sirhexalot.de/` im PageSpeed-Ergebnis auf
      `/en/map/` beziehungsweise `/en/map/` landet.
- [ ] Weiterleitungen und Canonical der Startseite prüfen.
- [ ] Drei getrennte Testziele festlegen:
  - [ ] `/`
  - [ ] `/de/karte/`
  - [ ] `/en/map/`
- [ ] Für jede Seite einen eigenen mobilen PageSpeed-Bericht erzeugen.
- [ ] Pro URL mindestens drei Messungen unter identischen Bedingungen
      durchführen.
- [ ] Medianwerte dokumentieren, nicht nur einen Einzelwert verwenden.
- [ ] Vorher-Nachher-Vergleich mit derselben URL und denselben Einstellungen
      durchführen.

**Abnahme:** Es ist eindeutig dokumentiert, welche URL für welchen Messwert
verantwortlich ist.

### 2. LCP-Element identifizieren

Nicht vermuten, sondern im Lighthouse-Bericht und im Chrome-Trace feststellen:

- [ ] Welches Element ist das LCP-Element?
- [ ] Ist es die Kartenfläche, ein Kartenbild, ein Hero-Bild, eine Überschrift
      oder ein erst durch JavaScript erzeugtes Element?
- [ ] Ladezeit in Serverantwort, Ressourcenwartezeit, Download,
      Rendering-Verzögerung und JavaScript-Verzögerung aufteilen.
- [ ] Prüfen, ob das LCP-Element erst nach dem Karten- oder App-Start erzeugt
      wird.
- [ ] Den konkreten Request und den konkreten DOM-Knoten im TODO-Ergebnis
      festhalten.

**Abnahme:** Für das LCP-Element gibt es einen konkreten Ladepfad und eine
gemessene Ursache der Verzögerung.

### 3. Kritischen Erstinhalt vor JavaScript anzeigen

- [ ] Überschrift, Seitentitel und grundlegende Kartenhülle direkt im HTML
      bereitstellen.
- [ ] Einen sinnvollen sichtbaren Erstzustand ohne vollständigen App-Start
      sicherstellen.
- [ ] Kartenrahmen und Seitenlayout mit festen Dimensionen vorbereiten.
- [ ] Keine leere weiße Fläche während der Karteninitialisierung anzeigen.
- [ ] Nicht notwendige Filter, Marker, Fortschrittsdaten und Detailbereiche
      erst nach dem ersten sichtbaren Inhalt laden.
- [ ] Prüfen, ob der Kartenstart derzeit durch große Daten-JavaScript-Dateien
      blockiert wird.

**Abnahme:** Der Nutzer sieht innerhalb der ersten Sekunden Überschrift,
Kartenrahmen und eine sinnvolle Grundansicht.

### 4. LCP-Bild und Kartenbild optimieren

- [ ] Das tatsächliche LCP-Bild im Trace identifizieren.
- [ ] Für dieses Bild `loading="lazy"` entfernen.
- [ ] `fetchpriority="high"` nur für das tatsächliche LCP-Bild einsetzen.
- [ ] Falls erforderlich, gezielt `<link rel="preload">` verwenden.
- [ ] Responsive Bildquellen mit passenden mobilen Abmessungen bereitstellen.
- [ ] WebP-Größe und Kompression für die mobile Darstellung prüfen.
- [ ] Bildabmessungen immer explizit angeben.
- [ ] Für nicht sichtbare Landschaftskacheln Lazy Loading beibehalten.
- [ ] Die von PageSpeed genannten Landschaftsbilder prüfen und nur bei
      tatsächlichem Nutzen weiter komprimieren.
- [ ] Prüfen, ob beim Start unnötig mehrere Kartenbilder geladen werden.

**Abnahme:** Das LCP-Bild wird früh geladen, ohne dass übrige Kartenbilder den
kritischen Pfad blockieren.

### 5. JavaScript des ersten Seitenaufbaus reduzieren

Insbesondere Kartenanwendung und Dateninitialisierung prüfen:

- [ ] Ermitteln, welche JavaScript-Dateien vor dem ersten Paint geladen werden.
- [ ] Große Datenblöcke identifizieren, die für die erste Ansicht nicht
      benötigt werden.
- [ ] Karten-, Marker-, Vorkommen-, Fortschritts- und Filterdaten nach Bedarf
      laden.
- [ ] Nicht sichtbare Gebiete erst beim Öffnen nachladen.
- [ ] Initiale Sortierung und Filterung auf die sichtbaren Daten begrenzen.
- [ ] Wiederholte DOM-Abfragen und vollständige Listen-Neuberechnungen
      reduzieren.
- [ ] Lange synchrone Aufgaben im Main Thread zerlegen.
- [ ] Nicht notwendige Verarbeitung mit `requestIdleCallback` oder einem
      vergleichbaren späteren Zeitpunkt ausführen.
- [ ] Prüfen, ob einzelne Funktionen mehrfach beim Kartenstart laufen.
- [ ] Nicht verwendeten JavaScript-Code aus dem initialen Ladepfad entfernen.
- [ ] Komprimierung und Minifizierung der ausgelieferten JavaScript-Dateien
      prüfen.

**Abnahme:** Kein unnötiger Initialisierungsschritt blockiert den Main Thread;
die TBT sinkt messbar.

### 6. Erzwungene Layout-Neuberechnungen beseitigen

PageSpeed meldet dynamische Umbrüche, unter anderem ausgehend von GTM.

- [ ] Im Chrome-Trace alle Forced-Reflow-Aufrufer erfassen.
- [ ] Lesen und Schreiben von Layout-Eigenschaften trennen:
  - [ ] `offsetWidth`
  - [ ] `offsetHeight`
  - [ ] `getBoundingClientRect()`
  - [ ] `scrollWidth`
  - [ ] `scrollHeight`
- [ ] Karten- und Legendenlayout nicht mehrfach synchron messen.
- [ ] Bekannte Größen über CSS-Variablen oder feste Layoutwerte bereitstellen.
- [ ] DOM-Änderungen bündeln.
- [ ] GTM beibehalten, aber seinen Einfluss auf den Erstaufbau messen.
- [ ] Prüfen, ob GTM nach dem ersten sichtbaren Inhalt geladen werden kann,
      ohne das gewünschte Tracking zu verlieren.

**Abnahme:** Der Forced-Reflow-Hinweis ist deutlich reduziert; Kartenwechsel
und Filterwechsel bleiben funktional.

### 7. Daten- und Karteninitialisierung aufteilen

- [ ] Prüfen, ob beim Aufruf einer Karte der komplette Aufgabenbestand geladen
      wird.
- [ ] Prüfen, ob alle Gebietskarten geladen werden, obwohl nur eine sichtbar
      ist.
- [ ] Prüfen, ob Marker erst nach Sichtbarkeit der Karte berechnet werden
      können.
- [ ] Kartenbild, Marker und Legende in getrennten Schritten initialisieren.
- [ ] Zuerst den sichtbaren Kartenrahmen rendern.
- [ ] Danach sichtbare Marker laden.
- [ ] Danach optionale Informationen laden:
  - [ ] Vorkommen
  - [ ] Auftraggeber
  - [ ] Fortschritt
  - [ ] zusätzliche Filterdaten
- [ ] Direkte Kartenlinks, Gebietswahl und gespeicherte Filter erhalten.

**Abnahme:** Die Karte ist früh sichtbar; optionale Inhalte erscheinen
nachgelagert, ohne die erste Darstellung zu blockieren.

### 8. SEO- und Funktionsschutz

Die SEO-Grundlagen sind bereits erfolgreich und dürfen nicht verschlechtert
werden:

- [ ] SEO-Score bleibt bei mindestens **100** oder unverändert stabil.
- [ ] Canonical bleibt korrekt.
- [ ] Hreflang bleibt für DE/EN/FR korrekt.
- [ ] Überschrift und wesentlicher Text bleiben ohne JavaScript erreichbar.
- [ ] Karten- und Kataloglinks bleiben crawlbar.
- [ ] Keine wichtige Information ausschließlich in nachgeladenem JavaScript
      verstecken.
- [ ] Keine neue Soft-404 erzeugen.
- [ ] Sitemaps und `robots.txt` bleiben korrekt.
- [ ] GTM und GoatCounter nicht ungefragt entfernen.
- [ ] Keine Spielstände oder Companion-Daten an Server oder Analytics senden.

### 9. Testmatrix

#### URLs

- [ ] `/`
- [ ] `/de/karte/`
- [ ] `/en/map/`
- [ ] `/fr/carte/`

#### Geräte

- [ ] Mobil
- [ ] Desktop

#### Zustände

- [ ] ohne Spielstand
- [ ] mit synthetischem Spielstand
- [ ] direkte Gebietsauswahl
- [ ] Kartenwechsel
- [ ] Filter öffnen
- [ ] Vorkommen einschalten
- [ ] Auftraggeber ein- und ausblenden
- [ ] Detailansicht öffnen
- [ ] Zurück-Navigation

#### Technische Prüfungen

- [ ] Python-Test-Suite
- [ ] SEO-Tests
- [ ] Katalogprüfung
- [ ] Browserprüfung in DE/EN/FR
- [ ] drei PageSpeed-Messungen pro Ziel-URL

## Reihenfolge

1. [ ] Testadresse und echte LCP-Seite klären
2. [ ] Chrome-Trace erstellen und LCP-Element identifizieren
3. [ ] Erstinhalt und LCP-Bild optimieren
4. [ ] JavaScript-Initialisierung aufteilen
5. [ ] Forced Reflows reduzieren
6. [ ] Optionale Kartendaten nachladen
7. [ ] SEO und Funktionen prüfen
8. [ ] PageSpeed erneut messen und Ergebnisse dokumentieren

## Abgrenzung

Dieses TODO behandelt die technische Lade- und Renderleistung der
Kartenansicht. Die SEO-Grundlagen selbst sind bereits vorhanden und werden
nicht neu konzipiert:

- SEO-Metadaten
- Canonical und Hreflang
- Sitemaps
- `robots.txt`
- stabile Entitäts-URLs
- mehrsprachige Seitentexte

Diese Bestandteile werden nur als Regressionsschutz geprüft.

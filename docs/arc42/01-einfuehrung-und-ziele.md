# 1. Einführung und Ziele

LOTRO Log Book ist eine mehrsprachige Website für Inhalte und Fortschritt aus *The Lord of the Rings Online*. Der Code bietet unter anderem Aufgaben- und Tatenkarten, Katalog- und Suchseiten, Handwerk, Reisen, Abenteuer, Fraktionen, Landmarken, Instanzen und Seiten zu einzelnen Spieleinträgen. Die öffentlich verwendeten Sprachen sind Deutsch, Englisch und Französisch.

### Anforderungen und Stakeholder

Der aus Produkt und Repository belegbare Systemzweck ist, LOTRO-Spielinhalte in einer mehrsprachigen Website auffindbar zu machen und optionale persönliche Fortschrittsdaten im Browser zu verarbeiten. Sichtbare funktionale Anforderungen sind: Inhalte über Karten, Finder, Suche, Listen und Detailseiten erschließen; Beziehungen zwischen Katalogeinträgen anzeigen, soweit sie aus den Quellen hervorgehen; unterstützte Companion-Dateien lokal importieren; Releases aus vorbereiteten Daten erzeugen und übertragen.

Ein separates, freigegebenes Anforderungsdokument mit Muss-/Kann-Prioritäten und Abnahmekriterien ist im untersuchten Projektbestand nicht als maßgebliche Quelle festgestellt. Die folgenden Stakeholder sind daher aus den Architekturgrenzen abgeleitet, nicht als vollständige Organisationsanalyse zu verstehen:

| Stakeholder | Architekturinteresse | Beleg-/Offenheitsstatus |
|---|---|---|
| LOTRO-Spieler und Besucher | Inhalte finden, Karten/Filter nutzen und Details lesen | Fähigkeiten sind implementiert; formale Nutzerziele sind nicht dokumentiert |
| Besucher ohne Import | Katalog und Website ohne Plugin oder Charakterdateien nutzen | Durch öffentliche Seiten und Browsercode gestützt |
| Nutzer mit Companion-Export | Charakterstand lokal importieren und für persönliche Ansichten nutzen | Durch `web/companion.js`, `web/speicher.js` und Tests gestützt |
| Betreiber/Release-Verantwortliche | Datenstand prüfen und Release kontrolliert übertragen | Werkzeuge sind vorhanden; Rollen, Freigabeprozess und SLA sind offen |
| Daten-/Generatorpflege | Quellen und Relationen korrekt verarbeiten, unbelegte Aussagen vermeiden | Projektregeln und Audits sind vorhanden; Zuständigkeiten sind offen |
| Rechteinhaber/externe Anbieter | Regelkonforme Nutzung von Inhalten, Bibliotheken und Diensten | Vollständige Freigaben/Verträge sind nicht aus dem Anwendungscode ableitbar |

Aus der Implementierung erkennbare Architekturziele:

- **Katalogseiten nicht je Eintrag vollständig vorab als HTML ausliefern:** Python bereitet Daten und Seitenmodelle vor; PHP rendert passende Seitenmodelle zur Anfrage.
- **Große Datenmengen nicht für jede Anfrage vollständig durchsuchen:** Die Daten werden in Shards abgelegt und anhand stabiler IDs adressiert.
- **Spielerfortschritt im Browser verarbeiten:** Companion-Import und Charakterauswahl liegen im JavaScript-Speicher des Browsers.
- **Eine gemeinsame Seitenhülle und lokalisierte Pfade verwenden:** PHP/Twig und die Browseranwendung teilen Navigation, Sprachauswahl und öffentliche Sprachpfade.

Belege: `php/public/index.php`, `php/src/Data.php`, `php/src/Page.php`, `tools/build_php_data.py`, `php/src/Catalogue.php`, `web/companion.js`, `web/speicher.js`.

### Qualitätsziele (aus dem Ist-Code abgeleitet, nicht als freigegebene SLA)

| Rang | Qualitätsziel | Im Code sichtbare Umsetzung |
|---|---|---|
| 1 | Große Kataloge effizient ausliefern | Vorbereitete Shards, kompakte Relationszeilen, keine Vollkatalogsuche pro PHP-Request |
| 2 | Kanonische und echte Seitenantworten | Zentraler Router, 301 für alte/nichtkanonische Adressen, 404 für nicht vorhandene Einträge |
| 3 | Fortschritt privat im Browser halten | Companion-Verarbeitung und Mehrcharakterspeicher clientseitig; Release setzt `fortschritt.js` leer |
| 4 | Drei Sprachpfade konsistent bedienen | Sprache in URL und lokalisierte Katalog-/Labelartefakte |
| 5 | Verknüpfungen reproduzierbar aus Daten ableiten | Build-Viewmodels und Indizes; Generator-/Vertragstests |

Der Code setzt keine messbaren Latenz-, Verfügbarkeits-, RPO/RTO- oder Accessibility-SLAs. Diese Ziele dürfen daher nicht als erfüllte Betriebszusagen verstanden werden.

Architekturzielkonflikte sind insbesondere: lokaler Charakterstand schützt vor serverseitiger Speicherung, ist dafür browser-/profilgebunden; vorbereitete Kataloge begrenzen Requestarbeit, erhöhen aber Buildkopplung und Artefaktabstimmung; crawlbare HTML-Seiten und interaktive Filter werden kombiniert, deren Fallbackqualität jedoch je Oberfläche geprüft werden muss.

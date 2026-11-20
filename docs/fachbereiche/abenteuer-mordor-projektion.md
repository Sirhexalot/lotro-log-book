# Ungefähre Gebietspunkte auf der Mordor-Zeichnung

Die Zeichnung 268453620 hat nur Pixelgrenzen, keine geografische Projektion.
Vier gleichweltliche Links verbinden geografische Rahmenmittelpunkte mit
Pixelpositionen: Ödland, Nord-Ithilien, Gorgoroth und Morgultal.

`mordor_projection()` passt X und Y jeweils linear an. Mittlere Abweichung
im geprüften Client: 24,2 Pixel; Maximum: 47,7 Pixel bei 1024 × 768.
Das sind ungefähre Gebietsmittelpunkte, keine exakten Questpositionen.

Der Fallback gilt nur für Mordor: mindestens vier gleichweltliche Anker,
positive Achsenfaktoren, mittlerer Fehler ≤ 40 und maximaler Fehler ≤ 80 Pixel.
Explizite Spielkartenlinks haben Vorrang.

Zusätzliche Punkte: Udûn, Dor Amarth, Lhingris, Agarnaith und Talath Úrui.
`positions.derived` markiert sie; Hover und zugänglicher Name nennen die
ungefähre Gebietsmitte in DE/EN/FR. Der überlagernde Gorgoroth-Sammelpunkt
entfällt; seine Einträge bleiben in der Gebietsliste erreichbar.

Keine Projektion für historische Varianten, unbenannte Karten oder andere
Spielregionen (Draugardh: Region 6). Nargroths eigener Rahmen liegt abseits
der Landschaft und würde außerhalb des Bildes landen; kein erfundener Pin.
Vorhandene direkte Links und andere Sammelpunkte bleiben erhalten.

Prüfung: `python3 -m unittest tests.test_abenteuer_projektion`; Browserprüfung
der fünf neuen Punkte mit Auswahl/Vorschau in DE/EN/FR sowie Mobil-Überlauf.

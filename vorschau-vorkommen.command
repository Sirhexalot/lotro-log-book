#!/bin/zsh
# LOTRO Log Book lokal ansehen – mit der Vorkommen-Ebene.
#
# Baut außerhalb iCloud (~/.cache/llb-dist) und ergänzt danach die Dateien, die
# der zentrale Build noch nicht mitnimmt: web/rohstoffe.js, web/vorkommen-*.js
# und den Ordner web/vorkommen/. Solange die zwei Kopierregeln in
# baue_website.py fehlen, ist dieser Schritt nötig – die Datei selbst bleibt
# unangetastet.
#
#   ./vorschau-vorkommen.command                     bauen und anzeigen
#   LLB_SKIP_BUILD=1 ./vorschau-vorkommen.command    nur anzeigen (schnell)
#   ./vorschau-vorkommen.command ~/.cache/llb-dist 8899   Ziel und Port
set -e
cd "$(dirname "$0")"

ZIEL="${1:-$HOME/.cache/llb-dist}"
PORT="${2:-8899}"

if [ -z "$LLB_SKIP_BUILD" ]; then
	echo "Baue Daten …"
	python3 build_vorkommen.py
	echo "Baue Website nach $ZIEL …"
	python3 baue_website.py --ziel "$ZIEL"
fi

# Was der zentrale Build noch nicht kennt (Regel: baue_website.py nicht ändern).
cp web/vorkommen-*.js web/rohstoffe.js "$ZIEL/"
rm -rf "$ZIEL/vorkommen"
cp -R web/vorkommen "$ZIEL/vorkommen"

echo
echo "Karte:        http://localhost:$PORT/index.html?vorkommen=1879077402&vorkarte=268437653"
echo "Handwerk:     http://localhost:$PORT/handwerk.html#rohstoffe"
echo "Startseite:   http://localhost:$PORT/"
echo "Beenden mit Strg+C."
echo
exec python3 vorschau.py "$ZIEL" --port "$PORT"

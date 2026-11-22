/* Epic story view.
 *
 * A view of its own: its data, tree, folding, counts and map choice live here.
 * The map app only lends what the view asks for through the host object passed
 * to MQL_EPIK_ANSICHT.montiere(): its list, filter, markers, map and detail
 * pane. Nothing in app.js knows about volumes, books, prologues or instances.
 */
(function () {
	'use strict';

	var t = window.MQL_T || function (key) { return key; };
	var daten = null;
	var host = null;
	var offen = {};        // folded groups and books
	var chapterIds = {};   // ids that carry their own instance parts
	var partsByChapter = {};

	function istProlog(name) {
		return /^(?:Prolog|Prologue|Vorwort)\b/i.test(name || '');
	}
	function istInstanz(quest) { return !!(quest && quest.ie); }
	/** A part that its chapter represents is hidden; a part without a known
	 * chapter stays a row so its volume does not lose the entry. */
	function istTeil(quest) {
		return istInstanz(quest) && !!chapterIds[quest.ie];
	}
	/** What the view counts: chapters and orphan parts, no prologue chains. */
	function zaehlbar(quests) {
		return quests.filter(function (quest) {
			return !istTeil(quest) && !quest.pr;
		});
	}
	function sichtbar(quests) {
		return quests.filter(function (quest) { return !istTeil(quest); });
	}
	function zahlen(rows) {
		return host ? host.zaehle(rows)
			: { alle: rows.length, offen: 0, laufend: 0, erledigt: 0, machbar: 0 };
	}
	function suche() { return host && host.suche ? host.suche() : ''; }

	function vorbereiten() {
		chapterIds = {};
		partsByChapter = {};
		var quests = daten.quests;
		Object.keys(quests).forEach(function (id) {
			if (!istInstanz(quests[id])) { chapterIds[id] = true; }
		});
		Object.keys(quests).forEach(function (id) {
			var quest = quests[id];
			if (istInstanz(quest) && chapterIds[quest.ie]) {
				(partsByChapter[quest.ie] || (partsByChapter[quest.ie] = [])).push(quest);
			}
		});
	}

	function ids(gruppe) {
		if (gruppe.buecher && gruppe.buecher.length) {
			return gruppe.buecher.reduce(function (alle, buch) { return alle.concat(buch.ids); }, []);
		}
		return gruppe.ids || [];
	}
	function rows(gruppe) {
		return ids(gruppe).map(function (id) { return daten.quests[id]; }).filter(Boolean);
	}
	function alle() {
		var alle_rows = [];
		daten.gruppen.forEach(function (gruppe) { alle_rows = alle_rows.concat(rows(gruppe)); });
		return alle_rows;
	}

	function leseZeile(quest, ohneStatus) {
		var lage = host.status(quest);
		var li = document.createElement('li');
		li.dataset.id = quest.i;
		// A prologue chain has no status of its own: it never counts towards the
		// book's progress, so a mark would contradict the hint above it.
		li.className = ohneStatus ? 'offen' : (lage.status === 'fertig' ? 'erledigt' : 'offen');
		if (lage.nichtGezahlt) { li.className = 'nicht-gezaehlt'; }
		if (host.aktiv(kennung(quest))) { li.classList.add('aktiv'); }
		var symbol = ohneStatus ? null
			: { fertig: ['✓', 'filter_erledigt'], laufend: ['◐', 'filter_laufend'], offen: ['○', 'filter_offen'] }[lage.status];
		if (symbol) {
			var marke = document.createElement('span');
			marke.className = 'listen-status status-' + lage.lage;
			marke.textContent = symbol[0];
			marke.setAttribute('aria-hidden', 'true');
			marke.title = t(symbol[1]);
			li.appendChild(marke);
			var standText = document.createElement('span');
			standText.className = 'visuell-versteckt';
			standText.textContent = t(symbol[1]) + ': ';
			li.appendChild(standText);
		}
		var name = document.createElement('span');
		name.className = 'qname';
		name.textContent = quest.n;
		if (!istInstanz(quest) && partsByChapter[quest.i]) {
			var teile = partsByChapter[quest.i].map(function (teil) {
				var kurz = teil.n.replace(/^(?:Instanz|Instance)\s*:\s*/i, '');
				return quest.n.toLowerCase().indexOf(kurz.toLowerCase()) >= 0 ? '' : kurz;
			}).filter(Boolean);
			var vermerk = document.createElement('span');
			vermerk.className = 'vermerk instanz-teil';
			vermerk.textContent = t('mit_instanz') + (teile.length ? ': ' + teile.join(' · ') : '');
			name.appendChild(vermerk);
		}
		li.appendChild(name);
		if (quest.l) {
			var stufe = document.createElement('span');
			stufe.className = 'stufe';
			stufe.textContent = t('stufe') + ' ' + (quest.ls ? '~' + quest.l : quest.l);
			li.appendChild(stufe);
		}
		li.addEventListener('click', function () { host.waehle(quest); });
		if (host.merkeZeile) { host.merkeZeile(quest.i, li); }
		return li;
	}

	function leseKopf(name, anzahl, offenJetzt, umschalten, klasse) {
		var li = document.createElement('li');
		li.className = 'abschnitt ' + (klasse || '') + (offenJetzt ? '' : ' zu');
		var text = document.createElement('span');
		text.textContent = (offenJetzt ? '▾ ' : '▸ ') + name;
		li.appendChild(text);
		var zahl = document.createElement('span');
		zahl.className = 'stufe';
		zahl.textContent = anzahl;
		li.appendChild(zahl);
		li.addEventListener('click', umschalten);
		return li;
	}

	function fortschritt(rowsListe) {
		var z = host && host.fortschritt ? host.fortschritt(zaehlbar(rowsListe))
			: { erledigt: 0, gesamt: zaehlbar(rowsListe).length };
		return z.erledigt + '/' + z.gesamt;
	}

	function zeichneGruppe(gruppe) {
		var gruppeRows = rows(gruppe);
		if (!gruppeRows.length) { return []; }
		var gefiltert = host.filtere(gruppeRows, false);
		var suchbegriff = suche();
		if (suchbegriff && !gefiltert.length) { return []; }
		var aufgeklappt = offen[gruppe.name] === true || !!suchbegriff;
		var kopf = leseKopf(gruppe.name, fortschritt(gruppeRows), aufgeklappt, function () {
			offen[gruppe.name] = !aufgeklappt;
			zeichnen();
		}, 'epik-band');
		var inhalt = [kopf];
		if (!aufgeklappt) { return inhalt; }
		var kinder = document.createElement('ul');
		kinder.className = 'epik-buecher';
		if (gruppe.buecher && gruppe.buecher.length) {
			gruppe.buecher.forEach(function (buch) {
				var buchRows = buch.ids.map(function (id) { return daten.quests[id]; }).filter(Boolean);
				if (!buchRows.length) { return; }
				var buchGefiltert = host.filtere(buchRows, false);
				if (suchbegriff && !buchGefiltert.length) { return; }
				var schluessel = gruppe.name + '|' + buch.name;
				var buchOffen = offen[schluessel] === true || !!suchbegriff;
				var anzahl = istProlog(buch.name) ? String(buchRows.length) : fortschritt(buchRows);
				var buchKopf = leseKopf(buch.name, anzahl, buchOffen, (function (schluessel, buchOffen) {
					return function () {
						offen[schluessel] = !buchOffen;
						zeichnen();
					};
				})(schluessel, buchOffen), 'epik-buch');
				kinder.appendChild(buchKopf);
				if (!buchOffen) { return; }
				if (istProlog(buch.name)) {
					var hinweis = document.createElement('li');
					hinweis.className = 'listen-hinweis schwach';
					hinweis.textContent = t('prolog_hinweis');
					kinder.appendChild(hinweis);
				}
				buchGefiltert.forEach(function (quest) {
					if (!istTeil(quest)) { kinder.appendChild(leseZeile(quest, istProlog(buch.name))); }
				});
			});
		} else {
			gefiltert.forEach(function (quest) {
				if (!istTeil(quest)) { kinder.appendChild(leseZeile(quest, false)); }
			});
		}
		if (kinder.childElementCount) { inhalt.push(kinder); }
		return inhalt;
	}

	function kennung(quest) { return quest && quest.i; }

	/** Open the path to a quest and scroll to it.
	 *
	 * A dot on the map selects a quest that may sit in a folded volume, book or
	 * chapter. Without this the list looks as if a click did nothing.
	 * Returns false when the quest is not part of this view.
	 */
	function zeige(quest) {
		if (!daten || !quest) { return false; }
		var ziel = null;
		var kennungZiel = quest.i;
		if (istTeil(quest)) { kennungZiel = quest.ie; }
		daten.gruppen.forEach(function (gruppe) {
			if ((gruppe.ids || []).indexOf(kennungZiel) >= 0) {
				ziel = { gruppe: gruppe.name };
			}
			(gruppe.buecher || []).forEach(function (buch) {
				if (buch.ids.indexOf(kennungZiel) >= 0) {
					ziel = { gruppe: gruppe.name, buch: buch.name };
				}
			});
		});
		if (!ziel) { return false; }
		offen[ziel.gruppe] = true;
		if (ziel.buch) { offen[ziel.gruppe + '|' + ziel.buch] = true; }
		zeichnen();
		var zeile = host.liste.querySelector('li[data-id="' + quest.i + '"]');
		if (!zeile) { zeile = host.liste.querySelector('li.aktiv'); }
		if (zeile) { try { zeile.scrollIntoView({ block: 'center' }); } catch (fehler) {} }
		return true;
	}

	function zeichnen() {
		if (!host || !daten) { return; }
		if (host.titel) { host.titel(daten.name); }
		var ziel = host.liste;
		ziel.textContent = '';
		var sichtbare = sichtbar(alle());
		host.setzeTreffer(host.filtere(sichtbare, false));
		daten.gruppen.forEach(function (gruppe) {
			zeichneGruppe(gruppe).forEach(function (node) { ziel.appendChild(node); });
		});
		if (!ziel.childElementCount) {
			var leer = document.createElement('li');
			leer.className = 'listen-hinweis';
			leer.textContent = t('keine_treffer');
			ziel.appendChild(leer);
		}
	}

	/** The drawn map of Middle-earth lies behind the terrain; its gaps show it. */
	function grundLegen() {
		if (!host || !host.buehne) { return; }
		var sprache = window.MQL_SPRACHE || 'de';
		host.buehne.classList.add('epik-grund');
		host.buehne.style.setProperty('--epik-grund',
			"url('/karten/" + sprache + "/268437554.webp')");
	}
	function grundEntfernen() {
		if (!host || !host.buehne) { return; }
		host.buehne.classList.remove('epik-grund');
		host.buehne.style.removeProperty('--epik-grund');
	}

	function montiere(neuerHost) {
		host = neuerHost;
		if (!daten) { return; }
		vorbereiten();
		Object.keys(daten.quests).forEach(function (id) { host.merke(daten.quests[id]); });
		grundLegen();
	}

	function setzeDaten(neueDaten) {
		daten = neueDaten || null;
		offen = {};
		if (daten && daten.quests) {
			Object.keys(daten.quests).forEach(function (id) {
				daten.quests[id].i = daten.quests[id].i || id;
			});
			vorbereiten();
		}
	}

	function name() {
		var sprache = window.MQL_SPRACHE || document.documentElement.lang || 'de';
		return { de: 'Epische Geschichte', en: 'Epic Story', fr: 'Histoire épique' }[sprache]
			|| 'Epic Story';
	}
	function schluessel() { return '|' + name(); }

	window.MQL_EPIK_ANSICHT = {
		setzeDaten: setzeDaten,
		bereit: function () { return !!daten; },
		adresse: function () {
			return window.location.pathname + '?gebiet=' + encodeURIComponent(name()).replace(/%20/g, '+');
		},
		passt: function (knoten) {
			return !!(daten && knoten && knoten.schluessel === schluessel());
		},
		knoten: function () {
			if (!daten) { return null; }
			var quests = zaehlbar(sichtbar(alle()));
			return { schluessel: schluessel(), name: name(), tiefe: 1,
				quests: quests, eigene: [], kinder: {}, reihenfolge: [], karte: daten.karte,
				eigeneZaehlung: true };
		},
		karte: function () { return daten ? daten.karte : null; },
		ansicht: function () { return null; },
		brauchtDaten: function () {
			if (daten) { return false; }
			var gewaehlt = '';
			try { gewaehlt = (new URLSearchParams(window.location.search).get('gebiet') || '').toLowerCase(); }
			catch (fehler) { gewaehlt = ''; }
			return gewaehlt === name().toLowerCase();
		},
		laden: function (fertig, fehler) {
			if (daten) { fertig(); return; }
			var sprache = window.MQL_SPRACHE || 'de';
			var skript = document.createElement('script');
			skript.src = 'epik-' + sprache + '.js?v=' + (window.MQL_STAND || '0');
			skript.onload = function () {
				setzeDaten(window.MQL_EPIK_DATEN || null);
				fertig();
			};
			skript.onerror = function () {
				if (fehler) { fehler(); } else { fertig(); }
			};
			document.head.appendChild(skript);
		},
		montiere: montiere,
		verlasse: grundEntfernen,
		zeichneListe: zeichnen,
		zeige: zeige,
		zahlen: function () {
			return zahlen(host.filtere(sichtbar(alle()), true));
		}
	};
})();

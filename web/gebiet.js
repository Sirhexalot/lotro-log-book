/* Area and region pages: the three content groups as tabs.
 *
 * The page carries the complete member list as JSON. Search and the completion
 * filter therefore work on every entry of the area, not only on the rendered
 * excerpt. Completion is read from the local character; without one the list
 * stays public and no personal state is claimed.
 */
(function () {
	'use strict';

	function start() {

	var buehne = document.getElementById('gebiet-buehne');
	var datenFeld = document.getElementById('gebiet-daten');
	if (!buehne || !datenFeld) { return; }

	var daten;
	try { daten = JSON.parse(datenFeld.textContent || '{}'); } catch (fehler) { return; }

	var sprache = document.documentElement.lang || 'de';
	var SEGMENT = {
		de: { q: 'aufgabe', d: 'tat', i: 'gegenstand' },
		en: { q: 'quest', d: 'deed', i: 'item' },
		fr: { q: 'quete', d: 'prouesse', i: 'objet' }
	}[sprache] || { q: 'aufgabe', d: 'tat', i: 'gegenstand' };

	var texte = {};
	try { texte = JSON.parse(document.body.getAttribute('data-katalog-texte')) || {}; } catch (fehler) {}

	var reiter = Array.prototype.slice.call(document.querySelectorAll('[data-gebiet-tab]'));
	if (!reiter.length) { return; }

	var suche = document.getElementById('gebiet-suche');
	var hakenFeld = document.getElementById('gebiet-haken');
	var haken = document.getElementById('gebiet-nur-offen');
	var anzahl = document.getElementById('gebiet-anzahl');
	var liste = document.getElementById('gebiet-liste');
	var mehr = document.getElementById('gebiet-mehr');
	var leer = document.getElementById('gebiet-leer');
	var stand = document.getElementById('gebiet-stand');

	var GRENZE = 50;

	var speicher = window.MQL_SPEICHER;
	var charakter = speicher && speicher.aktiv ? speicher.aktiv() : null;

	var zustand = { tab: reiter[0].getAttribute('data-gebiet-tab'), suche: '', nurOffen: false, sichtbar: GRENZE };
	// Each tab keeps its own search, so switching does not hide the other list.
	var suchen = {};

	// Was this data type part of the import? Without that evidence the list
	// must not claim "not completed" for every entry.
	function bekannt(kind) {
		if (!charakter) { return false; }
		if (speicher.kennt) { return speicher.kennt(kind === 'd' ? 'deeds' : 'quests') === true; }
		return true;
	}

	function ids(kind) {
		if (!charakter) { return {}; }
		var quelle = kind === 'd' ? charakter.deeds : charakter.quests;
		var aus = {};
		(Array.isArray(quelle) ? quelle : []).forEach(function (id) { aus[String(id).toUpperCase()] = true; });
		return aus;
	}

	function falten(wert) {
		return String(wert || '').toLocaleLowerCase(sprache)
			.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
	}

	function zeigeReiter() {
		reiter.forEach(function (knopf) {
			var aktiv = knopf.getAttribute('data-gebiet-tab') === zustand.tab;
			knopf.setAttribute('aria-selected', String(aktiv));
			knopf.tabIndex = aktiv ? 0 : -1;
		});
		var kennt = zustand.tab !== 'i' && bekannt(zustand.tab);
		hakenFeld.hidden = !kennt;
		stand.textContent = charakter
			? charakter.name + (charakter.server ? ' · ' + charakter.server : '')
				+ (zustand.tab !== 'i' && !kennt ? ' · ' + (buehne.getAttribute('data-import-hint') || '') : '')
			: buehne.getAttribute('data-import-hint') || '';
	}

	function zeichne() {
		zeigeReiter();
		var eintraege = daten[zustand.tab] || [];
		var kennt = zustand.tab !== 'i' && bekannt(zustand.tab);
		var fertig = ids(zustand.tab);
		var begriff = falten(zustand.suche);
		var sichtbar = eintraege.filter(function (eintrag) {
			var id = String(eintrag[0]).toUpperCase();
			if (begriff && falten(eintrag[1]).indexOf(begriff) < 0) { return false; }
			if (zustand.nurOffen && kennt && fertig[id]) { return false; }
			return true;
		});
		var erledigt = 0;
		if (kennt) {
			eintraege.forEach(function (eintrag) {
				if (fertig[String(eintrag[0]).toUpperCase()]) { erledigt += 1; }
			});
		}
		if (kennt) {
			anzahl.textContent = erledigt + ' ' + (texte.status_done || '') + ' · ' +
				(eintraege.length - erledigt) + ' ' + (texte.status_unknown || '');
		} else {
			var muster = buehne.getAttribute('data-anzahl') || '%s von %s';
			anzahl.textContent = muster.replace('%s', sichtbar.length).replace('%s', eintraege.length);
		}

		var teil = sichtbar.slice(0, zustand.sichtbar);
		liste.textContent = '';
		teil.forEach(function (eintrag) {
			var id = String(eintrag[0]);
			var li = document.createElement('li');
			li.className = 'gebiet-zeile';
			var marke = document.createElement('span');
			marke.className = 'gebiet-marke';
			marke.setAttribute('aria-hidden', 'true');
			var bildFeld = document.createElement('span');
			bildFeld.className = 'gebiet-bild';
			if (kennt) {
				var getan = !!fertig[id.toUpperCase()];
				marke.textContent = getan ? '✓' : '○';
				li.className += getan ? ' fertig' : ' offen';
			}
			if (zustand.tab === 'i' && eintrag[2]) {
				var bild = document.createElement('img');
				bild.className = 'symbol';
				bild.src = '/bild/items/' + eintrag[2] + '.webp';
				bild.alt = '';
				bild.width = 22;
				bild.height = 22;
				bild.loading = 'lazy';
				bildFeld.appendChild(bild);
			}
			var link = document.createElement('a');
			link.href = '/' + sprache + '/' + SEGMENT[zustand.tab] + '/' + id + '/';
			link.textContent = eintrag[1];
			li.appendChild(marke);
			li.appendChild(bildFeld);
			li.appendChild(link);
			liste.appendChild(li);
		});

		leer.hidden = sichtbar.length > 0;
		mehr.hidden = sichtbar.length <= zustand.sichtbar;
		if (!mehr.hidden) {
			mehr.textContent = (mehr.getAttribute('data-mehr') || '') + ' (' + (sichtbar.length - zustand.sichtbar) + ')';
		}
	}

	function reiterWaehlen(kind, still) {
		suchen[zustand.tab] = zustand.suche;
		zustand.tab = kind;
		zustand.suche = suchen[kind] || '';
		suche.value = zustand.suche;
		zustand.sichtbar = GRENZE;
		if (!still) {
			try { history.replaceState(null, '', '#' + kind); } catch (fehler) { /* file:// */ }
		}
		zeichne();
	}

	reiter.forEach(function (knopf) {
		knopf.addEventListener('click', function () {
			reiterWaehlen(knopf.getAttribute('data-gebiet-tab'));
		});
		knopf.addEventListener('keydown', function (ereignis) {
			if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].indexOf(ereignis.key) < 0) { return; }
			ereignis.preventDefault();
			var nummer = reiter.indexOf(knopf);
			if (ereignis.key === 'Home') { nummer = 0; }
			else if (ereignis.key === 'End') { nummer = reiter.length - 1; }
			else { nummer = (nummer + (ereignis.key === 'ArrowRight' ? 1 : reiter.length - 1)) % reiter.length; }
			reiter[nummer].focus();
			reiterWaehlen(reiter[nummer].getAttribute('data-gebiet-tab'));
		});
	});

	suche.addEventListener('input', function () {
		zustand.suche = suche.value.trim();
		zustand.sichtbar = GRENZE;
		zeichne();
	});
	haken.addEventListener('change', function () {
		zustand.nurOffen = haken.checked;
		zustand.sichtbar = GRENZE;
		zeichne();
	});
	mehr.addEventListener('click', function () {
		zustand.sichtbar += GRENZE;
		zeichne();
	});

	var start = (location.hash || '').replace('#', '');
	if (reiter.some(function (knopf) { return knopf.getAttribute('data-gebiet-tab') === start; })) {
		zustand.tab = start;
	}
	zeichne();
	}

	// This file is deferred before the shared scripts; they must exist first.
	// Deferred scripts all run while readyState is still "interactive", so wait
	// for the event instead of starting immediately.
	if (document.readyState === 'complete') {
		start();
	} else {
		document.addEventListener('DOMContentLoaded', start);
	}
})();

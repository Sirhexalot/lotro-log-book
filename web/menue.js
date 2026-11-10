/* Menu bar shared by every page of the LOTRO Log Book.
 *
 * Two rows with two jobs. The top row is identity: the name, the search and the
 * character you are looking at. The bottom row is content: the pages themselves,
 * plus the plugin at its quiet right end. Search sits above because it is a tool,
 * the character above because it is a state, not a page.
 *
 * Needs texte.js, sprache.js (MQL_T) and speicher.js first.
 */
(function () {
	'use strict';

	var t = window.MQL_T || function (schluessel) { return schluessel; };
	var sprache = window.MQL_SPRACHE || 'de';
	var speicher = window.MQL_SPEICHER;
	var ziel = document.getElementById('menue');
	if (!ziel) { return; }

	// One fixed column inside the full-width bar: .kopf carries background and
	// line, .kopf-innen the content. Created here where the page has none, so
	// every page has the same header structure.
	var kopf = document.querySelector('.kopf');
	var behaelter = kopf;
	if (kopf) {
		behaelter = kopf.querySelector(':scope > .kopf-innen');
		if (!behaelter) {
			behaelter = document.createElement('div');
			behaelter.className = 'kopf-innen';
			while (kopf.firstChild) { behaelter.appendChild(kopf.firstChild); }
			kopf.appendChild(behaelter);
		}
	}

	var seite = document.body.getAttribute('data-seite') || '';
	if (seite === 'karte' && window.MQL_ART === 'taten') { seite = 'taten'; }
	// One address per page and language; the old .html?lang= forms redirect here.
	var APP = {
		de: { start: '', karte: 'karte', taten: 'karte/taten', gegenstandssuche: 'gegenstandssuche',
			handwerk: 'handwerk/rezepte', reise: 'reise', ruf: 'ruf', belohnungen: 'belohnungen',
			spielstand: 'spielstand', companion: 'companion', plugin: 'plugin', suche: 'suche',
			instances: 'instanz' },
		en: { start: '', karte: 'map', taten: 'map/deeds', gegenstandssuche: 'item-search',
			handwerk: 'crafting/recipes', reise: 'travel', ruf: 'reputation', belohnungen: 'rewards',
			spielstand: 'progress', companion: 'companion', plugin: 'plugin', suche: 'search',
			instances: 'instance' },
		fr: { start: '', karte: 'carte', taten: 'carte/prouesses', gegenstandssuche: 'recherche-objets',
			handwerk: 'artisanat/recettes', reise: 'voyage', ruf: 'reputation', belohnungen: 'recompenses',
			spielstand: 'progression', companion: 'companion', plugin: 'plugin', suche: 'recherche',
			instances: 'instance' }
	};
	function app(seite) {
		var teil = (APP[sprache] || {})[seite];
		return '/' + sprache + '/' + (teil ? teil + '/' : '');
	}
	var startseite = app('start');

	// The name in the header is the way home, with the plugin's icon (Lucide
	// "mop-sparkles", ISC) in front.
	var titel = document.querySelector('.kopf h1');
	if (titel) {
		var logo = document.createElement('a');
		logo.className = 'logo';
		logo.href = startseite;
		logo.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
			'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
			'<path d="M10 22a3 3 0 01-3-3"/><path d="M10 22c2.761 0 5-1.79 5-4-4.42 0-4.08-5-8.5-5a4.501 4.501 0 000 9z"/>' +
			'<path d="M10 3H8"/><path d="M12.5 11.5 22 2"/><path d="M20 13v4"/><path d="M22 15h-4"/>' +
			'<path d="M4 5v4"/><path d="M6 7H2"/><path d="m6.98 13.02 2.665-2.664a1.21 1.21 0 011.71 0l2.29 2.288a1.21 1.21 0 010 1.712l-2.088 2.087"/>' +
			'<path d="M9 2v2"/></svg>';
		logo.appendChild(document.createTextNode('LOTRO Log Book'));
		titel.textContent = '';
		titel.appendChild(logo);
	}

	// Four families, one row. Their tabs sit in a second line below, so the
	// header never grows when a content type is added (see README, navigation).
	var SEGMENT = {
		de: { gegenstand: 'gegenstand', beruf: 'beruf', titel: 'titel', tugend: 'tugend', set: 'set',
			auftraggeber: 'auftraggeber' },
		en: { gegenstand: 'item', beruf: 'profession', titel: 'title', tugend: 'virtue', set: 'set',
			auftraggeber: 'quest-giver' },
		fr: { gegenstand: 'objet', beruf: 'metier', titel: 'titre', tugend: 'vertu', set: 'ensemble',
			auftraggeber: 'donneur-de-quete' }
	}[sprache] || {};
	function pfad(art) { return '/' + sprache + '/' + (SEGMENT[art] || art) + '/'; }
	function seiten(url) {
		var adresse = String(url || '');
		return adresse.indexOf('index.html') >= 0 ? (adresse.indexOf('art=taten') >= 0 ? 'taten' : 'karte')
			: adresse.replace(/[^a-z]/g, '').slice(0, 12);
	}

	var FAMILIEN = [
		{ key: 'welt', text: t('nav_welt'), href: app('karte'), tab: [
			{ seite: 'karte', href: app('karte'), text: t('menue_karte'), desc: 'd_karte' },
			{ seite: 'taten', href: app('taten'), text: t('menue_taten'), desc: 'd_taten' },
			{ seite: 'reise', href: app('reise'), text: t('menue_reise'), desc: 'd_reise' },
			{ seite: 'auftraggeber', href: pfad('auftraggeber'), text: t('menue_auftraggeber'), desc: 'd_auftraggeber' },
		{ seite: 'landmarke', href: pfad('landmarke'), text: t('menue_landmarken'), desc: 'd_landmarken' },
		{ seite: 'instanzen', href: app('instances'), text: t('menue_instanzen'), desc: 'd_instanzen' }] },
		{ key: 'gegenstaende', text: t('nav_gegenstaende'), href: app('gegenstandssuche'), tab: [
			{ seite: 'gegenstand', href: app('gegenstandssuche'), text: t('menue_gegenstaende'), desc: 'd_gegenstand' },
			{ seite: 'set', href: pfad('set'), text: t('menue_sets'), desc: 'd_sets' },
			{ seite: 'handwerk', href: app('handwerk'), text: t('menue_handwerk'), desc: 'd_handwerk' },
			{ seite: 'beruf', href: app('handwerk'), text: t('menue_berufe'), desc: 'd_beruf' }] },
		{ key: 'erfolge', text: t('nav_erfolge'), href: app('belohnungen'), tab: [
			{ seite: 'titel', href: pfad('titel'), text: t('menue_titel'), desc: 'd_titel' },
			{ seite: 'tugend', href: pfad('tugend'), text: t('menue_tugenden'), desc: 'd_tugend' },
			{ seite: 'ruf', href: app('ruf'), text: t('menue_ruf'), desc: 'd_ruf' },
			{ seite: 'fraktion', href: pfad('fraktion'), text: t('menue_fraktionen'), desc: 'd_fraktionen' }] },
		{ key: 'charakter', text: t('nav_charakter'), href: app('spielstand'), tab: [
			{ seite: 'spielstand', href: app('spielstand'), text: t('menue_fortschritt'), desc: 'd_fortschritt' },
			{ seite: 'beruf', href: app('handwerk'), text: t('menue_meine_berufe'), desc: 'd_meine_berufe' },
			{ seite: 'ruf', href: app('ruf'), text: t('menue_mein_ruf'), desc: 'd_mein_ruf' }] }
	];

	// Which family the current page belongs to.
	var ZUORDNUNG = { karte: 'welt', taten: 'welt', reise: 'welt', auftraggeber: 'welt',
		instanzen: 'welt',
		landmarke: 'welt', fraktion: 'erfolge',
		gegenstand: 'gegenstaende',
		handwerk: 'gegenstaende', beruf: 'gegenstaende', titel: 'erfolge', tugend: 'erfolge',
		ruf: 'erfolge', belohnungen: 'erfolge', spielstand: 'charakter', plugin: 'charakter' };
	var familie = ZUORDNUNG[seite] || 'welt';

	FAMILIEN.forEach(function (gruppe) {
		// Each family carries its own tabs as a flyout, so the second level is
		// one hover away without pushing the header taller.
		var feld = document.createElement('span');
		feld.className = 'familie-feld';
		var link = document.createElement('a');
		link.href = gruppe.href;
		link.textContent = gruppe.text;
		if (gruppe.key === familie) { link.setAttribute('aria-current', 'page'); }
		feld.appendChild(link);
		if (gruppe.tab.length > 1) {
			var flieger = document.createElement('span');
			flieger.className = 'familie-flieger';
			gruppe.tab.forEach(function (punkt) {
				var a = document.createElement('a');
				a.href = punkt.href;
				var name = document.createElement('strong');
				name.textContent = punkt.text;
				var beschreibung = document.createElement('span');
				beschreibung.textContent = t(punkt.desc || 'd_karte');
				a.appendChild(name);
				a.appendChild(beschreibung);
				if (punkt.href === gruppe.href) { a.className = 'selbst'; }
				if (punkt.seite === seite) { a.setAttribute('aria-current', 'page'); }
				flieger.appendChild(a);
			});
			feld.appendChild(flieger);
		}
		ziel.appendChild(feld);
	});

	// Search: the map page has its own field with results, every other page gets
	// the way there. The search page itself needs neither.
	// The start page carries its own wide search field; a second one in the
	// header would only compete with it.
	if (behaelter && !document.getElementById('suche') && seite !== 'suche'
			&& seite !== 'start' && !document.querySelector('.suche-start')) {
		var suchlink = document.createElement('a');
		suchlink.className = 'suchen-knopf';
		suchlink.href = app('suche');
		suchlink.textContent = t('menue_suche_kurz');
		behaelter.appendChild(suchlink);
	}

	// Character: a state, not a page. It goes first in the top row next to the
	// way to change it.
	var charakter = document.createElement('div');
	charakter.className = 'charakter';
	if (speicher) {
		var feld = document.createElement('label');
		feld.className = 'charakterwahl';
		var beschriftung = document.createElement('span');
		beschriftung.textContent = t('charakter');
		var auswahl = document.createElement('select');
		auswahl.id = 'charakter';
		var ohne = document.createElement('option');
		var alle = speicher.alle();
		var aktiv = speicher.aktiv();
		ohne.value = '';
		ohne.textContent = alle.length ? t('ohne_spielstand') : t('kein_charakter');
		auswahl.appendChild(ohne);
		alle.forEach(function (eintrag) {
			var option = document.createElement('option');
			option.value = eintrag.key;
			option.textContent = eintrag.name + (eintrag.server ? ' · ' + eintrag.server : '');
			if (aktiv && aktiv.key === eintrag.key) { option.selected = true; }
			auswahl.appendChild(option);
		});
		auswahl.addEventListener('change', function () {
			speicher.setzeAktiv(auswahl.value || null);
			window.location.reload();
		});
		feld.appendChild(beschriftung);
		feld.appendChild(auswahl);
		charakter.appendChild(feld);
		// How old is the imported progress? A clock next to the character says it
		// without opening the import page; the colour is the whole message.
		if (aktiv) { charakter.appendChild(standsalter(aktiv)); }
	}
	/** Lucide "clock", coloured by the age of the imported progress. */
	function tageSeit(datum) {
		if (!datum) { return null; }
		var tag = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datum);
		if (!tag) { return null; }
		var damals = Date.UTC(Number(tag[1]), Number(tag[2]) - 1, Number(tag[3]));
		var heute = new Date();
		var jetzt = Date.UTC(heute.getFullYear(), heute.getMonth(), heute.getDate());
		return Math.max(0, Math.round((jetzt - damals) / 86400000));
	}

	function standsalterText(tage) {
		if (tage === 0) { return t('alter_heute'); }
		if (tage === 1) { return t('alter_gestern'); }
		return t('alter_vor_tagen').replace('%s', String(tage));
	}

	function standsalterFarbe(tage) {
		if (tage <= 3) { return 'frisch'; }
		if (tage <= 14) { return 'mittel'; }
		return 'alt';
	}

	function standsalterSvg() {
		return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
			'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
			'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
	}

	/** Small link to the import page, showing when the progress was read. */
	function standsalter(eintrag) {
		var tage = tageSeit(eintrag.date);
		var link = document.createElement('a');
		link.className = 'standsalter' + (tage === null ? ' unbekannt' : ' ' + standsalterFarbe(tage));
		link.href = app('spielstand');
		link.innerHTML = standsalterSvg();
		if (tage === null) {
			link.title = t('alter_unbekannt');
			link.setAttribute('aria-label', t('alter_unbekannt'));
		} else {
			var text = t('alter_import') + ': ' + eintrag.date + ' · ' + standsalterText(tage);
			link.title = text;
			link.setAttribute('aria-label', text);
		}
		return link;
	}

	var importieren = document.createElement('a');
	importieren.className = 'importieren';
	importieren.href = app('spielstand');
	importieren.textContent = t('menue_import_kurz');
	if (seite === 'spielstand') { importieren.setAttribute('aria-current', 'page'); }
	charakter.appendChild(importieren);
	if (behaelter) { behaelter.appendChild(charakter); }

	// Phones get a burger button: everything but the search waits behind it.
	if (kopf && ziel) {
		var knopf = document.createElement('button');
		knopf.type = 'button';
		knopf.className = 'menue-knopf';
		knopf.setAttribute('aria-expanded', 'false');
		knopf.setAttribute('aria-controls', 'menue');
		knopf.setAttribute('aria-label', t('menue_oeffnen'));
		knopf.textContent = '\u2630';
		ziel.parentNode.insertBefore(knopf, ziel);
		knopf.addEventListener('click', function () {
			var offen = kopf.classList.toggle('menue-offen');
			knopf.setAttribute('aria-expanded', String(offen));
		});
	}

	// Links written without a language in the page take the current one. The
	// four pages that have a language path are built from it; the rest (legal
	// notice, privacy) really are files at the site root.
	var ZIEL_APP = { 'spielstand.html': 'spielstand', 'companion.html': 'companion',
		'plugin.html': 'plugin', 'suche.html': 'suche' };
	Array.prototype.forEach.call(document.querySelectorAll('a[data-ziel]'), function (link) {
		var ziel = link.getAttribute('data-ziel');
		link.href = ZIEL_APP[ziel] ? app(ZIEL_APP[ziel])
			: '/' + ziel.replace(/^\//, '') + '?lang=' + sprache;
	});

	// One pane at a time on phones: list, map or details.
	var reiter = document.getElementById('mobil-reiter');
	if (reiter) {
		function mobil(name) {
			document.body.setAttribute('data-pane', name);
			Array.prototype.forEach.call(reiter.querySelectorAll('button'), function (knopf) {
				knopf.setAttribute('aria-pressed', String(knopf.getAttribute('data-pane') === name));
			});
		}
		reiter.addEventListener('click', function (ereignis) {
			var knopf = ereignis.target.closest ? ereignis.target.closest('button[data-pane]') : null;
			if (knopf) { mobil(knopf.getAttribute('data-pane')); }
		});
		mobil(document.body.getAttribute('data-pane') || 'liste');
		window.MQL_MOBIL = { zeige: mobil };
	}

	// Keep the footer identical everywhere, including the full-height map app.
	var footer = document.querySelector('footer');
	if (!footer) { footer = document.createElement('footer'); document.body.appendChild(footer); }
	footer.textContent = '';
	var recht = document.createElement('p');
	[['/impressum.html', 'footer_recht'], ['/datenschutz.html', 'footer_datenschutz']].forEach(function (item, index) {
		if (index) { recht.appendChild(document.createTextNode(' · ')); }
		var link = document.createElement('a'); link.href = item[0] + '?lang=' + sprache;
		link.textContent = t(item[1]); recht.appendChild(link);
	});
	footer.appendChild(recht);
	// The language buttons moved from the header into the footer: the language
	// comes from the address, the stored choice or the browser anyway.
	var sprachen = document.querySelector('.sprachen');
	if (sprachen && sprachen.parentNode !== footer) { footer.appendChild(sprachen); }
})();

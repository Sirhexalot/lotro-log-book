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

	// One fixed column inside the full-width bar: .kopf carries the background,
	// .kopf-innen the content. Created here where the page has none, so
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
		de: { start: '', karte: 'karte', questfinder: 'aufgabenfinder', taten: 'karte/taten', gegenstandssuche: 'gegenstandssuche', klassen: 'klassen',
			handwerk: 'handwerk/rezepte', reise: 'reise', ruf: 'ruf', belohnungen: 'belohnungen',
			spielstand: 'spielstand', companion: 'companion', plugin: 'plugin', suche: 'suche', feedback: 'feedback',
			instances: 'instanz', adventures: 'abenteuer' },
		en: { start: '', karte: 'map', questfinder: 'quest-finder', taten: 'map/deeds', gegenstandssuche: 'item-search', klassen: 'classes',
			handwerk: 'crafting/recipes', reise: 'travel', ruf: 'reputation', belohnungen: 'rewards',
			spielstand: 'progress', companion: 'companion', plugin: 'plugin', suche: 'search', feedback: 'feedback',
			instances: 'instance', adventures: 'adventure' },
		fr: { start: '', karte: 'carte', questfinder: 'recherche-quetes', taten: 'carte/prouesses', gegenstandssuche: 'recherche-objets', klassen: 'classes',
			handwerk: 'artisanat/recettes', reise: 'voyage', ruf: 'reputation', belohnungen: 'recompenses',
			spielstand: 'progression', companion: 'companion', plugin: 'plugin', suche: 'recherche', feedback: 'retour',
			instances: 'instance', adventures: 'aventure' }
	};
	function app(seite) {
		var teil = (APP[sprache] || {})[seite];
		return '/' + sprache + '/' + (teil ? teil + '/' : '');
	}
	var startseite = app('start');

	// The shared mark is the field journal and quill supplied for the site.
	var titel = document.querySelector('.kopf h1');
	if (titel) {
		var logo = document.createElement('a');
		logo.className = 'logo';
		logo.href = startseite;
		logo.innerHTML = '<svg class="marken-zeichen" viewBox="0 0 100 100" aria-hidden="true" focusable="false">' +
			'<use href="/lotro-log-book-mark.svg#marke"></use></svg>' +
			'<span class="marken-text">LOTRO Log Book</span>';
		titel.textContent = '';
		titel.appendChild(logo);
	}

	// Four families, plus the site-wide feedback destination.
	var SEGMENT = {
		de: { gegenstand: 'gegenstand', beruf: 'beruf', titel: 'titel', tugend: 'tugend', set: 'set',
			auftraggeber: 'auftraggeber', vendor: 'haendler' },
		en: { gegenstand: 'item', beruf: 'profession', titel: 'title', tugend: 'virtue', set: 'set',
			auftraggeber: 'quest-giver', vendor: 'vendor' },
		fr: { gegenstand: 'objet', beruf: 'metier', titel: 'titre', tugend: 'vertu', set: 'ensemble',
			auftraggeber: 'donneur-de-quete', vendor: 'marchand' }
	}[sprache] || {};
	function pfad(art) { return '/' + sprache + '/' + (SEGMENT[art] || art) + '/'; }

	var FAMILIEN = [
		{ key: 'welt', text: t('nav_welt'), tab: [
			{ seite: 'karte', href: app('karte'), text: t('menue_karte'), desc: 'd_karte' },
			{ seite: 'taten', href: app('taten'), text: t('menue_taten'), desc: 'd_taten' },
			{ seite: 'abenteuer', href: app('adventures'), text: t('menue_abenteuer'), desc: 'd_abenteuer' },
			{ seite: 'reise', href: app('reise'), text: t('menue_reise'), desc: 'd_reise' },
			{ seite: 'auftraggeber', href: pfad('auftraggeber'), text: t('menue_auftraggeber'), desc: 'd_auftraggeber' },
		{ seite: 'landmarke', href: pfad('landmarke'), text: t('menue_landmarken'), desc: 'd_landmarken' },
		{ seite: 'instanzen', href: app('instances'), text: t('menue_instanzen'), desc: 'd_instanzen' }] },
		{ key: 'gegenstaende', text: t('nav_gegenstaende'), tab: [
			{ seite: 'gegenstand', href: app('gegenstandssuche'), text: t('menue_gegenstandssuche'), desc: 'd_gegenstand' },
			{ seite: 'vendor', href: pfad('vendor'), text: t('menue_haendler'), desc: 'd_haendler' },
			{ seite: 'set', href: pfad('set'), text: t('menue_sets'), desc: 'd_sets' },
			{ seite: 'handwerk', href: app('handwerk'), text: t('menue_handwerk'), desc: 'd_handwerk' }] },
		{ key: 'erfolge', text: t('nav_erfolge'), tab: [
			{ seite: 'belohnungen', href: app('belohnungen'), text: t('menue_belohnungen'), desc: 'd_belohnungen' },
			{ seite: 'titel', href: pfad('titel'), text: t('menue_titel'), desc: 'd_titel' },
			{ seite: 'tugend', href: pfad('tugend'), text: t('menue_tugenden'), desc: 'd_tugend' },
			{ seite: 'ruf', href: app('ruf'), text: t('menue_ruf'), desc: 'd_ruf' },
			{ seite: 'fraktion', href: pfad('fraktion'), text: t('menue_fraktionen'), desc: 'd_fraktionen' }] },
		{ key: 'charakter', text: t('nav_charakter'), tab: [
			{ seite: 'klassen', href: app('klassen'), text: t('menue_klassen'), desc: 'd_klassen' },
			{ seite: 'spielstand', href: app('spielstand'), text: t('menue_fortschritt'), desc: 'd_fortschritt' }] }
	];

	// Which family the current page belongs to.
	var ZUORDNUNG = { karte: 'welt', questfinder: 'welt', taten: 'welt', reise: 'welt', auftraggeber: 'welt',
		instanzen: 'welt', abenteuer: 'welt',
		landmarke: 'welt', fraktion: 'erfolge',
		gegenstand: 'gegenstaende', vendor: 'gegenstaende',
		handwerk: 'gegenstaende', beruf: 'gegenstaende', titel: 'erfolge', tugend: 'erfolge',
		ruf: 'erfolge', belohnungen: 'erfolge', klassen: 'charakter', spielstand: 'charakter', plugin: 'charakter' };
	var familie = seite === 'feedback' ? '' : (ZUORDNUNG[seite] || 'welt');

	FAMILIEN.forEach(function (gruppe) {
		// A family is a group, not a page: the button opens its list and every
		// destination inside it is an explicit link. Nobody has to guess that
		// the family name hides one of its own tabs.
		var feld = document.createElement('span');
		feld.className = 'familie-feld' + (gruppe.key === familie ? ' aktiv' : '');
		var knopf = document.createElement('button');
		knopf.type = 'button';
		knopf.className = 'familie-knopf';
		knopf.setAttribute('aria-expanded', 'false');
		knopf.setAttribute('aria-controls', 'familie-' + gruppe.key);
		if (gruppe.key === familie) { knopf.setAttribute('aria-current', 'true'); }
		knopf.appendChild(document.createTextNode(gruppe.text));
		var pfeil = document.createElement('span');
		pfeil.className = 'familie-pfeil';
		pfeil.setAttribute('aria-hidden', 'true');
		pfeil.textContent = '▾';
		knopf.appendChild(pfeil);
		feld.appendChild(knopf);
		// Every family gets a flyout, including Character with its single
		// destination. PHP renders the same shape; omitting this one made the
		// Character control appear to work only on some page variants.
		if (gruppe.tab.length > 0) {
			var flieger = document.createElement('span');
			flieger.className = 'familie-flieger';
			flieger.id = 'familie-' + gruppe.key;
			gruppe.tab.forEach(function (punkt) {
				var a = document.createElement('a');
				a.href = punkt.href;
				var name = document.createElement('strong');
				name.textContent = punkt.text;
				var beschreibung = document.createElement('span');
				beschreibung.textContent = t(punkt.desc || 'd_karte');
				a.appendChild(name);
				a.appendChild(beschreibung);
				if (punkt.seite === seite) { a.setAttribute('aria-current', 'page'); }
				flieger.appendChild(a);
			});
			feld.appendChild(flieger);
		}
		ziel.appendChild(feld);
	});
	// Open/close behaviour lives in familienmenue.js, which catalogue pages use
	// too. It is loaded right after this file.
	function familieMenue() {
		return window.MQL_FAMILIENMENUE || { setze: function () {}, schliesseAlle: function () {} };
	}

	// Keep the global search field beside the brand. The map has its own
	// suggestion-enabled field; the search and start pages already have one.
	if (behaelter && !document.getElementById('suche') && seite !== 'suche'
			&& seite !== 'start' && !document.querySelector('.suche-start')) {
		var suchformular = document.createElement('form');
		suchformular.className = 'kopf-suche';
		suchformular.action = app('suche');
		suchformular.method = 'get';
		suchformular.setAttribute('role', 'search');
		var suchfeld = document.createElement('input');
		suchfeld.type = 'search';
		suchfeld.name = 'q';
		suchfeld.placeholder = t('menue_suche_kurz');
		suchfeld.setAttribute('aria-label', t('suche_global'));
		suchfeld.autocomplete = 'off';
		suchformular.appendChild(suchfeld);
		behaelter.appendChild(suchformular);
	}

	// Character: a state, not a page. It goes first in the top row next to the
	// way to change it.
	var charakter = document.createElement('div');
	charakter.className = 'charakter';
	if (speicher) {
		var feld = document.createElement('label');
		feld.className = 'charakterwahl';
		var auswahl = document.createElement('select');
		auswahl.id = 'charakter';
		auswahl.setAttribute('aria-label', t('charakter'));
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
		feld.appendChild(auswahl);
		if (aktiv) {
			var alter = standsalter(aktiv);
			feld.classList.add('mit-standsalter');
			feld.appendChild(alter);
			auswahl.setAttribute('aria-description', alter.title);
		}
		charakter.appendChild(feld);
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

	/** Status indicator within the character field; Import remains its own link. */
	function standsalter(eintrag) {
		var tage = tageSeit(eintrag.date);
		var symbol = document.createElement('span');
		symbol.className = 'standsalter' + (tage === null ? ' unbekannt' : ' ' + standsalterFarbe(tage));
		symbol.innerHTML = standsalterSvg();
		symbol.title = tage === null ? t('alter_unbekannt')
			: t('alter_import') + ': ' + eintrag.date + ' · ' + standsalterText(tage);
		return symbol;
	}

	var importieren = document.createElement('a');
	importieren.className = 'importieren';
	importieren.href = app('spielstand');
	importieren.textContent = t('menue_import_kurz');
	if (seite === 'spielstand') { importieren.setAttribute('aria-current', 'page'); }
	charakter.appendChild(importieren);
	var feedbackLink = document.createElement('a');
	feedbackLink.className = 'feedback-global';
	feedbackLink.href = app('feedback');
	feedbackLink.textContent = t('feedback_nav');
	feedbackLink.setAttribute('data-feedback-link', '');
	if (seite === 'feedback') { feedbackLink.setAttribute('aria-current', 'page'); }
	if (behaelter) { behaelter.appendChild(charakter); }

	// Keep the current deep link and entity context locally for the feedback form.
	document.addEventListener('click', function (event) {
		var link = event.target.closest ? event.target.closest('[data-feedback-link]') : null;
		if (!link) { return; }
		var body = document.body;
		var name = document.querySelector('main h1');
		var context = {
			url: window.location.href,
			type: body.getAttribute('data-art') || '',
			id: body.getAttribute('data-entity-id') || '',
			name: name ? name.textContent.trim().slice(0, 180) : '',
			viewport: window.innerWidth + 'x' + window.innerHeight
		};
		try { window.sessionStorage.setItem('llb.feedback.context', JSON.stringify(context)); } catch (_) {}
	});

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
		document.addEventListener('keydown', function (ereignis) {
			if (ereignis.key !== 'Escape' || !kopf.classList.contains('menue-offen')) { return; }
			kopf.classList.remove('menue-offen');
			knopf.setAttribute('aria-expanded', 'false');
			familieMenue().schliesseAlle(null);
			knopf.focus();
		});
		knopf.addEventListener('click', function () {
			var offen = kopf.classList.toggle('menue-offen');
			knopf.setAttribute('aria-expanded', String(offen));
			var menue = familieMenue();
			if (offen) {
				var eigene = ziel.querySelector('.familie-feld.aktiv');
				menue.setze(eigene, true);
			} else {
				menue.schliesseAlle(null);
			}
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
	if (footer.classList.contains('seitenfuss')) { return; }
	footer.classList.add('seitenfuss');
	footer.textContent = '';
	var footerInnen = document.createElement('div');
	footerInnen.className = 'seitenfuss-innen';
	footer.appendChild(footerInnen);
	var recht = document.createElement('p');
	recht.className = 'footer-rechts';
	recht.appendChild(feedbackLink);
	[['/impressum.html', 'footer_recht'], ['/datenschutz.html', 'footer_datenschutz']].forEach(function (item) {
		recht.appendChild(document.createTextNode(' · '));
		var link = document.createElement('a'); link.href = item[0] + '?lang=' + sprache;
		link.textContent = t(item[1]); recht.appendChild(link);
	});
	footerInnen.appendChild(recht);
	// The language buttons moved from the header into the footer: the language
	// comes from the address, the stored choice or the browser anyway.
	var sprachen = document.querySelector('.sprachen');
	if (sprachen && sprachen.parentNode !== footerInnen) { footerInnen.appendChild(sprachen); }
})();

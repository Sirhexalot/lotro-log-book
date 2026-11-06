/* Menu bar shared by every page of the LOTRO Log Book: the pages and the
 * character switch. Needs texte.js, sprache.js (MQL_T) and speicher.js first.
 */
(function () {
	'use strict';

	var t = window.MQL_T || function (schluessel) { return schluessel; };
	var sprache = window.MQL_SPRACHE || 'de';
	var speicher = window.MQL_SPEICHER;
	var ziel = document.getElementById('menue');
	if (!ziel) { return; }

	var seite = document.body.getAttribute('data-seite') || '';
	if (seite === 'karte' && window.MQL_ART === 'taten') { seite = 'taten'; }
	var startseite = sprache === 'en' ? 'start-en.html' : (sprache === 'fr' ? 'start-fr.html' : 'start.html');

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

	[
		{ seite: 'karte', href: 'index.html?lang=' + sprache, text: t('menue_karte') },
		{ seite: 'taten', href: 'index.html?art=taten&lang=' + sprache, text: t('menue_taten') },
		{ seite: 'ruf', href: 'ruf.html?lang=' + sprache, text: t('menue_ruf') },
		{ seite: 'handwerk', href: 'handwerk.html?lang=' + sprache, text: t('menue_handwerk') },
		{ seite: 'belohnungen', href: 'belohnungen.html?lang=' + sprache, text: t('menue_belohnungen') },
		{ seite: 'suche', href: 'suche.html?lang=' + sprache, text: t('menue_suche') },
		{ seite: 'spielstand', href: 'spielstand.html?lang=' + sprache, text: t('menue_spielstand') }
	].forEach(function (punkt) {
		var link = document.createElement('a');
		link.href = punkt.href;
		link.textContent = punkt.text;
		if (punkt.seite === seite) { link.setAttribute('aria-current', 'page'); }
		ziel.appendChild(link);
	});

	// Phones get a burger button instead of a wrapped menu line.
	var kopf = document.querySelector('.kopf');
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
	[['impressum.html', 'footer_recht'], ['datenschutz.html', 'footer_datenschutz']].forEach(function (item, index) {
		if (index) { recht.appendChild(document.createTextNode(' · ')); }
		var link = document.createElement('a'); link.href = item[0] + '?lang=' + sprache;
		link.textContent = t(item[1]); recht.appendChild(link);
	});
	footer.appendChild(recht);
	// The language buttons moved from the header into the footer: the language
	// comes from the address, the stored choice or the browser anyway.
	var sprachen = document.querySelector('.sprachen');
	if (sprachen && sprachen.parentNode !== footer) { footer.appendChild(sprachen); }
	if (!speicher) { return; }
	var alle = speicher.alle();
	var feld = document.createElement('label');
	feld.className = 'charakterwahl';
	var beschriftung = document.createElement('span');
	beschriftung.textContent = t('charakter');
	var auswahl = document.createElement('select');
	auswahl.id = 'charakter';
	var ohne = document.createElement('option');
	ohne.value = '';
	ohne.textContent = alle.length ? t('ohne_spielstand') : t('kein_charakter');
	auswahl.appendChild(ohne);
	var aktiv = speicher.aktiv();
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
	ziel.appendChild(feld);
})();

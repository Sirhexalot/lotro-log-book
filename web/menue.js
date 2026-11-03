/* Menu bar shared by the map and the progress page: the three pages and the
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
	var startseite = sprache === 'en' ? 'start-en.html' : (sprache === 'fr' ? 'start-fr.html' : 'start.html');
	[
		{ seite: 'start', href: startseite, text: t('startseite') },
		{ seite: 'karte', href: 'index.html?lang=' + sprache, text: t('menue_karte') },
		{ seite: 'spielstand', href: 'spielstand.html?lang=' + sprache, text: t('menue_spielstand') }
	].forEach(function (punkt) {
		var link = document.createElement('a');
		link.href = punkt.href;
		link.textContent = punkt.text;
		if (punkt.seite === seite) { link.setAttribute('aria-current', 'page'); }
		ziel.appendChild(link);
	});

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

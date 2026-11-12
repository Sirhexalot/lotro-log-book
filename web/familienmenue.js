/* Family groups in the header: open, close, keyboard, outside click.
 *
 * The buttons are built either by menue.js (application pages) or by PHP
 * (catalogue pages); this file only adds the behaviour, so both share it.
 * A family is a group, never a page.
 */
(function () {
	'use strict';

	function felder() {
		return Array.prototype.slice.call(document.querySelectorAll('#menue .familie-feld'));
	}

	function setze(feld, offen) {
		if (!feld) { return; }
		feld.classList.toggle('offen', offen);
		var knopf = feld.querySelector('.familie-knopf');
		if (knopf) { knopf.setAttribute('aria-expanded', String(offen)); }
	}

	function schliesseAlle(ausser) {
		felder().forEach(function (feld) {
			if (feld !== ausser) { setze(feld, false); }
		});
	}

	function binde() {
		felder().forEach(function (feld) {
			if (feld.dataset.menueGebunden) { return; }
			feld.dataset.menueGebunden = '1';
			var knopf = feld.querySelector('.familie-knopf');
			if (!knopf) { return; }
			knopf.addEventListener('click', function () {
				var offen = !feld.classList.contains('offen');
				schliesseAlle(feld);
				setze(feld, offen);
			});
		});
	}

	document.addEventListener('keydown', function (ereignis) {
		if (ereignis.key !== 'Escape') { return; }
		var offen = document.querySelector('#menue .familie-feld.offen .familie-knopf');
		schliesseAlle(null);
		if (offen) { offen.focus(); }
	});

	document.addEventListener('click', function (ereignis) {
		var ziel = document.getElementById('menue');
		if (!ziel || ziel.contains(ereignis.target)) { return; }
		var knopf = ereignis.target.closest && ereignis.target.closest('.menue-knopf');
		if (knopf) { return; }
		schliesseAlle(null);
	});

	window.MQL_FAMILIENMENUE = { setze: setze, schliesseAlle: schliesseAlle, binde: binde };
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', binde);
	} else {
		binde();
	}
})();

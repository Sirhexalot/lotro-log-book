/* Companion guide page: the Windows/macOS tabs and the copy button for the
 * command. Nothing leaves the browser here either.
 */
(function () {
	'use strict';

	var t = window.MQL_T || function (schluessel) { return schluessel; };

	var system = /Mac/i.test(navigator.platform || navigator.userAgent) ? 'mac' : 'windows';
	try { system = window.localStorage.getItem('mql.system') || system; } catch (fehler) {}

	function zeigeSystem(wahl) {
		try { window.localStorage.setItem('mql.system', wahl); } catch (fehler) {}
		document.querySelectorAll('[data-reiter]').forEach(function (knopf) {
			knopf.setAttribute('aria-pressed', String(knopf.getAttribute('data-reiter') === wahl));
		});
		document.querySelectorAll('[data-inhalt]').forEach(function (block) {
			block.hidden = block.getAttribute('data-inhalt') !== wahl;
		});
	}
	document.querySelectorAll('[data-reiter]').forEach(function (knopf) {
		knopf.addEventListener('click', function () { zeigeSystem(knopf.getAttribute('data-reiter')); });
	});
	zeigeSystem(system);

	var kopieren = document.getElementById('mac-kopieren');
	if (kopieren) {
		kopieren.addEventListener('click', function () {
			var befehl = document.getElementById('mac-befehl');
			if (!navigator.clipboard || !befehl) { return; }
			navigator.clipboard.writeText(befehl.textContent).then(function () {
				kopieren.textContent = t('cp_kopiert');
			});
		});
	}
})();

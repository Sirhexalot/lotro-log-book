/* Companion guide page: the Windows/macOS tabs and the copy button for the
 * command. Nothing leaves the browser here either.
 */
(function () {
	'use strict';

	var t = window.MQL_T || function (schluessel) { return schluessel; };

	var system = /Mac/i.test(navigator.platform || navigator.userAgent) ? 'mac' : 'windows';
	try { system = window.localStorage.getItem('mql.system') || system; } catch (fehler) {}

	/* The Windows/macOS switch is the shared tab bar; only the choice is ours. */
	var reiter = document.querySelector('.llb-reiter');
	if (reiter && window.MQL_REITER) {
		window.MQL_REITER.mount(reiter, {
			aktiv: system,
			onShow: function (wahl) {
				try { window.localStorage.setItem('mql.system', wahl); } catch (fehler) {}
				/* The path boxes further down follow the same choice; they are not
				 * a second tab bar. */
				document.querySelectorAll('[data-inhalt]').forEach(function (block) {
					block.hidden = block.getAttribute('data-inhalt') !== wahl;
				});
			}
		});
	}

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

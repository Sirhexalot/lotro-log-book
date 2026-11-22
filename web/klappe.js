/* One behaviour for every popover panel: toggle by its button, close on a click
 * outside, close on Escape and give focus back to the button.
 *
 * Markup and look live in klappe.css. A page only binds button and panel and may
 * fill the panel just before it opens (legend, note list, resources). */
(function () {
	'use strict';

	window.MQL_KLAPPE = {
		/* knopf: the toggle button
		 * feld:  the panel, hidden while closed
		 * optionen:
		 *   vorOeffnen  runs before the panel becomes visible
		 *   rahmen      element whose outside closes the panel (default: the
		 *               button's parent, i.e. button and panel together) */
		bind: function (knopf, feld, optionen) {
			if (!knopf || !feld) { return null; }
			optionen = optionen || {};
			var rahmen = optionen.rahmen || knopf.parentElement || feld.parentElement;

			function setzeOffen(offen) {
				if (offen && optionen.vorOeffnen) { optionen.vorOeffnen(); }
				feld.hidden = !offen;
				knopf.setAttribute('aria-expanded', String(offen));
				if (!offen && rahmen && rahmen.contains(document.activeElement)) { knopf.focus(); }
			}

			knopf.addEventListener('click', function () {
				setzeOffen(feld.hidden);
			});
			/* Map markers and other controls may stop bubbling; listen in the
			 * capture phase so the panel still closes without swallowing their
			 * click. */
			document.addEventListener('click', function (ereignis) {
				if (!feld.hidden && rahmen && !rahmen.contains(ereignis.target)) { setzeOffen(false); }
			}, true);
			document.addEventListener('keydown', function (ereignis) {
				if (ereignis.key !== 'Escape' || feld.hidden || ereignis.defaultPrevented) { return; }
				setzeOffen(false);
			});

			return {
				oeffnen: function () { if (feld.hidden) { setzeOffen(true); } },
				schliessen: function () { if (!feld.hidden) { setzeOffen(false); } },
				offen: function () { return !feld.hidden; }
			};
		}
	};
}());

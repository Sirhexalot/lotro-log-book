/* Shared manual quest/deed status control. Status is stored locally only. */
(function (root) {
	'use strict';
	var labels = {
		de: { open: 'Offen', running: 'In Arbeit', done: 'Erledigt', reset: 'Importstatus verwenden', manual: 'manuell gesetzt',
			info: 'Manuelle Angaben gelten bis zum nächsten passenden Companion-Import. Der Import kann sie ersetzen.' },
		en: { open: 'Open', running: 'In progress', done: 'Completed', reset: 'Use imported status', manual: 'set manually',
			info: 'Manual entries apply until the next matching Companion import. The import can replace them.' },
		fr: { open: 'Ouverte', running: 'En cours', done: 'Terminée', reset: 'Utiliser le statut importé', manual: 'défini manuellement',
			info: 'Les indications manuelles restent valables jusqu’au prochain import Companion correspondant. Celui-ci peut les remplacer.' }
	};
	var symbols = { offen: '·', laufend: '◐', fertig: '✓' };
	var values = ['offen', 'laufend', 'fertig'];

	function text(status, lang) {
		var w = labels[lang] || labels.de;
		return symbols[status] + ' ' + (status === 'offen' ? w.open : status === 'laufend' ? w.running : w.done);
	}

	function create(art, id, callback) {
		var lang = root.MQL_SPRACHE || document.documentElement.lang || 'de';
		var store = root.MQL_SPEICHER;
		if (!store || !store.status) { return null; }
		if (!store.aktiv() && store.aktiviereManuell) {
			store.aktiviereManuell(lang === 'fr' ? 'Indications manuelles' : lang === 'en' ? 'Manual entries' : 'Manuelle Angaben');
		}
		if (!store.aktiv()) { return null; }
		var status = store.status(art, id);
		if (!status) { return null; }
		var w = labels[lang] || labels.de, wrapper = document.createElement('span');
		wrapper.className = 'manueller-status';
		wrapper.dataset.kind = art;
		wrapper.dataset.id = id;
		var select = document.createElement('select');
		select.className = 'manueller-status-auswahl';
		select.setAttribute('aria-label', lang === 'fr' ? 'Statut' : lang === 'en' ? 'Status' : 'Status');
		var reset = document.createElement('button');
		reset.type = 'button';
		reset.className = 'manueller-status-zurueck';
		reset.textContent = '↺';
		reset.setAttribute('aria-label', w.reset);
		reset.title = w.reset;
		wrapper.append(select, reset);
		function draw() {
			status = store.status(art, id);
			if (!status) { wrapper.hidden = true; return; }
			wrapper.hidden = false;
			select.value = status;
			wrapper.classList.toggle('manuell', !!store.manuelleStatus(art, id));
			reset.hidden = !store.manuelleStatus(art, id);
		}
		values.forEach(function (value) {
			var option = document.createElement('option');
			option.value = value;
			option.textContent = text(value, lang);
			select.appendChild(option);
		});
		select.addEventListener('change', function () {
			store.setzeStatus(art, id, select.value);
			draw();
			root.dispatchEvent(new root.Event('mql-status'));
			if (callback) { callback(select.value); }
		});
		reset.addEventListener('click', function (event) {
			event.stopPropagation();
			store.entferneManuellenStatus(art, id);
			draw();
			root.dispatchEvent(new root.Event('mql-status'));
			if (callback) { callback(store.status(art, id)); }
		});
		draw();
		return wrapper;
	}

	root.MQL_STATUS_UI = { create: create };
})(this);

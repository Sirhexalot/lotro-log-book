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
		var store = root.MQL_SPEICHER, lang = root.MQL_SPRACHE || document.documentElement.lang || 'de';
		if (!store || !store.aktiv() || !store.status) { return null; }
		var status = store.status(art, id);
		if (!status) { return null; }
		var w = labels[lang] || labels.de, wrapper = document.createElement('span');
		wrapper.className = 'manueller-status';
		wrapper.dataset.kind = art;
		wrapper.dataset.id = id;
		var button = document.createElement('button');
		button.type = 'button';
		button.className = 'manueller-status-knopf';
		button.setAttribute('aria-haspopup', 'menu');
		var menu = document.createElement('span');
		menu.className = 'manueller-status-menue';
		menu.hidden = true;
		function draw() {
			status = store.status(art, id);
			if (!status) { wrapper.hidden = true; return; }
			wrapper.hidden = false;
			button.textContent = text(status, lang) + ' ▾';
			button.classList.toggle('manuell', !!store.manuelleStatus(art, id));
			button.title = store.manuelleStatus(art, id) ? w.manual : '';
			menu.replaceChildren();
			values.forEach(function (value) {
				var choice = document.createElement('button');
				choice.type = 'button';
				choice.textContent = text(value, lang);
				choice.setAttribute('aria-pressed', String(status === value));
				choice.addEventListener('click', function (event) {
					event.stopPropagation();
					store.setzeStatus(art, id, value);
					menu.hidden = true;
					draw();
					root.dispatchEvent(new root.Event('mql-status'));
					if (callback) { callback(value); }
				});
				menu.appendChild(choice);
			});
			var reset = document.createElement('button');
			reset.type = 'button';
			reset.textContent = store.manuelleStatus(art, id) ? w.reset : w.info;
			reset.className = 'manueller-status-info';
			reset.title = w.info;
			reset.addEventListener('click', function (event) {
				event.stopPropagation();
				if (store.manuelleStatus(art, id)) {
					store.entferneManuellenStatus(art, id);
					menu.hidden = true;
					draw();
					root.dispatchEvent(new root.Event('mql-status'));
					if (callback) { callback(store.status(art, id)); }
				}
			});
			menu.appendChild(reset);
		}
		button.addEventListener('click', function (event) {
			event.stopPropagation();
			menu.hidden = !menu.hidden;
			button.setAttribute('aria-expanded', String(!menu.hidden));
		});
		wrapper.append(button, menu);
		draw();
		return wrapper;
	}

	root.MQL_STATUS_UI = { create: create };
})(this);

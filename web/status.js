/* Shared manual quest/deed status control. Status is stored locally only. */
(function (root) {
	'use strict';
	var labels = {
		de: { progress: 'Fortschritt', all: 'Alle', available: 'Annehmbar', open: 'Offen', running: 'In Arbeit', done: 'Erledigt', unset: 'Nicht gesetzt', status: 'Fortschritt:', questStatus: 'Fortschritt der Aufgabe:', deedStatus: 'Fortschritt der Tat:', reset: 'Importstatus verwenden', manual: 'manuell gesetzt',
			info: 'Manuelle Angaben gelten bis zum nächsten passenden Companion-Import. Der Import kann sie ersetzen.' },
		en: { progress: 'Progress', all: 'All', available: 'Available', open: 'Open', running: 'In progress', done: 'Completed', unset: 'Not set', status: 'Progress:', questStatus: 'Quest progress:', deedStatus: 'Deed progress:', reset: 'Use imported status', manual: 'set manually',
			info: 'Manual entries apply until the next matching Companion import. The import can replace them.' },
		fr: { progress: 'Progression', all: 'Toutes', available: 'Disponible', open: 'Ouverte', running: 'En cours', done: 'Terminée', unset: 'Non défini', status: 'Progression :', questStatus: 'Progression de la quête :', deedStatus: 'Progression de la prouesse :', reset: 'Utiliser le statut importé', manual: 'défini manuellement',
			info: 'Les indications manuelles restent valables jusqu’au prochain import Companion correspondant. Celui-ci peut les remplacer.' }
	};
	var symbols = { offen: '·', laufend: '◐', fertig: '✓' };
	var values = ['offen', 'laufend', 'fertig'];

	function text(status, lang) {
		var w = labels[lang] || labels.de;
		return symbols[status] + ' ' + (status === 'offen' ? w.open : status === 'laufend' ? w.running : w.done);
	}

	function create(art, id, callback, context, finderStatus) {
		var lang = root.MQL_SPRACHE || document.documentElement.lang || 'de';
		var store = root.MQL_SPEICHER;
		if (!store || !store.status) { return null; }
		var finder = context === 'questfinder';
		function activateManual() {
			if (!store.aktiv() && store.aktiviereManuell) {
				store.aktiviereManuell(lang === 'fr' ? 'Indications manuelles' : lang === 'en' ? 'Manual entries' : 'Manuelle Angaben');
			}
		}
		var w = labels[lang] || labels.de, wrapper = document.createElement('span');
		wrapper.className = 'manueller-status';
		wrapper.dataset.kind = art;
		wrapper.dataset.id = id;
		var label = document.createElement('span');
		label.className = 'manueller-status-label';
		label.textContent = context === 'quest' ? w.questStatus : context === 'deed' ? w.deedStatus : w.status;
		var select = document.createElement('select');
		select.className = 'manueller-status-auswahl';
		select.setAttribute('aria-label', label.textContent.replace(/\s*:$/, ''));
		var reset = document.createElement('button');
		reset.type = 'button';
		reset.className = 'manueller-status-zurueck';
		reset.textContent = '↺';
		reset.setAttribute('aria-label', w.reset);
		reset.title = w.reset;
		wrapper.append(label, select, reset);
		function draw() {
			var manual = store.manuelleStatus(art, id);
			var status = finder ? manual || finderStatus : store.status(art, id);
			select.value = values.indexOf(status) >= 0 ? status : '';
			wrapper.classList.remove('status-offen', 'status-laufend', 'status-fertig');
			if (status) { wrapper.classList.add('status-' + status); }
			wrapper.classList.toggle('manuell', !!manual);
			reset.hidden = !manual;
		}
		var unset = document.createElement('option');
		unset.value = '';
		unset.textContent = w.unset;
		unset.disabled = true;
		select.appendChild(unset);
		values.forEach(function (value) {
			var option = document.createElement('option');
			option.value = value;
			option.textContent = text(value, lang);
			select.appendChild(option);
		});
		select.addEventListener('change', function () {
			activateManual();
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

	root.MQL_STATUS_UI = { create: create, words: function (lang) { return labels[lang] || labels.de; } };
})(this);

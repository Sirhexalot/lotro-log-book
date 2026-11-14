/* Adventure overview: fills the server-rendered cards with the visitor's own
 * progress. Everything happens in this browser; no request carries character
 * data. Without JavaScript the cards keep their names, levels and summaries.
 */
(function (root, document) {
	'use strict';

	var core = root.MQL_ABENTEUER;
	var catalogue = root.MQL_ABENTEUER_KATALOG;
	var speicher = root.MQL_SPEICHER;
	var T = root.MQL_ABENTEUER_TEXTE || {};
	if (!core || !catalogue) { return; }

	function text(key) { return Object.prototype.hasOwnProperty.call(T, key) ? T[key] : key; }
	function fill(template, values) {
		var index = 0;
		return String(template).replace(/%s/g, function () {
			return values[index] === undefined ? '' : values[index++];
		});
	}
	function active() {
		return speicher && typeof speicher.aktiv === 'function' ? speicher.aktiv() : null;
	}
	function accountKey() {
		var character = active();
		return character && character.account ? character.account : 'lokal';
	}
	function settings() {
		return core.read(accountKey());
	}
	function questsOf(character) {
		return character && Array.isArray(character.quests) ? character.quests : null;
	}

	var cards = {};
	Array.prototype.forEach.call(document.querySelectorAll('[data-pack]'), function (card) {
		cards[card.getAttribute('data-pack')] = card;
	});

	function stateWord(row) {
		switch (row.state) {
		case 'started': return text('ab_stand_angefangen');
		case 'complete': return text('ab_stand_fertig');
		case 'unrecorded': return '';
		case 'no_content': return '';
		default: return '';
		}
	}
	function fitWord(row) {
		switch (row.level_fit) {
		case 'below': return text('ab_fit_below');
		case 'fits': return text('ab_fit_fits');
		case 'above': return text('ab_fit_above');
		default: return '';
		}
	}


	function paintCharacter(result) {
		var target = document.getElementById('abenteuer-charakter');
		var character = active();
		if (!target) { return; }
		// Without a character the server markup already says so and links the import.
		if (!character) { return; }
		var level = result.level ? fill(text('ab_stufe'), [result.level]) : text('ab_ohne_stufe');
		var teile = [character.name];
		if (character.server) { teile.push(character.server); }
		teile.push(level);
		target.textContent = teile.join(' · ');
	}

	function paintCard(row) {
		var card = cards[row.id];
		if (!card) { return; }
		var stand = card.querySelector('[data-stand-wort]');
		if (stand) {
			var fit = fitWord(row);
			stand.textContent = [stateWord(row), fit].filter(Boolean).join(' · ');
		}
		var bar = card.querySelector('[data-balken]');
		var detail = card.querySelector('[data-detail]');
		if (bar) {
			var has = row.coverage !== null && row.coverage !== undefined && row.total > 0;
			bar.hidden = !has;
			var fillEl = bar.firstElementChild;
			if (has && fillEl) {
				fillEl.style.width = Math.round(row.coverage * 100) + '%';
				fillEl.className = row.completed > 0 ? '' : 'leer';
			}
		}
		if (detail) {
			detail.hidden = row.coverage === null || row.coverage === undefined;
			if (!detail.hidden) {
				detail.textContent = fill(text('ab_zaehler'), [row.completed, row.total])
					+ ' · ' + fill(text('ab_prozent'), [Math.round(row.coverage * 100)]);
			}
		}
		var zugang = card.querySelector('[data-zugang]');
		if (zugang) {
			var word = row.access === 'missing' ? text('ab_zugang_missing')
				: row.access === 'available' && row.free !== true ? text('ab_zugang_owned') : '';
			zugang.textContent = word;
			zugang.hidden = word === '';
		}
		var areas = {};
		resultAreas(row).forEach(function (area) { areas[area.id] = area; });
		Array.prototype.forEach.call(card.querySelectorAll('[data-gebiet]'), function (item) {
			var area = areas[item.getAttribute('data-gebiet')];
			var slot = item.querySelector('[data-gebiet-stand]');
			if (!slot) { return; }
			if (!area || area.coverage === null || area.coverage === undefined) {
				slot.textContent = '';
				return;
			}
			slot.textContent = area.completed >= area.total ? text('ab_gebiet_fertig')
				: fill(text('ab_gebiet_zaehler'), [area.completed, area.total]);
		});
	}
	function resultAreas(row) {
		return row.area_rows || [];
	}

	function paintHint(kind, row) {
		var box = document.querySelector('[data-hinweis="' + kind + '"]');
		if (!box) { return; }
		box.hidden = !row;
		if (!row) { return; }
		var title = box.querySelector('[data-hinweis-titel]');
		var body = box.querySelector('[data-hinweis-text]');
		var go = box.querySelector('[data-hinweis-ziel]');
		if (title) { title.textContent = row.name; }
		if (body) {
			body.textContent = '';
			body.hidden = true;
		}
		if (go) {
			var area = row.next_area ? resultAreas(row).filter(function (entry) {
				return entry.id === row.next_area;
			})[0] : null;
			go.textContent = area && area.name ? fill(text('ab_hinweis_weiter'), [area.name])
				: fill(text('ab_hinweis_weiter'), [row.name]);
			go.hidden = false;
			go.onclick = function () { openPack(row.id, row.next_area); };
			var map = box.querySelector('[data-hinweis-karte]');
			if (map) {
				var target = area ? area.id : (resultAreas(row)[0] || {}).id;
				map.hidden = !target;
				map.onclick = function () {
					if (root.MQL_ABENTEUER_KARTE && target) { root.MQL_ABENTEUER_KARTE.zeige(target); }
				};
			}
		}
	}

	function openPack(id, areaId) {
		var card = cards[id];
		if (!card) { return; }
		var more = card.querySelector('[data-mehr]');
		var areas = card.querySelector('[data-gebiete]');
		if (areas) { areas.hidden = false; }
		if (more) {
			more.setAttribute('aria-expanded', 'true');
			more.textContent = text('ab_close');
		}
		card.scrollIntoView({ block: 'center', behavior: 'smooth' });
		card.classList.add('hervorgehoben');
		window.setTimeout(function () { card.classList.remove('hervorgehoben'); }, 1800);
		if (areaId) {
			var row = card.querySelector('[data-gebiet="' + areaId + '"]');
			if (row) {
				row.classList.add('gebiet-hervorgehoben');
				row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
				window.setTimeout(function () { row.classList.remove('gebiet-hervorgehoben'); }, 1800);
			}
		}
	}

	function wireExpander() {
		Array.prototype.forEach.call(document.querySelectorAll('[data-mehr]'), function (button) {
			button.addEventListener('click', function () {
				var card = button.closest('[data-pack]');
				var areas = card ? card.querySelector('[data-gebiete]') : null;
				if (!areas) { return; }
				var open = areas.hidden;
				areas.hidden = !open;
				button.setAttribute('aria-expanded', open ? 'true' : 'false');
				button.textContent = open ? text('ab_close') : text('ab_open');
			});
		});
	}

	function paintSettings() {
		var saved = settings();
		Array.prototype.forEach.call(document.querySelectorAll('[data-inhalt]'), function (select) {
			var id = select.getAttribute('data-inhalt');
			var value = saved && saved.packs ? saved.packs[id] : null;
			select.value = value === 'owned' || value === 'missing' ? value : 'unknown';
		});
	}

	function paintContents(result) {
		result.packs.forEach(function (pack) {
			var slot = document.querySelector('[data-inhalt-stand="' + pack.id + '"]');
			if (!slot) { return; }
			slot.textContent = pack.coverage === null || pack.coverage === undefined
				? '' : Math.round(pack.coverage * 100) + ' %';
		});
	}

	/** Short visual answer to a choice: the row and its card light up. */
	function flash(ids) {
		(Array.isArray(ids) ? ids : [ids]).forEach(function (id) {
			var row = document.querySelector('[data-inhalt-zeile="' + id + '"]');
			var card = cards[id];
			[row, card].forEach(function (element) {
				if (!element) { return; }
				element.classList.add('frisch-gewaehlt');
				window.setTimeout(function () { element.classList.remove('frisch-gewaehlt'); }, 1500);
			});
		});
	}

	function gespeichert(ids) {
		var settingsNow = { packs: {}, vip: settings().vip };
		Array.prototype.forEach.call(document.querySelectorAll('[data-inhalt]'), function (other) {
			if (other.value !== 'unknown') {
				settingsNow.packs[other.getAttribute('data-inhalt')] = other.value;
			}
		});
		var ok = core.write(accountKey(), settingsNow, Object.keys(cards));
		var status = document.querySelector('.inhalte-status');
		if (status) { status.textContent = text(ok ? 'ab_gespeichert' : 'ab_nicht_gespeichert'); }
		if (ids) { flash(ids); }
		render();
	}

	function wireSettings() {
		Array.prototype.forEach.call(document.querySelectorAll('[data-inhalt]'), function (select) {
			select.addEventListener('change', function () {
				gespeichert(select.getAttribute('data-inhalt'));
			});
		});
		Array.prototype.forEach.call(document.querySelectorAll('[data-alle]'), function (button) {
			button.addEventListener('click', function () {
				var value = button.getAttribute('data-alle');
				var changed = [];
				Array.prototype.forEach.call(document.querySelectorAll('[data-inhalt]'), function (select) {
					select.value = value;
					changed.push(select.getAttribute('data-inhalt'));
				});
				gespeichert(changed);
			});
		});
	}

	function render() {
		var character = active();
		var result = core.analyse(catalogue, character
			? { quests: questsOf(character) || [], level: character.level } : null, settings());
		paintCharacter(result);
		result.packs.forEach(paintCard);
		paintContents(result);
		paintHint('finish', result.hints.finish);
		paintHint('level', result.hints.level);
		var empty = document.getElementById('hinweis-leer');
		if (empty) {
			empty.hidden = result.status === 'ready';
			if (!empty.hidden) {
				empty.textContent = result.status === 'import_required'
					? fill(text('ab_import_hint'), []) : text('ab_kein_hinweis');
				if (result.status === 'import_required') {
					var link = document.createElement('a');
					link.href = (document.querySelector('.kopf .importieren') || {}).href || '/de/spielstand/';
					link.textContent = text('ab_import_link');
					empty.appendChild(document.createTextNode(' '));
					empty.appendChild(link);
				}
			}
		}
		// The map view reads the same result; no data leaves the browser.
		root.MQL_ABENTEUER_STAND = result;
		try {
			if (typeof root.CustomEvent === 'function') {
				root.dispatchEvent(new root.CustomEvent('mql:abenteuer'));
			}
		} catch (fehler) { /* old browser: the map reads the global directly */ }
	}

	wireExpander();
	paintSettings();
	wireSettings();
	render();
	root.addEventListener('storage', render);
	if (root.MQL_SPEICHER && document.querySelector('.charakterwahl')) {
		// A character switch reloads the page elsewhere; re-read on return.
		document.addEventListener('visibilitychange', function () {
			if (!document.hidden) { paintSettings(); render(); }
		});
	}
})(window, document);

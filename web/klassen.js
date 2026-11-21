(function () {
	'use strict';
	var data = window.MQL_KLASSEN;
	if (!data) { return; }
	var lang = document.documentElement.lang || 'de';
	var text = {
		de: { intro: 'Wähle Klasse, Volk und Stufe. Das Profil zeigt die vom Spiel belegten Waffen- und Rüstungskenntnisse.', classLabel: 'Klasse', raceLabel: 'Volk', levelLabel: 'Stufe', mine: 'Mein Charakter', imported: 'Aus deinem importierten Spielstand', manual: 'Manuell gewählt', noCharacter: 'Kein importierter Charakter – wähle deine Kombination aus.', match: 'Diese Kombination ist spielbar.', noMatch: 'Diese Kombination ist laut Spieldaten nicht verfügbar.', armour: 'Rüstung', weapons: 'Waffen', quests: 'Aufgaben', deeds: 'Taten', items: 'Gegenstände', catalogue: 'Aufgaben, Taten und Gegenstände' },
		en: { intro: 'Choose a class, race and level. The profile shows the weapon and armour proficiencies recorded by the game.', classLabel: 'Class', raceLabel: 'Race', levelLabel: 'Level', mine: 'My character', imported: 'From your imported character', manual: 'Chosen manually', noCharacter: 'No imported character — choose a combination.', match: 'This combination is playable.', noMatch: 'This combination is not available according to the game data.', armour: 'Armour', weapons: 'Weapons', quests: 'Quests', deeds: 'Deeds', items: 'Items', catalogue: 'Quests, deeds and items' },
		fr: { intro: 'Choisissez une classe, une race et un niveau. Le profil indique les maîtrises d’armes et d’armures enregistrées dans le jeu.', classLabel: 'Classe', raceLabel: 'Race', levelLabel: 'Niveau', mine: 'Mon personnage', imported: 'D’après votre personnage importé', manual: 'Choix manuel', noCharacter: 'Aucun personnage importé — choisissez une combinaison.', match: 'Cette combinaison est jouable.', noMatch: 'Cette combinaison n’est pas disponible selon les données du jeu.', armour: 'Armure', weapons: 'Armes', quests: 'Quêtes', deeds: 'Prouesses', items: 'Objets', catalogue: 'Quêtes, prouesses et objets' }
	}[lang] || {};
	function $(id) { return document.getElementById(id); }
	function versionedAsset(path) {
		var source = Array.prototype.find.call(document.scripts, function (script) {
			return script.src.indexOf('/klassen.js') >= 0;
		});
		var version = source && new URL(source.src).searchParams.get('v');
		return path + (version ? '?v=' + encodeURIComponent(version) : '');
	}
	function options(select, values, selected, kind) {
		select.replaceChildren();
		values.forEach(function (key) {
			var option = document.createElement('option');
			option.value = key;
			option.textContent = kind === 'class'
				? data.classes[key].names[lang] : data.races[key].names[lang];
			option.selected = key === selected;
			select.appendChild(option);
		});
	}
	function activeCharacter() {
		var store = window.MQL_SPEICHER, character = store && store.aktiv();
		if (!character || character.manuellOnly) { return null; }
		var classKey = findKey(data.classes, character.klasse);
		var raceKey = findKey(data.races, character.race);
		var level = Number(character.level);
		if (!classKey || !raceKey || !data.classes[classKey].races.includes(raceKey) || !Number.isInteger(level) || level < 1) { return null; }
		return {klasse:classKey, race:raceKey, level:level};
	}
	function findKey(entries, value) {
		var key = String(value || '').trim().toLowerCase();
		return key && Object.keys(entries).find(function (entry) { return entry.toLowerCase() === key; });
	}
	function paintList(target, entries, enumName, level) {
		target.replaceChildren();
		entries.forEach(function (item) {
			var li = document.createElement('li');
			var enumData = data.enums[enumName];
			li.textContent = (enumData[lang][item.type] || item.type);
			if (item.level > 1) {
				li.textContent += ' · ' + (lang === 'fr' ? 'niv. ' : lang === 'en' ? 'level ' : 'ab Stufe ') + item.level;
			}
			if (item.level > level) { li.className = 'klassen-gesperrt'; }
			target.appendChild(li);
		});
		if (!entries.length) {
			var li = document.createElement('li');
			li.textContent = '—';
			target.appendChild(li);
		}
	}
	function render() {
		var classKey = $('klassen-klasse').value, raceKey = $('klassen-volk').value;
		var level = Math.max(1, Number($('klassen-stufe').value) || 1);
		var cls = data.classes[classKey], race = data.races[raceKey];
		$('klassen-profil-titel').textContent = cls.names[lang];
		var allowed = cls.races.indexOf(raceKey) >= 0;
		$('klassen-kombination').textContent = race.names[lang] + ' · ' +
			(allowed ? text.match : text.noMatch);
		$('klassen-kombination').className = allowed ? 'klassen-erlaubt' : 'klassen-nicht-erlaubt';
		paintList($('klassen-ruestung'), cls.armour, 'ArmourType', level);
		paintList($('klassen-waffen'), cls.weapons, 'WeaponType', level);
		renderCatalogue(classKey, raceKey, level);
		var active = activeCharacter();
		var matches = active && active.klasse === classKey && active.race === raceKey && active.level === level;
		$('klassen-charakter-status').textContent = !active ? text.noCharacter : matches ? text.imported : text.manual;
		$('klassen-mein-charakter').disabled = !active;
		var url = new URL(location.href);
		url.searchParams.set('klasse', classKey);
		url.searchParams.set('volk', raceKey);
		url.searchParams.set('stufe', String(level));
		history.replaceState(history.state, '', url.pathname + url.search);
	}
	var tabs = {
		quests: { list: 'klassen-aufgaben', panel: 'liste-aufgaben', segment: { de: 'aufgabe', en: 'quest', fr: 'quete' } },
		deeds: { list: 'klassen-taten', panel: 'liste-taten', segment: { de: 'tat', en: 'deed', fr: 'prouesse' } },
		items: { list: 'klassen-gegenstaende', panel: 'liste-gegenstaende', segment: { de: 'gegenstand', en: 'item', fr: 'objet' } }
	};
	var chosenTab = 'quests';
	var itemDataPromise = null, cataloguePromise = null;
	var profileSignature = '', filterControllers = Object.create(null);
	var filterRoots = {quests:'liste-aufgaben', deeds:'liste-taten', items:'filter-gegenstaende'};
	var tabRoots = {quests:'liste-aufgaben', deeds:'liste-taten'};
	var filterReset = Promise.resolve();
	function removeFilterQuery() {
		var url = new URL(location.href);
		Array.from(url.searchParams.keys()).forEach(function (key) { if (key.indexOf('kf-') === 0) { url.searchParams.delete(key); } });
		history.replaceState(history.state, '', url.pathname + url.search + url.hash);
	}
	function profileChanged(classKey, raceKey, level) {
		var signature = classKey + ':' + raceKey + ':' + level;
		if (signature === profileSignature) { return filterReset; }
		profileSignature = signature;
		removeFilterQuery();
		var previous = Object.keys(filterControllers).map(function (key) { return filterControllers[key]; });
		filterControllers = Object.create(null);
		filterReset = filterReset.then(function () { return Promise.all(previous.map(function (controller) { return controller.destroy(); })); });
		return filterReset;
	}
	function scopedSetup(setup, name, signature) {
		var original = setup.config.urlCodec, prefix = 'kf-' + name + '.';
		setup.config.area = 'klassen-' + name + '-' + signature;
		setup.config.rootUrl = location.origin + location.pathname;
		setup.config.urlCodec = {
			decode: function (url) {
				var inner = new URL(url.href), found = false;
				inner.search = ''; inner.hash = '';
				url.searchParams.forEach(function (value, key) { if (key.indexOf(prefix) === 0) { inner.searchParams.append(key.slice(prefix.length), value); found = true; } });
				var parsed = original.decode(inner); parsed.explicit = found; return parsed;
			},
			encode: function (state, url) {
				var inner = new URL(url.href); inner.search = ''; inner.hash = '';
				original.encode(state, inner);
				Array.from(url.searchParams.keys()).forEach(function (key) { if (key.indexOf(prefix) === 0) { url.searchParams.delete(key); } });
				inner.searchParams.forEach(function (value, key) { url.searchParams.append(prefix + key, value); });
				return url;
			}
		};
		return setup;
	}
	function mountFilter(name, rootId, setup) {
		if (filterControllers[name]) { return; }
		var root = $(rootId), error = root.querySelector('[data-filter-error]');
		error.hidden = true;
		var controller = window.MQL_FILTER_UI.mount(root, setup);
		var clearError = function () { error.hidden = true; };
		root.addEventListener('mql:filterchange', clearError);
		var destroy = controller.destroy;
		controller.destroy = function () {
			root.removeEventListener('mql:filterchange', clearError);
			return destroy.call(controller);
		};
		filterControllers[name] = controller;
		controller.ready.catch(function (reason) {
			console.error(reason);
			error.textContent = lang === 'fr' ? 'La liste n’a pas pu être chargée.' : lang === 'en' ? 'The list could not be loaded.' : 'Die Liste konnte nicht geladen werden.';
			error.hidden = false;
		});
	}
	function filteredTaskRows(kind, classKey, raceKey, level) {
		return (window.MQL_KLASSEN_KATALOG[kind] || []).filter(function (row) {
			return (!row[3] || row[3] === classKey) && (!row[4] || row[4] === raceKey) && (!row[2] || row[2] <= level);
		}).map(function (row) {
			return {id:row[0],name:row[1],level:row[2] || null,type:'',flags:row[7] || [],region:row[5] || '',area:row[6] || '',rewards:row[8] || [],points:row[9] || 0};
		});
	}
	function mountTask(kind, classKey, raceKey, level, signature) {
		var name = kind === 'q' ? 'quests' : 'deeds';
		if (filterControllers[name]) { return; }
		var rows = filteredTaskRows(kind === 'q' ? 'quests' : 'deeds', classKey, raceKey, level);
		if (reiter) { reiter.zahl(name, rows.length); }
		var setup = window.MQL_TASK_FILTER_SETUP(rows, kind);
		mountFilter(name, filterRoots[name], scopedSetup(setup, name, signature));
	}
	function ensureCatalogue() {
		if (window.MQL_KLASSEN_KATALOG) { return Promise.resolve(); }
		if (!cataloguePromise) {
			cataloguePromise = new Promise(function (resolve, reject) {
				var script = document.createElement('script'); script.src = versionedAsset('/klassen-katalog-' + lang + '.js');
				script.onload = resolve; script.onerror = reject; document.head.appendChild(script);
			});
		}
		return cataloguePromise;
	}
	function ensureItems() {
		if (window.MQL_GEGENSTAENDE) { return Promise.resolve(); }
		if (!itemDataPromise) {
			itemDataPromise = new Promise(function (resolve, reject) {
				var script = document.createElement('script'); script.src = versionedAsset('/gegenstaende-' + lang + '.js');
				script.onload = resolve; script.onerror = reject; document.head.appendChild(script);
			});
		}
		return itemDataPromise;
	}
	function renderCatalogue(classKey, raceKey, level) {
		var ready = profileChanged(classKey, raceKey, level);
		if (chosenTab === 'items') {
			var itemSignature = classKey + ':' + raceKey + ':' + level;
			ready.then(function () { return ensureItems(); }).then(function () {
				if (profileSignature === itemSignature && chosenTab === 'items') {
					renderItems(classKey, raceKey, level, itemSignature);
				}
			}).catch(function (error) { console.error(error); });
			return;
		}
		ready.then(function () { return ensureCatalogue(); }).then(function () {
			if (profileSignature !== classKey + ':' + raceKey + ':' + level) { return; }
			/* Both task tabs get their number up front; only the chosen one mounts
			 * a filter. The item tab follows when its data is loaded. */
			if (reiter) {
				reiter.zahl('quests', filteredTaskRows('quests', classKey, raceKey, level).length);
				reiter.zahl('deeds', filteredTaskRows('deeds', classKey, raceKey, level).length);
			}
			if (chosenTab === 'items') { return; }
			mountTask(chosenTab === 'deeds' ? 'd' : 'q', classKey, raceKey, level, profileSignature.replace(/[^a-zA-Z0-9_-]/g, '-'));
			/* The item tab's number needs its catalogue. Load it once the page is
			 * idle, but never on a metered or slow connection. */
			var spaeter = window.requestIdleCallback || function (fn) { return setTimeout(fn, 1500); };
			var merk = classKey + ':' + raceKey + ':' + level;
			spaeter(function () {
				var netz = navigator.connection || {};
				if (netz.saveData || /(^|-)2g$/.test(netz.effectiveType || '')) { return; }
				ensureItems().then(function () {
					if (profileSignature !== merk || !reiter) { return; }
					reiter.zahl('items', itemRowsFor(classKey, raceKey, level).rows.length);
				}).catch(function () {});
			});
		}).catch(function (error) {
			console.error(error);
			var root = $(tabRoots[chosenTab]), message = root.querySelector('[data-filter-error]');
			message.textContent = lang === 'fr' ? 'La liste n’a pas pu être chargée.' : lang === 'en' ? 'The list could not be loaded.' : 'Die Liste konnte nicht geladen werden.';
			message.hidden = false;
		});
	}
	function itemRowsFor(classKey, raceKey, level) {
		var equipment = window.MQL_GEGENSTAENDE, cls = data.classes[classKey], playerClasses = Object.keys(data.classes);
		var armour = {}, weapons = {};
		cls.armour.forEach(function (x) { armour[x.type] = x.level; }); cls.weapons.forEach(function (x) { weapons[x.type] = x.level; });
		var classToolKeys = new Set(equipment.classToolKeys || []);
		function requirements(row) { return (row[10] || '').split(';').filter(function (key) { return playerClasses.indexOf(key) >= 0; }); }
		function eligible(row) { var req = requirements(row); return (!req.length || req.indexOf(classKey) >= 0) && (!row[11] || row[11] === raceKey); }
		var classItems = equipment.e.filter(function (row) { var req = requirements(row), itemClass = equipment.klasseKey[row[8]]; return equipment.katKey[row[3]] === 'ITEM' && classToolKeys.has(itemClass) && req.length && eligible(row) && row[7] <= level && row[14] <= level; });
		var gear = equipment.e.filter(function (row) {
				var category = equipment.katKey[row[3]]; if (row[15] || !eligible(row) || row[7] > level) { return false; }
				if (category === 'ARMOUR') { return Object.prototype.hasOwnProperty.call(armour, row[12]) && armour[row[12]] <= level && row[14] <= level; }
				if (category === 'WEAPON' || category === 'LEGENDARY_WEAPON') { return Object.prototype.hasOwnProperty.call(weapons, row[13]) && weapons[row[13]] <= level && row[14] <= level; }
				return false;
			});
		return { rows: classItems.concat(gear), requirements: requirements };
	}
	function renderItems(classKey, raceKey, level, expectedSignature) {
		if (profileSignature !== expectedSignature || chosenTab !== 'items') { return; }
		var equipment = window.MQL_GEGENSTAENDE;
		var gebaut = itemRowsFor(classKey, raceKey, level), rows = gebaut.rows, requirements = gebaut.requirements;
		if (reiter) { reiter.zahl('items', rows.length); }
		var signature = profileSignature.replace(/[^a-zA-Z0-9_-]/g, '-');
		if (!rows.length || filterControllers.items) { return; }
		var setup = window.MQL_ITEM_FILTER_SETUP(equipment, {area:'klassen-items', ids:rows.map(function (row) { return row[0]; })});
		var renderResults = setup.adapter.renderResults;
		setup.adapter.renderResults = function (result, target) {
			var before = new Map(result.payload.map(function (row) { return [row[0], row]; }));
			renderResults(result, target);
			target.querySelectorAll('a.gs-zeile').forEach(function (link) {
				var row = before.get(link.href.split('/').filter(Boolean).pop()); if (!row) { return; }
				var others = requirements(row).filter(function (key) { return key !== classKey; }).map(function (key) { return data.classes[key].names[lang]; });
				if (others.length) { var meta = link.querySelector('.gs-meta'); if (meta) { meta.textContent += ' · ' + others.join(', '); } }
			});
		};
		mountFilter('items', filterRoots.items, scopedSetup(setup, 'i-items', signature));
	}
	var tx = {
		'klassen-titel': { text: { de: 'Klassen & Völker', en: 'Classes & races', fr: 'Classes et races' }[lang] },
		'klassen-intro': { text: text.intro },
		'label-klasse': { text: text.classLabel }, 'label-volk': { text: text.raceLabel },
		'label-stufe': { text: text.levelLabel }, 'label-ruestung': { text: text.armour },
		'label-waffen': { text: text.weapons },
		'klassen-mein-charakter': { text: text.mine }
	};
	Object.keys(tx).forEach(function (id) { $(id).textContent = tx[id].text; });
	document.querySelector('.klassen-katalog').setAttribute('aria-label', text.catalogue);
	var classKeys = Object.keys(data.classes).sort(function (a, b) {
		return MQL_SORT.compare(data.classes[a].names[lang], data.classes[b].names[lang]);
	});
	var params = new URLSearchParams(location.search), active = activeCharacter();
	var classKey = params.get('klasse') || (active && active.klasse) || 'Hunter';
	if (!data.classes[classKey]) { classKey = classKeys[0]; }
	var raceKey = params.get('volk') || (active && active.race) ||
		(data.classes[classKey].races.indexOf('hobbit') >= 0 ? 'hobbit' : data.classes[classKey].races[0]);
	if (!data.classes[classKey].races.includes(raceKey)) { raceKey = data.classes[classKey].races[0]; }
	options($('klassen-klasse'), classKeys, classKey, 'class');
	function raceOptions(selected) {
		var keys = data.classes[$('klassen-klasse').value].races.slice().sort(function (a, b) {
			return MQL_SORT.compare(data.races[a].names[lang], data.races[b].names[lang]);
		});
		options($('klassen-volk'), keys, selected, 'race');
	}
	raceOptions(raceKey);
	$('klassen-stufe').value = params.get('stufe') || (active && active.level) || 1;
	$('klassen-klasse').addEventListener('change', function () {
		raceOptions(data.classes[this.value].races[0]); render();
	});
	$('klassen-volk').addEventListener('change', render);
	$('klassen-stufe').addEventListener('input', render);
	var tabHost = document.querySelector('.klassen-katalog .llb-reiter');
	var reiter = null;
	if (tabHost && window.MQL_REITER) {
		reiter = window.MQL_REITER.mount(tabHost, {
			aktiv: 'quests',
			onShow: function (kind) { chosenTab = kind; render(); }
		});
	} else {
		render();
	}
	$('klassen-mein-charakter').addEventListener('click', function () {
		var character = activeCharacter();
		if (character) {
			$('klassen-klasse').value = character.klasse;
			raceOptions(character.race);
			$('klassen-stufe').value = character.level;
			render();
		} else {
			$('klassen-charakter-status').textContent = text.noCharacter;
		}
	});
}());

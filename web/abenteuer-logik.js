/* Adventure overview core. No network, no ownership inference.
 *
 * An adventure is one large content block (base game, expansion). Character
 * data is the existing Companion import: completed quest ids and the level,
 * read through the shared character store. Ownership is entered per account
 * and stays local; unknown ownership is never turned into "not bought".
 */
(function (root) {
	'use strict';
	var KEY = 'mql.abenteuer.inhalte.v1';
	var STATES = ['owned', 'missing', 'unknown'];

	function ids(values) {
		return new Set((Array.isArray(values) ? values : []).map(function (id) { return String(id).toUpperCase(); }));
	}
	function level(value) {
		if (!/^\d+$/.test(String(value))) { return null; }
		var n = Number(value);
		return n > 0 ? n : null;
	}
	function access(pack, settings) {
		if (pack.free === true) { return 'available'; }
		var state = settings && settings.packs && settings.packs[pack.id];
		if (state === 'owned') { return 'available'; }
		// VIP only grants access when a dated, verified rule explicitly says so.
		if (pack.vip_included === true && settings && settings.vip === 'active') { return 'temporary'; }
		return state === 'missing' ? 'missing' : 'unknown';
	}
	/* A recorded completion wins over a mutually exclusive alternative. */
	function relevant(quest, done) {
		if (quest.technical === true || quest.x || quest.ix || quest.dy) { return false; }
		if (quest.rp === -1 || (typeof quest.rp === 'number' && quest.rp > 1)) { return false; }
		return done.has(quest.i) || !(quest.e || []).some(function (id) { return done.has(id); });
	}
	function ready(quest, done, characterLevel) {
		var min = level(quest.vl) || level(quest.l);
		if (!min || !characterLevel || characterLevel < min || quest.vb) { return false; }
		if ((quest.v || []).some(function (id) { return !done.has(id); })) { return false; }
		if ((quest.vo || []).length && !quest.vo.some(function (id) { return done.has(id); })) { return false; }
		return true; // Known prerequisites only, not a live availability promise.
	}
	function totals(quests, done, imported) {
		var completed = imported ? quests.filter(function (q) { return done.has(q.i); }).length : null;
		return { total: quests.length, completed: completed,
			coverage: imported && quests.length ? completed / quests.length : null };
	}
	function state(row, imported) {
		if (!imported) { return 'unknown'; }
		if (row.total === 0) { return 'no_content'; }
		if (row.completed === 0) { return 'unrecorded'; }
		return row.completed >= row.total ? 'complete' : 'started';
	}
	function fit(pack, characterLevel) {
		if (!characterLevel || !pack.level_min || !pack.level_max) { return 'unknown'; }
		if (characterLevel < pack.level_min) { return 'above'; }
		return characterLevel > pack.level_max ? 'below' : 'fits';
	}
	function analyse(catalogue, character, settings) {
		var imported = !!character && Array.isArray(character.quests);
		var done = ids(imported ? character.quests : []);
		var characterLevel = level(character && character.level);
		var packs = Object.create(null), areas = Object.create(null);
		catalogue.packs.forEach(function (pack) {
			if (packs[pack.id]) { throw new Error('Duplicate pack: ' + pack.id); }
			packs[pack.id] = pack;
		});
		catalogue.areas.forEach(function (area) {
			if (areas[area.id] || !packs[area.pack]) { throw new Error('Invalid area: ' + area.id); }
			areas[area.id] = area;
		});
		catalogue.quests.forEach(function (quest) {
			if (!areas[quest.area]) { throw new Error('Unassigned quest: ' + quest.i); }
		});

		var areaRows = catalogue.areas.map(function (area) {
			var quests = catalogue.quests.filter(function (quest) {
				return quest.area === area.id && relevant(quest, done);
			});
			var readyIds = imported ? quests.filter(function (quest) {
				return !done.has(quest.i) && ready(quest, done, characterLevel);
			}).map(function (quest) { return quest.i; }) : [];
			return Object.assign({}, area, totals(quests, done, imported && area.reviewed === true), {
				pack: area.pack,
				ready_ids: readyIds,
				level_fit: fit(area, characterLevel)
			});
		});

		var packRows = catalogue.packs.map(function (pack) {
			var quests = catalogue.quests.filter(function (quest) {
				return areas[quest.area].pack === pack.id && relevant(quest, done);
			});
			var own = areaRows.filter(function (area) { return area.pack === pack.id; });
			var row = Object.assign({}, pack, totals(quests, done, imported && pack.reviewed === true), {
				access: access(pack, settings),
				level_fit: fit(pack, characterLevel),
				area_rows: own
			});
			row.state = state(row, imported);
			return row;
		});
		packRows.sort(function (a, b) {
			return a.level_min - b.level_min || a.order - b.order || a.id.localeCompare(b.id);
		});

		var usable = packRows.filter(function (pack) {
			return imported && pack.reviewed === true && pack.total > 0 &&
				pack.coverage < 1 && pack.access !== 'missing';
		});
		// "Finish what you started": older, unfinished adventures first.
		var finish = usable.filter(function (pack) {
			return pack.completed > 0 && (pack.level_fit === 'below' || pack.level_fit === 'fits');
		}).sort(function (a, b) {
			return a.level_min - b.level_min || a.coverage - b.coverage || a.order - b.order;
		})[0] || null;
		// "Fits your level": started adventures before untouched ones.
		var due = usable.filter(function (pack) {
			return pack.level_fit === 'fits' && (!finish || pack.id !== finish.id);
		}).sort(function (a, b) {
			var sa = a.completed > 0 ? 0 : 1, sb = b.completed > 0 ? 0 : 1;
			return sa - sb || a.level_min - b.level_min || a.order - b.order;
		})[0] || null;

		packRows.forEach(function (pack) {
			var open = pack.area_rows.filter(function (area) {
				return area.reviewed === true && area.ready_ids.length > 0 && area.coverage < 1;
			});
			open.sort(function (a, b) {
				return (a.level_min || 999) - (b.level_min || 999) || a.order - b.order;
			});
			pack.next_area = open.length ? open[0].id : null;
		});

		return {
			imported: imported,
			level: characterLevel,
			packs: packRows,
			areas: areaRows,
			hints: { finish: finish, level: due },
			status: !imported ? 'import_required'
				: !characterLevel ? 'level_required'
					: (finish || due) ? 'ready' : 'no_hint'
		};
	}
	function read(account) {
		if (typeof account !== 'string' || !account.trim()) { return { packs: {}, vip: 'unknown' }; }
		try {
			var store = JSON.parse(root.localStorage.getItem(KEY) || 'null');
			return store && store.schema === 1 && store.accounts && Object.prototype.hasOwnProperty.call(store.accounts, account)
				? store.accounts[account] : { packs: {}, vip: 'unknown' };
		} catch (error) { return { packs: {}, vip: 'unknown' }; }
	}
	function write(account, settings, knownPackIds) {
		if (typeof account !== 'string' || !account.trim()) { return false; }
		var packs = Object.create(null);
		(knownPackIds || []).forEach(function (id) {
			var value = settings && settings.packs && settings.packs[id];
			if (STATES.indexOf(value) !== -1 && value !== 'unknown') { packs[id] = value; }
		});
		try {
			var store;
			try { store = JSON.parse(root.localStorage.getItem(KEY) || 'null'); } catch (error) { store = null; }
			if (!store || store.schema !== 1 || !store.accounts) { store = { schema: 1, accounts: {} }; }
			Object.defineProperty(store.accounts, account, { value: { packs: packs,
				vip: settings && ['active', 'inactive', 'unknown'].indexOf(settings.vip) !== -1 ? settings.vip : 'unknown' }, enumerable: true, configurable: true });
			root.localStorage.setItem(KEY, JSON.stringify(store));
			return true;
		} catch (error) { return false; }
	}
	var api = { analyse: analyse, access: access, read: read, write: write, key: KEY };
	root.MQL_ABENTEUER = api;
	if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
})(typeof window !== 'undefined' ? window : globalThis);

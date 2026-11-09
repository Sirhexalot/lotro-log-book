/* LOTRO Companion -> Magic Quest Log, entirely in the browser.
 *
 * Reads the files LOTRO Companion writes per character
 * (characters/toon-NNNNN/summary.xml, questsStatus.xml, deedsStatus.xml,
 * reputation.xml, crafting.xml) and turns them into
 *   - the progress the map shows, kept per character in this browser, and
 *   - the plugin data file Magic Quest Log reads in the game.
 * Nothing is uploaded. Kept are name, server, account folder, class, race, level,
 * the finished ids, the counters of unfinished ones, reputation and crafting tiers;
 * everything else in those files is ignored.
 *
 * Works in the browser and in Node (for the tests): no DOM is needed.
 */
(function (root) {
	'use strict';

	var IMPORT_KEY = 'MagicQuestLog_Import_';
	var INDEX_KEY = 'MagicQuestLog_Characters';

	/** Attributes of one XML start tag: key="value" pairs, entities decoded. */
	function attributes(tag) {
		var result = {};
		var pattern = /([A-Za-z_:][\w.:-]*)\s*=\s*"([^"]*)"/g;
		var match;
		while ((match = pattern.exec(tag)) !== null) {
			result[match[1]] = match[2]
				.replace(/&quot;/g, '"').replace(/&apos;/g, "'")
				.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
		}
		return result;
	}

	/** Companion stores ids as decimal numbers; the game and the catalog use hex. */
	function hexId(value) {
		var number = Number(value);
		if (!isFinite(number) || number <= 0 || number > 0xFFFFFFFF || Math.floor(number) !== number) {
			return null;
		}
		var hex = number.toString(16).toUpperCase();
		while (hex.length < 8) { hex = '0' + hex; }
		return hex;
	}

	function summary(text) {
		var match = /<character\b[^>]*>/.exec(text || '');
		if (!match) { return null; }
		var a = attributes(match[0]);
		if (!a.name) { return null; }
		return {
			name: a.name, server: a.server || '', account: a.account || '',
			klasse: a['class'] || '', race: a.race || '', level: a.level || '',
			importDate: a.importDate || ''
		};
	}

	/**
	 * Finished ids from questsStatus.xml or deedsStatus.xml. Only the entries of the
	 * top level count: deeds carry nested objectiveStatus elements with their own
	 * "COMPLETED" state, which say nothing about the deed itself. A repeatable that is
	 * running again has completionCount >= 1 and counts as done once.
	 */
	function finished(text, tag) {
		var ids = [];
		var seen = {};
		var underway = 0;
		var running = {};
		// One top-level entry: its start tag and, unless self-closing, its body up
		// to the matching end tag. Nested objective states belong to that entry.
		var pattern = new RegExp('<' + tag + '\\b([^>]*?)(/?)>', 'g');
		var match;
		var source = text || '';
		while ((match = pattern.exec(source)) !== null) {
			var a = attributes(match[1]);
			var body = '';
			if (match[2] !== '/') {
				var end = source.indexOf('</' + tag + '>', pattern.lastIndex);
				if (end >= 0) {
					body = source.slice(pattern.lastIndex, end);
					pattern.lastIndex = end;
				}
			}
			var id = hexId(a.key);
			if (!id) { continue; }
			var done = a.state === 'COMPLETED' || Number(a.completionCount || 0) >= 1;
			if (done && !seen[id]) {
				seen[id] = true;
				ids.push(id);
			} else if (!done) {
				underway += 1;
				var detail = conditions(body);
				if (detail.length) { running[id] = detail; }
			}
		}
		ids.sort();
		return { ids: ids, underway: underway, running: running };
	}

	/**
	 * Running state of an unfinished quest or deed, as LOTRO Companion records it:
	 * [objective index, condition index, 1 = done / 0 = open, count or null].
	 * Objective and condition numbers are the game's; the catalogue numbers its
	 * goals the same way ("k"), which is how a count finds its goal.
	 */
	function conditions(body) {
		var out = [];
		var objective = /<objectiveStatus\b([^>]*)>([\s\S]*?)<\/objectiveStatus>/g;
		var treffer;
		while ((treffer = objective.exec(body)) !== null) {
			var o = attributes(treffer[1]);
			var condition = /<conditionStatus\b([^>]*?)\/?>/g;
			var c;
			while ((c = condition.exec(treffer[2])) !== null) {
				var b = attributes(c[1]);
				if (o.index === undefined || b.index === undefined) { continue; }
				out.push([Number(o.index), Number(b.index), b.state === 'COMPLETED' ? 1 : 0,
					b.count === undefined ? null : Number(b.count)]);
			}
		}
		return out;
	}

	/**
	 * reputation.xml: [faction id (hex), current tier, earned reputation or null].
	 * For some factions Companion only lists the tiers reached, without points:
	 * then the highest reached tier counts and the points stay unknown (null),
	 * never zero.
	 */
	function reputation(text) {
		var out = [];
		var pattern = /<faction\b([^>]*?)(\/?)>/g;
		var source = text || '';
		var match;
		while ((match = pattern.exec(source)) !== null) {
			var a = attributes(match[1]);
			var id = hexId(a.id);
			if (!id) { continue; }
			if (a.currentTier !== undefined) {
				out.push([id, Number(a.currentTier), a.currentReputation === undefined ? null : Number(a.currentReputation)]);
				continue;
			}
			if (match[2] === '/') { continue; }
			var end = source.indexOf('</faction>', pattern.lastIndex);
			var body = end >= 0 ? source.slice(pattern.lastIndex, end) : '';
			var highest = null, level = /<level\b[^>]*\btier="(\d+)"/g, l;
			while ((l = level.exec(body)) !== null) { highest = Math.max(highest || 0, Number(l[1])); }
			if (highest !== null) { out.push([id, highest, null]); }
		}
		return out;
	}

	/**
	 * crafting.xml: per profession key (WOODWORKER …) the tiers as
	 * [tier, proficiency xp, proficiency done, mastery xp, mastery done]. Known
	 * recipes are not kept.
	 */
	function crafting(text) {
		var out = {};
		var profession = /<profession\b([^>]*)>([\s\S]*?)<\/profession>/g;
		var match;
		while ((match = profession.exec(text || '')) !== null) {
			var key = attributes(match[1]).id;
			if (!key || !/^[A-Z]+$/.test(key)) { continue; }
			var tiers = [];
			var level = /<level\b([^>]*)>([\s\S]*?)<\/level>/g;
			var l;
			while ((l = level.exec(match[2])) !== null) {
				var tier = Number(attributes(l[1]).tier);
				var k = /<proficiency\b([^>]*)\/?>/.exec(l[2]);
				var m = /<mastery\b([^>]*)\/?>/.exec(l[2]);
				var ka = k ? attributes(k[1]) : {}, ma = m ? attributes(m[1]) : {};
				tiers.push([tier, Number(ka.xp || 0), ka.completed === 'true' ? 1 : 0,
					Number(ma.xp || 0), ma.completed === 'true' ? 1 : 0]);
			}
			tiers.sort(function (x, y) { return x[0] - y[0]; });
			out[key] = tiers;
		}
		return out;
	}

	/**
	 * crafting.xml: the recipes the character has learned, as eight-digit hex ids.
	 * The ids match the recipe records in the client data, so the site can mark
	 * every known recipe. Only ids; no inventory or account data.
	 */
	function knownRecipes(text) {
		var out = [], match;
		var pattern = /<knownRecipe\b([^>]*)\/?>/g;
		while ((match = pattern.exec(text || '')) !== null) {
			var number = Number(attributes(match[1]).id);
			if (!isFinite(number) || number <= 0) { continue; }
			var hex = ('00000000' + Math.trunc(number).toString(16).toUpperCase()).slice(-8);
			if (out.indexOf(hex) < 0) { out.push(hex); }
		}
		return out.sort();
	}

	function isoDate(milliseconds) {
		var number = Number(milliseconds);
		var date = isFinite(number) && number > 0 ? new Date(number) : new Date();
		return date.toISOString().slice(0, 10);
	}

	/** One character from its files' text. Returns null when it is not usable. */
	function character(files) {
		var who = summary(files.summary);
		if (!who) { return null; }
		var quests = finished(files.quests, 'questStatus');
		var deeds = finished(files.deeds, 'deedStatus');
		if (!quests.ids.length && !deeds.ids.length) { return null; }
		var running = {};
		[quests.running, deeds.running].forEach(function (teil) {
			Object.keys(teil).forEach(function (id) { running[id] = teil[id]; });
		});
		return {
			key: [who.account, who.server, who.name].join('|'),
			name: who.name, server: who.server, account: who.account,
			klasse: who.klasse, race: who.race, level: who.level,
			date: isoDate(who.importDate),
			quests: quests.ids, deeds: deeds.ids,
			underway: quests.underway + deeds.underway,
			laufend: running,
			ruf: reputation(files.reputation),
			handwerk: crafting(files.crafting),
			rezepte: knownRecipes(files.crafting)
		};
	}

	function luaString(value) {
		return '"' + String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')
			.replace(/\r/g, '\\r').replace(/\n/g, '\\n') + '"';
	}

	/** The plugin data file Magic Quest Log reads, in the client's own layout. */
	function pluginData(entry) {
		var lines = ['return ', '{',
			'\t["version"] = "1",',
			'\t["character"] = ' + luaString(entry.name) + ',',
			'\t["server"] = ' + luaString(entry.server) + ',',
			'\t["date"] = ' + luaString(entry.date) + ',',
			'\t["level"] = ' + luaString(entry.level || '') + ',',
			'\t["source"] = "LOTRO Companion",',
			'\t["completed"] = {'];
		var ids = entry.quests.concat(entry.deeds).sort();
		ids.forEach(function (id, index) {
			lines.push('\t\t[' + luaString(id) + '] = true' + (index < ids.length - 1 ? ',' : ''));
		});
		lines.push('\t},');
		// Running counters of unfinished entries: "objective:condition:done:count;…",
		// count "-" when Companion has none. Text, so the client never sees a number.
		var laufend = entry.laufend || {};
		var offene = Object.keys(laufend).sort();
		lines.push('\t["running"] = {');
		offene.forEach(function (id, index) {
			var text = laufend[id].map(function (z) {
				return z[0] + ':' + z[1] + ':' + (z[2] ? 1 : 0) + ':' + (z[3] === null || z[3] === undefined ? '-' : z[3]);
			}).join(';');
			lines.push('\t\t[' + luaString(id) + '] = ' + luaString(text) + (index < offene.length - 1 ? ',' : ''));
		});
		lines.push('\t}', '}', '');
		return lines.join('\r\n');
	}

	/** List of names the plugin shows in its character switch. */
	function indexData(names) {
		var sorted = names.slice().sort();
		var lines = ['return ', '{'];
		sorted.forEach(function (name, index) {
			lines.push('\t[' + luaString(name) + '] = true' + (index < sorted.length - 1 ? ',' : ''));
		});
		lines.push('}', '');
		return lines.join('\r\n');
	}

	/**
	 * Every file to place below the game's PluginData folder, with its path. One
	 * import per character plus the name list per account and server.
	 */
	function pluginFiles(characters) {
		var files = [];
		var groups = {};
		characters.forEach(function (entry) {
			// Match the plugin's Latin-letter name validation, including accents.
			if (!/^[A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u017F]+$/.test(entry.name) || !entry.account || !entry.server) { return; }
			var folder = entry.account + '/' + entry.server + '/AllCharacters/';
			files.push({ path: folder + IMPORT_KEY + entry.name + '.plugindata', text: pluginData(entry) });
			(groups[folder] = groups[folder] || []).push(entry.name);
		});
		Object.keys(groups).forEach(function (folder) {
			files.push({ path: folder + INDEX_KEY + '.plugindata', text: indexData(groups[folder]) });
		});
		return files;
	}

	/**
	 * Group picked files by their character folder (toon-00000 …). Accepts anything
	 * with a path: the "characters" folder, a single toon folder, or the whole data
	 * folder. Each item is { path, read } where read() returns a Promise of the text.
	 */
	function groupFiles(items) {
		var groups = {};
		items.forEach(function (item) {
			var parts = String(item.path).replace(/\\/g, '/').split('/');
			var file = parts[parts.length - 1];
			var kind = { 'summary.xml': 'summary', 'questsStatus.xml': 'quests', 'deedsStatus.xml': 'deeds',
				'reputation.xml': 'reputation', 'crafting.xml': 'crafting' }[file];
			if (!kind) { return; }
			var folder = parts.slice(0, -1).join('/');
			// Companion also keeps an account summary.xml; only character folders count.
			if (kind === 'summary' && !/toon-\d+$/.test(folder) && parts.indexOf('characters') < 0) { return; }
			(groups[folder] = groups[folder] || {})[kind] = item;
		});
		return Object.keys(groups).map(function (folder) { return groups[folder]; })
			.filter(function (group) { return group.summary && (group.quests || group.deeds); });
	}

	/** Read every character from picked files. Promise of { characters, skipped }. */
	function readCharacters(items) {
		var groups = groupFiles(items);
		return Promise.all(groups.map(function (group) {
			return Promise.all(['summary', 'quests', 'deeds', 'reputation', 'crafting'].map(function (kind) {
				return group[kind] ? group[kind].read() : Promise.resolve('');
			})).then(function (texts) {
				return character({ summary: texts[0], quests: texts[1], deeds: texts[2],
					reputation: texts[3], crafting: texts[4] });
			});
		})).then(function (list) {
			var characters = list.filter(Boolean);
			characters.sort(function (a, b) {
				return (a.server + a.name).localeCompare(b.server + b.name);
			});
			return { characters: characters, skipped: list.length - characters.length, folders: groups.length };
		});
	}

	// --- Zip (stored, no compression): enough for a few text files. -----------
	var CRC_TABLE = (function () {
		var table = [];
		for (var n = 0; n < 256; n += 1) {
			var c = n;
			for (var k = 0; k < 8; k += 1) { c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; }
			table.push(c >>> 0);
		}
		return table;
	})();

	function crc32(bytes) {
		var crc = 0xFFFFFFFF;
		for (var i = 0; i < bytes.length; i += 1) { crc = CRC_TABLE[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8); }
		return (crc ^ 0xFFFFFFFF) >>> 0;
	}

	function utf8(text) {
		if (typeof TextEncoder !== 'undefined') { return new TextEncoder().encode(text); }
		return Uint8Array.from(Buffer.from(text, 'utf8'));
	}

	/** Zip archive as bytes from [{ path, text }]. */
	function zip(files) {
		var chunks = [], central = [], offset = 0;
		function u16(v) { return [v & 0xFF, (v >>> 8) & 0xFF]; }
		function u32(v) { return [v & 0xFF, (v >>> 8) & 0xFF, (v >>> 16) & 0xFF, (v >>> 24) & 0xFF]; }
		files.forEach(function (file) {
			var name = utf8(file.path);
			var data = utf8(file.text);
			var crc = crc32(data);
			// Version, flags (bit 11: UTF-8 names), method 0 = stored, time, date.
			var head = [].concat([0x50, 0x4B, 0x03, 0x04], u16(20), u16(0x0800), u16(0), u16(0), u16(0x21),
				u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0));
			chunks.push(Uint8Array.from(head), name, data);
			central.push(Uint8Array.from([].concat([0x50, 0x4B, 0x01, 0x02], u16(20), u16(20), u16(0x0800),
				u16(0), u16(0), u16(0x21), u32(crc), u32(data.length), u32(data.length), u16(name.length),
				u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset))), name);
			offset += head.length + name.length + data.length;
		});
		var size = central.reduce(function (sum, part) { return sum + part.length; }, 0);
		var end = Uint8Array.from([].concat([0x50, 0x4B, 0x05, 0x06], u16(0), u16(0), u16(files.length),
			u16(files.length), u32(size), u32(offset), u16(0)));
		var all = chunks.concat(central, [end]);
		var total = all.reduce(function (sum, part) { return sum + part.length; }, 0);
		var out = new Uint8Array(total), at = 0;
		all.forEach(function (part) { out.set(part, at); at += part.length; });
		return out;
	}

	var api = {
		hexId: hexId, summary: summary, finished: finished, character: character,
		conditions: conditions, reputation: reputation, crafting: crafting, knownRecipes: knownRecipes,
		pluginData: pluginData, indexData: indexData, pluginFiles: pluginFiles,
		groupFiles: groupFiles, readCharacters: readCharacters, zip: zip, crc32: crc32,
		IMPORT_KEY: IMPORT_KEY, INDEX_KEY: INDEX_KEY
	};
	if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
	else { root.MQL_COMPANION = api; }
})(this);

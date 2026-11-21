/* Adventure map: the drawn Middle-earth map, a region map with its areas and one
 * terrain preview. Personal progress comes from the same browser result as the
 * cards; nothing is sent to the server.
 *
 * Marker positions are the spots the game's own map links use for a child map
 * on its parent drawing. A nested area has no own spot: it is counted in the
 * marker of the nearest map the game links (Bree in Bree-land, Nargroth in
 * Gorgoroth). The number in such a marker opens the areas inside it; no
 * position is made up. Mordor additionally uses checked approximate geographic
 * centres, labelled as approximate in each marker's accessible name and title.
 *
 * Without JavaScript the map remains a readable, server-rendered overview.
 */
(function (root, document) {
	'use strict';

	var core = root.MQL_ABENTEUER;
	var T = root.MQL_ABENTEUER_TEXTE || {};
	var welt = document.getElementById('abenteuer-welt');
	if (!core || !welt) { return; }

	var catalogue = root.MQL_ABENTEUER_KATALOG || {};
	var positions = catalogue.positions || { areas: {} };
	var areaPoints = positions.areas || {};
	var mapPoints = positions.maps || {};
	var mapNames = {};
	try { mapNames = JSON.parse(document.getElementById('abenteuer-kartennamen').textContent || '{}'); }
	catch (fehler) { mapNames = {}; }

	var worldView = welt.querySelector('[data-welt]');
	var regionView = welt.querySelector('[data-regionansicht]');
	var regionImage = welt.querySelector('[data-region-bild]');
	var regionDots = welt.querySelector('[data-region-marken]');
	var regionTitle = welt.querySelector('[data-region-titel]');
	var regionSum = welt.querySelector('[data-region-summe]');
	var listBox = welt.querySelector('[data-gebiete]');
	var clusterHead = welt.querySelector('[data-cluster-kopf]');
	var sortBox = welt.querySelector('[data-gebiet-sortierung]');
	var listSort = 'fortschritt';
	try { listSort = root.localStorage.getItem('mql.abenteuer.sortierung') === 'name' ? 'name' : 'fortschritt'; }
	catch (fehler) { /* private mode */ }
	var preview = welt.querySelector('[data-vorschau]');
	var lang = welt.getAttribute('data-welt-sprache') || 'de';
	var karte = welt.getAttribute('data-karte') || ('/' + lang + '/karte/');
	var pages = {};
	try { pages = JSON.parse(document.getElementById('abenteuer-gebieteseiten').textContent || '{}'); }
	catch (fehler) { pages = {}; }

	var state = {
		stand: root.MQL_ABENTEUER_STAND || null,
		region: null,
		cluster: null,
		area: null
	};
	var manifest = null;
	var manifestTried = false;
	var manifestWait = null;
	var marks = Array.prototype.slice.call(welt.querySelectorAll('[data-region]'));

	function text(key) { return Object.prototype.hasOwnProperty.call(T, key) ? T[key] : key; }
	function fill(template, values) {
		var index = 0;
		return String(template).replace(/%s/g, function () {
			return values[index] === undefined ? '' : values[index++];
		});
	}
	function el(tag, className, value) {
		var node = document.createElement(tag);
		if (className) { node.className = className; }
		if (value !== undefined && value !== null) { node.textContent = value; }
		return node;
	}

	function areas() { return state.stand && Array.isArray(state.stand.areas) ? state.stand.areas : []; }
	function packs() { return state.stand && Array.isArray(state.stand.packs) ? state.stand.packs : []; }
	function packOf(id) {
		return packs().filter(function (pack) { return pack.id === id; })[0] || null;
	}
	function areaOf(id) {
		return areas().filter(function (area) { return area.id === id; })[0] || null;
	}
	function regionName(id) {
		var mark = marks.filter(function (button) { return button.getAttribute('data-region') === id; })[0];
		var name = mark ? mark.querySelector('strong') : null;
		return name ? name.textContent : '';
	}
	function hasLevel() { return !!(state.stand && state.stand.level); }

	function levelLabel(area) {
		var low = area.level_min, high = area.level_max;
		if (low === null || low === undefined || high === null || high === undefined) {
			return '';
		}
		return low === high ? fill(text('ab_map_level_one'), [low])
			: fill(text('ab_map_level_band'), [low, high]);
	}
	function percent(row) {
		return row && row.coverage !== null && row.coverage !== undefined
			? fill(text('ab_prozent'), [Math.round(row.coverage * 100)]) : '';
	}
	function fitWord(fit) {
		switch (fit) {
		case 'below': return text('ab_fit_below');
		case 'fits': return text('ab_fit_fits');
		case 'above': return text('ab_fit_above');
		default: return '';
		}
	}
	function weiter(count) {
		if (count === 1) { return text('ab_map_ready_one'); }
		return count > 0 ? fill(text('ab_map_ready'), [count]) : '';
	}
	function fitClass(fit) {
		return fit === 'fits' ? 'passt' : fit === 'below' ? 'drunter'
			: fit === 'above' ? 'drueber' : 'unklar';
	}

	function ring(target, value) {
		target.textContent = '';
		var ns = 'http://www.w3.org/2000/svg';
		var svg = document.createElementNS(ns, 'svg');
		svg.setAttribute('viewBox', '0 0 26 26');
		svg.setAttribute('width', '26');
		svg.setAttribute('height', '26');
		svg.setAttribute('aria-hidden', 'true');
		var bg = document.createElementNS(ns, 'circle');
		bg.setAttribute('cx', '13'); bg.setAttribute('cy', '13'); bg.setAttribute('r', '10');
		bg.setAttribute('fill', 'none');
		bg.setAttribute('stroke', getComputedStyle(document.documentElement).getPropertyValue('--rand').trim());
		bg.setAttribute('stroke-width', '3');
		var fg = document.createElementNS(ns, 'circle');
		fg.setAttribute('cx', '13'); fg.setAttribute('cy', '13'); fg.setAttribute('r', '10');
		fg.setAttribute('fill', 'none'); fg.setAttribute('stroke', 'currentColor');
		fg.setAttribute('stroke-width', '3'); fg.setAttribute('stroke-linecap', 'round');
		fg.setAttribute('transform', 'rotate(-90 13 13)');
		fg.setAttribute('stroke-dasharray', (Math.max(0, Math.min(1, value || 0)) * 62.83) + ' 62.83');
		svg.appendChild(bg); svg.appendChild(fg);
		target.appendChild(svg);
	}

	function progressDot(target, row) {
		var value = row && row.coverage !== null && row.coverage !== undefined
			? Math.max(0, Math.min(1, row.coverage)) : null;
		target.textContent = value === null ? '–' : Math.round(value * 100) + '%';
		target.classList.toggle('ohne-stand', value === null);
	}

	function paintSuggestions() {
		var suggestions = document.getElementById('hinweise');
		if (suggestions) { suggestions.hidden = !!(state.region || state.area || state.cluster); }
	}

	function paintMarks(stats) {
		marks.forEach(function (button) {
			var id = button.getAttribute('data-region');
			var row = stats[id];
			var value = button.querySelector('[data-wert]');
			button.classList.remove('passt', 'drunter', 'drueber', 'unklar');
			button.setAttribute('aria-pressed', String(state.region === id));
			if (!row) {
				if (value) { value.textContent = '–'; }
				return;
			}
			button.classList.add(fitClass(row.level_fit));
			var parts = [];
			if (row.coverage !== null) { parts.push(percent(row)); }
			if (row.ready) { parts.push(String(row.ready)); }
			if (value) { value.textContent = parts.length ? parts.join(' · ') : '–'; }
			ring(button.querySelector('[data-ring]'), row.coverage === null ? 0 : row.coverage);
			button.title = regionName(id) + ' · ' + fill(text('ab_map_areas'), [row.areas])
				+ ' · ' + fill(text('ab_map_ready_areas'), [row.ready]);
		});
	}

	function sortedAreas(region) {
		return areas().filter(function (area) { return String(area.region) === String(region); })
			.sort(function (a, b) {
				var ra = a.ready_ids ? a.ready_ids.length : 0;
				var rb = b.ready_ids ? b.ready_ids.length : 0;
				if (ra !== rb) { return rb - ra; }
				var la = a.level_min === null || a.level_min === undefined ? 999 : a.level_min;
				var lb = b.level_min === null || b.level_min === undefined ? 999 : b.level_min;
				return la - lb || String(a.name).localeCompare(String(b.name), lang);
			});
	}

	/** Areas of a region grouped by the linked map they hang under. */
	function groupsOf(region) {
		return core.gruppen(areas().filter(function (area) {
			return String(area.region) === String(region);
		}));
	}
	function pointOf(groupId) {
		var points = mapPoints[state.region] || {};
		return points[groupId] || null;
	}
	function groupName(id) {
		if (mapNames[id]) { return mapNames[id]; }
		var own = areaOf(id);
		return own ? own.name : id;
	}
	function areaCount(count) {
		return count === 1 ? text('ab_map_group_one') : fill(text('ab_map_group'), [count]);
	}
	function singleArea(row) {
		return row.areas.length === 1 && row.areas[0].id === row.id;
	}
	function sortedGroups(groups) {
		return Object.keys(groups).sort(function (a, b) {
			var ra = groups[a], rb = groups[b];
			if (ra.ready !== rb.ready) { return rb.ready - ra.ready; }
			var la = ra.level_min === null ? 999 : ra.level_min;
			var lb = rb.level_min === null ? 999 : rb.level_min;
			return la - lb || groupName(a).localeCompare(groupName(b), lang, { numeric: true });
		});
	}

	/** Select an area and bring its map preview under the region map into view. */
	function selectAndReveal(id, keepCluster) {
		selectArea(id, keepCluster);
		setTimeout(function () {
			if (preview) { preview.scrollIntoView({ block: 'start', behavior: 'smooth' }); }
		}, 0);
	}

	function paintRegionList(region) {
		if (!listBox) { return; }
		var groups = groupsOf(region);
		var cluster = state.cluster && groups[state.cluster] ? groups[state.cluster] : null;
		var single = !cluster && state.area ? areaOf(state.area) : null;
		if (single) { cluster = { id: single.id, areas: [single], coverage: single.coverage, ready: (single.ready_ids || []).length }; }
		paintClusterHead(cluster);
		var rows = cluster ? cluster.areas.slice() : sortedAreas(region);
		listBox.textContent = '';
		rows.sort(function (a, b) {
			if (listSort === 'fortschritt') {
				var ca = a.coverage === null || a.coverage === undefined ? Infinity : a.coverage;
				var cb = b.coverage === null || b.coverage === undefined ? Infinity : b.coverage;
				if (ca !== cb) { return ca < cb ? -1 : 1; }
			}
			return String(a.name).localeCompare(String(b.name), lang, { numeric: true });
		}).forEach(function (area) {
			var item = el('li');
			var row = el('div', 'welt-gebiet');
			if (state.area === area.id) { row.setAttribute('data-selected', 'true'); }
			var head = el('button', 'wg-kopf');
			head.type = 'button';
			head.title = area.name;
			head.addEventListener('click', function () { selectAndReveal(area.id, !!cluster); });
			head.appendChild(el('strong', 'wg-name', area.name));
			if (area.display_group_name) {
				head.appendChild(el('span', 'wg-meta', area.display_group_name));
			}
			if (area.coverage !== null && area.coverage !== undefined) {
				head.appendChild(el('span', 'wg-prozent', percent(area)));
			}
			row.appendChild(head);
			if (area.coverage !== null && area.coverage !== undefined) {
				var bar = el('span', 'wg-balken');
				var fillBar = el('i');
				fillBar.style.width = Math.round(area.coverage * 100) + '%';
				bar.appendChild(fillBar);
				row.appendChild(bar);
			}
			var ready = area.ready_ids ? area.ready_ids.length : 0;
			var pack = packOf(area.pack);
			var meta = [levelLabel(area), weiter(ready), hasLevel() ? fitWord(area.level_fit) : ''];
			if (pack && pack.access === 'missing') { meta.push(text('ab_zugang_missing')); }
			var fuss = el('span', 'wg-fuss');
			fuss.appendChild(el('span', 'wg-meta', meta.filter(Boolean).join(' · ')));
			// The name opens the map; this control keeps the preview reachable.
			var details = el('button', 'wg-details', text('ab_map_details'));
			details.type = 'button';
			details.setAttribute('data-welt-gebiet', area.id);
			details.setAttribute('aria-pressed', String(state.area === area.id));
			details.addEventListener('click', function () { selectAndReveal(area.id, !!cluster); });
			fuss.appendChild(details);
			row.appendChild(fuss);
			item.appendChild(row);
			listBox.appendChild(item);
		});
	}

	/** Header of the list while one linked sub-map is open. */
	function paintClusterHead(cluster) {
		if (!clusterHead) { return; }
		clusterHead.textContent = '';
		clusterHead.hidden = !cluster;
		if (!cluster) { return; }
		var back = el('button', 'region-zurueck-knopf', '‹ ' + text('ab_map_all_areas'));
		back.type = 'button';
		back.addEventListener('click', clearCluster);
		var line = el('span', 'cluster-zeile');
		var clusterTitle = el('strong', 'cluster-titel', groupName(cluster.id));
		// A displayed group can be keyed by its linked map rather than by the
		// catalogue area ID. For a one-area group, link to that area's page.
		var clusterPage = pages[cluster.id] ||
			(cluster.areas.length === 1 ? pages[cluster.areas[0].id] : null);
		if (clusterPage) {
			var clusterLink = el('a', 'cluster-titel-link');
			clusterLink.href = clusterPage;
			clusterLink.appendChild(clusterTitle);
			line.appendChild(clusterLink);
		} else {
			line.appendChild(clusterTitle);
		}
		line.appendChild(el('span', 'cluster-meta schwach',
			[areaCount(cluster.areas.length), percent(cluster), weiter(cluster.ready)].filter(Boolean).join(' · ')));
		clusterHead.appendChild(back);
		clusterHead.appendChild(line);
	}

	function paintRegionMap(stats) {
		var region = state.region;
		var row = stats[region];
		if (!region || !row) { return; }
		if (regionImage) {
			regionImage.src = '/karten/' + lang + '/' + region + '.webp';
			regionImage.alt = regionName(region);
		}
		if (regionTitle) { regionTitle.textContent = regionName(region); }
		if (regionSum) {
			var parts = [fill(text('ab_map_areas'), [row.areas])];
			if (row.coverage !== null) { parts.push(percent(row)); }
			if (row.level_min !== null) {
				parts.push(row.level_min === row.level_max
					? fill(text('ab_map_level_one'), [row.level_min])
					: fill(text('ab_map_level_band'), [row.level_min, row.level_max]));
			}
			if (hasLevel()) { parts.push(fitWord(row.level_fit)); }
			regionSum.textContent = parts.join(' · ');
		}
		if (regionDots) {
			regionDots.textContent = '';
			var groups = groupsOf(region);
			sortedGroups(groups).forEach(function (groupId) {
				var row = groups[groupId];
				// Individual projected landscapes replace their aggregate marker;
				// otherwise Gorgoroth's circle covers nearby Dor Amarth.
				if (row.areas.some(function (area) { return positions.derived && positions.derived[area.id]; })) { return; }
				var point = pointOf(groupId);
				if (!point) { return; }
				var dot;
				if (singleArea(row)) {
					var area = row.areas[0];
					dot = el('button', 'region-punkt ' + fitClass(area.level_fit));
					dot.type = 'button';
					dot.setAttribute('data-welt-gebiet', area.id);
					dot.setAttribute('aria-pressed', String(state.area === area.id));
					var ready = area.ready_ids ? area.ready_ids.length : 0;
					var label = [area.name, levelLabel(area), percent(area), weiter(ready)].filter(Boolean).join(' · ');
					dot.title = label;
					dot.setAttribute('aria-label', label);
					progressDot(dot, area);
					dot.addEventListener('click', function () { selectArea(area.id); });
				} else {
					dot = el('button', 'region-punkt sammel');
					dot.type = 'button';
					dot.setAttribute('data-welt-gruppe', groupId);
					dot.setAttribute('aria-pressed', String(state.cluster === groupId));
					var parts = [groupName(groupId), areaCount(row.areas.length)];
					if (row.coverage !== null) { parts.push(percent(row)); }
					if (row.ready) { parts.push(weiter(row.ready)); }
					var label = parts.filter(Boolean).join(' · ');
					dot.title = label;
					dot.setAttribute('aria-label', label);
					dot.textContent = String(row.areas.length);
					dot.addEventListener('click', function () { selectGroup(groupId); });
				}
				dot.style.left = point[0] + '%';
				dot.style.top = point[1] + '%';
				regionDots.appendChild(dot);
			});
			// Keep the linked-map groups, adding independently projected ordinary
			// landscapes. Historical copies stay accessible through their group.
			sortedAreas(region).forEach(function (area) {
				if (!positions.derived || !positions.derived[area.id]) { return; }
				var point = areaPoints[area.id];
				if (!point) { return; }
				var dot = el('button', 'region-punkt ' + fitClass(area.level_fit));
				dot.type = 'button';
				dot.setAttribute('data-welt-gebiet', area.id);
				dot.setAttribute('aria-pressed', String(state.area === area.id));
				var label = [area.name, levelLabel(area), percent(area), text('ab_map_approx')].filter(Boolean).join(' · ');
				dot.title = label;
				dot.setAttribute('aria-label', label);
				progressDot(dot, area);
				dot.style.left = point[0] + '%';
				dot.style.top = point[1] + '%';
				dot.addEventListener('click', function () { selectArea(area.id); });
				regionDots.appendChild(dot);
			});
		}
		paintRegionList(region);
	}

	function ensureManifest() {
		if (manifestTried) { return manifestWait || Promise.resolve(manifest); }
		manifestTried = true;
		manifestWait = fetch('/gelaende/manifest.json', { credentials: 'omit' })
			.then(function (response) {
				if (!response.ok) { throw new Error('HTTP ' + response.status); }
				return response.json();
			})
			.then(function (data) { manifest = data; return data; })
			.catch(function () { manifest = null; return null; });
		return manifestWait;
	}

	function setImage(area) {
		var img = welt.querySelector('[data-bild]');
		if (!img) { return; }
		var parchment = '/karten/' + lang + '/' + area.id + '.webp';
		img.alt = area.name;
		img.onerror = function () {
			img.onerror = null;
			if (img.getAttribute('src') !== parchment) { img.src = parchment; }
		};
		img.src = parchment;
		ensureManifest().then(function (data) {
			if (!state.area || state.area !== area.id) { return; }
			var entry = data && data.maps ? data.maps[area.id] : null;
			var thumb = Array.isArray(entry) ? entry[6] === 1 : !!(entry && entry.thumb);
			if (thumb && data.version) {
				img.src = '/gelaende/' + data.version + '/thumb/' + area.id + '.webp';
			}
		});
	}

	function paintPreview() {
		var area = areaOf(state.area);
		if (!preview) { return; }
		preview.hidden = !area;
		if (!area) { return; }
		var title = preview.querySelector('[data-vorschau-titel]');
		var meta = preview.querySelector('[data-vorschau-meta]');
		var body = preview.querySelector('[data-vorschau-text]');
		var caption = preview.querySelector('[data-bild-name]');
		if (title) { title.textContent = area.name; }
		var ready = area.ready_ids ? area.ready_ids.length : 0;
		if (meta) {
			var parts = [levelLabel(area)];
			if (area.coverage !== null && area.coverage !== undefined) { parts.push(percent(area)); }
			if (hasLevel()) { parts.push(fitWord(area.level_fit)); }
			meta.textContent = parts.filter(Boolean).join(' · ');
		}
		if (body) {
			body.textContent = ready ? weiter(ready) : '';
			body.hidden = !ready;
		}
		if (caption) { caption.textContent = area.name; }
		var mapLink = preview.querySelector('[data-karte-link]');
		if (mapLink) {
			mapLink.href = karte + (karte.indexOf('?') >= 0 ? '&' : '?') + 'vorkarte=' + area.id;
		}
		var areaLink = preview.querySelector('[data-gebiet-link]');
		if (areaLink) {
			if (pages[area.id]) {
				areaLink.href = pages[area.id];
				areaLink.hidden = false;
			} else {
				areaLink.hidden = true;
			}
		}
		setImage(area);
	}

	function markPressed(selector, attribute, value) {
		Array.prototype.forEach.call(welt.querySelectorAll(selector), function (button) {
			button.setAttribute('aria-pressed', String(button.getAttribute(attribute) === value));
		});
	}
	function selectArea(id, keepCluster) {
		state.area = id;
		if (!keepCluster) { state.cluster = null; }
		paintSuggestions();
		markPressed('[data-welt-gebiet]', 'data-welt-gebiet', id);
		markPressed('[data-welt-gruppe]', 'data-welt-gruppe', null);
		if (state.region) { paintRegionList(state.region); }
		paintPreview();
		if (preview && root.matchMedia && root.matchMedia('(max-width: 900px)').matches) {
			preview.scrollIntoView({ block: 'start', behavior: 'smooth' });
		}
	}
	/** One linked sub-map: its areas replace the region list until the way back. */
	function selectGroup(id) {
		state.cluster = id;
		state.area = null;
		paintSuggestions();
		markPressed('[data-welt-gebiet]', 'data-welt-gebiet', null);
		markPressed('[data-welt-gruppe]', 'data-welt-gruppe', id);
		if (state.region) { paintRegionList(state.region); }
		paintPreview();
		if (clusterHead && root.matchMedia && root.matchMedia('(max-width: 900px)').matches) {
			clusterHead.scrollIntoView({ block: 'nearest' });
		}
	}
	function clearCluster() {
		state.cluster = null;
		state.area = null;
		paintSuggestions();
		markPressed('[data-welt-gruppe]', 'data-welt-gruppe', null);
		markPressed('[data-welt-gebiet]', 'data-welt-gebiet', null);
		if (state.region) { paintRegionList(state.region); }
		paintPreview();
	}

	function selectRegion(id, areaId) {
		if (!id) { return; }
		state.region = String(id);
		state.cluster = null;
		state.area = null;
		var stats = core.regions(areas(), packs(), state.stand ? state.stand.level : null);
		if (worldView) { worldView.hidden = true; }
		if (regionView) { regionView.hidden = false; }
		paintMarks(stats);
		paintRegionMap(stats);
		var candidates = sortedAreas(state.region);
		if (areaId && candidates.some(function (area) { return area.id === areaId; })) {
			selectArea(areaId);
		} else {
			selectArea(null);
		}
	}

	function showWorld() {
		state.region = null;
		state.cluster = null;
		state.area = null;
		paintSuggestions();
		if (worldView) { worldView.hidden = false; }
		if (regionView) { regionView.hidden = true; }
		if (preview) { preview.hidden = true; }
		paintMarks(core.regions(areas(), packs(), state.stand ? state.stand.level : null));
	}

	function wireMarks() {
		marks.forEach(function (button) {
			button.addEventListener('click', function () {
				selectRegion(button.getAttribute('data-region'));
			});
		});
		var back = welt.querySelector('[data-zurueck]');
		if (back) { back.addEventListener('click', showWorld); }
	}

	function render() {
		if (!state.stand) { return; }
		if (state.region) {
			var cluster = state.cluster, area = state.area;
			selectRegion(state.region, state.area);
			if (cluster && groupsOf(state.region)[cluster]) {
				selectGroup(cluster);
				if (area) { selectArea(area, true); }
			}
		} else {
			paintMarks(core.regions(areas(), packs(), state.stand.level));
		}
	}

	if (sortBox) {
		['fortschritt', 'name'].forEach(function (sort) {
			var button = el('button', '', text(sort === 'name' ? 'ab_sort_name' : 'ab_sort_progress'));
			button.type = 'button';
			button.setAttribute('data-gebiet-sort', sort);
			button.setAttribute('aria-pressed', String(listSort === sort));
			button.addEventListener('click', function () {
				listSort = sort;
				try { root.localStorage.setItem('mql.abenteuer.sortierung', sort); }
				catch (fehler) { /* private mode */ }
				Array.prototype.forEach.call(sortBox.children, function (child) {
					child.setAttribute('aria-pressed', String(child === button));
				});
				if (state.region) { paintRegionList(state.region); }
			});
			sortBox.appendChild(button);
		});
	}
	wireMarks();
	welt.hidden = false;
	render();
	root.addEventListener('mql:abenteuer', function () {
		state.stand = root.MQL_ABENTEUER_STAND || state.stand;
		render();
	});

	root.MQL_ABENTEUER_KARTE = {
		zeige: function (areaId) {
			var area = areaOf(areaId);
			if (!area) { return; }
			selectRegion(area.region, area.id);
			welt.scrollIntoView({ block: 'start', behavior: 'smooth' });
		}
	};
})(window, document);

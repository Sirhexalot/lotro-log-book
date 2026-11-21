/* Shared entity result rows for filter-backed lists. */
(function () {
	'use strict';
	var lang = document.documentElement.lang || 'de';
	var words = {
		de: {
			result: 'Treffer', levels: 'Stufen', progress: 'Dein Fortschritt',
			status: 'Status', noProgress: 'Importiere deinen Spielstand, um den Fortschritt deines Charakters zu sehen. Du kannst den Status auch von Hand setzen.',
			import: 'Spielstand importieren →', recipeProgress: 'Importiere deinen Spielstand mit Rezeptdaten, um deinen Lernstand zu sehen.',
			name: 'Name', questLevel: 'Aufgabenstufe', deedLevel: 'Tatstufe',
			itemLevel: 'Gegenstandsstufe', professionLevel: 'Handwerksstufe',
			resultLevel: 'Gegenstandsstufe des Ergebnisses', learned: 'Gelernt', notLearned: 'Nicht gelernt',
			partialRecipes: 'Nur Rezepte aus dem Import sind als gelernt markiert. Fehlende Daten werden nicht als „nicht gelernt“ gewertet.'
		},
		en: {
			result: 'Result', levels: 'Levels', progress: 'Your progress',
			status: 'Status', noProgress: 'Import your progress to see this character’s progress. You can also set quest status manually.',
			import: 'Import progress →', recipeProgress: 'Import progress with recipe data to see what this character has learned.',
			name: 'Name', questLevel: 'Quest level', deedLevel: 'Deed level',
			itemLevel: 'Item level', professionLevel: 'Crafting tier',
			resultLevel: 'Result item level', learned: 'Learned', notLearned: 'Not learned',
			partialRecipes: 'Only recipes present in the import are marked as learned. Missing data is not treated as “not learned”.'
		},
		fr: {
			result: 'Résultat', levels: 'Niveaux', progress: 'Votre progression',
			status: 'Statut', noProgress: 'Importez votre progression pour voir celle de ce personnage. Vous pouvez aussi définir le statut manuellement.',
			import: 'Importer la progression →', recipeProgress: 'Importez la progression avec les recettes pour voir celles apprises par ce personnage.',
			name: 'Nom', questLevel: 'Niveau de quête', deedLevel: 'Niveau de prouesse',
			itemLevel: 'Niveau d’objet', professionLevel: 'Palier d’artisanat',
			resultLevel: 'Niveau d’objet obtenu', learned: 'Apprise', notLearned: 'Non apprise',
			partialRecipes: 'Seules les recettes présentes dans l’import sont marquées comme apprises. Une donnée absente ne signifie pas « non apprise ».'
		}
	};
	var w = words[lang] || words.de;

	function node(tag, className, text) {
		var el = document.createElement(tag);
		if (className) { el.className = className; }
		if (text != null) { el.textContent = text; }
		return el;
	}
	function iconSvg(kind) {
		if (!window.MQL_SYMBOL) { return null; }
		var template = document.createElement('template');
		template.innerHTML = window.MQL_SYMBOL(kind);
		return template.content.firstElementChild;
	}
	function itemIcon(id, fallbackKind) {
		var holder = node('span', 'mql-row-icon mql-row-icon-item');
		if (!id) {
			var fallback = iconSvg(fallbackKind || 'gegenstand');
			if (fallback) { holder.classList.remove('mql-row-icon-item'); holder.appendChild(fallback); }
			return holder;
		}
		var img = node('img');
		img.alt = '';
		img.loading = 'lazy';
		img.decoding = 'async';
		img.src = '/bild/items/' + id + '.webp';
		img.addEventListener('error', function () {
			holder.classList.remove('mql-row-icon-item');
			holder.replaceChildren();
			var fallback = iconSvg(fallbackKind || 'gegenstand');
			if (fallback) { holder.appendChild(fallback); }
		});
		holder.appendChild(img);
		return holder;
	}
	function entityIcon(kind) {
		var holder = node('span', 'mql-row-icon mql-row-icon-entity');
		var svg = iconSvg(kind);
		if (svg) { holder.appendChild(svg); }
		return holder;
	}
	function header(target, options) {
		var row = node('li', 'mql-row-heading' + (options.levels === false ? ' mql-row-no-levels' : '') + (options.progress ? '' : ' mql-row-heading-no-progress') + (options.levelHeading ? ' mql-row-single-level' : ''));
		if (options.progress && target.classList) { target.classList.add('mql-row-list-has-progress'); }
		row.appendChild(node('span', '', w.result));
		if (options.levels !== false) { row.appendChild(node('span', '', options.levelHeading || w.levels)); }
		if (options.progress) { row.appendChild(node('span', '', options.progressLabel || (options.levelHeading && window.MQL_STATUS_UI?.words?.(lang).progress) || w.progress)); }
		target.appendChild(row);
	}
	function help(target, text) {
		var row = node('li', 'mql-row-help');
		row.appendChild(node('span', '', text));
		var a = node('a', '', w.import);
		a.href = '/' + lang + '/' + (lang === 'fr' ? 'progression' : lang === 'en' ? 'progress' : 'spielstand') + '/';
		row.appendChild(a);
		target.appendChild(row);
	}
	function row(target, options) {
		var progressColumn = !!options.progress || options.progressColumn === true ||
			!!(target.classList && target.classList.contains('mql-row-list-has-progress'));
		var li = node('li', 'mql-row' + (options.levels === false ? ' mql-row-no-levels' : '') + (progressColumn ? '' : ' mql-row-no-progress') + (options.levelHeading ? ' mql-row-single-level' : ''));
		var link = options.onActivate ? node('button', 'mql-row-hit') : options.href ? node('a', 'mql-row-hit') : node('div', 'mql-row-hit');
		if (options.href) { link.href = options.href; }
		if (options.onActivate) {
			link.type = 'button';
			link.addEventListener('click', options.onActivate);
		}
		link.appendChild(options.image ? itemIcon(options.image, options.icon) : entityIcon(options.icon));
		var body = node('span', 'mql-row-body');
		body.appendChild(node('strong', 'mql-row-name', options.name));
		if (options.meta) { body.appendChild(node('small', 'mql-row-meta', options.meta)); }
		link.appendChild(body);
		li.appendChild(link);
		if (options.levels !== false) {
			var values = node('span', 'mql-row-levels');
			(options.values || []).forEach(function (value) {
				var line = node('span', 'mql-row-value');
				line.appendChild(node('span', 'mql-row-value-label' + (options.levelHeading === value.label ? ' mql-row-value-label-repeated' : ''), value.label + ': '));
				line.appendChild(node('b', '', value.value));
				values.appendChild(line);
			});
			li.appendChild(values);
		}
		if (progressColumn) {
			if (!options.progress) {
				var emptyProgress = node('span', 'mql-row-progress');
				emptyProgress.setAttribute('aria-hidden', 'true');
				li.appendChild(emptyProgress);
			} else if (options.progress.classList.contains('mql-row-progress')) { li.appendChild(options.progress); }
			else {
				var progress = node('span', 'mql-row-progress');
				progress.appendChild(options.progress);
				li.appendChild(progress);
			}
		}
		return li;
	}
	function searchRow(target, options) {
		var levelLabels = {
			q: w.questLevel, d: w.deedLevel, g: w.itemLevel, r: w.resultLevel
		};
		var hasLevel = options.level !== null && options.level !== undefined &&
			options.level !== '' && options.level !== 0 && options.level !== '0';
		return row(target, {
			href: options.href, onActivate: options.onActivate,
			icon: ({q:'aufgabe',d:'tat',g:'gegenstand',r:'rezept',t:'titel',v:'tugend',
				s:'gegenstand',n:'auftraggeber',l:'landmarke',f:'fraktion'})[options.kind] || 'gebiet',
			image: options.kind === 'g' ? options.id : null,
			name: options.name, meta: options.meta || '',
			levels: hasLevel,
			values: hasLevel ? [{label:levelLabels[options.kind] || w.name,value:options.level}] : [],
			progress: options.progress, progressColumn: options.progressColumn
		});
	}
	function characterKnowsRecipes() {
		var store = window.MQL_SPEICHER, character = store && store.aktiv && store.aktiv();
		if (!character) { return { character: null, known: false, complete: false }; }
		var meta = character.importMeta || {};
		var dataset = meta.datasets && meta.datasets.recipes;
		return {
			character: character,
			known: !!((character.rezepte || []).length),
			complete: !!(dataset && dataset.status === 'complete')
		};
	}
	function recipeProgress(id) {
		var data = characterKnowsRecipes();
		if (!data.character) { return null; }
		var learned = (data.character.rezepte || []).map(String).indexOf(String(id)) >= 0;
		if (!learned && !data.complete) { return null; }
		var status = node('span', 'mql-row-progress mql-row-progress-static');
		status.appendChild(node('span', 'mql-row-status-symbol', learned ? '✓' : '·'));
		status.appendChild(document.createTextNode(learned ? w.learned : w.notLearned));
		return status;
	}
	function recipeHasProgressData() {
		var data = characterKnowsRecipes();
		return !!(data.character && (data.known || data.complete));
	}
	function recipeProgressHelp() {
		var data = characterKnowsRecipes();
		if (!data.known && !data.complete) { return w.recipeProgress; }
		if (data.known && !data.complete) { return w.partialRecipes; }
		return '';
	}

	window.MQL_TREFFERZEILE = {
		words: w,
		header: header,
		help: help,
		row: row,
		entityIcon: entityIcon,
		itemIcon: itemIcon,
		searchRow: searchRow,
		recipeProgress: recipeProgress,
		recipeHelp: recipeProgressHelp,
		recipeHasProgressData: recipeHasProgressData,
		levelLabels: w
	};
})();

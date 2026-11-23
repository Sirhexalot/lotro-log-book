/* Shared progressive filter UI. Facets and result rendering are adapter-owned. */
(function () {
	'use strict';
	var instances = new WeakMap();
	function mount(root, options) {
		if (instances.has(root)) {
			if (instances.get(root).config !== options.config) { throw new Error('Filter root already mounted with another config'); }
			return instances.get(root);
		}
		var config = options.config, adapter = options.adapter, context = options.characterContext;
		if (!config.area || !root.querySelector('[data-filter-results]')) { throw new Error('Filter area/results required'); }
		var core = window.MQL_FILTERZUSTAND, memory = window.MQL_FILTER;
		var initial = core.decode(config, new URL(location.href), context);
		if (!initial.explicit && memory && memory.readState) {
			var saved = memory.readState(config.area, config.lang);
			if (saved) {
				var remembered = new URL(location.href); remembered.search = saved.query;
				initial = core.decode(config, remembered, context);
			}
		}
		var state = initial.state, notices = initial.notices, result = null;
		var dead = false, request = null, sequence = 0, timer, searching = false;
		var openStates = new Map();
		var listeners = [], dialogBase = null, closing = null, restoreFocus = null, scrollY = 0, oldOverflow;
		var media = window.matchMedia('(max-width: 900px)');
		/* The filter column sticks below the sticky page header; its height is
		 * measured here because the header wraps with the viewport. */
		function kopfHoehe() {
			var kopf = document.querySelector('.kopf');
			return kopf ? Math.round(kopf.getBoundingClientRect().height) : 0;
		}
		function setzeKopfHoehe() {
			document.documentElement.style.setProperty('--kopf-hoehe', kopfHoehe() + 'px');
		}
		setzeKopfHoehe();
		var kopfBeobachter = null;
		if (window.ResizeObserver) {
			var kopfElement = document.querySelector('.kopf');
			if (kopfElement) {
				kopfBeobachter = new ResizeObserver(setzeKopfHoehe);
				kopfBeobachter.observe(kopfElement);
			}
		}
		if (!window.fetch || !window.AbortController || typeof HTMLDialogElement === 'undefined' || !HTMLDialogElement.prototype.showModal) {
			throw new Error('Filter enhancement unsupported; keep GET fallback');
		}
		var target = root.querySelector('[data-filter-results]');
		function node(tag, text) { var n = document.createElement(tag); if (text !== undefined) { n.textContent = text; } return n; }
		function arrow() {
			var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
			svg.setAttribute('viewBox','0 0 16 16'); svg.setAttribute('aria-hidden','true'); svg.classList.add('filter-arrow');
			var path = document.createElementNS('http://www.w3.org/2000/svg','path'); path.setAttribute('d','M6 4l4 4-4 4');
			svg.appendChild(path); return svg;
		}
		function text(key) { if (config.labels[key] === undefined) { throw new Error('Missing filter label: ' + key); } return config.labels[key]; }
		function listen(n, event, fn) { n.addEventListener(event,fn); listeners.push(function () { n.removeEventListener(event,fn); }); }
		var shell = node('div'); shell.className = 'filter-ui';
		if (!(config.groups || []).length) { shell.classList.add('filter-ui-ohne-gruppen'); }
		var toolbar = node('div'); toolbar.className = 'filter-toolbar';
		var search = node('input'); search.type = 'search'; search.maxLength = 400; search.value = state.q;
		search.setAttribute('aria-label',text('search'));
		if (config.labels.placeholder) { search.placeholder = config.labels.placeholder; }
		var searchButton = node('button',text('search')); searchButton.type = 'button';
		var open = node('button',text('filter')); open.type = 'button'; open.className = 'filter-open';
		var count = node('span'); count.setAttribute('role','status'); count.setAttribute('aria-live','polite');
		var sort = node('select'); sort.setAttribute('aria-label',text('sort'));
		if (config.sort && config.sort.options && config.sort.options.length) { config.sort.options.forEach(function (o) { var n = node('option',o.label); n.value = o.value; sort.appendChild(n); }); }
		else { sort.hidden = true; }
		toolbar.append(search,searchButton);
		var resultToolbar = node('div'); resultToolbar.className = 'filter-result-toolbar';
		resultToolbar.append(open,count,sort);
		var chips = node('div'); chips.className = 'filter-chips';
		var error = node('div'); error.className = 'filter-error'; error.setAttribute('role','alert'); error.hidden = true;
		var errorText = node('span'), retry = node('button',text('retry')); retry.type = 'button';
		errorText.id = 'filter-error-'+config.area;
		var fallback = node('a',text('fallback')); error.append(errorText,retry,fallback);
		var grid = node('div'); grid.className = 'filter-grid';
		var home = node('div'); home.className = 'filter-home';
		var panel = node('div'); panel.className = 'filter-panel';
		var groups = node('div');
		var reset = node('button',text('reset')); reset.type = 'button';
		panel.append(groups,reset);
		// The panel heading is the desktop counterpart of the mobile "Filters"
		// button; the dialog brings its own heading.
		var panelHead = node('strong',text('filter')); panelHead.className = 'filter-panel-head';
		home.append(panelHead,panel);
		var resultsHome = node('div'); resultsHome.className = 'filter-results-home';
		var originalParent = target.parentNode, originalNext = target.nextSibling;
		resultsHome.appendChild(target);
		var more = node('button',text('more')); more.type = 'button'; more.hidden = true;
		resultsHome.appendChild(more);
		/* Infinite scroll: the sentinel loads the next block as soon as it comes
		 * into view. The button stays the fallback where no observer exists. */
		var sentinel = node('div'); sentinel.className = 'filter-sentinel'; sentinel.setAttribute('aria-hidden','true');
		resultsHome.appendChild(sentinel);
		var observer = null;
		if (window.IntersectionObserver && config.pagination.kind === 'limit') {
			observer = new IntersectionObserver(function (entries) {
				if (!entries.some(function (e) { return e.isIntersecting; })) { return; }
				if (request || !result || !result.pagination.hasMore) { return; }
				dispatch({type:'more'});
			},{rootMargin:'400px 0px'});
			observer.observe(sentinel);
		}
		var resultHeader = node('div'); resultHeader.className = 'filter-result-header';
		resultHeader.append(resultToolbar,chips,error); grid.append(resultHeader,home,resultsHome);
		var dialog = node('dialog'); dialog.className = 'filter-dialog'; dialog.setAttribute('aria-modal','true'); dialog.setAttribute('aria-label',text('filter'));
		var heading = node('header'), close = node('button',text('close')); close.type = 'button';
		heading.append(node('strong',text('filter')),close);
		var dialogBody = node('div'); dialogBody.className = 'filter-dialog-body';
		var footer = node('footer'), show = node('button',text('show')); show.type = 'button'; footer.appendChild(show);
		dialog.append(heading,dialogBody,footer);
		shell.append(toolbar,grid,dialog); root.appendChild(shell);
		// The original GET form stays as a no-JS fallback, but must not compete.
		var oldControls = Array.from(root.querySelectorAll('[data-filter-fallback]'));
		oldControls.forEach(function (n) { n.hidden = true; });
		function currentUrl() { return core.encode(config,state,new URL(location.href)); }
		function historyData() { return Object.assign({},history.state || {},{mqlFilter:{area:config.area,state:state}}); }
		function persist() {
			if (!memory) { return; }
			var url = new URL(config.rootUrl,location.href); url.search = ''; url.hash = '';
			url = core.encode(config,state,url);
			memory.write(config.area,config.lang,url.search.slice(1));
		}
		function writeHistory(replace) {
			var url = currentUrl(), data = historyData();
			if (dialogBase) { data.mqlFilterDialog = config.area; replace = true; }
			else { delete data.mqlFilterDialog; }
			history[replace ? 'replaceState' : 'pushState'](data,'',url.href);
			persist();
		}
		function selected(group, value) {
			var v = state.filters[group.id];
			if (group.kind === 'tree') { return v.some(function (p) { return JSON.stringify(p) === JSON.stringify(value); }); }
			return Array.isArray(v) ? v.indexOf(value)>=0 : v === value;
		}
		/** Is this node or one of its children selected? Keeps a deep link visible. */
		function selectedBelow(option, group) {
			var effective = option.groupId ? config.groups.find(function (g) { return g.id === option.groupId; }) : group;
			if (!effective) { return false; }
			var value = effective.kind === 'tree' ? option.path : option.value;
			if (selected(effective, value)) { return true; }
			return (option.children || []).some(function (child) { return selectedBelow(child, group); });
		}
		function markWrappedOptions() {
			groups.querySelectorAll('.filter-option').forEach(function (label) {
				var span = label.querySelector(':scope > span');
				if (!span) { return; }
				var lineHeight = parseFloat(getComputedStyle(span).lineHeight) || 0;
				var wrapped = span.getBoundingClientRect().height > lineHeight + 1;
				label.classList.toggle('filter-option-wrapped', wrapped);
				var summary = label.closest('.filter-branch > summary');
				if (summary) { summary.classList.toggle('filter-summary-wrapped', wrapped); }
			});
		}
		function renderGroups() {
			var active = document.activeElement, focusKey = active && active.dataset.filterKey;
			groups.querySelectorAll('details').forEach(function(n){openStates.set(n.dataset.key,n.open);});
			groups.replaceChildren();
			function visibleOption(group, option) {
				if (option.keepVisible) { return true; }
				// A heading is not selectable; it appears with its children.
				if (option.heading) { return (option.children||[]).some(function(child){return visibleOption(group,child);}); }
				var effective=option.groupId?config.groups.find(function(g){return g.id===option.groupId;}):group;
				var value=effective.kind==='tree'?option.path:option.value;
				var facet=((result&&result.facets[effective.id])||[]).find(function(f){return JSON.stringify(f.value)===JSON.stringify(value);});
				return !facet || facet.count>0 || selected(effective,value) || (option.children||[]).some(function(child){return visibleOption(group,child);});
			}
			(config.groups || []).forEach(function (group) {
				if (group.nestedOnly) { return; }
				if (group.available && !group.available(context)) { return; }
				if (['multi','single','tree'].includes(group.kind) && !(group.options||[]).some(function(option){return visibleOption(group,option);})) { return; }
				var details = node('details'); details.dataset.key = group.id;
				details.className = 'filter-group filter-group-'+group.kind;
				details.open = openStates.has(group.id) ? openStates.get(group.id) : group.initialOpen !== false || (Array.isArray(state.filters[group.id]) && state.filters[group.id].length > 0);
				var groupSummary = node('summary'); groupSummary.className = 'filter-group-heading';
				groupSummary.append(arrow(),node('span',group.label)); details.appendChild(groupSummary);
				if (group.kind === 'range') {
					var range = node('div'); range.className = 'filter-range';
					['min','max'].forEach(function (key) {
						var label = node('label',text(key)), input = node('input'); input.type = 'number'; input.inputMode = 'numeric'; input.min = group.min || 0;
						if (group.max !== undefined) { input.max = group.max; }
						input.value = state.filters[group.id][key] === null ? '' : state.filters[group.id][key]; input.dataset.filterKey = group.id+'-'+key;
						input.setAttribute('aria-describedby',errorText.id);
						input.addEventListener('change',function () {
							var values = {};
							range.querySelectorAll('input').forEach(function (n) { values[n.dataset.bound] = n.value === '' ? null : Number(n.value); });
							dispatch({type:'setRange',groupId:group.id,value:values}).then(function () {
							if (notices.length) { input.setAttribute('aria-invalid','true'); }
							});
						});
						input.dataset.bound = key; label.appendChild(input); range.appendChild(label);
					});
					details.appendChild(range);
				} else {
					function draw(optionsList, parent, depth) {
						(optionsList || []).forEach(function (option) {
							if (option.heading) {
								// A labelled subsection of a branch (e.g. the area
								// groups of Rohan); no value of its own.
								if (!visibleOption(group, option)) { return; }
								var sub = node('details'); sub.className = 'filter-branch filter-heading-branch';
								sub.dataset.key = group.id + ':heading:' + option.label;
								sub.style.setProperty('--depth', depth);
								sub.open = openStates.has(sub.dataset.key) ? openStates.get(sub.dataset.key) === true : true;
								var subSummary = node('summary'); subSummary.className = 'filter-heading';
								subSummary.style.setProperty('--depth', depth);
								var subLabel = node('span', option.label); subLabel.className = 'filter-heading-label';
								subSummary.append(arrow(), subLabel);
								sub.appendChild(subSummary);
								draw(option.children, sub, depth + 1); parent.appendChild(sub);
								return;
							}
							var effective = option.groupId ? config.groups.find(function(g){return g.id===option.groupId;}) : group;
							var value = effective.kind === 'tree' ? option.path : option.value;
							var facet = ((result && result.facets[effective.id]) || []).find(function find(f) {
								return JSON.stringify(f.value) === JSON.stringify(value);
							});
							if (!visibleOption(group,option)) { return; }
							var label = node('label'), input = node('input'); input.type = effective.kind === 'single' ? 'radio' : 'checkbox';
							label.className = 'filter-option';
							label.style.setProperty('--depth',depth);
							input.name = config.area+'-'+effective.id; input.checked = effective.kind === 'boolean' ? state.filters[effective.id] : selected(effective,value);
							input.dataset.filterKey = effective.id+':'+JSON.stringify(value);
							input.addEventListener('change',function () {
								if (effective.kind === 'tree') { dispatch({type:'togglePath',groupId:effective.id,path:value}); }
								else {
									var next = effective.kind === 'boolean' ? input.checked : effective.kind === 'single' ? value : input.checked ? state.filters[effective.id].concat([value]) : state.filters[effective.id].filter(function (v) { return v !== value; });
									dispatch({type:'setValues',groupId:effective.id,value:next});
								}
							});
							label.append(input,node('span',option.label),node('small',facet ? facet.count.toLocaleString(config.lang) : ''));
							if (option.children && option.children.length) {
								var branch = node('details'); branch.dataset.key = group.id+':'+JSON.stringify(value); branch.className = 'filter-branch'; branch.style.setProperty('--depth',depth);
								// A branch the user opened or closed keeps that state; on a fresh
								// link the way to a selected value opens itself.
								branch.open = openStates.has(branch.dataset.key)
									? openStates.get(branch.dataset.key) === true
									: selectedBelow(option, group);
								var summary = node('summary'); summary.style.setProperty('--depth',depth);
								summary.append(arrow(),label); branch.appendChild(summary);
								draw(option.children,branch,depth+1); parent.appendChild(branch);
							} else { parent.appendChild(label); }
						});
					}
					draw(group.kind === 'boolean' ? [{value:true,label:group.label}] : group.options,details,0);
				}
				groups.appendChild(details);
			});
			markWrappedOptions();
			if (focusKey) { Array.from(groups.querySelectorAll('input')).some(function (n) { if (n.dataset.filterKey === focusKey) { n.focus({preventScroll:true}); return true; } return false; }); }
		}
		function renderChrome() {
			chips.replaceChildren();
			var list = core.chips(config,state,context);
			list.forEach(function (chip) {
				// The default value of a single choice is shown as state only; a
				// button with "×" would look removable but change nothing.
				if (chip.isDefault) {
					// "Alle" alone says nothing; the group name makes the state readable.
					var group = (config.groups || []).find(function (g) { return g.id === chip.groupId; });
					var label = node('span',(group ? group.label + ': ' : '') + chip.label);
					label.className = 'filter-chip filter-chip-state';
					chips.appendChild(label); return;
				}
				var b = node('button',chip.label+' ×'); b.type = 'button'; b.addEventListener('click',function () { dispatch(chip.action); }); chips.appendChild(b);
			});
			if (state.q) { var clear = node('button',state.q+' ×'); clear.type = 'button'; clear.addEventListener('click',function () { dispatch({type:'searchSubmit',value:''}); }); chips.appendChild(clear); }
			open.textContent = text('filter')+(list.length ? ' · '+list.length : '');
			sort.value = state.sort;
			// A server response must not erase an unsubmitted search draft.
			if (document.activeElement !== search) { search.value = state.q; }
			count.textContent = request ? text('loading') : result ? text('count').replace('%s',result.total.toLocaleString(config.lang)) : '';
			show.textContent = request ? text('loading') : text('show').replace('%s',result ? result.total.toLocaleString(config.lang) : '');
			more.hidden = !result || !result.pagination.hasMore || !!observer;
			more.textContent = text('more');
			if (state.pagination.kind === 'page') {
				more.hidden = true;
				// Server-rendered pagination anchors are intercepted below.
			}
		}
		async function load() {
			if (request) { request.abort(); }
			var own = new AbortController(), id = ++sequence; request = own;
			target.setAttribute('aria-busy','true'); error.hidden = true; renderChrome();
			try {
				var fresh = await adapter.load(state,{signal:own.signal,characterContext:context});
				if (dead || own.signal.aborted || id !== sequence) { return; }
				var normalized = core.normalize(config,fresh.state,context);
				if (normalized.notices.length || !Number.isSafeInteger(fresh.total) || fresh.total < 0) { throw new Error('Invalid filter result'); }
				state = normalized.state; result = fresh;
				adapter.renderResults(fresh,target);
				request = null; target.removeAttribute('aria-busy'); writeHistory(true); renderGroups(); renderChrome();
				root.dispatchEvent(new CustomEvent('mql:filterchange',{bubbles:true,detail:{area:config.area,state:JSON.parse(JSON.stringify(state)),total:result.total}}));
			} catch (e) {
				if (dead || own.signal.aborted || id !== sequence) { return; }
				request = null; target.removeAttribute('aria-busy'); renderChrome();
				errorText.textContent = text('error'); fallback.href = currentUrl().href; error.hidden = false;
			}
		}
		async function dispatch(action) {
			if (dead) { return; }
			// The sentinel may fire while a request runs or after the last page.
			if (action.type === 'more' && (request || !result || !result.pagination.hasMore)) { return; }
			if (action.type === 'openDialog') { openDialog(); return; }
			if (action.type === 'closeDialog') { return closeDialog(); }
			if (action.type === 'retry') { return load(); }
			if (action.type === 'searchInput') {
				clearTimeout(timer);
				if (config.search.submit === 'debounce') { timer = setTimeout(function () { dispatch({type:'searchSubmit',value:action.value}); searching = true; },config.search.debounceMs || 200); }
				return;
			}
			var next = core.reduce(config,state,action,context); notices = next.notices;
			if (notices.length) { errorText.textContent = text('invalidRange'); retry.hidden = true; fallback.hidden = true; error.hidden = false; return; }
			retry.hidden = false; fallback.hidden = false; state = next.state;
			// A changed question starts at the first page, not on page 5.
			if (state.pagination && state.pagination.kind === 'page' &&
				action.type !== 'page' && action.type !== 'more' && action.type !== 'retry') {
				state.pagination.page = 1;
			}
			writeHistory(action.type === 'more' || action.type === 'searchInput' || (action.type === 'searchSubmit' && searching));
			if (action.type === 'reset' && memory) { memory.clear(config.area,config.lang); }
			renderGroups(); return load();
		}
		function openDialog() {
			if (dialogBase || !media.matches || dead) { return; }
			dialogBase = {url:location.href,state:JSON.stringify(state)};
			restoreFocus = document.activeElement; scrollY = window.scrollY; oldOverflow = document.body.style.overflow;
			document.body.style.overflow = 'hidden'; dialogBody.appendChild(panel);
			history.pushState(Object.assign({},historyData(),{mqlFilterDialog:config.area}),'',location.href);
			dialog.showModal(); close.focus();
		}
		function finishDialog() {
			var base = dialogBase; if (!base) { return; }
			dialogBase = null;
			dialog.close(); home.appendChild(panel); document.body.style.overflow = oldOverflow;
			window.scrollTo(0,scrollY);
			if (!dead && base.state !== JSON.stringify(state)) { writeHistory(false); }
			if (restoreFocus && restoreFocus.isConnected) { restoreFocus.focus({preventScroll:true}); }
			if (closing) { closing(); closing = null; }
		}
		function closeDialog() {
			if (!dialogBase) { return Promise.resolve(); }
			return new Promise(function (resolve) { if (closing) { resolve(); return; } closing = resolve; history.back(); });
		}
		listen(window,'popstate',function () {
			if (dialogBase) { finishDialog(); return; }
			var parsed = core.decode(config,new URL(location.href),context);
			var savedState = history.state && history.state.mqlFilter;
			if (savedState && savedState.area === config.area) { parsed = core.normalize(config,savedState.state,context); }
			state = parsed.state; notices = parsed.notices; searching = false; renderGroups(); load();
		});
		listen(open,'click',openDialog); listen(close,'click',closeDialog); listen(show,'click',closeDialog);
		listen(dialog,'cancel',function (e) { e.preventDefault(); closeDialog(); });
		listen(dialog,'keydown',function (e) {
			if (e.key !== 'Tab') { return; }
			var focusable = Array.from(dialog.querySelectorAll('button,input,select,a[href],summary,[tabindex]')).filter(function (n) {
				return !n.disabled && n.tabIndex >= 0 && n.getClientRects().length;
			});
			var first = focusable[0], last = focusable[focusable.length-1];
			if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
			else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
		});
		listen(dialog,'click',function (e) { if (e.target === dialog) { var r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) { closeDialog(); } } });
		listen(reset,'click',function () { dispatch({type:'reset'}); });
		listen(sort,'change',function () { dispatch({type:'sort',value:sort.value}); });
		listen(more,'click',function () { dispatch({type:'more'}); });
		listen(retry,'click',function () { load(); });
		function submit() { clearTimeout(timer); var p = dispatch({type:'searchSubmit',value:search.value}); searching = false; return p; }
		listen(searchButton,'click',submit);
		listen(search,'keydown',function (e) { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
		listen(search,'input',function () {
			dispatch({type:'searchInput',value:search.value});
		});
		listen(search,'blur',function () { searching = false; });
		listen(window,'resize',function () { markWrappedOptions(); setzeKopfHoehe(); });
		listen(target,'click',function (e) {
			var sortKnopf = e.target.closest('[data-sort-key]');
			// Server tables render the head as a link for no-JS; with JS the
			// same click sorts in place. A modified click keeps its link.
			if (sortKnopf && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
				e.preventDefault(); dispatch({type:'sortToggle',key:sortKnopf.dataset.sortKey}); return;
			}
			var link = e.target.closest('a[data-filter-page]');
			if (link && !e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) { e.preventDefault(); dispatch({type:'page',value:Number(link.dataset.filterPage)}); }
		});
		listen(media,'change',function () { if (!media.matches) { closeDialog(); } });
		var controller = {
			config:config,
			dispatch:dispatch, getState:function () { return JSON.parse(JSON.stringify(state)); },
			reload:load,
			setCharacterContext:function (c) { context = c; state = core.normalize(config,state,c).state; return load(); },
			destroy:async function () {
				dead = true; ++sequence; if (request) { request.abort(); } clearTimeout(timer);
				if (observer) { observer.disconnect(); observer = null; }
				if (kopfBeobachter) { kopfBeobachter.disconnect(); kopfBeobachter = null; }
				if (dialogBase) { await closeDialog(); }
				listeners.forEach(function (off) { off(); });
				if (dialogBase) { dialog.close(); document.body.style.overflow = oldOverflow; dialogBase = null; }
				if (closing) { closing(); closing = null; }
				if (adapter.destroy) { adapter.destroy(); }
				originalParent.insertBefore(target,originalNext && originalNext.parentNode === originalParent ? originalNext : null);
				shell.remove(); oldControls.forEach(function (n) { n.hidden = false; }); instances.delete(root);
			}
		};
		instances.set(root,controller); renderGroups(); writeHistory(true); controller.ready = load();
		return controller;
	}
	window.MQL_FILTER_UI = {mount:mount};
})();

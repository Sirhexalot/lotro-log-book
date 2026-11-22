/* Small, optional filters for related sections on item pages. */
(function () {
    'use strict';
    var tabHost = document.querySelector('.item-bezugsreiter .llb-reiter');
    if (tabHost && window.MQL_REITER) {
        /* A link from a recipe filter opens the usage tab directly. */
        var recipeQuery = Array.from(new URL(location.href).searchParams.keys())
            .some(function (key) { return key.indexOf('recipe.') === 0; });
        window.MQL_REITER.mount(tabHost, { aktiv: recipeQuery ? 'wofuer' : null });
    }
    function taskReference(row) {
        var link = row.querySelector('a[href]');
        if (!link) { return null; }
        var parts = new URL(link.href, window.location.href).pathname.split('/').filter(Boolean);
        var kinds = { aufgabe: 'quests', quest: 'quests', quete: 'quests',
            tat: 'deeds', deed: 'deeds', prouesse: 'deeds' };
        var kind = kinds[parts[1]];
        return kind && /^[0-9A-F]{8}$/i.test(parts[2] || '') ? { kind: kind, id: parts[2] } : null;
    }
    function attachTaskStatuses() {
        if (!window.MQL_STATUS_UI) { return; }
        document.querySelectorAll('[data-item-task-direct]').forEach(function (list) {
            var attached = false;
            list.querySelectorAll(':scope > li').forEach(function (row) {
                var reference = taskReference(row);
                if (!reference) { return; }
                var control = window.MQL_STATUS_UI.create(reference.kind, reference.id);
                if (!control) { return; }
                control.addEventListener('click', function (event) { event.stopPropagation(); });
                var progress = row.querySelector('.mql-row-progress');
                if (!progress) {
                    progress = document.createElement('span');
                    progress.className = 'mql-row-progress';
                    row.appendChild(progress);
                }
                row.classList.remove('mql-row-no-progress');
                progress.replaceChildren(control);
                attached = true;
            });
            // The progress column is announced only once it holds a control.
            var heading = list.querySelector(':scope > .mql-row-heading');
            if (heading) { heading.hidden = !attached; }
        });
    }
    document.querySelectorAll('[data-item-filter-group]').forEach(function (group) {
        var input = group.querySelector('[data-item-filter-search]');
        var role = group.querySelector('[data-item-filter-role]');
        var rows = Array.prototype.slice.call(group.querySelectorAll('li[data-item-filter-row]'));
        function apply() {
            var query = (input && input.value || '').trim().toLocaleLowerCase();
            var selected = role && role.value || '';
            var visible = 0;
            rows.forEach(function (row) {
                var text = (row.textContent || '').toLocaleLowerCase();
                var matches = (!query || text.indexOf(query) !== -1) &&
                    (!selected || row.getAttribute('data-role') === selected);
                row.hidden = !matches;
                if (matches) { visible += 1; }
            });
            var count = group.querySelector('[data-item-filter-count]');
            if (count) { count.textContent = String(visible); }
        }
        if (input) { input.addEventListener('input', apply); }
        if (role) { role.addEventListener('change', apply); }
        apply();
    });
    document.querySelectorAll('[data-item-chest-sources]').forEach(function (group) {
        var A = window.MQL_FILTERADAPTER, UI = window.MQL_FILTER_UI;
        if (!A || !UI || !window.MQL_TASK_FILTER_SETUP) { return; }
        var lang = document.documentElement.lang;
        var target = group.querySelector('[data-filter-results]'), head = target.querySelector('.mql-row-heading');
        var rows = Array.from(target.querySelectorAll('.mql-row'), function (row) {
            return {node:row, name:row.querySelector('.mql-row-name').textContent};
        });
        var labels = window.MQL_TASK_FILTER_SETUP([], 'q').config.labels;
        labels.placeholder = {de:'Instanz suchen', en:'Search instances', fr:'Chercher une instance'}[lang];
        function defaults() { return {q:'',filters:{},sort:'name',pagination:{kind:'limit',limit:30}}; }
        var config = {area:'item-chests-'+location.pathname.split('/').filter(Boolean).pop(),
            lang:lang, rootUrl:location.pathname, labels:labels, groups:[], defaults:defaults,
            search:{submit:'debounce',debounceMs:200}, pagination:{kind:'limit',size:30},
            urlCodec:A.codec([{param:'truhen.q',path:['q']},
                {param:'truhen.n',path:['pagination','limit'],type:'number',omit:30}],defaults)};
        var adapter = A.client({rows:rows, size:30, id:function (r) { return r.node; },
            matches:function (r,s) { return r.name.toLocaleLowerCase(lang).includes(s.q.toLocaleLowerCase(lang)); },
            compare:function (a,b) { return MQL_SORT.compare(a.name,b.name); },
            facets:function () { return {}; },
            renderResults:function (r,target) {
                target.replaceChildren();
                if (r.total) {
                    target.appendChild(head.cloneNode(true));
                    r.payload.forEach(function (row) { target.appendChild(row.node.cloneNode(true)); });
                } else {
                    var empty = document.createElement('li');
                    empty.textContent = {de:'Keine passende Instanz gefunden.',en:'No matching instance found.',fr:'Aucune instance correspondante.'}[lang];
                    target.appendChild(empty);
                }
            }});
        UI.mount(group,{config:config,adapter:adapter});
    });
    attachTaskStatuses();
    document.addEventListener('mql:characterchange', attachTaskStatuses);
    document.addEventListener('change', function (event) {
        if (event.target.id === 'katalog-charakter') { attachTaskStatuses(); }
    });
}());

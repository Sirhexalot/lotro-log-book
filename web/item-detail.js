/* Small, optional filters for related sections on item pages. */
(function () {
    'use strict';
    var tabs = Array.prototype.slice.call(document.querySelectorAll('[data-item-tab]'));
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-item-tab-panel]'));
    function showTab(name) {
        tabs.forEach(function (tab) {
            var active = tab.getAttribute('data-item-tab') === name;
            tab.setAttribute('aria-selected', String(active));
            tab.tabIndex = active ? 0 : -1;
        });
        panels.forEach(function (panel) {
            panel.hidden = panel.getAttribute('data-item-tab-panel') !== name;
        });
    }
    if (tabs.length) {
        tabs.forEach(function (tab, index) {
            tab.addEventListener('click', function () {
                showTab(tab.getAttribute('data-item-tab'));
            });
            tab.addEventListener('keydown', function (event) {
                if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) { return; }
                event.preventDefault();
                var next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1
                    : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
                showTab(tabs[next].getAttribute('data-item-tab'));
                tabs[next].focus();
            });
        });
        var recipeQuery = Array.from(new URL(location.href).searchParams.keys())
            .some(function (key) { return key.indexOf('recipe.') === 0; });
        var initial = recipeQuery ? tabs.filter(function (tab) {
            return tab.getAttribute('data-item-tab') === 'wofuer';
        })[0] : tabs.filter(function (tab) {
            return tab.getAttribute('aria-selected') === 'true';
        })[0];
        showTab(initial ? initial.getAttribute('data-item-tab') : tabs[0].getAttribute('data-item-tab'));
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
        document.querySelectorAll('[data-item-task-direct] > li').forEach(function (row) {
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
    attachTaskStatuses();
    document.addEventListener('mql:characterchange', attachTaskStatuses);
    document.addEventListener('change', function (event) {
        if (event.target.id === 'katalog-charakter') { attachTaskStatuses(); }
    });
}());

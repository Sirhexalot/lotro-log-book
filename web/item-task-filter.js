/* Large item source lists use the same filter adapter as the quest finder. */
(function () {
    'use strict';
    var data = document.getElementById('item-task-filter-data');
    if (!data || !window.MQL_FILTER_UI) { return; }
    var lists = JSON.parse(data.textContent);
    document.querySelectorAll('[data-item-task-filter]').forEach(function (root) {
        var kind = root.getAttribute('data-item-task-filter');
        var rows = lists[kind] || [];
        if (rows.length <= 10) { return; }
        var fallback = root.querySelector('[data-item-task-fallback]');
        var target = root.querySelector('[data-filter-results]');
        var controller;
        if (kind === 'q' && window.MQL_KARTEN_AUFGABENFILTER) {
            var lang = document.documentElement.lang;
            var segment = {de: 'aufgabe', en: 'quest', fr: 'quete'}[lang] || 'quest';
            controller = window.MQL_KARTEN_AUFGABENFILTER.mount(root, rows, function (quest) {
                window.location.assign('/' + lang + '/' + segment + '/' + quest.i + '/');
            });
        } else if (window.MQL_TASK_FILTER_SETUP) {
            var setup = window.MQL_TASK_FILTER_SETUP(rows, kind);
            setup.config.area = 'item-' + kind;
            controller = window.MQL_FILTER_UI.mount(root, setup);
        }
        if (!controller) { return; }
        if (window.addEventListener && controller.reload) {
            window.addEventListener('mql-status', function () {
                controller.reload();
            });
        }
        if (controller.ready) {
            controller.ready.then(function () {
                if (fallback) { fallback.hidden = true; }
                if (target) { target.hidden = false; }
            });
        }
    });
}());

(function () {
	'use strict';
	var form = document.getElementById('feedback-form');
	if (!form) { return; }
	var t = window.MQL_T || function (key) { return key; };
	var status = document.getElementById('feedback-status');
	var submit = form.querySelector('[type="submit"]');
	var context = null;
	try {
		context = JSON.parse(window.sessionStorage.getItem('llb.feedback.context') || 'null');
		window.sessionStorage.removeItem('llb.feedback.context');
	} catch (_) {}
	if (!context || typeof context !== 'object') { context = {}; }

	if (!context.url && document.referrer) {
		try {
			var referrer = new URL(document.referrer);
			if (referrer.origin === window.location.origin) { context.url = referrer.href; }
		} catch (_) {}
	}
	if (!context.url) { context.url = window.location.href; }
	context.viewport = window.innerWidth + 'x' + window.innerHeight;
	document.getElementById('feedback-page-url').value = context.url;
	document.getElementById('feedback-entity-type').value = String(context.type || '');
	document.getElementById('feedback-entity-id').value = String(context.id || '');
	document.getElementById('feedback-entity-name').value = String(context.name || '');
	document.getElementById('feedback-viewport').value = context.viewport;

	if (context.name) {
		var about = document.getElementById('feedback-bezug');
		about.textContent = t('feedback_context') + ': ' + context.name;
		about.hidden = false;
	}

	function show(message, kind) {
		status.textContent = message;
		status.className = 'feedback-status' + (kind ? ' ' + kind : '');
	}
	function errorText(code) {
		var keys = {
			message: 'feedback_error_message',
			email: 'feedback_error_email',
			context: 'feedback_error_context',
			limit: 'feedback_error_limit',
			too_fast: 'feedback_error',
			expired: 'feedback_error',
			unavailable: 'feedback_error',
			send: 'feedback_error',
			origin: 'feedback_error',
			invalid: 'feedback_error'
		};
		return t(keys[code] || 'feedback_error');
	}

	form.addEventListener('submit', function (event) {
		event.preventDefault();
		if (!form.reportValidity()) { return; }
		submit.disabled = true;
		show(t('feedback_sending'));
		var data = {};
		new FormData(form).forEach(function (value, key) { data[key] = String(value); });
		fetch(form.action, {
			method: 'POST',
			credentials: 'same-origin',
			headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
			body: JSON.stringify(data)
		}).then(function (response) {
			return response.json().then(function (result) {
				if (!response.ok) { throw new Error(result.error || 'send'); }
				return result;
			});
		}).then(function (result) {
			show(t(result.ok === 'saved_mail_failed'
				? 'feedback_saved_notice_failed' : 'feedback_sent'), 'erfolg');
			form.querySelector('textarea').value = '';
			form.querySelector('input[name="reply_email"]').value = '';
			submit.disabled = true;
		}).catch(function (error) {
			show(errorText(error.message), 'fehler');
			submit.disabled = false;
		});
	});
})();

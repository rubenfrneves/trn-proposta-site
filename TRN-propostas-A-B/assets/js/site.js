/* TRN — comportamento comum às Opções A e B. Conceito e código © 2026 Rúben Neves. */
(function () {
  'use strict';
  var C = window.TRN_CONFIG || {}, d = document;
  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };
  var ls = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };

  /* telefone e WhatsApp (preenchidos em config.js) */
  var phoneOk = !!(C.phone && C.phone.trim()), waOk = !!(C.whatsapp && C.whatsapp.trim());
  if (phoneOk) { $$('.js-phone').forEach(function (a) { a.href = 'tel:' + C.phone.replace(/[^\d+]/g, ''); }); $$('[data-ph=phone]').forEach(function (b) { b.textContent = C.phone; }); }
  if (waOk) { $$('.js-wa').forEach(function (a) { a.href = 'https://wa.me/' + C.whatsapp.replace(/\D/g, ''); }); $$('[data-ph=wa]').forEach(function (b) { b.textContent = C.whatsapp; }); }
  d.addEventListener('click', function (e) {
    var a = e.target.closest('.js-phone, .js-wa'); if (!a) return;
    if ((a.classList.contains('js-phone') && !phoneOk) || (a.classList.contains('js-wa') && !waOk)) e.preventDefault();
  });

  /* menu */
  var burger = $('.burger'), menu = $('#menu');
  if (burger) {
    burger.addEventListener('click', function () { var o = menu.classList.toggle('open'); burger.setAttribute('aria-expanded', String(o)); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) { menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); } });
  }

  /* cookies */
  var ck = $('#cookie');
  if (ck && !ls.get('trn-cookies')) ck.hidden = false;
  if (ck) ck.addEventListener('click', function (e) { var b = e.target.closest('[data-cookie]'); if (!b) return; ls.set('trn-cookies', b.getAttribute('data-cookie')); ck.hidden = true; });

  /* janelas: só o pedido de orçamento e o transporte de trabalhadores */
  var openModal = null, lastFocus = null;
  var FOC = 'a[href],button:not([disabled]),input:not([type=hidden]),select,textarea,[tabindex]:not([tabindex="-1"])';
  function show(id) {
    var m = d.getElementById(id); if (!m) return;
    if (openModal) hide(true);
    lastFocus = d.activeElement; m.hidden = false; openModal = m; d.body.classList.add('modal-open');
    var f = $$(FOC, m).filter(function (x) { return !x.closest('[hidden]') && x.offsetParent !== null; });
    var first = f.find(function (x) { return x.tagName !== 'BUTTON' || !x.hasAttribute('data-close'); }) || f[0]; if (first) first.focus();
  }
  function hide(keep) {
    if (!openModal) return; openModal.hidden = true; openModal = null; d.body.classList.remove('modal-open');
    if (!keep && lastFocus && lastFocus.focus) lastFocus.focus();
  }
  d.addEventListener('keydown', function (e) {
    if (!openModal) return;
    if (e.key === 'Escape') { hide(); return; }
    if (e.key !== 'Tab') return;
    var f = $$(FOC, openModal).filter(function (x) { return !x.closest('[hidden]') && x.offsetParent !== null; }); if (!f.length) return;
    var a = f[0], z = f[f.length - 1];
    if (e.shiftKey && d.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && d.activeElement === z) { e.preventDefault(); a.focus(); }
  });
  d.addEventListener('click', function (e) {
    var c = e.target.closest('[data-close]');
    if (c || (openModal && e.target === openModal)) { hide(); return; }
    var q = e.target.closest('[data-open-quote]'); if (q) { var s = q.getAttribute('data-service'); if (s) setService(s); show('m-quote'); return; }
    if (e.target.closest('[data-open-workers]')) show('m-workers');
  });

  /* tabs (Opção B) com setas do teclado */
  var tabs = $$('[role=tab]');
  function pick(i, focus) { tabs.forEach(function (t, j) { var on = i === j; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; $('#' + t.getAttribute('aria-controls')).hidden = !on; }); if (focus) tabs[i].focus(); }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { pick(i); });
    t.addEventListener('keydown', function (e) {
      var k = e.key, n = tabs.length;
      if (k === 'ArrowRight') { e.preventDefault(); pick((i + 1) % n, true); } else if (k === 'ArrowLeft') { e.preventDefault(); pick((i + n - 1) % n, true); }
      else if (k === 'Home') { e.preventDefault(); pick(0, true); } else if (k === 'End') { e.preventDefault(); pick(n - 1, true); }
    });
  });

  /* formulários (Formspree se houver ID; senão abre o email já escrito) */
  function ref() { var t = new Date(); return 'TRN-' + String(t.getFullYear()).slice(2) + ('0' + (t.getMonth() + 1)).slice(-2) + ('0' + t.getDate()).slice(-2) + '-' + Math.random().toString(36).slice(2, 6).toUpperCase(); }
  function setErr(el, msg) { var f = el.closest('.fld'); if (f) f.classList.toggle('bad', !!msg); var e = d.getElementById(el.id + '-e'); if (e) e.textContent = msg || ''; el.setAttribute('aria-invalid', msg ? 'true' : 'false'); }
  function check(scope, M) {
    var first = null;
    $$('[required]', scope).forEach(function (el) {
      if (el.type === 'checkbox') return;
      var v = el.value.trim(), msg = '';
      if (!v) msg = M.required; else if (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) msg = M.bad_email;
      setErr(el, msg); if (msg && !first) first = el;
    });
    if (first) first.focus();
    return !first;
  }
  function box(id, text, info) { var b = d.getElementById(id); b.textContent = text; b.className = 'msg' + (info ? ' info' : ''); b.hidden = !text; }
  function submit(form, o) {
    var M = o.M, t0 = o.t0;
    if ($('[name=_gotcha]', form).value || Date.now() - t0 < 3000) { box(o.msg, M.spam); return; }
    var reference = ref(), id = (C.formspreeId || '').trim(), btn = d.getElementById(o.btn);
    var lines = o.lines(), body = reference + '\n\n' + lines.map(function (l) { return l[0] + ': ' + l[1]; }).join('\n');
    if (!id) {
      var to = C.email || 'geral@trnrodoviaria.pt';
      box(o.msg, M.mail_hint, true);
      location.href = 'mailto:' + to + '?subject=' + encodeURIComponent(M.subject + ' — ' + reference) + '&body=' + encodeURIComponent(body);
      return;
    }
    var fd = new FormData(form); fd.append('referencia', reference); fd.append('_subject', M.subject + ' — ' + reference);
    btn.disabled = true; var old = btn.textContent; btn.textContent = M.sending;
    fetch('https://formspree.io/f/' + encodeURIComponent(id), { method: 'POST', body: fd, headers: { Accept: 'application/json' } })
      .then(function (r) { if (!r.ok) throw new Error('http'); o.done(reference); })
      .catch(function () { box(o.msg, M.fail.replace('{mail}', C.email || 'geral@trnrodoviaria.pt')); })
      .then(function () { btn.disabled = false; btn.textContent = old; });
  }

  var quote = $('#quote');
  if (quote) {
    var QM = JSON.parse(quote.getAttribute('data-msgs')), qt0 = Date.now(), cur = 1;
    var goStep = function (n) { cur = n; $$('fieldset.step', quote).forEach(function (s) { s.hidden = s.getAttribute('data-step') != n; }); $('#stepno').textContent = QM.step.replace('{n}', n); var f = $('fieldset.step:not([hidden]) input, fieldset.step:not([hidden]) select', quote); if (f) f.focus(); };
    window.setService = function (s) { var sel = $('#q-service'); if (sel && $('option[value="' + s + '"]', sel)) sel.value = s; };
    $('[data-next]', quote).addEventListener('click', function () { if (check($('fieldset[data-step="1"]', quote), QM)) goStep(2); });
    $('[data-back]', quote).addEventListener('click', function () { goStep(1); });
    var qh = { from: 'q-from', to: 'q-to', date: 'q-date', pax: 'q-pax' };
    var qf = $('#quick');
    if (qf) qf.addEventListener('submit', function (ev) {
      ev.preventDefault();
      [['h-from', 'q-from'], ['h-to', 'q-to'], ['h-date', 'q-date'], ['h-pax', 'q-pax']].forEach(function (p) { var v = $('#' + p[0]).value; if (v) $('#' + p[1]).value = v; });
      show('m-quote'); var ok = ['q-from', 'q-to', 'q-date', 'q-pax'].every(function (i) { return $('#' + i).value.trim(); });
      if (ok) goStep(2); else goStep(1);
    });
    quote.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (!check($('fieldset[data-step="2"]', quote), QM)) return;
      var sel = $('#q-service');
      submit(quote, { M: QM, t0: qt0, msg: 'qmsg', btn: 'qsend',
        lines: function () { return [[QM.from, $('#q-from').value], [QM.to, $('#q-to').value], [QM.date, $('#q-date').value], [QM.pax, $('#q-pax').value], [QM.service, sel.options[sel.selectedIndex].text], [QM.name, $('#q-name').value], [QM.phone, $('#q-phone').value], [QM.email, $('#q-email').value], [QM.notes, $('#q-notes').value]].filter(function (l) { return l[1]; }); },
        done: function (r) { $$('fieldset.step', quote).forEach(function (s) { s.hidden = true; }); $('#stepno').hidden = true; $('#qref').textContent = r; var dn = $('#qdone'); dn.hidden = false; dn.setAttribute('tabindex', '-1'); dn.focus(); } });
    });
  } else if (!window.setService) window.setService = function () {};

  var apply = $('#apply');
  if (apply) {
    var AM = JSON.parse(apply.getAttribute('data-msgs')), at0 = Date.now();
    $$('[data-job]').forEach(function (a) { a.addEventListener('click', function () { $('#a-job').value = a.getAttribute('data-job'); }); });
    apply.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var ok = check(apply, AM), cb = $('#a-consent'), ce = $('#a-consent-e');
      if (!cb.checked) { ce.textContent = AM.required; ok = false; } else ce.textContent = '';
      if (!ok) return;
      submit(apply, { M: AM, t0: at0, msg: 'amsg', btn: 'asend',
        lines: function () {
          var lic = $$('[name=habilitacoes]:checked', apply).map(function (c) { return c.value; }).join(', '), j = $('#a-job');
          return [['Vaga', j.options[j.selectedIndex].text], ['Nome', $('#a-name').value], ['Telemóvel', $('#a-phone').value], ['Email', $('#a-email').value], ['Habilitações', lic]].filter(function (l) { return l[1]; });
        },
        done: function (r) { $$('.fld, .lics, .chk, .actions, h2', apply).forEach(function (x) { x.hidden = true; }); $('#aref').textContent = r; var dn = $('#adone'); dn.hidden = false; dn.setAttribute('tabindex', '-1'); dn.focus(); } });
    });
  }
})();

/* TRN Rodoviária — comportamento do site. Conceito e código © 2026 Rúben Neves. */
(function () {
  'use strict';
  var T = window.TRN || {}, doc = document;
  doc.documentElement.className += ' js';
  var $ = function (s, r) { return (r || doc).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };
  var store = {
    get: function (k, s) { try { return (s ? sessionStorage : localStorage).getItem(k); } catch (e) { return null; } },
    set: function (k, v, s) { try { (s ? sessionStorage : localStorage).setItem(k, v); } catch (e) {} },
    del: function (k, s) { try { (s ? sessionStorage : localStorage).removeItem(k); } catch (e) {} }
  };

  /* medição: só com consentimento */
  var A = T.analytics || {}, queue = [], consent = store.get('trn-consent');
  function send(n) { if (A.provider === 'plausible' && window.plausible) window.plausible(n); else if (A.provider === 'ga4' && window.gtag) window.gtag('event', n); }
  function loadAnalytics() {
    if (A.provider === 'plausible' && A.plausible_domain) {
      var s = doc.createElement('script'); s.defer = true; s.src = A.plausible_script || 'https://plausible.io/js/script.js'; s.setAttribute('data-domain', A.plausible_domain);
      window.plausible = window.plausible || function () { (window.plausible.q = window.plausible.q || []).push(arguments); }; doc.head.appendChild(s);
    } else if (A.provider === 'ga4' && A.ga4_id) {
      window.dataLayer = window.dataLayer || []; window.gtag = function () { window.dataLayer.push(arguments); };
      var g = doc.createElement('script'); g.async = true; g.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(A.ga4_id); doc.head.appendChild(g);
      window.gtag('js', new Date()); window.gtag('config', A.ga4_id, { anonymize_ip: true });
    }
    queue.splice(0).forEach(send);
  }
  function track(n) { if (!A.provider || consent !== 'yes') return; if (window.plausible || window.gtag) send(n); else queue.push(n); }
  if (A.provider && !consent) {
    var c = T.cookie, bar = doc.createElement('div');
    bar.className = 'cookiebar'; bar.setAttribute('role', 'dialog'); bar.setAttribute('aria-label', c.title);
    bar.innerHTML = '<strong></strong><p></p><div class="actions"><button type="button" class="btn btn--red" data-y></button><button type="button" class="btn btn--line" data-n></button></div>';
    bar.querySelector('strong').textContent = c.title; bar.querySelector('p').textContent = c.text;
    bar.querySelector('[data-y]').textContent = c.yes; bar.querySelector('[data-n]').textContent = c.no;
    doc.body.appendChild(bar);
    bar.addEventListener('click', function (e) { var y = e.target.closest('[data-y]'), n = e.target.closest('[data-n]'); if (!y && !n) return; consent = y ? 'yes' : 'no'; store.set('trn-consent', consent); bar.remove(); if (y) loadAnalytics(); });
  } else if (A.provider && consent === 'yes') loadAnalytics();
  doc.addEventListener('click', function (e) { var a = e.target.closest('[data-track]'); if (a) track(a.getAttribute('data-track')); });

  /* navegação */
  var y = $('#yr'); if (y) y.textContent = new Date().getFullYear();
  var burger = $('.burger'), menu = $('#menu');
  if (burger) {
    burger.addEventListener('click', function () { var o = menu.classList.toggle('open'); burger.setAttribute('aria-expanded', String(o)); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) { menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); } });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('open')) { menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); burger.focus(); } });
  }
  var dock = $('#dock');
  if (dock) {
    doc.addEventListener('focusin', function (e) { if (/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) dock.classList.add('away'); });
    doc.addEventListener('focusout', function () { dock.classList.remove('away'); });
  }
  var rv = $$('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .1 });
    rv.forEach(function (el, i) { el.style.transitionDelay = (i % 4) * 70 + 'ms'; io.observe(el); });
  } else rv.forEach(function (el) { el.classList.add('in'); });

  /* formulários */
  var form = $('#quote') || $('#apply');
  if (!form) return;
  var isJob = form.id === 'apply', M = JSON.parse(form.getAttribute('data-msgs')), cfg = T.form || {}, loadedAt = Date.now();
  function setVal(id, v) { var el = doc.getElementById(id); if (el && v != null && v !== '') { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); } }
  function setErr(el, msg) {
    var f = el.closest('.fld'); if (f) f.classList.toggle('bad', !!msg);
    var e = doc.getElementById(el.id + '-e'); if (e) e.textContent = msg || '';
    el.setAttribute('aria-invalid', msg ? 'true' : 'false'); if (e && msg) el.setAttribute('aria-describedby', e.id);
  }
  function check(scope) {
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
  var fields = $$('input:not([type=checkbox]):not([type=file]):not([name=website]), select, textarea', form), DK = 'trn-draft-' + form.id;
  function saveDraft() { var o = {}; fields.forEach(function (el) { if (el.id) o[el.id] = el.value; }); store.set(DK, JSON.stringify(o), true); }
  try { var d = JSON.parse(store.get(DK, true) || '{}'); fields.forEach(function (el) { if (el.id && d[el.id] != null) el.value = d[el.id]; }); } catch (e) {}
  form.addEventListener('input', saveDraft); form.addEventListener('change', saveDraft);

  if (!isJob) {
    var svc = $('#f-service'), det = $('#f-details');
    function hint() { var o = svc.options[svc.selectedIndex]; det.placeholder = (o && o.getAttribute('data-hint')) || ''; }
    svc.addEventListener('change', hint); hint();
    function showVehicle(v) { $('#f-vehicle').value = v || ''; $('#vname').textContent = v || ''; $('#vchip').hidden = !v; saveDraft(); }
    showVehicle($('#f-vehicle').value);
    $('#vclear').addEventListener('click', function () { showVehicle(''); });
    // cartões de serviço e de frota → pré-preenchem o pedido
    $$('[data-service]').forEach(function (a) { a.addEventListener('click', function () { svc.value = a.getAttribute('data-service'); hint(); saveDraft(); }); });
    $$('[data-vehicle]').forEach(function (a) { a.addEventListener('click', function () { showVehicle(a.getAttribute('data-vehicle')); }); });
    // pedido rápido do topo → formulário completo
    $('#quick').addEventListener('submit', function (ev) {
      ev.preventDefault();
      setVal('f-from', $('#q-from').value); setVal('f-to', $('#q-to').value); setVal('f-date', $('#q-date').value); setVal('f-pax', $('#q-pax').value);
      $('#pedido').scrollIntoView({ behavior: 'smooth' }); setTimeout(function () { var n = $('#f-name'); if ($('[data-step="1"]').hidden) n.focus({ preventScroll: true }); else $('#f-from').focus({ preventScroll: true }); }, 600);
    });
    var steps = $$('[data-step]', form);
    var show = function (n) { steps.forEach(function (s) { s.hidden = s.getAttribute('data-step') != n; }); var h = steps[n - 1].querySelector('legend, h3'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } };
    $('[data-next]').addEventListener('click', function () { if (check($('[data-step="1"]'))) show(2); });
    $('[data-back]').addEventListener('click', function () { show(1); });
    $('[data-edit]').addEventListener('click', function () { show(1); });
    var ids = ['f-service', 'f-from', 'f-to', 'f-date', 'f-time', 'f-pax', 'f-ret', 'f-vehicle', 'f-details', 'f-name', 'f-org', 'f-email', 'f-phone'];
    var key = { 'f-service': 'service', 'f-from': 'from', 'f-to': 'to', 'f-date': 'date', 'f-time': 'time', 'f-pax': 'pax', 'f-ret': 'ret', 'f-vehicle': 'vehicle', 'f-details': 'details', 'f-name': 'name', 'f-org': 'org', 'f-email': 'email', 'f-phone': 'phone' };
    var collect = function () {
      var rows = [];
      ids.forEach(function (id) { var el = doc.getElementById(id), v = el.tagName === 'SELECT' ? el.options[el.selectedIndex].text : el.value.trim(); if (v) rows.push([M[key[id]], v, key[id]]); });
      return rows;
    };
    $('[data-review]').addEventListener('click', function () {
      var ok = check($('[data-step="2"]')), ck = $('#f-consent'), ce = $('#f-consent-e');
      if (!ck.checked) { ce.textContent = M.need_consent; if (ok) ck.focus(); ok = false; } else ce.textContent = '';
      if (!ok) return;
      var dl = $('#summary'); dl.innerHTML = '';
      collect().forEach(function (r) { var dt = doc.createElement('dt'), dd = doc.createElement('dd'); dt.textContent = r[0]; dd.textContent = r[1]; dl.appendChild(dt); dl.appendChild(dd); });
      $('#sendnote').textContent = cfg.endpoint ? '' : M.mail_hint; show(3);
    });
    form.__collect = collect;
  }

  function ref() { var d = new Date(); return 'TRN-' + String(d.getFullYear()).slice(2) + ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2) + '-' + Math.random().toString(36).slice(2, 6).toUpperCase(); }
  function msgBox(t) { var b = $('#formmsg'); b.textContent = t; b.hidden = !t; }
  var tsToken = '';
  if (cfg.turnstile && $('#ts')) {
    window.__trnTs = function () { window.turnstile.render('#ts', { sitekey: cfg.turnstile, callback: function (t) { tsToken = t; } }); };
    var sc = doc.createElement('script'); sc.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=__trnTs&render=explicit'; sc.async = true; doc.head.appendChild(sc);
  }
  form.addEventListener('submit', function (ev) {
    ev.preventDefault(); msgBox('');
    if (isJob) { var ok = check(form), ck = $('#a-consent'), ce = $('#a-consent-e'); if (!ck.checked) { ce.textContent = M.need_consent; ok = false; } else ce.textContent = ''; if (!ok) return; }
    var hp = $('[name=website]', form);
    if ((hp && hp.value) || Date.now() - loadedAt < (cfg.minSeconds != null ? cfg.minSeconds : 4) * 1000 || (cfg.turnstile && !tsToken)) { msgBox(M.spam); return; }
    var reference = ref(), rows;
    if (isJob) rows = [['', $('#a-job').value || $('#a-job').options[0].text, 'job'], [$('label[for=a-name]').textContent, $('#a-name').value, 'name'], [$('label[for=a-phone]').textContent, $('#a-phone').value, 'phone'], [$('label[for=a-email]').textContent, $('#a-email').value, 'email'], [$('label[for=a-area]').textContent, $('#a-area').value, 'area'], [$('label[for=a-msg]').textContent, $('#a-msg').value, 'notes']].filter(function (r) { return r[1]; });
    else rows = form.__collect();
    var body = reference + '\n\n' + rows.map(function (r) { return (r[0] ? r[0] + ': ' : '') + r[1]; }).join('\n');
    var payload = { reference: reference, kind: isJob ? 'candidatura' : 'orcamento', lang: T.lang, page: location.href, message: body };
    rows.forEach(function (r) { payload[r[2]] = r[1]; });
    var btn = $('#send');
    function done() {
      store.del(DK, true); track(isJob ? 'candidatura_enviada' : 'pedido_orcamento_enviado');
      $$('[data-step]', form).forEach(function (s) { s.hidden = true; });
      $('#ref').textContent = reference; var dn = $('#done'); dn.hidden = false; dn.setAttribute('tabindex', '-1'); dn.focus();
    }
    if (!cfg.endpoint) {   // sem receção ligada nunca se mostra "recebido"
      if (!T.mail) { msgBox(M.fail); return; }
      msgBox(M.mail_hint); location.href = 'mailto:' + T.mail + '?subject=' + encodeURIComponent(M.subject + ' — ' + reference) + '&body=' + encodeURIComponent(body); return;
    }
    btn.disabled = true; var old = btn.textContent; btn.textContent = M.sending || '…';
    var fileEl = $('#a-cv'), req;
    if (isJob && cfg.cv && fileEl && fileEl.files.length) { var fd = new FormData(); Object.keys(payload).forEach(function (k) { fd.append(k, payload[k]); }); fd.append('cv', fileEl.files[0]); req = fetch(cfg.endpoint, { method: 'POST', body: fd, headers: { Accept: 'application/json' } }); }
    else { if (cfg.turnstile) payload['cf-turnstile-response'] = tsToken; req = fetch(cfg.endpoint, { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json', Accept: 'application/json' } }); }
    req.then(function (r) { if (!r.ok) throw new Error('http ' + r.status); done(); }).catch(function () { msgBox(M.fail); }).then(function () { btn.disabled = false; btn.textContent = old; });
  });
  $$('[data-job]').forEach(function (a) { a.addEventListener('click', function () { var s = $('#a-job'); if (s) s.value = a.getAttribute('data-job'); }); });
})();

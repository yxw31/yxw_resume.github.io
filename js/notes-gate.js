/**
 * notes-gate.js — Knowledge Notes access-gate login page renderer.
 *
 * Used only on /notes/login.html. Loads data/52_notes-gate.json, renders a
 * centered password form, and on success writes a "unlocked" record into
 * localStorage and redirects to the original page (?returnTo=…).
 *
 * Hashing matches tools/set-notes-password.js:
 *   sha256(salt + password) == cfg.passwordHash
 *
 * ⚠ Client-side gate. Deters casual visitors but can be bypassed by
 *   anyone with DevTools. Do not store secrets behind this.
 */

(function () {
  'use strict';

  const KL = window.KL;
  if (!KL) {
    console.error('[notes-gate] render.js helpers not loaded.');
    return;
  }
  const esc = KL.esc;
  const t = KL.t;

  const STORAGE_KEY = 'notes-gate-unlocked-v1';

  // --- shared sentinel constants (mirrored by inline check in note pages) ---
  function isUnlocked(rememberDays) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const d = JSON.parse(raw);
      if (!d || !d.ts) return false;
      const limit = (d.days || rememberDays || 7) * 86400000;
      return (Date.now() - d.ts) < limit;
    } catch (e) {
      return false;
    }
  }

  function saveUnlock(rememberDays) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ts: Date.now(),
        days: rememberDays || 7
      }));
    } catch (e) {
      console.warn('[notes-gate] localStorage write failed:', e);
    }
  }

  async function sha256Hex(text) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf))
      .map(function (b) { return b.toString(16).padStart(2, '0'); })
      .join('');
  }

  function getReturnTo() {
    const qs = new URLSearchParams(location.search);
    const ret = qs.get('returnTo');
    if (!ret) return 'index.html';
    // Only allow same-origin paths to prevent open-redirect.
    try {
      const url = new URL(ret, location.href);
      if (url.origin !== location.origin) return 'index.html';
      // strip leading slash, keep relative to current dir
      return url.pathname + url.search + url.hash;
    } catch (e) {
      return 'index.html';
    }
  }

  const cache = { site: null, cfg: null };

  function renderGate() {
    const lang = KL.state.lang;
    const cfg = cache.cfg || {};
    const titleZh = t(cfg.title, lang) || 'Notes · Access Required';
    // Split title for accent on last 2 chars (works for both zh and en)
    const splitAt = Math.max(0, titleZh.lastIndexOf(' '));
    const titleLead = splitAt > 0 ? titleZh.slice(0, splitAt) : titleZh.slice(0, -2);
    const titleTail = splitAt > 0 ? titleZh.slice(splitAt) : titleZh.slice(-2);
    const subtitle = esc(t(cfg.subtitle, lang) || '');
    const hint     = esc(t(cfg.hint, lang)     || '');
    const errMsg   = esc(t(cfg.errorMsg, lang) || 'Wrong password.');
    const rememberLabel = esc(t(cfg.rememberLabel, lang) || 'Remember me');
    const unlockLabel   = esc(t(cfg.unlockLabel, lang)   || 'Unlock');
    const backLabel     = esc(t(cfg.backLabel, lang)     || '← Back');

    const lockIcon =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>' +
        '<path d="M7 11V7a5 5 0 0 1 10 0v4"/>' +
      '</svg>';

    const eyeIcon =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>' +
        '<circle cx="12" cy="12" r="3"/>' +
      '</svg>';

    const main = document.getElementById('gateMain');
    if (!main) return;

    main.innerHTML =
      '<div class="gate-bg" aria-hidden="true"></div>' +
      '<div class="gate-wrap">' +
        '<div class="gate-card">' +
          '<div class="gate-icon">' + lockIcon + '</div>' +
          '<p class="gate-eyebrow">SYS://NOTES · ACCESS</p>' +
          '<h1 class="gate-title">' + esc(titleLead) + '<span class="accent">' + esc(titleTail) + '</span></h1>' +
          (subtitle ? '<p class="gate-subtitle">' + subtitle + '</p>' : '') +
          '<form id="gateForm" class="gate-form" autocomplete="off">' +
            '<label class="gate-label" for="gatePwd">PASSWORD</label>' +
            '<div class="gate-input-wrap">' +
              '<input type="password" id="gatePwd" class="gate-input" autofocus placeholder="• • • • • • • •" />' +
              '<button type="button" class="gate-toggle-show" id="gateShow" aria-label="toggle visibility">' + eyeIcon + '</button>' +
            '</div>' +
            '<label class="gate-remember">' +
              '<input type="checkbox" id="gateRemember" checked /> ' +
              '<span>' + rememberLabel + '</span>' +
            '</label>' +
            '<p class="gate-error" id="gateError" hidden>' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' +
              '<span>' + errMsg + '</span>' +
            '</p>' +
            '<button type="submit" class="btn-primary gate-submit">' + unlockLabel + ' →</button>' +
          '</form>' +
          (hint ? '<p class="gate-hint">' + hint + '</p>' : '') +
          '<a href="../" class="gate-back">' + backLabel + '</a>' +
        '</div>' +
      '</div>';

    bindForm();
  }

  function bindForm() {
    const form  = document.getElementById('gateForm');
    const pwd   = document.getElementById('gatePwd');
    const err   = document.getElementById('gateError');
    const showBtn = document.getElementById('gateShow');
    const remember = document.getElementById('gateRemember');
    if (!form || !pwd) return;

    if (showBtn) {
      showBtn.addEventListener('click', function () {
        pwd.type = pwd.type === 'password' ? 'text' : 'password';
      });
    }

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      err.hidden = true;
      const cfg = cache.cfg || {};
      const candidate = pwd.value || '';
      if (!candidate) { pwd.focus(); return; }

      let h;
      try {
        h = await sha256Hex((cfg.salt || '') + candidate);
      } catch (ex) {
        err.textContent = 'Hash error: ' + (ex.message || ex);
        err.hidden = false;
        return;
      }

      if (h === cfg.passwordHash) {
        const days = remember && remember.checked ? (cfg.rememberDays || 7) : 0;
        if (days > 0) {
          saveUnlock(days);
        } else {
          // session-only: write to sessionStorage instead
          try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ts: Date.now(), days: 0.5 })); } catch (e) {}
        }
        // success — redirect
        const dest = getReturnTo();
        location.replace(dest);
      } else {
        err.hidden = false;
        pwd.value = '';
        pwd.focus();
        // small shake
        form.classList.remove('gate-shake');
        // re-trigger animation
        void form.offsetWidth;
        form.classList.add('gate-shake');
      }
    });
  }

  // --- boot ---
  async function boot() {
    try {
      const [site, cfg] = await Promise.all([
        KL.loadJSON('data/00_site.json'),
        KL.loadJSON('data/52_notes-gate.json')
      ]);
      cache.site = site;
      cache.cfg = cfg;
      KL.state.lang = KL.getInitialLang(site.defaultLang);

      // If already unlocked, skip the form and redirect.
      if (isUnlocked(cfg.rememberDays)) {
        location.replace(getReturnTo());
        return;
      }

      // If gate is disabled in config, redirect through.
      if (cfg.enabled === false) {
        location.replace(getReturnTo());
        return;
      }

      KL.renderSite(site);
      document.title = (KL.t(cfg.title, KL.state.lang) || 'Notes') + ' · ' + (KL.t(site.title, KL.state.lang) || '');
      renderGate();
      document.dispatchEvent(new CustomEvent('content:loaded'));
    } catch (err) {
      console.error('[notes-gate] failed:', err);
      const main = document.getElementById('gateMain');
      if (main) {
        main.innerHTML =
          '<div style="padding:120px 24px;max-width:600px;margin:0 auto;">' +
            '<h1>无法加载授权配置 / Failed to load gate config</h1>' +
            '<p style="color:#888;">' + esc(err.message) + '</p>' +
          '</div>';
      }
    }
  }

  document.addEventListener('lang:changed', function () {
    if (cache.cfg) renderGate();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

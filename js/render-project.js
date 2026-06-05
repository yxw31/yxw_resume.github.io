/**
 * Kinetic Ledger — Project detail page renderer.
 *
 * Reads ?id=<project-id> from the URL, finds the matching entry in
 * data/05_projects.json, and renders the detail layout. Re-renders on
 * lang:changed without a page reload.
 */

(function () {
  'use strict';

  const KL = window.KL;
  if (!KL) {
    console.error('[project] render.js helpers not loaded.');
    return;
  }

  const esc = KL.esc;
  const escAllowBr = KL.escAllowBr;
  const t = KL.t;

  const cache = {
    site: null,
    projects: null,
    project: null
  };

  function getProjectId() {
    return new URLSearchParams(location.search).get('id');
  }

  function renderSection(s, lang) {
    if (s.type === 'list') {
      const items = (s.items || []).map(function (i) {
        return '<li>' + esc(t(i, lang)) + '</li>';
      }).join('');
      return '<h2>' + esc(t(s.heading, lang)) + '</h2><ul>' + items + '</ul>';
    }
    return '<h2>' + esc(t(s.heading, lang)) + '</h2><p>' + esc(t(s.content, lang)) + '</p>';
  }

  function renderImages(images, lang) {
    if (!images || !images.length) return '';
    const figs = images.map(function (img) {
      const captionText = t(img.caption, lang);
      const caption = captionText
        ? '<figcaption>' + esc(captionText) + '</figcaption>'
        : '';
      return (
        '<figure>' +
          '<img src="' + esc(KL.BASE + img.src) + '" alt="' + esc(captionText || '') + '" />' +
          caption +
        '</figure>'
      );
    }).join('');
    return '<div class="project-images">' + figs + '</div>';
  }

  function renderProject() {
    const p = cache.project;
    const projects = cache.projects;
    if (!p || !projects) return;

    const lang = KL.state.lang;
    const d = p.detail || {};
    const sb = d.sidebar || {};
    const sbLabels = projects.sidebarLabels || {};

    const sections = (d.sections || []).map(function (s) { return renderSection(s, lang); }).join('');
    const images = renderImages(d.images, lang);

    const sbTech = (sb.tech || []).map(function (tag) { return '<span>' + esc(t(tag, lang)) + '</span>'; }).join('');
    const sbKeys = (sb.keywords || []).map(function (k) { return '<span>' + esc(t(k, lang)) + '</span>'; }).join('');

    const titleText = t(p.title, lang);
    const brand = (cache.site && t(cache.site.title, lang)) || 'Yuan Xiuwei';
    document.title = titleText + ' | ' + brand;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', t(d.subtitle, lang) || t(p.summary, lang) || '');

    const portfolioLabel = t(projects.portfolioLabel, lang) || 'Portfolio';
    const backLabel = t(projects.backLabel, lang) || '← Back to Projects';

    const main = document.getElementById('projectMain');
    if (!main) return;

    main.innerHTML =
      '<section class="project-hero">' +
        '<nav class="breadcrumb">' +
          '<a href="' + esc(KL.BASE) + '">' + esc(portfolioLabel) + '</a>' +
          '<span>/</span>' +
          '<span>' + esc(titleText) + '</span>' +
        '</nav>' +
        '<h1>' + esc(titleText) + '</h1>' +
        '<p class="subtitle">' + esc(t(d.subtitle, lang) || t(p.summary, lang)) + '</p>' +
      '</section>' +
      '<article class="project-body">' +
        '<div class="project-content">' +
          sections +
          images +
          '<a href="' + esc(KL.BASE) + '#projects" class="back-link">' + esc(backLabel) + '</a>' +
        '</div>' +
        '<aside class="project-sidebar">' +
          (sbTech ? '<div class="sidebar-card"><h3>' + esc(t(sbLabels.tech, lang) || 'Tech') + '</h3><div class="tech-list">' + sbTech + '</div></div>' : '') +
          (sb.period ? '<div class="sidebar-card"><h3>' + esc(t(sbLabels.period, lang) || 'Period') + '</h3><p>' + esc(t(sb.period, lang)) + '</p></div>' : '') +
          (sb.results ? '<div class="sidebar-card"><h3>' + esc(t(sbLabels.results, lang) || 'Results') + '</h3><p>' + escAllowBr(t(sb.results, lang)) + '</p></div>' : '') +
          (sbKeys ? '<div class="sidebar-card"><h3>' + esc(t(sbLabels.keywords, lang) || 'Keywords') + '</h3><div class="tech-list">' + sbKeys + '</div></div>' : '') +
        '</aside>' +
      '</article>';
  }

  function renderNotFound(id) {
    const main = document.getElementById('projectMain');
    if (!main) return;
    const lang = KL.state.lang;
    const heading = lang === 'zh' ? '项目未找到' : 'Project Not Found';
    const msg = lang === 'zh'
      ? 'ID "' + esc(id || '(空)') + '" 在 data/05_projects.json 中没有匹配项。'
      : 'ID "' + esc(id || '(empty)') + '" was not found in data/05_projects.json.';
    const backLabel = lang === 'zh' ? '← 返回项目列表' : '← Back to Projects';
    main.innerHTML =
      '<section class="project-hero">' +
        '<nav class="breadcrumb">' +
          '<a href="' + esc(KL.BASE) + '">Portfolio</a>' +
          '<span>/</span>' +
          '<span>404</span>' +
        '</nav>' +
        '<h1>' + heading + '</h1>' +
        '<p class="subtitle">' + msg + '</p>' +
        '<a href="' + esc(KL.BASE) + '#projects" class="back-link" style="margin-top:24px;">' + backLabel + '</a>' +
      '</section>';
  }

  function rerenderAll() {
    if (cache.site) KL.renderSite(cache.site);
    if (cache.project) renderProject();
    else renderNotFound(getProjectId());

    // Update language toggle button label
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
      langToggle.textContent = KL.state.lang === 'zh' ? 'EN' : '中';
    }
  }

  async function boot() {
    try {
      const [site, projects] = await Promise.all([
        KL.loadJSON('data/00_site.json'),
        KL.loadJSON('data/05_projects.json')
      ]);

      cache.site = site;
      cache.projects = projects;
      cache.project = (projects.items || []).find(function (p) { return p.id === getProjectId(); }) || null;

      // Initial language: localStorage > site default
      KL.state.lang = KL.getInitialLang(site.defaultLang);

      rerenderAll();
      document.dispatchEvent(new CustomEvent('content:loaded'));
    } catch (err) {
      console.error('[project] failed:', err);
      const main = document.getElementById('projectMain');
      if (main) {
        main.innerHTML =
          '<div style="padding:120px 24px;max-width:680px;margin:0 auto;">' +
            '<h1>无法加载项目数据 / Failed to load</h1>' +
            '<p style="color:#888;">' + esc(err.message) + '</p>' +
          '</div>';
      }
    }
  }

  document.addEventListener('lang:changed', rerenderAll);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

/**
 * render-notes-list.js — Knowledge Notes index page renderer.
 *
 * Loads /data/50_notes-meta.json + /data/51_notes-index.json and renders:
 *   - hero with title / intro / live search box
 *   - category grid (6 cards with per-category note count)
 *   - recent / search-results list (filtered by query + activeTag)
 *   - tag cloud (click to filter)
 *
 * Uses helpers exposed on window.KL by render.js (esc, t, BASE, loadJSON,
 * renderSite, setLanguage, getInitialLang).
 */

(function () {
  'use strict';

  const KL = window.KL;
  if (!KL) {
    console.error('[notes-list] render.js helpers not loaded.');
    return;
  }
  const esc = KL.esc;
  const t = KL.t;

  // Small extra SVG icon set for category cards. Categories without a
  // matching key fall through to "book".
  const ICONS = {
    cpu:     '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/></svg>',
    monitor: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><path d="M8 21h8M12 17v4"/></svg>',
    brain:   '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3 2.5 2.5 0 0 1 2.46-2.04Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>',
    shield:  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>',
    wrench:  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.7-.7-.7-2.7 2.7-2.5z"/></svg>',
    book:    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    search:  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>',
    close:   '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>'
  };

  const cache = { site: null, meta: null, index: null };

  // UI state — preserved across re-renders triggered by lang/theme/search.
  const state = {
    query: '',
    activeTag: null,
    searchFocused: false,
    searchCaret: 0
  };

  function categoryOf(id) {
    if (!cache.meta || !cache.meta.categories) return null;
    return cache.meta.categories.find(function (c) { return c.id === id; });
  }

  function categoryNotes(catId) {
    if (!cache.index || !cache.index.notes) return [];
    return cache.index.notes.filter(function (n) { return n.category === catId; });
  }

  function filteredNotes() {
    if (!cache.index) return [];
    const q = state.query.trim().toLowerCase();
    const tag = state.activeTag;
    return cache.index.notes.filter(function (n) {
      if (tag && !(n.tags || []).includes(tag)) return false;
      if (!q) return true;
      const hay = (n.title + ' ' + (n.summary || '') + ' ' + (n.tags || []).join(' ') + ' ' + (n.category || '')).toLowerCase();
      return hay.split(/\s+/).every(function () { return true; }) && hay.indexOf(q) !== -1;
    });
  }

  function aggregateTags() {
    if (!cache.index) return [];
    const counts = {};
    cache.index.notes.forEach(function (n) {
      (n.tags || []).forEach(function (tg) {
        counts[tg] = (counts[tg] || 0) + 1;
      });
    });
    return Object.keys(counts).map(function (k) {
      return { tag: k, count: counts[k] };
    }).sort(function (a, b) { return b.count - a.count; });
  }

  // --- renderers ---

  function renderHero() {
    const lang = KL.state.lang;
    const meta = cache.meta || {};
    const labels = meta.labels || {};
    const title = t(meta.title, lang) || '个人知识库';
    const subtitle = t(meta.subtitle, lang) || '';
    const intro = t(meta.intro, lang) || '';
    const ph = esc(t(labels.searchPlaceholder, lang) || 'Search…');

    return (
      '<section class="notes-hero">' +
        '<div class="notes-hero-inner">' +
          '<p class="notes-eyebrow">SYS://NOTES &nbsp;·&nbsp; ' + esc(subtitle) + '</p>' +
          '<h1>' + esc(title.replace(/.$/, '')) + '<span class="accent">' + esc(title.slice(-1)) + '</span></h1>' +
          '<p class="notes-hero-sub">' + esc(intro) + '</p>' +
          '<div class="notes-search">' +
            '<span class="notes-search-icon">' + ICONS.search + '</span>' +
            '<input id="notesSearch" type="text" placeholder="' + ph + '" value="' + esc(state.query) + '" autocomplete="off" />' +
            '<button class="notes-search-clear' + (state.query || state.activeTag ? ' visible' : '') + '" id="notesSearchClear" aria-label="clear">' + ICONS.close + '</button>' +
          '</div>' +
          '<p class="notes-search-hint">' +
            (lang === 'zh' ? '按 ' : 'Press ') +
            '<kbd>/</kbd> ' + (lang === 'zh' ? '聚焦搜索' : 'to focus search') +
            (state.activeTag ? ' &nbsp;·&nbsp; ' + (lang === 'zh' ? '正在按标签筛选：' : 'Filtering tag: ') + '<strong>#' + esc(state.activeTag) + '</strong>' : '') +
          '</p>' +
        '</div>' +
      '</section>'
    );
  }

  function renderCategoryGrid() {
    const lang = KL.state.lang;
    const meta = cache.meta || {};
    const labels = meta.labels || {};
    const sectionTitle = esc(t(labels.categoriesTitle, lang) || '分类');
    const enTitle = '/ CATEGORIES';

    const cards = (meta.categories || []).map(function (c, i) {
      const ico = ICONS[c.icon] || ICONS.book;
      const notes = categoryNotes(c.id);
      const count = notes.length;
      const nameZh = esc(t(c.name, lang));
      const nameEn = c.name && c.name.en ? esc(c.name.en).toUpperCase() : '';
      const desc = esc(t(c.description, lang));
      const browseLabel = esc(t(labels.browseCategory, lang) || 'Browse →');
      const countLabel = esc(t(labels.notesCount, lang) || 'notes');
      // Clicking a category card filters the list by category (sets a virtual tag form).
      return (
        '<a href="#" class="category-card" data-category="' + esc(c.id) + '">' +
          '<div class="category-card-head">' +
            '<span class="category-card-icon">' + ico + '</span>' +
            '<div>' +
              '<div class="category-card-name">' + nameZh + '</div>' +
              (nameEn ? '<div class="category-card-name-en">' + nameEn + '</div>' : '') +
            '</div>' +
          '</div>' +
          '<p class="category-card-desc">' + desc + '</p>' +
          '<div class="category-card-foot">' +
            '<span><span class="count">' + count + '</span> ' + countLabel + '</span>' +
            '<span class="arrow">' + browseLabel + '</span>' +
          '</div>' +
        '</a>'
      );
    }).join('');

    return (
      '<section class="notes-section">' +
        '<div class="notes-section-inner">' +
          '<div class="notes-section-header">' +
            '<span class="notes-section-num">[01]</span>' +
            '<span class="notes-section-line"></span>' +
            '<span class="notes-section-title">' + sectionTitle + '</span>' +
            '<span class="notes-section-title-en">' + enTitle + '</span>' +
          '</div>' +
          '<div class="category-grid">' + cards + '</div>' +
        '</div>' +
      '</section>'
    );
  }

  function renderNoteList() {
    const lang = KL.state.lang;
    const labels = (cache.meta || {}).labels || {};
    const isSearching = !!(state.query || state.activeTag);
    const list = filteredNotes();
    const noResults = esc(t(labels.noResults, lang) || 'No matching notes.');

    const sectionTitle = isSearching
      ? (lang === 'zh' ? '搜索结果' : 'Search Results')
      : esc(t(labels.recentTitle, lang) || 'Recent Updates');
    const enTitle = isSearching ? '/ RESULTS' : '/ RECENT';

    let body;
    if (!list.length) {
      body = '<div class="notes-empty">' + noResults + '</div>';
    } else {
      body = '<ul class="note-list">' + list.map(function (n) {
        const cat = categoryOf(n.category);
        const catName = cat ? esc(t(cat.name, lang)) : esc(n.category);
        const tags = (n.tags || []).slice(0, 4).map(function (tg) {
          return '<span class="note-tag" data-tag="' + esc(tg) + '">#' + esc(tg) + '</span>';
        }).join('');
        return (
          '<li class="note-item-wrap">' +
            '<a href="note.html?id=' + encodeURIComponent(n.id) + '" class="note-item">' +
              '<span class="note-item-date">' + esc(n.updated || n.date || '') + '</span>' +
              '<div class="note-item-body">' +
                '<div class="note-item-title">' + esc(n.title) + '</div>' +
                '<div class="note-item-summary">' + esc(n.summary || '') + ' · <span style="color:var(--accent-color)">' + catName + '</span></div>' +
              '</div>' +
              '<div class="note-item-tags">' + tags + '</div>' +
            '</a>' +
          '</li>'
        );
      }).join('') + '</ul>';
    }

    return (
      '<section class="notes-section">' +
        '<div class="notes-section-inner">' +
          '<div class="notes-section-header">' +
            '<span class="notes-section-num">[02]</span>' +
            '<span class="notes-section-line"></span>' +
            '<span class="notes-section-title">' + sectionTitle + '</span>' +
            '<span class="notes-section-title-en">' + enTitle + '</span>' +
          '</div>' +
          body +
        '</div>' +
      '</section>'
    );
  }

  function renderTagCloud() {
    const lang = KL.state.lang;
    const labels = (cache.meta || {}).labels || {};
    const tags = aggregateTags();
    if (!tags.length) return '';
    const sectionTitle = esc(t(labels.tagsTitle, lang) || '标签');
    const enTitle = '/ TAGS';
    const items = tags.map(function (it) {
      const cls = state.activeTag === it.tag ? ' active' : '';
      return '<span class="note-tag' + cls + '" data-tag="' + esc(it.tag) + '">#' + esc(it.tag) + ' <small style="opacity:0.55">' + it.count + '</small></span>';
    }).join('');
    return (
      '<section class="notes-section">' +
        '<div class="notes-section-inner">' +
          '<div class="notes-section-header">' +
            '<span class="notes-section-num">[03]</span>' +
            '<span class="notes-section-line"></span>' +
            '<span class="notes-section-title">' + sectionTitle + '</span>' +
            '<span class="notes-section-title-en">' + enTitle + '</span>' +
          '</div>' +
          '<div class="tag-cloud">' + items + '</div>' +
        '</div>' +
      '</section>'
    );
  }

  function renderAll() {
    const main = document.getElementById('notesMain');
    if (!main) return;

    // Update site bits (navbar, footer, page title).
    if (cache.site) {
      KL.renderSite(cache.site);
    }
    document.title = (KL.t(cache.meta.title, KL.state.lang) || 'Knowledge Notes') + ' · ' + (KL.t(cache.site.title, KL.state.lang) || 'Yuan Xiuwei');

    main.innerHTML =
      renderHero() +
      renderCategoryGrid() +
      renderNoteList() +
      renderTagCloud();

    // --- bind interactivity post-render ---
    const searchInput = document.getElementById('notesSearch');
    const clearBtn = document.getElementById('notesSearchClear');

    if (searchInput) {
      if (state.searchFocused) {
        searchInput.focus();
        const pos = Math.min(state.searchCaret, searchInput.value.length);
        searchInput.setSelectionRange(pos, pos);
      }
      searchInput.addEventListener('focus', function () { state.searchFocused = true; });
      searchInput.addEventListener('blur', function () { state.searchFocused = false; });
      searchInput.addEventListener('input', function (e) {
        state.query = e.target.value;
        state.searchCaret = e.target.selectionStart || 0;
        renderAll();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        state.query = '';
        state.activeTag = null;
        state.searchFocused = true;
        renderAll();
      });
    }

    // Tag chips — click anywhere on a .note-tag toggles tag filter.
    main.querySelectorAll('.note-tag').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        const tg = el.getAttribute('data-tag');
        state.activeTag = (state.activeTag === tg) ? null : tg;
        renderAll();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });

    // Category card — clicking sets a category-as-pseudo-filter via tag.
    // (we filter by category id directly by treating category as a filter key.)
    main.querySelectorAll('.category-card').forEach(function (card) {
      card.addEventListener('click', function (e) {
        e.preventDefault();
        const catId = card.getAttribute('data-category');
        // Filter by category using query: prepend a synthetic token (search hits "category" field).
        state.query = catId;
        state.activeTag = null;
        renderAll();
        const list = main.querySelector('.note-list, .notes-empty');
        if (list) list.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  // --- global keyboard shortcut: "/" focuses search ---
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && !/INPUT|TEXTAREA/.test((e.target || {}).tagName || '')) {
      e.preventDefault();
      const s = document.getElementById('notesSearch');
      if (s) { s.focus(); s.select(); }
    }
  });

  // --- boot ---
  async function boot() {
    try {
      const [site, meta, index] = await Promise.all([
        KL.loadJSON('data/00_site.json'),
        KL.loadJSON('data/50_notes-meta.json'),
        KL.loadJSON('data/51_notes-index.json')
      ]);
      cache.site = site;
      cache.meta = meta;
      cache.index = index;
      KL.state.lang = KL.getInitialLang(site.defaultLang);
      renderAll();
      document.dispatchEvent(new CustomEvent('content:loaded'));
    } catch (err) {
      console.error('[notes-list] failed:', err);
      const main = document.getElementById('notesMain');
      if (main) {
        main.innerHTML =
          '<div style="padding:120px 24px;max-width:680px;margin:0 auto;">' +
            '<h1>无法加载知识库 / Failed to load notes</h1>' +
            '<p style="color:#888;">' + esc(err.message) + '</p>' +
          '</div>';
      }
    }
  }

  document.addEventListener('lang:changed', function () {
    if (cache.site) renderAll();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

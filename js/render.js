/**
 * Kinetic Ledger — Content Renderer
 *
 * Loads all JSON data from /data and renders each section of the homepage.
 * Supports zh/en switching: every text field in the JSON can be either a
 * plain string (used as-is) or a { zh, en } object.
 *
 * Dispatches `content:loaded` once initial render is done so main.js can wire
 * up interactivity. Dispatches `lang:changed` whenever the language flips.
 */

(function () {
  'use strict';

  // --- Built-in SVG icon set ---
  const ICONS = {
    monitor: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><path d="M8 21h8M12 17v4"/></svg>',
    clock:   '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
    team:    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    book:    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    award:   '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12"/></svg>',
    user:    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    cpu:     '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/></svg>',
    shield:  '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>',
    radio:   '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="2"/><path d="M4.93 19.07a10 10 0 0 1 0-14.14M7.76 16.24a6 6 0 0 1 0-8.48M16.24 7.76a6 6 0 0 1 0 8.48M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>',
    wrench:  '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.7-.7-.7-2.7 2.7-2.5z"/></svg>',
    email:   '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
    phone:   '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    mountain:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 20l6-11 4 7 3-5 5 9z"/><circle cx="17" cy="6" r="1.5" fill="currentColor" stroke="none"/></svg>',
    camera:  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',
    ball:    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg>',
    music:   '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
    coffee:  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4z"/><path d="M6 1v3M10 1v3M14 1v3"/></svg>',
    bike:    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6h3l2.5 11.5"/><path d="M5.5 17.5 11 6"/><path d="M9 6h6"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>',
    run:     '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="17" cy="4" r="1.8" fill="currentColor"/><path d="M16 21l1-6-4-3 3-5 3 3 3 1"/><path d="M9 13l-3-1 3-4"/></svg>',
    paddle:  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="10" cy="10" rx="6" ry="7" transform="rotate(-25 10 10)"/><path d="M14.5 14.5 19 19"/><circle cx="19.5" cy="4.5" r="1.4" fill="currentColor"/></svg>',
    shuttlecock: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="17" r="2.2"/><path d="M8.5 15.5 18 6"/><path d="M13 5 19 5 19 11"/><path d="M14 8 17 11"/><path d="M11 11 14 14"/></svg>',
    github:  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>',
    linkedin:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></svg>'
  };

  // --- Path / URL helpers ---
  // Subpages (anything under /projects/ or /notes/) load assets and link back
  // to the root with a "../" prefix. The homepage uses "".
  function getBase() {
    return /\/(projects|notes)\//.test(location.pathname) ? '../' : '';
  }
  const BASE = getBase();

  // Prepend BASE to relative hrefs when we're on a subpage, so nav links
  // ("#about", "notes/") resolve to the right place from any depth.
  function resolveHref(href) {
    if (!href) return href;
    if (!BASE) return href;
    if (/^(https?:|mailto:|tel:|\/)/i.test(href)) return href;
    return BASE + href;
  }

  // --- Escaping ---
  function esc(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escAllowBr(str) {
    return esc(str).replace(/&lt;br\s*\/?&gt;/gi, '<br>');
  }

  // --- i18n ---
  // Translate a value: if it's a { zh, en } object, pick the right key;
  // otherwise return as-is. Falls back to the other language if a key is
  // missing or empty.
  function t(value, lang) {
    if (value == null) return '';
    if (typeof value !== 'object' || Array.isArray(value)) return value;
    const l = lang || state.lang;
    const other = l === 'zh' ? 'en' : 'zh';
    if (value[l] != null && value[l] !== '') return value[l];
    if (value[other] != null) return value[other];
    return '';
  }

  // --- State ---
  const state = {
    lang: 'zh',
    data: null  // { site, hero, about, education, projects, skills, publications, contact }
  };

  // --- JSON loader ---
  async function loadJSON(path) {
    const url = /^https?:|^\//.test(path) ? path : BASE + path;
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error('Failed to load ' + url + ': ' + res.status);
    return res.json();
  }

  // --- Section renderers ---

  function renderSite(data) {
    const lang = state.lang;
    const title = t(data.title, lang) || 'Kinetic Ledger';
    document.title = title;

    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', t(data.description, lang));

    const htmlLang = t(data.htmlLang, lang) || (lang === 'zh' ? 'zh-CN' : 'en');
    document.documentElement.setAttribute('lang', htmlLang);

    // Apply the site default theme only on first visit (no saved preference).
    if (data.defaultTheme && !localStorage.getItem('kl-theme')) {
      const docEl = document.documentElement;
      if (!docEl.classList.contains(data.defaultTheme)) {
        docEl.classList.remove('dark', 'light');
        docEl.classList.add(data.defaultTheme);
      }
    }

    const logo = document.querySelector('[data-site="logo"]');
    if (logo) logo.textContent = data.logo || '';

    const navLinks = document.getElementById('navLinks');
    if (navLinks && Array.isArray(data.nav)) {
      navLinks.innerHTML = data.nav.map(function (n) {
        const href = resolveHref(n.href);
        const attr = BASE ? '' : ' data-nav';
        return '<a href="' + esc(href) + '"' + attr + '>' + esc(t(n.label, lang)) + '</a>';
      }).join('');
    }

    const logoLink = document.querySelector('a.nav-logo[data-site="logo"]');
    if (logoLink && BASE) logoLink.setAttribute('href', BASE);

    const footer = document.querySelector('[data-site="footer"]');
    if (footer && data.footer) {
      footer.innerHTML =
        '<p>' + esc(t(data.footer.tagline, lang)) + '</p>' +
        '<p class="footer-copy">' + esc(t(data.footer.copyright, lang)) + '</p>';
    }

    const langToggle = document.getElementById('langToggle');
    if (langToggle) langToggle.textContent = lang === 'zh' ? 'EN' : '中';
  }

  function renderHero(data) {
    const root = document.getElementById('hero');
    if (!root) return;
    const lang = state.lang;

    const cta = (data.cta || []).map(function (c) {
      const cls = c.type === 'outline' ? 'btn-outline' : 'btn-primary';
      return '<a href="' + esc(resolveHref(c.href)) + '" class="' + cls + '">' + esc(t(c.label, lang)) + '</a>';
    }).join('');

    // Resolve hero image list. Accepts either:
    //   "images": [ "...", "..." ]   (preferred — enables carousel when ≥ 2)
    //   "image":  "..."              (legacy single image)
    let heroImgs = [];
    if (Array.isArray(data.images) && data.images.length) heroImgs = data.images.slice();
    else if (data.image) heroImgs = [data.image];

    let imageBlock = '';
    if (heroImgs.length) {
      let verticals = '';
      if (data.verticals && data.verticals.items && data.verticals.items.length) {
        const items = data.verticals.items.map(function (v) {
          return '<li>' + esc(t(v, lang)) + '</li>';
        }).join('');
        const vLabel = esc(t(data.verticals.label, lang) || 'Key Verticals');
        const enLabel = lang === 'zh' ? ' / KEY VERTICALS' : '';
        verticals =
          '<div class="hero-verticals">' +
            '<p class="hero-verticals-label">' + vLabel + enLabel + '</p>' +
            '<ul>' + items + '</ul>' +
          '</div>';
      }

      const heroAlt = esc(t(data.name, lang));
      const multi = heroImgs.length > 1;

      const heroSlides = heroImgs.map(function (src, i) {
        const fullSrc = esc(BASE + src);
        const blurAttr = i === 0
          ? ' data-src="' + fullSrc + '"'
          : ' data-carousel-src="' + fullSrc + '"';
        const imageAttr = i === 0
          ? ' src="' + fullSrc + '" loading="eager" fetchpriority="high"'
          : ' data-carousel-src="' + fullSrc + '" loading="lazy"';
        return '<div class="carousel-slide' + (i === 0 ? ' active' : '') + '">' +
                 '<div class="img-blur"' + blurAttr + ' aria-hidden="true"></div>' +
                 '<img' + imageAttr + ' alt="' + heroAlt + '" decoding="async" />' +
               '</div>';
      }).join('');

      const chevL = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';
      const chevR = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';

      const navHtml = multi
        ? '<button type="button" class="carousel-nav prev" aria-label="Previous">' + chevL + '</button>' +
          '<button type="button" class="carousel-nav next" aria-label="Next">'    + chevR + '</button>'
        : '';
      const dotsHtml = multi
        ? '<div class="carousel-dots">' +
            heroImgs.map(function (_, i) {
              return '<span class="dot' + (i === 0 ? ' active' : '') + '" data-idx="' + i + '"></span>';
            }).join('') +
          '</div>'
        : '';

      imageBlock =
        '<div class="hero-image-wrap">' +
          '<div class="hero-image' + (multi ? ' has-carousel' : '') + '">' +
            '<div class="carousel-track">' + heroSlides + '</div>' +
            navHtml +
            dotsHtml +
          '</div>' +
          verticals +
        '</div>';
    }

    root.innerHTML =
      '<div class="hero-bg"></div>' +
      '<div class="hero-grid' + (imageBlock ? ' has-image' : '') + '">' +
        '<div class="hero-content">' +
          '<p class="hero-greeting">' + esc(t(data.greeting, lang)) + '</p>' +
          '<h1 class="hero-name">' + esc(t(data.name, lang)) + '</h1>' +
          '<div class="hero-title-wrapper">' +
            '<span class="hero-title">' + esc(t(data.title, lang)) + '</span>' +
            '<span class="hero-divider"></span>' +
            '<span class="hero-subtitle">' + esc(t(data.subtitle, lang)) + '</span>' +
          '</div>' +
          '<p class="hero-desc">' + esc(t(data.description, lang)) + '</p>' +
          '<div class="hero-cta">' + cta + '</div>' +
        '</div>' +
        imageBlock +
      '</div>' +
      '<div class="hero-scroll">' +
        '<span>' + (lang === 'zh' ? '向下' : 'Scroll') + '</span>' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>' +
      '</div>';

    // Wire up the hero-image carousel if multiple images were provided.
    const cfg = data.carousel || {};
    bindCarousels(root,
      '.hero-image.has-carousel',
      typeof cfg.interval === 'number' ? cfg.interval : 5000,
      cfg.pauseOnHover !== false);
  }

  function renderAbout(data) {
    const root = document.querySelector('#about .section-container');
    if (!root) return;
    const lang = state.lang;

    const paragraphs = (data.paragraphs || []).map(function (p) {
      return '<p>' + esc(t(p, lang)) + '</p>';
    }).join('');

    const info = (data.info || []).map(function (item) {
      return (
        '<div class="info-item">' +
          '<span class="info-label">' + esc(t(item.label, lang)) + '</span>' +
          '<span class="info-value">' + esc(t(item.value, lang)) + '</span>' +
        '</div>'
      );
    }).join('');

    // Avatar slot. When data.avatar is set → show the user's photo.
    // When empty → show a passport-style placeholder so the slot is obviously
    // "drop your photo here" rather than just an empty grey box.
    const hasAvatar = !!data.avatar;
    const avatarSrc = hasAvatar ? esc(data.avatar) : esc(BASE + 'images/placeholder-avatar.svg');
    const avatarHintZh = '点这里放证件照';
    const avatarHintEn = 'Drop your photo here';
    const avatarHint = lang === 'zh' ? avatarHintZh : avatarHintEn;
    const avatarBlock =
      '<div class="about-avatar' + (hasAvatar ? ' has-photo' : ' no-photo') + '">' +
        '<div class="avatar-frame">' +
          '<img src="' + avatarSrc + '" alt="' + esc(t(data.sectionTitle, lang) || 'Avatar') + '" loading="lazy" decoding="async" />' +
          (hasAvatar ? '' : '<span class="avatar-hint">' + esc(avatarHint) + '</span>') +
        '</div>' +
      '</div>';

    root.innerHTML =
      '<h2 class="section-title"><span class="accent">01.</span> ' + esc(t(data.sectionTitle, lang) || 'About Me') + '</h2>' +
      '<div class="about-grid">' +
        '<div class="about-text">' +
          paragraphs +
          '<div class="about-info">' + info + '</div>' +
        '</div>' +
        avatarBlock +
      '</div>';
  }

  // Generic timeline renderer — used by Education, Experience, and Activities.
  // Each item supports: school, period, degree, description (paragraph) and/or
  // bullets (array of points), and tags.
  function renderTimeline(selector, data, num, fallback) {
    const root = document.querySelector(selector);
    if (!root) return;
    const lang = state.lang;

    const items = (data.items || []).map(function (item) {
      const tags = (item.tags && item.tags.length)
        ? '<div class="timeline-tags">' + item.tags.map(function (tg) { return '<span>' + esc(t(tg, lang)) + '</span>'; }).join('') + '</div>'
        : '';
      const degree = item.degree
        ? '<p class="timeline-degree">' + esc(t(item.degree, lang)) + '</p>'
        : '';
      let body = '';
      if (item.bullets && item.bullets.length) {
        body = '<ul class="timeline-bullets">' + item.bullets.map(function (b) {
          return '<li>' + esc(t(b, lang)) + '</li>';
        }).join('') + '</ul>';
      } else if (item.description) {
        body = '<p class="timeline-desc">' + esc(t(item.description, lang)) + '</p>';
      }
      return (
        '<div class="timeline-item">' +
          '<div class="timeline-dot"></div>' +
          '<div class="timeline-content card">' +
            '<div class="timeline-header">' +
              '<h3>' + esc(t(item.school, lang)) + '</h3>' +
              '<span class="timeline-period">' + esc(t(item.period, lang)) + '</span>' +
            '</div>' +
            degree +
            body +
            tags +
          '</div>' +
        '</div>'
      );
    }).join('');

    let banner = '';
    if (data.banner && data.banner.image) {
      const b = data.banner;
      const eyebrow = b.eyebrow ? '<p class="timeline-banner-eyebrow">' + esc(t(b.eyebrow, lang)) + '</p>' : '';
      const bTitle = b.title ? '<h3 class="timeline-banner-title">' + esc(t(b.title, lang)) + '</h3>' : '';
      const bSrc = esc(BASE + b.image);
      banner =
        '<div class="timeline-banner">' +
          '<div class="img-blur" data-lazy-src="' + bSrc + '" aria-hidden="true"></div>' +
          '<img src="' + bSrc + '" alt="' + esc(t(b.title, lang) || '') + '" loading="lazy" decoding="async" />' +
          '<div class="timeline-banner-overlay">' + eyebrow + bTitle + '</div>' +
        '</div>';
    }

    root.innerHTML =
      '<h2 class="section-title"><span class="accent">' + num + '</span> ' + esc(t(data.sectionTitle, lang) || fallback) + '</h2>' +
      '<div class="timeline">' + items + '</div>' +
      banner;
  }

  function renderLife(data) {
    const root = document.querySelector('#life .section-container');
    if (!root || !data) return;
    const lang = state.lang;

    const intro = data.intro || {};
    const info = (data.info || []).map(function (item) {
      return (
        '<div class="life-row">' +
          '<span class="life-row-key">' + esc(t(item.label, lang)) + '</span>' +
          '<span class="life-row-val">' + esc(t(item.value, lang)) + '</span>' +
        '</div>'
      );
    }).join('');

    const hobbies = (data.hobbies || []).map(function (h) {
      const ico = ICONS[h.icon] || ICONS.user;
      return '<span class="life-hobby" title="' + esc(t(h.label, lang)) + '">' + ico + '</span>';
    }).join('');

    const chevL =
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';
    const chevR =
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';

    const photos = (data.photos || []).map(function (p) {
      const ico = p.icon ? '<span class="life-photo-icon">' + (ICONS[p.icon] || '') + '</span>' : '';
      // Accept either `images: [...]` array or legacy `src: "..."` single image.
      let imgList = [];
      if (Array.isArray(p.images) && p.images.length) imgList = p.images.slice();
      else if (p.src) imgList = [p.src];
      if (!imgList.length) return '';

      const altText = esc(t(p.title, lang) || '');
      const multi = imgList.length > 1;
      const slides = imgList.map(function (src, i) {
        const fullSrc = esc(BASE + src);
        const blurAttr = multi
          ? ' data-carousel-src="' + fullSrc + '"'
          : ' data-lazy-src="' + fullSrc + '"';
        const imageAttr = multi
          ? ' data-carousel-src="' + fullSrc + '"'
          : ' src="' + fullSrc + '"';
        return '<div class="carousel-slide' + (i === 0 ? ' active' : '') + '">' +
                 '<div class="img-blur"' + blurAttr + ' aria-hidden="true"></div>' +
                 '<img' + imageAttr + ' alt="' + altText + '" loading="lazy" decoding="async" />' +
               '</div>';
      }).join('');

      const navHtml = multi
        ? '<button type="button" class="carousel-nav prev" aria-label="Previous">' + chevL + '</button>' +
          '<button type="button" class="carousel-nav next" aria-label="Next">' + chevR + '</button>'
        : '';
      const dotsHtml = multi
        ? '<div class="carousel-dots">' +
            imgList.map(function (_, i) {
              return '<span class="dot' + (i === 0 ? ' active' : '') + '" data-idx="' + i + '"></span>';
            }).join('') +
          '</div>'
        : '';

      return (
        '<figure class="life-photo' + (multi ? ' has-carousel' : '') + '">' +
          '<div class="carousel-track">' + slides + '</div>' +
          navHtml +
          dotsHtml +
          '<figcaption class="life-photo-cap">' +
            '<span class="life-photo-title">' + ico + esc(t(p.title, lang)) + '</span>' +
            (p.description ? '<span class="life-photo-desc">' + esc(t(p.description, lang)) + '</span>' : '') +
          '</figcaption>' +
        '</figure>'
      );
    }).join('');

    // Optional bottom banner — used to be on Activities, moved here because
    // a "moments of life" wide image fits this section's tone better.
    let bannerHtml = '';
    if (data.banner && data.banner.image) {
      const b = data.banner;
      const eyebrow = b.eyebrow
        ? '<p class="timeline-banner-eyebrow">' + esc(t(b.eyebrow, lang)) + '</p>'
        : '';
      const bTitle = b.title
        ? '<h3 class="timeline-banner-title">' + esc(t(b.title, lang)) + '</h3>'
        : '';
      const lbSrc = esc(BASE + b.image);
      bannerHtml =
        '<div class="timeline-banner life-banner">' +
          '<div class="img-blur" data-lazy-src="' + lbSrc + '" aria-hidden="true"></div>' +
          '<img src="' + lbSrc + '" alt="' + esc(t(b.title, lang) || '') + '" loading="lazy" decoding="async" />' +
          '<div class="timeline-banner-overlay">' + eyebrow + bTitle + '</div>' +
        '</div>';
    }

    root.innerHTML =
      '<h2 class="section-title"><span class="accent">08.</span> ' + esc(t(data.sectionTitle, lang) || 'Personal Life') + '</h2>' +
      '<div class="life-grid">' +
        '<div class="life-text">' +
          (intro.title ? '<h3 class="life-intro-title">' + esc(t(intro.title, lang)) + '</h3>' : '') +
          (intro.paragraph ? '<p class="life-intro-desc">' + esc(t(intro.paragraph, lang)) + '</p>' : '') +
          (info ? '<div class="life-info">' + info + '</div>' : '') +
          (hobbies ? '<div class="life-hobbies">' + hobbies + '</div>' : '') +
        '</div>' +
        '<div class="life-photos">' + photos + '</div>' +
      '</div>' +
      bannerHtml;

    // Wire up auto-play + manual navigation for any multi-image photos.
    const cfg = data.carousel || {};
    bindCarousels(root,
      '.life-photo.has-carousel',
      typeof cfg.interval === 'number' ? cfg.interval : 5000,
      cfg.pauseOnHover !== false);
  }

  // --- Generic image-carousel ---
  // Reused by both the hero image and the life-photo grid. Each container
  // matched by `containerSelector` must contain:
  //   .carousel-slide  (the slides, with `.active` on the visible one)
  //   .carousel-nav.prev / .carousel-nav.next  (optional)
  //   .carousel-dots .dot  (optional)
  // Auto-rotates on `interval` ms; hover pauses if `pauseOnHover` is truthy.
  // Timers are tracked globally so a re-render (e.g. on language toggle)
  // doesn't leak intervals.
  const _carouselTimers = new Map();   // containerEl → timer
  const _carouselObservers = new Map(); // containerEl → IntersectionObserver

  function clearCarousels(scope) {
    _carouselTimers.forEach(function (t, el) {
      if (!scope || scope.contains(el) || scope === el) {
        clearInterval(t);
        _carouselTimers.delete(el);
      }
    });
    _carouselObservers.forEach(function (observer, el) {
      if (!scope || scope.contains(el) || scope === el) {
        observer.disconnect();
        _carouselObservers.delete(el);
      }
    });
  }

  function hydrateCarouselSlide(slide) {
    if (!slide) return;

    const image = slide.querySelector('img[data-carousel-src]');
    if (image) {
      const src = image.getAttribute('data-carousel-src');
      if (src) image.setAttribute('src', src);
      image.removeAttribute('data-carousel-src');
    }

    const blur = slide.querySelector('.img-blur[data-carousel-src]');
    if (blur) {
      const src = blur.getAttribute('data-carousel-src');
      if (src) blur.style.backgroundImage = 'url("' + src + '")';
      blur.removeAttribute('data-carousel-src');
    }
  }

  function bindCarousels(root, containerSelector, interval, pauseOnHover) {
    // First clear any carousel timers inside the scope being re-rendered.
    clearCarousels(root);

    root.querySelectorAll(containerSelector).forEach(function (containerEl) {
      const slides  = containerEl.querySelectorAll('.carousel-slide');
      const dots    = containerEl.querySelectorAll('.carousel-dots .dot');
      const prevBtn = containerEl.querySelector('.carousel-nav.prev');
      const nextBtn = containerEl.querySelector('.carousel-nav.next');
      if (slides.length <= 1) {
        hydrateCarouselSlide(slides[0]);
        return;
      }

      let current = 0;
      let timer = null;
      let activated = false;

      function setActive(idx) {
        current = (idx + slides.length) % slides.length;
        hydrateCarouselSlide(slides[current]);
        slides.forEach(function (s, i) { s.classList.toggle('active', i === current); });
        dots.forEach(function (d, i)   { d.classList.toggle('active', i === current); });
        // Preload only the next slide so transitions remain smooth without
        // downloading the entire carousel on first paint.
        setTimeout(function () {
          hydrateCarouselSlide(slides[(current + 1) % slides.length]);
        }, 300);
      }
      function step()  { setActive(current + 1); }
      function back()  { setActive(current - 1); }

      function startTimer() {
        if (!activated) return;
        stopTimer();
        timer = setInterval(step, interval);
        _carouselTimers.set(containerEl, timer);
      }
      function stopTimer() {
        if (!timer) return;
        clearInterval(timer);
        _carouselTimers.delete(containerEl);
        timer = null;
      }

      function activate() {
        if (activated) return;
        activated = true;
        setActive(0);
        startTimer();
      }

      if (prevBtn) prevBtn.addEventListener('click', function (e) { e.preventDefault(); activate(); back(); startTimer(); });
      if (nextBtn) nextBtn.addEventListener('click', function (e) { e.preventDefault(); activate(); step(); startTimer(); });
      dots.forEach(function (d, i) {
        d.addEventListener('click', function (e) { e.preventDefault(); activate(); setActive(i); startTimer(); });
      });

      if (pauseOnHover) {
        containerEl.addEventListener('mouseenter', stopTimer);
        containerEl.addEventListener('mouseleave', startTimer);
      }

      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(function (entries) {
          if (entries.some(function (entry) { return entry.isIntersecting; })) {
            activate();
            observer.disconnect();
            _carouselObservers.delete(containerEl);
          }
        }, { rootMargin: '320px 0px' });
        observer.observe(containerEl);
        _carouselObservers.set(containerEl, observer);
      } else {
        activate();
      }
    });
  }

  function renderProjects(data) {
    const root = document.querySelector('#projects .section-container');
    if (!root) return;
    const lang = state.lang;
    const viewDetail = t(data.viewDetail, lang) || 'View Detail →';

    const cards = (data.items || []).map(function (p, i) {
      const icon = ICONS[p.icon] || ICONS.monitor;
      const idx = '[' + String(i + 1).padStart(2, '0') + ']';
      const coverSrc = esc(p.cover || 'images/placeholder.svg');
      const cover =
        '<div class="project-cover">' +
          '<div class="img-blur" data-lazy-src="' + coverSrc + '" aria-hidden="true"></div>' +
          '<img src="' + coverSrc + '" alt="' + esc(t(p.title, lang)) + '" loading="lazy" decoding="async" />' +
          '<span class="project-index">' + esc(idx) + '</span>' +
        '</div>';
      const tech = (p.tech || []).map(function (tag) { return '<span>' + esc(t(tag, lang)) + '</span>'; }).join('');
      return (
        '<a href="projects/project.html?id=' + encodeURIComponent(p.id) + '" class="project-card card">' +
          cover +
          '<div class="project-card-body">' +
            '<div class="project-icon">' + icon + '</div>' +
            '<h3>' + esc(t(p.title, lang)) + '</h3>' +
            '<p>' + esc(t(p.summary, lang)) + '</p>' +
            '<div class="project-tech">' + tech + '</div>' +
            '<span class="project-link">' + esc(viewDetail) + '</span>' +
          '</div>' +
        '</a>'
      );
    }).join('');

    root.innerHTML =
      '<h2 class="section-title"><span class="accent">04.</span> ' + esc(t(data.sectionTitle, lang) || 'Projects') + '</h2>' +
      '<div class="projects-grid">' + cards + '</div>';
  }

  function renderSkills(data) {
    const root = document.querySelector('#skills .section-container');
    if (!root) return;
    const lang = state.lang;

    const cats = (data.categories || []).map(function (cat) {
      const tags = (cat.skills || []).map(function (s) {
        return '<span class="skill-tag">' + esc(t(s, lang)) + '</span>';
      }).join('');
      return (
        '<div class="skill-category card">' +
          '<h3>' + esc(t(cat.name, lang)) + '</h3>' +
          '<div class="skill-tags">' + tags + '</div>' +
        '</div>'
      );
    }).join('');

    root.innerHTML =
      '<h2 class="section-title"><span class="accent">06.</span> ' + esc(t(data.sectionTitle, lang) || 'Skills') + '</h2>' +
      '<div class="skills-grid">' + cats + '</div>';
  }

  function renderPublications(data) {
    const root = document.querySelector('#publications .section-container');
    if (!root) return;
    const lang = state.lang;
    const sub = data.subsectionTitles || {};
    const labels = data.labels || {};

    const pubs = (data.publications || []).map(function (p) {
      const labelText = t(labels[p.type], lang) || p.type;
      return (
        '<li class="pub-item card">' +
          '<span class="pub-tag ' + esc(p.type) + '">' + esc(labelText) + '</span>' +
          '<div>' +
            '<p class="pub-title">' + esc(t(p.title, lang)) + '</p>' +
            '<p class="pub-meta">' + esc(t(p.meta, lang)) + '</p>' +
          '</div>' +
        '</li>'
      );
    }).join('');

    const awards = (data.awards || []).map(function (a) {
      return (
        '<li class="award-item card">' +
          '<span class="award-year">' + esc(t(a.year, lang)) + '</span>' +
          '<div>' +
            '<p class="award-title">' + esc(t(a.title, lang)) + '</p>' +
            '<p class="award-meta">' + esc(t(a.meta, lang)) + '</p>' +
          '</div>' +
        '</li>'
      );
    }).join('');

    root.innerHTML =
      '<h2 class="section-title"><span class="accent">07.</span> ' + esc(t(data.sectionTitle, lang) || 'Publications & Awards') + '</h2>' +
      '<div class="pub-awards-grid">' +
        '<div class="pub-list">' +
          '<h3 class="subsection-title">' + ICONS.book + ' ' + esc(t(sub.publications, lang) || 'Publications & Patents') + '</h3>' +
          '<ul class="pub-items">' + pubs + '</ul>' +
        '</div>' +
        '<div class="award-list">' +
          '<h3 class="subsection-title">' + ICONS.award + ' ' + esc(t(sub.awards, lang) || 'Awards & Honors') + '</h3>' +
          '<ul class="award-items">' + awards + '</ul>' +
        '</div>' +
      '</div>';
  }

  function renderContact(data) {
    const root = document.querySelector('#contact .section-container');
    if (!root) return;
    const lang = state.lang;

    const links = (data.links || []).map(function (l) {
      const icon = ICONS[l.type] || ICONS.email;
      const value = t(l.label, lang);
      const kindLabel = l.type === 'phone'
        ? (lang === 'zh' ? '电话' : 'phone number')
        : (lang === 'zh' ? '邮箱' : 'email address');
      const hint = lang === 'zh' ? '点击复制' : 'Click to copy';
      return (
        '<button type="button" class="contact-link contact-copy card"' +
          ' data-copy-contact="' + esc(value) + '"' +
          ' data-copy-kind="' + esc(l.type || 'text') + '"' +
          ' aria-label="' + esc((lang === 'zh' ? '复制' : 'Copy ') + kindLabel + '：' + value) + '">' +
          icon +
          '<span class="contact-copy-content">' +
            '<span class="contact-copy-value">' + esc(value) + '</span>' +
            '<span class="contact-copy-hint">' + esc(hint) + '</span>' +
          '</span>' +
        '</button>'
      );
    }).join('');

    const cta = data.cta || {};
    root.innerHTML =
      '<h2 class="section-title"><span class="accent">09.</span> ' + esc(t(data.sectionTitle, lang) || 'Contact') + '</h2>' +
      '<div class="contact-grid">' +
        '<div class="contact-info">' +
          '<p class="contact-intro">' + esc(t(data.intro, lang)) + '</p>' +
          '<div class="contact-links">' + links + '</div>' +
        '</div>' +
        '<div class="contact-cta card">' +
          '<h3>' + esc(t(cta.title, lang)) + '</h3>' +
          '<p>' + esc(t(cta.description, lang)) + '</p>' +
          '<a href="' + esc(cta.buttonHref || '#') + '" class="btn-primary">' + esc(t(cta.buttonLabel, lang)) + '</a>' +
        '</div>' +
      '</div>';
  }

  let copyToastTimer = null;

  function showCopyToast(message, isError) {
    let toast = document.getElementById('copyToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'copyToast';
      toast.className = 'copy-toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.toggle('is-error', Boolean(isError));
    toast.classList.remove('is-visible');
    void toast.offsetWidth;
    toast.classList.add('is-visible');

    clearTimeout(copyToastTimer);
    copyToastTimer = setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 2200);
  }

  function legacyCopyText(value) {
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, value.length);
    const copied = document.execCommand('copy');
    textarea.remove();
    if (!copied) throw new Error('document.execCommand("copy") failed');
  }

  async function copyContactValue(value) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return;
    }
    legacyCopyText(value);
  }

  document.addEventListener('click', function (event) {
    const button = event.target.closest('[data-copy-contact]');
    if (!button) return;

    const value = button.getAttribute('data-copy-contact') || '';
    const kind = button.getAttribute('data-copy-kind');
    const lang = state.lang;
    const kindLabel = kind === 'phone'
      ? (lang === 'zh' ? '电话' : 'Phone number')
      : (lang === 'zh' ? '邮箱' : 'Email address');

    copyContactValue(value).then(function () {
      showCopyToast(
        lang === 'zh'
          ? kindLabel + '已复制到剪贴板'
          : kindLabel + ' copied to clipboard',
        false
      );
    }).catch(function (err) {
      console.error('[contact] copy failed:', err);
      showCopyToast(
        lang === 'zh'
          ? '复制失败，请手动复制'
          : 'Copy failed. Please copy it manually.',
        true
      );
    });
  });

  // --- Top-level render (homepage) ---
  function renderHome() {
    const d = state.data;
    if (!d) return;
    renderSite(d.site);
    renderHero(d.hero);
    renderAbout(d.about);
    renderTimeline('#education .section-container', d.education, '02.', 'Education');
    renderTimeline('#experience .section-container', d.experience, '03.', 'Experience');
    renderProjects(d.projects);
    renderTimeline('#activities .section-container', d.activities, '05.', 'Student Activities');
    renderSkills(d.skills);
    renderPublications(d.publications);
    renderLife(d.life);
    renderContact(d.contact);
    applyBlurBackdrops(document);
  }

  // --- Blurred-backdrop helper ---
  // For each `<div class="img-blur" data-src="...">` in the tree, sets a
  // background-image from data-src. We use data-src instead of inline style
  // to avoid HTML-escape headaches when paths contain quotes / spaces.
  let _blurObserver = null;

  function applyBlurBackdrops(root) {
    (root || document).querySelectorAll('.img-blur[data-src]').forEach(function (el) {
      const src = el.getAttribute('data-src');
      if (src && !el.style.backgroundImage) {
        el.style.backgroundImage = 'url("' + src + '")';
      }
    });

    if (_blurObserver) _blurObserver.disconnect();
    const lazyBlurs = (root || document).querySelectorAll('.img-blur[data-lazy-src]');
    function loadBlur(el) {
      const src = el.getAttribute('data-lazy-src');
      if (src) el.style.backgroundImage = 'url("' + src + '")';
      el.removeAttribute('data-lazy-src');
    }

    if (!('IntersectionObserver' in window)) {
      lazyBlurs.forEach(loadBlur);
      return;
    }

    _blurObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        loadBlur(entry.target);
        _blurObserver.unobserve(entry.target);
      });
    }, { rootMargin: '320px 0px' });
    lazyBlurs.forEach(function (el) { _blurObserver.observe(el); });
  }

  // --- Language switching ---
  function setLanguage(lang) {
    if (lang !== 'zh' && lang !== 'en') return;
    if (lang === state.lang) return;
    state.lang = lang;
    localStorage.setItem('kl-lang', lang);

    // Re-render whichever page we're on. Sub-pages register their own handler
    // via the `lang:changed` event below.
    if (state.data && document.getElementById('hero')) {
      renderHome();
    }
    document.dispatchEvent(new CustomEvent('lang:changed', { detail: { lang: lang } }));
  }

  function getInitialLang(siteDefault) {
    const saved = localStorage.getItem('kl-lang');
    if (saved === 'zh' || saved === 'en') return saved;
    if (siteDefault === 'zh' || siteDefault === 'en') return siteDefault;
    return 'zh';
  }

  // --- Homepage boot ---
  async function renderAll() {
    try {
      const [site, hero, about, edu, experience, projects, activities, skills, pubs, life, contact] = await Promise.all([
        loadJSON('data/00_site.json'),
        loadJSON('data/01_hero.json'),
        loadJSON('data/02_about.json'),
        loadJSON('data/03_education.json'),
        loadJSON('data/04_experience.json'),
        loadJSON('data/05_projects.json'),
        loadJSON('data/06_activities.json'),
        loadJSON('data/07_skills.json'),
        loadJSON('data/08_publications.json'),
        loadJSON('data/09_life.json'),
        loadJSON('data/10_contact.json')
      ]);

      state.data = {
        site: site, hero: hero, about: about, education: edu,
        experience: experience, projects: projects, activities: activities,
        skills: skills, publications: pubs, life: life, contact: contact
      };
      state.lang = getInitialLang(site.defaultLang);

      renderHome();
      document.dispatchEvent(new CustomEvent('content:loaded'));
    } catch (err) {
      console.error('[render] failed:', err);
      const main = document.querySelector('main');
      if (main) {
        main.innerHTML =
          '<div style="padding:120px 24px;max-width:680px;margin:0 auto;font-family:system-ui;">' +
            '<h1 style="font-size:1.5rem;margin-bottom:12px;">无法加载页面数据 / Failed to load data</h1>' +
            '<p style="color:#888;line-height:1.6;">' + esc(err.message) + '</p>' +
            '<p style="color:#888;line-height:1.6;margin-top:12px;">' +
              '本站通过 fetch 加载本地 JSON，需要 HTTP 服务器。请运行：' +
            '</p>' +
            '<pre style="background:#1a1a1a;color:#ddd;padding:12px;border-radius:6px;margin-top:8px;font-size:13px;">python -m http.server 8000</pre>' +
          '</div>';
      }
    }
  }

  function boot() {
    if (document.getElementById('hero')) renderAll();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // --- Public API ---
  window.KL = window.KL || {};
  window.KL.BASE = BASE;
  window.KL.state = state;
  window.KL.loadJSON = loadJSON;
  window.KL.esc = esc;
  window.KL.escAllowBr = escAllowBr;
  window.KL.resolveHref = resolveHref;
  window.KL.ICONS = ICONS;
  window.KL.t = t;
  window.KL.renderSite = renderSite;
  window.KL.setLanguage = setLanguage;
  window.KL.getInitialLang = getInitialLang;
})();

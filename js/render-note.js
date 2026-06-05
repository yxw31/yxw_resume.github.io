/**
 * render-note.js — Single-note (Markdown) renderer.
 *
 * Fetches notes/content/<id>.md, parses frontmatter, renders the body with
 * marked + highlight.js + KaTeX, and wires up:
 *   - auto TOC + scroll-spy
 *   - code-copy buttons
 *   - image lightbox
 *   - reading-progress bar
 *   - prev / next / related navigation
 *
 * Depends on globals provided by note.html:
 *   - marked            (markdown parser)
 *   - hljs              (highlight.js)
 *   - renderMathInElement (KaTeX auto-render)
 *   - window.KL         (helpers from render.js)
 */

(function () {
  'use strict';

  const KL = window.KL;
  if (!KL) {
    console.error('[note] render.js helpers not loaded.');
    return;
  }
  const esc = KL.esc;
  const t = KL.t;

  const ICONS = {
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
    clock:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
    text:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7V5h16v2M9 19h6M12 5v14"/></svg>',
    update:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/></svg>'
  };

  const cache = { site: null, meta: null, index: null, note: null, md: '' };

  function getId() {
    return new URLSearchParams(location.search).get('id') || '';
  }

  // --- frontmatter parser (mirror of build-notes.js) ---
  function parseFrontmatter(src) {
    const m = src.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
    if (!m) return { data: {}, body: src };
    const yaml = m[1];
    const body = src.slice(m[0].length);
    const data = {};
    yaml.split(/\r?\n/).forEach(function (line) {
      if (!line.trim() || line.trim().startsWith('#')) return;
      const idx = line.indexOf(':');
      if (idx === -1) return;
      const key = line.slice(0, idx).trim();
      let val = line.slice(idx + 1).trim();
      if (val.startsWith('[') && val.endsWith(']')) {
        val = val.slice(1, -1).split(',').map(function (s) {
          return s.trim().replace(/^['"]|['"]$/g, '');
        }).filter(Boolean);
      } else {
        val = val.replace(/^['"]|['"]$/g, '');
      }
      data[key] = val;
    });
    return { data: data, body: body };
  }

  // --- preserve $...$ and $$...$$ from marked, so KaTeX can render them ---
  function extractMath(md) {
    const blocks = [];
    const escaped = md
      .replace(/\$\$([\s\S]+?)\$\$/g, function (_m, p1) {
        blocks.push({ display: true, content: p1 });
        return '@@KATEXBLOCK' + (blocks.length - 1) + '@@';
      })
      .replace(/(^|[^\\])\$([^\$\n]+?)\$/g, function (_m, prefix, p1) {
        blocks.push({ display: false, content: p1 });
        return prefix + '@@KATEXINLINE' + (blocks.length - 1) + '@@';
      });
    return { processed: escaped, blocks: blocks };
  }

  function restoreMath(html, blocks) {
    return html
      .replace(/@@KATEXBLOCK(\d+)@@/g, function (_m, i) {
        return '$$' + blocks[+i].content + '$$';
      })
      .replace(/@@KATEXINLINE(\d+)@@/g, function (_m, i) {
        return '$' + blocks[+i].content + '$';
      });
  }

  // --- stats: word count + reading time ---
  function countWords(text) {
    // strip code fences first
    const stripped = text.replace(/```[\s\S]*?```/g, '').replace(/`[^`]+`/g, '');
    const cjk = (stripped.match(/[一-鿿]/g) || []).length;
    const en = (stripped.match(/[A-Za-z]+(?:['-][A-Za-z]+)*/g) || []).length;
    return cjk + en;
  }

  function readingMinutes(words) {
    // Mixed-language reading speed: ~350 cjk chars/min + ~200 en words/min,
    // but we already collapsed to "tokens". Use ~280 tokens / min average.
    return Math.max(1, Math.round(words / 280));
  }

  // --- slug for heading ids ---
  function slugify(s) {
    return String(s).toLowerCase()
      .replace(/[^\w一-鿿 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  // --- pick prev / next from index (by updated desc, sorted as in index) ---
  function neighbors(currentId) {
    if (!cache.index) return { prev: null, next: null };
    const list = cache.index.notes;
    const i = list.findIndex(function (n) { return n.id === currentId; });
    if (i === -1) return { prev: null, next: null };
    // "next" = newer note above (i-1), "prev" = older note below (i+1)
    return {
      next: i > 0 ? list[i - 1] : null,
      prev: i < list.length - 1 ? list[i + 1] : null
    };
  }

  function relatedNotes(note, max) {
    if (!cache.index) return [];
    const tagSet = new Set(note.tags || []);
    return cache.index.notes
      .filter(function (n) { return n.id !== note.id; })
      .map(function (n) {
        let score = 0;
        if (n.category === note.category) score += 2;
        (n.tags || []).forEach(function (t2) { if (tagSet.has(t2)) score += 1; });
        return { note: n, score: score };
      })
      .filter(function (x) { return x.score > 0; })
      .sort(function (a, b) { return b.score - a.score; })
      .slice(0, max || 3)
      .map(function (x) { return x.note; });
  }

  // --- main render ---
  async function renderCurrent() {
    const lang = KL.state.lang;
    const main = document.getElementById('noteMain');
    if (!main) return;

    if (cache.site) KL.renderSite(cache.site);

    const id = getId();
    const note = (cache.index.notes || []).find(function (n) { return n.id === id; });
    if (!note) {
      main.innerHTML = renderNotFound(id);
      return;
    }
    cache.note = note;

    // fetch the .md (relative to /notes/)
    const url = (KL.BASE || '') + 'notes/' + note.path;
    let md = '';
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      md = await res.text();
    } catch (err) {
      main.innerHTML = renderError(err);
      return;
    }
    cache.md = md;

    const fm = parseFrontmatter(md);
    const body = fm.body;

    // 1) extract math to placeholders
    const extracted = extractMath(body);

    // 2) marked -> HTML
    const htmlRaw = marked.parse(extracted.processed, { gfm: true, breaks: false });

    // 3) restore math
    const html = restoreMath(htmlRaw, extracted.blocks);

    // 4) page title
    document.title = note.title + ' · ' + (t(cache.meta.title, lang) || 'Notes');

    // 5) compose layout
    const meta = cache.meta || {};
    const labels = meta.labels || {};
    const cat = (meta.categories || []).find(function (c) { return c.id === note.category; }) || null;
    const catName = cat ? esc(t(cat.name, lang)) : esc(note.category);
    const homeLabel = esc(t(meta.title, lang) || 'Notes');
    const words = countWords(body);
    const mins = readingMinutes(words);

    const meta1 = '<span class="meta-item">' + ICONS.calendar + '<span>' + (t(labels.publishedOn, lang) || '') + ' ' + esc(note.date || '') + '</span></span>';
    const meta2 = note.updated && note.updated !== note.date
      ? '<span class="meta-item">' + ICONS.update + '<span>' + (t(labels.updatedOn, lang) || '') + ' ' + esc(note.updated) + '</span></span>'
      : '';
    const meta3 = '<span class="meta-item">' + ICONS.clock + '<span>' + mins + ' ' + (t(labels.readingTime, lang) || 'min') + '</span></span>';
    const meta4 = '<span class="meta-item">' + ICONS.text + '<span>' + words + ' ' + (t(labels.wordsCount, lang) || 'words') + '</span></span>';

    const tagsRow = (note.tags || []).map(function (tg) {
      return '<a class="note-tag" href="./?tag=' + encodeURIComponent(tg) + '">#' + esc(tg) + '</a>';
    }).join('');

    const nb = neighbors(id);
    const prevLabel = esc(t(labels.prev, lang) || 'Previous');
    const nextLabel = esc(t(labels.next, lang) || 'Next');
    const prevHtml = nb.prev
      ? '<a class="prev" href="note.html?id=' + encodeURIComponent(nb.prev.id) + '">' +
          '<div class="label">← ' + prevLabel + '</div>' +
          '<div class="ttl">' + esc(nb.prev.title) + '</div>' +
        '</a>'
      : '<a class="prev placeholder"><div class="label">← ' + prevLabel + '</div><div class="ttl">—</div></a>';
    const nextHtml = nb.next
      ? '<a class="next" href="note.html?id=' + encodeURIComponent(nb.next.id) + '">' +
          '<div class="label">' + nextLabel + ' →</div>' +
          '<div class="ttl">' + esc(nb.next.title) + '</div>' +
        '</a>'
      : '<a class="next placeholder"><div class="label">' + nextLabel + ' →</div><div class="ttl">—</div></a>';

    const related = relatedNotes(note, 4);
    const relatedTitle = esc(t(labels.related, lang) || 'Related');
    const relatedHtml = related.length
      ? '<div class="note-related">' +
          '<div class="note-related-title">' + relatedTitle + ' / RELATED</div>' +
          '<ul class="note-list">' + related.map(function (n) {
            return '<li><a href="note.html?id=' + encodeURIComponent(n.id) + '" class="note-item">' +
              '<span class="note-item-date">' + esc(n.updated || n.date || '') + '</span>' +
              '<div class="note-item-body">' +
                '<div class="note-item-title">' + esc(n.title) + '</div>' +
                '<div class="note-item-summary">' + esc(n.summary || '') + '</div>' +
              '</div>' +
              '<div class="note-item-tags"></div>' +
            '</a></li>';
          }).join('') + '</ul>' +
        '</div>'
      : '';

    main.innerHTML =
      '<div class="note-page">' +
        '<article class="note-article">' +
          '<nav class="breadcrumb">' +
            '<a href="./">' + homeLabel + '</a>' +
            '<span class="sep">/</span>' +
            '<a href="./?cat=' + encodeURIComponent(note.category) + '">' + catName + '</a>' +
            '<span class="sep">/</span>' +
            '<span>' + esc(note.title) + '</span>' +
          '</nav>' +
          '<h1 class="note-title">' + esc(note.title) + '</h1>' +
          '<div class="note-meta">' + meta1 + meta2 + meta3 + meta4 + '</div>' +
          '<div class="note-tags-row">' + tagsRow + '</div>' +
          '<div class="note-content" id="noteContent">' + html + '</div>' +
          '<div class="note-bottom-nav">' + prevHtml + nextHtml + '</div>' +
          relatedHtml +
        '</article>' +
        '<aside class="note-toc" id="noteToc"></aside>' +
      '</div>';

    // --- post-render enhancements ---
    enhance();
  }

  function enhance() {
    const content = document.getElementById('noteContent');
    if (!content) return;

    // 1) add heading ids + build TOC
    const tocItems = [];
    content.querySelectorAll('h2, h3').forEach(function (h) {
      const id = slugify(h.textContent || '');
      if (id) h.id = id;
      tocItems.push({ level: h.tagName === 'H3' ? 3 : 2, text: h.textContent || '', id: id });
    });
    const toc = document.getElementById('noteToc');
    const lang = KL.state.lang;
    const labels = (cache.meta || {}).labels || {};
    if (toc) {
      if (tocItems.length) {
        toc.innerHTML =
          '<div class="note-toc-title">' + esc(t(labels.tocTitle, lang) || 'CONTENTS') + ' / TOC</div>' +
          '<ul>' + tocItems.map(function (it) {
            return '<li class="level-' + it.level + '"><a href="#' + esc(it.id) + '" data-id="' + esc(it.id) + '">' + esc(it.text) + '</a></li>';
          }).join('') + '</ul>';
      } else {
        toc.innerHTML = '';
      }
    }

    // 2) syntax highlighting
    if (window.hljs) {
      content.querySelectorAll('pre code').forEach(function (block) {
        try { window.hljs.highlightElement(block); } catch (e) { /* ignore */ }
      });
    }

    // 3) code copy buttons
    const copyLabel = esc(t(labels.copyCode, lang) || 'Copy');
    const copiedLabel = esc(t(labels.copied, lang) || 'Copied');
    content.querySelectorAll('pre').forEach(function (pre) {
      const btn = document.createElement('button');
      btn.className = 'code-copy';
      btn.type = 'button';
      btn.textContent = copyLabel;
      btn.addEventListener('click', function () {
        const code = pre.querySelector('code');
        const text = code ? code.textContent : pre.textContent;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text).then(function () {
            btn.textContent = copiedLabel;
            btn.classList.add('copied');
            setTimeout(function () {
              btn.textContent = copyLabel;
              btn.classList.remove('copied');
            }, 1400);
          });
        }
      });
      pre.appendChild(btn);
    });

    // 4) image lightbox
    const lightbox = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightboxImg');
    if (lightbox && lbImg) {
      content.querySelectorAll('img').forEach(function (img) {
        img.addEventListener('click', function () {
          lbImg.src = img.src;
          lbImg.alt = img.alt || '';
          lightbox.classList.add('open');
        });
      });
      lightbox.addEventListener('click', function () { lightbox.classList.remove('open'); });
    }

    // 5) KaTeX render
    if (window.renderMathInElement) {
      try {
        window.renderMathInElement(content, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\(', right: '\\)', display: false },
            { left: '\\[', right: '\\]', display: true }
          ],
          throwOnError: false,
          ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
        });
      } catch (e) { console.warn('[note] KaTeX render failed:', e); }
    } else {
      // KaTeX may still be loading (defer). Retry once it's ready.
      const tryAgain = function () {
        if (window.renderMathInElement) {
          window.renderMathInElement(content, {
            delimiters: [
              { left: '$$', right: '$$', display: true },
              { left: '$', right: '$', display: false }
            ],
            throwOnError: false,
            ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
          });
        } else {
          setTimeout(tryAgain, 120);
        }
      };
      setTimeout(tryAgain, 120);
    }

    // 6) reading-progress bar
    const bar = document.getElementById('noteProgress');
    if (bar) {
      const onScroll = function () {
        const article = document.querySelector('.note-article');
        if (!article) return;
        const total = article.offsetHeight - window.innerHeight + 200;
        const progressed = Math.max(0, window.scrollY - article.offsetTop + 200);
        const pct = Math.min(100, Math.max(0, (progressed / total) * 100));
        bar.style.width = pct + '%';
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    // 7) TOC scroll-spy
    const tocLinks = toc ? toc.querySelectorAll('a[data-id]') : [];
    if (tocLinks.length) {
      const headings = Array.from(content.querySelectorAll('h2, h3'));
      const onScroll = function () {
        const offset = 110;
        let activeId = null;
        for (let i = 0; i < headings.length; i++) {
          const rect = headings[i].getBoundingClientRect();
          if (rect.top <= offset) activeId = headings[i].id;
          else break;
        }
        tocLinks.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('data-id') === activeId);
        });
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    // 8) sync hljs theme with site theme
    syncHljsTheme();
    const obs = new MutationObserver(syncHljsTheme);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  }

  function syncHljsTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    const light = document.getElementById('hljs-light');
    const dark = document.getElementById('hljs-dark');
    if (light) light.disabled = isDark;
    if (dark) dark.disabled = !isDark;
  }

  function renderNotFound(id) {
    const lang = KL.state.lang;
    const heading = lang === 'zh' ? '笔记未找到' : 'Note not found';
    const msg = lang === 'zh' ? '没有 id 为 "' + esc(id) + '" 的笔记。' : 'No note with id "' + esc(id) + '".';
    return (
      '<div class="note-page">' +
        '<article class="note-article">' +
          '<nav class="breadcrumb"><a href="./">Notes</a><span class="sep">/</span><span>404</span></nav>' +
          '<h1 class="note-title">' + heading + '</h1>' +
          '<p style="color:var(--muted-fg)">' + msg + '</p>' +
          '<p><a href="./" class="btn-outline" style="margin-top:24px">← ' + (lang === 'zh' ? '返回知识库' : 'Back to notes') + '</a></p>' +
        '</article>' +
      '</div>'
    );
  }

  function renderError(err) {
    return (
      '<div style="padding:120px 24px;max-width:680px;margin:0 auto;">' +
        '<h1>加载失败 / Failed to load</h1>' +
        '<p style="color:#888;">' + esc(err.message) + '</p>' +
      '</div>'
    );
  }

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
      await renderCurrent();
      document.dispatchEvent(new CustomEvent('content:loaded'));
    } catch (err) {
      console.error('[note] failed:', err);
      const main = document.getElementById('noteMain');
      if (main) main.innerHTML = renderError(err);
    }
  }

  document.addEventListener('lang:changed', function () {
    if (cache.site && cache.note) renderCurrent();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

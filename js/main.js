/**
 * Kinetic Ledger — Main JavaScript
 * Theme toggle, language toggle, mobile menu, scrollspy, reveal animations.
 *
 * Splits into:
 *   - initStatic(): runs once. Binds buttons/handlers on elements that stay.
 *   - initDynamic(): runs on each render. Re-binds against re-rendered DOM.
 *
 * Runs after render.js dispatches `content:loaded`. Re-runs the dynamic half
 * after `lang:changed` (since language switching re-builds nav + sections).
 */

(function () {
  'use strict';

  let sections = [];   // [{ el, a }] used by scrollspy
  let revealObserver = null;
  let navbarRef = null;

  function initStatic() {
    const navLinks = document.getElementById('navLinks');
    const menuToggle = document.getElementById('menuToggle');
    const themeToggle = document.getElementById('themeToggle');
    const langToggle = document.getElementById('langToggle');
    const html = document.documentElement;
    navbarRef = document.getElementById('navbar');

    // --- Theme Toggle (restore saved preference, then bind) ---
    const savedTheme = localStorage.getItem('kl-theme');
    if (savedTheme === 'light') {
      html.classList.remove('dark');
      html.classList.add('light');
    } else if (savedTheme === 'dark') {
      html.classList.remove('light');
      html.classList.add('dark');
    }

    if (themeToggle) {
      themeToggle.addEventListener('click', function () {
        if (html.classList.contains('dark')) {
          html.classList.remove('dark');
          html.classList.add('light');
          localStorage.setItem('kl-theme', 'light');
        } else {
          html.classList.remove('light');
          html.classList.add('dark');
          localStorage.setItem('kl-theme', 'dark');
        }
      });
    }

    // --- Language Toggle ---
    if (langToggle && window.KL && window.KL.setLanguage) {
      langToggle.addEventListener('click', function () {
        const next = (window.KL.state.lang === 'zh') ? 'en' : 'zh';
        window.KL.setLanguage(next);
      });
    }

    // --- Mobile Menu Toggle (menuToggle is static; nav links are dynamic) ---
    if (menuToggle && navLinks) {
      menuToggle.addEventListener('click', function () {
        const isOpen = navLinks.classList.toggle('open');
        menuToggle.classList.toggle('open', isOpen);
      });
    }

    // --- Throttled scroll handler ---
    let ticking = false;
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(function () {
          updateActiveNav();
          updateNavbar();
          ticking = false;
        });
        ticking = true;
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Re-bind anything that points at re-rendered DOM. Safe to call repeatedly.
  function initDynamic() {
    const navLinks = document.getElementById('navLinks');
    const menuToggle = document.getElementById('menuToggle');

    // Close mobile menu when clicking a freshly-rendered nav link.
    if (navLinks) {
      navLinks.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          navLinks.classList.remove('open');
          if (menuToggle) menuToggle.classList.remove('open');
        });
      });
    }

    // Rebuild scrollspy section map.
    sections = [];
    const navAs = navLinks ? navLinks.querySelectorAll('a[data-nav]') : [];
    navAs.forEach(function (a) {
      const id = a.getAttribute('href').replace(/^.*#/, '');
      const el = document.getElementById(id);
      if (el) sections.push({ el: el, a: a });
    });

    // Reveal observer: tear down old, observe newly-rendered targets.
    if (revealObserver) revealObserver.disconnect();
    const targets = document.querySelectorAll(
      '.section-title, .card, .timeline-item, .skill-category, .pub-item, .award-item, .contact-link, .about-text p'
    );
    targets.forEach(function (el) {
      el.classList.add('reveal');
      el.classList.remove('visible');
    });
    revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    targets.forEach(function (el) { revealObserver.observe(el); });

    updateActiveNav();
    updateNavbar();
  }

  function updateActiveNav() {
    if (!sections.length || !navbarRef) return;
    const scrollY = window.scrollY + navbarRef.offsetHeight + 60;
    let active = null;
    sections.forEach(function (s) {
      if (s.el.offsetTop <= scrollY) active = s.a;
    });
    sections.forEach(function (s) { s.a.classList.remove('active'); });
    if (active) active.classList.add('active');
  }

  function updateNavbar() {
    if (!navbarRef) return;
    if (window.scrollY > 50) {
      navbarRef.style.boxShadow = '0 1px 3px rgba(0,0,0,0.3)';
    } else {
      navbarRef.style.boxShadow = 'none';
    }
  }

  // --- Wire to renderer events ---
  let staticDone = false;
  function ensureStatic() {
    if (staticDone) return;
    staticDone = true;
    initStatic();
  }

  document.addEventListener('content:loaded', function () {
    ensureStatic();
    initDynamic();
  });

  // After a language switch, the renderer rebuilds the DOM. Re-bind handlers.
  document.addEventListener('lang:changed', function () {
    initDynamic();
  });

  // Safety fallback: pages without the renderer (or where it failed) should
  // still get static handlers wired up.
  setTimeout(function () {
    ensureStatic();
    initDynamic();
  }, 2000);
})();

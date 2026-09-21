// Khondokar Yuvraz — Portfolio Scripts
// Theme toggle · mobile menu · contact form (Formspree, AJAX) · project filters · scroll-reveal
//
// Note: the saved/OS theme is applied by a tiny inline script in <head> (index.html)
// so the page never flashes the wrong theme. This file only keeps the toggle in sync.

(() => {
  'use strict';

  const THEME_KEY = 'yuvraz-theme';
  const root = document.documentElement;
  const byId = (id) => document.getElementById(id);

  /* ------------------------------------------------------------------ Theme */
  function initTheme() {
    const toggle = byId('themeToggle');
    const iconSun = byId('iconSun');
    const iconMoon = byId('iconMoon');
    if (!toggle || !iconSun || !iconMoon) return;

    const applyTheme = (theme) => {
      const isDark = theme === 'dark';
      if (isDark) root.setAttribute('data-theme', 'dark');
      else root.removeAttribute('data-theme');
      iconSun.style.display = isDark ? 'none' : 'block';
      iconMoon.style.display = isDark ? 'block' : 'none';
    };

    // Sync icons with whatever the <head> script already applied.
    applyTheme(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

    toggle.addEventListener('click', () => {
      const next =
        root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (e) {
        /* storage unavailable */
      }
    });
  }

  /* ------------------------------------------------------------ Mobile menu */
  function initMobileMenu() {
    const menuBtn = byId('menuBtn');
    const mobileMenu = byId('mobileMenu');
    if (!menuBtn || !mobileMenu) return;

    const setOpen = (open) => {
      mobileMenu.classList.toggle('open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
    };

    menuBtn.addEventListener('click', () =>
      setOpen(!mobileMenu.classList.contains('open')),
    );
    mobileMenu
      .querySelectorAll('a')
      .forEach((a) => a.addEventListener('click', () => setOpen(false)));
  }

  /* ----------------------------------------------- Contact form (Formspree) */
  function initContactForm() {
    const form = byId('contactForm');
    const submitBtn = byId('submitBtn');
    const note = byId('formNote');
    if (!form || !submitBtn || !note) return;

    const idleLabel = submitBtn.textContent;
    const FALLBACK_ERROR = 'Submission failed. Please try again.';

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
        });

        if (response.ok) {
          note.textContent =
            'Thank you! Your message has been sent successfully.';
          note.style.color = 'var(--brass)';
          form.reset();
        } else {
          // The error body is not guaranteed to be JSON; never let parsing mask the real failure.
          let message = FALLBACK_ERROR;
          try {
            const data = await response.json();
            const detail = data.errors?.map((err) => err.message).join(', ');
            if (detail) message = detail;
          } catch (parseError) {
            /* keep fallback */
          }
          note.textContent = message;
          note.style.color = '';
        }
      } catch (networkError) {
        note.textContent = 'Network error. Please try again later.';
        note.style.color = '';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = idleLabel;
      }
    });
  }

  /* --------------------------------------------------------- Project filter */
  function initProjectFilters() {
    const buttons = document.querySelectorAll('.project-filter');
    const cards = document.querySelectorAll('.proj-card[data-category]');
    if (!buttons.length || !cards.length) return;

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const selected = button.dataset.filter;

        buttons.forEach((item) => {
          const isActive = item === button;
          item.classList.toggle('active', isActive);
          item.setAttribute('aria-pressed', String(isActive));
        });

        cards.forEach((card) => {
          const matches =
            selected === 'all' || card.dataset.category === selected;
          card.style.display = matches ? '' : 'none';
        });
      });
    });
  }

  /* ------------------------------------------------------------ Scroll reveal */
  function initScrollReveal() {
    if (!('IntersectionObserver' in window)) return; // leave content visible
    const targets = document.querySelectorAll(
      '.t-item, .proj-card, .svc-card, .badge-tile, .cert-card, .quote-card, .edu-row',
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15 },
    );

    targets.forEach((el) => {
      el.classList.add('reveal'); // initial hidden state lives in styles.css
      observer.observe(el);
    });
  }

  initTheme();
  initMobileMenu();
  initContactForm();
  initProjectFilters();
  initScrollReveal();
})();

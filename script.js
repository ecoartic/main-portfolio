/* ============================================================
   BEHRANG.XYZ — JavaScript
   Language Switch · Accordion · Works Filter · Reveal · Nav
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ---- Language Switcher ---- */
  const langBtns = document.querySelectorAll('.lang-btn');
  const html = document.documentElement;

  function setLang(lang) {
    html.setAttribute('data-lang', lang);
    html.setAttribute('lang', lang);

    // Update all data-lang text nodes
    document.querySelectorAll('[data-' + lang + ']').forEach(function (el) {
      const val = el.getAttribute('data-' + lang);
      if (val) {
        // For inputs, update placeholder
        if (el.tagName === 'INPUT') {
          el.placeholder = val;
        } else {
          el.textContent = val;
        }
      }
    });

    // RTL toggle
    document.body.style.direction = lang === 'fa' ? 'rtl' : 'ltr';
    document.body.style.fontFamily = lang === 'fa'
      ? "'Vazirmatn', sans-serif"
      : "'DM Sans', sans-serif";

    // Active button
    langBtns.forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    // Save
    localStorage.setItem('bx-lang', lang);
  }

  langBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setLang(btn.getAttribute('data-lang'));
    });
  });

  // Restore saved language
  const saved = localStorage.getItem('bx-lang');
  if (saved) setLang(saved);


  /* ---- Hamburger / Mobile Menu ---- */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  hamburger.addEventListener('click', function () {
    mobileMenu.classList.toggle('open');
  });

  window.closeMobile = function () {
    mobileMenu.classList.remove('open');
  };


  /* ---- Sticky Nav scroll style ---- */
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', function () {
    nav.style.borderBottomColor = window.scrollY > 60
      ? 'rgba(255,255,255,0.1)'
      : 'rgba(255,255,255,0.07)';
  }, { passive: true });


  /* ---- Accordion ---- */
  document.querySelectorAll('.acc-trigger').forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      const item = trigger.closest('.acc-item');
      const isOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.acc-item').forEach(function (i) {
        i.classList.remove('open');
      });

      // Open clicked (if was closed)
      if (!isOpen) item.classList.add('open');
    });
  });

  // Open first by default
  const first = document.querySelector('.acc-item');
  if (first) first.classList.add('open');


  /* ---- Works Filter ---- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const workCards = document.querySelectorAll('.work-card');

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      workCards.forEach(function (card) {
        if (filter === 'all' || card.getAttribute('data-category') === filter) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });


  /* ---- Scroll Reveal ---- */
  const reveals = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry, i) {
      if (entry.isIntersecting) {
        // Stagger delay based on sibling index
        const siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal'));
        const idx = siblings.indexOf(entry.target);
        entry.target.style.transitionDelay = (idx * 0.07) + 's';
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  reveals.forEach(function (el) { revealObserver.observe(el); });


  /* ---- Quick Prompts (Avatar placeholder) ---- */
  const chatInput = document.getElementById('chatInput');
  const chatSend = document.getElementById('chatSend');

  document.querySelectorAll('.prompt-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      chatInput.value = btn.textContent;
      chatInput.focus();
    });
  });

  chatSend.addEventListener('click', function () {
    const val = chatInput.value.trim();
    if (!val) return;
    // Placeholder — وقتی ElevenLabs Agent وصل شد اینجا integrate می‌شه
    chatInput.value = '';
    chatInput.placeholder = 'AI Avatar coming soon — ElevenLabs integration pending';
    setTimeout(function () {
      chatInput.placeholder = 'Ask a question...';
    }, 3000);
  });

  chatInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') chatSend.click();
  });

});

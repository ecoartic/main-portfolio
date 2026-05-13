/* ============================================================
   BEHRANG.XYZ — script.js
   Dynamic JSON loader + Lang Switch + Accordion + Filter + Reveal
   ============================================================ */

(function () {
  'use strict';

  /* ---- State ---- */
  let currentLang = localStorage.getItem('bx-lang') || 'en';
  let projectsData = [];

  /* ============================================================
     1. LANGUAGE SWITCHER
     ============================================================ */
  function applyLang(lang) {
    currentLang = lang;
    document.documentElement.setAttribute('data-lang', lang);
    document.documentElement.setAttribute('lang', lang);

    // Update all [data-XX] text elements
    document.querySelectorAll('[data-' + lang + ']').forEach(function (el) {
      const val = el.getAttribute('data-' + lang);
      if (!val) return;
      if (el.tagName === 'INPUT') {
        el.placeholder = val;
      } else {
        el.textContent = val;
      }
    });

    // RTL / font
    if (lang === 'fa') {
      document.body.style.direction = 'rtl';
      document.body.style.fontFamily = "'Vazirmatn', sans-serif";
    } else {
      document.body.style.direction = 'ltr';
      document.body.style.fontFamily = "'DM Sans', sans-serif";
    }

    // Active button
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    localStorage.setItem('bx-lang', lang);

    // Re-render projects in new language
    if (projectsData.length) renderProjects(projectsData, currentFilter);
  }

  document.querySelectorAll('.lang-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyLang(btn.getAttribute('data-lang'));
    });
  });

  /* ============================================================
     2. NAV — hamburger + scroll style
     ============================================================ */
  const nav = document.getElementById('nav');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  window.closeMobile = function () {
    if (mobileMenu) mobileMenu.classList.remove('open');
  };

  window.addEventListener('scroll', function () {
    if (!nav) return;
    nav.style.borderBottomColor = window.scrollY > 60
      ? 'rgba(255,255,255,0.12)'
      : 'rgba(255,255,255,0.07)';
  }, { passive: true });

  /* ============================================================
     3. ACCORDION
     ============================================================ */
  document.querySelectorAll('.acc-trigger').forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      const item = trigger.closest('.acc-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.acc-item').forEach(function (i) {
        i.classList.remove('open');
      });
      if (!isOpen) item.classList.add('open');
    });
  });

  // Open first by default
  const firstAcc = document.querySelector('.acc-item');
  if (firstAcc) firstAcc.classList.add('open');

  /* ============================================================
     4. WORKS — fetch JSON + render + filter
     ============================================================ */
  let currentFilter = 'all';
  const worksGrid = document.querySelector('.works-grid');

  function getCategoryLabel(cat) {
    const map = {
      unreal: 'Unreal Engine',
      ai: 'AI Generative',
      vp: 'Virtual Production',
      arvr: 'AR / VR',
      '3dgs': '3DGS',
      motion: 'Motion Design'
    };
    return map[cat] || cat;
  }

  function getTitle(item) {
    return item['title_' + currentLang] || item.title_en || '';
  }

  function getDesc(item) {
    return item['desc_' + currentLang] || item.desc_en || '';
  }

  function buildCard(item) {
    const hidden = (currentFilter !== 'all' && item.category !== currentFilter) ? ' hidden' : '';
    const thumb = item.thumbnail
      ? '<img src="' + item.thumbnail + '" alt="' + getTitle(item) + '" loading="lazy" style="width:100%;height:100%;object-fit:cover;">'
      : '';
    const link = item.video_url || '#';

    return '<a href="' + link + '" class="work-card reveal' + hidden + '" data-category="' + item.category + '"' +
      (item.video_url ? ' target="_blank" rel="noopener"' : '') + '>' +
      '<div class="work-thumb">' +
      '<div class="work-thumb-bg" style="background:linear-gradient(135deg,#1a1a1a,#0a0a0a)">' +
      thumb +
      '<span class="work-cat-badge">' + getCategoryLabel(item.category) + '</span>' +
      '</div></div>' +
      '<div class="work-info">' +
      '<h3>' + getTitle(item) + '</h3>' +
      '<p>' + getDesc(item) + '</p>' +
      '</div></a>';
  }

  function renderProjects(items, filter) {
    if (!worksGrid) return;
    currentFilter = filter || 'all';

    // Sort by order
    const sorted = items.slice().sort(function (a, b) {
      return (a.order || 0) - (b.order || 0);
    });

    worksGrid.innerHTML = sorted.map(buildCard).join('');

    // Re-observe for reveal
    worksGrid.querySelectorAll('.reveal').forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  function loadProjects() {
    fetch('/_data/projects.json?v=' + Date.now())
      .then(function (r) { return r.json(); })
      .then(function (data) {
        // Support both {items:[]} and flat [] formats
        projectsData = Array.isArray(data) ? data : (data.items || []);
        renderProjects(projectsData, currentFilter);
      })
      .catch(function () {
        // Fallback: keep static HTML if JSON fails
        console.warn('BEHRANG: Could not load projects.json — using static HTML');
      });
  }

  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.filter-btn').forEach(function (b) {
        b.classList.remove('active');
      });
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-filter');

      if (projectsData.length) {
        renderProjects(projectsData, currentFilter);
      } else {
        // Static fallback filter
        document.querySelectorAll('.work-card').forEach(function (card) {
          if (currentFilter === 'all' || card.getAttribute('data-category') === currentFilter) {
            card.classList.remove('hidden');
          } else {
            card.classList.add('hidden');
          }
        });
      }
    });
  });

  /* ============================================================
     5. SCROLL REVEAL
     ============================================================ */
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      const siblings = Array.from(
        entry.target.closest('section, .about-grid, .accordion, .works-grid, .avatar-grid') 
          ? entry.target.parentElement.querySelectorAll('.reveal')
          : [entry.target]
      );
      const idx = siblings.indexOf(entry.target);
      entry.target.style.transitionDelay = Math.min(idx * 0.07, 0.4) + 's';
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(function (el) {
    revealObserver.observe(el);
  });

  /* ============================================================
     6. AVATAR CHAT — placeholder
     ============================================================ */
  const chatInput = document.getElementById('chatInput');
  const chatSend = document.getElementById('chatSend');

  if (chatInput && chatSend) {
    document.querySelectorAll('.prompt-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        chatInput.value = btn.textContent.trim();
        chatInput.focus();
      });
    });

    function sendChat() {
      const val = chatInput.value.trim();
      if (!val) return;
      chatInput.value = '';
      const original = chatInput.placeholder;
      chatInput.placeholder = 'ElevenLabs AI Agent — coming soon...';
      setTimeout(function () {
        chatInput.placeholder = original;
      }, 3000);
    }

    chatSend.addEventListener('click', sendChat);
    chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') sendChat();
    });
  }

  /* ============================================================
     7. INIT
     ============================================================ */
  applyLang(currentLang);
  loadProjects();

})();

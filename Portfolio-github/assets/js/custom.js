/* custom.js — small UX helpers for the refreshed portfolio */
(function () {
  "use strict";

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // ---------- Shared image viewer (home page + project page) ----------
  // window.Gallery.open(screens, index) — screens: [{ img, title, text }]
  window.Gallery = (function () {
    var el = document.createElement('div');
    el.className = 'viewer'; el.id = 'viewer'; el.hidden = true;
    el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'ดูภาพหน้าจอ');
    el.innerHTML =
      '<div class="viewer-bar"><span class="viewer-count"></span><span class="viewer-project"></span>' +
        '<button type="button" class="viewer-close"><i class="bi bi-x"></i> ปิด</button></div>' +
      '<div class="viewer-stage">' +
        '<button type="button" class="viewer-nav viewer-prev" aria-label="ภาพก่อนหน้า"><i class="bi bi-arrow-left"></i><span>ก่อนหน้า</span></button>' +
        '<img class="viewer-img" src="" alt="">' +
        '<button type="button" class="viewer-nav viewer-next" aria-label="ภาพถัดไป"><span>ถัดไป</span><i class="bi bi-arrow-right"></i></button>' +
      '</div>' +
      '<div class="viewer-caption"><h3 class="viewer-title"></h3><p class="viewer-text"></p>' +
        '<p class="viewer-hint">ใช้ปุ่มลูกศร ← → บนคีย์บอร์ด หรือปัดซ้าย/ขวาบนมือถือ เพื่อเลื่อนดูภาพ</p></div>';
    document.body.appendChild(el);
    var q = function (c) { return el.querySelector(c); };
    var list = [], cur = 0, lastFocus = null;
    function show(i) {
      if (!list.length) return;
      cur = (i + list.length) % list.length;
      var s = list[cur];
      q('.viewer-img').src = s.img; q('.viewer-img').alt = s.title;
      q('.viewer-title').textContent = String(cur + 1).padStart(2, '0') + ' · ' + s.title;
      q('.viewer-text').textContent = s.text || '';
      q('.viewer-count').textContent = (cur + 1) + ' / ' + list.length;
      q('.viewer-prev').disabled = q('.viewer-next').disabled = list.length < 2;
    }
    function open(screens, i, projectTitle) {
      list = screens || []; if (!list.length) return;
      lastFocus = document.activeElement;
      q('.viewer-project').textContent = projectTitle || '';
      show(i || 0); el.hidden = false; document.body.classList.add('viewer-open'); q('.viewer-close').focus();
    }
    function close() {
      if (el.hidden) return;
      el.hidden = true; document.body.classList.remove('viewer-open'); if (lastFocus) lastFocus.focus();
    }
    q('.viewer-prev').addEventListener('click', function () { show(cur - 1); });
    q('.viewer-next').addEventListener('click', function () { show(cur + 1); });
    q('.viewer-close').addEventListener('click', close);
    el.addEventListener('click', function (e) { if (e.target === el || e.target.classList.contains('viewer-stage')) close(); });
    document.addEventListener('keydown', function (e) {
      if (el.hidden) return;
      if (e.key === 'Escape') close(); else if (e.key === 'ArrowLeft') show(cur - 1); else if (e.key === 'ArrowRight') show(cur + 1);
    });
    var tx = null;
    el.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
    el.addEventListener('touchend', function (e) {
      if (tx === null) return; var dx = e.changedTouches[0].clientX - tx; tx = null;
      if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
    });
    return { open: open, close: close };
  })();

  // ---------- Projects showcase on the home page (data: assets/js/projects.js) ----------
  // Every project is shown in full while scrolling; images open in the viewer above.
  var FILTERS = [
    ['all', 'ทั้งหมด'], ['work', 'งานจริง'], ['web', 'เว็บแอป'], ['ai', 'AI'], ['mobile', 'แอปมือถือ'], ['design', 'ออกแบบ UI']
  ];
  function showcase(p, i) {
    var url = 'project.html#' + encodeURIComponent(p.id);
    var screens = p.screens || [];
    var meta = [p.role, p.platform].filter(Boolean).map(esc).join(' · ');
    var tech = (p.tech || []).slice(0, 6);
    var points = (p.highlights || []).slice(0, 3);
    var main = p.phoneScreens
      ? '<div class="sc-phones">' + screens.slice(0, 3).map(function (s, k) {
          return '<button type="button" class="sc-shot" data-p="' + i + '" data-i="' + k + '"><img src="' + esc(s.img) + '" alt="' + esc(s.title) + '" loading="lazy"><span>' + esc(s.title) + '</span></button>';
        }).join('') + '</div>'
      : '<button type="button" class="sc-main" data-p="' + i + '" data-i="0">' +
          '<img src="' + esc(p.cover || (screens[0] && screens[0].img) || '') + '" alt="' + esc(p.title) + '" loading="lazy"' + (p.coverPosition ? ' style="object-position:' + esc(p.coverPosition) + '"' : '') + '>' +
          '<span class="sc-zoom"><i class="bi bi-arrows-fullscreen"></i> กดดูภาพใหญ่</span></button>';
    var strip = screens.length > 1
      ? '<div class="sc-strip" aria-label="ภาพหน้าจอทั้งหมด">' + screens.map(function (s, k) {
          return '<button type="button" class="sc-thumb" data-p="' + i + '" data-i="' + k + '" title="' + esc(s.title) + '">' +
            '<img src="' + esc(s.img) + '" alt="" loading="lazy"><span>' + String(k + 1).padStart(2, '0') + ' ' + esc(s.title) + '</span></button>';
        }).join('') + '</div>'
      : '';
    return '<article class="showcase' + (i % 2 ? ' flip' : '') + '" id="work-' + esc(p.id) + '" data-cats="' + esc((p.categories || []).join(' ')) + '" data-aos="fade-up">' +
      '<div class="sc-info">' +
        '<div class="sc-top"><span class="sc-num">' + String(i + 1).padStart(2, '0') + '</span>' +
          (p.badge ? '<span class="badge-work"><i class="bi bi-briefcase"></i> ' + esc(p.badge) + '</span>' : '') +
          p.tags.slice(0, 3).map(function (t) { return '<span class="sc-tag">' + esc(t) + '</span>'; }).join('') + '</div>' +
        '<h3>' + esc(p.title) + '</h3>' +
        '<p class="sc-summary">' + esc(p.summary) + '</p>' +
        (meta ? '<p class="sc-meta"><i class="bi bi-person-workspace"></i> ' + meta + '</p>' : '') +
        (points.length ? '<ul class="sc-points">' + points.map(function (h) { return '<li>' + esc(h) + '</li>'; }).join('') + '</ul>' : '') +
        (tech.length ? '<div class="chips sc-tech">' + tech.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div>' : '') +
        '<a class="sc-more" href="' + url + '">ดูรายละเอียดทั้งหมด <i class="bi bi-arrow-right"></i></a>' +
      '</div>' +
      '<div class="sc-media">' + main + strip +
        (screens.length ? '<p class="sc-hint"><i class="bi bi-images"></i> ' + screens.length + ' ภาพ · กดที่ภาพเพื่อดูขนาดใหญ่พร้อมคำอธิบาย</p>' : '') +
      '</div>' +
    '</article>';
  }
  var list = document.getElementById('project-list');
  var filterBar = document.getElementById('project-filters');
  if (list && window.PROJECTS) {
    var P = window.PROJECTS;
    list.innerHTML = P.map(showcase).join('');
    list.addEventListener('click', function (e) {
      var b = e.target.closest('[data-p]'); if (!b) return;
      var p = P[+b.getAttribute('data-p')];
      window.Gallery.open(p.screens, +b.getAttribute('data-i'), p.title);
    });
    if (filterBar) {
      filterBar.innerHTML = FILTERS.map(function (f, k) {
        var count = f[0] === 'all' ? P.length : P.filter(function (p) { return (p.categories || []).indexOf(f[0]) > -1; }).length;
        if (!count) return '';
        return '<button type="button" class="chip-filter' + (k === 0 ? ' active' : '') + '" data-filter="' + f[0] + '" aria-pressed="' + (k === 0) + '">' +
          f[1] + ' <span>' + count + '</span></button>';
      }).join('');
      filterBar.addEventListener('click', function (e) {
        var btn = e.target.closest('.chip-filter'); if (!btn) return;
        var key = btn.getAttribute('data-filter');
        filterBar.querySelectorAll('.chip-filter').forEach(function (x) {
          var on = x === btn; x.classList.toggle('active', on); x.setAttribute('aria-pressed', on);
        });
        var n = 0;
        list.querySelectorAll('.showcase').forEach(function (art) {
          var show = key === 'all' || (' ' + art.getAttribute('data-cats') + ' ').indexOf(' ' + key + ' ') > -1;
          art.classList.toggle('d-none', !show);
          if (show) { art.classList.toggle('flip', n % 2 === 1); n++; }
        });
        var top = document.getElementById('portfolio').getBoundingClientRect().top + window.scrollY;
        if (window.scrollY > top + 200) window.scrollTo({ top: top + 40, behavior: 'smooth' });
      });
    }
  }

  // Mobile menu toggle: also works with keyboard (Enter / Space)
  var toggle = document.querySelector('.mobile-nav-toggle');
  if (toggle) {
    toggle.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle.click(); }
    });
  }

  // Copy e-mail button in the footer
  var copyBtn = document.getElementById('copy-email');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var email = copyBtn.getAttribute('data-email'), label = copyBtn.querySelector('span');
      function done(ok) {
        label.textContent = ok ? 'คัดลอกแล้ว ✓' : email;
        copyBtn.classList.toggle('copied', ok);
        setTimeout(function () { label.textContent = 'คัดลอกอีเมล'; copyBtn.classList.remove('copied'); }, 2500);
      }
      try {
        navigator.clipboard.writeText(email).then(function () { done(true); }, function () { done(false); });
      } catch (e) { done(false); }
    });
  }

  // Keep sticky elements just below the header, whatever its height on this screen
  function setHeaderH() {
    var h = document.getElementById('header');
    if (h) document.documentElement.style.setProperty('--header-h', h.getBoundingClientRect().height + 'px');
  }
  setHeaderH(); window.addEventListener('resize', setHeaderH); window.addEventListener('load', setHeaderH);

  // Footer year
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Contact form: validate, then open the visitor's email app (works on any static host, no PHP needed)
  var RECEIVER = 'anupong.niyo@gmail.com';
  var form = document.getElementById('contact-form');
  if (!form) return;

  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  function check(field) {
    var v = field.value.trim();
    var ok = v.length > 0 && (field.type !== 'email' || emailRe.test(v));
    field.classList.toggle('is-invalid', !ok);
    return ok;
  }
  form.querySelectorAll('.form-control').forEach(function (f) {
    f.addEventListener('blur', function () { if (f.value) check(f); });
    f.addEventListener('input', function () { if (f.classList.contains('is-invalid')) check(f); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var fields = Array.prototype.slice.call(form.querySelectorAll('.form-control'));
    var firstBad = fields.filter(function (f) { return !check(f); })[0];
    if (firstBad) { firstBad.focus(); return; }

    var d = form.elements;
    var body = d.message.value.trim() + '\n\n— ' + d.name.value.trim() + ' (' + d.email.value.trim() + ')';
    window.location.href = 'mailto:' + RECEIVER +
      '?subject=' + encodeURIComponent(d.subject.value.trim()) +
      '&body=' + encodeURIComponent(body);
  });
})();

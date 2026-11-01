/* project-page.js — fills project.html from window.PROJECTS using project.html#<id> */
(function () {
  "use strict";

  var projects = window.PROJECTS || [];

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function bind(name, html) {
    document.querySelectorAll('[data-bind="' + name + '"]').forEach(function (el) { el.innerHTML = html; });
  }

  // Project id comes from project.html#<id> (also accepts ?id=<id>)
  function currentId() {
    var h = decodeURIComponent(window.location.hash.replace(/^#/, ''));
    return h || new URLSearchParams(window.location.search).get('id');
  }

  function render() {
    var id = currentId();
    var index = projects.findIndex(function (p) { return p.id === id; });

    if (index === -1) {
      document.querySelectorAll('#project-root > section:not(#not-found)').forEach(function (s) { s.classList.add('d-none'); });
      document.getElementById('not-found').classList.remove('d-none');
      document.title = 'ไม่พบผลงาน — อนุพงษ์ นิยม';
      return;
    }
    document.querySelectorAll('#project-root > section:not(#not-found)').forEach(function (s) { s.classList.remove('d-none'); });
    document.getElementById('not-found').classList.add('d-none');

    var p = projects[index];
    document.title = p.title + ' — อนุพงษ์ นิยม';

    bind('title', esc(p.title));
    bind('summary', esc(p.summary));
    bind('badge', p.badge ? '<span class="badge-work">' + esc(p.badge) + '</span>' : '');
    bind('tags', p.tags.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join(''));
    bind('overview', (p.overview || []).map(function (t) { return '<p>' + esc(t) + '</p>'; }).join(''));
    var screens = p.screens || [];
    var tech = p.tech || [];
    var highlights = p.highlights || [];
    bind('count', screens.length + ' หน้าจอ');
    bind('tech', tech.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join(''));
    bind('highlights', highlights.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join(''));
    document.getElementById('tech-wrap').classList.toggle('d-none', !tech.length);
    document.getElementById('highlights-wrap').classList.toggle('d-none', !highlights.length);
    document.getElementById('screens-wrap').classList.toggle('d-none', !screens.length);
    var howto = p.howto || [];
    bind('howto', howto.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join(''));
    document.getElementById('howto-wrap').classList.toggle('d-none', !howto.length);
    bind('note', esc(p.note || ''));
    document.querySelectorAll('[data-bind="screens"]').forEach(function (el) { el.classList.toggle('phone', !!p.phoneScreens); });
    document.getElementById('note-wrap').classList.toggle('d-none', !p.note);

    // Project info — only rows that have a value
    var info = [
      ['bi-person-workspace', 'บทบาท', p.role],
      ['bi-phone', 'แพลตฟอร์ม', p.platform],
      ['bi-tools', 'เครื่องมือ', p.tools],
      ['bi-calendar3', 'ปี', p.year],
      ['bi-images', 'จำนวนหน้าจอ', screens.length ? screens.length + ' หน้าจอ' : '']
    ].filter(function (r) { return r[2]; });
    bind('info', info.map(function (r) {
      return '<div class="row-item"><i class="bi ' + r[0] + '"></i><div><dt>' + r[1] + '</dt><dd>' + esc(r[2]) + '</dd></div></div>';
    }).join(''));

    // All screens on one page, in order
    bind('screens', screens.map(function (s, i) {
      var n = String(i + 1).padStart(2, '0');
      return '' +
        '<figure class="screen" data-aos="fade-up">' +
          '<a class="frame" href="' + esc(s.img) + '" data-index="' + i + '" title="กดเพื่อดูภาพขนาดใหญ่">' +
            '<img src="' + esc(s.img) + '" alt="' + esc(p.title + ' — ' + s.title) + '" loading="lazy">' +
          '</a>' +
          '<figcaption><span class="num">' + n + '</span><div><h3>' + esc(s.title) + '</h3><p>' + esc(s.text) + '</p></div></figcaption>' +
        '</figure>';
    }).join(''));

    // Previous / next project
    var prev = projects[(index - 1 + projects.length) % projects.length];
    var next = projects[(index + 1) % projects.length];
    if (projects.length > 1) {
      bind('pager',
        '<a class="pager-link prev" href="project.html#' + encodeURIComponent(prev.id) + '"><i class="bi bi-arrow-left"></i><div><small>ผลงานก่อนหน้า</small><strong>' + esc(prev.title) + '</strong></div></a>' +
        '<a class="pager-link next" href="project.html#' + encodeURIComponent(next.id) + '"><div><small>ผลงานถัดไป</small><strong>' + esc(next.title) + '</strong></div><i class="bi bi-arrow-right"></i></a>');
    }
  }

  render();
  window.addEventListener('hashchange', function () { if (window.Gallery) window.Gallery.close(); render(); window.scrollTo(0, 0); });

  // Screens open in the shared viewer (window.Gallery, defined in custom.js)
  document.addEventListener('click', function (e) {
    var a = e.target.closest('.screen .frame'); if (!a) return;
    e.preventDefault();
    var p = projects.find(function (x) { return x.id === currentId(); });
    if (p && window.Gallery) window.Gallery.open(p.screens, +a.getAttribute('data-index'), p.title);
  });
})();

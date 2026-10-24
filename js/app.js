(function () {
  'use strict';
  const main = document.getElementById('main');
  const nav = document.getElementById('nav');

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function route() {
    const hash = (location.hash || '#/books').replace(/^#\/?/, '');
    return hash || 'books';
  }

  async function loadMeta() {
    const res = await fetch('data/index.json');
    return res.json();
  }

  async function render() {
    const meta = await loadMeta();
    const id = route();
    const page = meta.pages.find(function (p) { return p.id === id; }) || meta.pages[0];
    nav.innerHTML = meta.pages.map(function (p) {
      const cls = p.id === page.id ? 'active' : '';
      return '<a class="' + cls + '" href="#/' + esc(p.id) + '">' + esc(p.title) + '</a>';
    }).join('');
    const mdRes = await fetch('data/' + page.file);
    const md = await mdRes.text();
    main.innerHTML = (window.marked ? marked.parse(md) : '<pre>' + esc(md) + '</pre>');
  }

  window.addEventListener('hashchange', function () { render().catch(showErr); });
  function showErr(err) {
    main.innerHTML = '<p class="muted">加载失败：' + esc(err && err.message ? err.message : err) + '</p>';
  }
  render().catch(showErr);
})();

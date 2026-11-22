(function () {
  'use strict';
  const main = document.getElementById('main');
  const nav = document.getElementById('nav');
  let systemMapScriptPromise = null;

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

  function ensureSystemMapScript() {
    if (window.SystemMap && typeof window.SystemMap.init === 'function') {
      return Promise.resolve();
    }
    if (systemMapScriptPromise) return systemMapScriptPromise;
    systemMapScriptPromise = new Promise(function (resolve, reject) {
      const s = document.createElement('script');
      s.src = 'system-map/app.js';
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error('无法加载 system-map/app.js')); };
      document.head.appendChild(s);
    });
    return systemMapScriptPromise;
  }

  function setWideLayout(on) {
    document.body.classList.toggle('page-system-map', !!on);
  }

  async function renderSystemMap() {
    setWideLayout(true);
    const [htmlRes] = await Promise.all([
      fetch('system-map/content.html'),
      ensureSystemMapScript(),
    ]);
    if (!htmlRes.ok) throw new Error('无法加载 system-map/content.html');
    const html = await htmlRes.text();
    main.innerHTML = html;
    window.SystemMap.init(main);
  }

  async function renderMarkdown(page) {
    setWideLayout(false);
    const mdRes = await fetch('data/' + page.file);
    if (!mdRes.ok) throw new Error('无法加载 data/' + page.file);
    const md = await mdRes.text();
    main.innerHTML = window.marked ? marked.parse(md) : '<pre>' + esc(md) + '</pre>';
  }

  async function render() {
    const meta = await loadMeta();
    const id = route();
    const page = meta.pages.find(function (p) { return p.id === id; }) || meta.pages[0];
    nav.innerHTML = meta.pages.map(function (p) {
      const cls = p.id === page.id ? 'active' : '';
      return '<a class="' + cls + '" href="#/' + esc(p.id) + '">' + esc(p.title) + '</a>';
    }).join('');

    if (page.type === 'system-map') {
      await renderSystemMap();
      return;
    }
    await renderMarkdown(page);
  }

  window.addEventListener('hashchange', function () { render().catch(showErr); });
  function showErr(err) {
    setWideLayout(false);
    main.innerHTML = '<p class="muted">加载失败：' + esc(err && err.message ? err.message : err) + '</p>';
  }
  render().catch(showErr);
})();

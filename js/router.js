const Router = (() => {
  const routes = ['inbox', 'calendar', 'gantt', 'areas', 'time-limits', 'settings'];

  async function loadView(name) {
    const html = await fetch(`./views/${name}.html`).then(r => r.text());
    document.getElementById('view-root').innerHTML = html;
    document.getElementById('view-title').textContent = routeTitle(name);

    document.querySelectorAll('#sidebar a').forEach(a => {
      a.classList.toggle('active', a.dataset.view === name);
    });

    const scripts = [...document.querySelectorAll('#view-root script')];
    scripts.forEach(oldScript => {
      const s = document.createElement('script');
      s.textContent = oldScript.textContent;
      document.body.appendChild(s);
      s.remove();
    });
  }

  function routeTitle(name) {
    return {
      inbox: 'Входящие',
      calendar: 'Календарь',
      gantt: 'Гант',
      areas: 'Области',
      'time-limits': 'Временные ограничения',
      settings: 'Настройки'
    }[name] || 'Планировщик';
  }

  async function navigate() {
    const view = location.hash.replace('#', '') || 'inbox';
    await loadView(routes.includes(view) ? view : 'inbox');
  }

  async function init() {
    window.addEventListener('hashchange', navigate);
    await navigate();
  }

  return { init };
})();
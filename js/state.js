const State = (() => {
  const listeners = new Set();
  let data = {
    areas: [],
    projects: [],
    branches: [],
    tasks: [],
    repetitions: [],
    timeBase: [],
    timeExceptions: [],
    dailyLog: [],
    settings: {
      theme: localStorage.getItem('theme') || 'light',
      scriptUrl: localStorage.getItem('scriptUrl') || '',
      srsIntervals: JSON.parse(localStorage.getItem('srsIntervals') || '[1,3,7,14,30,90]'),
      priorityMap: {
        high: { label: 'Высокий', color: '#ffb3b3' },
        medium: { label: 'Средний', color: '#ffe8a1' },
        low: { label: 'Низкий', color: '#b9efd1' }
      }
    },
    ui: {
      currentView: 'inbox',
      online: navigator.onLine
    }
  };

  function notify() {
    listeners.forEach(fn => fn(get()));
    applyTheme();
  }

  function get(key) {
    return key ? data[key] : structuredClone(data);
  }

  function set(key, value) {
    data[key] = value;
    notify();
  }

  function patch(key, patchObj) {
    data[key] = { ...data[key], ...patchObj };
    notify();
  }

  function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  function applyTheme() {
    document.body.classList.toggle('theme-dark', data.settings.theme === 'dark');
    localStorage.setItem('theme', data.settings.theme);
  }

  function updateSettings(next) {
    data.settings = { ...data.settings, ...next };
    if (next.scriptUrl !== undefined) localStorage.setItem('scriptUrl', next.scriptUrl);
    if (next.srsIntervals) localStorage.setItem('srsIntervals', JSON.stringify(next.srsIntervals));
    notify();
  }

  async function init() {
    const local = await DB.loadAllTables();
    Object.assign(data, local);
    applyTheme();
  }

  function upsertActive(table, record, prevId) {
    const rows = data[table].slice();
    if (prevId) {
      const prev = rows.find(r => r.id === prevId);
      if (prev) prev.tech_status = 'N';
    }
    rows.push({ ...record, tech_status: 'A' });
    data[table] = rows.filter(r => r.tech_status === 'A');
    notify();
  }

  return { init, get, set, patch, subscribe, updateSettings, upsertActive };
})();
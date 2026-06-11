const DB = (() => {
  const DB_NAME = 'planner-db';
  const VERSION = 1;
  let db;

  const TABLES = ['areas','projects','branches','tasks','repetitions','timeBase','timeExceptions','dailyLog','queue','settings'];

  function open() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, VERSION);
      req.onupgradeneeded = e => {
        const d = e.target.result;
        TABLES.forEach(name => {
          if (!d.objectStoreNames.contains(name)) d.createObjectStore(name, { keyPath: 'id' });
        });
      };
      req.onsuccess = () => {
        db = req.result;
        resolve(db);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async function init() {
    if (!db) await open();
  }

  function tx(store, mode = 'readonly') {
    return db.transaction(store, mode).objectStore(store);
  }

  function put(store, value) {
    return new Promise((resolve, reject) => {
      const req = tx(store, 'readwrite').put(value);
      req.onsuccess = () => resolve(value);
      req.onerror = () => reject(req.error);
    });
  }

  function bulkPut(store, rows) {
    return Promise.all(rows.map(r => put(store, r)));
  }

  function getAll(store) {
    return new Promise((resolve, reject) => {
      const req = tx(store).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async function loadAllTables() {
    const out = {};
    out.areas = (await getAll('areas')).filter(x => x.tech_status === 'A');
    out.projects = (await getAll('projects')).filter(x => x.tech_status === 'A');
    out.branches = (await getAll('branches')).filter(x => x.tech_status === 'A');
    out.tasks = (await getAll('tasks')).filter(x => x.tech_status === 'A');
    out.repetitions = (await getAll('repetitions')).filter(x => x.tech_status === 'A');
    out.timeBase = (await getAll('timeBase')).filter(x => x.tech_status === 'A');
    out.timeExceptions = (await getAll('timeExceptions')).filter(x => x.tech_status === 'A');
    out.dailyLog = (await getAll('dailyLog')).filter(x => x.tech_status === 'A');
    out.settings = State ? State.get('settings') : {};
    return out;
  }

  async function enqueue(item) {
    return put('queue', { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...item });
  }

  async function getQueue() {
    return getAll('queue');
  }

  async function removeQueue(id) {
    return new Promise((resolve, reject) => {
      const req = tx('queue', 'readwrite').delete(id);
      req.onsuccess = resolve;
      req.onerror = () => reject(req.error);
    });
  }

  async function flushQueue() {
    const queue = await getQueue();
    for (const item of queue) {
      try {
        await API.post(item.action, item.payload);
        await removeQueue(item.id);
      } catch (e) {
        console.error('Queue flush failed', e);
        break;
      }
    }
  }

  return { init, put, bulkPut, getAll, loadAllTables, enqueue, flushQueue };
})();
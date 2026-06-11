const API = (() => {
  function baseUrl() {
    return State.get('settings').scriptUrl;
  }

  async function get(action, params = {}) {
    const url = new URL(baseUrl());
    url.searchParams.set('action', action);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const resp = await fetch(url.toString());
    if (!resp.ok) throw new Error('Ошибка GET');
    return resp.json();
  }

  async function post(action, payload = {}) {
    const resp = await fetch(baseUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...payload })
    });
    if (!resp.ok) throw new Error('Ошибка POST');
    return resp.json();
  }

  async function loadAll() {
    const json = await get('getAll');
    const map = ['areas','projects','branches','tasks','repetitions','timeBase','timeExceptions','dailyLog'];
    for (const key of map) {
      if (Array.isArray(json[key])) {
        await DB.bulkPut(key, json[key]);
        State.set(key, json[key].filter(r => r.tech_status === 'A'));
      }
    }
    return json;
  }

  async function saveEntity(action, table, record) {
    State.upsertActive(table, record, record.prev_id);
    await DB.put(table, record);

    if (!navigator.onLine) {
      await DB.enqueue({ action, payload: { record } });
      return { queued: true };
    }

    try {
      return await post(action, { record });
    } catch (e) {
      await DB.enqueue({ action, payload: { record } });
      return { queued: true };
    }
  }

  return {
    get, post, loadAll,
    saveArea: r => saveEntity('saveArea', 'areas', r),
    saveProject: r => saveEntity('saveProject', 'projects', r),
    saveBranch: r => saveEntity('saveBranch', 'branches', r),
    saveTask: r => saveEntity('saveTask', 'tasks', r),
    saveRepetition: r => saveEntity('saveRepetition', 'repetitions', r),
    saveTimeBase: r => saveEntity('saveTimeBase', 'timeBase', r),
    saveTimeException: r => saveEntity('saveTimeException', 'timeExceptions', r),
    saveDailyLog: r => saveEntity('saveDailyLog', 'dailyLog', r)
  };
})();
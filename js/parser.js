const Parser = (() => {
  function parseQuickTask(text) {
    const raw = text.trim();

    const title = raw
      .replace(/!\w+/g, '')
      .replace(/@\S+/g, '')
      .replace(/#\S+/g, '')
      .replace(/\b\d+([.,]\d+)?ч\b/gi, '')
      .replace(/до:\d{4}-\d{2}-\d{2}/g, '')
      .replace(/🧠/g, '')
      .trim();

    const priority = /!high|!высокий/i.test(raw)
      ? 'high'
      : /!low|!низкий/i.test(raw)
      ? 'low'
      : 'medium';

    const hoursMatch = raw.match(/(\d+([.,]\d+)?)ч/i);
    const estimated_hours = hoursMatch ? Number(hoursMatch[1].replace(',', '.')) : 1;

    const deadlineMatch = raw.match(/до:(\d{4}-\d{2}-\d{2})/);
    const date_deadline = deadlineMatch ? deadlineMatch[1] : '';

    const remember_flag = raw.includes('🧠');

    return {
      title,
      priority,
      estimated_hours,
      date_deadline,
      remember_flag
    };
  }

  return { parseQuickTask };
})();
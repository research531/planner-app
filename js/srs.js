const SRS = (() => {
  function intervals() {
    return State.get('settings').srsIntervals || [1,3,7,14,30,90];
  }

  function createForTask(taskId) {
    const first = intervals()[0];
    const next = new Date();
    next.setDate(next.getDate() + first);

    return {
      id: crypto.randomUUID(),
      task_id: taskId,
      next_review: next.toISOString().slice(0, 10),
      interval_days: first,
      ease_factor: 2.5,
      review_count: 0,
      last_review: '',
      tech_status: 'A'
    };
  }

  function review(rep, grade) {
    const ints = intervals();
    let interval = Number(rep.interval_days || ints[0]);
    let ease = Number(rep.ease_factor || 2.5);
    let count = Number(rep.review_count || 0);

    if (grade === 'hard') {
      interval = ints[Math.min(count, ints.length - 1)];
      ease = Math.max(1.3, ease - 0.15);
      count += 1;
    } else if (grade === 'fail') {
      interval = ints[0];
      ease = Math.max(1.3, ease - 0.2);
      count = 0;
    } else {
      interval = Math.max(Math.round(interval * ease), ints[Math.min(count + 1, ints.length - 1)]);
      ease += 0.1;
      count += 1;
    }

    const next = new Date();
    next.setDate(next.getDate() + interval);

    return {
      ...rep,
      prev_id: rep.id,
      id: crypto.randomUUID(),
      next_review: next.toISOString().slice(0, 10),
      interval_days: interval,
      ease_factor: ease,
      review_count: count,
      last_review: new Date().toISOString().slice(0, 10),
      tech_status: 'A'
    };
  }

  return { createForTask, review };
})();
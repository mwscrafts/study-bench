import { formatTime } from './king.mjs?v=12';

const BOARD = '/first-hearth/api/times';
export const MAX_TIME_MS = 60 * 60 * 1000;

export function readVictory(value, hearthLearned) {
  if (!value || typeof value.runId !== 'string' || !/^[0-9a-f-]{36}$/i.test(value.runId)
    || !Number.isSafeInteger(value.timeMs) || value.timeMs <= 0 || value.timeMs > MAX_TIME_MS) return null;
  const ending = value.ending === 'break' || (value.ending === 'free' && hearthLearned) ? value.ending : null;
  const name = typeof value.name === 'string' && value.name.length <= 20 ? value.name : null;
  return { runId: value.runId, timeMs: value.timeMs, ending, name: ending ? name : null,
    difficulty: value.difficulty === 'hard' ? 'hard' : 'easy' };
}

export function openTimeBoard(el, victory, save) {
  const panel = el('time-board');
  const form = el('time-form');
  const input = el('time-name');
  const submit = el('time-submit');
  const status = el('time-status');
  const list = el('time-list');
  const url = BOARD + '?ending=' + victory.ending + (victory.difficulty === 'hard' ? '-hard' : '');
  panel.hidden = false;
  form.hidden = !!victory.name;
  input.value = '';
  submit.disabled = false;
  list.replaceChildren();
  status.textContent = 'Loading times…';

  function show(result, message) {
    const rows = result.scores.map(score => {
      const li = document.createElement('li');
      li.textContent = score.name + ' · ' + formatTime(score.timeMs);
      return li;
    });
    list.replaceChildren(...rows);
    status.textContent = message || (rows.length ? '' : 'No times posted yet.');
  }

  fetch(url, { cache: 'no-store' }).then(async response => {
    if (!response.ok) throw new Error('Board unavailable');
    const result = await response.json();
    if (!submit.disabled && !panel.hidden) show(result, victory.name ? 'Time posted as ' + victory.name + '.' : '');
  }).catch(() => {
    if (!submit.disabled && !panel.hidden) status.textContent = 'The shared board is temporarily unavailable.';
  });

  form.onsubmit = async event => {
    event.preventDefault();
    const name = input.value.trim();
    if (submit.disabled || victory.name) return;
    if (!name || name.length > 20) {
      status.textContent = 'Enter a nickname of 1–20 characters.';
      return;
    }
    submit.disabled = true;
    status.textContent = 'Posting time…';
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runId: victory.runId, timeMs: victory.timeMs, name })
      });
      if (!response.ok) {
        if (response.status === 400) {
          status.textContent = 'Use a nickname with letters, numbers, spaces, or simple punctuation.';
          return;
        }
        throw new Error('Post failed');
      }
      const result = await response.json();
      victory.name = result.postedName;
      save();
      form.hidden = true;
      if (!panel.hidden) show(result, 'Time posted as ' + victory.name + '.');
    } catch {
      status.textContent = 'Couldn’t post the time. Your result is still saved.';
    } finally {
      submit.disabled = false;
    }
  };
}

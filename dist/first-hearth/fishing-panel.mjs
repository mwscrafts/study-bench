const WINDUP = .18;
const CROSSING = 1.4;

export function castMarker(elapsed, fromLeft) {
  const sweep = (Math.max(0, elapsed - WINDUP) / CROSSING) % 2;
  const position = sweep <= 1 ? sweep : 2 - sweep;
  return fromLeft ? position : 1 - position;
}

export function catchQuality(position) {
  if (position < .20 || position > .80) return 'miss';
  return position >= .35 && position <= .65 ? 'full' : 'partial';
}

export function createFishingPanel(root) {
  const pick = name => root.querySelector('[data-fishing="' + name + '"]');
  const action = pick('action');
  const marker = pick('marker');
  const meter = pick('xp');
  const result = pick('result');
  const level = pick('level');
  const xpLabel = pick('xp-label');
  const book = pick('book');
  const xpFill = meter.firstElementChild;

  function showProgress(progress, hasBook) {
    const { level: current, progress: xp, required } = progress;
    level.textContent = 'Lv ' + current;
    xpLabel.textContent = required ? xp + ' / ' + required + ' XP to level ' + (current + 1) : 'Max level';
    meter.setAttribute('aria-valuemax', required || 1);
    meter.setAttribute('aria-valuenow', required ? xp : 1);
    xpFill.style.width = (required ? xp / required : 1) * 100 + '%';
    book.hidden = !hasBook;
  }

  function showMarker(position) {
    marker.hidden = false;
    marker.style.left = position * 100 + '%';
  }

  return {
    get active() { return !root.hidden; },
    open(progress, hasBook) {
      showProgress(progress, hasBook);
      marker.hidden = true;
      action.textContent = 'Cast line';
      book.disabled = false;
      result.textContent = 'Cast, then reel in while the marker is green.';
      root.hidden = false;
      action.focus({ preventScroll: true });
    },
    close() { root.hidden = true; },
    begin(position) {
      showMarker(position);
      action.textContent = 'Reel in';
      book.disabled = true;
      result.textContent = 'Aim for the green.';
    },
    showMarker,
    settle(message, progress, hasBook) {
      showProgress(progress, hasBook);
      action.textContent = 'Cast again';
      book.disabled = false;
      result.textContent = message;
    },
    readBook(clue) { result.textContent = clue; }
  };
}

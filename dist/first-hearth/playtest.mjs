import { WORLD_WIDTH, WORLD_HEIGHT, VIEW_WIDTH, SPAWN_X, CAMP_X, surfaces, landmarks, flowers,
  groundAt, surfaceAt, clamp, createPlayer, jump, movePlayer, nearbyLandmark } from './terrain.mjs';
import { buildCampArt, paintHorizon, paintCampTint, paintFlame, paintFlower } from './camp-art.mjs';

const el = id => document.getElementById(id);
const world = el('world');
const ctx = world.getContext('2d');
const SAVE_KEY = 'first-hearth:alder-camp:v1';
const DAY_LENGTH = 136;
const skyModes = ['auto', 'day', 'dusk', 'night', 'dawn'];
const skyLabels = { day: 'Daylight', dusk: 'Dusk', night: 'Night', dawn: 'Dawn' };
const heldKeys = new Set();
const heldPointers = new Map();
const camera = { x: 0, y: 0, width: VIEW_WIDTH, height: 600, zoom: 1, density: 1 };
const tracker = [];
const cat = { x: SPAWN_X - 72, y: groundAt(SPAWN_X), direction: 1, gait: 0 };
let sprites;
let camp;
let player = createPlayer();
let avatar = 'boy';
let playing = false;
let paused = false;
let talking = false;
let phaseClock = 0;
let animationClock = 0;
let skyMode = 'auto';
let gait = 0;
let elapsedSinceSave = 0;
let lastFrame = 0;
let selectedLandmark;
let visited = new Set();
let collected = new Set();
let quest = 'unoffered';
let notice = '';
let noticeUntil = 0;
let savedFooting = { x: player.x, ground: player.ground };

const conversations = {
  mara: { name: 'Mara', role: 'FORGE KEEPER' },
  lift: {
    name: 'The old lift',
    role: 'MARA’S CLEARING',
    greeting: 'The lift goes down to Ivo’s mine, but its cable hangs slack. You can still reach the mine door on foot.'
  },
  mine: {
    name: 'Embervein Mine',
    role: 'TIMBER GATE',
    greeting: 'Lantern light slips through the timbers. Ivo’s mine starts here. Look for a dusklily on the path beside the door.'
  },
  canopy: {
    name: 'Crownwood Canopy',
    role: 'UPPER TRAIL',
    greeting: 'You can see camp through the branches. Crownwood continues past this gate. The wide branch below is a good place to look for dusklilies.'
  },
  shore: {
    name: 'Shore trail',
    role: 'PAST TIMBER GATE',
    greeting: 'The air smells of salt. This path runs out to the beach.'
  }
};

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}

function surfaceCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function spriteBounds(image, start, end, anchor) {
  const canvas = surfaceCanvas(image.width, image.height);
  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.drawImage(image, 0, 0);
  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
  let left = image.width;
  let right = 0;
  let top = image.height;
  let bottom = 0;
  for (let y = 0; y < image.height; y++) {
    for (let x = Math.floor(image.width * start); x < Math.floor(image.width * end); x++) {
      if (data[(y * image.width + x) * 4 + 3] < 95) continue;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
  }
  if (left > right || top > bottom) throw new Error('Missing sprite silhouette');
  return { image, left, top, width: right - left + 1, height: bottom - top + 1, anchor };
}

function drawSprite(context, sprite, x, y, height, direction = 1, bob = 0, tilt = 0) {
  const width = sprite.width / sprite.height * height;
  context.save();
  context.translate(x, y + bob);
  context.scale(direction, 1);
  context.rotate(tilt);
  context.drawImage(sprite.image, sprite.left, sprite.top, sprite.width, sprite.height,
    -width * sprite.anchor, -height, width, height);
  context.restore();
}

function drawPortrait(canvas, sprite) {
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawSprite(context, sprite, canvas.width * .55, canvas.height - 4, canvas.height - 8);
}

function skyState() {
  if (skyMode !== 'auto') return { from: skyMode, to: skyMode, mix: 0 };
  const time = phaseClock % DAY_LENGTH;
  if (time < 38) return { from: 'day', to: 'day', mix: 0 };
  if (time < 55) return { from: 'day', to: 'dusk', mix: (time - 38) / 17 };
  if (time < 72) return { from: 'dusk', to: 'night', mix: (time - 55) / 17 };
  if (time < 104) return { from: 'night', to: 'night', mix: 0 };
  if (time < 121) return { from: 'night', to: 'dawn', mix: (time - 104) / 17 };
  return { from: 'dawn', to: 'day', mix: (time - 121) / 15 };
}

function drawFirelight(x, y, radius, strength) {
  const halo = ctx.createRadialGradient(x, y, 3, x, y, radius);
  halo.addColorStop(0, 'rgba(255,179,84,' + strength + ')');
  halo.addColorStop(1, 'rgba(255,179,84,0)');
  ctx.fillStyle = halo;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
}

function paintMarker(landmark) {
  const height = landmark.id === 'mara' ? 121 : 103;
  const y = landmark.y - height + Math.sin(animationClock * 2) * 4;
  ctx.save();
  ctx.translate(landmark.x, y);
  ctx.fillStyle = selectedLandmark === landmark ? '#f7d08b' : '#243d32ee';
  ctx.strokeStyle = '#ffdfaa';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = selectedLandmark === landmark ? '#314235' : '#ffdfaa';
  ctx.font = 'bold 15px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('✦', 0, 1);
  ctx.restore();
}

function shadow(x, y, width) {
  ctx.fillStyle = '#1729214d';
  ctx.beginPath();
  ctx.ellipse(x, y + 1, width, width * .24, 0, 0, Math.PI * 2);
  ctx.fill();
}

function paint() {
  const { density, zoom, x, y } = camera;
  ctx.setTransform(density * zoom, 0, 0, density * zoom, -x * density * zoom, -y * density * zoom);
  const sky = skyState();
  paintHorizon(ctx, camera, sky.from, 1, animationClock);
  if (sky.from !== sky.to) paintHorizon(ctx, camera, sky.to, sky.mix, animationClock);
  ctx.drawImage(camp, 0, 0);
  const clockText = skyLabels[sky.mix > .35 ? sky.to : sky.from];
  if (el('time-label').textContent !== clockText) el('time-label').textContent = clockText;
  const night = (sky.from === 'night' ? 1 - sky.mix : 0) + (sky.to === 'night' ? sky.mix : 0);
  paintCampTint(ctx, camera, night);
  drawFirelight(2258, 595, 132, .18 + night * .42);
  drawFirelight(2150, 582, 90, .08 + night * .25);
  drawFirelight(4168, 677, 90, .12 + night * .31);
  paintFlame(ctx, 2258, 604, animationClock);
  for (let i = 0; i < 7; i++) {
    const rise = (animationClock * 26 + i * 14) % 97;
    ctx.fillStyle = 'rgba(255,204,123,' + ((1 - rise / 97) * .8) + ')';
    ctx.fillRect(2258 + Math.sin(rise * .08 + i) * 15, 594 - rise, 2.7, 2.7);
  }
  flowers.forEach(flower => {
    if (!collected.has(flower.id)) paintFlower(ctx, flower, selectedLandmark === flower, animationClock);
  });

  const mara = landmarks[0];
  shadow(mara.x, mara.y, 24);
  drawSprite(ctx, sprites.mara, mara.x, mara.y, 98);
  if (playing) {
    shadow(cat.x, cat.y, 17);
    drawSprite(ctx, sprites.alvin, cat.x, cat.y, 44, cat.direction,
      -Math.abs(Math.sin(cat.gait)) * 2.2, Math.sin(cat.gait) * .035);
  }
  if (player.ground) shadow(player.x, player.y, 22);
  drawSprite(ctx, sprites[avatar], player.x, player.y, 97, player.direction,
    player.moving && player.ground ? -Math.abs(Math.sin(gait)) * 4 : 0,
    player.moving ? Math.sin(gait) * .045 : 0);
  if (playing) landmarks.forEach(paintMarker);
}

function updateCat(dt) {
  tracker.push({ time: animationClock, x: player.x, y: player.y, ground: player.ground, direction: player.direction });
  const cutoff = animationClock - .26;
  while (tracker.length > 1 && tracker[1].time <= cutoff) tracker.shift();
  const trail = tracker[0];
  const support = surfaces.find(surface => surface.id === trail.ground);
  let targetX = trail.x - trail.direction * 62;
  if (support) {
    targetX = clamp(targetX, support.points[0][0] + 8, support.points.at(-1)[0] - 8);
  }
  targetX = clamp(targetX, 19, WORLD_WIDTH - 19);
  const targetY = support ? surfaceAt(support, targetX) : trail.y;
  const oldX = cat.x;
  const follow = 1 - Math.exp(-dt * 14);
  cat.x += (targetX - cat.x) * follow;
  cat.y += (targetY - cat.y) * follow;
  const movement = cat.x - oldX;
  if (Math.abs(movement) > .35) cat.direction = Math.sign(movement);
  cat.gait += Math.abs(movement) * .11;
}

function controlsActive() {
  return playing && !paused && !talking;
}

function updateCamera(snap = false, dt = 0) {
  const x = clamp(player.x - camera.width * .46, 0, Math.max(0, WORLD_WIDTH - camera.width));
  const y = clamp(player.y - camera.height * .76, 0, Math.max(0, WORLD_HEIGHT - camera.height));
  const factor = snap ? 1 : 1 - Math.exp(-dt * 6);
  camera.x += (x - camera.x) * factor;
  camera.y += (y - camera.y) * factor;
}

function resize() {
  const rect = world.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  camera.density = Math.min(2, window.devicePixelRatio || 1);
  world.width = Math.round(rect.width * camera.density);
  world.height = Math.round(rect.height * camera.density);
  camera.zoom = Math.max(rect.width / VIEW_WIDTH, rect.height / 600);
  camera.width = rect.width / camera.zoom;
  camera.height = rect.height / camera.zoom;
  updateCamera(true);
  if (sprites) paint();
}

function clearControls() {
  heldKeys.clear();
  heldPointers.clear();
  el('left').classList.remove('pressed');
  el('right').classList.remove('pressed');
}

function updatePrompt() {
  const current = controlsActive() ? nearbyLandmark(player, collected) : undefined;
  const message = current ? current.label + ' · E / Interact'
    : controlsActive() && animationClock < noticeUntil ? notice : '';
  selectedLandmark = current;
  if (el('status').textContent !== message) el('status').textContent = message;
  el('status').hidden = !message;
  el('interact').disabled = !current;
}

function updateLocation() {
  const location = player.x < 1140 ? 'Reedbank Trail'
    : player.x < 1830 ? 'Pine Gate'
    : player.x < 2680 ? 'Mara’s Clearing'
    : player.x < 3800 ? 'Root Fork'
    : player.x < 4300 ? 'Timber Gate' : 'Shore Trail';
  if (el('location-name').textContent !== location) el('location-name').textContent = location;
}

function updateNotes() {
  const clue = quest === 'complete' ? 'Brass key earned'
    : quest === 'accepted' ? 'Mara’s dusklilies · ' + collected.size + ' / 3'
    : collected.size ? 'Dusklilies found · ' + collected.size + ' / 3'
    : 'Explore the trail and find Mara by the fire.';
  el('quest-tracker').textContent = clue;
  el('quest-tracker').hidden = false;
  const destinations = ['canopy', 'mine', 'shore'].filter(id => visited.has(id)).length;
  el('trail-notes').textContent = 'Trail entrances found · ' + destinations + ' / 3';
}

function getSavedCamp() {
  try {
    const save = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (save?.avatar === 'boy' || save?.avatar === 'girl') return save;
  } catch { /* A blocked or damaged save can be replaced by a new playtest. */ }
  return null;
}

function saveCamp() {
  if (!playing) return;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      version: 2, avatar, footing: savedFooting, phaseClock: phaseClock % DAY_LENGTH,
      visited: [...visited], flowers: [...collected], quest
    }));
  } catch { /* Play remains available if browser storage is disabled. */ }
}

function begin(save) {
  if (!sprites) return;
  avatar = save?.avatar ?? avatar;
  phaseClock = Number.isFinite(save?.phaseClock) ? clamp(save.phaseClock, 0, DAY_LENGTH) : 0;
  visited = new Set(landmarks.filter(landmark => Array.isArray(save?.visited) && save.visited.includes(landmark.id)).map(landmark => landmark.id));
  const savedFlowers = Array.isArray(save?.flowers) ? save.flowers : [];
  collected = new Set(flowers.filter(flower => savedFlowers.includes(flower.id)).map(flower => flower.id));
  quest = ['accepted', 'declined', 'complete'].includes(save?.quest) ? save.quest : 'unoffered';
  // The old one-screen map has unrelated terrain coordinates.
  const footing = save && save.version !== 2 ? { x: CAMP_X, ground: 'trail' } : save?.footing;
  player = createPlayer(footing);
  noticeUntil = 0;
  savedFooting = { x: player.x, ground: player.ground };
  cat.x = clamp(player.x - 62, 19, WORLD_WIDTH - 19);
  cat.y = player.y;
  tracker.length = 0;
  playing = true;
  el('start').hidden = true;
  clearControls();
  updateNotes();
  updateLocation();
  updateCamera(true);
  updatePrompt();
  saveCamp();
  world.focus({ preventScroll: true });
}

function setDialogue(line, options = []) {
  el('line').textContent = line;
  const choices = el('choices');
  choices.replaceChildren();
  for (const [label, action] of options) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.addEventListener('click', action);
    choices.append(button);
  }
  (choices.firstElementChild ?? el('close-dialogue')).focus({ preventScroll: true });
}

const flowerHint = 'One grows here by the fire, one on a wide branch up the Crownwood trail, and one beside the mine door.';

function setQuest(state) {
  quest = state;
  updateNotes();
  saveCamp();
}

function maraDialogue() {
  const paths = ['Where do the trails go?', () => setDialogue(
    'At the root fork, jump up into Crownwood. Stay on the ground for the mine. The shore trail keeps going past the mine door.',
    [['Back', maraDialogue]])];
  if (quest === 'complete') {
    setDialogue('That brass key opens an old box. If you find a place where the fire still burns behind falling water, try it there.', [paths]);
  } else if (quest === 'accepted' && collected.size === flowers.length) {
    setDialogue('Three dusklilies! I used to pick these on the way home. Here’s the brass key I promised.', [
      ['Give Mara the 3 dusklilies', () => {
        setQuest('complete');
        setDialogue('Brass key received. Keep it for the old box behind falling water. Alvin, see if you can keep them out of trouble.');
      }], paths]);
  } else if (quest === 'accepted') {
    setDialogue('You’ve found ' + collected.size + ' of the 3 dusklilies. ' + flowerHint, [paths]);
  } else {
    const greeting = quest === 'declined' ? 'Changed your mind? ' : 'Come warm up. Alvin already has. ';
    setDialogue(greeting + 'Bring me 3 dusklilies and I’ll give you a brass key. ' + flowerHint + ' Will you help?', [
      ['Yes, I’ll find them', () => {
        setQuest('accepted');
        maraDialogue();
      }],
      ['No, maybe later', () => {
        setQuest('declined');
        setDialogue('Fair enough. The fire’s here whenever you need it.', [paths]);
      }], paths]);
  }
}

function interact() {
  if (!controlsActive() || !selectedLandmark) return;
  const item = selectedLandmark;
  if (flowers.includes(item)) {
    collected.add(item.id);
    notice = 'Dusklily picked · ' + collected.size + ' / 3';
    noticeUntil = animationClock + 1.9;
    updateNotes();
    updatePrompt();
    saveCamp();
    world.focus({ preventScroll: true });
    return;
  }
  const id = item.id;
  const info = conversations[id];
  visited.add(id);
  talking = true;
  clearControls();
  updatePrompt();
  updateNotes();
  saveCamp();
  el('speaker').textContent = info.name;
  el('speaker-role').textContent = info.role;
  el('portrait').hidden = id !== 'mara';
  if (id === 'mara') drawPortrait(el('portrait'), sprites.mara);
  el('dialogue').hidden = false;
  if (id === 'mara') maraDialogue();
  else setDialogue(info.greeting + (id === 'lift' ? '' : ' The next region opens in a later playtest.'));
}

function closeDialogue() {
  talking = false;
  el('dialogue').hidden = true;
  updatePrompt();
  world.focus({ preventScroll: true });
}

function setPause(value) {
  if (!playing || talking) return;
  paused = value;
  el('paused').hidden = !value;
  el('pause').textContent = value ? 'Resume' : 'Pause';
  clearControls();
  updatePrompt();
  if (value) {
    saveCamp();
    el('resume').focus({ preventScroll: true });
  } else {
    world.focus({ preventScroll: true });
  }
}

function frame(time) {
  const dt = Math.min(.045, (time - (lastFrame || time)) / 1000);
  lastFrame = time;
  if (!paused && !talking) animationClock += dt;
  if (controlsActive()) {
    const right = heldKeys.has('d') || heldKeys.has('arrowright') || [...heldPointers.values()].includes(1);
    const left = heldKeys.has('a') || heldKeys.has('arrowleft') || [...heldPointers.values()].includes(-1);
    const direction = Number(right) - Number(left);
    for (let remaining = dt; remaining > 0;) {
      const step = Math.min(remaining, 1 / 120);
      movePlayer(player, direction, step);
      remaining -= step;
    }
    if (player.ground) savedFooting = { x: player.x, ground: player.ground };
    if (player.moving) gait += dt * 15;
    phaseClock = (phaseClock + dt) % DAY_LENGTH;
    updateCat(dt);
    updateCamera(false, dt);
    updateLocation();
    updatePrompt();
    elapsedSinceSave += dt;
    if (elapsedSinceSave > 3) {
      elapsedSinceSave = 0;
      saveCamp();
    }
  }
  paint();
  requestAnimationFrame(frame);
}

for (const button of document.querySelectorAll('[data-avatar]')) {
  button.addEventListener('click', () => {
    avatar = button.dataset.avatar;
    for (const choice of document.querySelectorAll('[data-avatar]')) {
      choice.setAttribute('aria-pressed', String(choice === button));
    }
  });
}
el('begin').addEventListener('click', () => begin());
el('continue').addEventListener('click', () => begin(getSavedCamp()));
el('close-dialogue').addEventListener('click', closeDialogue);
el('pause').addEventListener('click', () => setPause(!paused));
el('resume').addEventListener('click', () => setPause(false));
el('sky-toggle').addEventListener('click', () => {
  skyMode = skyModes[(skyModes.indexOf(skyMode) + 1) % skyModes.length];
  el('sky-toggle').textContent = 'Sky: ' + (skyLabels[skyMode] ?? 'Auto');
});
el('fullscreen').addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await el('game').requestFullscreen();
  } catch { el('fullscreen').disabled = true; }
});

const moveKeys = new Set(['a', 'd', 'arrowleft', 'arrowright']);
const jumpKeys = new Set([' ', 'w', 'arrowup']);
window.addEventListener('keydown', event => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  const key = event.key.toLowerCase();
  if (key === 'escape' && talking) {
    closeDialogue();
    return;
  }
  if (playing && (key === 'escape' || key === 'p') && !event.repeat) {
    setPause(!paused);
    return;
  }
  if (!controlsActive()) return;
  if (moveKeys.has(key)) {
    event.preventDefault();
    heldKeys.add(key);
  }
  if (jumpKeys.has(key) && (key !== ' ' || !event.target.closest('button'))) {
    event.preventDefault();
    if (!event.repeat) jump(player);
  }
  if (key === 'e' && !event.repeat) interact();
});
window.addEventListener('keyup', event => heldKeys.delete(event.key.toLowerCase()));

for (const [id, direction] of [['left', -1], ['right', 1]]) {
  const button = el(id);
  button.addEventListener('pointerdown', event => {
    if (!controlsActive()) return;
    event.preventDefault();
    heldPointers.set(event.pointerId, direction);
    button.setPointerCapture(event.pointerId);
    button.classList.add('pressed');
  });
  const release = event => {
    heldPointers.delete(event.pointerId);
    if (![...heldPointers.values()].includes(direction)) button.classList.remove('pressed');
  };
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => button.addEventListener(type, release));
}
el('jump').addEventListener('pointerdown', event => {
  event.preventDefault();
  if (controlsActive()) jump(player);
});
el('jump').addEventListener('click', event => {
  if (event.detail === 0 && controlsActive()) jump(player);
});
el('interact').addEventListener('click', interact);
window.addEventListener('blur', clearControls);
window.addEventListener('pagehide', saveCamp);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    clearControls();
    saveCamp();
  }
});
new ResizeObserver(resize).observe(world);

async function boot() {
  try {
    const [party, keepers] = await Promise.all([
      loadImage('./party.webp'), loadImage('./keepers.webp')
    ]);
    camp = buildCampArt();
    sprites = {
      boy: spriteBounds(party, 0, 1 / 3, .64),
      girl: spriteBounds(party, 1 / 3, 2 / 3, .63),
      alvin: spriteBounds(party, 2 / 3, 1, .65),
      mara: spriteBounds(keepers, .5, 1, .55)
    };
    drawPortrait(el('choose-boy').querySelector('canvas'), sprites.boy);
    drawPortrait(el('choose-girl').querySelector('canvas'), sprites.girl);
    el('begin').disabled = false;
    el('begin').textContent = 'Enter Alder Camp →';
    el('continue').hidden = !getSavedCamp();
    resize();
    requestAnimationFrame(frame);
  } catch (error) {
    console.error('Camp load failed', error);
    el('load-error').hidden = false;
  }
}

boot();

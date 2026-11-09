import { WORLD_WIDTH, WORLD_HEIGHT, SPAWN_X, surfaces, landmarks, surfaceAt, clamp, createPlayer, jump, movePlayer, nearbyLandmark } from './terrain.mjs';

const el = id => document.getElementById(id);
const world = el('world');
const ctx = world.getContext('2d');
const SAVE_KEY = 'first-hearth:alder-camp:v1';
const DAY_LENGTH = 136;
const skyModes = ['auto', 'day', 'dusk', 'night', 'dawn'];
const skyLabels = { day: 'Daylight', dusk: 'Dusk', night: 'Night', dawn: 'Dawn' };
const heldKeys = new Set();
const heldPointers = new Map();
const camera = { x: 0, y: 0, width: 1882, height: 836, zoom: 1, density: 1 };
const tracker = [];
const cat = { x: SPAWN_X - 72, y: 565, direction: 1, gait: 0 };
let sprites;
let camp;
let skies;
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
let savedFooting = { x: player.x, ground: player.ground };

const conversations = {
  mara: {
    name: 'Mara',
    role: 'FORGE KEEPER',
    greeting: 'Welcome to Alder Camp. You can catch your breath by the fire. Alvin seems to have made himself at home.',
    options: [
      ['Where do the trails go?', 'Up the roots is Crownwood. Keep to the lower stones and you’ll find the mine door. If you meet Ivo, ask him about that lift.'],
      ['Did you stitch those flowers?', 'Every one. The flowers I’m looking for grow where the light changes. If you spot one on your travels, remember where it was.']
    ]
  },
  mine: {
    name: 'Embervein Mine',
    role: 'LOWER TRAIL',
    greeting: 'Lamplight spills through the timber doorway. This is the entrance to Ivo’s mine.',
    options: []
  },
  canopy: {
    name: 'Crownwood Canopy',
    role: 'UPPER TRAIL',
    greeting: 'From the last branch you can see over the campfire smoke. The trail into Crownwood starts here.',
    options: []
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

function buildSkyLayers(image) {
  const width = WORLD_WIDTH / 2;
  const height = 155;
  const mask = surfaceCanvas(width, height);
  const maskCtx = mask.getContext('2d', { willReadFrequently: true });
  maskCtx.drawImage(image, 0, 0, WORLD_WIDTH, height * 2, 0, 0, width, height);
  const pixels = maskCtx.getImageData(0, 0, width, height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const [red, green, blue] = [pixels.data[index], pixels.data[index + 1], pixels.data[index + 2]];
      const sun = Math.hypot(x - 297, y - 73.5) <= 26.6 && red > 215 && green > 202;
      const sky = red > 170 && blue > 170 && green - red > 3;
      pixels.data[index + 3] = sun ? 255 : sky ? Math.round(255 * clamp((green - 189) / 24, 0, 1)) : 0;
    }
  }
  maskCtx.putImageData(pixels, 0, 0);
  const colors = {
    dusk: ['#676489', '#d19ba0', '#f8bd8d'],
    night: ['#202846', '#354974', '#757ca2'],
    dawn: ['#527497', '#b593a9', '#f8cba1']
  };
  return Object.fromEntries(Object.entries(colors).map(([name, stops]) => {
    const layer = surfaceCanvas(width, height);
    const context = layer.getContext('2d');
    const gradient = context.createLinearGradient(0, 0, 0, height);
    stops.forEach((color, i) => gradient.addColorStop(i / 2, color));
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
    if (name === 'night') {
      for (let index = 0; index < 50; index++) {
        const x = (index * 137.15 + 13) % width;
        const y = (index * 19.87 + 4) % 107;
        context.fillStyle = index % 5 === 0 ? '#f7e7be' : '#e2e5fa88';
        context.beginPath();
        context.arc(x, y, index % 5 === 0 ? 1 : .55, 0, Math.PI * 2);
        context.fill();
      }
      context.fillStyle = '#f9e3ab';
      context.beginPath();
      context.arc(297, 73.5, 22, 0, Math.PI * 2);
      context.fill();
      context.globalCompositeOperation = 'destination-out';
      context.beginPath();
      context.arc(305, 66, 21, 0, Math.PI * 2);
      context.fill();
      context.globalCompositeOperation = 'destination-over';
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);
    } else {
      context.fillStyle = name === 'dusk' ? '#ffdaa8' : '#fff0c3';
      context.beginPath();
      context.arc(297, name === 'dusk' ? 98 : 79, 24, 0, Math.PI * 2);
      context.fill();
    }
    context.globalCompositeOperation = 'destination-in';
    context.drawImage(mask, 0, 0);
    return [name, layer];
  }));
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

function drawSkyLayer(name, weight) {
  if (name === 'day' || weight <= 0) return;
  const tint = { dusk: '#a35e6d43', night: '#111a47a0', dawn: '#635a8640' };
  ctx.save();
  ctx.globalAlpha = weight;
  ctx.fillStyle = tint[name];
  ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  ctx.drawImage(skies[name], 0, 0, WORLD_WIDTH, 310);
  ctx.restore();
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
  ctx.clearRect(x, y, camera.width, camera.height);
  ctx.drawImage(camp, 0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  const sky = skyState();
  drawSkyLayer(sky.from, 1 - sky.mix);
  drawSkyLayer(sky.to, sky.mix);
  const clockText = skyLabels[sky.mix > .35 ? sky.to : sky.from];
  if (el('time-label').textContent !== clockText) el('time-label').textContent = clockText;
  const night = (sky.from === 'night' ? 1 - sky.mix : 0) + (sky.to === 'night' ? sky.mix : 0);
  drawFirelight(697, 547, 132, .13 + night * .36);
  drawFirelight(169, 502, 90, .09 + night * .29);
  drawFirelight(1658, 625, 95, .08 + night * .28);
  for (let i = 0; i < 7; i++) {
    const rise = (animationClock * 23 + i * 14) % 97;
    ctx.fillStyle = 'rgba(255,204,123,' + ((1 - rise / 97) * .8) + ')';
    ctx.fillRect(699 + Math.sin(rise * .08 + i) * 15, 537 - rise, 2.7, 2.7);
  }

  shadow(300, 565, 24);
  drawSprite(ctx, sprites.mara, 300, 565, 98);
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
  camera.zoom = Math.max(rect.width / WORLD_WIDTH, rect.height / WORLD_HEIGHT);
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
  const current = controlsActive() ? nearbyLandmark(player) : undefined;
  if (selectedLandmark === current) return;
  selectedLandmark = current;
  el('status').hidden = !current;
  el('status').textContent = current ? current.label + ' · E / Interact' : '';
  el('interact').disabled = !current;
}

function updateNotes() {
  const remaining = landmarks.filter(landmark => !visited.has(landmark.id));
  el('trail-notes').textContent = remaining.length
    ? 'Camp discoveries: ' + visited.size + ' / 3'
    : 'Camp explored · Mara, mine doorway, and canopy trail';
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
      avatar, footing: savedFooting, phaseClock: phaseClock % DAY_LENGTH, visited: [...visited]
    }));
  } catch { /* Play remains available if browser storage is disabled. */ }
}

function begin(save) {
  if (!sprites) return;
  avatar = save?.avatar ?? avatar;
  phaseClock = Number.isFinite(save?.phaseClock) ? clamp(save.phaseClock, 0, DAY_LENGTH) : 0;
  visited = new Set(landmarks.filter(landmark => Array.isArray(save?.visited) && save.visited.includes(landmark.id)).map(landmark => landmark.id));
  player = createPlayer(save?.footing);
  savedFooting = { x: player.x, ground: player.ground };
  cat.x = clamp(player.x - 62, 19, WORLD_WIDTH - 19);
  cat.y = player.y;
  tracker.length = 0;
  playing = true;
  el('start').hidden = true;
  clearControls();
  updateNotes();
  updateCamera(true);
  updatePrompt();
  saveCamp();
  world.focus({ preventScroll: true });
}

function interact() {
  if (!controlsActive() || !selectedLandmark) return;
  const id = selectedLandmark.id;
  const info = conversations[id];
  visited.add(id);
  talking = true;
  clearControls();
  updatePrompt();
  updateNotes();
  saveCamp();
  el('speaker').textContent = info.name;
  el('speaker-role').textContent = info.role;
  el('line').textContent = info.greeting;
  el('choices').replaceChildren();
  el('portrait').hidden = id !== 'mara';
  if (id === 'mara') drawPortrait(el('portrait'), sprites.mara);
  for (const [question, answer] of info.options) {
    const choice = document.createElement('button');
    choice.type = 'button';
    choice.textContent = question;
    choice.addEventListener('click', () => { el('line').textContent = answer; });
    el('choices').append(choice);
  }
  el('dialogue').hidden = false;
  (el('choices').firstElementChild ?? el('close-dialogue')).focus({ preventScroll: true });
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
    const [scenery, party, keepers] = await Promise.all([
      loadImage('./camp.webp'), loadImage('./party.webp'), loadImage('./keepers.webp')
    ]);
    camp = scenery;
    skies = buildSkyLayers(camp);
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

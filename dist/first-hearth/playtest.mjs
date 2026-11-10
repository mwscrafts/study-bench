import { VIEW_WIDTH, SPAWN_X, CAMP_X, campTerrain, landmarks, flowers,
  groundAt, surfaceAt, clamp, createPlayer, jump, movePlayer, nearbyLandmark } from './terrain.mjs';
import { buildCampArt, paintHorizon, paintCampTint, paintFlame, paintFlower } from './camp-art.mjs';
import { crownwoodTerrain, crownwoodLandmarks, crownwoodFlower, crystalNodes, crownwoodLocation, crownwoodShadows } from './crownwood.mjs';
import { buildCrownwoodArt, paintCrownwoodWater, paintCrystal, paintCrownwoodShadow } from './crownwood-art.mjs';
import { mineTerrain, mineLandmarks, mineLocation, mineShadows, ivo, netChest, oreNodes } from './mine.mjs';
import { buildMineArt, paintMineLights, paintMineChest, paintOre } from './mine-art.mjs';

const el = id => document.getElementById(id);
const world = el('world');
const ctx = world.getContext('2d');
const SAVE_KEY = 'first-hearth:alder-camp:v1';
const DAY_LENGTH = 136;
const skyModes = ['auto', 'day', 'dusk', 'night', 'dawn'];
const skyLabels = { day: 'Daylight', dusk: 'Dusk', night: 'Night', dawn: 'Dawn' };
const heldKeys = new Set();
const heldPointers = new Map();
const camera = { x: 0, y: 0, width: VIEW_WIDTH, height: 600, zoom: 1, density: 1, pixelWidth: VIEW_WIDTH, pixelHeight: 600, baseZoom: 1 };
const tracker = [];
const cat = { x: SPAWN_X - 72, y: groundAt(SPAWN_X), direction: 1, gait: 0 };
let sprites;
const backgrounds = {};
let region = 'camp';
let terrain = campTerrain;
let crystals = new Set();
let iron = new Set();
let hasNet = false;
let ivoQuest = false;
let nightIndex = 0;
let shadowHits = 0;
let hitUntil = 0;
let creatures = [];
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

const regions = {
  camp: {
    title: ['Alder', 'Camp'],
    intro: 'Follow Reedbank Trail to camp, meet Mara, and take Alvin up into the branches.',
    terrain: campTerrain, landmarks, flowers, buildArt: buildCampArt
  },
  crownwood: {
    title: ['Crownwood', 'Canopy'],
    intro: 'Climb Three Boughs, cross the rope bridge, and look for a way down to the falls.',
    terrain: crownwoodTerrain, landmarks: crownwoodLandmarks, flowers: [crownwoodFlower],
    buildArt: buildCrownwoodArt, location: crownwoodLocation, shadows: crownwoodShadows, retreat: 'Root Landing'
  },
  mine: {
    title: ['Embervein', 'Mine'],
    intro: 'Follow the lanterns down to Ivo, look for iron seams, and find the old lift.',
    terrain: mineTerrain, landmarks: mineLandmarks, flowers: [],
    buildArt: buildMineArt, location: mineLocation, shadows: mineShadows, retreat: 'Timber Shaft'
  }
};
const knownLandmarks = Object.values(regions).flatMap(area => area.landmarks);
const knownFlowers = Object.values(regions).flatMap(area => area.flowers);

const conversations = {
  mara: { name: 'Mara', role: 'FORGE KEEPER' },
  ivo: { name: 'Ivo', role: 'KEEPER OF EMBERVEIN' },
  lift: {
    name: 'The old lift',
    role: 'MARA’S CLEARING',
    greeting: 'The lift goes down to Ivo’s mine, but its cable hangs slack. You can still reach the mine door on foot.'
  },
  'mine-lift': {
    name: 'The lift base',
    role: 'EMBERVEIN MINE',
    greeting: 'The old lift reaches Mara’s clearing. One of the bearings is cracked. Ivo needs a tideglass gemstone from the beach before he can repair it. The timber shaft leads back to camp.'
  },
  'first-hearth': {
    name: 'A passage behind the falls',
    role: 'MIST SHELF',
    greeting: 'Behind the curtain of water, you can make out a stone passage and a faint orange light. The passage opens in a later playtest.'
  },
  'king-trail': {
    name: 'The King’s Grounds',
    role: 'CROWN OVERLOOK',
    greeting: 'The trail ends at an arch overlooking the ruins. The King’s Grounds open in a later playtest.'
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
  const height = landmark.id === 'mara' || landmark.id === 'ivo' ? 125 : 103;
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
  if (region !== 'mine') {
    paintHorizon(ctx, camera, sky.from, 1, animationClock);
    if (sky.from !== sky.to) paintHorizon(ctx, camera, sky.to, sky.mix, animationClock);
  }
  ctx.drawImage(backgrounds[region], 0, 0);
  const phase = sky.mix > .35 ? sky.to : sky.from;
  const clockText = phase === 'night' && skyMode === 'auto' ? 'Night ' + (nightIndex + 1) : skyLabels[phase];
  if (el('time-label').textContent !== clockText) el('time-label').textContent = clockText;
  const night = (sky.from === 'night' ? 1 - sky.mix : 0) + (sky.to === 'night' ? sky.mix : 0);
  if (region !== 'mine') paintCampTint(ctx, camera, night);
  if (region === 'camp') {
    drawFirelight(2258, 595, 132, .18 + night * .42);
    drawFirelight(2150, 582, 90, .08 + night * .25);
    drawFirelight(4168, 677, 90, .12 + night * .31);
    paintFlame(ctx, 2258, 604, animationClock);
    for (let i = 0; i < 7; i++) {
      const rise = (animationClock * 26 + i * 14) % 97;
      ctx.fillStyle = 'rgba(255,204,123,' + ((1 - rise / 97) * .8) + ')';
      ctx.fillRect(2258 + Math.sin(rise * .08 + i) * 15, 594 - rise, 2.7, 2.7);
    }
    const mara = landmarks[0];
    shadow(mara.x, mara.y, 24);
    drawSprite(ctx, sprites.mara, mara.x, mara.y, 98);
  } else if (region === 'crownwood') {
    if (camera.x < 4100 && camera.x + camera.width > 3200) paintCrownwoodWater(ctx, animationClock);
    crystalNodes.forEach(node => {
      if (!crystals.has(node.id)) paintCrystal(ctx, node, animationClock);
    });
  } else {
    paintMineLights(ctx, camera, animationClock, night);
    paintMineChest(ctx, hasNet);
    for (const node of oreNodes) {
      if (!iron.has(node.id)) paintOre(ctx, node, animationClock);
    }
    shadow(ivo.x, ivo.y, 26);
    drawSprite(ctx, sprites.ivo, ivo.x, ivo.y, 105);
  }
  creatures.forEach(creature => paintCrownwoodShadow(ctx, creature, animationClock));
  currentFlowers().forEach(flower => {
    if (!collected.has(flower.id)) paintFlower(ctx, flower, selectedLandmark === flower, animationClock);
  });
  if (playing) {
    shadow(cat.x, cat.y, 17);
    drawSprite(ctx, sprites.alvin, cat.x, cat.y, 44, cat.direction,
      -Math.abs(Math.sin(cat.gait)) * 2.2, Math.sin(cat.gait) * .035);
  }
  if (player.ground) shadow(player.x, player.y, 22);
  if (animationClock < hitUntil && Math.floor(animationClock * 13) % 2) ctx.globalAlpha = .52;
  drawSprite(ctx, sprites[avatar], player.x, player.y, 97, player.direction,
    player.moving && player.ground ? -Math.abs(Math.sin(gait)) * 4 : 0,
    player.moving ? Math.sin(gait) * .045 : 0);
  ctx.globalAlpha = 1;
  if (playing) currentLandmarks().forEach(paintMarker);
}

function updateCat(dt) {
  tracker.push({ time: animationClock, x: player.x, y: player.y, ground: player.ground, direction: player.direction });
  const cutoff = animationClock - .26;
  while (tracker.length > 1 && tracker[1].time <= cutoff) tracker.shift();
  const trail = tracker[0];
  const support = terrain.byId.get(trail.ground);
  let targetX = trail.x - trail.direction * 62;
  if (support) {
    targetX = clamp(targetX, support.points[0][0] + 8, support.points.at(-1)[0] - 8);
  }
  targetX = clamp(targetX, 19, terrain.width - 19);
  let targetY = support ? surfaceAt(support, targetX) : trail.y;
  if (atFallsRail()) {
    const rail = crownwoodLandmarks[1];
    targetX = rail.x - 35;
    targetY = surfaceAt(terrain.byId.get('rope-bridge'), targetX);
  }
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

function atFallsRail() {
  return region === 'crownwood' && player.ground === 'rope-bridge' && Math.abs(player.x - crownwoodLandmarks[1].x) < 188;
}

function updateCamera(snap = false, dt = 0) {
  const showFalls = atFallsRail();
  const targetZoom = showFalls ? Math.min(camera.baseZoom, camera.pixelHeight / 445) : camera.baseZoom;
  const factor = snap ? 1 : 1 - Math.exp(-dt * 6);
  camera.zoom += (targetZoom - camera.zoom) * factor;
  camera.width = camera.pixelWidth / camera.zoom;
  camera.height = camera.pixelHeight / camera.zoom;
  const x = clamp(player.x - camera.width * .46, 0, Math.max(0, terrain.width - camera.width));
  const followY = player.y - camera.height * (showFalls ? .31 : .76);
  const y = clamp(followY, 0, Math.max(0, terrain.height - camera.height));
  camera.x += (x - camera.x) * factor;
  camera.y += (y - camera.y) * factor;
}

function resize() {
  const rect = world.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  camera.density = Math.min(2, window.devicePixelRatio || 1);
  world.width = Math.round(rect.width * camera.density);
  world.height = Math.round(rect.height * camera.density);
  camera.pixelWidth = rect.width;
  camera.pixelHeight = rect.height;
  camera.baseZoom = Math.max(rect.width / VIEW_WIDTH, rect.height / 600);
  updateCamera(true);
  if (sprites) paint();
}

function clearControls() {
  heldKeys.clear();
  heldPointers.clear();
  el('left').classList.remove('pressed');
  el('right').classList.remove('pressed');
}

function currentFlowers() {
  return regions[region].flowers;
}

function currentLandmarks() {
  return regions[region].landmarks.filter(item => item !== netChest || !hasNet);
}

function updatePrompt() {
  const items = currentLandmarks().filter(item => item.id !== 'mist-drop' || player.ground === 'rope-bridge');
  items.push(...currentFlowers().filter(flower => !collected.has(flower.id)));
  if (region === 'crownwood') items.push(...crystalNodes.filter(node => !crystals.has(node.id)));
  if (region === 'mine') items.push(...oreNodes.filter(node => !iron.has(node.id)));
  const current = controlsActive() ? nearbyLandmark(player, items) : undefined;
  const message = current ? current.label + ' · E / Interact'
    : controlsActive() && animationClock < noticeUntil ? notice : '';
  selectedLandmark = current;
  if (el('status').textContent !== message) el('status').textContent = message;
  el('status').hidden = !message;
  el('interact').disabled = !current;
}

function updateLocation() {
  const campLocation = player.x < 1140 ? 'Reedbank Trail'
    : player.x < 1830 ? 'Pine Gate'
    : player.x < 2680 ? 'Mara’s Clearing'
    : player.x < 3800 ? 'Root Fork'
    : player.x < 4300 ? 'Timber Gate' : 'Shore Trail';
  const location = regions[region].location?.(player) ?? campLocation;
  if (el('location-name').textContent !== location) el('location-name').textContent = location;
}

function updateNotes() {
  const clue = quest === 'complete' ? 'Brass key earned'
    : quest === 'accepted' ? 'Mara’s dusklilies · ' + collected.size + ' / 3'
    : collected.size ? 'Dusklilies found · ' + collected.size + ' / 3'
    : 'Explore the trail and find Mara by the fire.';
  const mineLoot = 'Iron ore · ' + iron.size + ' / ' + oreNodes.length + (hasNet ? ' · Casting net' : '');
  el('quest-tracker').textContent = region === 'mine' ? mineLoot : clue;
  el('quest-tracker').hidden = false;
  const destinations = ['canopy', 'mine', 'shore'].filter(id => visited.has(id)).length;
  el('trail-notes').textContent = region === 'crownwood'
    ? 'Crownwood crystals · ' + crystals.size + ' / ' + crystalNodes.length
    : region === 'mine' ? (ivoQuest ? 'Ivo needs 1 tideglass gemstone' : 'Follow the lanterns to Ivo')
    : 'Trail entrances found · ' + destinations + ' / 3';
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
      version: 4, avatar, region, footing: savedFooting, phaseClock, nightIndex, shadowHits,
      visited: [...visited], flowers: [...collected], quest, crystals: [...crystals], iron: [...iron], hasNet, ivoQuest
    }));
  } catch { /* Play remains available if browser storage is disabled. */ }
}

function begin(save) {
  if (!sprites) return;
  avatar = save?.avatar ?? avatar;
  phaseClock = Number.isFinite(save?.phaseClock) ? clamp(save.phaseClock, 0, DAY_LENGTH) : 0;
  visited = new Set(knownLandmarks.filter(landmark => Array.isArray(save?.visited) && save.visited.includes(landmark.id)).map(landmark => landmark.id));
  const savedFlowers = Array.isArray(save?.flowers) ? save.flowers : [];
  collected = new Set(knownFlowers.filter(flower => savedFlowers.includes(flower.id)).map(flower => flower.id));
  quest = ['accepted', 'declined', 'complete'].includes(save?.quest) ? save.quest : 'unoffered';
  const savedCrystals = Array.isArray(save?.crystals) ? save.crystals : [];
  crystals = new Set(crystalNodes.filter(node => savedCrystals.includes(node.id)).map(node => node.id));
  const savedIron = Array.isArray(save?.iron) ? save.iron : [];
  iron = new Set(oreNodes.filter(node => savedIron.includes(node.id)).map(node => node.id));
  hasNet = save?.hasNet === true;
  ivoQuest = save?.ivoQuest === true;
  nightIndex = Number.isSafeInteger(save?.nightIndex) ? clamp(save.nightIndex, 0, 1000000) : 0;
  const savedHits = Number.isInteger(save?.shadowHits) ? clamp(save.shadowHits, 0, 2) : 0;
  // Only the original one-screen map has unrelated footing coordinates.
  const footing = save && ![2, 3, 4].includes(save.version) ? { x: CAMP_X, ground: 'trail' } : save?.footing;
  playing = true;
  el('start').hidden = true;
  const savedRegion = Object.hasOwn(regions, save?.region) ? save.region : 'camp';
  enterRegion(savedRegion, footing, savedHits);
}

function enterRegion(next, footing, previousHits = 0) {
  region = next;
  const area = regions[next];
  terrain = area.terrain;
  backgrounds[next] ??= area.buildArt();
  player = createPlayer(footing, terrain);
  shadowHits = previousHits;
  noticeUntil = 0;
  hitUntil = 0;
  creatures = [];
  savedFooting = { x: player.x, ground: player.ground };
  cat.x = clamp(player.x - 62, 19, terrain.width - 19);
  cat.y = player.y;
  cat.gait = 0;
  tracker.length = 0;
  const [firstWord, secondWord] = area.title;
  const title = firstWord + ' ' + secondWord;
  document.title = title + ' · The First Hearth';
  el('region-title').firstChild.textContent = firstWord + ' ';
  el('region-title').lastElementChild.textContent = secondWord;
  el('region-intro').textContent = area.intro;
  world.setAttribute('aria-label', title +
    ' game world. Move with arrows or A and D, jump with Space, and interact with E.');
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

const flowerHint = 'One grows here by the fire, one on Three Boughs inside Crownwood, and one beside the mine door.';

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
  } else if (quest === 'accepted' && collected.size === flowers.length + 1) {
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

function ivoDialogue() {
  const net = hasNet ? 'You’ve got my casting net.' : 'Take the casting net from my chest.';
  setDialogue('Mind the dark past these lamps. Take a breather here if you need one.', [
    ['What happened to the lift?', () => {
      const request = 'A bearing cracked. Bring me 1 tideglass gemstone from the beach and I can get the lift back to Mara’s clearing. ' + net;
      if (ivoQuest) {
        setDialogue(request, [['Back', ivoDialogue]]);
        return;
      }
      setDialogue(request + ' Will you bring one back?', [
        ['Yes, I’ll look for one', () => {
          ivoQuest = true;
          updateNotes();
          saveCamp();
          setDialogue('Thanks. The shore path keeps going past the timber door. When the beach opens, cast the net off Lantern Dock.');
        }],
        ['Maybe later', () => setDialogue('Fair enough. There’s always the timber shaft.', [['Back', ivoDialogue]])]
      ]);
    }],
    ['What do you know about the King?', () => setDialogue(
      'His trail climbs above Crownwood. Mara knows the old stories better than I do. I just know the shadows keep clear of a good lamp.',
      [['Back', ivoDialogue]])]
  ]);
}

function interact() {
  if (!controlsActive() || !selectedLandmark) return;
  const item = selectedLandmark;
  const id = item.id;
  if (currentFlowers().includes(item) || crystalNodes.includes(item) || oreNodes.includes(item) || item === netChest) {
    if (crystalNodes.includes(item)) {
      crystals.add(id);
      notice = 'Crystal gathered · ' + crystals.size + ' / ' + crystalNodes.length;
    } else if (oreNodes.includes(item)) {
      iron.add(id);
      notice = 'Iron ore mined · ' + iron.size + ' / ' + oreNodes.length;
    } else if (item === netChest) {
      hasNet = true;
      notice = 'Casting net taken';
    } else {
      collected.add(id);
      notice = 'Dusklily picked · ' + collected.size + ' / 3';
    }
    noticeUntil = animationClock + 1.6;
    updateNotes();
    updatePrompt();
    saveCamp();
    world.focus({ preventScroll: true });
    return;
  }
  visited.add(id);
  if (id === 'canopy') {
    enterRegion('crownwood');
    return;
  }
  if (id === 'mine') {
    enterRegion('mine');
    return;
  }
  if (id === 'mine-return') {
    enterRegion('camp', { x: 4180, ground: 'trail' });
    return;
  }
  if (id === 'camp-return') {
    enterRegion('camp', { x: 3638, ground: 'crown' });
    return;
  }
  if (id === 'mist-drop') {
    player.y += 6;
    player.ground = null;
    player.velocityY = 150;
    player.jumps = 1;
    updatePrompt();
    return;
  }
  const info = conversations[id];
  talking = true;
  clearControls();
  updatePrompt();
  updateNotes();
  saveCamp();
  el('speaker').textContent = info.name;
  el('speaker-role').textContent = info.role;
  const portrait = id === 'mara' || id === 'ivo' ? sprites[id] : null;
  el('portrait').hidden = !portrait;
  if (portrait) drawPortrait(el('portrait'), portrait);
  el('dialogue').hidden = false;
  if (id === 'mara') maraDialogue();
  else if (id === 'ivo') ivoDialogue();
  else setDialogue(info.greeting + (id === 'shore' ? ' The beach opens in a later playtest.' : ''));
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

function updateShadows() {
  const area = regions[region];
  if (!area.shadows) return;
  creatures = area.shadows(phaseClock, nightIndex);
  if (creatures.length === 0) {
    shadowHits = 0;
    return;
  }
  if (animationClock < hitUntil) return;
  const hit = creatures.some(creature =>
    Math.abs(creature.x - player.x) < 37 && Math.abs(creature.y - player.y + 12) < 49);
  if (!hit) return;
  shadowHits++;
  hitUntil = animationClock + 1.8;
  if (shadowHits >= 3) {
    shadowHits = 0;
    enterRegion(region);
    notice = 'Alvin led you back to ' + area.retreat + '.';
  } else {
    notice = 'Shadow hit · ' + (3 - shadowHits) + ' before retreat';
    saveCamp();
  }
  noticeUntil = animationClock + 1.7;
}

function frame(time) {
  const dt = Math.min(.08, (time - (lastFrame || time)) / 1000);
  lastFrame = time;
  if (!paused && !talking) animationClock += dt;
  if (controlsActive()) {
    const right = heldKeys.has('d') || heldKeys.has('arrowright') || [...heldPointers.values()].includes(1);
    const left = heldKeys.has('a') || heldKeys.has('arrowleft') || [...heldPointers.values()].includes(-1);
    const direction = Number(right) - Number(left);
    for (let remaining = dt; remaining > 0;) {
      const step = Math.min(remaining, 1 / 120);
      movePlayer(player, direction, step, terrain);
      remaining -= step;
    }
    if (player.ground) savedFooting = { x: player.x, ground: player.ground };
    if (player.moving) gait += dt * 15;
    phaseClock += dt;
    if (phaseClock >= DAY_LENGTH) {
      phaseClock -= DAY_LENGTH;
      nightIndex++;
    }
    updateShadows();
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
    backgrounds.camp = buildCampArt();
    sprites = {
      boy: spriteBounds(party, 0, 1 / 3, .64),
      girl: spriteBounds(party, 1 / 3, 2 / 3, .63),
      alvin: spriteBounds(party, 2 / 3, 1, .65),
      mara: spriteBounds(keepers, .5, 1, .55),
      ivo: spriteBounds(keepers, 0, .5, .52)
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

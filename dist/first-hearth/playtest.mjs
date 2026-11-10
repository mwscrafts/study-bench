import { VIEW_WIDTH, SPAWN_X, CAMP_X, campTerrain, landmarks, flowers,
  groundAt, surfaceAt, clamp, createPlayer, jump, movePlayer, nearbyLandmark } from './terrain.mjs';
import { buildCampArt, paintHorizon, paintCampTint, paintFlame, paintFlower, paintCraftingProps } from './camp-art.mjs';
import { crownwoodTerrain, crownwoodLandmarks, crownwoodFlower, crystalNodes, crownwoodLocation, crownwoodShadows } from './crownwood.mjs';
import { buildCrownwoodArt, paintCrownwoodWater, paintCrystal, paintCrownwoodShadow } from './crownwood-art.mjs';
import { mineTerrain, mineLandmarks, mineLocation, mineShadows, ivo, netChest, oreNodes } from './mine.mjs';
import { buildMineArt, paintMineLights, paintMineChest, paintOre } from './mine-art.mjs';
import { beachTerrain, beachLandmarks, beachFlower, beachLocation, beachShadows, readFishing, castNet } from './beach.mjs';
import { buildBeachArt, paintBeachHorizon, paintBeachDetails } from './beach-art.mjs';
import { workbench, flint, timberTrees, WOOD_COST, readTools, spareWood } from './crafting.mjs';
import { SWING_TIME, TOOL_COOLDOWN, SWING_IMPACT, BERRY_HEAL, gear, berryBushes, puff, floater,
  advanceGatheringEffects, paintGatheringEffects, paintHeldTool, paintBerryBush } from './equipment.mjs';
import { renderInventory } from './backpack.mjs';

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
let tools = readTools();
let fishing = readFishing();
let casting = null;
let nightIndex = 0;
let health = 100;
let berries = 3;
let pickedBushes = new Set();
let equipped = null;
let inventoryOpen = false;
let swing = 0;
let cooldown = 0;
let swingTarget = null;
let swingDirection = 1;
let particles = [];
let floaters = [];
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
    terrain: campTerrain, landmarks: [...landmarks, workbench], flowers, buildArt: buildCampArt
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
  },
  beach: {
    title: ['The', 'Beach'],
    intro: 'Follow the bluff to Driftwood Cove and cast Ivo’s net off Lantern Dock.',
    terrain: beachTerrain, landmarks: beachLandmarks, flowers: [beachFlower],
    buildArt: buildBeachArt, location: beachLocation, shadows: beachShadows, retreat: 'Salt Pines'
  }
};
const knownLandmarks = Object.values(regions).flatMap(area => area.landmarks);
const knownFlowers = Object.values(regions).flatMap(area => area.flowers);
const gates = {
  canopy: { region: 'crownwood' },
  mine: { region: 'mine' },
  shore: { region: 'beach' },
  'camp-return': { region: 'camp', footing: { x: 3638, ground: 'crown' } },
  'mine-return': { region: 'camp', footing: { x: 4180, ground: 'trail' } },
  'shore-return': { region: 'camp', footing: { x: 4510, ground: 'trail' } }
};
const liftGates = {
  lift: { region: 'mine', footing: { x: 4340, ground: 'mine-floor' } },
  'mine-lift': { region: 'camp', footing: { x: 2300, ground: 'trail' } }
};

const conversations = {
  mara: { name: 'Mara', role: 'FORGE KEEPER' },
  ivo: { name: 'Ivo', role: 'KEEPER OF EMBERVEIN' },
  workbench: { name: 'Camp workbench', role: 'CRAFTING' },
  dock: { name: 'Lantern Dock', role: 'CASTING NET' },
  'tool-needed': { name: 'Tool needed', role: 'GATHERING' },
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
  'tide-arch': {
    name: 'Tide Arch', role: 'COASTAL OVERLOOK',
    greeting: 'Through the arch you can see the lights of the dock. The trail back to Alder Camp follows the shore and climbs through the pines.'
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
    const paintSky = region === 'beach' ? paintBeachHorizon : paintHorizon;
    paintSky(ctx, camera, sky.from, 1, animationClock);
    if (sky.from !== sky.to) paintSky(ctx, camera, sky.to, sky.mix, animationClock);
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
    paintCraftingProps(ctx, tools);
    for (const bush of berryBushes) paintBerryBush(ctx, bush, pickedBushes.has(bush.id));
  } else if (region === 'crownwood') {
    if (camera.x < 4100 && camera.x + camera.width > 3200) paintCrownwoodWater(ctx, animationClock);
    crystalNodes.forEach(node => {
      if (!crystals.has(node.id)) paintCrystal(ctx, node, animationClock);
    });
  } else if (region === 'mine') {
    paintMineLights(ctx, camera, animationClock, night);
    paintMineChest(ctx, hasNet);
    for (const node of oreNodes) {
      if (!iron.has(node.id)) paintOre(ctx, node, animationClock);
    }
    shadow(ivo.x, ivo.y, 26);
    drawSprite(ctx, sprites.ivo, ivo.x, ivo.y, 105);
  } else {
    paintBeachDetails(ctx, camera, animationClock, night, casting);
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
  const bob = player.moving && player.ground ? -Math.abs(Math.sin(gait)) * 4 : 0;
  const tilt = (player.moving ? Math.sin(gait) * .045 : 0) + swing * -.23;
  const facing = swing > 0 ? swingDirection : player.direction;
  drawSprite(ctx, sprites[avatar], player.x, player.y, 97, facing, bob, tilt);
  if (playing) paintHeldTool(ctx, player.x, player.y, facing, equipped, swing, bob, tilt);
  ctx.globalAlpha = 1;
  paintGatheringEffects(ctx, particles, floaters);
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
  return playing && !paused && !talking && !casting && !inventoryOpen;
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
  if (region === 'camp') {
    items.push(...timberTrees.filter(tree => !tools.chopped.includes(tree.id)));
    items.push(...berryBushes.filter(bush => !pickedBushes.has(bush.id)));
    if (!tools.flint && !tools.pickaxe) items.push(flint);
  }
  const current = controlsActive() ? nearbyLandmark(player, items) : undefined;
  const label = fishing.tideglass === 'spent' && liftGates[current?.id] ? 'Ride the lift' : current?.label;
  const message = casting ? 'Casting the net…' : label ? label + ' · E / Interact'
    : controlsActive() && animationClock < noticeUntil ? notice : '';
  selectedLandmark = current;
  if (el('status').textContent !== message) el('status').textContent = message;
  el('status').hidden = !message;
  const canSwing = equipped === 'hatchet' || equipped === 'pickaxe';
  el('interact').disabled = !controlsActive() || (!current && !canSwing);
  const actionLabel = !current && canSwing ? 'Swing' : 'Interact';
  if (el('action-label').textContent !== actionLabel) el('action-label').textContent = actionLabel;
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
  const equipment = tools.pickaxe ? gear[equipped][1]
    : tools.hatchet ? 'Hatchet · Wood ' + spareWood(tools) + '/' + WOOD_COST + ' · Flint ' + Number(tools.flint) + '/1'
    : 'Ask Mara for a hatchet';
  el('quest-tracker').textContent = region === 'mine' ? mineLoot : clue;
  el('tool-notes').textContent = region === 'beach'
    ? [hasNet ? 'Casting net' : 'Find Ivo’s casting net', fishing.book && 'Soaked book',
      fishing.tideglass === 'caught' && 'Tideglass', fishing.godslayer && 'Godslayer'].filter(Boolean).join(' · ')
    : equipment;
  el('hpText').textContent = health;
  el('hpBar').style.width = health + '%';
  el('healthMeter').setAttribute('aria-valuenow', String(health));
  el('health-notes').hidden = false;
  el('tool-notes').hidden = false;
  el('quest-tracker').hidden = false;
  const destinations = ['canopy', 'mine', 'shore'].filter(id => visited.has(id)).length;
  el('trail-notes').textContent = region === 'crownwood'
    ? 'Crownwood crystals · ' + crystals.size + ' / ' + crystalNodes.length
    : region === 'mine' ? (fishing.tideglass === 'spent' ? 'Lift repaired'
      : ivoQuest ? 'Ivo needs 1 tideglass gemstone' : 'Follow the lanterns to Ivo')
    : region === 'beach' ? 'Lantern Dock catches · Fish ' + fishing.fish + ' · Driftwood ' + fishing.driftwood
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
      version: 6, avatar, region, footing: savedFooting, phaseClock, nightIndex, health, berries, equipped, pickedBushes: [...pickedBushes],
      visited: [...visited], flowers: [...collected], quest, crystals: [...crystals], iron: [...iron], hasNet, ivoQuest, tools, fishing
    }));
  } catch { /* Play remains available if browser storage is disabled. */ }
}

function begin(save) {
  if (!sprites) return;
  avatar = save?.avatar ?? avatar;
  phaseClock = Number.isFinite(save?.phaseClock) ? clamp(save.phaseClock, 0, DAY_LENGTH) : 0;
  visited = new Set(knownLandmarks.filter(landmark => Array.isArray(save?.visited) && save.visited.includes(landmark.id)).map(landmark => landmark.id));
  const savedFlowers = Array.isArray(save?.flowers)
    ? save.flowers.map(id => id === 'timber' ? beachFlower.id : id) : [];
  collected = new Set(knownFlowers.filter(flower => savedFlowers.includes(flower.id)).map(flower => flower.id));
  quest = ['accepted', 'declined', 'complete'].includes(save?.quest) ? save.quest : 'unoffered';
  const savedCrystals = Array.isArray(save?.crystals) ? save.crystals : [];
  crystals = new Set(crystalNodes.filter(node => savedCrystals.includes(node.id)).map(node => node.id));
  const savedIron = Array.isArray(save?.iron) ? save.iron : [];
  iron = new Set(oreNodes.filter(node => savedIron.includes(node.id)).map(node => node.id));
  hasNet = save?.hasNet === true;
  ivoQuest = save?.ivoQuest === true;
  tools = readTools(save?.tools);
  fishing = readFishing(save?.fishing);
  nightIndex = Number.isSafeInteger(save?.nightIndex) ? clamp(save.nightIndex, 0, 1000000) : 0;
  const legacyHits = Number.isInteger(save?.shadowHits) ? clamp(save.shadowHits, 0, 2) : 0;
  health = Number.isInteger(save?.health) ? clamp(save.health, 1, 100) : 100 - legacyHits * 34;
  berries = Number.isSafeInteger(save?.berries) ? Math.max(0, save.berries) : 3;
  const savedBushes = Array.isArray(save?.pickedBushes) ? save.pickedBushes : [];
  pickedBushes = new Set(berryBushes.filter(bush => savedBushes.includes(bush.id)).map(bush => bush.id));
  equipped = ownsGear(save?.equipped) ? save.equipped
    : tools.pickaxe ? 'pickaxe' : tools.hatchet ? 'hatchet' : hasNet ? 'net' : null;
  el('inventoryButton').disabled = false;
  // Only the original one-screen map has unrelated footing coordinates.
  const footing = save && ![2, 3, 4, 5, 6].includes(save.version) ? { x: CAMP_X, ground: 'trail' } : save?.footing;
  playing = true;
  el('start').hidden = true;
  const savedRegion = Object.hasOwn(regions, save?.region) ? save.region : 'camp';
  enterRegion(savedRegion, footing);
}

function enterRegion(next, footing) {
  region = next;
  const area = regions[next];
  terrain = area.terrain;
  // Keep camp and the current area cached to bound memory on mobile.
  if (next !== 'camp') {
    for (const key of Object.keys(backgrounds)) {
      if (key !== 'camp' && key !== next) delete backgrounds[key];
    }
  }
  backgrounds[next] ??= area.buildArt();
  player = createPlayer(footing, terrain);
  swing = 0;
  cooldown = 0;
  swingTarget = null;
  particles = [];
  floaters = [];
  noticeUntil = 0;
  hitUntil = 0;
  creatures = [];
  casting = null;
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

const flowerHint = 'One grows here by the fire, one on Three Boughs inside Crownwood, and one on the raised ledge at Driftwood Cove, on the beach.';

function setQuest(state) {
  quest = state;
  updateNotes();
  saveCamp();
}

function maraDialogue() {
  const tool = [tools.hatchet ? 'How do I make a pickaxe?' : 'Can I get a gathering tool?', () => {
    if (!tools.hatchet) {
      tools.hatchet = true;
      equipped = 'hatchet';
      updateNotes();
      saveCamp();
    }
    setDialogue('Take my old hatchet. It cuts marked pines. Pick up loose flint by the root trail, then use 3 wood and 1 flint at the workbench east of the fire to make a pickaxe.',
      [['Back', maraDialogue]]);
  }];
  const paths = ['Where do the trails go?', () => setDialogue(
    'At the root fork, jump up into Crownwood. Stay on the ground for the mine. The shore trail keeps going past the mine door.',
    [['Back', maraDialogue]])];
  if (quest === 'complete') {
    setDialogue('That brass key opens an old box. If you find a place where the fire still burns behind falling water, try it there.', [tool, paths]);
  } else if (quest === 'accepted' && collected.size === knownFlowers.length) {
    setDialogue('Three dusklilies! I used to pick these on the way home. Here’s the brass key I promised.', [
      ['Give Mara the 3 dusklilies', () => {
        setQuest('complete');
        setDialogue('Brass key received. Keep it for the old box behind falling water. Alvin, see if you can keep them out of trouble.');
      }], tool, paths]);
  } else if (quest === 'accepted') {
    setDialogue('You’ve found ' + collected.size + ' of the 3 dusklilies. ' + flowerHint, [tool, paths]);
  } else {
    const greeting = quest === 'declined' ? 'Changed your mind? ' : 'Come warm up. Alvin already has. ';
    setDialogue(greeting + 'Bring me 3 dusklilies and I’ll give you a brass key. ' + flowerHint + ' Will you help?', [
      ['Yes, I’ll find them', () => {
        setQuest('accepted');
        maraDialogue();
      }],
      ['No, maybe later', () => {
        setQuest('declined');
        setDialogue('Fair enough. The fire’s here whenever you need it.', [tool, paths]);
      }], tool, paths]);
  }
}

function ivoDialogue() {
  if (fishing.tideglass === 'spent') {
    setDialogue('The lift is running. It goes straight back to Mara’s clearing. Step aboard at the far end of the mine.');
    return;
  }
  if (fishing.tideglass === 'caught') {
    setDialogue('That’s tideglass! It’ll fit the lift bearing. I can have it running right now.', [
      ['Give Ivo the tideglass', () => {
        fishing.tideglass = 'spent';
        ivoQuest = true;
        updateNotes();
        saveCamp();
        setDialogue('Lift repaired. Head east to the lift base. You can ride it either way.');
      }]
    ]);
    return;
  }
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
          setDialogue('Thanks. Follow the shore path past the timber door. Cast the net off Lantern Dock.');
        }],
        ['Maybe later', () => setDialogue('Fair enough. There’s always the timber shaft.', [['Back', ivoDialogue]])]
      ]);
    }],
    ['What do you know about the King?', () => setDialogue(
      'His trail climbs above Crownwood. Mara knows the old stories better than I do. I just know the shadows keep clear of a good lamp.',
      [['Back', ivoDialogue]])]
  ]);
}

function workbenchDialogue() {
  if (tools.pickaxe) {
    setDialogue('Your pickaxe is ready. Use it on the iron seams in Embervein and the crystals in Crownwood.');
    return;
  }
  const materials = 'Pickaxe recipe · ' + spareWood(tools) + ' / ' + WOOD_COST + ' wood · ' + Number(tools.flint) + ' / 1 flint. ';
  const ready = spareWood(tools) >= WOOD_COST && tools.flint;
  if (!ready) {
    setDialogue(materials + (tools.hatchet
      ? 'Chop marked pines and pick up the loose flint by the root trail.'
      : 'Ask Mara for a hatchet to start gathering wood.'));
    return;
  }
  setDialogue(materials + 'It’ll mine iron and crystals.', [
    ['Craft pickaxe', () => {
      tools.pickaxe = true;
      equipped = 'pickaxe';
      tools.flint = false;
      updateNotes();
      saveCamp();
      workbenchDialogue();
    }]
  ]);
}

const bookClue = 'The water blurred most of the writing. One sketch shows a rope bridge with a gap in its railing, a ledge beneath it, and a light behind the waterfall.';

function dockDialogue(result) {
  if (!hasNet) {
    setDialogue('You need a casting net. Ivo keeps one in the chest next to his lantern in Embervein Mine.');
    return;
  }
  const choices = [['Cast the net', () => {
    equipped = 'net';
    updateNotes();
    saveCamp();
    casting = { start: animationClock, x: player.x, y: player.y };
    closeDialogue();
    clearControls();
    updatePrompt();
  }]];
  if (fishing.book) {
    choices.push(['Read the soaked book', () => setDialogue(bookClue, [['Back', () => dockDialogue()]])]);
  }
  setDialogue(result ?? 'The water is calm here. Cast the net from the end of the pier.', choices);
}

function finishCast() {
  const result = castNet(fishing);
  fishing = result.fishing;
  casting = null;
  openDialogue('dock');
  let message = 'You caught ' + result.catchName.toLowerCase() + '.';
  if (result.catchName === 'Soaked book') message = 'The net comes up heavy with a soaked book. There’s still a legible sketch inside.';
  if (result.catchName === 'Tideglass gemstone') message = 'Tideglass gemstone caught. Bring it back to Ivo to repair the lift.';
  if (result.rare) message += ' Tangled in the net alongside it is the Godslayer.';
  dockDialogue(message);
}

function openDialogue(id) {
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
}

function ownsGear(id) {
  if (id === 'net') return hasNet;
  return (id === 'hatchet' || id === 'pickaxe') && tools[id];
}

function inventoryItems() {
  const items = [
    ['▰', 'Wood', spareWood(tools), 'Chopped from marked pines.'],
    ['⬟', 'Flint', Number(tools.flint), 'Loose stone used at the camp workbench.'],
    ['◆', 'Crystal', crystals.size, 'Gathered with a pickaxe in Crownwood.'],
    ['▧', 'Iron ore', iron.size, 'Mined with a pickaxe in Embervein.'],
    ['●', 'Berries', berries, 'Saved until you eat them. Restores up to 25 health.'],
    ['✿', 'Dusklilies', quest === 'complete' ? 0 : collected.size, 'Bring three to Mara for a brass key.']
  ];
  if (quest === 'complete') items.push(['⚿', 'Brass key', 1, 'Mara’s key. Look for an old box behind falling water.']);
  if (fishing.book) items.push(['▤', 'Soaked book', 1, bookClue]);
  if (fishing.tideglass === 'caught') items.push(['◇', 'Tideglass gemstone', 1, 'Take it to Ivo to repair the lift.']);
  if (fishing.fish) items.push(['◈', 'Fish', fishing.fish, 'Caught at Lantern Dock.']);
  if (fishing.driftwood) items.push(['≋', 'Driftwood', fishing.driftwood, 'Pulled from the tide.']);
  if (fishing.godslayer) items.push(['†', 'Godslayer', 1, 'A rare catch from Lantern Dock.']);
  return items;
}

function refreshInventory() {
  renderInventory(el, inventoryItems(), ownsGear, equipped, equipTool, berries, health);
}

function equipTool(id) {
  if (!ownsGear(id)) return;
  if (equipped !== id) {
    swingTarget = null;
    swing = 0;
  }
  equipped = id;
  updateNotes();
  updatePrompt();
  saveCamp();
  if (inventoryOpen) {
    refreshInventory();
    el('weaponRack').children[Object.keys(gear).indexOf(id)].focus({ preventScroll: true });
  }
}

function openInventory() {
  if (!controlsActive()) return;
  inventoryOpen = true;
  clearControls();
  el('inventoryOverlay').hidden = false;
  refreshInventory();
  updatePrompt();
  el('closeInventory').focus({ preventScroll: true });
}

function closeInventory() {
  inventoryOpen = false;
  el('inventoryOverlay').hidden = true;
  clearControls();
  updatePrompt();
  world.focus({ preventScroll: true });
}

function eatBerry() {
  if ((!controlsActive() && !inventoryOpen) || berries < 1 || health >= 100) return;
  berries--;
  const heal = Math.min(BERRY_HEAL, 100 - health);
  health += heal;
  floater(floaters, player.x, player.y - 97, '+' + heal + ' health', '#b5dda1');
  updateNotes();
  saveCamp();
  if (inventoryOpen) {
    refreshInventory();
    if (el('bagEat').disabled) el('closeInventory').focus({ preventScroll: true });
  }
}

function gather(item) {
  const { id, x, y } = item;
  if (crystalNodes.includes(item)) {
    crystals.add(id);
    notice = 'Crystal gathered · ' + crystals.size + ' / ' + crystalNodes.length;
    puff(particles, x, y - 24, '#a3e4cf');
    floater(floaters, x, y - 65, '+1 crystal');
  } else if (oreNodes.includes(item)) {
    iron.add(id);
    notice = 'Iron ore mined · ' + iron.size + ' / ' + oreNodes.length;
    puff(particles, x, y - 24, '#dfb595');
    floater(floaters, x, y - 65, '+1 iron ore');
  } else if (item === netChest) {
    hasNet = true;
    if (!equipped) equipped = 'net';
    notice = 'Casting net taken';
  } else if (item === flint) {
    tools.flint = true;
    notice = 'Flint picked up';
  } else if (timberTrees.includes(item)) {
    tools.chopped.push(id);
    notice = 'Wood gathered';
    puff(particles, x, y - 32, '#c4b98b');
    floater(floaters, x, y - 65, '+1 wood');
  } else if (berryBushes.includes(item)) {
    pickedBushes.add(id);
    berries += 3;
    notice = 'Berries saved to backpack';
    puff(particles, x, y - 24, '#ce8c8d');
    floater(floaters, x, y - 65, '+3 berries');
  } else {
    collected.add(id);
    notice = 'Dusklily picked · ' + collected.size + ' / 3';
  }
  noticeUntil = animationClock + 1.6;
  updateNotes();
  updatePrompt();
  saveCamp();
}

function startSwing(item) {
  if (cooldown > 0) return;
  cooldown = TOOL_COOLDOWN;
  swing = SWING_TIME;
  swingTarget = item;
  swingDirection = item ? Math.sign(item.x - player.x) || player.direction : player.direction;
  player.direction = swingDirection;
}

function updateSwing(dt) {
  cooldown = Math.max(0, cooldown - dt);
  swing = Math.max(0, swing - dt);
  if (!swingTarget || swing > SWING_IMPACT) return;
  const item = swingTarget;
  swingTarget = null;
  if (nearbyLandmark(player, [item])) gather(item);
}

function interact() {
  if (!controlsActive() || swingTarget) return;
  const item = selectedLandmark;
  if (!item) {
    if (equipped === 'hatchet' || equipped === 'pickaxe') startSwing();
    return;
  }
  const id = item.id;
  const mineral = crystalNodes.includes(item) || oreNodes.includes(item);
  const tree = timberTrees.includes(item);
  if (mineral || tree) {
    const required = mineral ? 'pickaxe' : 'hatchet';
    if (equipped === required) {
      startSwing(item);
    } else {
      const hint = ownsGear(required) ? 'Open your backpack and equip the ' + gear[required][1].toLowerCase() + '.'
        : mineral ? 'Craft a pickaxe at the Alder Camp workbench to mine this.'
        : 'Ask Mara for her hatchet to chop marked pines.';
      openDialogue('tool-needed');
      setDialogue(hint);
      return;
    }
    world.focus({ preventScroll: true });
    return;
  }
  if (currentFlowers().includes(item) || item === netChest || item === flint || berryBushes.includes(item)) {
    gather(item);
    world.focus({ preventScroll: true });
    return;
  }
  visited.add(id);
  const gate = gates[id] ?? (fishing.tideglass === 'spent' ? liftGates[id] : null);
  if (gate) {
    enterRegion(gate.region, gate.footing);
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
  openDialogue(id);
  if (id === 'mara') maraDialogue();
  else if (id === 'ivo') ivoDialogue();
  else if (id === 'workbench') workbenchDialogue();
  else if (id === 'dock') dockDialogue();
  else setDialogue(conversations[id].greeting);
}

function closeDialogue() {
  talking = false;
  el('dialogue').hidden = true;
  updatePrompt();
  world.focus({ preventScroll: true });
}

function setPause(value) {
  if (!playing || talking || inventoryOpen) return;
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
  if (creatures.length === 0 || animationClock < hitUntil) return;
  const hit = creatures.some(creature =>
    Math.abs(creature.x - player.x) < 37 && Math.abs(creature.y - player.y + 12) < 49);
  if (!hit) return;
  health = Math.max(0, health - 34);
  hitUntil = animationClock + 1.8;
  if (health === 0) {
    health = 100;
    enterRegion(region);
    notice = 'Alvin led you back to ' + area.retreat + '.';
  } else {
    notice = 'Shadow hit · ' + health + ' health left';
    updateNotes();
    saveCamp();
  }
  noticeUntil = animationClock + 1.7;
}

function frame(time) {
  const dt = Math.min(.08, (time - (lastFrame || time)) / 1000);
  lastFrame = time;
  if (!paused && !talking && !inventoryOpen) animationClock += dt;
  if (casting && animationClock - casting.start >= .92) finishCast();
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
    updateSwing(dt);
    [particles, floaters] = advanceGatheringEffects(particles, floaters, dt);
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

el('inventoryButton').addEventListener('click', () => inventoryOpen ? closeInventory() : openInventory());
el('closeInventory').addEventListener('click', closeInventory);
el('bagEat').addEventListener('click', eatBerry);

const moveKeys = new Set(['a', 'd', 'arrowleft', 'arrowright']);
const jumpKeys = new Set([' ', 'w', 'arrowup']);
window.addEventListener('keydown', event => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  const key = event.key.toLowerCase();
  if (key === 'i' && !event.repeat) {
    if (inventoryOpen) closeInventory();
    else openInventory();
    return;
  }
  if (inventoryOpen) {
    if (key === 'escape') closeInventory();
    if (key === 'q' && !event.repeat) eatBerry();
    return;
  }
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
  if (event.repeat) return;
  if (key === 'e') interact();
  if (key === 'q') eatBerry();
  if (key === '1') equipTool('hatchet');
  if (key === '2') equipTool('pickaxe');
  if (key === 'x') {
    const owned = Object.keys(gear).filter(ownsGear);
    if (owned.length) equipTool(owned[(owned.indexOf(equipped) + 1) % owned.length]);
  }
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

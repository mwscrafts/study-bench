import { VIEW_WIDTH, SPAWN_X, CAMP_X, campTerrain, landmarks, flowers,
  groundAt, surfaceAt, clamp, createPlayer, jump, dropThrough, movePlayer, nearbyLandmark } from './terrain.mjs?v=15';
import { buildCampArt, paintHorizon, paintCampTint, paintFlame, paintFlower, paintCraftingProps } from './camp-art.mjs?v=12';
import { crownwoodLandmarks, crownwoodTimberTrees, crystalNodes } from './crownwood.mjs?v=13';
import { paintCrownwoodWater, paintCrystal, paintCrownwoodShadow, paintCrownwoodPines } from './crownwood-art.mjs?v=13';
import { hugh, netChest, oreNodes, flint } from './mine.mjs?v=15';
import { paintMineLights, paintMineChest, paintOre, paintFlint } from './mine-art.mjs?v=04';
import { rootdeepTerrain, rootdeepLandmarks, rootglassNodes, rootdeepOreNodes, glowcapNodes } from './rootdeep.mjs?v=4';
import { paintRootdeepLights, paintRootglass, paintDorrin, paintRootdeepLift,
  paintRootdeepSettler, paintGlowcap, buildRootdeepArt } from './rootdeep-art.mjs?v=8';
import { beachFlower, readFishing, castNet } from './beach.mjs?v=1';
import { paintBeachHorizon, paintBeachDetails } from './beach-art.mjs';
import { timberTrees, WOOD_COST, readTools, spareWood } from './crafting.mjs?v=16';
import { SWING_TIME, TOOL_COOLDOWN, SWING_IMPACT, BERRY_HEAL, gear, berryBushes, puff, floater,
  advanceGatheringEffects, paintGatheringEffects, paintHeldTool, paintBerryBush } from './equipment.mjs?v=09';
import { renderInventory } from './backpack.mjs?v=09';
import { hearthNote } from './hearth.mjs?v=10';
import { paintHearthDetails } from './hearth-art.mjs';
import { kingLandmarks, ARENA, TRIAL_START, REST_X, MAX_BOSS_HP,
  endings, startTrial, trialBounds, attackTrial, advanceTrial, trialHint, formatTime } from './king.mjs?v=12';
import { paintKingGrounds, paintFireworks } from './king-art.mjs?v=13';
import { readVictory, openTimeBoard } from './time-board.mjs?v=10';
import { paintRestoredKing } from './village.mjs?v=11';
import { campFacilities, paintHutWindow, paintHutDecor, paintCampFacilities } from './camp-idle.mjs?v=18';
import { createPresence } from './presence.mjs?v=2';
import { regions, knownLandmarks, knownFlowers, gates, liftGates, conversations } from './world-data.mjs?v=5';
import { WAVE_TIME, loadImage, spriteBounds, drawSprite, drawPortrait, paintComposureWraith,
  paintWave, paintOpenLift, paintLodestone } from './canvas-art.mjs?v=2';

const allTimberTrees = [...timberTrees, ...crownwoodTimberTrees];
const allIronNodes = [...oreNodes, ...rootdeepOreNodes];
const el = id => document.getElementById(id);
const world = el('world');
const ctx = world.getContext('2d');
const SAVE_KEY = 'first-hearth:alder-camp:v1';
const PRESENCE_KEY = 'first-hearth:solo:v1';
const DAY_LENGTH = 136;
const ROOTDEEP_LADDER_X = 1780;
const ROOTDEEP_CLIMB_SPEED = 430;
const BERRY_GROW_MS = 3 * 60 * 1000;
const CATNIP_GROW_MS = 10 * 60 * 1000;
const ALVIN_GROWTH_SECONDS = 10 * 60;
const MINECART_TICK_MS = 4 * 60 * 1000;
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
let rootglass = new Set();
let rootdeepQuest = 'unoffered';
let gatheredGlowcaps = new Set();
let glowcaps = 0;
let glowcapQuest = 'unoffered';
let glowcapLanternLit = false;
let rootKeyQuest = 'unoffered';
let rootKeyGuidance = false;
let hasRootKey = false;
let activatedLodestones = new Set();
let alvinSignalUntil = 0;
// Rootdeep uses one continuous ladder shaft; this flag keeps gravity off while attached.
let rootdeepClimbing = false;
let iron = new Set();
let ironStock = 0;
let shadowStock = 0;
let defeatedShadows = new Set();
let shadowHealth = new Map();
let hasNet = false;
let hughQuest = false;
let tools = readTools();
let fishing = readFishing();
let casting = null;
let nightIndex = 0;
let health = 100;
let composure = 100;
let composureDamageClock = 0;
let berries = 3;
let pickedBushes = new Set();
let berrySeeds = 3;
let berryPlots = [null, null, null];
let catnipUnlocked = false;
let alvinCatnipVisits = 0;
let catCombat = null;
let catCombatReadyAt = 0;
let alvinGrowthRemaining = 0;
let catnipReadyAt = 0;
let catnipShowUntil = 0;
let catnipLeap = null;
let petHeartsUntil = 0;
let minecartOre = 0;
let minecartUpdatedAt = Date.now();
let minecartCapacity = 8;
let activeRequest = null;
let completedRequests = new Set();
let campTokens = 0;
let hutDecorations = new Set();
let equipped = null;
let inventoryOpen = false;
let testRun = false;
let adminRing = false;
let adminPanelFromRing = false;
let swing = 0;
let wave = 0;
let cooldown = 0;
let swingTarget = null;
let swingDirection = 1;
let particles = [];
let floaters = [];
let hitUntil = 0;
let creatures = [];
let creatureCycleKey = '';
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
let hearthLearned = false;
let trial = null;
let victory = null;
let swingCombat = false;
let fireworksElapsed = Infinity;
let difficulty = 'easy';
let fishFed = 0;
let endingScene = null;
let finaleDelay = 0;
let notice = '';
let noticeUntil = 0;
let savedFooting = { x: player.x, ground: player.ground };
let publicName = 'Adventurer';
let onlineEnabled = true;
try { onlineEnabled = localStorage.getItem(PRESENCE_KEY) !== 'solo'; } catch { /* Online play still works. */ }

const presence = createPresence({
  getRegion: () => region,
  getPose: () => ({
    region, x: Math.round(player.x * 10) / 10, y: Math.round(player.y * 10) / 10,
    direction: player.direction, moving: controlsActive() && player.moving,
    gait: gait % (Math.PI * 2), swing, wave: Math.round(wave * 100) / 100,
    avatar, tool: equipped, helmet: tools.helmet, name: publicName,
    alvin: { x: cat.x, y: cat.y, direction: cat.direction, gait: cat.gait,
      size: 1 + fishFed / 4, indoors: region === 'hut' }
  }),
  isOnline: () => onlineEnabled,
  isPlaying: () => playing,
  isHidden: () => document.hidden,
  onChange: updatePresenceButton,
  onDoorsChange: () => { updatePrompt(); updateNotes(); },
  onNotesChange: () => { if (playing) updateNotes(); }
});
const peers = presence.peers;
const sharedDoors = presence.sharedDoors;

function startWave() {
  if (!controlsActive()) return;
  wave = WAVE_TIME;
  sendPose(true);
}

function openSharedDoor(door) {
  presence.openDoor(door);
}

function updatePresenceButton() {
  const button = el('presence-toggle');
  const connected = presence.isConnected();
  button.textContent = onlineEnabled ? connected ? 'Public · ' + (peers.size + 1) : 'Public…' : 'Solo';
  button.setAttribute('aria-pressed', String(onlineEnabled));
  button.title = onlineEnabled ? 'Public world. Switch to solo play.' : 'Solo play. Switch to the public world.';
}

function disconnectPresence(reason = 'Leaving world') {
  presence.disconnect(reason);
  if (playing) updateNotes();
}

function connectPresence() { presence.connect(); }
function sendPose(force = false) { presence.sendPose(force); }

function paintPeers() {
  for (const [id, peer] of peers) {
    const pose = peer.pose;
    if (peer.leftAt) {
      const faded = (Date.now() - peer.leftAt) / 5000;
      if (faded >= 1) { peers.delete(id); updatePresenceButton(); continue; }
    }
    if (pose.region !== region || !sprites?.[pose.avatar]) continue;
    const alvin = pose.alvin;
    if (alvin && Number.isFinite(alvin.x) && Number.isFinite(alvin.y)) {
      peer.alvinX ??= alvin.x;
      peer.alvinY ??= alvin.y;
      peer.alvinX += (alvin.x - peer.alvinX) * .38;
      peer.alvinY += (alvin.y - peer.alvinY) * .38;
      const indoor = alvin.indoors === true;
      const size = Number.isFinite(alvin.size) ? clamp(alvin.size, 1, 3) : 1;
      ctx.save();
      if (peer.leftAt) ctx.globalAlpha = 1 - (Date.now() - peer.leftAt) / 5000;
      shadow(peer.alvinX, peer.alvinY, 17);
      drawSprite(ctx, sprites.alvin, peer.alvinX, peer.alvinY, (indoor ? 37 : 44) * size,
        indoor ? 1 : alvin.direction, indoor ? 0 : -Math.abs(Math.sin(alvin.gait || 0)) * 2.2,
        indoor ? -Math.PI / 2 : Math.sin(alvin.gait || 0) * .035);
      ctx.restore();
    }
    peer.x += (pose.x - peer.x) * .38;
    peer.y += (pose.y - peer.y) * .38;
    const bob = pose.moving ? -Math.abs(Math.sin(pose.gait)) * 4 : 0;
    const tilt = (pose.moving ? Math.sin(pose.gait) * .045 : 0) + pose.swing * -.23;
    ctx.save();
    if (peer.leftAt) ctx.globalAlpha = 1 - (Date.now() - peer.leftAt) / 5000;
    shadow(peer.x,peer.y,22);
    drawSprite(ctx,sprites[pose.avatar],peer.x,peer.y,97,pose.direction,bob,tilt);
    if (pose.helmet) {
      ctx.fillStyle = '#a3b9b5';
      ctx.beginPath(); ctx.ellipse(peer.x,peer.y-69+bob,19,10,0,Math.PI,0); ctx.fill();
      ctx.fillRect(peer.x-21,peer.y-70+bob,42,4);
    }
    paintHeldTool(ctx,peer.x,peer.y,pose.direction,pose.tool,pose.swing,bob,tilt);
    paintWave(ctx,peer.x,peer.y,pose.direction,pose.wave ?? 0,bob);
    ctx.font = 'bold 13px system-ui, sans-serif';
    const label = pose.name || 'Adventurer';
    const width = Math.min(165,ctx.measureText(label).width + 16);
    ctx.fillStyle = '#142b25df'; ctx.fillRect(peer.x-width/2,peer.y-121,width,19);
    ctx.fillStyle = '#fff1d5'; ctx.textAlign = 'center';
    ctx.fillText(label,peer.x,peer.y-107,150);
    ctx.restore();
  }
}

function skyState() {
  if (region === 'king' && (trial || victory)) {
    const phase = victory ? 'dawn' : 'night';
    return { from: phase, to: phase, mix: 0 };
  }
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
  const height = landmark.id === 'lyss' || landmark.id === 'hugh' ? 125 : 103;
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

function paintRegionalLodestones() {
  for (const stone of regions[region].landmarks.filter(item => item.id.startsWith('lodestone-'))) {
    paintLodestone(ctx, stone, activatedLodestones.has(stone.id), animationClock);
  }
}

function paintRootdeepLock() {
  if (hasRootKey || sharedDoors.has('rootdeep-entrance')) return;
  const stone = crownwoodLandmarks.find(item => item.id === 'rootdeep-entrance');
  const x = stone.x, y = stone.y - 4;
  ctx.save();
  ctx.strokeStyle = '#6e8072'; ctx.lineWidth = 11; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - 56, y - 8); ctx.lineTo(x - 56, y - 73);
  ctx.moveTo(x + 56, y - 8); ctx.lineTo(x + 56, y - 73);
  ctx.moveTo(x - 56, y - 65); ctx.lineTo(x + 56, y - 65);
  ctx.moveTo(x - 56, y - 35); ctx.lineTo(x + 56, y - 35);
  ctx.moveTo(x - 56, y - 5); ctx.lineTo(x + 56, y - 5); ctx.stroke();
  ctx.fillStyle = '#e4c989'; ctx.strokeStyle = '#263a32'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(x, y - 49, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillRect(x - 3, y - 44, 6, 14);
  ctx.restore();
}

function paint() {
  const { density, zoom, x, y } = camera;
  ctx.setTransform(density * zoom, 0, 0, density * zoom, -x * density * zoom, -y * density * zoom);
  const sky = skyState();
  const outdoors = region !== 'mine' && region !== 'rootdeep' && region !== 'hearth' && region !== 'house' && region !== 'hut'
    && !region.startsWith('rootdeep-home-');
  if (outdoors) {
    const paintSky = region === 'beach' ? paintBeachHorizon : paintHorizon;
    paintSky(ctx, camera, sky.from, 1, animationClock);
    if (sky.from !== sky.to) paintSky(ctx, camera, sky.to, sky.mix, animationClock);
  }
  if (region === 'rootdeep') {
    const image = backgrounds[region];
    const scaleX = image.width / terrain.width;
    const scaleY = image.height / terrain.height;
    const sx = Math.max(0, Math.floor(camera.x * scaleX));
    const sy = Math.max(0, Math.floor(camera.y * scaleY));
    const sw = Math.min(image.width - sx, Math.ceil(camera.width * scaleX));
    const sh = Math.min(image.height - sy, Math.ceil(camera.height * scaleY));
    ctx.drawImage(image, sx, sy, sw, sh, camera.x, camera.y, sw / scaleX, sh / scaleY);
  } else ctx.drawImage(backgrounds[region], 0, 0);
  const phase = sky.mix > .35 ? sky.to : sky.from;
  const clockText = region === 'king' && trial && !victory ? 'Final night'
    : phase === 'night' && skyMode === 'auto' ? 'Night ' + (nightIndex + 1) : skyLabels[phase];
  if (el('time-label').textContent !== clockText) el('time-label').textContent = clockText;
  const night = (sky.from === 'night' ? 1 - sky.mix : 0) + (sky.to === 'night' ? sky.mix : 0);
  if (outdoors) paintCampTint(ctx, camera, night);
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
    const lyss = landmarks[0];
    shadow(lyss.x, lyss.y, 24);
    drawSprite(ctx, sprites.lyss, lyss.x, lyss.y, 98);
    paintCraftingProps(ctx, tools);
    if (fishing.tideglass === 'spent' || sharedDoors.has('mine-lift')) paintOpenLift(ctx,2415,groundAt(2415)-127);
    for (const bush of berryBushes) paintBerryBush(ctx, bush, pickedBushes.has(bush.id));
    paintCampFacilities(ctx, { berryPlots, growMs:BERRY_GROW_MS, catnipUnlocked,
      catnipReadyAt, catnipShowUntil, minecartOre, minecartUnlocked: fishing.tideglass === 'spent' && hughQuest }, animationClock);
  } else if (region === 'crownwood') {
    paintCrownwoodPines(ctx, tools.chopped);
    const barry = crownwoodLandmarks.find(item => item.id === 'barry');
    shadow(barry.x, barry.y, 29);
    ctx.save();
    ctx.translate(barry.x, barry.y);
    ctx.fillStyle = '#514c3c'; ctx.fillRect(-19,-49,38,41);
    ctx.fillStyle = '#bd9680'; ctx.fillRect(-13,-77,26,29);
    ctx.fillStyle = '#262322';
    for (const [x,y] of [[-14,-77],[-6,-86],[5,-86],[15,-77]]) {
      ctx.beginPath(); ctx.arc(x,y,9,0,Math.PI*2); ctx.fill();
    }
    ctx.fillStyle = '#302925'; ctx.fillRect(-6,-61,3,3); ctx.fillRect(5,-61,3,3);
    ctx.fillStyle = '#48332a'; ctx.fillRect(-18,-8,14,8); ctx.fillRect(6,-8,14,8);
    ctx.restore();
    if (camera.x < 4100 && camera.x + camera.width > 3200) paintCrownwoodWater(ctx, animationClock);
    crystalNodes.forEach(node => {
      if (!crystals.has(node.id)) paintCrystal(ctx, node, animationClock);
    });
    paintRegionalLodestones();
    paintRootdeepLock();
  } else if (region === 'rootdeep') {
    paintRootdeepLights(ctx, camera, animationClock, night, glowcapLanternLit);
    for (const node of rootglassNodes) if (!rootglass.has(node.id)) paintRootglass(ctx,node,animationClock);
    for (const node of rootdeepOreNodes) if (!iron.has(node.id)) paintOre(ctx,node,animationClock);
    for (const node of glowcapNodes) if (!gatheredGlowcaps.has(node.id)) paintGlowcap(ctx,node,animationClock);
    const dorrin = rootdeepLandmarks.find(item => item.id === 'dorrin');
    shadow(dorrin.x,dorrin.y,15);
    paintDorrin(ctx,dorrin.x,dorrin.y,animationClock);
    for (const [x,variant] of [[430,1],[810,2]]) {
      const y = surfaceAt(rootdeepTerrain.byId.get('rootdeep-level-4'),x);
      shadow(x,y,13);
      paintRootdeepSettler(ctx,x,y,animationClock,variant,.46);
    }
    const high = rootdeepLandmarks.find(item => item.id === 'rootdeep-lift-high');
    const low = rootdeepLandmarks.find(item => item.id === 'rootdeep-lift-low');
    // The upper winch is drawn into the settlement artwork so its snapped/repaired
    // cable can change as one coherent illustration; only the lower cage is overlaid.
    paintRootdeepLift(ctx,low.x,low.y,rootdeepQuest === 'complete');
  } else if (region.startsWith('rootdeep-home-')) {
    const resident = regions[region].landmarks[1];
    shadow(resident.x,resident.y,13);
    paintRootdeepSettler(ctx,resident.x,resident.y,animationClock,
      region.endsWith('lantern') ? 1 : region.endsWith('stone') ? 2 : 3,.52);
  } else if (region === 'mine') {
    paintMineLights(ctx, camera, animationClock, night);
    paintMineChest(ctx, hasNet);
    if (fishing.tideglass === 'spent' || sharedDoors.has('mine-lift')) paintOpenLift(ctx,4510,695);
    for (const node of oreNodes) {
      if (!iron.has(node.id)) paintOre(ctx, node, animationClock);
    }
    if (!tools.flint) paintFlint(ctx);
    paintRegionalLodestones();
    shadow(hugh.x, hugh.y, 26);
    drawSprite(ctx, sprites.hugh, hugh.x, hugh.y, 105);
  } else if (region === 'beach') {
    paintBeachDetails(ctx, camera, animationClock, night, casting);
    paintRegionalLodestones();
  } else if (region === 'hearth') {
    paintHearthDetails(ctx, animationClock, night, hearthLearned);
  } else if (region === 'king') {
    paintKingGrounds(ctx, trial, endingScene && !endingScene.struck ? { ...victory, ending: null } : victory, animationClock, endingScene, sharedDoors.has('village-gate'));
    if (trial?.stage === 'shadows') trial.shadows.forEach((shadow, index) =>
      paintCrownwoodShadow(ctx, { ...shadow, index }, animationClock));
    paintFireworks(ctx, camera, fireworksElapsed);
  } else if (region === 'village' && victory?.ending === 'free') {
    paintRestoredKing(ctx);
  } else if (region === 'hut') {
    paintHutWindow(ctx, phase, animationClock);
    paintHutDecor(ctx, hutDecorations);
  }
  creatures.forEach(creature => paintCrownwoodShadow(ctx, creature, animationClock));
  currentFlowers().forEach(flower => {
    if (!collected.has(flower.id)) paintFlower(ctx, flower, selectedLandmark === flower, animationClock);
  });
  paintPeers();
  if (playing && composure < 10 && region !== 'hut' && !region.startsWith('rootdeep-home-')) {
    paintComposureWraith(ctx, clamp(player.x - player.direction * 92, 45, terrain.width - 45), player.y, animationClock);
  }
  if (playing) {
    const indoor = region === 'hut';
    const catX = indoor ? 665 : cat.x;
    const catY = indoor ? 596 : cat.y;
    shadow(catX, catY, 17);
    drawSprite(ctx, sprites.alvin, catX, catY, (indoor ? 37 : 44) * (1 + fishFed / 4), indoor ? 1 : cat.direction,
      indoor ? 0 : -Math.abs(Math.sin(cat.gait)) * 2.2, indoor ? -Math.PI / 2 : Math.sin(cat.gait) * .035);
    if (indoor && petHeartsUntil > animationClock) {
      const left = petHeartsUntil-animationClock;
      ctx.fillStyle = 'rgba(244,170,198,'+Math.min(.95,left)+')'; ctx.font='15px system-ui';
      ctx.fillText('♥',642,565-(2.2-left)*12); ctx.fillText('♥',680,557-(2.2-left)*15);
    }
    if (region === 'king' && victory && fireworksElapsed < 1.8) {
      ctx.strokeStyle = '#462d26';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(cat.x + 13, cat.y - 27);
      ctx.lineTo(cat.x + 17, cat.y - 25);
      ctx.lineTo(cat.x + 21, cat.y - 28);
      ctx.stroke();
    }
  }
  if (player.ground) shadow(player.x, player.y, 22);
  if (animationClock < hitUntil && Math.floor(animationClock * 13) % 2) ctx.globalAlpha = .52;
  const bob = player.moving && player.ground ? -Math.abs(Math.sin(gait)) * 4 : 0;
  const tilt = (player.moving ? Math.sin(gait) * .045 : 0) + swing * -.23;
  const facing = swing > 0 ? swingDirection : player.direction;
  drawSprite(ctx, sprites[avatar], player.x, player.y, 97, facing, bob, tilt);
  if (tools.helmet && playing) {
    ctx.fillStyle = '#a3b9b5';
    ctx.beginPath(); ctx.ellipse(player.x, player.y - 69 + bob, 19, 10, 0, Math.PI, 0); ctx.fill();
    ctx.fillRect(player.x - 21, player.y - 70 + bob, 42, 4);
  }
  if (playing) paintHeldTool(ctx, player.x, player.y, facing, equipped, swing, bob, tilt);
  if (playing) paintWave(ctx, player.x, player.y, player.direction, wave, bob);
  ctx.globalAlpha = 1;
  paintGatheringEffects(ctx, particles, floaters);
  if (playing) currentLandmarks().forEach(paintMarker);
}

function updateAlvinCombat() {
  if (alvinCatnipVisits < 3 || region === 'hut' || victory || trial?.stage === 'alvin') return false;
  if (!catCombat) {
    if (animationClock < catCombatReadyAt) return false;
    let kind = null, target = null;
    if (trial?.stage === 'shadows') {
      kind = 'trial';
      target = trial.shadows.filter(item => Math.hypot(item.x-cat.x,item.y-cat.y) < 280)
        .sort((a,b) => Math.hypot(a.x-cat.x,a.y-cat.y)-Math.hypot(b.x-cat.x,b.y-cat.y))[0];
    } else if (trial?.stage === 'duel' && trial.boss?.hp > 1) {
      kind = 'trial';
      target = Math.hypot(trial.boss.x-cat.x, ARENA.ground-cat.y) < 300 ? trial.boss : null;
    } else if (!trial) {
      kind = 'field';
      target = creatures.filter(item => Math.hypot(item.x-cat.x,item.y-cat.y) < 280)
        .sort((a,b) => Math.hypot(a.x-cat.x,a.y-cat.y)-Math.hypot(b.x-cat.x,b.y-cat.y))[0];
    }
    if (!target) return false;
    const direction = Math.sign(target.x-cat.x) || cat.direction;
    catCombat = { kind, index: target.index, target, direction, startedAt: animationClock,
      fromX: cat.x, fromY: cat.y, strikeX: target.x-direction*35, strikeY: kind === 'trial' && trial?.stage === 'duel' ? ARENA.ground : target.y, hit: false };
    catCombatReadyAt = animationClock + 2.8;
  }
  const attack = catCombat;
  const elapsed = animationClock - attack.startedAt;
  if (elapsed < .28) {
    const t = clamp(elapsed/.28,0,1);
    cat.x = attack.fromX+(attack.strikeX-attack.fromX)*t;
    cat.y = attack.fromY+(attack.strikeY-attack.fromY)*t-Math.sin(Math.PI*t)*48;
    cat.direction = attack.direction;
  } else if (elapsed < .7) {
    const t = clamp((elapsed-.28)/.42,0,1);
    cat.x = attack.strikeX+(attack.fromX-attack.strikeX)*t;
    cat.y = attack.strikeY+(attack.fromY-attack.strikeY)*t;
  }
  if (!attack.hit && elapsed >= .28) {
    attack.hit = true;
    const power = 6 + fishFed;
    if (attack.kind === 'trial' && trial) {
      const result = attackTrial(trial, { x:cat.x, y:cat.y, direction:attack.direction }, 'hatchet', power/37);
      if (result?.damage > 0) {
        puff(particles,result.x,result.y-44,'#d9b8ea',8);
        floater(floaters,result.x,result.y-90,'Alvin −'+result.damage);
        updateTrialHud(); saveCamp();
      }
    } else if (attack.kind === 'field') {
      const target = creatures.find(item => item.index === attack.index);
      if (target) {
        const id = region + ':' + nightIndex + ':' + target.index;
        const remaining = (shadowHealth.get(id) ?? 60 + Math.min(nightIndex,8)*18) - power;
        shadowHealth.set(id,remaining);
        puff(particles,target.x,target.y-44,'#d9b8ea',8);
        floater(floaters,target.x,target.y-90,'Alvin −'+power);
        if (remaining <= 0) {
          defeatedShadows.add(id);
          creatures = creatures.filter(item => item !== target);
          shadowStock++;
          floater(floaters,target.x,target.y-116,'+1 shadow');
          updateNotes(); saveCamp();
        }
      }
    }
  }
  if (elapsed >= .7) { catCombat = null; return false; }
  return true;
}

function updateCat(dt) {
  tracker.push({ time: animationClock, x: player.x, y: player.y, ground: player.ground, direction: player.direction });
  const cutoff = animationClock - .26;
  while (tracker.length > 1 && tracker[1].time <= cutoff) tracker.shift();
  const trail = tracker[0];
  const support = terrain.byId.get(trail.ground);
  let targetX = trail.x - trail.direction * (55 + fishFed * 4);
  if (support) {
    targetX = clamp(targetX, support.points[0][0] + 8, support.points.at(-1)[0] - 8);
  }
  targetX = clamp(targetX, 19, terrain.width - 19);
  let targetY = support ? surfaceAt(support, targetX) : trail.y;
  if (atFallsRail()) {
    const rail = crownwoodLandmarks.find(item => item.id === 'mist-drop');
    targetX = rail.x - 35;
    targetY = surfaceAt(terrain.byId.get('rope-bridge'), targetX);
  }
  const oldX = cat.x;
  const follow = 1 - Math.exp(-dt * 14);
  cat.x += (targetX - cat.x) * follow;
  cat.y += (targetY - cat.y) * follow;
  if (animationClock < alvinSignalUntil) {
    const t = 1 - (alvinSignalUntil - animationClock) / .95;
    cat.y -= Math.max(0, Math.sin(Math.PI * t)) * 43;
  }
  const movement = cat.x - oldX;
  if (Math.abs(movement) > .35) cat.direction = Math.sign(movement);
  cat.gait += Math.abs(movement) * .11;
}

function updateCatnipLeap() {
  if (!catnipLeap || region !== 'camp') return false;
  const t = clamp((animationClock-catnipLeap.start)/catnipLeap.duration,0,1);
  const targetX = 3040, targetY = groundAt(targetX);
  cat.x = catnipLeap.fromX+(targetX-catnipLeap.fromX)*t;
  cat.y = catnipLeap.fromY+(targetY-catnipLeap.fromY)*t-Math.sin(Math.PI*t)*92;
  cat.direction = Math.sign(targetX-catnipLeap.fromX)||1;
  cat.gait = animationClock*15;
  if (t >= 1) catnipLeap = null;
  return true;
}

function controlsActive() {
  return playing && !paused && !talking && !casting && !inventoryOpen &&
    trial?.stage !== 'alvin' && finaleDelay <= 0 && !endingScene;
}

function nearRootdeepLadder() {
  return region === 'rootdeep' && Math.abs(player.x - ROOTDEEP_LADDER_X) <= 68;
}

function atFallsRail() {
  return region === 'crownwood' && player.ground === 'rope-bridge' &&
    Math.abs(player.x - crownwoodLandmarks.find(item => item.id === 'mist-drop').x) < 188;
}

function updateCamera(snap = false, dt = 0) {
  const showFalls = atFallsRail();
  const focusAlvin = region === 'king' && (trial?.stage === 'alvin' || trial?.stage === 'won' && finaleDelay > 0 || !!endingScene);
  const focusPartnerX = endingScene ? trial?.boss?.x ?? kingLandmarks[3].x : trial?.boss?.x;
  const targetZoom = focusAlvin ? Math.min(camera.baseZoom, camera.pixelWidth / (Math.abs((endingScene ? player.x : cat.x) - focusPartnerX) + 280))
    : showFalls ? Math.min(camera.baseZoom, camera.pixelHeight / 445) : camera.baseZoom;
  const factor = snap ? 1 : 1 - Math.exp(-dt * 6);
  camera.zoom += (targetZoom - camera.zoom) * factor;
  camera.width = camera.pixelWidth / camera.zoom;
  camera.height = camera.pixelHeight / camera.zoom;
  const focusX = focusAlvin ? ((endingScene ? player.x : cat.x) + focusPartnerX) / 2 : player.x;
  const x = clamp(focusX - camera.width * .5, 0, Math.max(0, terrain.width - camera.width));
  const followY = (focusAlvin ? ARENA.ground : player.y) - camera.height * (showFalls ? .31 : .76);
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
  // Keep the horizontal field of view flexible on wide, short screens.
  camera.baseZoom = Math.min(Math.max(rect.width / VIEW_WIDTH, rect.height / 600), rect.height / 425);
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
  if (region === 'king' && trial && !victory) return [];
  const candidates = [...regions[region].landmarks,
    ...(region === 'camp' ? campFacilities : []),
  ];
  return candidates.filter(item =>
    (item !== netChest || !hasNet) && (item.id !== 'fallen-crown' || victory) &&
    (item.id !== 'village-gate' || victory?.ending || sharedDoors.has('village-gate')) &&
    (item.id !== 'restored-king' || victory?.ending === 'free'));
}

function canSleepAtBed() {
  const time = phaseClock % DAY_LENGTH;
  return skyMode === 'night' || (skyMode === 'auto' && time >= 72 && time < 121);
}

function updatePrompt() {
  const items = currentLandmarks().filter(item => (!item.ground || item.ground === player.ground) &&
    !(item.id.startsWith('lodestone-') && activatedLodestones.has(item.id)));
  items.push(...currentFlowers().filter(flower => !collected.has(flower.id)));
  if (region === 'crownwood') items.push(...crystalNodes.filter(node => !crystals.has(node.id)));
  if (region === 'rootdeep') items.push(...rootglassNodes.filter(node => !rootglass.has(node.id)),
    ...rootdeepOreNodes.filter(node => !iron.has(node.id)),
    ...glowcapNodes.filter(node => !gatheredGlowcaps.has(node.id)));
  if (region === 'mine') {
    items.push(...oreNodes.filter(node => !iron.has(node.id)));
    if (!tools.flint) items.push(flint);
  }
  if (region === 'camp') {
    items.push(...timberTrees.filter(tree => !tools.chopped.includes(tree.id)));
    items.push(...berryBushes.filter(bush => !pickedBushes.has(bush.id)));
  } else if (region === 'crownwood') {
    items.push(...crownwoodTimberTrees.filter(tree => !tools.chopped.includes(tree.id)));
  }
  const current = controlsActive() ? nearbyLandmark(player, items) : undefined;
  const onLadder = nearRootdeepLadder() || rootdeepClimbing;
  const label = current?.id.startsWith('rootdeep-ladder-') ? 'Climb the root ladder · hold ↑ / ↓' :
    current?.id === 'hut-bed' && !canSleepAtBed() ? 'Rest by the window' :
    current?.id === 'rootdeep-entrance' && !hasRootKey && !sharedDoors.has('rootdeep-entrance') ? 'Sealed Rootdeep entrance' :
    (current?.id === 'rootdeep-lift-high' || current?.id === 'rootdeep-lift-low') && rootdeepQuest === 'complete' ? 'Ride the restored winch' :
    (fishing.tideglass === 'spent' || sharedDoors.has('mine-lift')) && liftGates[current?.id] ? 'Ride the lift' :
    current?.id === 'village-gate' && sharedDoors.has('village-gate') && !victory?.ending ? 'Enter the open village gate' : current?.label;
  const message = casting ? 'Casting the net…' : label ? label + (current?.id.startsWith('rootdeep-ladder-') ? '' : ' · E / Interact')
    : controlsActive() && animationClock < noticeUntil ? notice : '';
  const jumpCaption = el('jump').querySelector('small');
  if (jumpCaption && jumpCaption.textContent !== (onLadder ? 'Climb' : 'Jump')) jumpCaption.textContent = onLadder ? 'Climb' : 'Jump';
  el('jump').setAttribute('aria-label', onLadder ? 'Hold to climb up the root ladder' : 'Jump');
  el('down').setAttribute('aria-label', onLadder ? 'Hold to climb down the root ladder' : 'Drop down through a ledge');
  selectedLandmark = current;
  if (el('status').textContent !== message) el('status').textContent = message;
  el('status').hidden = !message;
  const canSwing = isStrikeTool(equipped);
  el('interact').disabled = !controlsActive() || (!current && !canSwing);
  el('wave').disabled = !controlsActive();
  const actionLabel = !current && canSwing ? 'Swing' : 'Interact';
  if (el('action-label').textContent !== actionLabel) el('action-label').textContent = actionLabel;
}

function updateLocation() {
  const campLocation = player.x < 1140 ? 'Reedbank Trail'
    : player.x < 1830 ? 'Pine Gate'
    : player.x < 2680 ? 'Lyss’s Clearing'
    : player.x < 3150 ? 'Alder Camp'
    : player.x < 3800 ? 'Root Fork'
    : player.x < 4300 ? 'Timber Gate' : 'Shore Trail';
  const location = regions[region].location?.(player) ?? campLocation;
  if (el('location-name').textContent !== location) el('location-name').textContent = location;
}

function updateNotes() {
  const clue = tools.flowerCrown ? 'Flower crown ready · Return to the King'
    : hearthLearned ? 'Return to Lyss for the flower crown'
    : quest === 'complete' ? 'Brass key earned · Find the hidden box'
    : quest === 'accepted' ? 'Lyss’s dusklilies · ' + collected.size + ' / 3'
    : collected.size ? 'Dusklilies found · ' + collected.size + ' / 3'
    : 'Explore the trail and find Lyss by the fire.';
  const mineLoot = 'Iron ore · ' + ironStock + (hasNet ? ' · Casting net' : '');
  const equipment = tools.pickaxe ? gear[equipped][1]
    : tools.hatchet ? 'Hatchet · Wood ' + spareWood(tools) + '/' + WOOD_COST + ' · Flint ' + Number(tools.flint) + '/1'
    : 'Ask Lyss for a hatchet';
  const rootKeyNote = rootKeyQuest === 'ready' ? 'Return to Hugh for the Root Key'
    : rootKeyQuest === 'accepted' ? (rootKeyGuidance ? 'Old lodestones · ' + activatedLodestones.size + ' / 3'
      : 'Ask Lyss about Hugh’s old symbols') : '';
  const glowcapNote = glowcapQuest === 'accepted' ? 'Glowcaps for the lanterns · ' + Math.min(glowcaps, 3) + ' / 3' : '';
  el('quest-tracker').textContent = rootKeyNote || glowcapNote || (region.startsWith('rootdeep')
    ? (rootdeepQuest === 'complete' ? 'Rootglass winch repaired' : 'Rootglass · ' + rootglass.size + ' / 3')
    : region === 'mine' ? mineLoot
    : region === 'hearth' ? (hearthLearned ? 'Ember note read' : 'A shelter behind the falls') : clue);
  el('tool-notes').textContent = region === 'beach'
    ? [hasNet ? 'Casting net' : 'Find Hugh Mungus’s casting net', fishing.book && 'Soaked book',
      fishing.tideglass === 'caught' && 'Tideglass', fishing.godslayer && 'Godslayer'].filter(Boolean).join(' · ')
    : equipment;
  el('hpText').textContent = health;
  el('hpBar').style.width = health + '%';
  el('composureText').textContent = Math.round(composure);
  el('composureBar').style.width = composure + '%';
  el('composureMeter').setAttribute('aria-valuenow', String(Math.round(composure)));
  el('berryCount').textContent = berries;
  el('quickBerry').disabled = !playing || berries < 1 || health >= 100;
  el('healthMeter').setAttribute('aria-valuenow', String(health));
  el('health-notes').hidden = false;
  el('tool-notes').hidden = region === 'hearth';
  el('quest-tracker').hidden = false;
  const destinations = ['canopy', 'mine', 'shore'].filter(id => visited.has(id)).length;
  el('trail-notes').textContent = region === 'crownwood'
    ? 'Crownwood crystals · ' + crystals.size + ' / ' + crystalNodes.length
    : region === 'mine' ? (fishing.tideglass === 'spent' || sharedDoors.has('mine-lift') ? 'Lift running'
      : hughQuest ? 'Hugh Mungus needs 1 tideglass gemstone' : 'Follow the lanterns to Hugh Mungus')
    : region === 'beach' ? 'Lantern Dock catches · Fish ' + fishing.fish + ' · Driftwood ' + fishing.driftwood
    : region === 'hearth' ? 'Both passages return to Mist Shelf'
    : region === 'king' ? (victory?.ending ? 'Village gate key earned · Gate at the far right'
      : sharedDoors.has('village-gate') ? 'A fellow adventurer opened the village gate' : 'The altar calls the final night')
    : region === 'village' || region === 'house' ? (victory?.ending
      ? 'The village is celebrating your safe return' : 'A fellow adventurer opened the way here')
    : 'Trail entrances found · ' + destinations + ' / 3';
}

function getSavedCamp() {
  try {
    const save = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (save?.avatar === 'boy' || save?.avatar === 'girl') return save;
  } catch { /* A blocked or damaged save can be replaced by a new playtest. */ }
  return null;
}

function savedKnownIds(value, known, resolveId = id => id) {
  const ids = new Set(Array.isArray(value) ? value.map(resolveId) : []);
  return new Set(known.filter(item => ids.has(item.id)).map(item => item.id));
}

function savedQuest(value) {
  return ['accepted', 'declined', 'complete'].includes(value) ? value : 'unoffered';
}

function savedInteger(value, min, max, fallback) {
  return Number.isSafeInteger(value) ? clamp(value, min, max) : fallback;
}

function saveCamp() {
  if (!playing) return;
  try {
    // A shared gate grants passage for this public session, not a permanent quest unlock.
    const sharedVillageVisit = (region === 'village' || region === 'house') && !victory?.ending && !adminRing;
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      version: 18, testRun, adminRing, avatar, region: sharedVillageVisit ? 'king' : region, difficulty, fishFed, alvinGrowthRemaining, publicName,
      footing: sharedVillageVisit ? { x: 3670, ground: 'king-floor' }
        : trial && !victory ? { x: REST_X, ground: 'king-floor' } : savedFooting,
      phaseClock, nightIndex, health, composure, berries, equipped, pickedBushes: [...pickedBushes],
      visited: [...visited], flowers: [...collected], quest, hearthLearned, victory, crystals: [...crystals],
      rootglass: [...rootglass], rootdeepQuest, gatheredGlowcaps: [...gatheredGlowcaps], glowcaps,
      glowcapQuest, glowcapLanternLit,
      rootKeyQuest, rootKeyGuidance, hasRootKey,
      activatedLodestones: [...activatedLodestones], iron: [...iron],
      ironStock, shadowStock, defeatedShadows: [...defeatedShadows], hasNet, hughQuest, tools, fishing,
      berrySeeds, berryPlots, catnipUnlocked, alvinCatnipVisits, catnipReadyAt, minecartOre, minecartUpdatedAt,
      minecartCapacity,
      activeRequest, completedRequests: [...completedRequests], campTokens, hutDecorations: [...hutDecorations]
    }));
  } catch { /* Play remains available if browser storage is disabled. */ }
}

function begin(save) {
  if (!sprites) return;
  testRun = save?.testRun === true;
  adminRing = save?.adminRing === true;
  adminPanelFromRing = false;
  avatar = save?.avatar ?? avatar;
  const chosenName = el('player-name').value.trim() || save?.publicName || 'Adventurer';
  publicName = typeof chosenName === 'string' && chosenName.length <= 16 && /^[\p{L}\p{N} ]+$/u.test(chosenName)
    ? chosenName : 'Adventurer';
  difficulty = save ? (save.difficulty === 'hard' ? 'hard' : 'easy') : difficulty;
  for (const choice of document.querySelectorAll('[data-difficulty]')) {
    choice.setAttribute('aria-pressed', String(choice.dataset.difficulty === difficulty));
  }
  fishFed = savedInteger(save?.fishFed, 0, 8, 0);
  alvinGrowthRemaining = Number.isFinite(save?.alvinGrowthRemaining)
    ? clamp(save.alvinGrowthRemaining, 0, ALVIN_GROWTH_SECONDS)
    : fishFed ? ALVIN_GROWTH_SECONDS : 0;
  if (!fishFed || alvinGrowthRemaining === 0) {
    fishFed = 0;
    alvinGrowthRemaining = 0;
  }
  phaseClock = Number.isFinite(save?.phaseClock) ? clamp(save.phaseClock, 0, DAY_LENGTH) : 0;
  visited = savedKnownIds(save?.visited, knownLandmarks);
  collected = savedKnownIds(save?.flowers, knownFlowers, id => id === 'timber' ? beachFlower.id : id);
  quest = savedQuest(save?.quest);
  hearthLearned = quest === 'complete' && save?.hearthLearned === true;
  tools = readTools(save?.tools);
  victory = readVictory(save?.victory, hearthLearned || tools.flowerCrown);
  crystals = savedKnownIds(save?.crystals, crystalNodes);
  rootglass = savedKnownIds(save?.rootglass, rootglassNodes);
  gatheredGlowcaps = savedKnownIds(save?.gatheredGlowcaps, glowcapNodes);
  glowcaps = savedInteger(save?.glowcaps, 0, glowcapNodes.length, gatheredGlowcaps.size);
  glowcapQuest = ['accepted','complete'].includes(save?.glowcapQuest) ? save.glowcapQuest : 'unoffered';
  glowcapLanternLit = save?.glowcapLanternLit === true;
  rootdeepQuest = savedQuest(save?.rootdeepQuest);
  rootKeyQuest = ['accepted','ready','complete','declined'].includes(save?.rootKeyQuest) ? save.rootKeyQuest : 'unoffered';
  rootKeyGuidance = save?.rootKeyGuidance === true;
  activatedLodestones = new Set(knownLandmarks.filter(item => item.id.startsWith('lodestone-') &&
    Array.isArray(save?.activatedLodestones) && save.activatedLodestones.includes(item.id)).map(item => item.id));
  hasRootKey = save?.hasRootKey === true || rootKeyQuest === 'complete' ||
    save?.region === 'rootdeep' || (Array.isArray(save?.visited) && save.visited.includes('rootdeep-entrance'));
  if (hasRootKey) rootKeyQuest = 'complete';
  iron = savedKnownIds(save?.iron, allIronNodes);
  ironStock = Number.isSafeInteger(save?.ironStock) ? Math.max(0,save.ironStock) : iron.size;
  shadowStock = Number.isSafeInteger(save?.shadowStock) ? Math.max(0,save.shadowStock) : 0;
  defeatedShadows = new Set(Array.isArray(save?.defeatedShadows) ? save.defeatedShadows : []);
  shadowHealth = new Map();
  hasNet = save?.hasNet === true;
  hughQuest = save?.hughQuest === true;
  fishing = readFishing(save?.fishing);
  nightIndex = savedInteger(save?.nightIndex, 0, 1000000, 0);
  const legacyHits = Number.isInteger(save?.shadowHits) ? clamp(save.shadowHits, 0, 2) : 0;
  health = Number.isInteger(save?.health) ? clamp(save.health, 1, 100) : 100 - legacyHits * 34;
  composure = Number.isFinite(save?.composure) ? clamp(save.composure, 0, 100) : 100;
  composureDamageClock = 0;
  berries = Number.isSafeInteger(save?.berries) ? Math.max(0, save.berries) : 3;
  pickedBushes = savedKnownIds(save?.pickedBushes, berryBushes);
  berrySeeds = savedInteger(save?.berrySeeds, 0, 99, 3);
  berryPlots = Array.isArray(save?.berryPlots) ? Array.from({length:3}, (_,i) =>
    Number.isSafeInteger(save.berryPlots[i]) && save.berryPlots[i] > 0 ? save.berryPlots[i] : null) : [null,null,null];
  catnipUnlocked = save?.catnipUnlocked === true;
  alvinCatnipVisits = savedInteger(save?.alvinCatnipVisits, 0, 3, 0);
  catCombat = null; catCombatReadyAt = 0;
  catnipReadyAt = Number.isSafeInteger(save?.catnipReadyAt) ? save.catnipReadyAt : 0;
  minecartUpdatedAt = Number.isSafeInteger(save?.minecartUpdatedAt) ? save.minecartUpdatedAt : Date.now();
  minecartCapacity = save?.minecartCapacity === 12 ? 12 : 8;
  minecartOre = savedInteger(save?.minecartOre, 0, minecartCapacity, 0);
  activeRequest = Object.hasOwn(campRequests, save?.activeRequest) ? save.activeRequest : null;
  completedRequests = new Set(Array.isArray(save?.completedRequests)
    ? save.completedRequests.filter(id => Object.hasOwn(campRequests, id)) : []);
  campTokens = savedInteger(save?.campTokens, 0, 999, 0);
  hutDecorations = new Set(Array.isArray(save?.hutDecorations) ? save.hutDecorations.filter(id =>
    ['canopy-banner','lake-painting','patchwork-quilt'].includes(id)) : []);
  equipped = ownsGear(save?.equipped) ? save.equipped
    : tools.pickaxe ? 'pickaxe' : tools.hatchet ? 'hatchet' : hasNet ? 'net' : null;
  el('inventoryButton').disabled = false;
  el('wave').disabled = false;
  // Only the original one-screen map has unrelated footing coordinates.
  const footing = save && ![2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].includes(save.version) ? { x: CAMP_X, ground: 'trail' } : save?.footing;
  playing = true;
  el('start').hidden = true;
  const savedRegion = Object.hasOwn(regions, save?.region) ? save.region : 'camp';
  enterRegion(savedRegion, footing);
  connectPresence();
  if (region === 'king' && victory && !victory.ending) {
    openDialogue('fallen-crown');
    endingDialogue();
  }
}

function enterRegion(next, footing) {
  region = next;
  trial = null;
  fireworksElapsed = Infinity;
  updateTrialHud();
  const area = regions[next];
  terrain = area.terrain;
  rootdeepClimbing = false;
  // Migrate existing saves from the former split ledge IDs onto the new continuous floors.
  if (next === 'rootdeep' && footing?.ground) {
    const oldRootdeepGround = footing.ground.match(/^rootdeep-level-(\d+)(?:-(?:west|east))?$/);
    if (oldRootdeepGround) footing = { ...footing, ground: `rootdeep-level-${oldRootdeepGround[1]}` };
  }
  // Keep camp and the current area cached to bound memory on mobile.
  if (next !== 'camp') {
    for (const key of Object.keys(backgrounds)) {
      if (key !== 'camp' && key !== next) delete backgrounds[key];
    }
  }
  backgrounds[next] ??= next === 'rootdeep' ? buildRootdeepArt(rootdeepQuest === 'complete') : area.buildArt();
  player = createPlayer(footing, terrain);
  swing = 0;
  cooldown = 0;
  swingTarget = null;
  swingCombat = false;
  particles = [];
  floaters = [];
  noticeUntil = 0;
  hitUntil = 0;
  creatures = [];
  casting = null;
  savedFooting = { x: player.x, ground: player.ground };
  cat.x = clamp(player.x - 62, 19, terrain.width - 19);
  cat.y = player.y;
  if (region === 'hut') { cat.x = 665; cat.y = 596; }
  cat.gait = 0;
  catnipLeap = null;
  catCombat = null;
  tracker.length = 0;
  presence.clearPeers();
  updatePresenceButton();
  sendPose(true);
  const [firstWord, secondWord] = area.title;
  const title = firstWord + ' ' + secondWord;
  document.title = region === 'hearth' ? title : title + ' · The First Hearth';
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

const flowerHint = 'The lilies answer to three kinds of place: warm ground near camp, the high green canopy, and salt air along the shore. Look carefully; I will not spoil their hiding places.';

function setQuest(state) {
  quest = state;
  updateNotes();
  saveCamp();
}

const campRequests = {
  lyss: { who:'Lyss', amount:5, item:'berries', reward:2 },
  barry: { who:'Barry', amount:3, item:'wood', reward:3 },
  hugh: { who:'Hugh Mungus', amount:4, item:'iron ore', reward:3 }
};

function requestChoice(id, bonus = '') {
  const request = campRequests[id];
  return [request.who + ' · ' + request.amount + ' ' + request.item + ' · ' + request.reward + ' tokens' + bonus,
    () => startCampRequest(id)];
}

function requestStock(id) {
  if (id === 'lyss') return berries;
  if (id === 'barry') return spareWood(tools);
  return ironStock;
}

function requestBoardDialogue() {
  const tokens = 'You have ' + campTokens + ' Hearth tokens. ';
  if (activeRequest) {
    const request = campRequests[activeRequest];
    setDialogue(tokens + 'You accepted ' + request.who + '’s request: bring ' + request.amount + ' ' + request.item + '. Return to ' + request.who + ' to hand it over.',
      [['All right', () => closeDialogue()]]);
    return;
  }
  const choices = [requestChoice('lyss'), requestChoice('barry', catnipUnlocked ? '' : ' + catnip seed')];
  if (hughQuest && fishing.tideglass === 'spent') choices.push(requestChoice('hugh', minecartCapacity === 8 ? ' + cart upgrade' : ''));
  setDialogue(tokens + 'Choose one request. Bring the listed supplies back to that person. The requests can be repeated, but only one can be active at a time.', choices);
}

function startCampRequest(id) {
  activeRequest = id;
  saveCamp();
  const request = campRequests[id];
  setDialogue(request.who + ' is waiting for ' + request.amount + ' ' + request.item + '. Come back when you have them.',
    [['Got it', () => closeDialogue()]]);
}

function finishCampRequest(id) {
  if (activeRequest !== id) return false;
  const r = campRequests[id];
  if (requestStock(id) < r.amount) {
    setDialogue(r.who + ' asked for ' + r.amount + ' ' + r.item + '. You have ' +
      requestStock(id) + ' ' + r.item + '. Come back when you have enough.',
      [['I’ll gather more', () => closeDialogue()]]);
    return true;
  }
  if (id === 'lyss') berries -= r.amount;
  else if (id === 'barry') tools.woodDonated = (tools.woodDonated ?? 0) + r.amount;
  else ironStock -= r.amount;
  activeRequest = null;
  campTokens += r.reward;
  const firstTime = !completedRequests.has(id);
  completedRequests.add(id);
  if (id === 'lyss' && firstTime) berrySeeds += 3;
  if (id === 'barry' && firstTime) {
    catnipUnlocked = true;
    catnipReadyAt = Date.now() + 5000;
  }
  if (id === 'hugh' && firstTime) minecartCapacity = 12;
  updateNotes(); saveCamp();
  const bonus = id === 'lyss' && firstTime ? ' She also gives you three berry seeds.'
    : id === 'barry' && firstTime ? ' He gives you a catnip seed for Alvin’s garden.'
    : id === 'hugh' && firstTime ? ' He upgrades the cart so it can carry more ore.' : '';
  setDialogue(r.who + ' accepts the supplies and thanks you. +' + r.reward + ' Hearth tokens.' + bonus,
    [['You’re welcome', () => closeDialogue()]]);
  return true;
}

function berryPlotDialogue() {
  const choices = [];
  for (let i=0;i<berryPlots.length;i++) {
    const plantedAt = berryPlots[i];
    if (!plantedAt) {
      if (berrySeeds > 0) choices.push(['Plant plot ' + (i+1) + ' · ' + berrySeeds + ' seeds left', () => {
        berrySeeds--; berryPlots[i] = Date.now(); saveCamp(); berryPlotDialogue();
      }]);
    } else if (Date.now()-plantedAt >= BERRY_GROW_MS) {
      choices.push(['Harvest plot ' + (i+1) + ' · 4 berries', () => {
        berries += 4; berrySeeds++; berryPlots[i] = null;
        floater(floaters, player.x, player.y-70, '+4 berries'); updateNotes(); saveCamp(); berryPlotDialogue();
      }]);
    }
  }
  const planted = berryPlots.filter(Boolean).length;
  const waiting = berryPlots.filter(at => at && Date.now()-at < BERRY_GROW_MS).length;
  setDialogue('Berry seeds: ' + berrySeeds + '. Plots growing: ' + waiting + ' / 3. Each plot takes 3 minutes to ripen and gives 4 berries plus a seed for the next planting.', choices);
}

function syncMinecart() {
  if (!(hughQuest && fishing.tideglass === 'spent')) return;
  const now = Date.now();
  const gained = Math.floor(Math.max(0,now-minecartUpdatedAt)/MINECART_TICK_MS);
  if (gained > 0) {
    minecartOre = Math.min(minecartCapacity,minecartOre+gained);
    minecartUpdatedAt += gained*MINECART_TICK_MS;
  }
}

function minecartDialogue() {
  if (!(hughQuest && fishing.tideglass === 'spent')) {
    setDialogue('The cart is empty. Once Hugh Mungus repairs the lift, it can carry ore between the mine and camp.');
    return;
  }
  syncMinecart();
  if (!minecartOre) {
    setDialogue('The cart is on its way. It brings one common iron ore every four minutes, up to ' + minecartCapacity + '.');
    return;
  }
  setDialogue('The cart brought ' + minecartOre + ' iron ore. Capacity: ' + minecartCapacity + '.', [
    ['Unload into backpack', () => {
      ironStock += minecartOre; minecartOre = 0; minecartUpdatedAt = Date.now();
      updateNotes(); saveCamp(); setDialogue('Iron ore added to your backpack. The cart is rolling again.');
    }]
  ]);
}

function catnipDialogue() {
  if (!catnipUnlocked) {
    setDialogue('The little garden is waiting for a catnip seed. Barry might know where to find one.');
    return;
  }
  const wait = catnipReadyAt-Date.now();
  if (wait > 0) {
    setDialogue('Alvin already had his turn in the catnip. His battle bond is ' + alvinCatnipVisits + ' / 3. It will grow back in about ' + Math.ceil(wait/60000) + ' minute(s).');
    return;
  }
  catnipReadyAt = Date.now()+CATNIP_GROW_MS;
  const priorBond = alvinCatnipVisits;
  alvinCatnipVisits = Math.min(3, alvinCatnipVisits + 1);
  catnipShowUntil = animationClock+2.8;
  catnipLeap = { start:animationClock, fromX:cat.x, fromY:cat.y, duration:1.4 };
  saveCamp();
  notice = alvinCatnipVisits === 3 && priorBond < 3
    ? 'Alvin learned to fight by your side! His first attacks are gentle.'
    : alvinCatnipVisits < 3 ? 'Alvin dives into the catnip. Battle bond · ' + alvinCatnipVisits + ' / 3.'
    : 'Alvin dives into the catnip. Hearts everywhere.';
  noticeUntil = animationClock+2.8;
  closeDialogue();
}

function decorateHutDialogue() {
  const options = [
    ['Crownwood banner · 3 tokens', 'canopy-banner', 3],
    ['Painted lake picture · 3 tokens', 'lake-painting', 3],
    ['Patchwork bed quilt · 4 tokens', 'patchwork-quilt', 4]
  ].filter(([,id]) => !hutDecorations.has(id)).map(([label,id,cost]) => [label, () => {
    if (campTokens < cost) { setDialogue('That keepsake costs ' + cost + ' Hearth tokens. You have ' + campTokens + '.'); return; }
    campTokens -= cost; hutDecorations.add(id); saveCamp();
    setDialogue('The ' + label.split(' · ')[0].toLowerCase() + ' is now part of your hut.');
  }]);
  setDialogue('Hearth tokens: ' + campTokens + '. Choose a keepsake to add to the hut.', options);
}

function bedDialogue() {
  if (!canSleepAtBed()) {
    const guidance = skyMode === 'auto'
      ? 'The bed will let you sleep through the night and restore your health when night falls.'
      : 'The bed is ready when Sky is set to Night, or when Sky is set to Auto and the world reaches night.';
    setDialogue('The room is quiet. ' + guidance);
    return;
  }
  setDialogue('Sleep until morning? You will wake with full health.', [['Sleep', () => {
    phaseClock = 0; nightIndex++; health = 100; skyMode = 'auto';
    el('sky-toggle').textContent = 'Sky: Auto';
    iron.clear(); defeatedShadows.clear(); shadowHealth.clear();
    updateShadows(); updateNotes(); saveCamp();
    setDialogue('Morning light fills the window. You feel rested, and Alvin is still tucked into his little bed.');
  }], ['Not yet', () => closeDialogue()]]);
}

function petAlvin() {
  if (region !== 'hut') return;
  petHeartsUntil = animationClock+2.2;
  const restored = Math.min(25, 100 - composure);
  composure = Math.min(100, composure + 25);
  notice = restored > 0 ? 'Alvin purrs and restores ' + restored + ' Composure.' : 'Alvin leans into your hand and purrs.';
  noticeUntil = animationClock+2.2;
  closeDialogue();
}

function lyssDialogue() {
  if (finishCampRequest('lyss')) return;
  const symbolOption = ['Hugh sent me about some old symbols', () => {
    rootKeyGuidance = true;
    updateNotes(); saveCamp();
    setDialogue('I remember three stones that answer one another. One listens to the salt wind, one rests where the canopy hangs above the falls, and one is close to the mine’s deep iron hum. I can’t place them exactly. Alvin may hear their old song better than we can.', [['Back', lyssDialogue]]);
  }];
  const withSymbols = options => rootKeyQuest === 'accepted' ? [...options, symbolOption] : options;
  if (rootKeyQuest === 'accepted' && !rootKeyGuidance) {
    setDialogue('Hugh sent you to ask about old markings? I have seen stones like that, though never understood them.',
      [symbolOption, ['Not now', lyssDialogue]]);
    return;
  }
  const tool = [tools.hatchet ? 'How do I make a pickaxe?' : 'Can I get a gathering tool?', () => {
    if (!tools.hatchet) {
      tools.hatchet = true;
      equipped = 'hatchet';
      updateNotes();
      saveCamp();
    }
    setDialogue('Take my old hatchet. It cuts marked pines. Find loose flint inside Embervein Mine, then use 3 wood and 1 flint at the workbench east of the fire to make a pickaxe.',
      [['Back', lyssDialogue]]);
  }];
  const paths = ['Where do the trails go?', () => setDialogue(
    'At the root fork, jump up into Crownwood. Stay on the ground for the mine. The shore trail keeps going past the mine door.',
    [['Back', lyssDialogue]])];
  if (quest === 'complete') {
    if (tools.flowerCrown) {
      setDialogue('The crown is yours now. Please be careful. Please save our king.', withSymbols([tool, paths]));
    } else if (hearthLearned) {
      setDialogue('You found the ember box. I asked for those three flowers to weave a crown, just in case the old story was true. It can draw the shadows out of his mind.', withSymbols([
        ['Accept the flower crown', () => {
          tools.flowerCrown = true;
          updateNotes();
          saveCamp();
          setDialogue('Please be careful. Please… save our king. Alvin, stay close to them.');
        }], tool, paths]));
    } else {
      setDialogue('That brass key opens an old box. If you find a place where the fire still burns behind falling water, try it there. Come back and tell me what you find.', withSymbols([tool, paths]));
    }
  } else if (quest === 'accepted' && collected.size === knownFlowers.length) {
    setDialogue('Three dusklilies! I used to pick these on the way home. Here’s the brass key I promised.', withSymbols([
      ['Give Lyss the 3 dusklilies', () => {
        setQuest('complete');
        setDialogue('Brass key received. Keep it for the old box behind falling water. Alvin, see if you can keep them out of trouble.');
      }], tool, paths]));
  } else if (quest === 'accepted') {
    setDialogue('You’ve found ' + collected.size + ' of the 3 dusklilies. ' + flowerHint, withSymbols([tool, paths]));
  } else {
    const greeting = quest === 'declined' ? 'Changed your mind? ' : 'Come warm up. Alvin already has. ';
    setDialogue(greeting + 'Bring me 3 dusklilies and I’ll give you a brass key. ' + flowerHint + ' Will you help?', withSymbols([
      ['Yes, I’ll find them', () => {
        setQuest('accepted');
        lyssDialogue();
      }],
      ['No, maybe later', () => {
        setQuest('declined');
        setDialogue('Fair enough. The fire’s here whenever you need it.', [tool, paths]);
      }], tool, paths]));
  }
}

function barryDialogue() {
  if (finishCampRequest('barry')) return;
  setDialogue('I used to see the King walk these branches. He was a good man before the shadows got into his mind. Most of us fled when we couldn’t reach him.', [
    ['Can we save him?', () => setDialogue('I want to believe so. Lyss still remembers the old ways. If only there were another way…', [['Back', barryDialogue]])],
    ['What happened here?', () => setDialogue('The shadows followed him from the ruins. Now every night they reach farther into the woods. We have to make it safe again, even if it means facing him.', [['Back', barryDialogue]])]
  ]);
}

function glowcapKeeperDialogue() {
  if (glowcapQuest === 'complete') {
    setDialogue('The Glowcaps keep the settlement lanterns bright. You can hear the old lamps humming again. Thank you.');
    return;
  }
  if (glowcapQuest === 'accepted' && glowcaps >= 3) {
    setDialogue('You found three Glowcaps. May I use them to brighten the lanterns around the common fire?', [
      ['Give 3 Glowcaps', () => {
        glowcaps -= 3;
        glowcapQuest = 'complete';
        glowcapLanternLit = true;
        berries += 4;
        updateNotes(); updatePrompt(); saveCamp();
        setDialogue('The lanterns brighten the whole landing. Here, take four berries for the road below.');
      }],
      ['Keep them for now', () => setDialogue('Of course. The common fire will be here when you return.')]
    ]);
    return;
  }
  if (glowcapQuest === 'accepted') {
    setDialogue('The common fire could use three Glowcaps for the old lanterns. You have ' + glowcaps + ' / 3 so far.');
    return;
  }
  setDialogue('The lanterns are fading. Three Glowcaps from the damp grotto would brighten this landing, and I can spare four berries for your trouble. Will you gather them?', [
    ['Yes, I’ll gather them', () => {
      glowcapQuest = 'accepted'; updateNotes(); saveCamp();
      setDialogue('Thank you. The damp grotto is a little way up the ladder, between the winch and the settlement.');
    }],
    ['Maybe later', () => setDialogue('No rush. The lamps can wait a little longer.')]
  ]);
}

function dorrinDialogue() {
  if (rootdeepQuest === 'complete') {
    setDialogue('The lift is steady again. You can ride between the Lanternstead landing and the deep shaft. That seal below us is older than the mine.', [
      ['What is behind the seal?', () => setDialogue('The old records speak of a road beneath the roots, built before the King’s forest had a name.', [['Back', dorrinDialogue]])]
    ]);
    return;
  }
  if (rootdeepQuest === 'accepted' && rootglass.size >= 3) {
    setDialogue('You found all three rootglass pieces. They should hold the lift cable together. Will you give them to me?', [
      ['Give Dorrin the 3 rootglass', () => {
        rootdeepQuest = 'complete';
        // Rebuild once so the level-two winch visibly changes from snapped to repaired.
        backgrounds.rootdeep = buildRootdeepArt(true);
        updateNotes();
        updatePrompt();
        saveCamp();
        setDialogue('That’s it! The lift is moving again. You’ve made these old levels a lot safer to travel. Thank you, friend.');
      }],
      ['Keep them for now', () => setDialogue('No rush. I’ll be right here when you’re ready.', [['Back', dorrinDialogue]])]
    ]);
    return;
  }
  if (rootdeepQuest === 'accepted') {
    setDialogue('The lift needs three pieces of rootglass to brace its cable. You have ' + rootglass.size + ' / 3. The green seams are scattered through the deeper landings. Bring them back when you have all three.');
    return;
  }
  setDialogue('Name’s Dorrin. I kept the old lift running for the King, back before the shadows reached this deep. The cable snapped, and now the lower levels are a long climb.', [
    ['I’ll find the rootglass', () => {
      rootdeepQuest = 'accepted';
      updateNotes();
      saveCamp();
      setDialogue('Much obliged. Three pieces should be enough. The root ladders along the east wall lead back up if you need to return to Crownwood. Keep your pickaxe handy.');
    }],
    ['Not right now', () => {
      rootdeepQuest = 'declined';
      saveCamp();
      setDialogue('Fair enough. The path down is open if you still want to explore.');
    }]
  ]);
}

function hughDialogue() {
  if (finishCampRequest('hugh')) return;
  if (fishing.tideglass === 'spent') {
    if (hasRootKey || rootKeyQuest === 'complete') {
      setDialogue('The lift is running. It goes straight back to Lyss’s clearing. Step aboard at the far end of the mine. The Root Key should open the sealed road at the far edge of Crownwood.', [
        ['Ask about the old signal', () => setDialogue('Good. Someone below is waiting for a way through. I only hope we’re not too late.', [['Back', hughDialogue]])]
      ]);
      return;
    }
    if (rootKeyQuest === 'ready') {
      setDialogue('You heard it too? Something answered from beneath the roots. You’ve earned this. Take the Root Key and open the old way.', [
        ['Take the Root Key', () => {
          hasRootKey = true; rootKeyQuest = 'complete';
          updateNotes(); updatePrompt(); saveCamp();
          setDialogue('The Root Key is yours. The entrance lies at the far end of Crownwood’s lower trail. Go carefully—and if you meet anyone down there, tell them Hugh sent you.');
        }],
        ['Not yet', () => setDialogue('I’ll keep it safe until you’re ready.', [['Back', hughDialogue]])]
      ]);
      return;
    }
    if (rootKeyQuest === 'accepted') {
      setDialogue(rootKeyGuidance
        ? 'Have the three old stones answered yet? I can feel the mine humming when one wakes. ' + activatedLodestones.size + ' of 3 have answered.'
        : 'Lyss knows the old markings better than I do. Ask her about the stones, then follow what Alvin hears.', [['Back', hughDialogue]]);
      return;
    }
    setDialogue('The lift is running again. Now that you’ve proven yourself, there’s something else I’ve been meaning to ask. A signal from below—someone down there may need a hand. I probably shouldn’t involve you, but… would you help me find what is calling?', [
      ['Yes, I’ll help', () => {
        rootKeyQuest = 'accepted'; rootKeyGuidance = false; activatedLodestones.clear();
        updateNotes(); saveCamp();
        setDialogue('Thank you. Ask Lyss about the old symbols. She remembers more of the forest’s stories than I do.');
      }],
      ['No, maybe later', () => {
        rootKeyQuest = 'declined'; updateNotes(); saveCamp();
        setDialogue('I understand. I’ll keep listening for that signal. Come back if you change your mind.');
      }]
    ]);
    return;
  }
  if (fishing.tideglass === 'caught') {
    setDialogue('That’s tideglass! It’ll fit the lift bearing. I can have it running right now.', [
      ['Give Hugh Mungus the tideglass', () => {
        fishing.tideglass = 'spent';
        hughQuest = true;
        minecartUpdatedAt = Date.now();
        openSharedDoor('mine-lift');
        updateNotes();
        saveCamp();
        setDialogue('Lift repaired. Head east to the lift base. You can ride it either way.');
      }]
    ]);
    return;
  }
  if (sharedDoors.has('mine-lift')) {
    setDialogue('Another adventurer got the lift running. You can ride between here and Lyss’s clearing now. Keep exploring if you still want to find your own tideglass.');
    return;
  }
  const net = hasNet ? 'You’ve got my casting net.' : 'Take the casting net from my chest.';
  setDialogue('Mind the dark past these lamps. Take a breather here if you need one.', [
    ['What happened to the lift?', () => {
      const request = 'A bearing cracked. Bring me 1 tideglass gemstone from the beach and I can get the lift back to Lyss’s clearing. ' + net;
      if (hughQuest) {
        setDialogue(request, [['Back', hughDialogue]]);
        return;
      }
      setDialogue(request + ' Will you bring one back?', [
        ['Yes, I’ll look for one', () => {
          hughQuest = true;
          updateNotes();
          saveCamp();
          setDialogue('Thanks. Follow the shore path past the timber door. Cast the net off Lantern Dock.');
        }],
        ['Maybe later', () => setDialogue('Fair enough. There’s always the timber shaft.', [['Back', hughDialogue]])]
      ]);
    }],
    ['What do you know about the King?', () => setDialogue(
      'His trail climbs above Crownwood. Lyss knows the old stories better than I do. I just know the shadows keep clear of a good lamp.',
      [['Back', hughDialogue]])]
  ]);
}

function workbenchDialogue() {
  const wood = spareWood(tools);
  const crystalCount = crystals.size - (tools.charm ? 2 : 0);
  const inventory = 'You have: Wood ' + wood + ' · Flint ' + Number(tools.flint) +
    ' · Iron ' + ironStock + ' · Crystals ' + crystalCount + ' · Shadow essence ' + shadowStock + '.';
  const choices = [];

  function reportMissing(label, missing) {
    if (missing.length) {
      setDialogue('To ' + label.toLowerCase() + ', you still need ' + missing.join(' and ') +
        '. ' + inventory, choices);
      return true;
    }
    return false;
  }

  if (!tools.pickaxe) choices.push(['Craft pickaxe · 3 wood + 1 flint', () => {
    const missing = [];
    if (wood < WOOD_COST) missing.push((WOOD_COST - wood) + ' wood');
    if (!tools.flint) missing.push('1 flint');
    if (reportMissing('craft the pickaxe', missing)) return;
    tools.pickaxe = true;
    tools.pickaxePaid = true;
    equipped = 'pickaxe';
    tools.flint = false;
    updateNotes(); saveCamp(); workbenchDialogue();
  }]);

  if (!tools.ironSword) choices.push(['Craft iron sword · 1 wood + 2 iron', () => {
    const missing = [];
    if (wood < 1) missing.push('1 wood');
    if (ironStock < 2) missing.push((2 - ironStock) + ' iron');
    if (reportMissing('craft the iron sword', missing)) return;
    tools.ironSword = true;
    tools.woodSpent = 1;
    ironStock -= 2;
    equipped = 'ironSword';
    updateNotes(); saveCamp(); workbenchDialogue();
  }]);

  if (!tools.shadowBlade) choices.push(['Upgrade to shadow blade · 1 iron + 3 shadows', () => {
    const missing = [];
    if (!tools.ironSword) missing.push('an iron sword first');
    if (ironStock < 1) missing.push('1 iron');
    if (shadowStock < 3) missing.push((3 - shadowStock) + ' shadow essence');
    if (reportMissing('upgrade to the shadow blade', missing)) return;
    tools.shadowBlade = true;
    ironStock--;
    shadowStock -= 3;
    equipped = 'shadowBlade';
    updateNotes(); saveCamp(); workbenchDialogue();
  }]);

  if (!tools.charm) choices.push(['Craft shockwave charm · 2 crystals + 2 shadows', () => {
    const missing = [];
    if (crystalCount < 2) missing.push((2 - crystalCount) + ' crystals');
    if (shadowStock < 2) missing.push((2 - shadowStock) + ' shadow essence');
    if (reportMissing('craft the shockwave charm', missing)) return;
    tools.charm = true;
    shadowStock -= 2;
    updateNotes(); saveCamp(); workbenchDialogue();
  }]);

  if (!tools.helmet) choices.push(['Craft helmet · 4 iron', () => {
    const missing = [];
    if (ironStock < 4) missing.push((4 - ironStock) + ' iron');
    if (reportMissing('craft the helmet', missing)) return;
    tools.helmet = true;
    ironStock -= 4;
    updateNotes(); saveCamp(); workbenchDialogue();
  }]);

  setDialogue(inventory + ' Choose a recipe to craft.', choices);
}
const bookClue = 'The water blurred most of the writing. One sketch shows a rope bridge with a gap in its railing, a ledge beneath it, and a light behind the waterfall.';

function dockDialogue(result) {
  if (!hasNet) {
    setDialogue('You need a casting net. Hugh Mungus keeps one in the chest next to his lantern in Embervein Mine.');
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
  if (result.catchName === 'Tideglass gemstone') message = 'Tideglass gemstone caught. Bring it back to Hugh Mungus to repair the lift.';
  if (result.rare) message += ' Tangled in the net alongside it is the Godslayer.';
  dockDialogue(message);
}

function emberBoxDialogue() {
  if (hearthLearned) {
    setDialogue(hearthNote);
    return;
  }
  if (quest !== 'complete') {
    setDialogue('The box is locked. A little flower is engraved beside the brass keyhole.');
    return;
  }
  setDialogue('The brass key Lyss gave you fits the box.', [
    ['Open and read the note', () => {
      hearthLearned = true;
      updateNotes();
      saveCamp();
      setDialogue(hearthNote);
    }]
  ]);
}

function openDialogue(id) {
  const info = conversations[id] ?? { name: 'Alder Camp', role: 'CAMP KEEPSAKE' };
  el('time-board').hidden = true;
  el('noticeboard-panel').hidden = true;
  const portrait = id === 'lyss' || id === 'hugh' ? sprites[id] : null;
  el('speaker').textContent = info.name;
  el('speaker-role').textContent = info.role;
  el('portrait').hidden = !portrait;
  if (portrait) drawPortrait(el('portrait'), portrait);
  talking = true;
  el('dialogue').hidden = false;
  clearControls();
  updatePrompt();
  updateNotes();
  saveCamp();
}

function openAdminRing() {
  if (!adminRing || !playing) return;
  openDialogue('admin-ring');
  setDialogue('The ring hums softly. Choose where to go or open the test tools.', [
    ['Admin tools', () => openAdminPanel(true)],
    ['Teleport to a region', adminTeleportDialogue]
  ]);
}

function adminTeleportDialogue() {
  const destinations = [
    ['Alder Camp', 'camp', { x: 1800, ground: 'trail' }],
    ['Crownwood Canopy', 'crownwood', { x: 273, ground: 'understory' }],
    ['Embervein Mine', 'mine', { x: 320, ground: 'mine-floor' }],
    ['Rootdeep Mine', 'rootdeep', { x: 110, ground: 'rootdeep-level-1' }],
    ['Driftwood Cove', 'beach', { x: 300, ground: 'shore-sand' }],
    ['Hidden First Hearth', 'hearth', { x: 300, ground: 'hearth-floor' }],
    ['King’s Grounds', 'king', { x: 2315, ground: 'king-floor' }],
    ['Lantern Village', 'village', { x: 170, ground: 'village-road' }],
    ['Alder Camp Hut', 'hut', { x: 480, ground: 'hut-floor' }]
  ];
  openDialogue('admin-ring');
  const choices = destinations.map(([label, destination, footing]) => [label, () => {
    closeDialogue();
    enterRegion(destination, footing);
  }]);
  choices.push(['Back to ring', openAdminRing]);
  setDialogue('Choose a safe arrival point. Teleporting leaves your supplies and quest progress as they are.', choices);
}

function openAdminPanel(fromRing = false) {
  adminPanelFromRing = fromRing;
  openDialogue('admin-tools');
  el('line').textContent = fromRing
    ? 'Use the test tools here, or return to your ring to teleport.'
    : 'Claim your ring or choose a test action.';
  el('admin-copy').textContent = testRun
    ? 'This saved adventure is marked as a test run. Its time will not go on the public board.'
    : 'Claiming the ring and teleporting leave your score eligible. Using item grants or boss-test tools marks the run as a test.';
  el('noticeboard-panel').hidden = false;
  el('notice-form').hidden = true;
  el('notice-list').hidden = true;
  el('admin-panel').hidden = false;
  el('admin-claim-ring').hidden = adminRing;
  el('notice-status').textContent = testRun
    ? 'This adventure is marked as a test run.'
    : 'Ring access is ready. No test tools have been used.';
}

function isStrikeTool(id) {
  return id === 'hatchet' || id === 'pickaxe' || id === 'ironSword' || id === 'shadowBlade' || id === 'godslayer';
}

function ownsGear(id) {
  if (id === 'net') return hasNet;
  if (id === 'godslayer') return fishing.godslayer;
  if (id === 'ironSword' || id === 'shadowBlade') return tools[id];
  return (id === 'hatchet' || id === 'pickaxe') && tools[id];
}

function inventoryItems() {
  const items = [
    ['▰', 'Wood', spareWood(tools), 'Chopped from marked pines.'],
    ['⬟', 'Flint', Number(tools.flint), 'Mine stone used at the camp workbench.'],
    ['◆', 'Crystal', crystals.size - (tools.charm ? 2 : 0), 'Gathered with a pickaxe in Crownwood.'],
    ['▧', 'Iron ore', ironStock, 'Mined with a pickaxe in Embervein and the Rootdeep branch galleries.'],
    ['◇', 'Rootglass', rootglass.size, 'Rare green stone gathered in Rootdeep for Dorrin’s winch repair.'],
    ['✧', 'Glowcaps', glowcaps, 'Hand-gathered in the damp grotto. The settlement uses them in its lanterns.'],
    ['✦', 'Shadow essence', shadowStock, 'Dropped by defeated night shadows.'],
    ['●', 'Berries', berries, 'Saved until you eat them. Restores up to 25 health.'],
    ['✿', 'Dusklilies', quest === 'complete' ? 0 : collected.size, 'Bring three to Lyss for a brass key.']
  ];
  if (quest === 'complete') items.push(['⚿', 'Brass key', 1, 'Lyss’s key. Look for an old box behind falling water.']);
  if (hasRootKey) items.push(['⚿', 'Root Key', 1, 'Hugh entrusted it to you. It opens the sealed entrance at Crownwood’s far edge.']);
  if (fishing.book) items.push(['▤', 'Soaked book', 1, bookClue]);
  if (hearthLearned) items.push(['▤', 'Ember note', 1, hearthNote]);
  if (tools.flowerCrown) items.push(['✿', 'Flower crown', 1, 'Lyss’s crown can free the King from the shadows.']);
  if (victory?.ending) items.push(['⚿', 'Village gate key', 1, 'Opens the gate to the right of the Crown Arena.']);
  if (tools.charm) items.push(['◇', 'Shockwave charm', 1, 'Softens the King’s shockwaves.']);
  if (tools.helmet) items.push(['♧', 'Iron helmet', 1, 'Reduces incoming damage by 25%.']);
  if (fishing.tideglass === 'caught') items.push(['◇', 'Tideglass gemstone', 1, 'Take it to Hugh Mungus to repair the lift.']);
  if (fishing.fish) items.push(['◈', 'Fish', fishing.fish, 'Caught at Lantern Dock.']);
  if (fishing.driftwood) items.push(['≋', 'Driftwood', fishing.driftwood, 'Pulled from the tide.']);
  if (adminRing) items.push(['◉', 'Admin Ring', 1, 'Open test tools and regional teleports from your backpack.']);
  return items;
}

function refreshInventory() {
  renderInventory(el, inventoryItems(), ownsGear, equipped, equipTool, berries, health);
  el('bagAdminRing').hidden = !adminRing;
  el('bagFeed').disabled = !fishing.fish || fishFed >= 8;
  const growthTimer = fishFed ? ' · ' + Math.ceil(alvinGrowthRemaining / 60) + ' active min left' : '';
  el('bagFeed').textContent = 'Feed Alvin a fish · ' + fishing.fish + ' fish · ' + Math.round((1 + fishFed / 4) * 100) + '% size' + growthTimer;
}

function feedAlvin() {
  if (!playing || !inventoryOpen || fishing.fish < 1 || fishFed >= 8) return;
  fishing.fish--;
  fishFed++;
  alvinGrowthRemaining = ALVIN_GROWTH_SECONDS;
  notice = alvinCatnipVisits >= 3
    ? 'Alvin grew for 10 minutes of play and feels stronger in a fight.'
    : 'Alvin grew for 10 minutes of play. Three catnip visits unlock his battle strength.';
  noticeUntil = animationClock + 2.6;
  sendPose(true);
  refreshInventory();
  updateNotes();
  saveCamp();
}

function equipTool(id) {
  if (!ownsGear(id)) return;
  if (equipped !== id) {
    swingTarget = null;
    swingCombat = false;
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
  if (rootglassNodes.includes(item)) {
    rootglass.add(id);
    notice = 'Rootglass mined · ' + rootglass.size + ' / 3';
    puff(particles, x, y - 24, '#8edacb', 12);
    floater(floaters, x, y - 65, '+1 rootglass');
  } else if (crystalNodes.includes(item)) {
    crystals.add(id);
    notice = 'Crystal gathered · ' + crystals.size + ' / ' + crystalNodes.length;
    puff(particles, x, y - 24, '#a3e4cf');
    floater(floaters, x, y - 65, '+1 crystal');
  } else if (allIronNodes.includes(item)) {
    iron.add(id);
    ironStock++;
    notice = 'Iron ore mined · ' + ironStock + ' in backpack';
    puff(particles, x, y - 24, '#dfb595');
    floater(floaters, x, y - 65, '+1 iron ore');
  } else if (glowcapNodes.includes(item)) {
    gatheredGlowcaps.add(id);
    glowcaps++;
    notice = 'Glowcap gathered · ' + glowcaps + ' found';
    puff(particles, x, y - 24, '#8ee5ce', 10);
    floater(floaters, x, y - 65, '+1 Glowcap', '#baf1da');
  } else if (item === netChest) {
    hasNet = true;
    if (!equipped) equipped = 'net';
    notice = 'Casting net taken';
  } else if (item === flint) {
    tools.flint = true;
    notice = 'Flint picked up';
  } else if (allTimberTrees.includes(item)) {
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
  swingCombat = !item && (creatures.length > 0 || !!trial && ['shadows','duel'].includes(trial.stage));
  swingDirection = item ? Math.sign(item.x - player.x) || player.direction : player.direction;
  player.direction = swingDirection;
}

function updateSwing(dt) {
  cooldown = Math.max(0, cooldown - dt);
  swing = Math.max(0, swing - dt);
  if (swing > SWING_IMPACT) return;
  if (swingCombat) {
    swingCombat = false;
    let result;
    if (trial) result = attackTrial(trial, { ...player, direction: swingDirection }, equipped, composureDamageFactor());
    else {
      const target = creatures.filter(creature => Math.abs(creature.x - player.x) < 115 &&
        Math.abs(creature.y - player.y) < 78 && (creature.x - player.x) * swingDirection >= -22)
        .sort((a,b) => Math.abs(a.x-player.x)-Math.abs(b.x-player.x))[0];
      if (target) {
        const id = region + ':' + nightIndex + ':' + target.index;
        const basePower = equipped === 'godslayer' ? 999 : equipped === 'shadowBlade' ? 100
          : equipped === 'ironSword' ? 70 : equipped === 'pickaxe' ? 45 : 32;
        const power = equipped === 'godslayer' ? basePower : Math.max(1, Math.floor(basePower * composureDamageFactor()));
        const remaining = (shadowHealth.get(id) ?? 60 + Math.min(nightIndex, 8) * 18) - power;
        result = { x: target.x, y: target.y, damage: power };
        shadowHealth.set(id, remaining);
        if (remaining <= 0) {
          defeatedShadows.add(id);
          creatures = creatures.filter(creature => creature !== target);
          shadowStock++;
          floater(floaters, target.x, target.y - 78, '+1 shadow');
          updateNotes(); saveCamp();
        }
      }
    }
    if (result) {
      puff(particles, result.x, result.y - 44, '#cbb0e8', 9);
      floater(floaters, result.x, result.y - 95, result.damage ? '−' + result.damage : 'Guarded');
    }
  }
  if (!swingTarget) return;
  const item = swingTarget;
  swingTarget = null;
  if (nearbyLandmark(player, [item])) gather(item);
}

const interactionHandlers = {
  lyss: lyssDialogue,
  hugh: hughDialogue,
  barry: barryDialogue,
  workbench: workbenchDialogue,
  dock: dockDialogue,
  'ember-box': emberBoxDialogue,
  'request-board': requestBoardDialogue,
  'player-board': openPlayerNoticeboard,
  'berry-plot': berryPlotDialogue,
  'catnip-garden': catnipDialogue,
  minecart: minecartDialogue,
  'hut-bed': bedDialogue,
  'alvin-bed': petAlvin,
  'hut-decor': decorateHutDialogue,
  'rootdeep-commonkeeper': glowcapKeeperDialogue,
  'night-altar': altarDialogue,
  'fallen-crown': endingDialogue
};

function interact() {
  if (!controlsActive()) return;
  // Refresh the target at activation time; touch input can leave the previous frame's selection stale.
  updatePrompt();
  const item = selectedLandmark;
  if (region === 'rootdeep' && item?.id === 'dorrin') {
    openDialogue('dorrin');
    dorrinDialogue();
    return;
  }
  if (swingTarget) return;
  if (!item) {
    if (isStrikeTool(equipped)) startSwing();
    return;
  }
  const id = item.id;
  if (id.startsWith('lodestone-')) {
    if (rootKeyQuest !== 'accepted' && rootKeyQuest !== 'ready') {
      openDialogue('lodestone');
      setDialogue('These markings are old and worn smooth. The stone feels quiet. I wonder who it belonged to.');
      return;
    }
    if (!rootKeyGuidance) {
      openDialogue('lodestone');
      setDialogue('The markings look familiar, but Hugh asked you to speak with Lyss first. She may know how these stones fit together.');
      return;
    }
    if (activatedLodestones.has(id)) {
      notice = 'The lodestone hums softly. Alvin stays close, ears pricked.';
      noticeUntil = animationClock + 2.2;
      updatePrompt();
      return;
    }
    activatedLodestones.add(id);
    alvinSignalUntil = animationClock + .95;
    if (activatedLodestones.size === 3) {
      rootKeyQuest = 'ready';
      notice = 'All three stones answer. A deep sound answers from below. Return to Hugh.';
    } else {
      const next = ['lodestone-canopy','lodestone-shore','lodestone-mine'].find(stoneId => !activatedLodestones.has(stoneId));
      const direction = next === 'lodestone-canopy' ? 'the canopy above the falls'
        : next === 'lodestone-shore' ? 'the salt wind' : 'the mine’s deep iron hum';
      notice = 'Alvin’s ears flick toward ' + direction + '. The stone gives a faint answering hum.';
    }
    noticeUntil = animationClock + 3.4;
    updateNotes(); updatePrompt(); saveCamp(); sendPose(true);
    return;
  }
  const mineral = crystalNodes.includes(item) || allIronNodes.includes(item) || rootglassNodes.includes(item);
  const tree = allTimberTrees.includes(item);
  if (mineral || tree) {
    const required = mineral ? 'pickaxe' : 'hatchet';
    if (equipped === required) {
      startSwing(item);
    } else {
      const hint = ownsGear(required) ? 'Open your backpack and equip the ' + gear[required][1].toLowerCase() + '.'
        : mineral ? 'Craft a pickaxe at the Alder Camp workbench to mine this.'
        : 'Ask Lyss for her hatchet to chop marked pines.';
      openDialogue('tool-needed');
      setDialogue(hint);
      return;
    }
    world.focus({ preventScroll: true });
    return;
  }
  if (currentFlowers().includes(item) || item === netChest || item === flint || berryBushes.includes(item) || glowcapNodes.includes(item)) {
    gather(item);
    world.focus({ preventScroll: true });
    return;
  }
  if (id === 'rootdeep-entrance' && !hasRootKey && !sharedDoors.has('rootdeep-entrance')) {
    openDialogue('rootdeep-entrance');
    setDialogue('A root-carved gate seals the tunnel. A keyhole is set into the stone. Whatever lies below, this entrance is not ready to open.');
    return;
  }
  visited.add(id);
  const gate = gates[id] ?? (fishing.tideglass === 'spent' || sharedDoors.has('mine-lift') ? liftGates[id] : null);
  if (gate) {
    if (id === 'rootdeep-entrance' && hasRootKey) openSharedDoor('rootdeep-entrance');
    if (id === 'village-gate' && victory?.ending) openSharedDoor('village-gate');
    if (liftGates[id] && fishing.tideglass === 'spent') openSharedDoor('mine-lift');
    enterRegion(gate.region, gate.footing);
    return;
  }
  if (id.startsWith('rootdeep-ladder-')) {
    // Interact grabs the ladder; hold up/down to travel through the same continuous shaft.
    rootdeepClimbing = true;
    player.ground = null;
    player.velocityY = 0;
    return;
  }
  if (id === 'rootdeep-lift-high' || id === 'rootdeep-lift-low') {
    if (rootdeepQuest !== 'complete') {
      openDialogue(id);
      setDialogue('The old cage hangs over the shaft, but its cable is broken. Dorrin may know how to restore it.');
      return;
    }
    enterRegion('rootdeep', id === 'rootdeep-lift-high'
      ? { x: 1690, ground: 'rootdeep-level-8' }
      : { x: 310, ground: 'rootdeep-level-2' });
    return;
  }
  if (id === 'deep-seal') {
    openDialogue(id);
    setDialogue('An ancient stone seal blocks the lowest passage. Its markings are too worn to read. Dorrin might recognize the old work.');
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
  if (Object.hasOwn(interactionHandlers, id)) interactionHandlers[id]();
  else setDialogue(conversations[id].greeting);
}

function closeDialogue() {
  talking = false;
  el('dialogue').hidden = true;
  el('time-board').hidden = true;
  el('noticeboard-panel').hidden = true;
  updatePrompt();
  world.focus({ preventScroll: true });
}

function noticeClientId() {
  const key = 'first-hearth:notice-client:v1';
  try {
    let id = localStorage.getItem(key);
    if (!id) { id = crypto.randomUUID(); localStorage.setItem(key,id); }
    return id;
  } catch { return crypto.randomUUID(); }
}

function renderNoticeList(notices) {
  const list = el('notice-list');
  list.replaceChildren();
  for (const note of notices ?? []) {
    const item = document.createElement('li');
    const author = document.createElement('strong');
    const time = Number.isFinite(note.at) ? new Date(note.at).toLocaleDateString() : '';
    author.textContent = (note.name || 'Adventurer') + (time ? ' · ' + time : '');
    const message = document.createElement('div');
    message.textContent = note.text || '';
    item.append(author,message); list.append(item);
  }
}

async function openPlayerNoticeboard() {
  el('line').textContent = 'Messages stay on the website for the next visitor. Keep notes kind and short.';
  el('choices').replaceChildren();
  el('admin-panel').hidden = true;
  el('notice-form').hidden = false;
  el('notice-list').hidden = false;
  el('noticeboard-panel').hidden = false;
  el('notice-status').textContent = 'Loading notes…';
  try {
    const result = await fetch('/first-hearth/api/noticeboard',{cache:'no-store'});
    const data = await result.json();
    if (!result.ok) throw new Error(data.error || 'The board could not load.');
    renderNoticeList(data.notices);
    el('notice-status').textContent = data.notices?.length ? 'Latest notes from visitors:' : 'No notes yet. Leave the first one.';
  } catch {
    el('notice-status').textContent = 'The shared board could not load right now.';
  }
}

function setPause(value) {
  if (!playing || talking || inventoryOpen) return;
  paused = value;
  el('paused').hidden = !value;
  el('leave-trial').hidden = !trial || !!victory;
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

function altarDialogue() {
  if (victory) {
    setDialogue('The final night is over. You can return to the crown to see your result.');
    return;
  }
  const tool = ['shadowBlade','ironSword','pickaxe','hatchet','godslayer'].find(ownsGear);
  if (!tool) {
    setDialogue('Bring a tool you can strike with. Lyss can lend you a hatchet at Alder Camp.');
    return;
  }
  setDialogue('Light the altar to start the final night and its timer. Clear the shadows to open the arena gate.', [
    ['Light the altar', () => {
      if (!isStrikeTool(equipped)) equipTool(tool);
      closeDialogue();
      enterRegion('king', { x: TRIAL_START, ground: 'king-floor' });
      trial = startTrial();
      updateTrialHud();
      updatePrompt();
      saveCamp();
    }]
  ]);
}

function showScores() {
  if (testRun) {
    setDialogue('This is a test run, so its time stays off the public high-score board.', []);
    return;
  }
  setDialogue(endings[victory.ending].text + ' I’m proud of you. Time ' +
    formatTime(victory.timeMs) + '. The King dropped the village gate key. Enter the gate to the right after posting your time.', [['Back', endingDialogue]]);
  openTimeBoard(el, victory, saveCamp);
}

function endingDialogue() {
  el('time-board').hidden = true;
  const time = ' Time ' + formatTime(victory.timeMs) + '.';
  if (victory.ending) {
    setDialogue(endings[victory.ending].text + ' I’m proud of you.' + time,
      testRun ? [] : [['View time board', showScores]]);
    return;
  }
  const choices = Object.keys(endings).filter(ending => ending === 'break' || tools.flowerCrown).map(ending =>
    [endings[ending].name, () => {
      victory.ending = ending;
      saveCamp();
      closeDialogue();
      const goal = ending === 'free' ? trial?.boss?.x ?? kingLandmarks[3].x : kingLandmarks[3].x;
      const target = goal + (player.x > goal ? 1 : -1) * (ending === 'free' ? 68 : 52);
      endingScene = { ending, elapsed: 0, struck: false, target,
        actionAt: Math.max(1.7, Math.abs(player.x - target) / (ending === 'free' ? 260 : 390) + .15) };
      clearControls();
    }]);
  setDialogue('Alvin lands the last hit and winks. I’m proud of you.' + time, choices);
}

function retreatFromTrial(defeated = false) {
  paused = false;
  el('paused').hidden = true;
  el('pause').textContent = 'Pause';
  if (defeated) health = 100;
  enterRegion('king', { x: REST_X, ground: 'king-floor' });
  notice = defeated ? 'Alvin led you back to Lantern Rest.' : 'The altar goes quiet.';
  noticeUntil = animationClock + 2.4;
}

function updateTrialHud() {
  const active = trial && !victory;
  el('trial-hud').hidden = !active;
  if (!active) return;
  const boss = trial.boss;
  el('king-meter').hidden = !boss;
  el('trial-time').textContent = formatTime(trial.time * 1000);
  const hint = trialHint(trial);
  if (el('trial-hint').textContent !== hint) el('trial-hint').textContent = hint;
  if (boss) {
    el('king-hp').textContent = boss.hp + ' / ' + MAX_BOSS_HP;
    el('king-fill').style.width = boss.hp / MAX_BOSS_HP * 100 + '%';
  }
}

function composureDamageFactor() {
  return .85 + .15 * (composure / 100);
}

function updateComposure(dt) {
  if (victory) return;
  const previousComposure = Math.round(composure);
  let healthChanged = false;
  if (region !== 'hut') {
    const nearby = [...creatures, ...(trial?.shadows ?? [])];
    if (trial?.boss && trial.boss.hp > 1 && trial.stage === 'duel') nearby.push(trial.boss);
    let proximity = 0;
    for (const ghost of nearby) {
      const distance = Math.hypot(ghost.x - player.x, (ghost.y ?? player.y) - player.y);
      if (distance < 320) proximity = Math.max(proximity, 1 - distance / 320);
    }
    if (proximity > 0) {
      const fighting = swing > 0 || cooldown > 0 || swingCombat;
      composure = Math.max(0, composure - dt * (.8 + proximity * 1.6 + (fighting ? 1.2 : 0)));
    }
  }
  if (composure <= 0) {
    composureDamageClock += dt;
    while (composureDamageClock >= 1) {
      composureDamageClock -= 1;
      health = Math.max(0, health - 1);
      healthChanged = true;
      if (!health) {
        if (trial) retreatFromTrial(true);
        else {
          health = 100;
          enterRegion(region);
          notice = 'Alvin led you back to safety.';
          noticeUntil = animationClock + 2;
        }
        break;
      }
    }
  } else composureDamageClock = 0;
  if (healthChanged || Math.round(composure) !== previousComposure) updateNotes();
}

function updateKingTrial(dt) {
  if (!trial || victory) return;
  const before = trial.stage;
  const damage = advanceTrial(trial, player, dt);
  if (damage && animationClock >= hitUntil) {
    const baseHit = difficulty === 'hard' ? 20 : 8;
    const hit = before === 'duel' && damage === 24 && tools.charm ? Math.ceil(baseHit * .5) : baseHit;
    const composureHit = Math.ceil(hit * (1 + .15 * (1 - composure / 100)));
    health = Math.max(0, health - (tools.helmet ? Math.ceil(composureHit * .75) : composureHit));
    if (!health) {
      retreatFromTrial(true);
      return;
    }
    hitUntil = animationClock + 1.2;
    updateNotes();
    saveCamp();
  }
  if (trial.stage === 'alvin' && before !== 'alvin') {
    trial.catFrom = { x: cat.x, y: cat.y };
    clearControls();
  }
  if (trial.stage === 'alvin' || trial.stage === 'won') {
    const t = trial.pounce;
    const target = trial.boss.x;
    cat.x = trial.catFrom.x + (target - trial.catFrom.x) * t;
    cat.y = trial.catFrom.y + (ARENA.ground - trial.catFrom.y) * t - Math.sin(Math.PI * t) * 160;
    cat.direction = Math.sign(target - trial.catFrom.x) || 1;
    cat.gait = 0;
  }
  if (trial.stage === 'won') {
    victory = { runId: crypto.randomUUID(), timeMs: Math.round(trial.time * 1000), ending: null, name: null, difficulty };
    finaleDelay = 1.2;
    saveCamp();
  }
  updateTrialHud();
}

function updateShadows(dt = 0) {
  const area = regions[region];
  if (!area.shadows) return;
  const cycleKey = region + ':' + nightIndex;
  if (creatureCycleKey !== cycleKey) {
    creatures = [];
    creatureCycleKey = cycleKey;
  }
  const forcedNight = skyMode === 'night';
  const shadowPhase = forcedNight ? 80 : phaseClock;
  if (!forcedNight && skyMode !== 'auto') {
    creatures = [];
    return;
  }
  if (!forcedNight && (phaseClock < 70 || phaseClock >= 121)) {
    creatures = [];
    if (phaseClock < 70) creatureCycleKey = cycleKey;
    return;
  }
  const current = new Map(creatures.map(creature => [creature.index, creature]));
  if (shadowPhase < 111) {
    for (const spawn of area.shadows(shadowPhase, nightIndex)) {
      if (defeatedShadows.has(region + ':' + nightIndex + ':' + spawn.index)) continue;
      const creature = current.get(spawn.index) ?? { ...spawn, aggro: false, homeX: spawn.x, homeY: spawn.y };
      creature.homeX = spawn.x;
      creature.homeY = spawn.y;
      const dx = player.x - creature.x, dy = player.y - creature.y;
      const distance = Math.hypot(dx, dy);
      if (!creature.aggro && distance < 760) creature.aggro = true;
      if (creature.aggro && distance > 1080) creature.aggro = false;
      const targetX = creature.aggro ? player.x : spawn.x;
      const targetY = creature.aggro ? player.y : spawn.y;
      const gap = Math.hypot(targetX - creature.x, targetY - creature.y);
      const speed = creature.aggro ? 104 + Math.min(nightIndex, 8) * 7 : 76;
      if (gap > 0.5) {
        const step = Math.min(gap, speed * dt);
        creature.x += (targetX - creature.x) / gap * step;
        creature.y += (targetY - creature.y) / gap * step;
      }
      current.set(spawn.index, creature);
    }
  } else {
    for (const creature of current.values()) {
      const dx = player.x - creature.x, dy = player.y - creature.y;
      const distance = Math.hypot(dx, dy);
      if (!creature.aggro && distance < 760) creature.aggro = true;
      if (creature.aggro && distance > 1080) creature.aggro = false;
      if (creature.aggro && distance > 0.5) {
        const step = Math.min(distance, (104 + Math.min(nightIndex, 8) * 7) * dt);
        creature.x += dx / distance * step;
        creature.y += dy / distance * step;
      }
    }
  }
  creatures = [...current.values()].filter(creature =>
    !defeatedShadows.has(region + ':' + nightIndex + ':' + creature.index));
  if (creatures.length === 0 || animationClock < hitUntil) return;
  const hit = creatures.some(creature =>
    Math.abs(creature.x - player.x) < 37 && Math.abs(creature.y - player.y + 12) < 49);
  if (!hit) return;
  const hitDamage = difficulty === 'hard' ? 20 : 8;
  const composureHit = Math.ceil(hitDamage * (1 + .15 * (1 - composure / 100)));
  health = Math.max(0, health - (tools.helmet ? Math.ceil(composureHit * .75) : composureHit));
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
  if (wave > 0) wave = Math.max(0, wave - dt);
  if (!paused && !talking && !inventoryOpen) animationClock += dt;
  if (casting && animationClock - casting.start >= .92) finishCast();
  if (fireworksElapsed < 8) fireworksElapsed += dt;
  if (trial?.stage === 'alvin' && !paused) updateKingTrial(dt);
  if (trial?.stage === 'alvin' && !paused) updateCamera(false, dt);
  if (finaleDelay > 0 && !paused) {
    finaleDelay = Math.max(0, finaleDelay - dt);
    updateCamera(false, dt);
    if (!finaleDelay) {
      openDialogue('fallen-crown');
      endingDialogue();
    }
  }
  if (endingScene && !paused) {
    endingScene.elapsed += dt;
    if (Math.abs(player.x - endingScene.target) > 5 && endingScene.elapsed < endingScene.actionAt) {
      player.direction = Math.sign(endingScene.target - player.x);
      player.x += player.direction * Math.min(Math.abs(endingScene.target - player.x), dt * (endingScene.ending === 'free' ? 260 : 390));
      player.y = groundAt(player.x, terrain);
      player.moving = true;
      gait += dt * 15;
    } else player.moving = false;
    if (!endingScene.struck && endingScene.elapsed >= endingScene.actionAt) {
      endingScene.struck = true;
      if (endingScene.ending === 'break') swing = SWING_TIME;
      swingDirection = player.direction;
      fireworksElapsed = 0;
      puff(particles, player.x + player.direction * 55, player.y - 85,
        endingScene.ending === 'free' ? '#d9e5b2' : '#f2d996', 20);
    }
    if (swing > 0) swing = Math.max(0, swing - dt);
    if (endingScene.elapsed >= endingScene.actionAt + 1.2) {
      endingScene = null;
      savedFooting = { x: player.x, ground: 'king-floor' };
      updateNotes(); saveCamp();
      openDialogue('fallen-crown');
      showScores();
    }
    updateCamera(false, dt);
  }
  if (controlsActive()) {
    const right = heldKeys.has('d') || heldKeys.has('arrowright') || [...heldPointers.values()].includes(1);
    const left = heldKeys.has('a') || heldKeys.has('arrowleft') || [...heldPointers.values()].includes(-1);
    const direction = Number(right) - Number(left);
    const climbingUp = heldKeys.has('arrowup') || heldKeys.has('w') || [...heldPointers.values()].includes('up');
    const climbingDown = heldKeys.has('arrowdown') || heldKeys.has('s') || [...heldPointers.values()].includes('down');
    const vertical = Number(climbingDown) - Number(climbingUp);
    if (nearRootdeepLadder() && vertical) rootdeepClimbing = true;
    for (let remaining = dt; remaining > 0;) {
      const step = Math.min(remaining, 1 / 120);
      if (region === 'rootdeep' && rootdeepClimbing && direction) {
        rootdeepClimbing = false;
        player.ground = null;
        player.velocityY = Math.max(player.velocityY, 80);
        movePlayer(player, direction, step, terrain);
      } else if (region === 'rootdeep' && rootdeepClimbing) {
        player.x = ROOTDEEP_LADDER_X;
        player.ground = null;
        player.velocityY = 0;
        player.moving = vertical !== 0;
        if (vertical) player.y += vertical * ROOTDEEP_CLIMB_SPEED * step;
        if (player.y <= 80 && vertical < 0) {
          enterRegion('crownwood', { x: 5510, ground: 'understory' });
          break;
        }
        const bottomY = rootdeepTerrain.floor.points[0][1];
        if (player.y >= bottomY) {
          player.y = bottomY;
          player.ground = 'rootdeep-floor';
          player.jumps = 0;
          rootdeepClimbing = false;
        }
      } else movePlayer(player, direction, step, terrain);
      remaining -= step;
    }
    if (region === 'king' && !victory) {
      const [left, right] = trialBounds(trial) ?? [23, ARENA.gate - 32];
      player.x = clamp(player.x, left, right);
    }
    if (player.ground) savedFooting = { x: player.x, ground: player.ground };
    if (player.moving) gait += dt * 15;
    updateSwing(dt);
    [particles, floaters] = advanceGatheringEffects(particles, floaters, dt);
    if (fishFed > 0) {
      alvinGrowthRemaining = Math.max(0, alvinGrowthRemaining - dt);
      if (alvinGrowthRemaining === 0) {
        fishFed = 0;
        sendPose(true);
        refreshInventory();
        saveCamp();
      }
    }
    phaseClock += dt;
    if (phaseClock >= DAY_LENGTH) {
      phaseClock -= DAY_LENGTH;
      nightIndex++;
      iron.clear();
      defeatedShadows.clear();
      shadowHealth.clear();
    }
    updateShadows(dt);
    updateComposure(dt);
    updateKingTrial(dt);
    if (trial?.stage !== 'alvin' && region !== 'hut' && !updateCatnipLeap()) {
      if (!updateAlvinCombat()) updateCat(dt);
    }
    updateCamera(false, dt);
    updateLocation();
    updatePrompt();
    elapsedSinceSave += dt;
    if (elapsedSinceSave > 3) {
      elapsedSinceSave = 0;
      saveCamp();
    }
  }
  sendPose();
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
for (const button of document.querySelectorAll('[data-difficulty]')) {
  button.addEventListener('click', () => {
    difficulty = button.dataset.difficulty;
    for (const choice of document.querySelectorAll('[data-difficulty]')) {
      choice.setAttribute('aria-pressed', String(choice === button));
    }
  });
}
el('begin').addEventListener('click', () => begin());
el('continue').addEventListener('click', () => begin(getSavedCamp()));
el('presence-toggle').addEventListener('click', () => {
  onlineEnabled = !onlineEnabled;
  try { localStorage.setItem(PRESENCE_KEY, onlineEnabled ? 'public' : 'solo'); } catch { /* Session toggle still works. */ }
  if (onlineEnabled) connectPresence(); else disconnectPresence();
  updatePresenceButton();
});
el('close-dialogue').addEventListener('click', closeDialogue);
el('notice-form').addEventListener('submit', async event => {
  event.preventDefault();
  const text = el('notice-text').value.trim();
  if (!text) return;
  if (text.toLowerCase() === 'alabaster') {
    el('notice-text').value = '';
    saveCamp();
    openAdminPanel(false);
    el('admin-item').focus({ preventScroll: true });
    return;
  }
  el('notice-submit').disabled = true;
  el('notice-status').textContent = 'Pinning your note…';
  try {
    const response = await fetch('/first-hearth/api/noticeboard', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({clientId:noticeClientId(),name:publicName || 'Adventurer',text})
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'The note could not be pinned.');
    renderNoticeList(data.notices);
    el('notice-text').value = '';
    el('notice-status').textContent = 'Your note is on the board for the next visitor.';
  } catch (error) {
    el('notice-status').textContent = error.message || 'The shared board could not be reached.';
  } finally { el('notice-submit').disabled = false; }
});
function debugStatus(message) {
  testRun = true;
  updateNotes();
  saveCamp();
  updatePrompt();
  el('admin-copy').textContent = 'This saved adventure is marked as a test run. Its time will not go on the public board.';
  el('notice-status').textContent = message + ' · Test run; no high score will be posted.';
}

function grantTestItem(kind, amount = 1) {
  const count = clamp(Math.floor(Number(amount) || 1), 1, 99);
  switch (kind) {
    case 'berries': berries += count; break;
    case 'wood': tools.debugWood = (tools.debugWood || 0) + count; break;
    case 'flint': tools.flint = true; break;
    case 'iron': ironStock += count; break;
    case 'rootglass': rootglassNodes.slice(0,count).forEach(node => rootglass.add(node.id)); break;
    case 'glowcaps':
      glowcapNodes.slice(0,count).forEach(node => gatheredGlowcaps.add(node.id));
      glowcaps = Math.min(glowcapNodes.length, glowcaps + count);
      break;
    case 'shadows': shadowStock += count; break;
    case 'crystals': crystalNodes.slice(0, count).forEach(node => crystals.add(node.id)); break;
    case 'dusklilies':
      knownFlowers.slice(0, count).forEach(flower => collected.add(flower.id));
      if (quest === 'unoffered') quest = 'accepted';
      break;
    case 'fish': fishing.fish += count; break;
    case 'driftwood': fishing.driftwood += count; break;
    case 'berrySeeds': berrySeeds += count; break;
    case 'catnipSeed': catnipUnlocked = true; break;
    case 'net': hasNet = true; break;
    case 'soakedBook': fishing.book = true; break;
    case 'tideglass': fishing.tideglass = 'caught'; break;
    case 'godslayer': fishing.godslayer = true; equipped = 'godslayer'; break;
    case 'hatchet': tools.hatchet = true; equipped = 'hatchet'; break;
    case 'pickaxe': tools.pickaxe = true; equipped = 'pickaxe'; break;
    case 'ironSword': tools.ironSword = true; equipped = 'ironSword'; break;
    case 'shadowBlade': tools.shadowBlade = true; equipped = 'shadowBlade'; break;
    case 'helmet': tools.helmet = true; break;
    case 'charm': tools.charm = true; break;
    case 'flowerCrown': tools.flowerCrown = true; hearthLearned = true; quest = 'complete'; break;
    case 'brassKey': quest = 'complete'; break;
    case 'rootKey': hasRootKey = true; rootKeyQuest = 'complete'; break;
  }
  const option = el('admin-item').selectedOptions[0];
  const label = option && el('admin-item').value === kind ? option.textContent : kind;
  debugStatus(label + ' added');
}

function giveBossTestKit() {
  testRun = true;
  health = 100; composure = 100; berries = Math.max(berries, 12);
  ironStock += 12; shadowStock += 12;
  crystals = new Set(crystalNodes.map(node => node.id));
  tools.hatchet = true; tools.pickaxe = true; tools.ironSword = true;
  tools.shadowBlade = true; tools.helmet = true; tools.charm = true;
  tools.flowerCrown = true; hearthLearned = true; quest = 'complete';
  fishing.godslayer = true; equipped = 'godslayer';
}

el('admin-claim-ring').addEventListener('click', () => {
  if (adminRing) return;
  adminRing = true;
  saveCamp();
  el('admin-claim-ring').hidden = true;
  el('notice-status').textContent = 'Admin Ring added to your backpack. Use it anywhere to open tools or teleport.';
});
el('admin-grant').addEventListener('click', () => {
  grantTestItem(el('admin-item').value, el('admin-amount').value);
});
el('admin-godslayer').addEventListener('click', () => grantTestItem('godslayer'));
el('admin-boss-test').addEventListener('click', () => {
  giveBossTestKit();
  victory = null; endingScene = null;
  closeDialogue();
  enterRegion('king', { x: TRIAL_START, ground: 'king-floor' });
  trial = startTrial();
  updateTrialHud(); updatePrompt(); saveCamp();
});
el('admin-restore').addEventListener('click', () => {
  health = 100; composure = 100;
  debugStatus('Health and Composure restored');
});
el('admin-close').addEventListener('click', () => {
  el('admin-panel').hidden = true;
  if (adminPanelFromRing) {
    adminPanelFromRing = false;
    openAdminRing();
    return;
  }
  el('notice-form').hidden = false;
  el('notice-list').hidden = false;
  el('notice-status').textContent = testRun
    ? 'This adventure remains marked as a test run.'
    : 'Ring access is ready. No test tools have been used.';
});
el('pause').addEventListener('click', () => setPause(!paused));
el('resume').addEventListener('click', () => setPause(false));
el('leave-trial').addEventListener('click', () => retreatFromTrial());
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
el('bagFeed').addEventListener('click', feedAlvin);
el('bagAdminRing').addEventListener('click', () => {
  if (!adminRing || !inventoryOpen) return;
  closeInventory();
  openAdminRing();
});
el('quickBerry').addEventListener('click', eatBerry);
el('wave').addEventListener('click', startWave);

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
  if (key === 'arrowdown' || key === 's') {
    event.preventDefault();
    if (region === 'rootdeep' && (rootdeepClimbing || nearRootdeepLadder())) {
      rootdeepClimbing = true;
      heldKeys.add(key);
    } else if (!event.repeat) dropThrough(player, terrain);
    return;
  }
  if (jumpKeys.has(key) && (key !== ' ' || !event.target.closest('button'))) {
    event.preventDefault();
    if (region === 'rootdeep' && key !== ' ' && (rootdeepClimbing || nearRootdeepLadder())) {
      rootdeepClimbing = true;
      heldKeys.add(key);
    } else if (!event.repeat) jump(player);
  }
  if (event.repeat) return;
  if (key === 'e') interact();
  if (key === 'g') startWave();
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
el('down').addEventListener('pointerdown', event => {
  if (!controlsActive() || region !== 'rootdeep' || !(rootdeepClimbing || nearRootdeepLadder())) return;
  event.preventDefault();
  rootdeepClimbing = true;
  heldPointers.set(event.pointerId, 'down');
  el('down').setPointerCapture(event.pointerId);
});
el('down').addEventListener('pointerup', event => heldPointers.delete(event.pointerId));
el('down').addEventListener('pointercancel', event => heldPointers.delete(event.pointerId));
el('down').addEventListener('click', event => {
  if (!controlsActive()) return;
  if (event.detail === 0 && region === 'rootdeep' && (rootdeepClimbing || nearRootdeepLadder())) {
    rootdeepClimbing = true;
    player.y = Math.min(rootdeepTerrain.floor.points[0][1], player.y + 130);
  } else if (!nearRootdeepLadder()) dropThrough(player, terrain);
});
el('jump').addEventListener('pointerdown', event => {
  event.preventDefault();
  if (!controlsActive()) return;
  if (region === 'rootdeep' && (rootdeepClimbing || nearRootdeepLadder())) {
    rootdeepClimbing = true;
    heldPointers.set(event.pointerId, 'up');
    el('jump').setPointerCapture(event.pointerId);
  } else jump(player);
});
el('jump').addEventListener('pointerup', event => heldPointers.delete(event.pointerId));
el('jump').addEventListener('pointercancel', event => heldPointers.delete(event.pointerId));
el('jump').addEventListener('click', event => {
  if (event.detail === 0 && controlsActive()) {
    if (region === 'rootdeep' && (rootdeepClimbing || nearRootdeepLadder())) {
      rootdeepClimbing = true;
      player.y = Math.max(80, player.y - 130);
    } else jump(player);
  }
});
el('interact').addEventListener('click', interact);
window.addEventListener('blur', clearControls);
window.addEventListener('pagehide', () => { saveCamp(); disconnectPresence(); });
window.addEventListener('pageshow', connectPresence);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    clearControls();
    saveCamp();
    disconnectPresence('Away');
  } else connectPresence();
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
      lyss: spriteBounds(keepers, .5, 1, .55),
      hugh: spriteBounds(keepers, 0, .5, .52)
    };
    drawPortrait(el('choose-boy').querySelector('canvas'), sprites.boy);
    drawPortrait(el('choose-girl').querySelector('canvas'), sprites.girl);
    el('begin').disabled = false;
    el('begin').textContent = 'Enter Alder Camp →';
    const saved = getSavedCamp();
    el('continue').hidden = !saved;
    if (saved?.publicName) el('player-name').value = saved.publicName;
    updatePresenceButton();
    resize();
    requestAnimationFrame(frame);
  } catch (error) {
    console.error('Camp load failed', error);
    el('load-error').hidden = false;
  }
}

boot();

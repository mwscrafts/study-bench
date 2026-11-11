Warning: truncated output (original token count: 30073)
Total output lines: 2718

import { VIEW_WIDTH, SPAWN_X, CAMP_X, campTerrain, landmarks, flowers,
  groundAt, surfaceAt, clamp, createPlayer, jump, dropThrough, movePlayer, nearbyLandmark } from './terrain.mjs?v=15';
import { buildCampArt, paintHorizon, paintCampTint, paintFlame, paintFlower, paintCraftingProps } from './camp-art.mjs?v=13';
import { crownwoodLandmarks, crownwoodTimberTrees, crystalNodes } from './crownwood.mjs?v=13';
import { paintCrownwoodWater, paintCrystal, paintCrownwoodShadow, paintCrownwoodPines } from './crownwood-art.mjs?v=14';
import { hugh, netChest, oreNodes, flint } from './mine.mjs?v=15';
import { paintMineLights, paintMineChest, paintOre, paintFlint } from './mine-art.mjs?v=04';
import { rootdeepTerrain, rootdeepLandmarks, rootglassNodes, rootdeepOreNodes, glowcapNodes } from './rootdeep.mjs?v=4';
import { paintRootdeepLights, paintRootglass, paintDorrin, paintRootdeepLift,
  paintRootdeepSettler, paintGlowcap, buildRootdeepArt } from './rootdeep-art.mjs?v=8';
import { beachFlower, readFishing, castNet } from './beach.mjs?v=1';
import { paintBeachHorizon, paintBeachDetails } from './beach-art.mjs';
import { timberTrees, WOOD_COST, readTools, spareWood } from './crafting.mjs?v=17';
import { SWING_TIME, TOOL_COOLDOWN, SWING_IMPACT, BERRY_HEAL, gear, berryBushes, puff, floater,
  advanceGatheringEffects, paintGatheringEffects, paintHeldTool, paintBerryBush } from './equipment.mjs?v=09';
import { renderInventory } from './backpack.mjs?v=09';
import { hearthNote } from './hearth.mjs?v=10';
import { paintHearthDetails } from './hearth-art.mjs';
import { kingLandmarks, ARENA, TRIAL_START, REST_X, MAX_BOSS_HP,
  endings, startTrial, trialBounds, attackTrial, advanceTrial, trialHint, formatTime } from './king.mjs?v=12';
import { paintKingGrounds, paintFireworks } from './king-art.mjs?v=13';
import { readVictory, openTimeBoard } from './time-board.mjs?v=10';
import { paintRestoredKing } from './village.mjs?v=12';
import { campFacilities, paintHutWindow, paintHutDecor, paintCampFacilities } from './camp-idle.mjs?v=18';
import { createPresence } from './presence.mjs?v=2';
import { regions, knownLandmarks, knownFlowers, gates, liftGates, conversations } from './world-data.mjs?v=6';
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
let treeHarvestDays = {};
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
    paintCraftingProps(ctx, tools, treeStage);
    if (fishing.tideglass === 'spent' || sharedDoors.has('mine-lift')) paintOpenLift(ctx,2415,groundAt(2415)-127);
    for (const bush of berryBushes) paintBerryBush(ctx, bush, pickedBushes.has(bush.id));
    paintCampFacilities(ctx, { berryPlots, growMs:BERRY_GROW_MS, catnipUnlocked,
      catnipReadyAt, catnipShowUntil, minecartOre, minecartUnlocked: fishing.tideglass === 'spent' && hughQuest }, animationClock);
  } else if (region === 'crownwood') {
    paintCrownwoodPines(ctx, tools.chopped, treeStage);
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
  items.push(...currentFlowers().filte…15073 tokens truncated…etDialogue(conversations[id].greeting);
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
      advanceTreeRegrowth();
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
// Fire on press so touch players can keep a movement button held while tapping action.
el('interact').addEventListener('pointerdown', event => {
  if (!controlsActive()) return;
  event.preventDefault();
  interact();
});
// Keyboard and assistive-technology activation can dispatch click without pointerdown.
el('interact').addEventListener('click', event => {
  if (event.detail === 0) interact();
});
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

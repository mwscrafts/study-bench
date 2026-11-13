Warning: truncated output (original token count: 44283)
Total output lines: 3727

import { VIEW_WIDTH, SPAWN_X, CAMP_X, campTerrain, landmarks, flowers,
  groundAt, surfaceAt, clamp, createPlayer, jump, dropThrough, movePlayer, nearbyLandmark } from './terrain.mjs?v=17';
import { buildCampArt, paintHorizon, paintCampTint, paintFirelight, paintFlame, paintFlower, paintCraftingProps } from './camp-art.mjs?v=15';
import { crownwoodLandmarks, crownwoodTimberTrees, crystalNodes, crownwoodTerrain, crownwoodKingBridgeTerrain,
  KING_BRIDGE_START, KING_BRIDGE_END, KING_BRIDGE_WOOD_COST, KING_BRIDGE_IRON_COST } from './crownwood.mjs?v=15';
import { paintBarry, paintRootdeepEntranceLock, paintCrownwoodWater, paintCrystal, paintCrownwoodShadow,
  paintCrownwoodPines, paintKingBridge } from './crownwood-art.mjs?v=16';
import { hugh, netChest, oreNodes, flint } from './mine.mjs?v=16';
import { paintMineLights, paintMineChest, paintOre, paintFlint, paintMineTunnel, paintDiscardedStilts } from './mine-art.mjs?v=07';
import { rootdeepTerrain, rootdeepLandmarks, rootglassNodes, rootdeepOreNodes, glowcapNodes, rootdeepBranchLanterns, rootdeepSettlerRoutes, rootdeepSettlerState } from './rootdeep.mjs?v=9';
import { paintRootdeepLights, paintRootglass, paintDorrin, paintRootdeepLift,
  paintRootdeepSettler, paintGlowcap, buildRootdeepArt, paintRootdeepTunnel, paintTunnelGoblin, paintTunnelGuard } from './rootdeep-art.mjs?v=14';
import { beachFlower, readFishing, castNet, fishingLevel, fishingProgress,
  ROWBOAT_WOOD_COST } from './beach.mjs?v=4';
import { paintBeachHorizon, paintBeachDetails, paintRowboat } from './beach-art.mjs?v=6';
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
import { paintRestoredKing, buildVillageArt } from './village-art.mjs?v=1';
import { VILLAGE_HOME_WOOD_COST, VILLAGE_HOME_IRON_COST, LYSS_CABIN_WOOD_COST, LYSS_CABIN_IRON_COST,
  BARRY_HOME_WOOD_COST, BARRY_HOME_IRON_COST } from './home-projects.mjs?v=2';
import { paintVillageHomeExterior, paintVillageHomeDecor, paintLyssCabinDecor, paintBarryHomeExterior } from './home-projects-art.mjs?v=2';
import { campFacilities, paintHutWindow, paintHutDecor, paintCampFacilities } from './camp-idle.mjs?v=18';
import { createPresence } from './presence.mjs?v=4';
import { specialRequests, specialRewardChoices, paintTrailScarf, paintAlvinBell, paintSpecialHomeDecor } from './special-rewards.mjs?v=1';
import { regions, knownLandmarks, knownFlowers, gates, liftGates, conversations } from './world-data.mjs?v=16';
import { mapRegionIds, renderFieldMap } from './field-map.mjs?v=2';
import { WAVE_TIME, loadImage, spriteBounds, drawSprite, drawPortrait, paintComposureWraith,
  paintWave, paintOpenLift, paintLodestone, paintShadow } from './canvas-art.mjs?v=3';

const allTimberTrees = [...timberTrees, ...crownwoodTimberTrees];
const allIronNodes = [...oreNodes, ...rootdeepOreNodes];
const el = id => document.getElementById(id);
const world = el('world');
const ctx = world.getContext('2d');
const SAVE_KEY = 'first-hearth:alder-camp:v1';
const journalCatalog = [
  { id: 'first-steps', title: 'A field journal', body: 'The trail will teach you as you explore. New notes are added here when you encounter useful things, so you can keep moving and read them whenever you like.' },
  { id: 'controls', title: 'Finding your way', body: 'Move with A and D or the arrow keys. Space jumps; E interacts with nearby people and objects, or swings your equipped tool. On touch screens, use the controls below the world.' },
  { id: 'composure', title: 'Keeping your composure', body: 'Nearby threats wear down Composure, and fighting while one is close drains it faster. At zero Composure, you lose 1 health each second. In the hut, pet Alvin to restore up to 25 Composure.' },
  { id: 'trail-tallies', title: 'Trail tallies', body: 'Your adventure keeps a count of fishing casts at Lantern Dock and offshore, plus pets given to Alvin in the hut.' },
  { id: 'fishing', title: 'Fishing and the rowboat', body: 'Each completed cast earns fishing experience. Fishing level 10 unlocks the rowboat project at Tide Arch. Once built, the boat lets you cast farther offshore for larger catches.' },
  { id: 'gathering', title: 'Gathering along the trail', body: 'Get close to a plant, ore vein, or other resource and use E (or the action button). Some things need the right tool. Supplies save with your adventure; useful notes appear here as you discover them.' },
  { id: 'berries', title: 'Berries and health', body: 'Berry bushes add berries to your backpack. Eat one with the Berry button or from your backpack to restore health.' },
  { id: 'gear', title: 'Tools and gear', body: 'Open your backpack with I to review supplies and equipment. Tap a piece of gear you own to equip it; E uses your equipped tool when you act.' },
  { id: 'regions', title: 'Beyond Alder Camp', body: 'Entrances and gates lead between regions. Explore each trail for new people, resources, and routes. Your adventure, discoveries, and journal are saved on this device.' },
  { id: 'alvin', title: 'A quiet moment with Alvin', body: 'Pet Alvin in the hut to restore up to 25 Composure. The hut is a safe place to recover before heading back into danger.' },
  { id: 'iron-branch', title: 'The dark iron gallery', body: 'The iron gallery has an unlit lantern. A Glowcap can restore it and make a safer pocket beside this branch. Other parts of Rootdeep remain dangerous.' },
  { id: 'root-branch', title: 'The shadow-root branch', body: 'A lantern has gone dark among the tangled roots. Restore it with a Glowcap to ease the danger nearby. This light is separate from the settlement and the old tunnel.' },
  { id: 'old-tunnel', title: 'The old minecart tunnel', body: 'The collapsed tunnel may join Rootdeep to Hugh’s mine. First clear the cave goblins. Relight the passage with Glowcaps so the dwarves can assess it; then bring timber for supports. The carts will run only after excavation is finished.' },
  { id: 'king-bridge', title: 'The King’s Bridge', body: 'The broken crossing on Crownwood’s high trail is the only walkable route to the King’s Grounds. Repair it with spare wood and iron; the gap cannot be crossed on foot while it is broken.' },
  { id: 'village-home', title: 'A place of your own', body: 'After the King, a village plot can become a home for you and Alvin. Gather wood and iron to build it, then return to furnish its rooms whenever you like.' },
  { id: 'lyss-cabin', title: 'A cabin for Lyss', body: 'Lyss’s tent can become a little log cabin beside the forge. This is her home, separate from your village house. Help furnish it after the walls go up.' },
  { id: 'barry-home', title: 'Barry’s workshop', body: 'Barry can make a sturdy home and workshop above the Crownwood bridge. Bring ten spare wood and four iron to build it.' }
];
const PRESENCE_KEY = 'first-hearth:solo:v1';
const DAY_LENGTH = 136;
const WORLD_CYCLE_MS = DAY_LENGTH * 1000;
const DAY_DUSK_START = 48;
const DUSK_NIGHT_START = 60;
const NIGHT_START = 70;
const NIGHT_FADE_START = 96;
const NIGHT_END = 106;
const DAY_START = 121;
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
let branchLanternsLit = new Set();
let tunnelStage = 'goblins';
let tunnelSeen = false;
let tunnelGuardSpoken = false;
let tunnelQuestAccepted = false;
let pendingTunnelReunion = false;
let hughStiltsRevealed = false;
let kingBridgeQuest = 'unoffered';
let villageHomeQuest = 'unoffered';
let lyssCabinQuest = 'unoffered';
let barryHomeQuest = 'unoffered';
let villageHomeDecor = new Set();
let lyssCabinDecor = new Set();
let lyssCabinThanksSeen = false;
let defeatedTunnelGoblins = new Set();
let tunnelGoblins = [];
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
let pickaxeRecipeLearned = false;
let treeHarvestDays = {};
let glowcapHarvestDays = {};
let fishing = readFishing();
let fishingCastCount = 0;
let alvinPetCount = 0;
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
let specialRewards = new Set();
let pendingSpecialReward = null;
let equipped = null;
let inventoryOpen = false;
let journalOpen = false;
let mapOpen = false;
let discoveredRegions = new Set(['camp']);
let alvinResting = false;
let journalEntries = new Set();
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
let publicClockCycle = null;
let publicClockOffsetMs = 0;
let hasReceivedPublicClock = false;
let sleepVotePending = false;
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
    scarf: specialRewards.has('scarf'),
    alvin: alvinResting && region !== 'hut' ? null : { x: cat.x, y: cat.y, direction: cat.direction, gait: cat.gait,
      size: 1 + fishFed / 4, indoors: region === 'hut', bell: specialRewards.has('bell') }
  }),
  isOnline: () => onlineEnabled,
  isPlaying: () => playing,
  isHidden: () => document.hidden,
  onChange: updatePresenceButton,
  onDoorsChange: () => { updatePrompt(); updateNotes(); },
  onNotesChange: () => { if (playing) updateNotes(); },
  onShadowState: applySharedShadowState,
  onSleepStatus: updateSleepVoteStatus,
  onSleepComplete: applySharedSleep,
  onClockOffset: applyClockOffset
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
      paintShadow(ctx, peer.alvinX, peer.alvinY, 17);
      drawSprite(ctx, sprites.alvin, peer.alvinX, peer.alvinY, (indoor ? 37 : 44) * size,
        indoor ? 1 : alvin.direction, indoor ? 0 : -Math.abs(Math.sin(alvin.gait || 0)) * 2.2,
        indoor ? -Math.PI / 2 : Math.sin(alvin.gait || 0) * .035);
      if (alvin.bell === true) paintAlvinBell(ctx,peer.alvinX,peer.alvinY,size,indoor);
      ctx.restore();
    }
    peer.x += (pose.x - peer.x) * .38;
    peer.y += (pose.y - peer.y) * .38;
    const bob = pose.moving ? -Math.abs(Math.sin(pose.gait)) * 4 : 0;
    const tilt = (pose.moving ? Math.sin(pose.gait) * .045 : 0) + pose.swing * -.23;
    ctx.save();
    if (peer.leftAt) ctx.globalAlpha = 1 - (Date.now() - peer.leftAt) / 5000;
    paintShadow(ctx,peer.x,peer.y,22);
    drawSprite(ctx,sprites[pose.avatar],peer.x,peer.y,97,pose.direction,bob,tilt);
    if (pose.scarf === true) paintTrailScarf(ctx,peer.x,peer.y,pose.direction,bob);
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

// Public Auto uses the same UTC-based phase for every browser. nightIndex
// counts nights for resource regrowth; it does not raise shadow combat stats.
function syncPublicClock() {
  if (!onlineEnabled) { publicClockCycle = null; return; }
  const now = Date.now() + publicClockOffsetMs;
  const cycle = Math.floor(now / WORLD_CYCLE_MS);
  if (publicClockCycle !== null && cycle > publicClockCycle) {
    nightIndex = Math.min(1000000, nightIndex + cycle - publicClockCycle);
    advanceTreeRegrowth();
    iron.clear();
    defeatedShadows.clear();
    shadowHealth.clear();
  }
  publicClockCycle = cycle;
  phaseClock = (now - cycle * WORLD_CYCLE_MS) / 1000;
}

function applyClockOffset(offset) {
  if (!Number.isFinite(offset)) return;
  publicClockOffsetMs = offset;
  if (!hasReceivedPublicClock) {
    const now = Date.now() + publicClockOffsetMs;
    publicClockCycle = Math.floor(now / WORLD_CYCLE_MS);
    phaseClock = (now - publicClockCycle * WORLD_CYCLE_MS) / 1000;
    hasReceivedPublicClock = true;
  } else {
    syncPublicClock();
  }
  updateShadows(); updateNotes();
}

function updateSleepVoteStatus(message) {
  if (!sleepVotePending || region !== 'hut' || el('dialogue').hidden) return;
  const votes = Number.isInteger(message.votes) ? message.votes : 0;
  const total = Number.isInteger(message.total) ? message.total : 0;
  setDialogue(votes >= total && total > 0
    ? 'Everyone is settling in. The shared sky will turn to morning.'
    : votes + ' of ' + total + ' connected travelers are ready to sleep. Everyone needs to agree at the hut bed.');
}

function applySharedSleep(offset, rested = false) {
  if (!Number.isFinite(offset)) return;
  publicClockOffsetMs = offset;
  syncPublicClock();
  iron.clear(); defeatedShadows.clear(); shadowHealth.clear();
  if (rested) {
    health = 100;
    skyMode = 'auto';
    el('sky-toggle').textContent = 'Sky: Auto';
    saveCamp();
  }
  updateShadows(); updateNotes();
  if (sleepVotePending && region === 'hut' && !el('dialogue').hidden) {
    sleepVotePending = false;
    setDialogue(rested
      ? 'You wake rested at dawn. The public sky has changed for everyone, and Alvin is still tucked into his little bed.'
      : 'The group rested together, and the shared sky has reached morning.');
  }
}

function applySharedShadowState(message) {
  if (!message || message.region !== region || message.cycle !== publicClockCycle || !Number.isInteger(message.index)) return;
  const id = region + ':' + nightIndex + ':' + message.index;
  const target = creatures.find(creature => creature.index === message.index);
  const x = Number.isFinite(message.x) ? message.x : target?.x ?? player.x;
  const y = Number.isFinite(message.y) ? message.y : target?.y ?? player.y;
  shadowHealth.set(id, Math.max(0, Number(message.hp) || 0));
  if (message.defeated && !defeatedShadows.has(id)) {
    defeatedShadows.add(id);
    creatures = creatures.filter(creature => creature.index !== message.index);
    if (message.rewarded) {
      shadowStock++;
      floater(floaters, x, y - 116, '+1 shadow');
    }
    updateNotes(); saveCamp();
  }
}

function skyState() {
  if (region === 'king' && (trial || victory)) {
    const phase = victory ? 'dawn' : 'night';
    return { from: phase, to: phase, mix: 0 };
  }
  if (skyMode !== 'auto') return { from: skyMode, to: skyMode, mix: 0 };
  const time = phaseClock % DAY_LENGTH;
  if (time < DAY_DUSK_START) return { from: 'day', to: 'day', mix: 0 };
  if (time < DUSK_NIGHT_START) return { from: 'day', to: 'dusk', mix: (time - DAY_DUSK_START) / (DUSK_NIGHT_START - DAY_DUSK_START) };
  if (time < NIGHT_START) return { from: 'dusk', to: 'night', mix: (time - DUSK_NIGHT_START) / (NIGHT_START - DUSK_NIGHT_START) };
  if (time < NIGHT_FADE_START) return { from: 'night', to: 'night', mix: 0 };
  if (time < NIGHT_END) return { from: 'night', to: 'dawn', mix: (time - NIGHT_FADE_START) / (NIGHT_END - NIGHT_FADE_START) };
  if (time < DAY_START) return { from: 'dawn', to: 'day', mix: (time - NIGHT_END) / (DAY_START - NIGHT_END) };
  return { from: 'day', to: 'day', mix: 0 };
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

function paintRegionalLodestones() {
  for (const stone of regions[region].landmarks.filter(item => item.id.startsWith('lodestone-'))) {
    paintLodestone(ctx, stone, activatedLodestones.has(stone.id), animationClock);
  }
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
    paintFirelight(ctx, 2258, 595, 132, .18 + night * .42);
    paintFirelight(ctx, 2150, 582, 90, .08 + night * .25);
    paintFirelight(ctx, 4168, 677, 90, .12 + night * .31);
    paintFlame(ctx, 2258, 604, animationClock);
    for (let i = 0; i < 7; i++) {
      const rise = (animationClock * 26 + i * 14) % 97;
      ctx.fillStyle = 'rgba(255,204,123,' + ((1 - rise / 97) * .8) + ')';
      ctx.fillRect(2258 + Math.sin(rise * .08 + i) * 15, 594 - rise, 2.7, 2.7);
    }
    const lyss = landmarks[0];
    paintShadow(ctx, lyss.x, lyss.y, 24);
    drawSprite(ctx, sprites.lyss, lyss.x, lyss.y, 98);
    paintCraftingProps(ctx, tools, treeStage);
    if (fishing.tideglass === 'spent' || sharedDoors.has('mine-lift')) paintOpenLift(ctx,2415,groundAt(2415)-127);
    for (const bush of berryBushes) paintBerryBush(ctx, bush, pickedBushes.has(bush.id));
    paintCampFacilities(ctx, { berryPlots, growMs:BERRY_GROW_MS, catnipUnlocked,
      catnipReadyAt, catnipShowUntil, minecartOre, minecartUnlocked: fishing.tideglass === 'spent' && hughQuest }, animationClock);
  } else if (region === 'crownwood') {
    paintKingBridge(ctx, kingBridgeQuest === 'complete');
    paintCrownwoodPines(ctx, tools.chopped, treeStage);
    paintBarryHomeExterior(ctx,barryHomeQuest === 'complete');
    const barry = crownwoodLandmarks.find(item => item.id === 'barry');
    paintShadow(ctx, barry.x, barry.y, 29);
    paintBarry(ctx, barry.x, barry.y);
    if (camera.x < 4100 && camera.x + camera.width > 3200) paintCrownwoodWater(ctx, animationClock);
    crystalNodes.forEach(node => {
      if (!crystals.has(node.id)) paintCrystal(ctx, node, animationClock);
    });
    paintRegionalLodestones();
    if (!hasRootKey && !sharedDoors.has('rootdeep-entrance')) {
      const entrance = crownwoodLandmarks.find(item => item.id === 'rootdeep-entrance');
      paintRootdeepEntranceLock(ctx, entrance);
    }
  } else if (region === 'rootdeep') {
    paintRootdeepLights(ctx, camera, animationClock, night, glowcapLanternLit, branchLanternsLit);
    paintRootdeepTunnel(ctx, tunnelStage, animationClock);
    for(const goblin of tunnelGoblins) paintTunnelGoblin(ctx, goblin, animationClock);
    if(['timber','open'].includes(tunnelStage)) paintRootdeepSettler(ctx,355,4860,animationClock,2,.46);
    for (const node of rootglassNodes) if (!rootglass.has(node.id)) paintRootglass(ctx,node,animationClock);
    for (const node of rootdeepOreNodes) if (!iron.has(node.id)) paintOre(ctx,node,animationClock);
    for (const node of glowcapNodes) if (!gatheredGlowcaps.has(node.id)) paintGlowcap(ctx,node,animationClock);
    const guard = rootdeepLandmarks.find(item => item.id === 'rootdeep-guard');
    paintTunnelGuard(ctx,guard.x,guard.y,animationClock);
    const dorrin = rootdeepLandmarks.find(item => item.id === 'dorrin');
    paintShadow(ctx,dorrin.x,dorrin.y,15);
    paintDorrin(ctx,dorrin.x,dorrin.y,animationClock);
    for (const route of rootdeepSettlerRoutes) {
      const state = rootdeepSettlerState(route,rootdeepRoutineTime());
      if(state.atHome) continue;
      paintShadow(ctx,state.x,state.y,13);
      paintRootdeepSettler(ctx,state.x,state.y,animationClock,route.variant,.46,state.moving);
    }
    const high = rootdeepLandmarks.find(item => item.id === 'rootdeep-lift-high');
    const low = rootdeepLandmarks.find(item => item.id === 'rootdeep-lift-low');
    // The upper winch is drawn into the settlement artwork so its snapped/repaired
    // cable can change as one coherent illustration; only the lower cage is overlaid.
    paintRootdeepLift(ctx,low.x,low.y,rootdeepQuest === 'complete');
  } else if (region.startsWith('rootdeep-home-')) {
    const resident = regions[region].landmarks[1];
    if(rootdeepResidentAtHome(resident.id)) {
      paintShadow(ctx,resident.x,resident.y,13);
      paintRootdeepSettler(ctx,resident.x,resident.y,animationClock,
        region.endsWith('lantern') ? 1 : region.endsWith('stone') ? 2 : 3,.52);
    }
  } else if (region === 'mine') {
    paintMineLights(ctx, camera, animationClock, night);
    paintMineTunnel(ctx, tunnelStage);
    paintMineChest(ctx, hasNet);
    if (fishing.tideglass === 'spent' || sharedDoors.has('mine-lift')) paintOpenLift(ctx,4510,695);
    for (const node of oreNodes) {
      if (!iron.has(node.id)) paintOre(ctx, node, animationClock);
    }
    if (!tools.flint) paintFlint(ctx);
    paintRegionalLodestones();
    paintShadow(ctx, hugh.x, hugh.y, 26);
    if(tunnelStage === 'open') {
      paintRootdeepSettler(ctx,2035,hugh.y,animationClock,1,.47);
      paintRootdeepSettler(ctx,2290,hugh.y,animationClock,3,.44);
    }
    if(hughStiltsRevealed) paintDiscardedStilts(ctx,1955,hugh.y);
    drawSprite(ctx, sprites.hugh, hugh.x, hugh.y, hughStiltsRevealed ? 64 : 105);
  } else if (region === 'beach') {
    if (fishing.rowboat) paintRowboat(ctx);
    paintBeachDetails(ctx, camera, animationClock, night, casting);
    paintRegionalLodestones();
  } else if (region === 'hearth') {
    paintHearthDetails(ctx, animationClock, night, hearthLearned);
  } else if (region === 'king') {
    paintKingGrounds(ctx, trial, endingScene && !endingScene.struck ? { ...victory, ending: null } : victory, animationClock, endingScene, sharedDoors.has('village-gate'));
    if (trial?.stage === 'shadows') trial.shadows.forEach((shadow, index) =>
      paintCrownwoodShadow(ctx, { ...shadow, index }, animationClock));
    paintFireworks(ctx, camera, fireworksElapsed);
  } else if (region === 'village') {
    if (victory?.ending === 'free') paintRestoredKing(ctx);
    paintVillageHomeExterior(ctx,villageHomeQuest === 'complete');
  } else if (region === 'village-home') {
    paintVillageHomeDecor(ctx,villageHomeDecor);
    paintSpecialHomeDecor(ctx,'village',specialRewards,hutDecorations);
  } else if (region === 'lyss-cabin') {
    paintLyssCabinDecor(ctx,lyssCabinDecor);
  } else if (region === 'hut') {
    paintHutWindow(ctx, phase, animationClock);
    paintHutDecor(ctx, hutDecorations);
    paintSpecialHomeDecor(ctx,'hut',specialRewards,hutDecorations);
  }
  const shadowFade = skyMode === 'auto' && phaseClock >= NIGHT_FADE_START
    ? clamp((NIGHT_END - phaseClock) / (NIGHT_END - NIGHT_FADE_START), 0, 1) : 1;
  ctx.save();
  ctx.globalAlpha *= shadowFade;
  creatures.forEach(creature => paintCrownwoodShadow(ctx, creature, animationClock));
  ctx.restore();
  currentFlowers().forEach(flower => {
    if (!collected.has(flower.id)) paintFlower(ctx, flower, selectedLandmark === flower, animationClock);
  });
  paintPeers();
  if (playing && composure < 10 && region !== 'hut' && !region.startsWith('rootdeep-home-')) {
    paintComposureWraith(ctx, clamp(player.x - player.direction * 92, 45, terrain.width - 45), player.y, animationClock);
  }
  if (playing && (!alvinResting || region === 'hut')) {
    const indoor = region === 'hut';
    const catX = indoor ? 665 : cat.x;
    const catY = indoor ? 596 : cat.y;
    paintShadow(ctx, catX, catY, 17);
    drawSprite(ctx, sprites.alvin, catX, catY, (indoor ? 37 : 44) * (1 + fishFed / 4), indoor ? 1 : cat.direction,
      indoor ? 0 : -Math.abs(Math.sin(cat.gait)) * 2.2, indoor ? -Math.PI / 2 : Math.sin(cat.gait) * .035);
    if (specialRewards.has('bell')) paintAlvinBell(ctx,catX,catY,1 + fishFed / 4,indoor);
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
  if (player.ground) paintShadow(ctx, player.x, player.y, 22);
  if (animationClock < hitUntil && Math.floor(animationClock * 13) % 2) ctx.globalAlpha = .52;
  const bob = player.moving && player.ground ? -Math.abs(Math.sin(gait)) * 4 : 0;
  const tilt = (player.moving ? Math.sin(gait) * .045 : 0) + swing * -.23;
  const facing = swing > 0 ? swingDirection : player.direction;
  drawSprite(ctx, sprites[avatar], player.x, player.y, 97, facing, bob, tilt);
  if (specialRewards.has('scarf')) paintTrailScarf(ctx,player.x,player.y,facing,bob);
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
  if (alvinResting || alvinCatnipVisits < 3 || region === 'hut' || victory || trial?.stage === 'alvin') return false;
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
        if (onlineEnabled && presence.isConnected()) {
          presence.hitShadow(target.index, power, target.x, target.y, 'alvin');
        } else {
          const remaining = (shadowHealth.get(id) ?? 60) - power;
          shadowHealth.set(id,remaining);
          if (remaining <= 0) {
            defeatedShadows.add(id);
            creatures = creatures.filter(item => item !== target);
            shadowStock++;
            floater(floaters,target.x,target.y-116,'+1 shadow');
            updateNotes(); saveCamp();
          }
        }
        puff(particles,target.x,target.y-44,'#d9b8ea',8);
        floater(floaters,target.x,target.y-90,'Alvin −'+power);
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
    targetY = surfaceAt(terrain.byId.get('rope-bridge'), targ…26283 tokens truncated… it.');
    } else if (glowcaps < 1) {
      setDialogue('This branch lantern has gone out. One Glowcap could restore it. Gather one in the Glowcap Hollows and return here.');
    } else {
      setDialogue('The ' + item.name + ' lantern is cold. Use one Glowcap to relight this branch?', [
        ['Use 1 Glowcap', () => {
          glowcaps--;
          branchLanternsLit.add(id);
          notice = item.name + ' lantern restored';
          noticeUntil = animationClock + 3;
          updateNotes(); updatePrompt(); saveCamp();
          closeDialogue();
        }],
        ['Leave it', closeDialogue]
      ]);
    }
    saveCamp();
    return;
  }
  if (id === 'village-home-site' || id === 'lyss-tent-site') {
    homeBuildDialogue(id === 'village-home-site' ? 'village' : 'lyss');
    return;
  }
  if (id === 'barry-home-site') {
    barryHomeBuildDialogue();
    return;
  }
  if (id === 'village-home-decor' || id === 'lyss-cabin-decor') {
    homeDecorDialogue(id === 'village-home-decor' ? 'village' : 'lyss');
    return;
  }
  if (id === 'rootdeep-tunnel' || id === 'mine-tunnel') {
    tunnelDialogue(item);
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
  if (!playing || talking || inventoryOpen || mapOpen) return;
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
  if (alvinResting) {
    setDialogue('Alvin is resting at home. Bring him from his bed in the Alder Camp hut before starting the final night. He has a part to play.');
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

function inRestoredBranchLight(x, y) {
  return region === 'rootdeep' && rootdeepBranchLanterns.some(lamp =>
    branchLanternsLit.has(lamp.id) && Math.hypot(x - lamp.x, y - lamp.y) < 205);
}

function updateComposure(dt) {
  if (victory && region === 'king') return;
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
      const difficultyDrain = difficulty === 'easy' ? .6 : 1;
      composure = Math.max(0, composure - dt * (.8 + proximity * 1.6 + (fighting ? 1.2 : 0)) *
        difficultyDrain * (inRestoredBranchLight(player.x, player.y) ? .4 : 1));
    }
  }
  if (composure < 100) recordJournalEntry('composure');
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

function updateTunnelGoblins(dt) {
  if(region !== 'rootdeep' || tunnelStage !== 'goblins' || !tunnelGoblins.length) return;
  for(const goblin of tunnelGoblins) {
    const gap=player.x-goblin.x, vertical=Math.abs(player.y-goblin.y);
    if(vertical < 100 && Math.abs(gap) < 360) goblin.x=clamp(goblin.x+Math.sign(gap)*Math.min(Math.abs(gap),dt*76),320,620);
    goblin.y=surfaceAt(rootdeepTerrain.byId.get('rootdeep-floor'),goblin.x);
    if(vertical < 66 && Math.abs(player.x-goblin.x) < 36 && animationClock >= hitUntil) {
      const damage=difficulty === 'hard' ? 13 : 6;
      health=Math.max(0,health-damage);
      hitUntil=animationClock+1.5;
      if(!health) {
        health=100;
        enterRegion('rootdeep',{x:1660,ground:'rootdeep-level-8'});
        notice='Alvin led you away from the cave goblins.';
      } else notice='Cave goblin hit · '+health+' health left';
      noticeUntil=animationClock+2;
      updateNotes(); saveCamp();
      break;
    }
  }
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
  if (!forcedNight && (phaseClock < NIGHT_START || phaseClock >= NIGHT_END)) {
    creatures = [];
    if (phaseClock < 70) creatureCycleKey = cycleKey;
    return;
  }
  const current = new Map(creatures.map(creature => [creature.index, creature]));
  if (shadowPhase < NIGHT_FADE_START) {
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
      const speed = creature.aggro ? 104 : 76;
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
        const step = Math.min(distance, 104 * dt);
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
  const hitDamage = (difficulty === 'hard' ? 20 : 8) *
    (inRestoredBranchLight(player.x, player.y) ? .5 : 1);
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
  if (playing && onlineEnabled) syncPublicClock();
  else if (!onlineEnabled) publicClockCycle = null;
  if (wave > 0) wave = Math.max(0, wave - dt);
  if (!paused && !talking && !inventoryOpen && !mapOpen) animationClock += dt;
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
      const previousX = player.x;
      const previousGround = player.ground;
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
        const gatedLanding = surfaceAt(rootdeepTerrain.byId.get('rootdeep-level-8'), ROOTDEEP_LADDER_X);
        if (!tunnelGuardSpoken && vertical > 0 && player.y >= gatedLanding) {
          player.y = gatedLanding;
          player.ground = 'rootdeep-level-8';
          player.jumps = 0;
          rootdeepClimbing = false;
        }
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
      if (region === 'crownwood' && kingBridgeQuest !== 'complete' && player.y < 500) {
        if (previousX <= KING_BRIDGE_START && player.x > KING_BRIDGE_START) {
          player.x = KING_BRIDGE_START - 24;
          if (previousGround === 'king-bridge-west') {
            player.ground = 'king-bridge-west';
            player.y = surfaceAt(terrain.byId.get('king-bridge-west'),player.x);
            player.velocityY = 0; player.jumps = 0;
          }
        } else if (previousX >= KING_BRIDGE_END && player.x < KING_BRIDGE_END) {
          player.x = KING_BRIDGE_END + 24;
          if (previousGround === 'king-bridge-east') {
            player.ground = 'king-bridge-east';
            player.y = surfaceAt(terrain.byId.get('king-bridge-east'),player.x);
            player.velocityY = 0; player.jumps = 0;
          }
        }
      }
      if(region === 'rootdeep' && !tunnelGuardSpoken && player.y > 4200) {
        player.y = surfaceAt(rootdeepTerrain.byId.get('rootdeep-level-8'),player.x);
        player.ground = 'rootdeep-level-8';
        player.velocityY = 0;
        player.jumps = 0;
        rootdeepClimbing = false;
      }
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
    if (fishFed > 0 && !alvinResting) {
      alvinGrowthRemaining = Math.max(0, alvinGrowthRemaining - dt);
      if (alvinGrowthRemaining === 0) {
        fishFed = 0;
        sendPose(true);
        refreshInventory();
        saveCamp();
      }
    }
    if (!onlineEnabled) {
      phaseClock += dt;
      if (phaseClock >= DAY_LENGTH) {
        phaseClock -= DAY_LENGTH;
        nightIndex++;
        advanceTreeRegrowth();
        iron.clear();
        defeatedShadows.clear();
        shadowHealth.clear();
      }
    }
    updateShadows(dt);
    updateTunnelGoblins(dt);
    updateComposure(dt);
    updateKingTrial(dt);
    if (!alvinResting && trial?.stage !== 'alvin' && region !== 'hut' && !updateCatnipLeap()) {
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
  if (onlineEnabled) { syncPublicClock(); connectPresence(); }
  else { publicClockCycle = null; disconnectPresence(); }
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
el('journalButton').addEventListener('click', () => journalOpen ? closeJournal() : openJournal());
el('mapButton').addEventListener('click', () => mapOpen ? closeMap() : openMap());
el('closeMap').addEventListener('click', closeMap);
el('closeJournal').addEventListener('click', closeJournal);
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
  if (mapOpen) {
    if (key === 'escape' || key === 'm') closeMap();
    return;
  }
  if (key === 'm' && !event.repeat) {
    openMap();
    return;
  }
  if (key === 'j' && !event.repeat) {
    if (journalOpen) closeJournal();
    else openJournal();
    return;
  }
  if (journalOpen) {
    if (key === 'escape') closeJournal();
    return;
  }
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
    } else if (!event.repeat && !(region === 'rootdeep' && player.ground === 'rootdeep-level-8' && !tunnelGuardSpoken)) dropThrough(player, terrain);
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
    player.y = Math.min(tunnelGuardSpoken ? rootdeepTerrain.floor.points[0][1]
      : surfaceAt(rootdeepTerrain.byId.get('rootdeep-level-8'),ROOTDEEP_LADDER_X), player.y + 130);
  } else if (!nearRootdeepLadder() && !(region === 'rootdeep' && player.ground === 'rootdeep-level-8' && !tunnelGuardSpoken)) dropThrough(player, terrain);
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

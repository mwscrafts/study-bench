import { defineTerrain, surfaceAt, patrolShadows } from './terrain.mjs';

const floor = { id: 'rootdeep-floor', points: [[0,4860],[1920,4860]] };
const heights = [250,810,1370,1930,2490,3050,3610,4170];
const tiers = heights.map((y,index) => [{
  id: `rootdeep-level-${index+1}`,
  // One solid landing spans the mine so a normal fall always stops at the next level.
  points: [[0,y],[650,y-10],[1280,y+10],[1920,y]]
}]);
const surfaces = tiers.map(tier => tier[0]);
export const rootdeepTerrain = defineTerrain(1920, 4920, 165, [floor, ...surfaces]);

function spot(surface, id, x, label, radius = 72) {
  return { id, x, y: surfaceAt(surface, x), label, radius, ground: surface.id };
}

export const rootdeepLandmarks = [
  spot(tiers[0][0], 'rootdeep-return', 105, 'Return to Crownwood', 94),
  ...tiers.map((tier,index) => spot(tier[0], `rootdeep-ladder-${index+1}`, 1780,
    'Climb the root ladder · hold ↑ / ↓', 84)),
  spot(floor, 'rootdeep-ladder-bottom', 1780, 'Climb the root ladder · hold ↑ / ↓', 84),
  spot(tiers[3][0], 'dorrin', 1450, 'Talk to Dorrin', 96),
  spot(tiers[3][0], 'rootdeep-lift-high', 310, 'Inspect the old lift', 80),
  spot(tiers[7][0], 'rootdeep-lift-low', 1690, 'Inspect the old lift', 80),
  spot(tiers[7][0], 'deep-seal', 650, 'Examine the sealed door', 84)
];

export const rootglassNodes = [
  spot(tiers[4][0], 'rootglass-upper', 1550, 'Mine rootglass', 64),
  spot(tiers[5][0], 'rootglass-water', 410, 'Mine rootglass', 64),
  spot(tiers[7][0], 'rootglass-deep', 560, 'Mine rootglass', 64)
];

export const rootdeepLights = [
  [120,211,115],[610,740,104],[1450,755,126],[220,1315,118],[1450,1875,148],
  [550,2435,110],[1540,2438,128],[480,2995,142],[1470,3555,116],
  [1550,4115,132],[650,4700,185]
];

const names = [
  'Rootbound Threshold','Winding Galleries','Glowcap Hollows','Lanternstead',
  'Iron Choir','Flooded Reach','Rootglass Vein','The Deep Seal'
];

export function rootdeepLocation(player) {
  const level = Math.max(1, Math.min(8, Math.floor((player.y - 200) / 560) + 1));
  return names[level - 1];
}

const patrols = [
  { surface: tiers[1][0], left: 1270, right: 1780, offset: 1.2 },
  { surface: tiers[4][0], left: 90, right: 700, offset: 4.3 },
  { surface: tiers[6][0], left: 1230, right: 1800, offset: 2.7 }
];

export function rootdeepShadows(phase, nightIndex) {
  return patrolShadows(patrols, phase, nightIndex);
}

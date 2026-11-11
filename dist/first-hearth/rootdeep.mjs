import { defineTerrain, surfaceAt, patrolShadows } from './terrain.mjs';

const floor = { id: 'rootdeep-floor', points: [[0,4860],[1920,4860]] };
const heights = [250,810,1370,1930,2490,3050,3610,4170];
const tiers = heights.map((y,index) => [{
  id: `rootdeep-level-${index+1}`,
  // One solid landing spans the mine so a normal fall always stops at the next level.
  points: [[0,y],[650,y-10],[1280,y+10],[1920,y]]
}]);
const surfaces = tiers.map(tier => tier[0]);
// Side galleries are real one-way platforms so the ore branches are playable, not painted scenery.
const galleries = [
  { id:'iron-west-gallery', points:[[190,2398],[250,2378],[520,2378],[585,2396]] },
  { id:'iron-east-gallery', points:[[1190,2355],[1260,2338],[1515,2338],[1575,2360]] },
  { id:'flooded-walkway', points:[[520,2974],[600,2954],[1245,2954],[1320,2977]] },
  { id:'root-ledge-west', points:[[175,3506],[255,3488],[535,3488],[600,3510]] },
  { id:'root-ledge-east', points:[[1220,3468],[1285,3448],[1550,3448],[1615,3472]] }
];
export const rootdeepTerrain = defineTerrain(1920, 4920, 165, [floor, ...surfaces, ...galleries]);

function spot(surface, id, x, label, radius = 72) {
  return { id, x, y: surfaceAt(surface, x), label, radius, ground: surface.id };
}

export const rootdeepLandmarks = [
  spot(tiers[0][0], 'rootdeep-return', 105, 'Return to Crownwood', 94),
  ...tiers.map((tier,index) => spot(tier[0], `rootdeep-ladder-${index+1}`, 1780,
    'Climb the root ladder · hold ↑ / ↓', 84)),
  spot(floor, 'rootdeep-ladder-bottom', 1780, 'Climb the root ladder · hold ↑ / ↓', 84),
  spot(tiers[1][0], 'rootdeep-lift-high', 310, 'Inspect the broken winch', 82),
  spot(tiers[3][0], 'rootdeep-house-lantern-door', 245, 'Enter the lantern keeper’s home', 72),
  spot(tiers[3][0], 'rootdeep-house-stone-door', 620, 'Enter the stonecarver’s home', 72),
  spot(tiers[3][0], 'rootdeep-house-common-door', 1200, 'Enter the common house', 72),
  spot(tiers[3][0], 'dorrin', 1540, 'Talk to Dorrin', 92),
  spot(tiers[7][0], 'rootdeep-lift-low', 1690, 'Inspect the old lift', 80),
  spot(tiers[7][0], 'deep-seal', 465, 'Examine the sealed door', 84),
  spot(floor, 'rootdeep-tunnel', 160, 'Inspect the collapsed tunnel', 95)
];

// These side-ledge lanterns are independent of the Common Keeper's settlement quest.
export const rootdeepBranchLanterns = [
  { ...spot(galleries[0], 'branch-lantern-iron', 530, 'Restore the iron gallery lantern', 78), journal: 'iron-branch', name: 'Iron Gallery' },
  { ...spot(galleries[4], 'branch-lantern-roots', 1260, 'Restore the shadow-root lantern', 78), journal: 'root-branch', name: 'Shadow Roots' }
];

// Glowcaps regrow after three nights; iron and rootglass veins still require a pickaxe.
export const glowcapNodes = [
  spot(tiers[2][0], 'glowcap-west', 220, 'Gather glowcaps', 58),
  spot(tiers[2][0], 'glowcap-middle', 730, 'Gather glowcaps', 58),
  spot(tiers[2][0], 'glowcap-east', 1450, 'Gather glowcaps', 58)
];

export const rootdeepOreNodes = [
  spot(galleries[0], 'root-iron-west', 390, 'Mine branching iron', 58),
  spot(galleries[1], 'root-iron-east', 1395, 'Mine branching iron', 58),
  spot(tiers[4][0], 'root-iron-gallery', 900, 'Mine iron ore', 62),
  spot(galleries[2], 'root-iron-flooded', 940, 'Mine flooded iron', 58),
  spot(galleries[3], 'root-iron-rootwest', 390, 'Mine root-bound iron', 58),
  spot(galleries[4], 'root-iron-rooteast', 1415, 'Mine root-bound iron', 58)
];

export const rootglassNodes = [
  spot(tiers[4][0], 'rootglass-upper', 1550, 'Mine rootglass', 64),
  spot(tiers[5][0], 'rootglass-water', 410, 'Mine rootglass', 64),
  spot(tiers[7][0], 'rootglass-deep', 260, 'Mine rootglass', 64)
];

export const rootdeepLights = [
  [120,211,115],[610,740,104],[1450,755,126],[220,1315,118],[1450,1875,148],
  [925,2435,110],[1540,2438,128],[480,2995,142],[930,3555,116],
  [1550,4115,132],[650,4700,185]
];

const names = [
  'Rootbound Threshold','Winding Galleries','Glowcap Hollows','Lanternstead',
  'Iron Choir','Flooded Reach','Shadow-Tangled Roots','The Deep Seal'
];

export function rootdeepLocation(player) {
  // The lower bedrock floor catches falls below the eighth landing; keep its label distinct.
  const bottomLanding = heights.at(-1);
  const bedrockFloor = floor.points[0][1];
  if (player.y > (bottomLanding + bedrockFloor) / 2) return 'Bedrock Floor';
  const level = Math.max(1, Math.min(8, Math.floor((player.y - 200) / 560) + 1));
  return names[level - 1];
}

const patrols = [
  { surface: tiers[1][0], left: 1270, right: 1740, offset: 1.2 },
  { surface: tiers[4][0], left: 90, right: 700, offset: 4.3 },
  { surface: tiers[6][0], left: 1230, right: 1800, offset: 2.7 }
];

export function rootdeepShadows(phase, nightIndex) {
  return patrolShadows(patrols, phase, nightIndex);
}

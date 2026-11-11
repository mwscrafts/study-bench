import { defineTerrain, surfaceAt, patrolShadows } from './terrain.mjs';

const floor = { id: 'rootdeep-floor', points: [[0,4860],[1920,4860]] };
const tiers = [
  [
    { id: 'rootdeep-level-1-west', points: [[0,250],[370,250],[820,264]] },
    { id: 'rootdeep-level-1-east', points: [[1080,264],[1500,250],[1920,250]] }
  ],
  [
    { id: 'rootdeep-level-2-west', points: [[0,810],[430,800],[850,800]] },
    { id: 'rootdeep-level-2-east', points: [[1080,812],[1530,800],[1920,806]] }
  ],
  [
    { id: 'rootdeep-level-3-west', points: [[0,1370],[520,1360],[850,1360]] },
    { id: 'rootdeep-level-3-east', points: [[1080,1372],[1500,1360],[1920,1360]] }
  ],
  [
    { id: 'rootdeep-level-4-west', points: [[0,1930],[440,1920],[850,1920]] },
    { id: 'rootdeep-level-4-east', points: [[1080,1930],[1500,1920],[1920,1926]] }
  ],
  [
    { id: 'rootdeep-level-5-west', points: [[0,2490],[430,2480],[850,2480]] },
    { id: 'rootdeep-level-5-east', points: [[1080,2490],[1510,2480],[1920,2484]] }
  ],
  [
    { id: 'rootdeep-level-6-west', points: [[0,3050],[520,3040],[850,3040]] },
    { id: 'rootdeep-level-6-east', points: [[1080,3050],[1510,3040],[1920,3040]] }
  ],
  [
    { id: 'rootdeep-level-7-west', points: [[0,3610],[430,3600],[850,3600]] },
    { id: 'rootdeep-level-7-east', points: [[1080,3610],[1510,3600],[1920,3606]] }
  ],
  [
    { id: 'rootdeep-level-8-west', points: [[0,4170],[500,4160],[850,4160]] },
    { id: 'rootdeep-level-8-east', points: [[1080,4170],[1500,4160],[1920,4160]] }
  ]
];
const surfaces = tiers.flat();
export const rootdeepTerrain = defineTerrain(1920, 4920, 165, [floor, ...surfaces]);

function spot(surface, id, x, label, radius = 72) {
  return { id, x, y: surfaceAt(surface, x), label, radius, ground: surface.id };
}

export const rootdeepLandmarks = [
  spot(tiers[0][0], 'rootdeep-return', 105, 'Return to Crownwood', 94),
  spot(tiers[3][1], 'dorrin', 1450, 'Talk to Dorrin', 96),
  spot(tiers[3][0], 'rootdeep-lift-high', 310, 'Inspect the old lift', 80),
  spot(tiers[7][1], 'rootdeep-lift-low', 1690, 'Inspect the old lift', 80),
  spot(tiers[7][0], 'deep-seal', 650, 'Examine the sealed door', 84)
];

export const rootglassNodes = [
  spot(tiers[4][1], 'rootglass-upper', 1550, 'Mine rootglass', 64),
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
  { surface: tiers[1][1], left: 1270, right: 1780, offset: 1.2 },
  { surface: tiers[4][0], left: 90, right: 700, offset: 4.3 },
  { surface: tiers[6][1], left: 1230, right: 1800, offset: 2.7 }
];

export function rootdeepShadows(phase, nightIndex) {
  return patrolShadows(patrols, phase, nightIndex);
}

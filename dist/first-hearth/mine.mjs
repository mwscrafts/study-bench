import { defineTerrain, surfaceAt, patrolShadows } from './terrain.mjs';

const floor = { id: 'mine-floor', points: [
  [0,405],[455,405],[550,426],[765,510],[940,554],[1090,556],[1240,600],
  [1415,631],[1670,637],[1835,615],[2050,615],[2550,615],[2660,635],
  [2810,681],[3035,726],[3155,743],[3460,743],[3680,774],[3975,774],
  [4150,748],[4800,748]
] };
const upperShelf = { id: 'ore-shelf', points: [[1130,479],[1240,466],[1455,474],[1590,497],[1750,530]] };
const beam = { id: 'switchback-beam', points: [[810,460],[995,450],[1160,478]] };
const rib = { id: 'deep-rib', points: [[3090,633],[3245,612],[3440,613],[3585,641]] };
export const mineTerrain = defineTerrain(4800, 930, 267, [floor, beam, upperShelf, rib]);

function at(surface, id, x, label, radius = 77) {
  return { id, x, y: surfaceAt(surface, x), label, radius };
}

export const hugh = at(floor, 'hugh', 2165, 'Talk to Hugh Mungus', 98);
export const netChest = at(floor, 'net-chest', 2360, 'Open Hugh Mungus’s chest', 70);
export const flint = at(floor, 'flint', 420, 'Pick up loose flint', 64);

export const mineLandmarks = [
  at(floor, 'mine-return', 167, 'Return to Alder Camp', 90),
  hugh,
  netChest,
  at(floor, 'mine-lift', 4510, 'Inspect the lift', 100)
];

export const oreNodes = [
  at(floor, 'iron-switchback', 1030, 'Mine iron ore', 64),
  at(upperShelf, 'iron-shelf', 1450, 'Mine upper-shelf iron', 64),
  at(rib, 'iron-rib', 3320, 'Mine iron in the rock rib', 64),
  at(floor, 'iron-deep', 3860, 'Mine deep-seam iron', 64)
];

export const mineLights = [
  [221,327,158], [622,383,138], [970,510,131], [1460,417,112], [1772,570,120],
  [2134,525,240], [2447,551,182], [2950,637,114], [3600,689,115], [4390,653,158]
];

const patrols = [
  { surface: floor, left: 480, right: 860, offset: 5.1 },
  { surface: floor, left: 2740, right: 3070, offset: .2 },
  { surface: rib, left: 3220, right: 3475, offset: 2.1 },
  { surface: floor, left: 3600, right: 4060, offset: 4.5 }
];

export function mineShadows(phase, nightIndex) {
  return patrolShadows(patrols, phase, nightIndex);
}

export function mineLocation(player) {
  if (player.x < 635) return 'Timber Shaft';
  if (player.ground === upperShelf.id) return 'Upper Ore Shelf';
  if (player.x < 1910) return 'Lantern Switchbacks';
  if (player.x < 2675) return 'Hugh Mungus’s Alcove';
  if (player.x < 4180) return 'Deep Seam';
  return 'Lift Base';
}

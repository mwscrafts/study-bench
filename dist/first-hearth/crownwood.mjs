import { defineTerrain, surfaceAt, patrolShadows } from './terrain.mjs';

const floor = { id: 'understory', points: [[0,678],[485,678],[730,712],[1130,754],[1470,784],[1830,806],[2590,817],[3010,796],[3460,765],[4080,768],[4570,812],[5760,825]] };
const bridge = { id: 'rope-bridge', points: [[1630,370],[1860,365],[2190,354],[2450,343],[2690,334],[2880,338],[3160,359],[3420,357],[3720,339],[4010,327],[4190,311]] };
const crystals = { id: 'crystal-shelf', points: [[2015,184],[2080,174],[2370,170],[2485,178]] };
// Keep the shelf above the understory's double-jump reach.
const mist = { id: 'mist-shelf', points: [[3090,534],[3235,522],[3410,502],[3585,502],[3870,510],[4050,532]] };
const three = { id: 'bough-three', points: [[1230,447],[1290,435],[1570,430],[1675,430]] };
const crown = { id: 'overlook', points: [[4770,152],[4835,145],[5200,145],[5480,169],[5760,166]] };
export const crownwoodTerrain = defineTerrain(5760, 935, 273, [
  floor,
  { id: 'bough-one', points: [[515,611],[580,599],[850,590],[940,590]] },
  { id: 'bough-two', points: [[906,531],[965,520],[1195,516],[1280,514]] },
  three, bridge, crystals, mist,
  { id: 'east-bough', points: [[4105,253],[4160,242],[4510,236]] },
  { id: 'east-rise', points: [[4470,207],[4540,197],[4840,189]] },
  crown
]);

function spot(surface, id, x, label, radius = 75) {
  return { id, x, y: surfaceAt(surface, x), label, radius };
}

export const crownwoodLandmarks = [
  spot(floor, 'camp-return', 180, 'Return to Alder Camp', 92),
  spot(floor, 'rootdeep-entrance', 5555, 'Enter Rootdeep Mine', 100),
  spot(bridge, 'barry', 1900, 'Talk to Barry', 94),
  { ...spot(bridge, 'mist-drop', 3380, 'Drop to the ledge below', 84), ground: bridge.id },
  { ...spot(mist, 'first-hearth', 3690, 'Enter behind the falls'), ground: mist.id },
  spot(crown, 'king-trail', 5530, 'Enter the King’s Grounds', 100)
];

export const crownwoodTimberTrees = [
  { ...spot(floor, 'crown-pine-west', 3180, 'Chop marked pine', 72), ground: floor.id },
  { ...spot(floor, 'crown-pine-east', 3940, 'Chop marked pine', 72), ground: floor.id },
  { ...spot(floor, 'crown-pine-ridge', 4380, 'Chop marked pine', 72), ground: floor.id }
];

export const crownwoodFlower = spot(three, 'crownwood', 1485, 'Pick Crownwood dusklily', 57);
export const crystalNodes = [
  spot(crystals, 'crystal-west', 2145, 'Gather violet crystal', 57),
  spot(crystals, 'crystal-east', 2395, 'Gather blue crystal', 57)
];

export function crownwoodLocation(player) {
  if (player.ground === mist.id) return 'Mist Shelf';
  if (player.ground === crystals.id) return 'Crystal Shelf';
  if (player.x < 505) return 'Root Landing';
  if (player.ground === floor.id) return 'Lower Root Trail';
  if (player.x < 1750) return 'Three Boughs';
  if (player.x < 2670) return 'High Branch';
  if (player.x < 4080) return 'Rope Bridge';
  return 'Crown Overlook';
}

const patrols = [
  { surface: floor, left: 420, right: 790, offset: 5.7 },
  { surface: three, left: 1295, right: 1420, offset: 0 },
  { surface: bridge, left: 2685, right: 3065, offset: 2.2 },
  { surface: bridge, left: 3650, right: 4010, offset: 4.5 },
  { surface: crown, left: 4910, right: 5240, offset: 1.3 }
];

export function crownwoodShadows(phase, nightIndex) {
  return patrolShadows(patrols, phase, nightIndex);
}

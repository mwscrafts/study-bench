import { defineTerrain, surfaceAt } from './terrain.mjs';

const floor = { id: 'hearth-floor', points: [
  [0,498],[430,498],[620,532],[840,590],[1100,645],[1290,656],[1700,656],
  [1900,631],[2070,577],[2200,547],[2340,506],[2520,478],[2880,478]
] };
const ledge = { id: 'hearth-stone-ledge', points: [[2085,520],[2215,481],[2350,455],[2490,456]] };
export const hearthTerrain = defineTerrain(2880, 900, 295, [floor, ledge]);

function at(id, x, label, radius = 88) {
  return { id, x, y: surfaceAt(floor,x), label, radius };
}

export const hearthLandmarks = [
  at('hearth-return', 175, 'Return through the waterfall'),
  at('ember-box', 1515, 'Inspect the ember box', 104),
  at('hearth-notch', 2705, 'Exit to Mist Shelf')
];

export const hearthNote = 'When the King falls, set the living ember beside his crown. Its light can free him from the shadow.';

export function hearthLocation(player) {
  if (player.x < 980) return 'Behind the Veil';
  if (player.x < 1960) return 'Ember Chamber';
  return 'Return Notch';
}

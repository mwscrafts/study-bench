import { defineTerrain, surfaceAt } from './terrain.mjs';

const floor = { id: 'hearth-floor', points: [
  [0,498],[200,520],[430,512],[620,550],[840,638],[1000,680],[1100,690],
  [1290,700],[1500,700],[1700,690],[1900,690],[2000,660],[2070,610],
  [2200,570],[2340,520],[2520,480],[2700,480],[2880,500]
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

export const hearthNote = 'When the King falls, a crown woven from three dusklilies can draw the shadows from his mind. Return to Lyss. She knows how to weave it.';

export function hearthLocation(player) {
  if (player.x < 980) return 'Behind the Veil';
  if (player.x < 1960) return 'Ember Chamber';
  return 'Return Notch';
}

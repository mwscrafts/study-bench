import { defineTerrain, surfaceAt, patrolShadows, clamp } from './terrain.mjs';

const sand = { id: 'shore-sand', points: [
  [0,435],[430,435],[625,495],[785,565],[940,621],[1130,650],[1460,660],[1700,630],
  [1910,623],[2640,623],[2810,606],[2980,558],[3180,528],[3520,536],[3840,539]
] };
const drift = { id: 'drift-ledge', points: [[925,601],[1030,585],[1255,582],[1460,594],[1650,610],[1760,624]] };
const lookout = { id: 'lookout-rock', points: [[3040,473],[3160,460],[3350,460],[3440,483]] };
export const beachTerrain = defineTerrain(3840, 890, 267, [sand, drift, lookout]);

function at(surface, id, x, label, radius = 74) {
  return { id, x, y: surfaceAt(surface, x), label, radius };
}
export const dock = at(sand,'dock',2265,'Fish at Lantern Dock',107);
export const beachLandmarks = [
  at(sand,'shore-return',165,'Return to Alder Camp',88),
  dock,
  at(lookout,'lodestone-shore',3260,'Inspect the old lodestone',70),
  at(sand,'tide-arch',3525,'Look out from Tide Arch',90)
];
export const beachFlower = at(drift,'beach',1420,'Pick Driftwood Cove dusklily',58);

export function beachLocation(player) {
  if (player.x < 870) return 'Salt Pines';
  if (player.x < 1800) return 'Driftwood Cove';
  if (player.x < 2720) return 'Lantern Dock';
  return 'Tide Arch';
}

const patrols = [
  { surface: sand, left: 560, right: 870, offset: .9 },
  { surface: sand, left: 1050, right: 1495, offset: 3.3 }
];
export const beachShadows = (phase, night) => patrolShadows(patrols, phase, night);

export function readFishing(save) {
  return {
    book: save?.book === true,
    tideglass: ['caught','spent'].includes(save?.tideglass) ? save.tideglass : 'seeking',
    misses: Number.isInteger(save?.misses) ? clamp(save.misses,0,3) : 0,
    fish: Number.isSafeInteger(save?.fish) ? Math.max(0,save.fish) : 0,
    driftwood: Number.isSafeInteger(save?.driftwood) ? Math.max(0,save.driftwood) : 0,
    godslayer: save?.godslayer === true
  };
}

export function castNet(state, roll = Math.random) {
  if (!state.book) {
    return { fishing: { ...state, book: true }, catchName: 'Soaked book', rare: false };
  }
  const fishing = { ...state };
  let catchName;
  if (state.tideglass === 'seeking' && (state.misses === 3 || roll() < .25)) {
    fishing.tideglass = 'caught';
    fishing.misses = 0;
    catchName = 'Tideglass gemstone';
  } else {
    if (state.tideglass === 'seeking') fishing.misses++;
    if (roll() < .55) {
      fishing.fish++;
      catchName = 'Fish';
    } else {
      fishing.driftwood++;
      catchName = 'Driftwood';
    }
  }
  const rare = !state.godslayer && roll() < .001;
  if (rare) fishing.godslayer = true;
  return { fishing, catchName, rare };
}

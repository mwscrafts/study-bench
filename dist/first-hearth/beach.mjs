import { defineTerrain, surfaceAt, patrolShadows, clamp } from './terrain.mjs';

export const MAX_FISHING_LEVEL = 10;
export const MAX_FISHING_XP = ((MAX_FISHING_LEVEL - 1) * (3 + 11)) / 2;
export const ROWBOAT_WOOD_COST = 8;
export const LODESTONE_SHORE_X = 3380;
export const ROWBOAT_X = 3725;

export function fishingProgress(xp = 0) {
  let remaining = clamp(Number.isSafeInteger(xp) ? xp : 0, 0, MAX_FISHING_XP);
  let level = 1;
  while (level < MAX_FISHING_LEVEL) {
    const required = level + 2;
    if (remaining < required) return { level, progress: remaining, required };
    remaining -= required;
    level++;
  }
  return { level, progress: 0, required: 0 };
}

export function fishingLevel(xp = 0) {
  return fishingProgress(xp).level;
}

const sand = { id: 'shore-sand', points: [
  [0,485],[430,525],[625,565],[785,625],[940,650],[1130,650],[1460,650],[1700,630],
  [1840,600],[1910,600],[2640,600],[2750,615],[2810,606],[2980,590],[3180,570],
  [3440,590],[3520,600],[3840,610]
] };
const drift = { id: 'drift-ledge', points: [[925,601],[1030,585],[1150,605],[1255,650],[1460,650],[1650,634],[1760,617]] };
const lookout = { id: 'lookout-rock', points: [[3040,489],[3160,489],[3350,499],[3440,514]] };
export const ROWBOAT_Y = surfaceAt(sand, ROWBOAT_X);
export const beachTerrain = defineTerrain(3840, 890, 267, [sand, drift, lookout]);

function at(surface, id, x, label, radius = 74) {
  return { id, x, y: surfaceAt(surface, x), label, radius };
}
export const dock = at(sand,'dock',2265,'Fish at Lantern Dock',107);
export const beachLandmarks = [
  at(sand,'shore-return',165,'Return to Alder Camp',88),
  dock,
  at(lookout,'lodestone-shore',LODESTONE_SHORE_X,'Inspect the old lodestone',70),
  at(sand,'tide-arch',3525,'Look out from Tide Arch',90),
  at(sand,'rowboat',ROWBOAT_X,'Rowboat',100)
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

export function readFishing(save, legacyCasts = 0) {
  return {
    book: save?.book === true,
    tideglass: ['caught','spent'].includes(save?.tideglass) ? save.tideglass : 'seeking',
    misses: Number.isInteger(save?.misses) ? clamp(save.misses,0,3) : 0,
    fish: Number.isSafeInteger(save?.fish) ? Math.max(0,save.fish) : 0,
    driftwood: Number.isSafeInteger(save?.driftwood) ? Math.max(0,save.driftwood) : 0,
    xp: Number.isSafeInteger(save?.xp) ? clamp(save.xp,0,MAX_FISHING_XP)
      : clamp(Number.isSafeInteger(legacyCasts) ? legacyCasts : 0,0,MAX_FISHING_XP),
    rowboat: save?.rowboat === true,
    godslayer: save?.godslayer === true
  };
}

export function castNet(state, roll = Math.random, offshore = false) {
  if (!state.book) {
    return { fishing: { ...state, book: true, xp: Math.min(MAX_FISHING_XP,(state.xp ?? 0)+1) }, catchName: 'Soaked book', rare: false };
  }
  const fishing = { ...state };
  fishing.xp = Math.min(MAX_FISHING_XP,(state.xp ?? 0)+1);
  let catchName;
  if (state.tideglass === 'seeking' && (state.misses === 3 || roll() < .25)) {
    fishing.tideglass = 'caught';
    fishing.misses = 0;
    catchName = 'Tideglass gemstone';
  } else {
    if (state.tideglass === 'seeking') fishing.misses++;
    if (offshore && roll() < .65) {
      fishing.fish += 2;
      catchName = 'A deepwater shoal · 2 fish';
    } else if (roll() < .55) {
      fishing.fish++;
      catchName = offshore ? 'Deepwater fish' : 'Fish';
    } else {
      fishing.driftwood++;
      catchName = 'Driftwood';
    }
  }
  const rare = !state.godslayer && roll() < .001;
  if (rare) fishing.godslayer = true;
  return { fishing, catchName, rare };
}

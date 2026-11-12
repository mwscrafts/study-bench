import { defineTerrain } from './terrain.mjs?v=17';
import { buildRootdeepHomeArt } from './rootdeep-home-art.mjs?v=1';

// The three settlement homes are separate public regions: players in different rooms
// should not see one another through the public presence system.
const floor = { id: 'rootdeep-home-floor', points: [[0,650],[1200,650]] };
export const rootdeepHomeTerrain = defineTerrain(1200, 760, 230, [floor]);

const homes = [
  {
    id: 'rootdeep-home-lantern',
    title: ['Lantern Keeper’s', 'Home'],
    intro: 'A warm room filled with amber light and jars of dried Glowcap.',
    location: 'Lantern Keeper’s Home',
    style: 'lantern',
    resident: { id: 'rootdeep-lanternkeeper', x: 780, y: 650 },
    exit: { id: 'rootdeep-home-lantern-exit', x: 96, label: 'Return to Lanternstead', radius: 82 },
    returnX: 245
  },
  {
    id: 'rootdeep-home-stone',
    title: ['Stonecarver’s', 'Home'],
    intro: 'Careful carvings, old maps, and a shelf of mine records.',
    location: 'Stonecarver’s Home',
    style: 'stone',
    resident: { id: 'rootdeep-stonecarver', x: 850, y: 650 },
    exit: { id: 'rootdeep-home-stone-exit', x: 96, label: 'Return to Lanternstead', radius: 82 },
    returnX: 620
  },
  {
    id: 'rootdeep-home-common',
    title: ['Rootdeep', 'Common House'],
    intro: 'A shared table, a low fire, and room for anyone who needs a rest.',
    location: 'Rootdeep Common House',
    style: 'common',
    resident: { id: 'rootdeep-commonkeeper', x: 760, y: 650 },
    exit: { id: 'rootdeep-home-common-exit', x: 96, label: 'Return to Lanternstead', radius: 82 },
    returnX: 1200
  }
];

export const rootdeepHouseRegions = Object.fromEntries(homes.map(home => [home.id, {
  title: home.title,
  intro: home.intro,
  terrain: rootdeepHomeTerrain,
  landmarks: [
    { ...home.exit, y: 650, ground: floor.id },
    { ...home.resident, y: 650, label: 'Talk to the resident', radius: 86, ground: floor.id }
  ],
  flowers: [],
  buildArt: () => buildRootdeepHomeArt(home.style),
  location: () => home.location
}]));

// Every exit returns to the same landing and to the house's own doorstep.
export const rootdeepHouseGates = Object.fromEntries(homes.map(home => [home.exit.id, {
  region: 'rootdeep',
  footing: { x: home.returnX, ground: 'rootdeep-level-4' }
}]));

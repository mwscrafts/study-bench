import { defineTerrain } from './terrain.mjs?v=17';

export const ROWBOAT_CENTER_X = 960;
export const ROWBOAT_BASELINE_Y = 674;
export const ROWBOAT_DECK_Y = 558;
export const ROWBOAT_FISH_X = 735;
export const ROWBOAT_CHAIR_X = 1035;
export const ROWBOAT_RETURN_X = 1275;
export const ROWBOAT_DECK_MIN_X = 720;
export const ROWBOAT_DECK_MAX_X = 1200;

const deck = { id: 'rowboat-deck', points: [[620,ROWBOAT_DECK_Y],[1350,ROWBOAT_DECK_Y]] };
export const rowboatTerrain = defineTerrain(1920, 920, ROWBOAT_FISH_X, [deck]);
export const rowboatLandmarks = [
  { id:'rowboat-fish', x:ROWBOAT_FISH_X, y:ROWBOAT_DECK_Y, label:'Fish from the boat', radius:104 },
  { id:'rowboat-chair', x:ROWBOAT_CHAIR_X, y:ROWBOAT_DECK_Y, label:'Sit back and relax', radius:92 },
  { id:'rowboat-return', x:ROWBOAT_RETURN_X, y:ROWBOAT_DECK_Y, label:'Return to Tide Arch', radius:84 }
];
export function rowboatLocation() { return 'Open Sea'; }

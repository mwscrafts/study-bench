import { defineTerrain, surfaceAt } from './terrain.mjs?v=17';

const villageFloor = { id: 'village-road', points: [[0,635],[450,635],[900,620],[1500,620],[2100,635],[2760,635],[3170,630],[3600,630]] };
const houseFloor = { id: 'house-floor', points: [[0,650],[1360,650]] };
export const villageTerrain = defineTerrain(3600, 900, 170, [villageFloor]);
export const houseTerrain = defineTerrain(1360, 900, 140, [houseFloor]);
const spot = (surface, id, x, label) => ({ id, x, y: surfaceAt(surface,x), radius: 100, label });
export const villageLandmarks = [
  spot(villageFloor,'village-return',115,'Return to King’s Grounds'),
  spot(villageFloor,'restored-king',1300,'Talk to the King'),
  spot(villageFloor,'celebration-house',2020,'Enter the celebration house'),
  spot(villageFloor,'village-beyond',2655,'Follow the path beyond the village'),
  spot(villageFloor,'village-home-site',3170,'Inspect your village plot'),
  spot(villageFloor,'village-home-door',3220,'Enter your village home')
];
export const houseLandmarks = [
  spot(houseFloor,'house-return',95,'Step outside'),
  spot(houseFloor,'home-welcome',715,'Talk to the neighbors')
];
export const villageLocation = player => player.x < 900 ? 'Lantern Lane' : player.x < 1800 ? 'Village Square' : player.x < 2460 ? 'Homecoming House' : player.x < 2900 ? 'Old East Path' : 'Your Village Plot';
export const houseLocation = () => 'Homecoming';

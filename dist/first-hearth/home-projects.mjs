import { defineTerrain, surfaceAt } from './terrain.mjs?v=17';
import { crownwoodTerrain } from './crownwood.mjs?v=13';

const villageHomeFloor = { id: 'village-home-floor', points: [[0,650],[1440,650]] };
const lyssCabinFloor = { id: 'lyss-cabin-floor', points: [[0,650],[1080,650]] };
export const villageHomeTerrain = defineTerrain(1440,900,180,[villageHomeFloor]);
export const lyssCabinTerrain = defineTerrain(1080,900,150,[lyssCabinFloor]);
const barryHouseFloor = { id: 'barry-house-floor', points: [[0,650],[1360,650]] };
export const barryHouseTerrain = defineTerrain(1360,900,165,[barryHouseFloor]);
const spot = (surface,id,x,label,radius=90) => ({ id,x,y:surfaceAt(surface,x),label,radius,ground:surface.id });
export const villageHomeLandmarks = [
  spot(villageHomeFloor,'village-home-exit',100,'Step out to Lantern Village'),
  spot(villageHomeFloor,'village-home-decor',730,'Decorate your home',100)
];
export const lyssCabinLandmarks = [
  spot(lyssCabinFloor,'lyss-cabin-exit',100,'Return to Alder Camp'),
  spot(lyssCabinFloor,'lyss-cabin-decor',590,'Help furnish Lyss’s cabin',100)
];
const bridge=crownwoodTerrain.byId.get('rope-bridge');
export const barryHouseLandmarks = [
  { id:'barry-home-site',x:2100,y:surfaceAt(bridge,2100),label:'Help Barry build a home',radius:90,ground:bridge.id },
  { id:'barry-home-door',x:2300,y:surfaceAt(bridge,2300),label:'Enter Barry’s home',radius:86,ground:bridge.id },
  { id:'barry-home-exit',x:100,y:surfaceAt(barryHouseFloor,100),label:'Return to Crownwood',radius:90,ground:barryHouseFloor.id }
];
export const VILLAGE_HOME_WOOD_COST=8;
export const VILLAGE_HOME_IRON_COST=4;
export const LYSS_CABIN_WOOD_COST=6;
export const LYSS_CABIN_IRON_COST=2;
export const BARRY_HOME_WOOD_COST=10;
export const BARRY_HOME_IRON_COST=4;

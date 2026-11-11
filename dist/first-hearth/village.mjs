import { defineTerrain, surfaceAt } from './terrain.mjs';
import { poly, path, orb } from './camp-art.mjs';

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

function person(ctx,x,y,coat) {
  ctx.fillStyle = '#223d34';
  ctx.beginPath(); ctx.ellipse(x,y,19,4,0,0,Math.PI*2); ctx.fill();
  poly(ctx,[[x-18,y],[x-19,y-48],[x+18,y-48],[x+19,y]],coat);
  orb(ctx,x,y-66,13,'#d7ae8d');
  poly(ctx,[[x-14,y-74],[x-10,y-83],[x+8,y-83],[x+14,y-74]],'#533c32');
}

export function buildVillageArt() {
  const canvas = document.createElement('canvas');
  canvas.width = villageTerrain.width;
  canvas.height = villageTerrain.height;
  const ctx = canvas.getContext('2d');
  for (const [x,w,h,wall,roof] of [
    [380,255,250,'#a6a087','#644e48'],[1030,290,292,'#b7aa8b','#6a5148'],
    [1680,260,245,'#afa88f','#665143'],[2200,430,334,'#c1aa84','#75544a']
  ]) {
    const ground = surfaceAt(villageFloor,x);
    poly(ctx,[[x-w/2,ground],[x-w/2,ground-h],[x+w/2,ground-h],[x+w/2,ground]],wall);
    poly(ctx,[[x-w/2-24,ground-h],[x,ground-h-118],[x+w/2+24,ground-h]],roof);
    ctx.fillStyle = '#efd492';
    ctx.fillRect(x-w/3,ground-h+68,38,44);
    ctx.fillRect(x+w/3-38,ground-h+68,38,44);
    ctx.fillStyle = '#473b35';
    ctx.fillRect(x+15,ground-89,55,89);
  }
  poly(ctx,[...villageFloor.points,[3600,900],[0,900]],'#65745c');
  path(ctx,villageFloor.points,'#b9b18b',6);
  // The far-right path hints at a wider world; the gate has no destination yet.
  poly(ctx,[[2450,633],[2550,613],[2760,617],[2760,671],[2538,661]],'#82785e');
  path(ctx,[[2480,631],[2580,625],[2760,632]],'#c0a97a',20);
  path(ctx,[[2490,638],[2600,633],[2760,638]],'#a48e68',3);
  poly(ctx,[[2579,637],[2583,481],[2605,454],[2633,447],[2661,454],[2684,481],[2688,637]],'#665345');
  poly(ctx,[[2600,637],[2603,487],[2620,466],[2633,462],[2648,466],[2665,487],[2667,637]],'#33443d');
  path(ctx,[[2582,500],[2605,470],[2633,459],[2660,470],[2680,500]],'#b69b6c',8);
  path(ctx,[[2596,520],[2671,520]],'#987c59',6);
  for(const x of [2592,2675]) {
    path(ctx,[[x,625],[x,507]],'#806448',7);
    path(ctx,[[x-10,510],[x+10,510]],'#c1a574',5);
  }
  // Distant hills beyond the open frame make it read as an onward route, not a closed door.
  poly(ctx,[[2604,545],[2626,522],[2643,540],[2662,514],[2680,547]],'#74846a');
  poly(ctx,[[2618,552],[2640,530],[2660,553],[2674,535],[2681,562]],'#506e5d');
  // The east path reaches a clear plot beyond the old arch.
  poly(ctx,[[2760,630],[2920,619],[3240,625],[3600,632],[3600,676],[3230,660],[2900,656]],'#8f886a');
  path(ctx,[[2760,635],[2950,634],[3200,641],[3600,645]],'#c2aa7c',12);
  for(const x of [2835,2960,3430,3550]){
    path(ctx,[[x,633],[x,548]],'#776347',7);
    poly(ctx,[[x-42,557],[x,459],[x+43,557]],'#5f7864');
    poly(ctx,[[x-30,526],[x,467],[x+29,526]],'#7f9880');
  }
  for (const [x,color] of [[580,'#5f6654'],[760,'#926b61'],[1330,'#776793'],[1530,'#5c7765'],[1850,'#a47c5e'],[2480,'#566d81'],[2890,'#8b7362']]) {
    person(ctx,x,surfaceAt(villageFloor,x),color);
  }
  return canvas;
}

export function buildHouseArt() {
  const canvas = document.createElement('canvas');
  canvas.width = houseTerrain.width;
  canvas.height = houseTerrain.height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#786249'; ctx.fillRect(0,100,1360,550);
  ctx.fillStyle = '#98765a'; ctx.fillRect(0,225,1360,210);
  ctx.fillStyle = '#b9956c'; ctx.fillRect(0,435,1360,215);
  for (const x of [250,680,1110]) {
    ctx.fillStyle = '#493c35'; ctx.fillRect(x-68,212,136,155);
    ctx.fillStyle = '#ddbd83'; ctx.fillRect(x-55,225,110,127);
    ctx.fillStyle = '#544633'; ctx.fillRect(x-4,225,8,127);
  }
  poly(ctx,[...houseFloor.points,[1360,900],[0,900]],'#6d593f');
  path(ctx,houseFloor.points,'#b99867',6);
  for (const [x,color] of [[345,'#876b66'],[515,'#6a7866'],[710,'#687697'],[890,'#b38a62'],[1080,'#817098']]) {
    person(ctx,x,650,color);
  }
  return canvas;
}

export function paintRestoredKing(ctx) {
  const x = 1300;
  const y = surfaceAt(villageFloor, x);
  person(ctx, x, y, '#486273');
  for (const [dx, color] of [[-10,'#f4bfca'],[0,'#e7d5a0'],[10,'#d1b5e3']]) {
    orb(ctx,x+dx,y-83,5,color);
  }
}

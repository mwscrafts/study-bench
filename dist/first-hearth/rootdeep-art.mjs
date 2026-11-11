import { random, poly, path, orb, stone } from './camp-art.mjs';
import { rootdeepTerrain, rootdeepLights } from './rootdeep.mjs?v=1';

const { width, height, floor, ledges } = rootdeepTerrain;

function rootLantern(ctx, x, y, scale = 1) {
  path(ctx,[[x-12*scale,y+19*scale],[x-12*scale,y-20*scale],[x,y-20*scale]],'#765c43',4*scale);
  poly(ctx,[[x-10*scale,y-18*scale],[x+9*scale,y-18*scale],[x+11*scale,y+3*scale],[x-10*scale,y+3*scale]],'#433a31');
  poly(ctx,[[x-6*scale,y-14*scale],[x+6*scale,y-14*scale],[x+7*scale,y],[x-6*scale,y]],'#ffd08a');
  orb(ctx,x,y-7*scale,19*scale,'#ffcb7038');
}

function ledgeFace(ctx, surface, index) {
  const top=surface.points;
  const bottom=top.map(([x,y],i)=>[x+(i===0?20:-10),y+36+(i%3)*9]).reverse();
  poly(ctx,[...top,...bottom],index%2?'#414a49':'#4c5149');
  poly(ctx,[top[0],top[1],bottom.at(-2),bottom.at(-1)],'#596052');
  path(ctx,top,'#99a080',4);
  path(ctx,[[top[0][0]+28,top[0][1]+13],[top.at(-1)[0]-35,top.at(-1)[1]+17]],'#6d725e',3);
  const rand=random(index*481+71);
  for(let i=0;i<5;i++){
    const x=90+rand()*1740, y=top[0][1]+15+rand()*24;
    stone(ctx,x,y,16+rand()*30,7+rand()*12, i%2?'#5e6454':'#66715f');
  }
}

function rootfall(ctx) {
  const x=960;
  poly(ctx,[[852,0],[1010,0],[970,190],[1045,310],[902,496],[935,700],[835,860],[965,1065],[850,1250],[1004,1460],[875,1640],[1000,1850],[865,2070],[974,2290],[852,2500],[1012,2700],[858,2920],[970,3120],[850,3350],[1022,3540],[862,3760],[980,3960],[848,4180],[1005,4410],[932,4860],[786,4860],[842,4480],[758,4260],[876,4070],[782,3860],[888,3640],[760,3430],[880,3220],[774,3000],[910,2780],[758,2590],[882,2380],[770,2180],[900,1960],[770,1740],[885,1550],[760,1340],[887,1140],[768,940],[895,750],[784,560],[896,375],[810,195]],'#26363a');
  path(ctx,[[895,0],[850,230],[923,390],[838,570],[915,760],[845,950],[918,1140],[844,1340],[930,1540],[843,1740],[930,1950],[850,2170],[928,2390],[846,2600],[934,2800],[852,3020],[932,3220],[842,3440],[938,3650],[842,3870],[925,4080],[840,4290],[930,4520],[890,4860]],'#697568',8);
  path(ctx,[[1010,70],[964,250],[1036,410],[945,590],[1020,770],[954,960],[1035,1140],[950,1330],[1030,1540],[944,1750],[1032,1950],[948,2180],[1034,2370],[946,2590],[1034,2800],[951,3020],[1037,3220],[948,3430],[1038,3650],[950,3850],[1031,4070],[951,4280],[1037,4500]],'#364648',5);
}

function settlement(ctx) {
  const y=1920;
  // Dorrin's stone-and-timber forge, built directly onto the fourth tier.
  poly(ctx,[[1240,y-8],[1265,y-137],[1340,y-178],[1535,y-178],[1610,y-131],[1635,y-8]],'#3c4846');
  poly(ctx,[[1280,y-7],[1301,y-128],[1360,y-160],[1517,y-160],[1578,y-124],[1600,y-7]],'#5e6756');
  poly(ctx,[[1335,y-111],[1380,y-164],[1495,y-164],[1545,y-112]],'#725a43');
  path(ctx,[[1328,y-111],[1380,y-170],[1495,y-170],[1552,y-111]],'#b59a6e',6);
  poly(ctx,[[1370,y-8],[1370,y-83],[1517,y-83],[1517,y-8]],'#292f30');
  poly(ctx,[[1383,y-15],[1383,y-72],[1503,y-72],[1503,y-15]],'#f1ad5c');
  path(ctx,[[1382,y-76],[1504,y-76]],'#c8955d',5);
  for(const x of [1278,1590]) {
    poly(ctx,[[x,y-8],[x,y-93],[x+20,y-115],[x+41,y-94],[x+41,y-8]],'#626c5a');
    path(ctx,[[x+8,y-44],[x+34,y-44]],'#9da184',3);
  }
  // A lift cage sits on the west edge of the settlement shelf.
  path(ctx,[[205,y-10],[205,y-164],[333,y-164],[333,y-10]],'#9b8060',8);
  path(ctx,[[221,y-10],[221,y-144],[316,y-144],[316,y-10]],'#5d5748',5);
  path(ctx,[[211,y-119],[327,y-119]],'#aa9167',5);
  path(ctx,[[226,y-12],[226,y-125]],'#aa9167',4);
  path(ctx,[[311,y-12],[311,y-125]],'#aa9167',4);
  poly(ctx,[[236,y-14],[302,y-14],[302,y-81],[236,y-81]],'#47483e');
  path(ctx,[[238,y-76],[301,y-76]],'#ab8a5d',4);
  rootLantern(ctx,370,y-12,.85);
}

export function buildRootdeepArt() {
  const canvas=document.createElement('canvas');
  const scale=0.5;
  canvas.width=Math.ceil(width*scale); canvas.height=Math.ceil(height*scale);
  const ctx=canvas.getContext('2d'); ctx.scale(scale,scale); ctx.lineJoin='round';
  const rand=random(672019);
  const background=ctx.createLinearGradient(0,0,0,height);
  background.addColorStop(0,'#192a30'); background.addColorStop(.52,'#293a3a'); background.addColorStop(1,'#172a30');
  ctx.fillStyle=background; ctx.fillRect(0,0,width,height);
  // Deep, overlapping stone faces keep the mine readable across its long vertical drop.
  for(let i=0;i<32;i++){
    const x=rand()*width, y=rand()*height, w=90+rand()*300, h=180+rand()*440;
    poly(ctx,[[x-w/2,y-h/2],[x-w*.24,y-h/2-35],[x+w*.46,y-h*.37],[x+w/2,y+h*.34],[x+w*.1,y+h/2],[x-w*.4,y+h*.31]],i%2?'#304342':'#354744');
    poly(ctx,[[x-w/2,y-h/2],[x-w*.24,y-h/2-35],[x-w*.05,y+h*.1],[x-w*.4,y+h*.31]],'#405249');
  }
  rootfall(ctx);
  // Bedrock and floor.
  const earth=ctx.createLinearGradient(0,4700,0,height);
  earth.addColorStop(0,'#596153'); earth.addColorStop(.45,'#394747'); earth.addColorStop(1,'#1b3037');
  poly(ctx,[...floor.points,[width,height],[0,height]],earth);
  path(ctx,floor.points,'#9aa07b',5);
  for(const surface of ledges) ledgeFace(ctx,surface,Number(surface.id.match(/level-(\d+)/)?.[1]||1));
  // Old support frames make the landings feel like a connected mine, not floating platforms.
  ledges.forEach((surface,index)=>{
    const [x,y]=surface.points[0], [right]=surface.points.at(-1);
    const mid=(x+right)/2;
    path(ctx,[[mid-86,y+25],[mid-86,y+120],[mid+86,y+120],[mid+86,y+25]],'#675745',10);
    path(ctx,[[mid-86,y+50],[mid+86,y+50]],'#9a7956',5);
    if(index%2===0) path(ctx,[[mid-76,y+118],[mid-18,y+53],[mid+4,y+53],[mid+74,y+118]],'#7d6549',5);
  });
  settlement(ctx);
  // Pools and ore-vein glints on the lowest two levels.
  poly(ctx,[[1430,3070],[1530,3046],[1770,3053],[1870,3078],[1840,3100],[1510,3096]],'#41676a');
  path(ctx,[[1475,3068],[1560,3059],[1640,3061]],'#a8d6c6',3);
  for(const [x,y] of [[1550,2470],[410,3032],[560,4150]]) {
    orb(ctx,x,y-18,43,'#8edacb25');
    poly(ctx,[[x-22,y],[x-19,y-23],[x-8,y-35],[x+2,y-12],[x+5,y]],'#498c89');
    poly(ctx,[[x+5,y],[x+8,y-38],[x+22,y-49],[x+30,y-25],[x+25,y]],'#74bcb0');
    path(ctx,[[x+8,y-37],[x+22,y-49],[x+22,y-8]],'#c2f2de',2);
  }
  // The bottom seal is old stonework with a quiet, warm rune.
  const y=4860;
  poly(ctx,[[170,y+90],[170,y-118],[250,y-190],[595,y-190],[674,y-118],[674,y+90]],'#3b4847');
  poly(ctx,[[207,y+80],[207,y-112],[276,y-160],[559,y-160],[637,y-112],[637,y+80]],'#202f34');
  path(ctx,[[231,y-133],[312,y-147],[531,y-147],[612,y-131]],'#82917b',5);
  poly(ctx,[[349,y-34],[421,y-107],[493,y-34],[493,y+26],[349,y+26]],'#31484a');
  path(ctx,[[369,y-22],[421,y-74],[473,y-22]],'#d09c61',4);
  return canvas;
}

export function paintRootdeepLights(ctx,camera,clock,night) {
  if(night>0){
    const veil=ctx.createLinearGradient(camera.x,camera.y,camera.x,camera.y+camera.height);
    veil.addColorStop(0,'rgba(10,17,31,'+(night*.24)+')');
    veil.addColorStop(1,'rgba(10,17,31,'+(night*.42)+')');
    ctx.fillStyle=veil; ctx.fillRect(camera.x,camera.y,camera.width,camera.height);
  }
  for(const [x,y,r] of rootdeepLights){
    const pulse=.8+.2*Math.sin(clock*1.8+x);
    const glow=ctx.createRadialGradient(x,y,2,x,y,r);
    glow.addColorStop(0,'rgba(255,196,115,'+(pulse*.19)+')');
    glow.addColorStop(1,'rgba(255,196,115,0)');
    orb(ctx,x,y,r,glow); rootLantern(ctx,x,y,0.92);
  }
}

export function paintRootglass(ctx,node,clock) {
  const {x,y}=node, pulse=.65+.35*Math.sin(clock*2.5+x);
  orb(ctx,x,y-22,39,'rgba(127,211,196,'+(pulse*.17)+')');
  poly(ctx,[[x-23,y],[x-17,y-34],[x-8,y-24],[x-3,y-51],[x+11,y-37],[x+19,y-45],[x+27,y-18],[x+22,y]],'#49918d');
  path(ctx,[[x-8,y-24],[x-3,y-51],[x+5,y-26]],'#c2f2df',3);
  if(pulse>.92) orb(ctx,x+22,y-53,3,'#dcfff0');
}

export function paintDorrin(ctx,x,y,clock) {
  ctx.save(); ctx.translate(x,y);
  // Stocky little digger with soot-brown curls, beard, lantern and a bright chain.
  poly(ctx,[[-34,-49],[-32,-78],[-21,-96],[20,-96],[34,-77],[35,-49]],'#bf8d68');
  poly(ctx,[[-35,-49],[-31,-79],[-19,-95],[18,-95],[30,-80],[34,-49]],'#d0a17b');
  poly(ctx,[[-34,-49],[-26,-65],[-18,-57],[-9,-66],[1,-57],[10,-66],[20,-57],[31,-67],[35,-49]],'#4a382e');
  poly(ctx,[[-27,-48],[-18,-54],[-10,-48],[-2,-58],[7,-47],[17,-54],[26,-48],[24,-30],[12,-21],[0,-18],[-14,-24],[-26,-33]],'#73523c');
  ctx.fillStyle='#302720'; ctx.fillRect(-17,-76,3.2,3); ctx.fillRect(12,-76,3.2,3);
  path(ctx,[[-19,-81],[-12,-79]],'#533a2d',3); path(ctx,[[9,-79],[17,-81]],'#533a2d',3);
  // Broad shoulders and work apron.
  poly(ctx,[[-45,-46],[-58,-30],[-53,-5],[-39,-1],[-34,-19],[34,-19],[40,-1],[55,-4],[58,-31],[43,-47],[26,-55],[-25,-55]],'#51645b');
  poly(ctx,[[-26,-43],[25,-43],[20,-6],[-20,-6]],'#80684d');
  path(ctx,[[-20,-37],[0,-28],[21,-37]],'#edc75e',4);
  orb(ctx,0,-35,4,'#ffe49a');
  poly(ctx,[[-26,-20],[-29,0],[-8,0],[-4,-20]],'#534538');
  poly(ctx,[[6,-20],[10,0],[31,0],[27,-20]],'#534538');
  path(ctx,[[-27,-1],[-5,-1]],'#343632',5); path(ctx,[[9,-1],[33,-1]],'#343632',5);
  orb(ctx,44,-39,10,'#f5b968'); path(ctx,[[44,-28],[44,-17]],'#b39362',3);
  const flicker=.6+.4*Math.sin(clock*6);
  orb(ctx,44,-39,19,'rgba(255,190,103,'+(flicker*.15)+')');
  ctx.restore();
}

export function paintRootdeepLift(ctx,x,y,open=false) {
  path(ctx,[[x-52,y],[x-52,y-112],[x+52,y-112],[x+52,y]],open?'#b49567':'#80684d',7);
  path(ctx,[[x-39,y],[x-39,y-88],[x+39,y-88],[x+39,y]],'#544c3d',5);
  path(ctx,[[x-45,y-65],[x+45,y-65]],'#a58960',4);
  poly(ctx,[[x-31,y-3],[x-31,y-51],[x+31,y-51],[x+31,y-3]],open?'#6b795f':'#3c4743');
  if(open) path(ctx,[[x-28,y-49],[x+28,y-49]],'#d5b270',4);
}

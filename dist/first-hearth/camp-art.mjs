import { CAMP_X, WORLD_WIDTH, WORLD_HEIGHT, groundAt, surfaces } from './terrain.mjs';
import { workbench, timberTrees } from "./crafting.mjs";

const palettes = {
  day: ['#719ca1','#b3c9b1','#f7deb0','#eee2ab'],
  dusk: ['#4c507c','#bc8394','#f7bf8d','#ffd5a1'],
  night: ['#111b37','#293959','#626385','#f1dbab'],
  dawn: ['#434d75','#a0889c','#eec69e','#ffe3ad']
};

export function random(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

export function poly(ctx, points, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(...points[0]);
  for (const point of points.slice(1)) ctx.lineTo(...point);
  ctx.closePath();
  ctx.fill();
}

export function path(ctx, points, color, width = 2) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(...points[0]);
  for (const point of points.slice(1)) ctx.lineTo(...point);
  ctx.stroke();
}

export function orb(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

export function pine(ctx, x, y, size, dark, light) {
  poly(ctx, [[x-5,y],[x-2,y-size*.83],[x+5,y-size*.8],[x+8,y]], dark);
  for (let i = 3; i >= 0; i--) {
    const top = y-size + i*size*.173;
    const span = size*(.107+i*.049);
    const base = top + size*.4;
    poly(ctx, [[x,top],[x+span,base],[x+span*.32,base-size*.032],[x,base+size*.011],[x-span,base]], dark);
    poly(ctx, [[x,top],[x+span*.15,base],[x-span,base]], light);
  }
}

export function stone(ctx, x, y, w, h, tone = '#466057') {
  poly(ctx, [[x-w*.5,y],[x-w*.42,y-h*.63],[x-w*.13,y-h],[x+w*.29,y-h*.8],[x+w*.5,y]], tone);
  poly(ctx, [[x-w*.42,y-h*.63],[x-w*.13,y-h],[x+w*.29,y-h*.8],[x+w*.08,y-h*.44]], '#8ea18b');
}

function lantern(ctx, x, y) {
  path(ctx, [[x,y],[x,y-86],[x+26,y-86]], '#493c31', 6);
  ctx.fillStyle = '#3d352b';
  ctx.fillRect(x+16,y-86,20,27);
  ctx.fillStyle = '#ffd28b';
  ctx.fillRect(x+20,y-81,12,17);
}

export function sign(ctx, x, y, text, side = 1) {
  path(ctx, [[x,y],[x,y-95]], '#554938', 8);
  const w = text.length * 8 + 20;
  poly(ctx, [[x-w/2,y-86],[x+w/2,y-86],[x+w/2+side*7,y-73],[x+w/2,y-61],[x-w/2,y-61]], '#3b5145');
  ctx.font = 'bold 14px Georgia, serif';
  ctx.fillStyle = '#f3dfb5';
  ctx.textAlign = 'center';
  ctx.fillText(text,x,y-68);
}

function bridge(ctx, surface) {
  const start = surface.points[0][0];
  const end = surface.points.at(-1)[0];
  for (let x = start+25; x < end; x += 72) {
    const y = groundAt(x);
    path(ctx, [[x-7,y+12],[x-7,608]], '#4f5141', 5);
  }
  const deck = surface.points;
  path(ctx,deck,'#544a38',12);
  path(ctx,deck,'#b2996b',5);
  path(ctx,deck.map(([x,y]) => [x,y-26]),'#6e674a',2);
  for (const [x,y] of deck) path(ctx,[[x,y],[x,y-29]],'#715d43',4);
}

function bark(ctx, surface, i) {
  const points = surface.points;
  const bottom = points.map(([x,y],j) => [x+(j === 0 ? 12 : -6), y+22+(j%2)*12]).reverse();
  poly(ctx,[...points,...bottom],i === 2 ? '#66513c' : '#5a4a3a');
  path(ctx,points,'#9c9e65',4);
  const [a,b] = points[0];
  const [c,d] = points.at(-1);
  path(ctx,[[a+22,b+10],[c-14,d+13]],'#8a6d4c',2);
}

function forge(ctx) {
  const x = 2180;
  const y = groundAt(x);
  poly(ctx,[[x-84,y],[x-82,y-82],[x+79,y-82],[x+81,y]],'#51493c');
  poly(ctx,[[x-117,y-74],[x-77,y-124],[x+59,y-127],[x+105,y-77]],'#354d42');
  path(ctx,[[x-117,y-74],[x-77,y-124],[x+59,y-127]],'#8a9e78',5);
  ctx.fillStyle = '#62584a';
  ctx.fillRect(x-39,y-155,31,95);
  ctx.fillStyle = '#2b3631';
  ctx.fillRect(x-58,y-70,105,69);
  ctx.fillStyle = '#9c603c';
  ctx.fillRect(x-38,y-40,61,33);
  path(ctx,[[x-29,y-15],[x+16,y-15]],'#f8b36d',7);
  path(ctx,[[x+52,y-61],[x+87,y-61],[x+84,y-4]],'#81765a',5);
  poly(ctx,[[x+74,y-17],[x+120,y-17],[x+129,y-26],[x+70,y-26]],'#313d38');
}

function tent(ctx, x, y) {
  poly(ctx,[[x-114,y],[x-10,y-143],[x+83,y-130],[x+142,y]],'#ae9366');
  poly(ctx,[[x-114,y],[x-10,y-143],[x+66,y]],'#cdb182');
  poly(ctx,[[x-44,y],[x-10,y-121],[x+38,y]],'#374d3e');
  path(ctx,[[x-155,y],[x-10,y-143],[x+172,y]],'#a99065',2);
  path(ctx,[[x+66,y],[x-10,y-143],[x+83,y-130]],'#e1c090',3);
}

function lyssLogCabin(ctx,x,y) {
  // Her former tent becomes a small, lived-in cabin beside the forge.
  poly(ctx,[[x-158,y],[x-158,y-152],[x+152,y-152],[x+152,y]],'#68543d');
  for(let row=0;row<7;row++){
    const yy=y-18-row*21;
    path(ctx,[[x-157,yy],[x+150,yy]],row%2?'#a98154':'#b18b5e',12);
    for(const xx of [x-143,x+133]) orb(ctx,xx,yy,5,'#d7b784');
  }
  poly(ctx,[[x-187,y-150],[x-30,y-253],[x+171,y-150]],'#514b43');
  poly(ctx,[[x-175,y-152],[x-28,y-241],[x+161,y-152]],'#78654b');
  path(ctx,[[x-175,y-151],[x-30,y-251],[x+171,y-151]],'#c39e67',10);
  for(let xx=x-128;xx<x+130;xx+=46) path(ctx,[[xx,y-183],[xx+84,y-183]],'#a6875e',4);
  poly(ctx,[[x+90,y-217],[x+91,y-277],[x+127,y-277],[x+128,y-193]],'#5b574b');
  path(ctx,[[x+86,y-279],[x+132,y-279]],'#ba9d73',6);
  poly(ctx,[[x-64,y],[x-64,y-99],[x-45,y-121],[x+20,y-121],[x+40,y-99],[x+40,y]],'#34443b');
  path(ctx,[[x-65,y-101],[x-44,y-126],[x+21,y-126],[x+43,y-100]],'#d4b681',6);
  orb(ctx,x+26,y-48,4,'#e8c688');
  poly(ctx,[[x+70,y-122],[x+126,y-122],[x+126,y-65],[x+70,y-65]],'#cfad74');
  poly(ctx,[[x+76,y-116],[x+120,y-116],[x+120,y-71],[x+76,y-71]],'#91b9a5');
  path(ctx,[[x+98,y-117],[x+98,y-69]],'#6f5b45',5);
  path(ctx,[[x+75,y-94],[x+121,y-94]],'#6f5b45',5);
  poly(ctx,[[x-145,y],[x-106,y-22],[x-59,y]],'#797862');
  path(ctx,[[x-90,y-18],[x-66,y-32]],'#657c5c',5);
}

function mine(ctx) {
  const x = 4060;
  const y = groundAt(x);
  poly(ctx,[[x-208,y],[x-173,y-82],[x-133,y-172],[x-57,y-220],[x+95,y-198],[x+162,y-101],[x+198,y]],'#4e655c');
  poly(ctx,[[x-208,y],[x-173,y-82],[x-119,y-153],[x-57,y-220],[x-94,y-112],[x-124,y]],'#75897a');
  poly(ctx,[[x+39,y-110],[x+95,y-198],[x+162,y-101],[x+198,y],[x+91,y]],'#3d534e');
  poly(ctx,[[x-57,y],[x-57,y-111],[x-40,y-131],[x+49,y-131],[x+66,y-109],[x+66,y]],'#242d2b');
  path(ctx,[[x-66,y],[x-66,y-116],[x-46,y-140],[x+54,y-140],[x+74,y-116],[x+74,y]],'#967454',12);
  path(ctx,[[x-54,y-108],[x+61,y-108]],'#b19060',5);
  lantern(ctx,x+82,y);
}

function roots(ctx) {
  poly(ctx,[[2780,622],[2890,546],[2960,421],[3005,207],[3035,124],[3097,111],[3090,272],[3118,439],[3166,632],[3050,642],[2979,551],[2862,630]],'#514b3a');
  poly(ctx,[[2916,595],[3001,450],[3042,218],[3075,146],[3068,322],[3080,458],[3134,633],[3077,637],[3000,538]],'#696248');
  for (const [x,y,w,h] of [[3050,176,180,64],[3155,128,172,67],[2923,134,125,53],[3130,209,184,49]]) {
    poly(ctx,[[x-w,y],[x-w*.7,y-h*.7],[x-w*.14,y-h],[x+w*.6,y-h*.66],[x+w,y-h*.16],[x+w*.61,y+h*.36],[x-w*.31,y+h*.22]],'#49654e');
    path(ctx,[[x-w*.7,y-h*.7],[x-w*.14,y-h],[x+w*.6,y-h*.66]],'#74916c',4);
  }
}

export function buildCampArt(lyssCabinBuilt=false) {
  const canvas = document.createElement('canvas');
  canvas.width = WORLD_WIDTH;
  canvas.height = WORLD_HEIGHT;
  const ctx = canvas.getContext('2d');
  const rand = random(89463);
  ctx.lineJoin = 'round';
  for (let x = 35; x < WORLD_WIDTH; x += 63 + rand()*55) {
    if (x > 1500 && x < 2550 || x > 3820 && x < 4310) continue;
    const height = 130 + rand()*310;
    const y = groundAt(x)+8;
    pine(ctx,x,y,height,'#344f47','#4a6955');
    if (rand() < .5) pine(ctx,x+25,y+3,height*.57,'#3e5b4e','#5f7c5d');
  }
  roots(ctx);
  forge(ctx);
  if(lyssCabinBuilt) lyssLogCabin(ctx,1960,groundAt(1960));
  else tent(ctx,1960,groundAt(1960));
  mine(ctx);
  const liftX = 2415;
  const liftY = groundAt(liftX);
  path(ctx,[[liftX-51,liftY],[liftX-51,liftY-123],[liftX+43,liftY-123],[liftX+43,liftY]],'#786348',12);
  path(ctx,[[liftX-51,liftY-122],[liftX+37,liftY-27]],'#8c7953',6);
  path(ctx,[[liftX-42,liftY-58],[liftX+34,liftY-58]],'#ab8661',8);
  lantern(ctx, 1772, groundAt(1772));
  lantern(ctx, 4504, groundAt(4504));
  sign(ctx, 400, groundAt(400), 'Reedbank Trail');
  sign(ctx, 1220, groundAt(1220), 'Pine Gate');
  sign(ctx, 1650, groundAt(1650), 'Alder Camp');
  sign(ctx, 3540, groundAt(3540), 'Crownwood ↗');
  sign(ctx, 4290, groundAt(4290), 'Shore Trail →');
  sign(ctx, 3775, 260, 'Crownwood →');
  path(ctx,[[1141,612],[1141,513],[1165,503]],'#6d6250',13);
  path(ctx,[[1390,608],[1390,515],[1378,502]],'#6d6250',13);
  path(ctx,[[1153,519],[1200,506],[1367,506],[1388,517]],'#74684f',11);

  const floor = surfaces[0].points;
  const earth = ctx.createLinearGradient(0,575,0,WORLD_HEIGHT);
  earth.addColorStop(0,'#8c8563');
  earth.addColorStop(.48,'#616a53');
  earth.addColorStop(1,'#263f39');
  poly(ctx,[...floor,[WORLD_WIDTH,WORLD_HEIGHT],[0,WORLD_HEIGHT]],earth);
  poly(ctx,[...floor.map(([x,y]) => [x,y+12]), ...floor.map(([x,y],i) => [x,y+46+(i%3)*8]).reverse()],'#666b50');
  poly(ctx,[...floor.map(([x,y]) => [x,y+47]), ...floor.map(([x,y],i) => [x,y+62+(i%4)*7]).reverse()],'#515f4c');
  path(ctx,floor,'#a5a776',6);
  for (let x = 16; x < WORLD_WIDTH; x += 14 + rand()*14) {
    const y = groundAt(x);
    const w = 9+rand()*15;
    poly(ctx,[[x,y-2],[x+5,y-6-rand()*7],[x+7,y-1],[x+w,y+1],[x+w*.73,y+6],[x,y+4]],'#818e63');
    if (rand() > .6) stone(ctx,x+rand()*11,y+15+rand()*74,8+rand()*30,3+rand()*9,'#5a6856');
  }
  for (let x = 60; x < WORLD_WIDTH; x += 48+rand()*96) {
    if (Math.abs(x-CAMP_X) < 240 || Math.abs(x-4060) < 120) continue;
    stone(ctx,x,groundAt(x),14+rand()*33,6+rand()*18);
  }
  const creek = [[686,667],[738,679],[800,684],[920,684],[982,674],[1032,656],[996,671],[927,695],[806,695],[742,685]];
  poly(ctx,creek,'#759d95');
  path(ctx,[[752,682],[805,689],[858,689],[889,686]],'#b1cec0',2);
  path(ctx,[[895,693],[940,688],[982,674]],'#4b7978',2);
  bridge(ctx,surfaces[1]);
  surfaces.slice(2).forEach((surface,i) => bark(ctx,surface,i));
  for (let i = 0; i < 6; i++) stone(ctx,2258+(i-3)*13,611,15,7,'#5b6858');
  path(ctx,[[2230,608],[2276,603]],'#754c34',7);
  path(ctx,[[2239,602],[2271,609]],'#82583d',6);
  return canvas;
}

export function paintHorizon(ctx, view, phase, weight, clock) {
  if (weight <= 0) return;
  const { x, y, width, height } = view;
  const [top,middle,bottom,sun] = palettes[phase];
  ctx.save();
  ctx.globalAlpha = weight;
  const sky = ctx.createLinearGradient(0,y,0,y+height*.8);
  sky.addColorStop(0,top);
  sky.addColorStop(.56,middle);
  sky.addColorStop(1,bottom);
  ctx.fillStyle = sky;
  ctx.fillRect(x,y,width,height);
  const rand = random(3769);
  const night = phase === 'night';
  const sunX = x*.91+width*.73;
  const sunY = y*.77+height*(phase === 'dusk' ? .36 : .21);
  const glow = ctx.createRadialGradient(sunX,sunY,19,sunX,sunY,115);
  glow.addColorStop(0,sun);
  glow.addColorStop(1,sun+'00');
  orb(ctx,sunX,sunY,115,glow);
  orb(ctx,sunX,sunY,night ? 22 : 32,sun);
  if (night) orb(ctx,sunX+9,sunY-8,20,top);
  for (let i=0; i<56; i++) {
    const offset = (rand()*1400-x*.085+1400)%1400;
    const high = rand() * height * .49;
    if (night) {
      orb(ctx,x+offset,y+high,.75+rand()*1.2,'#f9e8c6c0');
    } else if (i < 14) {
      const span = 40+rand()*170;
      path(ctx,[[x+offset,y+high],[x+offset+span*.49,y+high-4],[x+offset+span,y+high]],'#fff0ce50',2+rand()*4);
    }
  }
  const start = Math.floor(x/154)*154-240;
  const ridge = (lift,rate,offset,color) => {
    const points = [[x-2,y+height]];
    for(let i=start; i<x+width+330; i+=77) {
      points.push([i,y*.58+lift+Math.sin(i*rate-x*.00055+offset)*53+Math.sin(i*.008+offset)*27]);
    }
    points.push([x+width+10,y+height]);
    poly(ctx,points,color);
  };
  ridge(340,.0021,2,night?'#5c6681':'#9ba99a');
  ridge(418,.0018,3,night?'#465873':'#819984');
  for (let i = Math.floor(x/100)-2; i < (x+width)/100+3; i++) {
    const tx = i*100 + Math.sin(i*17)*32 + 64;
    pine(ctx,tx,y*.40+538+Math.sin(i)*22,97+Math.cos(i*4.3)*32,
      night?'#35475a':'#627d70',night?'#46586c':'#708c77');
  }
  if (!night) {
    const px = x+(clock*8+width*.27)%width;
    path(ctx,[[px,y+height*.31],[px+5,y+height*.30],[px+10,y+height*.31],[px+15,y+height*.30],[px+20,y+height*.31]],'#576d64',1.5);
  }
  ctx.restore();
}

export function paintCampTint(ctx, view, night) {
  if (night <= 0) return;
  const {x,y,width,height} = view;
  ctx.fillStyle = 'rgba(25,32,70,' + night*.45 + ')';
  ctx.fillRect(x,y,width,height);
}

export function paintFirelight(ctx, x, y, radius, strength) {
  const halo = ctx.createRadialGradient(x, y, 3, x, y, radius);
  halo.addColorStop(0, 'rgba(255,179,84,' + strength + ')');
  halo.addColorStop(1, 'rgba(255,179,84,0)');
  ctx.fillStyle = halo;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
}

export function paintFlame(ctx, x, y, clock) {
  const flicker = Math.sin(clock*14)*5 + Math.sin(clock*9)*3;
  poly(ctx,[[x-16,y],[x-13,y-21],[x-5,y-13],[x+2,y-35-flicker],[x+11,y-18],[x+14,y-26],[x+18,y]],'#e9904d');
  poly(ctx,[[x-8,y],[x-3,y-15],[x+3,y-22-flicker*.5],[x+9,y-7],[x+10,y]],'#ffdd8d');
}

export function paintFlower(ctx, flower, nearby, clock) {
  const { x, y } = flower;
  const tip = Math.sin(clock*2.7+x)*2.8;
  path(ctx,[[x,y],[x-3,y-9],[x+tip,y-22]],'#55733c',3);
  poly(ctx,[[x,y-7],[x-14,y-16],[x-10,y-6]],'#8ca253');
  poly(ctx,[[x,y-8],[x+10,y-13],[x+7,y-6]],'#adc36c');
  const glow = ctx.createRadialGradient(x,y-22,3,x,y-22,nearby ? 30 : 21);
  glow.addColorStop(0,'#ffcad69e');
  glow.addColorStop(1,'#ffcad600');
  orb(ctx,x,y-22,nearby ? 30 : 21,glow);
  for (let i=0;i<5;i++) {
    const angle = Math.PI*2*i/5;
    orb(ctx,x+tip+Math.cos(angle)*5,y-22+Math.sin(angle)*5,4.5,'#efb2c6');
  }
  orb(ctx,x+tip,y-22,3,'#ffe8a7');
}

export function paintCraftingProps(ctx, tools, treeStage = () => 'mature') {
  for (const tree of timberTrees) {
    const {x,y}=tree;
    if (tools.chopped.includes(tree.id)) {
      if (treeStage(tree.id) === 'sapling') {
        pine(ctx,x,y,58,'#324f41','#789264');
        ctx.fillStyle='#84694a'; ctx.fillRect(x-4,y-14,8,14);
      } else {
        poly(ctx,[[x-19,y],[x-13,y-17],[x+11,y-18],[x+20,y]],'#776044');
        path(ctx,[[x-13,y-17],[x+11,y-18]],'#c6a873',4);
      }
    } else {
      pine(ctx,x,y,167,'#324f41','#617a59');
      ctx.fillStyle='#84694a';
      ctx.fillRect(x-10,y-44,20,44);
      path(ctx,[[x-9,y-31],[x+9,y-31]],'#e5bb74',5);
    }
  }
  const {x,y}=workbench;
  path(ctx,[[x-37,y],[x-33,y-52],[x+37,y-52],[x+42,y]],'#72553d',9);
  path(ctx,[[x-49,y-54],[x+49,y-54]],'#c29b64',12);
  path(ctx,[[x-30,y-29],[x+36,y-29]],'#967453',5);
  path(ctx,[[x+4,y-62],[x+30,y-71]],'#80583f',5);
  path(ctx,[[x+22,y-74],[x+29,y-66]],'#9fa99c',6);
}

import { surfaceAt } from './terrain.mjs';
import { random, poly, path, orb, pine, stone, sign } from './camp-art.mjs';
import { crownwoodTerrain, crownwoodLandmarks, crownwoodTimberTrees, crystalNodes } from './crownwood.mjs?v=13';

const { width, height, surfaces, floor } = crownwoodTerrain;
const bridge = crownwoodTerrain.byId.get('rope-bridge');
const mist = crownwoodTerrain.byId.get('mist-shelf');
const landmark = id => crownwoodLandmarks.find(item => item.id === id);
const campGate = landmark('camp-return');
const drop = landmark('mist-drop');
const hearth = landmark('first-hearth');
const king = landmark('king-trail');
const rootdeep = landmark('rootdeep-entrance');

function canopy(ctx, x, y, size, tone, tip) {
  const edge = [[-.95,.34],[-1,-.1],[-.73,-.41],[-.43,-.46],[-.22,-.62],[.23,-.69],[.49,-.53],[.79,-.44],[1,-.08],[.82,.32],[.36,.34],[.17,.52],[-.3,.5]];
  poly(ctx, edge.map(([a,b]) => [x+a*size,y+b*size]), tone);
  poly(ctx, [[x-size*.86,y-size*.09],[x-size*.43,y-size*.46],[x+size*.23,y-size*.69],[x+size*.66,y-size*.45],[x+size*.27,y-size*.34],[x-size*.22,y-size*.2]],tip);
}

function giantTree(ctx, x, ground, spread, lean, ridge, tones) {
  const top = ridge - 160;
  const k = x+lean;
  const [dark, middle, light, leaves, leafTip] = tones;
  poly(ctx, [[x-spread*.66,ground],[x-spread*.19,ground-134],[x-spread*.17,ridge+123],[k-53,top],[k+38,top-22],[k+59,ridge+94],[x+spread*.20,ground-111],[x+spread*.59,ground]],dark);
  poly(ctx, [[x-spread*.66,ground],[x-spread*.19,ground-134],[x-spread*.17,ridge+123],[k-53,top],[k-17,top-17],[k+19,ridge+99],[x+4,ground-130],[x-spread*.32,ground]],middle);
  poly(ctx, [[k-32,ridge+95],[k-spread*.98,ridge-22],[k-spread*1.24,ridge-104],[k-spread*.92,ridge-81],[k+3,ridge+46]],middle);
  poly(ctx, [[k+1,ridge+125],[k+spread*.59,ridge+36],[k+spread*1.21,ridge-6],[k+spread*1.31,ridge-69],[k+spread*.56,ridge-11],[k+5,ridge+62]],dark);
  path(ctx,[[k-22,ridge-80],[k-2,ridge+96],[x-spread*.08,ground-118]],light,4);
  path(ctx,[[k+12,ridge+110],[k+spread*.61,ridge+27],[k+spread*.98,ridge+4]],light,3);
  canopy(ctx,k-spread*.97,ridge-96,spread*.73,leaves,leafTip);
  canopy(ctx,k+spread*.06,ridge-143,spread*.96,leaves,leafTip);
  canopy(ctx,k+spread*1.03,ridge-62,spread*.79,leaves,leafTip);
}

function ledge(ctx, surface, stoneLedge = false) {
  const top = surface.points;
  const bottom = top.map(([x,y],i) => [x + (i === 0 ? 22 : -8), y + 36+(i%3)*12]).reverse();
  poly(ctx,[...top,...bottom],stoneLedge?'#4c625e':'#594e43');
  const [x0,y0] = top[0];
  const [x1,y1] = top.at(-1);
  path(ctx,[[x0+38,y0+18],[x0+(x1-x0)*.47,(y0+y1)*.5+30],[x1-32,y1+23]],stoneLedge?'#758d7f':'#88765a',4);
  path(ctx,top,stoneLedge?'#97b6a4':'#a2b079',5);
  const rand = random(x0);
  for (let i = 1; i < top.length; i++) {
    const [a,b] = top[i-1];
    const [c,d] = top[i];
    for (let x = a+18; x < c-9; x += 13+rand()*24) {
      const y = b+(d-b)*(x-a)/(c-a);
      poly(ctx,[[x-5,y+3],[x-7,y-5],[x+1,y-1],[x+4,y-8-rand()*6],[x+7,y-2],[x+14,y-3],[x+8,y+3]],stoneLedge?'#7b9d89':'#879d69');
      if (rand()<.18) path(ctx,[[x,y+7],[x+2,y+34],[x-2,y+49]],'#5f7c59',2);
    }
  }
}

function woodBridge(ctx) {
  const points = bridge.points.filter(([x]) => x >= 2690 && x <= 3720);
  path(ctx,points.map(([x,y])=>[x,y+13]),'#4e4037',10);
  path(ctx,points,'#c6ac7b',8);
  for (let i=1;i<points.length;i++) {
    const [a,b]=points[i-1];
    const [c,d]=points[i];
    for(let x=a+9;x<c;x+=16) {
      const y=b+(d-b)*(x-a)/(c-a);
      path(ctx,[[x-6,y-1],[x-9,y+8]],'#817258',2);
    }
  }
  for (const [a,b] of [[2690,3100],[3100,3295],[3465,3720]]) {
    const pylons = [a,(a+b)/2,b];
    const yAt = x => surfaceAt(bridge,x);
    path(ctx,pylons.map((x,i)=>[x,yAt(x)-(i===1?29:43)]),'#d2bc96',3);
    for(const x of pylons) path(ctx,[[x,yAt(x)+7],[x,yAt(x)-46]],'#766346',5);
  }
}

function ravine(ctx) {
  poly(ctx,[[3420,423],[3480,373],[3590,378],[3665,421],[3730,529],[3830,566],[3930,566],[4050,625],[4060,769],[3395,764],[3360,602]],'#425c5c');
  poly(ctx,[[3512,412],[3568,398],[3630,431],[3663,520],[3610,622],[3481,636],[3500,534]],'#607e76');
  poly(ctx,[[3595,423],[3628,423],[3621,519],[3662,591],[3630,670],[3577,732],[3495,732],[3561,658],[3573,560]],'#97c9be83');
  poly(ctx,[[3615,425],[3628,425],[3618,530],[3641,593],[3605,677],[3560,721],[3529,716],[3573,664],[3602,593],[3589,526]],'#caf0db84');
  const opening = [[-69,2],[-58,-38],[-31,-67],[25,-72],[68,-44],[84,3]]
    .map(([x,y]) => [hearth.x+x,hearth.y+y]);
  poly(ctx,opening,'#233c42');
  path(ctx,opening,'#839e8a',5);
  poly(ctx,[[3621,430],[3652,439],[3659,521],[3690,571],[3682,633],[3653,692],[3627,683],[3652,612],[3640,561],[3626,520]],'#b8e9d98a');
  for(const [x,y,w,h] of [[3360,662,93,46],[3690,688,145,49],[3900,680,145,43],[3498,753,153,48]]) stone(ctx,x,y,w,h,'#59736a');
}

export function buildCrownwoodArt() {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.lineJoin = 'round';
  const rand = random(317911);
  for (let x=32;x<width;x+=94+rand()*105) {
    const y=736+rand()*94;
    pine(ctx,x,y,168+rand()*182,'#41685f','#52776b');
  }
  const bark = ['#514740','#6b5849','#89775a','#416756','#65816a'];
  const cool = ['#4c5047','#5e6854','#8a8c70','#4b705d','#729376'];
  [
    [350,700,180,-106,423,bark],[1000,765,216,-62,366,bark],[1590,790,220,79,273,bark],
    [2155,820,214,-65,287,cool],[2620,825,178,81,229,bark],
    [4095,816,248,98,288,bark],[4560,835,204,61,221,cool],[5240,840,282,-98,167,bark],[5740,825,210,-15,193,cool]
  ].forEach(args=>giantTree(ctx,...args));
  ravine(ctx);
  const dirt = ctx.createLinearGradient(0,670,0,height);
  dirt.addColorStop(0,'#64735a');
  dirt.addColorStop(.55,'#46594f');
  dirt.addColorStop(1,'#283e3b');
  poly(ctx,[...floor.points,[width,height],[0,height]],dirt);
  path(ctx,floor.points,'#829b74',5);
  for (let i=1;i<floor.points.length;i++) {
    const [a,b]=floor.points[i-1];
    const [c,d]=floor.points[i];
    for (let x=a+38;x<c;x+=30+rand()*45) {
      const y=b+(d-b)*(x-a)/(c-a);
      if(rand()<.5) stone(ctx,x,y,16+rand()*31,7+rand()*22,'#51665a');
      else path(ctx,[[x-12,y+5],[x-7,y-5],[x,y+2],[x+5,y-11],[x+9,y+1]],'#869d71',3);
    }
  }
  for (const surface of surfaces.slice(1)) {
    if (surface === bridge) {
      ledge(ctx,{ points: surface.points.slice(0,5) });
      ledge(ctx,{ points: surface.points.slice(8) });
      woodBridge(ctx);
    } else ledge(ctx,surface,surface === mist || surface.id === 'crystal-shelf');
  }
  sign(ctx,campGate.x,campGate.y,'← Alder Camp',-1);
  sign(ctx,452,678,'Three Boughs ↗');
  sign(ctx,king.x,king.y,'King’s Grounds →');
  sign(ctx,3265,surfaceAt(floor,3265),'← Lower Root Trail',-1);
  sign(ctx,4410,797,'← Lower Root Trail',-1);
  sign(ctx,1200,760,'← Root Landing',-1);
  const gateX=king.x+116;
  const gateY=king.y+1;
  path(ctx,[[gateX-33,gateY],[gateX-33,gateY-63],[gateX-17,gateY-85],[gateX+26,gateY-83],[gateX+41,gateY-59],[gateX+41,gateY]],'#53655b',14);
  path(ctx,[[gateX-41,gateY-54],[gateX-21,gateY-84],[gateX+27,gateY-85]],'#a6b39b',3);
  // A separate root-bound tunnel sits at understory height, far below the King’s path.
  const tx=rootdeep.x, ty=rootdeep.y;
  poly(ctx,[[tx-132,ty],[tx-118,ty-75],[tx-88,ty-135],[tx-42,ty-165],[tx+36,ty-160],[tx+92,ty-118],[tx+137,ty-43],[tx+150,ty]],'#36473f');
  poly(ctx,[[tx-91,ty],[tx-81,ty-61],[tx-49,ty-104],[tx-2,ty-122],[tx+49,ty-100],[tx+82,ty-53],[tx+92,ty]],'#172b31');
  path(ctx,[[tx-134,ty-2],[tx-119,ty-77],[tx-89,ty-136],[tx-42,ty-165],[tx+38,ty-160],[tx+93,ty-118],[tx+139,ty-44]],'#829879',7);
  path(ctx,[[tx-119,ty-40],[tx-86,ty-32],[tx-68,ty-6]],'#526f58',9);
  path(ctx,[[tx+118,ty-47],[tx+78,ty-35],[tx+62,ty-3]],'#526f58',9);
  for(const [lx,ly] of [[tx-104,ty-85],[tx+105,ty-79]]) {
    path(ctx,[[lx,ly+24],[lx,ly-14]],'#6d523e',4);
    poly(ctx,[[lx-8,ly-13],[lx+8,ly-13],[lx+9,ly+4],[lx-8,ly+4]],'#51443a');
    orb(ctx,lx,ly-4,18,'#f2bd6c39');
    poly(ctx,[[lx-4,ly-8],[lx+4,ly-8],[lx+4,ly+1],[lx-4,ly+1]],'#ffd18a');
  }
  return canvas;
}

export function paintCrownwoodPines(ctx, chopped = [], treeStage = () => 'mature') {
  for (const tree of crownwoodTimberTrees) {
    const { x, y, id } = tree;
    if (chopped.includes(id)) {
      if (treeStage(id) === 'sapling') {
        pine(ctx,x,y,58,'#324f41','#789264');
        ctx.fillStyle='#84694a'; ctx.fillRect(x-4,y-14,8,14);
      } else {
        poly(ctx, [[x-19,y],[x-14,y-16],[x+12,y-17],[x+20,y]], '#776044');
        path(ctx, [[x-14,y-16],[x+12,y-17]], '#c6a873', 4);
      }
      continue;
    }
    pine(ctx, x, y, 142, '#324f41', '#617a59');
    ctx.fillStyle = '#84694a';
    ctx.fillRect(x-9,y-39,18,39);
    path(ctx, [[x-8,y-27],[x+8,y-27]], '#e5bb74', 5);
  }
}

export function paintCrownwoodWater(ctx, clock) {
  for(let i=0;i<24;i++) {
    const fall = (clock*112+i*27)%300;
    const x = 3599 + Math.sin(i*16)*16 - Math.max(0,fall-172)*.23;
    ctx.fillStyle = i%4===0?'#def9e9a9':'#a5d9ce7b';
    ctx.fillRect(x,418+fall,1.6+(i%3),10+i%8);
  }
  for (let i=0;i<5;i++) {
    const x=3525+i*46+Math.sin(clock*.64+i)*25;
    const y=690+Math.sin(clock*.37+i*3)*23;
    const glow=ctx.createRadialGradient(x,y,1,x,y,88);
    glow.addColorStop(0,'#b1d8ce39');
    glow.addColorStop(1,'#b1d8ce00');
    orb(ctx,x,y,88,glow);
  }
  // A gap in the railing marks the drop. Light mist traces the opening below.
  path(ctx,[[drop.x-16,drop.y+18],[drop.x,drop.y+29],[drop.x+16,drop.y+18]],'#e6e7b6',3);
  orb(ctx,hearth.x+7,hearth.y-22,3+Math.sin(clock*3),'#f6c484');
}

export function paintCrystal(ctx, node, clock) {
  const {x,y}=node;
  const pale=node===crystalNodes[0]?'#e4cbf5':'#c2f1e6';
  const color=node===crystalNodes[0]?'#9b81c2':'#6ca9ae';
  const aura=ctx.createRadialGradient(x,y-22,3,x,y-22,38);
  aura.addColorStop(0,pale+'90');
  aura.addColorStop(1,pale+'00');
  orb(ctx,x,y-22,38,aura);
  poly(ctx,[[x-22,y],[x-26,y-21],[x-17,y-31],[x-10,y-18],[x-10,y]],color);
  poly(ctx,[[x-10,y],[x-7,y-37],[x+5,y-52],[x+13,y-35],[x+14,y]],color);
  poly(ctx,[[x+12,y],[x+15,y-19],[x+25,y-25],[x+29,y-16],[x+22,y]],color);
  path(ctx,[[x-7,y-37],[x+5,y-52],[x+4,y-9]],pale,2);
  const twinkle=Math.max(0,Math.sin(clock*2.4+x));
  if(twinkle>.55) orb(ctx,x+22,y-49,2*twinkle,pale);
}

export function paintCrownwoodShadow(ctx, creature, clock) {
  const {x,y,index}=creature;
  orb(ctx,x,y-20,30,'#b399e932');
  poly(ctx,[[x-28,y-2],[x-23,y-23],[x-15,y-36],[x-11,y-50],[x,y-38],[x+12,y-52],[x+17,y-38],[x+25,y-22],[x+29,y-2],[x+12,y-7],[x+1,y],[x-12,y-5]],'#221f3d');
  const glow = Math.sin(clock*4+index)>.7?'#f5d2ff':'#d6a9ed';
  orb(ctx,x-8,y-26,2.7,glow);
  orb(ctx,x+8,y-26,2.7,glow);
}

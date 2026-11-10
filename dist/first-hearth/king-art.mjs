import { poly, path, orb, random, stone } from './camp-art.mjs';
import { kingTerrain, kingLandmarks, ARENA, MAX_BOSS_HP } from './king.mjs';

const { width, height, floor, ledges } = kingTerrain;
const stoneLight = '#909587';

function pillar(ctx,x,y,h,w) {
  poly(ctx,[[x-w,y],[x-w+5,y-h+10],[x-10,y-h],[x+w-4,y-h+11],[x+w,y]],'#485f58');
  poly(ctx,[[x-w,y],[x-w+5,y-h+10],[x-10,y-h],[x-12,y]],'#697e70');
  path(ctx,[[x-w-8,y-19],[x+w+8,y-19]],'#778578',5);
  path(ctx,[[x-7,y-h+33],[x+10,y-h+51],[x+6,y-h+80]],'#364e49',3);
}

function arch(ctx,x,y,w,h,broken=false) {
  const ring=[[x-w,y],[x-w,y-h*.62],[x-w*.68,y-h*.88],[x-w*.22,y-h],[x+w*.24,y-h],[x+w*.71,y-h*.87],[x+w,y-h*.59],[x+w,y]];
  const left=broken?ring.slice(0,4):ring;
  path(ctx,left,'#4c645a',22);
  path(ctx,left.map(([a,b])=>[a-4,b-4]),'#7f8f7e',5);
  if(broken) path(ctx,ring.slice(5),'#4c645a',22);
}

export function buildKingArt() {
  const canvas=document.createElement('canvas');
  canvas.width=width;
  canvas.height=height;
  const ctx=canvas.getContext('2d');
  const rand=random(4531);
  ctx.lineJoin='round';
  for(const [x,y,w,h,broken] of [[290,634,127,251,true],[977,589,140,225,false],[2005,595,192,268,true],[2970,622,128,286,false],[3595,621,174,322,true]]) {
    arch(ctx,x,y,w,h,broken);
  }
  for(const [x,y,h,w] of [[522,631,111,36],[640,628,171,34],[1220,608,136,30],[1640,612,159,31],[1780,595,113,37],[2180,610,142,35],[2520,621,99,33],[3190,621,215,37],[3730,621,177,37]]) {
    pillar(ctx,x,y,h,w);
  }
  const earth=ctx.createLinearGradient(0,570,0,height);
  earth.addColorStop(0,'#647568');
  earth.addColorStop(.48,'#4e6155');
  earth.addColorStop(1,'#263f41');
  poly(ctx,[...floor.points,[width,height],[0,height]],earth);
  path(ctx,floor.points,'#a7a78b',4);
  path(ctx,floor.points.map(([x,y],i)=>[x,y+27+i%3*7]),'#53695c',8);
  for(let i=1;i<floor.points.length;i++) {
    const [a,b]=floor.points[i-1], [c,d]=floor.points[i];
    for(let x=a+20;x<c-9;x+=42+rand()*61) {
      const y=b+(d-b)*(x-a)/(c-a);
      if(rand()>.51) stone(ctx,x,y+rand()*26,14+rand()*29,6+rand()*16,'#68776c');
      else path(ctx,[[x-13,y+1],[x-5,y-6],[x+1,y-1],[x+9,y-10],[x+16,y+1]],'#9c9e78',2);
    }
  }
  for(const ledge of ledges) {
    poly(ctx,[...ledge.points,...ledge.points.map(([x,y])=>[x,y+21]).reverse()],'#566c60');
    path(ctx,ledge.points,stoneLight,4);
  }
  const altar=kingLandmarks[2];
  poly(ctx,[[altar.x-93,altar.y],[altar.x-73,altar.y-23],[altar.x+69,altar.y-23],[altar.x+94,altar.y]],'#596b61');
  poly(ctx,[[altar.x-57,altar.y-23],[altar.x-43,altar.y-63],[altar.x+40,altar.y-63],[altar.x+56,altar.y-23]],'#7d8875');
  path(ctx,[[altar.x-44,altar.y-63],[altar.x+41,altar.y-63]],'#b9b39a',5);
  path(ctx,[[altar.x-22,altar.y-34],[altar.x,altar.y-51],[altar.x+22,altar.y-34]],'#beb185',3);
  return canvas;
}

function glow(ctx,x,y,r,color) {
  const light=ctx.createRadialGradient(x,y,3,x,y,r);
  light.addColorStop(0,color);
  light.addColorStop(1,color.slice(0,7)+'00');
  orb(ctx,x,y,r,light);
}

export function paintKingGrounds(ctx, trial, victory, clock) {
  const rest=kingLandmarks[1];
  const altar=kingLandmarks[2];
  for(const [x,y] of [[rest.x-113,rest.y-44],[rest.x+113,rest.y-44]]) {
    glow(ctx,x,y,94,'#e6ae6554');
    poly(ctx,[[x-9,y+13],[x-10,y-12],[x+9,y-12],[x+10,y+13]],'#715941');
    orb(ctx,x,y,5,'#f7cb86');
  }
  glow(ctx,altar.x,altar.y-70,118,trial?'#a997f079':'#f7c67848');
  poly(ctx,[[altar.x,altar.y-90],[altar.x-12,altar.y-74],[altar.x,altar.y-67],[altar.x+12,altar.y-74]],trial?'#c2abe8':'#d8b780');
  if (!victory && (!trial || trial.stage === 'shadows')) {
    const x=ARENA.gate;
    const y=ARENA.ground;
    glow(ctx,x,y-72,143,'#af8ed853');
    for(let i=0;i<5;i++) path(ctx,[[x-28+i*14,y-137],[x-28+i*14,y]],'#b69bd488',4);
  }
  const ending = victory?.ending;
  if (ending) {
    const {x,y}=kingLandmarks[3];
    const spark=ending==='free'?'#e6c78b':'#bdb6db';
    path(ctx,[[x-32,y-3],[x-46,y-23],[x-16,y-15],[x,y-29],[x+19,y-16],[x+42,y-22],[x+30,y-3]],spark,4);
    if(ending==='free') glow(ctx,x,y-9,80,'#e8c87973');
  }
  if(!trial) return;
  for(const wave of trial.waves) {
    const x=wave.x;
    const y=ARENA.ground;
    poly(ctx,[[x-21,y],[x-10,y-15],[x,y-7],[x+13,y-31],[x+25,y]],'#c5aee7');
  }
  if(trial.boss) paintKing(ctx,trial.boss,clock);
}

// Adapts Emberwild's crowned silhouette and charge indicator to the new arena.
function paintKing(ctx,boss,clock) {
  const y=ARENA.ground;
  if(boss.hp<=0) {
    path(ctx,[[boss.x-44,y-5],[boss.x-27,y-17],[boss.x-12,y-8],[boss.x+11,y-18],[boss.x+30,y-6]],'#aa97bd',5);
    return;
  }
  const enraged=boss.hp<=MAX_BOSS_HP/2;
  const final=boss.hp===1;
  ctx.save();
  ctx.translate(boss.x,y-57+Math.sin(clock*5)*2);
  poly(ctx,[[-50,55],[-40,-30],[-18,-52],[17,-54],[40,-30],[52,55],[30,42],[11,57],[-12,44],[-29,55]],enraged?'#483957':'#303e48');
  poly(ctx,[[-33,-48],[-41,-78],[-15,-62],[0,-88],[14,-63],[38,-78],[32,-48]],final?'#e1a7bf':'#b4a0ca');
  poly(ctx,[[-25,-16],[-8,-21],[-11,-10]],'#ffe0b6');
  poly(ctx,[[25,-16],[8,-21],[11,-10]],'#ffe0b6');
  const pulse=Math.sin(clock*7)*3;
  poly(ctx,[[0,pulse],[-11,17],[0,32],[11,17]],enraged?'#e39cbd':'#bca5e5');
  path(ctx,[[-41,-10],[-63,24],[-49,39]],'#80718b',7);
  path(ctx,[[39,-10],[62,26],[51,41]],'#80718b',7);
  ctx.restore();
  if (boss.mode==='tell'||boss.mode==='final-tell') {
    const color=final?'#f6afbd':'#edc5a1';
    if(boss.attack==='wave'&&!final) {
      path(ctx,[[boss.x-180,y-8],[boss.x+180,y-8]],color,3);
    } else {
      const end=boss.x+boss.dashDir*(final?255:180);
      path(ctx,[[boss.x,y-5],[end,y-5]],color,4);
      path(ctx,[[end-boss.dashDir*19,y-18],[end,y-5],[end-boss.dashDir*19,y+8]],color,4);
    }
  }
}

export function paintFireworks(ctx,camera,elapsed) {
  if(elapsed<0||elapsed>8) return;
  const colors=['#f7ce7f','#c5e4c1','#d6b4f3','#edacb2','#a9d9ef'];
  for(let burst=0;burst<12;burst++) {
    const age=elapsed-burst*.47;
    if(age<0||age>1.5) continue;
    const x=camera.x+camera.width*(.14+(burst*37%73)/100);
    const y=camera.y+camera.height*(.16+(burst*13%28)/100);
    ctx.save();
    ctx.globalAlpha=1-age/1.5;
    for(let i=0;i<30;i++) {
      const angle=i/30*Math.PI*2;
      const distance=age*(35+(i*27%65));
      const dx=Math.cos(angle)*distance, dy=Math.sin(angle)*distance;
      path(ctx,[[x+dx*.84,y+dy*.84+age*age*13],[x+dx,y+dy+age*age*13]],colors[burst%colors.length],2.5);
    }
    ctx.restore();
  }
}

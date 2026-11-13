import { poly, path, orb, random, stone, paintFlame } from './camp-art.mjs';
import { hearthTerrain, hearthLandmarks } from './hearth.mjs';

const { width, height, floor, ledges } = hearthTerrain;
const [entry, box, exit] = hearthLandmarks;

function arch(ctx, x, y, light) {
  poly(ctx,[[x-72,y],[x-69,y-104],[x-40,y-150],[x+41,y-150],[x+72,y-103],[x+72,y]],'#3e5c58');
  poly(ctx,[[x-54,y],[x-52,y-97],[x-30,y-129],[x+32,y-129],[x+55,y-97],[x+55,y]],light);
  path(ctx,[[x-69,y-104],[x-40,y-150],[x+41,y-150],[x+72,y-103]],'#83a799',4);
}

function chamber(ctx) {
  poly(ctx,[[1015,643],[1050,443],[1153,346],[1323,291],[1637,294],[1806,358],[1905,477],[1887,633]],'#3c5651');
  poly(ctx,[[1130,645],[1132,465],[1210,380],[1335,346],[1610,349],[1722,394],[1790,489],[1781,648]],'#344a45');
  path(ctx,[[1132,465],[1210,380],[1335,346],[1610,349],[1722,394],[1790,489]],'#698071',5);
  for (const x of [1196,1745]) {
    poly(ctx,[[x-24,652],[x-22,465],[x-12,448],[x+14,448],[x+25,466],[x+26,652]],'#5c6a5a');
    path(ctx,[[x-16,465],[x-16,640]],'#7d8b6d',3);
    path(ctx,[[x-32,481],[x+34,481]],'#88906e',5);
  }
  const x = 1458;
  const y = 442;
  const crown = [[x-83,y],[x-105,y-53],[x-52,y-32],[x,y-85],[x+51,y-32],[x+104,y-53],[x+84,y],[x-83,y]];
  poly(ctx,crown,'#435b4e');
  path(ctx,crown,'#a5976d',5);
  path(ctx,[[x-74,y+11],[x+75,y+11]],'#8a8b69',4);
  poly(ctx,[[x,y-34],[x-14,y-16],[x,y-2],[x+14,y-16]],'#c6a571');
  for (let i=0; i<5; i++) {
    const dx=x-108+i*54;
    path(ctx,[[dx,y+31],[dx+8,y+22],[dx+16,y+31],[dx+8,y+40],[dx,y+31]],'#6b7964',2);
  }
  poly(ctx,[[x-142,656],[x-123,616],[x+107,616],[x+139,656]],'#5c6a5b');
  path(ctx,[[x-123,616],[x+107,616]],'#979071',4);
  poly(ctx,[[x-74,616],[x-55,589],[x+42,589],[x+64,616]],'#73765e');
  path(ctx,[[x-55,589],[x+42,589]],'#b09d72',4);
}

export function buildHearthArt() {
  const canvas=document.createElement('canvas');
  canvas.width=width;
  canvas.height=height;
  const ctx=canvas.getContext('2d');
  const rand=random(122801);
  ctx.lineJoin='round';
  const wall=ctx.createLinearGradient(0,0,0,height);
  wall.addColorStop(0,'#142c34');
  wall.addColorStop(.53,'#294744');
  wall.addColorStop(1,'#182f34');
  ctx.fillStyle=wall;
  ctx.fillRect(0,0,width,height);
  for(let x=-40;x<width;x+=114+rand()*138) {
    const top=230+rand()*195;
    const w=87+rand()*150;
    poly(ctx,[[x-w*.42,top],[x+w*.39,top-82],[x+w,top-5],[x+w*.65,top+282],[x-w*.26,top+221]],rand()<.45?'#2e4f4b':'#345852');
    path(ctx,[[x+w*.39,top-82],[x+w*.20,top+59],[x+w*.54,top+170]],'#4a695e',3);
  }
  const roof=[[0,206],[290,198],[540,223],[755,292],[980,278],[1220,248],[1560,223],[1840,290],[2100,279],[2390,228],[2660,193],[2880,209]];
  poly(ctx,[[0,0],[width,0],...roof.slice().reverse()],'#183336');
  path(ctx,roof,'#385954',5);
  for(const [x,y] of roof.slice(1,-1)) {
    const span=25+rand()*34;
    poly(ctx,[[x-span,y-3],[x+7,y+45+rand()*46],[x+span,y]],'#24453f');
  }
  arch(ctx,entry.x,entry.y,'#80a9a0');
  arch(ctx,exit.x,exit.y,'#648980');
  chamber(ctx);
  const rock=ctx.createLinearGradient(0,480,0,height);
  rock.addColorStop(0,'#53685b');
  rock.addColorStop(.62,'#384f46');
  rock.addColorStop(1,'#233e3d');
  poly(ctx,[...floor.points,[width,height],[0,height]],rock);
  path(ctx,floor.points,'#8a9d7d',5);
  path(ctx,floor.points.map(([x,y],i)=>[x,y+30+(i%3)*11]),'#40594f',8);
  for(let i=1;i<floor.points.length;i++) {
    const [a,b]=floor.points[i-1], [c,d]=floor.points[i];
    for(let x=a+27;x<c;x+=36+rand()*53) {
      if(x>1310 && x<1640) continue;
      const y=b+(d-b)*(x-a)/(c-a);
      stone(ctx,x,y+rand()*30,12+rand()*26,6+rand()*14,'#5e7565');
    }
  }
  for(const ledge of ledges) {
    poly(ctx,[...ledge.points,...ledge.points.map(([x,y])=>[x,y+19]).reverse()],'#52665b');
    path(ctx,ledge.points,'#8a9d82',4);
  }
  return canvas;
}

function glow(ctx,x,y,radius,color) {
  const gradient=ctx.createRadialGradient(x,y,2,x,y,radius);
  gradient.addColorStop(0,color);
  gradient.addColorStop(1,color.slice(0,7)+'00');
  orb(ctx,x,y,radius,gradient);
}

export function paintHearthDetails(ctx, clock, night, opened) {
  for(const gate of [entry, exit]) {
    glow(ctx,gate.x,gate.y-72,145,night>.45?'#a0d7ee53':'#a1e2d94a');
    for(let i=0;i<12;i++) {
      const x=gate.x-46+i*8;
      const y=gate.y-128+(clock*(64+i*3)+i*17)%124;
      ctx.fillStyle=i%3===0?'#cff0dd73':'#8dc9c050';
      ctx.fillRect(x,y,1+i%3,14+i%8);
    }
  }
  glow(ctx,1449,578,193,'#efb36b53');
  paintFlame(ctx,1449,588,clock);
  for(let i=0;i<9;i++) {
    const rise=(clock*20+i*13)%108;
    orb(ctx,1449+Math.sin(i+rise*.08)*12,580-rise,1+(1-rise/108)*2,'#ffc87aaa');
  }
  const {x,y}=box;
  poly(ctx,[[x-28,y],[x-28,y-31],[x+29,y-31],[x+29,y]],'#765b42');
  poly(ctx,[[x-28,y-30],[x-31,y-(opened?54:42)],[x+27,y-(opened?58:42)],[x+29,y-30]],opened?'#483e30':'#ac8558');
  path(ctx,[[x-16,y-29],[x-16,y],[x+17,y],[x+17,y-29]],'#9d8259',4);
  if(!opened) orb(ctx,x,y-23,4,'#f4d390');
}

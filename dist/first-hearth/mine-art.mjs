import { random, poly, path, orb, sign, stone } from './camp-art.mjs';
import { mineTerrain, mineLights, netChest, flint } from './mine.mjs?v=16';

const { width, height, floor, ledges } = mineTerrain;
const ceiling = [[0,212],[396,211],[640,233],[850,306],[1160,322],[1420,230],[1650,255],[1900,356],[2260,301],[2525,346],[2715,407],[2960,426],[3170,379],[3410,410],[3600,359],[3880,434],[4100,457],[4330,287],[4550,262],[4800,277]];

function lantern(ctx, x, y) {
  path(ctx,[[x-16,y+35],[x-16,y-12],[x,y-12]],'#795d48',5);
  poly(ctx,[[x-12,y-7],[x+10,y-7],[x+12,y+18],[x-13,y+18]],'#3a342c');
  poly(ctx,[[x-8,y-3],[x+6,y-3],[x+7,y+13],[x-7,y+13]],'#ffbd6e');
  path(ctx,[[x-11,y+16],[x+11,y+16]],'#ae8359',3);
}

function timber(ctx, x, y, span, rise) {
  path(ctx,[[x-span,y+9],[x-span,y-rise],[x+span,y-rise],[x+span,y+9]],'#554339',14);
  path(ctx,[[x-span-5,y-rise+3],[x+span+5,y-rise+3]],'#9a7957',5);
  path(ctx,[[x-span,y-rise+40],[x-span+36,y-rise+3]],'#8c6b50',5);
  path(ctx,[[x+span,y-rise+38],[x+span-36,y-rise+4]],'#8c6b50',5);
}

function rockLedge(ctx, surface) {
  const points = surface.points;
  const lower = points.map(([x,y],i) => [x+(i===0?15:-6),y+23+(i%3)*8]).reverse();
  poly(ctx,[...points,...lower],surface.id==='switchback-beam'?'#62503d':'#344c4d');
  path(ctx,points,surface.id==='switchback-beam'?'#b09668':'#7c9184',4);
  const [a,b]=points[0], [c,d]=points.at(-1);
  path(ctx,[[a+24,b+11],[a+(c-a)*.52,(b+d)*.5+21],[c-25,d+13]],'#59685d',3);
}

function workstation(ctx) {
  const y=615;
  poly(ctx,[[1980,y],[1984,471],[2020,429],[2260,417],[2440,460],[2465,y]],'#655348');
  poly(ctx,[[1992,y],[1993,475],[2033,445],[2260,432],[2424,477],[2447,y]],'#514c41');
  path(ctx,[[2001,524],[2436,524]],'#6e5f4b',3);
  path(ctx,[[2045,566],[2105,566],[2098,y],[2051,y]],'#8c7150',6);
  poly(ctx,[[2053,561],[2074,546],[2114,546],[2133,557],[2105,567],[2053,567]],'#313d3b');
  path(ctx,[[2269,500],[2373,500]],'#98764e',7);
  path(ctx,[[2275,489],[2275,476],[2288,476],[2288,489]],'#bea277',4);
  path(ctx,[[2312,497],[2312,480]],'#d0a26c',3);
  timber(ctx,2253,y,258,151);
}

function lift(ctx) {
  poly(ctx,[[4330,748],[4330,403],[4375,344],[4640,344],[4700,413],[4700,748]],'#1b2e33');
  timber(ctx,4510,748,114,266);
  path(ctx,[[4475,312],[4475,668],[4416,736]],'#9b835e',4);
  path(ctx,[[4545,304],[4545,668],[4607,736]],'#9b835e',4);
  orb(ctx,4475,311,15,'#596b63');
  orb(ctx,4545,306,15,'#596b63');
  path(ctx,[[4406,715],[4609,715],[4609,742],[4406,742],[4406,715]],'#a5875e',7);
  for(let x=4425;x<4610;x+=36) path(ctx,[[x,716],[x,741]],'#66533f',4);
  path(ctx,[[4550,463],[4539,480],[4545,501],[4537,516]],'#aa7e54',3);
  sign(ctx,4700,748,'Lift to Alder Camp',-1);
}

export function buildMineArt() {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const rand=random(498571);
  ctx.lineJoin='round';
  const back=ctx.createLinearGradient(0,180,0,800);
  back.addColorStop(0,'#1b2c35');
  back.addColorStop(.55,'#32474b');
  back.addColorStop(1,'#22383f');
  ctx.fillStyle=back;
  ctx.fillRect(0,0,width,height);
  for(let x=-75;x<width;x+=140+rand()*120) {
    const y=290+rand()*170;
    const depth=190+rand()*240;
    const span=70+rand()*154;
    poly(ctx,[[x-span*.4,y],[x+span*.36,y-44],[x+span,y+51],[x+span*.86,y+depth],[x+span*.16,y+depth+38],[x-span*.31,y+depth-44]],rand()<.55?'#3a5051':'#2a4147');
    poly(ctx,[[x-span*.4,y],[x+span*.36,y-44],[x+span*.25,y+66],[x+span*.03,y+depth-23],[x-span*.31,y+depth-44]],'#3e5554');
    path(ctx,[[x+span*.1,y+50],[x+span*.43,y+120],[x+span*.34,y+205]],'#59716a',2);
  }
  poly(ctx,[[0,0],[width,0],...ceiling.slice().reverse()],'#172830');
  path(ctx,ceiling,'#3b5152',6);
  for(let i=1;i<ceiling.length;i++){
    const [a,b]=ceiling[i-1], [c,d]=ceiling[i];
    for(let x=a+36;x<c-7;x+=46+rand()*62) {
      const y=b+(d-b)*(x-a)/(c-a);
      const w=14+rand()*33;
      poly(ctx,[[x-w,y-5],[x+3,y+39+rand()*79],[x+w,y-6]],'#253a40');
    }
  }
  poly(ctx,[[97,407],[97,306],[120,271],[213,270],[240,306],[240,406]],'#819b8a');
  poly(ctx,[[108,407],[108,309],[129,285],[207,285],[225,307],[225,407]],'#a6b097');
  timber(ctx,169,405,68,125);
  sign(ctx,380,405,'← Alder Camp',-1);
  timber(ctx,685,480,62,116);
  timber(ctx,1023,555,83,114);
  timber(ctx,1810,619,87,130);
  timber(ctx,2702,647,77,111);
  timber(ctx,4120,751,77,145);
  workstation(ctx);
  lift(ctx);

  const earth=ctx.createLinearGradient(0,395,0,height);
  earth.addColorStop(0,'#4f6158');
  earth.addColorStop(.52,'#34464a');
  earth.addColorStop(1,'#182e38');
  poly(ctx,[...floor.points,[width,height],[0,height]],earth);
  path(ctx,floor.points.map(([x,y],i)=>[x,y+28+(i%3)*10]),'#31464a',11);
  path(ctx,floor.points,'#77806b',5);
  for(let i=1;i<floor.points.length;i++){
    const [a,b]=floor.points[i-1], [c,d]=floor.points[i];
    for(let x=a+27;x<c-10;x+=19+rand()*60) {
      const y=b+(d-b)*(x-a)/(c-a);
      stone(ctx,x,y+rand()*55,12+rand()*33,6+rand()*12,'#53665f');
    }
  }
  ledges.forEach(surface=>rockLedge(ctx,surface));
  for(const [x,y] of mineLights) lantern(ctx,x,y);
  return canvas;
}

export function paintMineTunnel(ctx, stage) {
  const x=4110,y=758,open=stage==='open',lit=['assess','timber','open'].includes(stage);
  // The second cart and blocked portal are visible long before the shortcut works.
  poly(ctx,[[x-177,y],[x-164,y-153],[x-109,y-218],[x+100,y-218],[x+166,y-151],[x+179,y]],'#4c5e5b');
  poly(ctx,[[x-135,y],[x-130,y-123],[x-78,y-177],[x+76,y-177],[x+130,y-123],[x+137,y]],open?'#1a3033':'#344044');
  path(ctx,[[x-143,y-151],[x-91,y-209],[x+89,y-209],[x+146,y-151]],'#ad9872',9);
  for(const z of [-1,1]) path(ctx,[[x+z*154,y],[x+z*154,y-146]],'#85684b',13);
  for(let i=0;i<5;i++) path(ctx,[[x-165-i*11,y-9+i*9],[x+164+i*11,y-9+i*9]],'#947451',5);
  if(!open) {
    for(const [dx,dy,w,h] of [[-81,-24,60,52],[-20,-66,77,65],[69,-33,76,58],[32,-108,54,46]])
      stone(ctx,x+dx,y+dy,w,h,'#6c786f');
  } else {
    for(const z of [-1,1]) path(ctx,[[x+z*105,y],[x+z*105,y-162]],'#a68155',14);
    path(ctx,[[x-103,y-156],[x+102,y-156]],'#c49b63',12);
  }
  for(const dx of [-123,124]) orb(ctx,x+dx,y-132,lit?13:7,lit?'#eac480':'#687579');
  poly(ctx,[[x-286,y-66],[x-181,y-66],[x-196,y-22],[x-269,y-22]],'#735c45');
  path(ctx,[[x-292,y-69],[x-175,y-69]],'#c5a16b',6);
  for(const dx of [-263,-202]) orb(ctx,x+dx,y-19,13,'#26302d');
}

export function paintDiscardedStilts(ctx,x,y) {
  // Hugh leaves the tall wooden frames propped beside his alcove after the reunion.
  path(ctx,[[x-28,y],[x-14,y-137],[x-4,y-154]],'#a98053',10);
  path(ctx,[[x+28,y],[x+18,y-143],[x+7,y-155]],'#b58c5d',10);
  path(ctx,[[x-38,y-60],[x-3,y-60]],'#c7a36b',8);
  path(ctx,[[x+5,y-67],[x+42,y-67]],'#c7a36b',8);
  path(ctx,[[x-19,y-117],[x-2,y-110]],'#5c4939',7);
  path(ctx,[[x+15,y-117],[x+30,y-109]],'#5c4939',7);
  for(const dx of [-28,28]) orb(ctx,x+dx,y-5,5,'#d7bb83');
}

export function paintMineLights(ctx, view, clock, night) {
  if (night) {
    ctx.fillStyle='rgba(16,24,45,'+night*.26+')';
    ctx.fillRect(view.x,view.y,view.width,view.height);
  }
  for(const [x,y,radius] of mineLights) {
    if (x+radius<view.x || x-radius>view.x+view.width) continue;
    const strength=.24+Math.sin(clock*4+x)*.045;
    const light=ctx.createRadialGradient(x,y+6,4,x,y+6,radius);
    light.addColorStop(0,'rgba(255,179,96,'+strength+')');
    light.addColorStop(1,'#f5a65800');
    orb(ctx,x,y+6,radius,light);
    orb(ctx,x,y+6,3+Math.sin(clock*7+x)*.6,'#ffce88');
  }
}

export function paintMineChest(ctx, opened) {
  const { x, y } = netChest;
  poly(ctx,[[x-31,y],[x-31,y-29],[x+32,y-29],[x+32,y]],'#73563e');
  poly(ctx,[[x-31,y-29],[x-34,y-(opened?53:40)],[x+29,y-(opened?58:40)],[x+32,y-29]],opened?'#433b32':'#9f7951');
  path(ctx,[[x-18,y],[x-18,y-31]],'#987f5d',4);
  path(ctx,[[x+17,y],[x+17,y-31]],'#987f5d',4);
  if(!opened) orb(ctx,x,y-25,4,'#e8bd77');
}

export function paintOre(ctx, node, clock) {
  const {x,y}=node;
  poly(ctx,[[x-32,y],[x-25,y-23],[x-7,y-39],[x+20,y-32],[x+37,y-15],[x+40,y]],'#5c6562');
  poly(ctx,[[x-25,y-23],[x-7,y-39],[x+20,y-32],[x+12,y-19],[x-10,y-12]],'#7e8b7f');
  path(ctx,[[x-17,y-20],[x-5,y-14],[x+3,y-26],[x+15,y-24],[x+23,y-16],[x+30,y-14]],'#d89b70',4);
  orb(ctx,x+3,y-26,2+Math.max(0,Math.sin(clock*2.2+x))*2,'#f5c797');
}

export function paintFlint(ctx) {
  const {x,y}=flint;
  poly(ctx,[[x-18,y],[x-13,y-15],[x+2,y-23],[x+16,y-12],[x+18,y]],'#647c82');
  path(ctx,[[x-13,y-15],[x+2,y-23],[x+11,y-16]],'#bcd6ce',3);
}

import { random, poly, path, orb, pine, stone, sign } from './camp-art.mjs';
import { beachTerrain, beachLandmarks } from './beach.mjs?v=3';

const { width, height, floor, ledges } = beachTerrain;
const colors = {
  day: ['#689eaa','#c3d3b9','#f3d9a7','#51898a','#a8c7ad'],
  dusk: ['#52577d','#ca909c','#fac58e','#5c7f90','#c7a4a1'],
  night: ['#101f3d','#3e5272','#8883a3','#344f68','#7895a6'],
  dawn: ['#42547b','#b6a6b4','#ffe2b1','#597d91','#b5bac0']
};
export function paintBeachHorizon(ctx, view, phase, alpha, clock) {
  if (alpha <= 0) return;
  const {x,y,width:w,height:h}=view;
  const [top,mid,low,sea,shine]=colors[phase];
  ctx.save();
  ctx.globalAlpha=alpha;
  const horizon=388+y*.32;
  const sky=ctx.createLinearGradient(0,y-20,0,Math.max(y+50,horizon));
  sky.addColorStop(0,top);
  sky.addColorStop(.59,mid);
  sky.addColorStop(1,low);
  ctx.fillStyle=sky;
  ctx.fillRect(x,y,w,h);
  const night=phase==='night';
  const sunX=x*.90+w*.73;
  const sunY=horizon-78;
  const halo=ctx.createRadialGradient(sunX,sunY,9,sunX,sunY,111);
  halo.addColorStop(0,low);
  halo.addColorStop(1,low+'00');
  orb(ctx,sunX,sunY,111,halo);
  orb(ctx,sunX,sunY,night?23:30,night?'#f3e3bb':'#ffe2a6');
  if(night) orb(ctx,sunX+8,sunY-7,21,top);
  const rand=random(1734);
  for(let i=0;i<58;i++) {
    const px=x+((rand()*1240-x*.14+1240)%1240);
    const py=horizon-55-rand()*300;
    const span=25+rand()*100;
    if(night) orb(ctx,px,py,i%7===0?1.7:1,'#e6e1eab0');
    else if(i<16) poly(ctx,[[px,py],[px+span*.38,py-5],[px+span*.72,py-4],[px+span,py+1],[px+span*.53,py+3]],'#fff0d049');
  }
  const ocean=ctx.createLinearGradient(0,horizon,0,horizon+440);
  ocean.addColorStop(0,shine);
  ocean.addColorStop(.4,sea);
  ocean.addColorStop(1,top);
  ctx.fillStyle=ocean;
  ctx.fillRect(x,horizon,w,Math.max(0,y+h-horizon));
  poly(ctx,[[x-10,horizon],[x+85,horizon-19],[x+123,horizon-41],[x+179,horizon-48],[x+232,horizon-24],[x+300,horizon],[x+423,horizon]],'#445e68a0');
  const island=x*.95+w*.91;
  poly(ctx,[[island-165,horizon],[island-85,horizon-13],[island-36,horizon-40],[island+16,horizon-34],[island+53,horizon-15],[island+133,horizon]],'#465d68b8');
  for(let i=0;i<37;i++) {
    const wx=x+((i*137.63-x*.11+1600)%1600)+Math.sin(clock*.83+i)*19;
    const wy=horizon+9+i*8.2;
    path(ctx,[[wx,wy],[wx+30+(i*17%70),wy]],i%3===0?'#f1e6c76f':'#e1e7cf42',i%3===0?2.5:1.2);
  }
  for(let i=0;i<13;i++) {
    const sy=horizon+13+i*14;
    const sx=sunX+Math.sin(clock*.73+i*3.2)*28;
    const length=12+i*3.5;
    path(ctx,[[sx-length,sy],[sx+length,sy]],night?'#f1e6bf58':'#ffe4a572',2);
  }
  ctx.restore();
}

function tideArch(ctx) {
  poly(ctx,[[3348,541],[3365,427],[3405,354],[3455,321],[3548,312],[3607,350],[3660,430],[3678,537],[3602,536],[3589,435],[3554,392],[3507,379],[3463,393],[3433,444],[3419,538]],'#727d70');
  poly(ctx,[[3348,541],[3365,427],[3405,354],[3455,321],[3548,312],[3507,350],[3450,377],[3402,444],[3392,540]],'#9a9c7d');
  path(ctx,[[3405,357],[3455,321],[3548,312],[3607,350]],'#b3a68a',5);
  path(ctx,[[3639,405],[3611,420],[3626,466],[3615,508]],'#555f59',4);
}

export function buildBeachArt() {
  const canvas=document.createElement('canvas');
  canvas.width=width;
  canvas.height=height;
  const ctx=canvas.getContext('2d');
  const rand=random(6127);
  ctx.lineJoin='round';
  for(let x=7;x<985;x+=65+rand()*74) {
    const y=438+Math.max(0,x-420)*.37;
    pine(ctx,x,y,155+rand()*135,'#405c52','#5e7760');
  }
  for(const [x,y,w,h] of [[545,477,138,73],[746,558,110,61],[938,611,121,70],[1540,662,148,73],[2760,618,151,80],[3060,551,110,68],[3750,543,192,113]]) {
    stone(ctx,x,y,w,h,'#718172');
  }
  tideArch(ctx);
  const sand=ctx.createLinearGradient(0,428,0,height);
  sand.addColorStop(0,'#c6ae7e');
  sand.addColorStop(.54,'#9a8b6d');
  sand.addColorStop(1,'#5f756b');
  const westBank=floor.points.filter(([x])=>x<=1910);
  const eastBank=floor.points.filter(([x])=>x>=2640);
  const bank=[...westBank,[1938,714],[2602,714],...eastBank];
  poly(ctx,[...bank,[width,height],[0,height]],sand);
  path(ctx,westBank,'#e1c694',5);
  path(ctx,eastBank,'#e1c694',5);
  path(ctx,bank.map(([x,y],i)=>[x,y+34+(i%3)*7]),'#afa083',6);
  for(const ledge of ledges) {
    poly(ctx,[...ledge.points,...ledge.points.map(([x,y],i)=>[x,y+25+(i%3)*10]).reverse()],'#897f66');
    path(ctx,ledge.points,'#c2b58c',5);
  }
  for(let i=1;i<floor.points.length;i++) {
    const [a,b]=floor.points[i-1], [c,d]=floor.points[i];
    for(let x=a+26;x<c-16;x+=28+rand()*65) {
      if(x>1910 && x<2640) continue;
      const y=b+(d-b)*(x-a)/(c-a);
      if(rand()>.52) stone(ctx,x,y+rand()*33,12+rand()*26,4+rand()*13,'#89907a');
      else path(ctx,[[x-12,y+4],[x-6,y-9],[x-3,y+2],[x+6,y-6],[x+11,y+2]],'#8b976f',2);
    }
  }
  path(ctx,[[1090,644],[1180,628],[1290,652],[1367,645]],'#765e49',14);
  path(ctx,[[1169,630],[1141,609]],'#9d8562',5);
  path(ctx,[[1268,644],[1302,617]],'#a48a64',6);
  for(let x=1920;x<2635;x+=73) {
    path(ctx,[[x,586],[x,706]],'#79644c',9);
    path(ctx,[[x+3,596],[x+3,701]],'#9d825c',3);
  }
  path(ctx,[[1900,623],[2646,623]],'#79644c',17);
  path(ctx,[[1900,622],[2646,622]],'#c2a06e',7);
  path(ctx,[[1910,586],[2162,586]],'#ab8d62',3);
  path(ctx,[[2400,586],[2636,586]],'#ab8d62',3);
  for(const x of [2050,2470]) {
    path(ctx,[[x,623],[x,516],[x+22,516]],'#5e5442',6);
    poly(ctx,[[x+12,518],[x+31,518],[x+31,545],[x+12,545]],'#534638');
    poly(ctx,[[x+16,522],[x+27,522],[x+27,540],[x+16,540]],'#f7c17a');
  }
  sign(ctx,beachLandmarks[0].x,beachLandmarks[0].y,'← Alder Camp',-1);
  sign(ctx,1795,627,'Lantern Dock →');
  sign(ctx,2860,592,'Tide Arch →');
  return canvas;
}

export function paintRowboat(ctx) {
  const x=3725, y=552;
  ctx.save();
  poly(ctx,[[x-78,y],[x-61,y+24],[x+48,y+24],[x+77,y],[x+42,y+7],[x-47,y+7]],'#77563c');
  path(ctx,[[x-69,y+5],[x+62,y+5]],'#d0ad77',4);
  poly(ctx,[[x-36,y-12],[x+30,y-12],[x+44,y+5],[x-47,y+5]],'#a18058');
  path(ctx,[[x-11,y-12],[x-2,y-45],[x+7,y-12]],'#c6b58d',3);
  path(ctx,[[x-72,y+29],[x-101,y+34]],'#8d7657',4);
  path(ctx,[[x+54,y+29],[x+84,y+34]],'#8d7657',4);
  ctx.restore();
}

export function paintBeachDetails(ctx, view, clock, night, casting) {
  for(const x of [2071,2491]) {
    if(x<view.x-125 || x>view.x+view.width+125) continue;
    const light=ctx.createRadialGradient(x,533,2,x,533,114);
    light.addColorStop(0,'rgba(255,193,111,'+(.17+night*.33)+')');
    light.addColorStop(1,'#ffc16f00');
    orb(ctx,x,533,114,light);
  }
  if(!casting) return;
  const t=clock-casting.start;
  const {x,y}=casting;
  const splash=x+72;
  if(t<.42) {
    const dx=10+Math.max(0,t)*148;
    const dy=-69-Math.sin(Math.min(1,t/.42)*Math.PI)*42;
    path(ctx,[[x,y-53],[x+dx,y+dy]],'#d7c8a2',2);
    orb(ctx,x+dx,y+dy,8,'#d7c8a2');
  } else {
    ctx.strokeStyle='#e9ecb5b5';
    ctx.lineWidth=2;
    ctx.beginPath();
    ctx.ellipse(splash,y-13,9+(t-.42)*60,4+(t-.42)*17,0,0,Math.PI*2);
    ctx.stroke();
  }
}

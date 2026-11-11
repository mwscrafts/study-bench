import { random, poly, path, orb, pine, stone, sign } from './camp-art.mjs';
import { beachTerrain, beachLandmarks } from './beach.mjs?v=2';

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
  for(const ledge of ledges.filter(surface => !surface.id.startsWith('cove-bridge-'))) {
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

function bridgeDeck(ctx,left,right,yStart,yEnd) {
  const slope=(yEnd-yStart)/(right-left);
  poly(ctx,[[left,yStart],[right,yEnd],[right,yEnd+18],[left,yStart+18]],'#594638');
  path(ctx,[[left,yStart+15],[right,yEnd+15]],'#8e6c4b',7);
  for(let x=left+10;x<right;x+=31){
    const y=yStart+(x-left)*slope;
    poly(ctx,[[x,y-3],[Math.min(x+27,right),y-3+27*slope],
      [Math.min(x+27,right),y+12+27*slope],[x,y+12]],x%3<1?'#b19062':'#9d7a52');
    path(ctx,[[x+25,y-2+25*slope],[x+25,y+11+25*slope]],'#5b4637',2);
    orb(ctx,x+7,y+5,2,'#d1ad73');
  }
}

export function paintCoveBridge(ctx,repaired,clock) {
  // An elevated route above Driftwood Cove. Both ends can be explored while the
  // middle is missing; the lower sand path remains intact.
  for(const [x,top,bottom] of [[838,504,600],[984,502,616],[1585,523,664],[1722,526,641]]) {
    path(ctx,[[x,top+13],[x+8,bottom]],'#6b5641',12);
    path(ctx,[[x-13,top-5],[x+15,top-5]],'#cfb282',5);
    path(ctx,[[x-8,top+46],[x+11,top+46]],'#493a30',4);
  }
  bridgeDeck(ctx,820,1015,504,501);
  bridgeDeck(ctx,1560,1740,522,526);
  if(repaired) {
    bridgeDeck(ctx,1015,1310,501,511);
    bridgeDeck(ctx,1310,1560,511,522);
    for(let x=850;x<=1720;x+=145){
      const y= x<=1015 ? 504+(x-820)*(501-504)/195
        : x<=1310 ? 501+(x-1015)*10/295
        : x<=1560 ? 511+(x-1310)*11/250
        : 522+(x-1560)*4/180;
      path(ctx,[[x,y-7],[x,y-86]],'#735b43',8);
      orb(ctx,x,y-86,5,'#d9bd8a');
      path(ctx,[[x-11,y-80],[x+10,y-80]],'#d4af72',3);
    }
    path(ctx,[[850,423],[1015,420],[1160,425],[1310,430],[1450,438],[1590,444],[1720,444]],'#b99869',5);
    path(ctx,[[1015,518],[1170,548],[1310,527],[1455,558],[1560,539]],'#66503b',7);
    for(const x of [1110,1270,1450]){
      const y=501+(x-1015)*.033;
      path(ctx,[[x,y+17],[x+32,y+50]],'#8b6a49',5);
      path(ctx,[[x+32,y+50],[x+65,y+17]],'#8b6a49',5);
    }
  } else {
    // Snapped rails and dangling rope reveal the gap from either approach.
    path(ctx,[[850,423],[990,422],[1019,447],[1027,489]],'#a8916c',5);
    path(ctx,[[1590,444],[1563,467],[1551,493]],'#a8916c',5);
    path(ctx,[[1012,500],[1039,541],[1024,556]],'#6c5440',7);
    path(ctx,[[1562,521],[1536,560],[1545,576]],'#6c5440',7);
    poly(ctx,[[1270,607],[1320,598],[1370,614],[1342,637],[1281,635]],'#6b6455');
    path(ctx,[[1292,602],[1347,611]],'#b59469',6);
  }
  for(const [x,y] of [[852,503],[1712,524]]) {
    const glint=.65+.35*Math.sin(clock*1.8+x);
    orb(ctx,x,y-12,4,'rgba(239,202,143,'+glint+')');
  }
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

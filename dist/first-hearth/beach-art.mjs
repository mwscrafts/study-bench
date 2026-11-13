import { random, poly, path, orb } from './camp-art.mjs';
import { drawSprite } from './canvas-art.mjs?v=4';
import { beachTerrain } from './beach.mjs?v=7';

const { width, height } = beachTerrain;
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

export function buildBeachArt() {
  const canvas=document.createElement('canvas');
  canvas.width=width;
  canvas.height=height;
  const ctx=canvas.getContext('2d');
  const image=new Image();
  image.onload=()=>{
    ctx.drawImage(image,0,0,width,height);
    paintDockLanding(ctx, image);
  };
  image.src=new URL('./beach-map.webp',import.meta.url).href;
  return canvas;
}

// Shore planks reuse the dock's own painted wood texture so their grain and color carry into the landing.
export function paintDockLanding(ctx, image) {
  const rise = x => 645 - (x - 1600) * .19;
  const boards = [
    { start: 1602, end: 1780, offset: -10, textureX: 1005 },
    { start: 1616, end: 1790, offset: -3, textureX: 1160 },
    { start: 1592, end: 1768, offset: 4, textureX: 1005 },
    { start: 1626, end: 1782, offset: 11, textureX: 1160 }
  ];
  const boardWidth = 8;

  ctx.save();
  for (const board of boards) {
    const startY = rise(board.start) + board.offset;
    const endY = rise(board.end) + board.offset;
    const shape = [
      [board.start, startY],
      [board.end, endY],
      [board.end, endY + boardWidth],
      [board.start, startY + boardWidth]
    ];

    poly(ctx, shape.map(([x, y]) => [x, y + 3]), '#4933228a');

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(shape[0][0], shape[0][1]);
    for (let i = 1; i < shape.length; i++) ctx.lineTo(shape[i][0], shape[i][1]);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(
      image,
      board.textureX, 300, 44, 7,
      board.start - 2, startY - 1, board.end - board.start + 4, boardWidth + 2
    );

    const finish = ctx.createLinearGradient(0, startY, 0, startY + boardWidth);
    finish.addColorStop(0, '#e8bf8550');
    finish.addColorStop(.36, '#b77e4b10');
    finish.addColorStop(1, '#3e2a1d70');
    ctx.fillStyle = finish;
    ctx.fillRect(board.start - 2, startY - 1, board.end - board.start + 4, boardWidth + 2);
    ctx.restore();

    path(ctx, [[board.start, startY], [board.end, endY]], '#e0b678b5', 1.1);
    path(ctx, [[board.start, startY + boardWidth], [board.end, endY + boardWidth]], '#49321fba', 1.4);

    for (const portion of [.12, .88]) {
      const x = board.start + (board.end - board.start) * portion;
      const y = rise(x) + board.offset + boardWidth / 2;
      ctx.fillStyle = '#3e2e23c0';
      ctx.beginPath();
      ctx.arc(x, y, 1.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#d8ad78a0';
      ctx.beginPath();
      ctx.arc(x - .45, y - .45, .55, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}
export function paintRowboat(ctx, sprite) {
  if (!sprite) return;
  drawSprite(ctx, sprite, 3725, 585, 64);
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

import { drawSprite, paintShadow } from './canvas-art.mjs?v=4';
import {
  rowboatTerrain, ROWBOAT_CENTER_X, ROWBOAT_BASELINE_Y, ROWBOAT_DECK_Y, ROWBOAT_CHAIR_X
} from './rowboat.mjs?v=1';

const sandyCoveBackdrop = new Image();
sandyCoveBackdrop.src = new URL('./beach-map.webp', import.meta.url).href;

export function buildRowboatArt() {
  const canvas = document.createElement('canvas');
  canvas.width = rowboatTerrain.width;
  canvas.height = rowboatTerrain.height;
  return canvas;
}

export function paintRowboatSky(ctx, view, phase, alpha, clock) {
  if (alpha <= 0) return;
  const {x,y,width,height} = view;
  const horizon = 388 + y * .32;
  ctx.save();
  ctx.globalAlpha *= alpha;
  if (sandyCoveBackdrop.complete && sandyCoveBackdrop.naturalWidth) {
    const sourceHorizon = Math.round(sandyCoveBackdrop.naturalHeight * .56);
    const sourceWaterBottom = Math.round(sandyCoveBackdrop.naturalHeight * .80);
    ctx.drawImage(
      sandyCoveBackdrop,
      0, 0, sandyCoveBackdrop.naturalWidth, sourceHorizon,
      x, y, width, horizon - y
    );
    ctx.drawImage(
      sandyCoveBackdrop,
      0, sourceHorizon, sandyCoveBackdrop.naturalWidth, sourceWaterBottom - sourceHorizon,
      x, horizon, width, Math.max(0, y + height - horizon)
    );
  }
  const wrap = value => ((value % (width + 260)) + (width + 260)) % (width + 260);
  for (let i=0;i<5;i++) {
    const base = i * (width + 260) / 5 + i * 83;
    const cloudX = x + wrap(base + clock * (8 + i * 1.6)) - 130;
    const cloudY = y + 88 + (i % 3) * 55 + Math.sin(clock * .11 + i) * 7;
    const scale = .72 + (i % 3) * .14;
    ctx.fillStyle = phase === 'night' ? '#d6dfdf38' : '#fff0d16b';
    ctx.beginPath();
    ctx.ellipse(cloudX,cloudY,42*scale,10*scale,0,0,Math.PI*2);
    ctx.ellipse(cloudX-22*scale,cloudY+1,22*scale,8*scale,0,0,Math.PI*2);
    ctx.ellipse(cloudX+20*scale,cloudY-3,25*scale,9*scale,0,0,Math.PI*2);
    ctx.fill();
  }
  if (phase !== 'night') {
    ctx.strokeStyle = '#263b3c9c';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    for (let i=0;i<4;i++) {
      const gx=x+wrap(i*width/4+clock*(42+i*4))-70;
      const gy=y+134+(i%2)*62+Math.sin(clock*.7+i*1.7)*8;
      const span=7+(i%2)*2;
      ctx.beginPath();
      ctx.moveTo(gx-span,gy); ctx.quadraticCurveTo(gx-span*.5,gy-5,gx,gy+1);
      ctx.quadraticCurveTo(gx+span*.5,gy-5,gx+span,gy);
      ctx.stroke();
    }
  }
  ctx.restore();
}

export function paintRowboatSea(ctx, view, clock) {
  const {x,y,width,height}=view;
  const horizon=388+y*.32;
  ctx.save();
  ctx.lineCap='round';
  for(let i=0;i<27;i++) {
    const px=x+((i*113.7+clock*(10+i%4*3))%(width+95))-45;
    const py=horizon+78+(i*67%Math.max(90,height-180));
    const length=18+(i*23%52);
    ctx.strokeStyle=i%4===0?'#d8e3ca60':'#d7e5d64a';
    ctx.lineWidth=i%4===0?2:1.25;
    ctx.beginPath();
    ctx.moveTo(px,py);
    ctx.quadraticCurveTo(px+length*.5,py+Math.sin(clock*.5+i)*1.6,px+length,py);
    ctx.stroke();
  }
  ctx.restore();
}

export function paintRowboatVessel(ctx, sprite, clock, relaxing = false) {
  const swell=Math.pow(Math.max(0,Math.sin(clock*.29+.8)),5);
  const bob=Math.sin(clock*.78)*2.4+swell*3.2;
  const tilt=Math.sin(clock*.43)*.014+swell*.018;
  ctx.save();
  ctx.globalAlpha=.18;
  ctx.fillStyle='#183c43';
  ctx.beginPath();
  ctx.ellipse(ROWBOAT_CENTER_X,ROWBOAT_BASELINE_Y+10+bob,242,19,0,0,Math.PI*2);
  ctx.fill();
  ctx.restore();
  drawSprite(ctx,sprite,ROWBOAT_CENTER_X,ROWBOAT_BASELINE_Y+bob,204,1,0,tilt);
  paintChair(ctx,ROWBOAT_CHAIR_X,ROWBOAT_DECK_Y+bob,tilt,relaxing);
  return { bob, tilt };
}

function paintChair(ctx,x,deckY,tilt,relaxing) {
  ctx.save();
  ctx.translate(x,deckY-15);
  ctx.rotate(tilt*.35);
  ctx.lineCap='round';
  ctx.lineJoin='round';
  ctx.strokeStyle='#53351f';
  ctx.lineWidth=8;
  ctx.beginPath();
  ctx.moveTo(-18,2);ctx.lineTo(-20,-27);ctx.lineTo(-28,-63);
  ctx.moveTo(18,2);ctx.lineTo(20,-27);ctx.lineTo(28,-63);
  ctx.stroke();
  ctx.strokeStyle='#a96c3d';
  ctx.lineWidth=6;
  ctx.beginPath();ctx.moveTo(-26,-60);ctx.lineTo(27,-60);ctx.stroke();
  ctx.fillStyle='#81502f';
  ctx.beginPath();ctx.moveTo(-30,-32);ctx.lineTo(30,-32);ctx.lineTo(20,-24);ctx.lineTo(-20,-24);ctx.closePath();ctx.fill();
  ctx.fillStyle=relaxing?'#9c6844':'#d1a36a';
  ctx.beginPath();ctx.moveTo(-26,-34);ctx.lineTo(26,-34);ctx.lineTo(18,-28);ctx.lineTo(-19,-28);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#c48a50';
  ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(-20,-32);ctx.lineTo(-16,-28);ctx.moveTo(0,-32);ctx.lineTo(0,-28);ctx.moveTo(19,-32);ctx.lineTo(15,-28);ctx.stroke();
  ctx.restore();
}

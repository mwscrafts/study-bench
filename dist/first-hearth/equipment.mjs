import { clamp, groundAt } from './terrain.mjs';
import { poly, orb } from './camp-art.mjs';

// Ported from Emberwild's axe timing, drawPlayer, puff, and floater.
export const SWING_TIME = .22;
export const TOOL_COOLDOWN = .46;
export const SWING_IMPACT = .12;
export const BERRY_HEAL = 25;

export const gear = {
  hatchet: ['⚒', 'Woodcutter’s hatchet', 'Chop marked pines.'],
  pickaxe: ['⛏', 'Pickaxe', 'Mine iron and gather crystals.'],
  net: ['◇', 'Casting net', 'Cast from Lantern Dock.'],
  godslayer: ['†', 'Godslayer', 'A rare blade from the tide.']
};

export const berryBushes = [1165, 1835, 2590, 4360].map((x, index) =>
  ({ id: 'berries-' + index, x, y: groundAt(x), radius: 52, label: 'Pick berries' }));

function rand(min, max) {
  return min + Math.random() * (max - min);
}

export function puff(particles, x, y, color, count = 8) {
  for (let i = 0; i < count; i++) {
    particles.push({ x, y, vx: rand(-65,65), vy: rand(-110,-20), life: rand(.3,.7), color, size: rand(2,5) });
  }
}

export function floater(floaters, x, y, text, color = '#ffe1a2') {
  floaters.push({ x, y, text, color, life: 1.2 });
}

export function advanceGatheringEffects(particles, floaters, dt) {
  for (const p of particles) {
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 180 * dt;
  }
  for (const f of floaters) {
    f.life -= dt;
    f.y -= dt * 25;
  }
  return [particles.filter(p => p.life > 0), floaters.filter(f => f.life > 0)];
}

export function paintGatheringEffects(ctx, particles, floaters) {
  ctx.save();
  for (const p of particles) {
    ctx.globalAlpha = clamp(p.life * 1.5,0,1);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x,p.y,p.size,p.size);
  }
  for (const f of floaters) {
    ctx.globalAlpha = clamp(f.life,0,1);
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#182b28';
    ctx.lineWidth = 3;
    ctx.strokeText(f.text,f.x,f.y);
    ctx.fillStyle = f.color;
    ctx.fillText(f.text,f.x,f.y);
  }
  ctx.restore();
}

export function paintHeldTool(ctx, x, y, direction, equipped, swing, bob, tilt) {
  if (!equipped) return;
  ctx.save();
  ctx.translate(x,y+bob);
  ctx.scale(direction,1);
  ctx.rotate(tilt);
  ctx.translate(20,-44);
  ctx.scale(1.55,1.55);
  ctx.save();
  ctx.rotate(swing > 0 ? -1.4 + swing * 12 : .3);
  ctx.strokeStyle = '#b6a276';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0,6);
  ctx.lineTo(0,-17);
  ctx.stroke();
  if (equipped === 'hatchet') {
    poly(ctx,[[-1,-17],[11,-20],[14,-11],[0,-9]],'#bcc6b1');
    poly(ctx,[[11,-20],[14,-11],[11,-11],[8,-19]],'#e5e2bd');
  } else if (equipped === 'pickaxe') {
    poly(ctx,[[-13,-11],[-9,-17],[-2,-21],[7,-20],[15,-12],[6,-15],[-1,-16],[-7,-14]],'#a5bbbc');
    poly(ctx,[[-9,-17],[-2,-21],[7,-20],[13,-14],[5,-18],[-1,-18]],'#d7ddd2');
  } else if (equipped === 'godslayer') {
    poly(ctx,[[0,-39],[-5,-29],[-3,0],[3,0],[5,-29]],'#d6c3ed');
    ctx.fillStyle = '#ddb67f';
    ctx.fillRect(-8,-3,16,3);
  } else {
    ctx.strokeStyle = '#dbcba2';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0,-22,9,11,0,0,Math.PI*2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-7,-27);
    ctx.lineTo(6,-17);
    ctx.moveTo(6,-27);
    ctx.lineTo(-7,-17);
    ctx.stroke();
  }
  ctx.restore();
  if (swing > 0) {
    ctx.strokeStyle = '#ebd9a36b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(10,-3,34,-1.5,1.2);
    ctx.stroke();
  }
  ctx.restore();
}

// Emberwild's berry bush silhouette and six berries, scaled to the new terrain.
export function paintBerryBush(ctx, bush, picked) {
  const { x, y } = bush;
  for (const [dx,dy,w,h,color] of [[0,-13,29,16,'#375a36'],[-13,-22,17,15,'#466b3e'],[12,-23,18,14,'#507642']]) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x+dx,y+dy,w,h,0,0,Math.PI*2);
    ctx.fill();
  }
  if (!picked) {
    for (let i = 0; i < 6; i++) orb(ctx,x-19+(i*13)%39,y-10-(i*7)%23,3.5,'#e69584');
  }
}

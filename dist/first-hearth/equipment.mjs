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
  ironSword: ['⚔', 'Iron sword', 'Strike down night shadows.'],
  shadowBlade: ['✦', 'Shadow blade', 'A sword forged from shadow essence.'],
  // Keep the original item ID used by existing saves and public poses.
  net: ['🎣', 'Fishing rod', 'Cast from Lantern Dock or the rowboat.'],
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

export function paintHeldTool(ctx, x, y, direction, equipped, swing, bob, tilt, avatarHeight) {
  if (!equipped) return;
  if (equipped === 'net') {
    paintFishingRod(ctx, x, y, direction, bob, tilt, avatarHeight);
    return;
  }
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
  } else if (equipped === 'godslayer' || equipped === 'ironSword' || equipped === 'shadowBlade') {
    const blade = equipped === 'shadowBlade' ? '#9e8ac9' : equipped === 'ironSword' ? '#cbdadd' : '#d6c3ed';
    poly(ctx,[[0,-39],[-5,-29],[-3,0],[3,0],[5,-29]],blade);
    ctx.fillStyle = '#ddb67f';
    ctx.fillRect(-8,-3,16,3);
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

export function paintFishingRod(ctx, x, y, direction, bob, tilt, avatarHeight = 97, cast = null, clock = 0) {
  const scale = avatarHeight / 97;
  const elapsed = cast ? clock - cast.start : 0;
  const release = .28;
  const flightTime = .29;
  const backswing = Math.sin(Math.PI * clamp(elapsed / release, 0, 1));
  const followThrough = Math.sin(Math.PI * clamp((elapsed - release) / .25, 0, 1));
  const angle = -.72 - backswing * 1.26 + followThrough * .42 + tilt;
  const handX = x + direction * (20 * Math.cos(tilt) + 35 * Math.sin(tilt)) * scale;
  const handY = y + bob + (20 * Math.sin(tilt) - 35 * Math.cos(tilt)) * scale;

  ctx.save();
  ctx.translate(handX, handY);
  ctx.scale(direction * scale, scale);
  ctx.rotate(angle);
  poly(ctx, [[-10,-2],[37,-2],[68,-4],[68,-2],[37,2],[-10,3]], '#533827');
  ctx.strokeStyle = '#c9a272';
  ctx.lineWidth = 1.45;
  ctx.beginPath();
  ctx.moveTo(1,-1);
  ctx.lineTo(37,-1);
  ctx.lineTo(68,-3);
  ctx.stroke();
  ctx.fillStyle = '#9c6946';
  ctx.fillRect(-9,-3,15,6);
  orb(ctx, 7, 3, 4.5, '#3b4541');
  orb(ctx, 7, 3, 2.1, '#ceb77c');
  ctx.restore();

  if (!cast || elapsed < release) return;
  const tipX = handX + direction * (68 * Math.cos(angle) + 3 * Math.sin(angle)) * scale;
  const tipY = handY + (68 * Math.sin(angle) - 3 * Math.cos(angle)) * scale;
  const flight = clamp((elapsed - release) / flightTime, 0, 1);
  const afloat = Math.max(0, elapsed - release - flightTime);
  const lineX = tipX + (cast.landingX - tipX) * flight;
  const lineY = tipY + (cast.landingY - tipY) * flight - Math.sin(flight * Math.PI) * 42 + Math.sin(afloat * 15) * 2;
  ctx.save();
  ctx.strokeStyle = '#f3e3b9dc';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(tipX, tipY);
  ctx.quadraticCurveTo((tipX + lineX) / 2, (tipY + lineY) / 2 + flight * 13, lineX, lineY);
  ctx.stroke();
  orb(ctx, lineX, lineY, 3.7, '#d47651');
  orb(ctx, lineX, lineY - 1.9, 2.2, '#f9e7be');
  if (flight === 1 && afloat < .45) {
    ctx.strokeStyle = '#f6e8b9ac';
    ctx.globalAlpha *= 1 - afloat / .45;
    ctx.beginPath();
    ctx.ellipse(lineX, lineY + 3, 5 + afloat * 46, 2 + afloat * 12, 0, 0, Math.PI * 2);
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

import { clamp, defineTerrain, surfaceAt } from './terrain.mjs';

const floor = { id: 'king-floor', points: [
  [0,637],[445,637],[660,625],[850,585],[1085,585],[1305,619],[1540,619],
  [1765,594],[2060,594],[2260,620],[3840,620]
] };
const ledges = [
  { id: 'lantern-ledge', points: [[795,510],[890,495],[1040,495],[1115,513]] },
  { id: 'arena-ledge', points: [[3160,541],[3380,541],[3415,551]] }
];
export const kingTerrain = defineTerrain(3840, 900, 290, [floor, ...ledges]);

function spot(id, x, label, radius = 90) {
  return { id, x, y: surfaceAt(floor, x), label, radius };
}

export const kingLandmarks = [
  spot('king-return', 170, 'Return to Crown Overlook'),
  spot('lantern-rest', 1035, 'Read the lantern inscription'),
  spot('night-altar', 2010, 'Inspect the altar'),
  spot('fallen-crown', 3560, 'Look at the fallen crown', 110),
  spot('village-gate', 3760, 'Unlock the village gate', 92)
];

export const ARENA = { left: 2900, right: 3815, ground: 620, gate: 2820 };
export const TRIAL_START = 2315;
export const REST_X = 1130;
export const MAX_BOSS_HP = 480;
const FINAL_DASH = .94;
const POUNCE_TIME = .84;

export const endings = {
  break: { name: 'Break the Crown', text: 'The crown breaks. The final night gives way to a clear dawn.' },
  free: { name: 'Free the King', text: 'Lyss’s flower crown touches the King. The shadows leave his mind, and he walks into the dawn.' }
};

export function kingLocation(player) {
  if (player.x < 800) return 'Silent Approach';
  if (player.x < 1510) return 'Lantern Rest';
  if (player.x < ARENA.gate) return 'Altar Terrace';
  return 'Crown Arena';
}

export function startTrial() {
  return {
    stage: 'shadows', time: 0, boss: null, waves: [],
    shadows: [{x: 2500,y:620,hp:65},{x: 2680,y:620,hp:65},{x: 2780,y:620,hp:65}]
  };
}

export function trialBounds(trial) {
  if (!trial) return null;
  if (trial.stage === 'shadows') return [2240, ARENA.gate - 32];
  if (trial.stage === 'approach') return [2240, ARENA.right];
  return [ARENA.left, ARENA.right];
}

export function attackTrial(trial, player, gear, damageFactor = 1) {
  const basePower = gear === 'godslayer' ? Infinity : gear === 'shadowBlade' ? 100
    : gear === 'ironSword' ? 68 : gear === 'pickaxe' ? 54 : 37;
  const power = Number.isFinite(basePower) ? Math.max(1, Math.floor(basePower * damageFactor)) : basePower;
  const inReach = (x, y, range) =>
    Math.abs(x - player.x) <= range && Math.abs(y - player.y) <= 76 &&
    (x - player.x) * player.direction >= -22;
  if (trial.stage === 'shadows') {
    const target = trial.shadows.filter(shadow => inReach(shadow.x, shadow.y, 112))
      .sort((a,b) => Math.abs(a.x-player.x)-Math.abs(b.x-player.x))[0];
    if (!target) return null;
    target.hp -= power;
    const result = { x: target.x, y: target.y, damage: Math.min(65,power) };
    trial.shadows = trial.shadows.filter(shadow => shadow.hp > 0);
    if (!trial.shadows.length) trial.stage = 'approach';
    return result;
  }
  const boss = trial.boss;
  if (trial.stage !== 'duel' || !boss || !inReach(boss.x, ARENA.ground, 155)) return null;
  if (boss.hp <= 1 || boss.mode === 'charge' || boss.mode === 'tell') {
    return { x: boss.x, y: ARENA.ground, damage: 0 };
  }
  const before = boss.hp;
  boss.hp = Math.max(1, boss.hp - power);
  if (boss.hp === 1) {
    boss.mode = 'final-tell';
    boss.timer = 1;
    boss.dashDir = Math.sign(player.x - boss.x) || -1;
    boss.finalHit = false;
    trial.waves = [];
  }
  return { x: boss.x, y: ARENA.ground, damage: before - boss.hp };
}

function dashEnd(boss, player, final) {
  const delta = player.x - boss.x;
  boss.dashDir = Math.sign(delta) || -1;
  const reach = final ? 590 : boss.hp <= MAX_BOSS_HP / 2 ? 410 : 315;
  return clamp(boss.x + boss.dashDir * Math.max(reach, Math.abs(delta) + 80), ARENA.left + 36, ARENA.right - 36);
}

// The tell, charge, recovery and ground-wave loop follows Emberwild's Hollow King.
export function advanceTrial(trial, player, dt) {
  trial.time += dt;
  if (trial.stage === 'shadows') {
    let damage = 0;
    for (const shadow of trial.shadows) {
      const dx = player.x - shadow.x;
      if (Math.abs(dx) > 21) shadow.x = clamp(shadow.x + Math.sign(dx) * dt * 91, 2250, ARENA.gate - 20);
      if (Math.abs(dx) < 34 && player.y > shadow.y - 49) damage = 24;
    }
    return damage;
  }
  if (trial.stage === 'approach') {
    if (player.x >= ARENA.left + 45) {
      trial.stage = 'duel';
      trial.boss = {x: 3510,hp:MAX_BOSS_HP,mode:'stalk',timer:1.45,cycle:0,dashDir:-1};
    }
    return 0;
  }
  if (trial.stage === 'alvin') {
    trial.pounce = Math.min(1, trial.pounce + dt / POUNCE_TIME);
    if (trial.pounce === 1) {
      trial.boss.hp = 0;
      trial.stage = 'won';
    }
    return 0;
  }
  const boss = trial.boss;
  if (trial.stage !== 'duel') return 0;
  let damage = 0;
  const enraged = boss.hp <= MAX_BOSS_HP / 2;
  boss.timer -= dt;
  if (boss.mode === 'stalk') {
    if (Math.abs(player.x - boss.x) > 125) boss.x += Math.sign(player.x - boss.x) * dt * (enraged ? 110 : 78);
    if (boss.timer <= 0) {
      boss.mode = 'tell';
      boss.attack = boss.cycle++ % 2 ? 'wave' : 'charge';
      boss.timer = enraged ? .65 : .95;
      boss.dashDir = Math.sign(player.x - boss.x) || -1;
    }
  } else if (boss.mode === 'tell' && boss.timer <= 0) {
    if (boss.attack === 'wave') {
      boss.mode = 'recover';
      boss.timer = enraged ? 1.25 : 1.7;
      for (const direction of [-1,1]) trial.waves.push({x:boss.x, direction, speed:enraged ? 365 : 285});
    } else {
      boss.mode = 'charge';
      boss.end = dashEnd(boss, player, false);
      boss.timer = enraged ? .8 : .7;
      boss.speed = (boss.end - boss.x) / boss.timer;
    }
  } else if (boss.mode === 'final-tell' && boss.timer <= 0) {
    boss.mode = 'final-charge';
    boss.end = dashEnd(boss, player, true);
    boss.speed = (boss.end - boss.x) / FINAL_DASH;
    boss.timer = FINAL_DASH;
    boss.finalHit = false;
  } else if (boss.mode === 'charge' || boss.mode === 'final-charge') {
    const final = boss.mode === 'final-charge';
    boss.x = boss.timer <= 0 ? boss.end : boss.x + boss.speed * dt;
    const contact = Math.abs(player.x - boss.x) < 58 && player.y > ARENA.ground - 89;
    if (contact) {
      damage = final ? 32 : 28;
      if (final) boss.finalHit = true;
    }
    if (boss.timer <= 0) {
      if (final && !boss.finalHit) {
        trial.stage = 'alvin';
        trial.pounce = 0;
      } else {
        boss.mode = final ? 'final-tell' : 'recover';
        boss.timer = final ? 1.25 : enraged ? 1.15 : 1.65;
      }
    }
  } else if (boss.mode === 'recover' && boss.timer <= 0) {
    boss.mode = 'stalk';
    boss.timer = enraged ? 1.2 : 1.6;
  }
  boss.x = clamp(boss.x, ARENA.left + 36, ARENA.right - 36);
  for (const wave of trial.waves) {
    wave.x += wave.direction * wave.speed * dt;
    if (Math.abs(player.x - wave.x) < 28 && player.y > ARENA.ground - 45) damage = Math.max(damage, 24);
  }
  trial.waves = trial.waves.filter(wave => wave.x >= ARENA.left && wave.x <= ARENA.right);
  return damage;
}

export function trialHint(trial) {
  if (trial.stage === 'shadows') return 'Clear the shadows · ' + trial.shadows.length + ' left';
  if (trial.stage === 'approach') return 'The gate is open. Enter the arena.';
  if (trial.stage === 'alvin') return 'Alvin leaps!';
  const boss = trial.boss;
  if (!boss) return '';
  if (boss.mode === 'final-tell' || boss.mode === 'final-charge') return 'FINAL CHARGE · DOUBLE-JUMP';
  if (boss.mode === 'tell') return boss.attack === 'wave' ? 'SHOCKWAVE · JUMP' : 'CHARGE · JUMP';
  if (boss.mode === 'recover') return 'Strike while he recovers.';
  return 'Keep moving. Watch for the next attack.';
}

export function formatTime(ms) {
  const hundredths = Math.round(ms / 10);
  const seconds = (hundredths % 6000 / 100).toFixed(2).padStart(5,'0');
  return Math.floor(hundredths / 6000) + ':' + seconds;
}

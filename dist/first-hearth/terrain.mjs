export const WORLD_WIDTH = 4800;
export const WORLD_HEIGHT = 900;
export const SPAWN_X = 280;
export const CAMP_X = 2190;
export const VIEW_WIDTH = 960;
const RUN_SPEED = 320;
const GRAVITY = 1700;

export const surfaces = [
  { id: 'trail', points: [[0,608],[420,608],[560,623],[680,664],[800,687],[920,687],[1030,656],[1140,612],[1450,608],[1590,580],[1800,590],[1990,610],[2550,610],[2720,627],[2980,630],[3160,662],[3370,689],[3540,728],[3710,748],[4320,748],[4510,716],[4800,720]] },
  { id: 'bridge', points: [[538,620],[620,609],[745,603],[880,600],[1000,600],[1130,610]] },
  { id: 'log', points: [[1180,556],[1340,548],[1450,551]] },
  { id: 'pine-rock', points: [[1480,534],[1570,534],[1620,555]] },
  { id: 'roots', points: [[2690,624],[2785,591],[2895,542],[3040,528]] },
  { id: 'bough-one', points: [[3010,454],[3080,440],[3240,440]] },
  { id: 'bough-two', points: [[3255,355],[3330,341],[3530,341]] },
  { id: 'crown', points: [[3510,278],[3580,260],[3830,260]] }
];
export function defineTerrain(width, height, spawn, platforms) {
  return {
    width, height, spawn, surfaces: platforms, floor: platforms[0],
    ledges: platforms.slice(1), byId: new Map(platforms.map(surface => [surface.id, surface]))
  };
}

export const campTerrain = defineTerrain(WORLD_WIDTH, WORLD_HEIGHT, SPAWN_X, surfaces);

export const landmarks = [
  { id: 'mara', x: 1860, y: 610, label: 'Talk to Lyss', radius: 94 },
  { id: 'lift', x: 2780, y: 610, label: 'Inspect the lift', radius: 76 },
  { id: 'canopy', x: 3745, y: 260, label: 'Enter Crownwood', radius: 92 },
  { id: 'mine', x: 4050, y: 748, label: 'Enter Embervein Mine', radius: 95 },
  { id: 'shore', x: 4660, y: 718, label: 'Enter the beach', radius: 88 }
];

export const flowers = [
  { id: 'clearing', x: 2380, y: 610, label: 'Pick dusklily by the fire' },
];

export function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function surfaceAt(surface, x) {
  for (let index = 1; index < surface.points.length; index++) {
    const [start, startY] = surface.points[index - 1];
    const [end, endY] = surface.points[index];
    if (start <= x && x <= end) {
      return startY + (endY - startY) * (x - start) / (end - start);
    }
  }
  return null;
}

export function groundAt(x, terrain = campTerrain) {
  return surfaceAt(terrain.floor, clamp(x, 0, terrain.width));
}

export function createPlayer(saved, terrain = campTerrain) {
  const ground = terrain.byId.get(saved?.ground) ?? terrain.floor;
  const x = Number.isFinite(saved?.x) ? clamp(saved.x, 23, terrain.width - 23) : terrain.spawn;
  const y = surfaceAt(ground, x);
  if (y === null) return createPlayer(undefined, terrain);
  return { x, y, velocityY: 0, direction: 1, ground: ground.id, jumps: 0, moving: false };
}

export function jump(player) {
  if (player.jumps >= 2) return false;
  player.velocityY = player.jumps === 0 ? -644 : -567;
  player.ground = null;
  player.jumps++;
  return true;
}

export function movePlayer(player, direction, dt, terrain = campTerrain) {
  const previousX = player.x;
  const previousY = player.y;
  if (direction) player.direction = direction;
  player.x = clamp(player.x + direction * RUN_SPEED * dt, 23, terrain.width - 23);
  player.moving = Math.abs(player.x - previousX) > .01;

  if (player.ground) {
    const support = terrain.byId.get(player.ground);
    const y = surfaceAt(support, player.x);
    if (y !== null) {
      player.y = y;
      return;
    }
    player.ground = null;
    player.jumps = 1;
  }

  player.velocityY += GRAVITY * dt;
  player.y += player.velocityY * dt;
  const floor = groundAt(player.x, terrain);
  let contact = player.y >= floor ? { id: terrain.floor.id, y: floor, time: 1 } : null;

  if (player.velocityY >= 0) {
    for (const surface of terrain.ledges) {
      const first = surface.points[0][0];
      const last = surface.points.at(-1)[0];
      if (player.x < first || player.x > last) continue;
      const oldX = clamp(previousX, first, last);
      const oldY = surfaceAt(surface, oldX);
      const y = surfaceAt(surface, player.x);
      const above = oldY - previousY;
      const below = player.y - y;
      if (above < 0 || below < 0) continue;
      const time = above / (above + below || 1);
      if (!contact || time < contact.time || (time === contact.time && y < contact.y)) {
        contact = { id: surface.id, y, time };
      }
    }
  }

  if (contact) {
    player.y = contact.y;
    player.ground = contact.id;
    player.velocityY = 0;
    player.jumps = 0;
  }
}

export function nearbyLandmark(player, candidates) {
  return candidates.reduce((nearest, item) => {
    const dx = Math.abs(item.x - player.x);
    const dy = Math.abs(item.y - player.y);
    if (dx > (item.radius ?? 57) || dy > 48) return nearest;
    if (!nearest) return item;
    const previousDistance = Math.hypot(nearest.x - player.x, nearest.y - player.y);
    return Math.hypot(dx, dy) < previousDistance ? item : nearest;
  }, undefined);
}

export function patrolShadows(patrols, phase, nightIndex) {
  if (phase < 70 || phase >= 111) return [];
  const tempo = 1 + Math.min(nightIndex, 6) * .16;
  return patrols.map(({surface, left, right, offset}, index) => {
    const t = (phase - 70) * tempo + offset;
    const x = left + (.5 + .5 * Math.sin(t * .75)) * (right - left);
    const hop = Math.max(0, Math.sin(t * 2.5));
    const y = surfaceAt(surface, x) - hop * (27 + Math.min(nightIndex, 6) * 5);
    return { x, y, index };
  });
}

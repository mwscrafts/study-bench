export const WORLD_WIDTH = 1882;
export const WORLD_HEIGHT = 836;
export const SPAWN_X = 755;
const LEFT_EDGE = 25;
const RIGHT_EDGE = WORLD_WIDTH - 23;
const RUN_SPEED = 320;
const GRAVITY = 1700;

export const surfaces = [
  { id: 'trail', points: [[0,565], [995,565], [1030,594], [1058,613], [1091,647], [1190,647], [1216,684], [1244,684], [1282,718], [1332,720], [1375,738], [1882,738]] },
  { id: 'roots', points: [[885,565], [940,546], [992,525], [1051,511], [1092,503], [1117,503]] },
  { id: 'branch-one', points: [[1088,421], [1111,410], [1316,410]] },
  { id: 'branch-two', points: [[1282,318], [1308,309], [1508,309]] },
  { id: 'branch-three', points: [[1498,216], [1519,204], [1753,204]] },
  { id: 'crown', points: [[1718,188], [1750,173], [1882,173]] }
];

export const landmarks = [
  { id: 'mara', x: 300, y: 565, label: 'Talk to Mara', radius: 100 },
  { id: 'mine', x: 1685, y: 738, label: 'Mine doorway', radius: 120 },
  { id: 'canopy', x: 1810, y: 173, label: 'Canopy trail', radius: 118 }
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

export function createPlayer(saved) {
  const ground = surfaces.find(surface => surface.id === saved?.ground) ?? surfaces[0];
  const x = Number.isFinite(saved?.x) ? clamp(saved.x, LEFT_EDGE, RIGHT_EDGE) : SPAWN_X;
  const y = surfaceAt(ground, x);
  if (y === null) return createPlayer();
  return { x, y, velocityY: 0, direction: 1, ground: ground.id, jumps: 0, moving: false };
}

export function jump(player) {
  if (player.jumps >= 2) return false;
  player.velocityY = player.jumps === 0 ? -644 : -567;
  player.ground = null;
  player.jumps++;
  return true;
}

export function movePlayer(player, direction, dt) {
  const previousX = player.x;
  const previousY = player.y;
  if (direction) player.direction = direction;
  player.x = clamp(player.x + direction * RUN_SPEED * dt, LEFT_EDGE, RIGHT_EDGE);
  player.moving = Math.abs(player.x - previousX) > .01;

  if (player.ground) {
    let support = surfaces.find(surface => surface.id === player.ground);
    if (player.ground === 'trail' && previousX < 885 && player.x >= 885) support = surfaces[1];
    if (player.ground === 'roots' && player.x < 885) support = surfaces[0];
    const y = surfaceAt(support, player.x);
    if (y !== null) {
      player.ground = support.id;
      player.y = y;
      return;
    }
    player.ground = null;
    player.jumps = 1;
  }

  player.velocityY += GRAVITY * dt;
  player.y += player.velocityY * dt;
  if (player.velocityY < 0) return;
  for (const surface of surfaces) {
    const y = surfaceAt(surface, player.x);
    if (y === null || previousY > y + 1 || player.y < y) continue;
    player.y = y;
    player.ground = surface.id;
    player.velocityY = 0;
    player.jumps = 0;
  }
}

export function nearbyLandmark(player) {
  return landmarks.find(landmark => Math.abs(landmark.x - player.x) < landmark.radius &&
    Math.abs(landmark.y - player.y) < 44);
}

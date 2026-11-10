import { DurableObject } from 'cloudflare:workers';

const PATH = '/first-hearth/api/times';
const PRESENCE_PATH = '/first-hearth/api/presence';
const response = (data, status = 200) => Response.json(data, {
  status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }
});

async function readEntry(request) {
  if (!request.body || !request.headers.get('Content-Type')?.startsWith('application/json')) return null;
  const reader = request.body.getReader();
  const bytes = new Uint8Array(512);
  let count = 0;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    if (count + value.length > bytes.length) {
      await reader.cancel();
      return null;
    }
    bytes.set(value, count);
    count += value.length;
  }
  try {
    const { runId, timeMs, name: rawName } = JSON.parse(new TextDecoder().decode(bytes.subarray(0,count)));
    const name = typeof rawName === 'string' ? rawName.trim().normalize('NFC') : '';
    if (typeof runId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(runId)
      || !Number.isSafeInteger(timeMs) || timeMs < 1000 || timeMs > 3600000
      || name.length > 20 || !/^[\p{L}\p{M}\p{N} ._'’-]+$/u.test(name) || !/[\p{L}\p{N}]/u.test(name)) return null;
    return { runId, timeMs, name };
  } catch {
    return null;
  }
}

export class HearthTimes extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    this.sql.exec(`CREATE TABLE IF NOT EXISTS times (
      runId TEXT PRIMARY KEY, ending TEXT NOT NULL, timeMs INTEGER NOT NULL, name TEXT NOT NULL
    )`);
  }

  async fetch(request) {
    const url = new URL(request.url);
    const ending = url.searchParams.get('ending');
    if (!['break','free','break-hard','free-hard'].includes(ending)) return response({ error: 'Unknown ending' }, 400);
    const scores = () => this.sql.exec(
      'SELECT name, timeMs FROM times WHERE ending = ? ORDER BY timeMs, runId LIMIT 20', ending
    ).toArray();
    if (request.method === 'GET') return response({ scores: scores() });
    if (request.method !== 'POST') return response({ error: 'Method not allowed' }, 405);
    if (request.headers.get('Origin') !== url.origin) return response({ error: 'Origin not allowed' }, 403);
    const entry = await readEntry(request);
    if (!entry) return response({ error: 'Invalid time entry' }, 400);
    this.sql.exec('INSERT OR IGNORE INTO times (runId, ending, timeMs, name) VALUES (?, ?, ?, ?)',
      entry.runId, ending, entry.timeMs, entry.name);
    const posted = this.sql.exec('SELECT ending, name FROM times WHERE runId = ?', entry.runId).one();
    if (posted.ending !== ending) return response({ error: 'This run already posted to another board' }, 409);
    this.sql.exec(`DELETE FROM times WHERE runId IN (
      SELECT runId FROM times WHERE ending = ? ORDER BY timeMs, runId LIMIT -1 OFFSET 50
    )`, ending);
    return response({ scores: scores(), postedName: posted.name });
  }
}

const AREAS = new Set(['camp','crownwood','mine','beach','hearth','king','village','house']);
const TOOLS = new Set(['hatchet','pickaxe','ironSword','shadowBlade','godslayer','net']);
const numberBetween = (value,min,max) => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;

function readPose(data) {
  if (!data || typeof data !== 'object' || !AREAS.has(data.region)
    || !numberBetween(data.x,0,7000) || !numberBetween(data.y,-500,1600)
    || !numberBetween(data.gait,0,7) || !numberBetween(data.swing,0,2)) return null;
  const rawName = typeof data.name === 'string' ? data.name.trim().normalize('NFC') : '';
  return {
    region: data.region, x: data.x, y: data.y,
    direction: data.direction === -1 ? -1 : 1,
    moving: data.moving === true, gait: data.gait, swing: data.swing,
    avatar: data.avatar === 'girl' ? 'girl' : 'boy',
    tool: TOOLS.has(data.tool) ? data.tool : null,
    helmet: data.helmet === true,
    name: rawName.length <= 16 && /^[\p{L}\p{N} ]+$/u.test(rawName) ? rawName : 'Adventurer'
  };
}

// One Durable Object coordinates presence across all regions. The per-socket attachment
// survives hibernation; a later shared-door event can live in this object's storage.
export class HearthPresence extends DurableObject {
  fetch(request) {
    if (request.method !== 'GET' || request.headers.get('Upgrade')?.toLowerCase() !== 'websocket')
      return response({ error: 'WebSocket required' }, 426);
    const [client, server] = Object.values(new WebSocketPair());
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment({ id: crypto.randomUUID(), pose: null, lastAt: 0 });
    server.send(JSON.stringify({ type: 'ready' }));
    return new Response(null, { status: 101, webSocket: client });
  }

  webSocketMessage(socket, message) {
    if (typeof message !== 'string' || message.length > 512) {
      socket.close(1009, 'Invalid position update');
      return;
    }
    let data;
    try { data = JSON.parse(message); } catch { return; }
    if (data?.type !== 'pose') return;
    const pose = readPose(data.pose);
    if (!pose) return;
    const prior = socket.deserializeAttachment();
    if (!prior || Date.now() - prior.lastAt < 55) return;
    socket.serializeAttachment({ id: prior.id, pose, lastAt: Date.now() });
    const others = this.ctx.getWebSockets().filter(peer => peer !== socket);
    if (prior.pose?.region !== pose.region) {
      if (prior.pose) this.broadcast(others, prior.pose.region, { type: 'left', id: prior.id });
      socket.send(JSON.stringify({ type: 'snapshot', peers: others.map(peer => peer.deserializeAttachment())
        .filter(peer => peer?.pose?.region === pose.region)
        .map(peer => ({ id: peer.id, pose: peer.pose })) }));
    }
    this.broadcast(others, pose.region, { type: 'pose', id: prior.id, pose });
  }

  broadcast(sockets, region, message) {
    const payload = JSON.stringify(message);
    for (const socket of sockets) {
      if (socket.deserializeAttachment()?.pose?.region === region) {
        try { socket.send(payload); } catch { /* The close handler removes this peer. */ }
      }
    }
  }

  webSocketClose(socket) {
    const peer = socket.deserializeAttachment();
    if (peer?.pose) this.broadcast(this.ctx.getWebSockets().filter(other => other !== socket),
      peer.pose.region, { type: 'left', id: peer.id });
  }

  webSocketError(socket) { this.webSocketClose(socket); }
}

export default {
  fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === PRESENCE_PATH) {
      if (request.headers.get('Origin') !== url.origin) return response({ error: 'Origin not allowed' }, 403);
      return env.HEARTH_PRESENCE.getByName('public-world-v1').fetch(request);
    }
    if (url.pathname === PATH) return env.HEARTH_TIMES.getByName('shared').fetch(request);
    return env.ASSETS.fetch(request);
  }
};

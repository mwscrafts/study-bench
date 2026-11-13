import { DurableObject } from 'cloudflare:workers';

const PATH = '/first-hearth/api/times';
const PRESENCE_PATH = '/first-hearth/api/presence';
const BOARD_PATH = '/first-hearth/api/noticeboard';
const PUBLIC_CYCLE_MS = 136000;
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

async function readSmallBody(request, maxBytes) {
  if (!request.body) return null;
  const reader = request.body.getReader();
  const parts = [];
  let total = 0;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > maxBytes) { await reader.cancel(); return null; }
    parts.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) { bytes.set(part,offset); offset += part.length; }
  return new TextDecoder().decode(bytes);
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

const AREAS = new Set(['camp','crownwood','mine','beach','hearth','king','village','house','hut',
  'rootdeep','rootdeep-home-lantern','rootdeep-home-stone','rootdeep-home-common']);
const SHADOW_REGIONS = new Set(['crownwood','rootdeep','mine','beach']);
const TOOLS = new Set(['hatchet','pickaxe','ironSword','shadowBlade','godslayer','net']);
const DOORS = {
  'mine-lift': [{ region: 'mine', x: 2165 }, { region: 'mine', x: 4510 }, { region: 'camp', x: 2425 }],
  'village-gate': [{ region: 'king', x: 3760 }]
};
const numberBetween = (value,min,max) => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;

function readPose(data) {
  if (!data || typeof data !== 'object' || !AREAS.has(data.region)
    || !numberBetween(data.x,0,7000) || !numberBetween(data.y,-500,6000)
    || !numberBetween(data.gait,0,7) || !numberBetween(data.swing,0,2)) return null;
  const rawName = typeof data.name === 'string' ? data.name.trim().normalize('NFC') : '';
  const cat = data.alvin && typeof data.alvin === 'object' &&
    numberBetween(data.alvin.x,0,7000) && numberBetween(data.alvin.y,-500,6000) ? {
      x: data.alvin.x, y: data.alvin.y,
      direction: data.alvin.direction === -1 ? -1 : 1,
      gait: numberBetween(data.alvin.gait,0,1000000) ? data.alvin.gait % (Math.PI * 2) : 0,
      size: numberBetween(data.alvin.size,1,3) ? data.alvin.size : 1,
      indoors: data.alvin.indoors === true,
      bell: data.alvin.bell === true
    } : null;
  return {
    region: data.region, x: data.x, y: data.y,
    direction: data.direction === -1 ? -1 : 1,
    moving: data.moving === true, gait: data.gait, swing: data.swing,
    wave: numberBetween(data.wave,0,2) ? data.wave : 0,
    avatar: data.avatar === 'girl' ? 'girl' : 'boy',
    tool: TOOLS.has(data.tool) ? data.tool : null,
    helmet: data.helmet === true,
    scarf: data.scarf === true,
    name: rawName.length <= 16 && /^[\p{L}\p{N} ]+$/u.test(rawName) ? rawName : 'Adventurer',
    alvin: cat
  };
}

// One public world. Position lives on WebSocket attachments, while opened gates live
// in storage so a player arriving after the object hibernates still sees them.
export class HearthPresence extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.doors = new Set();
    this.sleepVotes = new Set();
    this.clockOffsetMs = 0;
    this.shadowCycleState = { cycle: null, states: {} };
    ctx.blockConcurrencyWhile(async () => {
      this.clockOffsetMs = await ctx.storage.get('public-clock-offset') ?? 0;
      if (ctx.getWebSockets().length) {
        this.doors = new Set(await ctx.storage.get('opened-doors') ?? []);
        this.sleepVotes = new Set(await ctx.storage.get('sleep-votes') ?? []);
      } else {
        await ctx.storage.delete('opened-doors');
        await ctx.storage.delete('sleep-votes');
      }
      this.shadowCycleState = await ctx.storage.get('shared-shadow-state') ?? { cycle: null, states: {} };
    });
  }

  async fetch(request) {
    if (request.method !== 'GET' || request.headers.get('Upgrade')?.toLowerCase() !== 'websocket')
      return response({ error: 'WebSocket required' }, 426);
    this.expireStalePeers(Date.now());
    if (!this.ctx.getWebSockets().length) {
      this.doors.clear();
      this.sleepVotes.clear();
      await this.ctx.storage.delete('opened-doors');
      await this.ctx.storage.delete('sleep-votes');
    }
    const url = new URL(request.url);
    const suppliedId = url.searchParams.get('player');
    const playerId = typeof suppliedId === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(suppliedId)
      ? suppliedId : crypto.randomUUID();
    if (this.sleepVotes.delete(playerId)) await this.ctx.storage.put('sleep-votes', [...this.sleepVotes]);
    const [client, server] = Object.values(new WebSocketPair());
    this.ctx.acceptWebSocket(server);
    const now = Date.now();
    server.serializeAttachment({ id: playerId, pose: null, lastAt: now, connectedAt: now });
    for (const old of this.ctx.getWebSockets()) {
      if (old === server || old.deserializeAttachment()?.id !== playerId) continue;
      const peer = old.deserializeAttachment();
      if (peer?.pose) this.broadcast(this.ctx.getWebSockets().filter(other => other !== old),
        peer.pose.region, { type: 'left', id: peer.id, temporary: true });
      try { old.close(4000, 'Session reconnected'); } catch { /* An expired socket may already be closed. */ }
    }
    server.send(JSON.stringify({ type: 'ready', doors: [...this.doors], clockOffsetMs: this.clockOffsetMs }));
    return new Response(null, { status: 101, webSocket: client });
  }

  async ensureShadowCycle() {
    const cycle = Math.floor((Date.now() + this.clockOffsetMs) / PUBLIC_CYCLE_MS);
    if (this.shadowCycleState?.cycle !== cycle) {
      this.shadowCycleState = { cycle, states: {} };
      await this.ctx.storage.put('shared-shadow-state', this.shadowCycleState);
    }
    return this.shadowCycleState;
  }

  activeSleepPeers(except = null, now = Date.now()) {
    return this.ctx.getWebSockets().filter(socket => {
      if (socket === except) return false;
      const peer = socket.deserializeAttachment();
      const lastSeen = peer?.lastAt || peer?.connectedAt || 0;
      return !!peer?.id && lastSeen > 0 && now - lastSeen < 45000;
    }).map(socket => socket.deserializeAttachment());
  }

  broadcastAll(message) {
    const payload = JSON.stringify(message);
    for (const socket of this.ctx.getWebSockets()) {
      try { socket.send(payload); } catch { /* An interrupted peer will reconnect. */ }
    }
  }

  async updateSleepVote(except = null) {
    const peers = this.activeSleepPeers(except);
    const ids = new Set(peers.map(peer => peer.id));
    for (const id of this.sleepVotes) if (!ids.has(id)) this.sleepVotes.delete(id);
    if (peers.length && peers.every(peer => this.sleepVotes.has(peer.id))) {
      const phase = ((Date.now() + this.clockOffsetMs) % PUBLIC_CYCLE_MS + PUBLIC_CYCLE_MS) % PUBLIC_CYCLE_MS;
      this.clockOffsetMs += PUBLIC_CYCLE_MS - phase;
      const restedIds = peers.filter(peer => this.sleepVotes.has(peer.id)).map(peer => peer.id);
      this.sleepVotes.clear();
      await this.ctx.storage.put('public-clock-offset', this.clockOffsetMs);
      await this.ctx.storage.delete('sleep-votes');
      this.broadcastAll({ type: 'sleep-complete', clockOffsetMs: this.clockOffsetMs, restedIds });
      return;
    }
    await this.ctx.storage.put('sleep-votes', [...this.sleepVotes]);
    this.broadcastAll({ type: 'sleep-status',
      votes: peers.filter(peer => this.sleepVotes.has(peer.id)).length,
      total: peers.length });
  }

  async sendShadowSnapshot(socket, region) {
    const state = await this.ensureShadowCycle();
    socket.send(JSON.stringify({ type: 'shadow-snapshot', region, cycle: state.cycle,
      states: Object.values(state.states).filter(item => item.region === region) }));
  }

  async applyShadowHit(socket, data) {
    const peer = socket.deserializeAttachment();
    const pose = peer?.pose;
    const source = data.source;
    const actor = source === 'alvin' ? pose?.alvin : source === 'player' ? pose : null;
    if (!pose || !SHADOW_REGIONS.has(pose.region) || Date.now() - peer.lastAt > 3000 || !actor
      || !Number.isInteger(data.index) || data.index < 0 || data.index > 9
      || !Number.isSafeInteger(data.damage) || data.damage < 1 || data.damage > 999
      || !numberBetween(data.x, 0, 7000) || !numberBetween(data.y, -500, 6000)) return;
    const reachX = source === 'alvin' ? 340 : 145;
    const reachY = source === 'alvin' ? 260 : 110;
    if (Math.abs(data.x - actor.x) > reachX || Math.abs(data.y - actor.y) > reachY) return;
    const state = await this.ensureShadowCycle();
    const key = pose.region + ':' + data.index;
    const prior = state.states[key] ?? { region: pose.region, index: data.index, hp: 60, defeated: false, winnerId: null };
    if (prior.defeated) {
      socket.send(JSON.stringify({ type: 'shadow-state', ...prior, cycle: state.cycle, rewarded: prior.winnerId === peer.id }));
      return;
    }
    const updated = { ...prior, x: data.x, y: data.y, hp: Math.max(0, prior.hp - data.damage) };
    updated.defeated = updated.hp <= 0;
    updated.winnerId = updated.defeated ? peer.id : null;
    state.states[key] = updated;
    await this.ctx.storage.put('shared-shadow-state', state);
    this.broadcast(this.ctx.getWebSockets(), pose.region,
      { type: 'shadow-state', ...updated, cycle: state.cycle });
  }

  expireStalePeers(now = Date.now(), except = null) {
    for (const socket of this.ctx.getWebSockets()) {
      if (socket === except) continue;
      const peer = socket.deserializeAttachment();
      const lastSeen = peer?.lastAt || peer?.connectedAt || 0;
      if (!lastSeen || now - lastSeen < 45000) continue;
      if (peer.pose) this.broadcast(this.ctx.getWebSockets().filter(other => other !== socket),
        peer.pose.region, { type: 'left', id: peer.id, temporary: true });
      try { socket.close(4000, 'Presence expired'); } catch { /* The peer may already be gone. */ }
    }
  }

  async webSocketMessage(socket, message) {
    this.expireStalePeers(Date.now(), socket);
    if (typeof message !== 'string' || message.length > 512) {
      socket.close(1009, 'Invalid position update');
      return;
    }
    let data;
    try { data = JSON.parse(message); } catch { return; }
    if (data?.type === 'open-door') {
      const prior = socket.deserializeAttachment();
      const door = DOORS[data.door];
      if (!door || !prior?.pose || Date.now() - prior.lastAt > 10000 ||
        !door.some(site => site.region === prior.pose.region && Math.abs(site.x - prior.pose.x) <= 160) ||
        this.doors.has(data.door)) return;
      this.doors.add(data.door);
      await this.ctx.storage.put('opened-doors', [...this.doors]);
      const update = JSON.stringify({ type: 'door-open', door: data.door });
      for (const peer of this.ctx.getWebSockets()) {
        try { peer.send(update); } catch { /* An interrupted peer will reconnect. */ }
      }
      return;
    }
    if (data?.type === 'shadow-hit') {
      await this.applyShadowHit(socket, data);
      return;
    }
    if (data?.type === 'sleep-vote') {
      const peer = socket.deserializeAttachment();
      if (!peer?.pose || Date.now() - peer.lastAt > 10000 || peer.pose.region !== 'hut'
        || Math.abs(peer.pose.x - 410) > 110 || Math.abs(peer.pose.y - 650) > 140) return;
      this.sleepVotes.add(peer.id);
      await this.updateSleepVote();
      return;
    }
    if (data?.type !== 'pose') return;
    const pose = readPose(data.pose);
    if (!pose) return;
    const prior = socket.deserializeAttachment();
    if (!prior || Date.now() - prior.lastAt < 55) return;
    socket.serializeAttachment({ id: prior.id, pose, lastAt: Date.now(), connectedAt: prior.connectedAt ?? Date.now() });
    const others = this.ctx.getWebSockets().filter(peer =>
      peer !== socket && peer.deserializeAttachment()?.id !== prior.id);
    if (prior.pose?.region !== pose.region) {
      if (prior.pose) this.broadcast(others, prior.pose.region, { type: 'left', id: prior.id });
      socket.send(JSON.stringify({ type: 'snapshot', peers: others.map(peer => peer.deserializeAttachment())
        .filter(peer => peer?.pose?.region === pose.region)
        .map(peer => ({ id: peer.id, pose: peer.pose })) }));
    }
    this.broadcast(others, pose.region, { type: 'pose', id: prior.id, pose });
    if (prior.pose?.region !== pose.region && SHADOW_REGIONS.has(pose.region))
      await this.sendShadowSnapshot(socket, pose.region);
    if (!prior.pose && this.sleepVotes.size) await this.updateSleepVote();
  }

  broadcast(sockets, region, message) {
    const payload = JSON.stringify(message);
    for (const socket of sockets) {
      if (socket.deserializeAttachment()?.pose?.region === region) {
        try { socket.send(payload); } catch { /* The close handler removes this peer. */ }
      }
    }
  }

  async webSocketClose(socket, code, reason) {
    const peer = socket.deserializeAttachment();
    const replacement = peer && this.ctx.getWebSockets().some(other =>
      other !== socket && other.deserializeAttachment()?.id === peer.id);
    const temporary = code !== 1000 || reason === 'Away';
    if (peer?.pose && !replacement) this.broadcast(this.ctx.getWebSockets().filter(other => other !== socket),
      peer.pose.region, { type: 'left', id: peer.id, temporary });
    if (peer?.id && !replacement) this.sleepVotes.delete(peer.id);
    if (!this.ctx.getWebSockets().some(other => other !== socket)) {
      this.doors.clear();
      this.sleepVotes.clear();
      await this.ctx.storage.delete('opened-doors');
      await this.ctx.storage.delete('sleep-votes');
    } else if (!replacement) {
      await this.updateSleepVote(socket);
    }
  }

  async webSocketError(socket) { await this.webSocketClose(socket, 1006, 'Socket error'); }
}

// A single, site-wide board lets visitors leave notes for someone who arrives later.
// Entries are plain text, short, capped, and rate-limited per browser-generated ID.
export class HearthBoard extends DurableObject {
  async fetch(request) {
    const saved = await this.ctx.storage.get('notices') ?? [];
    if (request.method === 'GET') return response({ notices: saved });
    if (request.method !== 'POST') return response({ error: 'Method not allowed' }, 405);
    if (request.headers.get('Content-Type')?.split(';')[0] !== 'application/json')
      return response({ error: 'JSON required' }, 415);
    let body;
    try {
      const raw = await readSmallBody(request,1024);
      if (raw === null) return response({ error: 'Note too long' }, 413);
      body = JSON.parse(raw);
    } catch { return response({ error: 'Invalid note' }, 400); }
    const text = typeof body?.text === 'string' ? body.text.trim().normalize('NFC') : '';
    const name = typeof body?.name === 'string' ? body.name.trim().normalize('NFC') : '';
    const clientId = typeof body?.clientId === 'string' ? body.clientId : '';
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(clientId) || text.length < 1 || [...text].length > 140
      || /[\u0000-\u001f\u007f]/u.test(text) || name.length > 16
      || !/^[\p{L}\p{M}\p{N} ._'’-]+$/u.test(name) || !/[\p{L}\p{N}]/u.test(name))
      return response({ error: 'Use a short note and a valid player name.' }, 400);
    const now = Date.now();
    const lastPosts = await this.ctx.storage.get('last-posts') ?? {};
    for (const [id,at] of Object.entries(lastPosts)) if (now-at > 60000) delete lastPosts[id];
    const lastPost = lastPosts[clientId] ?? 0;
    if (now - lastPost < 30000) return response({ error: 'Wait a little before pinning another note.' }, 429);
    const notices = [{ id: crypto.randomUUID(), name, text, at: now }, ...saved].slice(0, 24);
    lastPosts[clientId] = now;
    await this.ctx.storage.put({ notices, 'last-posts':lastPosts });
    return response({ notices });
  }
}

export default {
  fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === PRESENCE_PATH) {
      if (request.headers.get('Origin') !== url.origin) return response({ error: 'Origin not allowed' }, 403);
      return env.HEARTH_PRESENCE.getByName('public-world-v1').fetch(request);
    }
    if (url.pathname === BOARD_PATH) {
      const origin = request.headers.get('Origin');
      if (request.method === 'POST' && origin !== url.origin || origin && origin !== url.origin)
        return response({ error: 'Origin not allowed' }, 403);
      return env.HEARTH_BOARD.getByName('site-wide-v1').fetch(request);
    }
    if (url.pathname === PATH) return env.HEARTH_TIMES.getByName('shared').fetch(request);
    return env.ASSETS.fetch(request);
  }
};

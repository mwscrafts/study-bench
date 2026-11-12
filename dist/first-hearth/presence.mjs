const SHARED_DOORS = new Set(['mine-lift', 'village-gate']);

export function createPresence({ getRegion, getPose, isOnline, isPlaying, isHidden,
  onChange, onDoorsChange, onNotesChange, onSleepStatus, onSleepComplete, onClockOffset }) {
  const peers = new Map();
  const sharedDoors = new Set();
  let socket = null;
  let retry = null;
  let lastPoseAt = 0;
  let lastPose = '';
  let cachedId = null;

  function playerId() {
    if (cachedId) return cachedId;
    const key = 'first-hearth:presence-player:v1';
    try {
      let id = sessionStorage.getItem(key);
      if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
        id = crypto.randomUUID();
        sessionStorage.setItem(key, id);
      }
      cachedId = id;
    } catch { cachedId = crypto.randomUUID(); }
    return cachedId;
  }

  function addPeer(id, pose) {
    if (typeof id !== 'string' || id === playerId() || !pose || pose.region !== getRegion()) return;
    const existing = peers.get(id);
    peers.set(id, { pose, x: existing?.x ?? pose.x, y: existing?.y ?? pose.y,
      alvinX: existing?.alvinX ?? pose.alvin?.x, alvinY: existing?.alvinY ?? pose.alvin?.y, leftAt: null });
    onChange();
  }

  function sendPose(force = false) {
    if (socket?.readyState !== WebSocket.OPEN || !isPlaying()) return;
    const now = performance.now();
    if (!force && now - lastPoseAt < 95) return;
    const message = JSON.stringify({ type: 'pose', pose: getPose() });
    if (force || message !== lastPose || now - lastPoseAt > 1200) {
      socket.send(message);
      lastPose = message;
      lastPoseAt = now;
    }
  }

  function connect() {
    if (!isOnline() || !isPlaying() || isHidden() || socket) return;
    const url = new URL('/first-hearth/api/presence', location.href);
    url.protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    url.searchParams.set('player', playerId());
    let nextSocket;
    try { nextSocket = new WebSocket(url.href); } catch { onChange(); return; }
    socket = nextSocket;
    onChange();
    nextSocket.onopen = () => {
      if (nextSocket !== socket) return;
      lastPoseAt = 0;
      sendPose(true);
      onChange();
    };
    nextSocket.onmessage = event => {
      if (nextSocket !== socket) return;
      let message;
      try { message = JSON.parse(event.data); } catch { return; }
      if (message.type === 'ready' && Array.isArray(message.doors)) {
        sharedDoors.clear();
        for (const door of message.doors) if (SHARED_DOORS.has(door)) sharedDoors.add(door);
        onDoorsChange();
        if (Number.isFinite(message.clockOffsetMs)) onClockOffset(message.clockOffsetMs, false);
      } else if (message.type === 'door-open' && SHARED_DOORS.has(message.door)) {
        sharedDoors.add(message.door);
        onDoorsChange();
      } else if (message.type === 'sleep-status') {
        onSleepStatus(message);
      } else if (message.type === 'sleep-complete' && Number.isFinite(message.clockOffsetMs)) {
        onSleepComplete(message.clockOffsetMs, Array.isArray(message.restedIds) && message.restedIds.includes(playerId()));
      } else if (message.type === 'snapshot' && Array.isArray(message.peers)) {
        peers.clear();
        for (const peer of message.peers) addPeer(peer.id, peer.pose);
        onChange();
      } else if (message.type === 'pose') addPeer(message.id, message.pose);
      else if (message.type === 'left') {
        const peer = peers.get(message.id);
        if (message.temporary && peer) peer.leftAt = Date.now();
        else peers.delete(message.id);
        onChange();
      }
    };
    nextSocket.onclose = () => {
      if (nextSocket !== socket) return;
      socket = null;
      peers.clear();
      sharedDoors.clear();
      onChange();
      onNotesChange();
      if (isOnline() && isPlaying() && !isHidden())
        retry = setTimeout(() => { retry = null; connect(); }, 2500);
    };
    nextSocket.onerror = () => { if (nextSocket.readyState < WebSocket.CLOSING) nextSocket.close(); };
  }

  function disconnect(reason = 'Leaving world') {
    clearTimeout(retry);
    retry = null;
    const current = socket;
    socket = null;
    if (current && current.readyState < WebSocket.CLOSING) current.close(1000, reason);
    peers.clear();
    sharedDoors.clear();
    lastPose = '';
    onChange();
  }

  function openDoor(door) {
    if (!SHARED_DOORS.has(door) || sharedDoors.has(door)) return false;
    sharedDoors.add(door);
    if (socket?.readyState === WebSocket.OPEN) {
      sendPose(true);
      socket.send(JSON.stringify({ type: 'open-door', door }));
    }
    onDoorsChange();
    return true;
  }

  function voteForSleep() {
    if (socket?.readyState !== WebSocket.OPEN) return false;
    socket.send(JSON.stringify({ type: 'sleep-vote' }));
    return true;
  }

  return {
    peers, sharedDoors, connect, disconnect, sendPose, openDoor,
    voteForSleep,
    clearPeers: () => peers.clear(),
    isConnected: () => socket?.readyState === WebSocket.OPEN
  };
}

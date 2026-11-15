// The overview uses the approved atlas artwork. Its route geometry is schematic;
// the detail view plots the region's actual terrain and exit landmarks.
export const mapParent = {
  hut: 'camp', 'lyss-cabin': 'camp', 'village-home': 'village', house: 'village',
  'barry-home': 'crownwood',
  'rootdeep-home-lantern': 'rootdeep', 'rootdeep-home-stone': 'rootdeep', 'rootdeep-home-common': 'rootdeep'
};

const nodes = {
  camp: { x: 186, y: 350, name: 'Alder Camp', icon: 'camp' },
  crownwood: { x: 401, y: 263, name: 'Crownwood Canopy', icon: 'tree' },
  hearth: { x: 574, y: 188, name: 'First Hearth', icon: 'waterfall' },
  king: { x: 781, y: 234, name: 'King’s Grounds', icon: 'castle' },
  village: { x: 938, y: 247, name: 'Lantern Village', icon: 'house' },
  beach: { x: 570, y: 370, name: 'Driftwood Cove', icon: 'shore' },
  rowboat: { x: 710, y: 405, name: 'Rowboat Offshore', icon: 'boat' },
  mine: { x: 438, y: 548, name: 'Embervein Mine', icon: 'mine' },
  rootdeep: { x: 819, y: 552, name: 'Rootdeep Mine', icon: 'mine' }
};

export const mapRegionIds = [...Object.keys(nodes), ...Object.keys(mapParent)];

const campToFork = 'M186 350 Q260 334 343 361';
const forkToMine = 'Q410 371 464 361';
const crownwoodToFalls = 'M401 263 Q453 253 512 257';
const fallsToDescent = 'Q527 259 548 259 L649 259';

const connections = [
  { from: 'camp', to: 'crownwood', path: campToFork + 'Q339 315 367 291 L401 263',
    departure: ['canopy', 'Canopy climb at Root Fork'], arrival: ['camp-return', 'Camp trail'] },
  { from: 'camp', to: 'mine', path: campToFork + forkToMine + 'Q466 417 444 466 Q431 510 438 548',
    departure: ['mine', 'Mine door at Timber Gate'], arrival: ['mine-return', 'Timber Shaft'] },
  { from: 'camp', to: 'beach', path: campToFork + forkToMine + 'Q515 350 570 370',
    departure: ['shore', 'Shore Trail'], arrival: ['shore-return', 'Salt Pines'], caption: [460, 396, 'Shore Trail'] },
  { from: 'beach', to: 'rowboat', path: 'M570 370 Q638 397 710 405', gate: 'boat',
    departure: ['rowboat', 'Board below Tide Arch'], arrival: ['rowboat-return', 'Return to Tide Arch'] },
  { from: 'crownwood', to: 'hearth', path: crownwoodToFalls + 'Q527 232 548 218 L574 188',
    departure: ['first-hearth', 'Waterfall on Mist Shelf'], arrival: ['hearth-return', 'Waterfall passage'] },
  { from: 'crownwood', to: 'king', path: crownwoodToFalls + fallsToDescent + 'Q690 259 723 239 L781 234', gate: 'bridge',
    departure: ['king-trail', 'King’s Bridge on the high trail'], arrival: ['king-return', 'Crown Overlook'],
    caption: [715, 218, 'King’s Bridge'] },
  { from: 'crownwood', to: 'rootdeep', path: crownwoodToFalls + fallsToDescent + 'Q652 286 690 296 Q747 300 778 325 Q812 353 799 405 Q792 443 819 552', gate: 'rootdeep',
    departure: ['rootdeep-entrance', 'Door in the understory'], arrival: ['rootdeep-return', 'Landing 1', 'up'],
    caption: [681, 323, 'Lower Crownwood'] },
  { from: 'king', to: 'village', path: 'M781 234 Q863 238 938 247', gate: 'village',
    departure: ['village-gate', 'Village Gate'], arrival: ['village-return', 'Kingsroad'] },
  { from: 'mine', to: 'rootdeep', path: 'M438 548 Q500 563 550 552 T653 550 Q743 572 819 552', gate: 'tunnel', shortcut: true,
    departure: ['mine-tunnel', 'Minecart tunnel'], arrival: ['rootdeep-tunnel', 'Minecart on the bedrock floor', 'down'],
    caption: [628, 627, 'Minecart tunnel'] },
  { from: 'camp', to: 'mine', gate: 'lift',
    departure: ['lift', 'Repaired lift'], arrival: ['mine-lift', 'Repaired lift'] }
];

const interiorExits = {
  hut: 'hut-exit', 'lyss-cabin': 'lyss-cabin-exit', 'village-home': 'village-home-exit',
  house: 'house-return', 'barry-home': 'barry-home-exit',
  'rootdeep-home-lantern': 'rootdeep-home-lantern-exit',
  'rootdeep-home-stone': 'rootdeep-home-stone-exit',
  'rootdeep-home-common': 'rootdeep-home-common-exit'
};

function svg(tag, attributes = {}, value) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [name, content] of Object.entries(attributes)) element.setAttribute(name, String(content));
  if (value !== undefined) element.textContent = value;
  return element;
}

function pin(x, y, scale = 1) {
  return svg('use', { href: '#atlas-pin', transform: `translate(${x} ${y}) scale(${scale})` });
}

function mapText(x, y, label, className, anchor = 'start') {
  return svg('text', { x, y, class: className, 'text-anchor': anchor }, label);
}

function renderOverview(drawing, main, known, open) {
  drawing.replaceChildren(
    mapText(64, 170, 'Discovered regions', 'atlas-map-guide'),
    mapText(66, 201, 'West', 'atlas-map-guide'),
    mapText(1003, 170, 'East →', 'atlas-map-guide', 'end')
  );
  if (known.has('mine') || known.has('rootdeep')) {
    drawing.append(mapText(67, 493, 'Below ground', 'atlas-map-guide'));
  }
  const lines = open.filter(connection => connection.path);
  for (const { path } of lines.filter(connection => !connection.shortcut)) {
    drawing.append(svg('path', { d: path, class: 'atlas-route-edge' }));
  }
  for (const { path, shortcut } of lines) {
    drawing.append(svg('path', { d: path, class: shortcut ? 'atlas-route-shortcut' : 'atlas-route' }));
  }
  for (const { caption, shortcut } of open) {
    if (!caption) continue;
    const [x, y, label] = caption;
    drawing.append(mapText(x, y, label, shortcut ? 'atlas-shortcut-guide' : 'atlas-map-guide', 'middle'));
  }
  for (const [id, { x, y, name, icon }] of Object.entries(nodes)) {
    if (!known.has(id)) continue;
    const active = id === main;
    const group = svg('g', { class: active ? 'atlas-node atlas-node-current' : 'atlas-node' });
    const width = Math.max(96, name.length * 9.5 + 17);
    group.append(
      svg('title', {}, active ? `${name}, your current region` : name),
      svg('circle', { cx: x, cy: y, r: active ? 31 : 25 }),
      svg('use', { href: `#atlas-${icon}`, transform: `translate(${x} ${y}) scale(.80)` }),
      svg('rect', { x: x - width / 2, y: y + 29, width, height: 29, rx: 8 }),
      mapText(x, y + 49, name, 'atlas-node-title', 'middle')
    );
    if (active) {
      const right = x <= 850;
      group.append(pin(x, y - 39),
        mapText(x + (right ? 23 : -23), y - 37, 'You are here', 'atlas-current-label', right ? 'start' : 'end'));
    }
    drawing.append(group);
  }
}

function exitsFrom(region, main, open, landmarks, player, known) {
  if (region !== main) {
    return [{
      destination: nodes[main]?.name ?? main, note: 'Leave this room', arrow: '↩',
      landmark: landmarks.find(item => item.id === interiorExits[region] || /return|exit/.test(item.id))
    }];
  }
  const exits = [];
  function add(destination, [id, via, vertical]) {
    const landmark = landmarks.find(item => item.id === id);
    if (!landmark) return;
    const offset = landmark.x - player.x;
    const verticalOffset = landmark.y - player.y;
    const direction = vertical && Math.abs(verticalOffset) > 210 ? vertical
      : Math.abs(offset) <= Math.min(landmark.radius ?? 70, 90) ? 'nearby'
      : offset < 0 ? 'west' : 'east';
    const name = nodes[destination]?.name ?? destination;
    const hints = { west: 'West', east: 'East', up: 'Climb to', down: 'Descend to', nearby: 'Nearby' };
    const arrow = { west: '←', east: '→', up: '↑', down: '↓', nearby: '•' }[direction];
    const note = direction === 'up' || direction === 'down'
      ? `${hints[direction]} ${via}` : `${hints[direction]} via ${via}`;
    exits.push({ destination: name, note, arrow, landmark, via });
  }
  for (const edge of open) {
    if (edge.from === main) add(edge.to, edge.departure);
    if (edge.to === main) add(edge.from, edge.arrival);
  }
  if (region === 'hearth' && known.has('crownwood')) add('crownwood', ['hearth-notch', 'Mist Shelf notch']);
  return exits;
}

function renderProfile(profile, terrain, player, exits, landmarks) {
  profile.replaceChildren();
  const points = terrain.surfaces.flatMap(surface => surface.points);
  const top = Math.min(...points.map(point => point[1]));
  const bottom = Math.max(top + 1, ...points.map(point => point[1]));
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const px = value => 16 + clamp(value / terrain.width, 0, 1) * 298;
  const py = value => 29 + clamp((value - top) / (bottom - top), 0, 1) * 51;
  for (const surface of terrain.surfaces) {
    const polyline = surface.points.map(([x, y]) => `${px(x)},${py(y)}`).join(' ');
    profile.append(svg('polyline', { points: polyline, class: 'atlas-profile-track' }));
  }
  const ladder = landmarks.filter(item => item.id.startsWith('rootdeep-ladder-'));
  if (ladder.length > 1) {
    const x = px(ladder[0].x);
    const heights = ladder.map(item => item.y);
    profile.append(svg('line', { x1: x, x2: x, y1: py(Math.min(...heights)), y2: py(Math.max(...heights)), class: 'atlas-profile-ladder' }));
  }
  for (const { landmark, destination } of exits) {
    if (!landmark) continue;
    const dot = svg('circle', { cx: px(landmark.x), cy: py(landmark.y), r: 4.8, class: 'atlas-exit-dot' });
    dot.append(svg('title', {}, `${destination}: ${landmark.label}`));
    profile.append(dot);
  }
  profile.append(pin(px(player.x), py(player.y) - 12, .73));
  const labeled = exits.filter(exit => exit.landmark).sort((left, right) => left.landmark.x - right.landmark.x);
  const [west] = labeled;
  const east = labeled.length > 1 ? labeled.at(-1) : null;
  if (west) profile.append(mapText(12, 98, west.via ?? 'Exit', 'atlas-profile-label'));
  if (east) profile.append(mapText(318, 98, east.via ?? 'Exit', 'atlas-profile-label', 'end'));
}

export function renderFieldMap({ discovered, region, player, terrain, location, landmarks, access, drawing, profile, here, area, routes }) {
  const main = mapParent[region] ?? region;
  const known = new Set(discovered);
  known.add(region);
  for (const id of known) if (mapParent[id]) known.add(mapParent[id]);
  const open = connections.filter(edge => known.has(edge.from) && known.has(edge.to) && (!edge.gate || access[edge.gate]));
  const exits = exitsFrom(region, main, open, landmarks, player, known);
  renderOverview(drawing, main, known, open);
  renderProfile(profile, terrain, player, exits, landmarks);
  here.textContent = location || nodes[main]?.name || 'Current location';
  area.textContent = here.textContent === nodes[main]?.name ? '' : nodes[main]?.name ?? '';
  routes.replaceChildren();
  for (const { arrow, destination, note } of exits) {
    const item = document.createElement('li');
    const icon = document.createElement('span');
    icon.className = 'atlas-exit-arrow';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = arrow;
    const description = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = destination;
    const detail = document.createElement('span');
    detail.textContent = note;
    description.append(title, detail);
    item.append(icon, description);
    routes.append(item);
  }
  if (!exits.length) {
    const note = document.createElement('li');
    note.textContent = 'Explore to discover routes from here.';
    routes.append(note);
  }
}

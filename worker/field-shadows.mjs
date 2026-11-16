import { NIGHT_START, NIGHT_FADE_START, NIGHT_END } from '../dist/first-hearth/day-cycle.mjs';
import { beachShadows } from '../dist/first-hearth/beach.mjs';
import { crownwoodShadows } from '../dist/first-hearth/crownwood.mjs';
import { mineShadows } from '../dist/first-hearth/mine.mjs';
import { rootdeepShadows } from '../dist/first-hearth/rootdeep.mjs';

export const shadowPatrols = new Map([
  ['beach', beachShadows],
  ['crownwood', crownwoodShadows],
  ['mine', mineShadows],
  ['rootdeep', rootdeepShadows]
]);

export function advanceFieldShadows(shadows, patrols, phase, dt, players, isDefeated) {
  if (phase < NIGHT_START || phase >= NIGHT_END) return [];
  const previous = new Map(shadows.map(shadow => [shadow.index, shadow]));
  const anchors = phase < NIGHT_FADE_START ? patrols(phase) : shadows;
  return anchors.filter(anchor => !isDefeated(anchor.index)).map(anchor => {
    const shadow = previous.get(anchor.index) ?? { ...anchor, aggro: false, direction: 1 };
    let nearest = null;
    let distance = Infinity;
    for (const player of players) {
      const gap = Math.hypot(player.x - shadow.x, player.y - shadow.y);
      if (gap < distance) {
        nearest = player;
        distance = gap;
      }
    }
    const aggro = nearest !== null && distance < (shadow.aggro ? 1080 : 760);
    const target = aggro ? nearest : anchor;
    const dx = target.x - shadow.x, dy = target.y - shadow.y;
    const gap = Math.hypot(dx, dy);
    const fraction = gap > .5 ? Math.min(1, (aggro ? 104 : 76) * dt / gap) : 0;
    return { index: shadow.index, x: shadow.x + dx * fraction, y: shadow.y + dy * fraction,
      aggro, direction: -Math.sign(dx) || shadow.direction };
  });
}

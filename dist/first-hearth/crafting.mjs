import { groundAt } from './terrain.mjs';

function at(id, x, label, radius = 66) {
  return { id, x, y: groundAt(x), label, radius };
}
export const workbench = at('workbench',2520,'Use the workbench',83);
export const flint = at('flint',2670,'Pick up loose flint');
export const timberTrees = [
  at('pine-west',1505,'Chop marked pine'),
  at('pine-gate',1755,'Chop marked pine'),
  at('pine-camp',1900,'Chop marked pine'),
  at('pine-root',2800,'Chop marked pine')
];
export const WOOD_COST = 3;

export function readTools(save) {
  const chopped = Array.isArray(save?.chopped) ? save.chopped : [];
  return {
    hatchet: save?.hatchet === true,
    pickaxe: save?.pickaxe === true,
    flint: save?.flint === true,
    chopped: timberTrees.filter(tree => chopped.includes(tree.id)).map(tree => tree.id)
  };
}

export function spareWood(tools) {
  return Math.max(0, tools.chopped.length - (tools.pickaxe ? WOOD_COST : 0));
}

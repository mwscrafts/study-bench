import { groundAt } from './terrain.mjs';

function at(id, x, label, radius = 66) {
  return { id, x, y: groundAt(x), label, radius };
}
export const workbench = at('workbench',2520,'Use the workbench',83);
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
    ironSword: save?.ironSword === true,
    shadowBlade: save?.shadowBlade === true,
    charm: save?.charm === true,
    helmet: save?.helmet === true,
    flowerCrown: save?.flowerCrown === true,
    woodSpent: save?.woodSpent === 1 ? 1 : 0,
    woodDonated: Number.isSafeInteger(save?.woodDonated) ? Math.max(0, Math.min(99, save.woodDonated)) : 0,
    flint: save?.flint === true,
    debugWood: Number.isSafeInteger(save?.debugWood) ? Math.max(0, Math.min(999, save.debugWood)) : 0,
    chopped: timberTrees.filter(tree => chopped.includes(tree.id)).map(tree => tree.id)
  };
}

export function spareWood(tools) {
  return Math.max(0, tools.chopped.length + (tools.debugWood ?? 0) - (tools.pickaxe ? WOOD_COST : 0) - tools.woodSpent - (tools.woodDonated ?? 0));
}

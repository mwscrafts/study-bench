# King’s Bridge design

## Purpose and route

- The Crownwood overlook ends at a broken bridge. This is the only walkable route to the King’s Grounds.
- The west overlook ends at x=5070; the east overlook begins at x=5450. The restored span joins those surfaces. The King entrance remains on the far side at x≈5530.
- While the bridge is broken, `playtest.mjs` blocks horizontal movement across the gap while the player is on the high trail. The lower understory remains open to Rootdeep; falling to it cannot reach the King’s high overlook.
- The King’s Bridge landmark is on the west ledge at x≈4960. It is offered, accepted, repaired, and saved through `kingBridgeQuest`.

## Repair and save behavior

- Repair requires 5 spare wood and 2 iron. Use `spareWood(tools)` and deduct with `tools.woodDonated`; deduct iron from `ironStock`.
- `crownwood.mjs` defines broken and complete terrain variants; switch `regions.crownwood.terrain` on repair and before loading the player's footing.
- Existing saves migrate `beachBridgeQuest` into the King bridge state because the former Cove Bridge occupied that same progression slot. Previously completed or already-reached King saves retain access. Old `overlook` footing maps to the new west/east/span surface IDs.
- The Rootdeep entrance stays on the lower trail and remains reachable while the King’s Bridge is broken.

## Ownership and checks

- `crownwood.mjs` owns terrain, bridge landmarks, and repair costs. `crownwood-art.mjs` draws the broken or restored bridge. `playtest.mjs` owns repair dialogue, material spending, save migration, terrain switching, and the unbypassable movement gate. `world-data.mjs` owns the King return footing.
- Check a fresh save: the west-side interaction is reachable, crossing is stopped even with jumps, Rootdeep remains reachable from below, repairing consumes the stated materials, the bridge can be crossed both ways, and King’s Grounds loads only after repair.
- Check old saves with incomplete/completed Cove Bridge progress, previous King access, and footing on the old overlook. Reload while standing on the restored span and after returning from the King.

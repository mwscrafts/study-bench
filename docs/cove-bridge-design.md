# Cove Bridge maintainer notes

## Purpose and placement

- The beach's existing sand path through Driftwood Cove and toward Lantern Dock stays available.
- A visibly broken wooden bridge makes a second, elevated walking route across the cove, away from Rootdeep's minecart project.
- West stub: `cove-bridge-west`, x=820–1015, y≈504–501. East stub: `cove-bridge-east`, x=1560–1740, y≈522–526. Both are walkable before repair.
- Missing middle: `cove-bridge-span`, x=1015–1560, y≈501–522. It enters the collision terrain only after repair. Its endpoints meet the existing stub surfaces at equal height, allowing walking across their seam.
- Inspection landmarks sit on the sand at x≈850 and x≈1720, accessible from either direction. The lower path remains continuous.

## Progress and resources

- `beachBridgeQuest` is `unoffered`, `accepted`, or `complete`. The HUD material tracker appears only when accepted and while the player is on the beach.
- Repair consumes `BRIDGE_WOOD_COST=5` spare wood through `tools.woodDonated`, and `BRIDGE_IRON_COST=2` from `ironStock`. Use `spareWood(tools)`, not lifetime tree harvest, for availability.
- When repaired, set `regions.beach.terrain = beachBridgeTerrain` and the active `terrain` immediately. On save load, restore that variant before `enterRegion` and `createPlayer` so a player saved standing on the bridge loads onto it.
- Markers stop appearing after completion. The field journal entry is discovered on first inspection, regardless of acceptance.

## Artwork and files

- `beach.mjs` defines the base and repaired terrain variants, landmarks, and costs. `beach-art.mjs` draws broken and repaired versions as a dynamic overlay, using the same geometry. `playtest.mjs` owns quest/save/UI, material spend and terrain switching. `world-data.mjs` registers the base beach terrain and bridge dialogue metadata.
- Base beach art skips rock-face rendering for the two wooden bridge stubs. `paintCoveBridge` draws pilings, planks, broken rails and hanging ropes before repair; after repair it adds the span, railings, braces and iron details.
- Query versions in the current checkpoint: `beach.mjs?v=2`, `beach-art.mjs?v=2`, `world-data.mjs?v=9`, `playtest.mjs?v=70`.

## Owner playthrough

Inspect both ends before repair, try the gap and lower route, gather material, repair at either end, cross both ways, and reload while standing on the new middle. Check that the material tracker waits for acceptance and that the Rootdeep minecart states remain independent.

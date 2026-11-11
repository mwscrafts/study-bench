# Rootdeep maintainer notes

## Layout and traversal

- Rootdeep remains one continuous `1920 × 4920` world with eight full-width landings and the lit climbable ladder at `x = 1780`.
- Keep each main landing continuous. The five side ledges in `rootdeep.mjs` are optional jump-up branches; the floor beneath them remains a safe route if a player misses one.
- The rootbound arch and return landmark are on level 1. The broken winch is on level 2, Glowcap Grotto on level 3, and Lanternstead on level 4.
- The restored winch connects level 2 to level 8. Dorrin’s existing three-rootglass quest repairs it; its two interaction landmarks and both art endpoints must move together if its location changes.
- The upper and lower ends of the ladder, winch, landmarks, and platform IDs must remain aligned. `rootdeepClimbing` suppresses gravity only while attached to the right-wall ladder.

## Visual placement and quality

- The Rootdeep background canvas uses the full native `1920 × 4920` map resolution. Earlier artwork was reduced to `960 × 2460`; this was a visual-quality regression and was not the cause of the entry freeze. The current composition uses layered cave faces, wall texture, and distinct landmarks while retaining the same world dimensions.
- The Deep Seal doorway is centered on the level-8 `deep-seal` interaction landmark, at y≈4170. Keep its art and interaction radius aligned. The bedrock catch floor at y=4860 is a fall recovery floor below level 8, not a ninth landing or the Deep Seal chamber.

## Current content by level

| Level | Name | Main content |
| --- | --- | --- |
| 1 | Rootbound Threshold | Visible entrance arch and clear return to Crownwood |
| 2 | Winding Galleries | Broken winch; repaired winch becomes the shortcut |
| 3 | Glowcap Hollows | Three harvestable Glowcap patches that regrow; Common Keeper's lantern request |
| 4 | Lanternstead | Safe hub, Dorrin, two settlers, central fire, and three enterable homes |
| 5 | Iron Choir | Branching iron galleries and ore |
| 6 | Flooded Reach | Raised boardwalk over a shallow pool and visible machinery |
| 7 | Rootglass Vein | Shadow-tangled roots, purple root-glow, night patrol |
| 8 | The Deep Seal | Rootglass seam, winch endpoint, and still-closed story chamber |

Glowcaps are a separate saved resource. Turning in three to the Common Keeper lights the hub permanently and awards four berries. Gathered patches reappear after three night advances, matching marked-pine regrowth. Their harvest-night timestamps are saved; old saves without timestamps begin regrowth timing from their current night when first loaded. Keep stored Glowcap stock valid above the original three-node count so regrowth can support future lights and tunnel work. Rootdeep iron uses the same iron stock and pickaxe rules as Embervein. The Deep Seal is intentionally not a gate to a playable later chapter yet.

## House and multiplayer structure

- `rootdeep-home.mjs` owns three separate interior region definitions and fixed exit routes.
- `rootdeep-home-art.mjs` draws the lantern keeper’s home, stonecarver’s home, and common house from one shared geometric style with room-specific details.
- Keep each interior as its own `region` ID. Public presence groups peers by region, so this prevents players in different houses from appearing in the same room.
- Door IDs in `rootdeep.mjs`, entry gates in `world-data.mjs`, interior exit landmarks, and exit gates must be updated as a set.

## Code map

- `rootdeep.mjs`: terrain, side platforms, landmarks, ores, Glowcaps, and night patrol routes.
- `rootdeep-art.mjs`: continuous background, structures, lighting, inhabitants, ore and Glowcap renderers.
- `rootdeep-home.mjs` and `rootdeep-home-art.mjs`: indoor regions, furnishings, and residents.
- `world-data.mjs`: region registration, public gate destinations, room exits, and dialogue labels.
- `playtest.mjs`: save fields, interaction dispatch, resource collection, quest completion, room art selection, and Rootdeep presence.

The browser loads versioned module URLs. When changing one of these modules, bump its query in each importer and bump the `playtest.mjs` query in `index.html` for playtest changes. Keep `rootdeep.mjs` and `rootdeep-art.mjs` query versions aligned wherever both are imported.

## Playtest handoff

Source review can catch broken IDs and missing imports, but it cannot confirm jump reach, interaction spacing, or touch controls. Marshall and Ash do the live playthrough. The useful manual route is: unlock with the Root Key, enter and return, visit each home and leave, gather Glowcaps and turn them in, jump to the two iron branches and flooded boardwalk, then repair the winch and ride between its endpoints. Check public presence in separate homes and in Lanternstead with another player.

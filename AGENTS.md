# First Hearth maintainer notes

## Project layout

The browser game lives in `dist/first-hearth/`. `index.html` loads the playtest and CSS. `playtest.mjs` owns the main loop, controls, player save, dialogue, region transitions, combat, multiplayer presence, and the UI. Region and feature modules keep their terrain, landmark data, state helpers, and artwork in separate files.

| Area | Main files |
| --- | --- |
| Player movement and collision | `terrain.mjs`, coordinated by `playtest.mjs` |
| Starting camp and world props | `camp-art.mjs`, `camp-idle.mjs`, `crafting.mjs` |
| Crownwood | `crownwood.mjs`, `crownwood-art.mjs` |
| Rootdeep | `rootdeep.mjs`, `rootdeep-art.mjs`, with traversal in `playtest.mjs` |
| Embervein Mine and beach | `mine.mjs`, `mine-art.mjs`, `beach.mjs`, `beach-art.mjs` |
| Hollow King and endings | `king.mjs`, `king-art.mjs`, `time-board.mjs`, `village.mjs` |
| Hut and idle features | `camp-idle.mjs` |

## Important runtime conventions

- World coordinates use pixels; positive Y points down. Terrain surfaces are one-way platforms: `defineTerrain` treats the first surface as the floor and the remaining surfaces as ledges. A gap in a ledge is a real fall-through route.
- Rootdeep is one continuous 1920-by-4920 world. Its eight level surfaces span the full width. The timber ladder at X=1780 runs continuously from the bottom floor to the Crownwood exit. Hold Up (or W) to climb and Down (or S) to descend while beside it; on touch, hold the up or down control. `rootdeepClimbing` suppresses gravity and platform collision while attached. Keep the art, landmark position, input checks, and climb exit threshold aligned.
- Rootdeep artwork is rendered at half resolution and cropped to the camera. If its drawing or dimensions change, check the scaling and source crop in `playtest.mjs`.
- Several modules use query-string versions for browser cache invalidation. When changing an imported module, bump its query in the importer; bump the `playtest.mjs` query in `index.html` for playtest changes.
- NPC interaction branches must call `openDialogue(id)` before content helpers such as `dorrinDialogue()`; those helpers only fill the dialogue panel and do not open it.
- Player progress is stored in local storage under `first-hearth:alder-camp:v1`. Save loading and migration happen in `begin()` and `enterRegion()`; preserve older saves when changing IDs or footing.
- The public site deploys from the repository's `main` branch. Do not change site access or publish through another destination without an explicit request.

## Playtest ownership

The owner and Ash do live gameplay checks. Do not log into or play the public game to test a change unless the owner explicitly authorizes that specific test. Static source review is useful, but describe clearly when the game itself has not been played through after a change.

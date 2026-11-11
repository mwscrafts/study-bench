# First Hearth maintainer notes

## Start here and keep this current

Read [the First Hearth developer handoff](docs/first-hearth-developer-handoff.md) before making game changes. It records the active implementation state, subsystem ownership, deployment path, and the last handoff checkpoint.

Update that handoff when a meaningful feature or fix lands, and before an interrupted task or conversation handoff. Include what changed, the commit, what was actually checked, what remains, and the next useful step. Do not write “tested,” “deployed,” “fixed,” or “disconnected” unless that state was verified.

## Project layout

The browser game lives in `dist/first-hearth/`. `index.html` loads the playtest and CSS. `playtest.mjs` owns the main loop, controls, player save, dialogue, region transitions, combat, multiplayer presence, and the UI. Region and feature modules keep their terrain, landmark data, state helpers, and artwork in separate files.

| Area | Main files |
| --- | --- |
| Player movement and collision | `terrain.mjs`, coordinated by `playtest.mjs` |
| Starting camp and world props | `camp-art.mjs`, `camp-idle.mjs`, `crafting.mjs` |
| Crownwood | `crownwood.mjs`, `crownwood-art.mjs` |
| Rootdeep | `rootdeep.mjs`, `rootdeep-art.mjs`, `rootdeep-home.mjs`, `rootdeep-home-art.mjs`, with traversal in `playtest.mjs` |
| Embervein Mine and beach | `mine.mjs`, `mine-art.mjs`, `beach.mjs`, `beach-art.mjs` |
| Hollow King and endings | `king.mjs`, `king-art.mjs`, `time-board.mjs`, `village.mjs` |
| Hut and idle features | `camp-idle.mjs` |
| Public presence and shared doors | `presence.mjs`, with pose drawing in `playtest.mjs` |
| Static regions, gates, and dialogue labels | `world-data.mjs` |
| Shared sprite and canvas primitives | `canvas-art.mjs` |

## Important runtime conventions

- World coordinates use pixels; positive Y points down. Terrain surfaces are one-way platforms: `defineTerrain` treats the first surface as the floor and the remaining surfaces as ledges. A gap in a ledge is a real fall-through route.
- Rootdeep is one continuous 1920-by-4920 world. Its eight level surfaces span the full width. The timber ladder at X=1780 runs continuously from the bottom floor to the Crownwood exit. Hold Up (or W) to climb and Down (or S) to descend while beside it; on touch, hold the up or down control. `rootdeepClimbing` suppresses gravity and platform collision while attached. Keep the art, landmark position, input checks, and climb exit threshold aligned.
- Rootdeep artwork is rendered at half resolution and cropped to the camera. If its drawing or dimensions change, check the scaling and source crop in `playtest.mjs`.
- Several modules use query-string versions for browser cache invalidation. When changing an imported module, bump its query in the importer; bump the `playtest.mjs` query in `index.html` for playtest changes.
- If multiple modules import the same versioned module, keep those query strings aligned with the version used by `playtest.mjs` so the browser doesn't load separate cached copies.
- NPC interaction branches must call `openDialogue(id)` before content helpers such as `dorrinDialogue()`; those helpers only fill the dialogue panel and do not open it.
- Player progress is stored in local storage under `first-hearth:alder-camp:v1`. Save loading happens in `begin()` and footing conversion in `enterRegion()`. This cleanup deliberately does not migrate old NPC request IDs; the owner accepted lost progress for those requests.
- `savedKnownIds`, `savedQuest`, and `savedInteger` in `playtest.mjs` keep the common save validations in one place. Preserve each field's fallback and bounds when changing them.
- `interact()` handles movement, gathering, gates, ladders, and drops before dispatching ordinary landmark dialogue through `interactionHandlers`. Keep exceptional interactions ahead of the handler table.
- NPC IDs in landmarks, dialogue, sprite keys, and camp requests are `lyss`, `barry`, `hugh`, and `dorrin`. The stored `hughQuest` records accepting Hugh's gemstone request; a spent tideglass records the repaired Embervein lift. Rootdeep's lift follows `rootdeepQuest === 'complete'` without a second flag.
- Rootdeep's entrance in Crownwood is gated by `hasRootKey`; `rootKeyQuest` tracks Hugh's second quest, `rootKeyGuidance` records Lyss's clue, and `activatedLodestones` stores the three cross-region stones. The stones are intentionally on the Embervein floor, Crownwood mist shelf, and beach lookout, so all remain reachable before the gate opens. Opening the entrance with the key also announces a session-shared door through `presence.mjs`; do not persist that shared door in a player's save.
- The Root Key test grant is in the noticeboard admin item list and sets the same `hasRootKey` state as the quest reward. Existing saves that already reached Rootdeep preserve access when loaded.
- `interact()` recalculates the nearest target at activation time. Keep NPC talk handlers ahead of swing and gathering guards so a stale attack target cannot block dialogue.
- `presence.mjs` owns the public socket, reconnect timer, peer poses (including Alvin), player ID, and shared-door set. `playtest.mjs` supplies current game state and draws peer sprites and cats; keep callbacks from presence focused on UI refreshes.
- `canvas-art.mjs` owns state-independent image loading, sprite bounds, sprite drawing, portraits, and small shared effects. Keep game-state decisions and scene composition in `playtest.mjs`.
- The public site deploys from the repository's `main` branch. Do not change site access or publish through another destination without an explicit request.

## Playtest ownership

The owner and Ash do live gameplay checks. Do not log into or play the public game to test a change unless the owner explicitly authorizes that specific test. Static source review is useful, but describe clearly when the game itself has not been played through after a change.

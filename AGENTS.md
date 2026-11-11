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
| Beach and Cove Bridge | `beach.mjs`, `beach-art.mjs`, with repair state and terrain switch in `playtest.mjs` |
| Rootdeep | `rootdeep.mjs`, `rootdeep-art.mjs`, `rootdeep-home.mjs`, `rootdeep-home-art.mjs`, with traversal in `playtest.mjs` |
| Embervein Mine | `mine.mjs`, `mine-art.mjs` |
| Hollow King and endings | `king.mjs`, `king-art.mjs`, `time-board.mjs`, `village.mjs` |
| Hut and idle features | `camp-idle.mjs` |
| Public presence and shared doors | `presence.mjs`, with pose drawing in `playtest.mjs` |
| Static regions, gates, and dialogue labels | `world-data.mjs` |
| Shared sprite and canvas primitives | `canvas-art.mjs` |

## Important runtime conventions

- World coordinates use pixels; positive Y points down. Terrain surfaces are one-way platforms: `defineTerrain` treats the first surface as the floor and the remaining surfaces as ledges. A gap in a ledge is a real fall-through route.
- Rootdeep is one continuous 1920-by-4920 world. Its eight level surfaces span the full width. The timber ladder at X=1780 runs continuously from the bottom floor to the Crownwood exit. Hold Up (or W) to climb and Down (or S) to descend while beside it; on touch, hold the up or down control. `rootdeepClimbing` suppresses gravity and platform collision while attached. Keep the art, landmark position, input checks, and climb exit threshold aligned.
- A guard dwarf (Bram) stands beside the ladder on Rootdeep level 8. Players cannot descend to the bedrock floor until they speak with him. Speaking allows descent; explicitly agreeing to help unlocks the tunnel tracker and Glowcap lighting. Goblins cleared before accepting still count. Preserve this split across keyboard, touch, and drop-through movement.
- After the open cart carries a player from Rootdeep to Embervein, Hugh's next dialogue is his family reunion. The two family sprites appear by his alcove once the tunnel is open. The optional close/revisit before choosing the reveal repeats that moment; choosing the response saves `hughStiltsRevealed`, makes Hugh visibly shorter, and leaves discarded stilts nearby. Preserve this trigger and keep his later dialogue consistent with the reunion.
- The collapsed tunnel has two visible minecart endpoints: the far-left bedrock floor below Rootdeep landing 8, and Embervein's deep seam. Its per-save stages must remain goblins → 2 Glowcaps → Dorrin assesses the lit roof → 4 renewable wood for supports/excavation → carts open. Keep the separate camp/Crownwood routes available. The Deep Seal stays on landing 8 and is a different story chamber.
- The Cove Bridge is a real alternate upper beach path over Driftwood Cove. Its west/east stubs are always solid; the missing middle platform exists only in `beachBridgeTerrain` after paying 5 spare wood and 2 iron. Set `regions.beach.terrain` from saved `beachBridgeQuest` before entering/loading beach, and switch the active `terrain` on repair. The lower sand route and all exits stay open. See `docs/cove-bridge-design.md`.
- New region and route artwork should use layered, detailed native-resolution scenes. Check the visual quality in context before reducing asset detail; investigate code causes of freezes separately.
- Rootdeep's two side-branch lanterns are separate saved discoveries from the Common Keeper's Glowcap quest; each costs one Glowcap, lights a local area, and reduces (but does not remove) shadow danger nearby. Keep their landmarks on their ledges, darkness visible from main landings, and the Glowcap stock renewable.
- Rootdeep art is authored at the map's native `1920 × 4920` resolution; `playtest.mjs` draws camera crops from that full-size canvas. Keep the level-8 Deep Seal doorway centered on the `deep-seal` landmark at y≈4170. The lower bedrock catch floor at y=4860 is below the eight landings and must be labelled separately. Do not reintroduce half-resolution art as a response to a freeze without first identifying the actual code path.
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

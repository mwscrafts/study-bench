# First Hearth developer handoff

Updated: 2026-11-11  
Repository: `mwscrafts/study-bench`  
Live site: <https://love.ashquack.workers.dev/>  
Game: <https://love.ashquack.workers.dev/first-hearth/>

This is the durable continuity note for future Codex/dev conversations. Read it together with the root `AGENTS.md`. The repository is the source of truth; do not ask the owner to resend source files, identify the repository, or recreate a recap that can be recovered from these files and Git history.

## Current checkpoint

The latest code commit is `e3e75f14c8153916c11d8b4849a0800e7c842832` (“Add restorable dark branches in Rootdeep”). It follows `97af1e746d26e5b9ea9fe7d1729c28d0c3e28f43` (“Restore Rootdeep art quality and align Deep Seal”). It follows `c4807e57c6e4f90102bfe3e62c9d308271061135` (“Gate quest and crafting HUD guidance”), `185a654217abcc95d98f21daca0cf63d5c167091` (“Show Composure guidance from the start”), and `288d9cc1298a8cf6f19e402e22f5b7170706a2ba` (“Add an encounter-based field journal”).

The field journal now:
- Appears as a **Journal** button in the play controls and opens with **J**; **Escape** closes it.
- Saves unlocked entry IDs to the existing browser save under `first-hearth:alder-camp:v1`.
- Starts with notes about the journal and basic controls.
- Includes **Keeping your composure** from the beginning. This was deliberately changed after the owner found that the journal had no Composure entry; the earlier version only added it after Composure fell below 100.
- Adds other short notes as the player encounters gathering, berries, equipment, other regions, or pets Alvin.
- The HUD now tracks dusklilies only after the player accepts Lyss's quest. Flowers collected earlier still count when the quest is accepted.
- The crafting hint now shows the pickaxe recipe only after the player explicitly asks Lyss how to make a pickaxe. Receiving the hatchet no longer exposes the recipe; the pre-recipe HUD says the hatchet cuts marked pines, and the recipe label says **Pickaxe**.
- The learned-recipe flag is saved alongside the existing player save, so this progression survives reloads.
- Glowcap patches regrow after three night advances, like marked pines. Harvest-night timestamps are saved; old saves without timestamps start the countdown from their current night when loaded. Glowcap stock can exceed the original three-node count so future restoration projects can draw on regrown supplies.
- Shows a brief journal-update notice for newly discovered entries where the current game notice allows it. No modal or forced tutorial stops movement.

Cache versions in `dist/first-hearth/index.html` are currently `playtest.mjs?v=66` and `playtest.css?v=16`. If either file changes, bump its query string. The site deploys from `main`; commits there trigger the configured Cloudflare Worker build/deploy.

**Gameplay verification status:** the journal, HUD gates, and Glowcap regrowth code were statically reviewed and the committed files were confirmed on `main`; Codex did not play the public game or verify the live deployment. The owner and Ash do live gameplay checks. Do not log into or play the public game to test a change without the owner's explicit authorization for that specific test. When reporting work, distinguish source review, automated checks, live gameplay, and deployment status.

### Rootdeep checkpoint

- Restored the Rootdeep background canvas from `960 × 2460` to its native `1920 × 4920` resolution. The reduced canvas had one quarter of the pixels, making the entire region look soft when enlarged in the camera viewport. Git history identifies this as a prior memory-footprint change; it was unrelated to the entry freeze, so do not reduce the art again without diagnosing a demonstrated memory problem.
- The `deep-seal` interaction point was already on landing 8 at y≈4170. The drawn sealed door was incorrectly placed at y=4860 on the lower catch floor. The door art now anchors to the landmark; the catch floor is labelled **Bedrock Floor** so a fall below level 8 does not read as the chamber.
- Added cave-wall stone/crack detail and a built-up sealed doorway while keeping the chamber closed for the later story chapter. The eight landings and their feature plan remain as listed in `docs/rootdeep-design.md`.
- Current Rootdeep cache versions are `rootdeep.mjs?v=6` and `rootdeep-art.mjs?v=10`; their importers in `playtest.mjs` and `world-data.mjs` are aligned. Main entry uses `playtest.mjs?v=66`.
- Source review only; no live gameplay or browser visual check was performed by Codex. The owner/Ash should inspect the eighth landing and the overall visual sharpness after deployment. If the earlier freeze returns, investigate the code path separately instead of degrading scene assets.

### Restorable dark branches checkpoint

- The west iron-gallery side ledge on level 5 and east shadow-root side ledge on level 7 now have visible dark pockets and cold lanterns. Each is a separate journal entry and costs one Glowcap to relight. The player must stand on the ledge to interact.
- The branch states save as `branchLanternsLit` independently of `glowcapLanternLit`, the Common Keeper's existing three-Glowcap quest. They do not consume a cap twice. Branch lights reduce shadow hit damage by half and nearby threat Composure drain to 40% within 205 world units; they do not remove shadows or protect the entire mine.
- The regular warm lamps by these two galleries moved toward the main landings, making the dark branches readable from those routes. Rootdeep's Glowcaps continue to regenerate after three nights.
- Rootdeep data/art imports are now `rootdeep.mjs?v=6` and `rootdeep-art.mjs?v=10`, with the playtest entry at `v=66`. Static source review only; the owner/Ash should visually verify lantern placement and the local shadow safety effect in the live game. Codex has not played the public world for this patch.
- Next project: make the collapsed tunnel and both minecart endpoints visible, then implement the staged sequence **goblins → Glowcap lighting → dwarven timber assessment/request → supports/excavation → working minecart**. Preserve the alternate route throughout and keep this tunnel lighting separate from these branch discoveries.

### Suggested owner check for this checkpoint

In Rootdeep, reach both side ledges and check the unlit lanterns are visible from the main route. Light one with a Glowcap, reload, and confirm it remains lit without another cost. Check that the second remains dark and that the Common Keeper's quest still counts its own three caps. At night, compare shadow damage and Composure drain inside a restored light pool with a spot beyond it.

After the Cloudflare build updates, reload the game and open **Journal**. Confirm **Keeping your composure** is present on an existing save as well as a new save, and that it says nearby threats drain Composure, fighting nearby drains it faster, zero Composure costs 1 health per second, and petting Alvin in the hut restores up to 25 Composure. Check Glowcap regrowth by gathering a patch, advancing three nights (sleep or the normal cycle), and confirming the patch reappears and can be gathered again; verify the stock survives a reload. Also check that newly encountered journal entries persist.

## Project layout and ownership

The game is a static browser experience in `dist/first-hearth/`. There is no separate game build step; the site serves files from `dist/`. Keep code in this repository and preserve the existing Cloudflare Worker/site. Do not register another site, change access, or switch hosting as part of routine feature work.

| Responsibility | Source of truth |
| --- | --- |
| Main loop, game state, player save, controls, interaction routing, combat, region transitions, multiplayer presentation and most UI | `dist/first-hearth/playtest.mjs` |
| Starting camp geometry, collision, landmarks, flowers and player movement primitives | `terrain.mjs` |
| Region data and terrain | `crownwood.mjs`, `mine.mjs`, `beach.mjs`, `hearth.mjs`, `rootdeep.mjs`, `rootdeep-home.mjs`, `king.mjs`, `village.mjs`, `world-data.mjs` |
| Region artwork | Matching `*-art.mjs` modules; shared sprite/canvas helpers are in `canvas-art.mjs` |
| Hut, requests, fishing, plants and other camp idle systems | `camp-idle.mjs`, `crafting.mjs` |
| Backpack rendering and equipment data | `backpack.mjs`, `equipment.mjs` |
| Public multiplayer socket, reconnect timer, peer poses and session-shared doors | `presence.mjs`; `playtest.mjs` supplies game state and draws peers |
| Main playtest markup and script/style cache references | `index.html` |
| Main game styling | `playtest.css` |
| World direction and release standards | `docs/project-brief.md` |
| Rootdeep region design and manual route | `docs/rootdeep-design.md` |

## Runtime conventions that are easy to break

- World coordinates are pixels; positive Y points down. Terrain's first surface is the floor; the remaining surfaces are one-way ledges. A gap in a ledge is an intentional fall-through route.
- Rootdeep is one continuous `1920 × 4920` world with eight full-width landings. The climbable ladder at `x = 1780` is continuous. Its art, landmark, climb input, and exit threshold must agree.
- Rootdeep's optional side ledges are jump-up branches; the floor route beneath them remains safe. The repaired winch joins level 2 to level 8. The Deep Seal is not a playable next chapter yet.
- Each Rootdeep home is a distinct `region` ID because presence groups players by region. When changing doors, update Rootdeep landmarks, `world-data.mjs` gates, interior exits, and artwork together.
- Several modules use query-string versions. When changing an imported module, bump its query in every importer; keep shared module versions aligned. When changing `playtest.mjs`, bump its query in `index.html`.
- `interact()` handles exceptional actions (movement, gathering, gates, ladders, drops) before ordinary landmark dialogue. Preserve that order. It refreshes the selected target on activation; NPC talk handlers must stay ahead of swing/gather guards so stale targets cannot block dialogue.
- NPC dialogue helpers such as `dorrinDialogue()` only fill the panel. Call `openDialogue(id)` first.
- `controlsActive()` is the central gameplay-input gate. Any new modal/panel that should stop movement must be included there, and its keyboard open/close behavior must be handled before the generic inactive-controls return.
- Keep UI responsive for touch screens. Check the existing mobile CSS before adding controls; the bottom inventory strip already supports three buttons.
- `canvas-art.mjs` should remain state-independent. Put game-state decisions and scene composition in `playtest.mjs`.

## Save and progression facts

- Player data uses browser localStorage key `first-hearth:alder-camp:v1`. Saves are per browser/device, not a multiplayer cloud profile.
- Loading is in `begin()`; region/footing conversion and save refresh are in `enterRegion()`. Existing saves should keep working when a new optional field is added.
- Use `savedKnownIds`, `savedQuest`, and `savedInteger` for validated save fields. Keep fallback values and bounds intentional. Do not bump the save version for an optional backward-compatible field unless the data model actually requires migration.
- The saved `visited` set uses known landmark IDs; flowers and other resources have their own state. Avoid adding duplicate progression flags when an existing quest/resource already represents the state.
- Shared doors opened through `presence.mjs` are for the current public session. Do not persist a shared door into a player's save.
- Rootdeep entrance needs `hasRootKey`; Hugh's second request is `rootKeyQuest`, Lyss's clue is `rootKeyGuidance`, and the three stones are in Embervein, Crownwood, and the beach. Rootdeep's winch follows `rootdeepQuest === 'complete'`; the spent tideglass records the Embervein lift repair.
- Rootdeep Glowcaps are a separate saved resource. Turning in three to the Common Keeper permanently lights the hub and rewards four berries. Gathered Glowcap patches regrow after three night advances; stored stock can accumulate beyond the original three-node count for future restoration projects. Rootdeep iron shares the Embervein iron stock and pickaxe rules.

## Composure and journal mechanics

- Composure begins at 100. Outside the hut, nearby threats within 320 pixels drain it. Drain increases with proximity and while fighting nearby; at zero, health loses 1 point per second.
- Petting Alvin in the hut restores up to 25 Composure. The hut does not drain Composure from nearby threats.
- The journal catalog and unlock set live in `playtest.mjs`. The entry IDs are saved, validated against the catalog, and rendered as rereadable entries. Unlock entries at the relevant game event, not from a modal that interrupts exploration.
- Keep explanations plain and mechanically exact. The Composure entry is now available from the start because the owner correctly pointed out that a note hidden until an unseen threshold did not teach a player who opened the journal early. If you change the teaching trigger, preserve access to the explanation before it is needed.
- If a tutorial entry is technically stored but the player cannot tell it exists, improve the in-game affordance (for example, a readable Journal button/update cue). Do not claim that a mechanic is explained just because its text exists in code.

## Multiplayer

The intended public feature is that players on the website can see other players running around in the same world and see each other's Alvin. This is a shared public world, not a lobby/room matchmaking flow. `presence.mjs` owns the socket and peer state; `playtest.mjs` owns pose production and rendering. Shared doors are session announcements. Keep callbacks focused on refreshing UI, and do not claim someone is disconnected or absent without checking the actual connection/state.

## Working and handoff routine

1. At the start of a new/continued work session, read `AGENTS.md`, this handoff, and the relevant focused design note; inspect current `main` before relying on a chat recap.
2. The repository is known: `mwscrafts/study-bench`. Do not ask the owner which repo or ask them to paste a file that is already there.
3. Make the smallest coherent change in the existing architecture. Preserve unrelated work and current public access/hosting.
4. Commit complete related changes together to `main` according to the established workflow. A commit to `main` triggers Cloudflare deployment; say “deployment triggered” unless its completion was separately verified.
5. Do not add or run tests unless the owner asks or the active environment explicitly requires them. If tests/checks are run, report exactly which ones and the result. Static review is not a gameplay test.
6. Before ending or handing off a task, update this file with:
   - what was requested and what changed;
   - changed files and commit SHA;
   - checks actually performed and checks not performed;
   - current deployment/test state;
   - the next concrete owner or developer step.
7. Keep progress messages short and concrete. If the chat has no inherited recap, recover context from this file, commits, and source before asking the owner for help. Do not state that an action succeeded before verifying it.

## Current feature checks to preserve

The journal currently has eight catalog entries: field journal, controls, Composure, gathering, berries, tools/gear, regions, and Alvin. Composure is recorded at game start so a player can find it before losing any. Gathering, berries, gear, regions, and Alvin notes are added from their first related interaction. Entries save in the existing local save and do not interrupt play.

The current Rootdeep design is in `docs/rootdeep-design.md`; its recommended owner route checks entry/return, the distinct homes, Glowcap turn-in, optional iron branches/flooded boardwalk, and winch repair/travel. See that doc for detail.

**Most recent HUD correction:** the owner noticed a dusklily count before accepting Lyss's quest and a “Hatchet · Wood … · Flint …” hint before explicitly asking about the pickaxe recipe. The source had used `collected.size` as a fallback tracker and had used hatchet ownership as the crafting-hint condition. Both were removed. The tracker now stays on the general camp clue until quest acceptance. A saved `pickaxeRecipeLearned` boolean is set only by choosing Lyss's explicit “How do I make a pickaxe?” dialogue option. On the first gathering-tool request, Lyss gives the hatchet and invites the player to ask later; she does not disclose the recipe in that response. This is intentional progressive disclosure, not a change to crafting cost or materials. Live playthrough remains an owner/Ash check unless explicitly authorized for that specific test.

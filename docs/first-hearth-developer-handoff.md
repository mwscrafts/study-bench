# First Hearth developer handoff

Updated: 2026-11-12
Repository: `mwscrafts/study-bench`  
Live site: <https://love.ashquack.workers.dev/>  
Game: <https://love.ashquack.workers.dev/first-hearth/>

This is the durable continuity note for future Codex/dev conversations. Read it together with the root `AGENTS.md`. The repository is the source of truth; do not ask the owner to resend source files, identify the repository, or recreate a recap that can be recovered from these files and Git history.

## Current checkpoint

The newest recovery is on `main`, followed by the night-scaling and co-op shadow changes. The earlier UI changes from `6e8783d610a6b586c6992eb47b594ae4f1dbec01` and `3d648841ce12105895c00688fac93677f2daa7bd` remain.

The owner's 10-item review remains the roadmap: larger Continue Journey; wider movement arrows; coordinated sleep; co-op shadow fights; public Alvin cosmetics; fishing/pet counts; shorter nights; easier Easy Composure drain; remove Hugh's spoiler; ghost fade at dawn.

**Follow-up list:** The larger Continue Journey and wider mobile movement arrows are complete. Public Alvin cosmetic relay is fixed. Night count no longer scales shadow HP, patrol tempo, jump height, or chase speed. Cooperative shadow health is shared by region and public cycle; each player keeps personal Easy/Hard damage intake and only the defeating player receives the shadow drop. Coordinated public sleep is restored: active connected players must unanimously choose Sleep at the hut bed; the shared clock advances to dawn, and only voters are healed. Remaining owner-list items: fishing/pet counts, shorter nights, easier Easy Composure drain, remove Hugh's spoiler, and fade ghosts at dawn.

**Mobile UI follow-up:** Continue saved playtest is a larger high-contrast target, mobile movement buttons have wider spacing, and the in-dialogue **Keep exploring** action is now full-width, high-contrast, and at least 52 px tall. CSS cache query is v19. No live visual playtest was run.

**Shared sleep:** In Public, the Worker validates each vote against the hut bed, counts active connections, and advances the shared clock only when all active players have voted. The clock offset survives Worker hibernation; votes are removed when a player disconnects and cleared when the room empties. Client shadow cycles use the same adjusted clock. Solo sleep remains unchanged. Cache versions are `playtest.mjs?v=80` and `presence.mjs?v=4`. Static syntax checks passed for `playtest.mjs`, `presence.mjs`, and `hearth-times.mjs`; source anchors and cache versions were reviewed. No live two-player gameplay or deployment has been verified.

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

Cache versions in `dist/first-hearth/index.html` are currently `playtest.mjs?v=80` and `playtest.css?v=19`. The playtest imports `presence.mjs?v=4`. If either file changes, bump its query string. The site deploys from `main`; commits there trigger the configured Cloudflare Worker build/deploy.

**Gameplay verification status:** the journal, HUD gates, and Glowcap regrowth code were statically reviewed and the committed files were confirmed on `main`; Codex did not play the public game or verify the live deployment. The owner and Ash do live gameplay checks. Do not log into or play the public game to test a change without the owner's explicit authorization for that specific test. When reporting work, distinguish source review, automated checks, live gameplay, and deployment status.

### Public cosmetic relay correction

- The owner reported Ash could see the player's Alvin but not his bell cosmetic. Client source confirmed `playtest.mjs` included `bell` under `pose.alvin`, and remote `paintPeers()` drew it when received. The actual missing step was Worker `readPose()` in `worker/hearth-times.mjs`: it rebuilt a safe pose object while omitting both `alvin.bell` and top-level player `scarf`. This explains the symptom; the earlier base visibility fix was not cosmetic-ready by itself, and the client cosmetic was only partially wired.
- The fix adds strict boolean copies for both fields to the Worker allowlist. The existing pose payload and the two clients' rendering paths already support them. The next presence update carries the selected state; the owner should refresh both players and verify the bell and scarf visually in a two-player session.
- Worker patch commit `6e3b965e31ddffd45a1bd3c17bb58050b434db5d` is on `main`. Deployment and live relay behavior have not been verified; owner/Ash should refresh both clients and confirm each cosmetic in Public play.

### Field map and Alvin home checkpoint

- Code commit `b5e9f5db49fe7a229a1a306c7aa18ad308d72da8` is on `main`: `field-map.mjs?v=1`, `playtest.mjs?v=75`, `playtest.css?v=17`, and `index.html`. Save version 21 and the saved-footing whitelist both include the new record.
- A Map button beside Bag/Berry/Journal opens a schematic of discovered regions only. Visited links connect those regions, with the Rootdeep–Embervein tunnel link gated by `tunnelStage === 'open'`. The active node and its west/east pin, current named location, Rootdeep landing, and known routes from here help navigation. Interiors appear by name under their parent. New entries save in `discoveredRegions`; older saves infer from visited gates and saved current region. The map blocks controls while open; M and Escape close it.
- At the camp hut's Alvin bed, the player can pet him, let him stay, or bring him back. `alvinResting` persists. Resting Alvin remains in the hut, disappears from the trail and public pose, and does not follow, fight, jump at catnip, eat fish remotely, or consume his active fish growth time. The King altar requires him before the final sequence. The existing petting Composure gain remains.
- Static JavaScript syntax checks passed; an isolated map DOM check showed only two visited regions, one link, and current location, and an isolated bed action check verified both state transitions and pose updates. No live public gameplay or phone visual check was performed by Codex. Owner/Ash should check old-save discoveries, mobile Map controls, Alvin's absence and return in public, reload persistence, and the King altar prompt. Details in `docs/field-map-and-alvin.md`.

### Public clock and Composure correction checkpoint

- Owner reported that one Public Auto player saw day while Ash saw night, and Ash could fight ghosts while her Composure stayed at 100. Source traced two independent causes: `phaseClock` was loaded from each player's save and advanced only in that player's active frame, and `updateComposure` had a global `if (victory) return` even though ghosts can still appear in other regions after the King.
- Public Auto now computes `phaseClock` from the device wall clock modulo the existing 136-second cycle, on entry, while playing, and when toggling Public on. It continues through pause/dialogue/inventory and resumes from the same phase after reload; missed world-cycle boundaries advance personal `nightIndex`, trigger regrowth, and clear local nightly spawns. Solo retains its existing local, pausable clock and sleep-to-morning. Manual Sky modes still override visuals/ghost behavior locally, while the underlying public clock continues.
- Public bed rest heals without changing the shared sky or artificially adding a personal night; its dialogue says this explicitly. The King trial and completed King scene retain their intentional sky override.
- Composure's victory exemption now applies only in the completed King region. In camp and other ghost regions, proximity drain resumes after victory. This is a likely direct explanation for Ash's stuck meter, but the owner must verify her saved adventure in the live game.
- Code `adc13618eeabb76d286d8148f25224f95000ada9` is on `main`; entry `playtest.mjs?v=74`. Source parsed; isolated clock tests showed matching phases for separate instances and one regrowth advance on a cycle boundary; isolated Composure tests showed drain outside the King region after victory and exemption inside. Codex did not join the public game. Owner/Ash should both refresh, choose Public and Sky: Auto, compare the same sky over a cycle, then approach a ghost with a post-King character and watch Composure. Their ghosts are still client-local, and wall-clock sync assumes accurate device clocks; neither enemy state nor server time is authoritative.

### Special request-board reward checkpoint

- The camp board offers a one-time Camp gathering commission for five berries and two spare wood. After the Root Key, it also offers a one-time Lanternstead welcome commission for two Glowcaps and two spare wood. Neither is a required story quest. The existing repeatable Lyss, Barry, and Hugh token jobs and their original first-time extras remain unchanged.
- A special request appears on the HUD only after accepting it. Supplies are turned in at the board. The player then picks exactly one reward: a visible player trail scarf, a visible Alvin bell collar, a hanging star mobile in the camp hut and eventual village home, or the optional Glowcap garland recipe. The recipe unlocks a workbench craft costing one spare wood and one Glowcap; the crafted garland appears at both homes. These are cosmetic/home items with no main-path power gate.
- `special-rewards.mjs?v=1` defines the commissions and canvas overlays. `playtest.mjs` owns acceptance, supply consumption, pending choice, save validation, workbench craft, inventory labels, and rendering. The save's version is 20, and the footing version whitelist includes 20. `specialRewards` and `pendingSpecialReward` survive reloads. A commission is marked completed when the reward is actually chosen; pending choice prevents the supplies from being charged again.
- Code commit `94d508fcf864e5964c08d6db1773bddff0e272e8` is on `main`, entry `playtest.mjs?v=73` at that checkpoint. Static syntax parsing passed; a scripted isolated board scenario checked acceptance, insufficient supplies, hand-in, pending reward, selection, and no repeat offer. No public gameplay or Cloudflare deployment check was run. Owner/Ash should test the board and one reward visually on mobile, reload while a reward is pending, then check regular token requests still work. Exact steps: `docs/request-board-rewards.md`.

### Rootdeep checkpoint

- Restored the Rootdeep background canvas from `960 × 2460` to its native `1920 × 4920` resolution. The reduced canvas had one quarter of the pixels, making the entire region look soft when enlarged in the camera viewport. Git history identifies this as a prior memory-footprint change; it was unrelated to the entry freeze, so do not reduce the art again without diagnosing a demonstrated memory problem.
- The `deep-seal` interaction point was already on landing 8 at y≈4170. The drawn sealed door was incorrectly placed at y=4860 on the lower catch floor. The door art now anchors to the landmark; the catch floor is labelled **Bedrock Floor** so a fall below level 8 does not read as the chamber.
- Added cave-wall stone/crack detail and a built-up sealed doorway while keeping the chamber closed for the later story chapter. The eight landings and their feature plan remain as listed in `docs/rootdeep-design.md`.
- Current Rootdeep cache versions are `rootdeep.mjs?v=9` and `rootdeep-art.mjs?v=13`; their importers in `playtest.mjs` and `world-data.mjs` are aligned. Main entry uses `playtest.mjs?v=73`.
- Source review only; no live gameplay or browser visual check was performed by Codex. The owner/Ash should inspect the eighth landing and the overall visual sharpness after deployment. If the earlier freeze returns, investigate the code path separately instead of degrading scene assets.

### Rootdeep settler routines checkpoint

- Three household residents now have a local day-clock route on landing 4: Lantern Keeper, Stonecarver, Common Keeper. They walk from offset outdoor home starts to visible work props at dawn, work by day, gather around the common fire at dusk, walk home during early night, and appear inside their separate homes in late night. Dorrin stays at the forge and Bram stays at the guarded shaft.
- Route state is computed from the existing 136-second day cycle; no new save field or server presence state. `rootdeepSettlerRoutes` and `rootdeepSettlerState` live in `rootdeep.mjs`. `playtest.mjs` renders the sprites and applies the same positions to exterior interaction landmarks. It hides each interior sprite/landmark while the resident is outside. Manual Sky day/dusk/night/dawn previews the work/fire/home/outbound phase. Local clocks may disagree between public players.
- Dialogue handlers now react to independent side-branch lantern restoration, restored winch, tunnel stages after discovery, and an open cart. The Common Keeper's three-Glowcap quest remains available at the resident's current position; the quest and guard gating are unchanged.
- Current imports: `rootdeep.mjs?v=9`, `rootdeep-art.mjs?v=13`, `world-data.mjs?v=11`, entry `playtest.mjs?v=72`.
- Static checks: all four changed JavaScript modules passed syntax parsing; route values at representative dawn/day/dusk/night ticks matched the intended work/fire/home states. Git commit `626bf321985839d2a4f52ffa9e72bd92235be654` was advanced to `main`. No Codex live gameplay or visual/mobile check. Owner/Ash should compare manual Sky phases on landing 4, visit a home in daylight and night, and talk to residents after restoring a lantern, winch, and tunnel.

### Restorable dark branches checkpoint

- The west iron-gallery side ledge on level 5 and east shadow-root side ledge on level 7 now have visible dark pockets and cold lanterns. Each is a separate journal entry and costs one Glowcap to relight. The player must stand on the ledge to interact.
- The branch states save as `branchLanternsLit` independently of `glowcapLanternLit`, the Common Keeper's existing three-Glowcap quest. They do not consume a cap twice. Branch lights reduce shadow hit damage by half and nearby threat Composure drain to 40% within 205 world units; they do not remove shadows or protect the entire mine.
- The regular warm lamps by these two galleries moved toward the main landings, making the dark branches readable from those routes. Rootdeep's Glowcaps continue to regenerate after three nights.
- Rootdeep data/art imports are now `rootdeep.mjs?v=8` and `rootdeep-art.mjs?v=12`, with the playtest entry at `v=66`. Static source review only; the owner/Ash should visually verify lantern placement and the local shadow safety effect in the live game. Codex has not played the public world for this patch.
- Next project: make the collapsed tunnel and both minecart endpoints visible, then implement the staged sequence **goblins → Glowcap lighting → dwarven timber assessment/request → supports/excavation → working minecart**. Preserve the alternate route throughout and keep this tunnel lighting separate from these branch discoveries.

### Collapsed tunnel checkpoint

- Owner placement correction: **Rootdeep's far-left bedrock floor at y=4860**, below level eight, is the tunnel mouth. The Deep Seal remains on landing eight at x=465. Do not move the tunnel up onto that landing. Embervein's endpoint is at x≈4110 near the deep seam, and both blocked portals/carts are visible before completion.
- Two cave goblins guard the floor tunnel independent of night shadows; their defeats save across regions/reloads. Both must be cleared before two Glowcaps can light the passage. Only then does Dorrin identify four wood for timber support beams. `spareWood(tools)` is checked and four are deducted through `tools.woodDonated`. Once supports are built and his crew clears the excavation, both carts become a two-way route. Camp/Crownwood paths remain open.
- Stage and discovery save in `tunnelStage`/`tunnelSeen`; defeated IDs save in `defeatedTunnelGoblins`. Goblins are client-local gameplay enemies; public presence continues to share player positions, not enemy or project state. The earlier branch lanterns and Common Keeper have separate Glowcap spending and saved state.
- New art depicts a blocked masonry arch, rubble, old rails, unlit/relit sconces, support beams and carts at both endpoints, plus visible cave goblins. Continue using more detailed native-resolution region art. This patch adds route art within existing regions, not a new standalone region.
- Imports are `rootdeep.mjs?v=8`, `rootdeep-art.mjs?v=12`, `mine.mjs?v=16`, and `mine-art.mjs?v=06`, with playtest entry `v=67`. A syntax-only compile of the edited modules passed. No live visual/gameplay test was performed by Codex; the owner/Ash should check the stages and the bottom-floor placement.
- Next work from the owner's list: a visibly broken bridge in a different location from this tunnel; later the village home, Lyss's cabin, settler routines and request-board reward choices.

### Guard and quest acceptance checkpoint

- Owner found that the tunnel HUD tracked goblin kills/Glowcaps without accepting a quest. Bram, a helmeted dwarf, now stands on landing 8 by the ladder down to the bedrock floor. His dialogue warns that miners closed the shaft because corruption is spreading and cave goblins occupy the collapsed tunnel.
- A player must speak to Bram before descending. The level-8 ladder clamp, keyboard drop-through, touch pointer and accessible click paths, and a fall fallback enforce this. Speaking and accepting are separate saved flags: `tunnelGuardSpoken` opens warned exploration; `tunnelQuestAccepted` starts the tunnel tracker and unlocks spending two Glowcaps at the mouth. Declining permits exploration and goblin combat; kills already made persist and count when accepted.
- Older saves with bedrock-floor footing retain access, and stages already beyond lighting migrate as accepted. The tunnel tracker now requires acceptance; the unrelated Rootglass winch tracker also waits for Dorrin's quest acceptance. Empty Rootdeep quest text hides the tracker.
- Source syntax checked, no live playthrough by Codex. Owner should check: before speaking, ladder down and drop-through stop on level 8; after speaking and declining, descent works but no tunnel tracker/lighting; after accepting, the tracker appears and prior goblin kills count. Confirm the guard is visible beside the ladder and the two-cap lighting then proceeds normally.
- Current cache imports: `rootdeep.mjs?v=8`, `rootdeep-art.mjs?v=12`, `world-data.mjs?v=10`, and entry `playtest.mjs?v=71`.

### Hugh reunion checkpoint

- The tunnel payoff now includes Hugh's family. Once the Rootdeep-to-Embervein cart is used, `pendingTunnelReunion` persists until Hugh is spoken to; his next conversation takes priority over the request board and old lift/key lines. He recalls being locked outside the sealed Rootdeep shaft, fearing corruption killed his family, and seeing them alive when the cart reopened. Two Rootdeep family sprites stand by him after the tunnel opens.
- The response choice makes Hugh step off the stilts: `hughStiltsRevealed` saves, the full-body sprite height changes from 105 to 64 while its feet stay on the ground, a pair of stilts appears by his alcove, and his later dialogue reflects the reunion. Closing before the response keeps the reunion pending for the next conversation. This trigger occurs on travel from Rootdeep to the mine, not simply when the tunnel is repaired.
- Imports are `mine-art.mjs?v=06` and `world-data.mjs?v=10`, with playtest entry `v=69`. The edited JavaScript syntax was checked. No live gameplay/visual check was performed by Codex. Owner should travel via cart, speak to Hugh, choose the response, confirm he shrinks, reload, and speak again.

### Cove Bridge checkpoint

- A distinct broken bridge sits above Driftwood Cove on the beach. The two end stubs are always walkable; the missing middle is a real terrain ledge added only when repaired. The lower shore route remains open throughout, so this repair cannot trap the player. It is separate from Rootdeep's minecart tunnel.
- Inspect either end to discover it. Accepting the repair request starts a beach-only material tracker; the cost is 5 **spare** wood and 2 iron. Wood is deducted via `tools.woodDonated` and iron via `ironStock`. The saved `beachBridgeQuest` state controls the visual and terrain switch after reload. The bridge markers disappear when complete.
- The bridge artwork draws broken timber, dangling rope, end pilings, a missing deck and remnants below. Once repaired, it draws a detailed continuous plank deck, rivets, rails, rope and braces. The collision surface is `cove-bridge-span`; the pre-existing stub surfaces remain in both terrain variants. Its upper route runs roughly x=820–1740 above the cove. The lower shore path runs beneath it.
- See `docs/cove-bridge-design.md` for exact geometry, ownership and manual route. Imports are `beach.mjs?v=2`, `beach-art.mjs?v=2`, `world-data.mjs?v=10`, with playtest entry `v=70`. Syntax/source checks passed; Codex did not do a public gameplay/visual test.
- Next features from the owner's list: village home after the King, Lyss's tent-to-cabin upgrade, Rootdeep settler routines, and request-board choice rewards.

### Two home projects checkpoint

- The village now extends east of the existing arch to a new plot around x≈3170. The existing celebration house remains at x≈2020. After the player's King ending, the plot offers a separate build for **8 spare wood + 4 iron**. Completion draws a detailed exterior, unlocks the `village-home` interior, and allows three saved, freely toggleable decorations: Alvin's cushion, a tapestry, and a bookshelf.
- Lyss's existing tent around x≈1960 in Alder Camp offers a separate build for **6 spare wood + 2 iron**. Completion rebuilds the camp background with her log cabin, opens a distinct `lyss-cabin` interior, and lets the player place/remove a herb shelf, woven rug and warm lantern. Lyss has a one-time thank-you dialogue after completion.
- Each site has an `unoffered → accepted → complete` save state and a material tracker only after acceptance in its own region. Wood uses `spareWood(tools)` and spends through `tools.woodDonated`; iron spends from `ironStock`. Saved sets `villageHomeDecor` and `lyssCabinDecor` drive the visible furnishings. Neither build advances the other.
- `home-projects.mjs` owns interior terrain, landmarks and costs; `home-projects-art.mjs` draws the village exterior and two interiors/decor overlays. `village.mjs` extends the road, `camp-art.mjs` swaps tent for cabin, `world-data.mjs` registers distinct region/gate IDs, and `playtest.mjs` owns progress and saves. See `docs/home-projects-design.md`.
- Cache imports: `terrain.mjs?v=16`, `camp-art.mjs?v=14`, `village.mjs?v=13`, `home-projects.mjs?v=1`, `home-projects-art.mjs?v=1`, `world-data.mjs?v=10`, playtest entry `v=71`. Edited module syntax checked; no live gameplay/visual test by Codex.
- Next owner-list features: Rootdeep settlers' day routines and repair-aware dialogue; special request-board reward choices with player/Alvin cosmetics, house decor or recipes.

### Suggested owner check for this checkpoint

In the village after the King, follow the east path beyond the arch, accept the new plot project, build with 8 wood/4 iron, enter, toggle each decoration, leave and reload. At Alder Camp, inspect Lyss's tent, accept/build with 6 wood/2 iron, confirm the tent changes to a cabin, enter and furnish it, then talk to Lyss. Check both interiors exit to the right exterior and that one project does not spend or finish the other.

At the beach, inspect the west or east broken bridge and accept the repair. Try crossing the missing middle before paying; it should remain absent and the lower shore should be usable. Bring 5 spare wood and 2 iron, repair it, walk across from both sides, reload while standing on the span, and confirm the path and material spend persist.

For the tunnel, descend past level eight to the bedrock floor and inspect the far-left blockage. Defeat both goblins, light it with two Glowcaps, talk to Dorrin, deliver four spare wood, then ride in both directions. Before each step, check the next stage remains locked; inspect the Embervein endpoint early and confirm the existing camp route remains open. Compare the new portal art in both areas.

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

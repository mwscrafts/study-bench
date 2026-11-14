# First Hearth developer handoff

Updated: 2026-11-14
Repository: `mwscrafts/study-bench`  
Live site: <https://love.ashquack.workers.dev/>  
Game: <https://love.ashquack.workers.dev/first-hearth/>

This is the durable continuity note for future Codex/dev conversations. Read it together with the root `AGENTS.md`. The repository is the source of truth; do not ask the owner to resend source files, identify the repository, or recreate a recap that can be recovered from these files and Git history.

## Current checkpoint

### Beach graphical rework

- The approved complete beach map is `dist/first-hearth/beach-map.webp` (1920 × 445, drawn over world coordinates 3840 × 890). It includes the distant coast and playable foreground. The earlier concept-as-backdrop overlay was removed.
- Owner screenshots revealed that the initial terrain correction (`45c0329`) still placed the western Salt Pines player on the fence railing and left the Tide Arch lookout a little low. Using feature matching, the four phone screenshots were mapped back to world coordinates, and the collision lines were overlaid on the screenshots. Commit `239896a585ff89ee625f60f5ac8ca7b3bb4c1bd8` lowers the western floor onto the dirt path and raises the Tide Arch lookout ledge onto its visible deck. The existing surface IDs, routes, landmark IDs, fishing progression, rowboat ownership/save state, and casting effects are unchanged. The owner later clarified that photo 4 was an art transition: boards should visibly extend from shore into the dock, with no floor change.
- Current cache imports: `beach.mjs?v=9`, `beach-art.mjs?v=16`, `world-data.mjs?v=24`, entry `playtest.mjs?v=103`. The concept uses a fixed sunset sky; night tint applies, but phase-specific scenery is not visible beneath the full-scene art.
- The first two screenshot overlays showed the old Salt Pines floor following the railing about 40–50 screen pixels above the path. The corrected line follows the path in both frames. The third screenshot overlay showed the Tide Arch ledge a little below the deck; the corrected line follows the deck. The owner’s before/after screenshots showed the landing shape was close, but its smooth tan boards did not match the dock’s painted texture. Commit `8b72b5626ad5f3b2d61169341fbf120025c7801b` now draws each landing plank from clear strips of the existing dock texture, with subtle edge shading and nail heads. It preserves the board layout and leaves beach terrain unchanged. The updated source has not yet had a live mobile visual check.
- No syntax, gameplay, or live deployment check was performed for the texture revision. The commit to `main` triggered the configured Cloudflare deployment; deployment completion and mobile appearance remain unverified.

### Regional lodestone artwork

- The owner approved a shared angular rune with coastal tideglass, forest roots and moss, and dwarven copper, iron, and violet mineral details. The transparent game spritesheet is `dist/first-hearth/lodestones.webp`. `playtest.mjs` crops its three columns and maps them to the existing `lodestone-shore`, `lodestone-canopy`, and `lodestone-mine` landmarks. The sites, interactions, activation saves, and progression remain the same.
- Code and artwork commit `f244195b04575673b9e83a402df28be9219d1dc5` is on `main`. Cache versions are `canvas-art.mjs?v=4` and entry `playtest.mjs?v=96`. The generated sprites are loaded during game startup and drawn with their regional activation glows.
- No syntax, gameplay, or live deployment check was performed. The `main` commit triggered the configured Cloudflare deployment, but completion and mobile appearance remain unverified. The owner’s next visual check is to inspect all three stones. The rowboat art update is recorded below.

### Save-safe journey start

- The owner reported that Continue saved playtest sat beside Enter Alder Camp, making a new start easy to tap accidentally. With an existing save, the start screen now places **Continue Journey** first, then explains that starting a new journey overwrites the save on this device. A divider and **Start a new journey** heading separate the character, difficulty, and name choices below.
- The continue button still loads the existing save; the new journey action still starts a fresh adventure and saves to the existing device key. Cache versions are `playtest.css?v=20` and entry `playtest.mjs?v=97`. Code commit `1fa1bfdbd20f4f3d60e176234888d82db8197ec3` is on `main`.
- No syntax, gameplay, or live deployment check was performed. The `main` commit triggered the configured Cloudflare deployment; completion and mobile appearance are unverified. The owner should check that Continue appears first, the warning text is readable, and the new journey controls are clearly separated. The rowboat art update is recorded below.

### Startup screen transition

- The owner reported that the default new-journey form appeared briefly before JavaScript revealed the saved-journey layout. The start overlay is now hidden in the initial HTML; a neutral “Preparing Alder Camp…” card is shown while boot reads the device save and loads sprites.
- Once save state and character images are ready, the correct start screen is revealed. This preserves the existing Continue Journey first, overwrite warning, and separated new-journey controls. If loading fails, the startup card shows the error instead of exposing a misleading or incomplete start form.
- Cache versions are `playtest.css?v=22` and entry `playtest.mjs?v=100`. Code commit `48d371923237286bd616c77b88c6958b6553fbf4` is on `main`.
- Source was reviewed only. No syntax check or live mobile visual check was performed; gameplay and save behavior were not changed. The `main` commit triggers the configured Cloudflare deployment, but completion and the first-paint transition remain unverified.

### Mobile touch-control reach

- The owner asked for the bottom-left movement controls and bottom-right Wave / Interact / Jump controls to sit slightly farther from the phone corners for comfort, while keeping the rest of the HUD intact.
- In landscape touch layouts, `.game-bottom` now adds 14 px beyond the previous safe-area-aware side inset, shifting the movement group right and the action group left. Button sizes, gaps, and center inventory placement are unchanged. The stylesheet cache version in `index.html` is `playtest.css?v=21`.
- Source was reviewed and the change is limited to that landscape bottom-bar inset plus the stylesheet cache bump. Code commit `77eaef909981f1e82aa4c95698eec26187491581` is on `main`. No syntax check, live mobile visual check, gameplay check, or deployment completion check was performed. The commit to `main` triggers the configured Cloudflare deployment; the owner should confirm the new control reach on a phone.
- The rowboat art update is recorded below.

### Rowboat graphic: classic clinker skiff

- After comparing three concept directions, the owner selected the classic clinker skiff for the Tide Arch rowboat.
- The first implementation used hand-drawn vector shapes, but the owner flagged that its older flat look did not fit Driftwood Cove’s painterly background or the detailed lodestone sprites. The revised, boat-only transparent PNG is `dist/first-hearth/tide-arch-rowboat.png` (1994 × 789). It has a warm, hand-painted clinker hull with visible plank grain and seams, two benches, and paired oars, using the approved screenshot and lodestone sprite as style references.
- `playtest.mjs` loads and crops the PNG through the existing `loadImage` / `spriteBounds` pipeline; `paintRowboat()` draws it at the existing Tide Arch position. The build/unlock behavior and fishing state are unchanged.
- Cache versions at the time of sprite integration were `beach-art.mjs?v=13` and entry `playtest.mjs?v=99`. Code commit `9b31061401aa9f2194a65f03b136ec24324898db` is on `main`.
- Source and image dimensions were reviewed. No syntax check, live mobile visual check, gameplay check, or deployment completion check was performed. The commit to `main` triggers the configured Cloudflare deployment; the owner should verify the boat in context at Tide Arch.
- The next requested work is the owner’s in-game visual check of the rowboat.

### Tide Arch screenshot alignment

- In the owner’s first screenshot, the player’s standing point maps to approximately world x=3380 on the raised lookout. The shore lodestone now uses x=3380; its base is derived from that ledge surface (y≈504), keeping it planted on the slope.
- In the second screenshot, the rowboat hull floated above the shoreline. It remains at x=3725, but its draw baseline now comes from the sand surface at that x (y≈606.4), lowering it about 21 world pixels.
- The boat now has its own `rowboat` landmark and interaction target at the boat. `tide-arch` remains at x=3525 for the lookout dialogue. This moves the boat’s prompt toward the boat without changing its level-10 unlock, 8-wood build cost, save state, or offshore fishing.
- At the time of the alignment patch, beach imports were v8/v14, world-data v22, and entry playtest v101. The offshore scene version update is recorded in the current checkpoint below.
- Screenshot and source coordinates were reviewed. No syntax check, live gameplay check, or deployment completion check was performed. The owner should verify the lodestone footing, boat waterline, and separate boat interaction in-game.

### Rowboat edge bounds correction

- The owner reported that the player could walk beyond both visible hull edges and appear suspended. The rowboat movement limits were wider than the drawn skiff. Commit `1f91d3749b762df601000d83c50be31bc3584377` narrows the horizontal stop range to x=720–1200; boat art, deck height, terrain surface, and interactions are unchanged.
- Source and cache references were checked. No gameplay or live mobile check was performed; the owner should verify both boat edges in play.

### Open Sea background reuse

- The owner asked to reuse Sandy Cove’s existing art while keeping its shore and dock out of Open Sea. The existing `beach-map.webp` is a complete scene, so `rowboat-art.mjs` now draws only its upper sky and distant horizon; the sea below uses a color sampled from that same asset. The skiff sprite, draw position, deck height, terrain, and collision are unchanged.
- Code commit `b38b065c6e4a6ed766e9149c91b58ad0b776535b` is on `main`; cache versions are `rowboat-art.mjs?v=2`, `world-data.mjs?v=25`, and entry `playtest.mjs?v=109`.
- Static source review only. The live mobile view and boat-to-water appearance have not been checked; the owner should verify the result in-game.

### King’s Bridge, fishing levels, and rowboat

- Replaced the ineffective optional Cove Bridge with the Crownwood bridge that gates access to the King. The overlook has a 380-pixel broken gap; movement is blocked across it while unrepaired, so jumping cannot skip the bridge. The lower trail to Rootdeep stays open. Repair costs 5 spare wood and 2 iron.
- Existing Cove Bridge saves migrate: an accepted repair stays accepted, a completed repair transfers to the King’s Bridge, and saves that already reached the King retain their access. Old `overlook` footing is mapped to the new bridge surfaces.
- Fishing earns 1 saved XP per completed cast. The next level costs 3 XP at level 1, then each level costs 1 XP more (4 through 11); level 10 takes 63 total casts from a new save. Level 10 unlocks a Tide Arch rowboat project costing 8 spare wood. Built boats appear on the beach and enable offshore fishing for larger catches. Existing cast totals seed XP for old saves.
- Cache versions at the time of the fishing/rowboat release: `crownwood.mjs?v=15`, `crownwood-art.mjs?v=16`, `beach.mjs?v=4`, `beach-art.mjs?v=5`, `world-data.mjs?v=15`, and entry `playtest.mjs?v=88`.
- Feature source commit: `8efcef5`; history integration with the current `origin/main`: merge commit `81657df`.
- Fishing curve correction: source commit `3be8169` makes each new level cost 1 XP more than the previous one, for 63 casts total to level 10. Existing saved XP and rowboat ownership are preserved; only the level mapping and displayed progress changed. Syntax and whitespace checks passed. No public playtest or live deployment check was performed.
- Startup failure fix (source commit `9f61246`): the bridge update removed the old Crownwood overlook surface but left one shadow patrol referring to it, which stopped `playtest.mjs` before `boot()` and left the start button on “Loading camp…”. The patrol now stays on the west bank of the broken bridge; the bridge gap and repair gate are unchanged. JavaScript syntax, full module import resolution, and whitespace checks passed. No gameplay changes beyond the startup repair; live browser verification remains pending.
- JavaScript syntax checks passed for all changed game modules and `git diff --check` passed. No live gameplay, mobile visual review, or public playtest was performed. A push to `main` triggers Cloudflare deployment; completion has not been verified. The owner and Ash should verify the new bridge gate, resource spend, old-save migration, level 10 unlock, rowboat persistence, and offshore catches.

### Lantern Village art and Barry's home

- Rebuilt Lantern Village's background and residents with layered cottages, timber/stone detail, faces, street lamps, planting, cobbles, and a more finished eastern arch. The celebration house now has a detailed hall interior with guests, a feast table, cake, wine goblets, and warm lighting. Route coordinates and interaction landmarks remain in `village.mjs`; drawing lives in `village-art.mjs`.
- Rootdeep's Dorrin and Stonecarver appear as visiting dwarves in the village once the Root Key opens Rootdeep; the scene is drawn into the village background on region entry. No quest or multiplayer state is shared by this appearance.
- Added Barry's buildable workshop home beside his existing Crownwood location. It costs 10 spare wood and 4 iron, saves through `barryHomeQuest`, has a separate `barry-home` room/exit, and does not replace Barry's existing interaction or bridge route.
- Versioned imports are aligned: `village.mjs?v=14`, `village-art.mjs?v=1`, `home-projects.mjs?v=2`, `home-projects-art.mjs?v=2`, `world-data.mjs?v=13`, `field-map.mjs?v=2`, and `playtest.mjs?v=84`; entry `index.html` uses `playtest.mjs?v=84`.
- Local source checkpoint: `c718690`; the publishable copy is in GitHub PR #2. JavaScript syntax checks and `git diff --check` passed. No public gameplay or mobile visual review has been performed. The owner and Ash should review the visuals and Barry’s construction flow in-game.

### Canvas helper cleanup (local, not published)

- Moved the state-independent oval ground shadow to `canvas-art.mjs` (`paintShadow`), camp firelight drawing to `camp-art.mjs`, and Barry plus Rootdeep entrance lock drawing to `crownwood-art.mjs`. `playtest.mjs` still chooses their visibility and placement and owns scene composition/draw order, as directed by `AGENTS.md`.
- Peer pose smoothing and departed-peer expiration/UI updates remain coupled to `paintPeers()`; the time label remains a DOM update in `paint()`. Neither was moved.
- Cache versions: `camp-art.mjs?v=15`, `crownwood-art.mjs?v=15`, `canvas-art.mjs?v=3`, `rootdeep-art.mjs?v=14`, `rootdeep-home-art.mjs?v=2`, `rootdeep-home.mjs?v=2`, `world-data.mjs?v=12`, and `playtest.mjs?v=80`; importers are aligned. Checked JavaScript syntax, art-module imports, and `git diff --check`; no live gameplay/browser review or deployment was performed. No commit was made.

The newest recovery is on `main`, followed by the night-scaling and co-op shadow changes. The earlier UI changes from `6e8783d610a6b586c6992eb47b594ae4f1dbec01` and `3d648841ce12105895c00688fac93677f2daa7bd` remain.

The owner's 10-item review remains the roadmap: larger Continue Journey; wider movement arrows; coordinated sleep; co-op shadow fights; public Alvin cosmetics; fishing/pet counts; shorter nights; easier Easy Composure drain; remove Hugh's spoiler; ghost fade at dawn.

**Follow-up list:** The larger Continue Journey and wider mobile movement arrows are complete. Public Alvin cosmetic relay is fixed. Night count no longer scales shadow HP, patrol tempo, jump height, or chase speed. Cooperative shadow health is shared by region and public cycle; each player keeps personal Easy/Hard damage intake and only the defeating player receives the shadow drop. Coordinated public sleep is restored: active connected players must unanimously choose Sleep at the hut bed; the shared clock advances to dawn, and only voters are healed. The requested batch is implemented: the Field Journal saves/displays Lantern Dock cast and Alvin pet counts; nights are shorter than days in the 136-second cycle (night visuals run from phase 60 to 106; ghosts spawn from 70 to 96, then fade until 106); Easy Composure drain is 40% lower, while Hard is unchanged. Hugh's minecart spoiler line was removed.

**Mobile UI follow-up:** Continue saved playtest is a larger high-contrast target, mobile movement buttons have wider spacing, and the in-dialogue **Keep exploring** action is now full-width, high-contrast, and at least 52 px tall. CSS cache query is v19. No live visual playtest was run.

**Shared sleep:** In Public, the Worker validates each vote against the hut bed, counts active connections, and advances the shared clock only when all active players have voted. The clock offset survives Worker hibernation; votes are removed when a player disconnects and cleared when the room empties. Client shadow cycles use the same adjusted clock. Solo sleep remains unchanged. Cache versions are `playtest.mjs?v=83`, `presence.mjs?v=4`, and `mine-art.mjs?v=07`. Static syntax checks passed for `playtest.mjs`, `presence.mjs`, and `hearth-times.mjs`; source anchors and cache versions were reviewed. No live two-player gameplay or deployment has been verified.

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

Cache versions in `dist/first-hearth/index.html` are currently `playtest.mjs?v=86` and `playtest.css?v=19`. The playtest imports `presence.mjs?v=4` and `mine-art.mjs?v=07`. Bump the relevant query string when an imported module changes. The site deploys from `main`; commits there trigger the configured Cloudflare Worker build/deploy.

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

- Owner placement correction: **Rootdeep's far-left bedrock floor at y=4860**, below level eight, is the tunnel mouth. The Deep Seal remains on landing eight at x=465. Do not move the tunnel up onto that landing. Embervein's endpoint is at x≈4110 near the deep seam. Hugh's side remains a collapsed tunnel without a cart or interaction landmark until the route opens.
- Two cave goblins guard the floor tunnel independent of night shadows; their defeats save across regions/reloads. Both must be cleared before two Glowcaps can light the passage. Only then does Dorrin identify four wood for timber support beams. `spareWood(tools)` is checked and four are deducted through `tools.woodDonated`. Once supports are built and his crew clears the excavation, both carts become a two-way route. Camp/Crownwood paths remain open.
- Stage and discovery save in `tunnelStage`/`tunnelSeen`; defeated IDs save in `defeatedTunnelGoblins`. Goblins are client-local gameplay enemies; public presence continues to share player positions, not enemy or project state. The earlier branch lanterns and Common Keeper have separate Glowcap spending and saved state.
- New art depicts the blocked masonry arch, rubble, old rails, unlit/relit sconces, support beams, and cave goblins. The Hugh-side cart and interaction landmark appear only after the route opens. Continue using more detailed native-resolution region art. This patch adds route art within existing regions, not a new standalone region.
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

### Former Cove Bridge (removed)

- The upper route across Driftwood Cove did not create enough value: the shore remained open and the repair unlocked no new area or meaningful shortcut. Its beach landmarks, terrain, and artwork were removed.
- Old `beachBridgeQuest` saves migrate into `kingBridgeQuest` so prior accepted/completed progress is preserved. Current geometry and checks are in `docs/king-bridge-design.md`.

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


## Beach render regression repair — 2026-11-13

The owner reported the Tide Arch scene rendering only its procedural horizon/water, with the beach art, character, lodestone, and boat absent. The rowboat placement patch changed `paintRowboat` to use `ROWBOAT_X` and `ROWBOAT_Y` but did not import those names in `beach-art.mjs`; invoking the draw function raised a `ReferenceError` and interrupted the beach paint pass.

Fixed by importing both constants from `beach.mjs?v=8`. Bumped the beach-art module references to v15, world-data to v23, and playtest entry to v102 for cache invalidation. The requested lodestone and boat coordinates and the dedicated rowboat interaction target remain in place.

Changed files: `dist/first-hearth/beach-art.mjs`, `world-data.mjs`, `playtest.mjs`, and `index.html`. Repair commits on `main`: `63fe81ba6fd6eec2b641a7e585e0aa43638f5bd6`, `1453273b47b0cfb03c1f827e218d87b7c1e50f07`, `a22ee943ae461d9cc3392b70b9ee380ac63373fa`, and `822d11916c31b33ab0e4279970b6144029cdbe3d`. Static source review confirmed the missing imports are present and cache versions are aligned. No tests or live gameplay check were run. The final commit to `main` triggered deployment; completion was not checked. Next step: owner refreshes Tide Arch after deployment and confirms the scene renders and placements still line up.


## Offshore rowboat scene — 2026-11-13

The owner asked for boarding the Tide Arch rowboat to enter a real offshore scene. On the feature branch `codex/offshore-rowboat-scene`, the boat boards into its own saved region, with separate interact targets to fish, sit in a small chair, and return to Tide Arch. The view reuses the beach horizon and adds slowly drifting clouds, passing gulls, shifting water, and a gentle skiff bob. A quiet synthesized surf track and occasional gull calls play only in the boat region.

The level-10 build now costs exactly 20 Driftwood, 5 spare wood, and 2 iron. Offshore casts keep the existing two-fish shoal behavior and 1-in-1,000 Godslayer roll; there is also a 1-in-100 Rootglass bonus catch, counted toward Dorrin’s winch. Existing built boats and their saves remain valid.

Changed files: `beach.mjs`, `beach-art.mjs`, `rowboat.mjs`, `rowboat-art.mjs`, `rowboat-ambience.mjs`, `world-data.mjs`, `field-map.mjs`, `playtest.mjs`, `index.html`, and `AGENTS.md`. PR #3 was squash merged to `main` as `fc1f6b23bb101168bb772ab9b302b4067102d6fb`. Cache versions on main: beach v9, beach-art v16, world-data v24, field-map v3, entry playtest v103.

PR #3 was squash merged into `main` as `fc1f6b23bb101168bb772ab9b302b4067102d6fb`. No tests, syntax checks, or live gameplay checks were run. The merge triggered the configured deployment; completion was not checked.


## Offshore chair prompt and surf audibility — 2026-11-13

The owner reported the rowboat-ready prompt appearing after arriving offshore and sitting in the chair, and asked for louder surf. The first follow-up added a region guard to the rowboat builder dialogue and raised the surf swell envelope about threefold while leaving gull calls unchanged. `playtest.mjs` imports `rowboat-ambience.mjs?v=2` and was bumped to entry v104.

The owner’s next screenshot clarified that the blank CAMP KEEPSAKE window appears on the chair interaction itself. The cause was `interact()` opening a generic dialogue before calling the chair’s sit/stand handler, which does not populate a dialogue. The chair now routes directly to its handler before the generic dialogue path, so sitting or standing opens no window. PR #5 was squash merged to `main` as `cfc468674450bc3521368166b3415341bcc33e1c`; entry is now `playtest.mjs?v=105`.

PR #4 and PR #5 merges triggered the configured deployment. Static source and diff review only; no tests, syntax checks, live gameplay checks, or deployment completion check were run. The owner should verify the chair interaction and surf level on a phone.

## Iron helmet position correction — 2026-11-13

The owner clarified that the original helmet graphic was acceptable and only its placement needed correction. The faceted replacement art introduced in PR #6 was unrequested and has been removed. The original dome-and-band drawing is restored and moved from across the face up onto the crown. It follows the avatar's facing, bob, tilt, and seated scale in both local and multiplayer rendering. The temporary `iron-helmet.png` asset is removed; current cache versions are `canvas-art.mjs?v=6` and entry `playtest.mjs?v=107`.

PR #7 was squash merged to `main` as `6e592bdea5b461436d65a4847149ab4fa92df144`, triggering the configured deployment. Static source/diff review only; no tests, syntax checks, live gameplay checks, or deployment completion check were run. The owner should confirm the original helmet graphic now sits correctly on both character choices.


## Reuse the Sandy Cove sea background offshore — 2026-11-13

The owner asked to use the existing Sandy Cove background art in Open Sea. Replaced the cropped dock-scene plus sampled-blue fill with the existing background-only **First Hearth: Teal Sea Horizons** artwork, exported to WebP for the game. The full image now fills the rowboat view; its existing cloud and gull motion remains. No boat sprite, player, terrain, deck bounds, floor, or collision files were changed.

Changed files: `dist/first-hearth/rowboat-sea-background.webp`, `rowboat-art.mjs`, `world-data.mjs`, `playtest.mjs`, `index.html`, and this handoff. Final code and repository-root restoration commit on `main`: `37ef762d88ad9ede12ab09181aded1419b7c071e`. Source review confirmed the bad crop is gone and the new image loads from the published asset path. No tests or in-game Open Sea visual check were performed. The commit to `main` triggered deployment; the asset URL is reachable, but deployment completion and boat-waterline alignment were not checked.


## Fishing cast direction and distance — 2026-11-13

The owner asked for the net throw to travel left and twice as far. The beach and offshore cast animation now draws its arc, line endpoint, and splash 144 pixels left of the player (twice the previous 72-pixel endpoint). Catch timing and fishing outcomes are unchanged.

Changed files: `dist/first-hearth/beach-art.mjs`, `world-data.mjs`, `playtest.mjs`, `index.html`, and this handoff. Source commit: `8763bd349c463c5ba6a58f6a5cfe84a19109217d`. Source diff review only; no tests or gameplay check were run. A commit to `main` triggers the configured deployment; completion is not yet verified.


## King’s Bridge landing continuity — 2026-11-13

The owner reported intermittent fall-through at the repaired King’s Bridge, especially when returning from the King’s Grounds. The repaired overlook now uses one continuous collision surface from the west ledge, across the bridge span, and onto the east ledge. Legacy footing IDs map to that route on saved-game load. Bridge artwork, costs, and the unrepaired gate remain unchanged.

Changed files: `dist/first-hearth/crownwood.mjs`, `world-data.mjs`, `playtest.mjs`, `index.html`, and this handoff. Source commit: `533aafc3d0ccae789f10603e24943c05adb8cd41`. Static geometry/source review only; no tests or live traversal were run. The commit to `main` triggers the configured deployment; completion is not verified.


## Root-wisp night spectre — 2026-11-13

The owner selected the middle root-wisp concept and asked for it to be implemented as the night spectre. The selected central design was isolated into `dist/first-hearth/night-root-wisp.webp`. The existing night-creature spawn, movement, collision, combat, and progression logic remain unchanged; `playtest.mjs` loads the sprite and passes it to the existing `paintCrownwoodShadow` draw path in `crownwood-art.mjs`, which now renders the drifting root-wisp. The separate low-Composure pressure wraith is unchanged.

Changed files: `dist/first-hearth/night-root-wisp.webp`, `crownwood-art.mjs`, `playtest.mjs`, `index.html`, and this handoff. Cache versions: Crownwood art v17; playtest entry v113. Source commit: `f11a0e581dfbb7c22ed4749ee0be6662e87224fa`.

Static source review only; no tests were run, and the live game was not opened or played. The final commit to `main` triggers the configured deployment; deployment completion remains unverified.

## Root-wisp facing correction — 2026-11-13

The owner reported that the newly implemented root-wisp always faced left, so it showed its back when approaching from the player's right. Night-creature drawing now mirrors the sprite according to the player's horizontal side. The same facing rule applies to Crownwood's King-trial shadows. Spawn timing, movement, collision, damage, and rewards are unchanged.

Changed files: `dist/first-hearth/crownwood-art.mjs`, `playtest.mjs`, `index.html`, and this handoff. Cache versions: Crownwood art v18; playtest entry v114. Source commit: `0959d6c2d3e6c409528787d375a1470aa45cedf5`.

Static source review only; no tests or live gameplay check were run. The live game was not opened. The commit to `main` triggers the configured deployment; completion remains unverified.

## Hidden First Hearth cave rework — 2026-11-13

The owner approved the complete left-hand cave concept. The region now uses the full scene: teal cavern walls, waterfalls, crown alcove, both side entrances, ember shrine, and sloped stone floor. Animated water streaks and ember/latch lighting remain as subtle details. The old water-only treatment was rolled back before this implementation.

The art asset is `dist/first-hearth/hidden-hearth-background.webp` (2880 × 900), fitted to the existing cave floor contour. `hearth.mjs` and its terrain/collision points, ledge, landmark IDs, and interactions are unchanged. Artwork rendering is in `hearth-art.mjs`. Cache references are `hearth-art.mjs?v=1`, `world-data.mjs?v=29`, and entry `playtest.mjs?v=115`.

The scene was rendered locally and visually checked against the exact authored floor line. No tests were run. The live game was not opened or played, as required by the owner’s playtest rule. The commit to `main` triggers the configured Cloudflare deployment; deployment completion and the live appearance remain unverified.

Code commit: `9f882cf25ffd5d1d19c8902de32ee5ddf76c74cf`.


## Hidden First Hearth walking surface alignment — 2026-11-13

The owner authorized an Admin Ring teleport and an end-to-end live walk to inspect the new cave floor. The approved background image was already correct and remains untouched. The live walk showed the collision floor sitting roughly 30–60 world pixels above the painted shelf through the central chamber; the east exit was already close. Adjusted only the cave's continuous `hearth-floor` points to follow the existing painted path. The ledge, background, movement engine, player save, and interactions were not changed.

Cache references are `hearth.mjs?v=11`, `world-data.mjs?v=30`, and entry `playtest.mjs?v=116`. A visual overlay of the revised floor points against the existing background shows the central path following the painted shelf. The first post-deployment check showed the central avatar still above the shelf, so the floor profile was lowered again to the visible shelf edge. After the second correction, the live walk covered the west slope and entrance, the central chamber, and the east passage/return notch. The player’s feet tracked the existing painted ledge closely across those sections; the owner confirmed the result looked good. The cave artwork remains unchanged.


## Public-facing language, Admin Ring arrival, and shadow recovery — 2026-11-13

- Removed the Playtest 14 edition label and public-facing playtest wording from the game page and admin panel. Internal filenames and save flags remain for compatibility; admin tools and score eligibility still behave as before.
- Added Open Sea to the Admin Ring's regional destinations. It places the player at x=960 on the existing `rowboat-deck` surface.
- Defeating a field shadow restores up to 5 Composure, capped at 100. The reward applies to a shadow defeated by the player or Alvin, and uses the winner-only shared shadow event in Public. Defeating each Hollow King trial shadow also restores Composure.
- Changed files: `dist/first-hearth/index.html`, `dist/first-hearth/playtest.mjs`, and this handoff. The entry cache is now `playtest.mjs?v=118`.
- Source was reviewed for the updated interface strings, destination footing, and each shadow defeat path. No tests or new live gameplay check were run for this batch. The push to `main` triggers the configured deployment; completion is unverified.
- Code commit: this checkpoint commit, recorded in Git history.


## Public in-game chat — 2026-11-14

- Added a chat button and compact in-game chat window. The window keeps the latest 60 messages for the current browser session, including while the player changes regions; it does not save chat across a page reload.
- Public chat messages are relayed to connected players across the world. A message bubble appears over its sender only for players currently in the same region and remains for nine seconds.
- Chat uses the existing Public presence connection. Solo mode can show the session history but cannot send. Message text is displayed literally. There is no send rate limit; individual messages are capped at 180 characters.
- Changed files: `dist/first-hearth/index.html`, `dist/first-hearth/playtest.css`, `dist/first-hearth/playtest.mjs`, `dist/first-hearth/presence.mjs`, `worker/hearth-times.mjs`, and this handoff. Cache references are `playtest.css?v=23`, `presence.mjs?v=5`, and entry `playtest.mjs?v=119`.
- Reviewed the source changes and cache references. No tests were run and the public game was not opened. Deployment completion and live appearance are unverified.
- Code commit: `f2451266c71debcb536efae1b936130a52b54c83`.
- Next check: the owner and Ash can verify sending, session history, and same-region bubbles on their phones.

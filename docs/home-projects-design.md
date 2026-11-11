# Village home and Lyss cabin maintainer notes

## Two separate builds

| Project | Location | Unlock | Material cost | Interior |
| --- | --- | --- | --- | --- |
| Player home | Village east of the old arch, plot x≈3170 | Player's King ending | 8 spare wood, 4 iron | `village-home` |
| Lyss cabin | Existing camp tent x≈1960 | Available when encountered | 6 spare wood, 2 iron | `lyss-cabin` |

- The village's celebration house remains separate. Its existing door and guests are not repurposed. `village.mjs` extends the road to x=3600 with an east plot; the player house exterior at x≈3190 appears only after building. The old eastern-path interaction now points toward the plot.
- Lyss's tent at x≈1960 is replaced in `buildCampArt(lyssCabinBuilt)` with a detailed log cabin. On load, a completed cabin rebuilds the cached camp background before entering; on completion, the current camp background is rebuilt immediately. Lyss's quest dialogue gets a one-time thank-you after completion.
- Each project uses a saved `unoffered/accepted/complete` state (`villageHomeQuest`, `lyssCabinQuest`). The HUD tracker appears only after acceptance in the relevant exterior region. Costs use `spareWood(tools)` and `tools.woodDonated` for renewable wood, and `ironStock` for iron.

## Interiors and decor

- `home-projects.mjs` defines two terrain/floor and landmark sets. `world-data.mjs` registers both rooms with distinct region IDs for correct multiplayer presence grouping and explicit exit footings. The village door is hidden until built and the plot marker hides afterward. The same swap occurs for Lyss's tent site and cabin door.
- `home-projects-art.mjs` draws the village home's hearth, bed, tables and windows, and Lyss's cabin fireplace, workbench and window at native canvas resolution. Decor is a free, reversible choice after construction, with saved sets:
  - `villageHomeDecor`: `alvin-cushion`, `tapestry`, `bookshelf`.
  - `lyssCabinDecor`: `herb-shelf`, `woven-rug`, `warm-lantern`.
- Both rooms have an interior decor landmark and an exit to their own exterior. Neither decor set changes the other. The village home requires a King ending; Lyss's cabin does not.

## Source map and review

- `terrain.mjs`: Lyss tent/cabin exterior landmarks.
- `camp-art.mjs`: tent/cabin exterior art selected by state.
- `village.mjs`: extended village path and plot/door landmarks.
- `home-projects.mjs` and `home-projects-art.mjs`: room data and art.
- `playtest.mjs`: dialogue, material spend, tracking, save/load, interior furnishings and exterior rendering.
- `world-data.mjs`: distinct rooms, gates and dialogue labels.
- Current cache references: `terrain.mjs?v=16`, `camp-art.mjs?v=14`, `village.mjs?v=13`, `home-projects.mjs?v=1`, `home-projects-art.mjs?v=1`, `world-data.mjs?v=10`, `playtest.mjs?v=71`.
- Owner/Ash manual route: check the village plot stays inaccessible without the player's King ending, build each project independently, enter/exit both rooms, toggle each furnishing, reload in each room, and confirm decorations, exteriors and material stock persist.

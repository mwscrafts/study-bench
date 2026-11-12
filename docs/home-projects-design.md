# First Hearth home projects

## Separate builds

| Project | Location | Unlock | Material cost | Interior |
| --- | --- | --- | --- | --- |
| Player home | Village east of the old arch, plot x≈3170 | Player's King ending | 8 spare wood, 4 iron | `village-home` |
| Lyss cabin | Existing camp tent x≈1960 | Available when encountered | 6 spare wood, 2 iron | `lyss-cabin` |
| Barry workshop home | Crownwood rope bridge, near Barry | Available when encountered | 10 spare wood, 4 iron | `barry-home` |

Each project has an independent saved `unoffered/accepted/complete` state, material spend, route, and room. Costs use `spareWood(tools)` and `tools.woodDonated` for renewable wood, and `ironStock` for iron. The HUD tracker appears after accepting a project in its exterior region. Barry's existing talk point and the bridge route remain intact; the worksite is beside them, and his door appears only after construction.

The village celebration house remains separate from the player's home. Its door and guest scene are not repurposed. Lyss's completed tent becomes a log cabin in camp artwork.

## Interiors and decor

- `home-projects.mjs` defines the three home projects' floor and landmark data. `world-data.mjs` registers distinct room IDs and exits for public presence and route handling.
- `home-projects-art.mjs` draws the player home's hearth, bed, tables and windows; Lyss's cabin fireplace and workbench; and Barry's bed nook, tool rack, workbench and forge. Barry's room has its own exit and no new decor system.
- `villageHomeDecor` and `lyssCabinDecor` remain separate reversible furnishing sets. The village home still requires a King ending; Lyss's cabin and Barry's home do not.

## Source map and review

- `camp-art.mjs`: Lyss's tent/cabin exterior selected by saved state.
- `village.mjs` and `village-art.mjs`: village route data and the separate village/celebration-room drawings.
- `home-projects.mjs` and `home-projects-art.mjs`: house project data, art, costs, and interiors.
- `playtest.mjs`: dialogue, material spend, tracking, saves, and state-dependent exterior rendering.
- `world-data.mjs`: rooms, gates and labels; `field-map.mjs`: interior identification.
- Cache references: `terrain.mjs?v=17`, `camp-art.mjs?v=15`, `village.mjs?v=14`, `village-art.mjs?v=1`, `home-projects.mjs?v=2`, `home-projects-art.mjs?v=2`, `world-data.mjs?v=13`, `field-map.mjs?v=2`, `playtest.mjs?v=81`.

Owner/Ash should visually check each project in the live game, including material costs, construction, entrance/exit, persistence after reload, village artwork, and Barry's exterior. Do not use the public game to test without the owner's specific authorization.

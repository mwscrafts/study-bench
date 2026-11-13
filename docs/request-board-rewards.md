# Request-board special rewards

## Design

The camp request board has repeatable token jobs for Lyss, Barry, and Hugh. Two separate one-time commissions offer a player-selected keepsake instead of tokens:

| Commission | Availability | Supplies | Turn-in |
| --- | --- | --- | --- |
| Camp gathering | From the start | 5 berries + 2 spare wood | Camp board |
| Lanternstead welcome | After earning Root Key | 2 Glowcaps + 2 spare wood | Camp board |

Only one request of either kind may be active. The HUD names a special commission only after the player accepts it. Glowcaps and wood regenerate through their existing systems; these commissions do not gate any story objective. Existing repeatable requests, Hearth tokens, and their one-time berry seed, catnip seed, and minecart capacity bonuses still behave as before.

At turn-in, the player chooses exactly one from the remaining rewards:

| Reward | Effect |
| --- | --- |
| Trail scarf | Visible on the local player sprite; pose includes scarf state for public peers |
| Alvin bell collar | Visible on the local Alvin sprite; pose includes bell state for public peers |
| Hanging star mobile | Drawn in the camp hut and in the village home after it is built |
| Glowcap garland recipe | Adds a workbench craft for 1 spare wood + 1 Glowcap; crafted garland decorates the camp hut and eventual village home |

A player can receive at most two of these four rewards from the two current commissions. No reward is required for the boss or core progression. The house and recipe rewards remain meaningful before the post-King village home because the camp hut shows them.

## Implementation and save semantics

- `dist/first-hearth/special-rewards.mjs` contains the commission catalog, reward choice catalog, player and Alvin overlays, and house decoration drawing.
- `dist/first-hearth/playtest.mjs` displays board choices, owns state, save loading, workbench craft, inventory entries, and draws overlays. `dist/first-hearth/index.html` loads `playtest.mjs?v=73`; the new module import is `special-rewards.mjs?v=1`.
- The save remains under `first-hearth:alder-camp:v1` with record `version:20`. It validates special IDs in `activeRequest` and `completedRequests`, stores `pendingSpecialReward` and `specialRewards`, and allows the crafted `glowcap-garland` ID in hut decorations. Version 20 is also in the existing footing whitelist, preserving saved position on reload.
- Turn-in checks all supplies first, consumes them once, clears the active request, and saves the pending reward. Choosing a reward adds ownership and completed request ID, then clears pending and saves. A reload before choosing returns to the selection at the board without taking supplies again. A reload after choosing keeps the reward.
- Player and Alvin cosmetics are local overlays and send small flags in the existing public pose. The remote appearance depends on the presence service retaining those fields; this was not tested live. Do not claim public visibility without checking with two players.
- Houses are drawn from the saved reward and crafted decoration states; they can be unlocked or built in either order. The optional craft uses existing `woodDonated` resource accounting and one Glowcap.

## Owner playtest route

1. At the board, accept Camp gathering and check that the HUD did not show its materials before acceptance.
2. Attempt turn-in while short of supplies. Confirm nothing is consumed. Gather five berries and two spare wood; turn in and see four clear choices.
3. Leave the board or reload before choosing; return and confirm the pending choice is still there without a second charge.
4. Pick the scarf or bell; confirm it appears on the player or Alvin, persists after reload, and is visible to another public player if the presence service carries the pose fields.
5. After getting the Root Key, check Lanternstead welcome appears; give two Glowcaps and two wood, then pick a different reward. If picking the mobile, visit the camp hut; if picking the recipe, craft the garland at the camp workbench, check one wood and one Glowcap were deducted, and visit the hut.
6. After building the village home, check a claimed mobile or crafted garland appears there. Check a normal Lyss/Barry/Hugh job still gives its original tokens and first-time extra.

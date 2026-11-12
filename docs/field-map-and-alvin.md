# Field map and Alvin's bed

## Route map

The bottom controls include Map beside Bag, Berry, and Journal. M opens or closes it; Escape and the close button also work. It shows only visited regions, with a highlight and west/east pin on the current region. The text below names the current local area, the Rootdeep landing or bedrock floor when relevant, and routes to visited neighbors. It is a schematic, not a literal terrain map or teleport.

The eight major nodes are Alder Camp, Crownwood Canopy, Embervein Mine, Driftwood Cove, Rootdeep Mine, First Hearth, King's Grounds, and Lantern Village. Visited interiors name the room while highlighting its parent region. A link appears only after both regions are visited. The Rootdeep–Embervein minecart link additionally requires an open tunnel.

`field-map.mjs` owns the fixed node coordinates, parent mapping, and SVG rendering. `playtest.mjs` saves `discoveredRegions` whenever `enterRegion` runs. Version 21 validates those IDs and preserves saved footing. Existing saves without map history infer destinations from visited gate IDs plus the currently saved region. Previous admin teleports without gate records cannot always be reconstructed. The map modal blocks movement while open. Solo time pauses; Public Auto continues its shared wall clock.

## Alvin's home choice

The existing `alvin-bed` in the camp hut now offers petting, **Let Alvin stay in bed**, and the inverse **Bring Alvin along**. Petting restores up to 25 Composure. `alvinResting` saves in version 21 and defaults to false for old saves.

While resting, Alvin is visible at the hut bed. He is absent from other regions and their public poses, does not follow or fight, cannot visit catnip, and cannot be fed fish remotely. His temporary fish growth timer pauses. He can be fed while in the hut. The final King altar asks the player to bring him from the hut before starting the trial; its ending scripts Alvin's last hit. A lodestone clue no longer claims his ears signal while he is home.

## Verification and test route

Code commit `b5e9f5db49fe7a229a1a306c7aa18ad308d72da8` updated `field-map.mjs`, `playtest.mjs`, `playtest.css`, and `index.html`. Cache versions: field map v1, playtest v75, CSS v17. JavaScript syntax was checked. An isolated map render included only Camp and Crownwood, their link, and the current location. An isolated Alvin bed action toggled resting and sent pose updates. Codex did not play the public game or visually inspect the phone layout.

1. Refresh. Open Map near Bag/Journal in an existing save. Check visited regions and the current location. Move to another region and reopen; its route should appear.
2. In Rootdeep, compare a landing with the bedrock floor; in an interior, check its room name and parent. The minecart connection should appear only when the tunnel opens.
3. In the camp hut choose **Let Alvin stay in bed**, then leave. Check his sprite and public appearance are gone. Reload outside and confirm he remains home.
4. Return to the bed, pet him, and choose **Bring Alvin along**. Check both local and public appearance return. If he is home, the King altar should ask for him before the final trial.

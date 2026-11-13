import { campTerrain, landmarks, flowers } from './terrain.mjs?v=17';
import { buildCampArt } from './camp-art.mjs?v=15';
import { crownwoodTerrain, crownwoodLandmarks, crownwoodFlower, crownwoodLocation, crownwoodShadows } from './crownwood.mjs?v=15';
import { buildCrownwoodArt } from './crownwood-art.mjs?v=16';
import { mineTerrain, mineLandmarks, mineLocation, mineShadows } from './mine.mjs?v=16';
import { buildMineArt } from './mine-art.mjs?v=06';
import { rootdeepTerrain, rootdeepLandmarks, rootdeepLocation, rootdeepShadows } from './rootdeep.mjs?v=9';
import { buildRootdeepArt } from './rootdeep-art.mjs?v=14';
import { rootdeepHouseRegions, rootdeepHouseGates } from './rootdeep-home.mjs?v=2';
import { beachTerrain, beachLandmarks, beachFlower, beachLocation, beachShadows } from './beach.mjs?v=9';
import { rowboatTerrain, rowboatLandmarks, rowboatLocation } from './rowboat.mjs?v=1';
import { buildRowboatArt } from './rowboat-art.mjs?v=2';
import { buildBeachArt } from './beach-art.mjs?v=16';
import { workbench } from './crafting.mjs?v=17';
import { hearthTerrain, hearthLandmarks, hearthLocation } from './hearth.mjs?v=10';
import { buildHearthArt } from './hearth-art.mjs';
import { kingTerrain, kingLandmarks, kingLocation } from './king.mjs?v=12';
import { buildKingArt } from './king-art.mjs?v=13';
import { villageTerrain, houseTerrain, villageLandmarks, houseLandmarks, villageLocation, houseLocation } from './village.mjs?v=14';
import { buildVillageArt, buildHouseArt } from './village-art.mjs?v=1';
import { hutTerrain, hutLandmarks, hutLocation, buildHutArt } from './camp-idle.mjs?v=18';
import { villageHomeTerrain, villageHomeLandmarks, lyssCabinTerrain, lyssCabinLandmarks, barryHouseTerrain, barryHouseLandmarks } from './home-projects.mjs?v=2';
import { buildVillageHomeArt, buildLyssCabinArt, buildBarryHomeArt } from './home-projects-art.mjs?v=2';

export const regions = {
  camp: {
    title: ['Alder', 'Camp'],
    intro: 'Follow Reedbank Trail to camp, meet Lyss, and take Alvin up into the branches.',
    terrain: campTerrain, landmarks: [...landmarks, workbench], flowers, buildArt: buildCampArt
  },
  crownwood: {
    title: ['Crownwood', 'Canopy'],
    intro: 'Climb Three Boughs, repair the last bridge to the King, and look for a way down to the falls.',
    terrain: crownwoodTerrain, landmarks: [...crownwoodLandmarks,...barryHouseLandmarks.filter(item => item.id !== 'barry-home-exit')], flowers: [crownwoodFlower],
    buildArt: buildCrownwoodArt, location: crownwoodLocation, shadows: crownwoodShadows, retreat: 'Root Landing'
  },
  rootdeep: {
    title: ['Rootdeep', 'Mine'],
    intro: 'Eight old landings descend beneath Crownwood to a bedrock floor. Explore the lantern-lit homes, follow the side galleries, and help Dorrin reopen the collapsed tunnel.',
    terrain: rootdeepTerrain, landmarks: rootdeepLandmarks, flowers: [], buildArt: buildRootdeepArt,
    location: rootdeepLocation, shadows: rootdeepShadows, retreat: 'Rootbound Threshold'
  },
  ...rootdeepHouseRegions,
  mine: {
    title: ['Embervein', 'Mine'],
    intro: 'Follow the lanterns down to Hugh Mungus, look for iron seams, and find the old lift.',
    terrain: mineTerrain, landmarks: mineLandmarks, flowers: [],
    buildArt: buildMineArt, location: mineLocation, shadows: mineShadows, retreat: 'Timber Shaft'
  },
  beach: {
    title: ['The', 'Beach'],
    intro: 'Follow the bluff to Driftwood Cove, cast Hugh Mungus’s net at Lantern Dock, and look out from Tide Arch.',
    terrain: beachTerrain, landmarks: beachLandmarks, flowers: [beachFlower],
    buildArt: buildBeachArt, location: beachLocation, shadows: beachShadows, retreat: 'Salt Pines'
  },
  rowboat: {
    title: ['Open', 'Sea'],
    intro: 'A quiet stretch of water, a hand-painted skiff, and room to take your time.',
    terrain: rowboatTerrain, landmarks: rowboatLandmarks, flowers: [],
    buildArt: buildRowboatArt, location: rowboatLocation
  },
  hearth: {
    title: ['The First', 'Hearth'],
    intro: 'Follow the sheltered passage into the ember chamber.',
    terrain: hearthTerrain, landmarks: hearthLandmarks, flowers: [],
    buildArt: buildHearthArt, location: hearthLocation
  },
  king: {
    title: ['King’s', 'Grounds'],
    intro: 'Cross the ruins to the altar when you are ready to face the Hollow King.',
    terrain: kingTerrain, landmarks: kingLandmarks, flowers: [], buildArt: buildKingArt, location: kingLocation
  },
  village: { title: ['Lantern', 'Village'], intro: 'The gate opens onto a village celebrating your safe return.',
    terrain: villageTerrain, landmarks: villageLandmarks, flowers: [], buildArt: buildVillageArt, location: villageLocation },
  house: { title: ['Homecoming', 'House'], intro: 'The village has been waiting for you and Alvin.',
    terrain: houseTerrain, landmarks: houseLandmarks, flowers: [], buildArt: buildHouseArt, location: houseLocation },
  hut: { title: ['Alder Camp', 'Hut'], intro: 'A warm little room, a place to rest, and a bed for Alvin.',
    terrain: hutTerrain, landmarks: hutLandmarks, flowers: [], buildArt: buildHutArt, location: hutLocation },
  'village-home': { title: ['Your Village', 'Home'], intro: 'Your own place to return to and make comfortable for Alvin.',
    terrain: villageHomeTerrain, landmarks: villageHomeLandmarks, flowers: [], buildArt: buildVillageHomeArt, location: () => 'Your Home' },
  'lyss-cabin': { title: ['Lyss’s', 'Cabin'], intro: 'A log cabin for Lyss, built beside the camp forge.',
    terrain: lyssCabinTerrain, landmarks: lyssCabinLandmarks, flowers: [], buildArt: buildLyssCabinArt, location: () => 'Lyss’s Cabin' },
  'barry-home': { title: ['Barry’s', 'Workshop'], intro: 'A solid home and workroom above the Crownwood bridge.',
    terrain: barryHouseTerrain, landmarks: barryHouseLandmarks.filter(item => item.id === 'barry-home-exit'), flowers: [], buildArt: buildBarryHomeArt, location: () => 'Barry’s Workshop' }
};
export const knownLandmarks = Object.values(regions).flatMap(area => area.landmarks);
export const knownFlowers = Object.values(regions).flatMap(area => area.flowers);
export const gates = {
  canopy: { region: 'crownwood' },
  mine: { region: 'mine' },
  shore: { region: 'beach' },
  'camp-return': { region: 'camp', footing: { x: 3638, ground: 'crown' } },
  'mine-return': { region: 'camp', footing: { x: 4180, ground: 'trail' } },
  'rootdeep-entrance': { region: 'rootdeep', footing: { x: 110, ground: 'rootdeep-level-1' } },
  'rootdeep-return': { region: 'crownwood', footing: { x: 5510, ground: 'understory' } },
  'rootdeep-house-lantern-door': { region: 'rootdeep-home-lantern', footing: { x: 230, ground: 'rootdeep-home-floor' } },
  'rootdeep-house-stone-door': { region: 'rootdeep-home-stone', footing: { x: 230, ground: 'rootdeep-home-floor' } },
  'rootdeep-house-common-door': { region: 'rootdeep-home-common', footing: { x: 230, ground: 'rootdeep-home-floor' } },
  ...rootdeepHouseGates,
  'shore-return': { region: 'camp', footing: { x: 4510, ground: 'trail' } },
  'first-hearth': { region: 'hearth' },
  'hearth-return': { region: 'crownwood', footing: { x: 3445, ground: 'mist-shelf' } },
  'hearth-notch': { region: 'crownwood', footing: { x: 3975, ground: 'mist-shelf' } },
  'king-trail': { region: 'king' },
  'king-return': { region: 'crownwood', footing: { x: 5500, ground: 'king-bridge-east' } }
};
gates['village-gate'] = { region: 'village' };
gates['village-return'] = { region: 'king', footing: { x: 3670, ground: 'king-floor' } };
gates['celebration-house'] = { region: 'house' };
gates['house-return'] = { region: 'village', footing: { x: 1920, ground: 'village-road' } };
gates['village-home-door'] = { region: 'village-home', footing: { x: 170, ground: 'village-home-floor' } };
gates['village-home-exit'] = { region: 'village', footing: { x: 3255, ground: 'village-road' } };
gates['lyss-cabin-door'] = { region: 'lyss-cabin', footing: { x: 150, ground: 'lyss-cabin-floor' } };
gates['lyss-cabin-exit'] = { region: 'camp', footing: { x: 1875, ground: 'trail' } };
gates['barry-home-door'] = { region: 'barry-home', footing: { x: 170, ground: 'barry-house-floor' } };
gates['barry-home-exit'] = { region: 'crownwood', footing: { x: 2380, ground: 'rope-bridge' } };
gates['hut-door'] = { region: 'hut' };
gates['hut-exit'] = { region: 'camp', footing: { x: 2705, ground: 'trail' } };
export const liftGates = {
  lift: { region: 'mine', footing: { x: 4340, ground: 'mine-floor' } },
  'mine-lift': { region: 'camp', footing: { x: 2300, ground: 'trail' } }
};

export const conversations = {
  lyss: { name: 'Lyss', role: 'FORGE KEEPER' },
  barry: { name: 'Barry', role: 'CROWNWOOD SURVIVOR' },
  hugh: { name: 'Hugh Mungus', role: 'KEEPER OF EMBERVEIN' },
  dorrin: { name: 'Dorrin', role: 'ROOTDEEP KEEPER' },
  'rootdeep-guard': { name: 'Bram', role: 'SHAFT GUARD' },
  'king-bridge': { name: 'The King’s Bridge', role: 'CROWNWOOD CROSSING' },
  'village-home-site': { name: 'Your village plot', role: 'HOME PROJECT' },
  'lyss-tent-site': { name: 'Lyss’s tent', role: 'CAMP PROJECT' },
  'village-home-decor': { name: 'Your home', role: 'DECORATIONS' },
  'lyss-cabin-decor': { name: 'Lyss’s cabin', role: 'FURNISHINGS' },
  'barry-home-site': { name: 'Barry’s workshop', role: 'HOME PROJECT' },
  'rootdeep-lift-high': { name: 'Old lift', role: 'ROOTDEEP' },
  'rootdeep-lift-low': { name: 'Deep lift', role: 'ROOTDEEP' },
  'rootdeep-lanternkeeper': { name: 'Lantern Keeper', role: 'ROOTDEEP SETTLER', greeting: 'Welcome in. The lanterns stay lit through every shift. This landing is safe, even when the roots below begin to stir.' },
  'rootdeep-stonecarver': { name: 'Stonecarver', role: 'ROOTDEEP SETTLER', greeting: 'The galleries split around the old iron veins. Look for the timber braces; the ore lies on the side branches.' },
  'rootdeep-commonkeeper': { name: 'Common Keeper', role: 'ROOTDEEP SETTLER', greeting: 'There’s always room by the fire. The miners used to bring Glowcaps here to keep the lamps burning. At night, the roots pulse with the same violet light the shadows carry. Some say the blight started where the old roots touch stone.' },
  'village-beyond': { name: 'The eastern path', role: 'BEYOND THE VILLAGE' },
  'deep-seal': { name: 'The Deep Seal', role: 'ROOTDEEP' },
  lodestone: { name: 'Old lodestone', role: 'ANCIENT MARKINGS' },
  'rootdeep-entrance': { name: 'Sealed Rootdeep entrance', role: 'CROWNWOOD' },
  workbench: { name: 'Camp workbench', role: 'CRAFTING' },
  dock: { name: 'Lantern Dock', role: 'CASTING NET' },
  'tool-needed': { name: 'Tool needed', role: 'GATHERING' },
  'admin-ring': { name: 'Admin Ring', role: 'TEST TOOLS' },
  'admin-tools': { name: 'Admin Panel', role: 'TEST TOOLS' },
  lift: {
    name: 'The old lift',
    role: 'LYSS’S CLEARING',
    greeting: 'The lift goes down to Hugh Mungus’s mine, but its cable hangs slack. You can still reach the mine door on foot.'
  },
  'mine-lift': {
    name: 'The lift base',
    role: 'EMBERVEIN MINE',
    greeting: 'The old lift reaches Lyss’s clearing. One of the bearings is cracked. Hugh Mungus needs a tideglass gemstone from the beach before he can repair it. The timber shaft leads back to camp.'
  },
  'ember-box': { name: 'The ember box', role: 'EMBER CHAMBER' },
  'home-welcome': { name: 'The neighbors', role: 'HOMECOMING',
    greeting: 'You made it home! We lit every window hoping you and Alvin would come back. Come in and celebrate with us.' },
  'restored-king': { name: 'The King', role: 'LANTERN VILLAGE',
    greeting: 'I remember Lyss’s flowers. Thank you for bringing me back to my people. Tell her I’m coming home.' },
  'request-board': { name: 'Camp requests', role: 'HELP THE CAMP' },
  'player-board': { name: 'A note for the next visitor', role: 'THE PLAYER NOTICEBOARD' },
  'berry-plot': { name: 'Berry garden', role: 'ALDER CAMP' },
  'catnip-garden': { name: 'Alvin’s catnip patch', role: 'ALDER CAMP' },
  minecart: { name: 'Hugh Mungus’s minecart', role: 'EMBER VEIN EXPRESS' },
  'hut-bed': { name: 'The little bed', role: 'A SAFE PLACE' },
  'hut-decor': { name: 'Hut decorations', role: 'A SAFE PLACE' },
  'alvin-bed': { name: 'Alvin', role: 'HIS COZY BED' },
  'lantern-rest': {
    name: 'Lantern Rest', role: 'KING’S GROUNDS',
    greeting: 'Rest here or return through Crownwood. Lighting the altar starts the final night. Use the Action button to strike, and jump over the King’s charges and shockwaves.'
  },
  'night-altar': { name: 'The night altar', role: 'ALTAR TERRACE' },
  'fallen-crown': { name: 'The fallen crown', role: 'CROWN ARENA' },
  'rowboat': { name: 'The rowboat', role: 'TIDE ARCH' },
  'rowboat-fish': { name: 'From the rowboat', role: 'OFFSHORE FISHING' },
  'tide-arch': {
    name: 'Tide Arch', role: 'COASTAL OVERLOOK',
    greeting: 'Through the arch you can see the lights of the dock. The trail back to Alder Camp follows the shore and climbs through the pines.'
  }
};


import { defineTerrain, surfaceAt, groundAt } from './terrain.mjs';
import { poly, path, orb } from './camp-art.mjs';

export const campFacilities = [
  { id: 'request-board', x: 2140, label: 'Read the request board', radius: 72 },
  { id: 'player-board', x: 2230, label: 'Read the player noticeboard', radius: 72 },
  { id: 'minecart', x: 2580, label: 'Check Perry’s ore cart', radius: 70 },
  { id: 'berry-plot', x: 3210, label: 'Tend the berry plot', radius: 74 },
  { id: 'catnip-garden', x: 3390, label: 'Check Alvin’s catnip garden', radius: 70 },
  { id: 'hut-door', x: 3020, label: 'Enter the hut', radius: 84 }
];

const hutFloor = { id: 'hut-floor', points: [[0,650],[960,650]] };
export const hutTerrain = defineTerrain(960, 900, 480, [hutFloor]);
export const hutLandmarks = [
  { id: 'hut-exit', x: 68, y: 650, label: 'Step outside', radius: 65 },
  { id: 'hut-bed', x: 410, y: 650, label: 'Sleep until morning', radius: 92 },
  { id: 'hut-decor', x: 500, y: 650, label: 'Choose a house decoration', radius: 82 },
  { id: 'alvin-bed', x: 665, y: 650, label: 'Pet Alvin', radius: 88 }
];
export const hutLocation = () => 'Alder Camp · Inside the hut';

export function buildHutArt() {
  const canvas = document.createElement('canvas');
  canvas.width = hutTerrain.width;
  canvas.height = hutTerrain.height;
  const ctx = canvas.getContext('2d');
  const floorY = surfaceAt(hutFloor, 480);
  ctx.fillStyle = '#64503e'; ctx.fillRect(0,0,960,650);
  ctx.fillStyle = '#826448'; ctx.fillRect(0,82,960,470);
  ctx.fillStyle = '#98795a'; ctx.fillRect(0,552,960,98);
  ctx.fillStyle = '#4c3d31'; ctx.fillRect(0,0,960,32);
  for (const x of [28,932]) { ctx.fillStyle = '#4b392d'; ctx.fillRect(x-16,0,32,650); }
  for (let x=38; x<960; x+=142) { ctx.fillStyle = '#76583e'; ctx.fillRect(x,80,7,472); }
  // Wide window: its sky is painted from the live world phase in playtest.mjs.
  ctx.fillStyle = '#4d3b2c'; ctx.fillRect(595,134,238,188);
  ctx.fillStyle = '#dfc590'; ctx.fillRect(607,146,214,164);
  ctx.fillStyle = '#5b4434'; ctx.fillRect(708,146,9,164); ctx.fillRect(607,225,214,8);
  // Two small framed paintings, kept deliberately warm and handmade.
  for (const [x,y,w,h] of [[128,170,122,91],[302,186,112,76]]) {
    ctx.fillStyle = '#49362a'; ctx.fillRect(x-7,y-7,w+14,h+14);
    ctx.fillStyle = '#d3b781'; ctx.fillRect(x,y,w,h);
  }
  poly(ctx,[[145,246],[184,190],[224,246]],'#69846a');
  orb(ctx,204,204,11,'#f0d18f');
  poly(ctx,[[319,244],[347,203],[396,244]],'#6c8165');
  path(ctx,[[323,222],[346,207],[367,220],[394,197]],'#728b9a',4);
  // Player bed and Alvin’s separate little bed.
  ctx.fillStyle = '#513b2d'; ctx.fillRect(320,552,196,58);
  ctx.fillStyle = '#c9b88d'; ctx.fillRect(330,538,177,36);
  ctx.fillStyle = '#627e71'; ctx.fillRect(338,544,69,25);
  ctx.fillStyle = '#5c4431'; ctx.fillRect(600,585,126,28);
  ctx.fillStyle = '#c9b989'; ctx.fillRect(609,567,108,29);
  ctx.fillStyle = '#718875'; ctx.fillRect(616,571,42,20);
  // A hanging message above the beds.
  ctx.fillStyle = '#4d392b'; ctx.fillRect(336,352,330,92);
  ctx.fillStyle = '#ddc99d'; ctx.fillRect(344,360,314,76);
  ctx.fillStyle = '#405646'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = 'bold 17px Georgia, serif';
  ctx.fillText('You are loved and appreciated.',501,385);
  ctx.font = 'italic 16px Georgia, serif';
  ctx.fillText('Your small efforts add up.',501,412);
  poly(ctx,[...hutFloor.points,[960,900],[0,900]],'#745b43');
  path(ctx,hutFloor.points,'#c3a578',6);
  // Doorway at left, so the inside reads as a single compact room.
  ctx.fillStyle = '#47372c'; ctx.fillRect(18,386,72,264);
  ctx.fillStyle = '#95714d'; ctx.fillRect(27,396,54,254);
  orb(ctx,69,526,5,'#e1c27e');
  return canvas;
}

export function paintHutWindow(ctx, phase, animation) {
  const palette = {
    day: ['#72a6af','#e7d49c','#7d9b70'],
    dusk: ['#77537d','#f2ad82','#5c6b68'],
    night: ['#182746','#e8e3cb','#344b55'],
    dawn: ['#806c91','#f3c491','#697d75']
  }[phase] ?? ['#72a6af','#e7d49c','#7d9b70'];
  const grad = ctx.createLinearGradient(0,146,0,310);
  grad.addColorStop(0,palette[0]); grad.addColorStop(1,palette[2]);
  ctx.fillStyle = grad; ctx.fillRect(607,146,214,164);
  orb(ctx,phase === 'night' ? 772 : 758,phase === 'night' ? 181 : 190,phase === 'night' ? 12 : 21,palette[1]);
  if (phase === 'night') {
    for (let i=0;i<7;i++) orb(ctx,626+i*27,165+(i%3)*19,1.5,'#f6edcf');
  }
  poly(ctx,[[607,278],[650,250],[688,271],[731,242],[777,270],[821,249],[821,310],[607,310]],'#506b54');
  path(ctx,[[616,299],[653,282],[694,294],[736,271],[781,293],[817,280]],'#72865f',4);
  ctx.fillStyle='#5b4434'; ctx.fillRect(708,146,9,164); ctx.fillRect(607,225,214,8);
  ctx.fillStyle = '#ffdc9a'; ctx.globalAlpha = .12 + (Math.sin(animation*2)+1)*.035;
  ctx.fillRect(607,146,214,164); ctx.globalAlpha = 1;
}

export function paintHutDecor(ctx, decorations) {
  if (decorations.has('canopy-banner')) {
    path(ctx,[[275,132],[275,164],[437,164],[437,132]],'#594431',4);
    poly(ctx,[[282,166],[430,166],[420,236],[357,220],[292,239]],'#668265');
    orb(ctx,355,189,10,'#ecd39a');
  }
  if (decorations.has('lake-painting')) {
    ctx.fillStyle='#513d2d'; ctx.fillRect(162,462,110,73);
    ctx.fillStyle='#d6c292'; ctx.fillRect(169,469,96,59);
    poly(ctx,[[169,515],[194,485],[218,512],[239,479],[265,515]],'#69836b');
    ctx.fillStyle='#6f92a0'; ctx.fillRect(169,515,96,13);
  }
  if (decorations.has('patchwork-quilt')) {
    ctx.fillStyle='#8b7460'; ctx.fillRect(330,560,177,16);
    for(let i=0;i<6;i++) {
      ctx.fillStyle=['#b88f89','#8c9c7c','#d6bd88'][i%3];
      ctx.fillRect(335+i*28,560,27,16);
    }
  }
}

export function paintCampFacilities(ctx, state, animation) {
  const floor = x => groundAt(x);
  const signBoard = (x,y,title,accent='#c8ad78') => {
    ctx.fillStyle='#644c34'; ctx.fillRect(x-6,y-66,12,66);
    ctx.fillStyle='#826343'; ctx.fillRect(x-55,y-107,110,48);
    ctx.fillStyle=accent; ctx.fillRect(x-49,y-101,98,36);
    ctx.fillStyle='#3c4739'; ctx.textAlign='center'; ctx.font='bold 12px Georgia,serif';
    ctx.fillText(title,x,y-79);
    path(ctx,[[x-46,y-70],[x+46,y-70]],'#5d4934',2);
  };
  const hutX=3020, hutY=floor(hutX);
  poly(ctx,[[hutX-83,hutY],[hutX-78,hutY-104],[hutX+79,hutY-104],[hutX+84,hutY]],'#a28a65');
  poly(ctx,[[hutX-101,hutY-99],[hutX-2,hutY-175],[hutX+105,hutY-99]],'#66513f');
  path(ctx,[[hutX-101,hutY-99],[hutX-2,hutY-175],[hutX+105,hutY-99]],'#c6a77a',4);
  ctx.fillStyle='#4d3a2e'; ctx.fillRect(hutX-24,hutY-67,48,67);
  ctx.fillStyle='#b7d4bf'; ctx.fillRect(hutX+38,hutY-77,25,29);
  ctx.fillStyle='#c9ae78'; ctx.fillRect(hutX-64,hutY-78,22,23);
  signBoard(2140,floor(2140),'REQUESTS','#dbc589');
  signBoard(2230,floor(2230),'NOTES','#c4d0b0');
  // Three small raised garden beds. Ripe fruit glows softly.
  for(let i=0;i<3;i++) {
    const x=3160+i*50, y=floor(x);
    ctx.fillStyle='#674a36'; ctx.fillRect(x-30,y-27,60,24);
    ctx.fillStyle='#543e30'; ctx.fillRect(x-30,y-27,60,5);
    ctx.fillStyle='#526b42'; ctx.fillRect(x-25,y-37,50,11);
    const plantedAt=state.berryPlots?.[i];
    if(plantedAt) {
      const ripe=Date.now()-plantedAt>=state.growMs;
      for(const dx of [-12,0,12]) orb(ctx,x+dx,y-42,5,ripe?'#d96d79':'#b48770');
      if(ripe) orb(ctx,x,y-50,10,'rgba(243,204,128,0.38)');
    }
  }
  // Catnip patch: a little flower cluster is visible once Barry has given the seed.
  const cx=3390, cy=floor(3390);
  ctx.fillStyle='#665039'; ctx.fillRect(cx-32,cy-18,64,15);
  if(state.catnipUnlocked) {
    for(let i=0;i<5;i++) {
      const dx=(i-2)*13, sway=Math.sin(animation*2+i)*2;
      path(ctx,[[cx+dx,cy-18],[cx+dx+sway,cy-49]],'#5f8056',3);
      orb(ctx,cx+dx+sway,cy-51,6,'#a78ac5');
    }
    if(state.catnipReadyAt && Date.now()>=state.catnipReadyAt) orb(ctx,cx,cy-59,13,'rgba(218,177,239,.28)');
  }
  // Minecart waits beside the old lift; locked means it remains an empty cart.
  const mx=2580, my=floor(2580)-8;
  ctx.fillStyle='#5b4734'; ctx.fillRect(mx-30,my-20,58,22);
  ctx.fillStyle=state.minecartUnlocked?'#9a7954':'#5a5347'; ctx.fillRect(mx-26,my-35,50,19);
  for(const dx of [-18,18]) { orb(ctx,mx+dx,my+5,7,'#3d3932'); orb(ctx,mx+dx,my+5,3,'#ad9871'); }
  if(state.minecartOre>0) for(let i=0;i<Math.min(3,state.minecartOre);i++) orb(ctx,mx-14+i*13,my-37,6,'#afb8b2');
  // Tiny puffs and hearts are purely decorative when Alvin celebrates.
  if(state.catnipShowUntil>animation) {
    const t=state.catnipShowUntil-animation;
    for(let i=0;i<5;i++) {
      const rise=(1.8-t)*32+i*14;
      ctx.fillStyle='rgba(244,170,198,'+Math.max(0,Math.min(.95,t/1.8))+')';
      ctx.font='15px system-ui'; ctx.fillText('♥',cx-22+i*12,cy-75-rise);
    }
  }
}

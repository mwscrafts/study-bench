import { poly, path, orb, stone } from './camp-art.mjs?v=12';

const palettes = {
  lantern: { wall:'#45564d', light:'#e8b66c', accent:'#879477', rug:'#655345' },
  stone: { wall:'#475458', light:'#b5d0bb', accent:'#898e78', rug:'#4e5960' },
  common: { wall:'#514d43', light:'#f0c57b', accent:'#9b805b', rug:'#6d5140' }
};

function lamp(ctx,x,y,color) {
  path(ctx,[[x,y+7],[x,y-42]],'#785b40',6);
  poly(ctx,[[x-16,y-44],[x+16,y-44],[x+12,y-10],[x-12,y-10]],'#3e4140');
  poly(ctx,[[x-9,y-37],[x+9,y-37],[x+7,y-17],[x-7,y-17]],color);
  orb(ctx,x,y-26,43,'rgba(255,194,106,.18)');
}

function window(ctx,x,y,glow) {
  poly(ctx,[[x-69,y-112],[x+69,y-112],[x+69,y+8],[x-69,y+8]],'#2c393c');
  poly(ctx,[[x-58,y-101],[x+58,y-101],[x+58,y-3],[x-58,y-3]],glow);
  path(ctx,[[x,y-101],[x,y-3]],'#685d4d',7);
  path(ctx,[[x-58,y-52],[x+58,y-52]],'#685d4d',7);
  // These tiny crystals are the night sky outside, so the underground window never reads as a blank panel.
  for (const [dx,dy] of [[-33,-73],[28,-82],[-15,-20],[39,-27]]) orb(ctx,x+dx,y+dy,4,'#d4ecd2');
}

export function buildRootdeepHomeArt(style='common') {
  const palette=palettes[style] ?? palettes.common;
  const canvas=document.createElement('canvas');
  canvas.width=1200; canvas.height=760;
  const ctx=canvas.getContext('2d');
  const wall=ctx.createLinearGradient(0,0,0,650);
  wall.addColorStop(0,'#24343a'); wall.addColorStop(.65,palette.wall); wall.addColorStop(1,'#333c3a');
  ctx.fillStyle=wall; ctx.fillRect(0,0,1200,760);
  // The interior exit is visible immediately beside the spawn point, so a room always has an obvious way out.
  poly(ctx,[[26,650],[26,467],[160,467],[160,650]],'#283537');
  poly(ctx,[[42,650],[42,489],[145,489],[145,650]],'#172529');
  path(ctx,[[27,649],[27,470],[159,470],[159,649]],'#ac8c60',8);
  path(ctx,[[42,536],[145,536]],'#70563e',5);
  poly(ctx,[[0,0],[1200,0],[1200,88],[0,112]],'#1d2c32');
  // Repeated timber ribs make each room read as a built interior, while retaining the game’s simple polygons.
  for (const x of [54,360,840,1145]) {
    poly(ctx,[[x-17,52],[x+17,52],[x+14,650],[x-14,650]],'#654e3b');
    poly(ctx,[[x-25,72],[x+25,72],[x+22,93],[x-22,93]],'#967653');
  }
  window(ctx,205,310,palette.light);
  poly(ctx,[[0,612],[1200,612],[1200,760],[0,760]],'#33413d');
  path(ctx,[[0,650],[1200,650]],'#a39b75',7);
  poly(ctx,[[70,650],[1160,650],[1090,705],[140,705]],palette.rug);
  path(ctx,[[114,658],[1114,658]],'#b09469',3);
  // A low bed and shared bench keep this settlement domestic, not another cave corridor.
  poly(ctx,[[270,598],[555,598],[578,635],[252,635]],'#84684b');
  poly(ctx,[[286,553],[552,553],[552,596],[286,596]],'#c7b78d');
  poly(ctx,[[300,560],[538,560],[538,590],[300,590]],style==='stone'?'#72877a':'#b5a581');
  poly(ctx,[[605,616],[722,616],[742,650],[587,650]],'#6b5542');
  poly(ctx,[[620,589],[701,589],[724,618],[608,618]],'#b69b6d');
  if(style==='lantern') {
    // The lantern keeper dries Glowcaps beside the warmest lamp.
    for (const [x,y,s] of [[850,588,1],[892,590,.82],[932,594,.68]]) {
      poly(ctx,[[x-15*s,y+18*s],[x-12*s,y-6*s],[x,y-18*s],[x+14*s,y-5*s],[x+18*s,y+18*s]],'#75988b');
      orb(ctx,x,y-8*s,20*s,'rgba(143,232,207,.28)');
    }
    lamp(ctx,1000,610,'#a5e6ca');
  } else if(style==='stone') {
    // Old gallery maps and a stonecarver’s bench.
    poly(ctx,[[710,208],[1040,208],[1040,410],[710,410]],'#343d3a');
    poly(ctx,[[726,224],[1024,224],[1024,394],[726,394]],'#c8b88f');
    path(ctx,[[760,358],[823,303],[875,344],[946,265],[995,327]],'#687866',8);
    path(ctx,[[750,368],[1012,368]],'#6a5944',5);
    poly(ctx,[[690,535],[1090,535],[1103,562],[680,562]],'#775d42');
    for(const [x,y] of [[790,510],[950,498],[1030,518]]) stone(ctx,x,y,36,18,'#8a9581');
  } else {
    // The common room’s fire, bench, and shared table are visible from the entrance.
    poly(ctx,[[830,408],[1020,408],[1020,615],[830,615]],'#303938');
    poly(ctx,[[855,433],[995,433],[995,590],[855,590]],'#493c31');
    poly(ctx,[[874,566],[976,566],[976,594],[874,594]],'#9b754e');
    orb(ctx,925,520,55,'rgba(255,180,88,.2)');
    poly(ctx,[[914,574],[895,533],[917,495],[938,532],[926,574]],'#ffd087');
    poly(ctx,[[110,518],[218,518],[236,547],[96,547]],'#806247');
    poly(ctx,[[126,478],[203,478],[218,516],[111,516]],'#a3845c');
  }
  lamp(ctx,652,604,palette.light);
  return canvas;
}

import { poly, path, orb } from './camp-art.mjs?v=15';
import { villageTerrain, houseTerrain, villageLandmarks } from './village.mjs?v=14';
import { surfaceAt } from './terrain.mjs?v=17';

function person(ctx,x,y,coat,style=0) {
  ctx.save();
  ctx.fillStyle='#24342e'; ctx.beginPath(); ctx.ellipse(x,y-1,19,4,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#463e35'; ctx.fillRect(x-12,y-18,10,18); ctx.fillRect(x+2,y-18,10,18);
  poly(ctx,[[x-17,y-18],[x-20,y-57],[x-13,y-72],[x+13,y-72],[x+20,y-57],[x+17,y-18]],coat);
  path(ctx,[[x,y-66],[x,y-22]],style%2?'#ddc596':'#e0c18c',2);
  orb(ctx,x,y-82,14,style%3===0?'#bc8b68':style%3===1?'#d3a27d':'#a97458');
  orb(ctx,x-5,y-84,1.8,'#392923'); orb(ctx,x+5,y-84,1.8,'#392923');
  path(ctx,[[x-4,y-76],[x,y-74],[x+4,y-76]],'#794e42',2);
  if(style%3===1) {
    poly(ctx,[[x-14,y-91],[x-10,y-102],[x+10,y-102],[x+15,y-91]],'#594439');
    path(ctx,[[x-16,y-91],[x+16,y-91]],'#c4a56e',3);
  } else {
    ctx.fillStyle=style%3===0?'#593b32':'#76543b';
    ctx.beginPath();ctx.arc(x,y-89,14,Math.PI,Math.PI*2);ctx.fill();
  }
  ctx.fillStyle='#dbbc84';
  for(const dx of [-12,12]) { ctx.beginPath();ctx.arc(x+dx,y-48,2,0,Math.PI*2);ctx.fill(); }
  ctx.restore();
}

function guestWithWine(ctx,x,y,coat,style=0) {
  person(ctx,x,y,coat,style);
  ctx.save();ctx.strokeStyle=coat;ctx.lineWidth=6;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(x+15,y-61);ctx.lineTo(x+27,y-54);ctx.lineTo(x+34,y-68);ctx.stroke();
  poly(ctx,[[x+28,y-80],[x+42,y-80],[x+40,y-66],[x+36,y-62],[x+36,y-56],[x+43,y-54],[x+27,y-54],[x+34,y-56],[x+34,y-62],[x+30,y-66]],'#e2ddc5');
  path(ctx,[[x+30,y-75],[x+40,y-75]],'#8d3f42',5);
  ctx.restore();
}

function dwarf(ctx,x,y,coat,beard) {
  ctx.save();
  ctx.fillStyle='#26342c';ctx.beginPath();ctx.ellipse(x,y-1,18,4,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#493a31';ctx.fillRect(x-12,y-16,10,16);ctx.fillRect(x+2,y-16,10,16);
  poly(ctx,[[x-19,y-17],[x-17,y-49],[x-12,y-61],[x+12,y-61],[x+17,y-49],[x+19,y-17]],coat);
  path(ctx,[[x,y-57],[x,y-21]],'#c7a874',3);
  orb(ctx,x,y-72,17,'#bb8b67');
  poly(ctx,[[x-15,y-77],[x-13,y-94],[x,y-104],[x+14,y-94],[x+16,y-77]],'#574b3b');
  path(ctx,[[x-15,y-77],[x+15,y-77]],'#d2b16f',4);
  orb(ctx,x-6,y-74,2,'#312821');orb(ctx,x+6,y-74,2,'#312821');
  poly(ctx,[[x-13,y-67],[x-12,y-54],[x-6,y-49],[x,y-47],[x+7,y-51],[x+13,y-65]],beard);
  path(ctx,[[x-8,y-62],[x-4,y-54],[x,y-62],[x+5,y-53],[x+9,y-63]],'#e7c58b',2);
  ctx.restore();
}

function cottage(ctx,x,ground,w,h,wall,roof,variant=0) {
  ctx.save();
  // Stone foundation and plaster walls, with visible timber framing.
  poly(ctx,[[x-w/2-8,ground],[x-w/2,ground-h+44],[x+w/2,ground-h+44],[x+w/2+8,ground]],'#5f5a49');
  poly(ctx,[[x-w/2,ground],[x-w/2,ground-h],[x+w/2,ground-h],[x+w/2,ground]],wall);
  for(let row=0;row<6;row++) for(let col=0;col<Math.ceil(w/54);col++) {
    const sx=x-w/2+col*54+(row%2?22:0), sy=ground-11-row*15;
    path(ctx,[[sx,sy],[Math.min(x+w/2,sx+33),sy]],row%2?'#8a795f':'#a18b68',2);
  }
  const roofTop=ground-h-104;
  poly(ctx,[[x-w/2-38,ground-h+4],[x-8,roofTop],[x+w/2+40,ground-h+4]],'#493e3a');
  poly(ctx,[[x-w/2-28,ground-h-2],[x-8,roofTop+12],[x+w/2+30,ground-h-2]],roof);
  path(ctx,[[x-w/2-26,ground-h],[x-7,roofTop+14],[x+w/2+29,ground-h]],'#d1ae72',5);
  for(let row=0;row<5;row++) {
    const yy=roofTop+30+row*17;
    path(ctx,[[x-w/2-20+row*4,yy],[x+w/2+20-row*4,yy]],row%2?'#80634e':'#745746',3);
  }
  for(const side of [-1,1]) path(ctx,[[x+side*(w/2-22),ground-h+8],[x+side*(w/2-22),ground-2]],'#604a3a',9);
  path(ctx,[[x-w/2+8,ground-h+26],[x+w/2-8,ground-h+26]],'#604a3a',8);
  const winY=ground-h+75;
  for(const wx of [x-w*.29,x+w*.29]) {
    poly(ctx,[[wx-27,winY-29],[wx+27,winY-29],[wx+27,winY+24],[wx-27,winY+24]],'#473d35');
    poly(ctx,[[wx-21,winY-23],[wx+21,winY-23],[wx+21,winY+18],[wx-21,winY+18]],variant%2?'#bdd2bd':'#f1cd83');
    path(ctx,[[wx,winY-22],[wx,winY+18]],'#74583f',4);path(ctx,[[wx-20,winY],[wx+20,winY]],'#74583f',4);
    path(ctx,[[wx-32,winY-30],[wx+32,winY-30]],'#d6b77d',4);
  }
  const doorX=x+(variant%2?20:-20);
  poly(ctx,[[doorX-27,ground],[doorX-27,ground-95],[doorX,ground-117],[doorX+28,ground-95],[doorX+28,ground]],'#564334');
  poly(ctx,[[doorX-18,ground],[doorX-18,ground-91],[doorX,ground-106],[doorX+19,ground-91],[doorX+19,ground]],'#725039');
  orb(ctx,doorX+11,ground-53,3,'#e8c078');
  // Small flower boxes and lanterns make houses feel lived in.
  for(const wx of [x-w*.29,x+w*.29]) {
    path(ctx,[[wx-31,winY+28],[wx+31,winY+28]],'#684a34',5);
    for(const dx of [-18,0,18]) { path(ctx,[[wx+dx,winY+26],[wx+dx-3,winY+17]],'#6c8b5c',2);orb(ctx,wx+dx-3,winY+16,3,dx===0?'#d88577':'#e6c47e'); }
  }
  path(ctx,[[x-w/2+10,ground-h+112],[x-w/2+10,ground-h+147]],'#71533b',3);
  orb(ctx,x-w/2+10,ground-h+156,11,'rgba(255,207,119,.3)');
  orb(ctx,x-w/2+10,ground-h+156,5,'#f2ca7d');
  ctx.restore();
}

function tree(ctx,x,y,size,tone) {
  ctx.fillStyle='#594c3b';ctx.fillRect(x-7,y-size*.38,14,size*.4);
  for(let i=0;i<4;i++) {
    const yy=y-size*.72+i*size*.13, r=size*(.24-i*.025);
    orb(ctx,x+(i%2?8:-7),yy,r,tone);
    orb(ctx,x-r*.32,yy-r*.35,r*.34,'#b0a97a44');
  }
}

export function buildVillageArt(rootdeepUnlocked=false) {
  const canvas=document.createElement('canvas');canvas.width=villageTerrain.width;canvas.height=villageTerrain.height;
  const ctx=canvas.getContext('2d');ctx.lineJoin='round';
  const sky=ctx.createLinearGradient(0,0,0,640);sky.addColorStop(0,'#9cae9a');sky.addColorStop(.58,'#c1c39c');sky.addColorStop(1,'#e0c999');ctx.fillStyle=sky;ctx.fillRect(0,0,3600,650);
  orb(ctx,620,154,79,'rgba(255,231,174,.28)');
  poly(ctx,[[0,420],[250,320],[510,383],[780,275],[1070,389],[1380,286],[1640,373],[1920,286],[2210,388],[2480,283],[2750,390],[3070,292],[3380,383],[3600,310],[3600,660],[0,660]],'#82947b');
  poly(ctx,[[0,474],[310,386],[620,452],[944,352],[1220,438],[1565,351],[1850,445],[2160,361],[2480,448],[2810,354],[3110,446],[3440,365],[3600,405],[3600,660],[0,660]],'#657e6c');
  for(const [x,y,size,color] of [[105,590,180,'#506b58'],[875,579,160,'#6d8064'],[1465,570,190,'#526e5b'],[2525,576,175,'#58735d'],[3380,578,200,'#526d5a']]) tree(ctx,x,y,size,color);
  // Distant cottages frame the lane; each has its own roof, trim and window rhythm.
  cottage(ctx,380,610,260,210,'#c4b595','#72574c',0);
  cottage(ctx,1030,598,288,246,'#d1c09c','#725147',1);
  cottage(ctx,1575,606,255,205,'#b8b79b','#625148',2);
  cottage(ctx,2240,618,362,286,'#d1b88e','#795348',3);
  // Road, cobbles, grassy banks, path lights and small village plantings.
  poly(ctx,[[0,635],[450,635],[900,620],[1500,620],[2100,635],[2760,635],[3170,630],[3600,630],[3600,900],[0,900]],'#687c60');
  for(let i=0;i<76;i++) {
    const x=(i*137+43)%3600, y=660+(i*71)%188;
    path(ctx,[[x,y],[x+9,y-3]],i%3?'#829074':'#536c56',2);
  }
  path(ctx,[[0,649],[450,649],[900,634],[1500,634],[2100,649],[2760,649],[3170,644],[3600,644]],'#9a8c6b',44);
  path(ctx,[[0,644],[450,644],[900,629],[1500,629],[2100,644],[2760,644],[3170,639],[3600,639]],'#c8b68c',30);
  path(ctx,[[0,632],[450,632],[900,617],[1500,617],[2100,632],[2760,632],[3170,627],[3600,627]],'#e0d0a8',4);
  for(let x=120;x<3500;x+=180) {
    const y=surfaceAt(villageTerrain.byId.get('village-road'),x)+26;
    orb(ctx,x,y,8,'#a69877');orb(ctx,x+24,y+4,7,'#8b806a');
    if(x%360===120) {path(ctx,[[x-48,y+16],[x+52,y+16]],'#9e875f',4);}
  }
  for(const x of [735,1265,1870,2435,2870,3475]) {
    const y=surfaceAt(villageTerrain.byId.get('village-road'),x);
    path(ctx,[[x,y-6],[x,y-120]],'#594b3a',7);path(ctx,[[x-17,y-118],[x+17,y-118]],'#594b3a',5);
    poly(ctx,[[x-13,y-118],[x+13,y-118],[x+10,y-89],[x-10,y-89]],'#604b39');
    orb(ctx,x,y-103,6,'#ffd995');orb(ctx,x,y-103,27,'rgba(255,204,123,.15)');
  }
  // Existing eastern arch and clear home plot retain their world-space locations.
  poly(ctx,[[2450,633],[2550,613],[2760,617],[2760,671],[2538,661]],'#82785e');
  path(ctx,[[2480,631],[2580,625],[2760,632]],'#c0a97a',20);path(ctx,[[2490,638],[2600,633],[2760,638]],'#a48e68',3);
  poly(ctx,[[2579,637],[2583,481],[2605,454],[2633,447],[2661,454],[2684,481],[2688,637]],'#665345');
  poly(ctx,[[2600,637],[2603,487],[2620,466],[2633,462],[2648,466],[2665,487],[2667,637]],'#33443d');
  path(ctx,[[2582,500],[2605,470],[2633,459],[2660,470],[2680,500]],'#b69b6c',8);path(ctx,[[2596,520],[2671,520]],'#987c59',6);
  for(const x of [2592,2675]) {path(ctx,[[x,625],[x,507]],'#806448',7);path(ctx,[[x-10,510],[x+10,510]],'#c1a574',5);}
  poly(ctx,[[2604,545],[2626,522],[2643,540],[2662,514],[2680,547]],'#74846a');poly(ctx,[[2618,552],[2640,530],[2660,553],[2674,535],[2681,562]],'#506e5d');
  poly(ctx,[[2760,630],[2920,619],[3240,625],[3600,632],[3600,676],[3230,660],[2900,656]],'#8f886a');
  path(ctx,[[2760,635],[2950,634],[3200,641],[3600,645]],'#c2aa7c',12);
  for(const x of [2835,2960,3430,3550]) tree(ctx,x,633,92,'#668064');
  // Neighbors have distinct faces, hair, clothes and small details instead of repeated faceless blocks.
  const floor=villageTerrain.byId.get('village-road');
  for(const [x,color,style] of [[580,'#765c70',0],[760,'#677e6c',1],[1330,'#7d6376',2],[1530,'#5c7765',3],[1850,'#a47c5e',4],[2480,'#566d81',5],[2890,'#8b7362',6]]) person(ctx,x,surfaceAt(floor,x),color,style);
  if(rootdeepUnlocked) {
    dwarf(ctx,1772,surfaceAt(floor,1772),'#57766a','#645044');
    dwarf(ctx,1855,surfaceAt(floor,1855),'#7a6452','#d0a66e');
  }
  return canvas;
}

export function buildHouseArt() {
  const canvas=document.createElement('canvas');canvas.width=houseTerrain.width;canvas.height=houseTerrain.height;
  const ctx=canvas.getContext('2d');ctx.lineJoin='round';
  const wall=ctx.createLinearGradient(0,80,0,650);wall.addColorStop(0,'#76614d');wall.addColorStop(.56,'#a27c57');wall.addColorStop(1,'#d0ae7e');ctx.fillStyle=wall;ctx.fillRect(0,0,1360,650);
  // Heavy beams, carved wall panels and a garland soften the big hall.
  for(let x=55;x<1360;x+=250) {path(ctx,[[x,70],[x,647]],'#493b31',20);path(ctx,[[x+15,91],[x+15,627]],'#c49a67',4);}
  path(ctx,[[0,115],[1360,115]],'#4b3d32',19);path(ctx,[[0,147],[1360,147]],'#c39b6a',5);
  for(let x=115;x<1280;x+=155) {
    poly(ctx,[[x,180],[x+48,184],[x+37,224],[x+9,224]],x%2?'#9b665c':'#657f70');
    orb(ctx,x+23,230,5,'#e5c887');
  }
  for(const x of [250,680,1110]) {
    poly(ctx,[[x-77,207],[x+77,207],[x+77,368],[x-77,368]],'#45382e');
    poly(ctx,[[x-63,219],[x+63,219],[x+63,355],[x-63,355]],'#a7c3b4');
    orb(ctx,x+20,267,30,'rgba(245,219,155,.45)');
    path(ctx,[[x,222],[x,353]],'#755840',8);path(ctx,[[x-62,286],[x+62,286]],'#755840',8);
    path(ctx,[[x-82,374],[x+82,374]],'#dbbb81',11);
    for(const dx of [-49,0,49]) {orb(ctx,x+dx,369,5,dx?'#c47c6c':'#d7b969');}
  }
  // Long celebration table with linen, carved legs, cake, fruit, and wine service.
  poly(ctx,[[273,520],[1090,520],[1150,558],[215,558]],'#574332');
  poly(ctx,[[235,548],[1124,548],[1102,582],[255,582]],'#c5a67a');
  path(ctx,[[304,575],[282,650]],'#60462f',18);path(ctx,[[1056,575],[1083,650]],'#60462f',18);
  path(ctx,[[440,574],[430,648]],'#6b5036',15);path(ctx,[[900,574],[913,648]],'#6b5036',15);
  poly(ctx,[[256,545],[1126,545],[1084,568],[293,568]],'#e8d7ae');
  for(let x=330;x<1080;x+=70) path(ctx,[[x,549],[x+31,562]],'#f4e8c9',2);
  // Cake on a raised platter, with frosting, berries and candles.
  path(ctx,[[563,522],[788,522]],'#8d6746',6);orb(ctx,675,518,75,'#dbc49a');
  poly(ctx,[[614,510],[614,457],[735,457],[735,510]],'#d8a875');
  poly(ctx,[[607,465],[607,446],[742,446],[742,465]],'#f2e6cc');
  path(ctx,[[617,466],[631,480],[644,464],[660,482],[678,464],[696,481],[715,464],[732,477]],'#f4e7d3',7);
  for(const [x,y] of [[632,448],[659,447],[686,447],[716,448]]) {path(ctx,[[x,y],[x,y-22]],'#d6b66e',3);orb(ctx,x,y-25,4,'#f3cb78');}
  for(const [x,y,c] of [[639,484,'#a14f49'],[675,489,'#6e7850'],[710,483,'#a14f49'],[654,503,'#eee0be'],[699,501,'#eee0be']]) orb(ctx,x,y,4,c);
  // Goblets of red wine and a bottle read clearly as celebration props.
  for(const x of [390,515,818,950,1030]) {
    poly(ctx,[[x-11,500],[x+11,500],[x+8,520],[x+3,526],[x+3,539],[x+12,542],[x-12,542],[x-3,539],[x-3,526],[x-8,520]],'#d7d1ad');
    path(ctx,[[x-8,506],[x+8,506]],'#8d3f42',7);path(ctx,[[x-11,543],[x+11,543]],'#dfd1a7',2);
  }
  poly(ctx,[[856,481],[882,481],[879,522],[859,522]],'#70433c');path(ctx,[[860,480],[860,468],[878,468],[878,480]],'#c1a46d',4);
  // Guests gather on both sides of the feast; silhouettes have visible faces and garments.
  for(const [x,color,style] of [[330,'#8d6e77',0],[465,'#667c6a',1],[848,'#657995',2],[1012,'#9a7658',3]]) guestWithWine(ctx,x,650,color,style);
  poly(ctx,[[0,650],[1360,650],[1360,900],[0,900]],'#66533f');
  for(let x=0;x<1360;x+=92) path(ctx,[[x,666],[x+26,900]],'#594632',3);
  for(let y=698;y<900;y+=78) path(ctx,[[0,y],[1360,y]],'#786044',2);
  poly(ctx,[[189,681],[1170,681],[1260,810],[88,810]],'#9a7057');
  poly(ctx,[[235,697],[1129,697],[1190,793],[162,793]],'#c5a279');
  for(let x=220;x<1150;x+=72) path(ctx,[[x,700],[x+60,790]],'#a77b62',3);
  // Hearth glow and hanging lanterns warm the room without animated effects.
  poly(ctx,[[38,650],[38,426],[175,426],[175,650]],'#594b3b');poly(ctx,[[57,644],[57,466],[156,466],[156,644]],'#302f2b');
  poly(ctx,[[72,638],[91,570],[112,621],[132,556],[151,640]],'#e9a45e');orb(ctx,110,595,76,'rgba(255,167,83,.2)');
  for(const x of [200,590,955,1210]) {
    path(ctx,[[x,0],[x,75]],'#45392f',4);poly(ctx,[[x-16,70],[x+16,70],[x+13,107],[x-13,107]],'#614a36');orb(ctx,x,89,8,'#f5d58d');orb(ctx,x,89,34,'rgba(255,203,117,.16)');
  }
  return canvas;
}

export function paintRestoredKing(ctx) {
  const landmark=villageLandmarks.find(item=>item.id==='restored-king');
  const x=landmark.x,y=landmark.y;
  person(ctx,x,y,'#486273',1);
  poly(ctx,[[x-19,y-100],[x-13,y-120],[x-6,y-105],[x,y-129],[x+7,y-105],[x+14,y-120],[x+20,y-100]],'#d4b86f');
  for(const [dx,color] of [[-10,'#f4bfca'],[0,'#e7d5a0'],[10,'#d1b5e3']]) orb(ctx,x+dx,y-83,5,color);
}

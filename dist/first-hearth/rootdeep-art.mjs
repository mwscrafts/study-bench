import { random, poly, path, orb, stone } from './camp-art.mjs?v=15';
import { rootdeepTerrain, rootdeepLights, rootdeepLandmarks, rootdeepBranchLanterns } from './rootdeep.mjs?v=9';

const { width, height, floor, ledges } = rootdeepTerrain;

function rootLantern(ctx, x, y, scale = 1) {
  path(ctx,[[x-12*scale,y+19*scale],[x-12*scale,y-20*scale],[x,y-20*scale]],'#765c43',4*scale);
  poly(ctx,[[x-10*scale,y-18*scale],[x+9*scale,y-18*scale],[x+11*scale,y+3*scale],[x-10*scale,y+3*scale]],'#433a31');
  poly(ctx,[[x-6*scale,y-14*scale],[x+6*scale,y-14*scale],[x+7*scale,y],[x-6*scale,y]],'#ffd08a');
  orb(ctx,x,y-7*scale,19*scale,'#ffcb7038');
}

function rootLadder(ctx, x, top, bottom) {
  const width = 44;
  path(ctx,[[x-width/2,top],[x-width/2,bottom],[x+width/2,bottom],[x+width/2,top]],'#745a3f',8);
  path(ctx,[[x-width/2+8,top],[x-width/2+8,bottom]],'#b29368',3);
  path(ctx,[[x+width/2-8,top],[x+width/2-8,bottom]],'#b29368',3);
  for(let y=top+18;y<bottom-4;y+=34) path(ctx,[[x-width/2+3,y],[x+width/2-3,y]],'#c2a274',5);
}

function caveWallDetails(ctx) {
  const rand = random(20261111);
  ctx.save();
  ctx.globalAlpha = .32;
  for (let i = 0; i < 138; i++) {
    const x = 24 + rand() * (width - 48);
    const y = 40 + rand() * (height - 420);
    const w = 18 + rand() * 56;
    const h = 10 + rand() * 34;
    stone(ctx, x, y, w, h, i % 3 === 0 ? '#4c5a50' : i % 3 === 1 ? '#40504b' : '#364648');
  }
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = .24;
  for (let i = 0; i < 74; i++) {
    const x = 35 + rand() * (width - 70);
    const y = 60 + rand() * (height - 500);
    const lean = (rand() - .5) * 54;
    const drop = 18 + rand() * 52;
    path(ctx, [[x, y], [x + lean * .35, y + drop * .35], [x + lean, y + drop]],
      i % 2 ? '#718076' : '#27383a', 1.3 + rand() * 1.2);
  }
  ctx.restore();
}

function ledgeFace(ctx, surface, index) {
  const top=surface.points;
  const bottom=top.map(([x,y],i)=>[x+(i===0?20:-10),y+36+(i%3)*9]).reverse();
  poly(ctx,[...top,...bottom],index%2?'#414a49':'#4c5149');
  poly(ctx,[top[0],top[1],bottom.at(-2),bottom.at(-1)],'#596052');
  path(ctx,top,'#99a080',4);
  path(ctx,[[top[0][0]+28,top[0][1]+13],[top.at(-1)[0]-35,top.at(-1)[1]+17]],'#6d725e',3);
  const rand=random(index*481+71);
  for(let i=0;i<5;i++){
    const x=90+rand()*1740, y=top[0][1]+15+rand()*24;
    stone(ctx,x,y,16+rand()*30,7+rand()*12, i%2?'#5e6454':'#66715f');
  }
}

function rootfall(ctx) {
  const x=960;
  poly(ctx,[[852,0],[1010,0],[970,190],[1045,310],[902,496],[935,700],[835,860],[965,1065],[850,1250],[1004,1460],[875,1640],[1000,1850],[865,2070],[974,2290],[852,2500],[1012,2700],[858,2920],[970,3120],[850,3350],[1022,3540],[862,3760],[980,3960],[848,4180],[1005,4410],[932,4860],[786,4860],[842,4480],[758,4260],[876,4070],[782,3860],[888,3640],[760,3430],[880,3220],[774,3000],[910,2780],[758,2590],[882,2380],[770,2180],[900,1960],[770,1740],[885,1550],[760,1340],[887,1140],[768,940],[895,750],[784,560],[896,375],[810,195]],'#26363a');
  path(ctx,[[895,0],[850,230],[923,390],[838,570],[915,760],[845,950],[918,1140],[844,1340],[930,1540],[843,1740],[930,1950],[850,2170],[928,2390],[846,2600],[934,2800],[852,3020],[932,3220],[842,3440],[938,3650],[842,3870],[925,4080],[840,4290],[930,4520],[890,4860]],'#697568',8);
  path(ctx,[[1010,70],[964,250],[1036,410],[945,590],[1020,770],[954,960],[1035,1140],[950,1330],[1030,1540],[944,1750],[1032,1950],[948,2180],[1034,2370],[946,2590],[1034,2800],[951,3020],[1037,3220],[948,3430],[1038,3650],[950,3850],[1031,4070],[951,4280],[1037,4500]],'#364648',5);
}

function settlement(ctx) {
  const y=1920;
  const house=(x,w,body,roof,door,windowColor)=>{
    poly(ctx,[[x,y-4],[x+18,y-138],[x+w*.22,y-183],[x+w*.78,y-183],[x+w-16,y-139],[x+w,y-4]],body);
    poly(ctx,[[x+8,y-136],[x+w*.22,y-198],[x+w*.78,y-198],[x+w-8,y-136]],roof);
    path(ctx,[[x+7,y-137],[x+w*.22,y-201],[x+w*.78,y-201],[x+w-7,y-137]],'#c3a372',6);
    for(const wx of [x+58,x+w-58]){
      poly(ctx,[[wx-25,y-118],[wx+25,y-118],[wx+25,y-62],[wx-25,y-62]],'#354144');
      poly(ctx,[[wx-18,y-111],[wx+18,y-111],[wx+18,y-69],[wx-18,y-69]],windowColor);
      path(ctx,[[wx,y-110],[wx,y-69]],'#6b5c47',4);
      path(ctx,[[wx-18,y-90],[wx+18,y-90]],'#6b5c47',4);
    }
    poly(ctx,[[door-29,y-70],[door+29,y-70],[door+29,y-4],[door-29,y-4]],'#293438');
    poly(ctx,[[door-21,y-4],[door-21,y-61],[door+21,y-61],[door+21,y-4]],'#694d39');
    orb(ctx,door+12,y-34,3,'#f3cb7d');
    path(ctx,[[x+27,y-10],[x+w-27,y-10]],'#8b795a',3);
  };
  // Each doorway aligns with an interactable home entrance in rootdeep.mjs.
  house(86,315,'#626d5d','#59604a',245,'#e6b36e');
  house(460,320,'#566665','#6e6554',620,'#cfdbb1');
  house(1050,305,'#69604f','#78604a',1200,'#f0c27b');
  // Three work spots make the daily routes legible even when residents are at home.
  path(ctx,[[409,y],[409,y-80],[447,y-80],[447,y]],'#80664b',7);
  for(const xx of [421,441]) {
    poly(ctx,[[xx-9,y-78],[xx+9,y-78],[xx+10,y-47],[xx-9,y-47]],'#53493a');
    poly(ctx,[[xx-5,y-73],[xx+5,y-73],[xx+6,y-52],[xx-5,y-52]],'#d5ab70');
  }
  poly(ctx,[[775,y],[775,y-31],[836,y-31],[836,y]],'#736c5b');
  stone(ctx,801,y-33,26,27,'#a29e81');
  path(ctx,[[822,y-49],[838,y-70]],'#b49b70',5);
  poly(ctx,[[1294,y],[1294,y-46],[1371,y-46],[1371,y]],'#806347');
  for(const xx of [1310,1334,1353]) {
    orb(ctx,xx,y-49,9,'#759f86');
    path(ctx,[[xx,y-51],[xx+3,y-65]],'#b7d6b1',2);
  }
  // A central lantern, low fire, and banners make the settlement’s safe hub unmistakable.
  path(ctx,[[845,y-7],[845,y-157],[998,y-157],[998,y-7]],'#916d45',10);
  path(ctx,[[857,y-145],[986,y-145]],'#c19b65',6);
  poly(ctx,[[869,y-142],[895,y-142],[895,y-92],[882,y-78],[869,y-92]],'#d2b16b');
  poly(ctx,[[947,y-142],[973,y-142],[973,y-92],[960,y-78],[947,y-92]],'#d2b16b');
  rootLantern(ctx,921,y-78,1.25);
  poly(ctx,[[882,y-8],[903,y-41],[940,y-41],[962,y-8]],'#57473a');
  poly(ctx,[[906,y-9],[914,y-31],[926,y-53],[937,y-29],[945,y-9]],'#ffc56e');
  orb(ctx,924,y-27,70,'rgba(255,192,107,.2)');
  // Dorrin’s open-front forge sits beside the east end of the safe landing.
  poly(ctx,[[1390,y-4],[1406,y-139],[1465,y-178],[1649,y-178],[1705,y-137],[1720,y-4]],'#4b5550');
  poly(ctx,[[1424,y-5],[1437,y-129],[1482,y-159],[1633,y-159],[1677,y-129],[1688,y-5]],'#6d715c');
  poly(ctx,[[1454,y-133],[1497,y-178],[1617,y-178],[1660,y-133]],'#665342');
  path(ctx,[[1448,y-133],[1496,y-183],[1618,y-183],[1667,y-133]],'#b59a6e',6);
  poly(ctx,[[1490,y-4],[1490,y-82],[1628,y-82],[1628,y-4]],'#292f30');
  poly(ctx,[[1502,y-10],[1502,y-70],[1616,y-70],[1616,y-10]],'#dc9251');
  path(ctx,[[1502,y-72],[1617,y-72]],'#c8955d',5);
  poly(ctx,[[1335,y-12],[1380,y-12],[1380,y-52],[1335,y-52]],'#70583e');
  path(ctx,[[1340,y-34],[1375,y-34]],'#a8875c',4);
}

function brokenWinch(ctx,repaired=false) {
  const x=310,y=810;
  // The snapped cable marks the repair objective; completion turns this into the level shortcut.
  path(ctx,[[x-104,y],[x-104,y-194],[x+110,y-194],[x+110,y]],'#775f43',12);
  path(ctx,[[x-97,y-151],[x+97,y-151]],'#a4875d',8);
  path(ctx,[[x-81,y-10],[x-37,y-145],[x+61,y-10]],'#836849',9);
  orb(ctx,x+8,y-82,47,'#342f2b'); orb(ctx,x+8,y-82,30,'#896b48'); orb(ctx,x+8,y-82,14,'#293438');
  path(ctx,[[x+8,y-129],[x+8,y-35]],'#c0a16c',7); path(ctx,[[x-37,y-82],[x+54,y-82]],'#c0a16c',7);
  if(repaired){
    path(ctx,[[x+12,y-190],[x+12,y-87],[x+100,y-87]],'#d5a65e',5);
    path(ctx,[[x+94,y-87],[x+105,y-74],[x+116,y-87]],'#d5a65e',4);
    path(ctx,[[x-78,y-12],[x-60,y-46],[x+72,y-46],[x+88,y-12]],'#554635',9);
    path(ctx,[[x-51,y-36],[x+61,y-36]],'#b49567',6);
  }else{
    path(ctx,[[x+12,y-190],[x+12,y-139],[x+33,y-117]],'#9b8159',5);
    path(ctx,[[x+33,y-117],[x+57,y-111]],'#d5a65e',4); path(ctx,[[x+50,y-108],[x+66,y-96],[x+73,y-107]],'#d5a65e',4);
    path(ctx,[[x-84,y-12],[x-12,y-56]],'#554635',10);
    poly(ctx,[[x-17,y-9],[x+69,y-9],[x+85,y-30],[x-3,y-33]],'#765b42');
  }
  rootLantern(ctx,x+140,y-10,.9);
}

function glowcapGrotto(ctx) {
  const y=1370;
  for(const [x,s] of [[170,1.15],[355,.72],[650,1],[950,.8],[1235,1.2],[1510,.92],[1760,.62]]){
    const stem=27*s, cap=24*s;
    path(ctx,[[x,y],[x,y-stem]],'#8eaa8e',5*s);
    poly(ctx,[[x-cap,y-stem],[x-cap*.72,y-stem-cap*.62],[x,y-stem-cap],[x+cap*.72,y-stem-cap*.62],[x+cap,y-stem]],'#87d7c5');
    path(ctx,[[x-cap+4,y-stem-2],[x+cap-4,y-stem-2]],'#c9f3dc',3*s);
    orb(ctx,x,y-stem-cap/2,cap*2.6,'rgba(118,231,202,.16)');
    for(const dx of [-cap*.45,cap*.4]) orb(ctx,x+dx,y-stem-cap*.48,2.5*s,'#e2fff0');
  }
  for(const [x,h] of [[88,77],[520,90],[1090,72],[1660,96]]){
    poly(ctx,[[x,y],[x+12,y-h],[x+22,y],[x+36,y-h*.64],[x+49,y]],'#3f524a');
  }
}

function galleryDetails(ctx) {
  const y=2490;
  // Two framed side galleries and paired rails make the ore branches visible at a glance.
  for(const x of [215,1340]){
    path(ctx,[[x,y-11],[x,y-112],[x+230,y-112],[x+230,y-11]],'#765c42',9);
    path(ctx,[[x+12,y-78],[x+217,y-78]],'#a2865f',5);
    path(ctx,[[x+30,y-4],[x+62,y-28],[x+93,y-4],[x+124,y-28],[x+155,y-4],[x+186,y-28],[x+216,y-4]],'#554a3b',7);
  }
  for(const [x,yy] of [[330,y-239],[1360,y-239],[900,y-3]]){
    poly(ctx,[[x-30,yy],[x-23,yy-38],[x-8,yy-52],[x+4,yy-26],[x+14,yy-62],[x+29,yy-40],[x+34,yy]],'#707f7b');
    path(ctx,[[x-21,yy-35],[x-8,yy-52],[x-1,yy-27],[x+14,yy-62]],'#c6d0b1',3);
  }
}

function floodedWorkings(ctx) {
  const y=3050;
  // The shallow pool is beneath a raised boardwalk; the continuous landing stays as a safe fallback.
  poly(ctx,[[520,y+8],[1315,y+8],[1382,y+28],[1305,y+100],[550,y+100],[488,y+40]],'#31595d');
  path(ctx,[[542,y+24],[698,y+18],[843,y+24],[1032,y+18],[1240,y+24]],'#8abbb0',4);
  for(const x of [610,790,1030,1225]){
    path(ctx,[[x,y+85],[x,y-74]],'#8d7251',9); path(ctx,[[x-22,y+85],[x+22,y+85]],'#776347',8);
  }
  path(ctx,[[515,y-78],[1325,y-78]],'#896c4c',12); path(ctx,[[540,y-66],[1300,y-66]],'#bd9a67',5);
  for(let x=580;x<1280;x+=88) path(ctx,[[x,y-70],[x+16,y-88]],'#584c3b',4);
  // A turning wheel, cable, and counterweight provide a second landmark for the flooded level.
  orb(ctx,1535,y-128,75,'#393f3b'); orb(ctx,1535,y-128,58,'#7c6a4c'); orb(ctx,1535,y-128,19,'#394246');
  for(let i=0;i<8;i++){
    const a=i*Math.PI/4;
    path(ctx,[[1535+Math.cos(a)*20,y-128+Math.sin(a)*20],[1535+Math.cos(a)*57,y-128+Math.sin(a)*57]],'#b3996d',6);
  }
  path(ctx,[[1535,y-205],[1535,y-253],[1735,y-253],[1735,y-8]],'#80684a',7);
  poly(ctx,[[1700,y-10],[1770,y-10],[1760,y-79],[1710,y-79]],'#765d43');
  rootLantern(ctx,420,y-10,.8);
}

function shadowRoots(ctx) {
  const y=3610;
  for(const [x,reach,lean] of [[120,430,1],[430,330,-1],[770,480,1],[1150,380,-1],[1510,480,1],[1800,310,-1]]){
    path(ctx,[[x,y+50],[x+lean*40,y-70],[x+lean*reach*.32,y-140],[x+lean*reach*.42,y-260]],'#392f35',19);
    path(ctx,[[x+lean*reach*.32,y-140],[x+lean*(reach*.66),y-174],[x+lean*reach,y-212]],'#44343c',13);
    path(ctx,[[x+lean*reach*.38,y-215],[x+lean*reach*.42,y-260]],'#8e5786',4);
    orb(ctx,x+lean*reach*.42,y-260,19,'rgba(164,88,153,.18)');
  }
  for(const [x,yy] of [[300,y-12],[890,y-6],[1480,y-9]]){
    orb(ctx,x,yy-31,35,'rgba(139,88,155,.18)');
    poly(ctx,[[x-18,yy],[x-12,yy-26],[x,yy-42],[x+10,yy-23],[x+19,yy]],'#674c6d');
    path(ctx,[[x-9,yy-27],[x,yy-42],[x+10,yy-23]],'#c891cf',3);
  }
}

function rootboundEntrance(ctx) {
  const x=105,y=250;
  // The open root arch sits behind the player at the return route; it reads as a doorway, not a ledge hole.
  poly(ctx,[[x-70,y+6],[x-64,y-83],[x-34,y-135],[x+35,y-135],[x+66,y-82],[x+73,y+6]],'#354644');
  poly(ctx,[[x-49,y+4],[x-46,y-78],[x-25,y-112],[x+26,y-112],[x+47,y-77],[x+50,y+4]],'#202f33');
  path(ctx,[[x-60,y-83],[x-33,y-130],[x+34,y-130],[x+60,y-83]],'#a38a61',7);
  poly(ctx,[[x-26,y+2],[x-26,y-47],[x,y-68],[x+27,y-47],[x+27,y+2]],'#526957');
  orb(ctx,x,y-36,42,'rgba(183,218,165,.18)');
  rootLantern(ctx,x-84,y,.72);
}

function deepSeal(ctx) {
  const seal = rootdeepLandmarks.find(item => item.id === 'deep-seal');
  const { x, y } = seal;
  // A carved alcove sits directly on the eighth landing, behind its interaction point.
  poly(ctx,[[x-330,y+12],[x-318,y-154],[x-266,y-248],[x-183,y-306],[x-84,y-338],
    [x+104,y-338],[x+218,y-286],[x+294,y-207],[x+334,y-106],[x+343,y+12]],'#253538');
  poly(ctx,[[x-276,y+8],[x-265,y-153],[x-211,y-236],[x-150,y-273],[x+151,y-273],
    [x+225,y-220],[x+273,y-149],[x+282,y+8]],'#46514c');
  poly(ctx,[[x-228,y+4],[x-219,y-142],[x-177,y-203],[x-119,y-237],[x+122,y-237],
    [x+182,y-202],[x+222,y-136],[x+231,y+4]],'#303e40');
  path(ctx,[[x-274,y-155],[x-220,y-240],[x-151,y-279],[x+150,y-279],[x+224,y-224],[x+279,y-151]],'#9a8a67',8);
  // Block seams make this read as dwarven masonry set into natural stone.
  for (const side of [-1,1]) {
    const sx = x + side * 190;
    path(ctx,[[sx-side*28,y-191],[sx+side*16,y-191]],'#758078',3);
    path(ctx,[[sx-side*36,y-130],[sx+side*32,y-130]],'#758078',3);
    path(ctx,[[sx-side*43,y-68],[sx+side*39,y-68]],'#758078',3);
    path(ctx,[[sx,y-227],[sx,y-196]],'#758078',3);
    // Old, unlit lantern brackets flank the sealed passage.
    path(ctx,[[x+side*244,y-12],[x+side*244,y-83],[x+side*220,y-83]],'#715b43',7);
    poly(ctx,[[x+side*215,y-79],[x+side*192,y-79],[x+side*192,y-38],[x+side*215,y-38]],'#394443');
    poly(ctx,[[x+side*210,y-73],[x+side*198,y-73],[x+side*198,y-44],[x+side*210,y-44]],'#657067');
  }
  // The door is an intact stone slab, not an open passage.
  poly(ctx,[[x-105,y+2],[x-105,y-150],[x-83,y-176],[x+83,y-176],[x+105,y-150],[x+105,y+2]],'#1c2b31');
  poly(ctx,[[x-83,y],[x-83,y-141],[x-68,y-157],[x+68,y-157],[x+83,y-141],[x+83,y]],'#344348');
  path(ctx,[[x-102,y-145],[x-79,y-174],[x+79,y-174],[x+102,y-145]],'#b49a6b',7);
  path(ctx,[[x-76,y-8],[x-76,y-133],[x-55,y-151]],'#6b7469',3);
  path(ctx,[[x+76,y-8],[x+76,y-133],[x+55,y-151]],'#6b7469',3);
  // A sealed rootglass mark gives the chamber a focal point without opening it.
  orb(ctx,x,y-89,76,'rgba(119,190,177,.10)');
  ctx.save();
  ctx.strokeStyle='#87a99d'; ctx.lineWidth=5; ctx.globalAlpha=.78;
  ctx.beginPath(); ctx.ellipse(x,y-96,31,46,0,0,Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x,y-144); ctx.lineTo(x,y-48);
  ctx.moveTo(x-26,y-110); ctx.lineTo(x+26,y-82);
  ctx.moveTo(x+26,y-110); ctx.lineTo(x-26,y-82); ctx.stroke();
  ctx.restore();
  path(ctx,[[x-97,y-42],[x-61,y-63],[x-40,y-48]],'#765b70',5);
  path(ctx,[[x+97,y-42],[x+61,y-63],[x+40,y-48]],'#765b70',5);
  // Broken stone and rootglass chips at the threshold.
  stone(ctx,x-141,y+4,45,25,'#596459');
  stone(ctx,x+151,y+5,54,29,'#4e5c56');
  stone(ctx,x-105,y-4,24,13,'#71827b');
  stone(ctx,x+103,y-3,31,18,'#62716b');
}

export function buildRootdeepArt(winchRepaired=false) {
  const canvas=document.createElement('canvas');
  canvas.width=width; canvas.height=height;
  const ctx=canvas.getContext('2d'); ctx.lineJoin='round';
  const rand=random(672019);
  const background=ctx.createLinearGradient(0,0,0,height);
  background.addColorStop(0,'#192a30'); background.addColorStop(.52,'#293a3a'); background.addColorStop(1,'#172a30');
  ctx.fillStyle=background; ctx.fillRect(0,0,width,height);
  // Deep, overlapping stone faces keep the mine readable across its long vertical drop.
  for(let i=0;i<58;i++){
    const x=rand()*width, y=rand()*height, w=90+rand()*300, h=180+rand()*440;
    poly(ctx,[[x-w/2,y-h/2],[x-w*.24,y-h/2-35],[x+w*.46,y-h*.37],[x+w/2,y+h*.34],[x+w*.1,y+h/2],[x-w*.4,y+h*.31]],i%2?'#304342':'#354744');
    poly(ctx,[[x-w/2,y-h/2],[x-w*.24,y-h/2-35],[x-w*.05,y+h*.1],[x-w*.4,y+h*.31]],'#405249');
  }
  caveWallDetails(ctx);
  rootfall(ctx);
  // Bedrock and floor.
  const earth=ctx.createLinearGradient(0,4700,0,height);
  earth.addColorStop(0,'#596153'); earth.addColorStop(.45,'#394747'); earth.addColorStop(1,'#1b3037');
  poly(ctx,[...floor.points,[width,height],[0,height]],earth);
  path(ctx,floor.points,'#9aa07b',5);
  for(const surface of ledges) ledgeFace(ctx,surface,Number(surface.id.match(/level-(\d+)/)?.[1]||1));
  const levels=ledges.filter(surface=>surface.id.startsWith('rootdeep-level-'));
  // Old support frames make the landings feel like a connected mine, not floating platforms.
  levels.forEach((surface,index)=>{
    const [x,y]=surface.points[0], [right]=surface.points.at(-1);
    const mid=(x+right)/2;
    path(ctx,[[mid-86,y+25],[mid-86,y+120],[mid+86,y+120],[mid+86,y+25]],'#675745',10);
    path(ctx,[[mid-86,y+50],[mid+86,y+50]],'#9a7956',5);
    if(index%2===0) path(ctx,[[mid-76,y+118],[mid-18,y+53],[mid+4,y+53],[mid+74,y+118]],'#7d6549',5);
  });
  // Short wooden ladders join the landings into the continuous climbable shaft.
  levels.forEach((surface,index)=>{
    const y=surface.points[0][1];
    const top=index===0 ? Math.max(0,y-190) : levels[index-1].points[0][1]+18;
    rootLadder(ctx,1780,top,y+8);
  });
  rootLadder(ctx,1780,levels.at(-1).points[0][1]+18,floor.points[0][1]+8);
  rootboundEntrance(ctx);
  brokenWinch(ctx,winchRepaired);
  glowcapGrotto(ctx);
  galleryDetails(ctx);
  floodedWorkings(ctx);
  shadowRoots(ctx);
  settlement(ctx);
  // Pools and ore-vein glints on the lowest two levels.
  poly(ctx,[[1430,3070],[1530,3046],[1770,3053],[1870,3078],[1840,3100],[1510,3096]],'#41676a');
  path(ctx,[[1475,3068],[1560,3059],[1640,3061]],'#a8d6c6',3);
  for(const [x,y] of [[1550,2470],[410,3032],[260,4150]]) {
    orb(ctx,x,y-18,43,'#8edacb25');
    poly(ctx,[[x-22,y],[x-19,y-23],[x-8,y-35],[x+2,y-12],[x+5,y]],'#498c89');
    poly(ctx,[[x+5,y],[x+8,y-38],[x+22,y-49],[x+30,y-25],[x+25,y]],'#74bcb0');
    path(ctx,[[x+8,y-37],[x+22,y-49],[x+22,y-8]],'#c2f2de',2);
  }
  deepSeal(ctx);
  return canvas;
}

export function paintRootdeepTunnel(ctx, stage, clock) {
  const x=160,y=4860, open=stage==='open', lit=['assess','timber','open'].includes(stage);
  // Masonry, steel rails and fractured stone give the far-left tunnel a readable silhouette.
  poly(ctx,[[x-156,y+4],[x-156,y-105],[x-116,y-202],[x-65,y-252],[x+70,y-252],
    [x+127,y-194],[x+156,y-103],[x+156,y+4]],'#4b5752');
  poly(ctx,[[x-126,y+2],[x-126,y-102],[x-88,y-175],[x-48,y-207],[x+49,y-207],
    [x+93,y-170],[x+126,y-99],[x+126,y+2]],open?'#162d31':'#263237');
  for (const z of [-1,1]) {
    path(ctx,[[x+z*145,y],[x+z*145,y-119],[x+z*102,y-207]],'#b59a6c',10);
    path(ctx,[[x+z*133,y-87],[x+z*87,y-87]],'#899487',4);
  }
  path(ctx,[[x-106,y-210],[x-54,y-235],[x+56,y-235],[x+107,y-204]],'#a3a184',7);
  for (let i=0;i<5;i++) {
    const ry=y-12+i*9;
    path(ctx,[[x-115-i*9,ry],[x+112+i*9,ry]],'#8d7758',4);
  }
  if (!open) {
    for(const [dx,dy,w,h] of [[-70,-19,64,52],[0,-44,78,69],[70,-16,68,49],[-32,-105,62,52],[47,-111,61,52]])
      stone(ctx,x+dx,y+dy,w,h,'#68736a');
    path(ctx,[[x-118,y-68],[x-62,y-101],[x+5,y-58],[x+71,y-96],[x+127,y-67]],'#404a46',9);
  } else {
    for(const z of [-1,1]) path(ctx,[[x+z*90,y],[x+z*90,y-186],[x+z*49,y-212]],'#927657',11);
    path(ctx,[[x-99,y-174],[x+102,y-174]],'#b7935e',11);
  }
  if(lit){
    const glow=ctx.createRadialGradient(x,y-105,5,x,y-105,175);
    glow.addColorStop(0,'rgba(238,194,105,.35)'); glow.addColorStop(1,'rgba(238,194,105,0)');
    orb(ctx,x,y-105,175,glow);
    for(const dx of [-108,109]) orb(ctx,x+dx,y-120,8+Math.sin(clock*2+dx)*1.2,'#f9d48d');
  } else {
    for(const dx of [-108,109]) orb(ctx,x+dx,y-120,7,'#62716c');
  }
  // Newly braced supports appear only after Dorrin has identified the need for timber.
  if(open){
    for(const dx of [-85,85]) path(ctx,[[x+dx,y],[x+dx,y-175]],'#aa8051',14);
    path(ctx,[[x-85,y-170],[x+85,y-170]],'#d0a36d',12);
  }
  // A small cart remains visible before the route opens.
  poly(ctx,[[x+198,y-68],[x+305,y-68],[x+286,y-20],[x+217,y-20]],'#745c48');
  path(ctx,[[x+192,y-70],[x+312,y-70]],'#c5a46d',6);
  for(const dx of [224,282]) orb(ctx,x+dx,y-17,13,'#262d2c');
}

export function paintTunnelGuard(ctx,x,y,clock) {
  paintDorrin(ctx,x,y,clock,.52);
  // Iron-rimmed helmet and staff distinguish the guard from Dorrin.
  poly(ctx,[[x-24,y-46],[x-19,y-56],[x-8,y-61],[x+12,y-61],[x+23,y-54],[x+24,y-46]],'#697769');
  path(ctx,[[x-24,y-46],[x+24,y-46]],'#c0a474',5);
  path(ctx,[[x+26,y-2],[x+26,y-91]],'#967b52',6);
  orb(ctx,x+26,y-93,7,'#cfb477');
}

export function paintTunnelGoblin(ctx, goblin, clock) {
  const {x,y}=goblin, bob=Math.sin(clock*5+x)*2;
  ctx.save(); ctx.translate(x,y+bob);
  orb(ctx,0,-39,22,'rgba(109,145,74,.24)');
  poly(ctx,[[-22,-7],[-18,-48],[-9,-58],[11,-58],[22,-44],[20,-7]],'#627647');
  poly(ctx,[[-28,-51],[-44,-71],[-14,-66]],'#769457');
  poly(ctx,[[28,-51],[43,-71],[12,-66]],'#769457');
  orb(ctx,0,-61,24,'#758d51');
  for(const z of [-1,1]) {
    orb(ctx,z*9,-65,4,'#e3bc68');
    path(ctx,[[z*7,-35],[z*13,-26]],'#c7bb91',3);
  }
  path(ctx,[[-20,-12],[24,-19]],'#a17d54',6);
  ctx.restore();
}

export function paintRootdeepLights(ctx,camera,clock,night,glowcapLanternLit=false,branchLanternsLit=new Set()) {
  if(night>0){
    const veil=ctx.createLinearGradient(camera.x,camera.y,camera.x,camera.y+camera.height);
    veil.addColorStop(0,'rgba(10,17,31,'+(night*.24)+')');
    veil.addColorStop(1,'rgba(10,17,31,'+(night*.42)+')');
    ctx.fillStyle=veil; ctx.fillRect(camera.x,camera.y,camera.width,camera.height);
  }
  // Dark side passages remain visible from the nearby landing. Each restored lamp
  // warms only its own branch; the main galleries and other branches stay dangerous.
  for (const lamp of rootdeepBranchLanterns) {
    const lit = branchLanternsLit.has(lamp.id);
    const {x,y} = lamp;
    const shade = ctx.createRadialGradient(x,y-42,42,x,y-42,390);
    shade.addColorStop(0,lit?'rgba(12,23,27,.18)':'rgba(5,10,18,.72)');
    shade.addColorStop(.62,lit?'rgba(12,23,27,.12)':'rgba(5,10,18,.52)');
    shade.addColorStop(1,'rgba(5,10,18,0)');
    ctx.fillStyle=shade; ctx.fillRect(x-390,y-432,780,780);
    // The stone lip and hanging bracket read as a side passage even before repair.
    path(ctx,[[x-175,y-34],[x-116,y-125],[x+110,y-125],[x+172,y-35]],lit?'#718273':'#647075',7);
    path(ctx,[[x,y-126],[x,y-76]],'#887052',6);
    if (lit) {
      const pulse=.85+.15*Math.sin(clock*2+x);
      orb(ctx,x,y-77,204,'rgba(255,202,122,'+(pulse*.15)+')');
      rootLantern(ctx,x,y-70,1.2);
    } else {
      poly(ctx,[[x-17,y-80],[x+17,y-80],[x+19,y-45],[x-19,y-45]],'#29383b');
      poly(ctx,[[x-11,y-72],[x+11,y-72],[x+12,y-51],[x-12,y-51]],'#607575');
      path(ctx,[[x-20,y-82],[x+20,y-82]],'#92816a',4);
    }
  }
  for(const [x,y,r] of rootdeepLights){
    const pulse=.8+.2*Math.sin(clock*1.8+x);
    const glow=ctx.createRadialGradient(x,y,2,x,y,r);
    glow.addColorStop(0,'rgba(255,196,115,'+(pulse*.19)+')');
    glow.addColorStop(1,'rgba(255,196,115,0)');
    orb(ctx,x,y,r,glow); rootLantern(ctx,x,y,0.92);
  }
  // Turning in the Glowcaps visibly warms the safe settlement hub.
  if(glowcapLanternLit) orb(ctx,884,1840,250,'rgba(255,202,119,.16)');
}

export function paintRootglass(ctx,node,clock) {
  const {x,y}=node, pulse=.65+.35*Math.sin(clock*2.5+x);
  orb(ctx,x,y-22,39,'rgba(127,211,196,'+(pulse*.17)+')');
  poly(ctx,[[x-23,y],[x-17,y-34],[x-8,y-24],[x-3,y-51],[x+11,y-37],[x+19,y-45],[x+27,y-18],[x+22,y]],'#49918d');
  path(ctx,[[x-8,y-24],[x-3,y-51],[x+5,y-26]],'#c2f2df',3);
  if(pulse>.92) orb(ctx,x+22,y-53,3,'#dcfff0');
}

export function paintDorrin(ctx,x,y,clock,scale=.5) {
  ctx.save(); ctx.translate(x,y); ctx.scale(scale,scale);
  // Stocky little digger with soot-brown curls, beard, lantern and a bright chain.
  poly(ctx,[[-34,-49],[-32,-78],[-21,-96],[20,-96],[34,-77],[35,-49]],'#bf8d68');
  poly(ctx,[[-35,-49],[-31,-79],[-19,-95],[18,-95],[30,-80],[34,-49]],'#d0a17b');
  poly(ctx,[[-34,-49],[-26,-65],[-18,-57],[-9,-66],[1,-57],[10,-66],[20,-57],[31,-67],[35,-49]],'#4a382e');
  poly(ctx,[[-27,-48],[-18,-54],[-10,-48],[-2,-58],[7,-47],[17,-54],[26,-48],[24,-30],[12,-21],[0,-18],[-14,-24],[-26,-33]],'#73523c');
  ctx.fillStyle='#302720'; ctx.fillRect(-17,-76,3.2,3); ctx.fillRect(12,-76,3.2,3);
  path(ctx,[[-19,-81],[-12,-79]],'#533a2d',3); path(ctx,[[9,-79],[17,-81]],'#533a2d',3);
  // Broad shoulders and work apron.
  poly(ctx,[[-45,-46],[-58,-30],[-53,-5],[-39,-1],[-34,-19],[34,-19],[40,-1],[55,-4],[58,-31],[43,-47],[26,-55],[-25,-55]],'#51645b');
  poly(ctx,[[-26,-43],[25,-43],[20,-6],[-20,-6]],'#80684d');
  path(ctx,[[-20,-37],[0,-28],[21,-37]],'#edc75e',4);
  orb(ctx,0,-35,4,'#ffe49a');
  poly(ctx,[[-26,-20],[-29,0],[-8,0],[-4,-20]],'#534538');
  poly(ctx,[[6,-20],[10,0],[31,0],[27,-20]],'#534538');
  path(ctx,[[-27,-1],[-5,-1]],'#343632',5); path(ctx,[[9,-1],[33,-1]],'#343632',5);
  orb(ctx,44,-39,10,'#f5b968'); path(ctx,[[44,-28],[44,-17]],'#b39362',3);
  const flicker=.6+.4*Math.sin(clock*6);
  orb(ctx,44,-39,19,'rgba(255,190,103,'+(flicker*.15)+')');
  ctx.restore();
}

export function paintRootdeepSettler(ctx,x,y,clock=0,variant=0,scale=.46,moving=false) {
  ctx.save(); ctx.translate(x,y); ctx.scale(scale,scale);
  const coats=['#607066','#765e4a','#58656a','#796248'];
  poly(ctx,[[-30,-46],[-42,-30],[-36,-4],[-27,0],[-20,-15],[20,-15],[27,0],[37,-4],[42,-30],[30,-46]],coats[variant%coats.length]);
  poly(ctx,[[-19,-20],[19,-20],[16,-3],[-15,-3]],variant%2?'#8c7456':'#a3855e');
  poly(ctx,[[-20,-46],[-23,-70],[-14,-91],[13,-91],[22,-70],[20,-46]],'#c69b76');
  if(variant%3===0){
    poly(ctx,[[-24,-48],[-19,-58],[-11,-53],[-3,-64],[5,-53],[13,-60],[22,-52],[25,-43],[12,-28],[-5,-24],[-18,-31]],'#71523b');
    path(ctx,[[-11,-38],[10,-38]],'#ddc08a',3);
  }else{
    poly(ctx,[[-28,-70],[-24,-96],[0,-109],[25,-95],[29,-70]],variant%2?'#51473b':'#71614b');
    path(ctx,[[-25,-70],[25,-70]],'#b49365',5);
  }
  ctx.fillStyle='#302a25'; ctx.fillRect(-10,-75,3,3); ctx.fillRect(8,-75,3,3);
  const stride=moving?Math.sin(clock*11+x*.01)*9:0;
  poly(ctx,[[-22+stride,-4],[-25+stride,0],[-7+stride,0],[-5+stride,-5]],'#403930');
  poly(ctx,[[6-stride,-5],[8-stride,0],[26-stride,0],[24-stride,-4]],'#403930');
  const bob=Math.sin(clock*1.7+x*.01)*1.2;
  poly(ctx,[[-5,-90+bob],[5,-90+bob],[4,-87+bob],[-4,-87+bob]],'#46382d');
  ctx.restore();
}

export function paintGlowcap(ctx,node,clock=0) {
  const {x,y}=node, pulse=.78+.22*Math.sin(clock*2.6+x*.01);
  path(ctx,[[x,y],[x,y-30]],'#a5c3a1',6);
  poly(ctx,[[x-28,y-30],[x-21,y-48],[x,y-57],[x+22,y-48],[x+29,y-30]],'#7dd7c1');
  path(ctx,[[x-24,y-30],[x+25,y-30]],'#d1f5de',4);
  orb(ctx,x,y-42,66,'rgba(113,225,199,'+(pulse*.23)+')');
  for(const dx of [-12,11]) orb(ctx,x+dx,y-43,3,'#e9fff2');
}

export function paintRootdeepLift(ctx,x,y,open=false) {
  path(ctx,[[x-52,y],[x-52,y-112],[x+52,y-112],[x+52,y]],open?'#b49567':'#80684d',7);
  path(ctx,[[x-39,y],[x-39,y-88],[x+39,y-88],[x+39,y]],'#544c3d',5);
  path(ctx,[[x-45,y-65],[x+45,y-65]],'#a58960',4);
  poly(ctx,[[x-31,y-3],[x-31,y-51],[x+31,y-51],[x+31,y-3]],open?'#6b795f':'#3c4743');
  if(open) path(ctx,[[x-28,y-49],[x+28,y-49]],'#d5b270',4);
}

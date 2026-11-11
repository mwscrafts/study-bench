import { poly, path, orb, stone } from './camp-art.mjs';
import { villageHomeTerrain, lyssCabinTerrain } from './home-projects.mjs?v=1';

export function paintVillageHomeExterior(ctx,built) {
  const x=3190,y=630;
  if(!built) {
    poly(ctx,[[x-190,y+2],[x-156,y-19],[x+149,y-19],[x+191,y+2]],'#7c7258');
    path(ctx,[[x-174,y-10],[x-174,y-93],[x-140,y-93]],'#806b4a',8);
    path(ctx,[[x+166,y-10],[x+166,y-93],[x+130,y-93]],'#806b4a',8);
    for(const dx of [-120,-40,42,120]) stone(ctx,x+dx,y-9,26,13,'#a49778');
    path(ctx,[[x-130,y-73],[x+143,y-73]],'#b59a6d',4);
    poly(ctx,[[x-48,y-71],[x+46,y-71],[x+46,y-38],[x-48,y-38]],'#b6a680');
    path(ctx,[[x-32,y-54],[x+32,y-54]],'#695a43',3);
    return;
  }
  poly(ctx,[[x-213,y],[x-213,y-206],[x+207,y-206],[x+207,y]],'#766149');
  for(let row=0;row<10;row++){
    const yy=y-18-row*20;
    path(ctx,[[x-207,yy],[x+203,yy]],row%2?'#b49162':'#a78155',10);
    for(const xx of [x-192,x+188]) orb(ctx,xx,yy,4,'#ddbd83');
  }
  poly(ctx,[[x-246,y-206],[x,y-351],[x+239,y-206]],'#514846');
  poly(ctx,[[x-226,y-209],[x,y-337],[x+222,y-209]],'#70594c');
  path(ctx,[[x-242,y-207],[x,y-350],[x+237,y-207]],'#c6a16b',11);
  for(let xx=x-168;xx<x+178;xx+=58) path(ctx,[[xx,y-244],[xx+115,y-244]],'#8b7055',4);
  poly(ctx,[[x+125,y-298],[x+125,y-380],[x+176,y-380],[x+176,y-266]],'#75685a');
  path(ctx,[[x+118,y-381],[x+181,y-381]],'#c4ad85',6);
  poly(ctx,[[x+3,y],[x+3,y-138],[x+24,y-159],[x+92,y-159],[x+110,y-136],[x+110,y]],'#364b42');
  path(ctx,[[x,y-140],[x+22,y-163],[x+95,y-163],[x+113,y-138]],'#d7b985',7);
  orb(ctx,x+91,y-67,5,'#f0ca85');
  for(const dx of [-137,150]) {
    poly(ctx,[[x+dx-33,y-145],[x+dx+32,y-145],[x+dx+32,y-73],[x+dx-33,y-73]],'#d7b176');
    poly(ctx,[[x+dx-27,y-139],[x+dx+26,y-139],[x+dx+26,y-79],[x+dx-27,y-79]],'#e9d38e');
    path(ctx,[[x+dx,y-140],[x+dx,y-79]],'#735d43',5);
    path(ctx,[[x+dx-27,y-109],[x+dx+27,y-109]],'#735d43',5);
  }
  path(ctx,[[x-5,y+2],[x+120,y+2]],'#b69a71',13);
  for(const dx of [-167,175]) {
    path(ctx,[[x+dx,y],[x+dx,y-78]],'#796146',8);
    orb(ctx,x+dx,y-83,6,'#edc98a');
  }
}

function interiorShell(ctx,width,height,wall,beam,floor) {
  const g=ctx.createLinearGradient(0,70,0,650);
  g.addColorStop(0,wall);g.addColorStop(1,'#766249');
  ctx.fillStyle=g;ctx.fillRect(0,0,width,650);
  for(let y=105;y<640;y+=36) path(ctx,[[0,y],[width,y]],'#b3946e',7);
  for(let x=80;x<width;x+=240) path(ctx,[[x,72],[x,650]],beam,16);
  poly(ctx,[[0,650],[width,650],[width,height],[0,height]],floor);
  path(ctx,[[0,650],[width,650]],'#d0b181',9);
  for(let x=0;x<width;x+=88) path(ctx,[[x,675],[x+16,height]],'#564632',3);
}

function window(ctx,x,y) {
  poly(ctx,[[x-64,y-70],[x+64,y-70],[x+64,y+70],[x-64,y+70]],'#594938');
  poly(ctx,[[x-53,y-59],[x+53,y-59],[x+53,y+58],[x-53,y+58]],'#9bc1b4');
  orb(ctx,x+13,y-27,23,'#f5dfac');
  path(ctx,[[x,y-60],[x,y+59]],'#8d704f',8);
  path(ctx,[[x-52,y],[x+53,y]],'#8d704f',8);
  path(ctx,[[x-68,y+72],[x+70,y+72]],'#dbb984',9);
}

export function buildVillageHomeArt() {
  const canvas=document.createElement('canvas');
  canvas.width=villageHomeTerrain.width;canvas.height=villageHomeTerrain.height;
  const ctx=canvas.getContext('2d');ctx.lineJoin='round';
  interiorShell(ctx,canvas.width,canvas.height,'#9a795d','#5e4937','#5e5142');
  window(ctx,450,285);window(ctx,1050,285);
  // Hearth, dining table and a proper bed make this a home before decoration choices.
  poly(ctx,[[146,650],[146,340],[334,340],[334,650]],'#6c6656');
  poly(ctx,[[173,644],[173,389],[307,389],[307,644]],'#413f39');
  orb(ctx,240,563,57,'rgba(246,171,91,.26)');
  poly(ctx,[[196,636],[214,578],[238,612],[258,556],[286,635]],'#e9a563');
  path(ctx,[[135,342],[345,342]],'#c5ad83',15);
  poly(ctx,[[900,628],[905,548],[1233,548],[1246,628]],'#665747');
  poly(ctx,[[908,551],[1236,551],[1219,577],[918,577]],'#d8bd95');
  path(ctx,[[670,600],[826,600]],'#ae865a',16);
  for(const x of [694,805]) path(ctx,[[x,605],[x,650]],'#6c4e38',11);
  path(ctx,[[144,125],[1295,125]],'#c5a574',16);
  return canvas;
}

export function paintVillageHomeDecor(ctx,items) {
  if(items.has('alvin-cushion')) {
    orb(ctx,1114,626,66,'#a27b63');
    orb(ctx,1114,620,54,'#d0ad81');
    path(ctx,[[1080,616],[1100,596],[1122,617],[1140,596],[1158,619]],'#f0d9a7',5);
  }
  if(items.has('tapestry')) {
    poly(ctx,[[1162,190],[1317,190],[1310,420],[1239,461],[1165,421]],'#596e73');
    poly(ctx,[[1181,220],[1298,220],[1276,378],[1238,402],[1201,378]],'#b9a16e');
    path(ctx,[[1205,256],[1237,233],[1271,256],[1238,307],[1205,256]],'#f0d79a',6);
  }
  if(items.has('bookshelf')) {
    poly(ctx,[[572,343],[685,343],[685,631],[572,631]],'#72543d');
    for(const y of [414,502,590]) {
      path(ctx,[[578,y],[678,y]],'#c09b65',9);
      for(let x=583;x<671;x+=15) poly(ctx,[[x,y-45],[x+11,y-45],[x+11,y-6],[x,y-6]],x%3<1?'#607b72':'#ac8067');
    }
  }
}

export function buildLyssCabinArt() {
  const canvas=document.createElement('canvas');
  canvas.width=lyssCabinTerrain.width;canvas.height=lyssCabinTerrain.height;
  const ctx=canvas.getContext('2d');ctx.lineJoin='round';
  interiorShell(ctx,canvas.width,canvas.height,'#8c7359','#6e5339','#62543e');
  window(ctx,790,285);
  poly(ctx,[[155,647],[155,372],[319,372],[319,647]],'#6e6653');
  poly(ctx,[[179,638],[179,423],[296,423],[296,638]],'#3e433c');
  orb(ctx,235,570,61,'rgba(255,177,93,.23)');
  poly(ctx,[[193,628],[216,571],[238,609],[258,558],[286,628]],'#eaaa67');
  path(ctx,[[146,376],[325,376]],'#cfaf78',13);
  poly(ctx,[[420,642],[420,594],[655,594],[655,642]],'#8a694b');
  path(ctx,[[407,588],[668,588]],'#bd9867',13);
  for(const x of [443,628]) path(ctx,[[x,602],[x,650]],'#634d37',10);
  path(ctx,[[347,176],[671,176]],'#b89a6c',12);
  for(const x of [389,473,577]) orb(ctx,x,163,12,'#708c6e');
  return canvas;
}

export function paintLyssCabinDecor(ctx,items) {
  if(items.has('herb-shelf')) {
    path(ctx,[[697,407],[938,407]],'#b99a65',13);
    for(const x of [735,802,871]) {
      poly(ctx,[[x-16,400],[x-10,366],[x+12,366],[x+17,400]],'#83694a');
      for(const dx of [-12,0,12]) path(ctx,[[x+dx,369],[x+dx*1.5,336]],'#738e63',4);
      orb(ctx,x,332,7,'#d1a474');
    }
  }
  if(items.has('woven-rug')) {
    poly(ctx,[[405,657],[826,657],[894,746],[348,746]],'#a67a6c');
    poly(ctx,[[417,669],[809,669],[867,733],[378,733]],'#d3a580');
    for(let x=420;x<817;x+=44) path(ctx,[[x,674],[x+23,726]],'#7e8773',5);
  }
  if(items.has('warm-lantern')) {
    path(ctx,[[897,208],[897,334]],'#68513b',7);
    poly(ctx,[[875,296],[920,296],[922,344],[874,344]],'#5c4b38');
    poly(ctx,[[883,305],[913,305],[913,335],[883,335]],'#edbf79');
    orb(ctx,898,320,76,'rgba(255,203,117,.16)');
  }
}

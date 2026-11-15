function stroke(ctx, points, color, width = 1) {
  ctx.beginPath(); ctx.moveTo(points[0][0], points[0][1]);
  for (let i=1;i<points.length;i++) ctx.lineTo(points[i][0],points[i][1]);
  ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();
}
function cloud(ctx,x,y,s) {
  ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.fillStyle='#fff1cdd9';
  ctx.beginPath();ctx.ellipse(0,7,28,8,0,0,Math.PI*2);
  ctx.arc(-14,2,10,Math.PI,Math.PI*2);ctx.arc(-3,-4,13,Math.PI,Math.PI*2);
  ctx.arc(12,1,11,Math.PI,Math.PI*2);ctx.closePath();ctx.fill();ctx.restore();
}
function bird(ctx,x,y,s) {
  ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.lineWidth=2.3;ctx.lineCap='round';ctx.strokeStyle='#263947dc';
  ctx.beginPath();ctx.moveTo(-9,2);ctx.quadraticCurveTo(-4,-5,0,1);ctx.quadraticCurveTo(5,-6,10,1);ctx.stroke();ctx.restore();
}
function castle(ctx,x,base,s) {
  ctx.save();ctx.translate(x,base);ctx.scale(s,s);
  const stone=ctx.createLinearGradient(0,-96,0,0);stone.addColorStop(0,'#e5d7b9');stone.addColorStop(1,'#847764');ctx.fillStyle=stone;
  ctx.fillRect(-42,-44,84,44);ctx.fillRect(-58,-71,22,71);ctx.fillRect(-27,-60,19,60);ctx.fillRect(8,-63,20,63);ctx.fillRect(37,-76,22,76);
  ctx.fillStyle='#625044';
  for(const tx of [-47,-21,14,43]){ctx.beginPath();ctx.moveTo(tx-13,-70);ctx.lineTo(tx+11,-70);ctx.lineTo(tx,-93);ctx.closePath();ctx.fill();}
  for(const tx of [-54,-43,-22,-11,15,24,44,55])ctx.fillRect(tx-2,-77,4,7);
  ctx.fillRect(-7,-28,14,28);ctx.beginPath();ctx.arc(0,-28,7,Math.PI,0);ctx.fill();
  ctx.fillStyle='#c97856';ctx.fillRect(-3,-59,6,15);ctx.restore();
}
export function paintTelescopeView(ctx,view,clock){
  const {x,y,width,height}=view,cx=x+width/2,cy=y+height/2,r=Math.min(width*.44,height*.44),left=cx-r,top=cy-r;
  ctx.save();ctx.fillStyle='#07120fe8';ctx.fillRect(x,y,width,height);
  ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.clip();
  const sky=ctx.createLinearGradient(0,top,0,cy+r);sky.addColorStop(0,'#78a8bd');sky.addColorStop(.52,'#d9d8c1');sky.addColorStop(1,'#eab98a');ctx.fillStyle=sky;ctx.fillRect(left,top,2*r,2*r);
  const horizon=cy+r*.13;
  cloud(ctx,left+((clock*7+r*.55)%(r*2.7))-r*.35,cy-r*.48,.78);
  cloud(ctx,left+((clock*4+r*1.72)%(r*2.7))-r*.35,cy-r*.25,.57);
  const sea=ctx.createLinearGradient(0,horizon,0,cy+r);sea.addColorStop(0,'#628f9b');sea.addColorStop(.58,'#347486');sea.addColorStop(1,'#1d4f68');ctx.fillStyle=sea;ctx.fillRect(left,horizon,2*r,r*.87);
  ctx.fillStyle='#b6a788';ctx.beginPath();ctx.moveTo(left-r*.1,horizon+r*.05);ctx.lineTo(left+r*.37,horizon-r*.2);ctx.lineTo(left+r*.73,horizon-r*.52);ctx.lineTo(left+r*1.05,horizon-r*.78);ctx.lineTo(left+r*1.28,horizon-r*.57);ctx.lineTo(left+r*1.52,horizon-r*.34);ctx.lineTo(left+r*1.8,horizon-r*.16);ctx.lineTo(left+r*2.1,horizon+r*.02);ctx.closePath();ctx.fill();
  ctx.fillStyle='#657a72';ctx.beginPath();ctx.moveTo(left+r*.58,horizon-r*.37);ctx.lineTo(left+r*1.05,horizon-r*.78);ctx.lineTo(left+r*1.31,horizon-r*.54);ctx.lineTo(left+r*1.52,horizon-r*.3);ctx.lineTo(left+r*1.72,horizon-r*.08);ctx.lineTo(left+r*1.88,horizon+r*.08);ctx.closePath();ctx.fill();
  const cliff=ctx.createLinearGradient(0,horizon-r*.34,0,horizon+r*.37);cliff.addColorStop(0,'#635b4d');cliff.addColorStop(.54,'#3e514d');cliff.addColorStop(1,'#223d40');ctx.fillStyle=cliff;
  ctx.beginPath();ctx.moveTo(left+r*.7,horizon-r*.43);ctx.lineTo(left+r*1.05,horizon-r*.78);ctx.lineTo(left+r*1.34,horizon-r*.51);ctx.lineTo(left+r*1.59,horizon-r*.21);ctx.lineTo(left+r*1.84,horizon+r*.04);ctx.lineTo(left+r*1.88,horizon+r*.4);ctx.lineTo(left+r*.42,horizon+r*.4);ctx.closePath();ctx.fill();
  for(let i=0;i<14;i++){const px=left+r*(.58+i*.092),py=horizon-r*(.25+Math.sin(i*.7)*.12);ctx.fillStyle=i%3?'#546d5c':'#3e5a50';ctx.beginPath();ctx.moveTo(px-5,py+18);ctx.lineTo(px,py-4-(i%4)*3);ctx.lineTo(px+6,py+18);ctx.closePath();ctx.fill();}
  castle(ctx,left+r*1.05,horizon-r*.53,r*.0058);
  for(let i=0;i<30;i++){const px=left+((i*71+clock*(9+i%4))%(r*2)),py=horizon+r*(.12+(i%10)*.073),len=r*(.045+(i%4)*.013),sway=Math.sin(clock*.75+i*2.3)*r*.012;stroke(ctx,[[px,py],[px+len+sway,py+Math.sin(i)*1.8]],i%4?'#c9dedc5b':'#e8ddb788',i%4?1.2:2.2);}
  for(let i=0;i<4;i++){const bx=left+((clock*(18+i*2)+r*(.15+i*.42))%(r*2.25))-r*.12,by=cy-r*(.15+(i%2)*.13)+Math.sin(clock*.7+i)*r*.018;bird(ctx,bx,by,.62+(i%2)*.16);}
  const vignette=ctx.createRadialGradient(cx,cy,r*.45,cx,cy,r);vignette.addColorStop(0,'#07131a00');vignette.addColorStop(1,'#07131a94');ctx.fillStyle=vignette;ctx.fillRect(left,top,2*r,2*r);
  ctx.restore();
  const rim=ctx.createRadialGradient(cx,cy,r*.86,cx,cy,r*1.04);rim.addColorStop(0,'#d8c9a355');rim.addColorStop(.18,'#64736d');rim.addColorStop(.58,'#1b2727');rim.addColorStop(.82,'#807960');rim.addColorStop(1,'#171c1c');
  ctx.beginPath();ctx.arc(cx,cy,r*1.015,0,Math.PI*2);ctx.arc(cx,cy,r*.95,0,Math.PI*2,true);ctx.fillStyle=rim;ctx.fill('evenodd');
  ctx.beginPath();ctx.arc(cx,cy,r*.956,0,Math.PI*2);ctx.strokeStyle='#ecd9aa99';ctx.lineWidth=Math.max(2,r*.012);ctx.stroke();
  ctx.fillStyle='#f3e8ce';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold '+Math.max(11,r*.07)+'px Georgia, serif';ctx.fillText('SANDY COVE · DISTANT VIEW',cx,cy-r*.79);
  ctx.font=Math.max(10,r*.045)+'px system-ui, sans-serif';ctx.fillStyle='#f7f0d9e8';ctx.fillText('E / Escape / Interact · lower the telescope',cx,cy+r*.82);ctx.restore();
}

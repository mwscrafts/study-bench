function drawSoftCloud(ctx,x,y,s) {
  ctx.save();ctx.globalAlpha=.20;ctx.filter='blur(2px)';ctx.fillStyle='#fff1d8';
  ctx.beginPath();ctx.ellipse(x,y,s*1.8,s*.27,0,0,Math.PI*2);ctx.ellipse(x-s*.55,y-s*.11,s*.72,s*.35,0,0,Math.PI*2);ctx.ellipse(x+s*.25,y-s*.16,s*.86,s*.42,0,0,Math.PI*2);ctx.fill();ctx.restore();
}
function drawGull(ctx,x,y,s) {
  ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.strokeStyle='#46545aaf';ctx.lineWidth=1.8;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(-6,1);ctx.quadraticCurveTo(-2,-3,0,0);ctx.quadraticCurveTo(3,-4,7,1);ctx.stroke();ctx.restore();
}
function strokeWave(ctx,x,y,w,phase,alpha) {
  ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle='#d3e6dd';ctx.lineWidth=1.4;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(x,y);
  for(let i=1;i<=8;i++){const px=x+w*i/8,py=y+Math.sin(phase+i*.95)*1.7;ctx.lineTo(px,py);}
  ctx.stroke();ctx.restore();
}
export function paintTelescopeView(ctx,view,clock,image) {
  if(!image)return;
  const {x,y,width,height}=view,cx=x+width/2,cy=y+height/2,r=Math.min(width*.44,height*.44),left=cx-r,top=cy-r,d=2*r;
  ctx.save();ctx.fillStyle='#07120fdf';ctx.fillRect(x,y,width,height);
  ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.clip();
  ctx.drawImage(image,left,top,d,d);

  // These are separate moving layers over the approved still painting.
  for(let i=0;i<3;i++){
    const cloudX=left+((clock*(5+i)+r*(.2+i*.78))%(d+r*.9))-r*.45;
    drawSoftCloud(ctx,cloudX,top+r*(.38+i*.13),r*(.21-i*.035));
  }
  for(let i=0;i<4;i++){
    const birdX=left+((clock*(14+i*2)+r*(.12+i*.48))%(d+r*.12))-r*.06;
    const birdY=top+r*(.86+(i%2)*.13)+Math.sin(clock*.6+i)*r*.012;
    drawGull(ctx,birdX,birdY,.65+(i%2)*.17);
  }
  for(let i=0;i<8;i++){
    const bandY=top+r*(1.30+i*.16),bandX=left+((clock*(20+i*2)+i*71)%(d+r*.3))-r*.15;
    strokeWave(ctx,bandX,bandY,r*(.10+(i%3)*.035),clock*1.4+i*2.1,.22+(i%3)*.08);
  }
  const vignette=ctx.createRadialGradient(cx,cy,r*.56,cx,cy,r);vignette.addColorStop(0,'#07131a00');vignette.addColorStop(1,'#07131a70');ctx.fillStyle=vignette;ctx.fillRect(left,top,d,d);
  ctx.restore();

  const rim=ctx.createRadialGradient(cx,cy,r*.87,cx,cy,r*1.045);rim.addColorStop(0,'#ddc99645');rim.addColorStop(.17,'#69756d');rim.addColorStop(.52,'#202a29');rim.addColorStop(.82,'#8a8066');rim.addColorStop(1,'#171c1b');
  ctx.beginPath();ctx.arc(cx,cy,r*1.02,0,Math.PI*2);ctx.arc(cx,cy,r*.95,0,Math.PI*2,true);ctx.fillStyle=rim;ctx.fill('evenodd');
  ctx.beginPath();ctx.arc(cx,cy,r*.956,0,Math.PI*2);ctx.strokeStyle='#efe0b488';ctx.lineWidth=Math.max(2,r*.012);ctx.stroke();
}

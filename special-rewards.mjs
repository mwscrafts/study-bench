// Optional one-time board commissions. Rewards have no main-story requirements.
export const specialRequests = {
  'camp-festival': { title:'Camp gathering', berries:5, wood:2, glowcaps:0 },
  'rootdeep-welcome': { title:'Lanternstead welcome', berries:0, wood:2, glowcaps:2 }
};

export const specialRewardChoices = [
  { id:'scarf', label:'Player cosmetic · trail scarf' },
  { id:'bell', label:'Alvin cosmetic · little bell collar' },
  { id:'mobile', label:'House decoration · hanging star mobile' },
  { id:'garland-recipe', label:'Crafting recipe · Glowcap garland' }
];

export function paintTrailScarf(ctx,x,y,direction=1,bob=0) {
  ctx.save(); ctx.translate(x,y+bob); ctx.scale(direction,1);
  ctx.fillStyle='#62b6a7';
  ctx.beginPath();ctx.moveTo(-15,-59);ctx.quadraticCurveTo(0,-50,15,-60);
  ctx.lineTo(17,-49);ctx.quadraticCurveTo(0,-39,-17,-49);ctx.closePath();ctx.fill();
  ctx.fillStyle='#468e85';
  ctx.beginPath();ctx.moveTo(-13,-47);ctx.lineTo(-24,-24);ctx.lineTo(-17,-20);ctx.lineTo(-2,-46);ctx.closePath();ctx.fill();
  ctx.restore();
}

export function paintAlvinBell(ctx,x,y,scale=1,indoor=false) {
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
  // The gold bell remains visible on Alvin in both outdoor and indoor poses.
  ctx.strokeStyle='#4d8990';ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(-9,-19);ctx.quadraticCurveTo(0,-15,9,-19);ctx.stroke();
  ctx.fillStyle='#f2c460';ctx.beginPath();ctx.arc(1,-14,4,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#775c30';ctx.fillRect(0,-12,2,2);
  ctx.restore();
}

export function paintSpecialHomeDecor(ctx,space,rewards,decorations) {
  if(rewards.has('mobile')) {
    const x=space==='village'?830:555, y=space==='village'?170:145;
    ctx.strokeStyle='#a78458';ctx.lineWidth=4;
    ctx.beginPath();ctx.moveTo(x,y-65);ctx.lineTo(x,y);ctx.moveTo(x-58,y);ctx.lineTo(x+58,y);ctx.stroke();
    for(const [dx,length] of [[-48,40],[-16,58],[20,35],[51,53]]) {
      ctx.beginPath();ctx.moveTo(x+dx,y);ctx.lineTo(x+dx,y+length);ctx.stroke();
      ctx.fillStyle='#f3d791';ctx.beginPath();
      for(let i=0;i<10;i++){
        const a=-Math.PI/2+i*Math.PI/5, r=i%2?7:15;
        const px=x+dx+Math.cos(a)*r, py=y+length+Math.sin(a)*r;
        if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
      }
      ctx.closePath();ctx.fill();
    }
  }
  if(decorations.has('glowcap-garland')) {
    const left=space==='village'?892:290, right=space==='village'?1160:480, y=space==='village'?380:279;
    ctx.strokeStyle='#a98b5c';ctx.lineWidth=4;
    ctx.beginPath();ctx.moveTo(left,y);ctx.quadraticCurveTo((left+right)/2,y+39,right,y);ctx.stroke();
    for(let i=0;i<7;i++) {
      const t=i/6, x=left+(right-left)*t, yy=y+39*4*t*(1-t);
      ctx.fillStyle='#a9d4ae';ctx.beginPath();ctx.ellipse(x,yy+11,10,6,0,Math.PI,0);ctx.fill();
      ctx.fillStyle='#6c9d7c';ctx.fillRect(x-3,yy+10,6,10);
      ctx.fillStyle='rgba(171,231,173,.24)';ctx.beginPath();ctx.arc(x,yy+9,18,0,Math.PI*2);ctx.fill();
    }
  }
}

// Shared canvas and sprite helpers. Keep these functions independent of game state
// so the game loop can focus on deciding what to draw, not how each shape is drawn.
export const WAVE_TIME = 1.25;

export function paintShadow(context, x, y, width) {
  context.fillStyle = '#1729214d';
  context.beginPath();
  context.ellipse(x, y + 1, width, width * .24, 0, 0, Math.PI * 2);
  context.fill();
}

export function paintLodestone(context, stone, active, clock, sprite) {
  const { x, y } = stone;
  const glowColor = stone.id === 'lodestone-canopy' ? '180, 212, 104'
    : stone.id === 'lodestone-mine' ? '195, 145, 224' : '91, 221, 211';
  const pulse = .48 + Math.sin(clock * 4 + x) * .16;

  context.save();
  if (active) {
    const glow = context.createRadialGradient(x, y - 43, 2, x, y - 43, 68);
    glow.addColorStop(0, `rgba(${glowColor}, ${pulse})`);
    glow.addColorStop(1, `rgba(${glowColor}, 0)`);
    context.fillStyle = glow;
    context.beginPath();
    context.arc(x, y - 43, 68, 0, Math.PI * 2);
    context.fill();
  }

  if (sprite) {
    context.globalAlpha = active ? 1 : .88;
    drawSprite(context, sprite, x, y, 91);
    context.globalAlpha = 1;
  }

  if (active) {
    context.fillStyle = '#f1d89c';
    context.beginPath();
    context.arc(x, y - 94 + Math.sin(clock * 4 + x) * 3, 3.5, 0, Math.PI * 2);
    context.fill();
  }
  context.restore();
}
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}

function surfaceCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

export function spriteBounds(image, start, end, anchor) {
  const canvas = surfaceCanvas(image.width, image.height);
  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.drawImage(image, 0, 0);
  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
  let left = image.width;
  let right = 0;
  let top = image.height;
  let bottom = 0;
  for (let y = 0; y < image.height; y++) {
    for (let x = Math.floor(image.width * start); x < Math.floor(image.width * end); x++) {
      if (data[(y * image.width + x) * 4 + 3] < 95) continue;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
  }
  if (left > right || top > bottom) throw new Error('Missing sprite silhouette');
  return { image, left, top, width: right - left + 1, height: bottom - top + 1, anchor };
}

export function drawSprite(context, sprite, x, y, height, direction = 1, bob = 0, tilt = 0) {
  const width = sprite.width / sprite.height * height;
  context.save();
  context.translate(x, y + bob);
  context.scale(direction, 1);
  context.rotate(tilt);
  context.drawImage(sprite.image, sprite.left, sprite.top, sprite.width, sprite.height,
    -width * sprite.anchor, -height, width, height);
  context.restore();
}

export function drawPortrait(canvas, sprite) {
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawSprite(context, sprite, canvas.width * .55, canvas.height - 4, canvas.height - 8);
}

export function paintComposureWraith(context, x, y, clock) {
  const sway = Math.sin(clock * 1.7) * 7;
  const pulse = .48 + Math.sin(clock * 2.2) * .08;
  context.save();
  context.translate(x + sway, y - 5);
  context.globalAlpha = pulse;
  context.shadowColor = '#bd8aff'; context.shadowBlur = 24;
  context.fillStyle = '#8f62bd';
  context.beginPath();
  context.moveTo(-39,0); context.quadraticCurveTo(-52,-44,-31,-87);
  context.quadraticCurveTo(-20,-109,0,-111); context.quadraticCurveTo(29,-104,38,-72);
  context.quadraticCurveTo(48,-37,35,-2); context.lineTo(21,-16); context.lineTo(8,-2);
  context.lineTo(-5,-16); context.lineTo(-20,-1); context.closePath(); context.fill();
  context.shadowBlur = 0; context.fillStyle = '#f0d6ff';
  context.beginPath(); context.ellipse(-13,-72,4,8,-.2,0,Math.PI*2); context.fill();
  context.beginPath(); context.ellipse(13,-72,4,8,.2,0,Math.PI*2); context.fill();
  context.restore();
}

export function paintWave(context, x, y, direction, remaining, bob = 0) {
  if (remaining <= 0) return;
  const sway = (WAVE_TIME - remaining) * 19;
  const handSway = Math.sin(sway) * 9;
  context.save();
  context.translate(x, y + bob);
  context.scale(direction, 1);
  context.lineCap = 'round';
  context.strokeStyle = '#697a5b';
  context.lineWidth = 9;
  context.beginPath(); context.moveTo(18,-48); context.lineTo(28+handSway*.35,-70); context.lineTo(37+handSway,-84); context.stroke();
  context.fillStyle = '#d7ae8d';
  context.beginPath(); context.ellipse(39+handSway,-89,7,10,-.3,0,Math.PI*2); context.fill();
  context.restore();
}

export function paintOpenLift(context, x, y) {
  const glow = context.createRadialGradient(x,y,2,x,y,65);
  glow.addColorStop(0,'#f8d78d99');
  glow.addColorStop(1,'#f8d78d00');
  context.fillStyle = glow;
  context.fillRect(x-65,y-65,130,130);
  context.fillStyle = '#f8d78d';
  context.beginPath(); context.arc(x,y,7,0,Math.PI*2); context.fill();
}

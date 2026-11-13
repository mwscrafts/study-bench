import { poly, path, orb } from './camp-art.mjs?v=15';
import { hearthTerrain, hearthLandmarks } from './hearth.mjs?v=10';

const { width, height, ledges } = hearthTerrain;
const [entry, box, exit] = hearthLandmarks;
const backdrop = new Image();
backdrop.decoding = 'async';
backdrop.src = new URL('./hidden-hearth-background.webp', import.meta.url).href;

function paintBackdrop(ctx, image) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#10262b';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(image, 0, 0, width, height);

  // The approved concept is fitted to the existing floor contour. Its painted
  // path follows the unchanged collision surface; this only accents the shelf.
  for (const ledge of ledges) {
    ctx.save();
    ctx.globalAlpha = .38;
    path(ctx, ledge.points, '#c2c7a070', 2);
    ctx.restore();
  }
}

export function buildHearthArt() {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#10262b';
  ctx.fillRect(0, 0, width, height);
  const draw = () => paintBackdrop(ctx, backdrop);
  if (backdrop.complete && backdrop.naturalWidth) draw();
  else backdrop.onload = draw;
  return canvas;
}

const falls = [
  { x: 704, top: 150, bottom: 494, width: 46 },
  { x: 2280, top: 156, bottom: 483, width: 48 }
];

function glow(ctx, x, y, radius, color) {
  const gradient = ctx.createRadialGradient(x, y, 2, x, y, radius);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, color.slice(0, 7) + '00');
  orb(ctx, x, y, radius, gradient);
}

export function paintHearthDetails(ctx, clock, night, opened) {
  for (const [index, fall] of falls.entries()) {
    for (let drop = 0; drop < 9; drop++) {
      const y = fall.top + (clock * (62 + index * 7) + drop * 37) % (fall.bottom - fall.top);
      const x = fall.x + Math.sin(clock * 1.6 + drop * 1.1 + index) * fall.width * .22;
      ctx.fillStyle = drop % 3 ? '#c5f1eaa0' : '#e3fff39c';
      ctx.fillRect(x, y, 2, 6 + drop % 4);
    }
  }

  for (const gate of [entry, exit]) {
    glow(ctx, gate.x, gate.y - 72, 145, night > .45 ? '#a0d7ee53' : '#a1e2d94a');
  }

  // Flicker around the painted ember without redrawing its flame or box.
  const emberX = 1508;
  glow(ctx, emberX, 590, 130, '#efb36b47');
  for (let i = 0; i < 7; i++) {
    const rise = (clock * 16 + i * 17) % 96;
    orb(ctx, emberX + Math.sin(i + rise * .08) * 10, 576 - rise,
      1 + (1 - rise / 96) * 1.6, '#ffc87a99');
  }

  // A small latch glow conveys the saved open/closed state on the painted box.
  const latchX = box.x + 125;
  const latchY = box.y - 12;
  if (!opened) glow(ctx, latchX, latchY, 19, '#f4d39035');
}

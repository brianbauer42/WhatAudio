import { CanvasTexture, SRGBColorSpace } from 'three';
import { palette, fonts } from '../theme.js';

export const CARD_WIDTH = 2.2;
export const CARD_HEIGHT = 2.9;

// Texel size of a card. 384x506 keeps ~80 cards comfortably under 100 MB
// of GPU memory while staying crisp at the front of the ring.
const W = 384;
const H = Math.round((W * CARD_HEIGHT) / CARD_WIDTH);
const PAD = 22;

function ellipsize(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let trimmed = text;
  while (trimmed.length > 1 && ctx.measureText(`${trimmed}…`).width > maxWidth) {
    trimmed = trimmed.slice(0, -1);
  }
  return `${trimmed}…`;
}

/**
 * Draws a track card onto a canvas: cover art (or a placeholder) on top,
 * title and artist underneath, all in the palette. Drawing the whole card
 * ourselves keeps it to one texture per track and needs no font loading
 * inside WebGL.
 */
export function drawCard(canvas, track, image) {
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Surface.
  ctx.fillStyle = palette.surface;
  ctx.fillRect(0, 0, W, H);

  // Art.
  const artSize = W - PAD * 2;
  const artX = PAD;
  const artY = PAD;
  if (image) {
    // Cover-fit the image into the square.
    const scale = Math.max(artSize / image.width, artSize / image.height);
    const drawW = image.width * scale;
    const drawH = image.height * scale;
    ctx.save();
    ctx.beginPath();
    ctx.rect(artX, artY, artSize, artSize);
    ctx.clip();
    ctx.drawImage(image, artX + (artSize - drawW) / 2, artY + (artSize - drawH) / 2, drawW, drawH);
    ctx.restore();
  } else {
    const gradient = ctx.createLinearGradient(artX, artY, artX + artSize, artY + artSize);
    gradient.addColorStop(0, '#0f2238');
    gradient.addColorStop(1, '#061019');
    ctx.fillStyle = gradient;
    ctx.fillRect(artX, artY, artSize, artSize);

    // A big initial in neon as the placeholder.
    const initial = (track.artist || track.title || '?').trim().charAt(0).toUpperCase() || '?';
    ctx.fillStyle = palette.teal;
    ctx.font = `700 ${Math.round(artSize * 0.55)}px ${fonts.display}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = palette.teal;
    ctx.shadowBlur = 30;
    ctx.fillText(initial, artX + artSize / 2, artY + artSize / 2 + 6);
    ctx.shadowBlur = 0;
  }

  // Thin neon rule between art and text.
  ctx.fillStyle = palette.teal;
  ctx.globalAlpha = 0.6;
  ctx.fillRect(PAD, artY + artSize + 12, artSize, 2);
  ctx.globalAlpha = 1;

  // Text.
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  const textX = PAD;
  let y = artY + artSize + 48;

  ctx.fillStyle = palette.text;
  ctx.font = `700 30px ${fonts.display}`;
  ctx.fillText(ellipsize(ctx, track.title || 'Untitled', artSize), textX, y);

  y += 32;
  ctx.fillStyle = palette.teal;
  ctx.font = `600 20px ${fonts.display}`;
  ctx.fillText(
    ellipsize(ctx, (track.artist || 'Unknown artist').toUpperCase(), artSize),
    textX,
    y
  );

  if (track.album) {
    y += 26;
    ctx.fillStyle = palette.muted;
    ctx.font = `500 18px ${fonts.display}`;
    ctx.fillText(ellipsize(ctx, track.album, artSize), textX, y);
  }
}

export function makeCardTexture(canvas) {
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function crc32(buf) {
  let table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c >>> 0;
  }
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type);
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const body = Buffer.concat([typeBuf, data]);
  const crc = crc32(body);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);

  return Buffer.concat([lenBuf, body, crcBuf]);
}

function generateIconPng(width, height, isMaskable = false) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdrChunk = createChunk('IHDR', ihdrData);

  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const cornerRadius = isMaskable ? 0 : width * 0.22;

  // Scale down graphics slightly for maskable icon safe zone (80% central area)
  const scale = isMaskable ? 0.8 : 1.0;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0;

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      if (!isMaskable) {
        const dx = Math.abs(x - cx) - (cx - cornerRadius);
        const dy = Math.abs(y - cy) - (cy - cornerRadius);
        if (dx > 0 && dy > 0 && dx * dx + dy * dy > cornerRadius * cornerRadius) {
          rawData[pxOffset] = 0;
          rawData[pxOffset + 1] = 0;
          rawData[pxOffset + 2] = 0;
          rawData[pxOffset + 3] = 0;
          continue;
        }
      }

      // Base background: Dark navy gradient (#0f172a to #1e293b)
      const gradRatio = y / height;
      let r = Math.round(15 + gradRatio * 15);
      let g = Math.round(23 + gradRatio * 18);
      let b = Math.round(42 + gradRatio * 17);
      let a = 255;

      const normX = (x - cx) / scale + cx;
      const normY = (y - cy) / scale + cy;

      // Graduation Cap Polygon test: Top Diamond
      const capTopY = cy - 0.26 * height;
      const capBotY = cy + 0.04 * height;
      const capMidY = cy - 0.11 * height;
      const capHalfW = 0.32 * width;

      if (normY >= capTopY && normY <= capBotY) {
        let span = 0;
        if (normY <= capMidY) {
          span = capHalfW * ((normY - capTopY) / (capMidY - capTopY));
        } else {
          span = capHalfW * (1 - (normY - capMidY) / (capBotY - capMidY));
        }
        if (Math.abs(normX - cx) <= span) {
          const capGrad = (normY - capTopY) / (capBotY - capTopY);
          r = Math.round(52 - capGrad * 47);
          g = Math.round(211 - capGrad * 61);
          b = Math.round(153 - capGrad * 48);
        }
      }

      // Cap Base
      const baseY1 = cy - 0.06 * height;
      const baseY2 = cy + 0.22 * height;
      const baseHalfW = 0.20 * width;
      if (normY >= baseY1 && normY <= baseY2 && Math.abs(normX - cx) <= baseHalfW) {
        const curveBottom = baseY2 - (1 - Math.pow(Math.abs(normX - cx) / baseHalfW, 2)) * 0.06 * height;
        if (normY <= curveBottom) {
          r = 255; g = 255; b = 255;
        }
      }

      // Central Scholar Badge
      const distToCenter = Math.hypot(normX - cx, normY - (cy + 0.08 * height));
      if (distToCenter <= width * 0.06) {
        r = 15; g = 23; b = 42;
      }
      if (distToCenter <= width * 0.035) {
        r = 16; g = 185; b = 129;
      }

      // Tassel dot
      const tasselX = cx + 0.30 * width;
      const tasselY = cy + 0.18 * height;
      if (Math.hypot(normX - tasselX, normY - tasselY) <= width * 0.025) {
        r = 245; g = 158; b = 11;
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve('public');
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), generateIconPng(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), generateIconPng(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), generateIconPng(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generateIconPng(180, 180, false));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), generateIconPng(64, 64, false));

console.log('Successfully generated all PWA icons including maskable icon!');

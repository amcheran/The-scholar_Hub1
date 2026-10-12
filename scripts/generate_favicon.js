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

function generateFaviconPng(width, height) {
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
  const rCircle = width * 0.46;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0;

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dist = Math.hypot(x - cx + 0.5, y - cy + 0.5);

      if (dist > rCircle) {
        // Transparent outside circular badge
        rawData[pxOffset] = 0;
        rawData[pxOffset + 1] = 0;
        rawData[pxOffset + 2] = 0;
        rawData[pxOffset + 3] = 0;
        continue;
      }

      // Outer vibrant emerald ring
      if (dist >= rCircle - Math.max(1, width * 0.065)) {
        rawData[pxOffset] = 16;
        rawData[pxOffset + 1] = 185;
        rawData[pxOffset + 2] = 129;
        rawData[pxOffset + 3] = 255;
        continue;
      }

      // Navy disc interior (#090d16)
      let r = 9;
      let g = 13;
      let b = 22;
      let a = 255;

      // Graduation Cap Polygon test: Top Diamond
      const capTopY = cy - 0.28 * height;
      const capBotY = cy + 0.08 * height;
      const capMidY = cy - 0.10 * height;
      const capHalfW = 0.35 * width;

      if (y >= capTopY && y <= capBotY) {
        let span = 0;
        if (y <= capMidY) {
          span = capHalfW * ((y - capTopY) / (capMidY - capTopY));
        } else {
          span = capHalfW * (1 - (y - capMidY) / (capBotY - capMidY));
        }
        if (Math.abs(x - cx) <= span) {
          // Vibrant Emerald (#10b981 to #34d399)
          r = 16;
          g = 185;
          b = 129;
        }
      }

      // Cap Base (white arch)
      const baseY1 = cy - 0.04 * height;
      const baseY2 = cy + 0.28 * height;
      const baseHalfW = 0.22 * width;
      if (y >= baseY1 && y <= baseY2 && Math.abs(x - cx) <= baseHalfW) {
        const curveBottom = baseY2 - (1 - Math.pow(Math.abs(x - cx) / baseHalfW, 2)) * 0.08 * height;
        if (y <= curveBottom) {
          r = 255;
          g = 255;
          b = 255;
        }
      }

      // Golden Amber Tassel Bead
      const tasselX = cx + 0.32 * width;
      const tasselY = cy + 0.18 * height;
      if (Math.hypot(x - tasselX, y - tasselY) <= Math.max(1.5, width * 0.06)) {
        r = 251;
        g = 191;
        b = 36;
      }

      // Center Scholar Emerald Dot
      const centerDotY = cy + 0.12 * height;
      if (Math.hypot(x - cx, y - centerDotY) <= Math.max(1, width * 0.05)) {
        r = 16;
        g = 185;
        b = 129;
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
const png32 = generateFaviconPng(32, 32);
const png16 = generateFaviconPng(16, 16);

fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), png32);
fs.writeFileSync(path.join(publicDir, 'favicon-16x16.png'), png16);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), png32);

console.log('Successfully generated distinct browser tab favicons (32x32, 16x16, .ico)!');

import sharp from "sharp";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputPath = path.resolve(__dirname, "../UIPromopts/seaKeyProperty.jpeg");
const publicDir = path.resolve(__dirname, "../public");

async function fixAllLogosAndOg() {
  console.log("Processing fixes for logo, logo-white, and og-image...");

  // Center and radius
  const cx = 618;
  const cy = 610;
  const r = 561.5;
  const cropSize = Math.ceil(r * 2); // 1124px
  const left = Math.round(cx - r);
  const top = Math.round(cy - r);

  const svgMask = Buffer.from(`
    <svg width="${cropSize}" height="${cropSize}">
      <circle cx="${cropSize / 2}" cy="${cropSize / 2}" r="${r - 0.5}" fill="white" />
    </svg>
  `);

  // 1. High-res color badge (1124x1124)
  const badge1124 = await sharp(inputPath)
    .extract({ left, top, width: cropSize, height: cropSize })
    .composite([{ input: svgMask, blend: "dest-in" }])
    .png({ quality: 100, compressionLevel: 9 })
    .toBuffer();

  const badgePath = path.join(publicDir, "logo-badge.png");
  fs.writeFileSync(badgePath, badge1124);
  console.log("Saved color badge:", badgePath);

  // 2. High-res pure white monochrome badge
  const { data, info } = await sharp(badge1124).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const whiteData = Buffer.alloc(width * height * 4);

  for (let i = 0; i < width * height; i++) {
    const srcIdx = i * channels;
    const destIdx = i * 4;

    const rVal = data[srcIdx];
    const gVal = data[srcIdx + 1];
    const bVal = data[srcIdx + 2];
    const aVal = data[srcIdx + 3];

    if (aVal === 0) {
      whiteData[destIdx] = 255;
      whiteData[destIdx + 1] = 255;
      whiteData[destIdx + 2] = 255;
      whiteData[destIdx + 3] = 0;
      continue;
    }

    const lum = (0.299 * rVal + 0.587 * gVal + 0.114 * bVal) / 255;
    let outAlpha = 0;

    if (lum > 0.30) {
      outAlpha = Math.min(255, Math.round(((lum - 0.30) / 0.70) * 255 * (aVal / 255) * 1.3));
    } else {
      outAlpha = Math.round(lum * 0.15 * (aVal / 255) * 255);
    }

    whiteData[destIdx] = 255;
    whiteData[destIdx + 1] = 255;
    whiteData[destIdx + 2] = 255;
    whiteData[destIdx + 3] = Math.max(0, Math.min(255, outAlpha));
  }

  const whiteBadgeBuffer = await sharp(whiteData, {
    raw: { width, height, channels: 4 }
  }).png().toBuffer();

  fs.writeFileSync(path.join(publicDir, "logo-badge-white.png"), whiteBadgeBuffer);
  console.log("Saved white badge:", path.join(publicDir, "logo-badge-white.png"));

  // 3. WebP optimized buffers for embedding into standalone clean SVGs (NO text in SVG)
  const colorBadge512Webp = await sharp(badge1124).resize(512, 512).webp({ quality: 95 }).toBuffer();
  const colorBadgeBase64 = `data:image/webp;base64,${colorBadge512Webp.toString("base64")}`;

  const whiteBadge512Webp = await sharp(whiteBadgeBuffer).resize(512, 512).webp({ quality: 95 }).toBuffer();
  const whiteBadgeBase64 = `data:image/webp;base64,${whiteBadge512Webp.toString("base64")}`;

  // 4. public/logo.svg: ONLY the color circular emblem (NO text)
  const logoSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <image href="${colorBadgeBase64}" width="512" height="512" />
</svg>`;
  fs.writeFileSync(path.join(publicDir, "logo.svg"), logoSvg, "utf8");
  fs.writeFileSync(path.join(publicDir, "logo-mark.svg"), logoSvg, "utf8");
  console.log("Saved public/logo.svg and public/logo-mark.svg (emblem only, NO text)");

  // 5. public/logo-white.svg: ONLY the pure white circular emblem (NO text)
  const logoWhiteSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <image href="${whiteBadgeBase64}" width="512" height="512" />
</svg>`;
  fs.writeFileSync(path.join(publicDir, "logo-white.svg"), logoWhiteSvg, "utf8");
  console.log("Saved public/logo-white.svg (pure white emblem, NO text)");

  // 6. Favicons & App Icons
  const icon32 = await sharp(badge1124).resize(32, 32).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, "favicon.ico"), icon32);
  fs.writeFileSync(path.join(publicDir, "icon-32.png"), icon32);
  fs.writeFileSync(path.join(publicDir, "icon-192.png"), await sharp(badge1124).resize(192, 192).png().toBuffer());
  fs.writeFileSync(path.join(publicDir, "icon-512.png"), await sharp(badge1124).resize(512, 512).png().toBuffer());
  fs.writeFileSync(path.join(publicDir, "apple-touch-icon.png"), await sharp(badge1124).resize(192, 192).png().toBuffer());

  const appFaviconPath = path.resolve(__dirname, "../app/favicon.ico");
  if (fs.existsSync(path.dirname(appFaviconPath))) {
    fs.writeFileSync(appFaviconPath, icon32);
  }
  console.log("Saved favicon and app icons");

  // 7. Generate public/og-image.jpg:
  // Text requirement: "as the text is too long use trips instead of excrsuions"
  // Clean, perfectly proportioned, luxury social card
  const ogBgSvg = `
  <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="oceanGlow" cx="28%" cy="50%" r="70%">
        <stop offset="0%" stop-color="#0F3854" />
        <stop offset="55%" stop-color="#0A2234" />
        <stop offset="100%" stop-color="#05131D" />
      </radialGradient>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#FCE082"/>
        <stop offset="50%" stop-color="#E5B94E"/>
        <stop offset="100%" stop-color="#C59B27"/>
      </linearGradient>
      <linearGradient id="seaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#38E8F5"/>
        <stop offset="50%" stop-color="#00C4D4"/>
        <stop offset="100%" stop-color="#00838F"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#oceanGlow)" />
    <!-- Outer delicate gold border -->
    <rect x="28" y="28" width="1144" height="574" rx="20" fill="none" stroke="#D4AF37" stroke-width="1.5" stroke-opacity="0.3" />

    <!-- Typography on right -->
    <g transform="translate(560, 205)">
      <!-- SEA KEY -->
      <text x="0" y="55" font-family="'DM Serif Display', 'Playfair Display', serif" font-size="68" font-weight="bold">
        <tspan fill="url(#goldGrad)">SEA </tspan>
        <tspan fill="url(#seaGrad)">KEY</tspan>
      </text>

      <!-- PROPERTY -->
      <text x="2" y="112" font-family="'Poppins', sans-serif" font-size="28" font-weight="700" letter-spacing="8" fill="#FFFFFF">
        PROPERTY
      </text>

      <!-- RENTALS & TRIPS -->
      <text x="3" y="156" font-family="'Poppins', sans-serif" font-size="20" font-weight="600" letter-spacing="4" fill="#E5B94E">
        RENTALS &amp; TRIPS
      </text>

      <!-- Short, punchy tagline with "Trips" -->
      <text x="3" y="208" font-family="'Poppins', sans-serif" font-size="20" font-weight="400" fill="#CBD5E1">
        Vacation Rentals &amp; Red Sea Trips in Hurghada
      </text>
    </g>
  </svg>
  `;

  const badgeForOg = await sharp(badge1124).resize(430, 430).png().toBuffer();

  await sharp(Buffer.from(ogBgSvg))
    .composite([
      {
        input: badgeForOg,
        top: 100,
        left: 75,
      },
    ])
    .jpeg({ quality: 94 })
    .toFile(path.join(publicDir, "og-image.jpg"));

  console.log("Saved fixed public/og-image.jpg with short punchy text using Trips!");
  console.log("All logo fixes completed successfully!");
}

fixAllLogosAndOg().catch(console.error);

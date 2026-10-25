import sharp from "sharp";
import fs from "fs";
import path from "path";

const LOGO_PATH = "E:/Freelancing/Decoration_Website/assets/Logo.jpeg";
const PROJECT_ROOT = process.cwd();

async function run() {
  console.log("Reading source logo from:", LOGO_PATH);
  if (!fs.existsSync(LOGO_PATH)) {
    throw new Error(`Logo file not found at ${LOGO_PATH}`);
  }

  // Target solid background: Deep emerald forest green #0E2A22
  const solidR = 14, solidG = 42, solidB = 34; // #0E2A22

  // 1. Isolate the emblem (without text)
  // Emblem bounding box in Logo.jpeg: x=270 to 450, y=160 to 396
  const cropLeft = 270, cropTop = 160, cropW = 180, cropH = 236;
  const { data: cropData, info: cropInfo } = await sharp(LOGO_PATH)
    .extract({ left: cropLeft, top: cropTop, width: cropW, height: cropH })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = cropInfo;
  const isolated = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const outIdx = (y * width + x) * 4;
      const r = cropData[idx], g = cropData[idx + 1], b = cropData[idx + 2];

      const warmth = r - b;
      const greenDominance = g - r;

      let alpha = 0.0;
      if (r > 95 && warmth > 15) {
        alpha = 1.0;
      } else if (r > 70 && greenDominance < 15) {
        alpha = Math.min(1.0, (r - 60) / 35);
      } else if (r > 130) {
        alpha = 1.0;
      } else if (warmth > 20 && r > 55) {
        alpha = Math.min(1.0, (warmth - 10) / 20);
      }

      isolated[outIdx] = Math.round(r * alpha + solidR * (1 - alpha));
      isolated[outIdx + 1] = Math.round(g * alpha + solidG * (1 - alpha));
      isolated[outIdx + 2] = Math.round(b * alpha + solidB * (1 - alpha));
      isolated[outIdx + 3] = 255;
    }
  }

  // 2. Build 512x512 Master Emblem on solid background
  // Emblem occupies ~69% of height (354px high by 270px wide), centered with padding
  const emblemResized = await sharp(isolated, { raw: { width, height, channels: 4 } })
    .resize(270, 354, { kernel: "lanczos3" })
    .png()
    .toBuffer();

  const master512 = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: solidR, g: solidG, b: solidB, alpha: 1 },
    },
  })
    .composite([{ input: emblemResized, gravity: "center" }])
    .png()
    .toBuffer();

  // Export 512x512 icon.png
  const appIconPath = path.join(PROJECT_ROOT, "src/app/icon.png");
  const publicIconPath = path.join(PROJECT_ROOT, "public/icon.png");
  const publicIcon512Path = path.join(PROJECT_ROOT, "public/icon-512.png");
  fs.writeFileSync(appIconPath, master512);
  fs.writeFileSync(publicIconPath, master512);
  fs.writeFileSync(publicIcon512Path, master512);
  console.log("✓ Exported 512x512 icon.png to src/app and public/");

  // Export 192x192 icon-192.png
  const icon192 = await sharp(master512).resize(192, 192).png().toBuffer();
  fs.writeFileSync(path.join(PROJECT_ROOT, "public/icon-192.png"), icon192);
  console.log("✓ Exported 192x192 icon-192.png to public/");

  // Export 180x180 apple-icon.png
  const apple180 = await sharp(master512).resize(180, 180).png().toBuffer();
  fs.writeFileSync(path.join(PROJECT_ROOT, "src/app/apple-icon.png"), apple180);
  fs.writeFileSync(path.join(PROJECT_ROOT, "public/apple-icon.png"), apple180);
  fs.writeFileSync(path.join(PROJECT_ROOT, "public/apple-touch-icon.png"), apple180);
  console.log("✓ Exported 180x180 apple-icon.png to src/app and public/");

  // Export 96x96 and 48x48
  const fav96 = await sharp(master512).resize(96, 96).png().toBuffer();
  fs.writeFileSync(path.join(PROJECT_ROOT, "public/favicon-96x96.png"), fav96);

  const fav48 = await sharp(master512).resize(48, 48).png().toBuffer();
  fs.writeFileSync(path.join(PROJECT_ROOT, "public/favicon-48x48.png"), fav48);
  fs.writeFileSync(path.join(PROJECT_ROOT, "public/favicon.png"), fav48);
  console.log("✓ Exported 48x48 and 96x96 favicons to public/");

  // 3. Build multi-size favicon.ico containing 48x48 and 32x32 (and 16x16)
  const ico48 = await sharp(master512).resize(48, 48).ensureAlpha().png().toBuffer();
  const ico32 = await sharp(master512).resize(32, 32).ensureAlpha().png().toBuffer();
  const ico16 = await sharp(master512).resize(16, 16).ensureAlpha().png().toBuffer();

  const icoImages = [
    { size: 16, buf: ico16 },
    { size: 32, buf: ico32 },
    { size: 48, buf: ico48 },
  ];

  const numImages = icoImages.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type 1 = ICO
  header.writeUInt16LE(numImages, 4); // Count

  const dirEntries = Buffer.alloc(16 * numImages);
  let dataOffset = 6 + 16 * numImages;

  for (let i = 0; i < numImages; i++) {
    const { size, buf } = icoImages[i];
    const entryOffset = i * 16;
    dirEntries.writeUInt8(size, entryOffset); // width
    dirEntries.writeUInt8(size, entryOffset + 1); // height
    dirEntries.writeUInt8(0, entryOffset + 2); // color count
    dirEntries.writeUInt8(0, entryOffset + 3); // reserved
    dirEntries.writeUInt16LE(1, entryOffset + 4); // planes
    dirEntries.writeUInt16LE(32, entryOffset + 6); // bpp
    dirEntries.writeUInt32LE(buf.length, entryOffset + 8); // size
    dirEntries.writeUInt32LE(dataOffset, entryOffset + 12); // offset
    dataOffset += buf.length;
  }

  const icoBuffer = Buffer.concat([
    header,
    dirEntries,
    ...icoImages.map((img) => img.buf),
  ]);

  fs.writeFileSync(path.join(PROJECT_ROOT, "src/app/favicon.ico"), icoBuffer);
  fs.writeFileSync(path.join(PROJECT_ROOT, "public/favicon.ico"), icoBuffer);
  console.log("✓ Exported multi-size favicon.ico (48x48, 32x32, 16x16) to src/app and public/");

  // 4. Generate 1200x630 Open Graph image with full logo
  const { data: ogRaw, info: ogInfo } = await sharp(LOGO_PATH)
    .resize(null, 630, { fit: "contain" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const fadeW = 70;
  const ogFeathered = Buffer.alloc(ogInfo.width * ogInfo.height * 4);
  for (let y = 0; y < ogInfo.height; y++) {
    for (let x = 0; x < ogInfo.width; x++) {
      const srcIdx = (y * ogInfo.width + x) * ogInfo.channels;
      const dstIdx = (y * ogInfo.width + x) * 4;
      ogFeathered[dstIdx] = ogRaw[srcIdx];
      ogFeathered[dstIdx + 1] = ogRaw[srcIdx + 1];
      ogFeathered[dstIdx + 2] = ogRaw[srcIdx + 2];

      let a = 1.0;
      if (x < fadeW) a = x / fadeW;
      else if (x > ogInfo.width - fadeW) a = (ogInfo.width - x) / fadeW;
      ogFeathered[dstIdx + 3] = Math.round(a * 255);
    }
  }

  const ogLogoPng = await sharp(ogFeathered, {
    raw: { width: ogInfo.width, height: ogInfo.height, channels: 4 },
  })
    .png()
    .toBuffer();

  const ogBuffer = await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 4,
      background: { r: 16, g: 45, b: 35, alpha: 1 },
    },
  })
    .composite([{ input: ogLogoPng, gravity: "center" }])
    .jpeg({ quality: 94 })
    .toBuffer();

  const publicImagesDir = path.join(PROJECT_ROOT, "public/images");
  if (!fs.existsSync(publicImagesDir)) {
    fs.mkdirSync(publicImagesDir, { recursive: true });
  }

  fs.writeFileSync(path.join(PROJECT_ROOT, "public/og-image.jpg"), ogBuffer);
  fs.writeFileSync(path.join(publicImagesDir, "og-image.jpg"), ogBuffer);
  console.log("✓ Exported 1200x630 Open Graph image to public/og-image.jpg and public/images/og-image.jpg");
}

run().catch((err) => {
  console.error("Error generating favicons and OG images:", err);
  process.exit(1);
});

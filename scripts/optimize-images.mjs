import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SOURCE_DIRS = [
  path.resolve("public/assets"),
];

const TARGET_DIR = path.resolve("public/images");
const MANIFEST_PATH = path.resolve("src/data/imageManifest.json");
const MANIFEST_TS_PATH = path.resolve("src/data/imageManifest.ts");

const WIDTHS = [480, 800, 1200, 1600, 2400];
const AVIF_QUALITY = 65;
const WEBP_QUALITY = 84;
const JPEG_QUALITY = 85;

// Only process actual photography / brand image files (skip pdf, docx, etc.)
const VALID_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

// Map files to standardized slug names
function getSlug(filename) {
  const parsed = path.parse(filename);
  let base = parsed.name.toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]/g, "");

  return base;
}

async function run() {
  console.log("Starting image optimization pipeline...");
  const manifest = {};

  const fileMap = new Map();

  for (const srcDir of SOURCE_DIRS) {
    if (!fs.existsSync(srcDir)) continue;
    const files = fs.readdirSync(srcDir);
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (!VALID_EXTENSIONS.has(ext)) continue;

      // Skip non-slug temporary or duplicate files if needed
      const slug = getSlug(file);
      // Give preference to named ones (birthday-*, marriage-*, babyshower-*, logo, visiting_card)
      if (!fileMap.has(slug) || file.startsWith("birthday") || file.startsWith("marriage") || file.startsWith("babyshower")) {
        fileMap.set(slug, {
          slug,
          fullPath: path.join(srcDir, file),
          originalName: file,
        });
      }
    }
  }

  const entries = Array.from(fileMap.values());
  console.log(`Discovered ${entries.length} images to optimize.`);

  for (let i = 0; i < entries.length; i++) {
    const { slug, fullPath, originalName } = entries[i];
    console.log(`[${i + 1}/${entries.length}] Processing ${originalName} -> ${slug}...`);

    try {
      const imageInstance = sharp(fullPath).rotate();
      const metadata = await imageInstance.metadata();

      const origWidth = metadata.width || 1200;
      const origHeight = metadata.height || 800;
      const aspectRatio = origWidth / origHeight;

      // 1. Generate tiny 24px base64 blurred placeholder
      const placeholderBuffer = await sharp(fullPath)
        .rotate()
        .resize({ width: 24, withoutEnlargement: true })
        .webp({ quality: 20 })
        .toBuffer();
      const blurDataURL = `data:image/webp;base64,${placeholderBuffer.toString("base64")}`;

      const avifVariants = [];
      const webpVariants = [];
      const jpegVariants = [];

      for (const targetWidth of WIDTHS) {
        // Do not upscale past original width if original width is smaller than targetWidth
        // but always generate at least the first smaller width (480)
        if (targetWidth > origWidth && targetWidth > 800 && targetWidth !== WIDTHS[0]) {
          continue;
        }

        const outAvif = `${slug}-${targetWidth}.avif`;
        const outWebp = `${slug}-${targetWidth}.webp`;
        const outJpeg = `${slug}-${targetWidth}.jpeg`;

        const outAvifPath = path.join(TARGET_DIR, outAvif);
        const outWebpPath = path.join(TARGET_DIR, outWebp);
        const outJpegPath = path.join(TARGET_DIR, outJpeg);

        // Resize: cap long edge, maintain ratio
        const resizer = sharp(fullPath)
          .rotate()
          .resize({
            width: targetWidth,
            withoutEnlargement: true,
          });

        await Promise.all([
          resizer.clone().avif({ quality: AVIF_QUALITY, effort: 4 }).toFile(outAvifPath),
          resizer.clone().webp({ quality: WEBP_QUALITY, effort: 4 }).toFile(outWebpPath),
          resizer.clone().jpeg({ quality: JPEG_QUALITY, progressive: true }).toFile(outJpegPath),
        ]);

        avifVariants.push(`/images/${outAvif} ${targetWidth}w`);
        webpVariants.push(`/images/${outWebp} ${targetWidth}w`);
        jpegVariants.push(`/images/${outJpeg} ${targetWidth}w`);
      }

      // Default fallback src (pick an 800w or 1200w webp)
      const defaultWidth = WIDTHS.find((w) => w <= origWidth && w >= 800) || WIDTHS[0];
      const defaultWebp = `/images/${slug}-${defaultWidth}.webp`;
      const defaultFallback = `/images/${slug}-${defaultWidth}.jpeg`;

      manifest[slug] = {
        slug,
        originalSrc: `/assets/${originalName}`,
        width: origWidth,
        height: origHeight,
        aspectRatio,
        blurDataURL,
        avifSrcSet: avifVariants.join(", "),
        webpSrcSet: webpVariants.join(", "),
        jpegSrcSet: jpegVariants.join(", "),
        defaultSrc: defaultWebp,
        fallbackSrc: defaultFallback,
      };

      // Also index by original asset path so any component passing "/assets/marriage-01.jpeg" finds it immediately
      manifest[`/assets/${originalName}`] = manifest[slug];
    } catch (err) {
      console.error(`Failed to process ${originalName}:`, err.message);
    }
  }

  // Save JSON manifest
  const manifestDir = path.dirname(MANIFEST_PATH);
  if (!fs.existsSync(manifestDir)) fs.mkdirSync(manifestDir, { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

  // Save TypeScript helper module
  const tsContent = `// Auto-generated by scripts/optimize-images.mjs - DO NOT EDIT MANUALLY
export interface ImageManifestEntry {
  slug: string;
  originalSrc: string;
  width: number;
  height: number;
  aspectRatio: number;
  blurDataURL: string;
  avifSrcSet: string;
  webpSrcSet: string;
  jpegSrcSet: string;
  defaultSrc: string;
  fallbackSrc: string;
}

import manifestData from "./imageManifest.json";

export const IMAGE_MANIFEST: Record<string, ImageManifestEntry> = manifestData as Record<string, ImageManifestEntry>;

export function getImageMetadata(srcOrSlug: string): ImageManifestEntry | undefined {
  if (!srcOrSlug) return undefined;
  if (IMAGE_MANIFEST[srcOrSlug]) return IMAGE_MANIFEST[srcOrSlug];

  // Try normalized slug
  const normalized = srcOrSlug
    .replace(/^\\/assets\\//, "")
    .replace(/^\\/images\\//, "")
    .replace(/\\.[a-z0-9]+$/i, "")
    .replace(/-\\d+$/, "");

  return IMAGE_MANIFEST[normalized];
}
`;
  fs.writeFileSync(MANIFEST_TS_PATH, tsContent);

  console.log(`Image optimization complete. Manifest written to ${MANIFEST_PATH}`);
}

run();

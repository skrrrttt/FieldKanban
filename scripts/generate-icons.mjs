import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = join(__dirname, '..', 'public');

// SVG template for the icon
const createSvg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.125}" fill="#1e40af"/>
  <text x="${size / 2}" y="${size * 0.625}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="${size * 0.55}" font-weight="bold" fill="white">FK</text>
</svg>
`;

async function generateIcons() {
  const sizes = [192, 512];

  for (const size of sizes) {
    const svg = Buffer.from(createSvg(size));
    await sharp(svg)
      .resize(size, size)
      .png()
      .toFile(join(publicDir, `icon-${size}.png`));
    console.log(`Generated icon-${size}.png`);
  }

  // Generate favicon (32x32)
  const faviconSvg = Buffer.from(createSvg(32));
  await sharp(faviconSvg)
    .resize(32, 32)
    .png()
    .toFile(join(publicDir, 'favicon.png'));
  console.log('Generated favicon.png');
}

generateIcons().catch(console.error);

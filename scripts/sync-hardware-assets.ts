/**
 * Sync hardware asset JSON + SVG stub files from lib/hardware/asset-data.ts
 * Run: npx tsx scripts/sync-hardware-assets.ts
 */
import fs from "node:fs";
import path from "node:path";
import { HARDWARE_ASSETS } from "../lib/hardware/asset-data";

const ROOT = path.join(process.cwd(), "assets", "components");

const SVG_STUB = (name: string, w: number, h: number) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="8" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="2"/>
  <text x="${w / 2}" y="${h / 2}" text-anchor="middle" fill="#64748B" font-family="monospace" font-size="12">${name}</text>
</svg>`;

for (const [id, asset] of Object.entries(HARDWARE_ASSETS)) {
  const dir = path.join(ROOT, id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "metadata.json"), JSON.stringify(asset.metadata, null, 2));
  fs.writeFileSync(path.join(dir, "pins.json"), JSON.stringify({ pins: asset.pins }, null, 2));
  fs.writeFileSync(path.join(dir, "animations.json"), JSON.stringify({ animations: asset.animations }, null, 2));
  fs.writeFileSync(
    path.join(dir, "component.svg"),
    SVG_STUB(asset.metadata.name, asset.metadata.width, asset.metadata.height),
  );
  console.log("wrote", id);
}

console.log(`Synced ${Object.keys(HARDWARE_ASSETS).length} hardware assets.`);

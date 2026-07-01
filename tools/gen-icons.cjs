// 產生 PWA App 圖示：把像素史萊姆畫在漸層底上，輸出多尺寸 PNG。
// 執行：node tools/gen-icons.cjs
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

// 取得 sprites.js 的 SPRITES（eval 後透過 globalThis 帶出）
const code = fs.readFileSync(path.join(__dirname, "../www/sprites.js"), "utf8") + "\n;globalThis.__SPRITES=SPRITES;";
eval(code);
const SPRITES = globalThis.__SPRITES;

function buildIconSVG(size) {
  const m = SPRITES.slime;
  const cols = Math.max(...m.map(r => r.length)), rows = m.length;
  const pal = { B: "#7ed957", D: "#4a9e2f", L: "#b6f09c" };
  const colors = { B: pal.B, D: pal.D, L: pal.L, o: "#ffffff", x: "#1a1530", a: "#ff6f91" };
  const scale = size * 0.6 / cols;          // 圖示佔 60%（maskable 安全區）
  const gw = cols * scale, gh = rows * scale;
  const ox = (size - gw) / 2, oy = (size - gh) / 2 + size * 0.02;
  let rects = "";
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < m[y].length; x++) {
      const ch = m[y][x];
      if (ch === "." || ch === " ") continue;
      rects += `<rect x="${(ox + x * scale).toFixed(2)}" y="${(oy + y * scale).toFixed(2)}" width="${(scale + 0.6).toFixed(2)}" height="${(scale + 0.6).toFixed(2)}" fill="${colors[ch] || pal.B}"/>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#22c1d6"/><stop offset="1" stop-color="#0e6f8a"/>
    </linearGradient></defs>
    <rect width="${size}" height="${size}" fill="url(#g)"/>
    ${rects}
  </svg>`;
}

const outDir = path.join(__dirname, "../www/assets/icons");
fs.mkdirSync(outDir, { recursive: true });

async function main() {
  const svg512 = Buffer.from(buildIconSVG(512));
  const targets = [
    { file: "icon-512.png", size: 512 },
    { file: "icon-192.png", size: 192 },
    { file: "icon-180.png", size: 180 }, // apple-touch-icon
  ];
  for (const t of targets) {
    await sharp(svg512).resize(t.size, t.size).png().toFile(path.join(outDir, t.file));
    console.log("✓", t.file, `(${t.size}x${t.size})`);
  }
}
main().catch(e => { console.error(e); process.exit(1); });

// =====================================================================
// 像素怪物 sprite 系統
// 每個 sprite = 像素矩陣（字元 → 調色盤 key），用 SVG <rect> 渲染。
// 同一隻 sprite 可套不同 palette 重新上色，免外部圖檔。
//   B=主體 D=暗部 L=亮部 o=眼白 x=瞳孔/輪廓 a=口/腮紅
// '.' = 透明
// =====================================================================

const SPRITES = {
  slime: [
    "............",
    "....DDDD....",
    "..DDBBBBDD..",
    ".DBBBBBBBBD.",
    ".DBBBBBBBBD.",
    ".BBoBBBBoBB.",
    ".BBxBBBBxBB.",
    ".DBBaBBaBBD.",
    ".DBBBBBBBBD.",
    "..LLLLLLLL..",
    "............",
  ],
  goblin: [
    "............",
    ".DD......DD.",
    ".DDD....DDD.",
    "..DBBBBBBD..",
    "..BBBBBBBB..",
    "..BoBBBBoB..",
    "..BxBBBBxB..",
    "..BBBBBBBB..",
    "..BaaaaaaB..",
    "..DBBBBBBD..",
    "...DBBBBD...",
    "....DDDD....",
  ],
  skull: [
    "............",
    "...DDDDDD...",
    "..DBBBBBBD..",
    ".DBBBBBBBBD.",
    ".DBxxBBxxBD.",
    ".DBxxBBxxBD.",
    ".DBBBBBBBBD.",
    ".DBBBaaBBBD.",
    "..DBBBBBBD..",
    "..BBBBBBBB..",
    "..BxBxBxBB..",
    "...BBBBBB...",
  ],
  bat: [
    "............",
    "DDD......DDD",
    "DDDD....DDDD",
    ".DDBBBBBBDD.",
    "..BBoBBoBB..",
    "..BBxBBxBB..",
    "..BBBaaBBB..",
    "..LBBBBBBL..",
    "...D.DD.D...",
    "............",
  ],
  dragon: [
    "..D......D..",
    "..DD....DD..",
    "...DBBBBD...",
    "..DBBBBBBD..",
    "..BoBBBBoB..",
    "..BxBBBBxB..",
    ".DBBBBBBBBD.",
    ".DBBaaaaBBD.",
    ".LBBBBBBBBL.",
    "..DBB..BBD..",
    "..DD....DD..",
    "............",
  ],
  ghost: [
    "............",
    "...DDDDDD...",
    "..DBBBBBBD..",
    ".DBBBBBBBBD.",
    ".BBxBBBBxBB.",
    ".BBxBBBBxBB.",
    ".BBBBaaBBBB.",
    ".BBBBBBBBBB.",
    ".BBBBBBBBBB.",
    ".BDBBDBBDBB.",
    "..D..D..D...",
    "............",
  ],
};

function spriteSVG(type, pal, px) {
  const m = SPRITES[type];
  if (!m) return `<span style="font-size:${px}px">❓</span>`;
  const cols = Math.max(...m.map(r => r.length));
  const rows = m.length;
  const colors = {
    B: pal.B, D: pal.D, L: pal.L || pal.B,
    o: "#ffffff", x: "#1a1530", a: pal.a || "#ff6f91",
  };
  let rects = "";
  for (let y = 0; y < rows; y++) {
    const row = m[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === "." || ch === " ") continue;
      rects += `<rect x="${x}" y="${y}" width="1.03" height="1.03" fill="${colors[ch] || pal.B}"/>`;
    }
  }
  const h = Math.round(px * rows / cols);
  return `<svg class="pixel" viewBox="0 0 ${cols} ${rows}" width="${px}" height="${h}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">${rects}</svg>`;
}

// =====================================================================
// 單字怪物 — 核心遊戲邏輯
// =====================================================================

const SAVE_KEY = "word-monster-save-v1";
const PLAYER_MAX_HP = 5;       // 真失誤扣命上限
const TIME_PER_LEVEL = 75;     // 每關秒數（預覽時間不計入）
const FLIP_BACK_MS = 1000;     // 翻錯蓋回延遲（真失誤）
const PEEK_BACK_MS = 700;      // 蓋回延遲（盲猜探索，較快）
const PEEK_MS = 10000;         // 開局亮牌預覽時間（實際依 difficultyFor 的 peek）

// ---------- 存檔 ----------
function loadSave() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || { stars: {} }; }
  catch { return { stars: {} }; }
}
function saveGame(s) { localStorage.setItem(SAVE_KEY, JSON.stringify(s)); }
let save = loadSave(); // { stars: { [levelId]: 1|2|3 }, attackEl: 屬性 key }
if (!ELEMENTS[save.attackEl]) save.attackEl = "fire";
const starsOf = (id) => save.stars[id] || 0;

// ---------- 解鎖邏輯 ----------
function packCleared(pi) { return PACKS[pi].levels.every(l => starsOf(l.id) > 0); }
function packUnlocked(pi) { return pi === 0 || packCleared(pi - 1); }
function levelUnlocked(pi, li) {
  if (!packUnlocked(pi)) return false;
  if (li === 0) return true;
  return starsOf(PACKS[pi].levels[li - 1].id) > 0; // 同包前一關通關
}

// ---------- 音效（Web Audio，免素材） ----------
let actx;
function beep(freq, dur = 0.12, type = "square", vol = 0.15) {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.value = vol;
    o.connect(g); g.connect(actx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + dur);
    o.stop(actx.currentTime + dur);
  } catch {}
}
const SCALE = [523, 587, 659, 698, 784, 880, 988, 1047];
function comboTone(combo) { beep(SCALE[Math.min(combo, SCALE.length - 1)], 0.14, "triangle", 0.18); }
function wrongTone() { beep(160, 0.2, "sawtooth", 0.14); }

// ---------- TTS ----------
function speak(text) {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US"; u.rate = 0.9;
  speechSynthesis.speak(u);
}
function speakSeq(words, i = 0) {
  if (i >= words.length || !("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(words[i]);
  u.lang = "en-US"; u.rate = 0.95;
  u.onend = () => speakSeq(words, i + 1);
  speechSynthesis.speak(u);
}

// ---------- 工具 ----------
const sprite = (lv, px) => spriteSVG(lv.sprite, lv.pal, px);
function show(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function starStr(n) { return "★".repeat(n) + "☆".repeat(3 - n); }
function svgIcon(name) {
  const common = `fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" aria-hidden="true"`;
  const icons = {
    "arrow-left": `<svg ${common}><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>`,
    "arrow-right": `<svg ${common}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`,
    book: `<svg ${common}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z"/></svg>`,
    home: `<svg ${common}><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>`,
    lock: `<svg ${common}><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>`,
    timer: `<svg ${common}><path d="M10 2h4"/><path d="M12 14V9"/><path d="M9 14h3"/><circle cx="12" cy="14" r="8"/></svg>`,
    volume: `<svg ${common}><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M16 9.5a4 4 0 0 1 0 5"/><path d="M19 7a8 8 0 0 1 0 10"/></svg>`,
    retry: `<svg ${common}><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v6h6"/></svg>`,
    leaf: `<svg ${common}><path d="M11 20A7 7 0 0 1 4 13c0-4.5 3.5-9 16-9-1 12.5-5 16-9 16z"/><path d="M4 21c3-5.5 7-9.5 12-12.5"/></svg>`,
    flame: `<svg ${common}><path d="M12 2c.6 3.5-4 6-4 10a4 4 0 0 0 8 0c0-2-1.1-3.4-2-4.5-.2 1.2-.7 2-1.6 2.5.4-2.5-.4-6-.4-8z"/></svg>`,
    droplet: `<svg ${common}><path d="M12 3s6 6.4 6 10a6 6 0 0 1-12 0c0-3.6 6-10 6-10z"/></svg>`,
    sun: `<svg ${common}><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.9 4.9 1.4 1.4"/><path d="m17.7 17.7 1.4 1.4"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m4.9 19.1 1.4-1.4"/><path d="m17.7 6.3 1.4-1.4"/></svg>`,
    moon: `<svg ${common}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>`,
  };
  return icons[name] || "";
}
function iconHTML(name) { return `<span class="btn-icon">${svgIcon(name)}</span>`; }
// 屬性小徽章；key 不存在（未解鎖）時顯示未知
function elBadge(key, extra = "") {
  const e = ELEMENTS[key];
  if (!e) return `<span class="el-chip unknown ${extra}">？屬性</span>`;
  return `<span class="el-chip ${extra}" style="--el:${e.color};--el-bg:${e.bg}">${svgIcon(e.icon)}${e.name}</span>`;
}
// 相剋關係：atk 對 mon → "adv"（剋制）/ "dis"（被剋）/ "even"
function matchup(atk, mon) {
  if (BEATS[atk] === mon) return "adv";
  if (BEATS[mon] === atk) return "dis";
  return "even";
}
function hydrateIcons(root = document) {
  root.querySelectorAll("[data-icon]").forEach(el => { el.innerHTML = svgIcon(el.dataset.icon); });
}
function makePressable(el, action, label) {
  el.setAttribute("role", "button");
  el.tabIndex = 0;
  if (label) el.setAttribute("aria-label", label);
  el.onclick = action;
  el.onkeydown = (ev) => {
    if (ev.key === "Enter" || ev.key === " ") {
      ev.preventDefault();
      action();
    }
  };
}
function renderHeroStats() {
  const box = document.getElementById("heroStats");
  if (!box) return;
  const totalStars = ALL_LEVELS.reduce((sum, lv) => sum + starsOf(lv.id), 0);
  const maxStars = ALL_LEVELS.length * 3;
  const cleared = ALL_LEVELS.filter(lv => starsOf(lv.id) > 0).length;
  const mastered = ALL_LEVELS.filter(lv => starsOf(lv.id) === 3).length;
  box.innerHTML = `
    <span class="hero-chip">★ ${totalStars} / ${maxStars}</span>
    <span class="hero-chip">通關 ${cleared}</span>
    <span class="hero-chip">大師 ${mastered}</span>`;
}

// =====================================================================
// 字彙包選單
// =====================================================================
function renderPacks() {
  renderHeroStats();
  const list = document.getElementById("packList");
  list.innerHTML = "";
  PACKS.forEach((pack, pi) => {
    const unlocked = packUnlocked(pi);
    const got = pack.levels.reduce((s, l) => s + starsOf(l.id), 0);
    const max = pack.levels.length * 3;
    const lead = pack.levels[0];
    const el = document.createElement("div");
    el.className = "pack-card" + (unlocked ? "" : " locked");
    if (!unlocked) el.setAttribute("aria-disabled", "true");
    el.innerHTML = `
      <div class="pk-art">${unlocked ? sprite(lead, 56) : `<span class="btn-icon lock-mark">${svgIcon("lock")}</span>`}</div>
      <div class="pk-info">
        <div class="pk-name">${pack.name}</div>
        <div class="pk-sub">${unlocked ? pack.sub : "通關前一個字彙包解鎖"}</div>
        <div class="pk-prog">${unlocked ? `★ ${got} / ${max} · ${pack.levels.length} 關` : ""}</div>
      </div>`;
    if (unlocked) makePressable(el, () => openPack(pi), `開啟${pack.name}`);
    list.appendChild(el);
  });
}

let currentPack = 0;
function openPack(pi) {
  currentPack = pi;
  const pack = PACKS[pi];
  document.getElementById("levelPackName").textContent = pack.name;
  const list = document.getElementById("levelList");
  list.innerHTML = "";
  pack.levels.forEach((lv, li) => {
    const unlocked = levelUnlocked(pi, li);
    const stars = starsOf(lv.id);
    const d = difficultyFor(lv);
    const el = document.createElement("div");
    el.className = "level-card" + (unlocked ? "" : " locked") + (stars === 3 ? " mastered" : stars ? " cleared" : "");
    if (!unlocked) el.setAttribute("aria-disabled", "true");
    el.innerHTML = `
      <div class="lc-emoji">${unlocked ? sprite(lv, 46) : `<span class="btn-icon lock-mark">${svgIcon("lock")}</span>`}</div>
      <div class="lc-info">
        <div class="lc-name">${unlocked ? lv.monster : "？？？"}${unlocked && stars > 0 ? " " + elBadge(lv.el) : ""}${d.isBoss ? ` <span class="boss-tag">BOSS</span>` : ""}</div>
        <div class="lc-sub">第 ${lv.id} 關 · ♥${d.lives} · ${d.time}s · 預覽${d.peek}s</div>
      </div>
      <div class="lc-stars">${starStr(stars)}</div>`;
    if (unlocked) makePressable(el, () => openIntro(lv), `挑戰第 ${lv.id} 關，${lv.monster}`);
    list.appendChild(el);
  });
  show("levelScreen");
}

// =====================================================================
// 戰鬥
// =====================================================================
let game = null;

// 難度曲線：隨關卡進度遞增，boss 關（每包最後一關）更硬
function difficultyFor(lv) {
  const gi = ALL_LEVELS.findIndex(l => l.id === lv.id); // 全域關卡序 0..N-1
  const meta = ALL_LEVELS[gi];
  const pack = PACKS[meta.packIdx];
  const isBoss = meta.levelIdx === pack.levels.length - 1;
  let peek   = Math.max(6, +(10 - gi * 0.36).toFixed(1)); // 預覽秒數 10.0 → 6.0
  let lives  = Math.max(3, 5 - Math.floor(gi / 4));        // 命 5 → 3
  let time   = Math.max(48, 75 - gi * 2);                  // 秒數 75 → ~50
  let budget = Math.max(1, 4 - Math.floor(gi / 3));        // 免責盲猜次數 4 → 1
  if (isBoss) {
    peek = Math.max(5, +(peek - 1).toFixed(1));
    time = Math.max(45, time - 5);
    budget = Math.max(0, budget - 1);
  }
  return { peek, lives, time, budget, isBoss };
}

// =====================================================================
// 戰前情報 / 攻擊屬性選擇
// =====================================================================
function openIntro(lv) {
  const overlay = document.getElementById("overlay");
  const modal = document.getElementById("modal");
  const stars = starsOf(lv.id);
  const known = stars > 0; // 打贏過才知道怪物屬性
  const d = difficultyFor(lv);

  const weakInfo = stars >= 3
    ? `<p class="hint weak-info">弱點單字：${lv.weak.map(en => {
        const w = lv.words.find(x => x.en === en);
        return `<span class="weak-chip">${en} ${w ? w.zh : ""}</span>`;
      }).join("")}</p>`
    : `<p class="hint">★★★ 大師可解鎖弱點單字情報</p>`;

  modal.className = "modal intro-modal";
  modal.innerHTML = `
    <div class="m-emoji">${sprite(lv, 84)}</div>
    <h2>${lv.monster}${d.isBoss ? ` <span class="boss-tag">BOSS</span>` : ""}</h2>
    <div class="intro-mel">${known ? elBadge(lv.el) : elBadge(null)}</div>
    <p>第 ${lv.id} 關 · ♥${d.lives} · ${d.time}s · 預覽 ${d.peek}s</p>
    ${weakInfo}
    <div class="intro-pick-label">選擇攻擊屬性</div>
    <div class="intro-el-grid" id="introElGrid"></div>
    <p class="vs-hint" id="vsHint"></p>
    <p class="hint">相剋口訣：火剋草 · 草剋水 · 水剋火 · 光暗互剋</p>
    <button class="btn" id="introFight">開戰！</button>
    <button class="btn ghost" id="introBack">${iconHTML("arrow-left")}返回</button>`;

  const grid = modal.querySelector("#introElGrid");
  const hint = modal.querySelector("#vsHint");
  function renderHint() {
    if (!known) {
      hint.textContent = "屬性未知——擊敗一次後解鎖情報";
      hint.className = "vs-hint";
      return;
    }
    const r = matchup(save.attackEl, lv.el);
    if (r === "adv") { hint.textContent = "效果絕佳！弱點傷害 x3，免責 +1"; hint.className = "vs-hint adv"; }
    else if (r === "dis") { hint.textContent = "效果不佳…弱點加成被封印"; hint.className = "vs-hint dis"; }
    else { hint.textContent = "普通效果：弱點傷害 x2"; hint.className = "vs-hint"; }
  }
  Object.keys(ELEMENTS).forEach(key => {
    const e = ELEMENTS[key];
    const b = document.createElement("button");
    b.className = "el-btn" + (save.attackEl === key ? " sel" : "");
    b.style.setProperty("--el", e.color);
    b.style.setProperty("--el-bg", e.bg);
    b.innerHTML = `${svgIcon(e.icon)}${e.name}`;
    b.setAttribute("aria-label", `攻擊屬性 ${e.name}`);
    b.onclick = () => {
      save.attackEl = key; saveGame(save);
      grid.querySelectorAll(".el-btn").forEach(x => x.classList.remove("sel"));
      b.classList.add("sel");
      renderHint();
    };
    grid.appendChild(b);
  });
  renderHint();

  modal.querySelector("#introFight").onclick = () => {
    overlay.classList.remove("active");
    startBattle(lv);
  };
  modal.querySelector("#introBack").onclick = () => overlay.classList.remove("active");
  overlay.classList.add("active");
}

function startBattle(lv) {
  const cards = [];
  lv.words.forEach((w, wi) => {
    cards.push({ id: "e" + wi, pairId: wi, type: "en", text: w.en });
    cards.push({ id: "z" + wi, pairId: wi, type: "zh", text: w.zh });
  });
  shuffle(cards);

  const d = difficultyFor(lv);
  const atkEl = save.attackEl;
  const rel = matchup(atkEl, lv.el); // adv / dis / even
  const budget = d.budget + (rel === "adv" ? 1 : 0); // 屬性優勢：免責 +1
  game = {
    lv, cards,
    monsterHp: lv.words.length, monsterMax: lv.words.length,
    livesMax: d.lives, playerHp: d.lives,
    time: d.time,
    peekMs: d.peek * 1000,
    exploreLeft: budget, exploreMax: budget,
    combo: 0, maxCombo: 0, mistakes: 0,
    first: null, busy: false, matched: 0, timer: null,
    seen: new Set(),   // 曾翻開過又蓋回的牌（判定「真失誤」用）
    atkEl, rel,
    weakSet: new Set(lv.weak || []), // 弱點單字（en）
    weakHits: 0,
    matchedPairs: new Set(),         // 已配對 pairId（提前擊破時算漏網單字）
  };

  document.getElementById("monsterSprite").innerHTML = sprite(lv, 96);
  document.getElementById("monsterName").textContent = lv.monster;
  document.getElementById("monsterEl").innerHTML = elBadge(lv.el);
  document.getElementById("playerEl").innerHTML =
    elBadge(atkEl) + (rel === "adv" ? `<span class="adv-tag">剋</span>` : rel === "dis" ? `<span class="dis-tag">被剋</span>` : "");
  renderBoard();
  updateBattleUI();
  show("battleScreen");
  peekStart();   // 開局亮牌預覽，結束後才開始倒數
}

// 開局亮牌預覽：全牌翻開數秒讓玩家記位置，不觸發 TTS、不計時、不列入 seen
function peekStart() {
  const g = game;
  g.busy = true;
  const cards = document.querySelectorAll("#board .card");
  cards.forEach(c => c.classList.add("flipped", "peek"));

  const banner = document.createElement("div");
  banner.className = "peek-banner";
  let left = Math.ceil(g.peekMs / 1000);
  banner.textContent = `記住位置 ${left}`;
  document.getElementById("battleScreen").appendChild(banner);
  const iv = setInterval(() => { left--; if (left > 0) banner.textContent = `記住位置 ${left}`; }, 1000);

  setTimeout(() => {
    clearInterval(iv);
    banner.remove();
    if (game !== g) return; // 預覽期間已離開戰鬥
    cards.forEach(c => c.classList.remove("flipped", "peek"));
    g.busy = false;
    clearInterval(g.timer);
    g.timer = setInterval(tick, 1000);
  }, g.peekMs);
}

function renderBoard() {
  const board = document.getElementById("board");
  board.innerHTML = "";
  game.cards.forEach((c, idx) => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.idx = idx;
    card.setAttribute("role", "button");
    card.tabIndex = 0;
    card.setAttribute("aria-label", `翻開第 ${idx + 1} 張牌`);
    card.innerHTML = `
      <div class="card-inner">
        <div class="card-face card-front"></div>
        <div class="card-face card-back ${c.type}">
          <div class="word">${c.text}</div>
          <div class="tag">${c.type === "en" ? "EN" : "中文"}</div>
        </div>
      </div>`;
    card.onclick = () => flipCard(idx);
    card.onkeydown = (ev) => {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        flipCard(idx);
      }
    };
    board.appendChild(card);
  });
}

function cardEl(idx) { return document.querySelector(`.card[data-idx="${idx}"]`); }

function flipCard(idx) {
  if (!game || game.busy) return;
  const c = game.cards[idx];
  const el = cardEl(idx);
  if (el.classList.contains("flipped") || el.classList.contains("matched")) return;

  el.classList.add("flipped");
  el.setAttribute("aria-label", c.type === "en" ? `英文 ${c.text}` : `中文 ${c.text}`);
  if (c.type === "en") speak(c.text);
  beep(440, 0.05, "square", 0.08);

  if (game.first === null) { game.first = idx; return; }
  const a = game.cards[game.first];
  if (a.pairId === c.pairId && game.first !== idx) matchSuccess(game.first, idx);
  else matchFail(game.first, idx);
  game.first = null;
}

function matchSuccess(i, j) {
  game.combo++;
  game.maxCombo = Math.max(game.maxCombo, game.combo);
  setTimeout(() => { cardEl(i).classList.add("matched"); cardEl(j).classList.add("matched"); }, 220);
  cardEl(i).setAttribute("aria-label", "已配對");
  cardEl(j).setAttribute("aria-label", "已配對");
  cardEl(i).tabIndex = -1;
  cardEl(j).tabIndex = -1;

  // 屬性相剋傷害：弱點字 x2；剋制怪物 x3；被剋則加成被封印
  const pairId = game.cards[i].pairId;
  const word = game.lv.words[pairId];
  const isWeak = game.weakSet.has(word.en);
  let dmg = 1;
  if (isWeak) dmg = game.rel === "adv" ? 3 : game.rel === "dis" ? 1 : 2;
  if (isWeak && dmg > 1) {
    game.weakHits++;
    beep(1175, 0.1, "triangle", 0.2); setTimeout(() => beep(1568, 0.16, "triangle", 0.2), 90);
  } else {
    comboTone(game.combo);
  }

  game.matched++;
  game.matchedPairs.add(pairId);
  game.monsterHp = Math.max(0, game.monsterHp - dmg);
  damageMonster(dmg, isWeak && dmg > 1);
  if (game.combo >= 2) showCombo(game.combo);
  updateBattleUI();

  if (game.monsterHp <= 0) setTimeout(() => endBattle(true), 650);
}

function matchFail(i, j) {
  game.busy = true;
  game.combo = 0;
  const bothSeen = game.seen.has(i) && game.seen.has(j);
  // 扣血規則：兩張都看過還配錯 = 真失誤，必扣；否則動用「免責探索額度」，額度用盡後盲猜也扣
  let penalize;
  if (bothSeen) penalize = true;
  else if (game.exploreLeft > 0) { penalize = false; game.exploreLeft--; }
  else penalize = true;

  if (penalize) {
    game.mistakes++;
    game.playerHp = Math.max(0, game.playerHp - 1);
    wrongTone();
    cardEl(i).classList.add("wrong");
    cardEl(j).classList.add("wrong");
    document.getElementById("app").classList.add("shake");
    setTimeout(() => document.getElementById("app").classList.remove("shake"), 300);
  } else {
    beep(300, 0.08, "sine", 0.07); // 免責探索：輕音、不扣血
  }
  updateBattleUI();

  setTimeout(() => {
    [i, j].forEach(k => {
      game.seen.add(k);
      cardEl(k).classList.remove("flipped", "wrong");
      cardEl(k).setAttribute("aria-label", `翻開第 ${Number(k) + 1} 張牌`);
    });
    game.busy = false;
    if (penalize && game.playerHp <= 0) endBattle(false);
  }, penalize ? FLIP_BACK_MS : PEEK_BACK_MS);
}

function damageMonster(dmg = 1, weak = false) {
  const m = document.getElementById("monsterSprite");
  m.classList.remove("hit"); void m.offsetWidth; m.classList.add("hit");
  const stage = document.querySelector(".monster-stage");
  const f = document.createElement("div");
  f.className = "float-dmg" + (weak ? " weak" : "");
  f.textContent = weak ? `弱點! -${dmg}` : `-${dmg}`;
  stage.appendChild(f);
  setTimeout(() => f.remove(), 800);
}

function showCombo(n) {
  const el = document.getElementById("comboText");
  el.textContent = `COMBO x${n}!`;
  el.style.transform = "scale(1.4)";
  setTimeout(() => { el.style.transform = "scale(1)"; }, 200);
}

function updateBattleUI() {
  const g = game;
  document.getElementById("monsterHpBar").style.width = (g.monsterHp / g.monsterMax * 100) + "%";
  document.getElementById("monsterHpText").textContent = `${g.monsterHp} / ${g.monsterMax}`;
  document.getElementById("playerHpBar").style.width = (g.playerHp / g.livesMax * 100) + "%";
  document.getElementById("playerHpText").textContent = "❤".repeat(g.playerHp) + "♡".repeat(g.livesMax - g.playerHp);
  const t = document.getElementById("timer");
  t.innerHTML = `${iconHTML("timer")}${g.time}s`;
  t.classList.toggle("danger", g.time <= 10);
  const progress = document.getElementById("progressText");
  if (progress) progress.textContent = `${g.matched} / ${g.monsterMax} 配對`;
  const explore = document.getElementById("exploreText");
  if (explore) {
    explore.textContent = `免責 ${g.exploreLeft}`;
    explore.classList.toggle("spent", g.exploreLeft <= 0);
  }
  const mistakes = document.getElementById("mistakeText");
  if (mistakes) {
    mistakes.textContent = `失誤 ${g.mistakes}`;
    mistakes.classList.toggle("danger", g.mistakes > 0);
  }
  if (g.combo < 2) document.getElementById("comboText").textContent = "";
}

function tick() {
  if (!game) return;
  game.time--;
  updateBattleUI();
  if (game.time <= 0) { game.time = 0; endBattle(false); }
}

function endBattle(win) {
  clearInterval(game.timer);
  const g = game, lv = g.lv;
  const overlay = document.getElementById("overlay");
  const modal = document.getElementById("modal");

  if (win) {
    // 提前擊破（弱點傷害）時翻開剩牌，漏網單字列在結算裡
    document.querySelectorAll("#board .card:not(.matched)").forEach(c => c.classList.add("flipped", "peek"));
    const leftover = lv.words.filter((w, wi) => !g.matchedPairs.has(wi));
    let stars = 1;
    if (g.mistakes === 0) stars = 3;
    else if (g.mistakes <= 2) stars = 2;
    const prev = starsOf(lv.id);
    if (stars > prev) { save.stars[lv.id] = stars; saveGame(save); }
    const best = starsOf(lv.id);
    const next = nextLevelOf(lv);
    beep(660, 0.1, "triangle"); setTimeout(() => beep(880, 0.18, "triangle"), 120);
    modal.className = "modal";
    modal.innerHTML = `
      <div class="m-emoji">${sprite(lv, 84)}</div>
      <h2>擊敗 ${lv.monster}！</h2>
      <div class="m-stars">${starStr(best)}</div>
      <p>最高連擊 x${g.maxCombo} · 弱點擊破 ${g.weakHits} 次 · 扣血失誤 ${g.mistakes} 次</p>
      ${leftover.length ? `<p class="hint">提前擊破！這幾個字順便帶走：${leftover.map(w => `${w.en} ${w.zh}`).join("、")}</p>` : ""}
      ${best < 3 ? `<p class="hint">★★★ 大師：全程零扣血通關（盲猜不算），解鎖弱點情報</p>` : `<p class="hint">已達大師級！弱點情報已在圖鑑解鎖</p>`}
      <button class="btn" id="modalNext">${next ? `下一關 ${iconHTML("arrow-right")}` : `${iconHTML("home")}回到地圖`}</button>
      <button class="btn secondary" id="modalRetry">${iconHTML("retry")}再玩一次</button>
      <button class="btn ghost" id="modalHome">${iconHTML("arrow-left")}回字彙包</button>`;
  } else {
    wrongTone();
    const reason = g.time <= 0 ? "時間到了…" : "血量耗盡…";
    modal.className = "modal";
    modal.innerHTML = `
      <h2>挑戰失敗</h2>
      <p>${reason}怪物逃走了，再接再厲！</p>
      <button class="btn" id="modalRetry">${iconHTML("retry")}再挑戰一次</button>
      <button class="btn ghost" id="modalHome">${iconHTML("arrow-left")}回字彙包</button>`;
  }
  overlay.classList.add("active");

  const nextBtn = document.getElementById("modalNext");
  if (nextBtn) nextBtn.onclick = () => {
    overlay.classList.remove("active");
    const next = nextLevelOf(lv);
    if (next) openIntro(next); else backToPacks();
  };
  document.getElementById("modalRetry").onclick = () => { overlay.classList.remove("active"); startBattle(lv); };
  document.getElementById("modalHome").onclick = () => { overlay.classList.remove("active"); backToPacks(); };
}

function nextLevelOf(lv) {
  const idx = ALL_LEVELS.findIndex(l => l.id === lv.id);
  return ALL_LEVELS[idx + 1] || null;
}

function backToPacks() {
  if (game) { clearInterval(game.timer); game = null; }
  renderPacks();
  show("menuScreen");
}

// =====================================================================
// 圖鑑
// =====================================================================
function openDex() {
  const grid = document.getElementById("dexGrid");
  grid.innerHTML = "";
  ALL_LEVELS.forEach((lv) => {
    const stars = starsOf(lv.id);
    const unlocked = stars > 0;
    const cell = document.createElement("div");
    cell.className = "dex-cell" + (unlocked ? "" : " locked") + (stars === 3 ? " mastered" : "");
    if (!unlocked) cell.setAttribute("aria-disabled", "true");
    cell.innerHTML = `
      <div class="dx-emoji">${unlocked ? sprite(lv, 48) : `<span class="btn-icon lock-mark">${svgIcon("lock")}</span>`}</div>
      <div class="dx-name">${unlocked ? lv.monster : "？？？"}</div>
      <div class="dx-el">${unlocked ? elBadge(lv.el) : ""}</div>
      <div class="dx-stars">${unlocked ? starStr(stars) : ""}</div>`;
    if (unlocked) makePressable(cell, () => openDexDetail(lv), `查看${lv.monster}圖鑑`);
    grid.appendChild(cell);
  });
  show("dexScreen");
}

function openDexDetail(lv) {
  const stars = starsOf(lv.id);
  const wrap = document.getElementById("dexDetail");
  const tier = (need, label, body) => `
    <div class="tier ${stars >= need ? "on" : ""}">
      <div class="tier-h">${"★".repeat(need)} ${label} ${stars >= need ? "" : iconHTML("lock")}</div>
      <div class="tier-b">${stars >= need ? body : "未解鎖"}</div>
    </div>`;
  wrap.innerHTML = `
    <button class="btn ghost" id="dexBack">${iconHTML("arrow-left")}返回圖鑑</button>
    <div class="dd-head ${stars === 3 ? "mastered" : ""}">
      <div class="dd-sprite">${sprite(lv, 96)}</div>
      <h2>${lv.monster}</h2>
      <div class="dd-el">${elBadge(lv.el)}<span class="hint">剋牠選「${ELEMENTS[Object.keys(BEATS).find(k => BEATS[k] === lv.el)]?.name || "？"}」屬性</span></div>
      <div class="m-stars">${starStr(stars)}</div>
    </div>
    ${tier(1, "擊敗", "已收錄外觀、名稱與屬性。")}
    ${tier(2, "熟練", lv.desc)}
    ${tier(3, "大師", "💥 弱點情報：" + lv.weakness + `<div class="weak-info">${lv.weak.map(en => {
      const w = lv.words.find(x => x.en === en);
      return `<span class="weak-chip">${en} ${w ? w.zh : ""}</span>`;
    }).join("")}</div>`)}
    <div class="dd-words-head">
      <span>單字表（${lv.words.length}）</span>
      ${stars >= 3 ? `<button class="btn ghost" id="readAll">${iconHTML("volume")}朗讀全部</button>` : `<span class="hint">★★★ 解鎖一鍵朗讀</span>`}
    </div>
    <div class="dd-words" id="ddWords"></div>`;
  const list = wrap.querySelector("#ddWords");
  lv.words.forEach(w => {
    const row = document.createElement("div");
    row.className = "dd-word";
    row.innerHTML = `<span class="en">${w.en}</span><span class="zh">${w.zh}</span><button class="spk" aria-label="朗讀 ${w.en}">${svgIcon("volume")}</button>`;
    row.querySelector(".spk").onclick = () => speak(w.en);
    list.appendChild(row);
  });
  document.getElementById("dexBack").onclick = openDex;
  const readAll = document.getElementById("readAll");
  if (readAll) readAll.onclick = () => speakSeq(lv.words.map(w => w.en));
  show("dexDetailScreen");
}

// ---------- 啟動 ----------
document.addEventListener("DOMContentLoaded", () => {
  hydrateIcons();
  renderPacks();
  document.getElementById("openDexBtn").onclick = openDex;
  document.getElementById("dexHomeBtn").onclick = backToPacks;
  document.getElementById("levelBackBtn").onclick = backToPacks;
  document.getElementById("battleBackBtn").onclick = () => {
    if (confirm("離開戰鬥？進度不會保存。")) backToPacks();
  };
});

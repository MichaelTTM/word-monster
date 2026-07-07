// =====================================================================
// 單字怪物 — 字彙包 / 關卡資料（英翻中）
// PACKS[].levels[] 每一關 = 一隻怪物。level.id 全域唯一（存檔用）。
//   sprite: 像素圖類型（見 sprites.js）  pal: 調色盤
//   el: 怪物屬性（見 ELEMENTS，擊敗過才在選單顯示）
//   weak: 弱點單字（en），配對到傷害加倍；★★★ 解鎖情報
//   weakness: 弱點情報文案（★★★ 解鎖）
//   words: 牌池，8 對 → 4x4。怪物 HP = 單字數。
// =====================================================================

// 屬性表：五屬性，火剋草、草剋水、水剋火、光暗互剋
const ELEMENTS = {
  grass: { name: "草", icon: "leaf",    color: "#3d9a37", bg: "#e6f6e4" },
  fire:  { name: "火", icon: "flame",   color: "#e2571f", bg: "#ffece0" },
  water: { name: "水", icon: "droplet", color: "#2277cc", bg: "#e3f1ff" },
  light: { name: "光", icon: "sun",     color: "#c08a12", bg: "#fff5da" },
  dark:  { name: "暗", icon: "moon",    color: "#6a55b8", bg: "#efeafc" },
};
// BEATS[攻擊屬性] = 會被這個屬性剋制的屬性
const BEATS = { fire: "grass", grass: "water", water: "fire", light: "dark", dark: "light" };

const PACKS = [
  {
    id: "A",
    name: "冒險入門",
    sub: "生活基礎單字",
    levels: [
      {
        id: 1, monster: "字彙史萊姆", sprite: "slime", el: "grass",
        pal: { B: "#7ed957", D: "#4a9e2f", L: "#b6f09c" },
        desc: "森林入口最常見的軟Q生物，吞下太多單字而變得圓滾滾。",
        weak: ["sun", "cat"],
        weakness: "怕大太陽把牠曬成單字乾，也莫名其妙怕貓——別問，牠不想談。配對 sun、cat 傷害加倍！",
        words: [
          { en: "apple", zh: "蘋果" }, { en: "water", zh: "水" },
          { en: "book", zh: "書" }, { en: "cat", zh: "貓" },
          { en: "dog", zh: "狗" }, { en: "sun", zh: "太陽" },
          { en: "moon", zh: "月亮" }, { en: "tree", zh: "樹" },
        ],
      },
      {
        id: 2, monster: "搗蛋哥布林", sprite: "goblin", el: "fire",
        pal: { B: "#e8743b", D: "#a8481d", L: "#ffa472" },
        desc: "專偷旅人動詞的小惡棍，動作快得讓人記不住。",
        weak: ["sleep", "read"],
        weakness: "搗蛋鬼最怕安靜的事：聽到 sleep 就打哈欠，看到 read 就頭痛。這兩張牌打牠特別痛。",
        words: [
          { en: "run", zh: "跑" }, { en: "eat", zh: "吃" },
          { en: "sleep", zh: "睡" }, { en: "jump", zh: "跳" },
          { en: "read", zh: "讀" }, { en: "write", zh: "寫" },
          { en: "walk", zh: "走" }, { en: "sing", zh: "唱" },
        ],
      },
      {
        id: 3, monster: "骷髏兵", sprite: "skull", el: "dark",
        pal: { B: "#cfd8dc", D: "#8a96a0", L: "#eef3f5" },
        desc: "古戰場甦醒的亡靈，身上塗滿描述世界的形容詞。",
        weak: ["red", "happy"],
        weakness: "灰白骨頭受不了鮮豔和好心情——red 讓牠刺眼，happy 讓牠懷疑骨生。配對這兩字傷害加倍。",
        words: [
          { en: "red", zh: "紅色" }, { en: "blue", zh: "藍色" },
          { en: "big", zh: "大的" }, { en: "small", zh: "小的" },
          { en: "hot", zh: "熱的" }, { en: "cold", zh: "冷的" },
          { en: "happy", zh: "快樂的" }, { en: "sad", zh: "悲傷的" },
        ],
      },
      {
        id: 4, monster: "貪吃蝙蝠妖", sprite: "bat", el: "dark",
        pal: { B: "#9575cd", D: "#5e4a91", L: "#c3aef0" },
        desc: "夜裡盤旋的妖物，最愛偷走廚房裡所有食物的名字。",
        weak: ["cake", "milk"],
        weakness: "甜點是牠的罩門：看到 cake 會失去理智俯衝，milk 喝了就想睡。這兩張牌就是牠的軟肋。",
        words: [
          { en: "rice", zh: "米飯" }, { en: "bread", zh: "麵包" },
          { en: "milk", zh: "牛奶" }, { en: "egg", zh: "蛋" },
          { en: "fish", zh: "魚" }, { en: "meat", zh: "肉" },
          { en: "cake", zh: "蛋糕" }, { en: "tea", zh: "茶" },
        ],
      },
      {
        id: 5, monster: "文法巨龍", sprite: "dragon", el: "fire",
        pal: { B: "#ef5350", D: "#a82a28", L: "#ff8a87" },
        desc: "盤踞語言之巔的王者，只有駕馭長單字的勇者才能擊敗牠。",
        weak: ["beautiful", "comfortable"],
        weakness: "兇歸兇，巨龍其實吃軟不吃硬——beautiful 會讓牠臉紅，comfortable 會讓牠鬆懈。趁機重擊！",
        words: [
          { en: "beautiful", zh: "美麗的" }, { en: "important", zh: "重要的" },
          { en: "difficult", zh: "困難的" }, { en: "dangerous", zh: "危險的" },
          { en: "delicious", zh: "美味的" }, { en: "wonderful", zh: "美妙的" },
          { en: "terrible", zh: "可怕的" }, { en: "comfortable", zh: "舒適的" },
        ],
      },
    ],
  },
  {
    id: "B",
    name: "校園日常",
    sub: "國中常用單字",
    levels: [
      {
        id: 6, monster: "書呆史萊姆", sprite: "slime", el: "water",
        pal: { B: "#5b9bd5", D: "#2f5f95", L: "#9ec8f0" },
        desc: "泡在圖書館太久而染成藍色的史萊姆，背上長滿了文具。",
        weak: ["exam", "teacher"],
        weakness: "書呆也有天敵：exam 一出現就緊張到冒泡，被 teacher 點名直接嚇扁。配對這兩字傷害加倍。",
        words: [
          { en: "pen", zh: "筆" }, { en: "desk", zh: "書桌" },
          { en: "teacher", zh: "老師" }, { en: "student", zh: "學生" },
          { en: "class", zh: "課堂" }, { en: "exam", zh: "考試" },
          { en: "paper", zh: "紙" }, { en: "bag", zh: "書包" },
        ],
      },
      {
        id: 7, monster: "操場哥布林", sprite: "goblin", el: "grass",
        pal: { B: "#7ed957", D: "#4a9e2f", L: "#b6f09c" },
        desc: "下課鐘一響就霸佔操場的搗蛋鬼，體力多到用不完。",
        weak: ["swim", "dance"],
        weakness: "體力怪也有死穴——牠是旱鴨子，swim 直接投降；dance 會同手同腳。這兩字打牠加倍痛。",
        words: [
          { en: "play", zh: "玩" }, { en: "kick", zh: "踢" },
          { en: "throw", zh: "丟" }, { en: "catch", zh: "接" },
          { en: "swim", zh: "游泳" }, { en: "dance", zh: "跳舞" },
          { en: "climb", zh: "爬" }, { en: "ride", zh: "騎" },
        ],
      },
      {
        id: 8, monster: "鐘樓骷髏", sprite: "skull", el: "dark",
        pal: { B: "#7aa7d9", D: "#3f6aa0", L: "#bcd6f5" },
        desc: "住在校園鐘樓裡的守時亡靈，最痛恨遲到的人。",
        weak: ["minute", "today"],
        weakness: "守時亡靈最怕被將軍：minute 提醒牠分秒必爭，today 逼牠今日事今日畢。配對傷害加倍。",
        words: [
          { en: "day", zh: "天" }, { en: "week", zh: "週" },
          { en: "month", zh: "月" }, { en: "year", zh: "年" },
          { en: "hour", zh: "小時" }, { en: "minute", zh: "分鐘" },
          { en: "today", zh: "今天" }, { en: "tomorrow", zh: "明天" },
        ],
      },
      {
        id: 9, monster: "圖書館幽靈", sprite: "ghost", el: "light",
        pal: { B: "#dfe6f0", D: "#9aa6bd", L: "#ffffff" },
        desc: "在書架間飄盪的考前幽靈，會把學生的情緒化成考題。",
        weak: ["free", "ready"],
        weakness: "牠靠考前焦慮維生——free 的悠哉和 ready 的從容會讓牠當場斷糧。配對這兩字傷害加倍。",
        words: [
          { en: "tired", zh: "累的" }, { en: "hungry", zh: "餓的" },
          { en: "thirsty", zh: "渴的" }, { en: "busy", zh: "忙的" },
          { en: "free", zh: "有空的" }, { en: "ready", zh: "準備好的" },
          { en: "sick", zh: "生病的" }, { en: "bored", zh: "無聊的" },
        ],
      },
    ],
  },
  {
    id: "C",
    name: "職場商務",
    sub: "TOEIC 入門單字",
    levels: [
      {
        id: 10, monster: "會議室史萊姆", sprite: "slime", el: "water",
        pal: { B: "#4dd0c4", D: "#268a80", L: "#9af0e8" },
        desc: "在無止盡的會議裡誕生的史萊姆，吸滿了辦公室術語。",
        weak: ["salary", "meeting"],
        weakness: "談到 salary 牠會害羞融化，聽到 meeting 準時結束更是當場蒸發。這兩張是牠的命門。",
        words: [
          { en: "office", zh: "辦公室" }, { en: "meeting", zh: "會議" },
          { en: "email", zh: "電子郵件" }, { en: "report", zh: "報告" },
          { en: "manager", zh: "經理" }, { en: "company", zh: "公司" },
          { en: "salary", zh: "薪水" }, { en: "project", zh: "專案" },
        ],
      },
      {
        id: 11, monster: "簡報哥布林", sprite: "goblin", el: "dark",
        pal: { B: "#5c6bc0", D: "#33408a", L: "#9aa6e8" },
        desc: "簡報前夕專門製造混亂的哥布林，最愛打斷別人發言。",
        weak: ["present", "schedule"],
        weakness: "最怕有備而來的人：present 排練過、schedule 排得滿滿，牠就無亂可搗。配對這兩字加倍。",
        words: [
          { en: "hire", zh: "雇用" }, { en: "manage", zh: "管理" },
          { en: "present", zh: "報告" }, { en: "discuss", zh: "討論" },
          { en: "schedule", zh: "安排" }, { en: "deliver", zh: "遞送" },
          { en: "order", zh: "訂購" }, { en: "sign", zh: "簽署" },
        ],
      },
      {
        id: 12, monster: "財務骷髏", sprite: "skull", el: "light",
        pal: { B: "#e0b84d", D: "#a8842a", L: "#f5dd92" },
        desc: "守著金庫的會計亡靈，每一根骨頭都刻著數字。",
        weak: ["discount", "profit"],
        weakness: "一聽到 discount 骨頭就打折，profit 被算得清清楚楚牠就崩潰。精算這兩字，傷害加倍。",
        words: [
          { en: "money", zh: "錢" }, { en: "price", zh: "價格" },
          { en: "cost", zh: "成本" }, { en: "profit", zh: "利潤" },
          { en: "budget", zh: "預算" }, { en: "invoice", zh: "發票" },
          { en: "payment", zh: "付款" }, { en: "discount", zh: "折扣" },
        ],
      },
      {
        id: 13, monster: "商務巨龍", sprite: "dragon", el: "dark",
        pal: { B: "#546e7a", D: "#2f4048", L: "#90a4ae" },
        desc: "盤踞企業頂端的鋼鐵之龍，只服從最專業的勇者。",
        weak: ["professional", "reliable"],
        weakness: "鋼鐵巨龍只敬畏兩種人：professional 和 reliable。亮出這兩個字，牠的鱗片會自己鬆開。",
        words: [
          { en: "professional", zh: "專業的" }, { en: "available", zh: "可用的" },
          { en: "responsible", zh: "負責的" }, { en: "successful", zh: "成功的" },
          { en: "efficient", zh: "有效率的" }, { en: "reliable", zh: "可靠的" },
          { en: "flexible", zh: "有彈性的" }, { en: "urgent", zh: "緊急的" },
        ],
      },
    ],
  },
];

// 攤平所有關卡，方便存檔 / 解鎖 / 下一關導覽
const ALL_LEVELS = [];
PACKS.forEach((pack, pi) => pack.levels.forEach((lv, li) => {
  ALL_LEVELS.push({ ...lv, packIdx: pi, levelIdx: li });
}));
function levelById(id) { return ALL_LEVELS.find(l => l.id === id); }

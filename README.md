# 單字怪物 · Word Monster

翻牌配對背單字的 RPG 小遊戲——把記憶配對（Memory Match）和怪物圖鑑收集結合，邊玩邊背英文單字。

## ▶️ 立即遊玩

### **[👉 點我啟動遊戲](https://michaelttm.github.io/word-monster/)**

網址：<https://michaelttm.github.io/word-monster/>
（手機 Safari／Chrome 開啟後可「加入主畫面」，離線也能玩）

## 玩法

- **翻牌配對**：翻開英文牌與中文牌，配對成功就對怪物造成傷害，集滿即擊敗。
- **屬性相剋**：草／火／水／光／暗五屬性，火剋草、草剋水、水剋火、光暗互剋。戰前挑選攻擊屬性，剋制怪物可強化弱點傷害。
- **弱點單字**：每隻怪物有專屬弱點單字，配對到傷害加倍，能提前擊破。
- **星等挑戰**：★ 擊敗、★★ 熟練（解鎖背景故事）、★★★ 大師（全程零扣血，解鎖弱點情報）。
- **怪物圖鑑**：收服的怪物與單字表都收錄在圖鑑，支援英文朗讀（TTS）。

## 字彙包

| 字彙包 | 主題 | 關數 |
|---|---|---|
| 冒險入門 | 生活基礎單字 | 5 |
| 校園日常 | 國中常用單字 | 4 |
| 職場商務 | TOEIC 入門單字 | 4 |

## 技術

- 純 Vanilla HTML / CSS / JS，無框架、無 build 步驟。
- PWA：可加入主畫面、離線可玩（Service Worker）。
- [Capacitor](https://capacitorjs.com/) 打包 Android App（APK / AAB）。
- 網頁版由 GitHub Actions 自動部署到 GitHub Pages。

## 本地預覽

```bash
python3 -m http.server 4173 --directory www
# 開啟 http://localhost:4173/
```

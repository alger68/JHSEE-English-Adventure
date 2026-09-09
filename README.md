# JHSEE English Adventure — V2

國三會考英文每日 10 分鐘闖關。純 HTML / CSS / JavaScript，不需安裝套件或設定資料庫。介面使用繁體中文，手機與電腦皆可閱讀、作答。

## 第一週已完成

| 關卡 | 主題 | 文章 |
| --- | --- | --- |
| Day 1 | 校園故事 | The Missing Wallet（保留 V1 原文） |
| Day 2 | 日常生活 | A Lunch Worth Sharing |
| Day 3 | 對話／訊息 | The Message Before Practice |
| Day 4 | 科普閱讀 | The Mystery of the Wet Cup |
| Day 5 | 公告／資訊閱讀 | One Ticket, Two Choices |
| Day 6 | 每週 Boss | The Fair That Almost Failed |
| Day 7 | 單字與錯題復活 | The Second-Try Club |

7 篇 120–180 字原創練習短文、35 個單字、14 個片語、45 道四選一題目。一般關卡提供 3 題閱讀＋1 題字義偵探；Boss 提供 6 題閱讀＋1 題字義偵探。A+、A++ 各再加一題，全部附繁中解析與原文證據。這些是原創練習題，不是官方歷屆試題。

## 可以怎麼玩

1. 從「冒險地圖」進入今天開放的關卡，先讀文章再作答。
2. 完整回答全部題目才能交卷；交卷後才顯示正解、解釋和支持句。
3. 答錯的題目進入「錯題復活賽」，答對後移出；可展開原文找線索。
4. 「單字補給站」先回想再翻卡，自評記得的詞依 1、3、7 天間隔回來；不熟的詞當天繼續保留。
5. 「學習紀錄」查看首答正確率、各題型、最佳成績、七天學習足跡及單字進度。
6. 原有英文朗讀保留，新增停止與速度設定。語音是否可用及離線聲音，取決於裝置和瀏覽器。

## 規則與資料保存

- 第一次使用立即開放 Day 1。Day N 於首次使用日期加 N−1 天的 **台灣時間 20:00** 解鎖；開放後不會因錯過而鎖回。解鎖依裝置時鐘，並非防作弊機制。
- 網站的 Day 1–7 是個人開始日的學習旅程，主題順序依週循環編排，**不強制 Day 1 必須是星期一**。既有 ChatGPT 每日任務仍按實際星期循環：週一校園、週二生活、週三訊息、週四科普、週五公告、週六 Boss、週日複習。
- 首次完成每關獲得 `20 + 答對題數 × 10 EXP`。重做與切換難度不重複領 EXP；每 100 EXP 升 1 級。
- Streak 以台灣日期去重，交卷／單字複習／錯題練習皆可打卡；同日多練不重複累加。昨天有學習時，今天尚未學習仍保留連續紀錄，漏過完整一天後歸零。
- A／A+／A++ 是本站**練習難度**，不是正式會考分數預測。完成至少 3 關、首次總正確率 ≥80% 建議 A+；完成至少 5 關、≥90% 建議 A++。可自行選擇，不強制升級。
- V2 使用 `jhseeStateV2`。若同一網址與瀏覽器有 V1 `jhseeState`，保留其 EXP 與已完成關卡，且不刪除原資料。V1 沒有日期、逐題答案或首答分數，不能還原其舊 Streak 與錯題。
- 進度僅在這個裝置、瀏覽器與網址保存，沒有帳號同步。可在學習紀錄匯出／匯入 JSON 備份。Sites 與 GitHub Pages 屬不同網址，進度必須用備份轉移。
- 重新作答不覆寫首次表現。最佳分數取歷次最高百分比，難度不同時題數也不同。
- 答案包含於靜態程式中，介面會等交卷才顯示；本系統用於自主學習，不作為需保密答案的正式測驗。

## 執行與維護

可直接以瀏覽器開啟 `index.html`，或使用任何靜態網站主機。核心功能不需要網路或 API 金鑰；本機 `file://` 的保存能力依瀏覽器而異。

```sh
node --test tests/core.test.cjs
node scripts/build.mjs
```

需要 Node.js 22 以上。內容的唯一編輯來源是 `content/week-*.json`；`data.js` 由 build 產生，請勿手動編輯。build 驗證關卡連號、字數、單字、選項、答案與題目 ID，產生根目錄 `data.js`，並將五個網站檔案複製至 `dist/`。`dist/` 為可發布、已追蹤的靜態資產。

| 檔案 | 用途 |
| --- | --- |
| `index.html` / `style.css` | 響應式介面與導覽 |
| `app.js` | 閱讀、答題、朗讀、複習、Dashboard、備份 |
| `core.js` | 計分、解鎖、日期、Streak、複習間隔與驗證 |
| `content/week-01.json` | 第一週完整文章、單字、題目與解析 |
| `scripts/build.mjs` | 內容驗證與靜態檔案輸出 |
| `tests/core.test.cjs` | 日期邊界、重複領獎、轉移與備份等回歸驗證 |
| `.github/workflows/pages.yml` | 推送時驗證、建置；Pages 啟用後自動部署 |

## GitHub Pages

儲存庫原先尚未啟用 Pages。已準備好自動部署流程，但 GitHub 連接器目前沒有修改儲存庫 Pages 設定的操作。

1. 到 [Settings → Pages](https://github.com/alger68/JHSEE-English-Adventure/settings/pages)。
2. 在 Build and deployment 的 Source 選擇 **GitHub Actions**。
3. 到 Actions → **Validate and publish English Adventure** → Run workflow 執行一次。
4. 成功後，以 Actions 部署結果中的網址為準。往後推送 `main` 會自動更新。

未啟用 Pages 時，流程仍建置與測試，但跳過發布，避免把尚未建立的網址當成已上線網站。

## 每日推送與 250 天擴充

既有「會考英文每日闖關」ChatGPT 任務設定為每天台灣時間 20:00。**這個任務的新文章尚未自動寫入本儲存庫。** 本版本提供已完整編寫的第一週；不以重複或空白內容冒充 250 天。

新增內容時建立 `content/week-02.json`（`lessons` 陣列、Day 8 起，格式同第一週），再執行 build、提交並推送。UI 會讀取全部已建置的課程，並以相同規則解鎖。將來可加上排程產稿、內容驗證與審閱、GitHub 更新及部署的完整同步流程；前端不可放置 API 金鑰。若總課程數增加，章節分組與長期統計介面仍需後續擴充。

## 本版驗證範圍

已執行核心規則測試、JavaScript 語法檢查與本地資產參照檢查。本輪未執行真實 Safari／Chrome 的畫面與語音操作測試；語音支援仍依裝置而定。

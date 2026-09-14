# 第一批完整預備題庫：Day 13–35

建立日期：2026-09-14（台灣）。範圍：23 篇 AI 原創文章、147 道四選一題，並非全部 250 天已完成。此批與原有 Day 1–12 共構成 35 篇、225 題每日教材；預備內容尚未等同網站已發布內容。

每篇 124–148 英文字（以空白分詞），5 個核心單字含例句、2 個片語。一般日 6 題：基礎 4 題（含 1 題字義猜測）、進階 1 題、挑戰 1 題；Boss 9 題：基礎 7 題（含 1 題字義猜測）、進階與挑戰各 1 題。基礎、進階、挑戰共用文章，不表示已校準正式會考等級。

每題包含一個正解、繁體中文說明、連續原文證據與四個選項的解析。答案索引為 A=0、B=1、C=2、D=3；本批分布 37／37／37／36。115 個單字項目和 46 個片語項目包含有意安排的複習，不是 115／46 個互異新詞。

## 預定發布清單

日期沿用目前實際日更循環；學生自己的解鎖日期仍依首次學習日起算。

| Day | 預定日期 | 主題 | 文章 | 題數 |
| --- | --- | --- | --- | ---: |
| 13 | 2026-09-14 | 校園故事 | The Extra Point | 6 |
| 14 | 2026-09-15 | 日常生活 | Two Loaves at the Door | 6 |
| 15 | 2026-09-16 | 對話／訊息 | The Photo We Can Share | 6 |
| 16 | 2026-09-17 | 科普閱讀 | A Fair Test Needs a Record | 6 |
| 17 | 2026-09-18 | 公告／資訊閱讀 | Borrow It, Bring It Back | 6 |
| 18 | 2026-09-19 | 每週 Boss | Boss: The Class Fund Puzzle | 9 |
| 19 | 2026-09-20 | 單字與錯題復活 | The Clue Card Exchange | 6 |
| 20 | 2026-09-21 | 校園故事 | The Ten-Minute Gap | 6 |
| 21 | 2026-09-22 | 日常生活 | Dinner Before the Deadline | 6 |
| 22 | 2026-09-23 | 對話／訊息 | Which Meeting Is the Final One? | 6 |
| 23 | 2026-09-24 | 科普閱讀 | The Bell and the Puzzle | 6 |
| 24 | 2026-09-25 | 公告／資訊閱讀 | Thirty Minutes in the Maker Room | 6 |
| 25 | 2026-09-26 | 每週 Boss | Boss: The Library Window | 9 |
| 26 | 2026-09-27 | 單字與錯題復活 | Five Words, One Better Plan | 6 |
| 27 | 2026-09-28 | 校園故事 | One Bowl, Twelve Cups | 6 |
| 28 | 2026-09-29 | 日常生活 | The Bigger Bag Is Not the Better Deal | 6 |
| 29 | 2026-09-30 | 對話／訊息 | Lunch for Three Different Plans | 6 |
| 30 | 2026-10-01 | 科普閱讀 | Same Juice, Different Labels | 6 |
| 31 | 2026-10-02 | 公告／資訊閱讀 | Order Today, Eat Tomorrow | 6 |
| 32 | 2026-10-03 | 每週 Boss | Boss: The Free-Delivery Question | 9 |
| 33 | 2026-10-04 | 單字與錯題復活 | The Recipe Card Repair | 6 |
| 34 | 2026-10-05 | 校園故事 | A Sign at the Wrong Gate | 6 |
| 35 | 2026-10-06 | 日常生活 | The Ticket for Two Rides | 6 |

## 用法

1. 想先練習：使用離線教材包的 `START_HERE.html`；單字和答案預設收合，先讀文、作答，再展開解析。離線教材不計分、不存進度，不會寫入網站成績。
2. 想列印：使用 `student.md`（純文章與題目），教師核對用 `answers.md`，單字片語用 `vocabulary.md`。也可直接列印 HTML，目前展開的答案會隨頁列印。
3. 想匯入程式：`question-bank.json` 含完整批次；`content/prebuilt/day-NNN.json` 含逐日版本，題目 ID 和選項順序保持固定。
4. 網站日更：讀取 `AUTOMATION.md`，按當日日期取出下一篇。預備檔不能直接當成已發布檔，也不要搬入 `week-*.json` 來繞過逐日發布。

## 維護與防護

```sh
node scripts/prebuilt.mjs --check
node --test tests/core.test.cjs tests/content.test.mjs tests/exams.test.cjs
node scripts/build.mjs
node scripts/prebuilt.mjs --release
node scripts/export-prebuilt.mjs /absolute/path/to/output-directory
```

`--release` 只輸出當日待新增的路徑與 JSON，不會寫入、推送或發布。發布需沿用日更任務，且要核對 build 和 deploy 均成功。日期漏跑、順序不合或同一 Day 已有不同正式內容時，必須停止並調整安排，不偽造過去發布日期、不改寫舊課程。

編寫來源是 `scripts/bank-source/day-013-035.mjs`。這份來源把正解放在第一個選項以方便審稿；`node scripts/prebuilt.mjs --generate` 會把答案與對應解析一起打散，輸出固定的預備 JSON。**學生用卷不得直接從未打散的編寫來源製作。** 已發布課程不得藉修改來源來覆蓋；工具會拒絕不一致的發布歷史。

既有 Actions 測試命令透過 `tests/content.test.mjs` 一併執行預備題庫測試。原有內容載入器不讀取 `content/prebuilt/`，因此單純提交這批不會將 Day 13–35 放入正式地圖。沒有新增排程、外部帳號、API 金鑰、學生資料上傳或成績儲存欄位。

## 檢核與限制

- 已檢查 23 篇字數、連號、星期題型、五種閱讀技能、選項唯一性、分層題數、答案索引、147 段連續原文證據及 588 則選項解析。
- 另外以獨立算式檢查帳目、倒推時間、圖書館空檔、單價、午餐時間、免運與車票題。
- 程式檢查不能證明語意品質或測得真實難度；本批經助理覆核，但**尚未由教師獨立審題、試教或校準**。科普類以虛構課堂實驗練習資料判讀，不把小型示例當成普遍科學結論。
- 離線教材已檢查 23 篇／147 題完整匯出、答案預設收合及按鈕程式邏輯。此環境沒有可執行的瀏覽器，未完成真正的手機／桌面瀏覽器畫面檢查；可使用純文字學生卷與詳解作為備用。
- 這批沒有新增正式歷屆題文本、英聽音檔或英聽題；官方歷屆來源與既有模式保持獨立。250 天其餘 Day 36–250、專項及聽力等仍是待完成範圍。

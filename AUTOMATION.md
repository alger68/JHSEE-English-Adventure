# 每日英文內容同步規格

這份文件描述已授權的日更工作：在 `alger68/JHSEE-English-Adventure` 的 `main` 分支新增原創學習內容，經現有 GitHub Actions 驗證後發布到 GitHub Pages。只新增日更資料檔，不修改程式、工作流程、測試或既有已發布文章。

## 入口與時區

- 正式日更網站：https://alger68.github.io/JHSEE-English-Adventure/
- 種子內容：`content/week-01.json`（Day 1–7）
- 日更目錄：`content/daily/`
- 預備題庫：`content/prebuilt/day-NNN.json`。這些是已寫好的候用教材，`plannedPublishDate` 只表示預定日期，**不是已發布日期**。仍須經下列日更流程逐日新增到日更目錄。
- 檔名：`content/daily/YYYY-MM-DD.json`，日期必須使用本次執行當下的 **Asia/Taipei** 日期。
- 原有 ChatGPT 排程保持每天台灣時間 20:00；排程時間是開始處理時間，發布還需等內容產生與驗證。
- 前端 `data.js` 與 `dist/` 為產物。日更任務只寫上述日期檔，Actions 建置時會重新產生最新網站內容；不需要日更任務改寫大型 `data.js`。

## 每次執行順序

1. 透過已連接的 GitHub 讀取本文件、`content/week-01.json`，並列出 `content/daily/`。只把 `.json` 檔案視為日更資料，忽略 `.gitkeep`。
2. 取得台灣當日日期，檢查當日檔案是否已存在。若存在，讀取並使用它；不再建立另一個 Day，不改寫已成功發布的內容。相同日期的重複執行只能對應同一個檔案。
3. 檢查最近的 Actions 結果。若之前有尚未成功發布的日更檔造成驗證失敗，優先依錯誤修復該日更檔，最多修復一次。禁止藉由修改／刪除驗證程式、測試、工作流程或舊課程來使檢查通過。不能安全修復時，停止新增並通知使用者。
4. 當日檔案不存在時，讀取所有種子週檔的 Day 編號，以及最近日更檔；確認最後 Day 與前後順序，再以最大 Day + 1 新增。日期目錄最多只有 243 份日更 JSON，可列出全部檔名，再讀最近 7 份文章避免重複。不得重設為 Day 1，不得因漏跑而用今天的內容偽造過去日期。達到 Day 250 後不再新增，通知使用者課程已滿 250 天。
5. **先檢查下一個 Day 的預備題庫，再決定是否生成。** 例如下一天為 Day 13，讀取 `content/prebuilt/day-013.json`；不得只因本機沒下載就視為不存在。若此檔存在，確認其 Day 恰為下一天、`plannedPublishDate` 等於台灣當日日期、主題符合實際星期；取出完整 `lessons`，包成 `{ "version": 2, "publishDate": "台灣當日日期", "lessons": [...] }`。保留所有題目、ID、選項順序、答案、解析、原文證據和 `reasons`；不改寫預備檔，也不重新生成同一課。若日期／順序不合、來源校驗失敗或無法讀取，停止並報告需要調整排程，不回填過去日期、不跳號、不換用另一篇規避失敗。只有確認下一個 Day **沒有**預備檔時，才按當日實際星期編寫原創 120–180 字短文及完整題目。沿用國三可讀、約 10 分鐘、先作答再揭曉答案的原則。週日可複習近期教材，但不能聲稱讀到學生瀏覽器裡的個人錯題或分數。
6. 檢查 JSON、字數、日期、Day／題目 ID、選項唯一性及每题唯一最佳答案。每個 `evidence` 必須是本篇故事內的一段連續原文，不能用省略號拼接不同句子。確認解析真的支持所選答案。程式檢查只能攔截結構錯誤，語意與答案仍須逐題自行覆核。
7. 用 GitHub 的 `create_file` 在 `main` 新增 **一個**當日 JSON 檔。提交訊息：`Add daily English lesson YYYY-MM-DD (Day N)`。不要開新分支或建立第二套排程。寫入超時或衝突時先重讀同一路徑確認結果，不盲目新增其他檔名。若必須修復尚未發布的當日檔，用讀到的最新 blob SHA 執行 `update_file`。
8. 保存回傳的 commit SHA，找到此 SHA 對應的 `Validate and publish English Adventure` Actions run。確認 `build` 與 `deploy` **兩個 job 都是 success**，不能把只有 build 成功、deploy skipped 當成發布成功。一般等待 2–3 分鐘足夠，狀態未完成時如實說明，禁止宣稱已上線。
9. `deploy` 成功後回傳正式網站與 `#lesson/N` 連結、文章標題、日期、Day。通知內容保持原有學習任务：短文、5 個核心詞、1–2 個片語、3 題閱讀選擇題及 1 個字義偵探任務；不在通知提前公布答案、解析或全文中文翻譯。Boss 可告知網站有完整挑戰。
10. GitHub 連線、寫入、驗證或部署失敗時，在本次 ChatGPT 任務通知明確說明失敗階段與 Actions 連結；可附上可閱讀的當日任務，但不得把它稱為已同步網站。不要額外發送郵件或訊息給其他人。

## 星期主題（`type` 必須完全一致）

| 星期 | type | 一般閱讀題數 |
| --- | --- | --- |
| 一 | 校園故事 | 3 |
| 二 | 日常生活 | 3 |
| 三 | 對話／訊息 | 3 |
| 四 | 科普閱讀 | 3 |
| 五 | 公告／資訊閱讀 | 3 |
| 六 | 每週 Boss | 6 |
| 日 | 單字與錯題復活 | 3 |

一般日共有 6 題：3 題閱讀 + 1 題字義偵探（以上 tier 1）、1 題 A+（tier 2）、1 題 A++（tier 3）。Boss 共有 9 題：6 題閱讀 + 1 題字義偵探（tier 1），再加 tier 2、tier 3 各一題。文章難度可隨累積天數逐漸提高，但維持國三可讀；A 系列只是本站練習難度，不宣稱能預測正式會考級分。

## JSON 格式

```json
{
  "version": 2,
  "publishDate": "YYYY-MM-DD",
  "lessons": [{
    "day": 8,
    "title": "A New Original Title",
    "type": "對話／訊息",
    "goal": "繁體中文的一句閱讀目標",
    "minutes": 10,
    "story": "120–180 words, in English. Use actual JSON newline escapes when paragraphs are needed.",
    "words": [{"word": "word", "meaning": "繁體中文意思", "example": "A natural English sentence."}],
    "phrases": [{"phrase": "a phrase", "meaning": "繁體中文意思"}],
    "questions": [{
      "id": "d8-q1",
      "skill": "細節理解",
      "prompt": "An English question?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": 1,
      "explanation": "繁體中文解釋正確答案及相關線索。",
      "evidence": "An exact continuous quote from this lesson's story.",
      "tier": 1
    }]
  }]
}
```

上例只示範欄位，**不是可直接提交的完整課程**。實際 `words` 必須剛好 5 個、`phrases` 1–2 個、`questions` 6 或 9 題；請参考 `tests/fixtures/day-008.json` 的完整實例。`answer` 使用從 0 起算的索引：A=0、B=1、C=2、D=3。題目 ID 必須為當日的 `dN-q1`、`dN-q2`……，不得重複。

`skill` 僅可使用：`細節理解`、`推論判讀`、`字義推測`、`主旨統整`、`資訊整合`。tier 1 必須恰好有一題 `字義推測`。

## 驗證與網站更新

- `node --test tests/core.test.cjs tests/content.test.mjs tests/exams.test.cjs`
- `node scripts/prebuilt.mjs --check`（檢查預備批次；不發布）
- `node scripts/build.mjs`

若有本機執行環境，`node scripts/prebuilt.mjs --release` 可依執行當下的台灣日期輸出下一篇待建立檔的路徑與 JSON；此命令只輸出，**不寫檔、不提交、不發布**。實際新增仍依第 7 步與部署查核辦理。預備題庫不會被網站建置直接收錄，詳見 [PREBUILT_BANK.md](PREBUILT_BANK.md)。GitHub Actions 本身只在推送或手動執行時啟動，不是另一個每日排程；本次不建立新排程。

驗證會攔截：Day 重複／缺號、同名或相同文章、日期與檔名不一致、星期主題不符、字數超限、缺少字詞、選項重複、答案索引錯誤、難度題數不足、偵探題缺漏、原文找不到的證據。

建置產生 `dist/catalog.json`，包含內容版號、篇數、最後補給日期。網站重新取得焦點或每五分鐘檢查新內容；發現新版只顯示「更新冒險地圖」按鈕，不會中斷正在作答的人。使用者點按後刷新課程，進度與尚未交卷的選項仍存於原瀏覽器。

GitHub Pages 是此流程的日更發布入口。既有私人 Sites 版本不由這套 GitHub Actions 自動部署；使用者應收藏正式日更網址。文章新增不改變原有按學習起始日逐日解鎖的規則，因此新文章可能已收錄但仍未輪到學生的學習日期。

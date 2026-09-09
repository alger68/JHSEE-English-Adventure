# 官方歷屆英語閱讀

本分頁收錄 111–115 年（2022–2026）國中教育會考正式英語閱讀試卷入口。每份 43 題，參考時間 60 分鐘。不是補考、大陸考場或參考試題本。

題本保留在官方提供的 Google Drive，網站以嵌入預覽與另開連結呈現，不重製題目文章、插圖、題本 PDF 或出版社解析。本站只保存作答所需的題號、官方答案字母、來源網址與特殊給分規則。

## 官方來源與核對

2026-09-09 從 [國中教育會考歷屆試題](https://cap.rcpet.edu.tw/examination.html) 的年份選單逐年取得「英語（閱讀）」與「參考答案」連結，並讀取官方連結之原始 PDF 核對題數、試卷身分及答案。

| 年份 | 官方英語閱讀 PDF | 官方答案 PDF |
| --- | --- | --- |
| 115 | [題本](https://drive.google.com/file/d/1pzRZpkZEBg4x7GNTAIrdfGJCxNSKgok-/view?usp=drive_link) | [答案](https://drive.google.com/file/d/1fxfOLQPMdCEMSuziD1qsQZg3vVOGt8df/view?usp=drive_link) |
| 114 | [題本](https://drive.google.com/file/d/1Or0bC16Jn2hA0uAF2zrryHoY46ywIQjK/view?usp=drive_link) | [答案](https://drive.google.com/file/d/175hz0lHG4GTDNxYet9lrRDu0lmC_G08o/view?usp=drive_link) |
| 113 | [題本](https://drive.google.com/file/d/1ZU8SG-4jdV1DGvPzpgzoi_hhRiD4NT3S/view?usp=drive_link) | [答案](https://drive.google.com/file/d/1cWlogP9FBRX1eD5kjgVDP2_6f8VCLSB4/view?usp=drive_link) |
| 112 | [題本](https://drive.google.com/file/d/1SXbjT6B_F8eQh2GZEvB6KmgR0k2lDK8A/view?usp=drive_link) | [答案](https://drive.google.com/file/d/1OT5r0que_0bXSy0kwLEOEJMssce2OnL0/view?usp=drive_link) |
| 111 | [題本](https://drive.google.com/file/d/1IyJBtIjySeyVAisE1YiCclYsSldQpHBf/view?usp=drive_link) | [答案](https://drive.google.com/file/d/1IeMHI4BmTpC_2Oc1lQ1Qj6XWHDf9qwGd/view?usp=drive_link) |

原始答案表的欄位為國文、英語閱讀、英語聽力、數學、社會、自然。國文只到第 42 題，所以文字抽取後第 43 題首個答案即為英語閱讀，不能繼續取第二欄。已特別檢查各年首、末題答案。

112 年官網年份頁明文公告：英語閱讀第 1 題原答案為 B，但因與既有參考試题相同而一律給分。`creditAll: [1]` 讓未答或選其他選項亦得該題分數，並在選卷與結果畫面說明。114、115 年疑義釋復公告均維持原選擇題答案。

## 兩種模式

- `#exams`：選年份、開始／繼續測驗，或只看題本；另列已交卷紀錄。
- `#exam/115/browse`：自由瀏覽，答案放在預設收合區，不啟動計時、不新增成績。
- `#exam/115/test`：官方題本＋本站答案卡，先作答再揭曉；空白可確認交卷。參考時間到達只提醒，不自動交卷。重新整理、離開頁面都繼續計時。
- 結果頁：官方得分題數、百分比、用時及逐題對錯；不推估會考整體等級。

這一版的線上計分範圍是英語閱讀。正式英聽音檔與英聽測驗尚未整合。其他科目及更早年份可從官方入口取得。

## 保存與更新

- LocalStorage：`jhseeOfficialExamsV1`，與原有 `jhseeStateV2` 完全分開。
- 每份试卷各自保留未交卷答案；最多保存最近 200 次交卷紀錄。
- 本分頁提供獨立的「匯出／匯入歷屆紀錄」。原有每日冒險備份不包含此資料。
- 不新增登入、個人身分、後端上傳、EXP 或 Streak。共用瀏覽器仍共用紀錄。
- 題本需要網路及官方 Drive 可用。嵌入預覽不相容時，可另開官方題本後回本站填答案。
- `content/official-exams.json` 是答案與來源的維護入口，新增年份須人工取得並核對官方來源；每日 AI 文章排程不修改歷屆真題。
- 靜態網站只能在畫面上延後揭曉答案；不是防作弊的正式考試系統。

驗證：`node --test tests/core.test.cjs tests/content.test.mjs tests/exams.test.cjs`，以及 `node scripts/build.mjs`。包含一律給分、未作答、重複交卷、過期草稿、備份重算及瀏覽不計分／測驗延後揭曉的檢查。未執行實機瀏覽器或 PDF 嵌入呈現測試。

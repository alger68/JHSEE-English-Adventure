// Pure renderers used by the build and export tests. No learner records are read.
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const levels = ['', '基礎', '進階', '挑戰'];
export const COURSE_PHASES = [
 [1,35,'建立閱讀習慣','找出人物、時間、地點與直接線索'],
 [36,70,'讀懂條件與事件','整理事件順序、因果與限制'],
 [71,105,'整合多項資訊','比較公告、行程、價格與數據'],
 [106,140,'核對來源與觀點','分辨引述、觀察、推論及適用範圍'],
 [141,175,'解釋推論依據','連結跨段資訊、人物動機與證據'],
 [176,210,'處理轉折與取捨','判讀不確定性、相互條件與選擇'],
 [211,238,'綜合練習與修正','檢查版本、數量定義與錯誤理由'],
 [239,250,'完成後繼續運用','在新情境中驗證策略並建立複習計畫']
];
export function phaseForDay(day) { return COURSE_PHASES.find(([first,last])=>day>=first && day<=last); }
const style = 'body{margin:auto;max-width:980px;padding:24px;font:17px/1.7 system-ui,sans-serif;color:#182443;background:#fcfbf7}a{color:#155b67}header,article{background:white;border:1px solid #dce3e5;border-radius:14px;padding:24px;margin:18px 0}h1,h2,h3{line-height:1.3}nav{display:flex;flex-wrap:wrap;gap:18px}.meta{color:#526270;font-size:15px}.story{font-size:19px}table{border-collapse:collapse;width:100%;margin:12px 0}th,td{text-align:left;vertical-align:top;border-bottom:1px solid #dce3e5;padding:8px}blockquote{border-left:3px solid #87b4b0;padding:8px 18px;margin-left:0;background:#f4f8f7}li{margin:6px 0}.question{padding:10px 0;border-top:1px solid #e4e8ea;break-inside:avoid}.toc{columns:2;column-gap:30px}.toc li{break-inside:avoid}summary{cursor:pointer;font-weight:600;padding:8px 0}details{margin:12px 0}button,.button{padding:10px 14px;border:1px solid #155b67;border-radius:8px;background:white;color:#155b67;font:inherit;cursor:pointer;display:inline-block}.page-links{margin:20px 0}small{font-size:14px}@media(max-width:600px){body{padding:12px;font-size:16px}article,header{padding:16px}.toc{columns:1}.story{font-size:18px}}@media print{body{max-width:none;padding:0;background:white;font-size:11pt}nav,.screen-only,.page-links{display:none}article{border:0;border-radius:0;padding:0;break-before:page}header{border:0}a{color:inherit;text-decoration:none}h2,h3{break-after:avoid}.story{font-size:12pt}blockquote{font-size:10pt}details.words{display:none}}';
function page(title,body) {
 return '<!doctype html>\n<html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+escape(title)+'</title><style>'+style+'</style></head><body><nav aria-label="教材導覽"><a href="index.html">教材下載</a><a href="student.html">學生題本</a><a href="answers.html">答案解析</a><a href="../">回到闖關網站</a></nav>'+body+'</body></html>\n';
}
const story = text => '<div class="story" lang="en">'+text.split(/\n\s*\n/).map(p=>'<p>'+escape(p).replace(/\n/g,'<br>')+'</p>').join('')+'</div>';
const csvCell = value => '"'+String(value).replaceAll('"','""')+'"';
export function renderCourse(lessons,meta={}) {
 if(lessons.length!==250 || lessons.some((l,i)=>l.day!==i+1)) throw new Error('Complete course export requires Day 1–250');
 const questionCount=lessons.reduce((n,l)=>n+l.questions.length,0);
 if(questionCount!==1608) throw new Error('Complete course export requires 1608 questions');
 const totals={lessonCount:250,questionCount,vocabularyEntries:lessons.reduce((n,l)=>n+l.words.length,0),phraseEntries:lessons.reduce((n,l)=>n+l.phrases.length,0),bossCount:lessons.filter(l=>l.type==='每週 Boss').length};
 const intro='<header><p class="meta">國中會考英文每日冒險 · 原創閱讀練習</p><h1>250 天完整教材</h1><p>250 篇短文 · 1,608 題 · 1,250 個單字學習項目 · 500 個片語項目 · 36 個 Boss</p><p>每篇約 10 分鐘，Boss 約 15 分鐘。單字與片語包含安排過的複習，並非全部互異新詞。基礎、進階、挑戰共用文章；名稱不是正式會考級分或成績預測。</p></header>';
 const toc='<details class="screen-only"><summary>展開全部 250 天目錄</summary><ol class="toc">'+lessons.map(l=>'<li><a href="#day-'+l.day+'">Day '+l.day+' · '+escape(l.title)+'</a></li>').join('')+'</ol></details>';
 const student=lessons.map(l=>'<article id="day-'+l.day+'" data-day="'+l.day+'"><p class="meta">Day '+l.day+' · '+escape(l.type)+' · '+l.minutes+' 分鐘</p><h2 lang="en">'+escape(l.title)+'</h2><p>'+escape(l.goal)+'</p>'+story(l.story)+'<details class="words"><summary>需要提示時，再看單字與片語</summary><table><thead><tr><th>單字</th><th>意思／例句</th></tr></thead><tbody>'+l.words.map(w=>'<tr><td lang="en">'+escape(w.word)+'</td><td>'+escape(w.meaning)+'<br><span lang="en">'+escape(w.example)+'</span></td></tr>').join('')+'</tbody></table><ul>'+l.phrases.map(p=>'<li><span lang="en">'+escape(p.phrase)+'</span>：'+escape(p.meaning)+'</li>').join('')+'</ul></details>'+l.questions.map((q,i)=>'<section class="question" id="'+escape(q.id)+'"><p class="meta">'+(i+1)+' · '+escape(q.skill)+' · '+levels[q.tier]+'</p><h3 lang="en">'+escape(q.prompt)+'</h3><ol type="A" lang="en">'+q.options.map(o=>'<li>'+escape(o)+'</li>').join('')+'</ol></section>').join('')+'<p class="page-links"><a href="answers.html#day-'+l.day+'">完成後查看本篇解析</a> · <a href="../#lesson/'+l.day+'">到網站作答與保存紀錄</a></p></article>').join('');
 const answers=lessons.map(l=>'<article id="day-'+l.day+'" data-day="'+l.day+'"><h2>Day '+l.day+' · '+escape(l.title)+'</h2>'+l.questions.map((q,i)=>'<section class="question" id="'+escape(q.id)+'"><h3 lang="en">'+(i+1)+'. '+escape(q.prompt)+'</h3><p><strong>正解：'+String.fromCharCode(65+q.answer)+'</strong> · <span lang="en">'+escape(q.options[q.answer])+'</span></p><p>'+escape(q.explanation)+'</p><blockquote lang="en">'+escape(q.evidence).replace(/\n/g,'<br>')+'</blockquote>'+(q.reasons?'<ol type="A">'+q.reasons.map(r=>'<li>'+escape(r)+'</li>').join('')+'</ol>':'')+'</section>').join('')+'<p class="page-links"><a href="student.html#day-'+l.day+'">回到這一篇文章</a></p></article>').join('');
 const phaseTable='<table><thead><tr><th>天數</th><th>階段</th><th>練習重點</th></tr></thead><tbody>'+COURSE_PHASES.map(([a,b,title,goal])=>'<tr><td>'+a+'–'+b+'</td><td>'+title+'</td><td>'+goal+'</td></tr>').join('')+'</tbody></table>';
 const index=page('250 天教材與下載',intro+'<section><h2>閱讀、列印與完整資料</h2><p>學生題本不含答案解析。下載後可離線閱讀，或透過瀏覽器列印成 PDF；列印題本時不列印收合的字詞提示。離線題本不計分、不保存學習紀錄。</p><ul><li><a href="student.html">開啟學生題本</a> · <a href="student.html" download>下載 HTML</a></li><li><a href="answers.html">開啟全部答案與原文證據</a> · <a href="answers.html" download>下載 HTML</a></li><li><a href="question-bank.json" download>下載完整 250 天題庫 JSON</a>（包含正解、解析及全部字詞）</li><li><a href="plan.csv" download>下載 250 天計畫 CSV</a>（可用試算表開啟）</li></ul><h2>250 天計畫</h2>'+phaseTable+'<p>先讀文章與題目，再按需看字詞提示；答完再核對解析，記下一個錯因。週日複習本週字詞；個人錯題可回到網站的錯題復活賽。完成 Day 250 後，可重練未熟題型及官方歷屆閱讀。</p><p class="meta">此下載包只有每日原創閱讀題。網站另有 215 題官方答案卡（搭配官方原題本）與 10 題原創相似練習。原創內容經助理覆核與程式檢查，尚未由教師獨立審題或實測校準。</p></section>');
 const csvRows=[['Day','階段','主題','標題','閱讀目標','分鐘','題數','網站'],...lessons.map(l=>[l.day,phaseForDay(l.day)[2],l.type,l.title,l.goal,l.minutes,l.questions.length,'https://alger68.github.io/JHSEE-English-Adventure/#lesson/'+l.day])];
 return {
  'index.html':index,
  'student.html':page('250 天學生題本',intro+'<p>先自行作答，再到另一份答案本核對。此檔不包含正解與解析。</p>'+toc+student),
  'answers.html':page('250 天答案與解析',intro+'<p>請先完成學生題本，再核對正解、繁中解析與連續原文證據。</p>'+toc+answers),
  'question-bank.json':JSON.stringify({version:1,title:'國中會考英文 250 天原創閱讀題庫',...totals,revision:meta.revision??null,lastPublishDate:meta.lastPublishDate??null,provenance:{kind:'ai_original',officialExam:false,humanReviewed:false},lessons},null,2)+'\n',
  'plan.csv':'\ufeff'+csvRows.map(row=>row.map(csvCell).join(',')).join('\r\n')+'\r\n'
 };
}

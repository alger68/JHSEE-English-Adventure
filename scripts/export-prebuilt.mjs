import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {BATCH,readBatch,validateBatch,fileForDay} from './prebuilt.mjs';
import {loadContent} from './content.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const output=process.argv[2];
if(!output || !path.isAbsolute(output) || process.argv.length!==3) throw new Error('Usage: node scripts/export-prebuilt.mjs /absolute/output/directory');
if(path.resolve(output)===path.parse(output).root || path.resolve(output)===path.resolve(root)) throw new Error('Use a dedicated output directory');
const docs=readBatch(root),lessons=docs.map(d=>d.lessons[0]),report=validateBatch(loadContent(root),docs);
const letters=['A','B','C','D'];
const tiers={1:'基礎',2:'進階',3:'挑戰'};
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paragraphs=s=>s.split(/\n\n/).map(p=>`<p>${escape(p).replace(/\n/g,'<br>')}</p>`).join('');
const studentHeader=`# 國中會考英文每日冒險｜Day 13–35 學生用卷\n\n23 篇 AI 原創練習、147 題。一般日 6 題、Boss 9 題。先作答，再查 answers.md；單字與片語見 vocabulary.md。本文不含正解標記、不計分、不影響網站進度。\n\n`;
let student=studentHeader;
let answers='# Day 13–35｜答案與逐選項解析\n\n請先完成學生用卷。以下原文證據均為該篇的一段連續文字；多線索與計算題須連同全文判讀。\n\n';
let vocabulary='# Day 13–35｜單字、例句與片語\n\n115 個單字學習項目、46 個片語項目，含刻意安排的複習，不代表全部互異。\n\n';
const sections=lessons.map((l,index)=>{
  const date=docs[index].plannedPublishDate;
  student+=`## Day ${l.day} — ${l.title}\n\n${l.type}｜${l.minutes} 分鐘｜目標：${l.goal}\n\n${l.story}\n\n`;
  answers+=`## Day ${l.day} — ${l.title}\n\n`;
  vocabulary+=`## Day ${l.day} — ${l.title}\n\n`;
  vocabulary+=l.words.map(w=>`- **${w.word}**：${w.meaning}\n  ${w.example}`).join('\n')+'\n\n';
  vocabulary+=l.phrases.map(p=>`- **${p.phrase}**：${p.meaning}`).join('\n')+'\n\n';
  const questions=l.questions.map((q,i)=>{
    student+=`### ${i+1}. ${q.prompt}\n\n${tiers[q.tier]}｜${q.skill}｜${q.id}\n\n`+q.options.map((o,j)=>`${letters[j]}. ${o}`).join('  \n')+'\n\n我的答案：＿＿　原文線索：＿＿＿＿＿＿＿＿\n\n';
    answers+=`### ${i+1}. ${q.id}｜${letters[q.answer]}\n\n${q.prompt}\n\n正解：${letters[q.answer]}. ${q.options[q.answer]}\n\n${q.explanation}\n\n> ${q.evidence.replace(/\n/g,'\n> ')}\n\n`;
    answers+=q.options.map((o,j)=>`- ${letters[j]}. ${o}\n  ${q.reasons[j]}`).join('\n')+'\n\n';
    return `<section class="question" id="${escape(q.id)}"><p class="tag">${escape(tiers[q.tier])} · ${escape(q.skill)} · ${escape(q.id)}</p><h3>${i+1}. ${escape(q.prompt)}</h3><ol type="A" class="choices">${q.options.map(o=>`<li>${escape(o)}</li>`).join('')}</ol><details class="answer"><summary>作答後查看答案與解析</summary><div class="answer-body"><p class="correct">答案 ${letters[q.answer]} · ${escape(q.options[q.answer])}</p><p>${escape(q.explanation)}</p><blockquote>${escape(q.evidence).replace(/\n/g,'<br>')}</blockquote><ul class="reasons">${q.options.map((o,j)=>`<li><strong>${letters[j]}.</strong> ${escape(o)}<br><span>${escape(q.reasons[j])}</span></li>`).join('')}</ul></div></details></section>`;
  }).join('');
  return `<article id="day-${l.day}"><header class="lesson-head"><p class="eyebrow">DAY ${l.day} · ${escape(l.type)}</p><h2>${escape(l.title)}</h2><p>${escape(l.goal)}</p><p class="meta">約 ${l.minutes} 分鐘 · ${l.story.trim().split(/\s+/).length} 字 · ${l.questions.length} 題 · 預定發布 ${date}</p></header><div class="story" lang="en">${paragraphs(l.story)}</div><div class="question-list">${questions}</div><details class="words"><summary>單字、例句與片語（建議作答後複習）</summary><div class="answer-body"><dl>${l.words.map(w=>`<dt>${escape(w.word)} <span>${escape(w.meaning)}</span></dt><dd lang="en">${escape(w.example)}</dd>`).join('')}</dl><ul>${l.phrases.map(p=>`<li><strong>${escape(p.phrase)}</strong>：${escape(p.meaning)}</li>`).join('')}</ul></div></details><a class="back" href="#contents">返回目錄 ↑</a></article>`;
});
const html=`<!doctype html>
<html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>會考英文每日冒險 — Day 13–35</title>
<style>
:root{color-scheme:light;--ink:#1f3430;--muted:#5a6e66;--accent:#176d56;--line:#cfdcd2;--paper:#fffefa;--tint:#eef4ed}*{box-sizing:border-box}body{margin:0;background:#f2f3ec;color:var(--ink);font-family:system-ui,-apple-system,"Noto Sans CJK TC","Microsoft JhengHei",sans-serif;line-height:1.8}main{max-width:960px;margin:auto;padding:28px 32px 64px}.cover{padding:28px 0 34px;border-bottom:3px solid var(--accent)}.eyebrow{font-size:12px;font-weight:750;letter-spacing:1.8px;color:var(--accent);margin:0 0 10px}h1{font-size:clamp(27px,5vw,42px);line-height:1.3;margin:0 0 14px}h2{font-size:clamp(23px,3.5vw,32px);line-height:1.35;margin:0 0 12px}h3{font-size:18px;line-height:1.5;margin:3px 0 12px}p{margin:10px 0}.sub{font-size:19px}.meta,.tag{font-size:13px;color:var(--muted)}.notice{border-left:4px solid #ad813d;padding:12px 18px;background:#fcf4e6;font-size:14px}.toolbar{display:flex;flex-wrap:wrap;gap:9px;margin:22px 0}button{background:var(--paper);color:var(--accent);border:1px solid var(--accent);padding:9px 14px;border-radius:6px;font:inherit;font-size:14px;cursor:pointer}button:focus-visible,a:focus-visible,summary:focus-visible{outline:3px solid #df9f35;outline-offset:3px}a{color:var(--accent);text-decoration-thickness:1px;text-underline-offset:3px}nav{padding:22px 0 14px}nav ol{columns:2;column-gap:40px;padding-left:24px}nav li{break-inside:avoid;padding:4px 0;font-size:14px}article{background:var(--paper);padding:32px 38px;margin:32px 0;border:1px solid var(--line);border-radius:12px;scroll-margin-top:16px}.lesson-head{border-bottom:1px solid var(--line);padding-bottom:18px}.story{font-family:Georgia,"Times New Roman",serif;font-size:20px;line-height:1.85;padding:14px 0 22px}.story p{margin:18px 0}.question{border-top:1px solid var(--line);padding:20px 0}.tag{margin:0;letter-spacing:.4px}.choices{padding-left:28px;margin:12px 0 20px}.choices li{padding:4px 0 4px 7px}details{border:1px solid var(--line);border-radius:7px;background:var(--tint)}summary{padding:10px 14px;cursor:pointer;font-size:14px;font-weight:650}.answer-body{padding:0 18px 16px;font-size:15px}.correct{font-weight:750;color:var(--accent)}blockquote{border-left:3px solid #94b7a6;margin:15px 0;padding:10px 16px;background:#fff;white-space:normal;font-family:Georgia,serif}.reasons{list-style:none;padding-left:0}.reasons li{padding:8px 0}.reasons span{color:var(--muted)}.words{margin-top:18px}dt{font-weight:750;margin-top:12px}dt span{font-weight:400;margin-left:6px}dd{margin-left:0;color:var(--muted)}.back{display:inline-block;margin-top:20px;font-size:13px}footer{font-size:13px;color:var(--muted);padding:18px 0} @media(max-width:620px){main{padding:16px 14px 32px}article{padding:24px 20px;margin:24px 0}.story{font-size:19px}nav ol{columns:1}.cover{padding-top:18px}.question h3{font-size:17px}}@media print{body{background:white;color:#111}main{max-width:none;padding:0}.toolbar,.back{display:none}article{break-before:page;border:0;border-radius:0;margin:0;padding:0}.question{break-inside:avoid}.story{font-size:12pt}.cover{break-after:page}nav{break-after:page}details:not([open]){display:none}details[open]{background:white}.tag,.meta{color:#444}h1{font-size:26pt}h2{font-size:22pt}a{color:inherit}.notice{background:white}.answer-body{font-size:10pt}h3{font-size:12pt}body{font-size:11pt}}
</style></head><body><main>
<header class="cover"><p class="eyebrow">ENGLISH ADVENTURE · ORIGINAL READING PRACTICE</p><h1>會考英文每日冒險<br>Day 13–35 完整教材</h1><p class="sub">23 篇短文 · 147 道題目 · 3 個 Boss 關卡</p><p>每天一般約 10 分鐘，Boss 約 15 分鐘。先讀英文、記下答案，再展開解析與單字複習。</p><div class="notice">這是可提前練習的離線教材，不計分、不存進度，也不會改動網站的每日解鎖與成績。所有情境與題目為 AI 原創練習，尚未經教師獨立審題或難度實測；不是官方歷屆題，也不是全套 250 天完工。</div><div class="toolbar"><button id="expand">展開所有解析與單字</button><button id="collapse">收合所有解析與單字</button><button id="print">列印目前內容</button></div></header>
<nav id="contents" aria-label="課程目錄"><p class="eyebrow">CONTENTS</p><h2>選一篇開始</h2><ol start="13">${lessons.map(l=>`<li><a href="#day-${l.day}">${escape(l.title)}</a></li>`).join('')}</ol></nav>
${sections.join('\n')}
<footer>版本 ${BATCH.id} · 預定日期不是發布證明 · 完整機器可讀資料見 question-bank.json · 正式網站成績與個人錯題僅保存在原瀏覽器，本教材不讀取。</footer>
</main><script>document.getElementById('expand').addEventListener('click',()=>document.querySelectorAll('details').forEach(d=>d.open=true));document.getElementById('collapse').addEventListener('click',()=>document.querySelectorAll('details').forEach(d=>d.open=false));document.getElementById('print').addEventListener('click',()=>window.print());</script></body></html>`;

fs.mkdirSync(path.join(output,'lessons'),{recursive:true});
const files={
  'START_HERE.html':html,
  'student.md':student,
  'answers.md':answers,
  'vocabulary.md':vocabulary,
  'question-bank.json':JSON.stringify({format:'jhsee-prebuilt-batch-v1',batch:BATCH,documents:docs},null,2)+'\n',
  'validation-report.json':JSON.stringify(report,null,2)+'\n',
  'README.md':fs.readFileSync(path.join(root,'PREBUILT_BANK.md'),'utf8')
};
for(const [name,content] of Object.entries(files)) fs.writeFileSync(path.join(output,name),content);
for(const doc of docs) fs.writeFileSync(path.join(output,'lessons',fileForDay(doc.lessons[0].day)),JSON.stringify(doc,null,2)+'\n');
console.log(JSON.stringify({output,files:Object.keys(files),lessonFiles:docs.length,lessons:report.lessons,questions:report.questions},null,2));

'use strict';
const C = AdventureCore;
const $ = s => document.querySelector(s);
const main = $('#main');
const KEY = 'jhseeStateV2';
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tiers = ['','基礎','進階','挑戰'];
let blocked = false, storageMessage = '', migrated = false;
function readState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return C.validateState(JSON.parse(raw), lessons);
    const old = localStorage.getItem('jhseeState');
    if (old) { migrated = true; return C.migrate(JSON.parse(old)); }
  } catch (e) {
    blocked = true;
    storageMessage = '無法讀取原有進度；原始資料已保留。你仍可練習，請匯入有效備份，或先匯出這次的紀錄。';
  }
  return C.fresh();
}
let state = readState();
let active = null, quizResult = null, currentAnswers = {}, startedAt = 0;
let wordSession = null, wrongSession = null, toastTimer;
let selectedChapter = null;
let reviewMode = 'due', reviewSkill = '', transferSession = null;
const bossLesson = l => l.type === "每週 Boss";
const reviewLesson = l => l.type === "單字與錯題復活";
let lastCalendarDay = C.dateKey(), lastUnlocked = 0;
function save() {
  if (blocked) { showStorage(); return; }
  try { localStorage.setItem(KEY, JSON.stringify(state)); }
  catch (e) { storageMessage = '這個瀏覽器目前無法保存進度。請先匯出備份，避免關閉後遺失。'; showStorage(); }
}
function showStorage() { const box = $('#storageWarning'); box.hidden = !storageMessage; box.textContent = storageMessage; }
function toast(message) { clearTimeout(toastTimer); $('#toast').textContent = message; $('#toast').hidden = false; toastTimer = setTimeout(() => $('#toast').hidden = true, 4000); }
let readingRate = .85, currentSpeech = null;
function stopSpeech() { currentSpeech = null; if ('speechSynthesis' in window) window.speechSynthesis.cancel(); }
function say(text, rate = readingRate, kind = 'word') {
  if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) { toast('此瀏覽器不支援英文朗讀，請使用 Safari、Chrome 或 Edge。'); return; }
  stopSpeech(); const u = new SpeechSynthesisUtterance(text); u.lang = 'en-US'; u.rate = rate;
  const voice = window.speechSynthesis.getVoices().find(v => v.lang === 'en-US'); if (voice) u.voice = voice;
  currentSpeech = {utterance:u,text,kind};
  u.onend = () => { if(currentSpeech?.utterance === u) currentSpeech = null; };
  u.onerror = event => { if(currentSpeech?.utterance !== u) return; currentSpeech = null; if (!['interrupted','canceled'].includes(event.error)) toast('朗讀暫時無法播放，請確認裝置音量與語音服務。'); };
  window.speechSynthesis.speak(u);
}
function changeReadingRate(rate) {
  if(![.6,.85,1,1.25].includes(rate)) return;
  readingRate = rate;
  const story = currentSpeech?.kind === 'story' ? currentSpeech.text : null;
  if(story) { say(story,rate,'story'); toast(`已改為 ${rate}×，從文章開頭重新朗讀。`); }
  else toast(`朗讀速度已設為 ${rate}×，按「朗讀文章」即可播放。`);
}
function syncStats() {
  const done = C.completedDays(state).filter(d => lessons.some(l => l.day === d)).length;
  $('#xp').textContent = state.xp; $('#streak').textContent = C.streak(state); $('#level').textContent = 'Lv. ' + (Math.floor(state.xp / 100) + 1);
  $('#sidebarProgress').style.width = Math.round(done / lessons.length * 100) + '%'; $('#sidebarDone').textContent = `${done} / ${lessons.length} 關完成`;
  const due = C.dueWords(lessons,state).length, wrong = C.reviewQueue(state).length;
  $('#wordBadge').textContent = due || ''; $('#mistakeBadge').textContent = wrong || '';
  showStorage();
}
function setNav(view) {
  const labels = {home:'冒險地圖',words:'單字補給站',mistakes:'錯題復活賽',dashboard:'學習紀錄',exams:'官方歷屆試題',transfer:'相似題驗收'};
  document.querySelectorAll('#nav a').forEach(a => {const yes = a.dataset.view === view; a.classList.toggle('active',yes); if (yes) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');});
  $('#breadcrumb').textContent = '我的學習基地 / ' + (labels[view] || '閱讀闖關');
}
function dateLabel(ts) { return new Intl.DateTimeFormat('zh-TW',{timeZone:'Asia/Taipei',month:'numeric',day:'numeric'}).format(new Date(ts)); }
function unlockLabel(l) { return `${dateLabel(C.unlockAt(state,l.day))} 20:00 解鎖`; }
function storyHTML(l) { return l.story.split(/\n\s*\n/).map(p => `<p>${esc(p).replace(/\n/g,'<br>')}</p>`).join(''); }
function home() {
  const done = C.completedDays(state), opened = lessons.filter(l => C.isUnlocked(state,l.day));
  const next = opened.find(l => !done.includes(l.day));
  const featured = next || opened[opened.length-1] || lessons[0];
  const todayDone = state.activityDates.includes(C.dateKey());
  const upcoming = lessons.find(l => !C.isUnlocked(state,l.day));
  const due = C.dueWords(lessons,state).length;
  const totalChapters = Math.ceil(lessons.length / 7);
  const chapter = Math.max(1, Math.min(totalChapters, selectedChapter || Math.ceil(featured.day / 7)));
  const chapterLessons = lessons.filter(l => Math.ceil(l.day / 7) === chapter);
  const chapterDone = chapterLessons.filter(l => done.includes(l.day)).length;
  $('#sidebarChapter').textContent = `第 ${chapter} 章`;
  main.innerHTML = `<div class="page-heading"><div><div class="eyebrow">YOUR DAILY ADVENTURE</div><h1>${done.length ? '歡迎回來，繼續冒險。' : '今天，從一個小故事開始。'}</h1><p>讀一篇、找線索、闖一關。把 10 分鐘留給英文。</p></div><span class="date">${new Intl.DateTimeFormat('zh-TW',{timeZone:'Asia/Taipei',month:'long',day:'numeric',weekday:'long'}).format(new Date())}</span></div>
  <div class="home-top"><section class="mission"><span class="mission-num" aria-hidden="true">${String(featured.day).padStart(2,'0')}</span><div class="eyebrow">${next ? 'YOUR NEXT MISSION' : 'KEEP THE ADVENTURE GOING'}</div><span class="chip">DAY ${featured.day} · ${esc(featured.type)}</span><h2 lang="en">${esc(featured.title)}</h2><p>${esc(featured.goal)} · 約 ${featured.minutes} 分鐘</p><a class="primary-link" href="#lesson/${featured.day}">${next ? '開始今天的冒險' : '再挑戰一次'} <span aria-hidden="true">→</span></a></section>
  <section class="panel daily-goal"><p><a class="text-link" href="#mistakes">先複習 ${C.reviewQueue(state).length} 題到期錯題 →</a></p><div class="eyebrow">DAILY CHECK-IN</div><h2>今天的小目標</h2><div class="goal-main"><div class="ring" style="--progress:${todayDone?100:0}"><div>${todayDone?1:0}<small>/ 1 次學習</small></div></div><div><strong>${todayDone?'今日已打卡':'完成一次練習'}</strong><p>${todayDone?'閱讀或複習，都算進步。':'交卷或複習一張單字。'}</p></div></div><p class="goal-note">${due ? `還有 ${due} 個單字等你複習。` : '今日到期單字已複習完成。'} <a class="text-link" href="#words">前往補給站 →</a></p></section></div>
  <div class="section-heading"><div class="chapter-meta"><h2>第 ${chapter} 章 · ${chapter === 1 ? "日常裡的發現" : "新的線索，新的發現"}</h2><span class="chip">${chapterDone} / ${chapterLessons.length} 已完成</span></div><div class="settings-row"><label for="chapterSelect">冒險章節</label><select id="chapterSelect">${Array.from({length:totalChapters},(_,i)=>`<option value="${i+1}" ${chapter===i+1?"selected":""}>第 ${i+1} 章 · Day ${i*7+1}–${Math.min((i+1)*7,lessons.length)}</option>`).join("")}</select></div></div>
  <div class="lesson-grid">${chapterLessons.map(l => {
    const locked = !C.isUnlocked(state,l.day), complete = done.includes(l.day), isNext = l.day===next?.day;
    const best = state.completions[l.day]?.best;
    return `<article class="lesson-card ${locked?'locked':''} ${complete?'completed':''} ${isNext?'current':''} ${bossLesson(l)?'boss-card':''} ${reviewLesson(l)?'week-finish':''}"><div class="lesson-card-head"><span class="day-square">${complete?'✓':String(l.day).padStart(2,'0')}</span>${!reviewLesson(l)?`<span class="chip">${bossLesson(l)?'BOSS':esc(l.type)}</span>`:''}</div><div class="${reviewLesson(l)?'finish-content':''}"><h3 lang="en">${esc(l.title)}</h3><p>${esc(l.goal)}</p></div><div class="card-foot"><span>${complete?(best===undefined?'V1 已完成':`最佳 ${best}%`):`約 ${l.minutes} 分鐘`}</span>${locked?`<span>${unlockLabel(l)}</span>`:`<a class="card-action" href="#lesson/${l.day}">${complete?'再練一次':'進入關卡'} →</a>`}</div></article>`;
  }).join('')}</div>
  <div class="info-strip"><p>${upcoming ? `下一關 ${unlockLabel(upcoming)}（台灣時間）。錯過也沒關係，已解鎖關卡會一直保留。` : '目前收錄的關卡都已開放。完成 Boss 後，別忘了用錯題復活賽找回失分。'}</p><a class="text-link nowrap" href="#dashboard">查看學習紀錄 →</a></div><p class="difficulty-note">已收錄 ${lessons.length} 篇${lessonMeta.lastPublishDate ? ` · 最新補給 ${esc(lessonMeta.lastPublishDate)}` : ""}。新文章依你的學習起始日逐日解鎖。</p>`;
}
function renderQuestion(q,index,answers,result) {
  const item = result?.items.find(i => i.questionId === q.id);
  return `<fieldset class="question" id="question-${esc(q.id)}"><legend><span class="chip">${q.tier===3?'挑戰':q.tier===2?'進階':q.skill==='字義推測'?'偵探任務':`Q${index+1}`}</span><span lang="en">${esc(q.prompt)}</span></legend><div class="options">${q.options.map((opt,i)=>`<label class="option ${item ? (i===q.answer?'correct-option':i===item.selected?'wrong-option':'') : ''}"><input type="radio" name="${esc(q.id)}" value="${i}" ${answers[q.id]===i?'checked':''} ${result?'disabled':''}><span lang="en">${String.fromCharCode(65+i)}. ${esc(opt)}</span></label>`).join('')}</div>${item?`<div class="explanation ${item.correct?'':'is-wrong'}"><strong>${item.correct?'答對了':'這題先收進複習'} · 正解 ${String.fromCharCode(65+q.answer)}</strong><br>${esc(q.explanation)}<blockquote lang="en">${esc(q.evidence)}</blockquote>${evidenceHelp(q)}${q.reasons?`<ul>${q.reasons.map((r,i)=>`<li><b>${String.fromCharCode(65+i)}</b>：${esc(r)}</li>`).join('')}</ul>`:''}</div>`:''}</fieldset>`;
}
function evidenceHelp(q) {
  const l=lessons.find(l=>l.questions.some(item=>item.id===q.id));
  const story=l?.story || q.story || '';
  const pieces=q.evidence.split(/\s+\.\.\.\s+/), paragraphs=story.split(/\n\s*\n/);
  const indexes=paragraphs.flatMap((p,i)=>pieces.some(t=>p.replace(/\s+/g,' ').includes(t.replace(/\s+/g,' ')))?[i+1]:[]);
  const location=indexes.length?`線索位置：第 ${indexes.join('、')} 段。`:'請對照上方引文與完整文章。';
  return `<p class="small">${esc(location)} ${esc(q.skill)} · AI 原創教材／AI 輔助解析</p>`;
}
function lessonView(day,showLast=false,reset=false) {
  const l = lessons.find(l => l.day === day);
  if (!l) { main.innerHTML=empty('找不到這一關','請從冒險地圖選擇已收錄的關卡。','#home','返回地圖'); return; }
  if (!C.isUnlocked(state,day)) { main.innerHTML=empty('下一段冒險，明天再出發。',`Day ${day} 將於 ${unlockLabel(l)}（台灣時間）。可以先練單字或複習已開放的關卡。`,'#home','返回地圖'); return; }
  if (reset || !active || active.day !== day || active.mode !== (showLast?'result':'lesson')) {
    active = {day,mode:showLast?'result':'lesson',tier:showLast?(state.completions[day]?.last.tier||state.difficulty):state.difficulty};
    quizResult = showLast && state.completions[day] ? {...state.completions[day].last,gain:0,reviewOnly:true} : null;
    currentAnswers = {...(quizResult?.answers || state.drafts[`${day}:${active.tier}`] || {})}; startedAt = Date.now();
  }
  const qs = C.questions(l,active.tier);
  main.innerHTML=`<a class="back-link" href="#home">← 返回冒險地圖</a><div class="lesson-header"><div><span class="chip">DAY ${l.day} · ${esc(l.type)}</span><h1 lang="en">${esc(l.title)}</h1><p>${esc(l.goal)} · ${l.story.split(/\s+/).length} 字 · 約 ${l.minutes} 分鐘</p></div><div class="lesson-tools"><button data-action="speak-story">朗讀文章</button><button data-action="stop-speech" aria-label="停止朗讀">停止</button><label class="small" for="speechRate">速度</label><select id="speechRate" aria-describedby="speechRateHint">${[[.6,"0.6× 慢速"],[.85,"0.85× 稍慢"],[1,"1× 正常"],[1.25,"1.25× 快速"]].map(([r,label])=>`<option value="${r}" ${readingRate===r?"selected":""}>${label}</option>`).join("")}</select><span id="speechRateHint" class="small">播放中調速，會從頭重播。</span></div></div>
  <div class="reading-layout"><section class="panel reading-panel"><div class="eyebrow">READ & DISCOVER</div><div class="story" lang="en">${storyHTML(l)}</div></section><aside class="reading-side"><section class="panel"><h3>今日核心單字</h3><div class="word-list">${l.words.map(w=>`<div class="word-row"><strong lang="en">${esc(w.word)}</strong><span>${esc(w.meaning)}</span></div>`).join('')}</div></section><section class="panel"><h3>好用片語</h3>${l.phrases.map(p=>`<div class="phrase"><b lang="en">${esc(p.phrase)}</b><p>${esc(p.meaning)}</p></div>`).join('')}</section><div class="tip">先看懂大意，再回文章找支持答案的那一句。交卷後才會揭曉答案與解析。</div></aside></div>
  <section class="panel quiz-panel"><div class="quiz-intro"><div><h2>${bossLesson(l)?'每週 Boss Challenge':'輪到你找線索了'}</h2><p class="muted small">${qs.length} 題 · 每題只有一個最佳答案</p></div><div class="settings-row"><label for="lessonTier">練習難度</label><select id="lessonTier" ${quizResult?'disabled':''}>${[1,2,3].map(t=>`<option value="${t}" ${active.tier===t?'selected':''}>${tiers[t]} · ${C.questions(l,t).length} 題</option>`).join('')}</select></div></div><p class="difficulty-note">各級使用同一篇文章；切換後會在文末增加題目。基礎：核心題＋字義偵探；進階：加一題；挑戰：再加一題綜合練習。這是本站練習分級，並非會考成績預測。</p>
  <form id="quizForm">${qs.map((q,i)=>renderQuestion(q,i,currentAnswers,quizResult)).join('')}<div id="quizError" class="error-text" role="alert"></div><div class="quiz-actions">${quizResult?`<button type="button" data-action="retry">再挑戰一次</button><a class="primary-link" href="${reviewLesson(l)?'#mistakes':'#home'}">${reviewLesson(l)?'前往錯題復活賽':'回到冒險地圖'} →</a>`:`<button type="submit" class="primary">提交答案，查看解析 →</button><p>已完成 <span id="answerCount">${qs.filter(q=>Number.isInteger(currentAnswers[q.id])).length}</span> / ${qs.length} 題</p>`}</div></form>
  ${quizResult?`<div class="result-banner" id="result" role="status"><div class="result-score">${quizResult.score}<span class="small"> / ${quizResult.total}</span></div><div><h3>${quizResult.percent===100?'全部答對，線索找得很準！':quizResult.percent>=60?'有進步！再看看漏掉的線索。':'先別急，一題一題找回線索。'}</h3><p>${quizResult.reviewOnly?'上次作答紀錄':quizResult.gain?`首次完成 +${quizResult.gain} EXP`:'複習完成 · 本關 EXP 已領取'} · ${quizResult.total-quizResult.score} 題需加強</p></div><a class="text-link" href="#mistakes">前往錯題復活賽 →</a></div>`:''}</section>`;
  const form=$('#quizForm');
  if(!quizResult)form.addEventListener('submit',e=>{e.preventDefault();try{quizResult=C.submit(state,l,currentAnswers,active.tier,new Date(),(Date.now()-startedAt)/1000);save();syncStats();lessonView(day);$('#result').scrollIntoView({behavior:'smooth',block:'center'});}catch(err){$('#quizError').textContent=err.message;const q=qs.find(q=>!Number.isInteger(currentAnswers[q.id]));if(q)$(`#question-${q.id} input`)?.focus();}});
}
function empty(title,body,href,action){return `<section class="panel empty"><div class="empty-symbol" aria-hidden="true">✦</div><h1>${esc(title)}</h1><p>${esc(body)}</p>${href?`<a class="primary-link" href="${href}">${esc(action)}</a>`:''}</section>`;}
function wordsView(reset=false,all=false){
  if(reset||!wordSession){wordSession={queue:all?C.vocabulary(lessons,state):C.dueWords(lessons,state),index:0,flipped:false,known:0,again:0,all};}
  const s=wordSession,w=s.queue[s.index],due=C.dueWords(lessons,state).length;
  main.innerHTML=`<div class="page-heading"><div><div class="eyebrow">VOCABULARY STATION</div><h1>單字補給站</h1><p>先想意思，再翻卡。讓單字從眼熟變成記得。</p></div><span class="chip">${due} 個待複習</span></div><div class="review-choice"><button data-action="words-due" aria-pressed="${!s.all}">今日待複習</button> <button data-action="words-all" aria-pressed="${s.all}">全部已解鎖單字</button></div>`;
  if(!w){main.innerHTML+=empty(s.queue.length?'這一輪複習完成了。':'今日單字都複習過了。',s.queue.length?`記得 ${s.known} 個，還要再看 ${s.again} 個。記住的單字會在 1、3、7 天後依序回來。`:'明天再來，或切換「全部已解鎖單字」多練一次。','#home','回到冒險地圖');if(due)main.innerHTML+=`<div class="flashcard-actions"><button class="primary" data-action="words-due">再練待複習的 ${due} 個單字</button></div>`;return;}
  main.innerHTML+=`<div class="flashcard-wrap"><div class="review-top"><span>${s.all?'自由複習':'今日複習'} · ${s.index+1} / ${s.queue.length}</span><span>出自 Day ${w.day}</span></div><section class="flashcard"><div class="eyebrow">WHAT DOES IT MEAN?</div><div class="word-big" lang="en">${esc(w.word)}</div><button data-action="speak-word" aria-label="朗讀 ${esc(w.word)}">朗讀單字</button>${s.flipped?`<p class="meaning">${esc(w.meaning)}</p><p class="example" lang="en">${esc(w.example)}</p>`:`<button class="secondary flip-btn" data-action="flip">我想好了，翻開意思</button>`}</section>${s.flipped?`<div class="flashcard-actions"><button data-action="word-again">還不熟，再看一次</button><button class="primary" data-action="word-known">記住了 ✓</button></div>`:`<p class="muted small" style="text-align:center;margin-top:19px">說出意思，或在心裡造一句英文。</p>`}</div>`;
}
function mistakesView(reset=false){
  const skillOf=w=>lessons.find(l=>l.day===w.day)?.questions.find(q=>q.id===w.questionId)?.skill;
  const all=C.reviewQueue(state,new Date(),true), due=C.reviewQueue(state);
  if(reset||!wrongSession)wrongSession={queue:C.reviewQueue(state,new Date(),reviewMode==='all').filter(w=>!reviewSkill||skillOf(w)===reviewSkill).map(w=>({...w})),index:0,selected:null,result:null,fixed:0};
  const s=wrongSession,entry=s.queue[s.index],l=entry&&lessons.find(l=>l.day===entry.day),q=l?.questions.find(q=>q.id===entry.questionId);
  const mastered=all.filter(w=>w.stage===5).length;
  main.innerHTML=`<div class="page-heading"><div><div class="eyebrow">RECALL · REVIEW · APPLY</div><h1>錯題復活賽</h1><p>先找線索，再隔天回想。答對後，用新題目確認理解。</p></div><span class="chip">今日 ${due.length} 題</span></div>
  <div class="review-summary"><span>複習中 <b>${all.length-mastered}</b></span><span>已完成間隔複習 <b>${mastered}</b></span><span>歷史錯題 <b>${all.length}</b></span></div>
  <div class="review-choice settings-row"><button data-action="review-due" aria-pressed="${reviewMode==='due'}">今日到期</button><button data-action="review-all" aria-pressed="${reviewMode==='all'}">所有錯題</button><label for="reviewSkill">能力分類</label><select id="reviewSkill"><option value="">全部能力</option>${['細節理解','推論判讀','字義推測','主旨統整','資訊整合'].map(skill=>`<option ${reviewSkill===skill?'selected':''}>${skill}</option>`).join('')}</select></div>
  <p class="difficulty-note">原題答對後依序隔 1、3、7、14 天再測；到期答對才前進一階。同一天重做不加速，答錯重新練。舊版仍保留的錯題已加入，先前刪除的錯題無法還原。</p>`;
  if(!q){
    const future=all.filter(w=>w.stage<5&&w.due>C.dateKey()).sort((a,b)=>a.due.localeCompare(b.due))[0];
    main.innerHTML+=empty(s.queue.length?'這一輪完成了。':'這個分類目前沒有待練題目。',s.queue.length?`本輪答對 ${s.fixed} 題。複習紀錄已保存，首頁會提醒到期題目。`:future?`下一次複習日期：${future.due}。也可以切換「所有錯題」自由練習。`:'完成每日閱讀後，答錯題目會自動加入。','#home','回到冒險地圖');
    main.innerHTML+=`<div class="flashcard-actions"><button data-action="wrong-restart">重新整理複習清單</button><a class="primary-link" href="#transfer/${encodeURIComponent(reviewSkill||'細節理解')}">試試相似題驗收 →</a></div>`;return;
  }
  const answers={};if(s.selected!==null)answers[q.id]=s.selected;
  const progress=state.wrong[l.day+':'+q.id];
  main.innerHTML+=`<section class="panel"><div class="review-top"><span>第 ${s.index+1} / ${s.queue.length} 題 · ${esc(q.skill)}</span><span>DAY ${l.day}</span></div><p class="small">答錯 ${progress.misses} 次 · 階段 ${progress.stage}/5 · ${progress.stage===5?'間隔複習完成':`複習日 ${progress.due}`}</p><h2 lang="en">${esc(l.title)}</h2><details><summary>打開原文，重新找線索</summary><div class="story" lang="en">${storyHTML(l)}</div></details><form id="wrongForm">${renderQuestion(q,0,answers,s.result)}<div id="reviewError" class="error-text" role="alert"></div><div class="quiz-actions">${s.result?`<button type="button" class="primary" data-action="wrong-next">${s.index+1===s.queue.length?'完成這一輪':'下一題'} →</button><a class="text-link" href="#transfer/${encodeURIComponent(q.skill)}">同能力新題目 →</a>`:`<button type="submit" class="primary">確認答案</button>`}</div></form></section>`;
  if(!s.result)$('#wrongForm').addEventListener('submit',e=>{e.preventDefault();try{const correct=C.reviewQuestion(state,l,q.id,s.selected);s.result={items:[{questionId:q.id,selected:s.selected,correct}]};if(correct)s.fixed++;save();syncStats();mistakesView();}catch(err){$('#reviewError').textContent=err.message;}});
}
function transferView(skill='細節理解',reset=false){
  const bank=transferQuestions.filter(q=>q.skill===skill);
  if(!bank.length){main.innerHTML=empty('尚無這類驗收題','請先回到錯題分類選擇其他能力。','#mistakes','回到複習');return;}
  if(reset||!transferSession||transferSession.skill!==skill){
    const q=[...bank].sort((a,b)=>(state.transfer[a.id]?.attempts||0)-(state.transfer[b.id]?.attempts||0))[0];
    transferSession={skill,q,selected:null,result:null};
  }
  const t=transferSession,q=t.q, answers={};if(t.selected!==null)answers[q.id]=t.selected;
  const seen=state.transfer[q.id];
  main.innerHTML=`<a class="back-link" href="#mistakes">← 回到錯題複習</a><div class="page-heading"><div><div class="eyebrow">TRY A DIFFERENT QUESTION</div><h1>相似題驗收</h1><p>${esc(skill)} · 換一個情境，試試能否自己找出線索。</p></div><span class="chip">AI 原創延伸題</span></div><p class="difficulty-note">目前每類 2 題，共 10 題，優先出最少練過的題目。${seen?`這題已練 ${seen.attempts} 次；首次${seen.first?'答對':'答錯'}。`:'這是你第一次挑戰這題。'}與官方歷屆題目及每日關卡分開記錄，不重複領取 EXP。</p><section class="panel"><div class="story" lang="en"><p>${esc(q.story)}</p></div><form id="transferForm">${renderQuestion(q,0,answers,t.result)}<div id="transferError" role="alert" class="error-text"></div><div class="quiz-actions">${t.result?'<button type="button" class="primary" data-action="transfer-next">再試一題</button><a class="text-link" href="#dashboard">查看驗收紀錄 →</a>':'<button type="submit" class="primary">交卷並查看解析</button>'}</div></form></section>`;
  if(!t.result)$('#transferForm').addEventListener('submit',e=>{e.preventDefault();try{const correct=C.transferAnswer(state,q,t.selected);t.result={items:[{questionId:q.id,selected:t.selected,correct}]};save();syncStats();transferView(skill);}catch(err){$('#transferError').textContent=err.message;}});
}
function dashboard(){
  const done=C.completedDays(state),accuracy=C.firstAccuracy(state),suggestion=C.recommendation(state);
  const learned=Object.values(state.wordProgress).filter(w=>w.stage>0).length;
  const skillData={};Object.values(state.completions).forEach(c=>c.first.items.forEach(i=>{skillData[i.skill]||={total:0,right:0};skillData[i.skill].total++;if(i.correct)skillData[i.skill].right++;}));
  const recent=Array.from({length:7},(_,i)=>C.addDays(C.dateKey(),i-6));
  const minutes=state.attempts.reduce((n,a)=>n+a.seconds,0)/60;
  main.innerHTML=`<div class="page-heading"><div><div class="eyebrow">YOUR LEARNING JOURNEY</div><h1>每一小步，都看得見。</h1><p>看自己的進步，也找出下一次可以加強的地方。</p></div><span class="chip">學習紀錄</span></div>
  <div class="metrics"><section class="panel metric"><div class="metric-label">完成關卡</div><strong>${done.length}<span class="small"> / ${lessons.length}</span></strong><p>包含已保留的 V1 進度</p></section><section class="panel metric"><div class="metric-label">首次作答正確率</div><strong>${accuracy===null?'—':accuracy+'%'}</strong><p>${accuracy===null?'完成第一關後開始記錄':'重做不會改寫首次表現'}</p></section><section class="panel metric"><div class="metric-label">已記得的單字</div><strong>${learned}</strong><p>依單字卡的自評紀錄</p></section><section class="panel metric"><div class="metric-label">連續學習</div><strong>${C.streak(state)}<span class="small"> 天</span></strong><p>閱讀交卷與複習都計入</p></section></div>
  <div class="dashboard-grid"><section class="panel"><h2>七天學習足跡</h2><p class="muted small">每天完成一次有效練習，就留下一格足跡。</p><div class="bars" role="img" aria-label="最近七天：${recent.map(d=>`${d} ${state.activityDates.includes(d)?'已學習':'未學習'}`).join('；')}">${recent.map(d=>{const yes=state.activityDates.includes(d);return `<div class="bar-column"><strong>${yes?'✓':'—'}</strong><div class="bar-track"><div class="bar-fill" style="height:${yes?100:0}%"></div></div><small>${Number(d.slice(5,7))}/${Number(d.slice(8))}</small></div>`;}).join('')}</div><p class="difficulty-note">累積作答用時 ${minutes.toFixed(1)} 分鐘（從進入文章到交卷，單次最多計 30 分鐘）。</p></section>
  <section class="panel"><h2>閱讀能力觀察</h2>${Object.keys(skillData).length?Object.entries(skillData).map(([name,v])=>`<div class="skill-row"><div><span>${esc(name)}</span><span>${v.right} / ${v.total}</span></div><div class="progress"><i style="width:${v.right/v.total*100}%"></i></div></div>`).join(''):'<p class="muted small">完成閱讀題後，這裡會顯示細節理解、推論與字義等題型的表現。</p>'}<p class="difficulty-note">僅統計本站首次作答，不代表正式會考能力量尺。</p></section></div>
  <section class="panel" style="margin-top:24px"><div class="section-heading" style="margin-top:0"><h2>關卡成績</h2><span class="muted small">首答與最佳分數分開保留</span></div><div class="table-wrap"><table><thead><tr><th>關卡</th><th>首次</th><th>最佳</th><th>難度</th><th>解析</th></tr></thead><tbody>${lessons.map(l=>{const c=state.completions[l.day];return `<tr><td><b>Day ${l.day}</b> <span lang="en">${esc(l.title)}</span></td><td>${c?`${c.first.score}/${c.first.total}`:done.includes(l.day)?'V1 未記錄':'—'}</td><td>${c?c.best+'%':'—'}</td><td>${c?tiers[c.last.tier]:'—'}</td><td>${c?`<a class="text-link" href="#result/${l.day}">上次解析</a>`:'—'}</td></tr>`;}).join('')}</tbody></table></div></section>
  <section class="panel" style="margin-top:24px"><h2>錯題回顧與新題驗收</h2><p>今日到期 ${C.reviewQueue(state).length} 題 · 間隔複習完成 ${Object.values(state.wrong).filter(w=>w.stage===5).length} 題</p><p>新題首次答對 ${Object.values(state.transfer).filter(t=>t.first).length} / ${Object.keys(state.transfer).length} 題；重做保留首次結果。</p><div class="review-choice">${['細節理解','推論判讀','字義推測','主旨統整','資訊整合'].map(skill=>{const entries=Object.values(state.transfer).filter(t=>t.skill===skill);return `<a class="text-link" href="#transfer/${encodeURIComponent(skill)}">${skill} ${entries.filter(t=>t.first).length}/${entries.length} →</a>`;}).join('')}</div><p class="difficulty-note">少量練習只用來找下一個練習方向，不推估會考等級。</p></section>
  <section class="panel" style="margin-top:24px"><h2>下一步怎麼練？</h2><p class="small">目前建議：<b>${tiers[suggestion]}</b>。${suggestion===1?'先穩定完成核心題，練習用文章證據回答。':suggestion===2?'核心題已漸漸穩定，可以增加一題推論挑戰。':'試試跨句整合與綜合挑戰，並繼續複習失分題。'}</p><div class="settings-row"><label for="defaultTier">預設練習難度</label><select id="defaultTier">${[1,2,3].map(t=>`<option value="${t}" ${state.difficulty===t?'selected':''}>${tiers[t]}</option>`).join('')}</select><button data-action="use-suggestion">使用建議難度</button></div><p class="difficulty-note">完成 3 關且首次總正確率 ≥80%，建議進階；完成 5 關且 ≥90%，建議挑戰。也可自行選擇。分級只調整本站題目，不推估會考級分。</p></section>
  <section class="panel" style="margin-top:24px"><h2>保存你的冒險</h2><p class="muted small">目前沒有登入帳號；這個網站把作答、錯題與 EXP 保存在你目前使用的瀏覽器，沒有上傳學習紀錄，也不會讀取你的 ChatGPT 個人資料。共用同一個瀏覽器的人會共用進度；換手機或瀏覽器不會自動同步。換裝置、換網址或清除瀏覽資料前，先匯出備份，再到新裝置匯入。</p><div class="data-actions"><button data-action="export">匯出學習備份</button><button data-action="import">匯入學習備份</button><input id="importFile" type="file" accept="application/json,.json" hidden></div><p class="difficulty-note">目前收錄 ${lessons.length} 篇。每日補給排程為台灣時間 20:00；最新補給日期：${esc(lessonMeta.lastPublishDate || "尚無每日補給")}。新關卡仍依你的學習起始日解鎖。${state.legacyDone.length?' V1 的 EXP 與完成關卡已保留；V1 沒有記錄日期與逐題答案，因此無法還原舊連續天數和錯題。':''}</p></section>`;
  $('#importFile').addEventListener('change',importBackup);
}
async function importBackup(e){
  const file=e.target.files[0];if(!file)return;
  try{if(file.size>2e6)throw new Error('備份檔過大，請選擇本站匯出的 JSON 檔。');const raw=JSON.parse(await file.text());const incoming=C.validateState(raw.state||raw,lessons);if(!window.confirm('匯入會取代這個瀏覽器目前的 V2 進度。確定使用這份備份嗎？'))return;state=incoming;blocked=false;storageMessage='';save();active=null;wordSession=null;wrongSession=null;transferSession=null;syncStats();dashboard();toast('備份已匯入。');}catch(err){toast('無法匯入：'+err.message);}finally{e.target.value='';}
}
function exportBackup(){const blob=new Blob([JSON.stringify({app:'JHSEE-English-Adventure',exportedAt:new Date().toISOString(),state},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`JHSEE-progress-${C.dateKey()}.json`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('已產生學習備份，請保存下載的 JSON 檔。');}
function route(){
  stopSpeech();ExamPage.leave();const [view,id,examMode,examAttempt]=(location.hash.slice(1)||'home').split('/');
  setNav(['lesson','result'].includes(view)?'home':view==='exam'?'exams':view);syncStats();
  if(!['lesson','result'].includes(view)){active=null;quizResult=null;}
  if(view!=='transfer')transferSession=null;if(view!=='words')wordSession=null;if(view!=='mistakes')wrongSession=null;
  if(view==='exams'||view==='exam')ExamPage.render(main,Number(id),examMode,examAttempt?decodeURIComponent(examAttempt):undefined);
  else if(view==='lesson'||view==='result')lessonView(Number(id),view==='result');
  else if(view==='transfer')transferView(decodeURIComponent(id||'細節理解'));else if(view==='words')wordsView();else if(view==='mistakes')mistakesView();else if(view==='dashboard')dashboard();else home();
  window.scrollTo({top:0,behavior:'instant'});main.focus({preventScroll:true});
}
main.addEventListener('change',e=>{
  const t=e.target;
  if(t.matches('#quizForm input[type=radio]')&&!quizResult){currentAnswers[t.name]=Number(t.value);state.drafts[`${active.day}:${active.tier}`]={...currentAnswers};save();$('#answerCount').textContent=C.questions(lessons.find(l=>l.day===active.day),active.tier).filter(q=>Number.isInteger(currentAnswers[q.id])).length;}
  if(t.matches('#wrongForm input[type=radio]')&&wrongSession)wrongSession.selected=Number(t.value);
  if(t.id==='reviewSkill'){reviewSkill=t.value;mistakesView(true);}
  if(t.matches('#transferForm input[type=radio]')&&transferSession)transferSession.selected=Number(t.value);
  if(t.id==='lessonTier'){state.difficulty=Number(t.value);save();lessonView(active.day,false,true);toast(`已切換為 ${tiers[active.tier]} · ${C.questions(lessons.find(l=>l.day===active.day),active.tier).length} 題；文章相同，請往下看題目。`);}
  if(t.id==='speechRate')changeReadingRate(Number(t.value));
  if(t.id==='chapterSelect'){selectedChapter=Number(t.value);home();}
  if(t.id==='defaultTier'){state.difficulty=Number(t.value);save();toast('已更新預設練習難度。');}
});
main.addEventListener('click',e=>{
  const button=e.target.closest('[data-action]');if(!button)return;const action=button.dataset.action;
  if(action==='speak-story')say(lessons.find(l=>l.day===active.day).story,readingRate,'story');
  else if(action==='stop-speech')stopSpeech();
  else if(action==='retry'){const day=active.day;delete state.drafts[day+':'+active.tier];save();if(location.hash.startsWith('#result/'))location.hash='lesson/'+day;else{lessonView(day,false,true);$('#quizForm').scrollIntoView({behavior:'smooth'});}}
  else if(action==='words-due')wordsView(true,false);else if(action==='words-all')wordsView(true,true);
  else if(action==='flip'){wordSession.flipped=true;wordsView();}
  else if(action==='speak-word')say(wordSession.queue[wordSession.index].word);
  else if(action==='word-known'||action==='word-again'){if(!wordSession.flipped)return;const known=action==='word-known';C.reviewWord(state,wordSession.queue[wordSession.index].key,known);known?wordSession.known++:wordSession.again++;wordSession.index++;wordSession.flipped=false;save();syncStats();wordsView();}
  else if(action==='wrong-next'){wrongSession.index++;wrongSession.result=null;wrongSession.selected=null;mistakesView();}
  else if(action==='review-due'||action==='review-all'){reviewMode=action==='review-all'?'all':'due';mistakesView(true);}
  else if(action==='transfer-next')transferView(transferSession.skill,true);
  else if(action==='wrong-restart')mistakesView(true);
  else if(action==='use-suggestion'){state.difficulty=C.recommendation(state);save();dashboard();toast('已套用建議難度。');}
  else if(action==='export')exportBackup();else if(action==='import')$('#importFile').click();
});
window.addEventListener('hashchange',route);
window.addEventListener('pagehide',stopSpeech);
window.addEventListener('storage',e=>{if(e.key===KEY&&e.newValue){try{state=C.validateState(JSON.parse(e.newValue),lessons);active=null;wordSession=null;wrongSession=null;transferSession=null;route();toast('已更新另一個分頁的進度。');}catch{toast('另一個分頁的進度無法讀取，請先匯出目前紀錄。');}}});
function refreshDate(){const day=C.dateKey(),open=lessons.filter(l=>C.isUnlocked(state,l.day)).length;if(day!==lastCalendarDay||open!==lastUnlocked){lastCalendarDay=day;lastUnlocked=open;syncStats();if(!location.hash||location.hash==='#home')home();}}
window.addEventListener('focus',refreshDate);setInterval(refreshDate,30000);
save();route();lastUnlocked=lessons.filter(l=>C.isUnlocked(state,l.day)).length;
if(migrated)toast('已保留 V1 的 EXP 與完成關卡，新的每日紀錄從今天開始。');

// Check for new content without interrupting an unfinished quiz.
let contentCheckInFlight = false;
async function checkContentUpdate(manual=false){
  if(location.protocol === 'file:' || contentCheckInFlight || document.visibilityState === 'hidden') return;
  contentCheckInFlight = true;
  try {
    const response = await fetch('catalog.json', {cache:'no-store'});
    if(!response.ok) throw new Error('無法取得更新資訊');
    const remote = await response.json();
    if(typeof remote.revision!=='string'||typeof remote.version!=='string')throw new Error('更新資訊格式無效');
    if(manual) $('#updateStatus').textContent=`V${lessonMeta.version} · ${lessons.length} 篇 · 最新補給 ${lessonMeta.lastPublishDate||'第一週'} · 已檢查 `+new Intl.DateTimeFormat('zh-TW',{timeZone:'Asia/Taipei',hour:'2-digit',minute:'2-digit'}).format(new Date());
    if(typeof remote.revision === 'string' && (remote.revision !== lessonMeta.revision || remote.version !== lessonMeta.version)) {$('#contentUpdate').hidden = false;if(manual)toast('已有更新，點「更新冒險地圖」載入。');}
    else if(manual)toast('目前已是最新版本。');
  } catch {if(manual){$('#updateStatus').textContent='檢查失敗，請稍後重試';toast('目前無法連線檢查更新，已保存的進度不受影響。');}} finally {contentCheckInFlight = false;}
}
$('#refreshLessons').addEventListener('click',()=>{save();location.reload();});
$('#checkUpdates').addEventListener('click',()=>checkContentUpdate(true));
$('#updateStatus').textContent=`已收錄 ${lessons.length} 篇 · 最新補給 ${lessonMeta.lastPublishDate||'第一週'} · V${lessonMeta.version}`;
window.addEventListener('focus',()=>checkContentUpdate());
setInterval(checkContentUpdate,300000);
checkContentUpdate();

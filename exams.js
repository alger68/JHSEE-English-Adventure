(function(root){
  'use strict';
  const E=root.ExamCore, catalog=officialExams, KEY='jhseeOfficialExamsV1';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let state=null,storageError='',blocked=false,host=null,selectedYear=catalog[0].year,screen=null,ticker=null;
  const find=year=>catalog.find(e=>e.year===Number(year));
  const link=(url,label)=>`<a class="text-link" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${label} ↗</a>`;
  const formatTime=s=>`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
  function load(){
    if(state)return;
    try{const raw=localStorage.getItem(KEY);state=raw?E.validateState(JSON.parse(raw),catalog):E.fresh();}
    catch{state=E.fresh();blocked=true;storageError='無法讀取原有歷屆紀錄，原始資料仍保留。本次可練習，離開前請匯出歷屆紀錄。';}
  }
  function save(){
    if(blocked)return false;
    try{localStorage.setItem(KEY,JSON.stringify(state));storageError='';return true;}
    catch{storageError='瀏覽器無法保存歷屆紀錄；離開前請匯出歷屆紀錄。';return false;}
  }
  function warning(){return `<p class="error-text" id="examStorage" role="status">${esc(storageError)}</p>`;}
  function updateStorage(){const node=host?.querySelector('#examStorage');if(node)node.textContent=storageError;}
  function source(exam){return `<p class="difficulty-note">題本與答案由國中教育會考官方提供。${link(exam.officialIndex,'查核官方來源')} · 資料核對 ${exam.checkedAt}</p>`;}
  function paper(exam){
    const id=new URL(exam.paperUrl).pathname.split('/')[3];
    return `<section class="panel exam-paper"><div class="section-heading"><h2>官方原題本</h2>${link(exam.paperUrl,'另開／下載題本')}</div><p class="muted small">保留原題的圖片、表格與排版。手機若未顯示題本，請另開題本閱讀，再回此頁填答案。</p><iframe class="exam-pdf" src="https://drive.google.com/file/d/${esc(id)}/preview" title="${esc(exam.title)}官方題本" loading="lazy" referrerpolicy="no-referrer"></iframe>${source(exam)}</section>`;
  }
  function overview(){
    screen={mode:'overview'};const exam=find(selectedYear)||catalog[0];selectedYear=exam.year;
    const draft=state.drafts[exam.id],attempts=state.attempts.filter(a=>a.examId===exam.id),last=attempts.at(-1);
    host.innerHTML=`<div class="page-heading"><div><div class="eyebrow">OFFICIAL PAST PAPERS</div><h1>官方歷屆試題</h1><p>選一年，決定今天要測驗，還是輕鬆看題目。</p></div><span class="chip">英語閱讀 · ${catalog.length} 年</span></div>
    <section class="panel exam-picker"><div class="settings-row"><label for="examYear">選擇年份</label><select id="examYear">${catalog.map(e=>`<option value="${e.year}" ${e.year===selectedYear?'selected':''}>${e.year} 年（${e.adYear}）</option>`).join('')}</select><span class="chip">${exam.questionCount} 題 · 參考時間 ${exam.durationMinutes} 分鐘</span></div><h2>${esc(exam.title)}</h2>${exam.note?`<p class="exam-note">${esc(exam.note)}</p>`:''}
    <div class="exam-mode-grid"><section><span class="eyebrow">TAKE A TEST</span><h3>我要測驗</h3><p>看官方题本，在本站答案卡選 A、B、C、D。交卷後才揭曉答案與對錯，並保存這次成績。</p><button class="primary" data-exam-action="start" data-year="${exam.year}">${draft?'繼續未完成測驗':'開始測驗'} →</button>${draft?'<p class="small muted">未交卷的答案已保留。</p>':''}</section><section><span class="eyebrow">JUST EXPLORE</span><h3>只看題本，不測驗</h3><p>自由閱讀官方題目，可自行展開答案。不計時、不計分，也不新增測驗紀錄。</p><a class="primary-link exam-secondary" href="#exam/${exam.year}/browse">只看題本 →</a></section></div>
    ${last?`<p class="small">本年份已測驗 ${attempts.length} 次 · 最近一次 ${last.score} / ${last.total} 題。<a class="text-link" href="#exam/${exam.year}/result/${encodeURIComponent(last.attemptId)}">查看上次結果 →</a></p>`:''}${source(exam)}</section>
    <section class="panel exam-history"><div class="section-heading"><h2>我的歷屆測驗紀錄</h2><span class="small muted">只保存於目前瀏覽器</span></div>${state.attempts.length?`<div class="table-wrap"><table><thead><tr><th>試卷</th><th>交卷時間</th><th>得分題數</th><th>用時</th><th>檢討</th></tr></thead><tbody>${state.attempts.slice().reverse().map(a=>{const e=catalog.find(e=>e.id===a.examId);return `<tr><td>${e.year} 年英語閱讀</td><td>${new Intl.DateTimeFormat('zh-TW',{timeZone:'Asia/Taipei',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(a.submittedAt))}</td><td>${a.score} / ${a.total}</td><td>${formatTime(a.seconds)}</td><td><a class="text-link" href="#exam/${e.year}/result/${encodeURIComponent(a.attemptId)}">查看</a></td></tr>`;}).join('')}</tbody></table></div>`:'<p class="muted">還沒有交卷紀錄。只看題本不會出現在這裡。</p>'}
    <div class="data-actions"><button data-exam-action="export">匯出歷屆紀錄</button><button data-exam-action="import">匯入歷屆紀錄</button><input type="file" id="examImport" accept="application/json,.json" hidden></div>${warning()}<p class="difficulty-note">歷屆測驗紀錄與每日冒險分開保存，不影響 EXP、連續天數或每日關卡解鎖。最多保留最近 200 次測驗；換裝置前請匯出。此處記錄閱讀表現，不換算會考整體 A／B／C 等級。</p></section>`;
  }
  function heading(exam,mode){return `<a class="back-link" href="#exams">← 返回歷屆試題</a><div class="lesson-header"><div><span class="chip">官方真題 · ${mode==='browse'?'自由瀏覽':mode==='result'?'測驗結果':'自主測驗'}</span><h1>${esc(exam.title)}</h1><p>${exam.questionCount} 題 · ${mode==='browse'?'不計時、不計分':`參考時間 ${exam.durationMinutes} 分鐘`}</p></div></div>${exam.note?`<p class="exam-note">${esc(exam.note)}</p>`:''}`;}
  function answerTable(exam,result){return `<div class="table-wrap"><table class="exam-result-table"><thead><tr><th>題號</th>${result?'<th>你的答案</th>':''}<th>官方答案</th>${result?'<th>結果</th>':''}</tr></thead><tbody>${Array.from(exam.answers,(answer,i)=>{const item=result?.items[i],credit=exam.creditAll.includes(i+1);return `<tr class="${item&&!item.correct&&!credit?'exam-miss':''}"><td>${i+1}</td>${item?`<td>${item.selected||'未作答'}</td>`:''}<td>${answer}</td>${item?`<td>${credit?'依公告給分':item.correct?'✓ 答對':'需複習'}</td>`:''}</tr>`;}).join('')}</tbody></table></div>`;}
  function browse(exam){
    screen={mode:'browse',exam};
    host.innerHTML=heading(exam,'browse')+paper(exam)+`<section class="panel exam-review"><h2>自由檢討</h2><p>只看題本不會新增成績。需要對答案時再展開。</p><details><summary>查看官方答案</summary>${answerTable(exam)}<p>${link(exam.answerUrl,'開啟官方答案表')}</p></details><div class="quiz-actions"><button class="primary" data-exam-action="start" data-year="${exam.year}">改為測驗</button><a class="text-link" href="#exams">返回選年份</a></div></section>`;
  }
  function test(exam){
    const draft=state.drafts[exam.id];
    if(!draft){overview();return;}
    screen={mode:'test',exam,draft};
    host.innerHTML=heading(exam,'test')+`<div class="exam-workspace">${paper(exam)}<section class="panel exam-card"><h2>我的答案卡</h2><div class="exam-status"><span>已作答 <b id="examAnswered">${Object.keys(draft.answers).length}</b> / ${exam.questionCount}</span><span>用時 <b id="examTimer">0:00</b></span></div><p class="small muted" id="examTimeNote">離開或重新整理仍會繼續計時；60 分鐘時提醒，不自動交卷。</p><p class="small">答案會自動保存，交卷前不顯示正解。</p><form id="officialExamForm"><div class="exam-answer-grid">${Array.from({length:exam.questionCount},(_,i)=>{const n=i+1;return `<fieldset class="exam-answer"><legend>第 ${n} 題${exam.creditAll.includes(n)?' · 一律給分':''}</legend><div>${['A','B','C','D'].map(a=>`<label><input type="radio" name="exam-q${n}" value="${a}" ${draft.answers[n]===a?'checked':''}><span>${a}</span></label>`).join('')}<button type="button" class="exam-clear" data-exam-action="clear" data-number="${n}" aria-label="清除第 ${n} 題答案">清除</button></div></fieldset>`;}).join('')}</div><p id="examSubmitHint" class="error-text" role="status"></p><button type="submit" class="primary">交卷，查看結果</button></form><div class="quiz-actions"><a class="text-link" href="#exams">暫時離開，保留答案</a><button data-exam-action="restart" data-year="${exam.year}">重新作答</button></div>${warning()}</section></div>`;
    updateTimer();ticker=setInterval(updateTimer,1000);
  }
  function updateTimer(){
    if(screen?.mode!=='test')return;
    const seconds=Math.max(0,Math.floor((Date.now()-screen.draft.startedAt)/1000)),node=host.querySelector('#examTimer');if(node)node.textContent=formatTime(seconds);
    if(seconds>=screen.exam.durationMinutes*60){const note=host.querySelector('#examTimeNote');if(note)note.textContent='已達參考時間 60 分鐘；你可以交卷，或繼續完成練習。';}
  }
  function result(exam,id){
    const attempt=state.attempts.find(a=>a.attemptId===id&&a.examId===exam.id);
    if(!attempt){overview();return;}
    const g=E.grade(exam,attempt.answers);screen={mode:'result',exam,attempt};
    host.innerHTML=heading(exam,'result')+`<section class="panel"><div class="result-banner"><div class="result-score">${g.score}<span class="small"> / ${g.total} 題</span></div><div><h2>測驗已交卷</h2><p>得分比例 ${g.percent}% · 用時 ${formatTime(attempt.seconds)} · ${g.wrong.length} 題需複習</p><p class="small">${exam.creditAll.length?'得分包含官方公告的一律給分題。':'依官方答案逐題核對。'} 本結果不換算會考整體等級。</p></div></div>${warning()}<p>${g.wrong.length?`需複習的題號：${g.wrong.join('、')}`:'本次所有題目均得分。'}</p><div class="quiz-actions"><button class="primary" data-exam-action="restart" data-year="${exam.year}">再測一次</button><a class="text-link" href="#exam/${exam.year}/browse">只看題本</a>${link(exam.answerUrl,'官方答案表')}</div>${answerTable(exam,g)}</section><div class="exam-review">${paper(exam)}</div>`;
  }
  function leave(){clearInterval(ticker);ticker=null;screen=null;}
  function render(element,year,mode,id){
    leave();load();host=element;const exam=find(year);if(exam)selectedYear=exam.year;
    if(!exam||!['browse','test','result'].includes(mode)){overview();return;}
    if(mode==='browse')browse(exam);else if(mode==='result')result(exam,id);else test(exam);
  }
  function startExam(exam,restart=false){
    if(restart&&state.drafts[exam.id]&&!confirm('重新作答會清除這份試卷尚未交卷的答案，已交卷成績會保留。確定重新開始？'))return;
    if(!state.drafts[exam.id]||restart){E.start(state,exam);save();}
    const hash=`#exam/${exam.year}/test`;if(location.hash===hash){leave();test(exam);}else location.hash=hash;
  }
  function exportState(){
    const blob=new Blob([JSON.stringify({app:'JHSEE-Official-Exams',exportedAt:new Date().toISOString(),state},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='JHSEE-official-exams.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  const main=document.querySelector('#main');
  main.addEventListener('click',event=>{
    if(!screen)return;const button=event.target.closest('[data-exam-action]');if(!button)return;
    const action=button.dataset.examAction,exam=find(button.dataset.year);
    if(action==='start'&&exam)startExam(exam);else if(action==='restart'&&exam)startExam(exam,true);
    else if(action==='clear'&&screen.mode==='test'){
      const n=Number(button.dataset.number);delete screen.draft.answers[n];main.querySelectorAll(`input[name="exam-q${n}"]`).forEach(i=>i.checked=false);save();main.querySelector('#examAnswered').textContent=Object.keys(screen.draft.answers).length;updateStorage();
    }else if(action==='export')exportState();else if(action==='import')main.querySelector('#examImport').click();
  });
  main.addEventListener('change',async event=>{
    if(!screen)return;const target=event.target;
    if(target.id==='examYear'){selectedYear=Number(target.value);overview();}
    if(screen.mode==='test'&&target.matches('#officialExamForm input[type="radio"]')){const n=Number(target.name.slice(6));screen.draft.answers[n]=target.value;save();main.querySelector('#examAnswered').textContent=Object.keys(screen.draft.answers).length;main.querySelector('#examSubmitHint').textContent='';updateStorage();}
    if(target.id==='examImport'){
      const file=target.files[0];if(!file)return;
      try{if(file.size>2e6)throw Error('檔案太大。');const parsed=JSON.parse(await file.text()),incoming=E.validateState(parsed.state||parsed,catalog);if(!confirm('匯入會取代這個瀏覽器的歷屆測驗紀錄，確定匯入？'))return;state=incoming;blocked=false;save();overview();}
      catch(error){storageError='無法匯入：'+error.message;updateStorage();}finally{target.value='';}
    }
  });
  main.addEventListener('submit',event=>{
    if(event.target.id!=='officialExamForm'||screen?.mode!=='test')return;event.preventDefault();
    try{
      const {exam,draft}=screen,g=E.grade(exam,draft.answers);
      if(g.unanswered&&!confirm(`還有 ${g.unanswered} 題未作答，交卷後這些題目不給分。仍要交卷？`))return;
      const attempt=E.submit(state,exam,draft);save();location.hash=`#exam/${exam.year}/result/${encodeURIComponent(attempt.attemptId)}`;
    }catch(error){main.querySelector('#examSubmitHint').textContent=error.message;}
  });
  window.addEventListener('storage',event=>{
    if(event.key!==KEY||!state)return;
    try{state=event.newValue?E.validateState(JSON.parse(event.newValue),catalog):E.fresh();if(screen){const {exam,mode,attempt}=screen;render(host,exam?.year,mode,attempt?.attemptId);}}
    catch{storageError='另一個分頁的歷屆紀錄無法讀取，請先匯出目前紀錄。';updateStorage();}
  });
  root.ExamPage={render,leave};
})(window);

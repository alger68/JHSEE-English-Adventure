(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ExamCore=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const fresh=()=>({version:1,drafts:{},attempts:[]});
  const validTime=n=>Number.isFinite(n)&&n>=0;
  function cleanAnswers(exam,answers){
    if(!answers||typeof answers!=='object'||Array.isArray(answers))throw Error('歷屆作答資料格式錯誤。');
    const clean={};
    for(let n=1;n<=exam.questionCount;n++){
      const a=answers[n];if(a===undefined||a===null||a==='')continue;
      if(!/^[A-D]$/.test(a))throw Error(`第 ${n} 題的答案格式錯誤。`);
      clean[n]=a;
    }
    return clean;
  }
  function grade(exam,answers){
    const selected=cleanAnswers(exam,answers);
    const items=Array.from(exam.answers,(answer,i)=>({number:i+1,answer,selected:selected[i+1]||null,creditAll:exam.creditAll.includes(i+1),correct:selected[i+1]===answer}));
    const score=items.filter(i=>i.correct||i.creditAll).length;
    return {score,total:items.length,percent:Math.round(score/items.length*100),unanswered:items.filter(i=>!i.selected&&!i.creditAll).length,wrong:items.filter(i=>!i.correct&&!i.creditAll).map(i=>i.number),items};
  }
  function start(state,exam,now=Date.now()){
    if(!validTime(now))throw Error('開始時間無效。');
    const draft={attemptId:`${exam.id}:${now}:${Math.random().toString(36).slice(2,10)}`,examId:exam.id,startedAt:now,answers:{}};
    state.drafts[exam.id]=draft;return draft;
  }
  function submit(state,exam,draft,now=Date.now()){
    const existing=state.attempts.find(a=>a.attemptId===draft.attemptId);if(existing)return existing;
    if(draft.examId!==exam.id||state.drafts[exam.id]?.attemptId!==draft.attemptId)throw Error('這份測驗已在其他分頁變更，請返回歷屆試題後繼續。');
    if(!validTime(now)||now<draft.startedAt)throw Error('裝置時間早於測驗開始時間，請確認裝置時鐘。');
    const answers=cleanAnswers(exam,draft.answers),result=grade(exam,answers);
    const attempt={attemptId:draft.attemptId,examId:exam.id,startedAt:draft.startedAt,submittedAt:now,seconds:Math.floor((now-draft.startedAt)/1000),answers,score:result.score,total:result.total};
    state.attempts.push(attempt);state.attempts=state.attempts.slice(-200);delete state.drafts[exam.id];return attempt;
  }
  function validateState(raw,exams){
    if(!raw||raw.version!==1||!raw.drafts||typeof raw.drafts!=='object'||!Array.isArray(raw.attempts)||raw.attempts.length>200)throw Error('這不是有效的歷屆測驗備份。');
    const out=fresh(),byId=new Map(exams.map(e=>[e.id,e])),ids=new Set();
    function clean(record,exam){
      if(!record||record.examId!==exam.id||typeof record.attemptId!=='string'||record.attemptId.length>150||!validTime(record.startedAt)||ids.has(record.attemptId))throw Error('歷屆測驗紀錄無效。');
      ids.add(record.attemptId);return {attemptId:record.attemptId,examId:exam.id,startedAt:record.startedAt,answers:cleanAnswers(exam,record.answers)};
    }
    for(const a of raw.attempts){
      const exam=byId.get(a.examId);if(!exam)throw Error('備份包含目前未收錄的歷屆試題。');
      const c=clean(a,exam);if(!validTime(a.submittedAt)||a.submittedAt<c.startedAt)throw Error('歷屆測驗交卷時間無效。');
      const g=grade(exam,c.answers);out.attempts.push({...c,submittedAt:a.submittedAt,seconds:Math.floor((a.submittedAt-c.startedAt)/1000),score:g.score,total:g.total});
    }
    for(const [id,d] of Object.entries(raw.drafts)){
      const exam=byId.get(id);if(!exam)throw Error('備份包含目前未收錄的歷屆試題。');out.drafts[id]=clean(d,exam);
    }
    return out;
  }
  return {fresh,cleanAnswers,grade,start,submit,validateState};
});

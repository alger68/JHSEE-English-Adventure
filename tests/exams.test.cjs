const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const E=require('../exam-core.js');
const exams=JSON.parse(fs.readFileSync(require.resolve('../content/official-exams.json'),'utf8')).exams;
const exam=exams.find(e=>e.year===115);

test('official catalog retains five complete answer keys and Q43 column boundaries',()=>{
  assert.deepEqual(exams.map(e=>e.year),[115,114,113,112,111]);
  const edgeAnswers={115:['B','C'],114:['D','A'],113:['A','D'],112:['B','A'],111:['A','A']};
  for(const e of exams){assert.equal(e.answers.length,43);assert.match(e.answers,/^[ABCD]{43}$/);assert.deepEqual([e.answers[0],e.answers[42]],edgeAnswers[e.year]);}
});
test('112 Q1 receives official full credit even when blank or answered differently',()=>{
  const e=exams.find(e=>e.year===112);
  const blank=E.grade(e,{});assert.equal(blank.score,1);assert.equal(blank.unanswered,42);assert.equal(blank.wrong.includes(1),false);
  assert.equal(E.grade(e,{1:'D'}).score,1);
  assert.equal(E.grade(exam,{}).score,0);
});
test('grades ordinary wrong and blank answers without negative marks',()=>{
  const result=E.grade(exam,{1:'B',2:'D',3:'B'});
  assert.equal(result.score,2);assert.equal(result.total,43);assert.equal(result.unanswered,40);assert.equal(result.wrong.includes(2),true);
  assert.throws(()=>E.grade(exam,{1:'E'}));
});
test('drafts survive reload and submit only once, without touching adventure state',()=>{
  const state=E.fresh(),d=E.start(state,exam,1000);d.answers={1:'B',43:'C'};
  const restored=E.validateState(JSON.parse(JSON.stringify(state)),exams);
  const a=E.submit(restored,exam,restored.drafts[exam.id],61000);
  assert.equal(a.score,2);assert.equal(a.seconds,60);assert.equal(restored.drafts[exam.id],undefined);
  assert.equal(E.submit(restored,exam,d,62000),a);assert.equal(restored.attempts.length,1);
  assert.equal('xp' in restored,false);assert.equal('activityDates' in restored,false);
});
test('stale draft cannot submit after restart and imported scores are recalculated',()=>{
  const state=E.fresh(),old=E.start(state,exam,1000);const current=E.start(state,exam,2000);
  assert.throws(()=>E.submit(state,exam,old,3000),/其他分頁/);
  E.submit(state,exam,current,4000);state.attempts[0].score=43;
  assert.equal(E.validateState(state,exams).attempts[0].score,0);
  state.attempts[0].submittedAt=0;assert.throws(()=>E.validateState(state,exams));
});
test('browse mode creates no attempt; test UI hides keys until submission',()=>{
  const listeners={},memory=new Map(),host={innerHTML:'',addEventListener:(name,fn)=>listeners[name]=fn,querySelector:()=>({textContent:''}),querySelectorAll:()=>[]};
  const win={ExamCore:E,addEventListener(){}};
  const context={window:win,officialExams:exams,document:{querySelector:()=>host},localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)},URL,Date,setInterval:()=>1,clearInterval(){},setTimeout(){},location:{hash:'#exams'},confirm:()=>true};
  vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../exams.js'),'utf8'),context);
  win.ExamPage.render(host,115,'browse');assert.equal(memory.size,0);assert.match(host.innerHTML,/不計時、不計分/);assert.match(host.innerHTML,/<details>/);
  listeners.click({target:{closest:()=>({dataset:{examAction:'start',year:'115'}})}});
  win.ExamPage.render(host,115,'test');assert.match(host.innerHTML,/officialExamForm/);assert.equal((host.innerHTML.match(/<fieldset/g)||[]).length,43);assert.equal(host.innerHTML.includes(exam.answerUrl),false);assert.equal(host.innerHTML.includes('exam-result-table'),false);
  const saved=JSON.parse(memory.get('jhseeOfficialExamsV1'));assert.equal(saved.attempts.length,0);assert.equal(Object.keys(saved.drafts).length,1);
  listeners.submit({target:{id:'officialExamForm'},preventDefault(){}});
  const submitted=JSON.parse(memory.get('jhseeOfficialExamsV1'));assert.equal(submitted.attempts.length,1);
  win.ExamPage.render(host,115,'result',submitted.attempts[0].attemptId);assert.match(host.innerHTML,/exam-result-table/);assert.equal(host.innerHTML.includes(exam.answerUrl),true);
});

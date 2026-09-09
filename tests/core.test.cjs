const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const C=require('../core.js');
const lessons=JSON.parse(fs.readFileSync(require('node:path').join(__dirname,'../content/week-01.json'),'utf8')).lessons;
const start=new Date('2026-09-09T11:00:00Z');
const perfect=(l,t=1)=>Object.fromEntries(C.questions(l,t).map(q=>[q.id,q.answer]));
test('Taipei dates and 20:00 release boundary, without locking past lessons',()=>{
 const s=C.fresh(start);assert.equal(s.startDate,'2026-09-09');assert.equal(C.dateKey('2026-09-09T16:00:00Z'),'2026-09-10');
 assert.ok(C.isUnlocked(s,1,start));assert.equal(C.isUnlocked(s,2,'2026-09-10T11:59:59Z'),false);assert.equal(C.isUnlocked(s,2,'2026-09-10T12:00:00Z'),true);assert.ok(C.isUnlocked(s,7,'2026-12-01T00:00:00Z'));
});
test('V1 migration retains actual XP and completion, without inventing dates',()=>{
 const s=C.migrate({xp:30,streak:8,done:[1,1]},start);assert.equal(s.xp,30);assert.deepEqual(s.legacyDone,[1]);assert.equal(C.streak(s,start),0);
 assert.equal(C.submit(s,lessons[0],perfect(lessons[0]),1,start).gain,0);assert.equal(s.xp,30);
});
test('Incomplete or locked submissions cannot mutate progress',()=>{
 const s=C.fresh(start),before=JSON.stringify(s);assert.throws(()=>C.submit(s,lessons[0],{},1,start));assert.equal(JSON.stringify(s),before);
 assert.throws(()=>C.submit(s,lessons[1],perfect(lessons[1]),1,start));assert.equal(JSON.stringify(s),before);
});
test('Retries do not farm EXP or change first accuracy; lesson retries keep scheduled mistakes',()=>{
 const s=C.fresh(start),l=lessons[0],a=perfect(l);a[l.questions[0].id]=0;
 const r=C.submit(s,l,a,1,start,600);assert.equal(r.score,3);assert.equal(r.total,4);assert.equal(r.gain,50);assert.equal(Object.keys(s.wrong).length,1);
 const repeat=C.submit(s,l,perfect(l,3),3,start,300);assert.equal(repeat.score,6);assert.equal(repeat.gain,0);assert.equal(s.xp,50);assert.equal(C.firstAccuracy(s),75);assert.equal(s.completions[1].best,100);assert.equal(Object.keys(s.wrong).length,1);assert.equal(C.streak(s,start),1);
});
test('Streak uses distinct local calendar days, survives yesterday, resets after a gap',()=>{
 const s=C.fresh();s.activityDates=['2026-12-30','2026-12-31','2027-01-01'];assert.equal(C.streak(s,'2027-01-01T08:00:00Z'),3);assert.equal(C.streak(s,'2027-01-02T08:00:00Z'),3);assert.equal(C.streak(s,'2027-01-03T08:00:00Z'),0);
});
test('Wrong-question review requires a selection and correct recall schedules the next review',()=>{
 const s=C.fresh(start),l=lessons[0],q=l.questions[0],a=perfect(l);a[q.id]=0;C.submit(s,l,a,1,start);
 assert.throws(()=>C.reviewQuestion(s,l,q.id,null,start));assert.equal(C.reviewQuestion(s,l,q.id,0,start),false);assert.equal(Object.keys(s.wrong).length,1);assert.equal(C.reviewQuestion(s,l,q.id,q.answer,start),true);assert.equal(Object.keys(s.wrong).length,1);
});
test('Vocabulary spacing promotes once per day, permits same-day recovery, and returns forgotten words',()=>{
 const s=C.fresh(start);assert.equal(C.vocabulary(lessons,s,start).length,5);
 C.reviewWord(s,'wallet',false,start);assert.equal(s.wordProgress.wallet.due,'2026-09-09');C.reviewWord(s,'wallet',true,start);assert.equal(s.wordProgress.wallet.stage,1);assert.equal(s.wordProgress.wallet.due,'2026-09-10');C.reviewWord(s,'wallet',true,start);assert.equal(s.wordProgress.wallet.stage,1);
 C.reviewWord(s,'wallet',true,'2026-09-10T08:00:00Z');assert.equal(s.wordProgress.wallet.stage,2);assert.equal(s.wordProgress.wallet.due,'2026-09-13');C.reviewWord(s,'wallet',false,'2026-09-10T08:00:00Z');assert.equal(s.wordProgress.wallet.stage,0);assert.equal(s.wordProgress.wallet.due,'2026-09-10');
});
test('A / A+ / A++ include distinct additional questions, and Boss has a larger core',()=>{
 assert.deepEqual([1,2,3].map(t=>C.questions(lessons[0],t).length),[4,5,6]);assert.deepEqual([1,2,3].map(t=>C.questions(lessons[5],t).length),[7,8,9]);
 const s=C.fresh(start);for(let i=0;i<5;i++)C.submit(s,lessons[i],perfect(lessons[i]),1,'2026-09-20T12:00:00Z');assert.equal(C.recommendation(s),3);
});
test('Backup round trip retains learning records and recomputes grades from valid answers',()=>{
 const s=C.fresh(start);C.submit(s,lessons[0],perfect(lessons[0]),1,start,300);C.reviewWord(s,'wallet',true,start);s.drafts['1:2']={'d1-q1':1};const restored=C.validateState(JSON.parse(JSON.stringify(s)),lessons);assert.deepEqual(restored,s);
 const tampered=JSON.parse(JSON.stringify(s));tampered.completions[1].first.score=0;assert.equal(C.validateState(tampered,lessons).completions[1].first.score,4);
});
test('Malformed backup data is rejected before it can replace active progress',()=>{
 const s=C.fresh(start);assert.throws(()=>C.validateState({...s,startDate:'2026-02-31'},lessons));assert.throws(()=>C.validateState({...s,wordProgress:{wallet:{stage:4,due:'tomorrow',last:'today'}}},lessons));assert.throws(()=>C.validateState({...s,wrong:{x:{day:999,questionId:'x'}}},lessons));
});

test('Legacy V2 mistakes gain a schedule and preserve scores and XP',()=>{
 const s=C.fresh(start),l=lessons[0],q=l.questions[0];
 s.wrong['1:'+q.id]={day:1,questionId:q.id,misses:3};delete s.transfer;
 const restored=C.validateState(s,lessons);assert.equal(restored.wrong['1:'+q.id].stage,0);assert.equal(restored.wrong['1:'+q.id].misses,3);assert.deepEqual(restored.transfer,{});
});
test('Spaced recall advances on due days only, through 1, 3, 7, 14 day gaps',()=>{
 const s=C.fresh(start),l=lessons[0],q=l.questions[0],a=perfect(l);a[q.id]=(q.answer+1)%4;C.submit(s,l,a,1,start);
 const key='1:'+q.id;
 C.reviewQuestion(s,l,q.id,q.answer,start);assert.equal(s.wrong[key].due,'2026-09-10');assert.equal(C.reviewQueue(s,start).length,0);
 C.reviewQuestion(s,l,q.id,q.answer,start);assert.equal(s.wrong[key].stage,1);
 C.reviewQuestion(s,l,q.id,q.answer,'2026-09-10T08:00:00Z');assert.equal(s.wrong[key].due,'2026-09-13');
 C.reviewQuestion(s,l,q.id,q.answer,'2026-09-11T08:00:00Z');assert.equal(s.wrong[key].stage,2);
 C.reviewQuestion(s,l,q.id,q.answer,'2026-09-13T08:00:00Z');assert.equal(s.wrong[key].due,'2026-09-20');
 C.reviewQuestion(s,l,q.id,q.answer,'2026-09-20T08:00:00Z');assert.equal(s.wrong[key].due,'2026-10-04');
 C.reviewQuestion(s,l,q.id,q.answer,'2026-10-04T08:00:00Z');assert.equal(s.wrong[key].stage,5);assert.equal(C.reviewQueue(s,'2026-11-01').length,0);assert.equal(C.reviewQueue(s,'2026-11-01',true).length,1);
 const copy=C.validateState(JSON.parse(JSON.stringify(s)),lessons);assert.deepEqual(copy,s);
 C.reviewQuestion(s,l,q.id,(q.answer+1)%4,'2026-11-01');assert.equal(s.wrong[key].stage,0);assert.equal(C.reviewQueue(s,'2026-11-01').length,1);
});
test('Original transfer items cover each skill, use exact evidence and preserve first results',()=>{
 const vm=require('node:vm'),ctx={};vm.createContext(ctx);vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../transfer-data.js'),'utf8')+';this.bank=transferQuestions;',ctx);
 const bank=ctx.bank;assert.equal(bank.length,10);assert.equal(new Set(bank.map(q=>q.id)).size,10);
 for(const skill of ['細節理解','推論判讀','字義推測','主旨統整','資訊整合'])assert.equal(bank.filter(q=>q.skill===skill).length,2);
 for(const q of bank){assert.ok(q.story.includes(q.evidence));assert.equal(q.options.length,4);assert.equal(q.reasons.length,4);assert.ok(q.answer>=0&&q.answer<4);}
 const s=C.fresh(start),q=bank[0],before=JSON.stringify(s);assert.throws(()=>C.transferAnswer(s,q,null,start));assert.equal(JSON.stringify(s),before);
 C.transferAnswer(s,q,(q.answer+1)%4,start);C.transferAnswer(s,q,q.answer,start);assert.equal(s.transfer[q.id].first,false);assert.equal(s.transfer[q.id].last,true);assert.equal(s.transfer[q.id].attempts,2);assert.equal(s.xp,0);assert.equal(s.attempts.length,0);
 assert.deepEqual(C.validateState(JSON.parse(JSON.stringify(s)),lessons),s);
});

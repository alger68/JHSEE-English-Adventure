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
test('Retries do not farm EXP or change first accuracy; correct answers clear mistakes',()=>{
 const s=C.fresh(start),l=lessons[0],a=perfect(l);a[l.questions[0].id]=0;
 const r=C.submit(s,l,a,1,start,600);assert.equal(r.score,3);assert.equal(r.total,4);assert.equal(r.gain,50);assert.equal(Object.keys(s.wrong).length,1);
 const repeat=C.submit(s,l,perfect(l,3),3,start,300);assert.equal(repeat.score,6);assert.equal(repeat.gain,0);assert.equal(s.xp,50);assert.equal(C.firstAccuracy(s),75);assert.equal(s.completions[1].best,100);assert.equal(Object.keys(s.wrong).length,0);assert.equal(C.streak(s,start),1);
});
test('Streak uses distinct local calendar days, survives yesterday, resets after a gap',()=>{
 const s=C.fresh();s.activityDates=['2026-12-30','2026-12-31','2027-01-01'];assert.equal(C.streak(s,'2027-01-01T08:00:00Z'),3);assert.equal(C.streak(s,'2027-01-02T08:00:00Z'),3);assert.equal(C.streak(s,'2027-01-03T08:00:00Z'),0);
});
test('Wrong-question review requires a selection and only correct recall removes the item',()=>{
 const s=C.fresh(start),l=lessons[0],q=l.questions[0],a=perfect(l);a[q.id]=0;C.submit(s,l,a,1,start);
 assert.throws(()=>C.reviewQuestion(s,l,q.id,null,start));assert.equal(C.reviewQuestion(s,l,q.id,0,start),false);assert.equal(Object.keys(s.wrong).length,1);assert.equal(C.reviewQuestion(s,l,q.id,q.answer,start),true);assert.equal(Object.keys(s.wrong).length,0);
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

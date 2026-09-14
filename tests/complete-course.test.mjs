import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {loadContent} from '../scripts/content.mjs';
import {prepareDailyTask} from '../scripts/prebuilt.mjs';
import {renderCourse} from '../scripts/export-course.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),require=createRequire(import.meta.url),C=require('../core.js');
const catalog=loadContent(root),all=catalog.lessons;
function stable(x){return Array.isArray(x)?x.map(stable):x&&typeof x==="object"?Object.fromEntries(Object.keys(x).sort().map(k=>[k,stable(x[k])])):x;}
const perfect=l=>Object.fromEntries(C.questions(l,3).map(q=>[q.id,q.answer]));
const answer=(day,index)=>{const q=all[day-1].questions[index-1];return q.options[q.answer];};
test('All 250 complete lessons and 1608 questions load; the first 35 stay unchanged',()=>{
 assert.equal(all.length,250);assert.equal(catalog.questionCount,1608);
 assert.deepEqual(all.map(l=>l.day),Array.from({length:250},(_,i)=>i+1));
 assert.equal(all.filter(l=>l.type==='每週 Boss').length,36);
 assert.equal(all.reduce((n,l)=>n+l.words.length,0),1250);
 assert.equal(all.reduce((n,l)=>n+l.phrases.length,0),500);
 assert.equal(crypto.createHash('sha256').update(JSON.stringify(stable(all.filter(l=>l.day<=35)))).digest('hex'),'08b93e17f0715f8aec16131562ed251ed21af8fd7a17bbdc59e873fa92c9f5ea');
});
test('Every new lesson retains exact quotes, usable vocabulary examples, unique IDs and its weekly type',()=>{
 const types=['校園故事','日常生活','對話／訊息','科普閱讀','公告／資訊閱讀','每週 Boss','單字與錯題復活'];
 const ids=new Set();
 for(const l of all.filter(l=>l.day>=36)){
  assert.equal(l.type,types[(l.day-13)%7]);
  for(const [i,q]of l.questions.entries()){
   assert.equal(q.id,'d'+l.day+'-q'+(i+1));assert(!ids.has(q.id));ids.add(q.id);
   assert(l.story.includes(q.evidence),q.id+' exact evidence');
  }
  for(const w of l.words){assert(l.story.includes(w.example));assert(w.example.toLowerCase().includes(w.word.toLowerCase()));}
  for(const p of l.phrases)assert(l.story.toLowerCase().includes(p.phrase.toLowerCase()));
 }
 assert.equal(ids.size,1383);
});
test('Day 250 works for a new learner and expansion preserves the old state and first results',()=>{
 const now=new Date('2026-09-14T04:00:00Z'),s=C.fresh(now),old=all[0],l=all[249];
 C.submit(s,old,perfect(old),3,now);C.reviewWord(s,'wallet',true,now);
 s.drafts['2:1']={[all[1].questions[0].id]:1};
 const before=JSON.parse(JSON.stringify(s));
 assert.deepEqual(C.validateState(JSON.parse(JSON.stringify(s)),all),C.validateState(JSON.parse(JSON.stringify(s)),all.slice(0,35)));
 const answers=perfect(l),q=l.questions[0];answers[q.id]=(q.answer+1)%4;
 assert.equal(C.isUnlocked(s,250,now),true);assert.equal(C.isUnlocked(s,251,now),false);
 const result=C.submit(s,l,answers,3,now);assert.equal(result.total,6);assert.equal(result.score,5);assert.equal(result.gain,70);
 assert.deepEqual(s.completions[1],before.completions[1]);assert.deepEqual(s.drafts,before.drafts);assert.deepEqual(s.wordProgress,before.wordProgress);
 assert.equal(C.submit(s,l,perfect(l),3,now).gain,0);assert.equal(s.completions[250].first.score,5);assert.equal(s.xp,before.xp+70);
 assert(s.wrong['250:'+q.id]);C.reviewQuestion(s,l,q.id,q.answer,now);
 assert.deepEqual(C.validateState(JSON.parse(JSON.stringify(s)),all),s);
});
test('Reminders reach all later prebuilt dates and become review-only after the course, never Day 251',()=>{
 for(const [date,day]of [['2026-09-09',8],['2026-09-14',13],['2026-10-07',36],['2027-05-08',249],['2027-05-09',250]]){
  const action=prepareDailyTask(root,date);
  assert.equal(action.action,'reuse-published');assert.equal(action.lesson.day,day);
  assert.equal(action.filename,undefined);assert.equal(action.data,undefined);
 }
 const after=prepareDailyTask(root,'2027-05-10');
 assert.equal(after.action,'review-only');assert.equal(after.courseComplete,true);assert.equal(after.lesson.day,1);
 assert.equal(after.filename,undefined);assert.equal(after.data,undefined);
 assert.throws(()=>prepareDailyTask(root,'2027-02-30'),/Invalid reminder date/);
});
test('Independent checks cover multi-select totals, elapsed time, marginal arrival and final counts',()=>{
 assert.equal(70-50,20);assert.equal(answer(214,8),'Twenty.');
 assert.equal(30-8-4,18);assert.equal(answer(200,2),'Eighteen.');
 assert.equal(13-3,10);assert.equal(answer(198,2),'Ten seconds.');
 assert.equal((21*60+10)-15-5,20*60+50);assert.equal(answer(228,8),'8:50.');
 assert.equal((9*60+30)+30+15,10*60+15);assert.equal(answer(242,5),'10:15.');
 assert.equal(answer(221,9),'None of the three.');
});
test('Complete exports contain every lesson and question while student pages contain no answer explanations',()=>{
 const files=renderCourse(all,catalog),student=files['student.html'],answers=files['answers.html'];
 assert.equal((student.match(/<article id="day-/g)||[]).length,250);
 assert.equal((student.match(/class="question" id="d/g)||[]).length,1608);
 assert.equal((answers.match(/class="question" id="d/g)||[]).length,1608);
 assert.equal((answers.match(/正解：/g)||[]).length,1608);
 assert(!student.includes('正解：'));assert(!student.includes(all[249].questions[0].explanation));
 assert.equal(files['plan.csv'].trim().split('\r\n').length,251);
 assert.deepEqual(JSON.parse(files['question-bank.json']).lessons,all);
 for(const file of ['student.html','answers.html','question-bank.json','plan.csv'])assert(files['index.html'].includes(file));
 const tampered=structuredClone(all);tampered[0].title='<img src=x onerror=alert(1)>';
 const safe=renderCourse(tampered,catalog)['student.html'];assert(!safe.includes('<img src=x'));assert(safe.includes('&lt;img src=x'));
 assert.throws(()=>renderCourse(all.slice(0,249),catalog),/Day 1–250/);
});

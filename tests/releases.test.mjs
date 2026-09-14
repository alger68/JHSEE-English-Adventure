import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {loadContent,validateContent} from '../scripts/content.mjs';
import {readBatch,prepareRelease} from '../scripts/prebuilt.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),require=createRequire(import.meta.url),C=require('../core.js');
const manifestName='2026-09-14-day-013-035.json';
const perfect=l=>Object.fromEntries(C.questions(l,3).map(q=>[q.id,q.answer]));
function inSnapshot(fn){
  const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'jhsee-release-test-'));
  try{
    fs.cpSync(path.join(root,'content'),path.join(temporary,'content'),{recursive:true});
    // Keep this regression fixture at the batch publication date while the real
    // catalog continues to grow through future daily files and release manifests.
    for(const name of fs.readdirSync(path.join(temporary,'content/daily')))
      if(name.endsWith('.json')&&name>'2026-09-13.json')fs.rmSync(path.join(temporary,'content/daily',name));
    for(const name of fs.readdirSync(path.join(temporary,'content/releases')))
      if(name.endsWith('.json')&&name!==manifestName)fs.rmSync(path.join(temporary,'content/releases',name));
    return fn(temporary);
  }finally{fs.rmSync(temporary,{recursive:true,force:true});}
}
test('Explicit batch release adds 23 unchanged lessons and 147 questions to the live catalog',()=>{
  const c=loadContent(root),batch=readBatch(root),initial=c.lessons.filter(l=>l.day<=35);
  assert.equal(initial.length,35);assert.equal(initial.reduce((n,l)=>n+l.questions.length,0),225);
  assert(c.lastPublishDate>='2026-09-14');assert(c.lastDailyPublishDate>='2026-09-13');
  for(const d of batch)assert.deepEqual(c.lessons.find(l=>l.day===d.lessons[0].day),d.lessons[0]);
  assert.deepEqual(c.lessons.map(l=>l.day),Array.from({length:c.lessons.length},(_,i)=>i+1));
});
test('Prebuilt files without a release manifest remain outside the published catalog',()=>inSnapshot(temporary=>{
  fs.rmSync(path.join(temporary,'content/releases'),{recursive:true});
  const c=loadContent(temporary);assert.equal(c.lessons.length,12);assert.equal(c.questionCount,78);
}));
test('A changed published source fails its pinned checksum',()=>inSnapshot(temporary=>{
  fs.appendFileSync(path.join(temporary,'content/prebuilt/day-035.json'),' ');
  assert.throws(()=>loadContent(temporary),/checksum mismatch/);
}));
test('Duplicate release references, invalid dates and path escapes are rejected',()=>{
  for(const [mutate,pattern] of [
    [m=>m.files.push(m.files[0]),/duplicate release reference/],
    [m=>m.publishDate='2026-02-30',/invalid release manifest/],
    [m=>m.files[0].path='../core.js',/invalid prebuilt path/]
  ])inSnapshot(temporary=>{
    const p=path.join(temporary,'content/releases',manifestName),m=JSON.parse(fs.readFileSync(p,'utf8'));
    mutate(m);fs.writeFileSync(p,JSON.stringify(m));assert.throws(()=>loadContent(temporary),pattern);
  });
});
test('Recreating an already batch-published day as daily content is rejected',()=>inSnapshot(temporary=>{
  const l=readBatch(root)[0].lessons[0];
  fs.writeFileSync(path.join(temporary,'content/daily/2026-09-14.json'),JSON.stringify({version:2,publishDate:'2026-09-14',lessons:[l]}));
  assert.throws(()=>loadContent(temporary),/consecutive/);
}));
test('Batch evidence and option explanations receive the same strict checks as daily content',()=>{
  const c=loadContent(root),before=c.lessons.filter(l=>l.day<=12),l=structuredClone(c.lessons[12]);
  const documents=[{filename:'snapshot.json',data:{version:2,lessons:before}},{filename:'releases/test.json',data:{version:2,publishDate:'2026-09-14',lessons:[l]}}];
  l.questions[0].evidence='This sentence is not in the story.';
  assert.throws(()=>validateContent(documents),/evidence/);
  l.questions[0].evidence=c.lessons[12].questions[0].evidence;l.questions[0].reasons.pop();
  assert.throws(()=>validateContent(documents),/four option explanations/);
});
test('A new learner can submit Day 35 now, retain a mistake, review it and avoid repeat EXP',()=>{
  const now=new Date('2026-09-14T03:00:00Z'),s=C.fresh(now),l=loadContent(root).lessons.find(l=>l.day===35),answers=perfect(l),q=l.questions[0];
  answers[q.id]=(q.answer+1)%4;
  const first=C.submit(s,l,answers,3,now);assert.equal(first.total,6);assert.equal(first.score,5);assert.equal(first.gain,70);
  assert.equal(s.startDate,'2026-09-14');assert.equal(s.completions[35].first.score,5);assert.equal(Object.keys(s.wrong).length,1);
  assert.equal(C.submit(s,l,perfect(l),3,now).gain,0);assert.equal(s.xp,70);assert.equal(s.completions[35].first.score,5);
  C.reviewQuestion(s,l,q.id,q.answer,now);assert.equal(s.wrong['35:'+q.id].due,'2026-09-15');
  assert.equal(C.streak(s,now),1);assert.deepEqual(C.validateState(JSON.parse(JSON.stringify(s)),loadContent(root).lessons),s);
});
test('Expanding the catalog preserves old first scores, drafts, word reviews, mistakes and XP',()=>{
  const all=loadContent(root).lessons,old=all.filter(l=>l.day<=12),now=new Date('2026-09-13T05:00:00Z');
  const s=C.fresh(now),l=old[0],answers=perfect(l);answers[l.questions[0].id]=(l.questions[0].answer+1)%4;
  C.submit(s,l,answers,3,now);C.reviewWord(s,'wallet',true,now);
  s.drafts['2:1']={};s.drafts['2:1'][old[1].questions[0].id]=1;
  const saved=JSON.parse(JSON.stringify(s));assert.deepEqual(C.validateState(saved,all),C.validateState(saved,old));
});
test('Daily reminders reuse batch-published lessons without creating duplicate daily files',()=>{
  const c=loadContent(root),docs=readBatch(root);
  for(const [date,day] of [['2026-09-14',13],['2026-09-15',14],['2026-10-06',35]]){
    const action=prepareRelease(c,docs,date);
    assert.equal(action.action,'reuse-published');assert.equal(action.lesson.day,day);
    assert.equal(action.filename,undefined);assert.equal(action.data,undefined);
  }
});
test('A later daily lesson extends the batch catalog and advances its publication metadata',()=>inSnapshot(temporary=>{
  const l=structuredClone(readBatch(root)[0].lessons[0]);
  l.day=36;l.title='Future daily publication regression fixture';l.type='對話／訊息';l.story+=' Later.';
  for(const [i,q] of l.questions.entries())q.id=`d36-q${i+1}`;
  fs.writeFileSync(path.join(temporary,'content/daily/2026-10-07.json'),JSON.stringify({version:2,publishDate:'2026-10-07',lessons:[l]}));
  const c=loadContent(temporary);assert.equal(c.lessons.length,36);assert.equal(c.questionCount,231);
  assert.equal(c.lastPublishDate,'2026-10-07');assert.equal(c.lastDailyPublishDate,'2026-10-07');
}));

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {authoredLessons} from '../scripts/bank-source/day-013-035.mjs';
import {loadContent} from '../scripts/content.mjs';
import {BATCH,compileBatch,readBatch,validateBatch,prepareRelease,taipeiDate} from '../scripts/prebuilt.mjs';

const root = fileURLToPath(new URL('../',import.meta.url));
const snapshot = () => ({lessons:loadContent(root).lessons.filter(l=>l.day<=12),lastPublishDate:'2026-09-13'});
const answerText = (docs,day,n) => {const q=docs.find(d=>d.lessons[0].day===day).lessons[0].questions[n-1];return q.options[q.answer];};

test('Prebuilt batch has 23 lessons and 147 balanced questions, not 250 completed days',()=>{
  const report=validateBatch(snapshot(),readBatch(root));
  assert.equal(report.lessons,23);assert.equal(report.questions,147);
  assert.equal(report.unreleasedLessons,23);assert.equal(report.combinedLessons,35);assert.equal(report.combinedQuestions,225);
  assert.deepEqual(report.answerDistribution,[37,37,37,36]);
  assert.equal(report.vocabularyEntries,115);assert.equal(report.phraseEntries,46);assert.equal(report.humanReviewed,false);
  assert.equal(Object.keys(report.skillCounts).length,5);
});
test('Compiled output is deterministic and every option retains its own rationale',()=>{
  const docs=compileBatch();assert.deepEqual(docs,compileBatch());assert.deepEqual(readBatch(root),docs);
  for(const [i,doc] of docs.entries()) for(const [j,q] of doc.lessons[0].questions.entries()){
    const source=authoredLessons[i].questions[j];
    assert.equal(q.options[q.answer],source.options[0]);assert.equal(q.reasons[q.answer],source.reasons[0]);
    for(const [k,text] of q.options.entries()) assert.equal(q.reasons[k],source.reasons[source.options.indexOf(text)]);
  }
});
test('Stories, IDs, vocabulary, quoted evidence, and question tiers satisfy the existing validator',()=>{
  const docs=readBatch(root);validateBatch(snapshot(),docs);
  assert.equal(new Set(docs.map(d=>d.lessons[0].story)).size,BATCH.lessonCount);
  assert.equal(docs.filter(d=>d.lessons[0].type==='每週 Boss').length,3);
  for(const doc of docs){
    assert.equal(doc.publishDate,undefined);
    const l=doc.lessons[0],core=l.questions.filter(q=>q.tier===1);
    assert.equal(core.filter(q=>q.skill==='字義推測').length,1);
    assert.equal(l.questions.filter(q=>q.tier===2).length,1);assert.equal(l.questions.filter(q=>q.tier===3).length,1);
    assert(l.story.trim().split(/\s+/).length>=120 && l.story.trim().split(/\s+/).length<=180);
  }
});
test('Prebuilt files do not unlock future days in the published content loader',()=>{
  const published=loadContent(root);
  const report=validateBatch(published,readBatch(root));
  assert.equal(report.publishedLessons,published.lessons.length);
  assert.equal(report.unreleasedLessons,Math.max(0,BATCH.lastDay-published.lessons.length));
  assert(!published.lessons.some(l=>l.status==='prebuilt'));
});
test('Publication preparation copies exactly one next lesson without mutating inputs',()=>{
  const published=snapshot(),docs=readBatch(root),before=JSON.stringify([published,docs]);
  const result=prepareRelease(published,docs,'2026-09-14');
  assert.equal(result.filename,'content/daily/2026-09-14.json');assert.equal(result.data.lessons[0].day,13);
  assert.equal(result.data.publishDate,'2026-09-14');assert.equal(result.data.status,undefined);
  assert.equal(JSON.stringify([published,docs]),before);
});
test('Already-published dates, invalid dates and missed-day shifts are refused',()=>{
  const published=snapshot(),docs=readBatch(root);
  assert.throws(()=>prepareRelease(published,docs,'2026-09-13'),/already published/);
  assert.throws(()=>prepareRelease(published,docs,'2026-02-30'),/Invalid release date/);
  assert.throws(()=>prepareRelease(published,docs,'2026-09-15'),/Date mismatch/);
});
test('A successful release advances to the following prebuilt lesson; a conflicting old lesson blocks it',()=>{
  const p=snapshot(),docs=readBatch(root),first=prepareRelease(p,docs,'2026-09-14');
  p.lessons.push(first.data.lessons[0]);p.lastPublishDate='2026-09-14';
  assert.equal(prepareRelease(p,docs,'2026-09-15').data.lessons[0].day,14);
  p.lessons.at(-1).title+=' changed';
  assert.throws(()=>validateBatch(p,docs),/already published content differs/);
});
test('Tampered answers, evidence, duplicate IDs and missing rationales cannot pass',()=>{
  for(const mutate of [q=>q.answer=4,q=>q.evidence='Invented evidence.',q=>q.id='d13-q2',q=>q.reasons.pop()]){
    const docs=readBatch(root);mutate(docs[0].lessons[0].questions[0]);
    assert.throws(()=>validateBatch(snapshot(),docs),/differs from authored source/);
  }
});
test('JSON object key ordering is not treated as a change to published content',()=>{
  const p=snapshot(),docs=readBatch(root),lesson=docs[0].lessons[0];
  p.lessons.push(Object.fromEntries(Object.entries(lesson).reverse()));p.lastPublishDate='2026-09-14';
  assert.equal(validateBatch(p,docs).unreleasedLessons,22);
});
test('Taipei dates use the correct UTC boundary',()=>{
  assert.equal(taipeiDate(new Date('2026-09-13T15:59:59Z')),'2026-09-13');
  assert.equal(taipeiDate(new Date('2026-09-13T16:00:00Z')),'2026-09-14');
});
test('Independent arithmetic: class fund includes all three expenses',()=>{
  const docs=readBatch(root);assert.equal(600-180-60-20,340);
  assert.equal(answerText(docs,18,3),`$${180+60}.`);
  assert.equal(answerText(docs,18,8),`$${600-180-60-20}.`);
});
test('Independent arithmetic: cleaning, outbound walk and return walk are all counted',()=>{
  const start=18*60+30-(15+10+10);assert.equal(start,17*60+55);
  assert.equal(answerText(readBatch(root),21,6),'At five fifty-five.');
  assert.equal(answerText(readBatch(root),22,3),'Twenty minutes.');
});
test('Independent arithmetic: library Plan B retains 35 minutes, Plan A only 15',()=>{
  const close=16*60+30,posterDone=15*60+40;
  const planA=posterDone+20+10+5,planB=posterDone+10+5;
  assert.equal(close-planA,15);assert.equal(close-planB,35);
  assert.equal(answerText(readBatch(root),25,5),'Fifteen minutes.');
  assert.equal(answerText(readBatch(root),25,8),'Plan B only.');
});
test('Independent arithmetic: free delivery costs more overall when buying an unneeded meal',()=>{
  const food=4*40+8*50,extraFood=food+40;
  const total=subtotal=>subtotal+(subtotal>=600?0:30);
  assert.equal(food,560);assert.equal(total(food),590);assert.equal(total(extraFood),600);
  assert.equal(total(extraFood)-total(food),10);
  assert.equal(answerText(readBatch(root),32,4),`$${total(food)}.`);
  assert.equal(answerText(readBatch(root),32,8),'It would rise by $10, from $590 to $600.');
});
test('Independent arithmetic: tickets, unit prices and lunch duration',()=>{
  const docs=readBatch(root);assert.equal(160/10-90/6,1);assert.equal(3*40-90,30);
  assert.equal(answerText(docs,28,5),'The small bag is $1 cheaper per apple.');
  assert.equal(answerText(docs,29,5),'At 12:40, after her meeting starts.');
  assert.equal(answerText(docs,35,5),`$${3*40-90}.`);
});
test('Offline export includes every question and keeps answers initially collapsed',()=>{
  const output=fs.mkdtempSync(path.join(os.tmpdir(),'jhsee-book-test-'));
  try{
    execFileSync(process.execPath,[path.join(root,'scripts/export-prebuilt.mjs'),output],{encoding:'utf8'});
    const html=fs.readFileSync(path.join(output,'START_HERE.html'),'utf8');
    assert.equal((html.match(/<article id="day-/g)||[]).length,23);
    assert.equal((html.match(/class="question" id="d/g)||[]).length,147);
    assert.equal((html.match(/<details class="answer">/g)||[]).length,147);
    assert.equal((html.match(/<details class="words">/g)||[]).length,23);
    assert(!/<details[^>]*\bopen(?:[\s=>])/.test(html));
    assert.equal((fs.readFileSync(path.join(output,'answers.md'),'utf8').match(/^### \d+\. d\d+-q\d+/gm)||[]).length,147);
    assert(!fs.readFileSync(path.join(output,'student.md'),'utf8').includes('正解：'));
    assert.equal(fs.readdirSync(path.join(output,'lessons')).length,23);
    const exported=JSON.parse(fs.readFileSync(path.join(output,'question-bank.json'),'utf8'));
    assert.deepEqual(exported.documents,readBatch(root));
    const callbacks={},details=Array.from({length:170},()=>({open:false}));let printed=false;
    const document={getElementById:id=>({addEventListener:(_,fn)=>callbacks[id]=fn}),querySelectorAll:selector=>{assert.equal(selector,'details');return details;}};
    vm.runInNewContext(html.match(/<script>([\s\S]*?)<\/script>/)[1],{document,window:{print:()=>printed=true}});
    callbacks.expand();assert(details.every(d=>d.open));callbacks.collapse();assert(details.every(d=>!d.open));callbacks.print();assert(printed);
  }finally{fs.rmSync(output,{recursive:true,force:true});}
});

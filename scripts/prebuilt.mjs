import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {isDeepStrictEqual} from 'node:util';
import {authoredLessons} from './bank-source/day-013-035.mjs';
import {loadContent, validateContent} from './content.mjs';

export const BATCH = {id:'day-013-035-v1', firstDay:13, lastDay:35, lessonCount:23, questionCount:147, firstDate:'2026-09-14'};
const types = ['校園故事','日常生活','對話／訊息','科普閱讀','公告／資訊閱讀','每週 Boss','單字與錯題復活'];
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const norm = s => s.toLowerCase().replace(/\s+/g,' ').trim();
const fail = message => { throw new Error(message); };
export const fileForDay = day => `day-${String(day).padStart(3,'0')}.json`;
export function plannedDate(day) {
  return new Date(Date.parse(BATCH.firstDate+'T00:00:00Z')+(day-BATCH.firstDay)*86400000).toISOString().slice(0,10);
}
export function taipeiDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
  return ['year','month','day'].map(name=>parts.find(p=>p.type===name).value).join('-');
}

// Authored source places the correct choice first. Output has a deterministic,
// balanced A/B/C/D distribution, and every rationale follows its own option.
// IDs never depend on option order. This is not a secure-exam answer hiding scheme.
export function compileBatch() {
  if (authoredLessons.length!==BATCH.lessonCount) fail('Incorrect authored lesson count');
  const ids = authoredLessons.flatMap(l=>l.questions.map((_,i)=>`d${l.day}-q${i+1}`));
  if (ids.length!==BATCH.questionCount || new Set(ids).size!==ids.length) fail('Incorrect authored question IDs/count');
  const positions = new Map([...ids].sort((a,b)=>hash(a).localeCompare(hash(b))).map((id,i)=>[id,i%4]));
  return authoredLessons.map((source,index)=>{
    const l = structuredClone(source);
    if (l.day!==BATCH.firstDay+index) fail('Authored days must be consecutive');
    const date = plannedDate(l.day);
    l.type = types[(new Date(date+'T12:00:00Z').getUTCDay()+6)%7];
    l.minutes = l.type==='每週 Boss'?15:10;
    const coreCount = l.type==='每週 Boss'?7:4;
    l.questions = l.questions.map((q,i)=>{
      const id = `d${l.day}-q${i+1}`, answer = positions.get(id);
      if (q.options?.length!==4 || q.reasons?.length!==4) fail(`${id}: four options and rationales required`);
      const order = [1,2,3].sort((a,b)=>hash(`${id}:${a}`).localeCompare(hash(`${id}:${b}`)));
      order.splice(answer,0,0);
      return {...q,id,answer,tier:i<coreCount?1:i===coreCount?2:3,options:order.map(j=>q.options[j]),reasons:order.map(j=>q.reasons[j])};
    });
    return {version:2,status:'prebuilt',batchId:BATCH.id,plannedPublishDate:date,provenance:{kind:'ai_original',officialExam:false,review:'automated_validation_and_assistant_review',humanReviewed:false},lessons:[l]};
  });
}

export function validateBatch(published, documents) {
  if (documents.length!==BATCH.lessonCount) fail('Incorrect prebuilt document count');
  const compiled = compileBatch();
  const ordered = [...documents].sort((a,b)=>(a.lessons?.[0]?.day??0)-(b.lessons?.[0]?.day??0));
  const byPublishedDay = new Map(published.lessons.map(l=>[l.day,l]));
  const answerDistribution = [0,0,0,0], skillCounts = {}, wordCounts = [];
  for (const [i,doc] of ordered.entries()) {
    const l = doc.lessons?.[0];
    if (doc.publishDate!==undefined || doc.status!=='prebuilt' || doc.lessons?.length!==1 || doc.plannedPublishDate!==plannedDate(BATCH.firstDay+i)) fail('Invalid prebuilt date/status envelope');
    if (!isDeepStrictEqual(doc,compiled[i])) fail(`Day ${l?.day}: generated content differs from authored source; run --generate after editing source`);
    if (l.day!==BATCH.firstDay+i) fail('Prebuilt days must be consecutive');
    const old = byPublishedDay.get(l.day);
    if (old && !isDeepStrictEqual(old,l)) fail(`Day ${l.day}: already published content differs; never overwrite a published lesson`);
    wordCounts.push(l.story.trim().split(/\s+/).length);
    for (const q of l.questions) {
      if (!norm(l.story).includes(norm(q.evidence))) fail(`${q.id}: evidence is not a continuous quote`);
      if (q.reasons.length!==4 || q.reasons.some(s=>typeof s!=='string'||!s.trim())) fail(`${q.id}: missing option rationale`);
      answerDistribution[q.answer]++;
      skillCounts[q.skill]=(skillCounts[q.skill]||0)+1;
    }
  }
  // Unreleased lessons are validated under their planned date, in memory only.
  // No planned date is represented as a real publication date on disk.
  const pending = ordered.filter(d=>!byPublishedDay.has(d.lessons[0].day));
  const combined = validateContent([
    {filename:'published-snapshot.json',data:{version:2,lessons:published.lessons}},
    ...pending.map(d=>({filename:`daily/${d.plannedPublishDate}.json`,data:{version:2,publishDate:d.plannedPublishDate,lessons:d.lessons}}))
  ]);
  return {batch:BATCH.id,lessons:documents.length,questions:answerDistribution.reduce((a,b)=>a+b,0),publishedLessons:published.lessons.length,unreleasedLessons:pending.length,combinedLessons:combined.lessons.length,combinedQuestions:combined.questionCount,storyWords:{min:Math.min(...wordCounts),max:Math.max(...wordCounts)},vocabularyEntries:documents.length*5,phraseEntries:documents.length*2,answerDistribution,skillCounts,humanReviewed:false};
}

export function readBatch(root) {
  return Array.from({length:BATCH.lessonCount},(_,i)=>JSON.parse(fs.readFileSync(path.join(root,'content/prebuilt',fileForDay(BATCH.firstDay+i)),'utf8')));
}

// Pure preparation only: this function never writes a daily file or updates git.
// A missed day/date mismatch requires explicit replanning instead of backdating.
export function prepareRelease(published, documents, date) {
  validateBatch(published,documents);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0,10)!==date) fail('Invalid release date');
  if (published.lastPublishDate && date<=published.lastPublishDate) fail('Date already published or older than the latest publication');
  const nextDay = published.lessons.at(-1).day+1;
  const doc = documents.find(d=>d.lessons[0].day===nextDay);
  if (!doc) fail(`No prebuilt lesson for Day ${nextDay}`);
  if (doc.plannedPublishDate!==date) fail(`Date mismatch: Day ${nextDay} is planned for ${doc.plannedPublishDate}, not ${date}. Stop and replan; do not backdate.`);
  return {filename:`content/daily/${date}.json`,data:{version:2,publishDate:date,lessons:structuredClone(doc.lessons)}};
}

function main() {
  const root = fileURLToPath(new URL('../',import.meta.url));
  const published = loadContent(root);
  const args = process.argv.slice(2);
  if (args.length>1 || !['--generate','--check','--release',undefined].includes(args[0])) fail('Usage: node scripts/prebuilt.mjs [--generate|--check|--release]');
  if (args[0]==='--generate') {
    const docs = compileBatch();
    const report = validateBatch(published,docs);
    const dir = path.join(root,'content/prebuilt');
    fs.mkdirSync(dir,{recursive:true});
    for (const doc of docs) fs.writeFileSync(path.join(dir,fileForDay(doc.lessons[0].day)),JSON.stringify(doc,null,2)+'\n');
    console.log(JSON.stringify(report,null,2));
  } else {
    const docs = readBatch(root);
    const output = args[0]==='--release'?prepareRelease(published,docs,taipeiDate()):validateBatch(published,docs);
    console.log(JSON.stringify(output,null,2));
  }
}
if (process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) main();

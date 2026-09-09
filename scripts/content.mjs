import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const nonempty=(s,max=1200)=>typeof s==='string'&&s.trim().length>0&&s.length<=max;
const norm=s=>s.toLowerCase().replace(/\s+/g,' ').trim();
const validDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;
const types=['校園故事','日常生活','對話／訊息','科普閱讀','公告／資訊閱讀','每週 Boss','單字與錯題復活'];
const skills=['細節理解','推論判讀','字義推測','主旨統整','資訊整合'];
const fail=message=>{throw new Error(message);};
export function validateContent(documents){
 const lessons=[],dailyDates=new Set(),sources=new Map();
 for(const {filename,data} of documents){
  if(data?.version!==2||!Array.isArray(data.lessons)||!data.lessons.length)fail(`${filename}: expected version 2 and a nonempty lessons array`);
  const daily=filename.startsWith('daily/');
  if(daily){
   if(!validDate(data.publishDate)||filename!==`daily/${data.publishDate}.json`||data.lessons.length!==1)fail(`${filename}: daily filename, publishDate, and single lesson must agree`);
   if(dailyDates.has(data.publishDate))fail(`${filename}: duplicate publication date`);
   dailyDates.add(data.publishDate);
  }
  for(const l of data.lessons){lessons.push(l);sources.set(l,{daily,filename,date:data.publishDate});}
 }
 lessons.sort((a,b)=>a.day-b.day);
 if(!lessons.length||lessons.length>250)fail('Content must contain 1–250 lessons');
 const seenIds=new Set(),seenStories=new Set(),seenTitles=new Set();
 for(const [i,l] of lessons.entries()){
  const {daily,filename,date}=sources.get(l),prefix=`${filename} Day ${l.day}`;
  if(l.day!==i+1)fail(`${prefix}: days must be unique and consecutive starting from 1`);
  if(!nonempty(l.title,150)||!nonempty(l.goal,200)||!nonempty(l.story,3000)||!types.includes(l.type)||!Number.isInteger(l.minutes)||l.minutes<5||l.minutes>20)fail(`${prefix}: invalid lesson fields`);
  if(seenStories.has(norm(l.story))||seenTitles.has(norm(l.title)))fail(`${prefix}: duplicate title or story`);
  seenStories.add(norm(l.story));seenTitles.add(norm(l.title));
  const wc=l.story.trim().split(/\s+/).length;if(wc<120||wc>180)fail(`${prefix}: expected 120–180 story words, got ${wc}`);
  if(!Array.isArray(l.words)||l.words.length!==5||l.words.some(w=>!nonempty(w.word,80)||!nonempty(w.meaning,120)||!nonempty(w.example,300))||new Set(l.words.map(w=>norm(w.word))).size!==5)fail(`${prefix}: expected five unique vocabulary entries with meanings and examples`);
  if(!Array.isArray(l.phrases)||l.phrases.length<1||l.phrases.length>2||l.phrases.some(p=>!nonempty(p.phrase,100)||!nonempty(p.meaning,150)))fail(`${prefix}: expected one or two phrases`);
  if(!Array.isArray(l.questions))fail(`${prefix}: missing questions`);
  const counts=[1,2,3].map(t=>l.questions.filter(q=>q.tier===t).length),expected=l.type==='每週 Boss'?[7,1,1]:[4,1,1];
  if(counts.some((n,i)=>n!==expected[i]))fail(`${prefix}: incorrect core/A+/A++ question counts`);
  if(l.questions.filter(q=>q.tier===1&&q.skill==='字義推測').length!==1)fail(`${prefix}: expected one core vocabulary detective question`);
  for(const q of l.questions){
   if(typeof q.id!=='string'||!new RegExp(`^d${l.day}-q[1-9][0-9]*$`).test(q.id)||seenIds.has(q.id))fail(`${prefix}: invalid or duplicate question ID`);
   seenIds.add(q.id);
   if(!skills.includes(q.skill)||!nonempty(q.prompt,600)||!Array.isArray(q.options)||q.options.length!==4||q.options.some(o=>!nonempty(o,350))||new Set(q.options.map(norm)).size!==4||!Number.isInteger(q.answer)||q.answer<0||q.answer>3||![1,2,3].includes(q.tier)||!nonempty(q.explanation,1000)||!nonempty(q.evidence,1500))fail(`${prefix} ${q.id}: invalid question, answer, explanation, or evidence`);
   if(daily&&!norm(l.story).includes(norm(q.evidence)))fail(`${prefix} ${q.id}: evidence must be copied exactly from this story`);
  }
  if(daily){
   const weekday=new Date(date+'T12:00:00+08:00').getUTCDay();
   const expectedType=types[(weekday+6)%7];
   if(l.type!==expectedType)fail(`${prefix}: topic must be ${expectedType} for ${date}`);
  }
 }
 return {lessons,lastPublishDate:[...dailyDates].sort().at(-1)||null,questionCount:seenIds.size};
}
export function loadContent(root){
 const directory=path.join(root,'content');
 const seed=fs.readdirSync(directory).filter(n=>/^week-\d+\.json$/.test(n)).sort();
 const dailyDirectory=path.join(directory,'daily');
 const daily=fs.existsSync(dailyDirectory)?fs.readdirSync(dailyDirectory).filter(n=>n.endsWith('.json')).sort().map(n=>'daily/'+n):[];
 const documents=[...seed,...daily].map(filename=>({filename,data:JSON.parse(fs.readFileSync(path.join(directory,filename),'utf8'))}));
 const content=validateContent(documents);
 const revision=crypto.createHash('sha256').update(JSON.stringify(documents)).digest('hex').slice(0,16);
 return {...content,revision};
}

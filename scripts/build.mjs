import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {loadContent} from './content.mjs';
import {loadExams} from './exams.mjs';
import {renderCourse} from './export-course.mjs';
const root=path.resolve(import.meta.dirname,'..');
const {lessons,revision,lastPublishDate,lastDailyPublishDate,questionCount}=loadContent(root);
const meta={version:'3.2.2',revision,lessonCount:lessons.length,questionCount,targetLessonCount:250,accessMode:'all-published',lastPublishDate,lastDailyPublishDate};
const data='// Generated from seed, daily content and explicit release manifests.\nconst lessonMeta = '+JSON.stringify(meta)+';\nconst lessons = '+JSON.stringify(lessons,null,2)+';\n';
fs.writeFileSync(path.join(root,'data.js'),data);
const exams=loadExams(root);
fs.writeFileSync(path.join(root,'exam-data.js'),'// Official answer keys and source links; generated from content/official-exams.json.\nconst officialExams = '+JSON.stringify(exams,null,2)+';\n');
const scripts=['data.js','core.js','exam-data.js','exam-core.js','exams.js','transfer-data.js','speech.js','app.js'];
for(const f of scripts)new vm.Script(fs.readFileSync(path.join(root,f),'utf8'),{filename:f});
fs.mkdirSync(path.join(root,'dist'),{recursive:true});
for(const f of ['style.css',...scripts])fs.copyFileSync(path.join(root,f),path.join(root,'dist',f));
let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
// Version each referenced asset so a new article cannot leave a cached old data.js behind.
for(const f of ['style.css',...scripts]){
 const hash=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex').slice(0,12);
 html=html.replaceAll('"'+f+'"','"'+f+'?v='+hash+'"');
}
fs.writeFileSync(path.join(root,'dist','index.html'),html);
fs.writeFileSync(path.join(root,'dist','catalog.json'),JSON.stringify(meta,null,2)+'\n');
fs.writeFileSync(path.join(root,'dist','.nojekyll'),'');
if (lessons.length===250) {
 const directory=path.join(root,'dist','downloads');
 fs.mkdirSync(directory,{recursive:true});
 fs.mkdirSync(path.join(root,'downloads'),{recursive:true});
 for(const [name,content] of Object.entries(renderCourse(lessons,meta))) {
  fs.writeFileSync(path.join(directory,name),content);
  fs.writeFileSync(path.join(root,'downloads',name),content);
 }
}

console.log(`Built ${lessons.length} lessons, ${questionCount} questions; latest publication: ${lastPublishDate||'seed week'}; access: all-published; revision ${revision}.`);
console.log(`Included ${exams.length} official English reading papers, ${exams.reduce((n,e)=>n+e.questionCount,0)} questions.`);


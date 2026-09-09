import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const root=path.resolve(import.meta.dirname,'..');
const contentFiles=fs.readdirSync(path.join(root,'content')).filter(n=>/^week-\d+\.json$/.test(n)).sort();
const lessons=contentFiles.flatMap(n=>JSON.parse(fs.readFileSync(path.join(root,'content',n),'utf8')).lessons).sort((a,b)=>a.day-b.day);
const seen=new Set();
for(const [i,l] of lessons.entries()){
 if(l.day!==i+1||!l.title||!l.story||l.words.length!==5||l.phrases.length<1||l.phrases.length>2)throw new Error('Invalid lesson '+l.day);
 const wc=l.story.split(/\s+/).length;if(wc<120||wc>180)throw new Error('Story length '+l.day+': '+wc);
 for(const q of l.questions){if(seen.has(q.id)||q.options.length!==4||!Number.isInteger(q.answer)||q.answer<0||q.answer>3||!q.explanation||!q.evidence||![1,2,3].includes(q.tier))throw new Error('Invalid question '+q.id);seen.add(q.id);}
}
const data='// Generated from content/week-*.json by scripts/build.mjs.\nconst lessons = '+JSON.stringify(lessons,null,2)+';\n';
fs.writeFileSync(path.join(root,'data.js'),data);
for(const f of ['data.js','core.js','app.js'])new vm.Script(fs.readFileSync(path.join(root,f),'utf8'),{filename:f});
fs.mkdirSync(path.join(root,'dist'),{recursive:true});
for(const f of ['index.html','style.css','data.js','core.js','app.js'])fs.copyFileSync(path.join(root,f),path.join(root,'dist',f));
fs.writeFileSync(path.join(root,'dist','.nojekyll'),'');
console.log(`Built ${lessons.length} lessons, ${seen.size} questions and ${lessons.reduce((n,l)=>n+l.words.length,0)} vocabulary entries.`);

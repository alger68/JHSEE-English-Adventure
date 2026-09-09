import fs from 'node:fs';
import path from 'node:path';
export function loadExams(root){
  const data=JSON.parse(fs.readFileSync(path.join(root,'content','official-exams.json'),'utf8'));
  if(data.version!==1||!Array.isArray(data.exams)||!data.exams.length)throw Error('Invalid official exam catalog');
  const seen=new Set();
  for(const e of data.exams){
    if(!Number.isInteger(e.year)||e.year<103||e.adYear!==e.year+1911||e.id!==`cap-${e.year}-reading`||seen.has(e.id)||!e.title||!Number.isInteger(e.questionCount)||e.questionCount<40||e.questionCount>45||e.durationMinutes!==60||typeof e.answers!=='string'||e.answers.length!==e.questionCount||!/^[A-D]+$/.test(e.answers))throw Error('Invalid exam '+e.id);
    seen.add(e.id);
    if(!Array.isArray(e.creditAll)||new Set(e.creditAll).size!==e.creditAll.length||e.creditAll.some(n=>!Number.isInteger(n)||n<1||n>e.questionCount))throw Error('Invalid full-credit rules '+e.id);
    for(const field of ['paperUrl','answerUrl','listeningUrl'])if(!/^https:\/\/drive\.google\.com\/file\/d\/[A-Za-z0-9_-]+\/view\?usp=drive_link$/.test(e[field]))throw Error('Invalid source URL '+e.id);
    if(e.officialIndex!=='https://cap.rcpet.edu.tw/examination.html'||!/^\d{4}-\d{2}-\d{2}$/.test(e.checkedAt))throw Error('Missing provenance '+e.id);
  }
  return data.exams;
}

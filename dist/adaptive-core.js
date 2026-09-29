(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.AdaptiveCore=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const SUBJECT_BASE_WEIGHTS={
    '英文閱讀':30,
    '自然理化':20,
    '數學':20,
    '歷史＋公民':15,
    '國文':10,
    '聽力＋地理＋生物':5
  };

  const ENGLISH_SKILL_BASE_WEIGHTS={
    '細節理解':22,
    '推論判讀':28,
    '字義推測':15,
    '主旨統整':15,
    '資訊整合':20
  };

  const clamp=(n,min=0,max=100)=>Math.max(min,Math.min(max,n));
  const dayKey=(d=new Date())=>new Date(new Date(d).getTime()+8*3600000).toISOString().slice(0,10);
  const daysBetween=(a,b)=>Math.floor((Date.parse(b+'T00:00:00Z')-Date.parse(a+'T00:00:00Z'))/86400000);

  function severityFromWrongCount(n){
    if(n>=5)return {code:'S4',label:'核心漏洞'};
    if(n===4)return {code:'S3',label:'反覆錯誤'};
    if(n===3)return {code:'S2',label:'明顯弱點'};
    if(n===2)return {code:'S1',label:'需要複習'};
    return {code:'S0',label:'偶發錯誤'};
  }

  function multiplierFromScore(score,wrongCount=0){
    if(wrongCount>=5||score>=70)return 3.0;
    if(wrongCount>=4||score>=55)return 2.3;
    if(wrongCount>=3||score>=40)return 1.8;
    if(wrongCount>=2||score>=28)return 1.4;
    if(score<=10&&wrongCount<=1)return 0.4;
    return 1.0;
  }

  function weaknessScore(v){
    return clamp(
      (v.wrongCount||0)*4+
      (v.consecutiveWrong||0)*6+
      (v.recentWrong||0)*5+
      (v.slowCount||0)*2+
      (v.lowConfidenceCount||0)*2-
      (v.consecutiveCorrect||0)*4-
      (v.spacedSuccess||0)*5
    );
  }

  function masteryScore(v){
    const rate=v.attempts?((v.correct||0)/v.attempts):0;
    return clamp(Math.round(
      45+rate*35+
      Math.min(20,(v.spacedSuccess||0)*4)+
      Math.min(12,(v.consecutiveCorrect||0)*3)-
      Math.min(30,(v.wrongCount||0)*3)-
      Math.min(18,(v.consecutiveWrong||0)*6)
    ));
  }

  function createSkillBucket(skill){
    return {
      skill,attempts:0,correct:0,wrongCount:0,recentWrong:0,
      consecutiveWrong:0,consecutiveCorrect:0,slowCount:0,
      lowConfidenceCount:0,spacedSuccess:0,lastSeen:null,lastCorrect:null,lastWrong:null
    };
  }

  function skillStats(state,lessons,now=new Date()){
    const bySkill={};
    const lessonMap=new Map(lessons.map(l=>[l.day,l]));
    const ensure=skill=>bySkill[skill]||(bySkill[skill]=createSkillBucket(skill));
    const today=dayKey(now);

    const ordered=[...(state.attempts||[])].sort((a,b)=>String(a.at).localeCompare(String(b.at)));
    for(const attempt of ordered){
      const perQuestion=(attempt.total&&attempt.seconds)?attempt.seconds/attempt.total:0;
      for(const item of (attempt.items||[])){
        const v=ensure(item.skill||'其他');
        v.attempts++;
        v.lastSeen=attempt.at||v.lastSeen;
        if(item.correct){
          v.correct++;
          v.consecutiveCorrect++;
          v.consecutiveWrong=0;
          v.lastCorrect=attempt.at||v.lastCorrect;
        }else{
          v.wrongCount++;
          v.consecutiveWrong++;
          v.consecutiveCorrect=0;
          v.lastWrong=attempt.at||v.lastWrong;
          const atDay=String(attempt.at||'').slice(0,10);
          if(atDay&&daysBetween(atDay,today)<=7&&daysBetween(atDay,today)>=0)v.recentWrong++;
          if(perQuestion>75)v.slowCount++;
        }
      }
    }

    for(const w of Object.values(state.wrong||{})){
      const lesson=lessonMap.get(w.day);
      const q=lesson?.questions?.find(x=>x.id===w.questionId);
      if(!q)continue;
      const v=ensure(q.skill||'其他');
      v.wrongCount=Math.max(v.wrongCount,w.misses||1);
      v.spacedSuccess+=Math.max(0,w.stage||0);
      if(w.last&&daysBetween(w.last,today)<=7&&daysBetween(w.last,today)>=0)v.lastSeen=w.last;
    }

    for(const t of Object.values(state.transfer||{})){
      const v=ensure(t.skill||'其他');
      v.attempts+=Math.max(1,t.attempts||1);
      if(t.last)v.correct++;
      else v.wrongCount++;
      if(t.last){v.consecutiveCorrect=Math.max(v.consecutiveCorrect,1);}
      else{v.consecutiveWrong=Math.max(v.consecutiveWrong,1);}
      if(t.at)v.lastSeen=t.at;
    }

    for(const v of Object.values(bySkill)){
      v.weakness=weaknessScore(v);
      v.mastery=masteryScore(v);
      v.multiplier=multiplierFromScore(v.weakness,v.wrongCount);
      v.severity=severityFromWrongCount(v.wrongCount);
      v.status=v.mastery>=80&&v.weakness<=15?'mastered':v.weakness>=55?'critical':v.weakness>=28?'weak':'normal';
    }
    return bySkill;
  }

  function normalizedSkillWeights(stats,base=ENGLISH_SKILL_BASE_WEIGHTS){
    const names=new Set([...Object.keys(base),...Object.keys(stats||{})]);
    const raw={};
    let total=0;
    for(const skill of names){
      const baseWeight=base[skill]??10;
      const s=stats?.[skill]||createSkillBucket(skill);
      const m=s.multiplier||multiplierFromScore(s.weakness||0,s.wrongCount||0);
      raw[skill]=baseWeight*m;
      total+=raw[skill];
    }
    const out={};
    for(const skill of names)out[skill]=total?Math.round(raw[skill]/total*1000)/10:0;
    return out;
  }

  function recommendedPracticeLevel(stat){
    if(!stat)return 2;
    if(stat.wrongCount>=4||stat.consecutiveWrong>=2||stat.weakness>=55)return 1;
    if(stat.mastery<80||stat.weakness>=20)return 2;
    return 3;
  }

  function dailyPlan(state,lessons,count=20,now=new Date()){
    const stats=skillStats(state,lessons,now);
    const weights=normalizedSkillWeights(stats);
    const categories=[
      {key:'weak',label:'核心弱點',ratio:.40},
      {key:'due',label:'到期複習',ratio:.25},
      {key:'transfer',label:'模考／錯題變形',ratio:.15},
      {key:'new',label:'新範圍／正常進度',ratio:.10},
      {key:'maintain',label:'已掌握維持',ratio:.10}
    ];
    let used=0;
    const distribution=categories.map((c,i)=>{
      const n=i===categories.length-1?count-used:Math.round(count*c.ratio);
      used+=n;
      return {...c,count:n};
    });
    const topSkills=Object.values(stats).sort((a,b)=>b.weakness-a.weakness||b.wrongCount-a.wrongCount).slice(0,3);
    return {count,stats,weights,distribution,topSkills};
  }

  function selectTransferQuestion(bank,state,skill){
    const list=bank.filter(q=>!skill||q.skill===skill);
    if(!list.length)return null;
    return [...list].sort((a,b)=>{
      const A=state.transfer?.[a.id],B=state.transfer?.[b.id];
      const aWrong=A&&!A.last?1:0,bWrong=B&&!B.last?1:0;
      if(aWrong!==bWrong)return bWrong-aWrong;
      const aa=A?.attempts||0,bb=B?.attempts||0;
      if(aa!==bb)return aa-bb;
      const af=A?.first===false?1:0,bf=B?.first===false?1:0;
      if(af!==bf)return bf-af;
      return a.id.localeCompare(b.id);
    })[0];
  }

  function trainingRoute(stat){
    const level=recommendedPracticeLevel(stat);
    if(level===1)return {level:1,label:'修復',message:'先回到原錯題與較短線索，重新建立判斷步驟。'};
    if(level===2)return {level:2,label:'變形',message:'改做同核心能力、不同情境的相似題，確認不是記答案。'};
    return {level:3,label:'會考驗收',message:'用正式會考型閱讀與混合干擾選項驗證是否真正掌握。'};
  }

  return {
    SUBJECT_BASE_WEIGHTS,ENGLISH_SKILL_BASE_WEIGHTS,
    severityFromWrongCount,multiplierFromScore,weaknessScore,masteryScore,
    skillStats,normalizedSkillWeights,recommendedPracticeLevel,
    dailyPlan,selectTransferQuestion,trainingRoute
  };
});

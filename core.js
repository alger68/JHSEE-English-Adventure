/* Shared, dependency-free learning rules. No browser APIs are needed here. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AdventureCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const DAY = 86400000;
  const dateKey = (now = new Date()) => new Date(new Date(now).getTime() + 8 * 3600000).toISOString().slice(0, 10);
  const validDate = s => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && Number.isFinite(Date.parse(s)) && new Date(s).toISOString().slice(0, 10) === s;
  const addDays = (s, days) => new Date(Date.parse(s + 'T00:00:00Z') + days * DAY).toISOString().slice(0, 10);
  const fresh = (now = new Date()) => ({ version: 2, startDate: dateKey(now), xp: 0, legacyDone: [], activityDates: [], completions: {}, attempts: [], wrong: {}, wordProgress: {}, drafts: {}, difficulty: 1 });
  const questions = (lesson, tier = 1) => lesson.questions.filter(q => q.tier <= tier);
  function migrate(legacy, now = new Date()) {
    const s = fresh(now);
    if (!legacy || typeof legacy !== 'object') return s;
    s.xp = Number.isFinite(legacy.xp) ? Math.max(0, Math.floor(legacy.xp)) : 0;
    s.legacyDone = Array.isArray(legacy.done) ? [...new Set(legacy.done.filter(d => Number.isInteger(d) && d > 0))] : [];
    return s;
  }
  function unlockAt(state, day) { return Date.parse(addDays(state.startDate, day - 1) + 'T20:00:00+08:00'); }
  function isUnlocked(state, day, now = new Date()) { return day === 1 || state.legacyDone.includes(day) || !!state.completions[day] || new Date(now).getTime() >= unlockAt(state, day); }
  function completedDays(s) { return [...new Set([...s.legacyDone, ...Object.keys(s.completions).map(Number)])]; }
  function addActivity(s, now) { const d = dateKey(now); if (!s.activityDates.includes(d)) s.activityDates.push(d); s.activityDates.sort(); }
  function streak(s, now = new Date()) {
    const dates = new Set(s.activityDates); let d = dateKey(now), count = 0;
    if (!dates.has(d)) d = addDays(d, -1);
    while (dates.has(d)) { count++; d = addDays(d, -1); }
    return count;
  }
  function grade(lesson, answers, tier) {
    const qs = questions(lesson, tier);
    if (qs.some(q => !Number.isInteger(answers[q.id]) || answers[q.id] < 0 || answers[q.id] >= q.options.length)) throw new Error('請先完成每一道題目，再提交答案。');
    const items = qs.map(q => ({ questionId: q.id, selected: answers[q.id], correct: answers[q.id] === q.answer, skill: q.skill }));
    const score = items.filter(i => i.correct).length;
    return { score, total: items.length, percent: Math.round(score / items.length * 100), items };
  }
  function submit(s, lesson, answers, tier = 1, now = new Date(), seconds = 0) {
    if (!isUnlocked(s, lesson.day, now)) throw new Error('這一關尚未解鎖。');
    if (![1, 2, 3].includes(tier)) throw new Error('難度設定無效。');
    const result = grade(lesson, answers, tier);
    const first = !s.completions[lesson.day];
    const rewardedBefore = !first || s.legacyDone.includes(lesson.day);
    const gain = rewardedBefore ? 0 : 20 + result.score * 10;
    const attempt = { day: lesson.day, tier, at: new Date(now).toISOString(), seconds: Math.max(0, Math.min(1800, Math.round(seconds))), answers: { ...answers }, ...result };
    const prior = s.completions[lesson.day];
    s.completions[lesson.day] = { first: prior ? prior.first : attempt, last: attempt, best: prior ? Math.max(prior.best, result.percent) : result.percent };
    s.attempts.push(attempt);
    if (s.attempts.length > 2000) s.attempts = s.attempts.slice(-2000);
    result.items.forEach(item => {
      const key = lesson.day + ':' + item.questionId;
      if (item.correct) delete s.wrong[key];
      else s.wrong[key] = { day: lesson.day, questionId: item.questionId, misses: (s.wrong[key]?.misses || 0) + 1 };
    });
    s.xp += gain; addActivity(s, now);
    delete s.drafts[lesson.day + ':' + tier];
    return { ...attempt, gain, first: !rewardedBefore };
  }
  function reviewQuestion(s, lesson, questionId, selected, now = new Date()) {
    const q = lesson.questions.find(q => q.id === questionId);
    if (!q || !Number.isInteger(selected) || selected < 0 || selected >= q.options.length) throw new Error('請先選一個答案。');
    const key = lesson.day + ':' + questionId, correct = selected === q.answer;
    if (correct) delete s.wrong[key];
    else s.wrong[key] = { day: lesson.day, questionId, misses: (s.wrong[key]?.misses || 0) + 1 };
    addActivity(s, now);
    return correct;
  }
  const wordKey = w => w.word.toLowerCase();
  function vocabulary(lessons, state, now = new Date()) {
    const seen = new Set(), words = [];
    lessons.filter(l => isUnlocked(state, l.day, now)).forEach(l => l.words.forEach(w => {
      const key = wordKey(w);
      if (!seen.has(key)) { words.push({ ...w, key, day: l.day }); seen.add(key); }
    }));
    return words;
  }
  const dueWords = (lessons, s, now = new Date()) => vocabulary(lessons, s, now).filter(w => !s.wordProgress[w.key] || s.wordProgress[w.key].due <= dateKey(now));
  function reviewWord(s, key, known, now = new Date()) {
    const date = dateKey(now), old = s.wordProgress[key];
    // At most one spacing promotion per word on the same local calendar date.
    let stage = known ? (old?.stage || 0) : 0;
    if (known && (old?.last !== date || stage === 0)) stage = Math.min(3, stage + 1);
    const due = known ? addDays(date, [1, 1, 3, 7][stage]) : date;
    s.wordProgress[key] = { stage, due, last: date };
    addActivity(s, now);
    return s.wordProgress[key];
  }
  function firstAccuracy(s) {
    const entries = Object.values(s.completions).map(c => c.first);
    const total = entries.reduce((n, a) => n + a.total, 0);
    return total ? Math.round(entries.reduce((n, a) => n + a.score, 0) / total * 100) : null;
  }
  function recommendation(s) {
    const n = Object.keys(s.completions).length, accuracy = firstAccuracy(s) || 0;
    return n >= 5 && accuracy >= 90 ? 3 : n >= 3 && accuracy >= 80 ? 2 : 1;
  }
  function validateState(raw, lessons) {
    if (!raw || raw.version !== 2 || !validDate(raw.startDate) || !Number.isInteger(raw.xp) || raw.xp < 0 || raw.xp > 1e8 || ![1,2,3].includes(raw.difficulty)) throw new Error('這不是有效的 V2 學習備份。');
    const s = fresh(raw.startDate + 'T00:00:00Z'); s.startDate = raw.startDate; s.xp = raw.xp; s.difficulty = raw.difficulty;
    const days = new Set(lessons.map(l => l.day));
    if (!Array.isArray(raw.legacyDone) || !raw.legacyDone.every(d => days.has(d)) || !Array.isArray(raw.activityDates) || !raw.activityDates.every(validDate)) throw new Error('備份中的日期或關卡資料不完整。');
    s.legacyDone = [...new Set(raw.legacyDone)]; s.activityDates = [...new Set(raw.activityDates)].sort();
    function cleanAttempt(a) {
      const l = lessons.find(l => l.day === a?.day);
      if (!l || ![1,2,3].includes(a.tier) || !Number.isFinite(Date.parse(a.at)) || !a.answers || typeof a.answers !== 'object') throw new Error('備份中的作答紀錄無效。');
      const qs = questions(l, a.tier); const answers = Object.fromEntries(qs.map(q => [q.id, a.answers[q.id]]));
      const g = grade(l, answers, a.tier);
      return { day:l.day,tier:a.tier,at:new Date(a.at).toISOString(),seconds:Number.isFinite(a.seconds)?Math.max(0,Math.min(1800,Math.round(a.seconds))):0,answers,...g };
    }
    if (!raw.completions || typeof raw.completions !== 'object' || !Array.isArray(raw.attempts)) throw new Error('備份缺少學習紀錄。');
    Object.entries(raw.completions).forEach(([d,c])=>{
      if (!days.has(Number(d)) || Number(d)!==c?.first?.day || Number(d)!==c?.last?.day) throw new Error('備份的關卡不符。');
      const first=cleanAttempt(c.first),last=cleanAttempt(c.last);
      s.completions[d]={first,last,best:Math.max(first.percent,last.percent,Number.isFinite(c.best)?Math.min(100,Math.max(0,c.best)):0)};
    });
    s.attempts = raw.attempts.slice(-2000).map(cleanAttempt);
    if (!raw.wrong || typeof raw.wrong!=='object' || !raw.wordProgress || typeof raw.wordProgress!=='object') throw new Error('備份缺少複習紀錄。');
    Object.values(raw.wrong).forEach(w=>{const l=lessons.find(l=>l.day===w?.day);if(!l?.questions.some(q=>q.id===w.questionId))throw new Error('備份錯題資料無效。');s.wrong[w.day+':'+w.questionId]={day:w.day,questionId:w.questionId,misses:Number.isInteger(w.misses)?Math.max(1,w.misses):1};});
    const words=new Set(lessons.flatMap(l=>l.words.map(wordKey)));
    Object.entries(raw.wordProgress).forEach(([k,w])=>{if(!words.has(k)||!Number.isInteger(w?.stage)||w.stage<0||w.stage>3||!validDate(w.due)||!validDate(w.last))throw new Error('備份單字資料無效。');s.wordProgress[k]={stage:w.stage,due:w.due,last:w.last};});
    // Drafts are optional and are reconstructed only from known question IDs.
    for(const l of lessons)for(const tier of [1,2,3]){const key=l.day+':'+tier,d=raw.drafts?.[key];if(d&&typeof d==='object'){const clean={};for(const q of questions(l,tier))if(Number.isInteger(d[q.id])&&d[q.id]>=0&&d[q.id]<q.options.length)clean[q.id]=d[q.id];s.drafts[key]=clean;}}
    return s;
  }
  return { dateKey, validDate, addDays, fresh, migrate, questions, unlockAt, isUnlocked, completedDays, streak, grade, submit, reviewQuestion, vocabulary, dueWords, reviewWord, firstAccuracy, recommendation, validateState };
});

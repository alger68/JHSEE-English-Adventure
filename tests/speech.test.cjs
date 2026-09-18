const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const S = require('../speech.js');
const voice = (name, lang = 'en-US', extra = {}) => ({name, lang, voiceURI:name, ...extra});
const us = voice('Samantha'), uk = voice('Daniel', 'en_GB');
function device(initial = [us, uk]) {
  let list = initial, tick = 0;
  const listeners = new Map(), timers = new Map(), spoken = [], errors = [];
  const synthesis = {paused:false, getVoices:()=>list, cancel(){this.cancels = (this.cancels || 0) + 1;}, speak:u=>spoken.push(u), resume(){this.paused = false;}, addEventListener:(n,f)=>listeners.set(n,f), removeEventListener:n=>listeners.delete(n)};
  const options = {synthesis, Utterance:class {constructor(text){this.text = text;}}, onError:e=>errors.push(e), setTimer:f=>{timers.set(++tick,f);return tick;}, clearTimer:id=>timers.delete(id)};
  return {options, synthesis, spoken, errors, timers, update(voices){list = voices;listeners.get('voiceschanged')?.();}, expire(){const callbacks = [...timers.values()];timers.clear();callbacks.forEach(f=>f());}};
}
test('Speech excludes non-English and known effect voices, even when they appear first', () => {
  const available = [voice('Bells'),voice('Bad News (English United States)'),voice('Zarvox'),voice('Chinese','zh-TW',{default:true}),uk,us,us];
  assert.deepEqual(S.englishVoices(available), [us,uk]);
  assert.equal(S.chooseVoice(available),us);
  assert.equal(S.chooseVoice([voice('Bubbles'),voice('French','fr-FR')]),null);
});
test('Speech prefers a natural voice but honors the learner’s explicit English selection', () => {
  const natural = voice('Microsoft Jenny Online (Natural)');
  assert.equal(S.chooseVoice([us,natural]),natural);
  assert.equal(S.chooseVoice([us,natural,uk],S.voiceKey(uk)),uk);
  assert.equal(S.chooseVoice([us,natural],'missing-device-voice'),natural);
  assert.equal(S.language(uk),'en-GB');
});
test('Speech preferences default to normal speed and reject invalid stored values', () => {
  assert.deepEqual(S.preferences(null),{rate:1,voice:''});
  assert.deepEqual(S.preferences({rate:99,voice:{}}),{rate:1,voice:''});
  assert.deepEqual(S.preferences({rate:.85,voice:S.voiceKey(uk)}),{rate:.85,voice:S.voiceKey(uk)});
});
test('Story and word playback share the chosen voice, its actual language, rate and normal pitch', () => {
  const d=device(), p=S.createPlayer(d.options);p.setVoice(S.voiceKey(uk));
  d.synthesis.paused=true;p.speak('A short story.',.85,'story');p.speak('wallet',1,'word');
  assert.equal(d.synthesis.paused,false);
  for(const u of d.spoken){assert.equal(u.voice,uk);assert.equal(u.lang,'en-GB');assert.equal(u.pitch,1);assert.equal(u.volume,1);}
  assert.deepEqual(d.spoken.map(u=>u.rate),[.85,1]);assert.equal(p.current().kind,'word');
});
test('Late voice loading starts the waiting request exactly once and cancels its timeout', () => {
  const d=device([]), p=S.createPlayer(d.options);p.speak('Ready?',1,'story');
  assert.equal(d.spoken.length,0);assert.equal(d.timers.size,1);
  d.update([us]);d.update([us,uk]);d.expire();
  assert.equal(d.spoken.length,1);assert.equal(d.timers.size,0);assert.deepEqual(d.errors,[]);
});
test('A newer request replaces pending speech and Stop prevents delayed playback', () => {
  const d=device([]), p=S.createPlayer(d.options);p.speak('Old');p.speak('New');d.update([us]);
  assert.deepEqual(d.spoken.map(u=>u.text),['New']);
  d.update([]);p.speak('Canceled');p.stop();d.update([us]);d.expire();
  assert.equal(d.spoken.length,1);assert.equal(p.current(),null);assert.deepEqual(d.errors,[]);
});
test('An alternative preview keeps its own voice through delayed loading without changing the default', () => {
  const d=device([]), p=S.createPlayer(d.options);p.setVoice(S.voiceKey(us));
  p.speak('Try another voice',1,'voice-preview',S.voiceKey(uk));
  d.update([us,uk]);assert.equal(d.spoken[0].voice,uk);
  assert.equal(p.selected(),us);p.speak('Return to reading');assert.equal(d.spoken[1].voice,us);
});
test('No English voice reports one useful error and never substitutes a different language', () => {
  const d=device([voice('Chinese','zh-TW'),voice('Bells')]), p=S.createPlayer(d.options);
  p.speak('Hello');d.expire();d.update([us]);
  assert.deepEqual(d.errors,['no-english-voice']);assert.equal(d.spoken.length,0);assert.equal(p.current(),null);
  p.speak('Try again');assert.equal(d.spoken.length,1);
});
test('A playback exception does not schedule an automatic replay or misreport voice availability', () => {
  const d=device(), p=S.createPlayer(d.options);d.synthesis.speak=()=>{throw Error('device failure');};
  p.speak('Hello');d.expire();d.update([us]);
  assert.deepEqual(d.errors,['playback']);assert.equal(d.timers.size,0);assert.equal(p.current(),null);
});
test('Canceled utterance callbacks cannot clear a new playback or show stale errors', () => {
  const d=device(), p=S.createPlayer(d.options);p.speak('Old');const old=d.spoken[0];p.speak('New');
  old.onend();old.onerror({error:'audio-busy'});assert.equal(p.current().text,'New');assert.deepEqual(d.errors,[]);
  d.spoken[1].onerror({error:'interrupted'});assert.equal(p.current(),null);assert.deepEqual(d.errors,[]);
  p.speak('Last');d.spoken[2].onerror({error:'network'});assert.deepEqual(d.errors,['network']);
});
test('Unsupported browsers fail gracefully without accessing absent speech methods', () => {
  const errors=[], p=S.createPlayer({synthesis:{},onError:e=>errors.push(e)});
  assert.equal(p.supported,false);assert.equal(p.speak('Hello'),false);p.stop();assert.deepEqual(errors,['unsupported']);
});
function app(storage = new Map(), initialVoices = [us,uk]) {
  const d=device(initialVoices), nodes=new Map();
  function node(selector){if(!nodes.has(selector))nodes.set(selector,{innerHTML:'',textContent:'',hidden:false,style:{},handlers:{},addEventListener(n,f){this.handlers[n]=f;},focus(){},scrollIntoView(){}});return nodes.get(selector);}
  const window={speechSynthesis:d.synthesis,SpeechSynthesisUtterance:d.options.Utterance,addEventListener(){},scrollTo(){}};
  const lessons=JSON.parse(fs.readFileSync(path.join(__dirname,'../content/week-01.json'),'utf8')).lessons;
  const context=vm.createContext({AdventureCore:require('../core.js'),AdaptiveCore:require('../adaptive-core.js'),EnglishSpeech:S,window,document:{querySelector:node,querySelectorAll:()=>[],visibilityState:'visible'},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},location:{hash:'#lesson/1',protocol:'file:'},lessons,lessonMeta:{version:'test'},ExamPage:{leave(){}},setTimeout:()=>1,clearTimeout(){},setInterval(){}});
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../app.js'),'utf8'),context);
  return {d,context,node,storage,change(id,value){node('#main').handlers.change({target:{id,value,matches:()=>false}});},click(action){node('#main').handlers.click({target:{closest:()=>({dataset:{action}})}});}};
}
test('App voice settings persist across reloads, apply to preview and words, and preserve learner drafts', () => {
  const C=require('../core.js'), s=C.fresh();s.xp=90;s.drafts['1:1']={'d1-q1':2};
  const storage=new Map([['jhseeStateV2',JSON.stringify(s)]]), a=app(storage);
  const original=storage.get('jhseeStateV2'), markup=a.node('#main').innerHTML;
  a.change('speechVoice',S.voiceKey(uk));a.change('speechRate','.85');a.click('preview-voice');
  assert.equal(a.d.spoken.at(-1).voice,uk);assert.equal(a.d.spoken.at(-1).rate,.85);
  assert.equal(storage.get('jhseeStateV2'),original);assert.equal(a.node('#main').innerHTML,markup);
  const b=app(storage);b.click('speak-story');assert.equal(b.d.spoken.at(-1).voice,uk);assert.equal(b.d.spoken.at(-1).rate,.85);
  vm.runInContext('wordsView(true,true)',b.context);b.click('speak-word');
  assert.equal(b.d.spoken.at(-1).voice,uk);assert.equal(b.d.spoken.at(-1).rate,.85);assert.equal(storage.get('jhseeStateV2'),original);
});
test('App changing rate during reading restarts only once and Stop cancels it', () => {
  const a=app();a.click('speak-story');a.change('speechRate','1.25');
  assert.equal(a.d.spoken.length,2);assert.equal(a.d.spoken[1].text,a.d.spoken[0].text);assert.equal(a.d.spoken[1].rate,1.25);
  a.click('stop-speech');assert.equal(vm.runInContext('voicePlayer.current()',a.context),null);
});
test('The main voice menu retains the original first option and keeps alternatives in a closed disclosure', () => {
  const a=app(), options=vm.runInContext('voiceOptions()',a.context);
  assert.match(options,/預設英文聲音（原本第一個）/);
  assert.equal((options.match(/<option /g)||[]).length,1);
  assert.match(a.node('#main').innerHTML,/<details class="speech-advanced"><summary>其他裝置聲音<\/summary>/);
  assert.doesNotMatch(options,/Daniel|Samantha/);
});
test('Previewing alternatives never saves them; Adopt and Restore default explicitly change the reading voice', () => {
  const a=app(), original=a.storage.get('jhseeStateV2');
  a.node('#otherSpeechVoice').value=S.voiceKey(uk);a.click('preview-other-voice');
  assert.equal(a.d.spoken.at(-1).voice,uk);assert.equal(a.storage.has('jhseeSpeechPreferencesV1'),false);
  a.change('speechRate','.85');assert.equal(a.d.spoken.at(-1).voice,uk);
  assert.equal(JSON.parse(a.storage.get('jhseeSpeechPreferencesV1')).voice,'');
  a.click('speak-story');assert.equal(a.d.spoken.at(-1).voice,us);
  a.click('apply-other-voice');assert.equal(JSON.parse(a.storage.get('jhseeSpeechPreferencesV1')).voice,S.voiceKey(uk));
  a.click('speak-story');assert.equal(a.d.spoken.at(-1).voice,uk);
  a.click('reset-voice');assert.equal(a.d.spoken.at(-1).voice,us);
  assert.deepEqual(JSON.parse(a.storage.get('jhseeSpeechPreferencesV1')),{rate:.85,voice:''});
  assert.equal(a.storage.get('jhseeStateV2'),original);
});

/* Device-provided English speech, shared by stories, vocabulary and previews. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.EnglishSpeech = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const RATES = [.6, .85, 1, 1.25];
  const noveltyNames = new Set(['albert','badnews','bahh','bells','boing','bubbles','cellos','deranged','goodnews','hysterical','jester','junior','organ','superstar','trinoids','whisper','wobble','zarvox']);
  const language = voice => String(voice?.lang || '').replace(/_/g, '-');
  const voiceKey = voice => JSON.stringify([voice.voiceURI || '', voice.name || '', language(voice)]);
  function novelty(voice) {
    // Some systems advertise musical/effect voices as en-US too.
    const name = String(voice.name || '').replace(/\([^)]*\)/g, '').toLowerCase().replace(/[^a-z]/g, '');
    const uriName = String(voice.voiceURI || '').split('.').at(-1).toLowerCase().replace(/[^a-z]/g, '');
    return noveltyNames.has(name) || noveltyNames.has(uriName);
  }
  function score(voice) {
    const name = String(voice.name || '');
    return (/^en-US$/i.test(language(voice)) ? 60 : /^en-GB$/i.test(language(voice)) ? 30 : 0)
      + (/natural|neural|premium|enhanced/i.test(name) ? 100 : 0)
      + (/Google US English|Google UK English|Samantha|Alex|Microsoft.*(?:Aria|Jenny|Guy|Zira|David)|Daniel|Karen|Moira/i.test(name) ? 35 : 0)
      + (voice.default ? 10 : 0)
      - (/^(Fred|Ralph|Kathy|Victoria)(?:\b|$)/i.test(name) ? 70 : 0);
  }
  function englishVoices(voices = []) {
    const unique = new Map();
    for (const voice of voices) if (/^en(?:-|$)/i.test(language(voice)) && !novelty(voice)) unique.set(voiceKey(voice), voice);
    return [...unique.values()].sort((a, b) => score(b) - score(a) || voiceKey(a).localeCompare(voiceKey(b)));
  }
  function chooseVoice(voices, preferred = '') {
    const options = englishVoices(voices);
    return options.find(v => voiceKey(v) === preferred) || options[0] || null;
  }
  function preferences(value) {
    return {rate:RATES.includes(value?.rate) ? value.rate : 1, voice:typeof value?.voice === 'string' && value.voice.length <= 2048 ? value.voice : ''};
  }
  function createPlayer({synthesis, Utterance, onVoices = () => {}, onError = () => {}, onWaiting = () => {}, setTimer = setTimeout, clearTimer = clearTimeout}) {
    let active = null, pending = null, timer = null, generation = 0, preferred = '';
    const supported = !!synthesis && typeof Utterance === 'function' && ['speak', 'cancel', 'getVoices'].every(method => typeof synthesis[method] === 'function');
    const voices = () => {
      try { return englishVoices(synthesis?.getVoices() || []); }
      catch { return []; }
    };
    function stop() {
      generation++;
      active = null; pending = null;
      if (timer !== null) clearTimer(timer);
      timer = null;
      if (supported) synthesis.cancel();
    }
    function start(job) {
      if (job.generation !== generation) return false;
      const voice = chooseVoice(voices(), job.voice);
      if (!voice) return false;
      if (timer !== null) clearTimer(timer);
      timer = null; pending = null;
      const utterance = new Utterance(job.text);
      utterance.voice = voice;
      utterance.lang = language(voice);
      utterance.rate = job.rate;
      utterance.pitch = 1;
      utterance.volume = 1;
      active = {...job, utterance};
      utterance.onend = () => { if (active?.utterance === utterance) active = null; };
      utterance.onerror = event => {
        if (active?.utterance !== utterance) return;
        active = null;
        if (!['canceled', 'interrupted'].includes(event.error)) onError(event.error || 'playback');
      };
      try {
        if (synthesis.paused) synthesis.resume();
        synthesis.speak(utterance);
      } catch {
        active = null; onError('playback');
      }
      // A voice was available: even a playback failure must not queue a retry.
      return true;
    }
    function speak(text, rate = 1, kind = 'word', voice = preferred) {
      stop();
      if (!supported) { onError('unsupported'); return false; }
      if (typeof text !== 'string' || !text.trim()) return false;
      const job = {text, rate:preferences({rate}).rate, kind, generation, voice:typeof voice === 'string' ? voice : preferred};
      if (start(job)) return true;
      pending = job;
      onWaiting();
      timer = setTimer(() => {
        if (pending !== job || job.generation !== generation) return;
        timer = null;
        if (!start(job)) { pending = null; onError('no-english-voice'); }
      }, 2000);
      return true;
    }
    function changed() {
      onVoices();
      if (pending) start(pending);
    }
    if (supported) synthesis.addEventListener?.('voiceschanged', changed);
    return {
      supported, voices, stop, speak,
      selected: () => chooseVoice(voices(), preferred),
      setVoice: key => { preferred = typeof key === 'string' ? key : ''; },
      current: () => { const job = active || pending; return job ? {text:job.text,rate:job.rate,kind:job.kind,voice:job.voice} : null; },
      destroy: () => { stop(); synthesis?.removeEventListener?.('voiceschanged', changed); }
    };
  }
  return {RATES, language, voiceKey, englishVoices, chooseVoice, preferences, createPlayer};
});

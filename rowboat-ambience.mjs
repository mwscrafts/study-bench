let ambience = null;

export function startRowboatAmbience() {
  if (ambience) return;
  const Audio = window.AudioContext || window.webkitAudioContext;
  if (!Audio) return;
  let context;
  try { context = new Audio(); } catch { return; }
  const master=context.createGain();
  master.gain.value=.34;
  master.connect(context.destination);
  const sampleRate=context.sampleRate;
  const buffer=context.createBuffer(1,sampleRate*3,sampleRate);
  const samples=buffer.getChannelData(0);
  for(let i=0;i<samples.length;i++) samples[i]=(Math.random()*2-1)*.72;
  const surf=context.createBufferSource();
  surf.buffer=buffer;surf.loop=true;
  const filter=context.createBiquadFilter();
  filter.type='lowpass';filter.frequency.value=680;filter.Q.value=.55;
  const surfGain=context.createGain();
  surfGain.gain.value=.001;
  surf.connect(filter);filter.connect(surfGain);surfGain.connect(master);
  surf.start();
  const state={context,master,surf,timers:[]};
  ambience=state;
  context.resume().catch(()=>{});
  master.gain.setTargetAtTime(.3,context.currentTime,.8);

  const wave=()=>{
    if(ambience!==state)return;
    const now=context.currentTime;
    const curve=new Float32Array([.003,.012,.033,.081,.144,.117,.072,.036,.012,.003]);
    surfGain.gain.cancelScheduledValues(now);
    surfGain.gain.setValueCurveAtTime(curve,now,4.4);
    state.timers.push(setTimeout(wave,6100+Math.random()*3200));
  };
  const gullNote=(delay=0)=>{
    if(ambience!==state)return;
    const now=context.currentTime+delay;
    const tone=context.createOscillator();
    const vibrato=context.createOscillator();
    const vibratoGain=context.createGain();
    const toneGain=context.createGain();
    const toneFilter=context.createBiquadFilter();
    tone.type='sine';tone.frequency.setValueAtTime(1110,now);
    tone.frequency.linearRampToValueAtTime(1550,now+.18);
    tone.frequency.linearRampToValueAtTime(1050,now+.5);
    tone.frequency.linearRampToValueAtTime(1370,now+.73);
    tone.frequency.linearRampToValueAtTime(870,now+1.02);
    vibrato.frequency.value=5.4;vibratoGain.gain.value=48;
    vibrato.connect(vibratoGain);vibratoGain.connect(tone.frequency);
    toneFilter.type='lowpass';toneFilter.frequency.value=2400;
    toneGain.gain.setValueAtTime(.0001,now);
    toneGain.gain.linearRampToValueAtTime(.024,now+.08);
    toneGain.gain.setValueAtTime(.018,now+.62);
    toneGain.gain.exponentialRampToValueAtTime(.0001,now+1.08);
    tone.connect(toneFilter);toneFilter.connect(toneGain);toneGain.connect(master);
    vibrato.start(now);tone.start(now);vibrato.stop(now+1.12);tone.stop(now+1.12);
    state.timers.push(setTimeout(()=>{try{tone.disconnect();toneFilter.disconnect();toneGain.disconnect();vibrato.disconnect();vibratoGain.disconnect();}catch{}},1400+delay*1000));
  };
  const gull=()=>{
    if(ambience!==state)return;
    const delay=.25;
    gullNote(delay);
    gullNote(delay+.72);
    state.timers.push(setTimeout(gull,22000+Math.random()*18000));
  };
  state.timers.push(setTimeout(wave,800));
  state.timers.push(setTimeout(gull,9000+Math.random()*10000));
}

export function stopRowboatAmbience() {
  const state=ambience;
  ambience=null;
  if(!state)return;
  for(const timer of state.timers)clearTimeout(timer);
  const now=state.context.currentTime;
  try {
    state.master.gain.cancelScheduledValues(now);
    state.master.gain.setTargetAtTime(.0001,now,.18);
    state.surf.stop(now+.75);
  } catch {}
  setTimeout(()=>state.context.close().catch(()=>{}),1000);
}

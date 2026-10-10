export let AudioSystem;
'use strict';
AudioSystem={create(sessionContext){
function beep(freq=300,len=.05,type='square',vol=.025){
      if(!sessionContext.sound)return;
      try{
        sessionContext.audio??=new(sessionContext.window.AudioContext||sessionContext.window.webkitAudioContext)();
        if(sessionContext.audio.state==='suspended')sessionContext.audio.resume();
        const o=sessionContext.audio.createOscillator(),g=sessionContext.audio.createGain();
        o.type=type;
        o.frequency.setValueAtTime(freq,sessionContext.audio.currentTime);
        o.frequency.exponentialRampToValueAtTime(freq*.5,sessionContext.audio.currentTime+len);
        g.gain.setValueAtTime(vol,sessionContext.audio.currentTime);
        g.gain.exponentialRampToValueAtTime(.001,sessionContext.audio.currentTime+len);
        o.connect(g);
        g.connect(sessionContext.audio.destination);
        o.start();
        o.stop(sessionContext.audio.currentTime+len);
      }catch{
      }
    }
return {beep};
}};

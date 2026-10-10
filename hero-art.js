/* Both heroes share one scale and floor baseline: Obelix remains larger. */
(() => {
  const sprites={};
  globalThis.HeroArt={status:'loading',get(name){return sprites[name]||null;}};
  if(typeof Image==='undefined')return;
  const atlas=new Image();
  atlas.onload=()=>{
    ['asterix','obelix'].forEach((name,i)=>{
      const c=document.createElement('canvas');c.width=128;c.height=128;
      const g=c.getContext('2d');g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
      const cell=atlas.naturalWidth/2;
      const size=name==='asterix'?112:128;
      g.drawImage(atlas,cell*i,0,cell,atlas.naturalHeight,(128-size)/2,(128-size)*.95,size,size);
      sprites[name]=c;
    });
    HeroArt.status='ready';document.dispatchEvent(new Event('hero-art-ready'));
  };
  atlas.onerror=()=>{HeroArt.status='fallback';console.warn('Hero atlas unavailable; using legacy sprites.');};
  atlas.src=new URL('hero-atlas-v2.png',document.currentScript.src).href;
})();

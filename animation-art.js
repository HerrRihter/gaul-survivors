/* Four actual drawn poses per walk/attack. Decode and cache once, not per actor. */
(() => {
  const sheets={},status={};
  const specs={heroes:{file:'heroes-animation.png',rows:4},legion:{file:'legion-animation.png',rows:6},centurion:{file:'centurion-animation.png',rows:2},legionhurt:{file:'legion-hurt.png',rows:3}};
  globalThis.AnimationArt={status,get(name,variant=0,action='walk',progress=0){
    if(action==='idle'){action='attack';progress=0;}
    const group=action==='hurt'&&name==='roman'?'legionhurt':name==='asterix'||name==='obelix'?'heroes':name==='boss'?'centurion':name==='roman'?'legion':null;
    if(!group||!sheets[group])return null;
    const row=group==='legionhurt'?variant%3:(group==='heroes'?(name==='obelix'?2:0):group==='legion'?(variant%3)*2:0)+(action==='attack'?1:0);
    const frame=action==='attack'||action==='hurt'?Math.min(3,Math.floor(Math.max(0,progress)*4)):Math.floor(((progress%1)+1)%1*4);
    return sheets[group][row*4+frame];
  }};
  if(typeof Image==='undefined')return;
  const base=document.currentScript.src;
  for(const [name,spec] of Object.entries(specs)){
    status[name]='loading';const image=new Image();
    image.onload=()=>{
      const frames=[],w=image.naturalWidth/4,h=image.naturalHeight/spec.rows;
      for(let row=0;row<spec.rows;row++)for(let col=0;col<4;col++){
        const c=document.createElement('canvas');c.width=128;c.height=128;
        const g=c.getContext('2d');g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
        const bounds=typeof AnimationLayout!=='undefined'&&AnimationLayout[name]?AnimationLayout[name][row*4+col]:[col*w,row*h,w,h];
        const [sx,sy,sw,sh]=bounds;
        const scale=128/w*(name==='heroes'?(row<2?.66:.84):name==='centurion'?.8:.75);
        // Source poses can reach across an implicit grid line. Measured opaque
        // bounds retain the entire spear/fist; a fixed cell pivot avoids jitter.
        if(name==='legionhurt'||name==='centurion'&&!(row===1&&col===2)){g.translate(128,0);g.scale(-1,1);}
        const dx=Math.max(2,Math.min(126-sw*scale,64+(sx-(col+.5)*w)*scale));
        g.drawImage(image,sx,sy,sw,sh,dx,115-sh*scale,sw*scale,sh*scale);frames.push(c);
      }
      sheets[name]=frames;status[name]='ready';document.dispatchEvent(new Event('animation-art-ready'));
    };
    image.onerror=()=>{status[name]='fallback';console.warn('Animation atlas unavailable: '+spec.file);document.dispatchEvent(new Event('animation-art-ready'));};
    image.src=new URL(spec.file,base).href;
  }
})();


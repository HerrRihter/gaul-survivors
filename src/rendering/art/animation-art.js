import {clampedFrame,loopFrame} from '../animation-player.js';
import {AnimationLayout} from '../../../data/animations/animation-layout.js';
import {AssetPaths} from '../asset-paths.js';
import {MotionV2Layout} from '../../../data/animations/motion-v2-layout.js';
export let AnimationArt;
/* Four actual drawn poses per walk/attack. Decode and cache once, not per actor. */
(() => {
  const sheets={},walkSheets={},status={};
  const specs={asterix:{file:'characters/heroes/asterix/animations.png',rows:2,scale:.66},obelix:{file:'characters/heroes/obelix/animations.png',rows:2,scale:.84},legion:{file:'characters/enemies/shared/legion-animation.png',rows:6},centurion:{file:'characters/enemies/shared/centurion-animation.png',rows:2},legionhurt:{file:'characters/enemies/shared/legion-hurt.png',rows:3}};
  AnimationArt={status,get(name,variant=0,action='walk',progress=0){
    if(action==='idle'){action='attack';progress=0;}
    const group=action==='hurt'&&name==='roman'?'legionhurt':name==='asterix'||name==='obelix'?name:name==='boss'?'centurion':name==='roman'?'legion':null;
    if(!group||!sheets[group])return null;
    if(action==='walk'&&walkSheets[group])return walkSheets[group][loopFrame(progress)];
    const row=group==='legionhurt'?variant%3:(group==='legion'?(variant%3)*2:0)+(action==='attack'?1:0);
    const frame=action==='attack'||action==='hurt'?clampedFrame(progress):loopFrame(progress);
    return sheets[group][row*4+frame];
  }};
  if(typeof Image==='undefined')return;
  for(const [name,spec] of Object.entries(specs)){
    status[name]='loading';const image=new Image();
    image.onload=()=>{
      const frames=[],w=image.naturalWidth/4,h=image.naturalHeight/spec.rows;
      for(let row=0;row<spec.rows;row++)for(let col=0;col<4;col++){
        const c=document.createElement('canvas');c.width=128;c.height=128;
        const g=c.getContext('2d');g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
        const bounds=typeof AnimationLayout!=='undefined'&&AnimationLayout[name]?AnimationLayout[name][row*4+col]:[col*w,row*h,w,h];
        const [sx,sy,sw,sh]=bounds;
        let scale=128/w*(spec.scale|| (name==='centurion'?.8:.75));
        if(row===0&&(name==='asterix'||name==='obelix'))scale*=Math.max(...AnimationLayout[name].slice(0,4).map(b=>b[3]))/sh;
        // Source poses can reach across an implicit grid line. Measured opaque
        // bounds retain the entire spear/fist; a fixed cell pivot avoids jitter.
        if(name==='legionhurt'||name==='centurion'&&!(row===1&&col===2)){g.translate(128,0);g.scale(-1,1);}
        const dx=Math.max(2,Math.min(126-sw*scale,64+(sx-(col+.5)*w)*scale));
        g.drawImage(image,sx,sy,sw,sh,dx,115-sh*scale,sw*scale,sh*scale);frames.push(c);
      }
      sheets[name]=frames;status[name]='ready';document.dispatchEvent(new Event('animation-art-ready'));
      const layout=MotionV2Layout[name];
      if(layout){
        const walk=new Image();
        walk.onload=()=>{
          const height=Math.min(128/w*spec.scale*Math.max(...AnimationLayout[name].slice(0,4).map(b=>b[3])),...layout.boxes.map(b=>124*b[3]/b[2]));
          walkSheets[name]=layout.boxes.map(([x,y,sw,sh])=>{
            const c=document.createElement('canvas');c.width=c.height=128;
            const g=c.getContext('2d'),k=height/sh;g.imageSmoothingEnabled=true;
            g.drawImage(walk,x,y,sw,sh,64-sw*k/2,115-height,sw*k,height);return c;
          });
          document.dispatchEvent(new Event('animation-art-ready'));
        };
        walk.src=AssetPaths.url(layout.file);
      }
    };
    image.onerror=()=>{status[name]='fallback';console.warn('Animation atlas unavailable: '+spec.file);document.dispatchEvent(new Event('animation-art-ready'));};
    image.src=AssetPaths.url(spec.file);
  }
})();

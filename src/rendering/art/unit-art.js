import {clampedFrame,loopFrame} from '../animation-player.js';
import {UnitLayout} from '../../../data/animations/unit-layout.js';
import {AssetPaths} from '../asset-paths.js';
export let UnitArt;
/* Dedicated, cached walk / attack / hurt atlases for specialist legion units. */
(()=>{
 const frames={},status={},names=['spear','pilum','veteran','turtle','ram'];
 const sizes={spear:84,pilum:84,veteran:80,turtle:106,ram:122};
 function get(name,action='idle',progress=0){
  if(!frames[name])return null;
  const row=action==='attack'?1:action==='hurt'?2:0;
  const col=action==='idle'?1:row?clampedFrame(progress):loopFrame(progress);
  return frames[name][row*4+col];
 }
 function draw(g,e){
  const reaction=e.hurt||e.visualHurt,attack=e.action;
  const ramImpact=e.charge&&e.charge.left>1.14;
  const action=reaction?'hurt':ramImpact?'attack':e.charge?'walk':attack?'attack':e.moving?'walk':'idle';
  const progress=reaction?reaction.elapsed/reaction.duration:ramImpact?.6:attack&&!e.charge?attack.elapsed/attack.duration:e.walk||0;
  const frame=get(e.unit,action,progress);if(!frame)return false;
  const flip=reaction?reaction.flip:attack?attack.flip:Math.cos(e.heading)<0;
  g.save();g.translate(Math.round(e.x),Math.round(e.y));if(flip)g.scale(-1,1);
  g.drawImage(frame,-128,-236);g.restore();return true;
 }
 UnitArt={status,get,draw};
 if(typeof Image==='undefined')return;
 for(const name of names){
  status[name]='loading';const image=new Image();
  image.onload=()=>{
   const boxes=UnitLayout[name],cell=image.naturalWidth/4;
   // One scale per entire sheet avoids changes in body size between poses.
   const walkHeight=Math.max(...boxes.slice(0,4).map(b=>b[3]));
   const scale=sizes[name]/walkHeight;
   frames[name]=boxes.map(([sx,sy,sw,sh],index)=>{
    const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;
    const g=canvas.getContext('2d');g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
    const dx=128+(sx-(index%4+.5)*cell)*scale;
    g.drawImage(image,sx,sy,sw,sh,dx,236-sh*scale,sw*scale,sh*scale);
    return canvas;
   });
   status[name]='ready';document.dispatchEvent(new Event('unit-art-ready'));
  };
  image.onerror=()=>{status[name]='fallback';console.warn('Unit atlas unavailable: '+name);};
  image.src=AssetPaths.url('characters/enemies/'+name+'/unit-'+name+'-v1.png');
 }
})();

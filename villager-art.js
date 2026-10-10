'use strict';
globalThis.VillagerArt=(()=>{
 const names=['cacofonix','antisanitarix','automatix','panoramix'],frames={},status={},heights={cacofonix:82,antisanitarix:78,automatix:88,panoramix:86};
 function get(name,action='idle',progress=0){
  if(!frames[name])return null;const row=action==='hurt'?2:action==='attack'?1:0;
  const col=action==='idle'?1:row?Math.min(3,Math.floor(Math.max(0,progress)*4)):Math.floor(((progress%1)+1)%1*4);
  return frames[name][row*4+col];
 }
 function draw(g,name,x,y,actor,flip=false){
  const a=actor||{},reaction=a.hurt,attack=a.action||a.visualAction;
  const action=reaction?'hurt':attack?'attack':a.moving?'walk':'idle';
  const progress=reaction?reaction.elapsed/reaction.duration:attack?attack.elapsed/attack.duration:a.walk||0;
  const frame=get(name,action,progress);if(!frame)return false;
  g.save();g.translate(Math.round(x),Math.round(y));if(reaction?reaction.flip:attack?attack.flip:flip)g.scale(-1,1);g.drawImage(frame,-128,-236);g.restore();return true;
 }
 if(typeof Image!=='undefined')for(const name of names){
  status[name]='loading';const images=[];let loaded=0;
  const finish=()=>{
   const boxes=VillagerLayout[name],cell=362;
   const lo=Math.min(...boxes.map((b,i)=>b[0]-(i%4)*cell)),hi=Math.max(...boxes.map((b,i)=>b[0]+b[2]-(i%4)*cell));
   const scale=Math.min(heights[name]/Math.max(...boxes.slice(0,4).map(b=>b[3])),105/Math.max(...boxes.map(b=>b[3])),112/(hi-lo)),pivot=(lo+hi)/2;
   frames[name]=boxes.map(([sx,sy,sw,sh],i)=>{
    const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.imageSmoothingEnabled=true;
    g.drawImage(images[i],0,0,sw,sh,128+(sx-i%4*cell-pivot)*scale,236-sh*scale,sw*scale,sh*scale);return c;
   });status[name]='ready';document.dispatchEvent(new Event('villager-art-ready'));
  };
  for(let i=0;i<12;i++){const image=new Image();images.push(image);image.onload=()=>{if(++loaded===12)finish();};image.onerror=()=>status[name]='fallback';image.src='hero-frames/'+name+'-'+i+'.png';}
 }
 return {status,get,draw};
})();
globalThis.HelmetArt=(()=>{
 let art=null;const api={status:'loading',draw(g,x,y,scale=1){if(!art)return false;g.save();g.fillStyle='#17271c66';g.beginPath();g.ellipse(x,y+7*scale,12*scale,4*scale,0,0,Math.PI*2);g.fill();g.drawImage(art,x-15*scale,y-20*scale,30*scale,30*scale);g.restore();return true;}};
 if(typeof Image!=='undefined'){const image=new Image();image.onload=()=>{art=document.createElement('canvas');art.width=art.height=64;const g=art.getContext('2d'),[x,y,w,h]=VillagerLayout.helmet;const scale=58/Math.max(w,h);g.drawImage(image,x,y,w,h,(64-w*scale)/2,(64-h*scale)/2,w*scale,h*scale);api.status='ready';};image.onerror=()=>api.status='fallback';image.src='roman-helmet-v1.png';}
 return api;
})();

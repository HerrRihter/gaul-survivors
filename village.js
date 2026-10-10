'use strict';
// Film-inspired scenery; playable layout reconstructed around a clear central square.
globalThis.Village=(()=>{
 const size=2200,cell=25,cols=88;
 const houses=[
  [755,785,160,125,'Кузница','forge'],[1010,575,175,130,'Дом друида','asterix'],[1310,780,170,130,'Дом вождя','chief'],
  [650,1050,155,145,'Рыбная лавка','fish'],[1440,1050,160,145,'Жилой дом','obelix'],
  [800,1320,160,125,'Астерикс','asterix'],[1080,1465,175,130,'Обеликс','obelix'],[1430,1380,120,105,'Дерево барда','bard']
 ].map(([x,y,w,h,name,art])=>({x,y,w,h,name,art}));
 const objects=houses.map(h=>({house:h,x:h.x+h.w/2,y:h.y+h.h,art:h.art,width:h.art==='bard'?300:h.art==='chief'?320:h.w+105}));
 for(const [x,y,width] of [[370,600,270],[460,950,240],[340,1310,300],[490,1640,270],[620,1860,240],[1620,1860,320],[1860,1620,290],[1860,1230,310],[1850,890,260],[1680,590,290],[800,420,260],[1260,390,320]])
  objects.push({x,y,width,art:'trees'});
 for(const [x,y,width] of [[650,550,260],[990,450,300],[1420,500,280],[1680,650,230],[490,780,180],[1770,1000,180],[450,1520,220],[750,1800,310],[1430,1840,330],[1780,1480,230]])
  objects.push({x,y,width,art:'fence'});
 objects.push({x:1100,y:1840,width:275,art:'gate'});
 let groundCache=null;
 function paintGround(g){
  g.fillStyle='#89954e';g.fillRect(0,0,size,size);
  if(typeof VillageArt!=='undefined'&&VillageArt.status['ground-v1']==='ready'){
   g.save();g.imageSmoothingEnabled=true;
   for(let y=0;y<size;y+=550)for(let x=0;x<size;x+=550)g.drawImage(VillageArt.images['ground-v1'],x,y,550,550);g.restore();
  }
  const roads=[
   [1100,2200,1130,1700,1000,1470,1100,1120,150],
   [0,1180,450,1280,710,1130,1100,1120,135],
   [1100,1120,1400,1070,1670,1300,2200,1100,145],
   [1100,1120,1180,980,1170,680,1240,0,110],
   [850,1460,570,1370,520,1020,920,960,88],
   [920,960,1020,840,1440,970,1570,1300,90],
   [1570,1300,1650,1620,1450,1770,1180,1650,100]
  ];
  let dirt='#c0af7d';
  if(typeof VillageArt!=='undefined'&&VillageArt.status['ground-v1']==='ready'){
   const tile=document.createElement('canvas');tile.width=tile.height=550;const t=tile.getContext('2d');
   t.drawImage(VillageArt.images['ground-v1'],0,0,550,550);
   t.fillStyle='#c4af83dc';t.fillRect(0,0,550,550);
   for(let i=0;i<4800;i++){t.fillStyle=i%3?'#66533b15':'#f5e1bb35';t.fillRect(i*13.71%550,i*87.23%550,1+i%3,1);}
   dirt=g.createPattern(tile,'repeat');
  }
  g.lineCap='round';g.lineJoin='round';
  for(const [extra,color] of [[18,'#8f8d55'],[8,'#b1a46e'],[0,dirt]]){
   for(const [x,y,a,b,c,d,e,f,w] of roads){
    g.strokeStyle=color;g.lineWidth=w+extra;g.beginPath();g.moveTo(x,y);g.bezierCurveTo(a,b,c,d,e,f);g.stroke();
   }
  }
  g.fillStyle=dirt;g.beginPath();g.ellipse(1120,1170,255,175,-.1,0,Math.PI*2);g.fill();
  // Deterministic, quiet flecks soften the lanes without adding visual collision.
  for(let i=0;i<1800;i++){const x=(i*397.31)%size,y=(i*673.73)%size;g.fillStyle=i%2?'#78674918':'#f3dcac25';g.fillRect(x,y,2+i%5,1+i%2);}
 }
 function drawGround(g){
  if(typeof VillageArt!=='undefined'&&VillageArt.status['ground-v1']==='ready'&&!groundCache){
   groundCache=document.createElement('canvas');groundCache.width=size;groundCache.height=size;paintGround(groundCache.getContext('2d'));
  }
  if(groundCache)g.drawImage(groundCache,0,0);else paintGround(g);
 }
 function drawObject(g,o,player){
  g.save();
  // Keep the hero visible when a roof or the bard's canopy overlaps them.
  if(player&&player.y<o.y&&player.y>o.y-o.width&&Math.abs(player.x-o.x)<o.width*.48)g.globalAlpha=.48;
  if(typeof VillageArt!=='undefined')VillageArt.draw(g,o.art,o.x,o.y+12,o.width);
  g.restore();
 }
 const collision=VillageCollision.create(objects,size),{blocked,clear}=collision;
 function move(a,dx,dy,r=14){
  const n=Math.max(1,Math.ceil(Math.hypot(dx,dy)/5));
  for(let i=0;i<n;i++){
   const next={x:a.x+dx/n,y:a.y+dy/n};
   if(clear(a,next,r)){a.x=next.x;a.y=next.y;continue;}
   if(clear(a,{x:next.x,y:a.y},r))a.x=next.x;
   if(clear(a,{x:a.x,y:next.y},r))a.y=next.y;
  }
 }
 const grids=new Map(),maps=new Map();
 const center=k=>({x:(k%cols+.5)*cell,y:(Math.floor(k/cols)+.5)*cell});
 function grid(r){
  if(grids.has(r))return grids.get(r);
  const free=new Uint8Array(cols*cols),edges=new Uint8Array(cols*cols);
  for(let k=0;k<free.length;k++){const p=center(k);free[k]=!blocked(p.x,p.y,r);}
  for(let k=0;k<free.length;k++)if(free[k]){
   const x=k%cols,y=Math.floor(k/cols);
   if(x+1<cols&&free[k+1]&&clear(center(k),center(k+1),r)){edges[k]|=1;edges[k+1]|=2;}
   if(y+1<cols&&free[k+cols]&&clear(center(k),center(k+cols),r)){edges[k]|=4;edges[k+cols]|=8;}
  }
  const out={free,edges};grids.set(r,out);return out;
 }
 function field(p,r){
  const {free,edges}=grid(r),tx=Math.floor(p.x/cell),ty=Math.floor(p.y/cell),target=tx+ty*cols;
  const cached=maps.get(r);if(cached&&cached.target===target&&clear(center(cached.seed),p,2))return cached;
  // A hero can stand in a gap that siege units cannot enter: route to the nearest reachable approach.
  let seed=-1,best=Infinity;
  for(let y=Math.max(0,ty-7);y<=Math.min(cols-1,ty+7);y++)for(let x=Math.max(0,tx-7);x<=Math.min(cols-1,tx+7);x++){
   const k=x+y*cols;if(!free[k])continue;const c=center(k),d=Math.hypot(c.x-p.x,c.y-p.y);
   if(d<best&&clear(c,p,2)){best=d;seed=k;}
  }
  if(seed<0)return null;
  const old=maps.get(r);if(old&&old.seed===seed)return old;
  const costs=new Int16Array(cols*cols).fill(-1),queue=new Int32Array(cols*cols);let n=1;queue[0]=seed;costs[seed]=0;
  for(let q=0;q<n;q++){const k=queue[q];for(const [flag,offset] of [[1,1],[2,-1],[4,cols],[8,-cols]])if(edges[k]&flag){const nk=k+offset;if(costs[nk]<0){costs[nk]=costs[k]+1;queue[n++]=nk;}}}
  const out={seed,costs,target};maps.set(r,out);return out;
 }
 function direction(a,p,r=14){
  const d=Math.hypot(p.x-a.x,p.y-a.y);
  if(clear(a,p,r))return {x:(p.x-a.x)/Math.max(1,d),y:(p.y-a.y)/Math.max(1,d)};
  const flow=field(p,r);if(!flow)return {x:0,y:0};
  const ax=Math.floor(a.x/cell),ay=Math.floor(a.y/cell);let best=null,score=Infinity;
  for(let y=ay-2;y<=ay+2;y++)for(let x=ax-2;x<=ax+2;x++){
   if(x<0||y<0||x>=cols||y>=cols)continue;const k=x+y*cols,b=center(k);if(flow.costs[k]<0||!clear(a,b,r))continue;
   const s=flow.costs[k]*cell*1.05+Math.hypot(a.x-b.x,a.y-b.y);if(s<score){score=s;best=b;}
  }
  if(!best)return {x:0,y:0};const n=Math.hypot(best.x-a.x,best.y-a.y);return {x:(best.x-a.x)/Math.max(1,n),y:(best.y-a.y)/Math.max(1,n)};
 }
 function draw(g){drawGround(g);for(const o of [...objects].sort((a,b)=>a.y-b.y))drawObject(g,o);}
 return {collision,houses,objects,blocked,move,direction,draw,drawGround,drawObject,clear};
})();

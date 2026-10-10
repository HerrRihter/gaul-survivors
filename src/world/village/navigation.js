export let VillageNavigation;
VillageNavigation={create({size,cell,cols,blocked,clear}){
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

return {move,direction};
}};

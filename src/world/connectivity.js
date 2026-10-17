import {VillageCollision} from './village/collision.js';

// Free space of a generated map must form one region around the spawn point (the map
// centre): otherwise scattered obstacles close off pockets where enemies appear and
// never reach the hero, and dead ends where the hero gets cornered.
const cell=25;

// Grid cells free for a body of radius r, grouped into 4-connected regions.
function regions(blocked,size,r){
 const cols=Math.ceil(size/cell),label=new Int32Array(cols*cols).fill(-1),free=new Uint8Array(cols*cols),list=[];
 for(let k=0;k<free.length;k++)free[k]=!blocked((k%cols+.5)*cell,(Math.floor(k/cols)+.5)*cell,r);
 const stack=new Int32Array(cols*cols);
 for(let start=0;start<free.length;start++){
  if(!free[start]||label[start]>=0)continue;
  const id=list.length,cells=[];let n=1;stack[0]=start;label[start]=id;
  while(n){
   const k=stack[--n];cells.push(k);const x=k%cols,y=(k-x)/cols;
   if(x>0&&free[k-1]&&label[k-1]<0){label[k-1]=id;stack[n++]=k-1;}
   if(x<cols-1&&free[k+1]&&label[k+1]<0){label[k+1]=id;stack[n++]=k+1;}
   if(y>0&&free[k-cols]&&label[k-cols]<0){label[k-cols]=id;stack[n++]=k-cols;}
   if(y<cols-1&&free[k+cols]&&label[k+cols]<0){label[k+cols]=id;stack[n++]=k+cols;}
  }
  list.push(cells);
 }
 return {cols,label,list};
}

// Removes the fewest obstacles needed (greedily) so that, for every radius, all free space
// joins the region around `origin`. `keep(o)` protects objects that must stay (fences).
// Mutates `objects`; deterministic for the same input.
export function openPockets(objects,size,radii,origin={x:size/2,y:size/2},keep=()=>false){
 for(let pass=0;pass<40;pass++){
  const collision=VillageCollision.create(objects,size);
  let removed=0;
  for(const r of radii){
   const {cols,label,list}=regions(collision.blocked,size,r);
   const main=label[Math.floor(origin.x/cell)+Math.floor(origin.y/cell)*cols];
   const pockets=list.map((cells,id)=>({id,cells})).filter(p=>p.id!==main);
   if(!pockets.length)continue;
   const reach=r+cell*1.5,near=(poly,x,y)=>x>poly.minX-reach&&x<poly.maxX+reach&&y>poly.minY-reach&&y<poly.maxY+reach;
   const center=k=>[(k%cols+.5)*cell,(Math.floor(k/cols)+.5)*cell];
   const mainCells=list[main];
   const doomed=new Set();
   for(const pocket of pockets){
    // Obstacles walling this pocket; prefer one that also borders the main region.
    const walls=collision.polygons.filter(poly=>!keep(poly.object)&&pocket.cells.some(k=>near(poly,...center(k))));
    if(!walls.length)continue;
    const touchesMain=poly=>mainCells.some(k=>near(poly,...center(k)));
    const pick=walls.filter(touchesMain).sort((a,b)=>a.object.width-b.object.width)[0]||walls[0];
    doomed.add(pick.object);
   }
   for(const o of doomed){objects.splice(objects.indexOf(o),1);removed++;}
   if(removed)break;
  }
  if(!removed)return;
 }
 throw Error('Map free space is still split after 40 clearing passes');
}

// Which grid cells a body of radius r can reach from `origin`; cached per radius.
export function createReachability(blocked,size,origin={x:size/2,y:size/2}){
 const cache=new Map();
 return function reachable(x,y,r){
  if(!cache.has(r)){
   const {cols,label}=regions(blocked,size,r);
   cache.set(r,{cols,label,main:label[Math.floor(origin.x/cell)+Math.floor(origin.y/cell)*cols]});
  }
  const {cols,label,main}=cache.get(r),cx=Math.floor(x/cell),cy=Math.floor(y/cell);
  // A blocked origin means the map was not built around it: do not forbid every spawn.
  if(main<0)return true;
  return cx>=0&&cy>=0&&cx<cols&&cy<cols&&label[cx+cy*cols]===main;
 };
}

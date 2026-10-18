import {VillageCollision} from './village/collision.js';
import {createReachability} from './connectivity.js';
import {VillageNavigation} from './village/navigation.js';
import {sceneryVisible} from './village/village-renderer.js';
import {LutetiaArt,LutetiaShapes} from '../rendering/art/lutetia-art.js';
import {UnitArt} from '../rendering/art/unit-art.js';

export function createLutetia(map={}){
 const size=2200,objects=[];let seed=map.seed||512;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const houseArts=Object.keys(LutetiaShapes).filter(name=>name.startsWith('house-'));
 // Footprints are stored unflipped; collision mirrors them together with the sprite.
 const outline=(art,width)=>LutetiaShapes[art].map(([u,v])=>[(u-.5)*width,(v-1)*width]);
 function place(art,x,y,width,flip=false){
  objects.push({x,y,width,art,flip,footprintPolygons:[outline(art,width)],island:!art.startsWith('tree-')});
  return objects.at(-1);
 }
 const worldPoints=o=>o.footprintPolygons[0].map(([x,y])=>[o.x+(o.flip?-x:x),o.y+y]);
 const span=(art,width,flip)=>{const xs=outline(art,width).map(([x])=>flip?-x:x);return [Math.min(...xs),Math.max(...xs)];};
 function hull(points){
  const sorted=[...points].sort((p,q)=>p[0]-q[0]||p[1]-q[1]),cross=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
  const half=list=>{const out=[];for(const p of list){while(out.length>1&&cross(out.at(-2),out.at(-1),p)<=0)out.pop();out.push(p);}out.pop();return out;};
  return [...half(sorted),...half(sorted.reverse())];
 }
 // A terrace is 1-3 attached houses. Their footprints overlap slightly and share one
 // convex ground block, so no slit between two houses can wedge a character.
 const overlap=8;
 function terrace(left,y,count,limit){
  const placed=[];let cursor=left,last=null;
  for(let i=0;i<count;i++){
   let art;do art=houseArts[Math.floor(random()*houseArts.length)];while(art===last);
   const width=Math.round(266+random()*30),flip=random()<.5,[l,r]=span(art,width,flip);
   const x=cursor-l-(placed.length?overlap:0);
   if(x+r>limit)break;
   placed.push(place(art,x,y,width,flip));cursor=x+r;last=art;
  }
  if(placed.length>1){
   const block=hull(placed.flatMap(worldPoints)),ax=placed[0].x;
   objects.push({x:ax,y,width:0,art:'block',flip:false,island:false,footprintPolygons:[block.map(([px,py])=>[px-ax,py-y])]});
  }
  return placed.length?cursor:left;
 }
 // Two residential quarters either side of the market avenue. Each row is filled with
 // terraces of 1-3 houses and alleys between them, then shifted by a random part of the
 // leftover width, so rows waver instead of lining up.
 const lamps=[];
 // The avenue between the quarters keeps at least 60 px of street around the garden rim.
 for(const [x0,x1] of [[30,850],[1350,2170]])for(const baseY of [330,640,950,1500,1800,2110]){
  const first=objects.length,firstLamp=lamps.length;
  let cursor=x0,right=x0,terraces=0;
  for(;;){
   const y=baseY+Math.round((random()-.5)*36),roll=random();
   const end=terrace(cursor,y,roll<.2?1:roll<.6?2:3,x1);
   if(end===cursor)break;
   right=end;
   if(terraces++%2===0)lamps.push({x:end+22,y:y+8,width:56,art:'lamp'});
   cursor=end+(random()<.12?190+random()*50:90+random()*45);
  }
  const shift=Math.round((x1-right)*random());
  for(const o of objects.slice(first))o.x+=shift;
  for(const o of lamps.slice(firstLamp))o.x+=shift;
 }
 place('guardpost-v3',1100,340,210);
 // The round terrace projects to an ellipse in this 768 x 622 sprite.
 // Follow its stone rim, including the rear arc, instead of a bounding box.
 const gardenWidth=380,gardenHeight=gardenWidth*622/768;
 const gardenRim=Array.from({length:48},(_,i)=>{
  const angle=i*Math.PI*2/48;
  return [Math.cos(angle)*gardenWidth*.497,(.64+Math.sin(angle)*.352-1)*gardenHeight];
 });
 objects.push({x:1100,y:710,width:gardenWidth,art:'garden-v2',footprintPolygons:[gardenRim]});
 place('fountain-v3',1100,1460,190);

 // Candidate points on a 20 px grid of open street.
 const centre={x:size/2,y:size/2};
 const grid=accept=>{const out=[];for(let y=150;y<size-60;y+=20)for(let x=80;x<size-80;x+=20)if(accept(x,y))out.push({x,y});return out;};
 const nearest=(p,list)=>list.reduce((best,q)=>Math.hypot(p.x-q.x,p.y-q.y)<Math.hypot(p.x-best.x,p.y-best.y)?q:best);
 // Even coverage: start from mutually distant points, then move each to the middle of the
 // candidates closest to it (k-means) and snap back onto a valid candidate. Centres of
 // equal shares of the street area land evenly inside the city, not on its border.
 function spread(count,candidates){
  if(!candidates.length)return [];
  const chosen=[nearest(centre,candidates)];
  while(chosen.length<Math.min(count,candidates.length)){
   let best=null,score=-1;
   for(const c of candidates){let d=Infinity;for(const a of chosen)d=Math.min(d,Math.hypot(c.x-a.x,c.y-a.y));if(d>score){score=d;best=c;}}
   chosen.push(best);
  }
  for(let round=0;round<12;round++){
   const groups=chosen.map(()=>[]);
   for(const c of candidates){let k=0,d=Infinity;chosen.forEach((a,i)=>{const e=Math.hypot(c.x-a.x,c.y-a.y);if(e<d){d=e;k=i;}});groups[k].push(c);}
   groups.forEach((group,i)=>{if(!group.length)return;const mean={x:group.reduce((t,c)=>t+c.x,0)/group.length,y:group.reduce((t,c)=>t+c.y,0)/group.length};chosen[i]=nearest(mean,group);});
  }
  return chosen;
 }
 const houses=VillageCollision.create(objects.filter(o=>o.footprintPolygons),size);
 // Trees stand on open ground, never right in front of a facade.
 const trees=[];
 for(const [i,{x,y}] of spread(map.trees||10,grid((x,y)=>!houses.blocked(x,y,90)&&!houses.blocked(x,y-140,70)&&Math.hypot(x-centre.x,y-centre.y)>260)).entries())
  trees.push(place(i%2?'tree-cypress-v3':'tree-broadleaf-v3',x,y,i%2?170:210));
 objects.push(...lamps);
 const collision=VillageCollision.create(objects.filter(o=>o.footprint||o.footprintPolygons),size);
 const navigation=VillageNavigation.create({size,cell:25,cols:88,...collision});
 const depthObjects=objects.map(o=>({...o,scenery:true})).sort((a,b)=>a.y-b.y);
 let ground=null;
 function paint(g){
  let paving='#a5aaa0';
  if(typeof document!=='undefined'){
   const tile=document.createElement('canvas');tile.width=120;tile.height=64;const t=tile.getContext('2d');
   t.fillStyle='#7e877c';t.fillRect(0,0,120,64);
   for(let y=0;y<4;y++)for(let x=-1;x<7;x++){
    const px=x*20+(y%2)*10,py=y*16,v=(x*3+y+20)%5;
    t.fillStyle=['#a9afa1','#b7baaa','#a0a99e','#b2b6a8','#a8b0a6'][v];
    t.beginPath();t.roundRect(px+1,py+1,18,14,[4,5,4,3]);t.fill();
    t.strokeStyle='#e2e0c660';t.lineWidth=1;t.beginPath();t.moveTo(px+4,py+3);t.lineTo(px+14,py+3);t.stroke();
   }
   paving=g.createPattern(tile,'repeat');
  }
  g.fillStyle=paving;g.fillRect(0,0,size,size);
  // Narrow stone edging follows the same ground polygons as collision.
  for(const polygon of collision.polygons){
   if(!polygon.object.island)continue;
   g.beginPath();polygon.points.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.closePath();
   g.fillStyle='#c9bd9d';g.fill();g.lineJoin='round';
   g.lineWidth=12;g.strokeStyle='#878b78';g.stroke();
   g.lineWidth=8;g.strokeStyle='#dfd3b1';g.stroke();
  }
 }
 function drawGround(g){
  if(!ground&&typeof document!=='undefined'){ground=document.createElement('canvas');ground.width=ground.height=size;paint(ground.getContext('2d'));}
  if(ground)g.drawImage(ground,0,0);else paint(g);
 }
 function drawLamp(g,o){
  const {x,y}=o;g.strokeStyle='#313d35';g.lineWidth=5;g.beginPath();g.moveTo(x,y-5);g.lineTo(x,y-88);g.stroke();
  g.fillStyle='#313d35';g.beginPath();g.ellipse(x,y-3,10,4,0,0,Math.PI*2);g.fill();
  g.fillStyle='#ffde7d';g.fillRect(x-7,y-102,14,20);g.strokeRect(x-7,y-102,14,20);
  g.beginPath();g.moveTo(x-12,y-103);g.lineTo(x,y-116);g.lineTo(x+12,y-103);g.closePath();g.fillStyle='#364438';g.fill();
 }
 function drawObject(g,o,p,view){
  if(!sceneryVisible(o,Math.max(o.width,120),view))return;
  g.save();if(p&&p.y<o.y&&p.y>o.y-o.width&&Math.abs(p.x-o.x)<o.width*.45)g.globalAlpha=.45;
  if(o.art==='block'){g.restore();return;}
  if(o.art==='lamp')drawLamp(g,o);
  else if(!LutetiaArt.draw(g,o.art,o.x,o.y,o.width,o.flip)){g.fillStyle='#bcad88';g.fillRect(o.x-o.width*.3,o.y-o.width*.3,o.width*.6,o.width*.3);}
  g.restore();
 }
 const reachable=createReachability(collision.blocked,size);
 // Merchants keep a stall in front of a facade, spread evenly over the city.
 const merchantRadius=35;
 const residents=spread(map.merchants||6,grid((x,y)=>!collision.blocked(x,y,merchantRadius+25)&&collision.blocked(x,y-75,30)&&reachable(x,y,merchantRadius)&&Math.hypot(x-centre.x,y-centre.y)>320&&trees.every(t=>Math.hypot(x-t.x,y-t.y)>130)))
  .map(({x,y})=>({unit:'merchant',x,y}));
 // Points of interest for city life: doors in front of facades, queue spots at the stalls,
 // and open squares (fountain, garden, guardpost, small squares between terraces).
 const walkable=(x,y)=>!collision.blocked(x,y,16)&&reachable(x,y,12);
 const doors=objects.filter(o=>o.art.startsWith('house-')).map(o=>({x:o.x,y:o.y+18})).filter(d=>walkable(d.x,d.y));
 const stalls=residents.map(m=>({x:m.x,y:m.y,queue:[-48,0,48].map(dx=>({x:m.x+dx,y:m.y+62})).filter(q=>walkable(q.x,q.y))}));
 const plazas=[{x:1100,y:1530},{x:1040,y:1520},{x:1160,y:1520},{x:1100,y:910},{x:1010,y:880},{x:1190,y:880},{x:1100,y:420},
  ...spread(6,grid((x,y)=>!collision.blocked(x,y,110)&&Math.hypot(x-centre.x,y-centre.y)>300))].filter(q=>walkable(q.x,q.y)&&residents.every(m=>Math.hypot(q.x-m.x,q.y-m.y)>150));
 const pointsOfInterest={doors,stalls,plazas};
 return {size,objects,roads:[],residents,pointsOfInterest,depthObjects,houses:[],collision,...navigation,reachable,blocked:collision.blocked,clear:collision.clear,drawGround,drawObject,draw(g){drawGround(g);const sorted=[...depthObjects,...residents].sort((a,b)=>a.y-b.y);for(const o of sorted)if(o.unit)UnitArt.draw(g,{...o,heading:0});else drawObject(g,o);}};
}

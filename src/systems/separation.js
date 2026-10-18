import {unitDefinitions} from '../../data/enemies/units.js';

// Units of one type share speed and route, so without this they melt into a single sprite.
// Overlapping bodies are pushed apart a little every frame, the lighter one more (mass ~ r²),
// through the world's swept movement so nobody is pushed into a wall. A spatial hash keeps
// the cost linear in the number of units; each unit makes one move with its summed pushes.
const CELL=64,STRENGTH=10,SPACING=.9;
const fixed=e=>e.charge||unitDefinitions[e.unit]?.stationary||unitDefinitions[e.unit]?.attack==='cavalry';

export function separateUnits(c,dt){
 const list=c.state.enemies,grid=new Map(),order=new Map(),k=Math.min(1,STRENGTH*dt);
 for(const e of list){
  if(e.hp<=0)continue;
  order.set(e,order.size);e.sepX=0;e.sepY=0;
  const key=Math.floor(e.x/CELL)*4096+Math.floor(e.y/CELL);
  let cell=grid.get(key);if(!cell)grid.set(key,cell=[]);cell.push(e);
 }
 for(const e of list){
  if(e.hp<=0)continue;
  const gx=Math.floor(e.x/CELL),gy=Math.floor(e.y/CELL);
  for(let y=gy-1;y<=gy+1;y++)for(let x=gx-1;x<=gx+1;x++){
   const cell=grid.get(x*4096+y);if(!cell)continue;
   for(const o of cell){
    // Each pair once: the unit created earlier handles it.
    if(order.get(o)<=order.get(e))continue;
    const want=(e.r+o.r)*SPACING;let dx=o.x-e.x,dy=o.y-e.y;const d2=dx*dx+dy*dy;
    if(d2>=want*want)continue;
    let d=Math.sqrt(d2);
    // Exactly stacked: split along a stable direction derived from the pair.
    if(d<.01){const a=(e.phase||0)*2.1+(o.phase||0)*3.7;dx=Math.cos(a);dy=Math.sin(a);d=1;}
    const push=(want-Math.max(d,.01))*k,me=fixed(e),them=fixed(o);
    if(push<.05||me&&them)continue;
    const we=e.r*e.r,wo=o.r*o.r,shareE=me?0:them?1:wo/(we+wo),shareO=1-shareE;
    e.sepX-=dx/d*push*shareE;e.sepY-=dy/d*push*shareE;o.sepX+=dx/d*push*shareO;o.sepY+=dy/d*push*shareO;
   }
  }
 }
 // One swept move per unit with the sum of its pushes.
 for(const e of list)if(e.hp>0&&(e.sepX*e.sepX+e.sepY*e.sepY)>.0025)c.Village.move(e,e.sepX,e.sepY,e.r);
}

import {unitDefinitions} from '../../data/enemies/units.js';
import {cityLife} from '../../data/maps/city-life.js';
import {say} from './city-life.js';

const spec=cityLife.citizens;
// A citizen strolls to a point of interest it can see (a stall queue, a square, a door),
// lingers there, and panics away from the hero. Goals are straight lines, so no citizen
// builds a flow field. Without points of interest (other maps) citizens simply wander.
function chooseGoal(e,c){
 const poi=c.Village.pointsOfInterest,s=c.state;if(!poi)return null;
 const taken=new Set(s.enemies.filter(o=>o!==e&&o.hp>0&&o.goal?.key).map(o=>o.goal.key));
 const options=[],total={w:0};
 const offer=(q,kind,weight,extra={})=>{
  const d=c.dist(e,q);if(d<40||d>spec.goalRange||!c.Village.clear(e,q,e.r))return;
  options.push({x:q.x,y:q.y,kind,weight,...extra});total.w+=weight;
 };
 poi.stalls.forEach((stall,i)=>stall.queue.forEach((q,j)=>{const key='stall'+i+'.'+j;if(!taken.has(key))offer(q,'stall',3,{key,face:stall});}));
 // A square holds a small group at most, so talkers do not pile into one heap.
 const gathered=q=>s.enemies.filter(o=>o!==e&&o.hp>0&&o.goal?.kind==='plaza'&&Math.hypot(o.goal.x-q.x,o.goal.y-q.y)<90).length;
 for(const q of poi.plazas)if(gathered(q)<spec.perPlaza)offer({x:q.x+c.rand(-35,35),y:q.y+c.rand(-25,25)},'plaza',2);
 // Join someone standing alone on a square: stand level with them, to the left or right,
 // so the two can face each other while talking.
 const awaited=new Set(s.enemies.filter(o=>o!==e&&o.hp>0&&o.goal?.pairWith).map(o=>o.goal.pairWith));
 for(const o of s.enemies){
  if(o===e||o.hp<=0||o.mode!=='linger'||o.goal?.kind!=='plaza'||o.partner||awaited.has(o)||o.until-s.t<3)continue;
  for(const side of e.x<o.x?[-1,1]:[1,-1]){
   const q={x:o.x+side*spec.talkDistance,y:o.y};
   if(c.Village.blocked(q.x,q.y,e.r+2)||!c.Village.clear(o,q,e.r))continue;
   offer(q,'plaza',3,{pairWith:o});break;
  }
 }
 for(const q of poi.doors)offer(q,'door',1);
 let roll=c.rand(0,total.w);
 for(const o of options)if((roll-=o.weight)<=0)return o;
 return options.at(-1)||null;
}
function release(e){if(e.partner?.partner===e)e.partner.partner=null;e.partner=null;}
function citizen(e,c,dt,move,wander){
 const s=c.state,p=s.p,distance=c.dist(e,p);
 if(distance<spec.panic){
  if(e.mode!=='flee')say(c,e,'panic');
  e.mode='flee';e.until=s.t+c.rand(1.2,2);e.goal=null;release(e);
 }
 if(e.mode!=='linger')e.activity=null;
 if(e.mode==='flee'){
  if(s.t<e.until)move(distance<1?(e.roamAngle??0):Math.atan2(e.y-p.y,e.x-p.x),e.speed*spec.flee);
  else e.mode=null;
  return;
 }
 if(e.mode==='linger'){
  e.moving=false;
  const g=e.goal,o=e.partner;
  // Talk only with a mutual partner standing beside, never with someone above or below.
  const partner=o&&o.hp>0&&o.mode==='linger'&&o.partner===e&&Math.abs(o.x-e.x)>spec.talkDistance/2&&Math.abs(o.y-e.y)<spec.talkDistance/2?o:null;
  if(o&&!partner)release(e);
  if(partner)e.heading=o.x>e.x?0:Math.PI;else if(g.face)e.heading=Math.atan2(g.face.y-e.y,g.face.x-e.x);
  const activity=spec.activities[partner?'chat':g.kind];
  if(activity!==e.activity){e.activity=activity;e.activityTime=0;}else e.activityTime+=dt;
  if(s.t>=e.until){e.mode=null;e.goal=null;e.activity=null;release(e);}
  return;
 }
 if(e.mode==='walk'){
  const g=e.goal,d=c.dist(e,g);
  if(d<14){
   // Going indoors removes the citizen quietly; replenishment brings others out of doors.
   if(g.kind==='door'){e.hp=0;return;}
   const [lo,hi]=spec.linger[g.kind];e.mode='linger';e.until=s.t+c.rand(lo,hi);
   // Pair up with the citizen this one walked over to; the two part at the same moment.
   const o=g.pairWith;
   if(o&&o.hp>0&&o.mode==='linger'&&!o.partner){e.partner=o;o.partner=e;o.until=e.until=Math.max(o.until,e.until);}
   return;
  }
  if(s.t>=e.checkAt){if(d>e.checkDistance-15){e.mode=null;e.goal=null;return;}e.checkAt=s.t+1.5;e.checkDistance=d;}
  move(Math.atan2(g.y-e.y,g.x-e.x),e.speed*spec.stroll);
  return;
 }
 if(!(e.roamUntil>s.t)){
  const goal=chooseGoal(e,c);
  if(goal){e.goal=goal;e.mode='walk';e.checkAt=s.t+1.5;e.checkDistance=c.dist(e,goal);return;}
 }
 wander();
}
export function updateCityPedestrian(e,c,dt){
 const ai=unitDefinitions[e.unit]?.ai,civilian=ai==='civilian';
 if(!civilian&&ai!=='thief')return false;
 const s=c.state,p=s.p;
 e.action=null;e.moving=false;
 const move=(angle,speed)=>{
  // Choose a clear local step instead of constructing a flow field for every pedestrian.
  let chosen=null;
  for(const offset of [0,.6,-.6,1.2,-1.2,Math.PI]){
   const a=angle+offset,q={x:e.x+Math.cos(a)*28,y:e.y+Math.sin(a)*28};
   if(c.Village.clear(e,q,e.r)){chosen=a;break;}
  }
  if(chosen===null){e.roamUntil=0;return;}
  e.heading=chosen;const ox=e.x,oy=e.y;
  const step=speed*(1-(e.abilitySlow||0))*dt;
  c.Village.move(e,Math.cos(chosen)*step+e.vx*dt,Math.sin(chosen)*step+e.vy*dt,e.r);
  const travel=Math.hypot(e.x-ox,e.y-oy);e.moving=travel>.01;e.walk=(e.walk||0)+travel/50;
 };
 const wander=()=>{
  if(!e.roamUntil||s.t>=e.roamUntil){e.roamAngle=c.rand(-Math.PI,Math.PI);e.roamUntil=s.t+c.rand(.6,2.1);}
  move(e.roamAngle,e.speed);
 };
 if(civilian){
  if(c.dist(e,p)<e.r+14&&c.Village.clear(e,p,2))c.hurtPlayer(e);
  citizen(e,c,dt,move,wander);return true;
 }
 // Thieves never pursue or attack the hero. Grab nearby loot, then retreat.
 let target=null,best=340;
 if(!(e.fleeUntil>s.t))for(const list of [s.gems,s.pickups])for(const item of list){
  if(item.dead)continue;const distance=c.dist(e,item);
  if(distance<best&&c.Village.clear(e,item,e.r)){target=item;best=distance;}
 }
 if(target&&best<22){
  target.dead=true;if(target.type==='food')e.hp=Math.min(e.max,e.hp+25);
  e.fleeUntil=s.t+2.2;e.roamUntil=0;
  if(s.texts.length<45)s.texts.push({x:e.x,y:e.y-50,v:target.type==='food'?'Перекус!':'Моё!',life:.8});
 }
 const distance=c.dist(e,p);
 if(e.fleeUntil>s.t||distance<145){
  const angle=distance<1?(e.roamAngle??c.rand(-Math.PI,Math.PI)):Math.atan2(e.y-p.y,e.x-p.x);
  move(angle,e.speed*1.25);
 }else if(target){move(Math.atan2(target.y-e.y,target.x-e.x),e.speed);}
 else wander();
 return true;
}

import {unitDefinitions} from '../../data/enemies/units.js';
import {campLanes} from '../world/arenas.js';
import {updateCityPedestrian} from './city-population.js';

// Units outside the legion loop: specialists, civilians and thieves (see data/enemies/units.js).
const fieldAi=new Set(['specialist','civilian','thief']);
// Poison applied without a pool (tests, abilities) uses the trail damage of the catalogue.
const trailDamage=Object.values(unitDefinitions).find(u=>u.trail)?.trail.damage;
export const fieldUnit=unit=>{const u=unitDefinitions[unit];return u&&fieldAi.has(u.ai)?u:null;};

export function prepareExpansion(e,c){
  if(fieldUnit(e.unit)?.attack!=='cavalry')return;
  const horizontal=c.Math.random()<.5,sign=c.Math.random()<.5?1:-1;
  const lane=c.state.t>=120?campLanes[Math.floor(c.Math.random()*campLanes.length)]+(c.Math.random()-.5)*60:1100;
  e.x=horizontal?(sign>0?40:2160):lane;e.y=horizontal?lane:(sign>0?40:2160);
  e.lane={x:horizontal?sign:0,y:horizontal?0:sign};e.heading=Math.atan2(e.lane.y,e.lane.x);
  c.beginAction(e,3,{x:e.x+e.lane.x*2200,y:e.y+e.lane.y*2200});
  if(e.action)e.action.warning=true;
}

export function expansionDrop(e,n,s){
  const every=unitDefinitions[e.unit]?.lootEvery;
  if(!every)return;
  // Health thresholds bound the total payout and work equally with fast and heavy hits.
  e.lootDamage=(e.lootDamage||0)+Math.min(n,Math.max(0,e.hp));
  while(e.lootDamage>=every){e.lootDamage-=every;s.gems.push({x:e.x,y:e.y,v:1});s.helmets.push({x:e.x+18,y:e.y,value:1});}
}

export function updateHazards(c,dt){
  const s=c.state,p=s.p;
  p.stun=Math.max(0,(p.stun||0)-dt);p.netGrace=Math.max(0,(p.netGrace||0)-dt);
  p.poisoned=Math.max(0,(p.poisoned||0)-dt);
  for(const h of s.winePools){h.life-=dt;if(!c.abilities?.active('elixir')&&Math.hypot(p.x-h.x,p.y-h.y)<h.radius){p.poisoned=h.poison;p.poisonDamage=h.damage;}}
  s.winePools=s.winePools.filter(h=>h.life>0);
  p.poisonClock=Math.max(0,(p.poisonClock||0)-dt);
  if(p.poisoned>0&&p.poisonClock<=0){c.hurtPlayer({damage:p.poisonDamage??trailDamage});p.poisonClock=.85;}
  if(p.stun>0)p.action=null;
}

export function updateExpansion(e,c,dt){
  const u=fieldUnit(e.unit);if(!u)return false;
  if(updateCityPedestrian(e,c,dt))return true;
  const s=c.state,p=s.p,d=c.dist(e,p);e.moving=false;
  const cavalry=u.attack==='cavalry';
  const advanceWalk=travel=>{if(travel>.01)e.walk=(e.walk||0)+(cavalry?dt*2:travel/50);};
  const move=(x,y,speed)=>{speed*=1-(e.abilitySlow||0);const ox=e.x,oy=e.y;c.Village.move(e,x*speed*dt,y*speed*dt,e.r);const travel=Math.hypot(e.x-ox,e.y-oy);e.moving=travel>.01;advanceWalk(travel);return travel;};
  if(u.attack==='none'){
    const angle=s.t*.22+e.phase;e.heading=angle;move(Math.cos(angle),Math.sin(angle),e.speed);return true;
  }
  if(e.crush){
    e.crush-=dt;
    if(e.crush<=0){if(d<u.crush.radius&&c.Village.clear(e,p,2))c.hurtPlayer({damage:u.crush.damage});s.fx.push({kind:'ring',x:e.x,y:e.y,r:u.crush.radius,life:.5,max:.5});e.hp=0;}
    return true;
  }
  if(e.charge){
    const q=e.charge,speed=(cavalry?u.speed:u.chargeSpeed)*(1-(e.abilitySlow||0));
    // Sweep contact checks so a charge cannot tunnel through the hero.
    const steps=Math.max(1,Math.ceil(speed*dt/10));let travel=0;
    for(let i=0;i<steps;i++){
      const ox=e.x,oy=e.y;c.Village.move(e,q.x*speed*dt/steps,q.y*speed*dt/steps,e.r);travel+=Math.hypot(e.x-ox,e.y-oy);
      if(c.dist(e,p)<e.r+14){
        c.hurtPlayer(e);
        if(cavalry&&!e.strike&&!e.struck)e.strike={elapsed:0,duration:.35};
      }
    }
    if(cavalry){
      if(!e.strike&&!e.struck&&d<110){
        e.strike={elapsed:0,duration:.35};
      }
      if(e.strike){
        e.strike.elapsed+=dt;
        if(e.strike.elapsed>=e.strike.duration){e.strike=null;e.struck=true;}
      }
    }
    e.moving=travel>.01;advanceWalk(travel);q.left-=dt;
    if(q.left<=0||travel<speed*dt*.7){e.charge=null;e.action=null;e.cd=2.5;if(u.crush)e.crush=u.crush.delay;if(cavalry)e.hp=0;}
    return true;
  }
  if(e.hurt)return true;
  c.advanceAction(e,dt,a=>{
    const angle=Math.atan2(a.aim.y-e.y,a.aim.x-e.x),x=Math.cos(angle),y=Math.sin(angle);e.heading=angle;
    if(u.attack==='charge'||cavalry){e.charge={x,y,left:u.chargeTime};}
    else if(u.attack==='net'||u.attack==='volley'){
      const count=u.arrows||1;
      for(let i=0;i<count;i++){const offset=count>1?(i-(count-1)/2)*u.arrowSpread:0;s.enemyShots.push({x:e.x,y:e.y,vx:Math.cos(angle+offset)*250,vy:Math.sin(angle+offset)*250,life:2.5,age:0,flightTime:Math.max(.01,Math.hypot(a.aim.x-e.x,a.aim.y-e.y)/250),damage:e.damage,kind:u.attack==='net'?'net':'arrow',stun:u.stun,stunGrace:u.stunGrace});}
    }else if(u.attack==='goods'){
      s.enemyShots.push({x:e.x,y:e.y,vx:x*u.projectileSpeed,vy:y*u.projectileSpeed,life:2,age:0,damage:e.damage,kind:'goods',goods:(e.throws||0)%3});
      e.throws=(e.throws||0)+1;c.soundEffect('throw');
    }else if(u.attack==='lunge'){
      const px=p.x-e.x,py=p.y-e.y;
      if(px*x+py*y>=-8&&px*x+py*y<u.range+14&&Math.abs(px*y-py*x)<24&&c.Village.clear(e,p,2))c.hurtPlayer(e);
    }else if(d<u.range+10&&c.Village.clear(e,p,2))c.hurtPlayer(e);
  });
  if(cavalry)return true;
  e.hidden=!!u.hidesBeyondRange&&d>u.range;
  if(!e.action&&e.cd<=0&&d<u.range&&c.Village.clear(e,p,2)){
    c.beginAction(e,u.wind,p);e.cd=u.cooldown;e.heading=Math.atan2(p.y-e.y,p.x-e.x);
  }
  if(!u.stationary&&!e.action&&!e.hidden&&d>(u.keepDistance??e.r+12)){
    const dir=c.Village.direction(e,p,e.r);e.heading=Math.atan2(dir.y,dir.x);move(dir.x,dir.y,e.speed);
  }
  if(u.trail){
    e.spill=(e.spill||0)-dt;
    if(e.spill<=0){e.spill=u.trail.every;s.winePools.push({x:e.x,y:e.y,life:u.trail.life,radius:u.trail.radius,poison:u.trail.poison,damage:u.trail.damage});if(s.winePools.length>160)s.winePools.shift();}
  }
  return true;
}

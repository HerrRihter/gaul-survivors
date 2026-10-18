import {prepareExpansion} from './expansion.js';
import {getWaveSchedule,normalWave,selectWaveUnit,scheduleStage} from './wave-schedule.js';
import {replenishPopulation} from './population.js';
export let EnemySpawning;
'use strict';
EnemySpawning={create(sessionContext){
// A hero who keeps running must meet enemies ahead, not only drag a crowd behind. Spawns lean
// toward the hero's recent heading and land just past the edge of the screen, and wave
// soldiers left far behind are moved out ahead again.
const AHEAD={speed:45,share:.7,spread:.9,margin:[40,140],maxDistance:1000},STRAGGLER={distance:1050,offscreen:120,behind:-.3,after:1,check:.5,perCheck:8};
function edgeDistance(angle){
      const halfW=(sessionContext.W||960)/2,halfH=(sessionContext.H||540)/2,c=sessionContext.Math.abs(sessionContext.Math.cos(angle)),s=sessionContext.Math.abs(sessionContext.Math.sin(angle));
      return sessionContext.Math.min(c>1e-3?halfW/c:Infinity,s>1e-3?halfH/s:Infinity);
    }
function spawnAngle(forceAhead=false){
      const d=sessionContext.state.drift,speed=d?sessionContext.Math.hypot(d.x,d.y):0;
      if(speed>AHEAD.speed&&(forceAhead||sessionContext.rand(0,1)<AHEAD.share)){
        const a=sessionContext.Math.atan2(d.y,d.x)+sessionContext.rand(-AHEAD.spread,AHEAD.spread);
        return {a,r:sessionContext.Math.min(AHEAD.maxDistance,sessionContext.Math.max(520,edgeDistance(a)+sessionContext.rand(AHEAD.margin[0],AHEAD.margin[1])))};
      }
      return {a:sessionContext.rand(0,sessionContext.Math.PI*2),r:sessionContext.rand(520,640)};
    }
function spawn(unit,boss=false,position=null,forceAhead=false){
      const s=sessionContext.state,p=s.p,u=sessionContext.Legion.units[unit];
      if(!u)throw new Error('Unknown unit: '+unit);
      // Spawn only where this body size can walk to the hero, never in an enclosed glade.
      const world=sessionContext.Village,open=(x,y)=>!world.blocked(x,y,u.r)&&(!world.reachable||world.reachable(x,y,u.r));
      let x,y;
      if(position){x=position.x;y=position.y;}
      for(let i=0;!position&&i<100;i++){
        const {a,r}=spawnAngle(forceAhead&&i<60);
        x=sessionContext.clamp(p.x+sessionContext.Math.cos(a)*r,u.r+10,sessionContext.WORLD-u.r-10);
        y=sessionContext.clamp(p.y+sessionContext.Math.sin(a)*r,u.r+10,sessionContext.WORLD-u.r-10);
        if(open(x,y)&&sessionContext.Math.hypot(x-p.x,y-p.y)>260)break;
      }
      if(position?world.blocked(x,y,u.r):!open(x,y))return;
      const e={
        x,
        y,
        unit,
        type:u.spriteType||(boss?'boss':'roman'),
        hp:u.hp,
        max:u.hp,
        r:u.r,
        speed:u.speed,
        damage:u.damage,
        boss,
        hit:0,
        cd:0,
        phase:u.spriteVariant??sessionContext.rand(0,3),
        vx:0,
        vy:0,
        heading:sessionContext.Math.atan2(p.y-y,p.x-x)
      };
      if(u.variants)e.variant=Number.isInteger(position?.variant)?((position.variant%u.variants)+u.variants)%u.variants:sessionContext.Math.floor(sessionContext.rand(0,u.variants))%u.variants;
      prepareExpansion(e,sessionContext);
      s.enemies.push(e);
      return e;
    }
// Smoothed hero velocity (about one second of memory) for spawning ahead.
function trackDrift(dt){
  const s=sessionContext.state,p=s.p,last=s.lastHero||{x:p.x,y:p.y},k=sessionContext.Math.min(1,dt/1.2);
  const vx=dt>0?(p.x-last.x)/dt:0,vy=dt>0?(p.y-last.y)/dt:0;
  s.drift=s.drift||{x:0,y:0};s.drift.x+=(vx-s.drift.x)*k;s.drift.y+=(vy-s.drift.y)*k;s.lastHero={x:p.x,y:p.y};
}
function recycleStragglers(dt){
  const s=sessionContext.state,p=s.p;
  s.stragglerCheck=(s.stragglerCheck||0)-dt;if(s.stragglerCheck>0)return;
  s.stragglerCheck=STRAGGLER.check;
  let moved=0;const d=s.drift||{x:0,y:0},speed=sessionContext.Math.hypot(d.x,d.y);
  for(const e of s.enemies){
    if(!e.wave||e.hp<=0||e.boss)continue;
    // A straggler is very far away, or off screen behind a hero who keeps running.
    const dx=e.x-p.x,dy=e.y-p.y,distance=sessionContext.Math.hypot(dx,dy);
    const trailing=speed>AHEAD.speed&&distance>edgeDistance(sessionContext.Math.atan2(dy,dx))+STRAGGLER.offscreen&&(dx*d.x+dy*d.y)/(distance*speed)<STRAGGLER.behind;
    if(distance<STRAGGLER.distance&&!trailing){e.behind=0;continue;}
    e.behind=(e.behind||0)+STRAGGLER.check;
    if(e.behind<STRAGGLER.after||moved>=STRAGGLER.perCheck)continue;
    const u=sessionContext.Legion.units[e.unit],world=sessionContext.Village;
    const fits=(x,y)=>!world.blocked(x,y,u.r)&&(!world.reachable||world.reachable(x,y,u.r))&&sessionContext.Math.hypot(x-p.x,y-p.y)>=400;
    for(let i=0;i<40;i++){
      const {a,r}=spawnAngle(true),x=sessionContext.clamp(p.x+sessionContext.Math.cos(a)*r,u.r+10,sessionContext.WORLD-u.r-10),y=sessionContext.clamp(p.y+sessionContext.Math.sin(a)*r,u.r+10,sessionContext.WORLD-u.r-10);
      if(!fits(x,y))continue;
      e.x=x;e.y=y;e.vx=0;e.vy=0;e.action=null;e.behind=0;e.heading=sessionContext.Math.atan2(p.y-y,p.x-x);moved++;break;
    }
  }
}
function updateSpawning(dt){
  const s=sessionContext.state,schedule=getWaveSchedule(s.map);
  trackDrift(dt);recycleStragglers(dt);
  replenishPopulation(sessionContext);
  const combatCount=()=>s.enemies.filter(e=>!sessionContext.Legion.units[e.unit].civilian&&e.hp>0).length;
  for(const spec of schedule.recurring){
    const next=s.waveNext[spec.unit]??spec.first;
    if(s.t<next)continue;
    const stage=scheduleStage(spec.stages,s.t);
    s.waveNext[spec.unit]=next+stage.every;
    if(spec.populationCap!==null&&combatCount()>=spec.populationCap)continue;
    if(s.enemies.filter(e=>e.unit===spec.unit&&e.hp>0).length>=stage.cap)continue;
    if(spawn(spec.unit)&&spec.message)sessionContext.toast(spec.message);
  }
  s.spawn-=dt;
  if(s.spawn<=0){
    const wave=normalWave(schedule,s.t);
    s.spawn=wave.interval;
    let population=combatCount();
    for(let i=0;i<wave.batch&&population<wave.cap;i++){
      const soldier=spawn(selectWaveUnit(schedule,s.t,sessionContext.Math.random()));
      if(soldier){soldier.wave=true;population++;}
    }
  }
  const boss=schedule.boss;
  if(boss&&s.t>=boss.time&&!s.bossSpawned&&spawn(boss.unit,true)){
    s.bossSpawned=true;
    if(boss.message)sessionContext.toast(boss.message);
    if(boss.sound)sessionContext.soundEffect(boss.sound);
  }
  for(const spec of schedule.notifications){
    if(s.t>=spec.time&&s.t-dt<spec.time)sessionContext.toast(spec.message);
  }
}
return {spawn,updateSpawning};
}};

import {prepareExpansion} from './expansion.js';
import {getWaveSchedule,normalWave,selectWaveUnit,scheduleStage} from './wave-schedule.js';
import {replenishPopulation} from './population.js';
export let EnemySpawning;
'use strict';
EnemySpawning={create(sessionContext){
function spawn(unit,boss=false,position=null){
      const s=sessionContext.state,p=s.p,u=sessionContext.Legion.units[unit];
      if(!u)throw new Error('Unknown unit: '+unit);
      // Spawn only where this body size can walk to the hero, never in an enclosed glade.
      const world=sessionContext.Village,open=(x,y)=>!world.blocked(x,y,u.r)&&(!world.reachable||world.reachable(x,y,u.r));
      let x,y;
      if(position){x=position.x;y=position.y;}
      for(let i=0;!position&&i<100;i++){
        const a=sessionContext.rand(0,sessionContext.Math.PI*2),r=sessionContext.rand(520,640);
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
      if(u.variants)e.variant=Number.isInteger(position?.variant)?((position.variant%u.variants)+u.variants)%u.variants:sessionContext.Math.floor(e.phase);
      prepareExpansion(e,sessionContext);
      s.enemies.push(e);
      return e;
    }
function updateSpawning(dt){
  const s=sessionContext.state,schedule=getWaveSchedule(s.map);
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
      if(spawn(selectWaveUnit(schedule,s.t,sessionContext.Math.random())))population++;
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

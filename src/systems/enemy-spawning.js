import {prepareExpansion,scheduleExpansion} from './expansion.js';
import {expansionUnits} from '../../data/enemies/units.js';
import {waves} from '../../data/enemies/waves.js';
export let EnemySpawning;
'use strict';
EnemySpawning={create(sessionContext){
function spawn(unit,boss=false){
      const s=sessionContext.state,p=s.p,u=sessionContext.Legion.units[boss?'boss':unit]||sessionContext.Legion.units.roman;
      unit=boss?'boss':sessionContext.Legion.units[unit]?unit:'roman';
      let x,y;
      for(let i=0;i<100;i++){
        const a=sessionContext.rand(0,sessionContext.Math.PI*2),r=sessionContext.rand(520,640);
        x=sessionContext.clamp(p.x+sessionContext.Math.cos(a)*r,u.r+10,sessionContext.WORLD-u.r-10);
        y=sessionContext.clamp(p.y+sessionContext.Math.sin(a)*r,u.r+10,sessionContext.WORLD-u.r-10);
        if(!sessionContext.Village.blocked(x,y,u.r)&&sessionContext.Math.hypot(x-p.x,y-p.y)>260)break;
      }
      if(sessionContext.Village.blocked(x,y,u.r))return;
      const e={
        x,
        y,
        unit,
        type:boss?'boss':expansionUnits[unit]?unit:unit==='turtle'||unit==='ram'?unit:'roman',
        hp:u.hp,
        max:u.hp,
        r:u.r,
        speed:u.speed,
        damage:u.damage,
        boss,
        hit:0,
        cd:0,
        phase:unit==='spear'?1:unit==='pilum'?2:sessionContext.rand(0,3),
        vx:0,
        vy:0,
        heading:sessionContext.Math.atan2(p.y-y,p.x-x)
      };
      prepareExpansion(e,sessionContext);
      s.enemies.push(e);
      return e;
    }
function updateSpawning(dt){
  const s=sessionContext.state,n=waves.normal;
  scheduleExpansion(sessionContext);
  s.spawn-=dt;
  if(s.spawn<=0){
    s.spawn=sessionContext.Math.max(n.minInterval,n.interval-s.t*n.timeFactor);
    const count=1+sessionContext.Math.floor(s.t/n.batchEvery);
    for(let i=0;i<count&&s.enemies.length<n.cap;i++)spawn(sessionContext.Legion.wave(s.t));
  }
  for(const [type,key]of [['turtle','nextTurtle'],['ram','nextRam']]){
    const spec=waves.siege[type];
    if(s.t>=s[key]){
      s[key]+=spec.every;
      if(s.enemies.filter(e=>e.unit===type).length<spec.cap){spawn(type);sessionContext.toast(spec.message);}
    }
  }
  if(s.t>=waves.boss.time&&!s.bossSpawned){
    s.bossSpawned=true;spawn('boss',true);sessionContext.toast(waves.boss.message);sessionContext.beep(90,.4,'sawtooth');
  }
  for(const spec of [...waves.units].reverse())if(s.t>=spec.time&&s.t-dt<spec.time)sessionContext.toast(spec.message);
}
return {spawn,updateSpawning};
}};

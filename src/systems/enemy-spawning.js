import {prepareExpansion,scheduleExpansion} from './expansion.js';
import {expansionUnits} from '../../data/enemies/units.js';
import {waves,lutetiaWaves,lutetiaStage,lutetiaWave} from '../../data/enemies/waves.js';
import {replenishCityCrowd} from './city-population.js';
export let EnemySpawning;
'use strict';
EnemySpawning={create(sessionContext){
function spawn(unit,boss=false,position=null){
      const s=sessionContext.state,p=s.p,u=sessionContext.Legion.units[boss?'boss':unit]||sessionContext.Legion.units.roman;
      unit=boss?'boss':sessionContext.Legion.units[unit]?unit:'roman';
      let x,y;
      if(position){x=position.x;y=position.y;}
      for(let i=0;!position&&i<100;i++){
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
  replenishCityCrowd(sessionContext);
  scheduleExpansion(sessionContext);
  s.spawn-=dt;
  if(s.spawn<=0){
    const city=s.map==='lutetia',stage=city?lutetiaStage(s.t):null;
    s.spawn=city?stage.interval:sessionContext.Math.max(n.minInterval,n.interval-s.t*n.timeFactor);
    const count=city?stage.batch:1+sessionContext.Math.floor(s.t/n.batchEvery);
    let population=s.enemies.filter(e=>!expansionUnits[e.unit]?.civilian&&e.hp>0).length;
    for(let i=0;i<count&&population<(city?stage.cap:n.cap);i++){
      if(spawn(city?lutetiaWave(s.t,sessionContext.Math.random()):sessionContext.Legion.wave(s.t)))population++;
    }
  }
  for(const [type,key]of [['turtle','nextTurtle'],['ram','nextRam']]){
    if(s.map==='lutetia'&&type==='ram')continue;
    const spec=s.map==='lutetia'?lutetiaWaves.turtle:waves.siege[type];
    if(s.t>=s[key]){
      s[key]+=spec.every;
      const cap=spec.late&&s.t>=spec.late?spec.lateCap:spec.cap;
      if(s.enemies.filter(e=>e.unit===type&&e.hp>0).length<cap){spawn(type);sessionContext.toast(spec.message||waves.siege[type].message);}
    }
  }
  if(s.t>=waves.boss.time&&!s.bossSpawned){
    s.bossSpawned=true;spawn('boss',true);sessionContext.toast(waves.boss.message);sessionContext.soundEffect('boss');
  }
  if(s.map!=='lutetia'){
    for(const spec of [...waves.units].reverse())if(s.t>=spec.time&&s.t-dt<spec.time)sessionContext.toast(spec.message);
  }else{
    for(const [time,message]of [[40,'ПИЛУМЫ · Метатели занимают улицы. Используй дома как укрытия.'],[85,'ВЕТЕРАНЫ · Тяжёлая пехота входит в город.'],[210,'ПОСЛЕДНИЙ НАТИСК · Легион усиливает наступление.']])if(s.t>=time&&s.t-dt<time)sessionContext.toast(message);
  }
}
return {spawn,updateSpawning};
}};

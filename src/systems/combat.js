import {expansionDrop} from './expansion.js';
import {helmetRewards} from '../../data/upgrades.js';
import {advanceAction} from '../core/action-timeline.js';
export let CombatSystem;
'use strict';
CombatSystem={create(sessionContext){
function damage(e,n,dx=0,dy=0,source=sessionContext.state.p){
      if(e.hp<=0||n<=0)return;
      n*=sessionContext.Legion.mitigation(e,source);
      expansionDrop(e,n,sessionContext.state);
      e.hp-=n;
      sessionContext.soundEffect('hit');
      e.hit=.12;
      const u=sessionContext.Legion.units[e.unit];
      // Units with their own art play a hurt pose; shared infantry ('roman') is interrupted instead.
      if(e.hp>0&&u.spriteType)e.visualHurt={elapsed:0,duration:.34,flip:sessionContext.Math.cos(e.heading)<0};
      if(e.hp>0&&e.type==='roman'){
        e.hurt={elapsed:0,duration:.34,flip:e.action?e.action.flip:e.x>sessionContext.state.p.x};
        e.action=null;
        e.cd=sessionContext.Math.max(e.cd,.45);
        e.moving=false;
      }else if(e.hp<=0){
        e.hurt=null;
        e.action=null;
      }
      const weight=u.knockback??(e.r>30?.12:1);
      e.vx+=dx*weight;
      e.vy+=dy*weight;
      if(sessionContext.state.texts.length<45)sessionContext.state.texts.push({x:e.x,y:e.y-25,v:sessionContext.Math.round(n),life:.55});
      if(e.hp<=0){
        sessionContext.soundEffect('death');
        sessionContext.Corpses.add(sessionContext.state.corpses,e,sessionContext.sprite,sessionContext.Math.hypot(dx,dy)>0?{x:dx,y:dy}:{x:e.x-source.x,y:e.y-source.y});
        // The ambient crowd is not a source of XP, kill rewards or random loot.
        if(sessionContext.Legion.units[e.unit].civilian)return;
        sessionContext.state.kills++;
        sessionContext.abilities?.onKill();
        sessionContext.state.earned+=sessionContext.Progression.kill();
        if(sessionContext.Math.random()<helmetRewards.dropChance)sessionContext.state.helmets.push({x:e.x,y:e.y,value:helmetRewards.dropValue});
        sessionContext.state.gems.push({x:e.x,y:e.y,v:sessionContext.Legion.units[e.unit].xp});
        for(let i=0;i<4;i++)sessionContext.state.fx.push({
          kind:'spark',
          x:e.x,
          y:e.y-10,
          vx:sessionContext.rand(-65,65),
          vy:sessionContext.rand(-70,20),
          life:.3,
          max:.3,
          color:'#e4c787'
        });
        if(sessionContext.Math.random()<helmetRewards.foodChance)sessionContext.state.pickups.push({x:e.x,y:e.y,type:'food'});
        if(e.boss){
          sessionContext.state.bossDead=true;
          sessionContext.toast(sessionContext.Legion.units[e.unit].name+' повержен! Продержись до пира.');
          sessionContext.soundEffect('boss');
          sessionContext.Progression?.recordBossKill?.();
        }
      }
    }
function throwStones(count,baseDamage,direction=null){
      const s=sessionContext.state,dir=direction||s.p.facing,angle=sessionContext.Math.atan2(dir.y,dir.x),spec=Object.values(sessionContext.Villagers.defs).find(h=>h.attack.kind==='stones').attack;
      for(let i=0;i<count;i++){
        const a=angle+(i-(count-1)/2)*spec.spread;
        s.shots.push({
          x:s.p.x,
          y:s.p.y-10,
          vx:sessionContext.Math.cos(a)*spec.speed,
          vy:sessionContext.Math.sin(a)*spec.speed,
          life:spec.life,
          r:spec.radius*s.stats.range*(1+(s.stats.stoneSize||0)),
          damage:baseDamage*s.stats.damage,
          hit:new Set(),
          age:0,
          angle:a+sessionContext.Math.PI
        });
      }
      sessionContext.soundEffect('stone');
    }
function beginAction(actor,duration,target){
      actor.action={elapsed:0,duration,hit:false,flip:target.x<actor.x,aim:{x:target.x,y:target.y}};
      const swing=sessionContext.Villagers.defs[sessionContext.selected]?.attack.swingSound;
      if(actor===sessionContext.state.p&&swing)sessionContext.soundEffect(swing);
    }
function hurtPlayer(e){
      const p=sessionContext.state.p;
      if(p.hp<=0||p.inv>0||sessionContext.abilities?.protectedMove())return;
      p.hp-=sessionContext.Math.max(1,e.damage-sessionContext.state.stats.armor);
      p.inv=.7;
      p.hurt={elapsed:0,duration:.34,flip:p.flip};
      sessionContext.state.shake=4;
      sessionContext.soundEffect('hurt');
      sessionContext.state.fx.push({kind:'hurt',x:p.x,y:p.y,r:25,life:.25,max:.25});
    }
function heroImpact(a){
      const s={...sessionContext.state,stats:(sessionContext.abilities?.effectiveStats()||sessionContext.state.stats)},p=s.p,dir=a.direction;
      const spec=sessionContext.Villagers.defs[sessionContext.selected],weapon=spec.attack,bonus=weapon.stats||{},stat=key=>s.stats[bonus[key]]||0;
      if(weapon.kind==='stones'){
        throwStones(1+stat('count'),weapon.damage*(1+stat('damage')),dir);
        return;
      }
      if(weapon.kind==='fish'){
        sessionContext.Villagers.fish(s,dir);
        return;
      }
      const r=(weapon.reach+stat('reach'))*s.stats.range,angle=sessionContext.Math.atan2(dir.y,dir.x),push=weapon.push+stat('push');
      s.fx.push({kind:'slash',x:p.x,y:p.y-8,r,angle,half:spec.half,life:.2,max:.2});
      for(const e of s.enemies){
        const dx=e.x-p.x,dy=e.y-p.y,d=sessionContext.Math.hypot(dx,dy),along=dx*dir.x+dy*dir.y;
        const delta=sessionContext.Math.abs(sessionContext.Math.atan2(dx*dir.y-dy*dir.x,along));
        if(e.hp>0&&d<r+e.r&&along>=0&&delta<=spec.half+sessionContext.Math.asin(sessionContext.Math.min(1,e.r/sessionContext.Math.max(1,d)))&&sessionContext.Village.clear(p,e,2))damage(e,spec.damage*s.stats.damage*(bonus.damage?1+stat('damage'):1),dir.x*push,dir.y*push);
      }
      if(!weapon.swingSound)sessionContext.soundEffect('throw');
    }
return {damage,throwStones,beginAction,advanceAction,hurtPlayer,heroImpact};
}};

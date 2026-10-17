import {abilityDefinitions,abilityUpgradeMax,abilityUpgradeId} from '../../data/characters/abilities.js';
import {heroDefinitions} from '../../data/characters/heroes.js';
import {permanentUpgradeDefinitions,heroTrainingDefinitions,runUpgradeDefinitions,supplyDefinitions} from '../../data/upgrades.js';
export let UpgradeSystem;
'use strict';
UpgradeSystem={create(Progression){
 const add=(key,value)=>s=>s.stats[key]=(s.stats[key]||0)+value;
 // Special stats change the hero or the wallet rather than state.stats (see data/upgrades.js).
 function effect(def){
  if(def.stat==='maxHp')return s=>{s.p.max+=def.value;s.p.hp=Math.min(s.p.max,s.p.hp+def.heal);};
  if(def.stat==='reserve')return s=>{s.p.max+=def.value;s.p.hp+=def.value;};
  if(def.stat==='fullHeal')return s=>s.p.hp=s.p.max;
  if(def.stat==='helmets')return s=>{Progression.earn(def.value);s.earned+=def.value;};
  return add(def.stat,def.value);
 }
 const card=def=>({id:def.id,name:def.name,desc:def.desc,icon:def.icon||'✦',max:def.max??3,apply:effect(def)});
 const common=runUpgradeDefinitions.map(card);
 const heroes=Object.fromEntries(Object.entries(heroDefinitions).map(([hero,def])=>[hero,def.upgrades.map(card)]));
 const abilities=Object.fromEntries(Object.entries(abilityDefinitions).map(([hero,defs])=>[hero,defs.map(a=>({
  id:abilityUpgradeId(a.id),ability:a.id,name:a.name,desc:a.upgrade,icon:'◆',max:abilityUpgradeMax,
  // Ranks of an ability that grants armour stop being offered once armour is maxed.
  available:()=>!a.grantsArmorRank||Progression.armorRank<Progression.upgrades.armor.max,
  // A rank that shortens the cooldown also shortens the current one.
  apply:s=>{if(a.cooldownPerRank){const slot=s.abilities?.find(x=>x.id===a.id);if(slot)slot.cd=Math.max(0,slot.cd-(slot.cooldownPerRank||0));}}
 }))]));
 const fallback=supplyDefinitions.map(def=>({...card(def),max:undefined}));
 function pool(hero,s){return [...common.map(u=>({...u,group:'Общее'})),...(heroes[hero]||[]).map(u=>({...u,group:'Оружие героя'})),...(abilities[hero]||[]).map(u=>({...u,group:'Активное умение'}))].filter(u=>(s.upgradeRanks?.[u.id]||0)<u.max&&(!u.available||u.available(s)));}
 function offer(hero,s,random=Math.random){const all=pool(hero,s),special=all.filter(u=>u.group==='Оружие героя'),result=[];
  if(special.length)result.push(special[Math.floor(random()*special.length)]);
  const active=all.filter(u=>u.group==='Активное умение');if(active.length)result.push(active[Math.floor(random()*active.length)]);
  const rest=all.filter(u=>!result.includes(u));for(let i=rest.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[rest[i],rest[j]]=[rest[j],rest[i]];}result.push(...rest.slice(0,4-result.length));
  for(const u of fallback){if(result.length===4)break;result.push({...u,group:'Припасы'});}return result;
 }
 function apply(u,s){if(u.available&&!u.available(s))return false;s.upgradeRanks??={};if(u.max&&(s.upgradeRanks[u.id]||0)>=u.max)return false;u.apply(s);if(u.max)s.upgradeRanks[u.id]=(s.upgradeRanks[u.id]||0)+1;return true;}
 function permanent(s,hero,levels){
  for(const key of ['haste','range','magnet','armor','regen']){
   const factor=permanentUpgradeDefinitions[key]?.factor;
   if(factor!==undefined)s.stats[key]+=(levels[key]||0)*factor;
  }
  const training=heroTrainingDefinitions[hero];
  if(training)add(training.stat,training.factor*(levels['training_'+hero]||0))(s);
 }
 return {common,heroes,abilities,pool,offer,apply,permanent};
}};

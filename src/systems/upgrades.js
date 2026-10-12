import {abilityDefinitions,abilityUpgradeDescriptions,abilityUpgradeMax,abilityUpgradeId} from '../../data/characters/abilities.js';
import {permanentUpgradeDefinitions,heroTrainingDefinitions} from '../../data/upgrades.js';
import {Progression} from './persistence.js';
export let UpgradeSystem;
'use strict';
UpgradeSystem=(()=>{
 const add=(key,value)=>s=>s.stats[key]=(s.stats[key]||0)+value;
 const item=(id,name,desc,key,value,max=3)=>({id,name,desc,icon:'✦',max,apply:add(key,value)});
 const common=[
  item('might','Сила деревни','+15% к базовому урону всех атак.','damage',.15,5),
  item('tempo','Второе дыхание','+12% к темпу атак и периодического урона.','haste',.12,5),
  item('area','Широкий размах','+12% к размеру оружия и областей урона.','range',.12,5),
  item('boots','Крылатые сандалии','+8% к скорости передвижения.','speed',.08,5),
  {id:'vitality',name:'Большой пир',desc:'+20 к максимуму здоровья и восстановление 30 HP.',icon:'♥',max:5,apply:s=>{s.p.max+=20;s.p.hp=Math.min(s.p.max,s.p.hp+30);}},
  item('recovery','Секрет друида','Восстановление ещё 0,5 HP в секунду.','regen',.5,5),
  item('armor','Галльская закалка','На 1 меньше урона от каждого попадания; минимум 1.','armor',1,5),
  item('magnet','Притяжение трофеев','+30 к радиусу притяжения опыта и шлемов.','magnet',30,5)
 ];
 const heroes={
  asterix:[item('punchTempo','Быстрые кулаки','+15% к темпу ударов кулаком.','punchTempo',.15),item('punchReach','Выпад','+12 к дальности удара кулаком.','punchReach',12),item('punchForce','Римлянин в полёте','+55 к силе отбрасывания кулаком.','punchForce',55)],
  obelix:[item('stoneCount','Охапка менгиров','Ещё один менгир в каждом броске веером.','stoneCount',1,2),item('stoneDamage','Тяжёлый гранит','+20% к базовому урону менгиров.','stoneDamage',.2),item('stoneSize','Камень побольше','+15% к размеру менгиров и области попадания.','stoneSize',.15)],
  cacofonix:[item('musicRange','Во весь голос','+15% к радиусу музыкальной ауры.','musicRange',.15),item('musicDamage','Фальшивая нота','+20% к базовому урону музыки.','musicDamage',.2),item('musicPush','Прочь со сцены','Музыка отталкивает врагов; +35 к силе толчка.','musicPush',35)],
  antisanitarix:[item('fishCount','Двойной улов','Ещё одна рыба в каждом броске веером.','fishCount',1,2),item('fishReturn','Рыба с душком','+30% к урону рыбы на обратном пути.','fishReturn',.3),item('fishSpeed','Ловкий бросок','+15% к скорости рыбы и дальности её вылета.','fishSpeed',.15)],
  automatix:[item('hammerDamage','Закалённый молот','+25% к базовому урону молота.','hammerDamage',.25),item('hammerReach','Длинная рукоять','+12 к дальности удара молотом. Сектор остаётся 180°.','hammerReach',12),item('hammerForce','Кузнечный размах','+65 к силе отбрасывания молотом.','hammerForce',65)],
  panoramix:[item('poisonDuration','Стойкий настой','Ядовитые лужи живут на 1 секунду дольше.','poisonDuration',1),item('poisonRange','Полная фляга','+20% к радиусу ядовитых луж.','poisonRange',.2),item('poisonDamage','Крепкое варево','+25% к базовому урону яда.','poisonDamage',.25)]
 };
 const abilities=Object.fromEntries(Object.entries(abilityDefinitions).map(([hero,defs])=>[hero,defs.map(a=>({
  id:abilityUpgradeId(a.id),ability:a.id,name:a.name,desc:abilityUpgradeDescriptions[a.id],icon:'◆',max:abilityUpgradeMax,
  available:()=>a.id!=='forge'||Progression.armorRank<Progression.upgrades.armor.max,
  apply:s=>{if(a.id==='forge'){const slot=s.abilities?.find(x=>x.id==='forge');if(slot)slot.cd=Math.max(0,slot.cd-6);}}
 }))]));
 const fallback=[{id:'herbs',name:'Травяной запас',desc:'+0,1 HP регенерации в секунду.',icon:'♥',apply:add('regen',.1)},{id:'food',name:'Перекус',desc:'Восстановить всё здоровье.',icon:'♥',apply:s=>s.p.hp=s.p.max},{id:'loot',name:'Римские трофеи',desc:'Получить 3 шлема в лавку.',icon:'◈',apply:s=>{Progression.earn(3);s.earned+=3;}},{id:'reserve',name:'Запас сил',desc:'+5 к максимуму и текущему здоровью.',icon:'♥',apply:s=>{s.p.max+=5;s.p.hp+=5;}}];
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
})();

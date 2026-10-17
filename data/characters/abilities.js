import {describe} from '../text.js';

// Active abilities (Q/E) per hero. Behaviour lives in src/systems/abilities.js, keyed by
// ability id; every number it uses is a field here. Ranks (0..abilityUpgradeMax) come from
// level-up cards during a run; `rank*` fields and `cooldownPerRank` describe what one rank
// adds. Activation snapshots the rank for effects that are already running.
export const abilityDefinitions = {
 asterix:[
  {id:'dash',name:'Галльский прорыв',cooldown:10,duration:.22,distance:180,damage:35,radius:22,push:180,rankDamage:.25,
   description:'Рывок на {distance} px: {damage} урона и отталкивание.',upgrade:'+{rankDamage%}% к базовому урону рывка за ранг.'},
  {id:'potion',name:'Волшебное зелье',cooldown:26,duration:6,haste:1.6,speed:1.15,pushBoost:1.5,rankDuration:1,
   description:'{duration} с: темп атак ×{haste}, скорость ×{speed}, удары отбрасывают сильнее.',upgrade:'Зелье действует на {rankDuration} секунду дольше за ранг.'}],
 obelix:[
  {id:'jump',name:'Галльский обвал',cooldown:14,duration:.55,distance:160,height:55,damage:65,radius:110,push:360,rankDamage:.25,
   description:'Прыжок: {damage} урона вокруг приземления в радиусе {radius}.',upgrade:'+{rankDamage%}% к базовому урону приземления за ранг.'},
  {id:'appetite',name:'Боевой аппетит',cooldown:30,duration:7,heal:2,rankHeal:1,
   description:'{duration} с: каждое убийство восстанавливает {heal} HP.',upgrade:'+{rankHeal} HP за убийство во время аппетита за ранг.'}],
 automatix:[
  {id:'forge',name:'Кузнечная закалка',cooldown:24,cooldownPerRank:6,duration:0,grantsArmorRank:true,
   description:'Навсегда повысить Крепкую кожу на 1 ранг (макс. 3). Бесплатно.',upgrade:'−{cooldownPerRank} секунд перезарядки закалки за ранг. Применение по-прежнему даёт 1 ранг Крепкой кожи.'},
  {id:'spin',name:'Кузнечный вихрь',cooldown:20,duration:3,period:.3,damage:18,radius:85,push:45,speed:.75,rankDamage:.25,
   description:'{duration} с: круговые удары молотом по {damage} урона каждые {period} с, движение медленнее.',upgrade:'+{rankDamage%}% к базовому урону каждого удара вихря за ранг.'}],
 cacofonix:[
  {id:'note',name:'Высокая нота',cooldown:18,duration:0,damage:20,radius:150,push:220,stun:1.2,rankDamage:.25,rankStun:.3,
   description:'Звуковая волна в радиусе {radius}: {damage} урона, толчок и оглушение на {stun} с.',upgrade:'+{rankDamage%}% к базовому урону и +{rankStun} с оглушения высокой ноты за ранг.'},
  {id:'concert',name:'Сольный концерт',cooldown:28,duration:3,radiusMultiplier:3,radiusPerRank:.5,
   description:'{duration} с: радиус музыкальной ауры ×{radiusMultiplier}.',upgrade:'Ещё +{radiusPerRank} к множителю радиуса концерта за ранг: ×3,5 / ×4 / ×4,5. Длительность — {duration} с.'}],
 antisanitarix:[
  {id:'volley',name:'Рыбный развал',cooldown:16,duration:0,count:5,damage:16,spread:70,rankCount:1,
   description:'Веер из {count} рыб-бумерангов по {damage} урона.',upgrade:'Ещё одна рыба в активном залпе за ранг.'},
  {id:'cloud',name:'Несвежий товар',cooldown:24,duration:5,damage:6,period:.5,radius:100,slow:.4,rankDamage:.25,rankRadius:.1,
   description:'Облако: урон и замедление на {slow%}% на {duration} с.',upgrade:'+{rankDamage%}% к базовому урону и +{rankRadius%}% к базовому радиусу облака за ранг.'}],
 panoramix:[
  {id:'brew',name:'Бурлящий настой',cooldown:18,duration:4,damage:12,period:.5,radius:90,distance:120,rankDamage:.25,rankRadius:.1,
   description:'Большая ядовитая область впереди: {damage} урона каждые {period} с.',upgrade:'+{rankDamage%}% к базовому урону и +{rankRadius%}% к базовому радиусу настоя за ранг.'},
  {id:'elixir',name:'Дубовый эликсир',cooldown:30,duration:5,healPerSecond:4,rankHeal:1,
   description:'Восстановить {heal} HP за {duration} с и защититься от отравления.',upgrade:'+{rankHeal} HP в секунду лечения эликсиром за ранг.'}]
};

for (const list of Object.values(abilityDefinitions)) for (const a of list) {
 a.description=describe(a.description,{...a,heal:a.heal??(a.healPerSecond||0)*a.duration});
 a.upgrade=describe(a.upgrade,a);
}

export const abilityUpgradeDescriptions=Object.fromEntries(Object.values(abilityDefinitions).flat().map(a=>[a.id,a.upgrade]));
export const abilityUpgradeMax=3;
export const abilityUpgradeId=id=>'ability_'+id;
export const abilityRank=(state,id)=>state.upgradeRanks?.[abilityUpgradeId(id)]||0;

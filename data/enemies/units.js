import {describe} from '../text.js';

// One catalogue for every unit. Systems read behaviour from fields, never from ids:
//   ai           'legion'     shared infantry loop (src/systems/simulation.js)
//                'specialist' src/systems/expansion.js, by `attack`
//                'civilian'   wanders, contact damage, no rewards (city-population.js)
//                'thief'      grabs loot and flees (city-population.js)
//                'treasurer'  boss that heals on dropped XP (malosinus.js)
//   attack       legion: 'slash' | 'lunge' | 'pilum' | 'charge'
//                specialist: 'slash' | 'lunge' | 'charge' | 'net' | 'volley' | 'goods' | 'cavalry' | 'none'
//   spriteType   frame family of the unit (default 'roman': shared infantry poses that a hit interrupts)
//   heavy        resists ability stuns, slows at most 15%
//   frontGuard   damage multiplier for hits from the front arc (shield wall)
//   knockback    fraction of push received (default: 0.12 for bodies wider than 30, else 1)
//   keepDistance stops approaching at this distance; stationary never moves
//   corpses      bodies left by a squad; labelHeight lifts the name above tall art
// `role` and `desc` feed the intel page; numbers come from the same definition ({field}).
// Key order is the spawn-preparation order of navigation grids; keep new units at the end.
const definitions={
  citizen:{name:'Горожанин',ai:'civilian',spriteType:'citizen',civilian:true,variants:3,
    hp:28,speed:110,damage:1,r:12,range:0,wind:0,cooldown:0,xp:0,color:'#dfc59c',
    role:'Горожанин',desc:'На иллюстрации — пекарь. В городе также встречаются носильщики и писцы. Хаотично бегает, не атакует. При столкновении — {damage} урон; не даёт опыта или добычи.'},
  auxiliary:{name:'Ауксиларий',ai:'specialist',attack:'lunge',spriteType:'auxiliary',labelHeight:108,
    hp:115,speed:51,damage:13,r:17,range:105,wind:1.05,cooldown:2.1,xp:3,color:'#d5b776',
    role:'Стража',desc:'Пузатая городская стража с круглыми щитами. Длинный выпад копьём на {range} px: уходи с линии замаха.'},
  merchant:{name:'Торговец',ai:'specialist',attack:'goods',spriteType:'merchant',stationary:true,projectileSpeed:215,labelHeight:118,
    hp:650,speed:0,damage:11,r:35,range:370,wind:1.15,cooldown:2.8,xp:12,color:'#e6c98b',
    role:'Рынок',desc:'Не покидает прилавок. {hp} HP; бросает яблоки, хлеб и кувшины. Прячься за домами.'},
  courtesan:{name:'Куртизанка',ai:'thief',spriteType:'courtesan',labelHeight:94,
    hp:65,speed:94,damage:3,r:13,range:0,wind:0,cooldown:0,xp:2,color:'#dca7d9',
    role:'Воровка',desc:'Подбирает опыт и еду, затем убегает. Избегает героя и не преследует его.'},
  boar:{name:'Кабан',ai:'specialist',attack:'charge',spriteType:'boar',chargeSpeed:340,chargeTime:1.2,telegraph:{length:430},labelHeight:70,
    hp:85,speed:85,damage:17,r:20,range:230,wind:1,cooldown:3,xp:2,color:'#d6a36d',
    role:'Зверь',desc:'Кабан предупреждает о рывке и несётся по прямой.'},
  stoneSquad:{name:'Отряд с камнем',ai:'specialist',attack:'charge',spriteType:'stoneSquad',heavy:true,chargeSpeed:340,chargeTime:1.2,telegraph:{length:430},
    crush:{delay:.65,radius:85,damage:60},labelHeight:136,
    hp:240,speed:42,damage:48,r:35,range:340,wind:1.5,cooldown:5,xp:7,color:'#c2c5b0',
    role:'Засада',desc:'Мощный разбег, затем камень падает на отряд: {crush.damage} урона в радиусе {crush.radius}. Отойди от зоны падения.'},
  netter:{name:'Засадник с сетью',ai:'specialist',attack:'net',spriteType:'netter',hidesBeyondRange:true,keepDistance:180,stun:1.25,stunGrace:4,labelHeight:96,
    hp:95,speed:45,damage:4,r:14,range:260,wind:1.3,cooldown:5,xp:3,color:'#abcb88',
    role:'Засада',desc:'Ждёт в засаде и бросает сеть. Стан на {stun} с, затем защита от повторного стана.'},
  tower:{name:'Осадная башня',ai:'specialist',attack:'volley',spriteType:'tower',heavy:true,keepDistance:390,arrows:3,arrowSpread:.13,labelHeight:180,
    hp:850,speed:19,damage:12,r:44,range:510,wind:1.7,cooldown:3.5,xp:20,color:'#d2ad75',
    role:'Осада',desc:'Медленная осадная башня со стрелками. Залп из {arrows} стрел.'},
  cavalry:{name:'Конница',ai:'specialist',attack:'cavalry',spriteType:'cavalry',heavy:true,chargeTime:8,labelHeight:140,
    hp:180,speed:310,damage:30,r:26,range:2200,wind:1.5,cooldown:0,xp:5,color:'#e2c195',
    role:'Рейд',desc:'Пересекает карту и уходит. С 2:00 атаки учащаются и охватывают проезды по всему лагерю.'},
  caius:{name:'Каюс Бонус',ai:'specialist',attack:'none',spriteType:'caius',lootEvery:100,labelHeight:114,
    hp:2600,speed:25,damage:0,r:27,range:0,wind:1,cooldown:1,xp:12,color:'#efcf73',
    role:'Казначей',desc:'Не атакует. Каждые {lootEvery} потерянных HP дают 1 опыт и 1 шлем.'},
  wine:{name:'Легионер-виночерпий',ai:'specialist',attack:'slash',spriteType:'wine',labelHeight:110,
    trail:{every:.45,life:6,radius:32,poison:2.5,damage:5},
    hp:140,speed:63,damage:8,r:16,range:40,wind:1,cooldown:2,xp:4,color:'#d493b5',
    role:'Пехота',desc:'Оставляет винный след на {trail.life} с. Отравление держится {trail.poison} с после выхода.'},
  malosinus:{name:'Казначей Малосинус',ai:'treasurer',spriteType:'malosinus',healPerXp:12,swingHalf:1.1,
    hp:2200,speed:58,damage:65,r:29,range:100,wind:1.6,cooldown:2.6,xp:100,color:'#edc757',mark:'¤',
    role:'Босс Лютеции',desc:'Уникальный босс Лютеции. {hp} HP. Удар мешком денег: {damage} урона; уходи из сектора во время замаха. Подбирает опыт и лечится на {healPerXp} HP за единицу.'},
  roman:{name:'Легионер',ai:'legion',attack:'slash',
    hp:60,speed:56,damage:9,r:12,range:36,wind:.64,cooldown:1.25,xp:1,color:'#b4c79b',mark:'I',
    role:'Пехота',desc:'Короткий удар мечом. Прерывается попаданием.'},
  spear:{name:'Копейщик',ai:'legion',attack:'lunge',spriteVariant:1,
    hp:90,speed:49,damage:15,r:12,range:108,wind:1.1,cooldown:2,xp:2,color:'#eed289',mark:'↗',
    role:'Пехота',desc:'Дальний выпад на {range} px по зафиксированной линии. Уйди вбок во время замаха.'},
  pilum:{name:'Метатель пилума',ai:'legion',attack:'pilum',spriteVariant:2,keepDistance:220,projectileSpeed:235,
    hp:75,speed:53,damage:13,r:12,range:310,wind:1.4,cooldown:2.8,xp:2,color:'#8bd2db',mark:'P',
    role:'Стрелок',desc:'Держится на дистанции и метает пилум. Снаряд останавливается о дом.'},
  veteran:{name:'Ветеран',ai:'legion',attack:'slash',knockback:.5,
    hp:150,speed:39,damage:23,r:16,range:65,wind:1.4,cooldown:2.2,xp:4,color:'#dc9a81',mark:'V',
    role:'Тяжёлая пехота',desc:'Тяжёлый удар с долгой подготовкой; отбрасывается вдвое слабее.'},
  turtle:{name:'Черепаха',ai:'legion',attack:'slash',spriteType:'turtle',heavy:true,frontGuard:.35,corpses:6,labelHeight:124,
    hp:480,speed:27,damage:20,r:46,range:90,wind:1.6,cooldown:2.7,xp:12,color:'#8aafd2',mark:'VI',
    role:'Строй',desc:'Шесть солдат как один строй. Щиты поглощают {frontGuardAbsorb%}% урона спереди; обходи сбоку или сзади.'},
  ram:{name:'Таран',ai:'legion',attack:'charge',spriteType:'ram',heavy:true,corpses:4,labelHeight:142,
    chargeSpeed:320,chargeTime:1.3,telegraph:{length:420,half:43},
    hp:650,speed:31,damage:32,r:46,range:360,wind:2.2,cooldown:5,xp:18,color:'#e3ab65',mark:'R',
    role:'Осада',desc:'Отряд с тараном разгоняется по отмеченной полосе. Столкновение с домом останавливает разгон.'},
  boss:{name:'Центурион',title:'Центурион Максимус',ai:'legion',attack:'slash',heavy:true,
    hp:1600,speed:64,damage:24,r:29,range:61,wind:.76,cooldown:1.15,xp:70,color:'#edc757',mark:'★',
    role:'Командир',desc:'Центурион завершает наступление. Победи его и продержись до пира.'},
};

for(const [id,unit] of Object.entries(definitions)){
  unit.id=id;
  if(unit.frontGuard)unit.frontGuardAbsorb=1-unit.frontGuard;
  unit.desc=describe(unit.desc,unit);
}

export const unitDefinitions=definitions;
export const units=unitDefinitions;

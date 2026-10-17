import {describe} from '../text.js';

// Hero catalogue. `attack.kind` selects the weapon code (src/systems/combat.js and
// src/entities/heroes.js):
//   'melee'  sector strike: damage, arc (degrees), reach, push
//   'stones' menhir fan: damage, speed, spread (radians between stones), radius, life
//   'fish'   boomerang: damage on the way out and back, speed, outbound time, radius
//   'aura'   passive ring: damage every period inside radius
//   'trail'  passive poison puddles while moving: damage every tick, life, radius, drop period
// `attack.stats` names the run stats this hero's weapon reads; `upgrades` (level-up cards)
// and `training` (permanent shop ranks) raise them. `price: 0` heroes are owned from the
// start. `walkStride` is world distance per walk cycle; `palette` colours the code-drawn
// portrait shown while frames load; `spriteScale`/`markerHeight` place shadow and marker.
const definitions={
  asterix:{
    name:'Астерикс',price:0,hp:110,speed:160,walkStride:55,markerHeight:67,
    interval:.68,wind:.44,
    attack:{kind:'melee',damage:25,arc:90,reach:70,push:145,swingSound:'punchSwing',
      stats:{tempo:'punchTempo',reach:'punchReach',push:'punchForce'}},
    weapon:'✦ ГАЛЛЬСКИЙ КУЛАК',
    desc:'Быстрый кулак: {attack.damage} урона, сектор {attack.arc}°.',
    upgrades:[
      {id:'punchTempo',name:'Быстрые кулаки',desc:'+{value%}% к темпу ударов кулаком.',stat:'punchTempo',value:.15},
      {id:'punchReach',name:'Выпад',desc:'+{value} к дальности удара кулаком.',stat:'punchReach',value:12},
      {id:'punchForce',name:'Римлянин в полёте',desc:'+{value} к силе отбрасывания кулаком.',stat:'punchForce',value:55},
    ],
    training:{name:'Школа кулачного боя',desc:'+{factor%}% к темпу кулаков',stat:'punchTempo',factor:.06},
  },
  obelix:{
    name:'Обеликс',price:0,hp:160,speed:133,walkStride:55,spriteScale:3.5,markerHeight:94,
    interval:1.12,wind:.72,
    attack:{kind:'stones',damage:52,speed:320,spread:.19,radius:11,life:2.2,
      stats:{count:'stoneCount',damage:'stoneDamage',size:'stoneSize'}},
    weapon:'◆ БОЕВОЙ МЕНГИР',
    desc:'Метает менгиры: {attack.damage} урона.',
    upgrades:[
      {id:'stoneCount',name:'Охапка менгиров',desc:'Ещё один менгир в каждом броске веером.',stat:'stoneCount',value:1,max:2},
      {id:'stoneDamage',name:'Тяжёлый гранит',desc:'+{value%}% к базовому урону менгиров.',stat:'stoneDamage',value:.2},
      {id:'stoneSize',name:'Камень побольше',desc:'+{value%}% к размеру менгиров и области попадания.',stat:'stoneSize',value:.15},
    ],
    training:{name:'Каменотёс',desc:'+{factor%}% к урону менгиров',stat:'stoneDamage',factor:.08},
  },
  cacofonix:{
    name:'Какафоникс',price:60,hp:100,speed:125,walkStride:55,
    attack:{kind:'aura',damage:12,period:.6,radius:95,
      stats:{range:'musicRange',damage:'musicDamage',push:'musicPush'}},
    weapon:'♫ НЕВЫНОСИМАЯ МУЗЫКА',
    desc:'Музыкальная аура вокруг героя: {attack.damage} урона каждые {attack.period} с в радиусе {attack.radius}.',
    upgrades:[
      {id:'musicRange',name:'Во весь голос',desc:'+{value%}% к радиусу музыкальной ауры.',stat:'musicRange',value:.15},
      {id:'musicDamage',name:'Фальшивая нота',desc:'+{value%}% к базовому урону музыки.',stat:'musicDamage',value:.2},
      {id:'musicPush',name:'Прочь со сцены',desc:'Музыка отталкивает врагов; +{value} к силе толчка.',stat:'musicPush',value:35},
    ],
    training:{name:'Уроки вокала',desc:'+{factor%}% к радиусу музыки',stat:'musicRange',factor:.06},
    palette:['#e1a748','#f4d467'],
  },
  antisanitarix:{
    name:'Антисанитарикс',price:75,hp:110,speed:140,walkStride:90,
    interval:1.2,wind:.5,
    attack:{kind:'fish',damage:24,speed:310,outbound:.65,radius:12,
      stats:{count:'fishCount',returnDamage:'fishReturn',speed:'fishSpeed'}},
    weapon:'♧ ТУХЛАЯ РЫБА',
    desc:'Рыба-бумеранг: по {attack.damage} урона на вылете и возвращении. Летит по последнему шагу.',
    upgrades:[
      {id:'fishCount',name:'Двойной улов',desc:'Ещё одна рыба в каждом броске веером.',stat:'fishCount',value:1,max:2},
      {id:'fishReturn',name:'Рыба с душком',desc:'+{value%}% к урону рыбы на обратном пути.',stat:'fishReturn',value:.3},
      {id:'fishSpeed',name:'Ловкий бросок',desc:'+{value%}% к скорости рыбы и дальности её вылета.',stat:'fishSpeed',value:.15},
    ],
    training:{name:'Выдержанный улов',desc:'+{factor%}% к урону возвращающейся рыбы',stat:'fishReturn',factor:.1},
    palette:['#63a1ad','#dbc4a0'],
  },
  automatix:{
    name:'Автоматикс',price:90,hp:150,speed:105,walkStride:90,
    interval:1.1,wind:.6,
    attack:{kind:'melee',damage:50,arc:180,reach:70,push:145,
      stats:{damage:'hammerDamage',reach:'hammerReach',push:'hammerForce'}},
    weapon:'⚒ ТЯЖЁЛЫЙ МОЛОТ',
    desc:'Медленный кузнец: {attack.damage} урона замахом на {attack.arc}° перед собой.',
    upgrades:[
      {id:'hammerDamage',name:'Закалённый молот',desc:'+{value%}% к базовому урону молота.',stat:'hammerDamage',value:.25},
      {id:'hammerReach',name:'Длинная рукоять',desc:'+{value} к дальности удара молотом. Сектор остаётся 180°.',stat:'hammerReach',value:12},
      {id:'hammerForce',name:'Кузнечный размах',desc:'+{value} к силе отбрасывания молотом.',stat:'hammerForce',value:65},
    ],
    training:{name:'Секрет кузнеца',desc:'+{factor%}% к урону молота',stat:'hammerDamage',factor:.1},
    palette:['#55402e','#de6a39'],
  },
  panoramix:{
    name:'Панорамикс',price:100,hp:90,speed:130,walkStride:90,
    attack:{kind:'trail',damage:8,tick:.5,life:3.5,radius:30,drop:.22,
      stats:{duration:'poisonDuration',range:'poisonRange',damage:'poisonDamage'}},
    weapon:'⚗ ЯДОВИТЫЙ СЛЕД',
    desc:'При движении оставляет яд на {attack.life} с. Враги получают {attack.damage} урона каждые {attack.tick} с.',
    upgrades:[
      {id:'poisonDuration',name:'Стойкий настой',desc:'Ядовитые лужи живут на {value} секунду дольше.',stat:'poisonDuration',value:1},
      {id:'poisonRange',name:'Полная фляга',desc:'+{value%}% к радиусу ядовитых луж.',stat:'poisonRange',value:.2},
      {id:'poisonDamage',name:'Крепкое варево',desc:'+{value%}% к базовому урону яда.',stat:'poisonDamage',value:.25},
    ],
    training:{name:'Рецепт друида',desc:'+{factor} с к длительности яда',stat:'poisonDuration',factor:.4},
    palette:['#e7e1cb','#eee9d9'],
  },
};

for(const [id,hero] of Object.entries(definitions)){
  hero.id=id;
  // Melee reads `half` (radians either side of the facing direction).
  if(hero.attack.arc)hero.half=hero.attack.arc/2*Math.PI/180;
  hero.damage=hero.attack.damage;
  hero.passive=hero.interval===undefined;
  hero.desc=describe(hero.desc,hero);
  for(const upgrade of hero.upgrades)upgrade.desc=describe(upgrade.desc,upgrade);
  hero.training.desc=describe(hero.training.desc,hero.training);
}

export const heroDefinitions=definitions;
export const starterHeroes=Object.keys(definitions).filter(id=>!definitions[id].price);

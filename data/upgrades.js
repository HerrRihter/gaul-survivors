import {describe} from './text.js';
import {heroDefinitions} from './characters/heroes.js';

// Level-up cards shared by every hero. `stat` adds `value` per rank to state.stats;
// special stats: 'maxHp' raises max health and heals `heal` (capped). Hero weapon cards
// live in data/characters/heroes.js, ability ranks in data/characters/abilities.js.
export const runUpgradeDefinitions=[
  {id:'might',name:'Сила деревни',desc:'+{value%}% к базовому урону всех атак.',stat:'damage',value:.15,max:5},
  {id:'tempo',name:'Второе дыхание',desc:'+{value%}% к темпу атак и периодического урона.',stat:'haste',value:.12,max:5},
  {id:'area',name:'Широкий размах',desc:'+{value%}% к размеру оружия и областей урона.',stat:'range',value:.12,max:5},
  {id:'boots',name:'Крылатые сандалии',desc:'+{value%}% к скорости передвижения.',stat:'speed',value:.08,max:5},
  {id:'vitality',name:'Большой пир',desc:'+{value} к максимуму здоровья и восстановление {heal} HP.',stat:'maxHp',value:20,heal:30,max:5,icon:'♥'},
  {id:'recovery',name:'Секрет друида',desc:'Восстановление ещё {value} HP в секунду.',stat:'regen',value:.5,max:5},
  {id:'armor',name:'Галльская закалка',desc:'На {value} меньше урона от каждого попадания; минимум 1.',stat:'armor',value:1,max:5},
  {id:'magnet',name:'Притяжение трофеев',desc:'+{value} к радиусу притяжения опыта и шлемов.',stat:'magnet',value:30,max:5},
];

// Unlimited cards offered once every rank above is taken. Special stats: 'fullHeal',
// 'helmets' (into the shop wallet), 'reserve' (raises max and current health, uncapped).
export const supplyDefinitions=[
  {id:'herbs',name:'Травяной запас',desc:'+{value} HP регенерации в секунду.',stat:'regen',value:.1,icon:'♥'},
  {id:'food',name:'Перекус',desc:'Восстановить всё здоровье.',stat:'fullHeal',icon:'♥'},
  {id:'loot',name:'Римские трофеи',desc:'Получить {value} шлема в лавку.',stat:'helmets',value:3,icon:'◈'},
  {id:'reserve',name:'Запас сил',desc:'+{value} к максимуму и текущему здоровью.',stat:'reserve',value:5,icon:'♥'},
];

// Permanent shop ranks bought with helmets.
export const permanentUpgradeDefinitions = {
  health: {name: 'Запас здоровья', desc: '+{factor} HP всем героям', max: 5, stat: 'hp', factor: 10},
  power: {name: 'Сила деревни', desc: '+{factor%}% урона всем героям', max: 5, stat: 'damage', factor: 0.05},
  speed: {name: 'Удобные сандалии', desc: '+{factor%}% скорости всем героям', max: 5, stat: 'speed', factor: 0.03},
  haste: {name: 'Выносливость', desc: '+{factor%}% к темпу атак', max: 5, stat: 'haste', factor: 0.04},
  range: {name: 'Размах', desc: '+{factor%}% к размеру атак', max: 5, stat: 'range', factor: 0.04},
  magnet: {name: 'Сумка трофеев', desc: '+{factor} к радиусу сбора', max: 5, stat: 'magnet', factor: 10},
  armor: {name: 'Крепкая кожа', desc: '−{factor} входящего урона; минимум 1', max: 3, stat: 'armor', factor: 1},
  regen: {name: 'Травяной чай', desc: '+{factor} HP в секунду', max: 5, stat: 'regen', factor: 0.15}
};

// Helmets: one per `killsPerHelmet` kills; enemies drop a pile of `dropValue` with `dropChance`.
export const helmetRewards = {killsPerHelmet: 10, dropChance: .05, dropValue: 3, foodChance: .025};

for (const list of [runUpgradeDefinitions, supplyDefinitions]) for (const u of list) u.desc = describe(u.desc, u);
for (const u of Object.values(permanentUpgradeDefinitions)) u.desc = describe(u.desc, u);

// Hero prices and trainings are part of each hero (data/characters/heroes.js).
export const heroUnlockPrices = Object.fromEntries(
  Object.entries(heroDefinitions).filter(([, hero]) => hero.price).map(([id, hero]) => [id, hero.price])
);
export const heroTrainingDefinitions = Object.fromEntries(
  Object.entries(heroDefinitions).map(([id, hero]) => [id, {...hero.training, max: 3}])
);

export const permanentUpgrades = {
  ...permanentUpgradeDefinitions,
  ...Object.fromEntries(
    Object.entries(heroTrainingDefinitions).map(([hero, def]) => [
      'training_' + hero,
      {name: def.name, desc: def.desc, max: def.max, hero, stat: def.stat, factor: def.factor}
    ])
  )
};

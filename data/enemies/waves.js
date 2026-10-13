// Declarative schedules. Every map has the same shape; runtime rules live in wave-schedule.js.
const regularStages = [
  {time:0, weights:[['roman',100]]},
  {time:25, weights:[['spear',56],['roman',44]]},
  {time:50, weights:[['pilum',32],['spear',24],['roman',44]]},
  {time:85, weights:[['veteran',13],['pilum',19],['spear',24],['roman',44]]}
].map(stage => ({...stage, interval:.95, minInterval:.35, timeFactor:.0018, batch:1, batchEvery:110, cap:120}));
const normal = {firstDelay:.5, stages:regularStages};
const notifications = [
  {time:25, message:'КОПЕЙЩИКИ · Уклоняйся от длинного выпада.'},
  {time:50, message:'ПИЛУМЫ · Дома блокируют вражеские снаряды.'},
  {time:85, message:'ВЕТЕРАНЫ · Медленные, но опасные удары.'}
];
const turtleMessage = 'ЧЕРЕПАХА · Обойди строй: сзади щиты не защищают.';
const siege = [
  {unit:'turtle', first:100, populationCap:null, stages:[{time:0,every:65,cap:2}], message:turtleMessage},
  {unit:'ram', first:155, populationCap:null, stages:[{time:0,every:80,cap:2}], message:'ТАРАН · Уйди с линии разгона или укройся за домом.'}
];
const boss = {unit:'boss',time:230,message:'ЦЕНТУРИОН МАКСИМУС ВЫШЕЛ НА ПОЛЕ БОЯ',sound:'boss'};

export const waveSchedules = {
  village: {
    normal, recurring:[...siege], boss, population:null, residents:[], notifications
  },
  forest: {
    normal,
    recurring:[
      {unit:'boar',first:4,populationCap:120,stages:[{time:0,every:9,cap:8}],message:'КАБАН · Уйди с линии рывка.'},
      {unit:'netter',first:18,populationCap:120,stages:[{time:0,every:24,cap:3}],message:'ЗАСАДНИК С СЕТЬЮ · Сеть оглушает. Уклоняйся от броска.'},
      {unit:'stoneSquad',first:35,populationCap:120,stages:[{time:0,every:38,cap:2}],message:'ОТРЯД С КАМНЕМ · Разбег и падение камня. Держись подальше!'},
      ...siege
    ],
    boss, population:null, residents:[], notifications
  },
  camp: {
    normal,
    recurring:[
      {unit:'wine',first:5,populationCap:120,stages:[{time:0,every:18,cap:5}],message:'ЛЕГИОНЕР-ВИНОЧЕРПИЙ · Не наступай на винный след.'},
      {unit:'cavalry',first:15,populationCap:120,stages:[{time:0,every:22,cap:3},{time:120,every:12,cap:6}],message:'КОННИЦА · Проход через всю карту. Уйди с дороги!'},
      {unit:'tower',first:32,populationCap:120,stages:[{time:0,every:55,cap:2}],message:'ОСАДНАЯ БАШНЯ · Залп из трёх стрел. Используй укрытия.'},
      {unit:'caius',first:45,populationCap:120,stages:[{time:0,every:100,cap:1}],message:'КАЮС БОНУС · Не атакует. При ударах теряет опыт и шлемы.'},
      ...siege
    ],
    boss, population:null, residents:[], notifications
  },
  lutetia: {
    normal: {firstDelay:.5, stages:[
      {time:0,interval:1.5,minInterval:1.5,timeFactor:0,batch:1,batchEvery:null,cap:36,weights:[['roman',75],['auxiliary',25]]},
      {time:40,interval:1.2,minInterval:1.2,timeFactor:0,batch:1,batchEvery:null,cap:36,weights:[['roman',55],['auxiliary',30],['pilum',15]]},
      {time:85,interval:1,minInterval:1,timeFactor:0,batch:2,batchEvery:null,cap:60,weights:[['roman',40],['auxiliary',30],['pilum',18],['veteran',12]]},
      {time:140,interval:.9,minInterval:.9,timeFactor:0,batch:2,batchEvery:null,cap:75,weights:[['roman',35],['auxiliary',30],['pilum',20],['veteran',15]]},
      {time:210,interval:.8,minInterval:.8,timeFactor:0,batch:3,batchEvery:null,cap:90,weights:[['roman',30],['auxiliary',30],['pilum',22],['veteran',18]]}
    ]},
    recurring:[
      {unit:'courtesan',first:15,populationCap:120,stages:[{time:0,every:27,cap:4}],message:'КУРТИЗАНКА · Подбирает опыт и еду. Не оставляй добычу на мостовой.'},
      {unit:'wine',first:70,populationCap:120,stages:[{time:0,every:42,cap:2}],message:'ЛЕГИОНЕР-ВИНОЧЕРПИЙ · Не наступай на винный след.'},
      {unit:'turtle',first:125,populationCap:null,stages:[{time:0,every:70,cap:1},{time:205,every:70,cap:2}],message:turtleMessage}
    ],
    boss,
    population:{unit:'citizen',initial:24,maximum:40,every:2.5,growthEvery:15,variants:3},
    residents:['merchant'],
    notifications:[
      {time:40,message:'ПИЛУМЫ · Метатели занимают улицы. Используй дома как укрытия.'},
      {time:85,message:'ВЕТЕРАНЫ · Тяжёлая пехота входит в город.'},
      {time:210,message:'ПОСЛЕДНИЙ НАТИСК · Легион усиливает наступление.'}
    ]
  }
};

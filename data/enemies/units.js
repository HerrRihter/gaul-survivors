export const expansionUnits={
  citizenBaker:{name:'Пекарь',hp:28,speed:104,damage:1,r:12,range:0,wind:0,cooldown:0,xp:0,color:'#dfc59c',civilian:true},
  citizenPorter:{name:'Носильщик',hp:32,speed:116,damage:1,r:12,range:0,wind:0,cooldown:0,xp:0,color:'#b2bd8b',civilian:true},
  citizenMatron:{name:'Матрона',hp:26,speed:94,damage:1,r:12,range:0,wind:0,cooldown:0,xp:0,color:'#8fc6ba',civilian:true},
  citizenScribe:{name:'Писец',hp:22,speed:124,damage:1,r:12,range:0,wind:0,cooldown:0,xp:0,color:'#e4c88b',civilian:true},
  auxiliary:{labelHeight:108,name:'Ауксиларий',hp:115,speed:51,damage:13,r:17,range:105,wind:1.05,cooldown:2.1,xp:3,color:'#d5b776'},
  merchant:{labelHeight:118,name:'Торговец',hp:650,speed:0,damage:11,r:35,range:370,wind:1.15,cooldown:2.8,xp:12,color:'#e6c98b'},
  courtesan:{labelHeight:94,name:'Куртизанка',hp:65,speed:94,damage:3,r:13,range:0,wind:0,cooldown:0,xp:2,color:'#dca7d9'},
  boar:{labelHeight:70,name:'Кабан',hp:85,speed:85,damage:17,r:20,range:230,wind:1,cooldown:3,xp:2,color:'#d6a36d'},
  stoneSquad:{labelHeight:136,name:'Отряд с камнем',hp:240,speed:42,damage:48,r:35,range:340,wind:1.5,cooldown:5,xp:7,color:'#c2c5b0'},
  netter:{labelHeight:96,name:'Засадник с сетью',hp:95,speed:45,damage:4,r:14,range:260,wind:1.3,cooldown:5,xp:3,color:'#abcb88'},
  tower:{labelHeight:180,name:'Осадная башня',hp:850,speed:19,damage:12,r:44,range:510,wind:1.7,cooldown:3.5,xp:20,color:'#d2ad75'},
  cavalry:{labelHeight:140,name:'Конница',hp:180,speed:310,damage:30,r:26,range:2200,wind:1.5,cooldown:0,xp:5,color:'#e2c195'},
  caius:{labelHeight:114,name:'Каюс Бонус',hp:2600,speed:25,damage:0,r:27,range:0,wind:1,cooldown:1,xp:12,color:'#efcf73'},
  wine:{labelHeight:110,name:'Легионер-виночерпий',hp:140,speed:63,damage:8,r:16,range:40,wind:1,cooldown:2,xp:4,color:'#d493b5'}
};

export const unitDefinitions={
  ...expansionUnits,
  roman:{name:'Легионер',hp:60,speed:56,damage:9,r:12,range:36,wind:.64,cooldown:1.25,xp:1,color:'#b4c79b',mark:'I'},
  spear:{name:'Копейщик',hp:90,speed:49,damage:15,r:12,range:108,wind:1.1,cooldown:2,xp:2,color:'#eed289',mark:'↗'},
  pilum:{name:'Метатель пилума',hp:75,speed:53,damage:13,r:12,range:310,wind:1.4,cooldown:2.8,xp:2,color:'#8bd2db',mark:'P'},
  veteran:{name:'Ветеран',hp:150,speed:39,damage:23,r:16,range:65,wind:1.4,cooldown:2.2,xp:4,color:'#dc9a81',mark:'V'},
  turtle:{name:'Черепаха',hp:480,speed:27,damage:20,r:46,range:90,wind:1.6,cooldown:2.7,xp:12,color:'#8aafd2',mark:'VI'},
  ram:{name:'Таран',hp:650,speed:31,damage:32,r:46,range:360,wind:2.2,cooldown:5,xp:18,color:'#e3ab65',mark:'R'},
  boss:{name:'Центурион',hp:1600,speed:64,damage:24,r:29,range:61,wind:.76,cooldown:1.15,xp:70,color:'#edc757',mark:'★'}
};

export const units=unitDefinitions;

// Pixel prototypes: balance and map schedules are intentionally kept together.
export const expansionUnits={
  boar:{labelHeight:70,name:'Кабан',hp:85,speed:85,damage:17,r:20,range:230,wind:1,cooldown:3,xp:2,color:'#d6a36d'},
  stoneSquad:{labelHeight:136,name:'Отряд с камнем',hp:240,speed:42,damage:48,r:35,range:340,wind:1.5,cooldown:5,xp:7,color:'#c2c5b0'},
  netter:{labelHeight:96,name:'Засадник с сетью',hp:95,speed:45,damage:4,r:14,range:260,wind:1.3,cooldown:5,xp:3,color:'#abcb88'},
  tower:{labelHeight:180,name:'Осадная башня',hp:850,speed:19,damage:12,r:44,range:510,wind:1.7,cooldown:3.5,xp:20,color:'#d2ad75'},
  cavalry:{labelHeight:140,name:'Конница',hp:180,speed:310,damage:30,r:26,range:2200,wind:1.5,cooldown:0,xp:5,color:'#e2c195'},
  caius:{labelHeight:114,name:'Каюс Бонус',hp:2600,speed:25,damage:0,r:27,range:0,wind:1,cooldown:1,xp:12,color:'#efcf73'},
  wine:{labelHeight:110,name:'Легионер-виночерпий',hp:140,speed:63,damage:8,r:16,range:40,wind:1,cooldown:2,xp:4,color:'#d493b5'}
};
export const expansionSchedules={
  forest:[{unit:'boar',first:4,every:9,cap:8},{unit:'netter',first:18,every:24,cap:3},{unit:'stoneSquad',first:35,every:38,cap:2}],
  camp:[{unit:'wine',first:5,every:18,cap:5},{unit:'cavalry',first:15,every:22,cap:3},{unit:'tower',first:32,every:55,cap:2},{unit:'caius',first:45,every:100,cap:1}]
};

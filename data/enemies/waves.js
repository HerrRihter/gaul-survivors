export const waves={
  normal:{firstDelay:.5,minInterval:.35,interval:.95,timeFactor:.0018,batchEvery:110,cap:120},
  units:[
    {type:'veteran',time:85,cutoff:.13,message:'ВЕТЕРАНЫ · Медленные, но опасные удары.'},
    {type:'pilum',time:50,cutoff:.32,message:'ПИЛУМЫ · Дома блокируют вражеские снаряды.'},
    {type:'spear',time:25,cutoff:.56,message:'КОПЕЙЩИКИ · Уклоняйся от длинного выпада.'},
  ],
  siege:{
    turtle:{first:100,every:65,cap:2,message:'ЧЕРЕПАХА · Обойди строй: сзади щиты не защищают.'},
    ram:{first:155,every:80,cap:2,message:'ТАРАН · Уйди с линии разгона или укройся за домом.'},
  },
  boss:{time:230,message:'ЦЕНТУРИОН МАКСИМУС ВЫШЕЛ НА ПОЛЕ БОЯ'},
};

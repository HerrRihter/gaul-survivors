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

export const lutetiaWaves={
  stages:[
    {time:0,interval:1.5,batch:1,cap:24,weights:[['roman',75],['auxiliary',25]]},
    {time:40,interval:1.2,batch:1,cap:36,weights:[['roman',55],['auxiliary',30],['pilum',15]]},
    {time:85,interval:1,batch:2,cap:50,weights:[['roman',40],['auxiliary',30],['pilum',18],['veteran',12]]},
    {time:140,interval:.9,batch:2,cap:66,weights:[['roman',35],['auxiliary',30],['pilum',20],['veteran',15]]},
    {time:210,interval:.8,batch:3,cap:84,weights:[['roman',30],['auxiliary',30],['pilum',22],['veteran',18]]}
  ],
  turtle:{first:125,every:70,cap:1,late:205,lateCap:2},
  civilians:{initial:24,maximum:40,every:2.5}
};
export function lutetiaStage(time){return [...lutetiaWaves.stages].reverse().find(s=>time>=s.time)||lutetiaWaves.stages[0];}
export function lutetiaWave(time,roll=Math.random()){
 const weights=lutetiaStage(time).weights;let value=roll*weights.reduce((sum,[,weight])=>sum+weight,0);
 for(const [unit,weight]of weights){value-=weight;if(value<0)return unit;}return weights.at(-1)[0];
}
export const expansionSchedules={
  lutetia:[{unit:'courtesan',first:15,every:27,cap:4},{unit:'wine',first:70,every:42,cap:2}],
  forest:[{unit:'boar',first:4,every:9,cap:8},{unit:'netter',first:18,every:24,cap:3},{unit:'stoneSquad',first:35,every:38,cap:2}],
  camp:[{unit:'wine',first:5,every:18,cap:5},{unit:'cavalry',first:15,every:22,cap:3},{unit:'tower',first:32,every:55,cap:2},{unit:'caius',first:45,every:100,cap:1}]
};

export const waveSchedules={
  village:waves,
  forest:expansionSchedules.forest,
  camp:expansionSchedules.camp,
  lutetia:expansionSchedules.lutetia
};

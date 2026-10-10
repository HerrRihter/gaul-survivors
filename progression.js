'use strict';
globalThis.Progression=(()=>{
 const key='gaul-progression-v1',prices={cacofonix:60,antisanitarix:75,automatix:90,panoramix:100};
 const upgrades={health:{name:'Запас здоровья',desc:'+10 HP всем героям',max:5},power:{name:'Сила деревни',desc:'+5% урона всем героям',max:5},speed:{name:'Удобные сандалии',desc:'+3% скорости всем героям',max:5}};
 let data={helmets:0,kills:0,unlocked:['asterix','obelix'],levels:{health:0,power:0,speed:0}},persistent=true;
 const integer=(v,max=1e9)=>Number.isSafeInteger(v)&&v>=0?Math.min(max,v):0;
 try{const saved=JSON.parse(localStorage.getItem(key));if(saved&&typeof saved==='object'){data.helmets=integer(saved.helmets);data.kills=integer(saved.kills);if(Array.isArray(saved.unlocked))data.unlocked=[...new Set(['asterix','obelix',...saved.unlocked.filter(id=>Object.hasOwn(prices,id))])];for(const id of Object.keys(upgrades))data.levels[id]=integer(saved.levels?.[id],5);}}catch{}
 function save(){try{localStorage.setItem(key,JSON.stringify(data));persistent=true;}catch{persistent=false;}}
 function earn(amount){if(!Number.isSafeInteger(amount)||amount<=0)return 0;data.helmets+=amount;save();return amount;}
 function kill(){data.kills++;const reward=data.kills%10===0?1:0;data.helmets+=reward;save();return reward;}
 const owned=id=>data.unlocked.includes(id);
 const cost=id=>Object.hasOwn(upgrades,id)?30*(data.levels[id]+1):prices[id];
 function buyHero(id){if(!Object.hasOwn(prices,id)||owned(id)||data.helmets<prices[id])return false;data.helmets-=prices[id];data.unlocked.push(id);save();return true;}
 function buyUpgrade(id){if(!Object.hasOwn(upgrades,id)||data.levels[id]>=upgrades[id].max||data.helmets<cost(id))return false;data.helmets-=cost(id);data.levels[id]++;save();return true;}
 return {prices,upgrades,owned,cost,buyHero,buyUpgrade,earn,kill,get data(){return JSON.parse(JSON.stringify(data));},get persistent(){return persistent;}};
})();

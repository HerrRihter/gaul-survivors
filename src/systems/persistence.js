export let Progression;
'use strict';
Progression=(()=>{
 const key='gaul-progression-v1',prices={cacofonix:60,antisanitarix:75,automatix:90,panoramix:100};
 const upgrades={health:{name:'Запас здоровья',desc:'+10 HP всем героям',max:5},power:{name:'Сила деревни',desc:'+5% урона всем героям',max:5},speed:{name:'Удобные сандалии',desc:'+3% скорости всем героям',max:5}};
 Object.assign(upgrades,{haste:{name:'Выносливость',desc:'+4% к темпу атак',max:5},range:{name:'Размах',desc:'+4% к размеру атак',max:5},magnet:{name:'Сумка трофеев',desc:'+10 к радиусу сбора',max:5},armor:{name:'Крепкая кожа',desc:'−1 входящего урона; минимум 1',max:3},regen:{name:'Травяной чай',desc:'+0,15 HP в секунду',max:5}});
 const training={asterix:['Школа кулачного боя','+6% к темпу кулаков'],obelix:['Каменотёс','+8% к урону менгиров'],cacofonix:['Уроки вокала','+6% к радиусу музыки'],antisanitarix:['Выдержанный улов','+10% к урону возвращающейся рыбы'],automatix:['Секрет кузнеца','+10% к урону молота'],panoramix:['Рецепт друида','+0,4 с к длительности яда']};
 for(const [hero,[name,desc]] of Object.entries(training))upgrades['training_'+hero]={name,desc,max:3,hero};
 let data={helmets:0,kills:0,unlocked:['asterix','obelix'],levels:{health:0,power:0,speed:0}},persistent=true;
 for(const id of Object.keys(upgrades))data.levels[id]=0;
 const integer=(v,max=1e9)=>Number.isSafeInteger(v)&&v>=0?Math.min(max,v):0;
 try{const saved=JSON.parse(localStorage.getItem(key));if(saved&&typeof saved==='object'){data.helmets=integer(saved.helmets);data.kills=integer(saved.kills);if(Array.isArray(saved.unlocked))data.unlocked=[...new Set(['asterix','obelix',...saved.unlocked.filter(id=>Object.hasOwn(prices,id))])];for(const id of Object.keys(upgrades))data.levels[id]=integer(saved.levels?.[id],upgrades[id].max);}}catch{}
 let dirty=false,pending=null,idle=null;
 function flush(){
  if(pending!==null){clearTimeout(pending);pending=null;}
  if(idle!==null){globalThis.cancelIdleCallback?.(idle);idle=null;}
  if(!dirty)return;
  try{localStorage.setItem(key,JSON.stringify(data));persistent=true;dirty=false;}catch{persistent=false;}
 }
 function save(){dirty=true;flush();}
 // Combat only updates memory. Coalesce rewards into one write outside the
 // simulation, preferably when the browser has idle time between frames.
 function deferSave(){
  dirty=true;
  if(pending!==null||idle!==null)return;
  if(typeof setTimeout!=='function'){flush();return;}
  pending=setTimeout(()=>{
   pending=null;
   if(globalThis.requestIdleCallback)idle=globalThis.requestIdleCallback(()=>{idle=null;flush();},{timeout:2000});
   else flush();
  },1000);
 }
 globalThis.addEventListener?.('pagehide',flush);
 globalThis.document?.addEventListener?.('visibilitychange',()=>{if(document.hidden)flush();});
 function earn(amount){if(!Number.isSafeInteger(amount)||amount<=0)return 0;data.helmets+=amount;deferSave();return amount;}
 function kill(){data.kills++;const reward=data.kills%10===0?1:0;data.helmets+=reward;deferSave();return reward;}
 const owned=id=>data.unlocked.includes(id);
 const cost=id=>Object.hasOwn(upgrades,id)?(upgrades[id].hero?50:30)*(data.levels[id]+1):prices[id];
 function buyHero(id){if(!Object.hasOwn(prices,id)||owned(id)||data.helmets<prices[id])return false;data.helmets-=prices[id];data.unlocked.push(id);save();return true;}
 function buyUpgrade(id){if(!Object.hasOwn(upgrades,id)||(upgrades[id].hero&&!owned(upgrades[id].hero))||data.levels[id]>=upgrades[id].max||data.helmets<cost(id))return false;data.helmets-=cost(id);data.levels[id]++;save();return true;}
 return {prices,upgrades,owned,cost,buyHero,buyUpgrade,earn,kill,flush,get data(){return JSON.parse(JSON.stringify(data));},get persistent(){return persistent;}};
})();

'use strict';
(() => {
const $=id=>document.getElementById(id), canvas=$('game'), ctx=canvas.getContext('2d');
let W=960,H=540;const WORLD=2200,DURATION=300;
function resizeCanvas(){const zoom=window.innerWidth<window.innerHeight?1.35:1,ratio=Math.min(window.devicePixelRatio||1,2)*zoom;W=Math.max(1,(window.innerWidth||960)/zoom);H=Math.max(1,(window.innerHeight||540)/zoom);canvas.width=Math.round(W*ratio);canvas.height=Math.round(H*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);ctx.imageSmoothingEnabled=false;}
resizeCanvas();window.addEventListener('resize',resizeCanvas);
let selected='asterix',mode='menu',state=null,last=0,keys=new Set(),audio=null,sound=false,toastLeft=0,choice=[];
let pointer=null,stick={x:0,y:0},best={kills:0,time:0};try{best=JSON.parse(localStorage.getItem('gaul-best'))||best;}catch{}
const rand=(a,b)=>a+Math.random()*(b-a),clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),clock=t=>`${Math.floor(t/60).toString().padStart(2,'0')}:${Math.floor(t%60).toString().padStart(2,'0')}`;
const palette={'.':null,k:'#222a26',s:'#efb47c',S:'#cd8856',w:'#e5e3c8',b:'#6197bc',B:'#365974',r:'#c65642',R:'#833c35',y:'#ecc85d',g:'#86996f',G:'#566747',h:'#9aa99e',H:'#64796f',o:'#d8853f',p:'#a09ac2',P:'#635d82'};
const sprites={
asterix:['....ww....ww....','.....wwhhww.....','.....hhhhhh.....','.....HHHHHH.....','......ssss......','.....ssksks.....','......syys......','.....yyyyyy.....','......kkkk......','....sskkkkss....','....sskkkkss....','......rrrr......','......rrrr......','......ss.ss.....','.....kkk.kkk....'],
obelix:['......oooo......','.....oohhoo.....','.....hhhhh......','.....sssss......','....ssksskso....','....ossssoo.....','....ooyyoo......','...ssssssss.....','..ssssssssss....','..sswbbwbbwss...','...wwbbwwbbw....','...wwbbwwbbw....','...wwbbwwbbw....','....kk..kk......','...kkk..kkk.....'],
roman:['.......rr.......','......rrrr......','.....hhhhhh.....','.....HHHHHH.....','......ssss......','......sksk......','......ssss......','.....RRRRRR.....','..h..RwwwwRg....','..hssRwwwwRgg...','..h..RwwwwRgg...','.....rrrrrrg....','......s..s......','......s..s......','.....kk..kk.....'],
pirate:['.....kkkkkk.....','....kkkkkkkk....','.....kkwkkk.....','......ssss......','......skks......','......ssss......','.....kkkkkk.....','....ssrrrrss....','....sswwwwss..h.','......rrrr..hh..','......kkkk......','......kkkk......','......s..k......','.....kk..k......','................'],
monster:['.....gg..gg.....','....gggggggg....','...gggggggggg...','...ggkg gkggg...'.replace(' ', 'g'),'...ggyyyygggg...','....ggwwgggg....','.....gggggg.....','...GGggggGG.....','..GGGggggGGG....','..GGGggggGGG....','...GGggggGG.....','....GGGGGG......','....GG..GG......','...GGG..GGG.....','................'],
boss:['......rrrr......','....rrrrrrrr....','.....yyyyyy.....','....hhhhhhhh....','.....ssssss.....','.....skssks.....','.....ssssss.....','....yyyyyyyy....','...RRhyyhRRR....','..hRRhhhhRRRgg..','..hRRhhhhRRRgg..','..h..rrrrrr.gg..','.....ss..ss.....','.....ss..ss.....','....kkk..kkk....']};
const spriteCache={};for(const [name,rows] of Object.entries(sprites)){const c=document.createElement('canvas');c.width=16;c.height=16;const g=c.getContext('2d');rows.forEach((row,y)=>[...row].forEach((v,x)=>{if(palette[v]){g.fillStyle=palette[v];g.fillRect(x,y,1,1);}}));spriteCache[name]=c;}
function sprite(g,name,x,y,size=2,flip=false,bob=0,flash=false,phase=0,actor=null){
  if(typeof VillagerArt!=='undefined'&&VillagerArt.draw(g,name,x,y,actor,flip))return;
  if(Villagers.draw(g,name,x,y,size,flip,actor?.walk||0))return;
  const hurt=actor&&actor.hurt,attack=actor&&actor.action,action=hurt?'hurt':attack?'attack':actor&&actor.moving?'walk':'idle';
  const progress=hurt?hurt.elapsed/hurt.duration:attack?attack.elapsed/attack.duration:actor?actor.walk||0:0;
  const animated=typeof AnimationArt!=='undefined'?AnimationArt.get(name,Math.floor(phase)%3,action,progress):null;
  g.save();g.translate(Math.round(x),Math.round(y+(animated?0:bob)));
  const roman=name==='roman'||name==='boss',facing=hurt?hurt.flip:attack?attack.flip:flip;
  if(animated?facing:roman?!facing:facing)g.scale(-1,1);
  if(flash&&!hurt)g.globalAlpha=.45;
  const hero=typeof HeroArt!=='undefined'?HeroArt.get(name):null;
  if(animated){const box=name==='boss'?120:name==='asterix'||name==='obelix'?112:104;g.drawImage(animated,-box/2,-box*.9,box,box);}
  else if(hero){g.drawImage(hero,-48,-91,96,96);}
  else if(roman){const frame=Math.floor((state?state.step:performance.now()/1000)*7+phase)%4;const art=RomanArt.get(Math.floor(phase)%3,frame,name==='boss');const scale=name==='boss'?1.5:1.25;g.drawImage(art,-24*scale,-61*scale,48*scale,64*scale);}
  else g.drawImage(spriteCache[name],-8*size,-15*size,16*size,16*size);
  g.restore();
}
const portraitFrames=new Map();
function fitPortrait(c,name,phase=0){
 const key=name+':'+(typeof VillagerArt!=='undefined'?VillagerArt.status[name]:'')+':'+(typeof AnimationArt!=='undefined'?AnimationArt.status.heroes:'')+':'+(typeof HeroArt!=='undefined'?HeroArt.status:'');
 let set=portraitFrames.get(key);
 if(!set){
  const frames=[];
  for(let i=0;i<8;i++){
   const source=document.createElement('canvas');source.width=source.height=256;const sg=source.getContext('2d');
   sprite(sg,name,128,230,3,false,0,false,0,{moving:i<4,walk:(i%4)/4,action:i>=4?{elapsed:(i%4)/4,duration:1,flip:false}:null});
   frames.push(source);
  }
  // All sprite renderers fit this shared envelope. No pixel readback: file:// images
  // may taint canvases, but drawing them is still supported.
  set={frames,left:64,top:120,w:128,h:128};portraitFrames.set(key,set);
 }
 const {frames,left,top,w,h}=set,g=c.getContext('2d'),scale=Math.min((c.width-12)/w,(c.height-12)/h);
 g.clearRect(0,0,c.width,c.height);g.imageSmoothingEnabled=false;
 g.drawImage(frames[phase%8],left,top,w,h,(c.width-w*scale)/2,(c.height-h*scale)/2,w*scale,h*scale);
}
let menuPortraitPhase=-1;
function animateMenu(now){
 const phase=Math.floor(now/190)%8;if(phase===menuPortraitPhase)return;menuPortraitPhase=phase;
 document.querySelectorAll('[data-portrait]').forEach(c=>fitPortrait(c,c.dataset.portrait,phase));
}
function portrait(id,name){fitPortrait($(id),name);}
function buildHeroRoster(){
 const root=$('heroRoster');root.replaceChildren();
 for(const [id,hero] of Object.entries(Villagers.defs)){
  const owned=Progression.owned(id),card=document.createElement('button');card.type='button';card.className='map-hero';card.dataset.hero=id;card.disabled=!owned;
  const art=document.createElement('canvas');art.width=64;art.height=80;art.id=id==='asterix'?'portraitA':id==='obelix'?'portraitO':'portrait-'+id;art.dataset.portrait=id;card.append(art);
  const copy=document.createElement('span');copy.className='map-hero-copy';const title=document.createElement('strong');title.textContent=hero.name;const desc=document.createElement('small');desc.textContent=owned?(hero.desc|| (id==='asterix'?'Быстрый ближний бой.':'Мощные броски менгиров.')):'ЗАКРЫТ · '+Progression.prices[id]+' ШЛЕМОВ';if(!owned)desc.className='hero-lock';copy.append(title,desc);card.append(copy);
  if(owned)card.onclick=()=>{selected=id;document.querySelectorAll('#heroRoster [data-hero]').forEach(el=>el.classList.toggle('selected',el===card));$('heroRecord').textContent='Выбран герой: '+hero.name;};
  root.append(card);
 }
 document.querySelectorAll('#heroRoster [data-hero]').forEach(el=>el.classList.toggle('selected',el.dataset.hero===selected));
}
document.addEventListener('villager-art-ready',()=>{menuPortraitPhase=-1;if(mode==='menu')renderShop();});
document.addEventListener('hero-art-ready',()=>{menuPortraitPhase=-1;if(mode==='menu')animateMenu(performance.now());});
document.addEventListener('animation-art-ready',()=>{menuPortraitPhase=-1;if(mode==='menu'){animateMenu(performance.now());renderShop();}});
const decorations=[];let seed=721;function seeded(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
for(let i=0;i<650;i++)decorations.push({x:seeded()*WORLD,y:seeded()*WORLD,type:Math.floor(seeded()*8),s:seeded()});
function beep(freq=300,len=.05,type='square',vol=.025){if(!sound)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(freq,audio.currentTime);o.frequency.exponentialRampToValueAtTime(freq*.5,audio.currentTime+len);g.gain.setValueAtTime(vol,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+len);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+len);}catch{}}
function show(id,on){$(id).classList.toggle('hidden',!on);}function toast(text){$('toast').textContent=text;$('toast').style.opacity=1;toastLeft=3;}
function resetInput(){keys.clear();pointer=null;stick={x:0,y:0};$('knob').style.transform='';$('stick').style.left='';$('stick').style.top='';$('stick').style.bottom='';}
function start(){if(!Progression.owned(selected))selected='asterix';const hero=Villagers.defs[selected],levels=Progression.data.levels;resetInput();state={t:0,kills:0,level:1,xp:0,need:8,spawn:.5,attack:.2,menhir:2,ring:1,enemies:[],corpses:[],enemyShots:[],nextTurtle:100,nextRam:155,shots:[],fish:[],poison:[],helmets:[],earned:0,music:0,trail:0,poisonTick:0,gems:[],fx:[],texts:[],pickups:[],bossSpawned:false,bossDead:false,shake:0,step:0,stats:{damage:1+levels.power*.05,haste:1,range:1,speed:1+levels.speed*.03,magnet:75,armor:0,regen:0,stones:0,orbit:0},p:{x:WORLD/2,y:WORLD/2,hp:hero.hp+levels.health*10,max:hero.hp+levels.health*10,speed:hero.speed,inv:0,flip:false,facing:{x:1,y:0}}};mode='play';['menu','heroScreen','end','paused','levelup','bossbar'].forEach(id=>show(id,false));['hud','hint','pause','stick'].forEach(id=>show(id,true));$('heroLabel').textContent=hero.name.toUpperCase();toast('ДЕРЕВНЯ · Легион наступает. Дома дают укрытие от пилумов.');beep(450,.14);hud();}
function menu(){mode='menu';resetInput();['end','paused','levelup','hud','hint','pause','stick','bossbar','heroScreen'].forEach(id=>show(id,false));show('menu',true);buildHeroRoster();renderShop();$('toast').style.opacity=0;updateRecord();}
function updateRecord(){$('wallet').textContent='ШЛЕМЫ: '+Progression.data.helmets;$('wallet').dataset.count=Progression.data.helmets;const chosen=$('heroRecord'),record=$('record');if(chosen)chosen.textContent='Выбран герой: '+Villagers.defs[selected].name;if(record)record.textContent=best.kills?`РЕКОРД: ${best.kills} врагов · ${clock(best.time)}`:'Легион ещё не знает, что его ждёт.';}updateRecord();buildHeroRoster();portrait('portraitA','asterix');portrait('portraitO','obelix');
function openHeroSelect(){buildHeroRoster();$('heroRecord').textContent='Выбран герой: '+Villagers.defs[selected].name;show('heroScreen',true);}
$('openVillage').onclick=openHeroSelect;$('villageNode').addEventListener('click',openHeroSelect);$('villageNode').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openHeroSelect();}});$('heroBack').onclick=()=>show('heroScreen',false);
$('start').onclick=start;$('again').onclick=start;$('back').onclick=menu;$('quit').onclick=menu;
function renderShop(){
 updateRecord();const root=$('shopHeroes');root.replaceChildren();
 for(const [id,hero] of Object.entries(Villagers.defs)){
  const card=document.createElement('div');card.className='shopcard';const art=document.createElement('canvas');art.width=96;art.height=96;
  art.dataset.portrait=id;fitPortrait(art,id);card.append(art);
  const title=document.createElement('h3');title.textContent=hero.name;card.append(title);
  const desc=document.createElement('p');desc.textContent=hero.desc||(id==='asterix'?'Быстрый кулак: 25 урона, сектор 90°.':'Метает менгиры: 52 урона.');card.append(desc);
  const info=document.createElement('small');info.textContent=hero.hp+' HP · скорость '+hero.speed;card.append(info);
  const button=document.createElement('button'),owned=Progression.owned(id);button.className='small';button.textContent=owned?(selected===id?'Выбран':'Выбрать'):'Открыть · '+Progression.prices[id]+' шлемов';
  button.disabled=!owned&&Progression.data.helmets<Progression.prices[id];
  button.onclick=()=>{if(Progression.owned(id)||Progression.buyHero(id)){selected=id;document.querySelectorAll('[data-hero]').forEach(el=>el.classList.toggle('selected',el.dataset.hero===id));renderShop();}};card.append(button);root.append(card);
 }
 $('shopUpgrades').replaceChildren();
 for(const [id,u] of Object.entries(Progression.upgrades)){
  const level=Progression.data.levels[id],b=document.createElement('button');b.className='small';b.textContent=u.name+' '+level+'/'+u.max+' · '+u.desc+' · '+(level>=u.max?'Максимум':Progression.cost(id)+' шлемов');b.disabled=level>=u.max||Progression.data.helmets<Progression.cost(id);b.onclick=()=>{if(Progression.buyUpgrade(id))renderShop();};$('shopUpgrades').append(b);
 }
 $('shopWallet').textContent='У вас '+Progression.data.helmets+' шлемов · до следующей награды: '+(10-Progression.data.kills%10)+' убийств'+(Progression.persistent?'':' · Не удалось сохранить прогресс. Не закрывай игру.');
}
$('shopOpen').onclick=$('mapShop').onclick=$('heroShop').onclick=()=>{renderShop();show('shop',true);};
$('shopClose').onclick=()=>{show('shop',false);if(mode==='menu')buildHeroRoster();};
function pause(){if(mode==='play'){mode='pause';resetInput();show('paused',true);}else if(mode==='pause'){mode='play';show('paused',false);}}$('pause').onclick=pause;$('resume').onclick=pause;
$('sound').onclick=()=>{sound=!sound;$('sound').textContent=`ЗВУК: ${sound?'ВКЛ':'ВЫКЛ'}`;beep(500,.1);};
window.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();if(e.repeat)return;if(e.code==='Escape'||e.code==='KeyP')pause();if(mode==='level'&&['Digit1','Digit2','Digit3'].includes(e.code))pickUpgrade(+e.code.slice(-1)-1);keys.add(e.code);});
window.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>{resetInput();if(mode==='play')pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden&&mode==='play')pause();});
canvas.style.touchAction='none';canvas.addEventListener('pointerdown',e=>{if(mode!=='play'||e.pointerType==='mouse')return;pointer={id:e.pointerId,x:e.clientX,y:e.clientY};const control=$('stick'),size=control.offsetWidth||88;control.style.left=`${e.clientX-size/2}px`;control.style.top=`${e.clientY-size/2}px`;control.style.bottom='auto';canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointermove',e=>{if(!pointer||pointer.id!==e.pointerId)return;let dx=e.clientX-pointer.x,dy=e.clientY-pointer.y,l=Math.hypot(dx,dy);stick={x:dx/Math.max(35,l),y:dy/Math.max(35,l)};$('knob').style.transform=`translate(${stick.x*24}px,${stick.y*24}px)`;});['pointerup','pointercancel','lostpointercapture'].forEach(ev=>canvas.addEventListener(ev,resetInput));
const upgrades=[
{name:'Тяжёлый кулак',icon:'✦',desc:'+25% урона всех атак.',apply:s=>s.stats.damage+=.25},
{name:'Второе дыхание',icon:'»',desc:'Атаки срабатывают на 18% чаще.',apply:s=>s.stats.haste+=.18},
{name:'Широкий замах',icon:'◎',desc:'+20% к радиусу удара и размеру менгиров.',apply:s=>s.stats.range+=.2},
{name:'Крылатые сандалии',icon:'↟',desc:'+12% к скорости передвижения.',apply:s=>s.stats.speed+=.12},
{name:'Карманный менгир',icon:'◆',desc:'Дополнительный менгир каждые 2 секунды. Повторный выбор добавляет снаряд.',apply:s=>s.stats.stones++},
{name:'Песня барда',icon:'♫',desc:'Звуковые волны вокруг героя наносят урон. Повторный выбор усиливает песню.',apply:s=>s.stats.orbit++},
{name:'Большой пир',icon:'♥',desc:'+30 к максимуму здоровья и восстановление 55 здоровья.',apply:s=>{s.p.max+=30;s.p.hp=Math.min(s.p.max,s.p.hp+55);}},
{name:'Секрет друида',icon:'⚗',desc:'Постоянное восстановление 1 здоровья в секунду.',apply:s=>s.stats.regen++},
{name:'Галльская закалка',icon:'▣',desc:'Входящий урон уменьшается на 2 (минимум 1).',apply:s=>s.stats.armor+=2},
{name:'Притяжение сокровищ',icon:'✧',desc:'+45 к радиусу сбора опыта.',apply:s=>s.stats.magnet+=45}];
function levelUp(){state.xp-=state.need;state.level++;state.need=Math.floor(state.need*1.23+3);mode='level';resetInput();choice=[...upgrades].sort(()=>Math.random()-.5).slice(0,3);$('cards').replaceChildren();choice.forEach((u,i)=>{const b=document.createElement('button');b.className='upgrade';b.innerHTML=`<em>${u.icon}</em><strong>${u.name}</strong><span>${u.desc}</span><span style="margin-top:16px;color:#788e77">[ ${i+1} ]</span>`;b.onclick=()=>pickUpgrade(i);$('cards').append(b);});show('levelup',true);beep(760,.23,'triangle');hud();}
function pickUpgrade(i){if(mode!=='level'||!choice[i])return;choice[i].apply(state);show('levelup',false);mode='play';beep(580,.12);if(state.xp>=state.need)levelUp();}
function spawn(unit,boss=false){
 const s=state,p=s.p,u=Legion.units[boss?'boss':unit]||Legion.units.roman;unit=boss?'boss':Legion.units[unit]?unit:'roman';
 let x,y;for(let i=0;i<100;i++){const a=rand(0,Math.PI*2),r=rand(520,640);x=clamp(p.x+Math.cos(a)*r,u.r+10,WORLD-u.r-10);y=clamp(p.y+Math.sin(a)*r,u.r+10,WORLD-u.r-10);if(!Village.blocked(x,y,u.r)&&Math.hypot(x-p.x,y-p.y)>260)break;}
 if(Village.blocked(x,y,u.r))return;
 const e={x,y,unit,type:boss?'boss':unit==='turtle'||unit==='ram'?unit:'roman',hp:u.hp,max:u.hp,r:u.r,speed:u.speed,damage:u.damage,boss,hit:0,cd:0,phase:unit==='spear'?1:unit==='pilum'?2:rand(0,3),vx:0,vy:0,heading:Math.atan2(p.y-y,p.x-x)};s.enemies.push(e);return e;
}
function damage(e,n,dx=0,dy=0,source=state.p){if(e.hp<=0||n<=0)return;n*=Legion.mitigation(e,source);e.hp-=n;e.hit=.12;if(e.hp>0&&(e.unit==='turtle'||e.unit==='ram'))e.visualHurt={elapsed:0,duration:.34,flip:Math.cos(e.heading)<0};if(e.hp>0&&e.type==='roman'){e.hurt={elapsed:0,duration:.34,flip:e.action?e.action.flip:e.x>state.p.x};e.action=null;e.cd=Math.max(e.cd,.45);e.moving=false;}else if(e.hp<=0){e.hurt=null;e.action=null;}const weight=e.r>30?.12:e.unit==='veteran'?.5:1;e.vx+=dx*weight;e.vy+=dy*weight;if(state.texts.length<45)state.texts.push({x:e.x,y:e.y-25,v:Math.round(n),life:.55});if(e.hp<=0){Corpses.add(state.corpses,e,sprite,Math.hypot(dx,dy)>0?{x:dx,y:dy}:{x:e.x-source.x,y:e.y-source.y});state.kills++;state.earned+=Progression.kill();if(Math.random()<.05)state.helmets.push({x:e.x,y:e.y,value:3});state.gems.push({x:e.x,y:e.y,v:Legion.units[e.unit].xp});for(let i=0;i<4;i++)state.fx.push({kind:'spark',x:e.x,y:e.y-10,vx:rand(-65,65),vy:rand(-70,20),life:.3,max:.3,color:e.type==='monster'?'#9dad67':'#e4c787'});if(Math.random()<.025)state.pickups.push({x:e.x,y:e.y,type:'food'});if(e.boss){state.bossDead=true;toast('Центурион повержен! Продержись до пира.');beep(160,.5,'sawtooth');}}}
function throwStones(count,baseDamage,direction=null){const s=state,dir=direction||s.p.facing,angle=Math.atan2(dir.y,dir.x);for(let i=0;i<count;i++){const a=angle+(i-(count-1)/2)*.19;s.shots.push({x:s.p.x,y:s.p.y-10,vx:Math.cos(a)*320,vy:Math.sin(a)*320,life:2.2,r:11*s.stats.range,damage:baseDamage*s.stats.damage,hit:new Set(),age:0,angle:a+Math.PI});}beep(110,.06,'triangle');}
function beginAction(actor,duration,target){actor.action={elapsed:0,duration,hit:false,flip:target.x<actor.x,aim:{x:target.x,y:target.y}};}
function advanceAction(actor,dt,impact){const a=actor.action;if(!a)return;a.elapsed+=dt;if(!a.hit&&a.elapsed>=a.duration*.5){a.hit=true;impact(a);}if(a.elapsed>=a.duration)actor.action=null;}
function hurtPlayer(e){const p=state.p;if(p.inv>0)return;p.hp-=Math.max(1,e.damage-state.stats.armor);p.inv=.7;p.hurt={elapsed:0,duration:.34,flip:p.flip};state.shake=4;beep(75,.12,'sawtooth');state.fx.push({kind:'hurt',x:p.x,y:p.y,r:25,life:.25,max:.25});}
function heroImpact(a){const s=state,p=s.p,dir=a.direction;if(selected==='obelix'){throwStones(1,52,dir);return;}if(selected==='antisanitarix'){Villagers.fish(s,dir);return;}const r=70*s.stats.range,angle=Math.atan2(dir.y,dir.x);const spec=Villagers.defs[selected];s.fx.push({kind:'slash',x:p.x,y:p.y-8,r,angle,half:spec.half,life:.2,max:.2});for(const e of s.enemies){const dx=e.x-p.x,dy=e.y-p.y,d=Math.hypot(dx,dy),along=dx*dir.x+dy*dir.y;const delta=Math.abs(Math.atan2(dx*dir.y-dy*dir.x,along));if(e.hp>0&&d<r+e.r&&along>=0&&delta<=spec.half+Math.asin(Math.min(1,e.r/Math.max(1,d)))&&Village.clear(p,e,2))damage(e,spec.damage*s.stats.damage,dir.x*145,dir.y*145);}beep(210,.035);}
function finish(win){mode='end';resetInput();show('end',true);show('pause',false);show('stick',false);$('endTag').textContent=win?'ДЕРЕВНЯ НЕ СДАЁТСЯ':'ЛЕГИОНУ ПОВЕЗЛО. НА ЭТОТ РАЗ.';$('endTitle').textContent=win?'Пир начинается!':'Нужен ещё глоток зелья';$('endText').textContent=win?'Римляне отступают. Кабан уже на вертеле. Ты заслужил этот вечер.':'Даже героям нужен привал. Попробуй другую сборку и вернись в драку.';$('endStats').innerHTML=`<div><strong>${clock(state.t)}</strong><span>ПРОДЕРЖАЛСЯ</span></div><div><strong>${state.kills}</strong><span>ВРАГОВ ПОБЕЖДЕНО</span></div><div><strong>${state.level}</strong><span>УРОВЕНЬ</span></div><div><strong>+${state.earned}</strong><span>ШЛЕМОВ</span></div>`;best={kills:Math.max(best.kills||0,state.kills),time:Math.max(best.time||0,state.t)};try{localStorage.setItem('gaul-best',JSON.stringify(best));}catch{}beep(win?660:140,.4,'triangle');}
function update(dt){const s=state,p=s.p,st=s.stats;s.t+=dt;s.step+=dt;s.corpses=Corpses.update(s.corpses,dt);s.shake=Math.max(0,s.shake-dt*20);p.inv=Math.max(0,p.inv-dt);p.hp=Math.min(p.max,p.hp+st.regen*dt);let mx=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0)+stick.x,my=(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-(keys.has('KeyW')||keys.has('ArrowUp')?1:0)+stick.y;const ml=Math.hypot(mx,my);if(ml>1){mx/=ml;my/=ml;}if(ml>.05){p.facing={x:mx/Math.hypot(mx,my),y:my/Math.hypot(mx,my)};if(Math.abs(mx)>.01)p.flip=mx<0;}const oldX=p.x,oldY=p.y;Village.move(p,mx*p.speed*st.speed*dt,my*p.speed*st.speed*dt,14);p.x=clamp(p.x,52,WORLD-52);p.y=clamp(p.y,100,WORLD-12);const travel=Math.hypot(p.x-oldX,p.y-oldY);p.moving=travel>.01;p.walk=(p.walk||0)+travel/55;
s.spawn-=dt;if(s.spawn<=0){s.spawn=Math.max(.35,.95-s.t*.0018);const n=1+Math.floor(s.t/110);for(let i=0;i<n&&s.enemies.length<120;i++)spawn(Legion.wave(s.t));}
if(s.t>=s.nextTurtle){s.nextTurtle+=65;if(s.enemies.filter(e=>e.unit==='turtle').length<2){spawn('turtle');toast('ЧЕРЕПАХА · Обойди строй: сзади щиты не защищают.');}}
if(s.t>=s.nextRam){s.nextRam+=80;if(s.enemies.filter(e=>e.unit==='ram').length<2){spawn('ram');toast('ТАРАН · Уйди с линии разгона или укройся за домом.');}}
if(s.t>=230&&!s.bossSpawned){s.bossSpawned=true;spawn('boss',true);toast('ЦЕНТУРИОН МАКСИМУС ВЫШЕЛ НА ПОЛЕ БОЯ');beep(90,.4,'sawtooth');}
for(const [time,text] of [[25,'КОПЕЙЩИКИ · Уклоняйся от длинного выпада.'],[50,'ПИЛУМЫ · Дома блокируют вражеские снаряды.'],[85,'ВЕТЕРАНЫ · Медленные, но опасные удары.']])if(s.t>=time&&s.t-dt<time)toast(text);
if(p.hurt){p.hurt.elapsed+=dt;if(p.hurt.elapsed>=p.hurt.duration)p.hurt=null;}
if(p.action){p.action.direction={...p.facing};p.action.flip=Math.abs(p.facing.x)>.01?p.facing.x<0:p.flip;}
advanceAction(p,dt,heroImpact);
const heroSpec=Villagers.defs[selected];s.attack-=dt;if(!heroSpec.passive&&s.attack<=0&&!p.action){s.attack=Math.max(.22,heroSpec.interval/st.haste);const dir={...p.facing};beginAction(p,Math.max(.18,heroSpec.wind/st.haste),{x:p.x+dir.x,y:p.y+dir.y});p.action.direction=dir;p.action.flip=Math.abs(dir.x)>.01?dir.x<0:p.flip;}
s.menhir-=dt;if(s.menhir<=0){s.menhir=2/st.haste;if(st.stones)throwStones(st.stones,32);}
s.ring-=dt;if(s.ring<=0){s.ring=1.25/st.haste;if(st.orbit){const r=100+st.orbit*10;s.fx.push({kind:'ring',x:p.x,y:p.y-8,r,life:.45,max:.45});for(const e of s.enemies)if(dist(e,p)<r+e.r)damage(e,12*st.orbit*st.damage);beep(440,.09,'sine');}}
Villagers.update(s,selected,dt,damage);
for(const e of s.enemies){
 if(e.hp<=0)continue;const u=Legion.units[e.unit],d=dist(e,p);
 e.hit=Math.max(0,e.hit-dt);if(e.visualHurt){e.visualHurt.elapsed+=dt;if(e.visualHurt.elapsed>=e.visualHurt.duration)e.visualHurt=null;}e.cd-=dt;if(e.hurt){e.hurt.elapsed+=dt;if(e.hurt.elapsed>=e.hurt.duration)e.hurt=null;}e.vx*=Math.exp(-9*dt);e.vy*=Math.exp(-9*dt);
 if(!e.action&&!e.charge){const target=Math.atan2(p.y-e.y,p.x-e.x),delta=Math.atan2(Math.sin(target-e.heading),Math.cos(target-e.heading));e.heading+=clamp(delta,-dt*(e.r>30?.8:6),dt*(e.r>30?.8:6));}
 advanceAction(e,dt,a=>{
  const angle=Math.atan2(a.aim.y-e.y,a.aim.x-e.x),ax=Math.cos(angle),ay=Math.sin(angle),px=p.x-e.x,py=p.y-e.y,along=px*ax+py*ay,across=Math.abs(px*ay-py*ax);
  if(e.unit==='pilum'){s.enemyShots.push({x:e.x,y:e.y,vx:ax*235,vy:ay*235,life:2,damage:e.damage});beep(250,.04);}
  else if(e.unit==='ram'){e.charge={x:ax,y:ay,left:1.3};e.heading=angle;}
  else if(e.unit==='spear'){if(along>=-8&&along<u.range+14&&across<24&&Village.clear(e,p,2))hurtPlayer(e);}
  else if(dist(e,p)<u.range+8&&along>=-8&&Village.clear(e,p,2))hurtPlayer(e);
 });
 if(e.charge){const q=e.charge,ox=e.x,oy=e.y;Village.move(e,q.x*320*dt,q.y*320*dt,e.r);q.left-=dt;
  if(dist(e,p)<e.r+14)hurtPlayer(e);
  if(Math.hypot(e.x-ox,e.y-oy)<320*dt*.8||q.left<=0){e.charge=null;e.action=null;e.cd=2;s.fx.push({kind:'ring',x:e.x,y:e.y,r:65,life:.3,max:.3});}
  e.moving=true;e.walk=(e.walk||0)+dt*5;continue;
 }
 if(!e.action&&!e.hurt&&e.cd<=0&&d<u.range&&Village.clear(e,p,2)){beginAction(e,u.wind,p);e.cd=u.cooldown;e.heading=Math.atan2(p.y-e.y,p.x-e.x);}
 const moving=!e.action&&!e.hurt&&d>(e.unit==='pilum'?220:e.r+10),speed=e.speed*(1+s.t/1800),dir=Village.direction(e,p,e.r),ox=e.x,oy=e.y;
 Village.move(e,(moving?dir.x*speed*dt:0)+e.vx*dt,(moving?dir.y*speed*dt:0)+e.vy*dt,e.r);
 const travel=Math.hypot(e.x-ox,e.y-oy);e.moving=travel>.01;e.walk=(e.walk||e.phase/6)+travel/50;
}
for(const b of s.enemyShots){const n=Math.max(1,Math.ceil(Math.hypot(b.vx,b.vy)*dt/8));for(let i=0;i<n&&b.life>0;i++){b.x+=b.vx*dt/n;b.y+=b.vy*dt/n;if(Village.blocked(b.x,b.y,2))b.life=0;else if(dist(b,p)<17){hurtPlayer(b);b.life=0;}}b.life-=dt;}s.enemyShots=s.enemyShots.filter(b=>b.life>0);
for(const b of s.shots){b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;b.age=(b.age||0)+dt;b.angle+=dt*4.5;for(const e of s.enemies){if(e.hp>0&&!b.hit.has(e)&&Math.hypot(e.x-b.x,e.y-10-b.y)<e.r+b.r){b.hit.add(e);damage(e,b.damage,b.vx*.25,b.vy*.25,{x:e.x-b.vx,y:e.y-b.vy});}}}s.shots=s.shots.filter(b=>b.life>0);
for(const helmet of s.helmets){const d=dist(helmet,p);if(d<st.magnet&&Village.clear(helmet,p,2)){const step=Math.min(d,230*dt);helmet.x+=(p.x-helmet.x)/Math.max(1,d)*step;helmet.y+=(p.y-helmet.y)/Math.max(1,d)*step;}if(dist(helmet,p)<20){s.earned+=Progression.earn(helmet.value);helmet.dead=true;s.texts.push({x:p.x,y:p.y-30,v:'+'+helmet.value+' шлема',life:1});}}s.helmets=s.helmets.filter(h=>!h.dead);
for(const gem of s.gems){const d=dist(gem,p);if(d<st.magnet){const speed=270+200*(1-d/st.magnet);gem.x+=(p.x-gem.x)/Math.max(1,d)*Math.min(d,speed*dt);gem.y+=(p.y-gem.y)/Math.max(1,d)*Math.min(d,speed*dt);}if(dist(gem,p)<19){s.xp+=gem.v;gem.dead=true;beep(700+Math.random()*200,.025,'sine',.01);}}s.gems=s.gems.filter(g=>!g.dead);
// Merge nearby old drops when needed, retaining all earned experience.
if(s.gems.length>500){const grid=new Map();for(const g of s.gems){const key=`${Math.floor(g.x/50)},${Math.floor(g.y/50)}`;if(grid.has(key))grid.get(key).v+=g.v;else grid.set(key,g);}s.gems=[...grid.values()];}
for(const item of s.pickups)if(dist(item,p)<25){p.hp=Math.min(p.max,p.hp+25);item.dead=true;s.texts.push({x:p.x,y:p.y-30,v:'+25 ♥',life:1});beep(530,.1,'triangle');}s.pickups=s.pickups.filter(i=>!i.dead);
s.enemies=s.enemies.filter(e=>e.hp>0);for(const f of s.fx){f.life-=dt;if(f.kind==='spark'){f.x+=f.vx*dt;f.y+=f.vy*dt;}}s.fx=s.fx.filter(f=>f.life>0);for(const t of s.texts){t.life-=dt;t.y-=dt*35;}s.texts=s.texts.filter(t=>t.life>0);if(p.hp<=0){p.hp=0;finish(false);}else if(s.t>=DURATION&&s.bossDead)finish(true);else if(s.xp>=s.need)levelUp();hud();}
function hud(){if(!state)return;const s=state;$('health').style.width=`${s.p.hp/s.p.max*100}%`;$('xp').style.width=`${Math.min(100,s.xp/s.need*100)}%`;$('levelText').textContent=`УР. ${s.level}  ·  ${Math.ceil(s.p.hp)} / ${s.p.max} HP`;$('time').textContent=clock(s.t);$('kills').textContent=`${s.kills} ПОБЕЖДЕНО`;$('weapon').textContent=Villagers.defs[selected].weapon;$('helmets').textContent='ШЛЕМЫ: '+Progression.data.helmets+' (+'+s.earned+')';const boss=s.enemies.find(e=>e.boss);show('bossbar',!!boss);if(boss)$('bosshealth').style.width=`${boss.hp/boss.max*100}%`;}
function background(cx,cy){ctx.fillStyle='#89954e';ctx.fillRect(0,0,W,H);ctx.save();ctx.translate(-cx,-cy);Village.drawGround(ctx);ctx.restore();}
function draw(){const s=state,p=s?s.p:{x:1100,y:1010},cx=clamp(p.x-W/2,0,WORLD-W),cy=clamp(p.y-H/2,0,WORLD-H);ctx.save();if(s&&s.shake&&mode==='play')ctx.translate(rand(-s.shake,s.shake),rand(-s.shake,s.shake));background(cx,cy);ctx.save();ctx.translate(-cx,-cy);if(s){Villagers.ground(ctx,s,selected);Corpses.draw(ctx,s.corpses,cx,cy,W,H);for(const h of s.helmets)Villagers.helmet(ctx,h.x,h.y);for(const g of s.gems){ctx.fillStyle='#142d25';ctx.fillRect(g.x-4,g.y,9,5);ctx.fillStyle=g.v>3?'#d4e890':'#8bd3ac';ctx.beginPath();ctx.moveTo(g.x,g.y-6);ctx.lineTo(g.x+4,g.y-1);ctx.lineTo(g.x,g.y+4);ctx.lineTo(g.x-4,g.y-1);ctx.fill();ctx.fillStyle='#d2f6c5';ctx.fillRect(g.x-1,g.y-4,2,3);}for(const a of s.pickups){ctx.fillStyle='#603b26';ctx.fillRect(a.x-7,a.y-5,14,10);ctx.fillStyle='#dc9c5e';ctx.fillRect(a.x-5,a.y-7,10,9);ctx.fillStyle='#efdcab';ctx.fillRect(a.x+5,a.y-2,5,3);}
for(const e of s.enemies)Legion.telegraph(ctx,e);
const actors=[...Village.objects.map(o=>({...o,scenery:true})),...s.enemies,{...p,type:selected,player:true}].sort((a,b)=>a.y-b.y);for(const e of actors){if(e.scenery){Village.drawObject(ctx,e,p);continue;}const size=e.boss?3.5:e.type==='obelix'?3.5:e.player?3:e.type==='monster'?3:2.5;ctx.fillStyle='#14291e66';ctx.beginPath();ctx.ellipse(e.x,e.y,12*size/2,4*size/2,0,0,Math.PI*2);ctx.fill();const bob=e.player?(p.moving?Math.sin(s.step*15)*1.7:0):Math.sin(s.step*9+e.phase)*1.4;if(e.player)sprite(ctx,e.type,e.x,e.y,size,e.flip,bob,p.inv>0&&Math.floor(p.inv*15)%2===0,e.phase||0,e);else Legion.draw(ctx,e,sprite);if(e.player){const aim=p.action?.direction||p.facing;ctx.save();ctx.translate(e.x,e.y);ctx.rotate(Math.atan2(aim.y,aim.x));ctx.fillStyle='#f6cb72bb';ctx.beginPath();ctx.moveTo(35,0);ctx.lineTo(26,-5);ctx.lineTo(26,5);ctx.closePath();ctx.fill();ctx.restore();ctx.fillStyle='#f6cb72';ctx.fillRect(e.x-3,e.y-(typeof HeroArt!=='undefined'&&HeroArt.get(e.type)?(e.type==='obelix'?94:67):15*size+6),6,2);}else if(e.hp<e.max&&!e.boss){ctx.fillStyle='#233429';ctx.fillRect(e.x-12,e.y-(e.unit==='ram'?132:e.unit==='turtle'?116:84),24,3);ctx.fillStyle='#c4956d';ctx.fillRect(e.x-12,e.y-(e.unit==='ram'?132:e.unit==='turtle'?116:84),24*e.hp/e.max,3);}}
for(const b of s.enemyShots)Legion.projectile(ctx,b);
Villagers.projectiles(ctx,s);for(const b of s.shots){if(typeof MenhirArt!=='undefined')MenhirArt.draw(ctx,b);}
for(const f of s.fx){ctx.save();ctx.globalAlpha=f.life/f.max;if(f.kind==='spark'){ctx.fillStyle=f.color;ctx.fillRect(f.x,f.y,3,3);}else{ctx.strokeStyle=f.kind==='slash'?'#f8dfa0':f.kind==='ring'?'#a9c7e0':'#e97451';ctx.lineWidth=f.kind==='slash'?7:3;ctx.beginPath();const r=f.r*(1-(f.life/f.max)*.3);ctx.arc(f.x,f.y,r,f.kind==='slash'?f.angle-(f.half||Math.PI/4):0,f.kind==='slash'?f.angle+(f.half||Math.PI/4):Math.PI*2);ctx.stroke();if(f.kind==='slash'){ctx.lineWidth=2;ctx.beginPath();ctx.arc(f.x,f.y,r-12,f.angle-(f.half||Math.PI/4),f.angle+(f.half||Math.PI/4));ctx.stroke();}}ctx.restore();}
ctx.font='bold 12px monospace';ctx.textAlign='center';for(const t of s.texts){ctx.globalAlpha=Math.min(1,t.life*3);ctx.fillStyle='#111f18';ctx.fillText(t.v,t.x+1,t.y+1);ctx.fillStyle=typeof t.v==='string'?'#bfe7a3':'#fff1c6';ctx.fillText(t.v,t.x,t.y);}ctx.globalAlpha=1;
}else{for(const o of [...Village.objects].sort((a,b)=>a.y-b.y))Village.drawObject(ctx,o);for(let i=0;i<14;i++)sprite(ctx,'roman',1300+(i%5)*47,890+Math.floor(i/5)*60,2,i%2===0,Math.sin(performance.now()/300+i));sprite(ctx,'asterix',1180,1100,2);sprite(ctx,'obelix',1230,1120,2);}
ctx.restore();const vignette=ctx.createRadialGradient(W/2,H/2,150,W/2,H/2,600);vignette.addColorStop(0,'transparent');vignette.addColorStop(1,'#08171188');ctx.fillStyle=vignette;ctx.fillRect(0,0,W,H);ctx.restore();}
function frame(now){const dt=Math.min((now-last)/1000||0,.05);last=now;if(mode==='play')update(dt);if(mode==='menu')animateMenu(now);if(toastLeft>0){toastLeft-=dt;if(toastLeft<=0)$('toast').style.opacity=0;}draw();requestAnimationFrame(frame);}requestAnimationFrame(frame);
})();

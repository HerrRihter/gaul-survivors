// Deterministic mechanics checks. Run: node test.cjs
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const nodes=new Map(),listeners={};const noop=()=>{};
const context=new Proxy({createRadialGradient:()=>({addColorStop:noop})},{get:(t,k)=>t[k]||noop,set:(t,k,v)=>(t[k]=v,true)});
function node(){return {style:{},classList:{toggle:noop},dataset:{},children:[],getContext:()=>context,addEventListener:noop,setPointerCapture:noop,replaceChildren(){this.children=[]},append(x){this.children.push(x)}};}
const document={getElementById:id=>{if(!nodes.has(id))nodes.set(id,node());return nodes.get(id)},createElement:node,querySelectorAll:()=>[],addEventListener:noop};
const env={document,window:{addEventListener:(k,v)=>listeners[k]=v},localStorage:{getItem:()=>null,setItem:noop},performance:{now:()=>0},requestAnimationFrame:noop,Math,console};
let src=fs.readFileSync(__dirname+'/game.js','utf8');src=src.replace(/\}\)\(\);\s*$/, 'globalThis.test={start,update,draw,pause,pickUpgrade,spawn,damage,finish,menu,keys,get s(){return state},get mode(){return mode},get selected(){return selected},select(v){selected=v}};})();');
vm.createContext(env);for(const file of ['progression.js','projectile-art.js','villagers.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+file,'utf8'),env);vm.runInContext(fs.readFileSync(__dirname+'/roman-art-legacy.js','utf8'),env);vm.runInContext(fs.readFileSync(__dirname+'/roman-art.js','utf8'),env);vm.runInContext(fs.readFileSync(__dirname+'/village-collision.js','utf8'),env);vm.runInContext(fs.readFileSync(__dirname+'/village.js','utf8'),env);vm.runInContext(fs.readFileSync(__dirname+'/legion.js','utf8'),env);vm.runInContext(fs.readFileSync(__dirname+'/corpses.js','utf8'),env);vm.runInContext(src,env);const t=env.test;
t.start();assert.equal(t.mode,'play');const x=t.s.p.x;t.keys.add('KeyD');t.update(.1);assert(t.s.p.x>x);t.keys.clear();
t.s.p.x=2190;t.keys.add('ArrowRight');for(let i=0;i<10;i++)t.update(.1);t.keys.clear();assert.equal(t.s.p.x,2148,'Hero stays inside the map at the right edge');t.s.p.x=10;t.keys.add('ArrowLeft');for(let i=0;i<10;i++)t.update(.1);t.keys.clear();assert.equal(t.s.p.x,52,'Hero stays inside the map at the left edge');t.s.p.y=10;t.keys.add('ArrowUp');for(let i=0;i<10;i++)t.update(.1);t.keys.clear();assert.equal(t.s.p.y,100,'Hero stays inside the map at the top edge');t.start();
t.pause();assert.equal(t.mode,'pause');t.pause();assert.equal(t.mode,'play');
t.spawn('roman');let e=t.s.enemies[0];e.x=t.s.p.x+30;e.y=t.s.p.y;t.s.attack=0;t.update(.02);assert.equal(t.s.kills,0,'Punch has windup');assert(t.s.p.action);for(let i=0;i<12;i++)t.update(.02);assert.equal(t.s.kills,0,'Legionary survives first punch');assert(e.hp>30&&e.hp<40);assert(e.hurt,'Nonlethal hit starts reaction');assert.equal(e.action,null,'Hit interrupts attack');t.damage(e,25);assert(e.hp>0);t.damage(e,25);assert(e.hp<=0);assert.equal(e.hurt,null,'Lethal blow clears hurt animation');assert.equal(t.s.kills,1);
t.s.gems.push({x:t.s.p.x,y:t.s.p.y,v:20});t.update(.02);assert.equal(t.mode,'level');assert.equal(nodes.get('cards').children.length,3);while(t.mode==='level')t.pickUpgrade(0);assert.equal(t.mode,'play');
t.start();t.select('obelix');t.start();assert.equal(t.s.p.max,160);t.spawn('roman');t.s.attack=0;t.update(.02);assert.equal(t.s.shots.length,0,'No stone before release');for(let i=0;i<19;i++)t.update(.02);assert(t.s.shots.length>0,'Obelix releases menhir on impact frame');
t.s.p.hp=50;t.s.pickups.push({x:t.s.p.x,y:t.s.p.y});t.update(.02);assert.equal(t.s.p.hp,75);
t.s.enemies=[];t.spawn('roman');e=t.s.enemies[0];e.x=t.s.p.x;e.y=t.s.p.y;t.s.p.inv=0;t.s.attack=99;t.s.shots=[];t.s.p.action=null;t.update(.02);assert.equal(t.s.p.hp,75,'Legionary telegraphs attack');assert(e.action);for(let i=0;i<17;i++)t.update(.02);assert(t.s.p.hp<75,'Spear impact damage');const hp=t.s.p.hp;t.update(.02);assert.equal(t.s.p.hp,hp,'Invulnerability window');
// Surviving hit reactions recover, can retrigger, and do not grant invulnerability.
t.start();t.s.attack=99;t.spawn('roman');e=t.s.enemies[0];e.x=t.s.p.x+150;e.y=t.s.p.y;assert.equal(e.max,60);t.damage(e,52);assert.equal(e.hp,8,'Early legionary survives one base menhir');assert(e.hurt);const hurtX=e.x;t.update(.1);assert.equal(e.x,hurtX,'No walking during reaction');t.damage(e,1);assert.equal(e.hurt.elapsed,0,'Another hit restarts reaction');assert.equal(e.hp,7);for(let i=0;i<18;i++)t.update(.02);assert.equal(e.hurt,null);assert(e.moving,'Walking resumes after recovery');t.damage(e,0);assert.equal(e.hurt,null,'Zero damage has no reaction');
// A sidestep out of range must avoid a telegraphed thrust.
t.start();t.s.attack=99;t.spawn('roman');e=t.s.enemies[0];e.x=t.s.p.x+20;e.y=t.s.p.y;t.update(.02);assert(e.action);const beforeDodge=t.s.p.hp;t.s.p.y+=160;for(let i=0;i<18;i++)t.update(.02);assert.equal(t.s.p.hp,beforeDodge,'Escaping windup avoids damage');
// Walk phase advances only on displacement; paused game loop never advances it.
t.start();const idleWalk=t.s.p.walk||0;t.update(.02);assert.equal(t.s.p.walk,idleWalk);t.keys.add('KeyD');t.update(.05);assert(t.s.p.walk>idleWalk);t.keys.clear();const walk=t.s.p.walk;t.update(.02);assert.equal(t.s.p.walk,walk);assert.equal(t.s.p.moving,false);
t.start();for(let i=0;i<6002;i++){t.s.p.inv=1;t.s.stats.damage=0;t.update(.05);if(t.mode==='level')t.pickUpgrade(0);if(i%100===0)t.draw();}assert(t.s.bossSpawned,'Boss should spawn');assert.equal(t.mode,'play','Time alone must not win with living boss');const boss=t.s.enemies.find(e=>e.boss);assert(boss);t.damage(boss,1e6);t.update(.05);assert.equal(t.mode,'end');assert.equal(nodes.get('endTitle').textContent,'Пир начинается!');
t.start();t.s.p.hp=-1;t.update(.02);assert.equal(t.mode,'end');assert.equal(nodes.get('endTitle').textContent,'Нужен ещё глоток зелья');t.start();assert.equal(t.s.kills,0);assert.equal(t.s.level,1);t.menu();assert.equal(t.mode,'menu');assert.equal(nodes.get('heroRoster').children.length,6,'Map hero roster lists all playable characters');nodes.get('openVillage').onclick();nodes.get('heroRoster').children[1].onclick();assert.equal(t.selected,'obelix','Village selection updates selected hero');assert.equal(nodes.get('heroRecord').textContent,'Выбран герой: Обеликс');nodes.get('start').onclick();assert.equal(t.mode,'play');assert.equal(t.s.p.max,160,'Selected hero starts the map level');
console.log('PASS: movement, pause, both attacks, XP, upgrade choice, healing, contact damage, invulnerability, full 5-minute simulation, boss victory, defeat and restart.');



// Village/legion integration regressions.
const V=env.Village,L=env.Legion;
for(let time=0;time<=300;time+=5)for(let r=0;r<1;r+=.01)assert(['roman','spear','pilum','veteran'].includes(L.wave(time,r)),'Only legion in regular waves');
let body={x:680,y:900};V.move(body,200,0,14);assert(body.x<800,'House blocks swept movement');assert(!V.blocked(body.x,body.y,14));
body={x:700,y:840};const goal={x:970,y:840};for(let i=0;i<900;i++){const d=V.direction(body,goal,14);V.move(body,d.x*3,d.y*3,14);}assert(Math.hypot(body.x-goal.x,body.y-goal.y)<20,'Navigation goes around a house');
function isolated(unit,x=1250,y=1100){t.select('asterix');t.start();t.s.spawn=999;t.s.attack=999;t.s.enemies=[];const e=t.spawn(unit);e.x=x;e.y=y;e.heading=Math.PI;t.s.p.x=1100;t.s.p.y=1100;return e;}
e=isolated('turtle');assert.equal(e.hp,480);t.damage(e,100);assert.equal(e.hp,445,'Front shields absorb 65%');t.s.p.x=1400;t.damage(e,100);assert.equal(e.hp,345,'Rear receives full damage');
e=isolated('spear',1195);t.update(.02);assert(e.action,'Long-range thrust begins');t.s.p.y+=55;const spearHP=t.s.p.hp;for(let i=0;i<30;i++)t.update(.02);assert.equal(t.s.p.hp,spearHP,'Sidestep avoids locked spear line');
e=isolated('pilum',1320);t.update(.02);for(let i=0;i<36;i++)t.update(.02);assert(t.s.enemyShots.length,'Pilum released after windup');for(let i=0;i<65;i++)t.update(.02);assert(t.s.p.hp<t.s.p.max,'Pilum hits hero');
e=isolated('pilum',950,900);t.s.enemyShots=[{x:990,y:695,vx:235,vy:0,damage:13,life:2}];t.update(.2);assert.equal(t.s.enemyShots.length,0,'House intercepts pilum');
e=isolated('ram',960,1170);e.cd=99;e.charge={x:-1,y:0,left:2};e.heading=Math.PI;for(let i=0;i<60;i++)t.update(.02);assert.equal(e.charge,null,'Ram stops at house');assert(e.x>=820,'Ram stays outside expanded house footprint');assert(!V.blocked(e.x,e.y,e.r));
t.start();t.s.stats.damage=0;t.s.p.inv=999;t.s.t=100;t.s.spawn=999;t.update(.02);assert(t.s.enemies.some(e=>e.unit==='turtle'));t.s.t=155;t.update(.02);assert(t.s.enemies.some(e=>e.unit==='ram'));assert(t.s.enemies.every(e=>L.units[e.unit]));t.draw();
console.log('PASS: legion-only waves, house collision/navigation, turtle front/rear armor, spear dodge, pilum release/hit/cover, ram collision and siege schedule.');

// Corpses are decoration, never live enemies or additional rewards.
t.start();t.s.spawn=999;t.s.attack=999;e=t.spawn('roman');e.x=1250;e.y=1100;t.damage(e,1000);assert.equal(t.s.corpses.length,1);const deadBody=t.s.corpses[0];t.damage(e,1000);assert.equal(t.s.corpses.length,1);assert.equal(t.s.kills,1);t.update(.05);assert.equal(t.s.enemies.length,0);assert.equal(t.s.corpses.length,1);t.draw();for(let i=0;i<119;i++)t.update(.05);assert.equal(env.Corpses.opacity(deadBody),1);for(let i=0;i<20;i++)t.update(.05);assert(env.Corpses.opacity(deadBody)<.6&&env.Corpses.opacity(deadBody)>.4);for(let i=0;i<22;i++)t.update(.05);assert.equal(t.s.corpses.length,0);
t.start();e=t.spawn('turtle');t.damage(e,10000);assert.equal(t.s.corpses.length,6);e=t.spawn('ram');t.damage(e,10000);assert.equal(t.s.corpses.length,10);assert.equal(t.s.kills,2);for(let i=0;i<200;i++){e=t.spawn('roman');t.damage(e,10000);}assert.equal(t.s.corpses.length,env.Corpses.limit);t.start();assert.equal(t.s.corpses.length,0);
console.log('PASS: noninteractive corpses, no duplicate rewards, six seconds visible / two seconds fade, siege crews, bounded count and reset.');

// Fatal impulse chooses corpse direction; facing and stale velocity do not.
for(const [sx,sy,nx,ny]of [[-100,0,1,0],[100,0,-1,0],[0,-100,0,1],[0,100,0,-1],[-100,-100,Math.SQRT1_2,Math.SQRT1_2]]){t.start();e=t.spawn('roman');e.x=1100;e.y=1100;e.heading=Math.PI;e.vx=999;e.vy=-999;t.damage(e,999,0,0,{x:e.x+sx,y:e.y+sy});const body=t.s.corpses[0];assert(Math.abs(body.fallX-nx)<1e-9);assert(Math.abs(body.fallY-ny)<1e-9);const hx=Math.sin(body.angle),hy=-Math.cos(body.angle)*.58,hlen=Math.hypot(hx,hy);assert(Math.abs(hx/hlen-nx)<1e-9);assert(Math.abs(hy/hlen-ny)<1e-9);}
t.start();e=t.spawn('roman');t.damage(e,999,-200,0,{x:e.x-10,y:e.y});assert.equal(t.s.corpses[0].fallX,-1,'Projectile impulse takes precedence over player position');
console.log('PASS: fatal hit direction from all sides and diagonal, correct visual rotation, last-hit impulse precedence.');

// Directional attacks follow movement input, persist at rest, and turn during windup.
const directions=[
 ['KeyD',null,1,0],['KeyA',null,-1,0],['KeyW',null,0,-1],['KeyS',null,0,1],
 ['KeyD','KeyW',Math.SQRT1_2,-Math.SQRT1_2],['KeyD','KeyS',Math.SQRT1_2,Math.SQRT1_2],
 ['KeyA','KeyW',-Math.SQRT1_2,-Math.SQRT1_2],['KeyA','KeyS',-Math.SQRT1_2,Math.SQRT1_2]
];
function prepare(hero){t.select(hero);t.start();t.s.spawn=999;t.s.attack=999;t.s.p.inv=999;}
function dummy(x,y){const e=t.spawn('roman');e.x=x;e.y=y;e.speed=0;e.cd=999;return e;}
for(const [k1,k2,dx,dy] of directions){
 prepare('asterix');t.keys.add(k1);if(k2)t.keys.add(k2);t.update(.02);t.keys.clear();
 assert(Math.abs(t.s.p.facing.x-dx)<1e-9&&Math.abs(t.s.p.facing.y-dy)<1e-9,'All eight input directions');
 t.update(.1);const p=t.s.p;
 const front=dummy(p.x+dx*45,p.y+dy*45),rear=dummy(p.x-dx*30,p.y-dy*30),side=dummy(p.x-dy*60,p.y+dx*60);
 t.s.attack=0;t.update(.01);assert(t.s.p.action.direction);for(let i=0;i<6;i++)t.update(.04);
 assert.equal(front.hp,35,'Front enemy hit');assert.equal(rear.hp,60,'Closer enemy behind cannot redirect punch');assert.equal(side.hp,60,'Side enemy outside sector spared');
 prepare('obelix');t.keys.add(k1);if(k2)t.keys.add(k2);t.update(.02);t.keys.clear();t.update(.1);
 dummy(t.s.p.x-dx*100,t.s.p.y-dy*100);t.s.attack=0;t.update(.01);for(let i=0;i<10;i++)t.update(.04);
 const shot=t.s.shots[0];assert(shot,'Throws without a target ahead');assert(Math.abs(shot.vx-320*dx)<1e-6&&Math.abs(shot.vy-320*dy)<1e-6,'Menhir follows last movement');
}
prepare('asterix');let punchRight=dummy(t.s.p.x+45,t.s.p.y),punchLeft=dummy(t.s.p.x-45,t.s.p.y);
t.s.attack=0;t.update(.01);assert.equal(t.s.p.action.direction.x,1,'Punch starts toward the current facing');
t.keys.add('KeyA');t.update(.03);assert.equal(t.s.p.action.direction.x,-1,'Punch turns toward movement during windup');
assert.equal(t.s.p.action.flip,true,'Attack animation turns during windup');for(let i=0;i<5;i++)t.update(.04);
assert.equal(punchLeft.hp,35,'Punch hits in the latest facing at impact');assert.equal(punchRight.hp,60,'Punch does not hit in its original direction');
prepare('obelix');t.s.attack=0;t.update(.01);t.keys.add('KeyA');t.update(.03);t.keys.clear();
assert.equal(t.s.p.facing.x,-1);assert.equal(t.s.p.action.direction.x,-1,'Active throw turns toward movement during windup');
assert.equal(t.s.p.action.flip,true,'Throw animation turns during windup');
for(let i=0;i<9;i++)t.update(.04);assert(t.s.shots[0].vx<0,'Menhir follows the facing at release');
t.s.shots=[];t.s.stats.stones=3;t.s.menhir=0;t.update(.01);assert.equal(t.s.shots.length,3);assert(t.s.shots.every(b=>b.vx<0),'Bonus menhir fan follows current facing');
t.start();assert.equal(t.s.p.facing.x,1);assert.equal(t.s.p.facing.y,0);
console.log('PASS: eight-direction punches and throws, no rear/side damage, remembered facing, turning windup, bonus menhir fan, reset.');

// New villagers: actual combat integration and permanent purchases.
env.Progression.earn(1000);
for(const id of ['cacofonix','antisanitarix','automatix','panoramix'])assert(env.Progression.buyHero(id));
prepare('cacofonix');let near=dummy(1140,1100),far=dummy(1280,1100);t.update(.01);assert.equal(near.hp,48);assert.equal(far.hp,60);assert.equal(t.s.p.action,undefined);
prepare('automatix');assert.equal(t.s.p.speed,105);near=dummy(1130,1140);let behind=dummy(1060,1100);t.s.attack=0;t.update(.01);for(let i=0;i<8;i++)t.update(.04);assert.equal(near.hp,10);assert.equal(behind.hp,60);
prepare('antisanitarix');near=dummy(1200,1100);t.s.attack=0;t.update(.01);for(let i=0;i<7;i++)t.update(.04);assert(t.s.fish.length);t.s.attack=999;const fish=t.s.fish[0];assert(fish.vx>0,'Thrown fish starts facing its outbound direction');while(!fish.back&&fish.age<.8)t.update(.02);assert(fish.back&&fish.vx<0,'Returning fish faces its actual return direction');for(let i=0;i<70;i++)t.update(.02);assert.equal(near.hp,12,'Fish hits once outbound and once on return');assert.equal(t.s.fish.length,0,'Fish returns to its owner');
prepare('panoramix');t.update(.05);assert.equal(t.s.poison.length,0,'Idle druid leaves no puddles');t.keys.add('KeyD');for(let i=0;i<8;i++)t.update(.05);t.keys.clear();assert(t.s.poison.length>=2);const puddle=t.s.poison[0];near=dummy(puddle.x,puddle.y);t.s.poisonTick=0;t.update(.01);assert.equal(near.hp,52,'Overlapping poison does not multiply tick damage');for(let i=0;i<80;i++)t.update(.05);assert.equal(t.s.poison.length,0);
prepare('asterix');const wallet=env.Progression.data.helmets;t.s.helmets.push({x:1100,y:1100,value:3});t.update(.01);assert.equal(env.Progression.data.helmets,wallet+3);assert.equal(t.s.earned,3);t.update(.01);assert.equal(env.Progression.data.helmets,wallet+3,'Pickup counted once');
assert(env.Progression.buyUpgrade('health'));assert(env.Progression.buyUpgrade('power'));assert(env.Progression.buyUpgrade('speed'));
prepare('asterix');assert.equal(t.s.p.max,120);assert.equal(t.s.stats.damage,1.05);assert.equal(t.s.stats.speed,1.03);
console.log('PASS: all four unlocked heroes, musical aura, 180-degree hammer, returning fish with two hits, moving poison trail/expiry, helmet pickup once, permanent bonuses.');

prepare('asterix');const beforeKills=env.Progression.data.kills,bank=env.Progression.data.helmets,oldRandom=env.Math.random;
let victim=dummy(1200,1100);
try{env.Math.random=()=>.01;t.damage(victim,999);assert.equal(t.s.helmets.length,1,'Rare roll drops a helmet pile');assert.equal(t.s.helmets[0].value,3);t.damage(victim,999);assert.equal(t.s.helmets.length,1,'Dead soldier cannot drop twice');}
finally{env.Math.random=oldRandom;}
assert.equal(env.Progression.data.kills,beforeKills+1);assert.equal(env.Progression.data.helmets,bank+((beforeKills+1)%10===0?1:0),'Uncollected helmets are not credited');
victim=dummy(1250,1100);try{env.Math.random=()=>.9;t.damage(victim,999);assert.equal(t.s.helmets.length,1,'Ordinary roll drops no helmets');}finally{env.Math.random=oldRandom;}
const credited=env.Progression.data.helmets;t.s.p.hp=-1;t.update(.01);t.menu();t.start();assert.equal(env.Progression.data.helmets,credited,'Defeat and restart preserve bank');assert.equal(t.s.helmets.length,0,'Uncollected field loot resets');
console.log('PASS: rare drop and no-drop rolls, no duplicate loot, kill accounting, uncollected loot, bank survives defeat/restart.');

context.getImageData=()=>{throw new Error('SecurityError: canvas readback blocked');};
t.menu();nodes.get('shopOpen').onclick();assert.equal(nodes.get('shopHeroes').children.length,6);assert.equal(nodes.get('shopUpgrades').children.length,3);nodes.get('shopClose').onclick();nodes.get('shopOpen').onclick();assert.equal(nodes.get('shopHeroes').children.length,6);
console.log('PASS: shop opens and reopens with all heroes/upgrades when canvas pixel readback is blocked.');

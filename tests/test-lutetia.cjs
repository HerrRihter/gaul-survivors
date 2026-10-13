const assert=require('node:assert/strict');
const path=require('node:path');
const {createHarness}=require('./helpers/game-harness.cjs');
const {loadModule}=require('./helpers/load-modules.cjs');
(async()=>{
 const {session:t,env}=await createHarness();
 const {createArenas}=await loadModule(env,path.resolve(__dirname,'../src/world/arenas.js'));
 const city=createArenas(env.Village).get('lutetia');
 assert(city.objects.some(o=>o.art==='guardpost'));
 assert(city.objects.length>=16);assert.equal(city.residents.length,6);
 for(const art of ['fountain-v2','garden-v2']){
  const landmark=city.objects.find(o=>o.art===art);assert(landmark,'City includes '+art);
  assert(city.blocked(landmark.x,landmark.y-65,14),'Landmark has a solid ground footprint');
 }
 assert(city.objects.filter(o=>o.art==='lamp').length>=12,'Streets have lighting');
 assert(!city.blocked(1100,1100,46),'All units fit in market spawn');
 for(const r of city.residents)assert(!city.blocked(r.x,r.y,35),'Merchant has free starting position');
 city.prepare([14,17,29,35],{x:1100,y:1100});
 for(const target of [{x:440,y:70},{x:60,y:1100},{x:2100,y:1100},{x:1100,y:2100}]){
  const p={x:1100,y:1100};
  for(let i=0;i<1300&&Math.hypot(p.x-target.x,p.y-target.y)>30;i++){const d=city.direction(p,target,17);city.move(p,d.x*6,d.y*6,17);}
  assert(Math.hypot(p.x-target.x,p.y-target.y)<30,'Market connects to city exit '+JSON.stringify(target));
 }
 function reset(){t.selectMap('lutetia');t.start();t.state.attack=1e6;t.state.spawn=1e6;t.state.waveNext={courtesan:1e6,wine:1e6};t.state.populationNext=1e6;}
 function ticks(n){for(let i=0;i<n;i++)t.update(.02);}
 reset();assert.equal(t.state.enemies.filter(e=>e.unit==='merchant').length,6,'Merchants exist before first tick');
 assert.equal(t.state.enemies.filter(e=>e.unit.startsWith('citizen')).length,24);
 let merchant=t.state.enemies[1],x=merchant.x,y=merchant.y;
 t.state.enemies=[merchant];t.state.p.x=x;t.state.p.y=y+160;t.damage(merchant,1,300,100);
 ticks(45);assert.equal(merchant.x,x);assert.equal(merchant.y,y);assert(t.state.enemyShots.some(s=>s.kind==='goods'),'Merchant throws wares');
 ticks(50);assert(t.state.p.hp<t.state.p.max,'Goods damage player');
 reset();t.state.enemies=[];let thief=t.spawn('courtesan',false,{x:1100,y:1050});
 t.state.p.x=1450;t.state.p.y=1100;thief.hp=20;
 t.state.gems=[{x:thief.x+10,y:thief.y,v:8}];t.state.pickups=[{x:thief.x,y:thief.y+12,type:'food'}];
 ticks(1);assert(thief.fleeUntil>t.state.t);thief.fleeUntil=0;thief.x=1100;thief.y=1050;ticks(1);assert.equal(t.state.gems.length,0);assert.equal(t.state.pickups.length,0);assert.equal(t.state.xp,0);assert.equal(thief.hp,45);
 reset();t.state.enemies=[];thief=t.spawn('courtesan',false,{x:1100,y:1100});
 t.state.p.x=1110;t.state.p.y=1100;t.state.p.hp=40;
 t.state.pickups=[{x:1105,y:1100,type:'food'}];ticks(1);assert.equal(t.state.p.hp,40,'Stolen food cannot also heal hero');
 reset();t.state.enemies=[];const spear=t.spawn('auxiliary',false,{x:1180,y:1100});
 ticks(1);assert(spear.action,'Spear winds up');t.state.p.y=1200;ticks(30);assert.equal(t.state.p.hp,t.state.p.max,'Spear attack can be dodged sideways');
 reset();t.state.spawn=0;t.state.waveNext={};t.state.t=160;t.state.p.inv=999;ticks(1);
 assert(t.state.enemies.some(e=>['roman','auxiliary','pilum','veteran'].includes(e.unit)));assert(t.state.enemies.some(e=>e.unit==='courtesan'));assert(t.state.enemies.some(e=>e.unit==='wine'));assert(t.state.enemies.some(e=>e.unit==='turtle'));
 assert(!t.state.enemies.some(e=>e.unit==='ram'),'City excludes rams');
 t.draw();t.selectMap('village');t.start();assert.equal(t.state.enemies.length,0,'Residents never leak into other maps');
 reset();t.state.spawn=.5;t.state.waveNext={};t.state.p.inv=999;t.state.stats.damage=0;
 for(let i=0;i<6001;i++)t.update(.05);
 assert(t.state.bossSpawned,'City retains final boss and run completion');
 assert(t.state.enemies.length<=135,'Population stays bounded');
 t.menu();t.selectMap('lutetia');t.start();assert.equal(t.state.enemies.filter(e=>e.unit==='merchant').length,6,'Restart resets merchants');assert.equal(t.state.enemies.filter(e=>e.unit.startsWith('citizen')).length,24);
 console.log('PASS: Lutetia navigation, starting merchants, immobility, goods damage, loot theft, dodge, roster, full run and reset.');
})().catch(e=>{console.error(e);process.exitCode=1;});

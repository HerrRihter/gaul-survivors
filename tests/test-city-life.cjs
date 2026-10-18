'use strict';
// City life in Lutetia: citizens walk to stalls, squares and doors, panic away from the hero,
// pigeons scatter and land elsewhere, speech bubbles stay rare. Other maps have none of it.
const assert=require('node:assert/strict');
const path=require('node:path');
const {createHarness}=require('./helpers/game-harness.cjs');
const {loadModule}=require('./helpers/load-modules.cjs');
(async()=>{
 const {session:t,env}=await createHarness();
 // The layout is seeded, so a separate instance has the same points of interest as the session.
 const {createArenas}=await loadModule(env,path.resolve(__dirname,'../src/world/arenas.js'));
 const world=createArenas(env.Village).get('lutetia');
 const quiet=()=>{const s=t.state;s.attack=9999;s.spawn=9999;s.waveNext={courtesan:9999,wine:9999};s.p.inv=1e9;};
 t.selectMap('lutetia');t.start();quiet();
 const poi=world.pointsOfInterest;
 assert(poi.doors.length>=20&&poi.stalls.length===10&&poi.plazas.length>=8,'Lutetia exposes doors, stalls and squares');
 for(const q of [...poi.doors,...poi.plazas,...poi.stalls.flatMap(s=>s.queue)])assert(!world.blocked(q.x,q.y,14),'Points of interest are walkable');

 // Citizens far from the hero queue at stalls and gather on squares, one per queue spot.
 let queued=0,gathered=0,maxBubbles=0;const activities=new Set();
 const crowd=()=>t.state.enemies.filter(e=>e.unit==='citizen'&&e.hp>0);
 for(let i=0;i<1500;i++){
  t.state.p.x=1100;t.state.p.y=1100;t.update(1/30);
  maxBubbles=Math.max(maxBubbles,t.state.city.bubbles.length);
  const lingering=crowd().filter(e=>e.mode==='linger');
  const keys=lingering.filter(e=>e.goal.key).map(e=>e.goal.key);
  assert.equal(new Set(keys).size,keys.length,'No two citizens share a queue spot');
  queued=Math.max(queued,lingering.filter(e=>e.goal.kind==='stall').length);
  gathered=Math.max(gathered,lingering.filter(e=>e.goal.kind==='plaza').length);
  for(const e of lingering)activities.add(e.goal.kind+':'+e.activity);
  assert(crowd().every(e=>e.mode==='linger'||!e.activity),'Only lingering citizens have an activity');
  for(const e of crowd().filter(e=>e.activity==='talk')){
   const o=e.partner;assert(o&&o.partner===e,'Talkers come in mutual pairs');
   assert(Math.abs(o.x-e.x)>20&&Math.abs(o.y-e.y)<30,'Talkers stand side by side');
   assert.equal(Math.cos(e.heading)<0,o.x<e.x,'Talkers face each other');
  }
 }
 assert(queued>=2,'Citizens queue at stalls: '+queued);
 assert(gathered>=2,'Citizens gather on squares: '+gathered);
 assert(crowd().length<=40,'Crowd stays bounded');
 assert(maxBubbles<=2,'At most two speech bubbles at once');
 assert(activities.has('stall:shop'),'Citizens shop at stalls');
 assert(activities.has('plaza:talk')||activities.has('plaza:rest'),'Citizens talk or rest on squares: '+[...activities]);

 // Every activity is an animation of each citizen skin, and it loops.
 const fs=require('node:fs');const frames=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../data/animations/character-frames.json'),'utf8')).characters;
 const {cityLife}=await loadModule(env,path.resolve(__dirname,'../data/maps/city-life.js'));
 for(const activity of Object.values(cityLife.citizens.activities))for(const id of ['citizen-0','citizen-1','citizen-2','citizen-3','citizen-4','citizen-5','citizen-6','citizen-7','citizen-8']){
  assert(frames[id].actions[activity]?.length,id+' has frames for '+activity);assert(frames[id].loop.includes(activity),id+' loops '+activity);
 }

 // Panic: a citizen next to the hero runs away instead of strolling on.
 const runner=t.spawn('citizen',false,{x:1180,y:1100,variant:0});
 for(let i=0;i<20;i++)t.update(1/30);
 assert.equal(runner.mode,'flee');assert(runner.x>1200,'Citizen flees from the hero');

 // A citizen who reaches a door goes inside quietly: no corpse, no loot, no kill.
 const door=poi.doors.find(d=>Math.hypot(d.x-1100,d.y-1100)>400);
 const visitor=t.spawn('citizen',false,{x:door.x,y:door.y+10,variant:1});
 visitor.mode='walk';visitor.goal={...door,kind:'door'};visitor.checkAt=t.state.t+9;visitor.checkDistance=99;
 const before={corpses:t.state.corpses.length,gems:t.state.gems.length,kills:t.state.kills};
 for(let i=0;i<20&&visitor.hp>0;i++)t.update(1/30);
 assert.equal(visitor.hp,0,'Citizen goes indoors');
 assert.equal(t.state.corpses.length,before.corpses);assert.equal(t.state.gems.length,before.gems);assert.equal(t.state.kills,before.kills);

 // Newcomers step out of doors when the crowd is below its target size.
 t.state.enemies=t.state.enemies.filter(e=>e.unit!=='citizen');t.state.populationNext=0;t.update(1/30);
 const newcomer=crowd()[0];
 assert(newcomer&&poi.doors.some(d=>Math.hypot(d.x-newcomer.x,d.y-newcomer.y)<30),'Newcomer appears at a door');

 // Pigeons: flocks start far from the hero, burst away when approached and land elsewhere.
 t.selectMap('lutetia');t.start();quiet();t.update(1/30);
 const city=t.state.city;
 assert.equal(city.flocks.length,3,'Three flocks on the squares');
 for(const f of city.flocks)assert(Math.hypot(f.x-t.state.p.x,f.y-t.state.p.y)>600,'Flocks land away from the hero');
 const flock=city.flocks[0];t.state.p.x=flock.x+60;t.state.p.y=flock.y;t.update(1/30);
 assert(flock.flying>0,'Flock takes off when the hero approaches');
 const startX=flock.x+flock.birds[0].dx;for(let i=0;i<20;i++)t.update(1/30);
 assert(Math.abs(flock.x+flock.birds[0].dx-startX)>40,'Birds fly away');
 for(let i=0;i<60;i++)t.update(1/30);
 assert(!city.flocks.includes(flock),'Flown flock leaves');
 t.state.p.x=1100;t.state.p.y=1100;for(let i=0;i<20*30;i++)t.update(1/30);
 assert.equal(city.flocks.length,3,'A new flock lands later');

 // The crowd cheers once when the boss falls, still within the bubble limit.
 city.bubbles=[];city.bubbleNext=1e9;t.state.bossDead=true;
 t.spawn('citizen',false,{x:1400,y:1100,variant:2});t.update(1/30);
 assert(city.cheered&&city.bubbles.length>=1&&city.bubbles.length<=2,'Crowd cheers for the fallen boss');

 // Other maps stay quiet.
 for(const map of ['village','forest','camp']){t.selectMap(map);t.start();quiet();for(let i=0;i<30;i++)t.update(1/30);assert.equal(t.state.city,undefined,map+' has no city life');}
 console.log('PASS: city points of interest, queues and squares, panic, quiet doors, door newcomers, pigeon flocks, bubble limit, boss cheer and quiet maps.');
})().catch(e=>{console.error(e);process.exitCode=1;});

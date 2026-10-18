'use strict';
// Units of one type share speed and route; separation keeps them from melting into one sprite
// without pushing anyone through a wall or moving stationary and charging units.
const assert=require('node:assert/strict');
const {createHarness}=require('./helpers/game-harness.cjs');
(async()=>{
 const {session:t}=await createHarness();
 t.selectMap('village');t.start();const s=t.state;s.enemies=[];s.spawn=9999;s.waveNext={turtle:9999,ram:9999};s.p.inv=1e9;s.p.x=1100;s.p.y=1500;
 const pack=Array.from({length:12},()=>t.spawn('roman',false,{x:1100,y:1050}));
 for(let i=0;i<60;i++)t.update(1/30);
 for(let i=0;i<pack.length;i++)for(let j=i+1;j<pack.length;j++){
  const a=pack[i],b=pack[j];if(a.hp<=0||b.hp<=0)continue;
  assert(Math.hypot(a.x-b.x,a.y-b.y)>(a.r+b.r)*.6,'Soldiers of one type spread out');
 }
 // Separation never moves a stationary unit.
 t.selectMap('lutetia');t.start();const merchant=t.state.enemies.find(e=>e.unit==='merchant');const at={x:merchant.x,y:merchant.y};
 t.state.spawn=9999;t.state.p.inv=1e9;
 for(let i=0;i<6;i++)t.spawn('citizen',false,{x:merchant.x,y:merchant.y+4,variant:i});
 for(let i=0;i<30;i++)t.update(1/30);
 assert.deepEqual({x:merchant.x,y:merchant.y},at,'Stationary merchants are never pushed');
 console.log('PASS: same-type packs spread out, stationary units stay put.');
})().catch(e=>{console.error(e);process.exitCode=1;});

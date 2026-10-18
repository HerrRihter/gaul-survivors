'use strict';
// A hero cannot outrun the legion forever: while the hero keeps running, new soldiers appear
// ahead, and wave soldiers left off screen behind are moved out ahead again.
const assert=require('node:assert/strict');
const {createHarness}=require('./helpers/game-harness.cjs');
(async()=>{
 const {session:t}=await createHarness();
 const reset=()=>{t.selectMap('village');t.start();const s=t.state;s.enemies=[];s.spawn=9999;s.waveNext={turtle:9999,ram:9999};s.p.inv=1e9;s.p.x=800;s.p.y=1050;t.keys.clear();};
 const ahead=list=>list.filter(e=>e.x>t.state.p.x).length/list.length;

 // Standing still: spawns surround the hero.
 reset();for(let i=0;i<30;i++)t.update(1/30);
 const around=Array.from({length:60},()=>t.spawn('roman')).filter(Boolean);
 assert(ahead(around)>.25&&ahead(around)<.75,'A standing hero is surrounded evenly: '+ahead(around));

 // Running right: most spawns appear ahead, past the edge of the screen.
 reset();t.keys.add('KeyD');for(let i=0;i<45;i++)t.update(1/30);
 assert(t.state.drift.x>45,'Drift follows the running hero');
 t.state.enemies=[];const front=Array.from({length:60},()=>t.spawn('roman')).filter(Boolean);
 assert(ahead(front)>.7,'Running hero meets spawns ahead: '+ahead(front));

 // A wave soldier left behind off screen returns ahead; scripted and siege units stay put.
 reset();t.keys.add('KeyD');for(let i=0;i<30;i++)t.update(1/30);
 const place=(unit,x)=>{for(let y=900;y<1300;y+=20){const e=t.spawn(unit,false,{x,y});if(e)return e;}};
 const straggler=place('roman',t.state.p.x-560);straggler.wave=true;
 const siege=place('turtle',t.state.p.x-560);
 const siegeX=siege.x;
 for(let i=0;i<60;i++)t.update(1/30);
 assert(straggler.x>t.state.p.x,'Straggler is moved ahead of the running hero');
 assert(Math.abs(siege.x-siegeX)<200,'Units outside the normal wave are never moved');
 console.log('PASS: even spawns around a standing hero, spawns ahead of a running hero, stragglers return ahead, siege units stay.');
})().catch(e=>{console.error(e);process.exitCode=1;});

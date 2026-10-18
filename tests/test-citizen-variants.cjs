const assert=require('node:assert/strict');
const {createHarness}=require('./helpers/game-harness.cjs');
const {frameHarness}=require('./helpers/frame-harness.cjs');
(async()=>{
 const {session:t,env}=await createHarness();t.selectMap('lutetia');t.start();
 const {loadModule}=require('./helpers/load-modules.cjs');
 const {unitDefinitions}=await loadModule(env,'data/enemies/units.js');
 const {waveSchedules}=await loadModule(env,'data/enemies/waves.js');
 assert.equal(unitDefinitions.citizen.variants,9);
 assert.equal(waveSchedules.lutetia.population.variants,unitDefinitions.citizen.variants,'Population and spawning agree on skin count');
 const variants=new Set(t.state.enemies.filter(e=>e.unit==='citizen').map(e=>e.variant));
 assert.deepEqual([...variants].sort(),[0,1,2,3,4,5,6,7,8],'All nine outfits populate the city');
 const h=await frameHarness('src/rendering/art/unit-art.js');h.images.forEach(i=>i.onload());
 const U=h.env.UnitArt;
 for(let v=3;v<9;v++)for(const action of ['walk','talk','shop','rest','hurt']){
  const art=U.get('citizen',action,.5,v);assert(art.url.includes('/citizen-'+v+'/'),'Outfit remains consistent in '+action);
 }
 assert.equal(U.get('citizen','walk',0,9),U.get('citizen','walk',0,0));
 assert.equal(U.get('citizen','walk',0,-1),U.get('citizen','walk',0,8));
 console.log('PASS: nine outfits in starting crowd, animation identity and variant wrapping.');
})().catch(e=>{console.error(e);process.exitCode=1;});

'use strict';
// Content contract: every definition in data/ is complete and every reference resolves.
// A hero, ability, unit, map or upgrade that misses a required piece fails here with its id.
// Wave schedules have their own contract: tools/check-game-contracts.cjs.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
const load=file=>import(pathToFileURL(path.join(root,file)).href);

async function main(){
  const {heroDefinitions,starterHeroes}=await load('data/characters/heroes.js');
  const {abilityDefinitions}=await load('data/characters/abilities.js');
  const {unitDefinitions}=await load('data/enemies/units.js');
  const {mapDefinitions}=await load('data/maps/maps.js');
  const {runUpgradeDefinitions,supplyDefinitions,permanentUpgrades}=await load('data/upgrades.js');
  const {unresolved}=await load('data/text.js');
  const frames=JSON.parse(fs.readFileSync(path.join(root,'data/animations/character-frames.json'),'utf8')).characters;
  const manifest=require(path.join(root,'tools/publication-manifest.cjs'));
  const published=new Set(manifest.groups.flatMap(g=>g.files));
  const text=(owner,value)=>{assert(typeof value==='string'&&value.trim(),owner+': empty text');assert(!unresolved(value),owner+': unresolved placeholder in "'+value+'"');};
  const positive=(owner,value)=>assert(Number.isFinite(value)&&value>0,owner+' must be a positive number, got '+value);

  // Heroes
  const kinds={melee:['damage','arc','reach','push'],stones:['damage','speed','spread','radius','life'],fish:['damage','speed','outbound','radius'],aura:['damage','period','radius'],trail:['damage','tick','life','radius','drop']};
  assert(starterHeroes.length>0,'At least one hero must be free');
  const statNames=new Set(['damage','haste','range','speed','regen','armor','magnet','maxHp']);
  for(const [id,hero] of Object.entries(heroDefinitions)){
    const where='hero '+id;
    for(const key of ['name','weapon','desc'])text(where+'.'+key,hero[key]);
    for(const key of ['hp','speed','walkStride'])positive(where+'.'+key,hero[key]);
    assert(Number.isInteger(hero.price)&&hero.price>=0,where+'.price');
    assert(kinds[hero.attack.kind],where+': unknown attack.kind '+hero.attack.kind);
    for(const key of kinds[hero.attack.kind])positive(where+'.attack.'+key,hero.attack[key]);
    if(!hero.passive)for(const key of ['interval','wind'])positive(where+'.'+key,hero[key]);
    const own=Object.values(hero.attack.stats||{});
    assert.equal(hero.upgrades.length,3,where+': three weapon cards');
    for(const u of hero.upgrades){text(where+' upgrade '+u.id,u.desc);assert(own.includes(u.stat),where+': card '+u.id+' raises '+u.stat+', which attack.stats does not read');statNames.add(u.stat);}
    text(where+'.training',hero.training.desc);assert(own.includes(hero.training.stat),where+': training raises a stat the weapon does not read');
    assert.equal(abilityDefinitions[id]?.length,2,where+': Q and E abilities in data/characters/abilities.js');
    assert(frames[id],where+': no frames in character-frames.json');
    assert(frames[id].renderer==='animation'||hero.palette?.length===2,where+': heroes without portrait art need a fallback palette');
    assert(permanentUpgrades['training_'+id],where+': training missing from the shop');
  }
  assert.deepEqual(Object.keys(abilityDefinitions).sort(),Object.keys(heroDefinitions).sort(),'Every hero, and only heroes, has abilities');
  for(const a of Object.values(abilityDefinitions).flat()){
    text('ability '+a.id,a.description);text('ability '+a.id+' upgrade',a.upgrade);
    positive('ability '+a.id+'.cooldown',a.cooldown);
  }

  // Units
  const attacks={legion:['slash','lunge','pilum','charge'],specialist:['slash','lunge','charge','net','volley','goods','cavalry','none']};
  for(const [id,u] of Object.entries(unitDefinitions)){
    const where='unit '+id;
    for(const key of ['name','role','desc'])text(where+'.'+key,u[key]);
    for(const key of ['hp','r'])positive(where+'.'+key,u[key]);
    assert(['legion','specialist','civilian','thief','treasurer'].includes(u.ai),where+': unknown ai '+u.ai);
    if(attacks[u.ai])assert(attacks[u.ai].includes(u.attack),where+': attack '+u.attack+' is not handled by the '+u.ai+' loop');
    if(u.attack==='charge'){positive(where+'.chargeSpeed',u.chargeSpeed);positive(where+'.chargeTime',u.chargeTime);}
    if(u.attack==='pilum'||u.attack==='goods')positive(where+'.projectileSpeed',u.projectileSpeed);
    if(u.attack==='volley'){positive(where+'.arrows',u.arrows);positive(where+'.arrowSpread',u.arrowSpread);}
    if(u.attack==='net'){positive(where+'.stun',u.stun);positive(where+'.stunGrace',u.stunGrace);}
    const art=u.spriteType==='citizen'?'citizen-0':u.spriteType||(id==='boss'?'boss':'roman-0');
    assert(frames[art]||u.ai==='treasurer',where+': no frames for '+art);
  }

  // Maps
  for(const [id,map] of Object.entries(mapDefinitions)){
    for(const key of ['name','description','notes','victoryTag'])text('map '+id+'.'+key,map[key]);
    assert(['village','forest','camp','lutetia'].includes(map.layout),'map '+id+': unknown layout '+map.layout);
    if(map.layout==='forest'||map.layout==='camp')assert(Number.isInteger(map.seed),'map '+id+': generated layouts need a seed');
  }

  // Upgrades
  for(const u of [...runUpgradeDefinitions,...supplyDefinitions])text('upgrade '+u.id,u.desc);
  for(const u of runUpgradeDefinitions)assert(statNames.has(u.stat),'upgrade '+u.id+' raises unknown stat '+u.stat);
  for(const [id,u] of Object.entries(permanentUpgrades)){text('shop '+id,u.desc);positive('shop '+id+'.max',u.max);}

  // Publication: every data module the game imports is published, and assets/runtime holds
  // only what the game loads (sources belong in assets/source).
  for(const file of fs.readdirSync(path.join(root,'data'),{recursive:true}))if(String(file).endsWith('.js'))
    assert(published.has('data/'+String(file).replace(/\\/g,'/')),'data/'+file+' is not in tools/publication-manifest.cjs');
  for(const file of fs.readdirSync(path.join(root,'assets/runtime'),{recursive:true,withFileTypes:true}))if(file.isFile()){
    const relative=path.relative(root,path.join(file.parentPath,file.name)).replace(/\\/g,'/');
    assert(published.has(relative),relative+' is not published; move it to assets/source or list it in tools/publication-manifest.cjs');
  }

  console.log(`PASS: content contract — ${Object.keys(heroDefinitions).length} heroes, ${Object.values(abilityDefinitions).flat().length} abilities, ${Object.keys(unitDefinitions).length} units, ${Object.keys(mapDefinitions).length} maps, texts and publication.`);
}
main().catch(e=>{console.error(e);process.exitCode=1;});

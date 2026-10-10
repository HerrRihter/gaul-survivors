const {loadModule,resourcePath}=require('./helpers/load-modules.cjs');
async function main(){
const projectRoot = require('node:path').resolve(__dirname, '..');
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(projectRoot+'/src/systems/persistence.js','utf8'),storage=new Map();
async function load(){const e={localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)}};e.AssetPaths={url:relative=>'assets/runtime/'+relative};vm.createContext(e);await loadModule(e,projectRoot+'/src/systems/persistence.js',{fresh:false});return e.Progression;}
let p=await load();assert.equal(p.data.helmets,0);assert(p.owned('asterix'));assert(!p.buyHero('cacofonix'));
for(let i=0;i<9;i++)assert.equal(p.kill(),0);assert.equal(p.kill(),1);assert.equal(p.data.helmets,1);
p.earn(99);assert(p.buyHero('cacofonix'));assert.equal(p.data.helmets,40);assert(!p.buyHero('cacofonix'));assert.equal(p.data.helmets,40);
assert(p.buyUpgrade('health'));assert.equal(p.data.helmets,10);assert.equal(p.cost('health'),60);assert(!p.buyUpgrade('health'));assert(!p.buyHero('__proto__'));
p=await load();assert(p.owned('cacofonix'));assert.equal(p.data.levels.health,1);assert.equal(p.data.helmets,10);assert.equal(p.data.kills,10);
p.earn(2000);for(let i=0;i<4;i++)assert(p.buyUpgrade('health'));assert(!p.buyUpgrade('health'));assert.equal(p.data.levels.health,5);
storage.set('gaul-progression-v1',JSON.stringify({helmets:-5,kills:'bad',unlocked:['unknown'],levels:{health:500,power:-1}}));p=await load();assert.equal(p.data.helmets,0);assert.equal(p.data.kills,0);assert.equal(p.data.levels.health,5);assert(!p.owned('unknown'));
storage.set('gaul-progression-v1','broken');assert.equal((await load()).data.helmets,0);
const e={localStorage:{getItem:()=>null,setItem:()=>{throw Error('quota');}}};e.AssetPaths={url:relative=>'assets/runtime/'+relative};vm.createContext(e);await loadModule(e,projectRoot+'/src/systems/persistence.js',{fresh:false});e.Progression.earn(3);assert.equal(e.Progression.data.helmets,3);assert.equal(e.Progression.persistent,false);
console.log('PASS: kill milestones, exact prices, insufficient funds, duplicate purchase protection, save/reload, upgrade caps, corrupt storage and write failure.');

}
main().catch(error=>{console.error(error);process.exitCode=1;});

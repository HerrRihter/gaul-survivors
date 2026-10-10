const {loadModule,resourcePath}=require('./helpers/load-modules.cjs');
async function main(){
const projectRoot = require('node:path').resolve(__dirname, '..');
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),images=[],draws=[];
const e={console,Event:class{},document:{dispatchEvent(){},createElement(){return {getContext:()=>({drawImage(...a){draws.push(a);}})};}},Image:class{set src(v){this.path=v;images.push(this);}}};
e.AssetPaths={url:relative=>'assets/runtime/'+relative};vm.createContext(e);for(const f of ['data/animations/villager-layout.js','data/animations/motion-v2-layout.js','src/rendering/art/villager-art.js'])await loadModule(e,projectRoot+'/'+f,{fresh:false});
assert.equal(e.VillagerArt.get('cacofonix'),null);
images.forEach(i=>i.onload());
assert.equal(draws.length,49);
for(const d of draws.slice(0,48)){const [image,sx,sy,sw,sh,dx,dy,dw,dh]=d;assert(fs.existsSync(resourcePath(image.path)));assert(dx>=72&&dx+dw<=184.001,'Wide tools fit portrait envelope');assert(dy>=131&&Math.abs(dy+dh-236)<.001,'Stable floor and full height');}
for(const name of ['cacofonix','antisanitarix','automatix','panoramix']){
 assert.equal(e.VillagerArt.status[name],'ready');
 for(const action of ['walk','attack','hurt'])assert.equal(new Set([0,.25,.5,.75].map(p=>e.VillagerArt.get(name,action,p))).size,4);
 let flipped=false,frame=null;const g={save(){},restore(){},translate(){},scale(){flipped=true;},drawImage(f){frame=f;}};
 e.VillagerArt.draw(g,name,0,0,{visualAction:{elapsed:.25,duration:.5,flip:true}},false);
 assert(flipped);assert.equal(frame,e.VillagerArt.get(name,'attack',.5));
 e.VillagerArt.draw(g,name,0,0,{hurt:{elapsed:.1,duration:.4,flip:false},action:{elapsed:0,duration:1}},false);assert.equal(frame,e.VillagerArt.get(name,'hurt',.25));
}
assert.equal(e.HelmetArt.status,'ready');
console.log('PASS: 48 full poses, stable floor, safe portrait margins, distinct states, casting and hurt priorities, mirroring, helmet load.');

const oldWalk=e.VillagerArt.get('automatix','walk',0);
images.slice(49).forEach(i=>i.onload());
assert.notEqual(oldWalk,e.VillagerArt.get('automatix','walk',0));
for(const d of draws.slice(49)){assert(d[5]>=72&&d[5]+d[7]<=184.001);assert(d[6]>=131&&d[6]+d[8]<=236.001);}
assert.equal(draws.slice(49).length,16,'All four heroes have replacement walk cycles');
for(let i=49;i<draws.length;i+=4)assert.equal(new Set(draws.slice(i,i+4).map(d=>d[8])).size,1,'Each hero keeps the same height across all steps');
console.log('PASS: replacement walking sheets load and all 16 poses fit the portrait envelope with constant height.');

}
main().catch(error=>{console.error(error);process.exitCode=1;});

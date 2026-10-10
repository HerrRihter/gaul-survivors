const {loadModule,resourcePath}=require('./helpers/load-modules.cjs');
async function main(){
const projectRoot = require('node:path').resolve(__dirname, '..');
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const draws=[],images=[],dimensions={'legion-animation.png':[1024,1536],'centurion-animation.png':[1774,887],'legion-hurt.png':[1448,1086]};
const env={console,URL,Event:class{},document:{
 currentScript:{src:'http://localhost/animation-art.js'},dispatchEvent(){},
 createElement(){return {getContext(){return {translate(){},scale(){},drawImage(...args){draws.push(args);}};}};}
},Image:class{set src(url){this.url=url;const layout=Object.values(require('../data/animations/motion-v2-layout.json')).find(l=>url.endsWith(l.file));const size=layout?[layout.width,layout.height]:url.endsWith('/asterix/animations.png')?[1254,563]:url.endsWith('/obelix/animations.png')?[1254,610]:dimensions[url.split('/').pop()];this.naturalWidth=size[0];this.naturalHeight=size[1];images.push(this);}}};
env.AssetPaths={url:relative=>'assets/runtime/'+relative};vm.createContext(env);for(const f of ['data/animations/animation-layout.js','src/rendering/art/animation-art.js'])await loadModule(env,projectRoot+'/'+f,{fresh:false});
assert.equal(env.AnimationArt.get('asterix'),null,'Loading must safely fall back');
images.find(i=>i.url.endsWith('/asterix/animations.png')).onload();
assert(env.AnimationArt.get('asterix'),'Asterix loads independently');
assert.equal(env.AnimationArt.get('obelix'),null,'Obelix has its own loading state');
images.filter(i=>!i.url.endsWith('/asterix/animations.png')).forEach(i=>i.onload());assert.equal(draws.length,60);
for(const [image,sx,sy,sw,sh,dx,dy,dw,dh]of draws){assert(sx>=0&&sy>=0&&sx+sw<=image.naturalWidth&&sy+sh<=image.naturalHeight,'Source crop within atlas');assert(dx>=0&&dy>=0&&dx+dw<=128.001&&dy+dh<=128.001,'Entire pose fits frame');assert(Math.abs(dy+dh-115)<.001,'Feet must share baseline');}
for(const [name,v]of [['asterix',0],['obelix',0],['roman',0],['roman',1],['roman',2],['boss',0]]){
 const walks=[0,.25,.5,.75].map(p=>env.AnimationArt.get(name,v,'walk',p));assert.equal(new Set(walks).size,4);
 const attacks=[0,.25,.5,.75].map(p=>env.AnimationArt.get(name,v,'attack',p));assert.equal(new Set(attacks).size,4);assert.equal(env.AnimationArt.get(name,v,'attack',1),attacks[3]);assert.equal(env.AnimationArt.get(name,v,'idle',.8),attacks[0]);assert.equal(env.AnimationArt.get(name,v,'walk',1),walks[0]);
}
console.log('PASS: 60 frames, no clipped poses, common floor baseline, six walk/attack/idle state selections and looping.');

const oldWalk=env.AnimationArt.get('obelix',0,'walk',0);
images.slice(5).forEach(i=>i.onload());
assert.notEqual(env.AnimationArt.get('obelix',0,'walk',0),oldWalk);
const walking=draws.slice(60);
assert.equal(walking.length,4);
assert.equal(new Set(walking.map(d=>d[8])).size,1,'Replacement walk has constant height');
for(const d of walking){assert(Math.abs(d[6]+d[8]-115)<.001);assert(d[5]>=2&&d[5]+d[7]<=126.001);}
assert.equal(new Set(draws.slice(0,4).map(d=>Math.round(d[8]*1000))).size,1,'Asterix reference has constant height');

for(let v=0;v<3;v++){const frames=[0,.25,.5,.75].map(p=>env.AnimationArt.get('roman',v,'hurt',p));assert.equal(new Set(frames).size,4);assert.equal(env.AnimationArt.get('roman',v,'hurt',1),frames[3]);}

}
main().catch(error=>{console.error(error);process.exitCode=1;});

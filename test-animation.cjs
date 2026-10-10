const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const draws=[],images=[],dimensions={'heroes-animation.png':[1254,1254],'legion-animation.png':[1024,1536],'centurion-animation.png':[1774,887],'legion-hurt.png':[1448,1086]};
const env={console,URL,Event:class{},document:{
 currentScript:{src:'http://localhost/animation-art.js'},dispatchEvent(){},
 createElement(){return {getContext(){return {translate(){},scale(){},drawImage(...args){draws.push(args);}};}};}
},Image:class{set src(url){const size=dimensions[url.split('/').pop()];this.naturalWidth=size[0];this.naturalHeight=size[1];images.push(this);}}};
vm.createContext(env);for(const f of ['animation-layout.js','animation-art.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),env);
assert.equal(env.AnimationArt.get('asterix'),null,'Loading must safely fall back');images.forEach(i=>i.onload());assert.equal(draws.length,60);
for(const [image,sx,sy,sw,sh,dx,dy,dw,dh]of draws){assert(sx>=0&&sy>=0&&sx+sw<=image.naturalWidth&&sy+sh<=image.naturalHeight,'Source crop within atlas');assert(dx>=0&&dy>=0&&dx+dw<=128.001&&dy+dh<=128.001,'Entire pose fits frame');assert(Math.abs(dy+dh-115)<.001,'Feet must share baseline');}
for(const [name,v]of [['asterix',0],['obelix',0],['roman',0],['roman',1],['roman',2],['boss',0]]){
 const walks=[0,.25,.5,.75].map(p=>env.AnimationArt.get(name,v,'walk',p));assert.equal(new Set(walks).size,4);
 const attacks=[0,.25,.5,.75].map(p=>env.AnimationArt.get(name,v,'attack',p));assert.equal(new Set(attacks).size,4);assert.equal(env.AnimationArt.get(name,v,'attack',1),attacks[3]);assert.equal(env.AnimationArt.get(name,v,'idle',.8),attacks[0]);assert.equal(env.AnimationArt.get(name,v,'walk',1),walks[0]);
}
console.log('PASS: 60 frames, no clipped poses, common floor baseline, six walk/attack/idle state selections and looping.');

for(let v=0;v<3;v++){const frames=[0,.25,.5,.75].map(p=>env.AnimationArt.get('roman',v,'hurt',p));assert.equal(new Set(frames).size,4);assert.equal(env.AnimationArt.get('roman',v,'hurt',1),frames[3]);}

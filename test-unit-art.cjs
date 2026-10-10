const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const dimensions=JSON.parse(fs.readFileSync(__dirname+'/unit-dimensions.json','utf8').replace(/^\uFEFF/,''));
const images=[],draws=[];const env={console,URL,Event:class{},document:{currentScript:{src:'http://localhost/unit-art.js'},dispatchEvent(){},createElement(){return {getContext(){return {drawImage(...args){draws.push(args)}}}}}},Image:class{set src(url){const name=url.match(/unit-(\w+)-v1/)[1];this.naturalWidth=dimensions[name].width;this.naturalHeight=dimensions[name].height;images.push(this)}}};
vm.createContext(env);for(const f of ['unit-layout.js','unit-art.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),env);
assert.equal(env.UnitArt.get('spear'),null);images.forEach(i=>i.onload());assert.equal(draws.length,60);
for(const [image,sx,sy,sw,sh,dx,dy,dw,dh]of draws){assert(sx>=0&&sy>=0&&sx+sw<=image.naturalWidth&&sy+sh<=image.naturalHeight);assert(dx>=0&&dy>=0&&dx+dw<=256&&dy+dh<=256,'Whole pose fits cached frame');assert(Math.abs(dy+dh-236)<.001,'Foot baseline stays fixed');}
for(const name of Object.keys(dimensions)){
 assert.equal(env.UnitArt.status[name],'ready');
 for(const action of ['walk','attack','hurt']){const frames=[0,.25,.5,.75].map(p=>env.UnitArt.get(name,action,p));assert.equal(new Set(frames).size,4);assert.equal(env.UnitArt.get(name,action,1),frames[action==='walk'?0:3]);}
 assert.equal(env.UnitArt.get(name,'idle'),env.UnitArt.get(name,'walk',.25));
 const e={unit:name,x:10,y:20,heading:Math.PI,walk:.3,moving:true};let flipped=false,rendered=null;const g={save(){},restore(){},translate(){},scale(x){flipped=x===-1},drawImage(f){rendered=f}};assert(env.UnitArt.draw(g,e));assert(flipped);assert.equal(rendered,env.UnitArt.get(name,'walk',.3));
 e.hurt={elapsed:.2,duration:.4,flip:false};env.UnitArt.draw(g,e);assert.equal(rendered,env.UnitArt.get(name,'hurt',.5));
}
assert.equal(env.UnitArt.get('roman'),null,'Original legionary keeps original atlas');
console.log('PASS: 60 specialist frames, crop bounds, stable feet, walk/attack/hurt/idle, looping and left-facing draw.');

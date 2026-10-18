const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const {frameHarness}=require('./helpers/frame-harness.cjs');
(async()=>{
 const manifest=require('../data/animations/character-frames.json');
 const h=await frameHarness('src/rendering/art/unit-art.js'),U=h.env.UnitArt;
 h.images.forEach(image=>image.onload());
 for(let variant=0;variant<9;variant++){
  const id='citizen-'+variant,spec=manifest.characters[id];
  for(const action of ['talk','shop','rest']){
   const files=spec.actions[action];assert.equal(files.length,4,id+'/'+action);
   assert(files.every(file=>file.includes('/'+action+'/')),'Dedicated activity files, no walk placeholders');
   const hashes=files.map(file=>crypto.createHash('sha256').update(fs.readFileSync('assets/runtime/'+file)).digest('hex'));
   assert.equal(new Set(hashes).size,4,'Four distinct drawings');
   const poses=[0,.25,.5,.75].map(p=>U.get('citizen',action,p,variant));
   assert.equal(new Set(poses).size,4);assert.equal(U.get('citizen',action,1,variant),poses[0],'Loop wraps');
   let drawn;
   const g={save(){},restore(){},translate(){},scale(){},drawImage(image){drawn=image;}};
   const e={unit:'citizen',variant,x:0,y:0,heading:0,activity:action,activityTime:.9};
   U.draw(g,e);assert.equal(drawn,poses[2]);
   e.moving=true;e.walk=.25;U.draw(g,e);assert.equal(drawn,U.get('citizen','walk',.25,variant),'Panic movement takes priority');
  }
 }
 console.log('PASS: 108 distinct activity frames, correct skins, looping, renderer selection and movement priority.');
})().catch(e=>{console.error(e);process.exitCode=1;});

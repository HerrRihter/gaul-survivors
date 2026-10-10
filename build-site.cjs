'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=__dirname,out=path.join(root,'_site');
// Only player-facing pages belong in the published site.
const pages=['index.html','legion-preview.html','village-preview.html'];
fs.rmSync(out,{recursive:true,force:true});
fs.mkdirSync(out,{recursive:true});
for(const name of fs.readdirSync(root)){
 if(pages.includes(name)||/\.(js|png|jpg)$/.test(name))fs.copyFileSync(path.join(root,name),path.join(out,name));
}
fs.cpSync(path.join(root,'hero-frames'),path.join(out,'hero-frames'),{recursive:true});
fs.writeFileSync(path.join(out,'.nojekyll'),'');
console.log('Published pages: '+pages.join(', '));

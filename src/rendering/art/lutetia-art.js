import {AssetPaths} from '../asset-paths.js';
// Only the architecture row is used. Characters use the game's shared frame loader.
const cells={townhouse:[0,1],townhouseOchre:[1,1],guardpost:[2,1]};
let atlas=null;
const sprites={},status={};
if(typeof Image!=='undefined'){
 for(const name of ['townhouse-v2','villa-v2','fountain-v2','garden-v2']){
  const sprite=new Image();status[name]='loading';sprite.onload=()=>status[name]='ready';sprite.onerror=()=>status[name]='error';sprite.src=AssetPaths.url('lutetia/'+name+'.png');sprites[name]=sprite;
 }
 const image=new Image();image.onload=()=>{atlas=image;};image.src=AssetPaths.url('lutetia/atlas-v1.png');
}
export const LutetiaArt={
 status,
 draw(g,kind,x,y,width,flip=false){
  if(sprites[kind]){
   if(status[kind]!=='ready')return false;
   const sprite=sprites[kind],height=width*sprite.naturalHeight/sprite.naturalWidth;
   g.save();g.translate(x,y);if(flip)g.scale(-1,1);g.drawImage(sprite,-width/2,-height,width,height);g.restore();return true;
  }
  const cell=cells[kind];if(!cell||!atlas)return false;
  const w=atlas.naturalWidth/3,h=atlas.naturalHeight/2;
  g.save();g.translate(x,y);if(flip)g.scale(-1,1);
  g.drawImage(atlas,cell[0]*w,cell[1]*h,w,h,-width/2,-width*.97,width,width);
  g.restore();return true;
 }
};

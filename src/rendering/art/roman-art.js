import {AssetPaths} from '../asset-paths.js';
import {RomanArt as LegacyRomanArt} from './roman-art-legacy.js';
export let RomanArt;
/* Reference-based transparent atlas. Shared scale and baseline preserve silhouettes. */
(() => {
  const fallback=LegacyRomanArt;
  if(typeof Image==='undefined'){RomanArt=fallback;return;}
  const atlas=new Image(),sprites=[];
  RomanArt={width:96,height:128,status:'loading',get(variant=0,frame=0,boss=false){return sprites[boss?3:variant%3]||fallback.get(variant,frame,boss);}};
  atlas.onload=()=>{
    const cell=atlas.naturalWidth/4;
    for(let i=0;i<4;i++){
      const c=document.createElement('canvas');c.width=96;c.height=128;
      const g=c.getContext('2d');g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
      g.drawImage(atlas,cell*i,0,cell,atlas.naturalHeight,0,0,96,128);sprites.push(c);
    }
    RomanArt.status='ready';document.dispatchEvent(new Event('roman-art-ready'));
  };
  atlas.onerror=()=>{RomanArt.status='fallback';console.warn('Roman atlas unavailable; using legacy sprites.');document.dispatchEvent(new Event('roman-art-ready'));};
  atlas.src=AssetPaths.url('characters/enemies/shared/roman-atlas-v2.png');
})();

import {CharacterFrames} from '../character-frames.js';
const names=Object.keys(CharacterFrames.manifest.characters).filter(id=>CharacterFrames.manifest.characters[id].renderer==='unit');
function get(name,action='idle',progress=0){return names.includes(name)?CharacterFrames.get(name,action,progress):null;}
 function draw(g,e){
  const reaction=e.hurt||e.visualHurt,attack=e.action?.warning?null:e.action;
  const ramImpact=e.unit==='ram'&&e.charge&&e.charge.left>1.14;
  const strike=e.strike;
  const action=e.crush?'hurt':reaction?'hurt':ramImpact?'attack':strike?'attack':e.charge?'walk':attack?'attack':e.moving?'walk':'idle';
  const progress=e.crush?Math.min(1,(.65-e.crush)/.65):reaction?reaction.elapsed/reaction.duration:ramImpact?.6:strike?Math.min(1,strike.elapsed/strike.duration):attack&&!e.charge?attack.elapsed/attack.duration:e.walk||0;
  const frame=get(e.unit,action,progress);if(!frame)return false;
  const flip=reaction?reaction.flip:attack?attack.flip:Math.cos(e.heading)<0;
  g.save();g.translate(Math.round(e.x),Math.round(e.y));if(flip)g.scale(-1,1);
  g.drawImage(frame,-CharacterFrames.manifest.anchor[0],-CharacterFrames.manifest.anchor[1]);g.restore();return true;
 }

export const UnitArt={status:CharacterFrames.register(names,'unit-art-ready'),get,draw};

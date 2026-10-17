import {unitDefinitions} from '../../../data/enemies/units.js';
import {drawMalosinus} from './malosinus-art.js';

// Art that is not a raster frame set: the code-drawn treasurer boss.
export function drawExpansion(g,e){
  return drawMalosinus(g,e);
}

// Attack warnings of specialist units: the crush circle and the charge or shot lane.
const fieldAi=new Set(['specialist','civilian','thief']);
export function expansionTelegraph(g,e){
  const u=unitDefinitions[e.unit];
  if(!u||!fieldAi.has(u.ai))return false;
  if(!e.crush&&(!e.action||e.action.hit))return true;
  g.save();g.strokeStyle='#ffd38a';g.fillStyle='#e79e4938';g.lineWidth=2;
  if(e.crush){g.beginPath();g.arc(e.x,e.y,u.crush.radius,0,Math.PI*2);g.fill();g.stroke();}
  else if(e.action&&!e.action.hit){
    g.translate(e.x,e.y);g.rotate(Math.atan2(e.action.aim.y-e.y,e.action.aim.x-e.x));
    const charge=u.attack==='charge'||u.attack==='cavalry';
    const reach=u.telegraph?.length??u.range;
    g.fillRect(0,charge?-e.r:-9,reach,charge?e.r*2:18);g.strokeRect(0,charge?-e.r:-9,reach,charge?e.r*2:18);
  }
  g.restore();return true;
}

export function drawHazards(g,s){
  for(const h of s.winePools||[]){g.fillStyle=h.life<1?'#873b6555':'#873b65aa';g.fillRect(h.x-28,h.y-18,56,36);g.fillStyle='#ce8aaa';g.fillRect(h.x-16,h.y-10,16,4);}
  const p=s.p;
  if(p.stun>0){g.strokeStyle='#ebdfb1';g.lineWidth=2;for(let i=-24;i<=24;i+=12){g.beginPath();g.moveTo(p.x+i,p.y-48);g.lineTo(p.x+i,p.y+8);g.stroke();g.beginPath();g.moveTo(p.x-24,p.y+i-20);g.lineTo(p.x+24,p.y+i-20);g.stroke();}}
  if(p.stun>0||p.poisoned>0){g.fillStyle=p.stun>0?'#fff1ba':'#e6a1d0';g.font='bold 12px monospace';g.textAlign='center';g.fillText(p.stun>0?'СЕТЬ · СТАН':'ОТРАВЛЕНИЕ',p.x,p.y-105);}
}

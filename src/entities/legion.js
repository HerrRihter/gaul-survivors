import {drawExpansion,expansionTelegraph} from '../rendering/art/expansion-art.js';
import {unitDefinitions} from '../../data/enemies/units.js';
import {ProjectileArt} from '../rendering/art/projectile-art.js';
import {UnitArt} from '../rendering/art/unit-art.js';
export let Legion;
'use strict';
Legion=(()=>{
 const units=unitDefinitions;
 const labels=new Map();
 function drawLabel(g,u,x,y){
  let label=labels.get(u);
  if(!label&&typeof document!=='undefined'){
   const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
   ctx.font='bold 10px monospace';
   const width=Math.ceil(ctx.measureText(u.name).width)+4,height=18;
   // Render once at 2x for both standard and high-DPI game canvases.
   canvas.width=width*2;canvas.height=height*2;
   ctx.scale(2,2);ctx.font='bold 10px monospace';ctx.textAlign='center';ctx.fillStyle=u.color;
   ctx.fillText(u.name,width/2,13);
   label={canvas,width,height};labels.set(u,label);
  }
  if(label)g.drawImage(label.canvas,x-label.width/2,y-13,label.width,label.height);
  else {g.fillStyle=u.color;g.font='bold 10px monospace';g.textAlign='center';g.fillText(u.name,x,y);}
 }

 // Shield walls only absorb hits arriving from the front arc.
 function mitigation(e,p){const guard=units[e.unit]?.frontGuard;if(!guard)return 1;const a=Math.atan2(p.y-e.y,p.x-e.x);return Math.cos(a-(e.heading||0))>.15?guard:1;}
 function telegraph(g,e){if(expansionTelegraph(g,e))return;if(!e.action||e.action.hit)return;const u=units[e.unit],a=e.action,angle=Math.atan2(a.aim.y-e.y,a.aim.x-e.x);g.save();g.translate(e.x,e.y);g.rotate(angle);g.fillStyle='#e8774245';g.strokeStyle='#ffca80';g.lineWidth=2;
  if(['charge','lunge','pilum'].includes(u.attack)){const reach=u.telegraph?.length??u.range,half=u.telegraph?.half??10;g.fillRect(0,-half,reach,half*2);g.strokeRect(0,-half,reach,half*2);}else{g.beginPath();g.arc(0,0,u.range,-1.1,1.1);g.lineTo(0,0);g.closePath();g.fill();g.stroke();}g.restore();
 }
 function projectile(g,b){
  ProjectileArt.drawEnemyProjectile(g,b,(unit,action,progress)=>typeof UnitArt!=='undefined'?UnitArt.get(unit,action,progress):null);
 }
 function draw(g,e,sprite){
  const u=units[e.unit];
  if(typeof UnitArt!=='undefined'&&UnitArt.draw(g,e)){
  }else if(drawExpansion(g,e)){
  }else{
   // Frames still loading or missing: one generic pixel stand-in for every unit.
   sprite(g,e.type,e.x,e.y,2.5,Math.cos(e.heading)<0,0,e.hit>0,e.phase,e);
  }
  if(e.unit!=='roman'&&!e.boss&&!u.civilian)drawLabel(g,u,e.x,e.y-(u.labelHeight||96));
 }
 return {units,mitigation,telegraph,draw,projectile};
})();

import {AssetPaths} from '../asset-paths.js';
export let ProjectileArt;
'use strict';
ProjectileArt=(()=>{
 // The release hand is 48 logical pixels above the foot anchor.
 const FISH_HEIGHT=48,art={};
<<<<<<< HEAD:src/rendering/art/projectile-art.js
 if(typeof Image!=='undefined'){const image=new Image();image.onload=()=>{art.image=image;};image.src=AssetPaths.url('projectiles/projectiles-v2.png');}
 function bitmap(g,kind,x,y,angle,scale=1){if(!art.image)return false;const b=kind==='fish'?[426,185,680,300]:[110,748,1334,76],w=(kind==='fish'?34:72)*scale,h=w*b[3]/b[2];g.save();g.translate(x,y);g.rotate(angle);g.drawImage(art.image,...b,-w/2,-h/2,w,h);g.restore();return true;}
=======
 if(typeof Image!=='undefined'){const image=new Image();image.onload=()=>{art.image=image;};image.src='projectiles-v2.png';}
 function bitmap(g,kind,x,y,angle){if(!art.image)return false;const b=kind==='fish'?[426,185,680,300]:[110,748,1334,76],w=kind==='fish'?34:72,h=w*b[3]/b[2];g.save();g.translate(x,y);g.rotate(angle);g.drawImage(art.image,...b,-w/2,-h/2,w,h);g.restore();return true;}
>>>>>>> parent of 666fb51 (Add hero and permanent upgrades):projectile-art.js
 function drawFish(g,f){
  const dx=f.vx??f.dx,dy=f.vy??f.dy,angle=Math.atan2(dy,dx);
  if(bitmap(g,'fish',f.x,f.y-FISH_HEIGHT,angle+Math.sin(f.age*12)*.055))return;
  g.save();g.translate(f.x,f.y-FISH_HEIGHT);g.rotate(angle+Math.sin(f.age*12)*.055);g.scale(1.15,1.15);
  g.lineWidth=1.7;g.lineJoin='round';g.lineCap='round';
  g.fillStyle='#50634c';g.strokeStyle='#202921';
  g.beginPath();g.moveTo(-22,0);g.lineTo(-34,-10);g.quadraticCurveTo(-31,-3,-30,0);g.quadraticCurveTo(-32,4,-35,9);g.lineTo(-21,5);g.closePath();g.fill();g.stroke();
  g.fillStyle='#748568';
  g.beginPath();g.moveTo(-26,0);g.quadraticCurveTo(-13,-12,4,-10);g.quadraticCurveTo(14,-10,22,-5);g.lineTo(29,-2);g.quadraticCurveTo(32,0,29,2);g.lineTo(20,5);g.quadraticCurveTo(8,12,-5,10);g.quadraticCurveTo(-19,9,-26,0);g.closePath();g.fill();g.stroke();
  g.fillStyle='#d3c69f';g.strokeStyle='#465341';g.lineWidth=1;
  g.beginPath();g.moveTo(-19,4);g.quadraticCurveTo(-5,11,9,7);g.lineTo(21,2);g.quadraticCurveTo(11,10,-4,11);g.quadraticCurveTo(-15,10,-19,4);g.closePath();g.fill();g.stroke();
  g.fillStyle='#50634c';g.strokeStyle='#202921';g.lineWidth=1.4;
  g.beginPath();g.moveTo(-15,-8);g.lineTo(-10,-15);g.lineTo(-5,-9);g.lineTo(3,-14);g.lineTo(8,-8);g.closePath();g.fill();g.stroke();
  g.beginPath();g.moveTo(-7,8);g.lineTo(-2,15);g.lineTo(5,8);g.closePath();g.fill();g.stroke();
  g.fillStyle='#99a37c';g.beginPath();g.moveTo(1,-4);g.quadraticCurveTo(9,0,11,7);g.quadraticCurveTo(2,7,-2,0);g.closePath();g.fill();g.stroke();
  g.strokeStyle='#414e3d';g.lineWidth=1.25;g.beginPath();g.moveTo(11,-7);g.quadraticCurveTo(7,-1,11,5);g.stroke();
  g.fillStyle='#d7bc46';g.strokeStyle='#252d26';g.lineWidth=1.4;g.beginPath();g.arc(18,-3,3.5,0,Math.PI*2);g.fill();g.stroke();
  g.fillStyle='#172019';g.beginPath();g.arc(19,-3,1.45,0,Math.PI*2);g.fill();
  g.fillStyle='#313b31';for(const [x,y]of [[-16,-3],[-10,-6],[-3,-5],[4,-6],[8,3],[2,5],[-7,4]]){g.beginPath();g.ellipse(x,y,1.1,.8,-.3,0,Math.PI*2);g.fill();}
  g.restore();
 }
 function drawPilum(g,b){
  if(bitmap(g,'pilum',b.x,b.y-16,Math.atan2(b.vy,b.vx)))return;
  g.save();g.translate(b.x,b.y-16);g.rotate(Math.atan2(b.vy,b.vx));g.lineCap='round';g.lineJoin='round';
  g.strokeStyle='#251c16';g.lineWidth=6;g.beginPath();g.moveTo(-31,0);g.lineTo(17,0);g.stroke();
  g.strokeStyle='#80552f';g.lineWidth=3.5;g.beginPath();g.moveTo(-30,0);g.lineTo(17,0);g.stroke();
  g.strokeStyle='#c19459';g.lineWidth=1;g.beginPath();g.moveTo(-24,-.8);g.lineTo(12,-.8);g.stroke();
  g.fillStyle='#36332e';g.strokeStyle='#202421';g.lineWidth=1.5;g.beginPath();g.moveTo(39,0);g.lineTo(28,-5);g.lineTo(25,-2);g.lineTo(10,-1.8);g.lineTo(10,1.8);g.lineTo(25,2);g.lineTo(28,5);g.closePath();g.fill();g.stroke();
  g.fillStyle='#aeb9c0';g.beginPath();g.moveTo(37,0);g.lineTo(28,-3.6);g.lineTo(26,-1.15);g.lineTo(12,-1.05);g.lineTo(12,1.05);g.lineTo(26,1.15);g.lineTo(28,3.6);g.closePath();g.fill();
  g.strokeStyle='#e2e8e8';g.lineWidth=.8;g.beginPath();g.moveTo(35,0);g.lineTo(27,-2.3);g.stroke();
  g.fillStyle='#d3d7d2';g.strokeStyle='#34332e';g.lineWidth=1;
  g.beginPath();g.moveTo(8,-2.8);g.lineTo(12,-2.8);g.lineTo(12,2.8);g.lineTo(8,2.8);g.closePath();g.fill();g.stroke();
  g.restore();
 }
 return {drawFish,drawPilum};
})();

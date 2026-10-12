import {VillageCollision} from './village/collision.js';
import {VillageNavigation} from './village/navigation.js';
import {sceneryVisible} from './village/village-renderer.js';
import {LutetiaArt} from '../rendering/art/lutetia-art.js';
import {VillageArt} from '../rendering/art/village-art.js';
import {UnitArt} from '../rendering/art/unit-art.js';

export function createLutetia(){
 const size=2200,objects=[];
 // Irregular neighbourhoods leave winding streets between raised courtyard islands.
 const blocks=[
  [180,340,410],[640,300,360],[1490,290,360],[2050,350,410],
  [160,820,390],[690,970,430],[1510,960,440],[2090,910,390],
  [150,1350,420],[1990,1400,420],
  [370,1750,450],[800,1850,400],[1510,1810,440],[2050,1900,400],
  [160,2190,390],[730,2280,400],[1310,2230,400],[1900,2340,420]
 ];
 blocks.forEach(([x,y,width],i)=>objects.push({x,y,width,art:i%3===1?'villa-v2':'townhouse-v2',flip:i%3===0,footprint:[-width*.32,-width*.30,width*.64,width*.26],island:true}));
 objects.push({x:1800,y:650,width:410,art:'guardpost',footprint:[-135,-145,270,135],island:true});
 objects.push({x:1100,y:740,width:610,art:'garden-v2',footprint:[-230,-215,460,195],island:true});
 objects.push({x:1100,y:1460,width:390,art:'fountain-v2',footprint:[-150,-190,300,170],island:true});
 for(const [x,y,width] of [[65,540,170],[440,700,165],[2100,600,180],[450,1300,200],[1740,1290,180],[70,1660,180],[1820,1680,170],[450,2060,170],[1700,2120,190]])objects.push({x,y,width,art:'trees',footprint:[-25,-28,50,25]});
 const residents=[{unit:'merchant',x:790,y:1005},{unit:'merchant',x:1530,y:1030},{unit:'merchant',x:1750,y:730},{unit:'merchant',x:300,y:1410},{unit:'merchant',x:850,y:1920},{unit:'merchant',x:1880,y:1480}];
 residents.forEach((r,i)=>objects.push({x:r.x,y:r.y+8,width:116,art:'awning',color:['#bf4133','#d6aa48','#60834c','#4e7f98','#a54336','#54835a'][i]}));
 const lamps=[];
 for(const [x,y] of [[405,380],[830,340],[1370,350],[1900,390],[400,865],[825,995],[1320,1000],[1890,980],[535,1350],[1650,1390],[610,1760],[1320,1850],[1810,1920],[430,2190],[1020,2160],[1710,2250]])lamps.push({x,y,width:56,art:'lamp'});
 objects.push(...lamps);
 const collision=VillageCollision.create(objects.filter(o=>o.footprint),size);
 const navigation=VillageNavigation.create({size,cell:25,cols:88,...collision});
 const depthObjects=objects.map(o=>({...o,scenery:true})).sort((a,b)=>a.y-b.y);
 let ground=null;
 function paint(g){
  let paving='#a5aaa0';
  if(typeof document!=='undefined'){
   const tile=document.createElement('canvas');tile.width=120;tile.height=64;const t=tile.getContext('2d');
   t.fillStyle='#7e877c';t.fillRect(0,0,120,64);
   for(let y=0;y<4;y++)for(let x=-1;x<7;x++){
    const px=x*20+(y%2)*10,py=y*16,v=(x*3+y+20)%5;
    t.fillStyle=['#a9afa1','#b7baaa','#a0a99e','#b2b6a8','#a8b0a6'][v];
    t.beginPath();t.roundRect(px+1,py+1,18,14,[4,5,4,3]);t.fill();
    t.strokeStyle='#e2e0c660';t.lineWidth=1;t.beginPath();t.moveTo(px+4,py+3);t.lineTo(px+14,py+3);t.stroke();
   }
   paving=g.createPattern(tile,'repeat');
  }
  g.fillStyle=paving;g.fillRect(0,0,size,size);
  // Curved limestone kerbs and paved aprons follow each building, rather than a grid.
  for(const o of objects.filter(o=>o.island)){
   const garden=o.art==='garden-v2',fountain=o.art==='fountain-v2';
   const w=o.width*(garden?.98:fountain?1.12:1.02),h=o.width*(garden?.55:fountain?.55:.46),cy=o.y-h*.34;
   g.beginPath();
   if(garden||fountain)g.ellipse(o.x,cy,w/2,h/2,-.1,0,Math.PI*2);
   else {
    g.moveTo(o.x-w*.5,cy+h*.05);g.quadraticCurveTo(o.x-w*.55,cy-h*.2,o.x-w*.33,cy-h*.5);
    g.lineTo(o.x+w*.27,cy-h*.5);g.quadraticCurveTo(o.x+w*.43,cy-h*.5,o.x+w*.49,cy-h*.05);
    g.lineTo(o.x+w*.53,cy+h*.25);g.quadraticCurveTo(o.x+w*.55,cy+h*.48,o.x+w*.3,cy+h*.5);
    g.lineTo(o.x-w*.29,cy+h*.5);g.quadraticCurveTo(o.x-w*.43,cy+h*.5,o.x-w*.5,cy+h*.05);g.closePath();
   }
   g.fillStyle='#c9bd9d';g.fill();g.lineWidth=9;g.strokeStyle='#8b8c77';g.stroke();g.lineWidth=5;g.strokeStyle='#e8dbb8';g.stroke();
   g.save();g.clip();g.strokeStyle='#ada98e';g.lineWidth=1;
   for(let y=cy-h;y<cy+h;y+=22){g.beginPath();g.moveTo(o.x-w,y);g.lineTo(o.x+w,y);g.stroke();for(let x=o.x-w;x<o.x+w;x+=34){g.beginPath();g.moveTo(x+(Math.round(y/22)%2)*17,y);g.lineTo(x+(Math.round(y/22)%2)*17,y+22);g.stroke();}}
   g.restore();
  }
 }
 function drawGround(g){
  if(!ground&&typeof document!=='undefined'){ground=document.createElement('canvas');ground.width=ground.height=size;paint(ground.getContext('2d'));}
  if(ground)g.drawImage(ground,0,0);else paint(g);
 }
 function drawLamp(g,o){
  const {x,y}=o;g.strokeStyle='#313d35';g.lineWidth=5;g.beginPath();g.moveTo(x,y-5);g.lineTo(x,y-88);g.stroke();
  g.fillStyle='#313d35';g.beginPath();g.ellipse(x,y-3,10,4,0,0,Math.PI*2);g.fill();
  g.fillStyle='#ffde7d';g.fillRect(x-7,y-102,14,20);g.strokeRect(x-7,y-102,14,20);
  g.beginPath();g.moveTo(x-12,y-103);g.lineTo(x,y-116);g.lineTo(x+12,y-103);g.closePath();g.fillStyle='#364438';g.fill();
 }
 function drawObject(g,o,p,view){
  if(!sceneryVisible(o,Math.max(o.width,120),view))return;
  g.save();if(p&&p.y<o.y&&p.y>o.y-o.width&&Math.abs(p.x-o.x)<o.width*.45)g.globalAlpha=.45;
  if(o.art==='awning'){
   const {x,y}=o;g.strokeStyle='#664529';g.lineWidth=4;g.beginPath();g.moveTo(x-48,y);g.lineTo(x-48,y-97);g.moveTo(x+48,y);g.lineTo(x+48,y-97);g.stroke();
   for(let i=0;i<6;i++){g.fillStyle=i%2?'#f3dfb0':o.color;g.beginPath();g.moveTo(x-48+i*16,y-100);g.lineTo(x-32+i*16,y-100);g.lineTo(x-38+i*19,y-70);g.lineTo(x-57+i*19,y-70);g.closePath();g.fill();g.fillRect(x-57+i*19,y-70,19,7);}
   g.strokeStyle='#755b37';g.lineWidth=2;g.beginPath();g.moveTo(x-48,y-100);g.lineTo(x+48,y-100);g.stroke();
  }
  else if(o.art==='lamp')drawLamp(g,o);
  else if(o.art==='trees')VillageArt.draw(g,'trees',o.x,o.y,o.width);
  else if(!LutetiaArt.draw(g,o.art,o.x,o.y,o.width,o.flip)){g.fillStyle='#bcad88';g.fillRect(o.x-o.width*.3,o.y-o.width*.3,o.width*.6,o.width*.3);}
  g.restore();
 }
 return {size,objects,roads:[],residents,depthObjects,houses:[],collision,...navigation,blocked:collision.blocked,clear:collision.clear,drawGround,drawObject,draw(g){drawGround(g);const sorted=[...depthObjects,...residents].sort((a,b)=>a.y-b.y);for(const o of sorted)if(o.unit)UnitArt.draw(g,{...o,heading:0});else drawObject(g,o);}};
}

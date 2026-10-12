import {VillageCollision} from './village/collision.js';
import {VillageNavigation} from './village/navigation.js';
import {sceneryVisible} from './village/village-renderer.js';
import {LutetiaArt} from '../rendering/art/lutetia-art.js';
import {UnitArt} from '../rendering/art/unit-art.js';

export function createLutetia(){
 const size=2200,objects=[];
 const roads=[
  [0,450,620,280,1420,650,2200,420,190],
  [0,1150,650,940,1400,1270,2200,1050,210],
  [0,1840,700,1980,1450,1600,2200,1810,185],
  [440,0,220,730,690,1420,360,2200,185],
  [1110,0,1390,650,870,1500,1170,2200,200],
  [1820,0,1580,700,2080,1500,1750,2200,185]
 ];
 for(const [row,y] of [310,830,1560,2110].entries())for(const [col,x] of [180,750,1440,2040].entries()){
  if(row===1&&col===2)continue;
  const width=310+(row+col)%3*18;
  objects.push({x:x+Math.sin(row*3+col)*28,y,art:(row+col)%2?'townhouseOchre':'townhouse',width,footprint:[-width*.35,-width*.36,width*.7,width*.34]});
 }
 objects.push({x:1440,y:825,art:'guardpost',width:330,footprint:[-115,-119,230,115]});
 // Stalls occupy the market perimeter, leaving the centre and four exits open.
 const residents=[{unit:'merchant',x:880,y:900},{unit:'merchant',x:1130,y:890},{unit:'merchant',x:1360,y:945},{unit:'merchant',x:830,y:1275},{unit:'merchant',x:1290,y:1330},{unit:'merchant',x:1560,y:1770}];
 const collision=VillageCollision.create(objects,size);
 const navigation=VillageNavigation.create({size,cell:25,cols:88,...collision});
 const depthObjects=objects.map(o=>({...o,scenery:true})).sort((a,b)=>a.y-b.y);
 let ground=null;
 function paint(g){
  g.fillStyle='#a4977b';g.fillRect(0,0,size,size);
  for(let i=0;i<3500;i++){g.fillStyle=i%2?'#746d5520':'#e2d2a02a';g.fillRect(i*397%size,i*673%size,3+i%8,2);}
  let paving='#b7ad96';
  if(typeof document!=='undefined'){
   const tile=document.createElement('canvas');tile.width=96;tile.height=64;const t=tile.getContext('2d');
   t.fillStyle='#79786c';t.fillRect(0,0,96,64);
   for(let y=0;y<4;y++)for(let x=-1;x<6;x++){
    const px=x*20+(y%2)*10,py=y*16,variation=(x+y+8)%4;
    t.fillStyle=['#aaa997','#a1a38f','#b5b09d','#989d8c'][variation];
    t.beginPath();t.roundRect(px+1,py+1,18,14,[3,4,3,2]);t.fill();
    t.strokeStyle='#d8d0b43a';t.lineWidth=1;t.beginPath();t.moveTo(px+4,py+3);t.lineTo(px+15,py+3);t.stroke();
    t.fillStyle='#62695722';t.fillRect(px+5+variation,py+7,2,1);
   }
   paving=g.createPattern(tile,'repeat');
  }
  g.lineCap='round';g.lineJoin='round';
  for(const [extra,color] of [[14,'#6e7467'],[7,'#d0c5a4'],[0,paving]])for(const [x,y,a,b,c,d,e,f,w] of roads){g.strokeStyle=color;g.lineWidth=w+extra;g.beginPath();g.moveTo(x,y);g.bezierCurveTo(a,b,c,d,e,f);g.stroke();}
  g.fillStyle=paving;g.beginPath();g.ellipse(1100,1110,365,290,0,0,Math.PI*2);g.fill();
  g.strokeStyle='#d2c8ae';g.lineWidth=4;g.beginPath();g.ellipse(1100,1110,155,116,0,0,Math.PI*2);g.stroke();
 }
 function drawGround(g){
  if(!ground&&typeof document!=='undefined'){ground=document.createElement('canvas');ground.width=ground.height=size;paint(ground.getContext('2d'));}
  if(ground)g.drawImage(ground,0,0);else paint(g);
 }
 function drawObject(g,o,p,view){
  if(!sceneryVisible(o,o.width,view))return;
  g.save();if(p&&p.y<o.y&&p.y>o.y-o.width&&Math.abs(p.x-o.x)<o.width*.45)g.globalAlpha=.45;
  if(!LutetiaArt.draw(g,o.art,o.x,o.y,o.width)){g.fillStyle='#bcad88';g.fillRect(o.x-o.width*.35,o.y-o.width*.7,o.width*.7,o.width*.7);}
  g.restore();
 }
 return {size,objects,roads,residents,depthObjects,houses:[],collision,...navigation,blocked:collision.blocked,clear:collision.clear,drawGround,drawObject,draw(g){drawGround(g);for(const o of depthObjects)drawObject(g,o);for(const e of residents)UnitArt.draw(g,{...e,heading:0});}};
}

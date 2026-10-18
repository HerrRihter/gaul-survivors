import {cityLife} from '../../data/maps/city-life.js';
import {unitDefinitions} from '../../data/enemies/units.js';

// Ambient life of maps with `cityLife:true`: pigeon flocks and rare speech bubbles.
// Nothing here affects combat; all state lives in state.city and is cheap to skip off screen.
const enabled=c=>!!c.arenaDefinitions?.[c.state.map]?.cityLife;
const pick=(c,list)=>list[Math.floor(c.rand(0,list.length))%list.length];

export function say(c,speaker,kind,force=false){
 const s=c.state,city=s.city,spec=cityLife.bubbles;
 if(!city||!speaker||speaker.hp<=0)return false;
 const live=city.bubbles.filter(b=>b.life>0);
 if(live.length>=spec.max||live.some(b=>b.owner===speaker))return false;
 if(!force&&(s.t<city.bubbleNext||s.t<(speaker.saidAt||-1e9)+spec.speakerEvery))return false;
 if(c.dist(speaker,s.p)>spec.range)return false;
 city.bubbles.push({owner:speaker,text:pick(c,cityLife.phrases[kind]),life:spec.life,max:spec.life});
 speaker.saidAt=s.t;city.bubbleNext=s.t+spec.every;return true;
}

function placeFlock(c,city,spots){
 const s=c.state,spec=cityLife.pigeons;
 const free=spots.filter(q=>c.dist(q,s.p)>spec.minDistance&&city.flocks.every(f=>c.dist(f,q)>250));
 if(!free.length)return false;
 const at=pick(c,free),birds=[];
 const count=Math.floor(c.rand(spec.birds[0],spec.birds[1]+1));
 for(let i=0;i<count;i++)birds.push({dx:c.rand(-50,50),dy:c.rand(-26,26),phase:c.rand(0,7),flip:c.rand(0,1)<.5,vx:0,vy:0,h:0});
 city.flocks.push({x:at.x+c.rand(-20,20),y:at.y+c.rand(-20,20),birds,flying:0});
 return true;
}

export function updateCityLife(c,dt){
 if(!enabled(c))return;
 const s=c.state,p=s.p,poi=c.Village.pointsOfInterest;
 const city=s.city||(s.city={flocks:[],bubbles:[],bubbleNext:0,flockNext:[],advertNext:cityLife.bubbles.advertEvery,cheered:false});
 const spec=cityLife.pigeons,spots=poi?.plazas||[];
 // Pigeons: flocks peck on squares, burst into the air when the hero comes close and land
 // again later on a square far from the hero.
 if(!city.seeded){city.seeded=true;for(let i=0;i<spec.flocks;i++)placeFlock(c,city,spots);}
 for(const f of city.flocks){
  if(!f.flying&&c.dist(f,p)<spec.scare){
   f.flying=1.6;const away=Math.atan2(f.y-p.y,f.x-p.x);
   for(const b of f.birds){const a=away+c.rand(-.9,.9),v=c.rand(170,260);b.vx=Math.cos(a)*v;b.vy=Math.sin(a)*v;}
  }
  if(f.flying){
   f.flying-=dt;
   for(const b of f.birds){b.dx+=b.vx*dt;b.dy+=b.vy*dt;b.h+=dt*90;b.flip=b.vx<0;}
   if(f.flying<=0){f.done=true;city.flockNext.push(s.t+c.rand(spec.respawn[0],spec.respawn[1]));}
  }
 }
 city.flocks=city.flocks.filter(f=>!f.done);
 city.flockNext=city.flockNext.filter(t=>!(s.t>=t&&placeFlock(c,city,spots)));
 // Bubbles follow their speaker and fade; merchants advertise now and then; the crowd
 // cheers once when the boss falls.
 for(const b of city.bubbles)b.life-=dt;
 city.bubbles=city.bubbles.filter(b=>b.life>0&&b.owner.hp>0);
 if(s.t>=city.advertNext){
  city.advertNext=s.t+cityLife.bubbles.advertEvery*c.rand(.7,1.3);
  const merchants=s.enemies.filter(e=>e.hp>0&&unitDefinitions[e.unit]?.attack==='goods'&&c.dist(e,p)<cityLife.bubbles.range);
  if(merchants.length)say(c,pick(c,merchants),'merchant');
 }
 if(s.bossDead&&!city.cheered){
  city.cheered=true;
  const crowd=s.enemies.filter(e=>e.hp>0&&unitDefinitions[e.unit]?.ai==='civilian').sort((a,b)=>c.dist(a,p)-c.dist(b,p));
  for(const e of crowd.slice(0,cityLife.bubbles.max))say(c,e,'cheer',true);
 }
}

// Pigeons are drawn at roughly the scale of the characters, with a dark outline so they
// read against the grey cobblestones. Parisian doves are white.
function drawPigeon(g,x,y,b,t,flying){
 g.save();g.translate(x,y-b.h);g.scale(b.flip?-1.9:1.9,1.9);
 const flap=flying?Math.sin(t*38+b.phase)*5:0,peck=flying?0:Math.max(0,Math.sin(t*5+b.phase))*3;
 g.strokeStyle='#3a3f45';g.lineWidth=1;g.lineJoin='round';
 if(flying){g.fillStyle='#d9dde2';g.beginPath();g.moveTo(-3,-4);g.lineTo(-8,-4-flap*1.4);g.lineTo(2,-3);g.closePath();g.fill();g.stroke();}
 g.fillStyle='#e4e7ea';g.beginPath();g.moveTo(-5,-4);g.lineTo(-11,-6);g.lineTo(-10,-1);g.closePath();g.fill();g.stroke();
 g.fillStyle='#fbfbf8';g.beginPath();g.ellipse(0,-4,6.5,4,0,0,Math.PI*2);g.fill();g.stroke();
 g.fillStyle='#cfd5db';g.fillRect(-3,-5,4,1.2);
 if(flying){g.fillStyle='#f1f3f5';g.beginPath();g.moveTo(-2,-5);g.lineTo(4,-5-flap*1.6);g.lineTo(4,-3);g.closePath();g.fill();g.stroke();}
 g.fillStyle='#ffffff';g.beginPath();g.arc(5.5,-7+peck,2.8,0,Math.PI*2);g.fill();g.stroke();
 g.fillStyle='#e7b34f';g.fillRect(8,-7.3+peck,2.4,1.3);
 g.fillStyle='#111';g.fillRect(6,-8.2+peck,1,1);
 g.restore();
}
const inView=(f,v,pad=60)=>f.x>v.minX-pad&&f.x<v.maxX+pad&&f.y>v.minY-pad&&f.y<v.maxY+pad;

// Grounded flocks are drawn under the actors, flying birds and bubbles above everything.
export function drawCityGround(g,s,view){
 if(!s.city)return;
 for(const f of s.city.flocks){
  if(f.flying||!inView(f,view))continue;
  g.fillStyle='#14291e44';
  for(const b of f.birds){g.beginPath();g.ellipse(f.x+b.dx,f.y+b.dy,11,3.5,0,0,Math.PI*2);g.fill();}
  for(const b of f.birds)drawPigeon(g,f.x+b.dx,f.y+b.dy,b,s.t,false);
 }
}
export function drawCityAir(g,s,view){
 if(!s.city)return;
 for(const f of s.city.flocks){
  if(!f.flying||!inView(f,view,400))continue;
  g.globalAlpha=Math.min(1,f.flying*1.5);
  for(const b of f.birds)drawPigeon(g,f.x+b.dx,f.y+b.dy,b,s.t,true);
  g.globalAlpha=1;
 }
 g.font='bold 13px sans-serif';g.textAlign='center';g.textBaseline='middle';
 for(const b of s.city.bubbles){
  const o=b.owner,x=o.x,y=o.y-92;if(!inView({x,y},view))continue;
  const w=g.measureText(b.text).width+16,h=22;
  g.globalAlpha=Math.min(1,b.life*4,(b.max-b.life)*8);
  g.fillStyle='#fff6df';g.strokeStyle='#3b2a1c';g.lineWidth=2;
  g.beginPath();g.roundRect?g.roundRect(x-w/2,y-h/2,w,h,8):g.rect(x-w/2,y-h/2,w,h);
  g.moveTo(x-5,y+h/2);g.lineTo(x,y+h/2+7);g.lineTo(x+5,y+h/2);
  g.fill();g.stroke();
  g.fillStyle='#fff6df';g.fillRect(x-4,y+h/2-2,8,3);
  g.fillStyle='#3b2a1c';g.fillText(b.text,x,y+1);
  g.globalAlpha=1;
 }
 g.textBaseline='alphabetic';
}

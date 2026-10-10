'use strict';
globalThis.Villagers=(()=>{
 const defs={
  asterix:{name:'Астерикс',hp:110,speed:160,interval:.68,wind:.44,damage:25,half:Math.PI/4,weapon:'✦ ГАЛЛЬСКИЙ КУЛАК'},
  obelix:{name:'Обеликс',hp:160,speed:133,interval:1.12,wind:.72,weapon:'◆ БОЕВОЙ МЕНГИР'},
  cacofonix:{name:'Какафоникс',hp:100,speed:125,passive:true,weapon:'♫ НЕВЫНОСИМАЯ МУЗЫКА',desc:'Музыкальная аура вокруг героя: 12 урона каждые 0,6 с в радиусе 95.'},
  antisanitarix:{name:'Антисанитарикс',hp:110,speed:140,interval:1.2,wind:.5,weapon:'♧ ТУХЛАЯ РЫБА',desc:'Рыба-бумеранг: по 24 урона на вылете и возвращении. Летит по последнему шагу.'},
  automatix:{name:'Автоматикс',hp:150,speed:105,interval:1.1,wind:.6,damage:50,half:Math.PI/2,weapon:'⚒ ТЯЖЁЛЫЙ МОЛОТ',desc:'Медленный кузнец: 50 урона замахом на 180° перед собой.'},
  panoramix:{name:'Панорамикс',hp:90,speed:130,passive:true,weapon:'⚗ ЯДОВИТЫЙ СЛЕД',desc:'При движении оставляет яд на 3,5 с. Враги получают 8 урона каждые 0,5 с.'}
 };
 // Deliberately simple code-drawn prototype portraits, distinct from finished hero atlases.
 const colors={cacofonix:['#e1a748','#f4d467'],antisanitarix:['#63a1ad','#dbc4a0'],automatix:['#55402e','#de6a39'],panoramix:['#e7e1cb','#eee9d9']};
 function draw(g,id,x,y,size=3,flip=false,phase=0){
  if(!colors[id])return false;g.save();g.translate(x,y);g.scale((flip?-1:1)*size,size);const [shirt,hair]=colors[id],step=Math.sin(phase*6.28)*1.3;
  g.fillStyle='#242c29';g.fillRect(-6,-3+step,5,3);g.fillRect(2,-3-step,5,3);
  g.fillStyle=shirt;g.fillRect(-6,-17,12,14);g.fillStyle='#efba85';g.fillRect(-5,-25,10,9);g.fillRect(4,-21,4,3);g.fillRect(-9,-15,3,7);g.fillRect(6,-15,3,7);g.fillStyle=hair;g.fillRect(-6,-28,12,5);g.fillStyle='#222b28';g.fillRect(3,-23,1,2);
  if(id==='panoramix'){g.fillStyle=hair;g.fillRect(-4,-18,10,8);g.fillRect(-1,-10,5,5);g.fillStyle='#91643b';g.fillRect(10,-26,2,26);g.fillStyle='#84ac47';g.fillRect(-12,-11,5,7);}
  if(id==='cacofonix'){g.fillStyle='#83532e';g.fillRect(7,-17,7,11);g.fillStyle='#f4da85';g.fillRect(9,-15,3,7);g.fillStyle='#ddbf48';g.fillRect(-6,-21,2,7);}
  if(id==='antisanitarix'){g.fillStyle='#ece0c1';g.fillRect(-6,-16,10,11);g.fillStyle='#78976a';g.fillRect(7,-11,10,4);g.fillRect(14,-14,3,10);}
  if(id==='automatix'){g.fillStyle='#422f28';g.fillRect(-5,-18,11,4);g.fillStyle='#967045';g.fillRect(9,-19,3,15);g.fillStyle='#9daaa5';g.fillRect(6,-23,10,7);}
  g.restore();return true;
 }
 function fish(s,dir){s.fish.push({x:s.p.x,y:s.p.y,dx:dir.x,dy:dir.y,age:0,back:false,hit:new Set(),r:12*s.stats.range});}
 function update(s,id,dt,hit){
  const p=s.p,st=s.stats;if(p.visualAction){p.visualAction.elapsed+=dt;if(p.visualAction.elapsed>=p.visualAction.duration)p.visualAction=null;}
  if(id==='cacofonix'){
   s.music-=dt;if(s.music<=0){s.music=.6/st.haste;p.visualAction={elapsed:0,duration:.5/st.haste,flip:p.flip};s.fx.push({kind:'ring',x:p.x,y:p.y,r:95*st.range,life:.45,max:.45});
    for(const e of s.enemies)if(e.hp>0&&Math.hypot(e.x-p.x,e.y-p.y)<95*st.range+e.r&&Village.clear(p,e,2))hit(e,12*st.damage);
   }
  }
  if(id==='panoramix'){s.trail-=dt;if(p.moving&&s.trail<=0){s.trail=.22/st.haste;if(!p.visualAction)p.visualAction={elapsed:0,duration:.4/st.haste,flip:p.flip};s.poison.push({x:p.x,y:p.y,r:30*st.range,life:3.5});}}
  for(const puddle of s.poison)puddle.life-=dt;s.poison=s.poison.filter(q=>q.life>0);
  s.poisonTick-=dt;if(s.poisonTick<=0){s.poisonTick=.5/st.haste;for(const e of s.enemies)if(e.hp>0&&s.poison.some(q=>Math.hypot(e.x-q.x,e.y-q.y)<q.r+e.r&&Village.clear(q,e,2)))hit(e,8*st.damage);}
  for(const f of s.fish){
   f.age+=dt;if(!f.back&&f.age>=.65){f.back=true;f.hit.clear();}
   const d=Math.hypot(p.x-f.x,p.y-f.y);if(f.back&&d<20){f.dead=true;continue;}
   const vx=(f.back?(p.x-f.x)/Math.max(1,d):f.dx)*310,vy=(f.back?(p.y-f.y)/Math.max(1,d):f.dy)*310;f.vx=vx;f.vy=vy;
   const n=Math.max(1,Math.ceil(Math.hypot(vx,vy)*dt/6));
   for(let i=0;i<n&&!f.dead;i++){const next={x:f.x+vx*dt/n,y:f.y+vy*dt/n};
    if(!Village.clear(f,next,3)){if(f.back)f.dead=true;else{f.back=true;f.hit.clear();}break;}
    f.x=next.x;f.y=next.y;
    for(const e of s.enemies)if(e.hp>0&&!f.hit.has(e)&&Math.hypot(e.x-f.x,e.y-f.y)<e.r+f.r){f.hit.add(e);hit(e,24*st.damage,vx*.12,vy*.12,f);}
   }if(f.age>3)f.dead=true;
  }s.fish=s.fish.filter(f=>!f.dead);
 }
 function ground(g,s,id){
  for(const q of s.poison){g.fillStyle='#79a74455';g.beginPath();g.ellipse(q.x,q.y,q.r,q.r*.6,0,0,Math.PI*2);g.fill();g.fillStyle='#bfdc7755';g.fillRect(q.x-5,q.y-3,4,3);}
  if(id==='cacofonix'){g.strokeStyle='#e8c67255';g.lineWidth=2;g.beginPath();g.arc(s.p.x,s.p.y,95*s.stats.range,0,Math.PI*2);g.stroke();g.font='18px serif';g.fillStyle='#f4d778';for(let i=0;i<5;i++){const a=s.step*1.3+i*Math.PI*2/5;g.fillText('♫',s.p.x+Math.cos(a)*75,s.p.y+Math.sin(a)*55-15);}}
 }
 function projectiles(g,s){for(const f of s.fish)ProjectileArt.drawFish(g,f);}
 function helmet(g,x,y,scale=1){if(typeof HelmetArt!=='undefined'&&HelmetArt.draw(g,x,y,scale))return;g.save();g.translate(x,y);g.scale(scale,scale);g.fillStyle='#273b32';g.fillRect(-9,4,19,4);g.fillStyle='#b8c5c7';g.beginPath();g.arc(0,0,8,Math.PI,0);g.lineTo(8,3);g.lineTo(-8,3);g.fill();g.fillStyle='#e1e7de';g.fillRect(-5,-5,3,5);g.fillStyle='#718d95';g.fillRect(-10,2,20,3);g.fillRect(4,4,4,5);g.restore();}
 return {defs,draw,fish,update,ground,projectiles,helmet};
})();

export let VillageRenderer;
VillageRenderer={create({document,VillageArt,size,objects,roads}){
 let groundCache=null; const depthObjects=objects.map(o=>({...o,scenery:true})).sort((a,b)=>a.y-b.y);
 function paintGround(g){
  g.fillStyle='#89954e';g.fillRect(0,0,size,size);
  if(VillageArt&&VillageArt.status['ground-v1']==='ready'){
   g.save();g.imageSmoothingEnabled=true;
   for(let y=0;y<size;y+=550)for(let x=0;x<size;x+=550)g.drawImage(VillageArt.images['ground-v1'],x,y,550,550);g.restore();
  }
  let dirt='#c0af7d';
  if(VillageArt&&VillageArt.status['ground-v1']==='ready'){
   const tile=document.createElement('canvas');tile.width=tile.height=550;const t=tile.getContext('2d');
   t.drawImage(VillageArt.images['ground-v1'],0,0,550,550);
   t.fillStyle='#c4af83dc';t.fillRect(0,0,550,550);
   for(let i=0;i<4800;i++){t.fillStyle=i%3?'#66533b15':'#f5e1bb35';t.fillRect(i*13.71%550,i*87.23%550,1+i%3,1);}
   dirt=g.createPattern(tile,'repeat');
  }
  g.lineCap='round';g.lineJoin='round';
  for(const [extra,color] of [[18,'#8f8d55'],[8,'#b1a46e'],[0,dirt]]){
   for(const [x,y,a,b,c,d,e,f,w] of roads){
    g.strokeStyle=color;g.lineWidth=w+extra;g.beginPath();g.moveTo(x,y);g.bezierCurveTo(a,b,c,d,e,f);g.stroke();
   }
  }
  g.fillStyle=dirt;g.beginPath();g.ellipse(1120,1170,255,175,-.1,0,Math.PI*2);g.fill();
  // Deterministic, quiet flecks soften the lanes without adding visual collision.
  for(let i=0;i<1800;i++){const x=(i*397.31)%size,y=(i*673.73)%size;g.fillStyle=i%2?'#78674918':'#f3dcac25';g.fillRect(x,y,2+i%5,1+i%2);}
 }
 function drawGround(g){
  if(VillageArt&&VillageArt.status['ground-v1']==='ready'&&!groundCache){
   groundCache=document.createElement('canvas');groundCache.width=size;groundCache.height=size;paintGround(groundCache.getContext('2d'));
  }
  if(groundCache)g.drawImage(groundCache,0,0);else paintGround(g);
 }
 function drawObject(g,o,player){
  g.save();
  // Keep the hero visible when a roof or the bard's canopy overlaps them.
  if(player&&player.y<o.y&&player.y>o.y-o.width&&Math.abs(player.x-o.x)<o.width*.48)g.globalAlpha=.48;
  if(VillageArt)VillageArt.draw(g,o.art,o.x,o.y+12,o.width);
  g.restore();
 }

function draw(g){drawGround(g);for(const o of depthObjects)drawObject(g,o);}
return {draw,drawGround,drawObject,depthObjects};
}};

export let VillageCollision;
'use strict';
// Ground-contact shapes in normalized sprite coordinates, not roof/canopy silhouettes.
VillageCollision=(()=>{
 const shapes={
  chief:[[[.14,.69],[.68,.64],[.89,.85],[.82,.96],[.17,.96]]],
  asterix:[[[.17,.72],[.65,.66],[.88,.87],[.81,.98],[.14,.96]]],
  obelix:[[[.15,.70],[.68,.64],[.9,.88],[.84,.97],[.15,.96]]],
  forge:[[[.28,.72],[.70,.66],[.88,.90],[.83,.96],[.28,.97]],[[.04,.88],[.27,.86],[.31,.98],[.04,.98]]],
  fish:[[[.17,.70],[.69,.64],[.89,.87],[.83,.96],[.15,.98]],[[.06,.86],[.26,.84],[.29,.98],[.05,.98]]],
  bard:[[[.33,.76],[.57,.74],[.69,.95],[.25,.97]],[[.66,.79],[.76,.80],[.83,.96],[.73,.98]]],
  trees:[[[.22,.80],[.35,.79],[.50,.96],[.21,.98]],[[.52,.76],[.65,.76],[.72,.90],[.48,.92]],[[.76,.82],[.86,.82],[.94,.96],[.72,.94]]],
  fence:[[[.015,.91],[.985,.91],[.985,.995],[.015,.995]]],
  gate:[[[.06,.86],[.25,.84],[.39,.94],[.39,.98],[.08,.98]],[[.60,.94],[.78,.84],[.93,.86],[.94,.98],[.60,.98]]]
 };
 const dimensions={chief:[617,496],asterix:[411,378],obelix:[515,436],forge:[550,447],fish:[511,448],bard:[504,539],trees:[666,637],fence:[773,353],gate:[708,682]};
 function create(objects,size){
  const polygons=[],buckets=new Map(),bucketSize=100;
  for(const o of objects){
   const [w,h]=dimensions[o.art],height=o.width*h/w;
   for(const shape of shapes[o.art]){
    const points=shape.map(([x,y])=>({x:o.x+(x-.5)*o.width,y:o.y+12+(y-1)*height}));
    const p={points,object:o,minX:Math.min(...points.map(p=>p.x)),maxX:Math.max(...points.map(p=>p.x)),minY:Math.min(...points.map(p=>p.y)),maxY:Math.max(...points.map(p=>p.y))};polygons.push(p);
    for(let y=Math.floor(p.minY/bucketSize);y<=Math.floor(p.maxY/bucketSize);y++)for(let x=Math.floor(p.minX/bucketSize);x<=Math.floor(p.maxX/bucketSize);x++){const key=x+','+y;if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(p);}
   }
  }
  function candidates(x0,y0,x1,y1){const out=new Set();for(let y=Math.floor(y0/bucketSize);y<=Math.floor(y1/bucketSize);y++)for(let x=Math.floor(x0/bucketSize);x<=Math.floor(x1/bucketSize);x++)for(const p of buckets.get(x+','+y)||[])out.add(p);return out;}
  function distance2(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));return (p.x-a.x-t*dx)**2+(p.y-a.y-t*dy)**2;}
  function inside(p,points){let yes=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)yes=!yes;}return yes;}
  const cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
  function intersects(a,b,c,d){return Math.max(a.x,b.x)>=Math.min(c.x,d.x)&&Math.max(c.x,d.x)>=Math.min(a.x,b.x)&&Math.max(a.y,b.y)>=Math.min(c.y,d.y)&&Math.max(c.y,d.y)>=Math.min(a.y,b.y)&&cross(a,b,c)*cross(a,b,d)<=0&&cross(c,d,a)*cross(c,d,b)<=0;}
  function clear(a,b,r=14){
   if(Math.min(a.x,b.x)<r||Math.min(a.y,b.y)<r||Math.max(a.x,b.x)>size-r||Math.max(a.y,b.y)>size-r)return false;
   for(const p of candidates(Math.min(a.x,b.x)-r,Math.min(a.y,b.y)-r,Math.max(a.x,b.x)+r,Math.max(a.y,b.y)+r)){
    if(inside(a,p.points)||inside(b,p.points))return false;
    for(let i=0;i<p.points.length;i++){const c=p.points[i],d=p.points[(i+1)%p.points.length];
     if(intersects(a,b,c,d)||Math.min(distance2(a,c,d),distance2(b,c,d),distance2(c,a,b),distance2(d,a,b))<r*r)return false;
    }
   }return true;
  }
  const blocked=(x,y,r=14)=>!clear({x,y},{x,y},r);
  function draw(g){g.save();g.lineWidth=2;for(const p of polygons){g.beginPath();p.points.forEach((v,i)=>i?g.lineTo(v.x,v.y):g.moveTo(v.x,v.y));g.closePath();g.fillStyle='#f25d4540';g.strokeStyle='#ffcf85';g.fill();g.stroke();}g.restore();}
  return {polygons,blocked,clear,draw};
 }
 return {create};
})();

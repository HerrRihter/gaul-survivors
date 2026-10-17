'use strict';
// Every map is one walkable region: no enclosed glades where enemies spawn and never reach
// the hero (spawning also checks world.reachable), and trees collide as one hull.
const assert=require('node:assert/strict');
const path=require('node:path'),{pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
const load=file=>import(pathToFileURL(path.join(root,file)).href);

async function main(){
  const {createArenas}=await load('src/world/arenas.js');
  const {Village}=await load('src/world/village/village.js');
  const {mapDefinitions}=await load('data/maps/maps.js');
  const arenas=createArenas(Village),cell=25,cols=88;
  const center=k=>({x:(k%cols+.5)*cell,y:(Math.floor(k/cols)+.5)*cell});
  for(const id of Object.keys(mapDefinitions)){
    const world=arenas.get(id),radii=mapDefinitions[id].openFor||[14];
    assert.equal(typeof world.reachable,'function',id+': spawning needs world.reachable');
    for(const r of radii){
      // Flood with real swept-collision steps, not the grid approximation used to build the map.
      const free=new Uint8Array(cols*cols),seen=new Uint8Array(cols*cols);
      for(let k=0;k<free.length;k++)free[k]=!world.blocked(center(k).x,center(k).y,r);
      const start=44+44*cols;assert(free[start],id+': the centre is free');
      const stack=[start];seen[start]=1;let reached=0;
      while(stack.length){const k=stack.pop();reached++;const x=k%cols,y=Math.floor(k/cols);
        for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const nx=x+dx,ny=y+dy,n=nx+ny*cols;
          if(nx<0||ny<0||nx>=cols||ny>=cols||!free[n]||seen[n])continue;
          if(world.clear(center(k),center(n),r)){seen[n]=1;stack.push(n);}}}
      const total=free.reduce((a,b)=>a+b,0),lost=total-reached;
      // A few single cells hug obstacle corners; anything larger is a closed glade.
      assert(lost<=total*.003,`${id}: ${lost} of ${total} free cells unreachable for radius ${r}`);
    }
  }

  // Trees are one solid hull: no gap between trunks fits the hero.
  const forest=arenas.get('forest');
  for(const tree of forest.objects.filter(o=>o.art==='trees')){
    assert.equal(forest.collision.polygons.filter(p=>p.object===tree).length,1,'Tree has one collision hull');
  }
  assert(forest.objects.length>140,'Forest stays dense after clearing glades');

  console.log(`PASS: ${Object.keys(mapDefinitions).length} maps form one walkable region, expose reachability for spawning, trees have one hull.`);
}
main().catch(e=>{console.error(e);process.exitCode=1;});

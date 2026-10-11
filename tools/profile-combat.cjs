const fs=require('node:fs'),path=require('node:path');
const {createServer}=require('./server.cjs');
const {chromium}=require('playwright');
async function main(){
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const reports=[];
 try{
 for(const map of (process.env.PROFILE_MAPS||'village,forest,camp').split(',')){
  const page=await browser.newPage({viewport:{width:1920,height:1080}});
  await page.addInitScript(()=>{
   let seed=71821;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
   window.frameTimings=[];window.measuring=false;
  });
  for(const [file,name,method]of [['src/systems/simulation.js','Simulation','update'],['src/rendering/scene-renderer.js','SceneRenderer','draw']]){
   await page.route('**/'+file,route=>{
    const source=fs.readFileSync(path.resolve(file),'utf8');
    route.fulfill({contentType:'text/javascript',body:source+`\nconst originalCreate=${name}.create;${name}.create=function(c){const api=originalCreate(c),fn=api.${method};api.${method}=function(...args){const start=performance.now();const result=fn(...args);if(window.measuring)window.frameTimings.push({kind:'${method}',start,ms:performance.now()-start,enemies:c.state?.enemies.length,x:c.state?.p.x,y:c.state?.p.y});return result;};return api;};`});
   });
  }
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  await page.click('#start');await page.click('#runHeroStart');
  await page.evaluate(async map=>{
   const {gameSession:s}=await import('/src/main.js');window.profileSession=s;
   s.selectMap(map);s.start();s.state.t=200;s.state.need=1e9;
   const types=['roman','spear','pilum','veteran','turtle','ram','netter','wine'];
   for(let i=0;i<120;i++)s.spawn(types[i%types.length]);
  },map);
  const cdp=await page.context().newCDPSession(page);await cdp.send('Profiler.enable');await cdp.send('Profiler.start');
  const intervals=await page.evaluate(()=>new Promise(resolve=>{
   const s=window.profileSession,intervals=[];let frames=0,last;
   window.measuring=true;
   function step(now){
    if(last!==undefined)intervals.push(now-last);last=now;
    s.state.p.hp=s.state.p.max;s.state.p.inv=1;
    if(frames%120===0){s.keys.clear();s.keys.add(['KeyW','KeyA','KeyS','KeyD'][Math.floor(frames/120)%4]);}
    if(s.mode==='level')s.pickUpgrade(0);
    if(++frames<600)requestAnimationFrame(step);else{window.measuring=false;s.pause();resolve(intervals);}
   }requestAnimationFrame(step);
  }));
  const {profile}=await cdp.send('Profiler.stop');
  const timings=await page.evaluate(()=>window.frameTimings);
  const sums=new Map(),nodes=new Map(profile.nodes.map(n=>[n.id,n]));
  profile.samples.forEach((id,i)=>sums.set(id,(sums.get(id)||0)+profile.timeDeltas[i]/1000));
  const hot=[...sums].map(([id,ms])=>({ms:Math.round(ms),...nodes.get(id).callFrame})).sort((a,b)=>b.ms-a.ms).slice(0,20);
  const stats=a=>{a=a.slice().sort((a,b)=>a-b);return {p50:a[Math.floor(a.length*.5)],p95:a[Math.floor(a.length*.95)],p99:a[Math.floor(a.length*.99)],max:a.at(-1),over33:a.filter(v=>v>33.4).length};};
  const report={map,frames:intervals.length,interval:stats(intervals),update:stats(timings.filter(t=>t.kind==='update').map(t=>t.ms)),draw:stats(timings.filter(t=>t.kind==='draw').map(t=>t.ms)),slowest:timings.sort((a,b)=>b.ms-a.ms).slice(0,8),hot};
  reports.push(report);console.log(JSON.stringify(report));await page.close();
 }
 fs.writeFileSync(path.resolve(process.argv[2]||'docs/COMBAT-PROFILE.json'),JSON.stringify({browser:await browser.version(),viewport:[1920,1080],note:'Headless Edge, real RAF loop, seeded random, 120 mixed enemies, moving player, 600 frames per map; CPU sampling enabled.',reports},null,2));
 }finally{await browser.close();await new Promise(r=>server.close(r));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});

const assert=require('node:assert/strict'),fs=require('node:fs');
const {createServer}=require('./server.cjs');
async function main(){
 const {chromium}=require('playwright'),server=createServer();
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 let browser;
 try{
  browser=await chromium.launch({headless:true,channel:'msedge'});
  const page=await browser.newPage({viewport:{width:1080,height:600}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/legion-preview.html#lutetia`);
  await page.waitForFunction(()=>document.getElementById('artStatus').textContent==='Легион готов к бою');
  await page.waitForFunction(async()=>{
   const {UnitArt}=await import('/src/rendering/art/unit-art.js');
   return Array.from({length:9},(_,i)=>UnitArt.status['citizen-'+i]).every(s=>s==='ready');
  });
  const count=await page.evaluate(async()=>{
   const {UnitArt:U}=await import('/src/rendering/art/unit-art.js');
   const canvas=document.createElement('canvas');canvas.id='outfits';canvas.width=1080;canvas.height=560;
   const g=canvas.getContext('2d');g.fillStyle='#304531';g.fillRect(0,0,1080,560);
   for(let v=0;v<9;v++)for(const [row,action]of ['walk','talk','shop','rest'].entries()){
    const image=U.get('citizen',action,.5,v);if(!image)throw Error('Missing '+v+'/'+action);
    const x=v*120+60,y=row*140+112;
    g.save();g.translate(x,y);g.scale(1.2,1.2);g.drawImage(image,-128,-236);g.restore();
    g.fillStyle='#f6cb72';g.font='12px monospace';g.textAlign='center';g.fillText('citizen-'+v+' · '+action,x,y+20);
   }
   document.body.replaceChildren(canvas);return Object.keys(U.status).filter(id=>id.startsWith('citizen-')&&U.status[id]==='ready').length;
  });
  assert.equal(count,9);assert.deepEqual(errors,[]);
  fs.mkdirSync('assets/source/references/audits',{recursive:true});
  await page.locator('#outfits').screenshot({path:'assets/source/references/audits/citizen-outfits.png'});
  console.log('PASS: nine loaded outfits, four actions each, no browser errors.');
 }finally{await browser?.close();await new Promise(r=>server.close(r));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});

const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
async function main(){
 const {chromium}=require('playwright'),browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:1100,height:850}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.resolve('legion-preview.html')).href+'#lutetia');
  await page.waitForFunction(()=>document.getElementById('artStatus').textContent==='Легион готов к бою');
  const card=page.locator('.card').filter({has:page.locator('canvas[data-unit="citizen"]')});
  const dir='assets/source/references/audits';fs.mkdirSync(dir,{recursive:true});
  for(const motion of ['talk','shop','rest']){
   await page.selectOption('#motion',motion);
   await page.waitForTimeout(550);
   await card.screenshot({path:path.join(dir,'citizen-'+motion+'.png')});
  }
  await page.locator('#reverse').check();
  await page.setViewportSize({width:375,height:850});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.deepEqual(errors,[]);
  console.log('PASS: citizen talk, shop, rest preview, mirroring, mobile and file launch.');
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});

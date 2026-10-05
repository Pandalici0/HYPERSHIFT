const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const {downloads:d,graph:g,toasts:t,popup}=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/downloads-tokens.json'),'utf8'));
const cssNames=['libraryroot.custom.css','downloads.custom.css','friends.custom.css','dialogs.css','settings.custom.css','notifications.custom.css','overlay.custom.css','steamwindows.custom.css','login.custom.css'];
const css=cssNames.map(n=>fs.readFileSync(path.join(root,n),'utf8')).join('\n');
async function contrast(page){
 const samples=await page.locator('[data-readable]').evaluateAll(ns=>{
  const rgb=s=>s.match(/[\d.]+/g).slice(0,3).map(Number);
  const lum=c=>c.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
  return ns.filter(n=>n.getClientRects().length).map(n=>{
   let p=n,bg,opacity=1;while(p){const c=getComputedStyle(p);opacity*=Number(c.opacity);if(!bg&&c.backgroundColor!=='rgba(0, 0, 0, 0)'&&c.backgroundColor!=='transparent')bg=rgb(c.backgroundColor);p=p.parentElement}
   bg=bg||[255,255,255];const a=lum(rgb(getComputedStyle(n).color)),b=lum(bg),r=n.getBoundingClientRect();
   return {text:n.textContent.slice(0,65),ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05),opacity,width:r.width};
  });
 });
 assert.ok(samples.length>30);for(const s of samples){assert.ok(s.ratio>=4.5,`${s.text}: contrast ${s.ratio}`);assert.equal(s.opacity,1,`${s.text}: opacity`);assert.ok(s.width>0)}
}
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.HYPERSHIFT_BROWSER_CHANNEL?{channel:process.env.HYPERSHIFT_BROWSER_CHANNEL}:{})});
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.join(__dirname,'fixtures/downloads.html')).href);
 if(process.env.HYPERSHIFT_NATIVE_CSS){for(const n of ['library.css','chunk~2dcc5aaf7.css'])await page.addStyleTag({content:fs.readFileSync(path.join(process.env.HYPERSHIFT_NATIVE_CSS,n),'utf8')})}
 await page.addStyleTag({content:css});
 await page.evaluate(()=>window.originalDownloadNodes=[...document.querySelectorAll('[role="progressbar"],.fixture-downloads button, img')]);
 for(const [width,height] of [[1304,672],[1920,1080],[800,720],[600,720]]){
  await page.setViewportSize({width,height});await page.waitForTimeout(100);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`overflow at ${width}`);
  await contrast(page);
  const geometry=await page.locator('.'+g.HeaderImage+' img').evaluate(n=>{
   const s=getComputedStyle(n),r=n.getBoundingClientRect(),p=n.closest('._3mZ2rKd2RECK4q4ufmsDYX').getBoundingClientRect();
   const scale=Math.min(r.width/n.naturalWidth,r.height/n.naturalHeight);
   return{loaded:n.naturalWidth>0,fit:s.objectFit,inside:r.left>=p.left-.5&&r.right<=p.right+.5&&r.top>=p.top-.5&&r.bottom<=p.bottom+.5,paintFits:n.naturalWidth*scale<=p.width+.5&&n.naturalHeight*scale<=p.height+.5};
  });
  assert.deepEqual(geometry,{loaded:true,fit:'contain',inside:true,paintFits:true});
  assert.equal(await page.locator('.'+g.HeaderImage).evaluate(n=>getComputedStyle(n).transform),'none');
  assert.equal(await page.locator('.'+g.HeroContainer).evaluate(n=>getComputedStyle(n).maskImage),'none');
  assert.equal(await page.locator('.'+g.GraphLine).evaluate(n=>getComputedStyle(n).fill),'none','Disk line must never become a filled block');
  for(const pct of [0,3,64,100]){
   await page.locator('[data-kind="disk"]').evaluate((n,pct)=>{n.firstElementChild.style.width=pct+'%';n.setAttribute('aria-valuenow',pct)},pct);
   const actual=await page.locator('[data-kind="disk"]').evaluate(n=>({pct:Number(n.getAttribute('aria-valuenow')),inline:n.firstElementChild.style.width,ratio:n.firstElementChild.getBoundingClientRect().width/n.getBoundingClientRect().width,height:n.getBoundingClientRect().height}));
   assert.equal(actual.inline,pct+'%');assert.equal(actual.pct,pct);assert.ok(Math.abs(actual.ratio-pct/100)<.002);assert.equal(actual.height,6);
  }
  const group=await page.locator('[data-bar="disk"]').evaluate(n=>({bg:getComputedStyle(n).backgroundColor,labels:n.firstElementChild.getBoundingClientRect().bottom,track:n.lastElementChild.getBoundingClientRect().top}));
  assert.equal(group.bg,'rgba(0, 0, 0, 0)');assert.ok(group.track>=group.labels,'Labels stay above the fill');
  for(const name of ['Download pausieren','Download vorziehen']){
   const b=page.getByRole('button',{name});assert.equal(await b.evaluate(n=>{const r=n.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return r.width>=30&&r.height>=30&&(hit===n||n.contains(hit))}),true,`${name} at ${width}`);
   await b.click();
  }
  await page.locator('.'+d.DownloadGraph).click({position:{x:5,y:5}});
  assert.equal(await page.locator('body').getAttribute('data-game'),'opened');
  assert.equal(await page.locator('body').getAttribute('data-pause'),'requested');assert.equal(await page.locator('body').getAttribute('data-queue'),'requested');
 }
 // All four current template variants, including unwrapped/pinned-like cards,
 // must keep nested names, game titles, messages and achievement text readable.
 for(let i=0;i<t.length;i++){
  const card=page.locator(`[data-toast="${i}"]`);await card.click();assert.equal(await page.locator('body').getAttribute('data-toast'),String(i));
  assert.equal(await card.locator('.'+t[i].IngameTitle).evaluate(n=>getComputedStyle(n).color),'rgb(33, 99, 66)');
 }
 await page.locator('.fixture-toasts > div').evaluateAll(ns=>ns.forEach(n=>n.replaceWith(...n.childNodes)));
 await contrast(page);
 assert.equal(await page.evaluate(()=>window.originalDownloadNodes.every(n=>n.isConnected)),true);
 assert.equal(await page.locator('#unrelated').evaluate(n=>getComputedStyle(n).color),'rgb(200, 210, 220)');
 if(process.env.HYPERSHIFT_SCREENSHOTS){
  fs.mkdirSync(process.env.HYPERSHIFT_SCREENSHOTS,{recursive:true});await page.setViewportSize({width:1304,height:1000});await page.locator('[data-kind="disk"]').evaluate(n=>{n.firstElementChild.style.width='3%';n.setAttribute('aria-valuenow','3')});
  await page.screenshot({path:path.join(process.env.HYPERSHIFT_SCREENSHOTS,'downloads-and-toasts.png')});
 }
 assert.deepEqual(errors,[]);await browser.close();console.log('PASS: complete download artwork, four viewport sizes, live fill widths 0/3/64/100, native action models, nested toast contrast and scope isolation');
})().catch(e=>{console.error(e);process.exit(1)});

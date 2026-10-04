const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const {chromium} = require('playwright');
const root = path.resolve(__dirname, '..');
const script = fs.readFileSync(path.join(root, 'libraryroot.custom.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'libraryroot.custom.css'), 'utf8');
const hashA = 'a'.repeat(40), hashB = 'b'.repeat(40);
const artwork = '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="300"><rect width="600" height="300" fill="#45366b"/></svg>';

(async () => {
  const browser = await chromium.launch({headless: true, ...(process.env.HYPERSHIFT_BROWSER_CHANNEL ? {channel:process.env.HYPERSHIFT_BROWSER_CHANNEL} : {})});
  const page = await browser.newPage({viewport: {width:1280, height:720}});
  const errors = [], heroRequests = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route('https://fixture.invalid/**', route => {
    const url = route.request().url();
    if (url.includes('/hero/')) heroRequests.push(url);
    return route.fulfill(url.endsWith('missing.jpg') ? {status:404, body:''} : {status:200, contentType:'image/svg+xml', body:artwork});
  });
  await page.goto(pathToFileURL(path.join(__dirname,'fixtures/library.html')).href);
  await page.addStyleTag({content:css});
  await page.evaluate(({hashA,hashB}) => {
    const apps = [
      {appid:101, display_name:'Fixture Alpha', visible_in_game_list:true, library_capsule_filename:hashA+'.jpg'},
      {appid:202, display_name:'Fixture Beta', visible_in_game_list:true, library_capsule_filename:hashB+'.jpg'},
      {appid:303, display_name:'Hidden fixture', visible_in_game_list:false},
      {appid:404, display_name:'Filtered fixture', visible_in_game_list:true}
    ];
    window.appStore = {
      m_bIsInitialized:false, allApps:apps,
      GetVerticalCapsuleURLForApp:app=>'https://fixture.invalid/image/'+(app.library_capsule_filename || app.appid+'.jpg'),
      GetCachedVerticalCapsuleURL:app=>['https://fixture.invalid/assets/'+app.appid+'/capsule.jpg']
    };
    window.collectionStore = {BIsVisible:app=>app.appid!==404, BIsFavorite:app=>app.appid===101};
    window.appDetailsStore = {GetHeroImages:app=>({rgHeroImages:['https://fixture.invalid/hero/'+app.appid+'.jpg']})};
    for (const [id,hash,title] of [[101,hashA,''],[202,hashB,''],[999,'c'.repeat(40),'Unowned fixture']]) {
      const card=document.createElement('div');card.className='native-card WYgDg9NyCcMIVuMyZ_NBC biTV-8rS2M65imVHU15Nv';
      card.onclick=()=>document.body.dataset.open=String(id);
      const img=document.createElement('img');img.src='https://fixture.invalid/image/'+hash+'.jpg';card.append(img);
      if(title){const label=document.createElement('span');label.className='_1tO8pfL08v-v_lzvm0fKH1';label.textContent=title;card.append(label)}
      const play=document.createElement('button');play.className='_3AjoLnMNKxYmNTGTJCLfgs _1_Bo2Ied5s2Od4YKYTOsau';play.textContent='Play';play.onclick=event=>{event.stopPropagation();document.body.dataset.play=String(id)};card.append(play);
      document.querySelector('.native-grid').append(card);
    }
    window.originalPlay=document.querySelector('._3AjoLnMNKxYmNTGTJCLfgs');window.originalPlayParent=originalPlay.parentElement;
  }, {hashA,hashB});
  await page.addScriptTag({content:script});
  await page.waitForSelector('.hs-home');
  assert.equal(await page.locator('.hs-sidebar').isVisible(),false,'Native list remains until store initialization');
  await page.evaluate(()=>window.appStore.m_bIsInitialized=true);
  await page.waitForFunction(()=>document.querySelectorAll('.hs-all-list .hs-side-game').length===2);
  assert.deepEqual(await page.locator('.hs-all-list .hs-side-game').evaluateAll(ns=>ns.map(n=>n.dataset.appid)),['101','202']);
  assert.equal(await page.locator('.hs-game-title').innerText(),'Fixture Alpha');
  assert.equal(await page.locator('.hs-owned [data-appid="999"]').count(),0,'Native unowned cards cannot enter authoritative inventory');
  assert.equal(await page.locator('.hs-owned [data-appid="303"]').count(),0);
  assert.equal(await page.locator('.hs-owned [data-appid="404"]').count(),0);
  await page.locator('.hs-play').click();
  assert.equal(await page.locator('body').getAttribute('data-play'),'101','Hash-only native card retains actual play control');
  assert.equal(await page.evaluate(()=>originalPlay.parentElement===originalPlayParent),true);
  await page.waitForFunction(()=>document.querySelector('.hs-feature-image').getAttribute('src')==='https://fixture.invalid/hero/101.jpg');
  await page.locator('.hs-side-search input').fill('Beta');
  assert.equal(await page.locator('.hs-all-list .hs-side-game').count(),1);
  assert.equal(await page.locator('.hs-home').isVisible(),true);
  await page.locator('.hs-side-search input').fill('');
  await page.locator('.hs-all-list [data-appid="202"]').click();
  await page.waitForFunction(()=>document.querySelector('.hs-feature-image').getAttribute('src')==='https://fixture.invalid/hero/202.jpg');
  await page.locator('.hs-play').click();assert.equal(await page.locator('body').getAttribute('data-play'),'202');

  // Invoke a stale selection before the inventory refresh can select another game.
  await page.evaluate(()=>{
    window.appStore.allApps=window.appStore.allApps.filter(a=>a.appid!==202);
    document.querySelector('.hs-play').click();
  });
  assert.equal(await page.locator('body').getAttribute('data-play'),'202');
  await page.waitForFunction(()=>document.querySelector('.hs-home').dataset.appid==='101');
  assert.equal(await page.locator('.hs-all-list .hs-side-game').count(),1);

  // Name-only cards and library additions resolve without packaged metadata.
  await page.evaluate(()=>{
    window.appStore.allApps.push({appid:505,display_name:'Fixture Gamma',visible_in_game_list:true});
    const c=document.createElement('div');c.className='WYgDg9NyCcMIVuMyZ_NBC';
    const label=document.createElement('span');label.className='_1tO8pfL08v-v_lzvm0fKH1';label.textContent='Fixture Gamma';c.append(label);
    c.onclick=()=>document.body.dataset.open='505';document.querySelector('.native-grid').append(c);
  });
  await page.waitForFunction(()=>document.querySelector('.hs-all-list [data-appid="505"]'));
  await page.locator('.hs-all-list [data-appid="505"]').click();await page.locator('.hs-play').click();
  assert.equal(await page.locator('body').getAttribute('data-open'),'505');

  // Steam custom art and multiple hero failures use native candidates in order.
  await page.evaluate(()=>window.appDetailsStore.GetHeroImages=app=>({rgHeroImages:['https://fixture.invalid/hero/missing.jpg','https://fixture.invalid/hero/custom.jpg']}));
  await page.locator('.hs-all-list [data-appid="101"]').click();
  await page.waitForFunction(()=>document.querySelector('.hs-feature-image').getAttribute('src')==='https://fixture.invalid/hero/custom.jpg');
  assert.equal(heroRequests.filter(u=>u.endsWith('/missing.jpg')).length,1,'Failed image is not requested repeatedly');
  await page.evaluate(()=>window.appDetailsStore.GetHeroImages=()=>{throw new Error('Store not available')});
  await page.locator('.hs-all-list [data-appid="505"]').click();
  await page.waitForFunction(()=>document.querySelector('.hs-feature-image').getAttribute('src')==='https://fixture.invalid/image/505.jpg');

  await page.addScriptTag({content:script});
  assert.equal(await page.locator('.hs-home').count(),1);assert.equal(await page.locator('.hs-sidebar').count(),1);
  await page.evaluate(()=>window.__hypershiftTheme.destroy());
  assert.equal(await page.locator('.hs-owned').count(),0);assert.equal(await page.locator('footer').count(),1);
  assert.equal(await page.evaluate(()=>originalPlay.parentElement===originalPlayParent),true);
  await page.evaluate(()=>window.appStore.allApps=[]);await page.addScriptTag({content:script});
  assert.equal(await page.locator('.hs-play').isDisabled(),true);assert.equal(await page.locator('.hs-tile').count(),0);
  assert.deepEqual(errors,[]);
  await browser.close();console.log('PASS: portable identity discovery, visible inventory, native actions, hero fallbacks and cleanup');
})().catch(error=>{console.error(error);process.exit(1)});

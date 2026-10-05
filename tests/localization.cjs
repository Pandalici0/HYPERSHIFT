const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const locales=fs.readdirSync(path.join(root,'locales')).map(n=>JSON.parse(fs.readFileSync(path.join(root,'locales',n),'utf8')));
const source=n=>fs.readFileSync(path.join(root,n),'utf8');
const script=source('libraryroot.custom.js'),languageScript=source('localization.custom.js');
const css=['libraryroot.custom.css','localization.custom.css'].map(source).join('\n');
const keys=Object.keys(locales.find(l=>l.locale==='en').strings).sort();
assert.equal(locales.length,31);
for(const l of locales){assert.deepEqual(Object.keys(l.strings).sort(),keys);for(const [k,v]of Object.entries(l.strings))assert.ok(v.trim(),l.locale+': '+k);}
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.HYPERSHIFT_BROWSER_CHANNEL?{channel:process.env.HYPERSHIFT_BROWSER_CHANNEL}:{})});
 const page=await browser.newPage({viewport:{width:1280,height:720},locale:'de-DE'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.join(__dirname,'fixtures/library.html')).href);
 await page.addStyleTag({content:css});
 await page.evaluate(()=>{
   const header=document.createElement('header');header.className='_3Z7VQ1IMk4E3HsHvrkLNgo';header.innerHTML='<div class="_39oUCO1OuizVPwcnnv88no">Steam</div>';document.body.prepend(header);
   const ids=[1091500,1245620,1086940,381210,730,251570];
   window.appStore={m_bIsInitialized:true,allApps:ids.map((appid,i)=>({appid,rt_last_time_played:100-i,display_name:['Cyberpunk 2077','Elden Ring','Baldur’s Gate 3','Dead by Daylight','Counter-Strike 2','7 Days to Die'][i],visible_in_game_list:true}))};
   window.collectionStore={BIsVisible:()=>true,BIsFavorite:app=>app.appid===1091500};
   for(const app of appStore.allApps){const card=document.createElement('div');card.className='WYgDg9NyCcMIVuMyZ_NBC';card.dataset.appid=app.appid;const title=document.createElement('span');title.className='_1tO8pfL08v-v_lzvm0fKH1';title.textContent=app.display_name;card.append(title);const button=document.createElement('button');button.className='_3AjoLnMNKxYmNTGTJCLfgs _1_Bo2Ied5s2Od4YKYTOsau';button.textContent='Play';button.onclick=()=>document.body.dataset.play=String(app.appid);card.append(button);document.querySelector('.native-grid').append(card);}
   window.nativePlay=document.querySelector('._3AjoLnMNKxYmNTGTJCLfgs');
 });
 await page.addScriptTag({content:script});
 await page.waitForSelector('.hs-play');
 for(const viewport of [{width:1920,height:1032},{width:1280,height:720},{width:1024,height:768}]){
  await page.setViewportSize(viewport);
  for(const l of locales){
   await page.evaluate(code=>document.documentElement.lang=code,l.locale);
   await page.waitForFunction(code=>document.documentElement.dataset.hsLocale===code,l.locale);
   await page.waitForFunction(expected=>document.querySelector('.hs-play')?.textContent===expected,l.strings.play);
   assert.equal((await page.locator('.hs-start').innerText()).trim(),l.strings.home);
   assert.equal(await page.locator('.hs-top-search input').getAttribute('placeholder'),l.strings.searchTop);
   assert.equal(await page.locator('.hs-headline-text').innerText(),l.strings.headlineNight);
   assert.equal(await page.locator('.hs-poster-caption').innerText(),l.strings.nightDreams);
   assert.equal(await page.locator('.hs-feature-tags span').last().innerText(),l.strings.singleplayer);
   assert.equal(await page.locator('.hs-all-list .hs-side-game').count(),6);
   const overflow=await page.locator('.hs-headline-text,.hs-play,.hs-poster-fallback').evaluateAll(ns=>ns.filter(n=>getComputedStyle(n).display!=='none').map(n=>{const p=n.classList.contains('hs-headline-text')?n.parentElement:n;return{class:n.className,width:n.scrollWidth-p.clientWidth,height:n.scrollHeight-p.clientHeight};}));
   for(const item of overflow)assert.ok(item.width<=2&&item.height<=2,l.locale+' '+viewport.width+' '+JSON.stringify(item));
   const footer=await page.locator('.ip-YZhijAMZcuRoXBGiye').evaluate(n=>getComputedStyle(n,'::after').content);
   assert.equal(footer,JSON.stringify(l.strings.downloads));
   if(process.env.HYPERSHIFT_LOCALE_PREVIEWS&&viewport.width===1280&&['en','de','ja','ar'].includes(l.locale)){fs.mkdirSync(process.env.HYPERSHIFT_LOCALE_PREVIEWS,{recursive:true});await page.screenshot({path:path.join(process.env.HYPERSHIFT_LOCALE_PREVIEWS,l.locale+'.png')});}
  }
 }
 await page.evaluate(()=>document.documentElement.lang='en');
 await page.waitForFunction(()=>document.querySelector('.hs-play').textContent==='Play');
 await page.locator('.hs-play').click();assert.equal(await page.locator('body').getAttribute('data-play'),'1091500');
 assert.equal(await page.evaluate(()=>nativePlay.isConnected),true,'Native action node retained');
 // Language can change without losing the selected game or filtering.
 await page.locator('.hs-all-list [data-appid="381210"]').click();await page.locator('.hs-side-search input').fill('Dead');
 await page.evaluate(()=>document.documentElement.lang='fr');await page.waitForFunction(()=>document.querySelector('.hs-play').textContent==='Jouer');
 assert.equal(await page.locator('.hs-home').getAttribute('data-appid'),'381210');assert.equal(await page.locator('.hs-side-search input').inputValue(),'Dead');
 await page.addScriptTag({content:languageScript});assert.equal(await page.locator('.hs-home').count(),1);
 assert.deepEqual(await page.evaluate(()=>['zh-TW','zh-HK','nb-NO','pt_BR','es-MX','koreana','german','xx-ZZ'].map(c=>__hypershiftI18n.resolve(c))),['zh-TW','zh-TW','no','pt-BR','es-419','ko','de','en']);
 await page.evaluate(()=>document.documentElement.lang='xx-ZZ');await page.waitForFunction(()=>document.querySelector('.hs-play').textContent==='Play');
 // The actual Steam setting beats both navigator.language and a stale root.
 await page.evaluate(()=>{__hypershiftTheme.destroy();__hypershiftI18n.destroy();document.documentElement.lang='de';window.SteamClient={Settings:{GetCurrentLanguage:async()=> 'english'}};});
 await page.addScriptTag({content:languageScript});await page.waitForFunction(()=>__hypershiftI18n.locale==='en');
 // Stable Millennium option keys remain unchanged; only presentation changes.
 await page.setContent('<html lang="fr"><body><h1>HYPERSHIFT</h1><label>Bibliotheksstart</label><p>HYPERSHIFT-Startseite oder native Steam-Startseite.</p><label>Kopfzeile</label><p>Kantige Hauptnavigation oder eine zweite Zeile.</p><button data-value="An">An</button><button data-value="Aus">Aus</button><button data-value="Zwei Zeilen">Zwei Zeilen</button></body></html>');
 await page.evaluate(()=>{__hypershiftI18n?.destroy();delete window.SteamClient;});await page.addScriptTag({content:languageScript});
 const fr=locales.find(l=>l.locale==='fr');assert.equal(await page.locator('label').first().innerText(),fr.strings.conditionHome);
 assert.equal(await page.locator('[data-value="An"]').innerText(),fr.strings.on);assert.equal(await page.locator('[data-value="Zwei Zeilen"]').innerText(),fr.strings.twoRows);
 await page.evaluate(()=>__hypershiftI18n.destroy());assert.equal(await page.locator('label').first().innerText(),'Bibliotheksstart');
 // Login remains language-capable with CSS alone; don't inject any login JS.
 const login=await browser.newPage();await login.setContent('<html lang="en"><body><div class="VZ6x_grhNkIYJG__jEEyp"><div class="lat0M-V5X4uYd6Mpm1DJ1"><div class="_2v9dClMg2Lmn8UVv6GUeJt"></div></div><div class="_14exBrSFDthVqeknXgFh4X"></div></div></body></html>');
 await login.addStyleTag({content:source('login.custom.css')+'\n'+source('localization.custom.css')});
 for(const l of locales){await login.evaluate(c=>document.documentElement.lang=c,l.locale);const content=await login.locator('._14exBrSFDthVqeknXgFh4X').evaluate(n=>getComputedStyle(n,'::after').content);assert.equal(content,JSON.stringify('STEAM / '+l.strings.login),l.locale+' CSS-only login');const banner=await login.locator('._2v9dClMg2Lmn8UVv6GUeJt').evaluate(n=>getComputedStyle(n,'::before').content);assert.ok(banner.includes(l.strings.nextLevel.split('\n')[0]),l.locale+' login banner');}
 const details=await browser.newPage();details.on('pageerror',e=>errors.push(e.message));
 await details.setContent('<html lang="en"><body><div class="_2iE-78WxX2Pj4GHbq7YJiA"><div class="_2gZXhRmKUk68pA28-5ZmGQ"></div><div class="_2l416KfEtI4CL0mCUEmOBw"></div><div class="_1_cYNJSvS6IXs9vLTEYjy5"><div class="_3Yf8b2v5oOD8Wqsxu04ar _1U7LKpx70kEsz3jJwAFOi-"><button class="_3ydigb6zZAjJ0JCDgHwSYA" onclick="document.body.dataset.action=\'native\'"><span class="_33cnXIqTRgRr49_FNXIHj6">Play</span></button><div class="_1YbtIWcfkQJOysLXQbwzRf">Native statistic</div></div><nav class="DgVQapkBmhAW6oPY5rPZo"><span class="_2sNDjgK9EWiPLdNGkjun-w">Native localized link</span></nav><div class="_27RcNu8aXKBpYkHcNNrt-X"><aside class="_2aor4XVOYzN1PBSREk0UbO"></aside></div><textarea class="_10oyYsgiC5Hvnoieb7sHLI" placeholder="Native activity prompt"></textarea></div></div></body></html>');
 await details.addStyleTag({content:css});await details.addScriptTag({content:script});
 for(const l of locales){await details.evaluate(({locale,play})=>{document.documentElement.lang=locale;document.querySelector('._33cnXIqTRgRr49_FNXIHj6').textContent=play;},{locale:l.locale,play:l.strings.play});await details.waitForFunction(expected=>document.querySelector('.hs-detail-overview')?.textContent===expected,l.strings.overview.toLocaleUpperCase(l.locale));assert.equal(await details.locator('textarea').getAttribute('placeholder'),l.strings.statusPlaceholder);assert.equal(await details.locator('.hs-action-play').count(),1);assert.equal(await details.locator('._2sNDjgK9EWiPLdNGkjun-w').innerText(),'Native localized link');assert.equal(await details.locator('._1YbtIWcfkQJOysLXQbwzRf').evaluate(n=>getComputedStyle(n,'::before').content),JSON.stringify(l.strings.yourGame));}
 await details.locator('button._3ydigb6zZAjJ0JCDgHwSYA').evaluate(n=>n.click());assert.equal(await details.locator('body').getAttribute('data-action'),'native');
 await details.evaluate(()=>__hypershiftTheme.destroy());assert.equal(await details.locator('textarea').getAttribute('placeholder'),'Native activity prompt');
 assert.deepEqual(errors,[]);await browser.close();console.log('PASS: 31 complete catalogs, live language switching, 3 viewport sizes, native actions, config keys, API precedence, aliases, English fallback and CSS-only login');
})().catch(e=>{console.error(e);process.exit(1)});

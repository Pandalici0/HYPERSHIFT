const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),tokens=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/windows-tokens.json'),'utf8'));
const css=fs.readFileSync(path.join(root,'steamwindows.custom.css'),'utf8');
const settingsCSS=fs.readFileSync(path.join(root,'settings.custom.css'),'utf8');
const allCSS=['libraryroot.custom.css','downloads.custom.css','friends.custom.css','dialogs.css','settings.custom.css','notifications.custom.css','overlay.custom.css','steamwindows.custom.css','login.custom.css'].map(n=>fs.readFileSync(path.join(root,n),'utf8')).join('\n');
const color=n=>getComputedStyle(n).color;
async function readable(page,selector){
 const samples=await page.locator(selector).evaluateAll(nodes=>{
  const rgb=s=>s.match(/[\d.]+/g)?.slice(0,3).map(Number);
  const lum=c=>{const v=c.map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4});return .2126*v[0]+.7152*v[1]+.0722*v[2]};
  return nodes.filter(n=>n.getClientRects().length).map(n=>{let p=n,bg;while(p){const s=getComputedStyle(p).backgroundColor;if(!s.endsWith(', 0)')&&s!=='transparent'){bg=rgb(s);break}p=p.parentElement}bg=bg||[255,255,255];const fg=rgb(getComputedStyle(n).color),a=lum(fg),b=lum(bg);return{text:n.textContent.trim().slice(0,55),ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)}});
 });
 assert.ok(samples.length);for(const s of samples)assert.ok(s.ratio>=4.5,s.text+' contrast '+s.ratio);return samples;
}
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.HYPERSHIFT_BROWSER_CHANNEL?{channel:process.env.HYPERSHIFT_BROWSER_CHANNEL}:{})});
 const page=await browser.newPage({viewport:{width:842,height:720}}),errors=[],results=[];
 page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(path.join(__dirname,'fixtures/properties.html')).href);
 if(process.env.HYPERSHIFT_NATIVE_CSS)for(const name of ['library.css','chunk~2dcc5aaf7.css'])await page.addStyleTag({path:path.join(process.env.HYPERSHIFT_NATIVE_CSS,name)});
 await page.addStyleTag({content:allCSS});
 const original=await page.locator('[aria-label="Startoptionen"]').elementHandle();
 for(const [width,height]of [[842,720],[650,740],[500,800]]){
  await page.setViewportSize({width,height});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Popup horizontal overflow '+width);
  results.push({width,height,contrast:await readable(page,'[data-readable]')});
  for(const n of ['Minimieren','Maximieren','Schließen']){
   await page.getByRole('button',{name:n,exact:true}).click();assert.equal(await page.locator('body').getAttribute('data-window-action'),({Minimieren:'minimize',Maximieren:'maximize',Schließen:'close'})[n]);
  }
  for(const title of ['Allgemein','Updates','Spielversionen und Betas','Installierte Dateien','Controller','Spielaufnahme','Datenschutz','Anpassung','DLC','Workshop']){
   await page.locator('button[data-page="'+title+'"]').click();assert.equal(await page.locator('.DialogHeader').innerText(),title);
   assert.equal(await page.locator('button[data-page="'+title+'"]').evaluate(n=>getComputedStyle(n).backgroundColor),'rgb(229, 248, 56)');
  }
  await page.locator('button[data-page="Allgemein"]').click();
  const toggle=page.getByRole('switch',{name:'Steam-Overlay',exact:true});
  const before=await toggle.getAttribute('aria-checked');await toggle.click();assert.notEqual(await toggle.getAttribute('aria-checked'),before);await toggle.click();assert.equal(await toggle.getAttribute('aria-checked'),before);
  const rail='.'+tokens.fields.ToggleRail;
  assert.equal(await toggle.locator(rail).evaluate(n=>getComputedStyle(n).backgroundColor),'rgb(229, 248, 56)');
  assert.equal(await toggle.locator(rail).evaluate(n=>getComputedStyle(n,'::before').backgroundColor),'rgb(229, 248, 56)','Native toggle pseudo-element cannot retain Steam blue');
  await toggle.click();assert.equal(await toggle.locator(rail).evaluate(n=>getComputedStyle(n).backgroundColor),'rgb(183, 175, 201)');await toggle.click();
  await page.getByRole('button',{name:'Deutsch'}).click();assert.equal(await page.locator('body').getAttribute('data-language'),'opened');
  await page.getByRole('textbox',{name:'Startoptionen'}).fill('-windowed');assert.equal(await page.getByRole('textbox',{name:'Startoptionen'}).inputValue(),'-windowed');
  assert.equal(await original.evaluate(n=>n===document.querySelector('[aria-label="Startoptionen"]')),true);
  await page.getByRole('button',{name:'Dateien durchsuchen'}).click();assert.equal(await page.locator('body').getAttribute('data-action'),'browse');
  await page.getByRole('button',{name:'Fertig',exact:true}).click();assert.equal(await page.locator('body').getAttribute('data-action'),'close');
 }
 await page.setViewportSize({width:842,height:720});await page.getByRole('textbox',{name:'Startoptionen'}).fill('');
 await page.locator('.'+tokens.paged.PagedSettingDialog_ContentColumn).evaluate(n=>n.scrollTop=0);
 await page.evaluate(()=>document.activeElement?.blur());await page.mouse.move(830,710);await page.waitForTimeout(120);
 if(process.env.HYPERSHIFT_SCREENSHOTS){fs.mkdirSync(process.env.HYPERSHIFT_SCREENSHOTS,{recursive:true});await page.screenshot({path:path.join(process.env.HYPERSHIFT_SCREENSHOTS,'properties.png')})}

 // Native tables have fixed-height/virtualized rows. Styles must not change row
 // geometry, readability of dark headers, or selection/control behavior.
 const {server:s,storage:d,cloud:c,props:p,media:m,report:r,recording:g}=tokens;
 const raw='<style>body{margin:0;font:14px Arial;background:white}.DialogHeader{font-size:24px}.test{margin:12px;padding:16px}header{padding:12px}button{padding:10px} .row{height:40px;box-sizing:border-box;display:flex;align-items:center;gap:15px} .native-label{color:#dfe3e6}.dark{background:#242830} .DialogButton{background:#242830;color:white} .DialogButton:disabled{opacity:.35}</style>';
 const groups=`
 <section class="test ${s.ServerBrowserDialog}"><h1 class="DialogHeader" data-readable>Serverbrowser</h1><header class="${s.ServerListHeaderCtr}"><span class="${s.ServerListHeaderCell}" data-readable>Servername / Ping</span></header><div class="row ${s.ServerRow} ${s.SelectedRow}"><div class="${s.ServerRowContents}" data-readable>Beispielserver · 24 ms</div></div><button class="DialogButton Primary" onclick="document.body.dataset.server='connect'">Verbinden</button></section>
 <section class="test ${d.ContentManagement}"><header class="${d.LibraryHeader}"><span class="${d.DriveName}" data-readable>Bibliothek D:</span><span class="${d.Header}" data-readable>Speicher</span></header><div class="row ${d.AppBody} ${d.AppSelected}"><span class="${d.AppName}" data-readable>Beispielspiel</span><span class="${d.AppSize}" data-readable>12 GB</span></div><button class="DialogButton" disabled>Verschieben</button></section>
 <section class="test ${c.CloudConflictModalContent}"><h1 class="DialogHeader" data-readable>Cloud-Konflikt</h1><p class="${c.CloudConflictText}" data-readable>Wähle den gewünschten Spielstand.</p><div class="${c.DialogChoiceRow} ${c.Active}"><span class="${c.ConflictChoiceText}" data-readable>Lokaler Spielstand</span></div><p class="${c.CloudConflictWarning}" data-readable>Überprüfe die Uhrzeit der Spielstände.</p><button class="DialogButton Primary" onclick="document.body.dataset.cloud='selected'">Auswahl übernehmen</button></section>
 <section class="test ${p.AppProperties}"><header class="${p.DlcHeader}"><span class="${p.NameText}" data-readable>DLC-NAME</span></header><div class="${p.EvenRow}"><span class="${p.NameText}" data-readable>Beispielinhalt</span></div></section>
 <section class="test ${m.OverlayScreenshotManagerContainer}"><div class="dark ${m.FocusedContainer}"><span class="${m.Caption}" data-readable>Bildunterschrift</span></div></section>
 <section class="test ${g.GameRecordingDesktopDialog}"><header class="${g.Header}"><span class="${g.HeaderName}" data-readable>Aufnahmen</span></header></section>
 <section class="test ${r.SystemReportDialog}"><div class="${r.TextContainer}"><pre class="${r.Text}" data-readable>Systembericht · Beispieldaten</pre></div></section>
 <div id="outside" style="background:rgb(13,25,38);color:rgb(216,230,242)">Außerhalb nativer Fenster</div>`;
 await page.setContent(raw+groups);await page.addStyleTag({content:allCSS});
 await readable(page,'[data-readable]');
 assert.deepEqual(await page.locator('.row').evaluateAll(ns=>ns.map(n=>n.getBoundingClientRect().height)),[40,40]);
 await page.getByRole('button',{name:'Verbinden',exact:true}).click();assert.equal(await page.locator('body').getAttribute('data-server'),'connect');
 await page.getByRole('button',{name:'Auswahl übernehmen'}).click();assert.equal(await page.locator('body').getAttribute('data-cloud'),'selected');assert.equal(await page.getByRole('button',{name:'Verschieben'}).isDisabled(),true);
 assert.equal(await page.locator('#outside').evaluate(n=>getComputedStyle(n).backgroundColor),'rgb(13, 25, 38)');
 if(process.env.HYPERSHIFT_SCREENSHOTS){await page.setViewportSize({width:1000,height:1200});await page.screenshot({path:path.join(process.env.HYPERSHIFT_SCREENSHOTS,'windows-controls.png')})}
 assert.deepEqual(errors,[]);await browser.close();console.log('PASS: properties/settings tabs, contrast, controls, three popup sizes, native row geometry, storage/server/cloud/media/report panels');
})().catch(e=>{console.error(e);process.exit(1)});

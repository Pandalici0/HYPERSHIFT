/* HYPERSHIFT 1.6.4 — by pandalici0. Runtime library discovery; no bundled account data. */
(() => {
 'use strict';
/* Native detail geometry. Nodes stay under their original React parents. */
function createHypershiftDetails(){
 const C={"DesktopRoot":"_1_cYNJSvS6IXs9vLTEYjy5","Page":"_2iE-78WxX2Pj4GHbq7YJiA","Hero":"_2gZXhRmKUk68pA28-5ZmGQ","Scroll":"_2l416KfEtI4CL0mCUEmOBw","BackdropContainer":"_27RcNu8aXKBpYkHcNNrt-X","RightColumn":"_2aor4XVOYzN1PBSREk0UbO","Links":"DgVQapkBmhAW6oPY5rPZo","LinkText":"_2sNDjgK9EWiPLdNGkjun-w","InPage":"_1U7LKpx70kEsz3jJwAFOi-","StickyHeader":"_39RheXihcN6H2k2muQTjkI","GameStat":"_1kiZKVbDe-9Ikootk57kpA","Playtime":"_1aKegVl9_lSdNAyWYZQlr9","LastPlayedInfo":"_1nfJNsQjTOXSQQyFahGnRi","MiniAchievements":"UAhWiMg9Q2VPsQQBj_ikT","StatusAndStats":"_1YbtIWcfkQJOysLXQbwzRf","PlayButton":"_3ydigb6zZAjJ0JCDgHwSYA","ButtonText":"_33cnXIqTRgRr49_FNXIHj6","StatusInputTextArea":"_10oyYsgiC5Hvnoieb7sHLI","PostTextEntryArea":"_1JlC29Ic6L-QvL-39X_d-X"},tracked=new Map(),properties=new Map(),labels=new Map(),placeholders=new Map();
 let alive=true,frame;const watched=new Set(),resizer=typeof ResizeObserver==='undefined'?null:new ResizeObserver(measure);
 const q=(n,key)=>n?.querySelector('.'+C[key]);
 function mark(n,name,on=true){if(!n)return;if(!tracked.has(n))tracked.set(n,new Map());const changes=tracked.get(n);if(!changes.has(name))changes.set(name,n.classList.contains(name));if(n.classList.contains(name)!==on)n.classList.toggle(name,on);}
 function value(n,key,next){if(!properties.has(n))properties.set(n,new Map());const before=properties.get(n);if(!before.has(key))before.set(key,[n.style.getPropertyValue(key),n.style.getPropertyPriority(key)]);if(n.style.getPropertyValue(key)!==next)n.style.setProperty(key,next);}
 function measure(){
  if(!alive)return;
  for(const body of document.querySelectorAll('.hs-detail-body')){
   const layout=q(body,'BackdropContainer'),right=q(body,'RightColumn'),bar=body.querySelector('.'+C.InPage),stats=q(bar,'StatusAndStats');
   if(!layout||!right||!stats)continue;
   const a=layout.getBoundingClientRect(),b=right.getBoundingClientRect();
   value(layout,'--hs-stat-left',Math.round(b.left-a.left)+'px');value(layout,'--hs-stat-top',Math.round(b.top-a.top)+'px');value(layout,'--hs-stat-width',Math.round(b.width)+'px');
   value(layout,'--hs-stat-height',Math.ceil(stats.getBoundingClientRect().height)+'px');
  }
 }
 function refresh(){
  if(!alive)return;
  // AppDetailsOverviewPanel is the desktop root. AppDetailsRoot belongs to
  // the separate gamepad layout and must not receive this composition.
  for(const body of document.querySelectorAll('.'+C.DesktopRoot)){
   const page=body.closest('.'+C.Page),hero=q(page,'Hero'),layout=q(body,'BackdropContainer'),right=q(body,'RightColumn');
   const normal=body.querySelector('.'+C.InPage);
   if(!page||!hero||!layout||!right||!normal)continue;
   mark(page,'hs-details-page');mark(body,'hs-detail-body');mark(hero,'hs-detail-hero');
   for(const n of [page,right,q(normal,'StatusAndStats')])if(n&&resizer&&!watched.has(n)){watched.add(n);resizer.observe(n);}
   for(const stat of normal.querySelectorAll('.'+C.GameStat)){
    mark(stat,'hs-stat-playtime',!!q(stat,'Playtime')||stat.classList.contains(C.Playtime));
    mark(stat,'hs-stat-last',!!q(stat,'LastPlayedInfo'));
    mark(stat,'hs-stat-achievement',stat.classList.contains(C.MiniAchievements));
   }
   const status=q(normal,'StatusAndStats');
   mark(body,'hs-no-stats',!status?.textContent.trim());
   const play=q(normal,'PlayButton'),title=q(play,'ButtonText')?.textContent.trim().toLowerCase()||'';
   mark(play,'hs-action-play',/^(spielen|play|weiterspielen|resume)\b/.test(title));
   mark(play,'hs-action-stop',/^(stop|beenden|abbrechen|cancel)\b/.test(title));
   const input=q(body,'StatusInputTextArea')||q(body,'PostTextEntryArea');
   if(input){if(!placeholders.has(input))placeholders.set(input,input.getAttribute('placeholder'));if(input.getAttribute('placeholder')!=='Teile etwas über deinen nächsten Run …')input.setAttribute('placeholder','Teile etwas über deinen nächsten Run …');}
   const links=q(body,'Links');
   if(links&&!links.querySelector('.hs-detail-overview')){
    const button=document.createElement('button');button.className='hs-detail-overview hs-owned';button.type='button';button.textContent='ÜBERSICHT';
    button.onclick=()=>{const scroll=page.querySelector('.'+C.Scroll);if(scroll)scroll.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});};
    links.prepend(button);
   }
   for(const n of links?.querySelectorAll('.'+C.LinkText)||[]){
    const title=n.textContent.trim().toLowerCase(),short=({'shopseite':'SHOP','store page':'SHOP','communityhub':'COMMUNITY','community hub':'COMMUNITY','guides':'GUIDES','support':'SUPPORT','zusatzinhalte':'DLC','dlc':'DLC','diskussionen':'DISKUSSIONEN','discussions':'DISCUSSIONS','punkteshop':'PUNKTESHOP'})[title];
    if(short){if(!labels.has(n))labels.set(n,n.getAttribute('data-hs-label'));if(n.getAttribute('data-hs-label')!==short)n.setAttribute('data-hs-label',short);}
   }
  }
  for(const n of watched)if(!n.isConnected){resizer?.unobserve(n);watched.delete(n);}
  for(const [n,names]of tracked)if(!n.isConnected){for(const [name,before]of names)n.classList.toggle(name,before);tracked.delete(n);}
  for(const [n,names]of properties)if(!n.isConnected){for(const [name,[before,priority]]of names){if(before)n.style.setProperty(name,before,priority);else n.style.removeProperty(name);}properties.delete(n);}
  for(const [n,before]of labels)if(!n.isConnected){if(before===null)n.removeAttribute('data-hs-label');else n.setAttribute('data-hs-label',before);labels.delete(n);}
  for(const [n,before]of placeholders)if(!n.isConnected){if(before===null)n.removeAttribute('placeholder');else n.setAttribute('placeholder',before);placeholders.delete(n);}
  cancelAnimationFrame(frame);frame=requestAnimationFrame(measure);
 }
 return {refresh,measure,destroy(){alive=false;cancelAnimationFrame(frame);resizer?.disconnect();watched.clear();for(const [n,names]of tracked)for(const [name,before]of names)n.classList.toggle(name,before);for(const [n,names]of properties)for(const [name,[before,priority]]of names){if(before)n.style.setProperty(name,before,priority);else n.style.removeProperty(name);}for(const [n,before]of labels){if(before===null)n.removeAttribute('data-hs-label');else n.setAttribute('data-hs-label',before);}for(const [n,before]of placeholders){if(before===null)n.removeAttribute('placeholder');else n.setAttribute('placeholder',before);}document.querySelectorAll('.hs-detail-overview').forEach(n=>n.remove());tracked.clear();properties.clear();labels.clear();placeholders.clear();}};
}

 const detailTheme=createHypershiftDetails();
 const KEY='__hypershiftTheme',SHARED='__afterhoursDashboard';
 window[SHARED]?.destroy();window[KEY]?.destroy();
 // Library identities are discovered from the current Steam account at runtime.
 
 const ATLAS="__HYPERSHIFT_ATLAS__"; // Original HYPERSHIFT concept, unchanged.
 const imageURL=URL.createObjectURL(new Blob([Uint8Array.from(atob(ATLAS),c=>c.charCodeAt(0))],{type:'image/png'}));
 const root=document.documentElement,owned=new Set(),changedTabs=new Map(),hiddenChrome=new Set(),historyControls=new Map(),failedImages=new Set();
 const S={home:'._3Sb2o_mQ30IDRh0C72QUUu',scroll:'._2AUVZlzQq67qe3yhLZsPPB',card:'.WYgDg9NyCcMIVuMyZ_NBC',recent:'.biTV-8rS2M65imVHU15Nv',title:'._1tO8pfL08v-v_lzvm0fKH1, ._13fGPw2BaM5wWIahr2xNKt',row:'._2-O4ZG0KrnSrzISHBKctFQ',rowTitle:'._2SXJM0PeFEi3gbC7V3S5pE',play:'._3AjoLnMNKxYmNTGTJCLfgs._1_Bo2Ied5s2Od4YKYTOsau',blocked:'._1aml4h4CSJbtrNbX4brUYs',nativeSearch:'._9sPoVBFyE_vE87mnZJ5aB input',header:'._3Z7VQ1IMk4E3HsHvrkLNgo',controls:'._1-9sir4j_KQiMqdkZjQN0u',footer:'._3vCzSrrXZzZjVJFZNg9SGu',download:'._2EQ7ghgqIdjKv9jsQC0Zq9',friends:'._1TdaAqMFadi0UTqilrkelR'};
 const info={
  '1091500':{name:'Cyberpunk 2077',headline:'NIGHT CITY CALLS.',tags:['Open World','RPG','Sci-Fi','Einzelspieler']},
  '1245620':{name:'Elden Ring',headline:'RISE. EXPLORE. REPEAT.',tags:['Open World','RPG','Fantasy']},
  '1086940':{name:'Baldur’s Gate 3',headline:'YOUR CHOICES. YOUR WORLD.',tags:['RPG','Story','Koop','Fantasy']},
  '381210':{name:'Dead by Daylight',headline:'SURVIVE THE NIGHT.',tags:['Horror','Mehrspieler','Survival']},
  '730':{name:'Counter-Strike 2',headline:'EVERY ROUND COUNTS.',tags:['Taktik','Mehrspieler','Wettkampf']},
  '251570':{name:'7 Days to Die',headline:'BUILD. FIGHT. SURVIVE.',tags:['Survival','Crafting','Koop']}
 };
 let alive=true,observer,resizer,timer,host,panel,sidebar,footer,brand,search,returnButton,current,menu,pendingQuery='';
 let deckSignature='',sideSignature='',sidebarQuery='',inventoryTimer,inventorySignature='';
 const node=(tag,cls,label)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(label)n.textContent=label;return n;};
 const tidy=value=>String(value||'').replace(/\s+/g,' ').trim().slice(0,150);
 const normalized=value=>tidy(value).toLowerCase().replace(/[’‘]/g,"'").replace(/[™®]/g,'');
 const nameIds=new Map(),imageIds=new Map();
 let identitySignature='';
 const iconPaths={home:'<path d="M12 2 1 11h3v10h6v-6h4v6h6V11h3Z" fill="currentColor" stroke="none"/>',library:'<path d="M3 5h18M3 12h18M3 19h18" stroke-width="2.8"/>',search:'<circle cx="10" cy="10" r="7"/><path d="m15 15 7 7"/>',download:'<path d="M12 2v13m-5-5 5 5 5-5M4 17v5h16v-5"/>',friends:'<circle cx="9" cy="7" r="3"/><circle cx="18" cy="9" r="2"/><path d="M2 22v-4a7 7 0 0 1 14 0v4m0-9a5 5 0 0 1 6 5v4"/>',gear:'<path d="m9 2 6 0 1 4 4 1 2 5-3 3v4l-5 3-3-2-4 1-4-4 1-4-2-3 2-5 4-1Z"/><circle cx="12" cy="12" r="3"/>'};
 const icon=type=>{const n=node('span','hs-icon');n.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">${iconPaths[type]||iconPaths.search}</svg>`;return n;};
 const register=n=>{owned.add(n);return n;};
 const remove=n=>{if(n){owned.delete(n);n.remove();}};
 function appId(source){
  let s=String(source||'');try{s=decodeURIComponent(s);}catch{}
  return s.match(/\/(?:apps|steamapps|assets|librarycache)\/(\d+)(?:\/|_|\b)/)?.[1]||s.match(/[?&](?:appid|app_id|appId)=(\d+)\b/)?.[1]||s.match(/\/(\d+)_(?:library|header|icon)/)?.[1]||(s.match(/[a-f0-9]{40}/gi)||[]).map(h=>imageIds.get(h.toLowerCase())).find(Boolean);
 }
 function elementId(n){return n?.getAttribute('data-appid')||appId(n?.currentSrc||n?.getAttribute('src')||n?.style?.backgroundImage);}
 function describe(card,row=false){
  const image=card.querySelector('img[src*="library_capsule"],img[src*="library_600x900"],img');
  const source=image?.currentSrc||image?.getAttribute('src')||'';
  const label=tidy(card.querySelector(row?S.rowTitle:S.title)?.textContent);
  const id=elementId(card)||elementId(image)||[...card.querySelectorAll('[style]')].map(elementId).find(Boolean)||nameIds.get(normalized(label));
  const title=label||tidy(image?.alt)||tidy(card.getAttribute('aria-label'))||tidy(card.getAttribute('title'))||'Spiel öffnen';
  return {id,title,source,card,concept:false,recent:card.matches(S.recent)||!!card.closest(S.recent)};
 }
 function nativeGames(){
  const scope=document.querySelector(S.home)?.closest(S.scroll);if(!scope)return [];
  const cards=[...scope.querySelectorAll(S.card)].filter(n=>!n.closest('.hs-owned'));
  const games=cards.map(n=>describe(n)).sort((a,b)=>Number(b.recent)-Number(a.recent));
  const unique=new Map();
  for(const game of [...games,...[...document.querySelectorAll(S.row)].map(n=>describe(n,true))]){
   const key=game.id||game.source||game.title;if(!unique.has(key))unique.set(key,game);
  }
  return [...unique.values()];
 }
 function libraryApps(){
  const store=window.appStore;
  if(!store||store.m_bIsInitialized===false)return null;
  try{return Array.isArray(store.allApps)?store.allApps.filter(a=>a&&a.visible_in_game_list!==false&&(!window.collectionStore?.BIsVisible||window.collectionStore.BIsVisible(a))):null;}catch{return null;}
 }
 function indexLibrary(apps){
  if(apps===null)return;
  const signature=apps.map(a=>[a.appid,a.display_name,a.library_capsule_filename,a.icon_hash,a.rt_custom_image_mtime,a.local_cache_version].join('|')).join('\n');
  if(signature===identitySignature)return;identitySignature=signature;nameIds.clear();imageIds.clear();
  const duplicateNames=new Set(),duplicateHashes=new Set(),store=window.appStore;
  for(const app of apps){
   const id=String(app.appid),name=normalized(app.display_name);
   if(name){if(nameIds.has(name)&&nameIds.get(name)!==id)duplicateNames.add(name);else nameIds.set(name,id);}
   const sources=[app.library_capsule_filename,app.icon_hash];
   for(const method of ['GetVerticalCapsuleURLForApp','GetCachedVerticalCapsuleURL','GetCustomVerticalCapsuleURLs','GetIconURLForApp']){
    try{const value=store[method]?.(app);sources.push(...(Array.isArray(value)?value:[value]));}catch{}
   }
   for(const source of sources)for(const hash of String(source||'').match(/[a-f0-9]{40}/gi)||[]){
    const key=hash.toLowerCase();if(imageIds.has(key)&&imageIds.get(key)!==id)duplicateHashes.add(key);else imageIds.set(key,id);
   }
  }
  for(const name of duplicateNames)nameIds.delete(name);for(const hash of duplicateHashes)imageIds.delete(hash);
 }
 function games(){
  const apps=libraryApps();indexLibrary(apps);const native=nativeGames();if(apps===null)return native;
  // Steam's own inventory is authoritative. Image/name caches cannot add games.
  const rendered=new Map(native.filter(g=>g.id).map(g=>[String(g.id),g])),store=window.appStore;
  const result=apps.map(app=>{
   const id=String(app.appid),card=rendered.get(id);
   let source=card?.source||'',iconSource='';
   try{source=source||store.GetVerticalCapsuleURLForApp?.(app)||'';if(app.icon_hash||app.icon_data)iconSource=store.GetIconURLForApp?.(app)||'';}catch{}
   return {id,title:tidy(app.display_name)||card?.title||'Spiel öffnen',source,iconSource,card:card?.card,recent:card?.recent||false,lastPlayed:app.rt_last_time_played||0,concept:false};
  });
  const recentOrder=new Map(native.map((g,i)=>[String(g.id),i]));
  return result.sort((a,b)=>Number(b.recent)-Number(a.recent)||(a.recent&&b.recent?recentOrder.get(a.id)-recentOrder.get(b.id):0)||b.lastPlayed-a.lastPlayed||a.title.localeCompare(b.title,'de',{numeric:true,sensitivity:'base'}));
 }
 function playButton(game){
  const p=game?.card?.querySelector(S.play);return p&&!p.disabled&&p.getAttribute('aria-disabled')!=='true'&&!p.matches(S.blocked)?p:null;
 }
 function openGame(game,play=false){
  const fresh=games().find(g=>game?.id?g.id===game.id:g.card===game?.card);
  if(!fresh){refresh();return;}
  const button=play&&playButton(fresh);
  if(button)button.click();else if(fresh.card)fresh.card.click();
  else if(libraryApps()?.some(a=>String(a.appid)===fresh.id)&&/^\d+$/.test(fresh.id)){
   const link=node('a');link.href='steam://nav/games/details/'+fresh.id;link.hidden=true;document.body.append(link);link.click();link.remove();
  }
 }
 function applyQuery(value){
  pendingQuery=value;root.classList.add('hs-browse');
  const input=document.querySelector(S.nativeSearch);
  if(input){Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,value);input.dispatchEvent(new Event('input',{bubbles:true}));pendingQuery='';}
  if(search)search.querySelector('input').value=value;
 }
 function browse(){root.classList.add('hs-browse');document.querySelector(S.nativeSearch)?.focus();}
 function returnHome(){applyQuery('');root.classList.remove('hs-browse');if(host)host.scrollTop=0;}
 function resetSelection(){closeMenu();current=null;deckSignature=sideSignature='';returnHome();refresh();}
 function selectGame(game){closeMenu();current=game;root.classList.remove('hs-browse');if(host)host.scrollTop=0;update(games());}
 function closeMenu(){remove(menu);menu=null;document.querySelectorAll('.hs-menu-trigger[aria-expanded="true"]').forEach(n=>n.setAttribute('aria-expanded','false'));}
 function popup(anchor,items){
  if(menu){closeMenu();return;}menu=register(node('div','hs-popup hs-owned'));menu.setAttribute('role','menu');
  for(const [label,fn]of items){const b=node('button','',label);b.type='button';b.setAttribute('role','menuitem');b.onclick=()=>{closeMenu();fn();};menu.append(b);}
  menu.onkeydown=e=>{const items=[...menu.querySelectorAll('button')],at=items.indexOf(document.activeElement);if(e.key==='Escape'){e.preventDefault();closeMenu();anchor.focus();}else if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();items[e.key==='Home'?0:e.key==='End'?items.length-1:(at+(e.key==='ArrowDown'?1:-1)+items.length)%items.length].focus();}};
  document.body.append(menu);const r=anchor.getBoundingClientRect(),m=menu.getBoundingClientRect();
  menu.style.left=Math.max(8,Math.min(r.left,innerWidth-m.width-8))+'px';menu.style.top=(r.bottom+m.height+8>innerHeight-44?Math.max(8,r.top-m.height-8):r.bottom+8)+'px';
  anchor.setAttribute('aria-expanded','true');menu.firstChild?.focus();
 }
 function themeMenu(anchor){popup(anchor,[['Meine Spiele anzeigen',resetSelection],['Alle Spiele und Filter öffnen',browse],['Steam-Neuigkeiten ein-/ausblenden',()=>host?.classList.toggle('hs-hide-news')]]);}
 function createSearch(cls,top=false){
  const label=node('label',cls+' hs-owned');label.append(icon('search'));const input=node('input');input.type='search';input.placeholder=top?'Spiele, DLCs und mehr suchen …':'Alle Spiele durchsuchen …';input.setAttribute('aria-label','Steam-Bibliothek durchsuchen');input.addEventListener('input',()=>{if(top){applyQuery(input.value);input.focus();}else{sidebarQuery=input.value;updateSidebar(games());}});label.append(input);return label;
 }
 function mountChrome(){
  if(!document.querySelector(S.header))return;
  if(!brand?.isConnected){remove(brand);brand=register(node('div','hs-brand hs-owned'));brand.append(node('span','hs-wordmark','HYPERSHIFT'));document.querySelector(S.header).append(brand);}
  if(!search?.isConnected){remove(search);search=register(createSearch('hs-top-search',true));document.body.append(search);}
  const tabs=[...document.querySelectorAll('._3Z3ohQ8-1NKnCZkbS6fvy ._7AlhCx3XGzBeIrQaCneUD')];
  const compact=innerWidth<=1100,left=compact?[0,105,245]:[0,90,226],width=compact?[105,140,145]:[90,136,164];
  for(const [index,tab]of tabs.slice(0,3).entries()){
   if(!changedTabs.has(tab))changedTabs.set(tab,[tab.style.getPropertyValue('--hs-tab-left'),tab.style.getPropertyValue('--hs-tab-width')]);
   tab.style.setProperty('--hs-tab-left',compact?`${left[index]}px`:`calc(${left[index]} * var(--hs-u))`);tab.style.setProperty('--hs-tab-width',compact?`${width[index]}px`:`calc(${width[index]} * var(--hs-u))`);
  }
  // Steam's fourth profile tab has no configured position and otherwise overlaps Shop.
  for(const tab of tabs.slice(3)){if(!tab.classList.contains('hs-hide-chrome'))tab.classList.add('hs-hide-chrome');hiddenChrome.add(tab);}
  // Retain native SVGs and React click handlers. Only add keyboard semantics;
  // Steam owns the actual history and toggles Enabled/Disabled after navigation.
  const arrows=[...document.querySelectorAll('._3Z3ohQ8-1NKnCZkbS6fvy ._25lBLzuVeYAUG279up4xP8')].slice(0,2);
  for(const [index,arrow]of arrows.entries()){
   if(!historyControls.has(arrow)){
    const attrs=['role','tabindex','aria-label','aria-disabled','title'];
    const before=attrs.map(name=>[name,arrow.getAttribute(name)]);
    const key=e=>{if(!['Enter',' '].includes(e.key))return;e.preventDefault();if(arrow.classList.contains('_1LYTHQzcI1u6tcxbbcc5V3'))arrow.dispatchEvent(new MouseEvent('click',{bubbles:true}));};
    arrow.addEventListener('keydown',key);historyControls.set(arrow,{before,key});
    arrow.setAttribute('role','button');arrow.setAttribute('aria-label',index===0?'Zurück':'Vorwärts');arrow.setAttribute('title',index===0?'Zurück':'Vorwärts');
   }
   const disabled=arrow.classList.contains('_2cO0HdvLEGAdhosLekWsmo');
   if(arrow.getAttribute('aria-disabled')!==String(disabled))arrow.setAttribute('aria-disabled',String(disabled));
   if(arrow.getAttribute('tabindex')!==(disabled?'-1':'0'))arrow.setAttribute('tabindex',disabled?'-1':'0');
  }
  search.hidden=!document.querySelector(S.nativeSearch);
 }
 function measure(){
  if(!alive)return;const u=Math.min(innerWidth/1672,1.4);root.style.setProperty('--hs-u',u+'px');
  const h=document.querySelector(S.header)?.getBoundingClientRect().bottom||54*u;root.style.setProperty('--hs-header',h+'px');
  const footerHeight=document.querySelector(S.footer)?.getBoundingClientRect().height||Math.max(44,56*u);
  root.style.setProperty('--hs-footer',footerHeight+'px');root.style.setProperty('--hs-content-height',Math.max(380,host?.clientHeight||innerHeight-h-footerHeight)+'px');
  const control=document.querySelector(S.controls),tabs=[...document.querySelectorAll('._3Z3ohQ8-1NKnCZkbS6fvy ._7AlhCx3XGzBeIrQaCneUD')].slice(0,3);
  const right=(control?.getBoundingClientRect().left||innerWidth-320)-16;
  const navEnd=Math.max(0,...tabs.map(n=>n.getBoundingClientRect().right))+18;
  const width=Math.min(350*u,right-navEnd);root.classList.toggle('hs-search-tight',width<150||innerWidth<=1100);
  const left=Math.max(navEnd,Math.min(889*u,right-width));root.style.setProperty('--hs-search-left',left+'px');root.style.setProperty('--hs-search-width',Math.max(0,Math.min(width,right-left))+'px');
 }
 function mountSidebar(){
  sidebar=register(node('aside','hs-sidebar hs-owned'));sidebar.setAttribute('aria-label','HYPERSHIFT Bibliotheksnavigation');
  const home=node('button','hs-side-action hs-start','Startseite');home.prepend(icon('home'));home.onclick=returnHome;
  const library=node('div','hs-library-row');const action=node('button','hs-side-action','Bibliothek');action.prepend(icon('library'));action.onclick=browse;
  const settings=node('button','hs-settings hs-menu-trigger');settings.type='button';settings.setAttribute('aria-label','HYPERSHIFT Darstellung');settings.setAttribute('aria-haspopup','menu');settings.setAttribute('aria-expanded','false');settings.append(icon('gear'));settings.onclick=()=>themeMenu(settings);library.append(action,settings);
  const quick=node('details','hs-side-section hs-quick');quick.append(node('summary','hs-side-heading'),node('div','hs-quick-list'));
  const all=node('section','hs-side-section hs-all');all.append(node('h2','hs-side-heading','ALLE SPIELE'),node('div','hs-all-list'));
  sidebar.append(home,library,createSearch('hs-side-search'),quick,all);document.body.append(sidebar);
 }
 function favoriteIds(){
  if(libraryApps()!==null){const ids=new Set();for(const app of libraryApps())if(window.collectionStore?.BIsFavorite?.(app))ids.add(String(app.appid));return ids;}
  const ids=new Set();for(const row of document.querySelectorAll(S.row)){
   let group=row,match=false;
   while(group&&group!==document.body&&!match){for(let before=group.previousElementSibling;before;before=before.previousElementSibling){if(/^(FAVORITEN|FAVORITES)(?:\s|\(|\/|$)/i.test(tidy(before.textContent))){match=true;break;}}group=group.parentElement;}
   if(match){const id=describe(row,true).id;if(id)ids.add(id);}
  }return ids;
 }
 function updateSidebar(pool){
  if(!sidebar)return;
  const complete=libraryApps()!==null;sidebar.hidden=!complete;root.classList.toggle('hs-complete-library',complete);
  if(!complete)return; // Keep Steam's full native list visible until its store is ready.
  const favorites=favoriteIds(),actual=[...pool].sort((a,b)=>a.title.localeCompare(b.title,'de',{numeric:true,sensitivity:'base'}));
  const query=normalized(sidebarQuery),matches=g=>normalized(g.title).includes(query),quick=actual.filter(g=>favorites.has(g.id)),filtered=actual.filter(matches);
  const signature=actual.map(g=>g.id+'|'+g.title+'|'+g.iconSource).join('\n')+'\n'+query+'\n'+[...favorites].join(',');
  function selection(){for(const b of sidebar.querySelectorAll('.hs-side-game')){const value=String(b.dataset.appid===current?.id);if(b.getAttribute('aria-current')!==value)b.setAttribute('aria-current',value);}}
  if(signature===sideSignature){selection();return;}sideSignature=signature;
  sidebar.querySelector('.hs-quick summary').textContent=`FAVORITEN (${quick.length})`;
  sidebar.querySelector('.hs-quick').hidden=!quick.length;
  sidebar.querySelector('.hs-all h2').textContent=query?`ALLE SPIELE (${filtered.length} / ${actual.length})`:`ALLE SPIELE (${actual.length})`;
  function fill(selector,list){const target=sidebar.querySelector(selector),fragment=document.createDocumentFragment();for(const game of list){const b=node('button','hs-side-game');b.type='button';b.dataset.appid=game.id;b.setAttribute('aria-label',`${game.title} als Hauptspiel anzeigen`);b.title=game.title;const image=node('span','hs-side-cover');if(game.iconSource){const img=node('img');img.loading='lazy';img.decoding='async';img.alt='';img.src=game.iconSource;image.append(img);}b.append(image,node('span','hs-side-title',game.title));b.onclick=()=>selectGame(game);fragment.append(b);}target.replaceChildren(fragment);}
  fill('.hs-quick-list',quick.filter(matches));fill('.hs-all-list',filtered);selection();
  if(!filtered.length)sidebar.querySelector('.hs-all-list').append(node('p','hs-empty',query?'Keine passenden Spiele.':'Deine Bibliothek ist leer.'));
 }
 function mountFooter(){
  footer=document.querySelector(S.footer);
  footer?.classList.add('hs-live-footer');
 }
 function updateFooter(){
  // No proxies, synthetic click events or replacement status: Steam owns this bar.
  const native=document.querySelector(S.footer);
  if(native!==footer){footer?.classList.remove('hs-live-footer');footer=native;footer?.classList.add('hs-live-footer');}
  for(const q of footer?.querySelectorAll('._3wJnTtcTLEp0R7eQj_mK8Y')||[]){
   const idle=/^(?:Downloads verwalten|Manage downloads|Verwalten|Manage)$/i.test(tidy(q.textContent));
   if(q.classList.contains('hs-idle-queue')!==idle)q.classList.toggle('hs-idle-queue',idle);
  }
 }
 function mount(scroll){
  clearHome();host=scroll;host.classList.add('hs-mounted','hs-hide-news');root.classList.add('hs-home-active');
  panel=register(node('section','hs-home hs-owned'));panel.setAttribute('aria-label','HYPERSHIFT Bibliotheksstart');
  const feature=node('div','hs-feature');const art=node('div','hs-feature-art');art.setAttribute('role','img');
  const image=node('img','hs-feature-image');image.alt='';image.hidden=true;image.onerror=()=>{const src=image.getAttribute('src');if(src)failedImages.add(src);if(alive&&panel?.isConnected)update(games());};art.append(image);
  const copy=node('div','hs-feature-copy');const headline=node('div','hs-headline');headline.append(node('h1','hs-headline-text'));const title=node('p','hs-game-title');headline.append(title);
  const tags=node('div','hs-feature-tags');const actions=node('div','hs-feature-actions');
  const play=node('button','hs-play','ZUM SPIEL');play.type='button';play.onclick=()=>openGame(current,true);
  const more=node('button','hs-feature-more hs-menu-trigger','•••');more.type='button';more.setAttribute('aria-label','HYPERSHIFT Aktionen');more.setAttribute('aria-expanded','false');more.setAttribute('aria-haspopup','menu');more.onclick=()=>themeMenu(more);
  actions.append(play,more);copy.append(headline,tags,actions);
  const poster=node('aside','hs-poster');const graphic=node('div','hs-poster-graphic');graphic.setAttribute('role','img');graphic.setAttribute('aria-label','Night City 2077');graphic.append(node('span','hs-poster-fallback','NEXT\nLEVEL.'));
  poster.append(graphic,node('p','hs-poster-caption','NIGHT CITY\nSTILL DREAMS\nOF YOU.'));feature.append(art,copy,poster);
  const tiles=node('div','hs-tiles');tiles.setAttribute('aria-label','Weitere Spiele');panel.append(feature,tiles);scroll.prepend(panel);
  mountSidebar();mountFooter();returnButton=register(node('button','hs-return hs-owned','← ZURÜCK ZU HYPERSHIFT'));returnButton.type='button';returnButton.onclick=returnHome;document.body.append(returnButton);
  measure();resizer?.observe(host);
 }
 function cachedHero(game){
  const app=libraryApps()?.find(a=>String(a.appid)===game?.id);if(!app)return '';
  // Steam resolves hashed cache paths, custom art and parent-app fallbacks.
  // No persisted account inventory or machine-specific path is needed.
  try{
   const images=window.appDetailsStore?.GetHeroImages?.(app)?.rgHeroImages;
   const candidates=Array.isArray(images)?images:window.appStore?.GetCustomHeroImageURLs?.(app)||[];
   for(const candidate of candidates){
    const url=new URL(candidate,document.baseURI);
    if(['https:','http:'].includes(url.protocol)&&!failedImages.has(url.href))return url.href;
   }
  }catch{}
  return '';
 }
 function updateTiles(pool){
  const tileGames=pool.filter(g=>current?.id?g.id!==current.id:g.card!==current?.card).slice(0,5);
  const signature=tileGames.map(g=>g.id+'|'+g.title+'|'+g.source).join('\n');if(signature===deckSignature)return;deckSignature=signature;
  const grid=panel.querySelector('.hs-tiles');grid.replaceChildren();
  for(const game of tileGames){
   const card=node('article','hs-tile');card.dataset.appid=game.id||'';card.dataset.conceptArt=String(!!info[game.id]&&game.id!=='1091500');
   const open=node('button','hs-tile-open');open.type='button';open.setAttribute('aria-label',`${info[game.id]?.name||game.title} öffnen`);open.onclick=()=>openGame(game);
   const art=node('div','hs-tile-picture');if(game.source&&!info[game.id]){const img=node('img');img.src=game.source;img.alt='';card.dataset.hasArt='true';img.onerror=()=>{img.hidden=true;card.dataset.hasArt='false';};art.append(img);}
   const title=node('span','hs-tile-title',info[game.id]?.name||game.title);open.append(art,title);
   const bottom=node('div','hs-tile-bottom');const tags=node('div','hs-tile-tags');for(const label of info[game.id]?.tags?.slice(0,3)||[])tags.append(node('span','',label));
   const more=node('button','hs-tile-more hs-menu-trigger','•••');more.type='button';more.setAttribute('aria-label',`${info[game.id]?.name||game.title}: Aktionen`);more.setAttribute('aria-expanded','false');more.setAttribute('aria-haspopup','menu');more.onclick=()=>popup(more,[['Als Hauptspiel anzeigen',()=>selectGame(game)],['Spielseite öffnen',()=>openGame(game)]]);bottom.append(tags,more);card.append(open,bottom);grid.append(card);
  }
  grid.dataset.count=String(tileGames.length);if(!tileGames.length)grid.append(node('p','hs-empty','Weitere Spiele erscheinen, sobald Steam sie lädt.'));
 }
 function update(pool){
  if(!panel)return;const id=current?.id||'',data=info[id],cp=id==='1091500';panel.dataset.cyberpunk=String(cp);panel.dataset.appid=id;
  const title=data?.name||current?.title||'Deine Bibliothek';panel.querySelector('h1').textContent=data?.headline||title.toUpperCase();panel.querySelector('.hs-game-title').textContent=title;
  panel.querySelector('.hs-feature-art').setAttribute('aria-label',cp?'Cyberpunk: Night City, rote Samurai-Jacke':title);
  panel.querySelector('.hs-poster-caption').textContent=cp?'NIGHT CITY\nSTILL DREAMS\nOF YOU.':'DEINE SPIELE.\nDEIN NÄCHSTER\nRUN.';
  const tags=panel.querySelector('.hs-feature-tags');const labels=data?.tags||[];
  if(tags.textContent!==labels.join('')){tags.replaceChildren();for(const label of labels)tags.append(node('span','',label));}
  const play=playButton(current),button=panel.querySelector('.hs-play');button.textContent=play?'SPIELEN':'ZUM SPIEL';button.disabled=!current;button.setAttribute('aria-label',`${title}: ${play?'spielen':'Spielseite öffnen'}`);
  const image=panel.querySelector('.hs-feature-image');
  const source=[cachedHero(current),current?.source].find(s=>s&&!failedImages.has(s));
  if(!cp&&source){if(image.getAttribute('src')!==source){image.hidden=false;image.src=source;}}else{image.hidden=true;image.removeAttribute('src');}
  panel.querySelector('.hs-feature-art').dataset.hasImage=String(!image.hidden);
  updateTiles(pool);updateSidebar(pool);updateFooter();measure();
 }
 function clearHome(){
  closeMenu();if(host)resizer?.unobserve(host);host?.classList.remove('hs-mounted','hs-hide-news');
  for(const n of [panel,sidebar,returnButton])remove(n);panel=sidebar=returnButton=host=null;deckSignature=sideSignature='';sidebarQuery='';root.classList.remove('hs-home-active','hs-browse','hs-complete-library');
 }
 function refresh(){
  timer=undefined;if(!alive)return;mountChrome();updateFooter();detailTheme.refresh();
  const scroll=document.querySelector(S.home)?.closest(S.scroll);
  if(!scroll){clearHome();current=null;measure();return;}
  if(!panel?.isConnected||host!==scroll)mount(scroll);
  if(pendingQuery&&document.querySelector(S.nativeSearch))applyQuery(pendingQuery);
  const pool=games();current=pool.find(g=>current?.id?g.id===current.id:g.card===current?.card)||pool[0];update(pool);
 }
 function schedule(records){
  if(records&&Array.isArray(records)&&records.every(r=>(r.target.nodeType===1?r.target:r.target.parentElement)?.closest('.hs-owned')||r.type==='childList'&&[...r.addedNodes,...r.removedNodes].length&&[...r.addedNodes,...r.removedNodes].every(n=>n.nodeType===1&&n.matches?.('.hs-owned'))))return;
  if(alive&&timer===undefined)timer=setTimeout(refresh,180);
 }
 function outsideClick(e){if(menu&&!e.target.closest('.hs-popup,.hs-menu-trigger'))closeMenu();}
 function onResize(){mountChrome();detailTheme.refresh();measure();}
 function start(){
  root.style.setProperty('--hs-atlas',`url("${imageURL}")`);root.classList.add('hypershift-on');
  observer=new MutationObserver(schedule);observer.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class','src','alt','title','aria-label','aria-disabled','disabled','data-appid','aria-valuenow']});
  if(typeof ResizeObserver!=='undefined'){resizer=new ResizeObserver(measure);for(const selector of [S.header,S.controls,S.footer]){const n=document.querySelector(selector);if(n)resizer.observe(n);}}
  document.addEventListener('click',outsideClick);document.addEventListener('load',schedule,true);window.addEventListener('resize',onResize);refresh();
  inventoryTimer=setInterval(()=>{if(!alive||!host||document.hidden)return;const apps=libraryApps(),signature=apps===null?'pending':apps.map(a=>[a.appid,a.display_name,a.rt_last_time_played,!!window.collectionStore?.BIsFavorite?.(a)].join('|')).join('\n');if(signature!==inventorySignature){inventorySignature=signature;refresh();}},1500);
 }
 const api={destroy(){
  alive=false;detailTheme.destroy();observer?.disconnect();resizer?.disconnect();clearTimeout(timer);clearInterval(inventoryTimer);clearHome();
  footer?.classList.remove('hs-live-footer');for(const q of footer?.querySelectorAll('.hs-idle-queue')||[])q.classList.remove('hs-idle-queue');footer=null;
  for(const [tab,values]of changedTabs){for(const [i,name]of ['--hs-tab-left','--hs-tab-width'].entries()){if(values[i])tab.style.setProperty(name,values[i]);else tab.style.removeProperty(name);}}changedTabs.clear();
  for(const n of hiddenChrome)n.classList.remove('hs-hide-chrome');hiddenChrome.clear();for(const n of owned)n.remove();owned.clear();
  for(const [arrow,{before,key}]of historyControls){arrow.removeEventListener('keydown',key);for(const [name,value]of before){if(value===null)arrow.removeAttribute(name);else arrow.setAttribute(name,value);}}historyControls.clear();
  for(const name of ['--hs-u','--hs-atlas','--hs-header','--hs-footer','--hs-content-height','--hs-search-left','--hs-search-width'])root.style.removeProperty(name);
  root.classList.remove('hypershift-on','hs-home-active','hs-browse','hs-search-tight');URL.revokeObjectURL(imageURL);
  window.removeEventListener('resize',onResize);document.removeEventListener('click',outsideClick);document.removeEventListener('load',schedule,true);document.removeEventListener('DOMContentLoaded',start);
  if(window[KEY]===this)delete window[KEY];if(window[SHARED]===this)delete window[SHARED];
 }};window[KEY]=window[SHARED]=api;
 if(document.body)start();else document.addEventListener('DOMContentLoaded',start,{once:true});
})();

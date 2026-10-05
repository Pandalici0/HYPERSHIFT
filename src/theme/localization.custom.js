/* HYPERSHIFT language layer. Only presentation labels; no account/credential access. */
(() => {
 'use strict';
 if(window.__hypershiftI18n?.version==='__HYPERSHIFT_VERSION__'){window.__hypershiftI18n.refresh();return;}
 window.__hypershiftI18n?.destroy();
 const catalog=__HYPERSHIFT_LOCALES__,root=document.documentElement;
 const records=Object.values(catalog),byCode=new Map();
 for(const record of records){byCode.set(record.locale.toLowerCase(),record);byCode.set(record.steamLanguage,record);}
 for(const [alias,key]of Object.entries({'nb':'norwegian','nb-no':'norwegian','nn':'norwegian','zh':'schinese','zh-hans':'schinese','zh-sg':'schinese','zh-hant':'tchinese','zh-hk':'tchinese','ko-kr':'koreana','pt-pt':'portuguese','es-mx':'latam','es-ar':'latam','sc_schinese':'schinese'}))byCode.set(alias,catalog[key]);
 function resolve(value){const code=String(value||'').trim().replaceAll('_','-').toLowerCase();return byCode.get(code)||byCode.get(code.split('-')[0]);}
 let active=catalog.english,steamLanguage='',alive=true,queued=false;
 const configNodes=new Map(),beforeVars=new Map();
 const configMap={Bibliotheksstart:'conditionHome',Kopfzeile:'conditionHeader','Zwei Zeilen':'twoRows','HYPERSHIFT-Startseite oder native Steam-Startseite.':'conditionHomeDesc','Kantige Hauptnavigation oder eine zweite Zeile.':'conditionHeaderDesc'};
 const cssKeys=['downloads','friends','yourGame','nextLevel','login'];
 function t(key){return active.strings[key]??catalog.english.strings[key]??key;}
 function cssString(value){return JSON.stringify(value).replaceAll('\\n','\\A ');}
 function translateConfig(){
  if(!document.body)return;
  // Only exact theme-option labels are replaced. Keys/values in skin.json stay
  // stable so existing Millennium selections and native React actions survive.
  const context=document.body.textContent||'';
  if(!configNodes.size&&!Object.keys(configMap).some(label=>context.includes(label)))return;
  const configMode=context.includes('HYPERSHIFT')&&(context.includes('Bibliotheksstart')||context.includes(t('conditionHome')))&&(context.includes('Kopfzeile')||context.includes(t('conditionHeader')));
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  for(let node=walker.nextNode();node;node=walker.nextNode()){
   if(node.parentElement?.closest('script,style,textarea,input,.hs-owned'))continue;
   const value=node.nodeValue.trim();let key=configNodes.get(node)?.key||configMap[value];
   if(!key&&configMode&&['An','Aus'].includes(value))key=value==='An'?'on':'off';
   if(!key)continue;
   if(!configNodes.has(node))configNodes.set(node,{key,before:node.nodeValue});
   if(node.nodeValue!==t(key))node.nodeValue=t(key);
  }
  for(const node of configNodes.keys())if(!node.isConnected)configNodes.delete(node);
 }
 function refresh(){
  if(!alive)return;
  // Steam sets lang on desktop and popup roots. Its explicit client setting,
  // when available, takes precedence over the OS/browser language.
  const next=resolve(steamLanguage)||resolve(root.getAttribute('lang'))||resolve(window.g_rgConfig?.LANGUAGE)||resolve(window.g_strLanguage)||catalog.english;
  const changed=next!==active||root.getAttribute('data-hs-locale')!==next.locale;
  active=next;
  if(changed){
   root.setAttribute('data-hs-locale',active.locale);
   for(const key of cssKeys){const name='--hs-l10n-'+key;if(!beforeVars.has(name))beforeVars.set(name,root.style.getPropertyValue(name));root.style.setProperty(name,cssString(t(key)));}
   root.style.setProperty('--hs-l10n-loginBanner',cssString(t('nextLevel')+'\n'+t('posterOwn')));
   window.dispatchEvent(new CustomEvent('hypershift:languagechange'));
  }
  translateConfig();
 }
 function schedule(){if(!queued&&alive){queued=true;queueMicrotask(()=>{queued=false;refresh();});}}
 const attributes=new MutationObserver(()=>{steamLanguage='';schedule();});
 attributes.observe(root,{attributes:true,attributeFilter:['lang']});
 const configObserver=new MutationObserver(schedule);
 function start(){if(document.body){configObserver.observe(document.body,{childList:true,subtree:true,characterData:true});refresh();}}
 const api={version:'__HYPERSHIFT_VERSION__',t,resolve:value=>resolve(value)?.locale||'en',get locale(){return active.locale;},get steamLanguage(){return active.steamLanguage;},get direction(){return active.direction;},refresh,destroy(){alive=false;attributes.disconnect();configObserver.disconnect();for(const [node,{before}]of configNodes)if(node.isConnected)node.nodeValue=before;for(const [name,value]of beforeVars){if(value)root.style.setProperty(name,value);else root.style.removeProperty(name);}root.style.removeProperty('--hs-l10n-loginBanner');root.removeAttribute('data-hs-locale');document.removeEventListener('DOMContentLoaded',start);if(window.__hypershiftI18n===api)delete window.__hypershiftI18n;}};
 window.__hypershiftI18n=api;
 if(document.body)start();else document.addEventListener('DOMContentLoaded',start,{once:true});
 // Public presentation-only getter. Failure leaves Steam's lang in charge.
 try{Promise.resolve(window.SteamClient?.Settings?.GetCurrentLanguage?.()).then(value=>{if(alive&&resolve(value)){steamLanguage=value;refresh();}}).catch(()=>{});}catch{}
})();

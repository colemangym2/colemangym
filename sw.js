if(!self.define){let e,s={};const i=(i,n)=>(i=new URL(i+".js",n).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(n,r)=>{const o=e||("document"in self?document.currentScript.src:"")||location.href;if(s[o])return;let t={};const c=e=>i(e,o),l={module:{uri:o},exports:t,require:c};s[o]=Promise.all(n.map((e=>l[e]||c(e)))).then((e=>(r(...e),t)))}}define(["./workbox-7cfec069"],(function(e){"use strict";self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.precacheAndRoute([{url:"assets/index-B21rvxIf.css",revision:null},{url:"assets/index-Cmp9_fMq.js",revision:null},{url:"index.html",revision:"5e934d3e223b4a0d98f2168556ba895e"},{url:"registerSW.js",revision:"1872c500de691dce40960bb85481de07"},{url:"logo60x60.png",revision:"bc113d081c4ccad9facb5fbe710ebaa7"},{url:"logo192x192.png",revision:"b3ea277c498ce43e230f5f3080718b94"},{url:"logo512x512.png",revision:"0c8f138917bc4ac05e25de01b504f4b7"},{url:"manifest.webmanifest",revision:"5867a9b4a292f360130a1cef67cefb25"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));

if(!self.define){let e,s={};const i=(i,n)=>(i=new URL(i+".js",n).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(n,r)=>{const c=e||("document"in self?document.currentScript.src:"")||location.href;if(s[c])return;let o={};const t=e=>i(e,c),l={module:{uri:c},exports:o,require:t};s[c]=Promise.all(n.map((e=>l[e]||t(e)))).then((e=>(r(...e),o)))}}define(["./workbox-7cfec069"],(function(e){"use strict";self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.precacheAndRoute([{url:"assets/index-DBr0ZDB9.js",revision:null},{url:"assets/index-QGL-Gk6-.css",revision:null},{url:"index.html",revision:"b7ec919f79673c9bec13da5759cc1a88"},{url:"registerSW.js",revision:"2765ec95bef7b2fbf046becd6e91ef17"},{url:"logo60x60.png",revision:"bc113d081c4ccad9facb5fbe710ebaa7"},{url:"logo192x192.png",revision:"b3ea277c498ce43e230f5f3080718b94"},{url:"logo512x512.png",revision:"0c8f138917bc4ac05e25de01b504f4b7"},{url:"manifest.webmanifest",revision:"0ed1f6c3454432b64c2b3a00c20666b2"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));

import{ac as w,a as d,r as a,j as C,z as v,C as g}from"./index-C_-krNls.js";const y="https://zehnlyduo-production.up.railway.app",c=w.create({baseURL:y,headers:{"Content-Type":"application/json"},timeout:1e4});c.interceptors.request.use(e=>{const{accessToken:t}=d.getState().auth;return t&&(e.headers.Authorization=`Bearer ${t}`),e},e=>Promise.reject(e));c.interceptors.response.use(e=>e,e=>(e.response?.status===401&&d.getState().auth.reset(),Promise.reject(e)));const L={login:async e=>(await c.post("/admin/login",e)).data,logout:async()=>{try{await c.post("/admin/logout")}catch(e){console.warn("Logout endpoint not available:",e)}}};var b=["a","button","div","form","h2","h3","img","input","label","li","nav","ol","p","select","span","svg","ul"],$=b.reduce((e,t)=>{const r=v(`Primitive.${t}`),o=a.forwardRef((n,s)=>{const{asChild:u,...i}=n,p=u?r:t;return typeof window<"u"&&(window[Symbol.for("radix-ui")]=!0),C.jsx(p,{...i,ref:s})});return o.displayName=`Primitive.${t}`,{...e,[t]:o}},{});function k(e,t){e&&g.flushSync(()=>e.dispatchEvent(t))}/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),A=e=>e.replace(/^([A-Z])|[\s-_]+(\w)/g,(t,r,o)=>o?o.toUpperCase():r.toLowerCase()),l=e=>{const t=A(e);return t.charAt(0).toUpperCase()+t.slice(1)},m=(...e)=>e.filter((t,r,o)=>!!t&&t.trim()!==""&&o.indexOf(t)===r).join(" ").trim(),E=e=>{for(const t in e)if(t.startsWith("aria-")||t==="role"||t==="title")return!0};/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var P={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const S=a.forwardRef(({color:e="currentColor",size:t=24,strokeWidth:r=2,absoluteStrokeWidth:o,className:n="",children:s,iconNode:u,...i},p)=>a.createElement("svg",{ref:p,...P,width:t,height:t,stroke:e,strokeWidth:o?Number(r)*24/Number(t):r,className:m("lucide",n),...!s&&!E(i)&&{"aria-hidden":"true"},...i},[...u.map(([h,f])=>a.createElement(h,f)),...Array.isArray(s)?s:[s]]));/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const R=(e,t)=>{const r=a.forwardRef(({className:o,...n},s)=>a.createElement(S,{ref:s,iconNode:t,className:m(`lucide-${x(l(e))}`,`lucide-${e}`,o),...n}));return r.displayName=l(e),r};export{$ as P,L as a,c as b,R as c,k as d};

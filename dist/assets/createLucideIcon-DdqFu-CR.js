import{a9 as h,r as a,j as w,z as y,A as v}from"./index-C1dgz4Nm.js";const l=h.create({baseURL:"https://zehnlyduo-production.up.railway.app",headers:{"Content-Type":"application/json","X-Admin-Bypass":"zehnly_admin_bypass_2024"},timeout:1e4});l.interceptors.response.use(e=>e,e=>Promise.reject(e));const j={login:async e=>{try{return(await l.post("/admin/verify",e)).data}catch{return{success:!1}}},logout:async()=>Promise.resolve()};var C=["a","button","div","form","h2","h3","img","input","label","li","nav","ol","p","select","span","svg","ul"],L=C.reduce((e,t)=>{const r=y(`Primitive.${t}`),s=a.forwardRef((n,o)=>{const{asChild:c,...i}=n,p=c?r:t;return typeof window<"u"&&(window[Symbol.for("radix-ui")]=!0),w.jsx(p,{...i,ref:o})});return s.displayName=`Primitive.${t}`,{...e,[t]:s}},{});function $(e,t){e&&v.flushSync(()=>e.dispatchEvent(t))}/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),g=e=>e.replace(/^([A-Z])|[\s-_]+(\w)/g,(t,r,s)=>s?s.toUpperCase():r.toLowerCase()),u=e=>{const t=g(e);return t.charAt(0).toUpperCase()+t.slice(1)},m=(...e)=>e.filter((t,r,s)=>!!t&&t.trim()!==""&&s.indexOf(t)===r).join(" ").trim(),x=e=>{for(const t in e)if(t.startsWith("aria-")||t==="role"||t==="title")return!0};/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var A={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const E=a.forwardRef(({color:e="currentColor",size:t=24,strokeWidth:r=2,absoluteStrokeWidth:s,className:n="",children:o,iconNode:c,...i},p)=>a.createElement("svg",{ref:p,...A,width:t,height:t,stroke:e,strokeWidth:s?Number(r)*24/Number(t):r,className:m("lucide",n),...!o&&!x(i)&&{"aria-hidden":"true"},...i},[...c.map(([d,f])=>a.createElement(d,f)),...Array.isArray(o)?o:[o]]));/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=(e,t)=>{const r=a.forwardRef(({className:s,...n},o)=>a.createElement(E,{ref:o,iconNode:t,className:m(`lucide-${b(u(e))}`,`lucide-${e}`,s),...n}));return r.displayName=u(e),r};export{L as P,j as a,l as b,k as c,$ as d};

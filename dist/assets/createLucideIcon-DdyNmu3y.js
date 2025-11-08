import{a9 as h,r as a,j as w,C,m as v}from"./index-CIznyvT-.js";const l=h.create({baseURL:"https://zehnlyduo-production.up.railway.app",headers:{"Content-Type":"application/json",Authorization:"Bearer zehnly_admin_bypass_2024"},timeout:1e4});l.interceptors.response.use(e=>e,e=>Promise.reject(e));const j={login:async e=>{try{return(await l.post("/admin/verify",e)).data}catch{return{success:!1}}},logout:async()=>Promise.resolve()};var y=["a","button","div","form","h2","h3","img","input","label","li","nav","ol","p","select","span","svg","ul"],$=y.reduce((e,t)=>{const r=C(`Primitive.${t}`),o=a.forwardRef((i,s)=>{const{asChild:c,...n}=i,p=c?r:t;return typeof window<"u"&&(window[Symbol.for("radix-ui")]=!0),w.jsx(p,{...n,ref:s})});return o.displayName=`Primitive.${t}`,{...e,[t]:o}},{});function L(e,t){e&&v.flushSync(()=>e.dispatchEvent(t))}/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),g=e=>e.replace(/^([A-Z])|[\s-_]+(\w)/g,(t,r,o)=>o?o.toUpperCase():r.toLowerCase()),u=e=>{const t=g(e);return t.charAt(0).toUpperCase()+t.slice(1)},m=(...e)=>e.filter((t,r,o)=>!!t&&t.trim()!==""&&o.indexOf(t)===r).join(" ").trim(),x=e=>{for(const t in e)if(t.startsWith("aria-")||t==="role"||t==="title")return!0};/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var A={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const E=a.forwardRef(({color:e="currentColor",size:t=24,strokeWidth:r=2,absoluteStrokeWidth:o,className:i="",children:s,iconNode:c,...n},p)=>a.createElement("svg",{ref:p,...A,width:t,height:t,stroke:e,strokeWidth:o?Number(r)*24/Number(t):r,className:m("lucide",i),...!s&&!x(n)&&{"aria-hidden":"true"},...n},[...c.map(([d,f])=>a.createElement(d,f)),...Array.isArray(s)?s:[s]]));/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=(e,t)=>{const r=a.forwardRef(({className:o,...i},s)=>a.createElement(E,{ref:s,iconNode:t,className:m(`lucide-${b(u(e))}`,`lucide-${e}`,o),...i}));return r.displayName=u(e),r};export{$ as P,j as a,l as b,k as c,L as d};

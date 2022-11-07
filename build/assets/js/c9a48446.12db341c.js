"use strict";(self.webpackChunkmy_website=self.webpackChunkmy_website||[]).push([[246],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>d});var o=n(7294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,o)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,o,r=function(e,t){if(null==e)return{};var n,o,r={},i=Object.keys(e);for(o=0;o<i.length;o++)n=i[o],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(o=0;o<i.length;o++)n=i[o],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var s=o.createContext({}),c=function(e){var t=o.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):a(a({},t),e)),n},p=function(e){var t=c(e.components);return o.createElement(s.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return o.createElement(o.Fragment,{},t)}},m=o.forwardRef((function(e,t){var n=e.components,r=e.mdxType,i=e.originalType,s=e.parentName,p=l(e,["components","mdxType","originalType","parentName"]),m=c(n),d=r,f=m["".concat(s,".").concat(d)]||m[d]||u[d]||i;return n?o.createElement(f,a(a({ref:t},p),{},{components:n})):o.createElement(f,a({ref:t},p))}));function d(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=n.length,a=new Array(i);a[0]=m;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l.mdxType="string"==typeof e?e:r,a[1]=l;for(var c=2;c<i;c++)a[c]=n[c];return o.createElement.apply(null,a)}return o.createElement.apply(null,n)}m.displayName="MDXCreateElement"},8971:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>a,default:()=>u,frontMatter:()=>i,metadata:()=>l,toc:()=>c});var o=n(7462),r=(n(7294),n(3905));const i={title:"Using Capabilities to Decouple Non-Functional Requirements",image:"/img/train_coupling.jpg",date:new Date("2022-10-04T13:00:00.000Z"),author:"Kevin Hoffman",author_profile:"https://www.linkedin.com/in/%F0%9F%A6%80-kevin-hoffman-9252669/",description:"A look at the motivation and design behind loosely coupling services for actors",categories:["webassembly","wasmcloud","nfr","capabilities","design"],draft:!1},a=void 0,l={permalink:"/blog/balancing_nfr_coupling",source:"@site/blog/balancing_nfr_coupling.md",title:"Using Capabilities to Decouple Non-Functional Requirements",description:"A look at the motivation and design behind loosely coupling services for actors",date:"2022-10-04T13:00:00.000Z",formattedDate:"October 4, 2022",tags:[],readingTime:6.275,hasTruncateMarker:!0,authors:[{name:"Kevin Hoffman"}],frontMatter:{title:"Using Capabilities to Decouple Non-Functional Requirements",image:"/img/train_coupling.jpg",date:"2022-10-04T13:00:00.000Z",author:"Kevin Hoffman",author_profile:"https://www.linkedin.com/in/%F0%9F%A6%80-kevin-hoffman-9252669/",description:"A look at the motivation and design behind loosely coupling services for actors",categories:["webassembly","wasmcloud","nfr","capabilities","design"],draft:!1},prevItem:{title:"Globally Distributed WebAssembly Applications with wasmCloud and NATS",permalink:"/blog/globally_distributed_webassembly_applications_with_wasmcloud_and_nats"},nextItem:{title:"WebAssembly and the Road to Ubiquity",permalink:"/blog/road_to_ubiquity"}},s={authorsImageUrls:[void 0]},c=[],p={toc:c};function u(e){let{components:t,...i}=e;return(0,r.kt)("wrapper",(0,o.Z)({},p,i,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,(0,r.kt)("img",{alt:"train-coupling",src:n(1521).Z,width:"1014",height:"792"})),(0,r.kt)("p",null,"This post explores the motivation and design behind the loose coupling between our actors and capabilities."),(0,r.kt)("p",null,"Developers have a number of creeds to which we hold dear. Sometimes these show up as pattern and practice recommendations. Sometimes they appear in blog posts, conference talks, or streams. They can also appear indirectly via the code we write. One such creed is the tenet of ",(0,r.kt)("em",{parentName:"p"},"loose coupling"),". Everything needs to be loosely coupled, because we all known and preach that tight coupling is objectively bad. Everyone seems to know this, but we rarely stop to think about ",(0,r.kt)("em",{parentName:"p"},"why"),"."))}u.isMDXComponent=!0},1521:(e,t,n)=>{n.d(t,{Z:()=>o});const o=n.p+"assets/images/train_coupling-f0d5f6fec53363b0f7bba4d819a7a1c1.jpg"}}]);
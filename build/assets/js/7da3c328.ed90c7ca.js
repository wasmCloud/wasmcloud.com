"use strict";(self.webpackChunkmy_website=self.webpackChunkmy_website||[]).push([[643],{3905:(e,t,n)=>{n.d(t,{Zo:()=>c,kt:()=>h});var a=n(7294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},o=Object.keys(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var s=a.createContext({}),p=function(e){var t=a.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},c=function(e){var t=p(e.components);return a.createElement(s.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},m=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,o=e.originalType,s=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),m=p(n),h=r,d=m["".concat(s,".").concat(h)]||m[h]||u[h]||o;return n?a.createElement(d,i(i({ref:t},c),{},{components:n})):a.createElement(d,i({ref:t},c))}));function h(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=n.length,i=new Array(o);i[0]=m;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l.mdxType="string"==typeof e?e:r,i[1]=l;for(var p=2;p<o;p++)i[p]=n[p];return a.createElement.apply(null,i)}return a.createElement.apply(null,n)}m.displayName="MDXCreateElement"},5484:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>i,default:()=>u,frontMatter:()=>o,metadata:()=>l,toc:()=>p});var a=n(7462),r=(n(7294),n(3905));const o={title:"Building Portable, Scalable Components with TinyGo and wasmCloud",image:"/img/tinygo-logo.png",date:new Date("2022-06-01T13:00:00.000Z"),author:"Kevin Hoffman",author_profile:"https://www.linkedin.com/in/%F0%9F%A6%80-kevin-hoffman-9252669/",description:"A walkthrough of creating a TinyGo wasmCloud actor",categories:["tinygo","webassembly","wasmcloud","go","example"],draft:!1},i=void 0,l={permalink:"/blog/example_creating_webassembly_actor_in_go_with_tinygo",source:"@site/blog/example_creating_webassembly_actor_in_go_with_tinygo.md",title:"Building Portable, Scalable Components with TinyGo and wasmCloud",description:"A walkthrough of creating a TinyGo wasmCloud actor",date:"2022-06-01T13:00:00.000Z",formattedDate:"June 1, 2022",tags:[],readingTime:4.145,hasTruncateMarker:!0,authors:[{name:"Kevin Hoffman"}],frontMatter:{title:"Building Portable, Scalable Components with TinyGo and wasmCloud",image:"/img/tinygo-logo.png",date:"2022-06-01T13:00:00.000Z",author:"Kevin Hoffman",author_profile:"https://www.linkedin.com/in/%F0%9F%A6%80-kevin-hoffman-9252669/",description:"A walkthrough of creating a TinyGo wasmCloud actor",categories:["tinygo","webassembly","wasmcloud","go","example"],draft:!1},prevItem:{title:"WebAssembly Components and wasmCloud Actors: A Glimpse of the Future",permalink:"/blog/webassembly_components_and_wasmcloud_actors_a_glimpse_of_the_future"},nextItem:{title:"wasmCloud Capabilities are Managed Algebraic Effects for WebAssembly Functions",permalink:"/blog/caps_are_effects"}},s={authorsImageUrls:[void 0]},p=[],c={toc:p};function u(e){let{components:t,...o}=e;return(0,r.kt)("wrapper",(0,a.Z)({},c,o,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,(0,r.kt)("img",{alt:"tinygo-logo",src:n(2369).Z,width:"299",height:"255"})),(0,r.kt)("p",null,(0,r.kt)("em",{parentName:"p"},(0,r.kt)("a",{parentName:"em",href:"https://tinygo.org"},"TinyGo"))," is ",(0,r.kt)("em",{parentName:"p"},'"a Go compiler for small places"'),". It is a language designed specifically to work on embedded systems and WebAssembly. If you squint hard enough, you can almost imagine that WebAssembly is a form of embedded system (it's embedded in a host runtime)."),(0,r.kt)("p",null,'One of the core tenets of wasmCloud has always been that we embrace the specification without doing anything proprietary. In other words, anyone who knows the "',(0,r.kt)("u",null,(0,r.kt)("a",{parentName:"p",href:"https://wasmcloud.dev/reference/wasmbus/ffi/"},"wasmCloud ABI")),"\" can create actors in any language that compiles to freestanding WebAssembly. While this is technically true, it's certainly a lot easier when we have an easy SDK and code generation support for a language. Using our SDKs gives you a more friendly library while helping insulate your code from changes to the underlying WebAssembly spec."),(0,r.kt)("p",null,"The newest language in our arsenal is TinyGo."),(0,r.kt)("p",null,"To get started, you'll need ",(0,r.kt)("u",null,(0,r.kt)("a",{parentName:"p",href:"https://github.com/wasmcloud/wash"},"wash"))," version ",(0,r.kt)("inlineCode",{parentName:"p"},"0.11.0")," or newer."),(0,r.kt)("p",null,"Let's create a new empty actor from a template as follows:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-terminal"}," $ wash new actor\n? Select a project template: \u203a\n  hello: a hello-world actor (in Rust) that responds over an http connection\n\u276f echo-tinygo: a hello-world actor (in TinyGo) that responds over an http connection\n")),(0,r.kt)("p",null,"I'm going to call this new project ",(0,r.kt)("inlineCode",{parentName:"p"},"kvcounter")," because, for this blog post, we're going to build an actor that exposes a RESTful interface to a counter service."),(0,r.kt)("p",null,'This is the actor we get "out of the box":'),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-go"},'package main\n\nimport (\n    "github.com/wasmcloud/actor-tinygo"\n    "github.com/wasmcloud/interfaces/httpserver/tinygo"\n)\n\nfunc main() {\n    me := Kvcounter{}\n    actor.RegisterHandlers(httpserver.HttpServerHandler(&me))\n}\n\ntype Kvcounter struct{}\n\nfunc (e *Kvcounter) HandleRequest(\n    ctx *actor.Context,\n    req httpserver.HttpRequest)\n    (*httpserver.HttpResponse, error) {\n    r := httpserver.HttpResponse{\n        StatusCode: 200,\n        Header:     make(httpserver.HeaderMap, 0),\n        Body:       []byte("hello"),\n    }\n\n    return &r, nil\n}\n')),(0,r.kt)("p",null,"In the preceding code, the ",(0,r.kt)("inlineCode",{parentName:"p"},"RegisterHandlers")," function sets up the appropriate dispatch so that when the bound HTTP server capability provider receives a request, it knows to invoke this actor."),(0,r.kt)("p",null,"What we're going to do for this blog post is modify this web request handler so that it takes the name of a counter from the request, increments it using the key-value interface, and returns the new value in response."),(0,r.kt)("p",null,"First, let's add another provider interface to our imports by first running ",(0,r.kt)("inlineCode",{parentName:"p"},"go get")),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-terminal"},"go get github.com/wasmcloud/interfaces/keyvalue/tinygo\n")),(0,r.kt)("p",null,"This will modify our ",(0,r.kt)("inlineCode",{parentName:"p"},"go.mod")," file to contain the new interface. Now let's create a new version of the ",(0,r.kt)("inlineCode",{parentName:"p"},"HandleRequest")," function:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-go"},'func (e *Kvcounter) HandleRequest(\n    ctx *actor.Context,\n    req httpserver.HttpRequest) (*httpserver.HttpResponse, error) {\n\n    key := strings.Replace(req.Path, "/", "_", -1)\n\n    kv := keyvalue.NewProviderKeyValue()\n\n    count, err := kv.Increment(ctx, keyvalue.IncrementRequest{\n        Key: key, Value: 1,\n    })\n    if err != nil {\n        return InternalServerError(err), nil\n    }\n\n    res := "{\\"counter\\": " + strconv.Itoa(int(count)) + "}"\n\n    r := httpserver.HttpResponse{\n        StatusCode: 200,\n        Header:     make(httpserver.HeaderMap, 0),\n        Body:       []byte(res),\n    }\n    return &r, nil\n}\n\nfunc InternalServerError(err error) *httpserver.HttpResponse {\n    return &httpserver.HttpResponse{\n        StatusCode: 500,\n        Header:     make(httpserver.HeaderMap, 0),\n        Body:       []byte(err.Error()),\n    }\n}\n')),(0,r.kt)("p",null,"In this new function, we are converting the ",(0,r.kt)("inlineCode",{parentName:"p"},"Path")," from the request into a key that will then be used in an ",(0,r.kt)("inlineCode",{parentName:"p"},"Increment")," operation on the key-value store."),(0,r.kt)("p",null,'Something might look a little "off" in the code, and that\'s this line:'),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-go"},'res := "{\\"counter\\": \\"" + strconv.Itoa(int(count)) + "\\"}"\n')),(0,r.kt)("p",null,"This is something that we have to watch out for in TinyGo. If we use the stock JSON encoding/marshaling package, then TinyGo will use the following WebAssembly imports (shown in ",(0,r.kt)("inlineCode",{parentName:"p"},"wat"),"):"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre"},'(import "env" "runtime.ticks" (func $runtime.ticks (type 2)))\n(import "env" "syscall/js.valueGet" (func $syscall/js.valueGet (type 3)))\n(import "env" "syscall/js.valuePrepareString" (func $syscall/js.valuePrepareString (type 4)))\n(import "env" "syscall/js.valueLoadString" (func $syscall/js.valueLoadString (type 3)))\n(import "env" "syscall/js.finalizeRef" (func $syscall/js.finalizeRef (type 5)))\n')),(0,r.kt)("p",null,"To get the preceding output, I typically run the following command (though use could also use ",(0,r.kt)("inlineCode",{parentName:"p"},"wasm-objdump"),", too):"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-terminal"},"wasm2wat build/kvcounter_s.wasm| grep import\n")),(0,r.kt)("p",null,"The ",(0,r.kt)("inlineCode",{parentName:"p"},"wasm2wat")," binary is included in the ",(0,r.kt)("u",null,(0,r.kt)("a",{parentName:"p",href:"https://github.com/WebAssembly/wabt"},"wabt"))," toolkit."),(0,r.kt)("p",null,"There are still quite a few places in TinyGo where importing a certain package will trigger the use of the ",(0,r.kt)("inlineCode",{parentName:"p"},"syscall/js")," package. Once this package is imported, the host runtime will then ",(0,r.kt)("em",{parentName:"p"},"require")," the use of these JavaScript host shims and we then immediately lose all of our portability benefits."),(0,r.kt)("p",null,"TinyGo is rapidly plugging these holes and providing packages that don't require a JavaScript host runtime, but we still need to watch out for things like this. To keep this example simple rather than hunting for an alternative JSON encoder, we just created a string that contains valid JSON."),(0,r.kt)("p",null,"Now, just like any other wasmCloud actor, we can modify the ",(0,r.kt)("inlineCode",{parentName:"p"},"CLAIMS")," variable in the actor's ",(0,r.kt)("inlineCode",{parentName:"p"},"Makefile")," to contain both the HTTP server contract and the Key-Value contract:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre"},"CLAIMS   = --http_server --keyvalue\n")),(0,r.kt)("p",null,"With our new TinyGo actor in hand, we can start the actor, start two capability providers (HTTP and Key-Value), provide a link definition, and finally curl the running endpoint:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre"},'$ curl http://localhost:8080/bloggo\n{"counter": 1}\n$ curl http://localhost:8080/bloggo\n{"counter": 2}\n')),(0,r.kt)("p",null,"This is just the beginning of a really fun journey supporting TinyGo actors in wasmCloud!"),(0,r.kt)("p",null,"For a fully functioning version of this sample, you can take a look at it in our ",(0,r.kt)("u",null,(0,r.kt)("a",{parentName:"p",href:"https://github.com/wasmCloud/examples/tree/main/actor/kvcounter-tinygo"},"examples repository")),"."))}u.isMDXComponent=!0},2369:(e,t,n)=>{n.d(t,{Z:()=>a});const a=n.p+"assets/images/tinygo-logo-fb6e7765b8436ed594b214bbe0508fd5.png"}}]);
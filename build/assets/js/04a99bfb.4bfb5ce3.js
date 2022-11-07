"use strict";(self.webpackChunkmy_website=self.webpackChunkmy_website||[]).push([[5640],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>m});var a=n(7294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function i(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},o=Object.keys(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var s=a.createContext({}),c=function(e){var t=a.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},p=function(e){var t=c(e.components);return a.createElement(s.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},d=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,o=e.originalType,s=e.parentName,p=i(e,["components","mdxType","originalType","parentName"]),d=c(n),m=r,h=d["".concat(s,".").concat(m)]||d[m]||u[m]||o;return n?a.createElement(h,l(l({ref:t},p),{},{components:n})):a.createElement(h,l({ref:t},p))}));function m(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=n.length,l=new Array(o);l[0]=d;var i={};for(var s in t)hasOwnProperty.call(t,s)&&(i[s]=t[s]);i.originalType=e,i.mdxType="string"==typeof e?e:r,l[1]=i;for(var c=2;c<o;c++)l[c]=n[c];return a.createElement.apply(null,l)}return a.createElement.apply(null,n)}d.displayName="MDXCreateElement"},5162:(e,t,n)=>{n.d(t,{Z:()=>l});var a=n(7294),r=n(6010);const o="tabItem_Ymn6";function l(e){let{children:t,hidden:n,className:l}=e;return a.createElement("div",{role:"tabpanel",className:(0,r.Z)(o,l),hidden:n},t)}},5488:(e,t,n)=>{n.d(t,{Z:()=>m});var a=n(7462),r=n(7294),o=n(6010),l=n(2389),i=n(7392),s=n(7094),c=n(2466);const p="tabList__CuJ",u="tabItem_LNqP";function d(e){var t;const{lazy:n,block:l,defaultValue:d,values:m,groupId:h,className:f}=e,y=r.Children.map(e.children,(e=>{if((0,r.isValidElement)(e)&&"value"in e.props)return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)})),g=m??y.map((e=>{let{props:{value:t,label:n,attributes:a}}=e;return{value:t,label:n,attributes:a}})),b=(0,i.l)(g,((e,t)=>e.value===t.value));if(b.length>0)throw new Error(`Docusaurus error: Duplicate values "${b.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`);const k=null===d?d:d??(null==(t=y.find((e=>e.props.default)))?void 0:t.props.value)??y[0].props.value;if(null!==k&&!g.some((e=>e.value===k)))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${k}" but none of its children has the corresponding value. Available values are: ${g.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);const{tabGroupChoices:v,setTabGroupChoices:w}=(0,s.U)(),[N,T]=(0,r.useState)(k),C=[],{blockElementScrollPositionUntilNextRender:H}=(0,c.o5)();if(null!=h){const e=v[h];null!=e&&e!==N&&g.some((t=>t.value===e))&&T(e)}const j=e=>{const t=e.currentTarget,n=C.indexOf(t),a=g[n].value;a!==N&&(H(t),T(a),null!=h&&w(h,String(a)))},_=e=>{var t;let n=null;switch(e.key){case"Enter":j(e);break;case"ArrowRight":{const t=C.indexOf(e.currentTarget)+1;n=C[t]??C[0];break}case"ArrowLeft":{const t=C.indexOf(e.currentTarget)-1;n=C[t]??C[C.length-1];break}}null==(t=n)||t.focus()};return r.createElement("div",{className:(0,o.Z)("tabs-container",p)},r.createElement("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,o.Z)("tabs",{"tabs--block":l},f)},g.map((e=>{let{value:t,label:n,attributes:l}=e;return r.createElement("li",(0,a.Z)({role:"tab",tabIndex:N===t?0:-1,"aria-selected":N===t,key:t,ref:e=>C.push(e),onKeyDown:_,onClick:j},l,{className:(0,o.Z)("tabs__item",u,null==l?void 0:l.className,{"tabs__item--active":N===t})}),n??t)}))),n?(0,r.cloneElement)(y.filter((e=>e.props.value===N))[0],{className:"margin-top--md"}):r.createElement("div",{className:"margin-top--md"},y.map(((e,t)=>(0,r.cloneElement)(e,{key:t,hidden:e.props.value!==N})))))}function m(e){const t=(0,l.Z)();return r.createElement(d,(0,a.Z)({key:String(t)},e))}},4757:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>s,default:()=>m,frontMatter:()=>i,metadata:()=>c,toc:()=>u});var a=n(7462),r=(n(7294),n(3905)),o=n(5488),l=n(5162);const i={sidebar_position:0},s="Creating an Actor",c={unversionedId:"app-development/creating-an-actor",id:"app-development/creating-an-actor",title:"Creating an Actor",description:'Creating the scaffold for a new actor in Rust is easy. We will create an actor that accepts an HTTP request and responds with "Hello World". To create your new actor project, change to the directory where you want the project to be created, and enter the command below. The last term on the command hello is the project name. If you choose a different project name, the name of the subdirectory and some symbols in the generated code will be different from the example code in this guide.',source:"@site/docs/app-development/creating-an-actor.mdx",sourceDirName:"app-development",slug:"/app-development/creating-an-actor",permalink:"/docs/app-development/creating-an-actor",draft:!1,tags:[],version:"current",sidebarPosition:0,frontMatter:{sidebar_position:0},sidebar:"defaultSidebar",previous:{title:"App development",permalink:"/docs/category/app-development"}},p={},u=[{value:"Something&#39;s missing",id:"somethings-missing",level:3}],d={toc:u};function m(e){let{components:t,...n}=e;return(0,r.kt)("wrapper",(0,a.Z)({},d,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("h1",{id:"creating-an-actor"},"Creating an Actor"),(0,r.kt)(o.Z,{mdxType:"Tabs"},(0,r.kt)(l.Z,{value:"rust",label:"Rust",default:!0,mdxType:"TabItem"},(0,r.kt)("p",null,'Creating the scaffold for a new actor in Rust is easy. We will create an actor that accepts an HTTP request and responds with "Hello World". To create your new actor project, change to the directory where you want the project to be created, and enter the command below. The last term on the command ',(0,r.kt)("inlineCode",{parentName:"p"},"hello")," is the project name. If you choose a different project name, the name of the subdirectory and some symbols in the generated code will be different from the example code in this guide."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-shell"},"wash new actor hello --template-name hello\n")),(0,r.kt)("p",null,"Let's change into the newly-created folder ",(0,r.kt)("inlineCode",{parentName:"p"},"hello")," and take a look at the generated project. The file ",(0,r.kt)("inlineCode",{parentName:"p"},"src/lib.rs")," includes an imports section, a struct ",(0,r.kt)("inlineCode",{parentName:"p"},"HelloActor"),", and an ",(0,r.kt)("inlineCode",{parentName:"p"},"impl")," block that implements the ",(0,r.kt)("inlineCode",{parentName:"p"},"HttpServer")," trait for the actor struct. Let's walk through these sections in detail."),(0,r.kt)("p",null,"Note the two lines near the top of the source code file:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-rust"},"use wasmbus_rpc::actor::prelude::*;\nuse wasmcloud_interface_httpserver::{HttpRequest, HttpResponse, HttpServer, HttpServerReceiver};\n")),(0,r.kt)("p",null,"This shows us that we're using a core wasmCloud crate called ",(0,r.kt)("inlineCode",{parentName:"p"},"wasmbus_rpc")," and we've also declared a dependency on the ",(0,r.kt)("inlineCode",{parentName:"p"},"wasmcloud_interface_httpserver")," crate. By convention, all first-party wasmCloud interface crates begin with ",(0,r.kt)("inlineCode",{parentName:"p"},"wasmcloud_interface"),"."),(0,r.kt)("p",null,"Just below that, you'll see:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-rust"},"#[derive(Debug, Default, Actor, HealthResponder)]\n#[services(Actor, HttpServer)]\nstruct HelloActor {}\n")),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"HelloActor")," is the name of your actor - if you chose a different project name, the actor name will include your project name."),(0,r.kt)("p",null,"The two lines above the actor name invoke Rust macros that generate - at compile time - nearly all of the scaffolding needed to build an actor. The ",(0,r.kt)("inlineCode",{parentName:"p"},"HealthResponder")," term generates a function that automatically responds to health check queries from the wasmCloud host. The ",(0,r.kt)("inlineCode",{parentName:"p"},"#[services(...)]")," line declares the services ('traits', in Rust) that your actor implements, and generates message handling code for those interfaces. All actors implement the ",(0,r.kt)("inlineCode",{parentName:"p"},"Actor")," interface. The ",(0,r.kt)("inlineCode",{parentName:"p"},"HttpServer")," entry declares that the actor will also implement that interface, and requires an implementation of that trait's method: ",(0,r.kt)("inlineCode",{parentName:"p"},"handle_request"),"."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-rust"},'#[async_trait]\nimpl HttpServer for HelloActor {\n    /// Returns a greeting, "Hello World", in the response body.\n    /// If the request contains a query parameter \'name=NAME\', the\n    /// response is changed to "Hello NAME"\n    async fn handle_request(\n        &self,\n        _ctx: &Context,\n        req: &HttpRequest,\n    ) -> std::result::Result<HttpResponse, RpcError> {\n        let text=form_urlencoded::parse(req.query_string.as_bytes())\n            .find(|(n, _)| n == "name")\n            .map(|(_, v)| v.to_string())\n            .unwrap_or_else(|| "World".to_string());\n        Ok(HttpResponse {\n            body: format!("Hello {}", text).as_bytes().to_vec(),\n            ..Default::default()\n        })\n    }\n}\n')),(0,r.kt)("p",null,"Within the ",(0,r.kt)("inlineCode",{parentName:"p"},"handle_request")," method, the actor receives the HTTP request, and returns an HttpResponse, which is sent back to the http client (such as a ",(0,r.kt)("inlineCode",{parentName:"p"},"curl")," command or a web browser). We'll look into the details of that method, and customize it, shortly.")),(0,r.kt)(l.Z,{value:"tinygo",label:"TinyGo",default:!0,mdxType:"TabItem"},(0,r.kt)("p",null,"wasmCloud introduced support for generating a TinyGo project in wash ",(0,r.kt)("inlineCode",{parentName:"p"},"v0.11.0"),'. We will create an actor that accepts an HTTP request and responds with "Hello World". To create your new actor project, change to the directory where you want the project to be created, and enter the command below. The last term on the command ',(0,r.kt)("inlineCode",{parentName:"p"},"hello")," is the project name. If you choose a different project name, the name of the subdirectory and some symbols in the generated code will be different from the example code in this guide."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-shell"},"wash new actor hello --template-name echo-tinygo\n")),(0,r.kt)("p",null,"Let's change into the newly-created folder ",(0,r.kt)("inlineCode",{parentName:"p"},"hello")," and take a look at the generated project. The file ",(0,r.kt)("inlineCode",{parentName:"p"},"hello.go")," will include imports, a ",(0,r.kt)("inlineCode",{parentName:"p"},"main")," function, a ",(0,r.kt)("inlineCode",{parentName:"p"},"Hello")," struct, and an HTTP handler. Let's walk through these pieces in depth."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-go"},'import (\n    "github.com/wasmcloud/actor-tinygo"\n    "github.com/wasmcloud/interfaces/httpserver/tinygo"\n)\n')),(0,r.kt)("p",null,"This shows us that we're using a core wasmCloud package called ",(0,r.kt)("inlineCode",{parentName:"p"},"actor-tinygo")," and we've also declared a dependency on the ",(0,r.kt)("inlineCode",{parentName:"p"},"interfaces/httpserver/tinygo")," package. All first-party wasmCloud interface packages have this naming convention."),(0,r.kt)("p",null,"Just below that, you'll see:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-go"},"func main() {\n    me := Hello{}\n    actor.RegisterHandlers(httpserver.HttpServerHandler(&me), actor.ActorHandler(&me))\n}\ntype Hello struct{}\n")),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"Hello")," is the name of your actor - if you chose a different project name, the actor name will include your project name."),(0,r.kt)("p",null,"The purpose of the ",(0,r.kt)("inlineCode",{parentName:"p"},"main")," function in your TinyGo module is to use the wasmCloud actor library to register function handlers. In this case, our actor is making use of the ",(0,r.kt)("inlineCode",{parentName:"p"},"wasmcloud:httpserver")," capability to receive and handle HTTP requests and is registering the ",(0,r.kt)("inlineCode",{parentName:"p"},"HandleRequest")," function to do so."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-go"},'func (e *Hello) HandleRequest(ctx *actor.Context, req httpserver.HttpRequest) (*httpserver.HttpResponse, error) {\n    r := httpserver.HttpResponse{\n        StatusCode: 200,\n        Header:     make(httpserver.HeaderMap, 0),\n        Body:       []byte("hello"),\n    }\n    return &r, nil\n}\n')),(0,r.kt)("p",null,"Within the ",(0,r.kt)("inlineCode",{parentName:"p"},"HandleRequest")," method, the actor receives the HTTP request, and returns an HttpResponse with a body of ",(0,r.kt)("inlineCode",{parentName:"p"},"hello"),", which is sent back to the http client (such as a ",(0,r.kt)("inlineCode",{parentName:"p"},"curl")," command or a web browser). We'll look into the details of that method, and customize it, shortly."))),"If you use an IDE that comes with code completion and hover-tooltips, you'll be able to see documentation and get strongly-typed guidance as you develop code to interact with the wasmCloud interfaces.",(0,r.kt)("h3",{id:"somethings-missing"},"Something's missing"),(0,r.kt)("p",null,"Before we get into modifying the scaffolding to create the rest of this actor, take a look at what's ",(0,r.kt)("em",{parentName:"p"},"not")," included in this code. This code returns an abstraction of an HTTP response. It is ",(0,r.kt)("em",{parentName:"p"},"not")," tightly coupled to any particular HTTP server. Furthermore, you don't see the port number or server configuration options anywhere in the code. Finally, you can scale and compose this actor any way you see fit without ever having to recompile or redeploy it."),(0,r.kt)("p",null,(0,r.kt)("em",{parentName:"p"},"This is the way development was meant to be"),"."),(0,r.kt)("p",null,"Pure business logic, with all of your non-functional requirements handled through loosely coupled abstractions by runtime-configurable hosts. ",(0,r.kt)("em",{parentName:"p"},"No boilerplate, no fuss"),"."))}m.isMDXComponent=!0}}]);
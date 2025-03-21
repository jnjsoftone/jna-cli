#!/usr/bin/env node
"use strict";var e;let a,r,o;Object.defineProperty(exports,"__esModule",{value:!0});const t=(e=require("yargs"))&&e.__esModule?e:{default:e},i=require("jnu-abc"),s=require("./cli.js"),n="||",l=`${n}${n}`,p=`${n}${n}`,c=t.default.usage("Usage: -e <command> -r <required> -o <optional>").option("e",{alias:"exec",describe:"Execute Command",type:"string",demandOption:!0}).option("r",{alias:"requiredParameter",default:"",describe:"Required Parameter",type:"string"}).option("o",{alias:"optionalParameter",default:"{}",describe:"Optional Parameter",type:"string"}).option("s",{alias:"saveOption",default:"",describe:"Save file for result(return)",type:"string"}).parseSync(),d={exec:c.e,requiredParameter:c.r,optionalParameter:c.o,saveOption:c.s},u=(e,a,r=n)=>{let o=a.split(r);return e&&e.split(r).forEach((e,a)=>{e&&(o[a]=e)}),o},m=(e,a,r=n)=>u(e,a,r),g=(e,a,r=`options.json${n}json${n}1`,o=n)=>{let[t,s,l]=u(a,r,o);switch(console.log(`@@@saveOption: ${a}`),s){case"file":(0,i.saveFile)(t,e),l&&console.log(`${e}`);break;case"json":(0,i.saveJson)(t,e),l&&console.log(`${JSON.stringify(e)}`);break;case"sqlite":console.log(`saveSqlite: ${t}, ${e}`),l&&console.log(`${JSON.stringify(e)}`);break;case"":console.log(e?JSON.stringify(e):"작업이 완료되었습니다.");break;default:console.log(`지원하지 않는 저장 타입입니다: ${s}`)}};(async()=>{switch(d.exec){case"init":r=`repoName${n}jnjsoftone${n}node-simple${n}JnJ Utility For Development`,o=m(d.requiredParameter??"",r,n),g(a=await (0,s.initApp)({template:o[2],repoName:o[0],userName:o[1],description:o[3]}),d.saveOption??"",l);break;case"remove":r=`repoName${n}jnjsoftone`,o=m(d.requiredParameter??"",r,n),(0,s.removeApp)({repoName:o[0],userName:o[1]});break;case"zip":let[e,t]=m(d.requiredParameter??`"${n}node_modules/,package-lock.json,.next/"`,n);console.log(`@@@@ zipFolder: ${e}, zipExcluded: ${t}`),g(a=(0,s.zip)(e,t),d.saveOption??"",l);break;case"tree":(0,s.tree)(d.requiredParameter??""),g(a,d.saveOption??"",p);break;case"find":let[c,u]=m(d.requiredParameter??`"${n}"`,n);(0,i.findFiles)(c,u),g(a,d.saveOption??"",p);break;case"del":let[$,v]=m(d.requiredParameter??`"${n}node_modules/,package-lock.json,.git/.next/"`,n);g(a=(0,i.deleteFilesInFolder)($,v,!0)??"",d.saveOption??"",l);break;case"unzip":let[f,b]=m(d.requiredParameter??`"${n}node_modules/,package-lock.json,.git/.next/"`,n);g(a=(0,s.unzip)(f,b),d.saveOption??"",p);break;default:console.log("Invalid command")}})();
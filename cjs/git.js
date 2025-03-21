"use strict";var e;Object.defineProperty(exports,"__esModule",{value:!0}),!function(e,t){for(var o in t)Object.defineProperty(e,o,{enumerable:!0,get:t[o]})}(exports,{cloneRepo:function(){return p},copyRepo:function(){return f},createRemoteRepo:function(){return u},deleteRemoteRepo:function(){return m},findAllRepos:function(){return l},findGithubAccount:function(){return s},initLocalRepo:function(){return d},initRepo:function(){return $},makeRepo:function(){return R},pushRepo:function(){return h},removeRepo:function(){return b},setLocalConfig:function(){return g}});const t=(e=require("path"))&&e.__esModule?e:{default:e},o=require("child_process"),i=require("jnu-abc"),r=require("jnu-cloud"),n=require("./cli.js"),c=require("./env.js"),a=(e,t={})=>{let{wait:r=0,msg:n="",echo:c=!0}=t;c&&(n=n||e,console.log(`Command: ${n}`));try{(0,o.execSync)(e),(0,i.sleep)(r)}catch(e){console.log("EXEC Error: ",e)}},s=async(e,t="local")=>{if("local"===t)return(0,i.loadJson)(`${c.localEnvRoot}/Apis/github.json`)[e];if("github"===t){console.log(`### userName: ${e}  githubEnv: ${JSON.stringify(c.githubEnv)}`);let t=await (0,r.readJsonFromGithub)("Apis/github.json",c.githubEnv);return console.log(`### readJsonFromGithub: ${JSON.stringify(t)} res[userName]: ${t[e]}`),t[e]}},l=async e=>(await e.rest.repos.listForAuthenticatedUser({per_page:100,sort:"updated"})).data,u=(e,t)=>{console.log("####@@@@@ createRemoteRepo options: ",t);let{name:o,description:i,isPrivate:r}=t;return e.rest.repos.createForAuthenticatedUser({name:o,description:i,private:r,auto_init:!0})},m=(e,t,o)=>{let{name:i}=t;return console.log(`### deleteRemoteRepo: ${i}`),e.rest.repos.delete({owner:o.userName,repo:i})},g=(e,t,o)=>{let i=`cd ${o} && git config user.name "${t.fullName}"`;a(i+=` && git config user.email "${t.email}" && git remote set-url origin https://${t.token}@github.com/${t.userName}/${e.name}.git`)},d=async(e,t,o)=>{let{name:i}=e,{fullName:r,email:c,token:s,userName:l}=t;"win"!=n.PLATFORM&&a(`cd ${o} && chmod 777 -R ${o}`,{wait:1});let u="";a(`cd ${o} && git init && git config --global --add safe.directory ${o}`,{wait:1});try{a(`cd ${o} && git branch -m master main`,{wait:2})}catch(e){console.log("####@@@@@===== error: ",e)}a(`cd ${o} && git config user.name "${r}" && git config user.email "${c}" && git remote add origin https://${s}@github.com/${l}/${i}.git && git add . && git commit -m "Initial commit"`,{wait:10})},p=(e,o,i)=>{a(`cd ${t.default.dirname(i)} && git clone https://${o.token}@github.com/${o.userName}/${e.name}.git`)},$=(e,t,o,r)=>{let n=`xgit -e createRemoteRepo -u ${o.userName} -n ${t.name} -d "${t.description}" -p ${t.isPrivate}`;a(n,{wait:10,msg:`initRepo ${n}`}),p(t,o,r),(0,i.sleep)(5),g(t,o,r)},f=(e,t,o)=>{p(e,t,o),(0,i.sleep)(10),g(e,t,o)},h=(e,t,i)=>{if((0,o.execSync)(`cd ${i} && git status --porcelain`,{encoding:"utf8"}).length>0){let e=`cd ${i} && git add . && git commit -m "Initial commit"`;a(e,{msg:`pushRepo ${e}`})}let r=(0,o.execSync)(`cd ${i} && git branch`);console.log(`#### pushRepo branches: ${r}`),r.includes("main")?a(`cd ${i} && git push -u origin main --force`):r.includes("master")?a(`cd ${i} && git push -u origin master --force`):console.log("main 또는 master 브랜치가 없습니다.")},R=(e,t,o,r)=>{console.log("####@@@@@===== makeRepo options: ",JSON.stringify(t)),a(`xgit -e createRemoteRepo -u ${o.userName} -n ${t.name} -d "${t.description}" -p ${t.isPrivate}`,{wait:10}),console.log(`=================== initLocalRepo: ${r}`),d(t,o,r),(0,i.sleep)(15),console.log(`=================== pushRepo: ${r}`),h(t,o,r)},b=(e,o,r,c)=>{m(e,o,r),(0,i.sleep)(10);let{name:s}=o;if("win"===n.PLATFORM)try{let e=`cd ${t.default.dirname(c)}`;a(e);let o=`rmdir /s /q ${s}`;a(o)}catch(e){console.error("Failed to remove directory:",e);try{let e=`rd /s /q "${c}"`;a(e)}catch(e){console.error("Alternative removal also failed:",e)}}else a(`cd ${t.default.dirname(c)} && rm -rf ${s}`)};
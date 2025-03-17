import e from"path";import{execSync as o}from"child_process";import{sleep as t,loadJson as i}from"jnu-abc";import{readJsonFromGithub as r}from"jnu-cloud";import{PLATFORM as n}from"./cli.js";import{githubEnv as l,localEnvRoot as c}from"./env.js";let s=async(e,o="local")=>{if("local"===o)return i(`${c}/Apis/github.json`)[e];if("github"===o){console.log(`### userName: ${e}  githubEnv: ${JSON.stringify(l)}`);let o=await r("Apis/github.json",l);return console.log(`### readJsonFromGithub: ${JSON.stringify(o)} res[userName]: ${o[e]}`),o[e]}},a=async e=>(await e.rest.repos.listForAuthenticatedUser({per_page:100,sort:"updated"})).data,m=(e,o)=>{console.log("####@@@@@ createRemoteRepo options: ",o);let{name:t,description:i,isPrivate:r}=o;return e.rest.repos.createForAuthenticatedUser({name:t,description:i,private:r,auto_init:!0})},g=(e,o,t)=>{let{name:i}=o;return console.log(`### deleteRemoteRepo: ${i}`),e.rest.repos.delete({owner:t.userName,repo:i})},p=(e,t,i)=>{let r=`cd ${i} && git config user.name "${t.fullName}"`;console.log(r+=` && git config user.email "${t.email}" && git remote set-url origin https://${t.token}@github.com/${t.userName}/${e.name}.git`),o(r)},d=async(e,i,r)=>{let{name:n}=e,{fullName:l,email:c,token:s,userName:a}=i,m=`cd ${r} && chmod 777 -R ${r} && git init && git config --global --add safe.directory ${r}`;console.log(m),o(m),t(5);try{m=`cd ${r} && git branch -m master main`,console.log(m),o(m)}catch(e){console.log("####@@@@@===== error: ",e)}t(2),console.log(m=`cd ${r} && git config user.name "${l}" && git config user.email "${c}" && git remote add origin https://${s}@github.com/${a}/${n}.git && git add . && git commit -m "Initial commit"`),o(m)},$=(t,i,r)=>{let n=`cd ${e.dirname(r)} && git clone https://${i.token}@github.com/${i.userName}/${t.name}.git`;console.log(n),o(n)},u=(e,i,r,n)=>{let l=`xgit -e createRemoteRepo -u ${r.userName} -n ${i.name} -d "${i.description}" -p ${i.isPrivate}`;console.log(`initRepo cmd: ${l}`),o(l),t(10),$(i,r,n),t(5),p(i,r,n)},h=(e,o,i)=>{$(e,o,i),t(10),p(e,o,i)},f=(e,t,i)=>{if(o(`cd ${i} && git status --porcelain`,{encoding:"utf8"}).length>0){let e=`cd ${i} && git add . && git commit -m "Initial commit"`;console.log("#### ",e),o(e)}let r=o(`cd ${i} && git branch`);console.log(`#### pushRepo branches: ${r}`),r.includes("main")?o(`cd ${i} && git push -u origin main --force`):r.includes("master")?o(`cd ${i} && git push -u origin master --force`):console.log("main 또는 master 브랜치가 없습니다.")},R=(e,i,r,n)=>{console.log("####@@@@@===== makeRepo options: ",JSON.stringify(i));let l=`xgit -e createRemoteRepo -u ${r.userName} -n ${i.name} -d "${i.description}" -p ${i.isPrivate}`;console.log(`initRepo cmd: ${l}`),o(l),t(10),console.log(`=================== initLocalRepo: ${n}`),d(i,r,n),t(15),console.log(`=================== pushRepo: ${n}`),f(i,r,n)},b=(i,r,l,c)=>{g(i,r,l),t(10);let{name:s}=r;if("win"===n)try{let t=`cd ${e.dirname(c)}`;console.log(t),o(t);let i=`rmdir /s /q ${s}`;console.log(i),o(i)}catch(e){console.error("Failed to remove directory:",e);try{let e=`rd /s /q "${c}"`;console.log("Trying alternative command:",e),o(e)}catch(e){console.error("Alternative removal also failed:",e)}}else{let t=`cd ${e.dirname(c)} && rm -rf ${s}`;console.log(t),o(t)}};export{s as findGithubAccount,a as findAllRepos,m as createRemoteRepo,g as deleteRemoteRepo,$ as cloneRepo,p as setLocalConfig,d as initLocalRepo,u as initRepo,h as copyRepo,f as pushRepo,R as makeRepo,b as removeRepo};
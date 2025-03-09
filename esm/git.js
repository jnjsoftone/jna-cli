import e from"path";import{execSync as o}from"child_process";import{sleep as t,loadJson as i}from"jnu-abc";import{readJsonFromGithub as r}from"jnu-cloud";import{PLATFORM as n}from"./cli.js";let l=(e,o="local",t={})=>{if("local"===o){let o=process.env.DEV_ROOT?`${process.env.DEV_ROOT}/jd-environments`:"C:/JnJ/Developments/jd-environments";return i(`${o}/Apis/github.json`)[e]}if("github"===o)return r("Apis/github.json",{owner:process.env.ENV_GIT_OWNER||"",repo:process.env.ENV_GIT_REPO||"",token:process.env.ENV_GIT_TOKEN||""})},s=async e=>(await e.rest.repos.listForAuthenticatedUser({per_page:100,sort:"updated"})).data,c=(e,o)=>{console.log("####@@@@@ createRemoteRepo options: ",o);let{name:t,description:i,isPrivate:r}=o;return e.rest.repos.createForAuthenticatedUser({name:t,description:i,private:r,auto_init:!0})},a=(e,o,t)=>{let{name:i}=o;return console.log(`### deleteRemoteRepo: ${i}`),e.rest.repos.delete({owner:t.userName,repo:i})},m=(e,t,i)=>{let r=`cd ${i} && git config user.name "${t.fullName}"`;console.log(r+=` && git config user.email "${t.email}" && git remote set-url origin https://${t.token}@github.com/${t.userName}/${e.name}.git`),o(r)},p=(e,t,i)=>{let{name:r}=e,{fullName:n,email:l,token:s,userName:c}=t,a=`cd ${i} && git init`;o(a);try{a="git branch -m master main",o(a)}catch(e){console.log("####@@@@@===== error: ",e)}console.log(a=`git config user.name "${n}" && git config user.email "${l}" && git remote add origin https://${s}@github.com/${c}/${r}.git && git add . && git commit -m "Initial commit"`),o(a)},g=(t,i,r)=>{let n=`cd ${e.dirname(r)} && git clone https://${i.token}@github.com/${i.userName}/${t.name}.git`;console.log(n),o(n)},d=(e,i,r,n)=>{let l=`xgit -e createRemoteRepo -u ${r.userName} -n ${i.name} -d "${i.description}" -p ${i.isPrivate}`;console.log(`initRepo cmd: ${l}`),o(l),t(10),g(i,r,n),t(5),m(i,r,n)},u=(e,o,i)=>{g(e,o,i),t(10),m(e,o,i)},$=(e,t,i)=>{if(o(`cd ${i}`),o("git status --porcelain",{encoding:"utf8"}).length>0){let e='git add . && git commit -m "Initial commit"';console.log("#### ",e),o(e)}let r=o("git branch");console.log(`#### pushRepo branches: ${r}`),r.includes("main")?o("git push -u origin main --force"):r.includes("master")?o("git push -u origin master --force"):console.log("main 또는 master 브랜치가 없습니다.")},R=(e,i,r,n)=>{console.log("####@@@@@===== makeRepo options: ",JSON.stringify(i));let l=`xgit -e createRemoteRepo -u ${r.userName} -n ${i.name} -d "${i.description}" -p ${i.isPrivate}`;console.log(`initRepo cmd: ${l}`),o(l),t(15),console.log(`=================== initLocalRepo: ${n}`),p(i,r,n),t(5),console.log(`=================== pushRepo: ${n}`),$(i,r,n)},h=(i,r,l,s)=>{a(i,r,l),t(10);let{name:c}=r;if("win"===n)try{let t=`cd ${e.dirname(s)}`;console.log(t),o(t);let i=`rmdir /s /q ${c}`;console.log(i),o(i)}catch(e){console.error("Failed to remove directory:",e);try{let e=`rd /s /q "${s}"`;console.log("Trying alternative command:",e),o(e)}catch(e){console.error("Alternative removal also failed:",e)}}else{let t=`cd ${e.dirname(s)} && rm -rf ${c}`;console.log(t),o(t)}};export{l as findGithubAccount,s as findAllRepos,c as createRemoteRepo,a as deleteRemoteRepo,g as cloneRepo,m as setLocalConfig,p as initLocalRepo,d as initRepo,u as copyRepo,$ as pushRepo,R as makeRepo,h as removeRepo};
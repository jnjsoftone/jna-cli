import{execSync as e}from"child_process";import o from"path";import{copyFolderToLocal as t}from"jnu-cloud";import{PLATFORM as r,makeDir as i,saveFile as n,loadEnv as s,findFiles as l,findFolders as c,deleteFilesInFolder as p,substituteInFile as a}from"jnu-abc";import{findGithubAccount as m}from"./git.js";import{githubEnv as d}from"./env.js";import $ from"fs";let u={encoding:"utf8",shell:"win32"===process.platform?"cmd.exe":"/bin/sh"},f=()=>"win"===r?(e("chcp 65001>nul",{shell:"cmd.exe"}),e("cd",u).toString().trim().replace(/\\/g,"/")):e("pwd",u).toString().trim(),h=()=>"win"===r?(e("chcp 65001>nul",{shell:"cmd.exe"}),o.dirname(e("cd",u).toString().trim().replace(/\\/g,"/"))):o.dirname(e("pwd",u).toString().trim()),g=e=>e.endsWith("/")?"*/"+e+"*":"*/"+e,w=(e,o,t)=>{let r=s(`${e}/.env.${o}`);if(r){let i=Object.entries(r).map(([e,o])=>({[`{{${e}}}`]:String(o)})).reduce((e,o)=>({...e,...o}),{});a(`${e}/${"win"===o?"publish.bat":"publish.sh"}`,{...t,...i})}},x=o=>{let t=e(o,{encoding:"utf8"});return t?t.toString().trim():""},b=e=>{let o=[];return e.forEach(e=>o.push(x(e))),o},_=async(o,i=r,n="github")=>{let{template:s,repoName:l,userName:c,description:p}=o,{fullName:$,email:g}=await m(c??""),x=h(),b=f(),_="";if("github"===n)console.log(`### Copy from Github to Local: Templates/${s} => ${l}`),await t(`Templates/${s}`,l,d);else if("local"===n){let o=process.env.DEV_ROOT?`${process.env.DEV_ROOT}/jd-environments/Templates`:"C:/JnJ/Developments/jd-environments/Templates";"win"===i?e(_=`xcopy "${o}\\${s}" "${l}\\" /E /I /H /Y`,u):e(_=`cp -r ${o}/${s} ${l}`,u)}let j=[`${l}/package.json`,`${l}/README.md`,`${l}/docs/workflow.md`,`${l}/manifest.json`,`${l}/publish.sh`,`${l}/publish.bat`],y={"{{name}}":l??"","{{project-name}}":l??"","{{author}}":`${$} <${g}>`,"{{github-id}}":c??"","{{description}}":p||"","{{parent-dir}}":x,"{{current-dir}}":b};for(let e of j)a(e,y);if(!s.includes("simple"))for(let e of["win","mac"])w(l,e,y);return console.log(_=`cd ${b}/${l} && npm install`),e(_,u),console.log(_=`cd ${b}/${l} && xgit -e makeRepo -u ${c} -n ${l} -d "${p}"`),e(_,u),o},j=o=>(e(`xgit -e deleteRemoteRepo -u ${o.userName} -n ${o.repoName}`,u),"win"===r?e(`rmdir /s /q ${o.repoName}`,u):e(`rm -rf ${o.repoName}`,u),o),y=async e=>{let{template:o,repoName:t,userName:r,description:i}=e;switch(o){case"node-simple":case"python-pipenv":break;case"ts-swc-npm":case"ts-swc-simple":case"ts-webpack-obsidianPlugin":await _(e)}return e},v=(t,i)=>{try{let n=o.resolve(t),s=o.basename(n),l=o.dirname(n),c=process.cwd();if("win"===r)try{process.chdir(l);let o=`${s}_temp`;for(let t of(e(`xcopy "${s}" "${o}\\" /E /I /H /Y`,u),i?i.split(","):["node_modules","package-lock.json","package.json"])){let r=`${o}/${t}`;try{t.includes("/")?e(`rmdir /s /q "${r}"`,u):e(`del /q "${r}"`,u)}catch(e){console.log(`Warning: Could not remove ${t}`)}}e(`powershell -Command "Compress-Archive -Path '${o}/*' -DestinationPath '${s}.zip' -Force"`,u),e(`rmdir /s /q "${o}"`,u)}catch(e){throw console.error("Error during zip operation:",e),e}finally{process.chdir(c)}else try{process.chdir(l);let o=i?i.split(",").map(e=>`"${g(e)}"`).join(" "):'"*/node_modules/*" ".git/*"';e(`zip -r "${s}.zip" "${s}" -x ${o}`,u)}finally{process.chdir(c)}return{folderPath:t,excluded:i}}catch(e){throw console.error("Error in zip function:",e),e}},E=(t,r="__MACOSX/,node_modules/,.DS_Store,.git/")=>{let n=f(),s=[];for(let p of l(t,"*.zip"))try{let t;let l=`${n}/_unzip/${o.parse(p).name}`;if(console.log(`## extractPath: ${l}`),i(l),"win32"===process.platform)for(let i of(t=`powershell -command "Expand-Archive -Path '${p}' -DestinationPath '${l}' -Force"`,r.split(",").map(e=>e.trim()))){let t=o.join(l,i.replace("/",""));i.endsWith("/")?e(`if exist "${t}" rmdir /s /q "${t}"`,u):e(`if exist "${t}" del /q "${t}"`,u)}else{let e=r.split(",").map(e=>`"${e.trim()}"`).join(" ");t=`unzip -o "${p}" -d "${l}" -x ${e}`}e(t),console.log(`압축 해제 완료: ${p} -> ${l}`);let a=c(l).filter(e=>!e.includes("__MACOSX"));if(console.log(`### subFolders: ${a}, subFolders.length: ${a.length}, ${a[0]}`),1===a.length&&a[0].replace(l,"").includes(o.parse(p).name)){for(let t of(console.log(`### 중복 폴더 처리 필요: ${a}`),$.readdirSync(a[0]))){let r=o.join(a[0],t),i=o.join(l,t);"win32"===process.platform?e(`move "${r}" "${i}"`,u):e(`mv "${r}" "${i}"`,u)}"win32"===process.platform?e(`rmdir /s /q "${a[0]}"`,u):e(`rm -rf "${a[0]}"`,u)}s.push(l)}catch(e){console.error(`'${p}' 압축 해제 중 오류 발생:`,e.message)}return p(n,"__MACOSX/",!0),s.join(",")},S=o=>{{if("win"===r){let t=o.split(",").join("|")||"node_modules|dist|_backups|_drafts|types|docs";try{let o=`powershell -NoProfile -ExecutionPolicy Bypass -Command "$OutputEncoding = [Console]::OutputEncoding = [Text.Encoding]::UTF8; tree /F /A | Select-String -NotMatch '${t}'"`;console.log("Command: ",o);let r=e(o,{encoding:"utf8",stdio:"pipe"});return console.log("Result: ",r),r&&n("tree.txt",r,{overwrite:!0,newFile:!1,encoding:"utf8"}),r||""}catch(e){return console.error("Error executing tree command:",e),""}}let t=o?`"${o.split(",").join("|")}"`:'"node_modules|dist|_backups|_drafts|types|docs"',i=`tree -I ${t} --dirsfirst -L 3`;try{console.log("Command: ",i);let o=e(i,{encoding:"utf8",stdio:"pipe"});return o&&n("tree.txt",o,{overwrite:!0,newFile:!1}),o||""}catch(e){return console.error("Error executing tree command:",e),""}}};export{r as PLATFORM,u as execOptions,x as exec,b as exe,h as getParentDir,f as getCurrentDir,y as initApp,j as removeApp,v as zip,S as tree,E as unzip};
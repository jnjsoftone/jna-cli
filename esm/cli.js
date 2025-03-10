import{execSync as e}from"child_process";import r from"path";import{copyFolderToLocal as o}from"jnu-cloud";import{PLATFORM as t,makeDir as n,saveFile as i,loadEnv as s,findFiles as l,findFolders as c,deleteFilesInFolder as p,substituteInFile as a}from"jnu-abc";import{findGithubAccount as m}from"./git.js";import{githubEnv as d}from"./env.js";import $ from"fs";let u="jd-environments/Templates",f={encoding:"utf8",shell:"win32"===process.platform?"cmd.exe":"/bin/sh"},h=()=>"win"===t?(e("chcp 65001>nul",{shell:"cmd.exe"}),e("cd",f).toString().trim().replace(/\\/g,"/")):e("pwd",f).toString().trim(),g=()=>"win"===t?(e("chcp 65001>nul",{shell:"cmd.exe"}),r.dirname(e("cd",f).toString().trim().replace(/\\/g,"/"))):r.dirname(e("pwd",f).toString().trim()),w=e=>e.endsWith("/")?"*/"+e+"*":"*/"+e,x=(e,r,o)=>{let t=s(`${e}/.env.${r}`);if(t){let n=Object.entries(t).map(([e,r])=>({[`{{${e}}}`]:String(r)})).reduce((e,r)=>({...e,...r}),{});a(`${e}/${"win"===r?"publish.bat":"publish.sh"}`,{...o,...n})}},_=r=>{let o=e(r,{encoding:"utf8"});return o?o.toString().trim():""},b=e=>{let r=[];return e.forEach(e=>r.push(_(e))),r},j=async(r,n=t,i="github")=>{let{template:s,repoName:l,userName:c,description:p}=r,{fullName:$,email:w}=m(c??""),_=g(),b=h(),j="";if("github"===i)await o(u,l,d);else if("local"===i){let r=process.env.DEV_ROOT?`${process.env.DEV_ROOT}/${u}`:"C:/JnJ/Developments/jd-environments/Templates";"win"===n?e(j=`xcopy "${r}\\${s}" "${l}\\" /E /I /H /Y`,f):e(j=`cp -r ${r}/${s} ${l}`,f)}let y=[`${l}/package.json`,`${l}/README.md`,`${l}/docs/workflow.md`,`${l}/manifest.json`,`${l}/publish.sh`,`${l}/publish.bat`],v={"{{name}}":l??"","{{project-name}}":l??"","{{author}}":`${$} <${w}>`,"{{github-id}}":c??"","{{description}}":p||"","{{parent-dir}}":_,"{{current-dir}}":b};for(let e of y)a(e,v);for(let e of["win","mac"])x(l,e,v);return console.log(j=`cd ${b}/${l} && npm install`),e(j,f),console.log(j=`cd ${b}/${l} && xgit -e makeRepo -u ${c} -n ${l} -d "${p}"`),e(j,f),r},y=r=>(e(`xgit -e deleteRemoteRepo -u ${r.userName} -n ${r.repoName}`,f),"win"===t?e(`rmdir /s /q ${r.repoName}`,f):e(`rm -rf ${r.repoName}`,f),r),v=async e=>{let{template:r,repoName:o,userName:t,description:n}=e;switch(r){case"node-simple":case"python-pipenv":break;case"ts-swc-npm":case"ts-webpack-obsidianPlugin":await j(e)}return e},E=(o,n)=>{try{let i=r.resolve(o),s=r.basename(i),l=r.dirname(i),c=process.cwd();if("win"===t)try{process.chdir(l);let r=`${s}_temp`;for(let o of(e(`xcopy "${s}" "${r}\\" /E /I /H /Y`,f),n?n.split(","):["node_modules","package-lock.json","package.json"])){let t=`${r}/${o}`;try{o.includes("/")?e(`rmdir /s /q "${t}"`,f):e(`del /q "${t}"`,f)}catch(e){console.log(`Warning: Could not remove ${o}`)}}e(`powershell -Command "Compress-Archive -Path '${r}/*' -DestinationPath '${s}.zip' -Force"`,f),e(`rmdir /s /q "${r}"`,f)}catch(e){throw console.error("Error during zip operation:",e),e}finally{process.chdir(c)}else try{process.chdir(l);let r=n?n.split(",").map(e=>`"${w(e)}"`).join(" "):'"*/node_modules/*" ".git/*"';e(`zip -r "${s}.zip" "${s}" -x ${r}`,f)}finally{process.chdir(c)}return{folderPath:o,excluded:n}}catch(e){throw console.error("Error in zip function:",e),e}},S=(o,t="__MACOSX/,node_modules/,.DS_Store,.git/")=>{let i=h(),s=[];for(let p of l(o,"*.zip"))try{let o;let l=`${i}/_unzip/${r.parse(p).name}`;if(console.log(`## extractPath: ${l}`),n(l),"win32"===process.platform)for(let n of(o=`powershell -command "Expand-Archive -Path '${p}' -DestinationPath '${l}' -Force"`,t.split(",").map(e=>e.trim()))){let o=r.join(l,n.replace("/",""));n.endsWith("/")?e(`if exist "${o}" rmdir /s /q "${o}"`,f):e(`if exist "${o}" del /q "${o}"`,f)}else{let e=t.split(",").map(e=>`"${e.trim()}"`).join(" ");o=`unzip -o "${p}" -d "${l}" -x ${e}`}e(o),console.log(`압축 해제 완료: ${p} -> ${l}`);let a=c(l).filter(e=>!e.includes("__MACOSX"));if(console.log(`### subFolders: ${a}, subFolders.length: ${a.length}, ${a[0]}`),1===a.length&&a[0].replace(l,"").includes(r.parse(p).name)){for(let o of(console.log(`### 중복 폴더 처리 필요: ${a}`),$.readdirSync(a[0]))){let t=r.join(a[0],o),n=r.join(l,o);"win32"===process.platform?e(`move "${t}" "${n}"`,f):e(`mv "${t}" "${n}"`,f)}"win32"===process.platform?e(`rmdir /s /q "${a[0]}"`,f):e(`rm -rf "${a[0]}"`,f)}s.push(l)}catch(e){console.error(`'${p}' 압축 해제 중 오류 발생:`,e.message)}return p(i,"__MACOSX/",!0),s.join(",")},C=r=>{{if("win"===t){let o=r.split(",").join("|")||"node_modules|dist|_backups|_drafts|types|docs";try{let r=`powershell -NoProfile -ExecutionPolicy Bypass -Command "$OutputEncoding = [Console]::OutputEncoding = [Text.Encoding]::UTF8; tree /F /A | Select-String -NotMatch '${o}'"`;console.log("Command: ",r);let t=e(r,{encoding:"utf8",stdio:"pipe"});return console.log("Result: ",t),t&&i("tree.txt",t,{overwrite:!0,newFile:!1,encoding:"utf8"}),t||""}catch(e){return console.error("Error executing tree command:",e),""}}let o=r?`"${r.split(",").join("|")}"`:'"node_modules|dist|_backups|_drafts|types|docs"',n=`tree -I ${o} --dirsfirst -L 3`;try{console.log("Command: ",n);let r=e(n,{encoding:"utf8",stdio:"pipe"});return r&&i("tree.txt",r,{overwrite:!0,newFile:!1}),r||""}catch(e){return console.error("Error executing tree command:",e),""}}};export{t as PLATFORM,f as execOptions,_ as exec,b as exe,g as getParentDir,h as getCurrentDir,v as initApp,y as removeApp,E as zip,C as tree,S as unzip};
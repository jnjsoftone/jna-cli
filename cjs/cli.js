"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),!function(e,t){for(var n in t)Object.defineProperty(e,n,{enumerable:!0,get:t[n]})}(exports,{PLATFORM:function(){return r.PLATFORM},exe:function(){return $},exec:function(){return m},execOptions:function(){return s},getCurrentDir:function(){return a},getParentDir:function(){return u},initApp:function(){return g},removeApp:function(){return h},tree:function(){return S},unzip:function(){return y},zip:function(){return x}});const e=require("child_process"),t=/*#__PURE__*/l(require("path")),n=require("jnu-cloud"),r=require("jnu-abc"),o=require("./git.js"),c=require("./env.js"),i=/*#__PURE__*/l(require("fs"));function l(e){return e&&e.__esModule?e:{default:e}}const s={encoding:"utf8",shell:"win32"===process.platform?"cmd.exe":"/bin/sh"},a=()=>"win"===r.PLATFORM?((0,e.execSync)("chcp 65001>nul",{shell:"cmd.exe"}),(0,e.execSync)("cd",s).toString().trim().replace(/\\/g,"/")):(0,e.execSync)("pwd",s).toString().trim(),u=()=>"win"===r.PLATFORM?((0,e.execSync)("chcp 65001>nul",{shell:"cmd.exe"}),t.default.dirname((0,e.execSync)("cd",s).toString().trim().replace(/\\/g,"/"))):t.default.dirname((0,e.execSync)("pwd",s).toString().trim()),d=e=>e.endsWith("/")?"*/"+e+"*":"*/"+e,p=(e,t,n)=>{let o=(0,r.loadEnv)(`${e}/.env.${t}`);if(o){let c=Object.entries(o).map(([e,t])=>({[`{{${e}}}`]:String(t)})).reduce((e,t)=>({...e,...t}),{});(0,r.substituteInFile)(`${e}/${"win"===t?"publish.bat":"publish.sh"}`,{...n,...c})}},m=t=>{let n=(0,e.execSync)(t,{encoding:"utf8"});return n?n.toString().trim():""},$=e=>{let t=[];return e.forEach(e=>t.push(m(e))),t},f=async(t,i=r.PLATFORM,l="github")=>{let{template:d,repoName:m,userName:$,description:f}=t,{fullName:h,email:g}=await (0,o.findGithubAccount)($??""),x=u(),y=a(),S="";if("github"===l)console.log(`### Copy from Github to Local: Templates/${d} => ${m}`),await (0,n.copyFolderToLocal)(`Templates/${d}`,m,c.githubEnv);else if("local"===l){let t=process.env.DEV_ROOT?`${process.env.DEV_ROOT}/jd-environments/Templates`:"C:/JnJ/Developments/jd-environments/Templates";S="win"===i?`xcopy "${t}\\${d}" "${m}\\" /E /I /H /Y`:`cp -r ${t}/${d} ${m}`,(0,e.execSync)(S,s)}let w=[`${m}/package.json`,`${m}/README.md`,`${m}/docs/workflow.md`,`${m}/manifest.json`,`${m}/publish.sh`,`${m}/publish.bat`],_={"{{name}}":m??"","{{project-name}}":m??"","{{author}}":`${h} <${g}>`,"{{github-id}}":$??"","{{description}}":f||"","{{parent-dir}}":x,"{{current-dir}}":y};for(let e of w)(0,r.substituteInFile)(e,_);if(!d.includes("simple"))for(let e of["win","mac"])p(m,e,_);return console.log(S=`cd ${y}/${m} && npm install`),(0,e.execSync)(S,s),console.log(S=`cd ${y}/${m} && xgit -e makeRepo -u ${$} -n ${m} -d "${f}"`),(0,e.execSync)(S,s),t},h=t=>((0,e.execSync)(`xgit -e deleteRemoteRepo -u ${t.userName} -n ${t.repoName}`,s),"win"===r.PLATFORM?(0,e.execSync)(`rmdir /s /q ${t.repoName}`,s):(0,e.execSync)(`rm -rf ${t.repoName}`,s),t),g=async e=>{let{template:t,repoName:n,userName:r,description:o}=e;switch(t){case"node-simple":case"python-pipenv":break;case"ts-swc-npm":case"ts-swc-simple":case"ts-webpack-obsidianPlugin":await f(e)}return e},x=(n,o)=>{try{let c=t.default.resolve(n),i=t.default.basename(c),l=t.default.dirname(c),a=process.cwd();if("win"===r.PLATFORM)try{process.chdir(l);let t=`${i}_temp`;for(let n of((0,e.execSync)(`xcopy "${i}" "${t}\\" /E /I /H /Y`,s),o?o.split(","):["node_modules","package-lock.json","package.json"])){let r=`${t}/${n}`;try{n.includes("/")?(0,e.execSync)(`rmdir /s /q "${r}"`,s):(0,e.execSync)(`del /q "${r}"`,s)}catch(e){console.log(`Warning: Could not remove ${n}`)}}(0,e.execSync)(`powershell -Command "Compress-Archive -Path '${t}/*' -DestinationPath '${i}.zip' -Force"`,s),(0,e.execSync)(`rmdir /s /q "${t}"`,s)}catch(e){throw console.error("Error during zip operation:",e),e}finally{process.chdir(a)}else try{process.chdir(l);let t=o?o.split(",").map(e=>`"${d(e)}"`).join(" "):'"*/node_modules/*" ".git/*"';(0,e.execSync)(`zip -r "${i}.zip" "${i}" -x ${t}`,s)}finally{process.chdir(a)}return{folderPath:n,excluded:o}}catch(e){throw console.error("Error in zip function:",e),e}},y=(n,o="__MACOSX/,node_modules/,.DS_Store,.git/")=>{let c=a(),l=[];for(let a of(0,r.findFiles)(n,"*.zip"))try{let n;let u=`${c}/_unzip/${t.default.parse(a).name}`;if(console.log(`## extractPath: ${u}`),(0,r.makeDir)(u),"win32"===process.platform)for(let r of(n=`powershell -command "Expand-Archive -Path '${a}' -DestinationPath '${u}' -Force"`,o.split(",").map(e=>e.trim()))){let n=t.default.join(u,r.replace("/",""));r.endsWith("/")?(0,e.execSync)(`if exist "${n}" rmdir /s /q "${n}"`,s):(0,e.execSync)(`if exist "${n}" del /q "${n}"`,s)}else{let e=o.split(",").map(e=>`"${e.trim()}"`).join(" ");n=`unzip -o "${a}" -d "${u}" -x ${e}`}(0,e.execSync)(n),console.log(`압축 해제 완료: ${a} -> ${u}`);let d=(0,r.findFolders)(u).filter(e=>!e.includes("__MACOSX"));if(console.log(`### subFolders: ${d}, subFolders.length: ${d.length}, ${d[0]}`),1===d.length&&d[0].replace(u,"").includes(t.default.parse(a).name)){for(let n of(console.log(`### 중복 폴더 처리 필요: ${d}`),i.default.readdirSync(d[0]))){let r=t.default.join(d[0],n),o=t.default.join(u,n);"win32"===process.platform?(0,e.execSync)(`move "${r}" "${o}"`,s):(0,e.execSync)(`mv "${r}" "${o}"`,s)}"win32"===process.platform?(0,e.execSync)(`rmdir /s /q "${d[0]}"`,s):(0,e.execSync)(`rm -rf "${d[0]}"`,s)}l.push(u)}catch(e){console.error(`'${a}' 압축 해제 중 오류 발생:`,e.message)}return(0,r.deleteFilesInFolder)(c,"__MACOSX/",!0),l.join(",")},S=t=>{{if("win"===r.PLATFORM){let n=t.split(",").join("|")||"node_modules|dist|_backups|_drafts|types|docs";try{let t=`powershell -NoProfile -ExecutionPolicy Bypass -Command "$OutputEncoding = [Console]::OutputEncoding = [Text.Encoding]::UTF8; tree /F /A | Select-String -NotMatch '${n}'"`;console.log("Command: ",t);let o=(0,e.execSync)(t,{encoding:"utf8",stdio:"pipe"});return console.log("Result: ",o),o&&(0,r.saveFile)("tree.txt",o,{overwrite:!0,newFile:!1,encoding:"utf8"}),o||""}catch(e){return console.error("Error executing tree command:",e),""}}let n=t?`"${t.split(",").join("|")}"`:'"node_modules|dist|_backups|_drafts|types|docs"',o=`tree -I ${n} --dirsfirst -L 3`;try{console.log("Command: ",o);let t=(0,e.execSync)(o,{encoding:"utf8",stdio:"pipe"});return t&&(0,r.saveFile)("tree.txt",t,{overwrite:!0,newFile:!1}),t||""}catch(e){return console.error("Error executing tree command:",e),""}}};
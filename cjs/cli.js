"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),!function(e,t){for(var n in t)Object.defineProperty(e,n,{enumerable:!0,get:t[n]})}(exports,{PLATFORM:function(){return r.PLATFORM},exe:function(){return f},exec:function(){return $},execOptions:function(){return u},getCurrentDir:function(){return a},getParentDir:function(){return d},initApp:function(){return g},removeApp:function(){return x},tree:function(){return w},unzip:function(){return S},zip:function(){return y}});const e=require("child_process"),t=/*#__PURE__*/s(require("path")),n=require("jnu-cloud"),r=require("jnu-abc"),o=require("./git.js"),c=require("./env.js"),i=/*#__PURE__*/s(require("fs"));function s(e){return e&&e.__esModule?e:{default:e}}const l="jd-environments/Templates",u={encoding:"utf8",shell:"win32"===process.platform?"cmd.exe":"/bin/sh"},a=()=>"win"===r.PLATFORM?((0,e.execSync)("chcp 65001>nul",{shell:"cmd.exe"}),(0,e.execSync)("cd",u).toString().trim().replace(/\\/g,"/")):(0,e.execSync)("pwd",u).toString().trim(),d=()=>"win"===r.PLATFORM?((0,e.execSync)("chcp 65001>nul",{shell:"cmd.exe"}),t.default.dirname((0,e.execSync)("cd",u).toString().trim().replace(/\\/g,"/"))):t.default.dirname((0,e.execSync)("pwd",u).toString().trim()),p=e=>e.endsWith("/")?"*/"+e+"*":"*/"+e,m=(e,t,n)=>{let o=(0,r.loadEnv)(`${e}/.env.${t}`);if(o){let c=Object.entries(o).map(([e,t])=>({[`{{${e}}}`]:String(t)})).reduce((e,t)=>({...e,...t}),{});(0,r.substituteInFile)(`${e}/${"win"===t?"publish.bat":"publish.sh"}`,{...n,...c})}},$=t=>{let n=(0,e.execSync)(t,{encoding:"utf8"});return n?n.toString().trim():""},f=e=>{let t=[];return e.forEach(e=>t.push($(e))),t},h=async(t,i=r.PLATFORM,s="github")=>{let{template:p,repoName:$,userName:f,description:h}=t,{fullName:x,email:g}=await (0,o.findGithubAccount)(f??""),y=d(),S=a(),w="";if("github"===s)await (0,n.copyFolderToLocal)(l,$,c.githubEnv);else if("local"===s){let t=process.env.DEV_ROOT?`${process.env.DEV_ROOT}/${l}`:"C:/JnJ/Developments/jd-environments/Templates";w="win"===i?`xcopy "${t}\\${p}" "${$}\\" /E /I /H /Y`:`cp -r ${t}/${p} ${$}`,(0,e.execSync)(w,u)}let _=[`${$}/package.json`,`${$}/README.md`,`${$}/docs/workflow.md`,`${$}/manifest.json`,`${$}/publish.sh`,`${$}/publish.bat`],b={"{{name}}":$??"","{{project-name}}":$??"","{{author}}":`${x} <${g}>`,"{{github-id}}":f??"","{{description}}":h||"","{{parent-dir}}":y,"{{current-dir}}":S};for(let e of _)(0,r.substituteInFile)(e,b);if(!p.includes("simple"))for(let e of["win","mac"])m($,e,b);return console.log(w=`cd ${S}/${$} && npm install`),(0,e.execSync)(w,u),console.log(w=`cd ${S}/${$} && xgit -e makeRepo -u ${f} -n ${$} -d "${h}"`),(0,e.execSync)(w,u),t},x=t=>((0,e.execSync)(`xgit -e deleteRemoteRepo -u ${t.userName} -n ${t.repoName}`,u),"win"===r.PLATFORM?(0,e.execSync)(`rmdir /s /q ${t.repoName}`,u):(0,e.execSync)(`rm -rf ${t.repoName}`,u),t),g=async e=>{let{template:t,repoName:n,userName:r,description:o}=e;switch(t){case"node-simple":case"python-pipenv":break;case"ts-swc-npm":case"ts-swc-simple":case"ts-webpack-obsidianPlugin":await h(e)}return e},y=(n,o)=>{try{let c=t.default.resolve(n),i=t.default.basename(c),s=t.default.dirname(c),l=process.cwd();if("win"===r.PLATFORM)try{process.chdir(s);let t=`${i}_temp`;for(let n of((0,e.execSync)(`xcopy "${i}" "${t}\\" /E /I /H /Y`,u),o?o.split(","):["node_modules","package-lock.json","package.json"])){let r=`${t}/${n}`;try{n.includes("/")?(0,e.execSync)(`rmdir /s /q "${r}"`,u):(0,e.execSync)(`del /q "${r}"`,u)}catch(e){console.log(`Warning: Could not remove ${n}`)}}(0,e.execSync)(`powershell -Command "Compress-Archive -Path '${t}/*' -DestinationPath '${i}.zip' -Force"`,u),(0,e.execSync)(`rmdir /s /q "${t}"`,u)}catch(e){throw console.error("Error during zip operation:",e),e}finally{process.chdir(l)}else try{process.chdir(s);let t=o?o.split(",").map(e=>`"${p(e)}"`).join(" "):'"*/node_modules/*" ".git/*"';(0,e.execSync)(`zip -r "${i}.zip" "${i}" -x ${t}`,u)}finally{process.chdir(l)}return{folderPath:n,excluded:o}}catch(e){throw console.error("Error in zip function:",e),e}},S=(n,o="__MACOSX/,node_modules/,.DS_Store,.git/")=>{let c=a(),s=[];for(let l of(0,r.findFiles)(n,"*.zip"))try{let n;let a=`${c}/_unzip/${t.default.parse(l).name}`;if(console.log(`## extractPath: ${a}`),(0,r.makeDir)(a),"win32"===process.platform)for(let r of(n=`powershell -command "Expand-Archive -Path '${l}' -DestinationPath '${a}' -Force"`,o.split(",").map(e=>e.trim()))){let n=t.default.join(a,r.replace("/",""));r.endsWith("/")?(0,e.execSync)(`if exist "${n}" rmdir /s /q "${n}"`,u):(0,e.execSync)(`if exist "${n}" del /q "${n}"`,u)}else{let e=o.split(",").map(e=>`"${e.trim()}"`).join(" ");n=`unzip -o "${l}" -d "${a}" -x ${e}`}(0,e.execSync)(n),console.log(`압축 해제 완료: ${l} -> ${a}`);let d=(0,r.findFolders)(a).filter(e=>!e.includes("__MACOSX"));if(console.log(`### subFolders: ${d}, subFolders.length: ${d.length}, ${d[0]}`),1===d.length&&d[0].replace(a,"").includes(t.default.parse(l).name)){for(let n of(console.log(`### 중복 폴더 처리 필요: ${d}`),i.default.readdirSync(d[0]))){let r=t.default.join(d[0],n),o=t.default.join(a,n);"win32"===process.platform?(0,e.execSync)(`move "${r}" "${o}"`,u):(0,e.execSync)(`mv "${r}" "${o}"`,u)}"win32"===process.platform?(0,e.execSync)(`rmdir /s /q "${d[0]}"`,u):(0,e.execSync)(`rm -rf "${d[0]}"`,u)}s.push(a)}catch(e){console.error(`'${l}' 압축 해제 중 오류 발생:`,e.message)}return(0,r.deleteFilesInFolder)(c,"__MACOSX/",!0),s.join(",")},w=t=>{{if("win"===r.PLATFORM){let n=t.split(",").join("|")||"node_modules|dist|_backups|_drafts|types|docs";try{let t=`powershell -NoProfile -ExecutionPolicy Bypass -Command "$OutputEncoding = [Console]::OutputEncoding = [Text.Encoding]::UTF8; tree /F /A | Select-String -NotMatch '${n}'"`;console.log("Command: ",t);let o=(0,e.execSync)(t,{encoding:"utf8",stdio:"pipe"});return console.log("Result: ",o),o&&(0,r.saveFile)("tree.txt",o,{overwrite:!0,newFile:!1,encoding:"utf8"}),o||""}catch(e){return console.error("Error executing tree command:",e),""}}let n=t?`"${t.split(",").join("|")}"`:'"node_modules|dist|_backups|_drafts|types|docs"',o=`tree -I ${n} --dirsfirst -L 3`;try{console.log("Command: ",o);let t=(0,e.execSync)(o,{encoding:"utf8",stdio:"pipe"});return t&&(0,r.saveFile)("tree.txt",t,{overwrite:!0,newFile:!1}),t||""}catch(e){return console.error("Error executing tree command:",e),""}}};
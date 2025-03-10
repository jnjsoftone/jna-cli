#!/usr/bin/env node
"use strict";var e;Object.defineProperty(exports,"__esModule",{value:!0});const o=require("@octokit/rest"),i=(e=require("yargs"))&&e.__esModule?e:{default:e},r=require("jnu-abc"),a=require("jnu-cloud"),t=require("./git.js"),s=require("./cli.js"),n=require("./env.js"),p=i.default.usage("Usage: -e <exec> -u <userName> -n <repoName> -d <description> -p <isPrivate>").option("e",{alias:"exec",default:"copyRepo",describe:"exec command copyRepo(clone+local config)/makeRepo(create remote+push)/removeRepo(delete remote+local)",type:"string",demandOption:!0}).option("u",{alias:"userName",default:"mooninlearn",describe:"Name of User",type:"string"}).option("n",{alias:"repoName",describe:"NameOfRepository",type:"string"}).option("p",{alias:"isPrivate",default:!1,describe:"Private Repository",type:"boolean"}).option("s",{alias:"src",default:"local",describe:"Source of Github Account",type:"string"}).option("d",{alias:"description",describe:"Description For Repository",type:"string"}).argv,c=(e,o="local")=>"local"===o?(0,r.loadJson)(`${n.localEnvRoot}/Apis/github.json`)[e]:"github"===o?(console.log(`#### githubEnv: ${JSON.stringify(n.githubEnv)}`),console.log(`#### readJsonFromGithub: ${JSON.stringify((0,a.readJsonFromGithub)("Apis/github.json",n.githubEnv))}`),(0,a.readJsonFromGithub)("Apis/github.json",n.githubEnv)[e]):void 0;(async()=>{try{var e;let i,r;let a=await c(p.userName??"","github");a.userName=p.userName??"";let n=new o.Octokit({auth:a.token}),l=(e=p.repoName??"",(r=(0,s.getCurrentDir)()).split("/").pop()!==e&&(r+=`/${e}`),r??"");switch(p.exec){case"listRepos":try{i=await (0,t.findAllRepos)(n),console.log(JSON.stringify(i,null,2))}catch(e){console.error("저장소 목록 조회 중 오류 발생:",e)}break;case"createRemoteRepo":console.log(`createRemoteRepo: ${p}`),await (0,t.createRemoteRepo)(n,{name:p.repoName??"",description:p.description??"",isPrivate:p.isPrivate??!1});break;case"deleteRemoteRepo":await (0,t.deleteRemoteRepo)(n,{name:p.repoName??""},a);break;case"setLocalConfig":(0,t.setLocalConfig)({name:p.repoName??"",description:p.description??""},a,l);break;case"cloneRepo":(0,t.cloneRepo)({name:p.repoName??"",description:p.description??""},a,l);break;case"initLocalRepo":(0,t.initLocalRepo)({name:p.repoName??"",description:p.description??""},a,l);break;case"initRepo":console.log("====initRepo"),await (0,t.initRepo)(n,{name:p.repoName??"",description:p.description??"",isPrivate:p.isPrivate??!1},a,l);break;case"pushRepo":(0,t.pushRepo)({name:p.repoName??"",description:p.description??""},a,l);break;case"copyRepo":(0,t.copyRepo)({name:p.repoName??"",description:p.description??"description",isPrivate:p.isPrivate??!1},a,l);break;case"makeRepo":await (0,t.makeRepo)(n,{name:p.repoName??"",description:p.description??"",isPrivate:p.isPrivate??!1},a,l);break;case"removeRepo":await (0,t.removeRepo)(n,{name:p.repoName??""},a,l)}}catch(e){console.error("Error:",e),process.exit(1)}})();
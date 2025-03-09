#!/usr/bin/env node
"use strict";var e,o;let i,r;Object.defineProperty(exports,"__esModule",{value:!0});const s=require("@octokit/rest"),t=(o=require("yargs"))&&o.__esModule?o:{default:o},a=require("jnu-abc"),n=require("jnu-cloud"),p=require("./git.js"),c=require("./cli.js"),l=t.default.usage("Usage: -e <exec> -u <userName> -n <repoName> -d <description> -p <isPrivate>").option("e",{alias:"exec",default:"copyRepo",describe:"exec command copyRepo(clone+local config)/makeRepo(create remote+push)/removeRepo(delete remote+local)",type:"string",demandOption:!0}).option("u",{alias:"userName",default:"mooninlearn",describe:"Name of User",type:"string"}).option("n",{alias:"repoName",describe:"NameOfRepository",type:"string"}).option("p",{alias:"isPrivate",default:!1,describe:"Private Repository",type:"boolean"}).option("s",{alias:"src",default:"local",describe:"Source of Github Account",type:"string"}).option("d",{alias:"description",describe:"Description For Repository",type:"string"}).argv,m=async(e,o="github")=>{if("local"===o){let o=process.env.DEV_ROOT?`${process.env.DEV_ROOT}/jd-environments`:"C:/JnJ/Developments/jd-environments";return(0,a.loadJson)(`${o}/Apis/github.json`)[e]}if("github"===o){console.log(`#### ENV_GITHUB_OWNER: ${process.env.ENV_GITHUB_OWNER}`),console.log(`#### ENV_GITHUB_REPO: ${process.env.ENV_GITHUB_REPO}`),console.log(`#### ENV_GITHUB_TOKEN: ${process.env.ENV_GITHUB_TOKEN}`);let o={owner:process.env.ENV_GITHUB_OWNER||"",repo:process.env.ENV_GITHUB_REPO||"",token:process.env.ENV_GITHUB_TOKEN||""},i=await (0,n.readJsonFromGithub)("Apis/github.json",o);return console.log(`@@@@ readJsonFromGithub: ${JSON.stringify(i)}`),i[e]}},d=await m(l.userName??"","github");d.userName=l.userName??"",console.log(`#### git account: ${JSON.stringify(d)}`);const u=new s.Octokit({auth:d.token}),R=(e=l.repoName??"",(r=(0,c.getCurrentDir)()).split("/").pop()!==e&&(r+=`/${e}`),r??"");switch(l.exec){case"listRepos":(async()=>{try{i=await (0,p.findAllRepos)(u),console.log(JSON.stringify(i,null,2))}catch(e){console.error("저장소 목록 조회 중 오류 발생:",e)}})();break;case"createRemoteRepo":console.log(`createRemoteRepo: ${l}`),(0,p.createRemoteRepo)(u,{name:l.repoName??"",description:l.description??"",isPrivate:l.isPrivate??!1});break;case"deleteRemoteRepo":(0,p.deleteRemoteRepo)(u,{name:l.repoName??""},d);break;case"setLocalConfig":(0,p.setLocalConfig)({name:l.repoName??"",description:l.description??""},d,R);break;case"cloneRepo":(0,p.cloneRepo)({name:l.repoName??"",description:l.description??""},d,R);break;case"initLocalRepo":(0,p.initLocalRepo)({name:l.repoName??"",description:l.description??""},d,R);break;case"initRepo":console.log("====initRepo"),(0,p.initRepo)(u,{name:l.repoName??"",description:l.description??"",isPrivate:l.isPrivate??!1},d,R);break;case"pushRepo":(0,p.pushRepo)({name:l.repoName??"",description:l.description??""},d,R);break;case"copyRepo":(0,p.copyRepo)({name:l.repoName??"",description:l.description??"description",isPrivate:l.isPrivate??!1},d,R);break;case"makeRepo":(0,p.makeRepo)(u,{name:l.repoName??"",description:l.description??"",isPrivate:l.isPrivate??!1},d,R);break;case"removeRepo":(0,p.removeRepo)(u,{name:l.repoName??""},d,R)}
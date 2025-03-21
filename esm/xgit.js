#!/usr/bin/env node
import{Octokit as e}from"@octokit/rest";import o from"yargs";import{findAllRepos as a,findGithubAccount as i,createRemoteRepo as r,setLocalConfig as t,cloneRepo as s,initLocalRepo as c,deleteRemoteRepo as p,initRepo as n,copyRepo as m,pushRepo as l,makeRepo as d,removeRepo as u}from"./git.js";import{getCurrentDir as N}from"./cli.js";let R=o.usage("Usage: -e <exec> -u <userName> -n <repoName> -d <description> -p <isPrivate>").option("e",{alias:"exec",default:"copyRepo",describe:"exec command copyRepo(clone+local config)/makeRepo(create remote+push)/removeRepo(delete remote+local)",type:"string",demandOption:!0}).option("u",{alias:"userName",default:"mooninlearn",describe:"Name of User",type:"string"}).option("n",{alias:"repoName",describe:"NameOfRepository",type:"string"}).option("p",{alias:"isPrivate",default:!1,describe:"Private Repository",type:"boolean"}).option("s",{alias:"src",default:"local",describe:"Source of Github Account",type:"string"}).option("d",{alias:"description",describe:"Description For Repository",type:"string"}).argv;(async()=>{try{var o;let b,g;let y=await i(R.userName??"","github");y||(console.error("GitHub 계정 정보를 찾을 수 없습니다."),process.exit(1)),y.userName=R.userName??y.userName,console.log(`@@@ git account: ${JSON.stringify(y)}`);let v=new e({auth:y.token}),f=(o=R.repoName??"",(g=N()).split("/").pop()!==o&&(g+=`/${o}`),g??"");switch(R.exec){case"list":case"listRepos":try{b=await a(v),console.log(JSON.stringify(b,null,2))}catch(e){console.error("저장소 목록 조회 중 오류 발생:",e)}break;case"create":case"createRemoteRepo":console.log(`createRemoteRepo: ${R}`),await r(v,{name:R.repoName??"",description:R.description??"",isPrivate:R.isPrivate??!1});break;case"del":case"deleteRemoteRepo":await p(v,{name:R.repoName??""},y);break;case"setLocalConfig":t({name:R.repoName??"",description:R.description??""},y,f);break;case"clone":case"cloneRepo":s({name:R.repoName??"",description:R.description??""},y,f);break;case"initLocalRepo":c({name:R.repoName??"",description:R.description??""},y,f);break;case"initRepo":console.log("====initRepo"),await n(v,{name:R.repoName??"",description:R.description??"",isPrivate:R.isPrivate??!1},y,f);break;case"push":case"pushRepo":l({name:R.repoName??"",description:R.description??""},y,f);break;case"copy":case"copyRepo":m({name:R.repoName??"",description:R.description??"description",isPrivate:R.isPrivate??!1},y,f);break;case"make":case"makeRepo":d(v,{name:R.repoName??"",description:R.description??"",isPrivate:R.isPrivate??!1},y,f);break;case"remove":case"removeRepo":await u(v,{name:R.repoName??""},y,f)}}catch(e){console.error("Error:",e),process.exit(1)}})();
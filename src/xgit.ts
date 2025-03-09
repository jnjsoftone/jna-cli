#!/usr/bin/env node
import { Octokit } from '@octokit/rest';
import yargs from 'yargs';
import { execSync } from 'child_process';
import { loadJson } from 'jnu-abc';
import { readJsonFromGithub } from 'jnu-cloud';
import {
  findAllRepos,
  // findGithubAccount,
  createRemoteRepo,
  setLocalConfig,
  cloneRepo,
  initLocalRepo,
  deleteRemoteRepo,
  initRepo,
  copyRepo,
  pushRepo,
  makeRepo,
  removeRepo,
} from './git.js';
import { getCurrentDir } from './cli.js';

// & Types AREA
// &---------------------------------------------------------------------------
interface CommandOptions {
  exec: string; // 'copyRepo' | 'makeRepo' | 'removeRepo'
  userName?: string;
  repoName?: string;
  description?: string;
  isPrivate?: boolean;
}

// & Variables AREA
// &---------------------------------------------------------------------------
// * cli options
const options = yargs
  .usage('Usage: -e <exec> -u <userName> -n <repoName> -d <description> -p <isPrivate>')
  .option('e', {
    alias: 'exec',
    default: 'copyRepo',
    describe: 'exec command copyRepo(clone+local config)/makeRepo(create remote+push)/removeRepo(delete remote+local)',
    type: 'string',
    demandOption: true,
  })
  .option('u', {
    alias: 'userName',
    default: 'mooninlearn',
    describe: 'Name of User',
    type: 'string',
  })
  .option('n', {
    alias: 'repoName',
    describe: 'NameOfRepository',
    type: 'string',
  })
  .option('p', {
    alias: 'isPrivate',
    default: false,
    describe: 'Private Repository',
    type: 'boolean',
  })
  .option('s', {
    alias: 'src',
    default: 'local',
    describe: 'Source of Github Account',
    type: 'string',
  })
  .option('d', {
    alias: 'description',
    describe: 'Description For Repository',
    type: 'string',
  }).argv as unknown as CommandOptions;

// * temp Function
function getLocalPath(repoName: string) {
  let localPath = getCurrentDir();
  const lastSlug = localPath.split('/').pop();
  if (lastSlug !== repoName) {
    localPath += `/${repoName}`;
  }
  return localPath;
}

const findGithubAccount = (userName: string, src = 'github'): any => {
  if (src === 'local') {
    const settingsPath = process.env.DEV_ROOT ? `${process.env.DEV_ROOT}/jd-environments` : 'C:/JnJ/Developments/jd-environments';
    return loadJson(`${settingsPath}/Apis/github.json`)[userName];
  } else if (src === 'github') {  // ~/.bashrc { owner, repo, token } ENV_GIT_OWNER, ENV_GIT_REPO, ENV_GIT_TOKEN
    console.log(`#### ENV_GITHUB_OWNER: ${process.env.ENV_GITHUB_OWNER}`);
    console.log(`#### ENV_GITHUB_REPO: ${process.env.ENV_GITHUB_REPO}`);
    console.log(`#### ENV_GITHUB_TOKEN: ${process.env.ENV_GITHUB_TOKEN}`);
    const options = {
      owner: process.env.ENV_GITHUB_OWNER || '',
      repo: process.env.ENV_GITHUB_REPO || '',
      token: process.env.ENV_GITHUB_TOKEN || '',
    };
    console.log(`#### readJsonFromGithub: ${readJsonFromGithub('Apis/github.json', options)}`);
    return readJsonFromGithub('Apis/github.json', options)[userName]
  }
};

// * github account setup
const account = findGithubAccount(options.userName ?? '', 'github');
account.userName = options.userName ?? '';
console.log(`#### git account: ${JSON.stringify(account)}`);
const octokit = new Octokit({ auth: account.token });
const localPath = getLocalPath(options.repoName ?? '') ?? '';
let result: any;

// * exec
switch (options.exec) {
  case 'listRepos':
    (async () => {
      try {
        result = await findAllRepos(octokit);
        console.log(JSON.stringify(result, null, 2));
      } catch (error) {
        console.error('저장소 목록 조회 중 오류 발생:', error);
      }
    })();
    break;
  case 'createRemoteRepo':
    console.log(`createRemoteRepo: ${options}`);
    createRemoteRepo(octokit, {
      name: options.repoName ?? '',
      description: options.description ?? '',
      isPrivate: options.isPrivate ?? false,
    });
    break;
  case 'deleteRemoteRepo':
    deleteRemoteRepo(
      octokit,
      {
        name: options.repoName ?? '',
      },
      account
    );
    break;
  case 'setLocalConfig':
    setLocalConfig(
      {
        name: options.repoName ?? '',
        description: options.description ?? '',
      },
      account,
      localPath
    );
    break;
  case 'cloneRepo':
    cloneRepo(
      {
        name: options.repoName ?? '',
        description: options.description ?? '',
      },
      account,
      localPath
    );
    break;
  case 'initLocalRepo':
    initLocalRepo(
      {
        name: options.repoName ?? '',
        description: options.description ?? ''
      },
      account,
      localPath
    );
    break;
  case 'initRepo':
    console.log('====initRepo');
    initRepo(
      octokit,
      {
        name: options.repoName ?? '',
        description: options.description ?? '',
        isPrivate: options.isPrivate ?? false,
      },
      account,
      localPath
    );
    break;
  case 'pushRepo':
    pushRepo(
      {
        name: options.repoName ?? '',
        description: options.description ?? '',
      },
      account,
      localPath
    );
    break;
  case 'copyRepo':
    copyRepo(
      {
        name: options.repoName ?? '',
        description: options.description ?? 'description',
        isPrivate: options.isPrivate ?? false,
      },
      account,
      localPath
    );
    break;
  case 'makeRepo': // 리모트 저장소 생성, 로컬 저장소 push, ex) xgit -e makeRepo -n "video-stream-app" -u "jnjsoftko" -d "video stream app"
    makeRepo(
      octokit,
      {
        name: options.repoName ?? '',
        description: options.description ?? '',
        isPrivate: options.isPrivate ?? false,
      },
      account,
      localPath
    );
    break;
  case 'removeRepo': // 리모트 저장소 삭제, ex) xgit -e removeRepo -n "video-stream-app" -u "jnjsoftko"
    removeRepo(octokit, { name: options.repoName ?? '' }, account, localPath);
    break;
}

// github -u mooninlearn -n udemy-test -e makeRepo -d "test makeRepo"

#!/usr/bin/env node
import { Octokit } from '@octokit/rest';
import yargs from 'yargs';
import { execSync } from 'child_process';
import { loadJson } from 'jnu-abc';
// import { readJsonFromGithub } from 'jnu-cloud';
import {
  findAllRepos,
  findGithubAccount,
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
import { githubEnv, localEnvRoot } from './env.js';

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

// const findGithubAccount = (userName: string, src = 'github'): any => {
//   if (src === 'local') {
//     return loadJson(`${localEnvRoot}/Apis/github.json`)[userName];
//   } else if (src === 'github') {
//     console.log(`#### githubEnv: ${JSON.stringify(githubEnv)}`);
//     console.log(`#### readJsonFromGithub: ${JSON.stringify(readJsonFromGithub('Apis/github.json', githubEnv))}`);
//     return readJsonFromGithub('Apis/github.json', githubEnv)[userName];
//   }
// };

// * github account setup
(async () => {
  try {
    const account = await findGithubAccount(options.userName ?? '', 'github');
    account.userName = options.userName ?? '';
    console.log(`@@@ git account: ${JSON.stringify(account)}`);
    const octokit = new Octokit({ auth: account.token });
    const localPath = getLocalPath(options.repoName ?? '') ?? '';
    let result: any;

    // * exec
    switch (options.exec) {
      case 'list':
      case 'listRepos':
        try {
          result = await findAllRepos(octokit);
          console.log(JSON.stringify(result, null, 2));
        } catch (error) {
          console.error('저장소 목록 조회 중 오류 발생:', error);
        }
        break;
      case 'create':
      case 'createRemoteRepo':
        console.log(`createRemoteRepo: ${options}`);
        await createRemoteRepo(octokit, {
          name: options.repoName ?? '',
          description: options.description ?? '',
          isPrivate: options.isPrivate ?? false,
        });
        break;
      case 'del':
      case 'deleteRemoteRepo':
        await deleteRemoteRepo(
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
      case 'clone':
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
            description: options.description ?? '',
          },
          account,
          localPath
        );
        break;
      // case 'init':
      case 'initRepo':
        console.log('====initRepo');
        await initRepo(
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
      case 'push':
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
      case 'copy':
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
      case 'make':
      case 'makeRepo':
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
      case 'remove':
      case 'removeRepo':
        await removeRepo(octokit, { name: options.repoName ?? '' }, account, localPath);
        break;
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();

// github -u mooninlearn -n udemy-test -e makeRepo -d "test makeRepo"

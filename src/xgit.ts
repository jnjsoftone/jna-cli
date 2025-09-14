#!/usr/bin/env node
import { Octokit } from '@octokit/rest';
import yargs from 'yargs';
import { execSync } from 'child_process';
import { loadJson, saveFile, saveJson, makeDir } from 'jnu-abc';
// import { readJsonFromGithub } from 'jnu-cloud';
import {
  findAllRepos,
  findAllUsers,
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
  pullRepo,
  syncRepo,
} from './git.js';
import { getCurrentDir } from './cli.js';
import { githubEnv, localEnvRoot } from './env.js';
import path from 'path';

// & Types AREA
// &---------------------------------------------------------------------------
interface CommandOptions {
  exec: string; // 'copyRepo' | 'makeRepo' | 'removeRepo'
  userName?: string;
  repoName?: string;
  description?: string;
  isPrivate?: boolean;
  location?: string;
}

// & Variables AREA
// &---------------------------------------------------------------------------
// * cli options
const options = yargs
  .usage('Usage: -e <exec> -u <userName> -n <repoName> -d <description> -p <isPrivate> -l <location>')
  .option('e', {
    alias: 'exec',
    default: 'copyRepo',
    describe: 'exec command: copyRepo(clone+config)/makeRepo(create+push)/removeRepo(delete)/pull(fetch latest)/sync(auto commit+push+pull)/list(repos)/userlist(users)',
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
  })
  .option('l', {
    alias: 'location',
    default: './',
    describe: 'For list command: output file paths (comma-separated, e.g., "./_docs/list.md,./_docs/list.json"). For other commands: base directory location for operations',
    type: 'string',
  }).argv as unknown as CommandOptions;

// * temp Function
function getLocalPath(repoName: string, baseLocation?: string) {
  // Use provided location or default to current directory
  let localPath = baseLocation && baseLocation !== './' 
    ? (baseLocation.startsWith('/') ? baseLocation : `${getCurrentDir()}/${baseLocation}`)
    : getCurrentDir();
  
  // Remove trailing slash if present
  localPath = localPath.replace(/\/$/, '');
  
  const lastSlug = localPath.split('/').pop();
  if (lastSlug !== repoName) {
    localPath += `/${repoName}`;
  }
  return localPath;
}

// * Repository data formatting functions
interface RepoData {
  name: string;
  url: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

function formatRepoData(repos: any[]): RepoData[] {
  return repos.map(repo => ({
    name: repo.name,
    url: repo.html_url,
    description: repo.description || '',
    created_at: repo.created_at,
    updated_at: repo.updated_at
  }));
}

function createMarkdownTable(repos: RepoData[]): string {
  let markdown = '| sn | name | url | description | created_at | updated_at |\n';
  markdown += '|----|------|-----|-------------|------------|------------|\n';
  
  repos.forEach((repo, index) => {
    const sn = index + 1;
    const name = repo.name || '';
    const url = repo.url || '';
    const description = (repo.description || '').replace(/\|/g, '\\|'); // Escape pipe characters
    const createdAt = repo.created_at ? new Date(repo.created_at).toISOString().split('T')[0] : '';
    const updatedAt = repo.updated_at ? new Date(repo.updated_at).toISOString().split('T')[0] : '';
    
    markdown += `| ${sn} | ${name} | ${url} | ${description} | ${createdAt} | ${updatedAt} |\n`;
  });
  
  return markdown;
}

function saveRepoDataToFiles(repos: any[], outputPaths: string[]) {
  const repoData = formatRepoData(repos);
  
  outputPaths.forEach(outputPath => {
    const resolvedPath = path.resolve(outputPath);
    const dir = path.dirname(resolvedPath);
    const ext = path.extname(resolvedPath).toLowerCase();
    
    try {
      // Ensure directory exists
      makeDir(dir);
      
      if (ext === '.md') {
        const markdown = createMarkdownTable(repoData);
        saveFile(resolvedPath, markdown, { overwrite: true });
        console.log(`✅ Markdown table saved to: ${resolvedPath}`);
      } else if (ext === '.json') {
        saveJson(resolvedPath, repoData, { overwrite: true });
        console.log(`✅ JSON data saved to: ${resolvedPath}`);
      } else {
        console.warn(`⚠️  Unsupported file extension: ${ext} for ${resolvedPath}`);
      }
    } catch (error) {
      console.error(`❌ Failed to save to ${resolvedPath}:`, error);
    }
  });
}

function saveUserDataToFile(users: Record<string, any>, outputPath: string) {
  const resolvedPath = path.resolve(outputPath);
  const dir = path.dirname(resolvedPath);
  const ext = path.extname(resolvedPath).toLowerCase();
  
  try {
    // Ensure directory exists
    makeDir(dir);
    
    if (ext === '.json') {
      saveJson(resolvedPath, users, { overwrite: true });
      console.log(`✅ User data saved to: ${resolvedPath}`);
    } else {
      console.warn(`⚠️  Only JSON format is supported for user data: ${resolvedPath}`);
    }
  } catch (error) {
    console.error(`❌ Failed to save user data to ${resolvedPath}:`, error);
  }
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
    if (!account) {
      console.error('GitHub 계정 정보를 찾을 수 없습니다.');
      process.exit(1);
    }

    // GitHub 계정 정보 설정
    account.userName = options.userName ?? account.userName;
    console.log(`@@@ git account: ${JSON.stringify(account)}`);
    
    const octokit = new Octokit({ auth: account.token });
    const localPath = getLocalPath(options.repoName ?? '', options.location) ?? '';
    let result: any;

    // * exec
    switch (options.exec) {
      case 'list':
      case 'listRepos':
        try {
          result = await findAllRepos(octokit);
          console.log(`📊 Found ${result.length} repositories for user: ${options.userName}`);
          
          // Check if location option contains file paths for output
          if (options.location && options.location !== './') {
            // Parse comma-separated file paths
            const outputPaths = options.location.split(',').map(path => path.trim());
            saveRepoDataToFiles(result, outputPaths);
          } else {
            // Default behavior: save to default locations
            const defaultPaths = ['./_docs/list.md', './_docs/list.json'];
            saveRepoDataToFiles(result, defaultPaths);
          }
          
          // Still output to console for immediate viewing (first 10 repos)
          const displayRepos = result.slice(0, 10);
          console.log('\n📋 Repository List (showing first 10):');
          displayRepos.forEach((repo: any, index: number) => {
            console.log(`${index + 1}. ${repo.name} - ${repo.html_url}`);
            console.log(`   📝 ${repo.description || 'No description'}`);
            console.log(`   📅 Created: ${new Date(repo.created_at).toLocaleDateString()}, Updated: ${new Date(repo.updated_at).toLocaleDateString()}\n`);
          });
          
          if (result.length > 10) {
            console.log(`... and ${result.length - 10} more repositories (see output files for complete list)`);
          }
        } catch (error) {
          console.error('저장소 목록 조회 중 오류 발생:', error);
        }
        break;
      case 'userlist':
        try {
          result = await findAllUsers('github');
          if (result) {
            const userCount = Object.keys(result).length;
            console.log(`📊 Found ${userCount} users in GitHub account data`);
            
            // Check if location option contains file path for output
            if (options.location && options.location !== './') {
              saveUserDataToFile(result, options.location);
            } else {
              // Default behavior: save to default location
              const defaultPath = './_docs/users.json';
              saveUserDataToFile(result, defaultPath);
            }
            
            // Output user list to console
            console.log('\n👥 User List:');
            Object.keys(result).forEach((userName, index) => {
              const user = result[userName];
              console.log(`${index + 1}. ${userName}`);
              console.log(`   📧 ${user.email || 'No email'}`);
              console.log(`   👤 ${user.fullName || 'No full name'}\n`);
            });
          } else {
            console.log('❌ No user data found');
          }
        } catch (error) {
          console.error('사용자 목록 조회 중 오류 발생:', error);
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
      case 'pull':
      case 'pullRepo':
        pullRepo(
          {
            name: options.repoName ?? '',
            description: options.description ?? '',
          },
          account,
          localPath
        );
        break;
      case 'sync':
      case 'syncRepo':
        syncRepo(
          {
            name: options.repoName ?? '',
            description: options.description ?? '',
          },
          account,
          localPath
        );
        break;
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();

// github -u mooninlearn -n udemy-test -e makeRepo -d "test makeRepo"

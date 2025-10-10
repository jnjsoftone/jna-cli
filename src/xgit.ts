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
  listRepoIssues,
  createRepoIssue,
  updateRepoIssue,
  listRepoProjects,
  createRepoProject,
  createProjectColumn,
  createProjectCard,
  listRepoWorkflows,
  listWorkflowRuns,
  dispatchWorkflow,
} from './git.js';
import { getCurrentDir } from './cli.js';
import { githubEnv, localEnvRoot } from './env.js';
import path from 'path';

import type { WorkflowRunsOptions } from './types.js';

// & Types AREA
// &---------------------------------------------------------------------------
interface CommandOptions {
  exec: string;
  userName?: string;
  repoName?: string;
  description?: string;
  isPrivate?: boolean;
  location?: string;
  src?: 'github' | 'local';
  title?: string;
  body?: string;
  labels?: string;
  assignees?: string;
  assignee?: string;
  milestone?: number;
  issueNumber?: number;
  state?: 'open' | 'closed' | 'all';
  perPage?: number;
  page?: number;
  projectName?: string;
  columnName?: string;
  projectId?: number;
  columnId?: number;
  note?: string;
  contentId?: number;
  contentType?: 'Issue' | 'PullRequest';
  workflowId?: string;
  ref?: string;
  inputs?: string;
  branch?: string;
  status?: string;
}

// & Variables AREA
// &---------------------------------------------------------------------------
// * cli options
const options = yargs
  .usage('Usage: -e <exec> -u <userName> -n <repoName> [options]')
  .option('e', {
    alias: 'exec',
    default: 'copyRepo',
    describe:
      'exec command: copyRepo(clone+config)/makeRepo(create+push)/removeRepo(delete)/pull(fetch latest)/sync(auto commit+push+pull)/list(repos)/listAll(all accounts repos)/userlist(users)/issues:list/issues:create/issues:update/projects:list/projects:create/projects:create-column/projects:create-card/actions:list-workflows/actions:list-runs/actions:dispatch',
    type: 'string',
    demandOption: true,
  })
  .option('u', {
    alias: 'userName',
    default: 'mooninlearn',
    describe: 'GitHub user or organization name',
    type: 'string',
  })
  .option('n', {
    alias: 'repoName',
    describe: 'Target repository name',
    type: 'string',
  })
  .option('p', {
    alias: 'isPrivate',
    default: false,
    describe: 'Create repository as private',
    type: 'boolean',
  })
  .option('s', {
    alias: 'src',
    default: 'local',
    describe: 'Source of Github Account metadata (local/github)',
    type: 'string',
  })
  .option('d', {
    alias: 'description',
    describe: 'General description for repo/project operations',
    type: 'string',
  })
  .option('l', {
    alias: 'location',
    default: './',
    describe: 'For list commands: comma-separated output files. Otherwise: base directory for repo tasks',
    type: 'string',
  })
  .option('title', {
    describe: 'Title for issues, projects, or columns',
    type: 'string',
  })
  .option('body', {
    describe: 'Body/description for issues or projects',
    type: 'string',
  })
  .option('labels', {
    describe: 'Comma-separated label names',
    type: 'string',
  })
  .option('assignees', {
    describe: 'Comma-separated GitHub usernames to assign',
    type: 'string',
  })
  .option('assignee', {
    describe: 'Single assignee login for filtering issue lists',
    type: 'string',
  })
  .option('milestone', {
    describe: 'Milestone number for issue create/update',
    type: 'number',
  })
  .option('issue-number', {
    describe: 'Issue number for update operations',
    type: 'number',
  })
  .option('state', {
    describe: 'State filter (open|closed|all)',
    type: 'string',
  })
  .option('per-page', {
    describe: 'Pagination size for list APIs',
    type: 'number',
  })
  .option('page', {
    describe: 'Pagination page for list APIs',
    type: 'number',
  })
  .option('project-name', {
    describe: 'Project title for project create commands',
    type: 'string',
  })
  .option('column-name', {
    describe: 'Project column name for column create',
    type: 'string',
  })
  .option('project-id', {
    describe: 'Numeric project ID for column/card operations',
    type: 'number',
  })
  .option('column-id', {
    describe: 'Numeric column ID for card operations',
    type: 'number',
  })
  .option('note', {
    describe: 'Note content for project cards',
    type: 'string',
  })
  .option('content-id', {
    describe: 'GitHub content ID (issue/pull) for project cards',
    type: 'number',
  })
  .option('content-type', {
    describe: "Content type for project cards ('Issue' or 'PullRequest')",
    type: 'string',
  })
  .option('workflow-id', {
    describe: 'Workflow file ID or filename for Actions commands',
    type: 'string',
  })
  .option('ref', {
    describe: 'Git reference (branch/tag) for workflow dispatch',
    type: 'string',
  })
  .option('inputs', {
    describe: 'JSON string of workflow dispatch inputs',
    type: 'string',
  })
  .option('branch', {
    describe: 'Branch filter for workflow runs',
    type: 'string',
  })
  .option('status', {
    describe: 'Status filter for workflow runs',
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

const parseCsv = (value?: string): string[] | undefined => {
  if (!value) {
    return undefined;
  }
  return value
    .split(',')
    .map(token => token.trim())
    .filter(Boolean);
};

const parseWorkflowIdentifier = (value?: string): number | string | undefined => {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  if (/^\d+$/.test(trimmed)) {
    return Number(trimmed);
  }
  return trimmed;
};

const ISSUE_STATE_VALUES = ['open', 'closed', 'all'] as const;
type IssueStateValue = (typeof ISSUE_STATE_VALUES)[number];

const normalizeIssueState = (state?: string): IssueStateValue | undefined => {
  if (!state) {
    return undefined;
  }
  const normalized = state.toLowerCase() as IssueStateValue;
  return ISSUE_STATE_VALUES.includes(normalized) ? normalized : undefined;
};

const PROJECT_STATE_VALUES = ['open', 'closed'] as const;
type ProjectStateValue = (typeof PROJECT_STATE_VALUES)[number];

const normalizeProjectState = (state?: string): ProjectStateValue | undefined => {
  if (!state) {
    return undefined;
  }
  const normalized = state.toLowerCase() as ProjectStateValue;
  return PROJECT_STATE_VALUES.includes(normalized) ? normalized : undefined;
};

const WORKFLOW_STATUS_VALUES: WorkflowRunsOptions['status'][] = [
  'completed',
  'action_required',
  'cancelled',
  'failure',
  'neutral',
  'success',
  'skipped',
  'stale',
  'in_progress',
  'queued',
  'requested',
  'waiting',
  'pending',
];

const normalizeWorkflowStatus = (status?: string): WorkflowRunsOptions['status'] | undefined => {
  if (!status) {
    return undefined;
  }
  const normalized = status.toLowerCase() as WorkflowRunsOptions['status'];
  return WORKFLOW_STATUS_VALUES.includes(normalized) ? normalized : undefined;
};

const normalizeProjectCardContentType = (value?: string): 'Issue' | 'PullRequest' | undefined => {
  if (!value) {
    return undefined;
  }
  const normalized = value.toLowerCase();
  if (normalized === 'issue') {
    return 'Issue';
  }
  if (normalized === 'pullrequest' || normalized === 'pull_request' || normalized === 'pr') {
    return 'PullRequest';
  }
  return undefined;
};

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
  // Check if repos have account information
  const hasAccountInfo = repos.length > 0 && 'account_name' in repos[0];
  
  let markdown = hasAccountInfo 
    ? '| sn | account | name | url | description | created_at | updated_at |\n'
    : '| sn | name | url | description | created_at | updated_at |\n';
  
  markdown += hasAccountInfo
    ? '|----|---------|------|-----|-------------|------------|------------|\n'
    : '|----|------|-----|-------------|------------|------------|\n';
  
  repos.forEach((repo, index) => {
    const sn = index + 1;
    const name = repo.name || '';
    const url = repo.url || '';
    const description = (repo.description || '').replace(/\|/g, '\\|'); // Escape pipe characters
    const createdAt = repo.created_at ? new Date(repo.created_at).toISOString().split('T')[0] : '';
    const updatedAt = repo.updated_at ? new Date(repo.updated_at).toISOString().split('T')[0] : '';
    
    if (hasAccountInfo) {
      const account = (repo as any).account_name || '';
      markdown += `| ${sn} | ${account} | ${name} | ${url} | ${description} | ${createdAt} | ${updatedAt} |\n`;
    } else {
      markdown += `| ${sn} | ${name} | ${url} | ${description} | ${createdAt} | ${updatedAt} |\n`;
    }
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
      console.error(`❌ GitHub 계정 정보를 찾을 수 없습니다: ${options.userName}`);
      console.log(`💡 다음 중 하나를 시도해보세요:`);
      console.log(`   1. 계정 설정: xgit -e setAccount -n "Full Name" -e "email@example.com" -t "토큰" -u "${options.userName}"`);
      console.log(`   2. 다른 계정명으로 시도: xgit -e list -u "다른계정명"`);
      console.log(`   3. 사용 가능한 계정 목록 확인: xgit -e userlist`);
      process.exit(1);
    }

    // GitHub 계정 정보 확인 (userName을 덮어쓰지 않고 그대로 사용)
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
        } catch (error: any) {
          // Check if error is authentication related
          if (error?.status === 401 || error?.message?.includes('Bad credentials')) {
            console.warn(`⚠️  인증 실패로 계정 '${options.userName}' 건너뜀 - 토큰을 업데이트하거나 계정 설정을 확인하세요`);
            console.log(`💡 해결 방법: xgit -e setAccount -n "Full Name" -e "email@example.com" -t "새토큰" -u "${options.userName}"`);
            // Don't exit, just continue with empty result
            result = [];
          } else if (error?.status === 403) {
            console.warn(`⚠️  권한 부족으로 계정 '${options.userName}' 건너뜀 - API 사용량 한도 초과이거나 저장소 접근 권한이 없습니다`);
            result = [];
          } else {
            console.error(`❌ 계정 '${options.userName}' 저장소 목록 조회 중 오류 발생:`, error?.message || error);
            // For other errors, also don't exit - just continue
            result = [];
          }
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
      case 'listAll':
      case 'listAllRepos':
        try {
          const allUsers = await findAllUsers('github');
          if (!allUsers) {
            console.log('❌ No user data found');
            break;
          }
          
          const userNames = Object.keys(allUsers);
          console.log(`🔍 모든 계정 저장소 조회 시작... (총 ${userNames.length}개 계정)`);
          
          let allRepos: any[] = [];
          let successCount = 0;
          let failCount = 0;
          
          for (const userName of userNames) {
            const userAccount = allUsers[userName];
            console.log(`\n📡 ${userName} (${userAccount.email}) 처리 중...`);
            
            try {
              const userOctokit = new Octokit({ auth: userAccount.token });
              const repos = await findAllRepos(userOctokit);
              
              // Add account info to each repo
              const reposWithAccount = repos.map((repo: any) => ({
                ...repo,
                account_name: userName,
                account_email: userAccount.email,
                account_full_name: userAccount.fullName
              }));
              
              allRepos = allRepos.concat(reposWithAccount);
              successCount++;
              console.log(`   ✅ ${repos.length}개 저장소 조회 완료`);
              
            } catch (error: any) {
              failCount++;
              if (error?.status === 401 || error?.message?.includes('Bad credentials')) {
                console.log(`   ⚠️  토큰 인증 실패 - 건너뜀`);
              } else if (error?.status === 403) {
                console.log(`   ⚠️  권한 부족 - 건너뜀`);  
              } else {
                console.log(`   ❌ 오류 발생: ${error?.message || 'Unknown error'}`);
              }
            }
          }
          
          console.log(`\n📊 조회 완료: 성공 ${successCount}개, 실패 ${failCount}개 계정`);
          console.log(`📦 총 ${allRepos.length}개 저장소 발견`);
          
          // Save results to files  
          if (allRepos.length > 0) {
            const outputPaths = options.location && options.location !== './' 
              ? options.location.split(',').map(path => path.trim())
              : ['./_docs/all-repos.md', './_docs/all-repos.json'];
              
            saveRepoDataToFiles(allRepos, outputPaths);
            
            // Show summary
            console.log('\n📋 계정별 저장소 수:');
            const accountStats: Record<string, number> = {};
            allRepos.forEach(repo => {
              const accountName = repo.account_name;
              accountStats[accountName] = (accountStats[accountName] || 0) + 1;
            });
            
            Object.entries(accountStats)
              .sort(([,a], [,b]) => b - a)
              .forEach(([account, count], index) => {
                console.log(`${index + 1}. ${account}: ${count}개`);
              });
          } else {
            console.log('❌ 조회된 저장소가 없습니다.');
          }
          
        } catch (error) {
          console.error('모든 계정 저장소 조회 중 오류 발생:', error);
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
      case 'issues:list':
      case 'issueList': {
        if (!options.repoName) {
          console.error('❌ repoName (-n) is required for issue commands.');
          process.exit(1);
        }
        const repoName = options.repoName;
        const issueState = normalizeIssueState(options.state);
        if (options.state && !issueState) {
          console.warn(`⚠️  Unknown issue state "${options.state}". Using default.`);
        }
        const labels = parseCsv(options.labels);
        const assignee = options.assignee;
        const issues = await listRepoIssues(octokit, {
          owner: account.userName,
          repo: repoName,
          state: issueState,
          labels,
          assignee,
          perPage: options.perPage,
          page: options.page,
        });
        console.log(`📋 Issues for ${repoName}: ${issues.length} found`);
        issues.slice(0, Math.min(issues.length, 10)).forEach((issue: any, idx: number) => {
          console.log(`${idx + 1}. #${issue.number} [${issue.state}] ${issue.title}`);
          console.log(`   url: ${issue.html_url}`);
        });
        if (issues.length > 10) {
          console.log(`... ${issues.length - 10} more issues (use --page/--per-page to paginate)`);
        }
        break;
      }
      case 'issues:create':
      case 'issueCreate': {
        if (!options.repoName) {
          console.error('❌ repoName (-n) is required for issue commands.');
          process.exit(1);
        }
        if (!options.title) {
          console.error('❌ title (--title) is required to create an issue.');
          process.exit(1);
        }
        const repoName = options.repoName;
        const labels = parseCsv(options.labels);
        const assignees = parseCsv(options.assignees);
        const issue = await createRepoIssue(octokit, {
          owner: account.userName,
          repo: repoName,
          title: options.title,
          body: options.body ?? options.description,
          labels,
          assignees,
          milestone: options.milestone,
        });
        console.log(`✅ Issue #${issue.number} created: ${issue.html_url}`);
        break;
      }
      case 'issues:update':
      case 'issueUpdate': {
        if (!options.repoName) {
          console.error('❌ repoName (-n) is required for issue commands.');
          process.exit(1);
        }
        if (typeof options.issueNumber !== 'number') {
          console.error('❌ issue number (--issue-number) is required for issue updates.');
          process.exit(1);
        }
        const repoName = options.repoName;
        const labels = parseCsv(options.labels);
        const assignees = parseCsv(options.assignees);
        const issueState = normalizeIssueState(options.state);
        let updateState: 'open' | 'closed' | undefined;
        if (options.state) {
          if (!issueState || issueState === 'all') {
            console.warn(`⚠️  Issue state must be 'open' or 'closed' for updates. Ignoring value: ${options.state}`);
          } else {
            updateState = issueState;
          }
        }
        const milestone =
          options.milestone !== undefined
            ? options.milestone >= 0
              ? options.milestone
              : null
            : undefined;
        const updatedIssue = await updateRepoIssue(octokit, {
          owner: account.userName,
          repo: repoName,
          issueNumber: options.issueNumber,
          title: options.title,
          body: options.body ?? options.description,
          state: updateState,
          labels,
          assignees,
          milestone,
        });
        console.log(`✅ Issue #${updatedIssue.number} updated: ${updatedIssue.html_url}`);
        break;
      }
      case 'projects:list':
      case 'projectList': {
        if (!options.repoName) {
          console.error('❌ repoName (-n) is required for project commands.');
          process.exit(1);
        }
        const repoName = options.repoName;
        let projects: any[] = [];
        if (options.state && options.state.toLowerCase() === 'all') {
          const [openProjects, closedProjects] = await Promise.all([
            listRepoProjects(octokit, {
              owner: account.userName,
              repo: repoName,
              state: 'open',
              perPage: options.perPage,
            }),
            listRepoProjects(octokit, {
              owner: account.userName,
              repo: repoName,
              state: 'closed',
              perPage: options.perPage,
            }),
          ]);
          projects = [...openProjects, ...closedProjects];
        } else {
          const projectState = normalizeProjectState(options.state);
          if (options.state && !projectState) {
            console.warn(`⚠️  Project state must be 'open', 'closed', or 'all'. Ignoring value: ${options.state}`);
          }
          projects = await listRepoProjects(octokit, {
            owner: account.userName,
            repo: repoName,
            state: projectState,
            perPage: options.perPage,
          });
        }
        console.log(`📂 Projects for ${repoName}: ${projects.length} found`);
        projects.forEach((project: any, idx: number) => {
          console.log(`${idx + 1}. [${project.state}] ${project.name} (id: ${project.id})`);
          if (project.html_url) {
            console.log(`   url: ${project.html_url}`);
          }
        });
        break;
      }
      case 'projects:create':
      case 'projectCreate': {
        if (!options.repoName) {
          console.error('❌ repoName (-n) is required for project commands.');
          process.exit(1);
        }
        const projectName = options.projectName || options.title;
        if (!projectName) {
          console.error('❌ Provide a project name via --project-name or --title.');
          process.exit(1);
        }
        const project = await createRepoProject(octokit, {
          owner: account.userName,
          repo: options.repoName,
          name: projectName,
          body: options.body ?? options.description,
        });
        console.log(`✅ Project created: ${project.name} (id: ${project.id})`);
        if (project.html_url) {
          console.log(`   url: ${project.html_url}`);
        }
        break;
      }
      case 'projects:create-column':
      case 'projectCreateColumn': {
        if (typeof options.projectId !== 'number') {
          console.error('❌ project id (--project-id) is required for column creation.');
          process.exit(1);
        }
        const columnName = options.columnName || options.title;
        if (!columnName) {
          console.error('❌ Column name is required via --column-name or --title.');
          process.exit(1);
        }
        const column = await createProjectColumn(octokit, {
          projectId: options.projectId,
          name: columnName,
        });
        console.log(`✅ Column created: ${column.name} (id: ${column.id})`);
        break;
      }
      case 'projects:create-card':
      case 'projectCreateCard': {
        if (typeof options.columnId !== 'number') {
          console.error('❌ column id (--column-id) is required for card creation.');
          process.exit(1);
        }
        if (!options.note && options.contentId === undefined) {
          console.error('❌ Provide either --note or both --content-id and --content-type for project cards.');
          process.exit(1);
        }
        const contentType = normalizeProjectCardContentType(options.contentType);
        if (options.contentId !== undefined && !contentType) {
          console.error('❌ --content-type must be Issue or PullRequest when --content-id is supplied.');
          process.exit(1);
        }
        const card = await createProjectCard(octokit, {
          columnId: options.columnId,
          note: options.note,
          contentId: options.contentId,
          contentType,
        });
        console.log(`✅ Card created in column ${options.columnId} (id: ${card.id})`);
        break;
      }
      case 'actions:list-workflows':
      case 'actions:listWorkflows':
      case 'workflow:list': {
        if (!options.repoName) {
          console.error('❌ repoName (-n) is required for Actions commands.');
          process.exit(1);
        }
        const workflows = await listRepoWorkflows(octokit, {
          owner: account.userName,
          repo: options.repoName,
          perPage: options.perPage,
          page: options.page,
        });
        if (!workflows || workflows.length === 0) {
          console.log(`ℹ️  No workflows found for ${options.repoName}.`);
          break;
        }
        workflows.forEach((workflow: any) => {
          console.log(`#${workflow.id} ${workflow.name} [${workflow.state}] - ${workflow.path}`);
        });
        break;
      }
      case 'actions:list-runs':
      case 'actions:listRuns':
      case 'workflow:runs': {
        if (!options.repoName) {
          console.error('❌ repoName (-n) is required for Actions commands.');
          process.exit(1);
        }
        const runStatus = normalizeWorkflowStatus(options.status);
        if (options.status && !runStatus) {
          console.warn(`⚠️  Unknown workflow status "${options.status}". Ignoring filter.`);
        }
        const workflowId = parseWorkflowIdentifier(options.workflowId);
        const runs = await listWorkflowRuns(octokit, {
          owner: account.userName,
          repo: options.repoName,
          workflowId,
          branch: options.branch,
          status: runStatus,
          perPage: options.perPage,
          page: options.page,
        });
        if (!runs || runs.length === 0) {
          console.log(`ℹ️  No workflow runs found for ${options.repoName}.`);
          break;
        }
        runs.forEach((run: any) => {
          const conclusion = run.conclusion ? `/${run.conclusion}` : '';
          console.log(`#${run.id} ${run.name} @ ${run.head_branch} [${run.status}${conclusion}]`);
          console.log(`   event=${run.event} updated=${run.updated_at}`);
          console.log(`   url: ${run.html_url}`);
        });
        break;
      }
      case 'actions:dispatch':
      case 'workflow:dispatch': {
        if (!options.repoName) {
          console.error('❌ repoName (-n) is required for Actions commands.');
          process.exit(1);
        }
        const workflowId = parseWorkflowIdentifier(options.workflowId);
        if (!workflowId) {
          console.error('❌ workflow id (--workflow-id) is required for dispatch.');
          process.exit(1);
        }
        if (!options.ref) {
          console.error('❌ ref (--ref) is required for workflow dispatch.');
          process.exit(1);
        }
        let inputs: Record<string, any> | undefined;
        if (options.inputs) {
          try {
            const parsed = JSON.parse(options.inputs);
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
              inputs = parsed;
            } else {
              console.error('❌ --inputs must be a JSON object.');
              process.exit(1);
            }
          } catch (error: any) {
            console.error(`❌ Failed to parse --inputs JSON: ${error?.message || error}`);
            process.exit(1);
          }
        }
        await dispatchWorkflow(octokit, {
          owner: account.userName,
          repo: options.repoName,
          workflowId,
          ref: options.ref,
          inputs,
        });
        console.log(`✅ Workflow dispatched for ${options.repoName} (${String(workflowId)}) on ${options.ref}`);
        break;
      }
    }
  } catch (error: any) {
    // Handle different types of errors more gracefully
    if (error?.status === 401 || error?.message?.includes('Bad credentials')) {
      console.error(`❌ 인증 실패: GitHub 토큰이 유효하지 않습니다. 계정: ${options.userName}`);
      console.log(`💡 해결 방법: 새로운 GitHub Personal Access Token을 생성하고 설정하세요`);
      console.log(`   xgit -e setAccount -n "Full Name" -e "email@example.com" -t "새토큰" -u "${options.userName}"`);
      process.exit(1);
    } else if (error?.status === 403) {
      console.error(`❌ 권한 부족: API 사용량 한도 초과이거나 저장소 접근 권한이 없습니다. 계정: ${options.userName}`);
      process.exit(1);  
    } else if (!options.userName || options.userName === '') {
      console.error(`❌ 사용자명이 제공되지 않았습니다. -u 옵션을 사용하여 사용자명을 지정하세요`);
      process.exit(1);
    } else {
      console.error(`❌ 예기치 않은 오류 발생:`, error?.message || error);
      console.log(`🔧 문제가 지속되면 다음을 확인하세요:`);
      console.log(`   1. 인터넷 연결 상태`);
      console.log(`   2. GitHub 서비스 상태`);
      console.log(`   3. 계정 설정 및 토큰 유효성`);
      process.exit(1);
    }
  }
})();

// github -u mooninlearn -n udemy-test -e makeRepo -d "test makeRepo"

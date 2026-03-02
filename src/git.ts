/** Github
 * References
 *   - [create repository](https://octokit.github.io/rest.js/v19#repos-create-for-authenticated-user)
 */

// & Import AREA
// &---------------------------------------------------------------------------
import Path from 'path';

// ? External Modules
import { execSync } from 'child_process';
import { Octokit } from '@octokit/rest';

// ? Internal Modules
import { sleep, loadJson } from 'jnu-abc';
import { readJsonFromGithub } from 'jnu-cloud';
import { PLATFORM } from './cli.js';
import { githubEnv, localEnvRoot } from './env.js';

// & Types AREA
// &---------------------------------------------------------------------------
import type {
  GithubAccount,
  RepoOptions,
  IssueListOptions,
  IssueCreateOptions,
  IssueUpdateOptions,
  ProjectListOptions,
  ProjectCreateOptions,
  ProjectColumnOptions,
  ProjectCardOptions,
  WorkflowDispatchOptions,
  WorkflowListOptions,
  WorkflowRunsOptions,
} from './types.js';

// & Variables AREA
// &---------------------------------------------------------------------------

// & Functions AREA
// &---------------------------------------------------------------------------

const exec = (cmd: string, options: any = {}) => {
  // 기본값 설정 및 객체 구조 분해
  let { wait = 0, msg = '', echo = true } = options;
  if (echo) {
    msg = msg || cmd;
    console.log(`Command: ${msg}`);
  }
  try {
    execSync(cmd);
    sleep(wait);
  } catch (error) {
    console.log('EXEC Error: ', error);
  }
};

/**
 * Github 계정 정보 조회
 * @param userName - Github 사용자명
 * @returns Github 계정 정보
 *
 * @example
 * ```ts
 * const account = findGithubAccount('username');
 * ```
 */
const findGithubAccount = async (userName: string, src = 'github'): Promise<GithubAccount | undefined> => {
  const { ENV_GITHUB_OWNER, ENV_GITHUB_REPO, ENV_GITHUB_TOKEN } = process.env;

  const githubEnv = {
    owner: process.env.ENV_GITHUB_OWNER || '',
    repo: process.env.ENV_GITHUB_REPO || '',
    token: process.env.ENV_GITHUB_TOKEN || '',
  };

  try {
    if (src === 'local') {
      const accounts = await loadJson(`${localEnvRoot}/Apis/github.json`);
      const account = accounts?.[userName];
      if (account) {
        account.userName = account.userName ?? userName;
      }
      return account;
    } else if (src === 'github') {
      // console.log(`### userName: ${userName}  githubEnv: ${JSON.stringify(githubEnv)}`);
      const res = await readJsonFromGithub('Apis/github.json', githubEnv);
      // console.log(`### readJsonFromGithub: ${JSON.stringify(res)} res[userName]: ${res[userName]}`);
      const account = res?.[userName];
      if (account) {
        account.userName = account.userName ?? userName;
      }
      return account;
    }
    return undefined;
  } catch (error) {
    console.error('GitHub 계정 정보를 가져오는 중 오류가 발생했습니다:', error);
    // 환경변수에서 직접 가져오기 시도
    if (process.env.ENV_GITHUB_OWNER && process.env.ENV_GITHUB_TOKEN) {
      return {
        userName: process.env.ENV_GITHUB_OWNER,
        fullName: process.env.ENV_GITHUB_OWNER,
        email: process.env.ENV_GITHUB_EMAIL ?? '',
        token: process.env.ENV_GITHUB_TOKEN,
      };
    }
    return undefined;
  }
};

/**
 * 모든 저장소 목록 조회
 */
const findAllRepos = async (octokit: Octokit) => {
  try {
    const response = await octokit.rest.repos.listForAuthenticatedUser({
      per_page: 100, // 페이지당 결과 수
      sort: 'updated', // 업데이트 순으로 정렬
    });
    return response.data;
  } catch (error: any) {
    // Preserve original error for caller to handle
    throw error;
  }
};

/**
 * 새 저장소 생성
 */
const createRemoteRepo = (octokit: Octokit, options: RepoOptions) => {
  console.log('####@@@@@ createRemoteRepo options: ', options);
  const { name, description, isPrivate } = options;

  return octokit.rest.repos.createForAuthenticatedUser({
    name,
    description,
    private: isPrivate, // true로 설정하면 private 저장소가 됨
    auto_init: true,
  });
};

/**
 * 저장소 삭제
 */
const deleteRemoteRepo = (octokit: Octokit, options: RepoOptions, account: GithubAccount) => {
  const { name } = options;
  console.log(`### deleteRemoteRepo: ${name}`);
  return octokit.rest.repos.delete({
    owner: account.userName,
    repo: name,
  });
};

/**
 * Git 설정 변경
 */
const setLocalConfig = (options: RepoOptions, account: GithubAccount, localPath: string) => {
  let cmd = `cd ${localPath} && git config user.name "${account.fullName}"`;
  cmd += ` && git config user.email "${account.email}"`;
  cmd += ` && git remote set-url origin https://${account.token}@github.com/${account.userName}/${options.name}.git`;
  exec(cmd);
};

/**
 * 로컬 저장소 초기화
 */
const initLocalRepo = async (options: RepoOptions, account: GithubAccount, localPath: string) => {
  const { name } = options;
  const { fullName, email, token, userName } = account;

  // if (PLATFORM != 'win') {
  //   exec(`cd ${localPath} && chmod 777 -R ${localPath}`, { wait: 1 });
  // }

  let cmd = '';
  exec(`cd ${localPath} && git init && git config --global --add safe.directory ${localPath}`, { wait: 1 });

  try {
    exec(`cd ${localPath} && git branch -m master main`, { wait: 2 });
  } catch (error) {
    console.log('####@@@@@===== error: ', error);
  }

  cmd = `cd ${localPath} && git config user.name "${fullName}"`;
  cmd += ` && git config user.email "${email}"`;
  cmd += ` && git remote add origin https://${token}@github.com/${userName}/${name}.git`;
  // cmd += ` && git remote set-url origin https://${account.token}@github.com/${account.userName}/${options.name}.git`;
  const commitMessage = options.description || "Initial commit";
  cmd += ` && git add . && git commit -m "${commitMessage}"`;
  exec(cmd, { wait: 10 });
};

/**
 * 저장소 복제
 */
const cloneRepo = (options: RepoOptions, account: GithubAccount, localPath: string) => {
  const cmd = `cd ${Path.dirname(localPath)} && git clone https://${account.token}@github.com/${account.userName}/${
    options.name
  }.git`;
  exec(cmd);
};

/**
 * 저장소 초기화 (생성, 복제, 설정)
 */
const initRepo = (octokit: Octokit, options: RepoOptions, account: GithubAccount, localPath: string) => {
  // createRemoteRepo(octokit, options); // !! 원격 저장소 생성 안됨
  let cmd = `xgit -e createRemoteRepo -u ${account.userName} -n ${options.name} -d "${options.description}" -p ${options.isPrivate}`;
  exec(cmd, { wait: 10, msg: `initRepo ${cmd}` });
  cloneRepo(options, account, localPath);
  sleep(5);
  setLocalConfig(options, account, localPath);
};

/**
 * 저장소 복제 및 설정
 */
const copyRepo = (options: RepoOptions, account: GithubAccount, localPath: string) => {
  cloneRepo(options, account, localPath);
  sleep(10);
  setLocalConfig(options, account, localPath);
};

/**
 * 저장소에 변경사항 푸시
 */
const pushRepo = (options: RepoOptions, account: GithubAccount, localPath: string) => {
  // 변경사항이 있는지 확인
  const status = execSync(`cd ${localPath} && git status --porcelain`, { encoding: 'utf8' });

  // 변경사항이 있으면 커밋
  if (status.length > 0) {
    const commitMessage = options.description || "Initial commit";
    const cmd = `cd ${localPath} && git add . && git commit -m "${commitMessage}"`;
    exec(cmd, { msg: `pushRepo ${cmd}` });
  }

  const branches = execSync(`cd ${localPath} && git branch`);
  console.log(`#### pushRepo branches: ${branches}`);

  if (branches.includes('main')) {
    exec(`cd ${localPath} && git push -u origin main --force`);
  } else if (branches.includes('master')) {
    exec(`cd ${localPath} && git push -u origin master --force`);
  } else {
    console.log('main 또는 master 브랜치가 없습니다.');
  }
};

/**
 * 새 저장소 생성 및 초기 커밋
 */
const makeRepo = (octokit: Octokit, options: RepoOptions, account: GithubAccount, localPath: string) => {
  // // 빈 저장소 생성
  // createRemoteRepo(octokit, options);
  console.log('####@@@@@===== makeRepo options: ', JSON.stringify(options));
  let cmd = `xgit -e createRemoteRepo -u ${account.userName} -n ${options.name} -d "${options.description}" -p ${options.isPrivate}`;
  exec(cmd, { wait: 10 });
  // 로컬 저장소 초기화
  console.log(`=================== initLocalRepo: ${localPath}`);
  initLocalRepo(options, account, localPath);
  sleep(15);
  // 초기 커밋 및 푸시
  console.log(`=================== pushRepo: ${localPath}`);
  pushRepo(options, account, localPath);
};

/**
 * 로컬 + 원격 저장소 삭제
 */
const removeRepo = (octokit: Octokit, options: RepoOptions, account: GithubAccount, localPath: string) => {
  deleteRemoteRepo(octokit, options, account);
  sleep(10);
  const { name } = options;

  if (PLATFORM === 'win') {
    // Windows에서는 각 명령어를 개별적으로 실행
    try {
      const cdCmd = `cd ${Path.dirname(localPath)}`;
      exec(cdCmd);

      const rmCmd = `rmdir /s /q ${name}`;
      exec(rmCmd);
    } catch (error) {
      console.error('Failed to remove directory:', error);
      // 실패 시 대체 방법 시도
      try {
        const altCmd = `rd /s /q "${localPath}"`;
        exec(altCmd);
      } catch (err) {
        console.error('Alternative removal also failed:', err);
      }
    }
  } else {
    // Unix 계열은 한 번에 실행
    const cmd = `cd ${Path.dirname(localPath)} && rm -rf ${name}`;
    exec(cmd);
  }
};

/**
 * 저장소에서 최신 변경사항을 가져오기 (pull)
 */
const pullRepo = (options: RepoOptions, account: GithubAccount, localPath: string) => {
  try {
    // 현재 브랜치 확인
    const currentBranch = execSync(`cd ${localPath} && git rev-parse --abbrev-ref HEAD`, { encoding: 'utf8' }).trim();
    console.log(`📥 Pulling latest changes from ${currentBranch} branch...`);
    
    // 원격 저장소에서 최신 변경사항 가져오기
    const cmd = `cd ${localPath} && git pull origin ${currentBranch}`;
    exec(cmd, { msg: `pullRepo: ${cmd}` });
    
    console.log('✅ Pull completed successfully!');
  } catch (error) {
    console.error('❌ Pull failed:', error);
    throw error;
  }
};

/**
 * 로컬과 원격 저장소 동기화 (sync)
 * - 로컬 변경사항이 있으면 커밋 후 푸시
 * - 원격 변경사항이 있으면 풀
 */
const syncRepo = (options: RepoOptions, account: GithubAccount, localPath: string) => {
  try {
    console.log('🔄 Starting repository synchronization...');
    
    // 현재 브랜치 확인
    const currentBranch = execSync(`cd ${localPath} && git rev-parse --abbrev-ref HEAD`, { encoding: 'utf8' }).trim();
    console.log(`📍 Current branch: ${currentBranch}`);
    
    // 작업 디렉토리 상태 확인
    const status = execSync(`cd ${localPath} && git status --porcelain`, { encoding: 'utf8' });
    
    // 로컬 변경사항이 있는 경우 커밋
    if (status.length > 0) {
      console.log('📝 Local changes detected, committing...');
      const commitMessage = options.description || `Auto-sync: ${new Date().toISOString()}`;
      const commitCmd = `cd ${localPath} && git add . && git commit -m "${commitMessage}"`;
      exec(commitCmd, { msg: `syncRepo commit: ${commitCmd}` });
    } else {
      console.log('📋 No local changes to commit');
    }
    
    // 원격 저장소에서 최신 변경사항 가져오기
    console.log('📥 Fetching from remote...');
    exec(`cd ${localPath} && git fetch origin ${currentBranch}`, { msg: 'syncRepo fetch' });
    
    // 원격과 로컬의 차이 확인
    try {
      const ahead = execSync(`cd ${localPath} && git rev-list --count HEAD..origin/${currentBranch}`, { encoding: 'utf8' }).trim();
      const behind = execSync(`cd ${localPath} && git rev-list --count origin/${currentBranch}..HEAD`, { encoding: 'utf8' }).trim();
      
      console.log(`📊 Repository status: ${behind} commits ahead, ${ahead} commits behind`);
      
      // 원격에 새로운 변경사항이 있는 경우 풀
      if (parseInt(ahead) > 0) {
        console.log('📥 Pulling remote changes...');
        exec(`cd ${localPath} && git pull origin ${currentBranch}`, { msg: 'syncRepo pull' });
      }
      
      // 로컬에 푸시할 변경사항이 있는 경우 푸시
      if (parseInt(behind) > 0) {
        console.log('📤 Pushing local changes...');
        exec(`cd ${localPath} && git push origin ${currentBranch}`, { msg: 'syncRepo push' });
      }
      
      if (parseInt(ahead) === 0 && parseInt(behind) === 0) {
        console.log('✅ Repository is already up to date!');
      } else {
        console.log('✅ Synchronization completed successfully!');
      }
      
    } catch (error) {
      // 원격 브랜치가 없는 경우 (첫 푸시)
      console.log('📤 Pushing to remote (first time)...');
      exec(`cd ${localPath} && git push -u origin ${currentBranch}`, { msg: 'syncRepo initial push' });
      console.log('✅ Initial push completed successfully!');
    }
    
  } catch (error) {
    console.error('❌ Sync failed:', error);
    throw error;
  }
};


/**
 * 저장소 이슈 목록 조회
 */
const listRepoIssues = async (octokit: Octokit, options: IssueListOptions) => {
  const { owner, repo, state = 'open', labels, assignee, perPage = 30, page = 1 } = options;
  const response = await octokit.rest.issues.listForRepo({
    owner,
    repo,
    state,
    labels: labels && labels.length > 0 ? labels.join(',') : undefined,
    assignee,
    per_page: perPage,
    page,
  });
  return response.data;
};

/**
 * 저장소 이슈 생성
 */
const createRepoIssue = async (octokit: Octokit, options: IssueCreateOptions) => {
  const { owner, repo, title, body, labels, assignees, milestone } = options;
  const response = await octokit.rest.issues.create({
    owner,
    repo,
    title,
    body,
    labels,
    assignees,
    milestone,
  });
  return response.data;
};

/**
 * 저장소 이슈 업데이트 (상태/내용)
 */
const updateRepoIssue = async (octokit: Octokit, options: IssueUpdateOptions) => {
  const { owner, repo, issueNumber, title, body, state, labels, assignees, milestone } = options;
  const response = await octokit.rest.issues.update({
    owner,
    repo,
    issue_number: issueNumber,
    title,
    body,
    state,
    labels,
    assignees,
    milestone,
  });
  return response.data;
};

/**
 * 저장소 프로젝트 목록 조회
 */
const listRepoProjects = async (octokit: Octokit, options: ProjectListOptions) => {
  const { owner, repo, state = 'open', perPage = 30 } = options;
  const response = await octokit.rest.projects.listForRepo({
    owner,
    repo,
    state,
    per_page: perPage,
  });
  return response.data;
};

/**
 * 저장소 프로젝트 생성
 */
const createRepoProject = async (octokit: Octokit, options: ProjectCreateOptions) => {
  const { owner, repo, name, body } = options;
  const response = await octokit.rest.projects.createForRepo({
    owner,
    repo,
    name,
    body,
  });
  return response.data;
};

/**
 * 프로젝트 컬럼 생성
 */
const createProjectColumn = async (octokit: Octokit, options: ProjectColumnOptions) => {
  const { projectId, name } = options;
  const response = await octokit.rest.projects.createColumn({
    project_id: projectId,
    name,
  });
  return response.data;
};

/**
 * 프로젝트 카드 생성 (이슈/PR 연결 또는 노트 추가)
 */
const createProjectCard = async (octokit: Octokit, options: ProjectCardOptions) => {
  const { columnId, note, contentId, contentType } = options;
  if (note) {
    const response = await octokit.rest.projects.createCard({
      column_id: columnId,
      note,
    });
    return response.data;
  }
  if (!contentId || !contentType) {
    throw new Error('Project card requires either a note or a content reference');
  }
  const response = await octokit.rest.projects.createCard({
    column_id: columnId,
    content_id: contentId,
    content_type: contentType,
  });
  return response.data;
};

/**
 * 저장소 워크플로 목록 조회
 */
const listRepoWorkflows = async (octokit: Octokit, options: WorkflowListOptions) => {
  const { owner, repo, perPage = 30, page = 1 } = options;
  const response = await octokit.rest.actions.listRepoWorkflows({
    owner,
    repo,
    per_page: perPage,
    page,
  });
  return response.data.workflows;
};

/**
 * 워크플로 실행 이력 조회
 */
const listWorkflowRuns = async (octokit: Octokit, options: WorkflowRunsOptions) => {
  const { owner, repo, workflowId, branch, status, perPage = 30, page = 1 } = options;
  if (workflowId) {
    const response = await octokit.rest.actions.listWorkflowRuns({
      owner,
      repo,
      workflow_id: workflowId,
      branch,
      status,
      per_page: perPage,
      page,
    });
    return response.data.workflow_runs;
  }
  const response = await octokit.rest.actions.listWorkflowRunsForRepo({
    owner,
    repo,
    branch,
    status,
    per_page: perPage,
    page,
  });
  return response.data.workflow_runs;
};

/**
 * 워크플로 수동 실행 (dispatch)
 */
const dispatchWorkflow = async (octokit: Octokit, options: WorkflowDispatchOptions) => {
  const { owner, repo, workflowId, ref, inputs } = options;
  await octokit.rest.actions.createWorkflowDispatch({
    owner,
    repo,
    workflow_id: workflowId,
    ref,
    inputs,
  });
};


/**
 * Github 사용자 목록 조회
 * @param src - 데이터 소스 ('github' | 'local')
 * @returns Github 사용자 목록
 */
const findAllUsers = async (src = 'github'): Promise<Record<string, GithubAccount> | undefined> => {
  try {
    if (src === 'local') {
      const accounts = await loadJson(`${localEnvRoot}/Apis/github.json`);
      return accounts;
    } else if (src === 'github') {
      const res = await readJsonFromGithub('Apis/github.json', githubEnv);
      return res as Record<string, GithubAccount>;
    }
    return undefined;
  } catch (error) {
    console.error('GitHub 사용자 목록을 가져오는 중 오류가 발생했습니다:', error);
    return undefined;
  }
};

// & Export AREA
// &---------------------------------------------------------------------------
export {
  findGithubAccount,
  findAllUsers,
  findAllRepos,
  createRemoteRepo,
  deleteRemoteRepo,
  cloneRepo,
  setLocalConfig,
  initLocalRepo,
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
};

import { readJsonFromGithub } from 'jnu-cloud';
// import { findGithubAccount } from '../esm/git.js';

// const account = await findGithubAccount('jnjsoftweb');
// console.log(`account: ${JSON.stringify(account)}`);

const findGithubAccount = async (userName, src = 'github') => {
  const { ENV_GITHUB_OWNER, ENV_GITHUB_REPO, ENV_GITHUB_TOKEN } = process.env;
  const githubEnv = {
    owner: process.env.ENV_GITHUB_OWNER || '',
    repo: process.env.ENV_GITHUB_REPO || '',
    token: process.env.ENV_GITHUB_TOKEN || '',
  };

  try {
    if (src === 'local') {
      const accounts = await loadJson(`${localEnvRoot}/Apis/github.json`);
      return accounts?.[userName];
    } else if (src === 'github') {
      // console.log(`### userName: ${userName}  githubEnv: ${JSON.stringify(githubEnv)}`);
      const res = await readJsonFromGithub('Apis/github.json', githubEnv);
      // console.log(`### readJsonFromGithub: ${JSON.stringify(res)} res[userName]: ${res[userName]}`);
      return res?.[userName];
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

// const githubEnv = {
//   owner: process.env.ENV_GITHUB_OWNER,
//   repo: process.env.ENV_GITHUB_REPO,
//   token: process.env.ENV_GITHUB_TOKEN,
// };

// const res = await readJsonFromGithub('Apis/github.json', githubEnv);
// console.log(`res: ${JSON.stringify(res)}`);

const account = await findGithubAccount('jnjsoftweb');
console.log(`account: ${JSON.stringify(account)}`);

const githubEnv = {
  owner: process.env.ENV_GITHUB_OWNER || '',
  repo: process.env.ENV_GITHUB_REPO || '',
  token: process.env.ENV_GITHUB_TOKEN || '',
};

const localEnvRoot = process.env.DEV_ROOT
  ? `${process.env.DEV_ROOT}/jd-environments`
  : 'C:/JnJ/Developments/jd-environments';

export { githubEnv, localEnvRoot };

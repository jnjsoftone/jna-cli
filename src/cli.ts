import { execSync, ExecSyncOptionsWithStringEncoding } from 'child_process';
import Path from 'path';
import { copyFolderToLocal } from 'jnu-cloud';
import {
  PLATFORM,
  sleep,
  composeHangul,
  makeDir,
  copyDir,
  loadJson,
  saveJson,
  loadFile,
  saveFile,
  loadEnv,
  saveEnv,
  findFiles,
  findFolders,
  deleteFilesInFolder,
  renameFilesInFolder,
  substituteInFile,
} from 'jnu-abc';
import { findGithubAccount } from './git.js';
import { githubEnv } from './env.js';
import type { ExecResult, ExecResults, CliOptions } from './types.js';
import fs from 'fs';

// & Variables AREA
// &---------------------------------------------------------------------------
const TEMPLATES_FOLDER = 'jd-environments/Templates';

// Windows 실행 옵션에 코드페이지 변경 명령 추가
const execOptions: ExecSyncOptionsWithStringEncoding = {
  encoding: 'utf8',
  shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/sh',
};

// & Sub Functions AREA
// &---------------------------------------------------------------------------
/**
 * 현재 디렉토리 경로 반환
 */
const getCurrentDir = (): string => {
  switch (PLATFORM) {
    case 'win':
      // Windows에서는 별도로 chcp 명령 실행 후 cd 실행
      execSync('chcp 65001>nul', { shell: 'cmd.exe' });
      return execSync('cd', execOptions).toString().trim().replace(/\\/g, '/');
    default:
      return execSync('pwd', execOptions).toString().trim();
  }
};

/**
 * 현재 디렉토리의 부모 디렉토리 경로 반환
 */
const getParentDir = (): string => {
  switch (PLATFORM) {
    case 'win':
      // Windows에서는 별도로 chcp 명령 실행 후 cd 실행
      execSync('chcp 65001>nul', { shell: 'cmd.exe' });
      return Path.dirname(execSync('cd', execOptions).toString().trim().replace(/\\/g, '/'));
    default:
      return Path.dirname(execSync('pwd', execOptions).toString().trim());
  }
};

const addWildCard = (name: string): string => {
  return name.endsWith('/') ? '*/' + name + '*' : '*/' + name;
};

/**
 * publish.bat/sh 파일 내용 치환
 * @param repoName
 * @param platform ('win' | 'mac')
 * @param replacements
 */
const substitutePublishFile = (repoName: string, platform: string, replacements: Record<string, string>) => {
  const env = loadEnv(`${repoName}/.env.${platform}`);
  // console.log(`@@@@ env: ${JSON.stringify(env)}`);
  if (env) {
    const publishFile = platform === 'win' ? 'publish.bat' : 'publish.sh';
    const replacements2 = Object.entries(env)
      .map(([key, value]) => ({
        [`{{${key}}}`]: String(value),
      }))
      .reduce<Record<string, string>>((acc, curr) => ({ ...acc, ...curr }), {});
    // console.log(`@@@@ replacements2: ${JSON.stringify(replacements2)}, @@@ file: ${publishFile}`);

    substituteInFile(`${repoName}/${publishFile}`, { ...replacements, ...replacements2 });
  }
};

// & Functions AREA
// &---------------------------------------------------------------------------

// * Command Execution Functions
/**
 * 단일 명령어 실행
 * @param cmd 실행할 명령어
 * @returns 명령어 실행 결과
 *
 * @example
 * ```ts
 * exec('ls -la') // 디렉토리 목록 출력
 * exec('echo "Hello"') // 'Hello'
 * exec('pwd') // 현재 작업 디렉토리 경로
 * ```
 */
const exec = (cmd: string): ExecResult => {
  const result = execSync(cmd, { encoding: 'utf8' });
  return result ? result.toString().trim() : '';
};

/**
 * 여러 명령어 순차 실행
 * @param cmds 실행할 명령어 배열
 * @returns 각 명령어의 실행 결과 배열
 *
 * @example
 * ```ts
 * exe(['pwd', 'ls -la']) // [현재 경로, 디렉토리 목록]
 * exe(['echo "Hello"', 'echo "World"']) // ['Hello', 'World']
 * ```
 */
const exe = (cmds: string[]): ExecResults => {
  const results: string[] = [];
  cmds.forEach((cmd) => results.push(exec(cmd)));
  return results;
};

// * Main Functions
// &---------------------------------------------------------------------------
/**
 * TypeScript App 초기화
 * src: template 출처(github, local)
 */
const initTsApp = async (options: any, platform: string = PLATFORM, src = 'github') => {
  const { template, repoName, userName, description } = options;
  const { fullName, email } = await findGithubAccount(userName ?? '');
  const parentDir = getParentDir();
  const currentDir = getCurrentDir();

  let cmd = '';

  if (src === 'github') {
    // github에서 템플릿 복사 (Templates/repoName, repoName)
    // await copyFolderToLocal(TEMPLATES_FOLDER.split('/'), repoName, githubEnv);
    console.log(`### Copy from Github to Local: Templates/${template} => ${repoName}`)
    await copyFolderToLocal(`Templates/${template}`, repoName, githubEnv);
  } else if (src === 'local') {
    const TEMPLATES_ROOT = process.env.DEV_ROOT
      ? `${process.env.DEV_ROOT}/${TEMPLATES_FOLDER}`
      : 'C:/JnJ/Developments/jd-environments/Templates';
    if (platform === 'win') {
      cmd = `xcopy "${TEMPLATES_ROOT}\\${template}" "${repoName}\\" /E /I /H /Y`;
      execSync(cmd, execOptions);
    } else {
      cmd = `cp -r ${TEMPLATES_ROOT}/${template} ${repoName}`;
      execSync(cmd, execOptions);
    }
  }

  // * 파일 치환
  const files = [
    `${repoName}/package.json`,
    `${repoName}/README.md`,
    `${repoName}/docs/workflow.md`,
    `${repoName}/manifest.json`,
    `${repoName}/publish.sh`,
    `${repoName}/publish.bat`,
  ];

  let replacements = {
    '{{name}}': repoName ?? '',
    '{{project-name}}': repoName ?? '',
    '{{author}}': `${fullName} <${email}>`,
    '{{github-id}}': userName ?? '',
    '{{description}}': description || '',
    '{{parent-dir}}': parentDir,
    '{{current-dir}}': currentDir,
  };

  for (const file of files) {
    substituteInFile(file, replacements);
  }

  // ** publish file 설정
  if (!template.includes('simple')) {
    for (const pf of ['win', 'mac']) {
      substitutePublishFile(repoName, pf, replacements);
    }
  }

  // * 패키지 설치
  cmd = `cd ${currentDir}/${repoName} && npm install`;
  console.log(cmd);
  execSync(cmd, execOptions);

  // * 원격 저장소 생성
  cmd = `cd ${currentDir}/${repoName} && xgit -e makeRepo -u ${userName} -n ${repoName} -d "${description}"`;
  console.log(cmd);
  execSync(cmd, execOptions);

  return options;
};

/**
 * 앱 제거 (로컬 + 원격 저장소)
 */
const removeApp = (options: any) => {
  execSync(`xgit -e deleteRemoteRepo -u ${options.userName} -n ${options.repoName}`, execOptions);
  if (PLATFORM === 'win') {
    execSync(`rmdir /s /q ${options.repoName}`, execOptions);
  } else {
    execSync(`rm -rf ${options.repoName}`, execOptions);
  }

  return options;
};

/**
 * 템플릿 기반 앱 초기화
 */
const initApp = async (options: any) => {
  const { template, repoName, userName, description } = options;

  switch (template) {
    case 'node-simple':
      break;
    case 'ts-swc-npm':
    case 'ts-swc-simple':
    case 'ts-webpack-obsidianPlugin':
      await initTsApp(options);
      break;
    case 'python-pipenv':
      break;
    case 'flutter':
      break;
  }
  return options;
};

/**
 * 로컬 프로젝트 압축
 */
const zip = (folderPath: string, excluded: string) => {
  try {
    // 절대 경로로 변환
    const absolutePath = Path.resolve(folderPath);
    // 마지막 폴더명 추출
    const folderName = Path.basename(absolutePath);
    // 부모 디렉토리 경로
    const parentDir = Path.dirname(absolutePath);
    // 현재 디렉토리를 저장
    const currentDir = process.cwd();

    switch (PLATFORM) {
      case 'win':
        try {
          // 부모 디렉토리로 이동
          process.chdir(parentDir);

          // 1. 임시 디렉토리 생성 (상대 경로 사용)
          const tempDir = `${folderName}_temp`;
          execSync(`xcopy "${folderName}" "${tempDir}\\" /E /I /H /Y`, execOptions);

          // 2. 제외할 파일/폴더 삭제
          const excludedItems = excluded ? excluded.split(',') : ['node_modules', 'package-lock.json', 'package.json'];

          for (const item of excludedItems) {
            const itemPath = `${tempDir}/${item}`;
            try {
              if (item.includes('/')) {
                execSync(`rmdir /s /q "${itemPath}"`, execOptions);
              } else {
                execSync(`del /q "${itemPath}"`, execOptions);
              }
            } catch (err) {
              console.log(`Warning: Could not remove ${item}`);
            }
          }

          // 3. 압축 (상대 경로 사용)
          execSync(
            `powershell -Command "Compress-Archive -Path '${tempDir}/*' -DestinationPath '${folderName}.zip' -Force"`,
            execOptions
          );

          // 4. 임시 디렉토리 삭제
          execSync(`rmdir /s /q "${tempDir}"`, execOptions);
        } catch (error) {
          console.error('Error during zip operation:', error);
          throw error;
        } finally {
          // 원래 디렉토리로 복귀
          process.chdir(currentDir);
        }
        break;

      default:
        try {
          // 부모 디렉토리로 이동
          process.chdir(parentDir);

          const _excluded = excluded
            ? excluded
                .split(',')
                .map((item) => `"${addWildCard(item)}"`)
                .join(' ')
            : '"*/node_modules/*" ".git/*"';
          // 상대 경로로 압축
          execSync(`zip -r "${folderName}.zip" "${folderName}" -x ${_excluded}`, execOptions);
          // execSync(`zip -r "${folderPath}.zip" "${folderPath}" -x ${_excluded}`, execOptions);
        } finally {
          // 원래 디렉토리로 복귀
          process.chdir(currentDir);
        }
        break;
    }

    return { folderPath, excluded };
  } catch (error) {
    console.error('Error in zip function:', error);
    throw error;
  }
};

/**
 * 디렉토리 내에 있는 모든 압축 파일 해제(zip 파일 이름의 폴더에 압축 해제)
 * @param folderPath 압축 파일이 있는 폴더 경로
 * @example
 * ```ts
 * // 현재 폴더의 모든 zip 파일을 압축 해제
 * unzip('./');
 * ```
 */
const unzip = (folderPath: string, excluded: string = '__MACOSX/,node_modules/,.DS_Store,.git/'): string => {
  // 각 zip 파일에 대해 처리
  const currentDir = getCurrentDir();
  const extractPaths: string[] = [];
  for (const zipPath of findFiles(folderPath, '*.zip')) {
    try {
      // * 하위 디렉토리 반영으로 변경???
      const extractPath = `${currentDir}/_unzip/${Path.parse(zipPath).name}`;
      console.log(`## extractPath: ${extractPath}`);
      makeDir(extractPath);

      // 운영체제에 따른 명령어 설정
      let command: string;
      if (process.platform === 'win32') {
        // Windows
        command = `powershell -command "Expand-Archive -Path '${zipPath}' -DestinationPath '${extractPath}' -Force"`;
        // 압축 해제 후 제외할 파일/폴더 삭제
        const excludedItems = excluded.split(',').map((item) => item.trim());
        for (const item of excludedItems) {
          const itemPath = Path.join(extractPath, item.replace('/', ''));
          if (item.endsWith('/')) {
            execSync(`if exist "${itemPath}" rmdir /s /q "${itemPath}"`, execOptions);
          } else {
            execSync(`if exist "${itemPath}" del /q "${itemPath}"`, execOptions);
          }
        }
      } else {
        // macOS, Linux - 불필요한 파일/폴더 제외
        const excludeList = excluded
          .split(',')
          .map((item) => `"${item.trim()}"`)
          .join(' ');
        command = `unzip -o "${zipPath}" -d "${extractPath}" -x ${excludeList}`;
      }

      // 압축 해제 실행
      execSync(command);
      console.log(`압축 해제 완료: ${zipPath} -> ${extractPath}`);
      const subFolders = findFolders(extractPath).filter((folder) => !folder.includes('__MACOSX'));
      console.log(`### subFolders: ${subFolders}, subFolders.length: ${subFolders.length}, ${subFolders[0]}`);
      if (subFolders.length === 1 && subFolders[0].replace(extractPath, '').includes(Path.parse(zipPath).name)) {
        console.log(`### 중복 폴더 처리 필요: ${subFolders}`);

        // 하위 폴더의 모든 파일과 폴더를 상위 폴더로 이동
        const subItems = fs.readdirSync(subFolders[0]);
        for (const item of subItems) {
          const srcPath = Path.join(subFolders[0], item);
          const destPath = Path.join(extractPath, item);
          if (process.platform === 'win32') {
            execSync(`move "${srcPath}" "${destPath}"`, execOptions);
          } else {
            execSync(`mv "${srcPath}" "${destPath}"`, execOptions);
          }
        }

        // 빈 하위 폴더 삭제
        if (process.platform === 'win32') {
          execSync(`rmdir /s /q "${subFolders[0]}"`, execOptions);
        } else {
          execSync(`rm -rf "${subFolders[0]}"`, execOptions);
        }
      }

      extractPaths.push(extractPath);
    } catch (err: any) {
      console.error(`'${zipPath}' 압축 해제 중 오류 발생:`, err.message);
    }
  }
  deleteFilesInFolder(currentDir, '__MACOSX/', true);
  return extractPaths.join(',');
};

/**
 * 프로젝트 구조 분석
 */
const tree = (excluded: string): string => {
  switch (PLATFORM) {
    case 'win':
      const excludedWin = excluded.split(',').join('|') || 'node_modules|dist|_backups|_drafts|types|docs';

      try {
        // PowerShell 실행 정책 우회 및 단순화된 명령어
        const cmd = `powershell -NoProfile -ExecutionPolicy Bypass -Command "$OutputEncoding = [Console]::OutputEncoding = [Text.Encoding]::UTF8; tree /F /A | Select-String -NotMatch '${excludedWin}'"`;
        console.log('Command: ', cmd);

        const result = execSync(cmd, {
          encoding: 'utf8',
          stdio: 'pipe',
        });

        console.log('Result: ', result);
        if (result) {
          saveFile('tree.txt', result, { overwrite: true, newFile: false, encoding: 'utf8' });
        }

        return result || '';
      } catch (error) {
        console.error('Error executing tree command:', error);
        return '';
      }

    default:
      const _excluded = excluded
        ? `"${excluded.split(',').join('|')}"`
        : '"node_modules|dist|_backups|_drafts|types|docs"';

      const cmd = `tree -I ${_excluded} --dirsfirst -L 3`;
      try {
        console.log('Command: ', cmd);
        const result = execSync(cmd, {
          encoding: 'utf8',
          stdio: 'pipe',
        });

        if (result) {
          saveFile('tree.txt', result, { overwrite: true, newFile: false });
        }

        return result || '';
      } catch (error) {
        console.error('Error executing tree command:', error);
        return '';
      }
  }
};

// & Export AREA
// &---------------------------------------------------------------------------
export { PLATFORM, execOptions, exec, exe, getParentDir, getCurrentDir, initApp, removeApp, zip, tree, unzip };

// & Test AREA
// &---------------------------------------------------------------------------
// console.log(exec("dir /w"));
// console.log(exec("powershell -Command \"Get-ChildItem | Format-Wide\""));

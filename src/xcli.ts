#!/usr/bin/env node
// & IMPORT
//&============================================================================
import yargs from 'yargs';
import { execSync, ExecSyncOptionsWithStringEncoding } from 'child_process';
import Path from 'path';
import { sleep } from 'jnu-abc';
import {
  makeDir,
  copyDir,
  loadJson,
  saveJson,
  loadFile,
  saveFile,
  findFiles,
  deleteFilesInFolder,
  substituteInFile,
} from 'jnu-abc';
import { findGithubAccount } from './git.js';
import { PLATFORM, execOptions, initApp, removeApp, zip, tree, unzip } from './cli.js';
import type { CliOptions } from './types.js';

// & CONSTS / VARIABLES
//&============================================================================
const SEPARATOR = '||';
// * save(O)
// const DEFAULT_SAVE_OPTION_JSON = `options.json${SEPARATOR}json${SEPARATOR}1`;
// const DEFAULT_SAVE_OPTION_FILE = `result.txt${SEPARATOR}file${SEPARATOR}1`;
// * save(X)
const DEFAULT_SAVE_OPTION_JSON = `${SEPARATOR}${SEPARATOR}`;
const DEFAULT_SAVE_OPTION_FILE = `${SEPARATOR}${SEPARATOR}`;

// * cli options
// --no-github
const argv = yargs
  .usage('Usage: -e <command> -r <required> -o <optional>')
  .option('e', {
    alias: 'exec',
    describe: 'Execute Command',
    type: 'string',
    demandOption: true,
  })
  .option('r', {
    alias: 'requiredParameter',
    default: '',
    describe: 'Required Parameter',
    type: 'string',
  })
  .option('o', {
    alias: 'optionalParameter',
    default: '{}',
    describe: 'Optional Parameter',
    type: 'string',
  })
  .option('s', {
    alias: 'saveOption',
    default: '',
    describe: 'Save file for result(return)',
    type: 'string',
  })
  .parseSync();

const options: CliOptions = {
  exec: argv.e as string,
  requiredParameter: argv.r as string,
  optionalParameter: argv.o as string,
  saveOption: argv.s as string,
};

// & SUB FUNCTIONS
//&============================================================================
const getParamsArray = (requiredParameter: string, defaultOption: any, separator: string = SEPARATOR) => {
  let params = defaultOption.split(separator);

  // requiredParameter가 있으면 해당 길이만큼 덮어쓰기
  if (requiredParameter) {
    const reqParams = requiredParameter.split(separator);
    reqParams.forEach((param, index) => {
      if (param) {
        params[index] = param;
      }
    });
  }

  return params;
};

const requiredParameters = (requiredParameter: string, defaultOption: string, separator: string = SEPARATOR): any => {
  return getParamsArray(requiredParameter, defaultOption, separator);
};

const optionalParameters = (optionalParameter: string, defaultOption: any) => {
  return { ...defaultOption, ...JSON.parse(optionalParameter) };
};

const saveResult = (
  result: any,
  saveOption: string,
  defaultOption: string = `options.json${SEPARATOR}json${SEPARATOR}1`,
  separator: string = SEPARATOR
) => {
  // * saveOption: ("path,type")
  // const defaultOption2 = defaultOption.split(separator).slice(1, 3).join(separator);
  // const saveOption = !_saveOption ? defaultOption : _saveOption.split(separator).length > 1 ? _saveOption : `${_saveOption}${SEPARATOR}${defaultOption2}`;
  const [path, type, view] = getParamsArray(saveOption, defaultOption, separator);

  console.log(`@@@saveOption: ${saveOption}`);

  // const [path, type, view] = saveOption.split(separator);
  switch (type) {
    case 'file':
      saveFile(path, result);
      if (view) {
        console.log(`${result}`);
      }
      break;
    case 'json':
      saveJson(path, result);
      if (view) {
        console.log(`${JSON.stringify(result)}`);
      }
      break;
    case 'sqlite':
      console.log(`saveSqlite: ${path}, ${result}`);
      // saveSqlite(path, result);
      if (view) {
        console.log(`${JSON.stringify(result)}`);
      }
      break;
    default:
      console.log(`save type is not supported: ${type}`);
  }
};

// & MAIN FUNCTIONS
//&============================================================================
let result: any;
let saveOption: string;
let defaultOption: string;
let params: any;
let opts: any;

// * exec
(async () => {
  switch (options.exec) {
    case 'init': // 프로젝트 초기화  // ex) xcli -e init -r "jun-web||jnjsoftone||ts-swc-npm||Jnjsoft Nodejs Utility Library for Web(Request, Chrome[selenium], cheerio, ...) Functions in Typescript"
      // requiredParameter: [syntax]: "" / "node-simple||video-stream-app"
      // optionalParameter: [syntax]: "" / "repoName||userName||template||description"
      defaultOption = `repoName${SEPARATOR}jnjsoftone${SEPARATOR}node-simple${SEPARATOR}JnJ Utility For Development`;
      params = requiredParameters(options.requiredParameter ?? '', defaultOption, SEPARATOR);
      result = await initApp({ template: params[2], repoName: params[0], userName: params[1], description: params[3] });
      saveResult(result, options.saveOption ?? '', DEFAULT_SAVE_OPTION_JSON);
      break;
    case 'remove': // 프로젝트 삭제  ex) xcli -e init -r "repoName||userName"
      defaultOption = `repoName${SEPARATOR}jnjsoftone`;
      params = requiredParameters(options.requiredParameter ?? '', defaultOption, SEPARATOR);
      removeApp({ repoName: params[0], userName: params[1] }); // ex) xcli -e remove -n "video-stream-app" -u "jnjsoftko"
      break;
    case 'zip': // 폴더 압축 ex) xcli -e zip -r "/Users/moon/JnJ/Projects/@utils/node-utils/jnu-abc/_playground||list.txt"
      const [zipFolder, zipExcluded] = requiredParameters(
        options.requiredParameter ?? `"${SEPARATOR}node_modules/,package-lock.json,.next/"`,
        SEPARATOR
      );
      console.log(`@@@@ zipFolder: ${zipFolder}, zipExcluded: ${zipExcluded}`);
      result = zip(zipFolder, zipExcluded);
      saveResult(result, options.saveOption ?? '', DEFAULT_SAVE_OPTION_JSON);
      break;
    case 'tree': // 폴더 트리
      const treeResult = tree(options.requiredParameter ?? ''); // ex) xcli -e tree -n "video-stream-app"
      saveResult(result, options.saveOption ?? '', DEFAULT_SAVE_OPTION_FILE);
      break;
    case 'find': // 폴더 내에 있는 파일 찾기, xcli -e find -n "." -d "*.js"
      const [findFolder, findPattern] = requiredParameters(options.requiredParameter ?? `"${SEPARATOR}"`, SEPARATOR);
      const files = findFiles(findFolder, findPattern); // ex) xcli -e find -n "video-stream-app" -p "*.js"
      saveResult(result, options.saveOption ?? '', DEFAULT_SAVE_OPTION_FILE);
      break;
    case 'del': // 폴더 삭제
      const [delFolder, delExcluded] = requiredParameters(
        options.requiredParameter ?? `"${SEPARATOR}node_modules/,package-lock.json,.git/.next/"`,
        SEPARATOR
      );
      result = deleteFilesInFolder(delFolder, delExcluded, true) ?? ''; // ex) xcli -e del -r "/Users/moon/JnJ/Projects/internal/video-stream-app||node_modules/,package-lock.json,.next/"
      saveResult(result, options.saveOption ?? '', DEFAULT_SAVE_OPTION_JSON);
      break;
    case 'unzip': // 폴더 내에 있는 모든 압축 파일 해제(zip 파일 이름의 폴더에 압축 해제) ex) xcli -e unzip -r "/Users/moon/JnJ/Projects/@utils/node-utils/_test,node_modules/||"
      const [unzipFolder, unzipExcluded] = requiredParameters(
        options.requiredParameter ?? `"${SEPARATOR}node_modules/,package-lock.json,.git/.next/"`,
        SEPARATOR
      );
      result = unzip(unzipFolder, unzipExcluded); //
      saveResult(result, options.saveOption ?? '', DEFAULT_SAVE_OPTION_FILE);
      break;
    default:
      console.log('Invalid command');
  }
})();

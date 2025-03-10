'use strict';
Object.defineProperty(exports, '__esModule', { value: !0 }),
  !(function (e, t) {
    for (var n in t) Object.defineProperty(e, n, { enumerable: !0, get: t[n] });
  })(exports, {
    PLATFORM: function () {
      return n.PLATFORM;
    },
    TEMPLATES_ROOT: function () {
      return i;
    },
    exe: function () {
      return m;
    },
    exec: function () {
      return p;
    },
    execOptions: function () {
      return l;
    },
    getCurrentDir: function () {
      return s;
    },
    getParentDir: function () {
      return u;
    },
    initApp: function () {
      return x;
    },
    removeApp: function () {
      return f;
    },
    tree: function () {
      return y;
    },
    unzip: function () {
      return g;
    },
    zip: function () {
      return h;
    },
  });
const e = require('child_process'),
  t = /*#__PURE__*/ c(require('path')),
  n = require('jnu-abc'),
  r = require('./git.js'),
  o = /*#__PURE__*/ c(require('fs'));
function c(e) {
  return e && e.__esModule ? e : { default: e };
}
const i = `${process.env.DEV_ROOT}/jd-environments/Templates` ?? 'C:/JnJ/Developments/jd-environments/Templates',
  l = { encoding: 'utf8', shell: 'win32' === process.platform ? 'cmd.exe' : '/bin/sh' },
  s = () =>
    'win' === n.PLATFORM
      ? ((0, e.execSync)('chcp 65001>nul', { shell: 'cmd.exe' }),
        (0, e.execSync)('cd', l).toString().trim().replace(/\\/g, '/'))
      : (0, e.execSync)('pwd', l).toString().trim(),
  u = () =>
    'win' === n.PLATFORM
      ? ((0, e.execSync)('chcp 65001>nul', { shell: 'cmd.exe' }),
        t.default.dirname((0, e.execSync)('cd', l).toString().trim().replace(/\\/g, '/')))
      : t.default.dirname((0, e.execSync)('pwd', l).toString().trim()),
  d = (e) => (e.endsWith('/') ? '*/' + e + '*' : '*/' + e),
  a = (e, t, r) => {
    let o = (0, n.loadEnv)(`${e}/.env.${t}`);
    if (o) {
      let c = Object.entries(o)
        .map(([e, t]) => ({ [`{{${e}}}`]: String(t) }))
        .reduce((e, t) => ({ ...e, ...t }), {});
      (0, n.substituteInFile)(`${e}/${'win' === t ? 'publish.bat' : 'publish.sh'}`, { ...r, ...c });
    }
  },
  p = (t) => {
    let n = (0, e.execSync)(t, { encoding: 'utf8' });
    return n ? n.toString().trim() : '';
  },
  m = (e) => {
    let t = [];
    return e.forEach((e) => t.push(p(e))), t;
  },
  $ = (t, o = n.PLATFORM) => {
    let { template: c, repoName: d, userName: p, description: m } = t,
      { fullName: $, email: f } = (0, r.findGithubAccount)(p ?? ''),
      x = u(),
      h = s(),
      g = '';
    (g = 'win' === o ? `xcopy "${i}\\${c}" "${d}\\" /E /I /H /Y` : `cp -r ${i}/${c} ${d}`), (0, e.execSync)(g, l);
    let y = [
        `${d}/package.json`,
        `${d}/README.md`,
        `${d}/docs/workflow.md`,
        `${d}/manifest.json`,
        `${d}/publish.sh`,
        `${d}/publish.bat`,
      ],
      S = {
        '{{name}}': d ?? '',
        '{{project-name}}': d ?? '',
        '{{author}}': `${$} <${f}>`,
        '{{github-id}}': p ?? '',
        '{{description}}': m || '',
        '{{parent-dir}}': x,
        '{{current-dir}}': h,
      };
    for (let e of y) (0, n.substituteInFile)(e, S);
    for (let e of ['win', 'mac']) a(d, e, S);
    return (
      console.log((g = `cd ${h}/${d} && npm install`)),
      (0, e.execSync)(g, l),
      console.log((g = `cd ${h}/${d} && xgit -e makeRepo -u ${p} -n ${d} -d "${m}"`)),
      (0, e.execSync)(g, l),
      t
    );
  },
  f = (t) => (
    (0, e.execSync)(`xgit -e deleteRemoteRepo -u ${t.userName} -n ${t.repoName}`, l),
    'win' === n.PLATFORM ? (0, e.execSync)(`rmdir /s /q ${t.repoName}`, l) : (0, e.execSync)(`rm -rf ${t.repoName}`, l),
    t
  ),
  x = (e) => {
    let { template: t, repoName: n, userName: r, description: o } = e;
    switch (t) {
      case 'node-simple':
      case 'python-pipenv':
        break;
      case 'ts-swc-npm':
      case 'ts-webpack-obsidianPlugin':
        $(e);
    }
    return e;
  },
  h = (r, o) => {
    try {
      let c = t.default.resolve(r),
        i = t.default.basename(c),
        s = t.default.dirname(c),
        u = process.cwd();
      if ('win' === n.PLATFORM)
        try {
          process.chdir(s);
          let t = `${i}_temp`;
          for (let n of ((0, e.execSync)(`xcopy "${i}" "${t}\\" /E /I /H /Y`, l),
          o ? o.split(',') : ['node_modules', 'package-lock.json', 'package.json'])) {
            let r = `${t}/${n}`;
            try {
              n.includes('/') ? (0, e.execSync)(`rmdir /s /q "${r}"`, l) : (0, e.execSync)(`del /q "${r}"`, l);
            } catch (e) {
              console.log(`Warning: Could not remove ${n}`);
            }
          }
          (0, e.execSync)(
            `powershell -Command "Compress-Archive -Path '${t}/*' -DestinationPath '${i}.zip' -Force"`,
            l
          ),
            (0, e.execSync)(`rmdir /s /q "${t}"`, l);
        } catch (e) {
          throw (console.error('Error during zip operation:', e), e);
        } finally {
          process.chdir(u);
        }
      else
        try {
          process.chdir(s);
          let t = o
            ? o
                .split(',')
                .map((e) => `"${d(e)}"`)
                .join(' ')
            : '"*/node_modules/*" ".git/*"';
          (0, e.execSync)(`zip -r "${i}.zip" "${i}" -x ${t}`, l);
        } finally {
          process.chdir(u);
        }
      return { folderPath: r, excluded: o };
    } catch (e) {
      throw (console.error('Error in zip function:', e), e);
    }
  },
  g = (r, c = '__MACOSX/,node_modules/,.DS_Store,.git/') => {
    let i = s(),
      u = [];
    for (let s of (0, n.findFiles)(r, '*.zip'))
      try {
        let r;
        let d = `${i}/_unzip/${t.default.parse(s).name}`;
        if ((console.log(`## extractPath: ${d}`), (0, n.makeDir)(d), 'win32' === process.platform))
          for (let n of ((r = `powershell -command "Expand-Archive -Path '${s}' -DestinationPath '${d}' -Force"`),
          c.split(',').map((e) => e.trim()))) {
            let r = t.default.join(d, n.replace('/', ''));
            n.endsWith('/')
              ? (0, e.execSync)(`if exist "${r}" rmdir /s /q "${r}"`, l)
              : (0, e.execSync)(`if exist "${r}" del /q "${r}"`, l);
          }
        else {
          let e = c
            .split(',')
            .map((e) => `"${e.trim()}"`)
            .join(' ');
          r = `unzip -o "${s}" -d "${d}" -x ${e}`;
        }
        (0, e.execSync)(r), console.log(`압축 해제 완료: ${s} -> ${d}`);
        let a = (0, n.findFolders)(d).filter((e) => !e.includes('__MACOSX'));
        if (
          (console.log(`### subFolders: ${a}, subFolders.length: ${a.length}, ${a[0]}`),
          1 === a.length && a[0].replace(d, '').includes(t.default.parse(s).name))
        ) {
          for (let n of (console.log(`### 중복 폴더 처리 필요: ${a}`), o.default.readdirSync(a[0]))) {
            let r = t.default.join(a[0], n),
              o = t.default.join(d, n);
            'win32' === process.platform
              ? (0, e.execSync)(`move "${r}" "${o}"`, l)
              : (0, e.execSync)(`mv "${r}" "${o}"`, l);
          }
          'win32' === process.platform
            ? (0, e.execSync)(`rmdir /s /q "${a[0]}"`, l)
            : (0, e.execSync)(`rm -rf "${a[0]}"`, l);
        }
        u.push(d);
      } catch (e) {
        console.error(`'${s}' 압축 해제 중 오류 발생:`, e.message);
      }
    return (0, n.deleteFilesInFolder)(i, '__MACOSX/', !0), u.join(',');
  },
  y = (t) => {
    {
      if ('win' === n.PLATFORM) {
        let r = t.split(',').join('|') || 'node_modules|dist|_backups|_drafts|types|docs';
        try {
          let t = `powershell -NoProfile -ExecutionPolicy Bypass -Command "$OutputEncoding = [Console]::OutputEncoding = [Text.Encoding]::UTF8; tree /F /A | Select-String -NotMatch '${r}'"`;
          console.log('Command: ', t);
          let o = (0, e.execSync)(t, { encoding: 'utf8', stdio: 'pipe' });
          return (
            console.log('Result: ', o),
            o && (0, n.saveFile)('tree.txt', o, { overwrite: !0, newFile: !1, encoding: 'utf8' }),
            o || ''
          );
        } catch (e) {
          return console.error('Error executing tree command:', e), '';
        }
      }
      let r = t ? `"${t.split(',').join('|')}"` : '"node_modules|dist|_backups|_drafts|types|docs"',
        o = `tree -I ${r} --dirsfirst -L 3`;
      try {
        console.log('Command: ', o);
        let t = (0, e.execSync)(o, { encoding: 'utf8', stdio: 'pipe' });
        return t && (0, n.saveFile)('tree.txt', t, { overwrite: !0, newFile: !1 }), t || '';
      } catch (e) {
        return console.error('Error executing tree command:', e), '';
      }
    }
  };

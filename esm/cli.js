import { execSync as e } from 'child_process';
import r from 'path';
import {
  PLATFORM as t,
  makeDir as o,
  saveFile as i,
  loadEnv as n,
  findFiles as s,
  findFolders as l,
  deleteFilesInFolder as c,
  substituteInFile as p,
} from 'jnu-abc';
import { findGithubAccount as a } from './git.js';
import d from 'fs';
let m = `${process.env.DEV_ROOT}/jd-environments/Templates` ?? 'C:/JnJ/Developments/jd-environments/Templates',
  $ = { encoding: 'utf8', shell: 'win32' === process.platform ? 'cmd.exe' : '/bin/sh' },
  u = () =>
    'win' === t
      ? (e('chcp 65001>nul', { shell: 'cmd.exe' }), e('cd', $).toString().trim().replace(/\\/g, '/'))
      : e('pwd', $).toString().trim(),
  h = () =>
    'win' === t
      ? (e('chcp 65001>nul', { shell: 'cmd.exe' }), r.dirname(e('cd', $).toString().trim().replace(/\\/g, '/')))
      : r.dirname(e('pwd', $).toString().trim()),
  f = (e) => (e.endsWith('/') ? '*/' + e + '*' : '*/' + e),
  g = (e, r, t) => {
    let o = n(`${e}/.env.${r}`);
    if (o) {
      let i = Object.entries(o)
        .map(([e, r]) => ({ [`{{${e}}}`]: String(r) }))
        .reduce((e, r) => ({ ...e, ...r }), {});
      p(`${e}/${'win' === r ? 'publish.bat' : 'publish.sh'}`, { ...t, ...i });
    }
  },
  w = (r) => {
    let t = e(r, { encoding: 'utf8' });
    return t ? t.toString().trim() : '';
  },
  x = (e) => {
    let r = [];
    return e.forEach((e) => r.push(w(e))), r;
  },
  _ = (r, o = t) => {
    let { template: i, repoName: n, userName: s, description: l } = r,
      { fullName: c, email: d } = a(s ?? ''),
      f = h(),
      w = u(),
      x = '';
    'win' === o ? e((x = `xcopy "${m}\\${i}" "${n}\\" /E /I /H /Y`), $) : e((x = `cp -r ${m}/${i} ${n}`), $);
    let _ = [
        `${n}/package.json`,
        `${n}/README.md`,
        `${n}/docs/workflow.md`,
        `${n}/manifest.json`,
        `${n}/publish.sh`,
        `${n}/publish.bat`,
      ],
      b = {
        '{{name}}': n ?? '',
        '{{project-name}}': n ?? '',
        '{{author}}': `${c} <${d}>`,
        '{{github-id}}': s ?? '',
        '{{description}}': l || '',
        '{{parent-dir}}': f,
        '{{current-dir}}': w,
      };
    for (let e of _) p(e, b);
    for (let e of ['win', 'mac']) g(n, e, b);
    return (
      console.log((x = `cd ${w}/${n} && npm install`)),
      e(x, $),
      console.log((x = `cd ${w}/${n} && xgit -e makeRepo -u ${s} -n ${n} -d "${l}"`)),
      e(x, $),
      r
    );
  },
  b = (r) => (
    e(`xgit -e deleteRemoteRepo -u ${r.userName} -n ${r.repoName}`, $),
    'win' === t ? e(`rmdir /s /q ${r.repoName}`, $) : e(`rm -rf ${r.repoName}`, $),
    r
  ),
  j = (e) => {
    let { template: r, repoName: t, userName: o, description: i } = e;
    switch (r) {
      case 'node-simple':
      case 'python-pipenv':
        break;
      case 'ts-swc-npm':
      case 'ts-webpack-obsidianPlugin':
        _(e);
    }
    return e;
  },
  y = (o, i) => {
    try {
      let n = r.resolve(o),
        s = r.basename(n),
        l = r.dirname(n),
        c = process.cwd();
      if ('win' === t)
        try {
          process.chdir(l);
          let r = `${s}_temp`;
          for (let t of (e(`xcopy "${s}" "${r}\\" /E /I /H /Y`, $),
          i ? i.split(',') : ['node_modules', 'package-lock.json', 'package.json'])) {
            let o = `${r}/${t}`;
            try {
              t.includes('/') ? e(`rmdir /s /q "${o}"`, $) : e(`del /q "${o}"`, $);
            } catch (e) {
              console.log(`Warning: Could not remove ${t}`);
            }
          }
          e(`powershell -Command "Compress-Archive -Path '${r}/*' -DestinationPath '${s}.zip' -Force"`, $),
            e(`rmdir /s /q "${r}"`, $);
        } catch (e) {
          throw (console.error('Error during zip operation:', e), e);
        } finally {
          process.chdir(c);
        }
      else
        try {
          process.chdir(l);
          let r = i
            ? i
                .split(',')
                .map((e) => `"${f(e)}"`)
                .join(' ')
            : '"*/node_modules/*" ".git/*"';
          e(`zip -r "${s}.zip" "${s}" -x ${r}`, $);
        } finally {
          process.chdir(c);
        }
      return { folderPath: o, excluded: i };
    } catch (e) {
      throw (console.error('Error in zip function:', e), e);
    }
  },
  E = (t, i = '__MACOSX/,node_modules/,.DS_Store,.git/') => {
    let n = u(),
      p = [];
    for (let c of s(t, '*.zip'))
      try {
        let t;
        let s = `${n}/_unzip/${r.parse(c).name}`;
        if ((console.log(`## extractPath: ${s}`), o(s), 'win32' === process.platform))
          for (let o of ((t = `powershell -command "Expand-Archive -Path '${c}' -DestinationPath '${s}' -Force"`),
          i.split(',').map((e) => e.trim()))) {
            let t = r.join(s, o.replace('/', ''));
            o.endsWith('/') ? e(`if exist "${t}" rmdir /s /q "${t}"`, $) : e(`if exist "${t}" del /q "${t}"`, $);
          }
        else {
          let e = i
            .split(',')
            .map((e) => `"${e.trim()}"`)
            .join(' ');
          t = `unzip -o "${c}" -d "${s}" -x ${e}`;
        }
        e(t), console.log(`압축 해제 완료: ${c} -> ${s}`);
        let a = l(s).filter((e) => !e.includes('__MACOSX'));
        if (
          (console.log(`### subFolders: ${a}, subFolders.length: ${a.length}, ${a[0]}`),
          1 === a.length && a[0].replace(s, '').includes(r.parse(c).name))
        ) {
          for (let t of (console.log(`### 중복 폴더 처리 필요: ${a}`), d.readdirSync(a[0]))) {
            let o = r.join(a[0], t),
              i = r.join(s, t);
            'win32' === process.platform ? e(`move "${o}" "${i}"`, $) : e(`mv "${o}" "${i}"`, $);
          }
          'win32' === process.platform ? e(`rmdir /s /q "${a[0]}"`, $) : e(`rm -rf "${a[0]}"`, $);
        }
        p.push(s);
      } catch (e) {
        console.error(`'${c}' 압축 해제 중 오류 발생:`, e.message);
      }
    return c(n, '__MACOSX/', !0), p.join(',');
  },
  S = (r) => {
    {
      if ('win' === t) {
        let t = r.split(',').join('|') || 'node_modules|dist|_backups|_drafts|types|docs';
        try {
          let r = `powershell -NoProfile -ExecutionPolicy Bypass -Command "$OutputEncoding = [Console]::OutputEncoding = [Text.Encoding]::UTF8; tree /F /A | Select-String -NotMatch '${t}'"`;
          console.log('Command: ', r);
          let o = e(r, { encoding: 'utf8', stdio: 'pipe' });
          return (
            console.log('Result: ', o), o && i('tree.txt', o, { overwrite: !0, newFile: !1, encoding: 'utf8' }), o || ''
          );
        } catch (e) {
          return console.error('Error executing tree command:', e), '';
        }
      }
      let o = r ? `"${r.split(',').join('|')}"` : '"node_modules|dist|_backups|_drafts|types|docs"',
        n = `tree -I ${o} --dirsfirst -L 3`;
      try {
        console.log('Command: ', n);
        let r = e(n, { encoding: 'utf8', stdio: 'pipe' });
        return r && i('tree.txt', r, { overwrite: !0, newFile: !1 }), r || '';
      } catch (e) {
        return console.error('Error executing tree command:', e), '';
      }
    }
  };
export {
  m as TEMPLATES_ROOT,
  t as PLATFORM,
  $ as execOptions,
  w as exec,
  x as exe,
  h as getParentDir,
  u as getCurrentDir,
  j as initApp,
  b as removeApp,
  y as zip,
  S as tree,
  E as unzip,
};

---
- name: 'jna-cli'
- description: 'Jnjsoft Nodejs App for cli(Command Line Interface) With xgit, xcli, xweb, ... in Typescript'
- author: 'JnJ One <jnjsoft.one@gmail.com>'
- github-id: 'jnjsoftone'
---

## install

```sh
# cd [PARENT DIR]
cd /Users/moon/JnJ/Developments/Utils

# <syntax> xcli -e init -r "[REPO_NAME]||[USER_NAME]||[TEMPLATE_NAME]||[DESCRIPTION]"
xcli -e init -r "jna-cli||jnjsoftone||ts-swc-npm||Jnjsoft Nodejs App for cli(Command Line Interface) With xgit, xcli, xweb, ... in Typescript"

# package install
npm install jnu-abc
```

## functions

## tech

- typescript
- swc
- npm
- yarn

## publish

```sh
# npm login
npm login jnjsoftone

# windows
./publish.bat

# macos
./publish.sh
```

===

```sh
# Validation
npm run build
node ./cjs/xgit.js -u ilinkrun -n ilmac-work-web -e issues:list

# Global Install
npm install -g jna-cli
xgit -u ilinkrun -n ilmac-work-web -e issues:list
```

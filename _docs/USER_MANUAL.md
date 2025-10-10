# 사용자 매뉴얼
## JNA-CLI: GitHub 저장소 관리 CLI 도구

### 📋 목차
1. [시작하기](#시작하기)
2. [설치](#설치)
3. [설정](#설정)
4. [명령어 레퍼런스](#명령어-레퍼런스)
5. [일반적인 워크플로](#일반적인-워크플로)
6. [문제해결](#문제해결)
7. [고급 사용법](#고급-사용법)

---

## 🚀 시작하기

JNA-CLI는 GitHub 저장소 관리 및 프로젝트 초기화 작업을 간소화하는 명령줄 도구입니다. 두 가지 주요 명령어를 제공합니다:
- **`xgit`**: GitHub 저장소 작업
- **`xcli`**: 프로젝트 템플릿 초기화

### 사전 요구사항
- Node.js 16 이상
- Git 설치 및 구성
- GitHub 계정 및 Personal Access Token
- 네트워크 연결

---

## 📦 설치

### 전역 설치 (권장)
```bash
npm install -g jna-cli
```

### 설치 확인
```bash
xgit --help
xcli --help
```

### 로컬 프로젝트 설치
```bash
npm install jna-cli
npx xgit --help
```

---

## ⚙️ 설정

### 환경 변수
`.env` 파일을 생성하거나 환경 변수를 설정하세요:

```bash
# GitHub 설정
ENV_GITHUB_OWNER=your-github-username
ENV_GITHUB_TOKEN=your-personal-access-token
ENV_GITHUB_EMAIL=your-email@example.com

# 선택사항: 설정용 GitHub 저장소
ENV_GITHUB_REPO=your-config-repo
```

### GitHub Personal Access Token
1. GitHub → Settings → Developer settings → Personal access tokens으로 이동
2. 다음 권한으로 새 토큰 생성:
   - `repo` (전체 저장소 접근)
   - `user` (사용자 프로필 접근)
   - `delete_repo` (저장소 삭제용)

---

## 📖 명령어 레퍼런스

### XGIT 명령어

#### 기본 문법
```bash
xgit -e <작업> -u <사용자명> -n <저장소> [옵션]
```

#### 공통 매개변수
- `-e, --exec`: 작업 유형 (필수)
- `-u, --userName`: GitHub 사용자명 (기본값: 환경변수)
- `-n, --repoName`: 저장소 이름 (대부분 작업에 필수)
- `-d, --description`: 저장소 설명 또는 커밋 메시지
- `-p, --isPrivate`: 비공개 저장소 생성 (기본값: false)
- `-s, --src`: 계정 메타데이터 위치 (`github` 또는 `local`)
- `--state`: 이슈/프로젝트 상태 필터 (`open`, `closed`, `all`)
- `--labels`: 쉼표 구분 라벨 목록
- `--assignee`, `--assignees`: 이슈 담당자 필터 및 지정
- `--per-page`, `--page`: 페이징 옵션
- `--project-name`, `--column-name`: 프로젝트/컬럼 생성 시 이름 지정
- `--workflow-id`, `--ref`, `--inputs`: GitHub Actions 디스패치 관련 매개변수

### 저장소 작업

#### 1. 저장소 목록 조회
```bash
# 모든 저장소 나열
xgit -e list -u your-username

# 대체 문법
xgit -e listRepos -u your-username
```

#### 2. 원격 저장소 생성
```bash
# 공개 저장소 생성
xgit -e create -u your-username -n my-new-repo -d "프로젝트 설명"

# 비공개 저장소 생성
xgit -e create -u your-username -n my-private-repo -d "비공개 프로젝트" -p true
```

#### 3. 완전한 저장소 초기화
```bash
# 저장소 생성 및 로컬 초기화
xgit -e initRepo -u your-username -n my-project -d "초기 프로젝트 설정"
```

#### 4. 저장소 복제
```bash
# 기존 저장소 복제
xgit -e clone -u your-username -n existing-repo

# 대안: 복제 및 구성
xgit -e copy -u your-username -n existing-repo
```

#### 5. 변경사항 푸시
```bash
# 커스텀 커밋 메시지로 푸시
xgit -e push -u your-username -n my-repo -d "사용자 인증 기능 추가"

# 기본 메시지로 푸시
xgit -e push -u your-username -n my-repo
```

#### 6. 저장소 생성 및 설정 (완전한 워크플로)
```bash
# 원격 + 로컬 설정 + 초기 푸시
xgit -e make -u your-username -n my-project -d "완전한 프로젝트 설정"
```

#### 7. 저장소 삭제
```bash
# 원격 저장소만 삭제
xgit -e del -u your-username -n repo-to-delete

# 원격 및 로컬 모두 삭제
xgit -e remove -u your-username -n repo-to-delete
```

### 이슈 관리

#### 1. 저장소 이슈 조회
```bash
# 기본: 열린 이슈 30개
xgit -e issues:list -u your-username -n some-repo

# 라벨/담당자/상태 필터
xgit -e issues:list -u your-username -n some-repo --labels bug,high --assignee teammate --state all
```

#### 2. 이슈 생성
```bash
xgit -e issues:create -u your-username -n some-repo \
  --title "로그인 오류" \
  --body "재현 절차..." \
  --labels bug,urgent \
  --assignees teammate1,teammate2
```

#### 3. 이슈 수정
```bash
xgit -e issues:update -u your-username -n some-repo \
  --issue-number 12 \
  --state closed \
  --labels bug,resolved \
  --assignees teammate1
```

### 프로젝트(Projects) 관리

#### 1. 프로젝트 목록 조회
```bash
# 기본: 열린 프로젝트
xgit -e projects:list -u your-username -n some-repo

# 모든 상태 조회
xgit -e projects:list -u your-username -n some-repo --state all
```

#### 2. 프로젝트 생성
```bash
xgit -e projects:create -u your-username -n some-repo \
  --project-name "Sprint 1" \
  --body "2월 스프린트 업무 보드"
```

#### 3. 프로젝트 컬럼 & 카드 생성
```bash
# 컬럼 생성
xgit -e projects:create-column -u your-username \
  --project-id 12345678 \
  --column-name "To Do"

# 카드 생성 (노트)
xgit -e projects:create-card -u your-username \
  --column-id 87654321 \
  --note "회의 준비"

# 카드 생성 (이슈 연결)
xgit -e projects:create-card -u your-username \
  --column-id 87654321 \
  --content-id 42 \
  --content-type Issue
```

### GitHub Actions 관리

#### 1. 워크플로 목록 확인
```bash
xgit -e actions:list-workflows -u your-username -n some-repo
```

#### 2. 워크플로 실행 기록 조회
```bash
xgit -e actions:list-runs -u your-username -n some-repo \
  --workflow-id deploy.yml \
  --branch main \
  --status in_progress
```

#### 3. 워크플로 디스패치
```bash
xgit -e actions:dispatch -u your-username -n some-repo \
  --workflow-id deploy.yml \
  --ref main \
  --inputs '{"environment":"production"}'
```

### XCLI 명령어

#### 프로젝트 템플릿 초기화
```bash
# 템플릿에서 TypeScript 프로젝트 초기화
xcli -t ts-simple -n my-project -u your-username -d "프로젝트 설명"

# 특정 템플릿으로 초기화
xcli -t typescript-webpack -n my-webapp -u your-username -d "웹 애플리케이션"
```

---

## 🔄 일반적인 워크플로

### 워크플로 1: 새 프로젝트 시작
```bash
# 단계 1: 템플릿으로 저장소 생성
xgit -e make -u your-username -n new-project -d "새 프로젝트 초기화"

# 단계 2: 프로젝트로 이동
cd new-project

# 단계 3: 개발 시작
npm install
npm run build
```

### 워크플로 2: 기존 프로젝트 복제 및 구성
```bash
# 적절한 구성으로 저장소 복제
xgit -e copy -u your-username -n existing-project

# 이동 및 설정
cd existing-project
npm install
```

### 워크플로 3: 빠른 저장소 생성
```bash
# 원격 저장소만 생성
xgit -e create -u your-username -n quick-repo -d "빠른 설정"

# 나중에: 필요시 로컬 초기화
mkdir quick-repo && cd quick-repo
git init
git remote add origin https://github.com/your-username/quick-repo.git
```

### 워크플로 4: 로컬 변경사항 푸시
```bash
# 코드 변경 작업
# ...

# 의미있는 커밋 메시지로 푸시
xgit -e push -u your-username -n your-repo -d "사용자 인증 기능 추가"
```

---

## 🔧 문제해결

### 일반적인 문제

#### 1. 인증 오류
**오류**: `GitHub 계정 정보를 찾을 수 없습니다.`

**해결방법**:
- 환경 변수가 올바르게 설정되었는지 확인
- GitHub 토큰이 필요한 권한을 가지고 있는지 확인
- 토큰이 만료되지 않았는지 확인

```bash
# 토큰 테스트
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user
```

#### 2. 저장소가 이미 존재함
**오류**: 이름이 이미 존재하여 저장소 생성 실패

**해결방법**:
- 다른 저장소 이름 선택
- 먼저 기존 저장소 삭제
- `xgit -e list`로 기존 저장소 확인

#### 3. 권한 거부
**오류**: git 작업 중 권한 거부

**해결방법**:
- GitHub 토큰 권한 확인
- 저장소 소유권 확인
- 토큰에 `repo` 범위가 포함되어 있는지 확인

#### 4. 네트워크 문제
**오류**: 연결 시간 초과 또는 네트워크 오류

**해결방법**:
- 인터넷 연결 확인
- GitHub API 상태 확인: https://status.github.com
- 몇 분 후 다시 시도

### 디버그 모드
```bash
# 상세한 로깅 활성화 (사용 가능한 경우)
DEBUG=* xgit -e list -u your-username

# git 구성 확인
git config --list
```

---

## 🎯 고급 사용법

### 배치 작업
```bash
# 여러 저장소 생성 (스크립트 예제)
#!/bin/bash
repos=("project-1" "project-2" "project-3")
for repo in "${repos[@]}"
do
    xgit -e create -u your-username -n $repo -d "배치 생성된 저장소"
done
```

### 환경별 구성
```bash
# 개발 환경
export ENV_GITHUB_OWNER=dev-account
xgit -e create -n dev-project

# 운영 환경  
export ENV_GITHUB_OWNER=prod-account
xgit -e create -n prod-project
```

### CI/CD와의 통합
```yaml
# GitHub Actions 예제
name: 저장소 설정
on:
  workflow_dispatch:
    inputs:
      repo_name:
        description: '저장소 이름'
        required: true

jobs:
  setup:
    runs-on: ubuntu-latest
    steps:
      - name: 저장소 설정
        run: |
          npm install -g jna-cli
          xgit -e create -n ${{ github.event.inputs.repo_name }}
        env:
          ENV_GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          ENV_GITHUB_OWNER: ${{ github.actor }}
```

### 커스텀 템플릿 (향후 기능)
```bash
# 저장소에서 커스텀 템플릿 사용
xcli -t custom-template -s github -n my-project
```

---

## 📚 예제 및 레시피

### 예제 1: 완전한 프로젝트 설정
```bash
# 새 TypeScript 프로젝트를 위한 완전한 워크플로
xgit -e make -u myusername -n awesome-project -d "내 멋진 TypeScript 프로젝트"
cd awesome-project
npm install
npm run build
npm test
```

### 예제 2: 저장소 마이그레이션
```bash
# 기존 프로젝트를 새 위치로 복제
xgit -e copy -u myusername -n old-project
cd old-project

# 코드 업데이트...

# 변경사항 푸시
xgit -e push -u myusername -n old-project -d "마이그레이션 및 프로젝트 업데이트"
```

### 예제 3: 사용하지 않는 저장소 정리
```bash
# 먼저 모든 저장소 목록 조회
xgit -e list -u myusername

# 특정 저장소 삭제
xgit -e remove -u myusername -n unused-repo
```

---

## 🆘 도움말

### 내장 도움말
```bash
# 모든 옵션 표시
xgit --help
xcli --help

# 명령별 도움말
xgit -e help
```

### 지원 리소스
- GitHub Issues: 버그 리포트 및 기능 요청
- 문서: 프로젝트 README 및 문서 확인
- 커뮤니티: 토론 참여 및 경험 공유

### 버전 정보
```bash
# 설치된 버전 확인
npm list -g jna-cli

# 최신 버전으로 업데이트
npm update -g jna-cli
```

---

*최종 업데이트: 2025-08-30*  
*버전: 1.0*

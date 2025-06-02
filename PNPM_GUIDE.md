# pnpm 사용 가이드 📦

이 프로젝트는 **pnpm**을 사용하여 더 빠르고 효율적인 패키지 관리를 제공합니다.

## 🚀 pnpm 설치

```bash
# npm을 통한 설치
npm install -g pnpm

# Homebrew (macOS)
brew install pnpm

# Chocolatey (Windows)
choco install pnpm

# 스크립트를 통한 설치
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

## 🏁 빠른 시작

```bash
# 1. 프로젝트 클론
git clone <repository-url>
cd web-security

# 2. 모든 의존성 설치
pnpm install

# 3. WebAssembly 빌드
pnpm build:wasm

# 4. 개발 서버 시작 (백엔드 + 프론트엔드)
pnpm dev
```

## 📂 워크스페이스 명령어

### 전체 프로젝트
```bash
# 모든 워크스페이스에 의존성 설치
pnpm install

# 모든 워크스페이스 빌드
pnpm build

# 모든 워크스페이스 테스트
pnpm test

# 모든 워크스페이스 정리
pnpm clean:deps
```

### 특정 워크스페이스
```bash
# 백엔드만 개발 서버 실행
pnpm --filter backend dev

# 프론트엔드만 빌드
pnpm --filter frontend build

# 특정 패키지에 의존성 추가
pnpm --filter backend add express
pnpm --filter frontend add --save-dev vite
```

### 병렬 실행
```bash
# 백엔드와 프론트엔드 동시 개발
pnpm --parallel --filter "{frontend,backend}" dev

# 모든 워크스페이스에서 병렬 테스트
pnpm --parallel --recursive test
```

## 🔍 유용한 pnpm 명령어

### 의존성 관리
```bash
# 의존성 추가
pnpm add <package>
pnpm add --save-dev <package>
pnpm add --global <package>

# 의존성 제거
pnpm remove <package>

# 의존성 업데이트
pnpm update
pnpm update --latest

# 의존성 트리 확인
pnpm list
pnpm list --depth=0
```

### 실행 및 빌드
```bash
# 글로벌 설치 없이 패키지 실행
pnpm dlx <package>

# 스크립트 실행
pnpm run <script>
pnpm <script>  # run 생략 가능

# 워크스페이스별 스크립트 실행
pnpm --filter <workspace> <script>
```

### 캐시 및 저장소 관리
```bash
# 스토어 상태 확인
pnpm store status

# 사용하지 않는 패키지 정리
pnpm store prune

# 캐시 완전 정리
pnpm store delete
```

## 🎯 주요 특징

### 1. 빠른 설치 속도
- **심볼릭 링크**: 중복 파일 없이 링크로 연결
- **병렬 처리**: 동시에 여러 패키지 다운로드
- **증분 설치**: 변경된 부분만 설치

### 2. 디스크 공간 절약
```bash
# 스토어 현황 확인
pnpm store status

# 예시 출력:
# Content-addressable store at: /Users/user/.pnpm-store/v3
# 1,234 files, 567.8 MB
# Projects using this store: 15
```

### 3. 엄격한 의존성 관리
- **유령 의존성 방지**: package.json에 명시되지 않은 패키지 접근 차단
- **정확한 버전 관리**: 각 프로젝트별 독립적인 의존성 관리

### 4. 모노레포 최적화
- **워크스페이스 지원**: 여러 패키지를 하나의 저장소에서 관리
- **의존성 공유**: 동일한 패키지를 여러 프로젝트가 공유

## 🔧 설정 파일

### `.npmrc` 설정
```ini
# 자동 peer 의존성 설치
auto-install-peers=true

# 엄격한 peer 의존성 검사 비활성화
strict-peer-dependencies=false

# 정확한 버전 저장
save-exact=true

# 워크스페이스 패키지 우선 사용
prefer-workspace-packages=true
```

### `pnpm-workspace.yaml` 설정
```yaml
packages:
  - 'frontend'
  - 'backend'
  - 'shared'
```

## 🐛 트러블슈팅

### 1. pnpm 명령어를 찾을 수 없음
```bash
# PATH 확인
echo $PATH

# pnpm 재설치
npm uninstall -g pnpm
npm install -g pnpm@latest
```

### 2. 의존성 충돌
```bash
# 의존성 트리 확인
pnpm list --depth=1

# 중복 의존성 해결
pnpm dedupe

# 캐시 정리 후 재설치
pnpm store prune
rm -rf node_modules
pnpm install
```

### 3. 워크스페이스 문제
```bash
# 워크스페이스 확인
pnpm list --recursive

# 특정 워크스페이스 재설치
pnpm --filter <workspace> install --force
```

## 📊 성능 비교

| 작업 | npm | yarn | pnpm |
|------|-----|------|------|
| 첫 설치 | 🐌 느림 | ⚡ 빠름 | ⚡ 빠름 |
| 재설치 | 🐌 느림 | ⚡ 빠름 | 🚀 매우 빠름 |
| 디스크 사용량 | 📁 많음 | 📁 많음 | 💾 적음 |
| 의존성 정확성 | ⚠️ 유령 의존성 | ⚠️ 유령 의존성 | ✅ 엄격함 |

## 🔗 유용한 링크

- [pnpm 공식 문서](https://pnpm.io/)
- [워크스페이스 가이드](https://pnpm.io/workspaces)
- [CLI 명령어 레퍼런스](https://pnpm.io/cli/add)
- [설정 옵션](https://pnpm.io/npmrc)

## 💡 팁

1. **글로벌 패키지 최소화**: `pnpm dlx`를 사용하여 일회성 실행
2. **워크스페이스 활용**: 관련된 패키지들을 하나의 저장소에서 관리
3. **정확한 버전 명시**: `save-exact=true` 설정으로 버전 고정
4. **주기적 정리**: `pnpm store prune`으로 불필요한 캐시 정리 
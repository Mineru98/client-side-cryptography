# Frontend - Web Security 암호화 데모 (pnpm)

## 📋 개요

Go WebAssembly를 사용한 클라이언트측 AES-256-GCM 암호화 시스템의 프론트엔드 부분입니다.
**pnpm을 사용하여 빠르고 효율적인 패키지 관리를 제공합니다.**

## 🏗️ 구조

```
frontend/
├── src/
│   └── index.html          # 메인 HTML 파일
├── crypto-wasm/            # Go WebAssembly 암호화 모듈
│   ├── main.go            # Go 암호화 소스 코드
│   ├── go.mod             # Go 모듈 파일
│   ├── build.sh           # WebAssembly 빌드 스크립트
│   ├── main.wasm          # 컴파일된 WebAssembly (빌드 후 생성)
│   └── wasm_exec.js       # Go WebAssembly 런타임 (빌드 후 생성)
├── package.json
├── Dockerfile
└── nginx.conf             # Nginx 설정 (Docker용)
```

## 🚀 빌드 및 실행

### Prerequisites
- Node.js 16 이상
- pnpm 8 이상
- Go 1.19 이상

### 1. 의존성 설치
```bash
pnpm install
```

### 2. WebAssembly 빌드
```bash
pnpm build-wasm
# 또는 직접 빌드
cd crypto-wasm
chmod +x build.sh
./build.sh
```

### 3. 개발 서버 실행
```bash
pnpm dev
```
브라우저에서 http://localhost:8000 접속

### 4. 프로덕션 빌드
```bash
pnpm build
pnpm serve
```

## 🔐 제공되는 암호화 기능

WebAssembly를 통해 다음 함수들이 전역으로 노출됩니다:

- `cryptoEncrypt(plaintext)` - 평문을 AES-256-GCM으로 암호화
- `cryptoDecrypt(ciphertext)` - 암호화된 데이터를 복호화  
- `getEncryptionKey()` - 암호화 키 정보 반환

## 🎯 주요 기능

1. **실시간 암호화/복호화**: 웹 인터페이스를 통한 즉시 테스트
2. **서버 통신 테스트**: Backend API와의 암호화된 통신 테스트
3. **시각적 피드백**: 암호화 과정과 결과를 실시간으로 확인
4. **통계 표시**: 암호화 횟수, 처리된 데이터량 등 실시간 표시

## 🧪 테스트

```bash
pnpm test
```

## 🐳 Docker 실행

```bash
# 개발 환경
docker-compose --profile dev up

# 프로덕션 환경
docker-compose up frontend

# pnpm 개발 환경
docker-compose --profile pnpm-dev up
```

## ⚡ pnpm 관련 명령어

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행 (http-server를 dlx로 실행)
pnpm dev

# WebAssembly 빌드
pnpm build-wasm

# 프로덕션 빌드
pnpm build

# 정리
pnpm clean
```

## 📝 개발 노트

### WebAssembly 재빌드가 필요한 경우:
- Go 소스 코드 변경 시
- 암호화 키 변경 시
- Go 버전 업그레이드 시

### 브라우저 호환성:
- Chrome 57+
- Firefox 52+
- Safari 11+
- Edge 16+

### 성능 최적화:
- WebAssembly는 네이티브 수준의 암호화 성능 제공
- 대용량 데이터 처리에 적합
- 메모리 효율적인 암호화 연산

### pnpm 특징:
- `pnpm dlx`를 사용하여 글로벌 설치 없이 패키지 실행
- 빠른 설치 및 정확한 의존성 관리
- 모노레포 루트의 pnpm 명령어와 연동 
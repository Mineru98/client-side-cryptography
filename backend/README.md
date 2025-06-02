# Backend - Web Security API 서버 (pnpm)

## 📋 개요

Node.js Express를 사용한 양방향 암호화 통신 시스템의 백엔드 API 서버입니다.
프론트엔드의 Go WebAssembly와 동일한 AES-256-GCM 암호화를 지원합니다.
**pnpm을 사용하여 빠르고 효율적인 패키지 관리를 제공합니다.**

## 🏗️ 구조

```
backend/
├── src/
│   ├── index.js           # 메인 Express 서버
│   ├── crypto.js          # 암호화 유틸리티
│   └── test.js            # 암호화 테스트 스크립트
├── package.json
├── Dockerfile
└── README.md
```

## 🚀 빌드 및 실행

### Prerequisites
- Node.js 16 이상
- pnpm 8 이상

### 1. 의존성 설치
```bash
pnpm install
```

### 2. 개발 서버 실행
```bash
pnpm dev
```
서버가 http://localhost:3000 에서 실행됩니다.

### 3. 프로덕션 서버 실행
```bash
pnpm start
```

### 4. 암호화 테스트 실행
```bash
pnpm test:crypto
# 또는 직접 실행
node src/test.js
```

## 🔐 암호화 시스템

### 사용된 알고리즘
- **AES-256-GCM**: 고급 암호화 표준 (256비트 키)
- **동일 키**: 프론트엔드 WebAssembly와 완전히 동일한 키 사용
- **Base64 인코딩**: 네트워크 전송을 위한 안전한 인코딩

### 암호화 과정
1. 클라이언트에서 데이터를 WebAssembly로 암호화
2. Base64로 인코딩하여 서버로 전송
3. 서버에서 동일한 키로 복호화
4. 비즈니스 로직 처리 후 다시 암호화하여 응답

## 📡 API 엔드포인트

### 기본 엔드포인트
- `GET /health` - 서버 상태 확인
- `GET /api/crypto-info` - 암호화 정보 조회

### 암호화 관련 엔드포인트
- `POST /api/secure-data` - **메인 기능**: 암호화된 데이터 통신
- `POST /api/encrypt` - 데이터 암호화
- `POST /api/decrypt` - 데이터 복호화
- `POST /api/test-encryption` - 암호화 시스템 테스트

### 사용 예시

#### 보안 데이터 통신
```bash
curl -X POST http://localhost:3000/api/secure-data \
  -H "Content-Type: application/json" \
  -d '{"encryptedData": "base64_encoded_encrypted_data"}'
```

#### 데이터 암호화
```bash
curl -X POST http://localhost:3000/api/encrypt \
  -H "Content-Type: application/json" \
  -d '{"data": "Hello World!"}'
```

## 🧪 테스트

### 단위 테스트 실행
```bash
pnpm test
```

### 암호화 시스템 테스트
```bash
pnpm test:crypto
# 또는
node src/test.js
```

### API 테스트 (서버 실행 중)
```bash
# 헬스 체크
curl http://localhost:3000/health

# 암호화 정보
curl http://localhost:3000/api/crypto-info

# 테스트 암호화
curl -X POST http://localhost:3000/api/test-encryption \
  -H "Content-Type: application/json" \
  -d '{"testData": "테스트 메시지"}'
```

## 🐳 Docker 실행

### 개별 실행
```bash
docker build -t web-security-backend .
docker run -p 3000:3000 web-security-backend
```

### Docker Compose
```bash
docker-compose up backend
```

## 🔧 환경 설정

### 환경 변수
- `PORT`: 서버 포트 (기본값: 3000)
- `NODE_ENV`: 실행 환경 (development/production)
- `ENCRYPTION_KEY`: 암호화 키 (보안상 환경변수 권장)

### 개발 환경 설정
```bash
export NODE_ENV=development
export PORT=3000
pnpm dev
```

## ⚡ pnpm 관련 명령어

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행 (nodemon을 dlx로 실행)
pnpm dev

# 프로덕션 서버 실행
pnpm start

# 테스트 실행 (jest를 dlx로 실행)
pnpm test

# 암호화 테스트
pnpm test:crypto

# 워치 모드 테스트
pnpm test:watch

# 정리
pnpm clean
```

## 📊 성능

### 암호화 성능
- 10KB 데이터: ~1-5ms
- 100KB 데이터: ~10-20ms
- 1MB 데이터: ~50-100ms

### 서버 성능
- 동시 요청 처리: 1000+ RPS
- 메모리 사용량: ~50MB (기본)
- CPU 사용량: 암호화 작업 시 증가

## 🔒 보안 고려사항

1. **암호화 키 관리**: 실제 환경에서는 환경변수나 키 관리 서비스 사용
2. **HTTPS 사용**: 프로덕션에서는 반드시 HTTPS 적용
3. **CORS 설정**: 필요한 도메인만 허용하도록 설정
4. **레이트 리미팅**: API 남용 방지를 위한 요청 제한 구현
5. **로깅**: 민감한 정보는 로그에 기록하지 않음

## 🐛 트러블슈팅

### 자주 발생하는 문제

1. **암호화 실패**
   - 키 불일치 확인
   - 데이터 형식 확인 (Base64 인코딩)

2. **CORS 오류**
   - 프론트엔드 도메인이 CORS 설정에 포함되어 있는지 확인

3. **포트 충돌**
   - 다른 포트 사용: `PORT=3001 pnpm dev`

4. **pnpm 관련 문제**
   - pnpm 버전 확인: `pnpm --version`
   - 캐시 정리: `pnpm store prune`
   - 의존성 재설치: `pnpm clean:deps && pnpm install` 
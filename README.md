# 🚀 Client Side Cryptography

이 프로젝트는 Go로 작성된 WebAssembly를 사용하여 브라우저에서 현재 URL의 호스트 정보를 자동으로 파싱하는 예제입니다.

## 🎯 기능

- 현재 브라우저 URL의 호스트 정보 자동 감지
- 전체 URL 정보 파싱 (프로토콜, 호스트, 포트, 경로 등)
- 실시간 콘솔 출력
- 사용자 친화적인 웹 인터페이스

## 📋 필요한 환경

- Go 1.16 이상
- 최신 웹 브라우저 (Chrome, Firefox, Safari, Edge)
- VS Code Live Server 확장 (또는 다른 로컬 웹 서버)

## 🛠️ 설치 및 빌드

### 1. 파일 준비

모든 파일을 같은 디렉토리에 저장하세요:
- `main.go` - Go 소스 코드
- `go.mod` - Go 모듈 파일
- `index.html` - 메인 HTML 파일
- `wasm_helper.js` - WebAssembly 로드 헬퍼
- `build.sh` (Linux/Mac) 또는 `build.bat` (Windows) - 빌드 스크립트

### 2. 빌드 실행

**Linux/Mac:**
```bash
chmod +x build.sh
./build.sh
```

**Windows:**
```cmd
build.bat
```

**수동 빌드:**
```bash
# Go 모듈 초기화 (처음 한 번만)
go mod init wasm-url-parser

# 환경 변수 설정
export GOOS=js
export GOARCH=wasm

# WebAssembly 빌드
go build -o main.wasm main.go

# wasm_exec.js 복사 (Go 설치 경로에서)
cp $(go env GOROOT)/misc/wasm/wasm_exec.js ./wasm_exec.js
```

### 3. 실행

1. VS Code에서 프로젝트 폴더를 엽니다
2. `index.html` 파일을 열고 우클릭합니다
3. "Open with Live Server"를 선택합니다
4. 브라우저에서 자동으로 열립니다

## 📁 파일 구조

```
프로젝트 폴더/
├── .vscode/
│   └── settings.json     # VS Code 설정 (옵션)
├── main.go               # Go 소스 코드
├── go.mod                # Go 모듈 파일
├── main.wasm             # 컴파일된 WebAssembly (빌드 후 생성)
├── wasm_exec.js          # Go WebAssembly 런타임 (빌드 후 생성)
├── wasm_helper.js        # WebAssembly 로드 헬퍼
├── index.html            # 메인 HTML 파일
├── build.sh              # Linux/Mac 빌드 스크립트
├── build.bat             # Windows 빌드 스크립트
└── README.md             # 이 파일
```

## 🎮 사용 방법

1. **자동 감지**: 페이지가 로드되면 자동으로 현재 호스트가 표시됩니다
2. **현재 호스트 가져오기**: 버튼을 클릭하여 호스트 정보만 가져옵니다
3. **전체 URL 정보 가져오기**: 버튼을 클릭하여 상세한 URL 정보를 확인합니다
4. **출력 지우기**: 화면의 출력 내용을 지웁니다

## 💡 코드 설명

### Go 코드 (main.go)

- `getCurrentHost()`: 브라우저의 `window.location.host`에서 호스트 정보를 가져옵니다
- `getCurrentURL()`: 전체 URL 정보를 파싱하여 맵으로 반환합니다
- `setupFunctions()`: JavaScript에서 호출할 수 있는 함수들을 등록합니다

### JavaScript 연동

Go WebAssembly에서 노출된 함수들:
- `getHost()`: 현재 호스트 반환
- `getURLInfo()`: 전체 URL 정보 객체 반환
- `goWasmReady()`: WebAssembly 로드 완료 시 호출

## 🔧 트러블슈팅

### VS Code에서 syscall/js 임포트 오류
Go 확장이 기본적으로 현재 OS 환경으로 코드를 분석하기 때문에 발생합니다.

**해결 방법 1: VS Code 설정 파일**
프로젝트 루트에 `.vscode/settings.json` 파일을 생성하고 다음 내용 추가:
```json
{
    "go.toolsEnvVars": {
        "GOOS": "js",
        "GOARCH": "wasm"
    },
    "go.buildTags": "js,wasm"
}
```

**해결 방법 2: Go 확장 설정**
1. VS Code에서 `Ctrl+,` (설정 열기)
2. "go build tags" 검색
3. `js,wasm` 입력

**해결 방법 3: 빌드 제약 조건 (이미 추가됨)**
`main.go` 파일 상단에 빌드 태그가 있어 WebAssembly 환경에서만 컴파일됩니다.

### WebAssembly 로드 실패
- `main.wasm` 파일이 HTML 파일과 같은 디렉토리에 있는지 확인
- 웹 서버를 통해 접근하고 있는지 확인 (file:// 프로토콜 사용 금지)

### wasm_exec.js 파일이 없다는 오류
- Go 설치 경로의 `misc/wasm/wasm_exec.js`를 수동으로 복사
- 또는 [Go 공식 저장소](https://github.com/golang/go/blob/master/misc/wasm/wasm_exec.js)에서 다운로드

### 함수 호출 오류
- WebAssembly가 완전히 로드될 때까지 기다린 후 함수 호출
- 브라우저 개발자 도구의 콘솔에서 오류 메시지 확인

## 🌟 확장 아이디어

- 쿠키 정보 읽기/쓰기 기능 추가
- 로컬 스토리지 연동
- HTTP 요청 기능 구현
- 실시간 URL 변경 감지
- JSON 데이터 파싱 및 처리

## 📚 참고 자료

- [Go WebAssembly 공식 문서](https://pkg.go.dev/syscall/js)
- [WebAssembly 소개](https://webassembly.org/)
- [MDN WebAssembly 가이드](https://developer.mozilla.org/en-US/docs/WebAssembly)
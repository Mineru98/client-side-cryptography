#!/bin/bash

echo "🚀 Go WebAssembly 빌드 시작..."

# Go 모듈 초기화 (go.mod가 없는 경우)
if [ ! -f "go.mod" ]; then
    echo "📋 Go 모듈 초기화 중..."
    go mod init wasm-url-parser
fi

# Go 환경 변수 설정
export GOOS=js
export GOARCH=wasm

# WebAssembly 파일 빌드
echo "📦 WebAssembly 파일 빌드 중..."
go build -o main.wasm main.go

if [ $? -eq 0 ]; then
    echo "✅ 빌드 성공!"
    
    # wasm_exec.js 파일 복사 (Go 설치 경로에서)
    echo "📋 wasm_exec.js 파일 복사 중..."
    
    # Go 설치 경로 찾기
    GO_ROOT=$(go env GOROOT)
    WASM_EXEC_PATH="$GO_ROOT/misc/wasm/wasm_exec.js"
    
    if [ -f "$WASM_EXEC_PATH" ]; then
        cp "$WASM_EXEC_PATH" ./wasm_exec.js
        echo "✅ wasm_exec.js 복사 완료!"
    else
        echo "⚠️  wasm_exec.js를 찾을 수 없습니다."
        echo "   수동으로 Go 설치 경로의 misc/wasm/wasm_exec.js를 복사하세요."
    fi
    
    echo ""
    echo "🎉 빌드 완료!"
    echo "📁 생성된 파일들:"
    echo "   - main.wasm (WebAssembly 바이너리)"
    echo "   - wasm_exec.js (Go WebAssembly 런타임)"
    echo ""
    echo "🌐 사용 방법:"
    echo "   1. VS Code Live Server 확장을 실행하세요"
    echo "   2. index.html을 열고 'Go Live'를 클릭하세요"
    echo "   3. 브라우저에서 결과를 확인하세요"
    echo ""
    echo "📋 파일 구조:"
    echo "   ├── main.go           (Go 소스 코드)"
    echo "   ├── main.wasm         (컴파일된 WebAssembly)"
    echo "   ├── wasm_exec.js      (Go WebAssembly 런타임)"
    echo "   ├── wasm_support.js   (헬퍼 스크립트)"
    echo "   └── index.html        (메인 HTML 파일)"
    
else
    echo "❌ 빌드 실패!"
    exit 1
fi
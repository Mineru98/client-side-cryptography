#!/bin/bash

echo "🚀 Crypto WebAssembly 빌드 시작..."

# Go 모듈 확인 및 정리
if [ -f "go.mod" ]; then
    echo "📋 Go 모듈 정리 중..."
    go mod tidy
else
    echo "❌ go.mod 파일이 없습니다. 프로젝트 구조를 확인하세요."
    exit 1
fi

# Go 환경 변수 설정
export GOOS=js
export GOARCH=wasm

echo "🔧 빌드 환경:"
echo "   GOOS: $GOOS"
echo "   GOARCH: $GOARCH"
echo "   Go Version: $(go version)"

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
        echo "   Go 설치 확인 또는 수동으로 파일을 복사하세요."
        echo "   다운로드: https://github.com/golang/go/blob/master/misc/wasm/wasm_exec.js"
    fi
    
    # 파일 크기 확인
    if [ -f "main.wasm" ]; then
        WASM_SIZE=$(ls -lh main.wasm | awk '{print $5}')
        echo "📊 main.wasm 크기: $WASM_SIZE"
    fi
    
    echo ""
    echo "🎉 Crypto WebAssembly 빌드 완료!"
    echo "📁 생성된 파일들:"
    echo "   - main.wasm (암호화 WebAssembly 바이너리)"
    echo "   - wasm_exec.js (Go WebAssembly 런타임)"
    echo ""
    echo "🔐 제공되는 암호화 기능:"
    echo "   - cryptoEncrypt(data)   : AES-256-GCM 암호화"
    echo "   - cryptoDecrypt(data)   : AES-256-GCM 복호화"
    echo "   - getEncryptionKey()    : 암호화 키 정보"
    echo ""
    echo "🌐 사용 방법:"
    echo "   1. Frontend 프로젝트로 이동: cd ../"
    echo "   2. 개발 서버 실행: npm run dev"
    echo "   3. 브라우저에서 http://localhost:8000 접속"
    echo ""
    echo "🔗 관련 명령어:"
    echo "   Frontend 빌드: cd ../ && npm run build"
    echo "   Backend 실행: cd ../../backend && npm run dev"
    
else
    echo "❌ 빌드 실패!"
    echo "📋 문제 해결 방법:"
    echo "   1. Go가 올바르게 설치되었는지 확인"
    echo "   2. 현재 디렉토리에 main.go와 go.mod가 있는지 확인"
    echo "   3. Go 모듈이 올바르게 설정되었는지 확인"
    exit 1
fi
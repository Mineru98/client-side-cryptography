const fetch = require('node-fetch');

async function testWebAssembly() {
  try {
    console.log('🔍 WebAssembly 파일 테스트 시작...');
    
    const response = await fetch('http://localhost:8000/main.wasm');
    console.log('📊 응답 상태:', response.status);
    console.log('📊 Content-Type:', response.headers.get('content-type'));
    console.log('📊 응답 OK:', response.ok);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const buffer = await response.arrayBuffer();
    console.log('📊 파일 크기:', buffer.byteLength, 'bytes');
    
    // WebAssembly 컴파일 시도
    const module = await WebAssembly.compile(buffer);
    console.log('✅ WebAssembly 컴파일 성공!');
    console.log('📊 모듈 exports:', WebAssembly.Module.exports(module));
    
  } catch (error) {
    console.error('❌ 에러 발생:', error.message);
    console.error('스택 트레이스:', error.stack);
  }
}

testWebAssembly(); 
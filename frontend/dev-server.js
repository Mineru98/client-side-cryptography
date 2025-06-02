const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 8000;
const rootDir = path.join(__dirname, 'src');

// MIME type 매핑
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wasm': 'application/wasm'  // WebAssembly MIME type
};

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // URL에서 쿼리 파라미터 제거
  let urlPath = req.url.split('?')[0];
  
  // 루트 경로일 경우 index.html로 리다이렉트
  if (urlPath === '/') {
    urlPath = '/index.html';
  }
  
  const filePath = path.join(rootDir, urlPath);
  const ext = path.extname(filePath).toLowerCase();
  
  // 파일 존재 확인
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(`파일을 찾을 수 없습니다: ${filePath}`);
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    
    // MIME type 설정
    const mimeType = mimeTypes[ext] || 'application/octet-stream';
    
    // 특별히 .wasm 파일의 경우 로그 출력
    if (ext === '.wasm') {
      console.log(`🔧 WebAssembly 파일 서빙: ${filePath} (MIME type: ${mimeType})`);
    }
    
    // 파일 읽기 및 응답
    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.error(`파일 읽기 오류: ${err.message}`);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
        return;
      }
      
      res.writeHead(200, { 
        'Content-Type': mimeType,
        'Cache-Control': 'no-cache'
      });
      res.end(data);
    });
  });
});

server.listen(port, () => {
  console.log(`🚀 개발 서버가 실행 중입니다: http://localhost:${port}`);
  console.log(`📁 루트 디렉토리: ${rootDir}`);
  console.log(`🔧 WebAssembly MIME type이 application/wasm으로 설정되었습니다.`);
  console.log('');
  console.log('사용 가능한 파일들:');
  try {
    const files = fs.readdirSync(rootDir);
    files.forEach(file => {
      const ext = path.extname(file);
      const mimeType = mimeTypes[ext] || 'application/octet-stream';
      console.log(`  - ${file} (${mimeType})`);
    });
  } catch (err) {
    console.error('파일 목록을 읽을 수 없습니다:', err.message);
  }
});

// 에러 핸들링
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ 포트 ${port}가 이미 사용 중입니다.`);
    console.error('다른 서버를 종료하거나 다른 포트를 사용하세요.');
  } else {
    console.error('서버 에러:', err.message);
  }
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 서버를 종료합니다...');
  server.close(() => {
    console.log('✅ 서버가 정상적으로 종료되었습니다.');
    process.exit(0);
  });
}); 
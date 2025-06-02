const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const crypto = require('./crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false
}));
app.use(cors({
    origin: ['http://localhost:8000', 'http://127.0.0.1:8000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 요청/응답 로깅 미들웨어
app.use((req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`🌐 ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
    });
    
    next();
});

// 헬스 체크 엔드포인트
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// 암호화 정보 엔드포인트
app.get('/api/crypto-info', (req, res) => {
    try {
        const keyInfo = crypto.getKeyInfo();
        res.json({
            status: 'success',
            data: keyInfo,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ 암호화 정보 조회 실패:', error);
        res.status(500).json({
            status: 'error',
            message: '암호화 정보를 가져올 수 없습니다',
            error: error.message
        });
    }
});

// 암호화 테스트 엔드포인트
app.post('/api/test-encryption', (req, res) => {
    try {
        const { testData } = req.body;
        const result = crypto.testEncryption(testData);
        
        res.json({
            status: 'success',
            data: result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ 암호화 테스트 실패:', error);
        res.status(500).json({
            status: 'error',
            message: '암호화 테스트에 실패했습니다',
            error: error.message
        });
    }
});

// 보안 데이터 통신 엔드포인트 (메인 기능)
app.post('/api/secure-data', (req, res) => {
    try {
        const { encryptedData } = req.body;
        
        if (!encryptedData) {
            return res.status(400).json({
                status: 'error',
                message: '암호화된 데이터가 필요합니다'
            });
        }
        
        console.log('🔒 암호화된 데이터 수신:', encryptedData.substring(0, 50) + '...');
        
        // 클라이언트에서 받은 암호화된 데이터 복호화
        const decryptedData = crypto.decrypt(encryptedData);
        console.log('🔓 복호화된 데이터:', decryptedData);
        
        // 비즈니스 로직 처리 (예: 데이터 검증, 변환, 저장 등)
        const processedData = processBusinessLogic(decryptedData);
        console.log('⚙️ 처리된 데이터:', processedData);
        
        // 응답 데이터 암호화
        const encryptedResponse = crypto.encrypt(processedData);
        console.log('🔒 응답 데이터 암호화 완료:', encryptedResponse.substring(0, 50) + '...');
        
        res.json({
            status: 'success',
            encryptedData: encryptedResponse,
            timestamp: new Date().toISOString(),
            requestId: generateRequestId()
        });
        
    } catch (error) {
        console.error('❌ 보안 데이터 처리 실패:', error);
        res.status(500).json({
            status: 'error',
            message: '데이터 처리에 실패했습니다',
            error: error.message
        });
    }
});

// 데이터 암호화 엔드포인트
app.post('/api/encrypt', (req, res) => {
    try {
        const { data } = req.body;
        
        if (!data) {
            return res.status(400).json({
                status: 'error',
                message: '암호화할 데이터가 필요합니다'
            });
        }
        
        const encrypted = crypto.encrypt(data);
        
        res.json({
            status: 'success',
            data: {
                original: data,
                encrypted: encrypted,
                length: encrypted.length
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ 데이터 암호화 실패:', error);
        res.status(500).json({
            status: 'error',
            message: '데이터 암호화에 실패했습니다',
            error: error.message
        });
    }
});

// 데이터 복호화 엔드포인트
app.post('/api/decrypt', (req, res) => {
    try {
        const { encryptedData } = req.body;
        
        if (!encryptedData) {
            return res.status(400).json({
                status: 'error',
                message: '복호화할 데이터가 필요합니다'
            });
        }
        
        const decrypted = crypto.decrypt(encryptedData);
        
        res.json({
            status: 'success',
            data: {
                encrypted: encryptedData,
                decrypted: decrypted,
                length: decrypted.length
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ 데이터 복호화 실패:', error);
        res.status(500).json({
            status: 'error',
            message: '데이터 복호화에 실패했습니다',
            error: error.message
        });
    }
});

// 비즈니스 로직 처리 함수
function processBusinessLogic(data) {
    // 예시 비즈니스 로직
    const timestamp = new Date().toISOString();
    const processedData = {
        originalData: data,
        processedAt: timestamp,
        serverMessage: `서버에서 처리된 데이터: ${data}`,
        serverTime: timestamp,
        requestCount: Math.floor(Math.random() * 1000),
        status: 'processed'
    };
    
    return JSON.stringify(processedData);
}

// 요청 ID 생성 함수
function generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 404 핸들러
app.use('*', (req, res) => {
    res.status(404).json({
        status: 'error',
        message: '요청한 엔드포인트를 찾을 수 없습니다',
        path: req.originalUrl
    });
});

// 전역 에러 핸들러
app.use((err, req, res, next) => {
    console.error('💥 서버 오류:', err);
    
    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || '내부 서버 오류가 발생했습니다',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 서버 시작
app.listen(PORT, () => {
    console.log('\n🚀 Web Security Backend Server Started!');
    console.log(`📡 Server running on: http://localhost:${PORT}`);
    console.log(`🔐 Encryption: AES-256-GCM`);
    console.log(`⏰ Started at: ${new Date().toISOString()}`);
    console.log('\n📋 Available Endpoints:');
    console.log(`   GET  /health              - 헬스 체크`);
    console.log(`   GET  /api/crypto-info     - 암호화 정보`);
    console.log(`   POST /api/test-encryption - 암호화 테스트`);
    console.log(`   POST /api/secure-data     - 보안 데이터 통신 (메인)`);
    console.log(`   POST /api/encrypt         - 데이터 암호화`);
    console.log(`   POST /api/decrypt         - 데이터 복호화`);
    console.log('\n🌐 CORS enabled for: http://localhost:8000');
    console.log('================================\n');
    
    // 서버 시작 시 암호화 테스트 실행
    console.log('🔧 서버 시작 시 암호화 테스트 실행...');
    const testResult = crypto.testEncryption();
    if (testResult.success) {
        console.log('✅ 서버 암호화 시스템이 정상적으로 작동합니다!\n');
    } else {
        console.error('❌ 서버 암호화 시스템에 문제가 있습니다!');
        console.error('오류:', testResult.error);
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('\n🛑 SIGTERM 수신, 서버를 안전하게 종료합니다...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n🛑 SIGINT 수신, 서버를 안전하게 종료합니다...');
    process.exit(0);
});

module.exports = app; 
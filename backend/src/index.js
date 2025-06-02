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

// 암호화 미들웨어 적용 (secure 경로에만)
app.use(crypto.decryptRequestMiddleware);
app.use(crypto.encryptResponseMiddleware);

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

// JSON 암호화 테스트 엔드포인트
app.post('/api/test-json-encryption', (req, res) => {
    try {
        const { testData } = req.body;
        const result = crypto.testJSONEncryption(testData);
        
        res.json({
            status: 'success',
            data: result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ JSON 암호화 테스트 실패:', error);
        res.status(500).json({
            status: 'error',
            message: 'JSON 암호화 테스트에 실패했습니다',
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

// 보안 데이터 통신 엔드포인트 (기존 유지)
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
        
        // 응답 데이터 암호화 (객체이므로 encryptJSON 사용)
        const encryptedResponse = crypto.encryptJSON(processedData);
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

// ============ 새로운 보안 API 엔드포인트들 ============

// 사용자 관리 API (자동 암호화/복호화)
app.post('/api/secure/user/register', (req, res) => {
    try {
        const { username, email, password, profile } = req.body;
        
        // 입력 검증
        if (!username || !email || !password) {
            return res.status(400).json({
                status: 'error',
                message: '필수 정보가 누락되었습니다'
            });
        }
        
        // 사용자 등록 로직 (실제로는 데이터베이스에 저장)
        const newUser = {
            id: generateRequestId(),
            username,
            email,
            profile: profile || {},
            createdAt: new Date().toISOString(),
            status: 'active'
        };
        
        console.log('👤 새 사용자 등록:', newUser);
        
        res.json({
            status: 'success',
            message: '사용자가 성공적으로 등록되었습니다',
            data: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                createdAt: newUser.createdAt
            }
        });
        
    } catch (error) {
        console.error('❌ 사용자 등록 실패:', error);
        res.status(500).json({
            status: 'error',
            message: '사용자 등록에 실패했습니다',
            error: error.message
        });
    }
});

app.post('/api/secure/user/login', (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({
                status: 'error',
                message: '사용자명과 비밀번호가 필요합니다'
            });
        }
        
        // 로그인 검증 로직 (실제로는 데이터베이스에서 확인)
        const user = {
            id: 'user_' + generateRequestId(),
            username,
            email: `${username}@example.com`,
            lastLogin: new Date().toISOString()
        };
        
        // JWT 토큰 생성 (실제로는 JWT 라이브러리 사용)
        const token = Buffer.from(JSON.stringify({
            userId: user.id,
            username: user.username,
            exp: Date.now() + 24 * 60 * 60 * 1000 // 24시간
        })).toString('base64');
        
        console.log('🔐 사용자 로그인:', user);
        
        res.json({
            status: 'success',
            message: '로그인이 성공했습니다',
            data: {
                user,
                token,
                expiresIn: '24h'
            }
        });
        
    } catch (error) {
        console.error('❌ 로그인 실패:', error);
        res.status(500).json({
            status: 'error',
            message: '로그인에 실패했습니다',
            error: error.message
        });
    }
});

// 데이터 관리 API
app.post('/api/secure/data/create', (req, res) => {
    try {
        const { type, content, metadata } = req.body;
        
        if (!type || !content) {
            return res.status(400).json({
                status: 'error',
                message: '데이터 타입과 내용이 필요합니다'
            });
        }
        
        const newData = {
            id: 'data_' + generateRequestId(),
            type,
            content,
            metadata: metadata || {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        console.log('📝 새 데이터 생성:', newData);
        
        res.json({
            status: 'success',
            message: '데이터가 성공적으로 생성되었습니다',
            data: newData
        });
        
    } catch (error) {
        console.error('❌ 데이터 생성 실패:', error);
        res.status(500).json({
            status: 'error',
            message: '데이터 생성에 실패했습니다',
            error: error.message
        });
    }
});

app.post('/api/secure/data/read', (req, res) => {
    try {
        const { id, type, filters } = req.body;
        
        // 데이터 조회 로직 (실제로는 데이터베이스에서 검색)
        const mockData = {
            id: id || 'data_' + generateRequestId(),
            type: type || 'document',
            content: {
                title: '샘플 문서',
                body: '이것은 암호화된 통신으로 전송되는 샘플 데이터입니다.',
                tags: ['중요', '기밀', '테스트']
            },
            metadata: {
                author: 'system',
                version: '1.0',
                classification: 'confidential'
            },
            createdAt: new Date().toISOString(),
            accessedAt: new Date().toISOString()
        };
        
        console.log('📖 데이터 조회:', mockData);
        
        res.json({
            status: 'success',
            message: '데이터를 성공적으로 조회했습니다',
            data: mockData
        });
        
    } catch (error) {
        console.error('❌ 데이터 조회 실패:', error);
        res.status(500).json({
            status: 'error',
            message: '데이터 조회에 실패했습니다',
            error: error.message
        });
    }
});

// 메시지 관리 API
app.post('/api/secure/message/send', (req, res) => {
    try {
        const { recipient, subject, content, priority } = req.body;
        
        if (!recipient || !content) {
            return res.status(400).json({
                status: 'error',
                message: '수신자와 메시지 내용이 필요합니다'
            });
        }
        
        const message = {
            id: 'msg_' + generateRequestId(),
            sender: 'current_user',
            recipient,
            subject: subject || '제목 없음',
            content,
            priority: priority || 'normal',
            status: 'sent',
            sentAt: new Date().toISOString(),
            encrypted: true
        };
        
        console.log('📨 메시지 전송:', message);
        
        res.json({
            status: 'success',
            message: '메시지가 성공적으로 전송되었습니다',
            data: {
                messageId: message.id,
                sentAt: message.sentAt,
                status: message.status
            }
        });
        
    } catch (error) {
        console.error('❌ 메시지 전송 실패:', error);
        res.status(500).json({
            status: 'error',
            message: '메시지 전송에 실패했습니다',
            error: error.message
        });
    }
});

// 데이터 암호화 엔드포인트 (기존 유지)
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

// 데이터 복호화 엔드포인트 (기존 유지)
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
    
    return {
        processedAt: timestamp,
        originalData: data,
        processedResult: `처리된 데이터: ${data} (${timestamp})`,
        serverInfo: {
            nodeVersion: process.version,
            platform: process.platform,
            uptime: process.uptime()
        }
    };
}

// 요청 ID 생성 함수
function generateRequestId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 404 에러 핸들러
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: '요청하신 엔드포인트를 찾을 수 없습니다',
        path: req.path,
        method: req.method
    });
});

// 전역 에러 핸들러
app.use((error, req, res, next) => {
    console.error('🚨 서버 에러:', error);
    res.status(500).json({
        status: 'error',
        message: '서버 내부 오류가 발생했습니다',
        error: error.message,
        timestamp: new Date().toISOString()
    });
});

// 서버 시작
app.listen(PORT, () => {
    console.log('🚀 서버가 시작되었습니다!');
    console.log(`📍 주소: http://localhost:${PORT}`);
    console.log(`🕐 시작 시간: ${new Date().toISOString()}`);
    console.log(`🔧 환경: ${process.env.NODE_ENV || 'development'}`);
    console.log('📚 사용 가능한 엔드포인트:');
    console.log('  - GET  /health');
    console.log('  - GET  /api/crypto-info');
    console.log('  - POST /api/test-encryption');
    console.log('  - POST /api/test-json-encryption');
    console.log('  - POST /api/secure-data');
    console.log('  - POST /api/encrypt');
    console.log('  - POST /api/decrypt');
    console.log('  🔒 보안 엔드포인트 (자동 암호화/복호화):');
    console.log('  - POST /api/secure/user/register');
    console.log('  - POST /api/secure/user/login');
    console.log('  - POST /api/secure/data/create');
    console.log('  - POST /api/secure/data/read');
    console.log('  - POST /api/secure/message/send');
    
    // 시작 시 암호화 테스트 실행
    console.log('\n🔐 암호화 시스템 테스트 중...');
    crypto.testEncryption();
    crypto.testJSONEncryption();
    console.log('✅ 서버 준비 완료!\n');
});

module.exports = app; 
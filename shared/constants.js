// 공유 상수 정의
module.exports = {
    // 암호화 설정
    ENCRYPTION: {
        ALGORITHM: 'AES-256-GCM',
        KEY_SIZE: 32, // 32 bytes = 256 bits
        IV_SIZE: 12,  // 12 bytes for GCM
        TAG_SIZE: 16, // 16 bytes authentication tag
        KEY: '12345678901234567890123456789012', // 개발용 키 (실제 환경에서는 환경변수 사용)
        ENCODING: 'base64'
    },
    
    // API 엔드포인트
    API_ENDPOINTS: {
        BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000',
        HEALTH: '/health',
        CRYPTO_INFO: '/api/crypto-info',
        TEST_ENCRYPTION: '/api/test-encryption',
        SECURE_DATA: '/api/secure-data',
        ENCRYPT: '/api/encrypt',
        DECRYPT: '/api/decrypt',
        
        // 새로운 보안 엔드포인트
        USER: {
            REGISTER: '/api/secure/user/register',
            LOGIN: '/api/secure/user/login',
            PROFILE: '/api/secure/user/profile',
            UPDATE: '/api/secure/user/update'
        },
        DATA: {
            CREATE: '/api/secure/data/create',
            READ: '/api/secure/data/read',
            UPDATE: '/api/secure/data/update',
            DELETE: '/api/secure/data/delete',
            LIST: '/api/secure/data/list'
        },
        MESSAGE: {
            SEND: '/api/secure/message/send',
            RECEIVE: '/api/secure/message/receive',
            HISTORY: '/api/secure/message/history'
        }
    },
    
    // 서버 설정
    SERVER: {
        DEFAULT_PORT: 3000,
        FRONTEND_PORT: 8000,
        HOST: 'localhost'
    },
    
    // 응답 상태
    RESPONSE_STATUS: {
        SUCCESS: 'success',
        ERROR: 'error',
        PENDING: 'pending',
        WARNING: 'warning',
        INFO: 'info'
    },
    
    // 에러 메시지
    ERROR_MESSAGES: {
        MISSING_DATA: '데이터가 필요합니다',
        ENCRYPTION_FAILED: '암호화에 실패했습니다',
        DECRYPTION_FAILED: '복호화에 실패했습니다',
        INVALID_FORMAT: '잘못된 데이터 형식입니다',
        SERVER_ERROR: '서버 오류가 발생했습니다',
        WASM_NOT_READY: 'WebAssembly가 아직 준비되지 않았습니다',
        INVALID_DATA: '유효하지 않은 데이터입니다',
        NETWORK_ERROR: '네트워크 연결에 실패했습니다'
    }
}; 
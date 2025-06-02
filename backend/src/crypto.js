const crypto = require('crypto');

// Go WebAssembly와 동일한 암호화 키 (32바이트 = AES-256)
// 실제 환경에서는 환경변수나 안전한 곳에서 관리해야 함
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012'; // 32 bytes

/**
 * 데이터를 AES-256-GCM으로 암호화
 * @param {string} plaintext - 암호화할 평문
 * @returns {string} Base64로 인코딩된 암호화 데이터
 */
function encrypt(plaintext) {
    try {
        // IV(Initialization Vector) 생성 (12바이트, GCM 표준)
        const iv = crypto.randomBytes(12);
        
        // 암호화 객체 생성 (올바른 API 사용)
        const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY, 'utf8'), iv);
        
        // 암호화 수행
        let encrypted = cipher.update(plaintext, 'utf8');
        cipher.final();
        
        // 인증 태그 가져오기
        const authTag = cipher.getAuthTag();
        
        // IV + 암호화된 데이터 + 인증 태그를 결합
        const combined = Buffer.concat([iv, encrypted, authTag]);
        
        // Base64로 인코딩하여 반환
        return combined.toString('base64');
    } catch (error) {
        throw new Error(`암호화 실패: ${error.message}`);
    }
}

/**
 * AES-256-GCM으로 암호화된 데이터를 복호화
 * @param {string} encryptedData - Base64로 인코딩된 암호화 데이터
 * @returns {string} 복호화된 평문
 */
function decrypt(encryptedData) {
    try {
        // Base64 디코딩
        const combined = Buffer.from(encryptedData, 'base64');
        
        // IV, 암호화된 데이터, 인증 태그 분리
        const iv = combined.slice(0, 12);
        const authTag = combined.slice(-16);
        const encrypted = combined.slice(12, -16);
        
        // 복호화 객체 생성
        const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY, 'utf8'), iv);
        decipher.setAuthTag(authTag);
        
        // 복호화 수행
        let decrypted = decipher.update(encrypted, null, 'utf8');
        decipher.final();
        
        return decrypted;
    } catch (error) {
        throw new Error(`복호화 실패: ${error.message}`);
    }
}

/**
 * JSON 객체를 암호화
 * @param {object} data - 암호화할 JSON 객체
 * @returns {string} 암호화된 JSON 문자열
 */
function encryptJSON(data) {
    try {
        const jsonString = JSON.stringify(data);
        return encrypt(jsonString);
    } catch (error) {
        throw new Error(`JSON 암호화 실패: ${error.message}`);
    }
}

/**
 * 암호화된 JSON 문자열을 복호화
 * @param {string} encryptedData - 암호화된 데이터
 * @returns {object} 복호화된 JSON 객체
 */
function decryptJSON(encryptedData) {
    try {
        const decryptedString = decrypt(encryptedData);
        return JSON.parse(decryptedString);
    } catch (error) {
        throw new Error(`JSON 복호화 실패: ${error.message}`);
    }
}

/**
 * 요청 본문 자동 복호화 미들웨어
 */
function decryptRequestMiddleware(req, res, next) {
    // secure 경로에서만 암호화 처리
    if (!req.path.startsWith('/api/secure/')) {
        return next();
    }

    try {
        if (req.body && req.body.encryptedData) {
            console.log('🔓 요청 데이터 복호화 중...');
            const decryptedData = decryptJSON(req.body.encryptedData);
            req.body = decryptedData;
            req.isDecrypted = true;
            console.log('✅ 요청 복호화 완료:', JSON.stringify(decryptedData, null, 2));
        }
        next();
    } catch (error) {
        console.error('❌ 요청 복호화 실패:', error.message);
        res.status(400).json({
            status: 'error',
            message: '잘못된 암호화 데이터입니다',
            error: error.message
        });
    }
}

/**
 * 응답 데이터 자동 암호화 미들웨어
 */
function encryptResponseMiddleware(req, res, next) {
    // secure 경로에서만 암호화 처리
    if (!req.path.startsWith('/api/secure/')) {
        return next();
    }

    // 원본 json 메서드 저장
    const originalJson = res.json;
    
    // json 메서드 오버라이드
    res.json = function(data) {
        try {
            console.log('🔒 응답 데이터 암호화 중...');
            console.log('📤 원본 응답:', JSON.stringify(data, null, 2));
            
            const encryptedData = encryptJSON(data);
            const encryptedResponse = {
                encryptedData: encryptedData,
                timestamp: new Date().toISOString(),
                encrypted: true
            };
            
            console.log('✅ 응답 암호화 완료');
            return originalJson.call(this, encryptedResponse);
        } catch (error) {
            console.error('❌ 응답 암호화 실패:', error.message);
            return originalJson.call(this, {
                status: 'error',
                message: '응답 암호화에 실패했습니다',
                error: error.message
            });
        }
    };
    
    next();
}

/**
 * 암호화 키 정보 반환
 * @returns {object} 키 정보 객체
 */
function getKeyInfo() {
    return {
        algorithm: 'AES-256-GCM',
        keySize: ENCRYPTION_KEY.length,
        keyHash: ENCRYPTION_KEY.slice(0, 8) + '...' // 보안상 일부만 표시
    };
}

/**
 * 암호화 테스트
 * @param {string} testData - 테스트할 데이터
 * @returns {object} 테스트 결과
 */
function testEncryption(testData = 'Hello World! 안녕하세요! 🔐') {
    try {
        console.log('🔐 암호화 테스트 시작...');
        console.log(`원본 데이터: ${testData}`);
        
        // 암호화
        const encrypted = encrypt(testData);
        console.log(`암호화 결과: ${encrypted}`);
        
        // 복호화
        const decrypted = decrypt(encrypted);
        console.log(`복호화 결과: ${decrypted}`);
        
        // 검증
        const isValid = testData === decrypted;
        console.log(`검증 결과: ${isValid ? '✅ 성공' : '❌ 실패'}`);
        
        return {
            success: isValid,
            original: testData,
            encrypted: encrypted,
            decrypted: decrypted,
            encryptedLength: encrypted.length,
            originalLength: testData.length
        };
    } catch (error) {
        console.error('❌ 암호화 테스트 실패:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * JSON 암호화 테스트
 * @param {object} testData - 테스트할 JSON 객체
 * @returns {object} 테스트 결과
 */
function testJSONEncryption(testData = { message: 'Hello', data: [1, 2, 3], korean: '안녕하세요' }) {
    try {
        console.log('🔐 JSON 암호화 테스트 시작...');
        console.log('원본 JSON:', JSON.stringify(testData, null, 2));
        
        // JSON 암호화
        const encrypted = encryptJSON(testData);
        console.log(`암호화 결과: ${encrypted.slice(0, 50)}...`);
        
        // JSON 복호화
        const decrypted = decryptJSON(encrypted);
        console.log('복호화 결과:', JSON.stringify(decrypted, null, 2));
        
        // 검증
        const isValid = JSON.stringify(testData) === JSON.stringify(decrypted);
        console.log(`검증 결과: ${isValid ? '✅ 성공' : '❌ 실패'}`);
        
        return {
            success: isValid,
            original: testData,
            encrypted: encrypted,
            decrypted: decrypted,
            encryptedLength: encrypted.length
        };
    } catch (error) {
        console.error('❌ JSON 암호화 테스트 실패:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

module.exports = {
    encrypt,
    decrypt,
    encryptJSON,
    decryptJSON,
    decryptRequestMiddleware,
    encryptResponseMiddleware,
    getKeyInfo,
    testEncryption,
    testJSONEncryption,
    ENCRYPTION_KEY
}; 
const crypto = require('crypto');

// Go WebAssembly와 동일한 암호화 키 (32바이트 = AES-256)
// 실제 환경에서는 환경변수나 안전한 곳에서 관리해야 함
const ENCRYPTION_KEY = '12345678901234567890123456789012'; // 32 bytes

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

module.exports = {
    encrypt,
    decrypt,
    getKeyInfo,
    testEncryption,
    ENCRYPTION_KEY
}; 
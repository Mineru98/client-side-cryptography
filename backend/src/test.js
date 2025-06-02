const crypto = require('./crypto');

console.log('🔧 Backend 암호화 시스템 테스트 시작...\n');

// 테스트 데이터
const testCases = [
    'Hello World!',
    '안녕하세요! 🔐',
    'This is a longer test message with special characters: !@#$%^&*()',
    JSON.stringify({ message: 'JSON 데이터 테스트', timestamp: new Date().toISOString() }),
    '𝔗𝔥𝔦𝔰 𝔦𝔰 𝔞 𝔰𝔞𝔪𝔭𝔩𝔢 𝔪𝔢𝔰𝔰𝔞𝔤𝔢 𝔴𝔦𝔱𝔥 𝕦𝔫𝔦𝔠𝔬𝔡𝔢' // Unicode 테스트
];

// 키 정보 표시
console.log('🔑 암호화 키 정보:');
const keyInfo = crypto.getKeyInfo();
console.log(`   알고리즘: ${keyInfo.algorithm}`);
console.log(`   키 크기: ${keyInfo.keySize} bytes`);
console.log(`   키 해시: ${keyInfo.keyHash}\n`);

// 각 테스트 케이스 실행
testCases.forEach((testData, index) => {
    console.log(`📋 테스트 케이스 ${index + 1}:`);
    console.log(`   원본: ${testData}`);
    
    try {
        // 암호화
        const encrypted = crypto.encrypt(testData);
        console.log(`   암호화: ${encrypted.substring(0, 50)}...`);
        
        // 복호화
        const decrypted = crypto.decrypt(encrypted);
        console.log(`   복호화: ${decrypted}`);
        
        // 검증
        const isValid = testData === decrypted;
        console.log(`   결과: ${isValid ? '✅ 성공' : '❌ 실패'}`);
        
        if (!isValid) {
            console.error(`   ⚠️ 불일치 감지!`);
            console.error(`      원본 길이: ${testData.length}`);
            console.error(`      복호화 길이: ${decrypted.length}`);
        }
        
    } catch (error) {
        console.error(`   ❌ 오류: ${error.message}`);
    }
    
    console.log(''); // 빈 줄
});

// 성능 테스트
console.log('⚡ 성능 테스트 시작...');
const largeData = 'A'.repeat(10000); // 10KB 데이터
const startTime = Date.now();

try {
    const encrypted = crypto.encrypt(largeData);
    const decrypted = crypto.decrypt(encrypted);
    const endTime = Date.now();
    
    const isValid = largeData === decrypted;
    console.log(`   데이터 크기: ${largeData.length} bytes`);
    console.log(`   암호화된 크기: ${encrypted.length} bytes`);
    console.log(`   처리 시간: ${endTime - startTime}ms`);
    console.log(`   결과: ${isValid ? '✅ 성공' : '❌ 실패'}`);
    
} catch (error) {
    console.error(`   ❌ 성능 테스트 실패: ${error.message}`);
}

console.log('\n🎉 테스트 완료!');
console.log('이제 서버를 시작할 수 있습니다: npm run dev'); 
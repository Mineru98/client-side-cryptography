#!/usr/bin/env node

/**
 * 보안 API 테스트 스크립트
 * 새로운 JSON 자동 암호화/복호화 시스템을 테스트합니다.
 */

const fetch = require('node-fetch');
const { encrypt, decrypt, encryptJSON, decryptJSON, testJSONEncryption } = require('./backend/src/crypto');

const BASE_URL = 'http://localhost:3000';

// 테스트 데이터
const testUserData = {
    username: 'testuser_' + Date.now(),
    email: 'test_' + Date.now() + '@example.com',
    password: 'securePassword123!',
    profile: {
        name: '홍길동',
        age: 30,
        department: '보안팀',
        clearanceLevel: 'confidential'
    }
};

const testDataInfo = {
    type: 'classified-document',
    content: {
        title: '기밀 프로젝트 보고서',
        body: '이 문서는 높은 수준의 보안이 요구되는 내용을 포함합니다.',
        classification: 'top-secret',
        tags: ['기밀', '프로젝트', '보고서'],
        data: {
            revenue: 1000000,
            participants: ['Alice', 'Bob', 'Charlie'],
            startDate: '2024-01-01',
            endDate: '2024-12-31'
        }
    },
    metadata: {
        version: '1.2.3',
        author: 'system',
        classification: 'confidential',
        department: 'security',
        createdBy: 'testuser',
        reviewedBy: ['supervisor1', 'supervisor2']
    }
};

const testMessageInfo = {
    recipient: 'admin',
    subject: '긴급: 보안 이슈 보고',
    content: `긴급한 보안 이슈가 발견되었습니다.
    
세부사항:
- 이벤트 시간: ${new Date().toISOString()}
- 심각도: 높음
- 영향 범위: 전체 시스템
- 권장 조치: 즉시 대응 필요

이 메시지는 암호화되어 전송됩니다.`,
    priority: 'urgent'
};

// API 호출 함수
async function secureApiCall(endpoint, data) {
    try {
        console.log(`🔒 보안 API 호출: ${endpoint}`);
        console.log('📤 원본 데이터:', JSON.stringify(data, null, 2));

        // 1. 데이터 암호화
        const encryptedData = encryptJSON(data);
        console.log('🔐 암호화 완료:', encryptedData.slice(0, 50) + '...');

        // 2. 서버 요청
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ encryptedData })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const responseData = await response.json();
        console.log('📥 서버 응답 (암호화됨):', responseData);

        // 3. 응답 복호화
        if (responseData.encryptedData) {
            const decryptedResponse = decryptJSON(responseData.encryptedData);
            console.log('🔓 복호화된 응답:', JSON.stringify(decryptedResponse, null, 2));
            return {
                success: true,
                data: decryptedResponse,
                encrypted: true,
                timestamp: responseData.timestamp
            };
        } else {
            return {
                success: false,
                data: responseData,
                encrypted: false
            };
        }

    } catch (error) {
        console.error('❌ API 호출 실패:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

// 일반 API 호출 함수 (암호화 없음)
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json'
            },
            ...options
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('❌ API 호출 실패:', error.message);
        throw error;
    }
}

// 테스트 함수들
async function testServerHealth() {
    console.log('\n🔧 서버 상태 확인...');
    try {
        const result = await apiCall('/health');
        console.log('✅ 서버 상태:', JSON.stringify(result, null, 2));
        return true;
    } catch (error) {
        console.error('❌ 서버 연결 실패:', error.message);
        return false;
    }
}

async function testCryptoInfo() {
    console.log('\n🔐 암호화 정보 조회...');
    try {
        const result = await apiCall('/api/crypto-info');
        console.log('✅ 암호화 정보:', JSON.stringify(result, null, 2));
        return true;
    } catch (error) {
        console.error('❌ 암호화 정보 조회 실패:', error.message);
        return false;
    }
}

async function testJSONEncryptionAPI() {
    console.log('\n🧪 서버 JSON 암호화 테스트...');
    try {
        const testData = {
            message: 'Hello from test script!',
            korean: '테스트 스크립트에서 보내는 메시지',
            numbers: [1, 2, 3, 4, 5],
            nested: {
                info: '중첩된 객체 테스트',
                timestamp: new Date().toISOString(),
                boolean: true,
                null_value: null
            }
        };

        const result = await apiCall('/api/test-json-encryption', {
            method: 'POST',
            body: JSON.stringify({ testData })
        });

        console.log('✅ 서버 JSON 암호화 테스트 결과:', JSON.stringify(result, null, 2));
        return true;
    } catch (error) {
        console.error('❌ JSON 암호화 테스트 실패:', error.message);
        return false;
    }
}

async function testUserRegistration() {
    console.log('\n👤 사용자 등록 테스트...');
    const result = await secureApiCall('/api/secure/user/register', testUserData);
    
    if (result.success) {
        console.log('✅ 사용자 등록 성공!');
        return true;
    } else {
        console.error('❌ 사용자 등록 실패:', result.error || result.data);
        return false;
    }
}

async function testUserLogin() {
    console.log('\n🔐 사용자 로그인 테스트...');
    const loginData = {
        username: testUserData.username,
        password: testUserData.password
    };
    
    const result = await secureApiCall('/api/secure/user/login', loginData);
    
    if (result.success) {
        console.log('✅ 로그인 성공!');
        return true;
    } else {
        console.error('❌ 로그인 실패:', result.error || result.data);
        return false;
    }
}

async function testDataCreation() {
    console.log('\n📝 데이터 생성 테스트...');
    const result = await secureApiCall('/api/secure/data/create', testDataInfo);
    
    if (result.success) {
        console.log('✅ 데이터 생성 성공!');
        return true;
    } else {
        console.error('❌ 데이터 생성 실패:', result.error || result.data);
        return false;
    }
}

async function testDataReading() {
    console.log('\n📖 데이터 조회 테스트...');
    const queryInfo = {
        type: testDataInfo.type,
        filters: {
            classification: 'confidential'
        }
    };
    
    const result = await secureApiCall('/api/secure/data/read', queryInfo);
    
    if (result.success) {
        console.log('✅ 데이터 조회 성공!');
        return true;
    } else {
        console.error('❌ 데이터 조회 실패:', result.error || result.data);
        return false;
    }
}

async function testMessageSending() {
    console.log('\n📨 메시지 전송 테스트...');
    const result = await secureApiCall('/api/secure/message/send', testMessageInfo);
    
    if (result.success) {
        console.log('✅ 메시지 전송 성공!');
        return true;
    } else {
        console.error('❌ 메시지 전송 실패:', result.error || result.data);
        return false;
    }
}

async function testLocalJSONEncryption() {
    console.log('\n🔐 로컬 JSON 암호화 테스트...');
    try {
        const result = testJSONEncryption({
            message: 'Local encryption test',
            korean: '로컬 암호화 테스트',
            timestamp: new Date().toISOString(),
            complex: {
                array: [1, 2, 3],
                object: { nested: true },
                boolean: false
            }
        });

        if (result.success) {
            console.log('✅ 로컬 JSON 암호화 테스트 성공!');
            console.log('📊 테스트 결과:', JSON.stringify(result, null, 2));
            return true;
        } else {
            console.error('❌ 로컬 JSON 암호화 테스트 실패:', result.error);
            return false;
        }
    } catch (error) {
        console.error('❌ 로컬 암호화 테스트 오류:', error.message);
        return false;
    }
}

// 메인 테스트 실행 함수
async function runAllTests() {
    console.log('🚀 보안 API 통합 테스트 시작!');
    console.log('=' * 50);

    const tests = [
        { name: '서버 상태 확인', fn: testServerHealth },
        { name: '암호화 정보 조회', fn: testCryptoInfo },
        { name: '로컬 JSON 암호화 테스트', fn: testLocalJSONEncryption },
        { name: '서버 JSON 암호화 테스트', fn: testJSONEncryptionAPI },
        { name: '사용자 등록', fn: testUserRegistration },
        { name: '사용자 로그인', fn: testUserLogin },
        { name: '데이터 생성', fn: testDataCreation },
        { name: '데이터 조회', fn: testDataReading },
        { name: '메시지 전송', fn: testMessageSending }
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        try {
            console.log(`\n🧪 ${test.name} 테스트 실행 중...`);
            const result = await test.fn();
            if (result) {
                passed++;
                console.log(`✅ ${test.name} 성공`);
            } else {
                failed++;
                console.log(`❌ ${test.name} 실패`);
            }
        } catch (error) {
            failed++;
            console.error(`💥 ${test.name} 오류:`, error.message);
        }
        
        // 테스트 간 짧은 지연
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n' + '=' * 50);
    console.log('📊 테스트 결과 요약:');
    console.log(`✅ 성공: ${passed}개`);
    console.log(`❌ 실패: ${failed}개`);
    console.log(`📈 성공률: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

    if (failed === 0) {
        console.log('🎉 모든 테스트가 성공했습니다!');
        process.exit(0);
    } else {
        console.log('⚠️  일부 테스트가 실패했습니다. 서버 상태를 확인해주세요.');
        process.exit(1);
    }
}

// 스크립트 실행
if (require.main === module) {
    runAllTests().catch(error => {
        console.error('💥 테스트 실행 중 치명적 오류 발생:', error);
        process.exit(1);
    });
}

module.exports = {
    runAllTests,
    testUserRegistration,
    testUserLogin,
    testDataCreation,
    testDataReading,
    testMessageSending,
    secureApiCall,
    apiCall
}; 
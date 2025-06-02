/**
 * 클라이언트 측 암호화 유틸리티
 * WebAssembly와 서버 API를 연동하여 자동 암호화/복호화 기능 제공
 */

class CryptoUtils {
    constructor() {
        this.wasmReady = false;
        this.baseURL = 'http://localhost:3000';
    }

    /**
     * WebAssembly 준비 상태 설정
     */
    setWasmReady(ready) {
        this.wasmReady = ready;
        console.log(`🔐 WebAssembly 상태: ${ready ? '준비됨' : '대기중'}`);
    }

    /**
     * JSON 객체를 암호화
     */
    encryptJSON(data) {
        if (!this.wasmReady) {
            throw new Error('WebAssembly가 준비되지 않았습니다');
        }

        try {
            const jsonString = JSON.stringify(data);
            const result = cryptoEncrypt(jsonString); // WebAssembly 함수 호출
            
            if (result.success) {
                return {
                    success: true,
                    encryptedData: result.data
                };
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('❌ JSON 암호화 실패:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 암호화된 JSON 데이터를 복호화
     */
    decryptJSON(encryptedData) {
        if (!this.wasmReady) {
            throw new Error('WebAssembly가 준비되지 않았습니다');
        }

        try {
            const result = cryptoDecrypt(encryptedData); // WebAssembly 함수 호출
            
            if (result.success) {
                const parsedData = JSON.parse(result.data);
                return {
                    success: true,
                    data: parsedData
                };
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('❌ JSON 복호화 실패:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 보안 API 호출 (자동 암호화/복호화)
     */
    async secureApiCall(endpoint, data, options = {}) {
        if (!this.wasmReady) {
            throw new Error('WebAssembly가 준비되지 않았습니다');
        }

        try {
            console.log(`🔒 보안 API 호출: ${endpoint}`);
            console.log('📤 원본 데이터:', data);

            // 1. 요청 데이터 암호화
            const encryptResult = this.encryptJSON(data);
            if (!encryptResult.success) {
                throw new Error('요청 데이터 암호화 실패: ' + encryptResult.error);
            }

            console.log('🔐 암호화된 요청 데이터:', encryptResult.encryptedData.slice(0, 50) + '...');

            // 2. 서버로 암호화된 데이터 전송
            const requestBody = {
                encryptedData: encryptResult.encryptedData
            };

            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                body: JSON.stringify(requestBody),
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP 오류: ${response.status} ${response.statusText}`);
            }

            const responseData = await response.json();
            console.log('📥 서버 응답:', responseData);

            // 3. 응답 데이터 복호화
            if (responseData.encryptedData) {
                const decryptResult = this.decryptJSON(responseData.encryptedData);
                if (!decryptResult.success) {
                    throw new Error('응답 데이터 복호화 실패: ' + decryptResult.error);
                }

                console.log('🔓 복호화된 응답:', decryptResult.data);
                return {
                    success: true,
                    data: decryptResult.data,
                    encrypted: true,
                    timestamp: responseData.timestamp
                };
            } else {
                // 암호화되지 않은 응답 (에러 등)
                return {
                    success: false,
                    data: responseData,
                    encrypted: false
                };
            }

        } catch (error) {
            console.error('❌ 보안 API 호출 실패:', error);
            return {
                success: false,
                error: error.message,
                encrypted: false
            };
        }
    }

    /**
     * 사용자 등록
     */
    async registerUser(userData) {
        return this.secureApiCall('/api/secure/user/register', userData);
    }

    /**
     * 사용자 로그인
     */
    async loginUser(credentials) {
        return this.secureApiCall('/api/secure/user/login', credentials);
    }

    /**
     * 데이터 생성
     */
    async createData(dataInfo) {
        return this.secureApiCall('/api/secure/data/create', dataInfo);
    }

    /**
     * 데이터 조회
     */
    async readData(queryInfo) {
        return this.secureApiCall('/api/secure/data/read', queryInfo);
    }

    /**
     * 메시지 전송
     */
    async sendMessage(messageInfo) {
        return this.secureApiCall('/api/secure/message/send', messageInfo);
    }

    /**
     * 일반 API 호출 (암호화 없음)
     */
    async apiCall(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json'
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP 오류: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('❌ API 호출 실패:', error);
            throw error;
        }
    }

    /**
     * 서버 상태 확인
     */
    async checkHealth() {
        return this.apiCall('/health');
    }

    /**
     * 암호화 정보 조회
     */
    async getCryptoInfo() {
        return this.apiCall('/api/crypto-info');
    }
}

// 전역 CryptoUtils 인스턴스 생성
window.cryptoUtils = new CryptoUtils();

// WebAssembly 준비 완료 콜백 업데이트
const originalOnCryptoWasmReady = window.onCryptoWasmReady;
window.onCryptoWasmReady = function() {
    window.cryptoUtils.setWasmReady(true);
    if (originalOnCryptoWasmReady) {
        originalOnCryptoWasmReady();
    }
};

console.log('🔐 CryptoUtils 로드 완료'); 
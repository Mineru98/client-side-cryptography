//go:build js && wasm
// +build js,wasm

package main

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"syscall/js"
)

// 공유 암호화 키 (32바이트 = AES-256)
// 실제 환경에서는 환경변수나 안전한 곳에서 관리해야 함
const ENCRYPTION_KEY = "12345678901234567890123456789012" // 32 bytes

func main() {
	fmt.Println("🔐 Crypto WebAssembly 모듈이 로드되었습니다.")
	setupCryptoFunctions()

	// Keep the program running
	select {}
}

func setupCryptoFunctions() {
	js.Global().Set("cryptoEncrypt", js.FuncOf(encrypt))
	js.Global().Set("cryptoDecrypt", js.FuncOf(decrypt))
	js.Global().Set("getEncryptionKey", js.FuncOf(getEncryptionKey))
	js.Global().Set("cryptoWasmReady", js.FuncOf(onReady))

	// 준비 완료 이벤트 발생
	if readyCallback := js.Global().Get("onCryptoWasmReady"); !readyCallback.IsUndefined() {
		readyCallback.Invoke()
	}
}

// 암호화 함수
func encrypt(this js.Value, args []js.Value) interface{} {
	if len(args) < 1 {
		return map[string]interface{}{
			"success": false,
			"error":   "데이터가 필요합니다",
		}
	}

	plaintext := args[0].String()

	// AES 블록 생성
	block, err := aes.NewCipher([]byte(ENCRYPTION_KEY))
	if err != nil {
		return map[string]interface{}{
			"success": false,
			"error":   fmt.Sprintf("AES 초기화 실패: %v", err),
		}
	}

	// GCM 모드 생성
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return map[string]interface{}{
			"success": false,
			"error":   fmt.Sprintf("GCM 초기화 실패: %v", err),
		}
	}

	// Nonce 생성
	nonce := make([]byte, gcm.NonceSize())
	if _, err := rand.Read(nonce); err != nil {
		return map[string]interface{}{
			"success": false,
			"error":   fmt.Sprintf("Nonce 생성 실패: %v", err),
		}
	}

	// 암호화 수행
	ciphertext := gcm.Seal(nonce, nonce, []byte(plaintext), nil)

	// Base64 인코딩
	encoded := base64.StdEncoding.EncodeToString(ciphertext)

	return map[string]interface{}{
		"success": true,
		"data":    encoded,
		"length":  len(encoded),
	}
}

// 복호화 함수
func decrypt(this js.Value, args []js.Value) interface{} {
	if len(args) < 1 {
		return map[string]interface{}{
			"success": false,
			"error":   "암호화된 데이터가 필요합니다",
		}
	}

	encodedData := args[0].String()

	// Base64 디코딩
	ciphertext, err := base64.StdEncoding.DecodeString(encodedData)
	if err != nil {
		return map[string]interface{}{
			"success": false,
			"error":   fmt.Sprintf("Base64 디코딩 실패: %v", err),
		}
	}

	// AES 블록 생성
	block, err := aes.NewCipher([]byte(ENCRYPTION_KEY))
	if err != nil {
		return map[string]interface{}{
			"success": false,
			"error":   fmt.Sprintf("AES 초기화 실패: %v", err),
		}
	}

	// GCM 모드 생성
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return map[string]interface{}{
			"success": false,
			"error":   fmt.Sprintf("GCM 초기화 실패: %v", err),
		}
	}

	// Nonce 크기 확인
	nonceSize := gcm.NonceSize()
	if len(ciphertext) < nonceSize {
		return map[string]interface{}{
			"success": false,
			"error":   "잘못된 암호화 데이터 형식",
		}
	}

	// Nonce와 암호화된 데이터 분리
	nonce, ciphertext := ciphertext[:nonceSize], ciphertext[nonceSize:]

	// 복호화 수행
	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return map[string]interface{}{
			"success": false,
			"error":   fmt.Sprintf("복호화 실패: %v", err),
		}
	}

	return map[string]interface{}{
		"success": true,
		"data":    string(plaintext),
		"length":  len(plaintext),
	}
}

// 암호화 키 반환 (해시된 형태로)
func getEncryptionKey(this js.Value, args []js.Value) interface{} {
	// 보안상 실제 키 대신 해시된 형태 반환
	keyHex := hex.EncodeToString([]byte(ENCRYPTION_KEY))

	return map[string]interface{}{
		"keyHash":   keyHex[:8] + "...", // 처음 8자만 표시
		"keySize":   len(ENCRYPTION_KEY),
		"algorithm": "AES-256-GCM",
	}
}

// 준비 완료 콜백
func onReady(this js.Value, args []js.Value) interface{} {
	fmt.Println("✅ 암호화 모듈이 준비되었습니다!")
	return map[string]interface{}{
		"status":    "ready",
		"functions": []string{"cryptoEncrypt", "cryptoDecrypt", "getEncryptionKey"},
	}
}

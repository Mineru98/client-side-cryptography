package main

import (
	"fmt"
	"syscall/js"
)

func getCurrentHost() string {
	location := js.Global().Get("window").Get("location")
	host := location.Get("host").String()
	return host
}

// 현재 브라우저의 전체 URL 정보를 가져오는 함수
func getCurrentURL() map[string]string {
	location := js.Global().Get("window").Get("location")

	urlInfo := map[string]string{
		"protocol": location.Get("protocol").String(),
		"host":     location.Get("host").String(),
		"hostname": location.Get("hostname").String(),
		"port":     location.Get("port").String(),
		"pathname": location.Get("pathname").String(),
		"search":   location.Get("search").String(),
		"hash":     location.Get("hash").String(),
		"href":     location.Get("href").String(),
	}

	return urlInfo
}

// JavaScript에서 호출할 수 있는 함수들을 등록
func setupFunctions() {
	// getHost 함수를 JavaScript에 노출
	js.Global().Set("getHost", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		host := getCurrentHost()
		fmt.Printf("현재 호스트: %s\n", host)
		return host
	}))

	// getURLInfo 함수를 JavaScript에 노출
	js.Global().Set("getURLInfo", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		urlInfo := getCurrentURL()

		// 콘솔에 출력
		fmt.Println("=== 현재 URL 정보 ===")
		for key, value := range urlInfo {
			fmt.Printf("%s: %s\n", key, value)
		}

		// JavaScript 객체로 반환
		jsObj := js.Global().Get("Object").New()
		for key, value := range urlInfo {
			jsObj.Set(key, value)
		}

		return jsObj
	}))

	// 초기화 완료를 알리는 함수
	js.Global().Set("goWasmReady", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		fmt.Println("Go WebAssembly가 성공적으로 로드되었습니다!")
		return nil
	}))
}

func main() {
	fmt.Println("Go WebAssembly 시작!")

	setupFunctions()

	host := getCurrentHost()
	fmt.Printf("자동 감지된 현재 호스트: %s\n", host)

	// 프로그램이 종료되지 않도록 대기
	select {}
}

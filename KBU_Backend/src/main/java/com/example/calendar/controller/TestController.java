// 📁 com.example.calendar.controller.TestController.java

package com.example.calendar.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestController {

    // ✅ JWT 인증이 필요한 테스트용 API
    @GetMapping("/hello")
    public String hello() {
        return "인증된 사용자만 볼 수 있는 메시지입니다.";
    }
}

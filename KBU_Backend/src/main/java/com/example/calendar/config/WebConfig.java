package com.example.calendar.config;

import org.springframework.context.annotation.Configuration;

// ✅ WebMvcConfigurer 설정 없음 (CORS는 SecurityConfig에서 관리)
@Configuration
public class WebConfig {
    // 불필요한 설정 제거 – CORS는 SecurityConfig.java에서만 설정
}

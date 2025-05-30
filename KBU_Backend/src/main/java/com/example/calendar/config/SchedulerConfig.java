package com.example.calendar.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableScheduling  // 🔔 스케줄링 기능 활성화
public class SchedulerConfig {
    // 설정 전용 클래스이므로 비어 있어도 됨
}

// 📁 com.example.calendar.config.SecurityConfig.java

package com.example.calendar.config;

import jakarta.servlet.Filter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    // ✅ JwtAuthenticationFilter를 등록
    @Bean
    public Filter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter();
    }

    // ✅ AuthenticationManager를 빈으로 등록
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    // ✅ Spring Security 필터 체인 설정
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // ❌ CSRF 비활성화 (JWT는 세션 X)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll() // ✅ 로그인/회원가입은 허용
                        .anyRequest().authenticated()                // 🔒 나머지는 인증 필요
                )
                .formLogin(form -> form.disable())              // ❌ 기본 로그인 폼 제거
                .httpBasic(httpBasic -> httpBasic.disable())    // ❌ HTTP Basic도 끔
                .sessionManagement(sess -> sess
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS) // ✅ JWT는 무상태(stateless)
                )
                // ✅ 우리가 만든 JWT 필터를 UsernamePasswordAuthenticationFilter 앞에 끼워 넣음
                .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}

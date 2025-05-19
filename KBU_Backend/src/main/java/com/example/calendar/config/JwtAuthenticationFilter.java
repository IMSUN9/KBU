// 📁 com.example.calendar.config.JwtAuthenticationFilter.java

package com.example.calendar.config;

import com.example.calendar.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

// ✅ JWT 토큰을 매 요청마다 검사하는 필터 클래스
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    // ✅ 매 요청마다 실행되는 메서드
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // 1. 요청 헤더에서 Authorization 값을 꺼냄
        String authHeader = request.getHeader("Authorization");

        // 2. 토큰이 존재하고 "Bearer "로 시작하는지 확인
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7); // "Bearer " 이후의 문자열만 잘라냄

            // 3. 토큰이 유효한지 검사
            if (JwtUtil.isValidToken(token)) {
                // 4. 토큰에서 사용자 이름 추출
                String username = JwtUtil.getUsernameFromToken(token);

                // 5. 인증 객체 생성 (우리는 권한/역할을 따로 사용 안 하므로 empty list)
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(username, null, Collections.emptyList());

                // 6. 인증 세부 정보 설정
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // 7. SecurityContext에 인증 객체 저장
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        // 8. 다음 필터로 넘김
        filterChain.doFilter(request, response);
    }
}

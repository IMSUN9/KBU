package com.example.calendar.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

// ✅ JWT 토큰을 확인하고 사용자 인증을 처리하는 필터
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // 1. Authorization 헤더에서 JWT 추출
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // "Bearer " 다음 문자열이 실제 토큰
        String token = authHeader.substring(7);

        // 2. JWT 유효성 검증 로직 (임시: 항상 성공 처리)
        if (!token.isBlank() && SecurityContextHolder.getContext().getAuthentication() == null) {

            // 👉 실제 구현에서는 JwtUtil 등을 이용해 username 추출
            String username = "authenticatedUser"; // 임시 사용자명

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(username, null, null);

            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            // 3. SecurityContextHolder에 인증 정보 등록
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        // 4. 다음 필터로 진행
        filterChain.doFilter(request, response);
    }
}

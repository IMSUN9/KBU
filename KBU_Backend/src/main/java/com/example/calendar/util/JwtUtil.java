package com.example.calendar.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;

@Component
public class JwtUtil {

    // ✅ 고정된 시크릿 키를 Base64로 인코딩해서 사용
    private static final String SECRET = "my-calendar-project-very-secret-key-1234567890";
    private static final SecretKey SECRET_KEY = Keys.hmacShaKeyFor(Base64.getEncoder().encode(SECRET.getBytes()));

    // ✅ 토큰 유효 시간 (1시간)
    private static final long EXPIRATION_TIME = 1000 * 60 * 60;

    // ✅ 사용자 이름을 받아 JWT 토큰 생성
    public static String createToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(SECRET_KEY, SignatureAlgorithm.HS256)
                .compact();
    }

    // ✅ 토큰 유효성 검사
    public static boolean isValidToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(SECRET_KEY)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (JwtException e) {
            return false;
        }
    }

    // ✅ 토큰에서 사용자명 추출
    public static String getUsernameFromToken(String token) {
        return getClaims(token).getSubject();
    }

    // ✅ 토큰에서 클레임 추출
    public static Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}

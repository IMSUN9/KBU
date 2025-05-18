package com.example.calendar.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.util.Date;

public class JwtUtil {

    // ✅ 256비트 이상 강력한 키 생성 (라이브러리에서 지원하는 방식 사용)
    private static final SecretKey SECRET_KEY = Keys.secretKeyFor(SignatureAlgorithm.HS256);

    // ✅ 토큰 유효 시간 (1시간)
    private static final long EXPIRATION_TIME = 1000 * 60 * 60;

    // ✅ 사용자 이름을 받아 JWT 토큰 생성
    public static String createToken(String username) {
        return Jwts.builder()
                .setSubject(username) // 사용자 정보
                .setIssuedAt(new Date()) // 생성 시간
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME)) // 만료 시간
                .signWith(SECRET_KEY, SignatureAlgorithm.HS256) // 비밀 키와 알고리즘으로 서명
                .compact(); // 최종 토큰 문자열 생성
    }

    // ✅ 토큰이 유효한지 검사
    public static boolean isValidToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(SECRET_KEY)
                    .build()
                    .parseClaimsJws(token); // 파싱이 되면 유효한 것
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // ✅ 토큰에서 사용자 이름 추출
    public static String getUsernameFromToken(String token) {
        return getClaims(token).getSubject();
    }

    // ✅ 토큰에서 Claims (전체 payload 정보) 추출
    public static Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}

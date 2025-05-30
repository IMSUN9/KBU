// ✅ KakaoService.java (access token 저장 포함)
package com.example.calendar.service;

import com.example.calendar.model.User;
import com.example.calendar.repository.UserRepository;
import com.example.calendar.util.JwtUtil;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Service
public class KakaoService {

    @Value("${kakao.client-id}")
    private String clientId;

    @Value("${kakao.redirect-uri}")
    private String redirectUri;

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public KakaoService(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    public String kakaoLogin(String code) {
        String accessToken = getAccessToken(code);
        Map<String, Object> userInfo = getUserInfo(accessToken);

        Long kakaoId = (Long) userInfo.get("id");
        String username = "kakao_" + kakaoId;

        User user = userRepository.findByUsername(username)
                .orElseGet(() -> new User(username, "kakao_dummy_password"));

        // ✅ access token 저장
        user.setKakaoAccessToken(accessToken);
        userRepository.save(user);

        return jwtUtil.createToken(user.getUsername());
    }

    private String getAccessToken(String code) {
        try {
            HttpClient client = HttpClient.newHttpClient();

            String body = "grant_type=authorization_code"
                    + "&client_id=" + clientId
                    + "&redirect_uri=" + URLEncoder.encode(redirectUri, StandardCharsets.UTF_8)
                    + "&code=" + code;

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://kauth.kakao.com/oauth/token"))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readTree(response.body()).get("access_token").asText();

        } catch (Exception e) {
            throw new RuntimeException("❌ access_token 요청 실패", e);
        }
    }

    private Map<String, Object> getUserInfo(String accessToken) {
        try {
            HttpClient client = HttpClient.newHttpClient();

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://kapi.kakao.com/v2/user/me"))
                    .header("Authorization", "Bearer " + accessToken)
                    .GET()
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            ObjectMapper mapper = new ObjectMapper();
            JsonNode json = mapper.readTree(response.body());

            Map<String, Object> result = new HashMap<>();
            result.put("id", json.get("id").asLong());
            result.put("nickname", json.path("properties").path("nickname").asText());

            return result;

        } catch (Exception e) {
            throw new RuntimeException("❌ 사용자 정보 요청 실패", e);
        }
    }
}

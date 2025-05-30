package com.example.calendar.service;

import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

@Service
public class KakaoMessageService {

    // ✅ "나에게 보내기" 메시지 전송 URL (v2 기본 템플릿 사용)
    private static final String SEND_URL = "https://kapi.kakao.com/v2/api/talk/memo/default/send";

    private final HttpClient client = HttpClient.newHttpClient();

    /**
     * ✅ 사용자 access_token을 받아서 본인에게 기본 템플릿 메시지 전송
     * @param accessToken 카카오 로그인 후 발급된 사용자 access token
     */
    public void sendSimpleMessage(String accessToken) throws IOException, InterruptedException {
        // ✅ 디버깅용 access token 출력
        System.out.println("🔑 [디버그용] access_token = " + accessToken);

        // ✅ 기본 템플릿 JSON (object_type: text)
        String templateJson = """
            {
              "object_type": "text",
              "text": "⏰ 내일 일정이 있어요!\\n지금 확인해보세요.",
              "link": {
                "web_url": "http://localhost:8081/index.html",
                "mobile_web_url": "http://localhost:8081/index.html"
              },
              "button_title": "일정보기"
            }
        """;

        // ✅ urlencode 방식으로 파라미터 구성
        String body = "template_object=" + URLEncoder.encode(templateJson, StandardCharsets.UTF_8);

        // ✅ HTTP 요청 생성
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(SEND_URL))
                .header("Authorization", "Bearer " + accessToken)
                .header("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        // ✅ 요청 전송 및 응답 수신
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        // ✅ 결과 출력 (로그 확인)
        System.out.println("🔔 메시지 전송 응답: " + response.statusCode());
        System.out.println(response.body());
    }
}

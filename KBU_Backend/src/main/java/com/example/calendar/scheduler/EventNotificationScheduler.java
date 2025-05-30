package com.example.calendar.scheduler;

import com.example.calendar.model.Event;
import com.example.calendar.model.User;
import com.example.calendar.repository.EventRepository;
import com.example.calendar.service.KakaoMessageService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

/**
 * 📅 매일 오후 10시에 다음 날 일정을 확인하고
 * 📩 카카오톡 메시지를 전송하는 스케줄러
 */
@Component
public class EventNotificationScheduler {

    private final EventRepository eventRepository;
    private final KakaoMessageService kakaoMessageService;

    public EventNotificationScheduler(EventRepository eventRepository, KakaoMessageService kakaoMessageService) {
        this.eventRepository = eventRepository;
        this.kakaoMessageService = kakaoMessageService;
    }

    // ✅ 매일 22:00에 실행
    @Scheduled(cron = "0 * * * * *")
    public void notifyUpcomingEvents() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);

        // ✅ 내일 일정이 있는 이벤트만 조회
        List<Event> events = eventRepository.findByDate(tomorrow);

        for (Event event : events) {
            User user = event.getUser();
            String accessToken = user.getKakaoAccessToken();

            // ✅ access token이 있는 사용자만 메시지 전송
            if (accessToken != null && !accessToken.isEmpty()) {
                try {
                    kakaoMessageService.sendSimpleMessage(accessToken);
                    System.out.println("🔔 " + user.getUsername() + "님께 일정 알림 전송 완료");
                } catch (Exception e) {
                    System.err.println("❌ " + user.getUsername() + "님 알림 전송 실패: " + e.getMessage());
                }
            }
        }
    }
}

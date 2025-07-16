package com.example.calendar.controller;

import com.example.calendar.model.Event;
import com.example.calendar.model.User;
import com.example.calendar.repository.EventRepository;
import com.example.calendar.repository.UserRepository;
import com.example.calendar.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.calendar.dto.EventRequest;
import com.example.calendar.dto.EventDto; // 추가


import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.*;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(originPatterns = {"http://localhost:*", "http://127.0.0.1:*"}, allowCredentials = "true")
public class EventController {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    // ✅ JWT 토큰에서 사용자 정보를 추출하는 메서드
    private User getUserFromRequest(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7); // "Bearer " 제거
            String username = JwtUtil.getUsernameFromToken(token);
            System.out.println("🔍 추출된 사용자명: " + username);
            return userRepository.findByUsername(username).orElse(null);
        } else {
            System.out.println("⚠️ Authorization 헤더 누락 또는 Bearer 없음");
        }
        return null;
    }

    @PostMapping
    public Event addEvent(@RequestBody EventRequest eventRequest, HttpServletRequest request) {
        User user = getUserFromRequest(request);
        if (user == null) return null;

        Event event = new Event();
        event.setTitle(eventRequest.title);
        event.setType(eventRequest.type);
        event.setDate(LocalDate.parse(eventRequest.date));
        event.setDescription(eventRequest.description);  // ✅ 설명 필드 매핑
        event.setUser(user);

        return eventRepository.save(event);
    }

    // ✅ 일정 삭제 (제목, 유형, 날짜 기준)
    @Transactional
    @DeleteMapping
    public boolean deleteEvent(@RequestParam String title,
                               @RequestParam String type,
                               @RequestParam String date,
                               HttpServletRequest request) {
        User user = getUserFromRequest(request);
        if (user != null) {
            System.out.println("🗑️ 삭제 요청 사용자: " + user.getUsername());
            System.out.println("🗑️ 삭제할 일정 정보 - 제목: " + title + ", 유형: " + type + ", 날짜: " + date);

            try {
                LocalDate localDate = LocalDate.parse(date); // 🔁 String → LocalDate
                eventRepository.deleteByUserAndTitleAndTypeAndDate(user, title, type, localDate);
                return true;
            } catch (DateTimeParseException e) {
                System.err.println("❌ 날짜 파싱 오류: " + e.getMessage());
            }
        }
        return false;
    }

    @GetMapping
    public List<EventDto> getAllEvents(HttpServletRequest request) {
        User user = getUserFromRequest(request);
        if (user == null) {
            return List.of();
        }

        List<Event> events = eventRepository.findByUser(user);

        return events.stream()
                .map(ev -> new EventDto(
                        ev.getId(),
                        ev.getTitle(),
                        ev.getType(),
                        ev.getDate(),
                        ev.isCompleted(),
                        ev.getDescription() // ✅ 설명 포함
                ))
                .toList();
    }


    // ✅ 일정 완료 상태 업데이트 (체크박스)
    @PostMapping("/{id}/complete")
    public ResponseEntity<?> updateEventCompletion(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> requestBody,
            HttpServletRequest request) {
        User user = getUserFromRequest(request);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("사용자 인증 실패");
        }

        Optional<Event> optionalEvent = eventRepository.findById(id);
        if (optionalEvent.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("일정을 찾을 수 없습니다.");
        }

        Event event = optionalEvent.get();
        if (!event.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("해당 일정에 접근할 수 없습니다.");
        }

        Boolean completed = requestBody.get("completed");
        if (completed == null) {
            return ResponseEntity.badRequest().body("completed 필드가 필요합니다.");
        }

        event.setCompleted(completed);
        eventRepository.save(event);

        return ResponseEntity.ok("일정 완료 상태가 변경되었습니다.");
    }


    // ✅ 이번 달 일정 통계 조회 API (카테고리별 누적 막대그래프 대응)
    @GetMapping("/statistics")
    public ResponseEntity<?> getEventStatistics(HttpServletRequest request)
    {
        User user = getUserFromRequest(request);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("인증 실패: 사용자 정보를 찾을 수 없습니다.");
        }

        // 🗓️ 이번 달의 시작과 끝 날짜 계산
        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);
        LocalDate endOfMonth = now.withDayOfMonth(now.lengthOfMonth());

        // 📥 이번 달 일정 가져오기
        List<Event> events = eventRepository.findByUserAndDateBetween(user, startOfMonth, endOfMonth);

        // 📊 통계용 맵 생성
        Map<String, Integer> typeCounts = new HashMap<>();                        // 유형별 개수
        Map<String, Map<String, Integer>> dailyCounts = new TreeMap<>();         // 날짜별 + 유형별 개수

        for (Event event : events) {
            String type = event.getType(); // 예: "Work"
            String date = event.getDate().toString(); // 예: "2025-06-06"

            // 1) 유형별 개수
            typeCounts.put(type, typeCounts.getOrDefault(type, 0) + 1);

            // 2) 날짜 + 유형별 개수
            dailyCounts.computeIfAbsent(date, d -> new HashMap<>())
                    .merge(type, 1, Integer::sum);
        }

        // ✅ 응답 구성
        Map<String, Object> response = new HashMap<>();
        response.put("typeCounts", typeCounts);
        response.put("dailyCounts", dailyCounts);  // ✅ 변경된 구조

        return ResponseEntity.ok(response);
    }

    // ✅ 일정 이동 요청 DTO (컨트롤러 내부 클래스)
    public static class MoveEventRequest {
        private String newDate; // YYYY-MM-DD 형식

        public String getNewDate() {
            return newDate;
        }

        public void setNewDate(String newDate) {
            this.newDate = newDate;
        }
    }

    @PatchMapping("/{id}/move")
    public ResponseEntity<?> moveEvent(
            @PathVariable Long id,
            @RequestBody MoveEventRequest request,
            HttpServletRequest httpRequest
    ) {
        System.out.println("🟡 PATCH 요청 도착!"); // ★ 추가

        User user = getUserFromRequest(httpRequest);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");

        Optional<Event> optionalEvent = eventRepository.findById(id);
        if (optionalEvent.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Event not found");
        }

        Event event = optionalEvent.get();

        if (!event.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not your event");
        }

        try {
            LocalDate newDate = LocalDate.parse(request.getNewDate()); // 날짜 형식 검증
            event.setDate(newDate);
            eventRepository.save(event);
            return ResponseEntity.ok("일정이 이동되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid date format");
        }
    }

}

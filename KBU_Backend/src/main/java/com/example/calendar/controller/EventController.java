package com.example.calendar.controller;

import com.example.calendar.model.Event;
import com.example.calendar.model.User;
import com.example.calendar.repository.EventRepository;
import com.example.calendar.repository.UserRepository;
import com.example.calendar.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*") // 필요 시 보안에 맞게 수정
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
            return userRepository.findByUsername(username);
        }
        System.out.println("⚠️ Authorization 헤더가 없거나 잘못됨");
        return null;
    }

    // ✅ 일정 추가 (로그인한 사용자 기준으로 저장)
    @PostMapping
    public ResponseEntity<?> addEvent(@RequestBody Event event, HttpServletRequest request) {
        User user = getUserFromRequest(request);
        if (user != null) {
            event.setUser(user); // 사용자 주입
            Event saved = eventRepository.save(event);
            return ResponseEntity.ok(saved);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("❌ 인증 실패");
        }
    }

    // ✅ 일정 삭제 (로그인한 사용자의 일정을 삭제)
    @Transactional
    @DeleteMapping
    public ResponseEntity<?> deleteEvent(@RequestParam String title,
                                         @RequestParam String type,
                                         @RequestParam String date,
                                         HttpServletRequest request) {
        User user = getUserFromRequest(request);

        if (user != null) {
            System.out.println("🗑️ 삭제 요청 사용자: " + user.getUsername());
            System.out.println("🗑️ 삭제할 일정 정보 - 제목: " + title + ", 유형: " + type + ", 날짜: " + date);

            eventRepository.deleteByUserAndTitleAndTypeAndDate(user, title, type, date);
            return ResponseEntity.ok("✅ 삭제 성공");
        } else {
            System.out.println("❌ 사용자 인증 실패 또는 토큰 누락");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("❌ 인증 실패");
        }
    }

    // ✅ 전체 일정 조회 (로그인한 사용자 기준)
    @GetMapping
    public ResponseEntity<?> getAllEvents(HttpServletRequest request) {
        User user = getUserFromRequest(request);
        if (user != null) {
            List<Event> events = eventRepository.findByUser(user);
            return ResponseEntity.ok(events);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(List.of());
        }
    }
}

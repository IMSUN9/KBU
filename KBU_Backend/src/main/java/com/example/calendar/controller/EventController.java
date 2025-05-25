package com.example.calendar.controller;

import com.example.calendar.model.Event;
import com.example.calendar.model.User;
import com.example.calendar.repository.EventRepository;
import com.example.calendar.repository.UserRepository;
import com.example.calendar.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "http://localhost:63342", allowCredentials = "true")
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

            Optional<User> optionalUser = userRepository.findByUsername(username);
            if (optionalUser.isPresent()) {
                return optionalUser.get();
            } else {
                System.out.println("❌ 사용자 정보 없음");
            }
        } else {
            System.out.println("⚠️ Authorization 헤더 누락 또는 Bearer 없음");
        }
        return null;
    }

    // ✅ 일정 추가 (로그인한 사용자 기준으로 저장)
    @PostMapping
    public Event addEvent(@RequestBody Event event, HttpServletRequest request) {
        User user = getUserFromRequest(request);
        if (user != null) {
            event.setUser(user);
            return eventRepository.save(event);
        }
        return null;
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

            eventRepository.deleteByUserAndTitleAndTypeAndDate(user, title, type, date);
            return true;
        }
        return false;
    }

    // ✅ 전체 일정 조회 (로그인한 사용자 기준)
    @GetMapping
    public List<Event> getAllEvents(HttpServletRequest request) {
        User user = getUserFromRequest(request);
        if (user != null) {
            return eventRepository.findByUser(user);
        }
        return List.of();
    }
}

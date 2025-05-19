package com.example.calendar.controller;

import com.example.calendar.model.Event;
import com.example.calendar.model.User;
import com.example.calendar.repository.EventRepository;
import com.example.calendar.repository.UserRepository;
import com.example.calendar.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*")
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
            return userRepository.findByUsername(username);
        }
        return null;
    }

    // ✅ 일정 추가 (로그인한 사용자 기준으로 저장)
    @PostMapping
    public Event addEvent(@RequestBody Event event, HttpServletRequest request) {
        User user = getUserFromRequest(request);
        if (user != null) {
            event.setUser(user); // 사용자 정보 주입
            return eventRepository.save(event);
        }
        return null; // 인증 실패 시 null 반환
    }

    // ✅ 일정 삭제 (로그인한 사용자의 일정을 삭제)
    @DeleteMapping
    public boolean deleteEvent(@RequestParam String title,
                               @RequestParam String type,
                               @RequestParam String date,
                               HttpServletRequest request) {
        User user = getUserFromRequest(request);
        if (user != null) {
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
        return List.of(); // 빈 리스트 반환
    }
}

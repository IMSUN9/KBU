package com.example.calendar.controller;

import com.example.calendar.model.Event;
import com.example.calendar.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController // JSON 형식의 데이터를 반환하는 REST 컨트롤러임을 명시
@RequestMapping("/api/events") // 이 컨트롤러는 /api/events 로 시작하는 URL을 처리함
@CrossOrigin(origins = "*") // 프론트엔드와 연동 시 CORS 문제를 해결해줌
public class EventController {

    // ✅ DB에 접근하기 위한 Repository (JPA가 자동으로 구현체를 생성해줌)
    @Autowired
    private EventRepository eventRepository;

    // ✅ 일정 추가 API (POST 요청: /api/events)
    @PostMapping
    public Event addEvent(@RequestBody Event event) {
        // 전달받은 이벤트 객체를 DB에 저장하고 저장된 결과를 반환
        return eventRepository.save(event);
    }

    // ✅ 전체 일정 조회 API (GET 요청: /api/events)
    @GetMapping
    public List<Event> getAllEvents() {
        // DB에 저장된 모든 이벤트를 조회해서 리스트로 반환
        return eventRepository.findAll();
    }

    // ✅ 일정 삭제 API (DELETE 요청: /api/events?title=...&type=...&date=...)
    @DeleteMapping
    public boolean deleteEvent(@RequestParam String title,
                               @RequestParam String type,
                               @RequestParam String date) {
        // 조건을 만족하는 모든 이벤트를 찾아 리스트로 가져옴
        List<Event> events = eventRepository.findAll();
        for (Event e : events) {
            if (e.getTitle().equals(title) &&
                    e.getType().equals(type) &&
                    e.getDate().equals(date)) {
                eventRepository.delete(e); // 해당 이벤트 삭제
                return true; // 삭제 성공
            }
        }
        return false; // 일치하는 이벤트가 없으면 실패
    }
}

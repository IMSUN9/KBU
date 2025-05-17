package com.example.calendar.controller;

import com.example.calendar.model.Event;
import com.example.calendar.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*")
public class EventController {

    // ✅ DB와 연결된 JPA 인터페이스 자동 주입
    @Autowired
    private EventRepository eventRepository;

    // ✅ 일정 추가 (DB에 저장됨)
    @PostMapping
    public Event addEvent(@RequestBody Event event) {
        return eventRepository.save(event);
    }

    // ✅ 일정 삭제 (DB에서 삭제)
    @DeleteMapping
    public boolean deleteEvent(@RequestParam String title,
                               @RequestParam String type,
                               @RequestParam String date) {
        List<Event> events = eventRepository.findAll();

        for (Event e : events) {
            if (e.getTitle().equals(title) &&
                    e.getType().equals(type) &&
                    e.getDate().equals(date)) {
                eventRepository.delete(e);
                return true;
            }
        }
        return false;
    }

    // ✅ 전체 일정 조회
    @GetMapping
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }
}

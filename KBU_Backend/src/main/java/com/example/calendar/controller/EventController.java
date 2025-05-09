package com.example.calendar.controller;

// Event 관련 요청을 처리하는 컨트롤러

import com.example.calendar.model.Event;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController // 컨트롤러 + JSON 반환 (@ResponseBody 생략 가능) // JSON 데이터를 반환하는 컨트롤러
@RequestMapping("/api/events") // 공통 URL 경로 // 이 컨트롤러는 /api/events로 시작하는 요청만 처리
@CrossOrigin(origins = "*") // 모든 출처에서 접근 허용 (테스트용)

public class EventController
{
    // 메모리 안에만 임시 저장하는 리스트 (DB 연결 전까지는 이걸로 저장)
    private List<Event> eventList = new ArrayList<>();

    // 일정 추가 API (POST /api/events) // POST 요청 (일정 추가)
    @PostMapping
    private Event addEvent(@RequestBody Event event) // @RequestBody = 요청 바디에 들어온 JSON을 Event 객체로 변환
    {
        eventList.add(event);
        return event; // 추가한 이벤트를 그대로 응답
    }

    @DeleteMapping // DELETE 요청을 처리하는 API라는 뜻
    // @RequestParam : 요청 URL에 붙은 title, type, date를 각각 받아온다
    public boolean deleteEvent(@RequestParam String title,
                               @RequestParam String type,
                               @RequestParam String date)
    {
        // 리스트에서 조건에 맞는 이벤트를 찾아 삭제
        // eventList.removeIf(조건) : 리스트 안에 이 조건을 만족하는 이벤트가 있으면 삭제해줘
        // 삭제 성공하면 true, 실패하면 false 리턴!
        return eventList.removeIf(e ->
                e.getTitle().equals(title) &&
                e.getType().equals(type) &&
                        e.getDate().equals(date)
        );
    }

    // 전체 일정 조회 API (GET /api/events) // GET 요청 (일정 조회)
    @GetMapping
    public List<Event> getAllEvents()
    {
        return eventList;
    }
}

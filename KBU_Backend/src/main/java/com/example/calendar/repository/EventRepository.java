package com.example.calendar.repository;

import com.example.calendar.model.Event;
import com.example.calendar.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * 📌 이 인터페이스는 Event 엔티티에 대한 데이터베이스 접근 로직을 담당합니다.
 * Spring Data JPA가 자동으로 구현체를 만들어줍니다.
 */
@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    // ✅ 특정 사용자(User)의 모든 일정 조회
    List<Event> findByUser(User user);

    // ✅ 특정 사용자(User)의 특정 날짜(date)에 해당하는 일정 조회
    List<Event> findByUserAndDate(User user, LocalDate date);

    // ✅ 전체 사용자 중 특정 날짜에 등록된 일정 조회 (스케줄러에서 사용)
    List<Event> findByDate(LocalDate date);

    // ✅ 특정 사용자(User)가 등록한 일정 중 title, type, date가 모두 일치하는 일정 삭제
    void deleteByUserAndTitleAndTypeAndDate(User user, String title, String type, LocalDate date);
}

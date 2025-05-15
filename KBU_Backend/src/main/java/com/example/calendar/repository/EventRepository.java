package com.example.calendar.repository;

import com.example.calendar.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 📌 이 인터페이스는 Event 엔티티에 대한 데이터베이스 접근 로직을 담당합니다.
 * Spring Data JPA가 자동으로 구현체를 만들어줍니다.
 */
@Repository // 이 인터페이스가 리포지토리(DAO) 역할임을 스프링에 알림
public interface EventRepository extends JpaRepository<Event, Long> {

    /*
     📌 JpaRepository<Event, Long> 을 상속하면 기본적인 CRUD 메서드가 자동 제공됨:
       - findAll(): 모든 이벤트 조회
       - findById(id): 특정 이벤트 ID로 조회
       - save(event): 이벤트 저장 (Insert 또는 Update)
       - deleteById(id): 특정 이벤트 삭제
       - count(): 총 레코드 수 반환
       - existsById(id): ID 존재 여부 확인
    */

    // ✅ 특정 날짜(date)에 해당하는 모든 일정을 조회하는 메서드
    // JPA의 쿼리 메서드 기능을 이용해서 "date" 필드 기반으로 자동 SQL 생성
    List<Event> findByDate(String date);

    // ✅ 일정 삭제 시 조건(title, type, date)을 모두 만족하는 항목을 삭제할 수 있도록 하는 메서드
    void deleteByTitleAndTypeAndDate(String title, String type, String date);
}

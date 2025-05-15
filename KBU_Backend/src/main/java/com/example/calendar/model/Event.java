package com.example.calendar.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

// ✅ 이 클래스가 DB의 테이블과 매핑되는 JPA Entity임을 명시
@Entity
@Table(name = "event") // 테이블 이름 설정
public class Event {

    // ✅ 이 필드는 테이블의 기본 키(PK) 역할을 하며, 자동으로 생성됨 (AUTO_INCREMENT)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ✅ 일정 제목
    private String title;

    // ✅ 일정 유형 (예: Work, Sports, Friend, Other)
    private String type;

    // ✅ 일정 날짜 (yyyy-MM-dd 형식의 문자열로 저장)
    private String date;

    // ✅ 기본 생성자 (JPA에서 반드시 필요)
    public Event() {
    }

    // ✅ 전체 필드를 받는 생성자
    public Event(String title, String type, String date) {
        this.title = title;
        this.type = type;
        this.date = date;
    }

    // ✅ Getter & Setter
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }
}

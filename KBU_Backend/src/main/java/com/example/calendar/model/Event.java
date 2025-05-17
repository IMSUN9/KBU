package com.example.calendar.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

// ✅ DB의 테이블로 매핑할 수 있도록 설정
@Entity
public class Event {

    // ✅ 기본 키 지정 (자동 생성)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String type;
    private String date;

    public Event() {}

    public Event(String title, String type, String date) {
        this.title = title;
        this.type = type;
        this.date = date;
    }

    public Long getId() {
        return id;
    }

    // title getter/setter
    public String getTitle() {
        return title;
    }
    public void setTitle(String title) {
        this.title = title;
    }

    // type getter/setter
    public String getType() {
        return type;
    }
    public void setType(String type) {
        this.type = type;
    }

    // date getter/setter
    public String getDate() {
        return date;
    }
    public void setDate(String date) {
        this.date = date;
    }
}

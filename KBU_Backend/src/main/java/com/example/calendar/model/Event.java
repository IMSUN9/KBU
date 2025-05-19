package com.example.calendar.model;

import jakarta.persistence.*;

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

    // ✅ 이 일정(Event)이 어떤 사용자의 것인지 저장하기 위한 필드
    @ManyToOne
    @JoinColumn(name = "user_id") // DB에서 외래키 이름은 user_id
    private User user;

    // ✅ 기본 생성자 (JPA에서 필수)
    public Event() {}

    // ✅ 생성자 (User는 나중에 setter로 주입 가능)
    public Event(String title, String type, String date) {
        this.title = title;
        this.type = type;
        this.date = date;
    }

    // ✅ 전체 필드 포함 생성자
    public Event(String title, String type, String date, User user) {
        this.title = title;
        this.type = type;
        this.date = date;
        this.user = user;
    }

    // ✅ getter/setter
    public Long getId() {
        return id;
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

    public User getUser() {
        return user;
    }
    public void setUser(User user) {
        this.user = user;
    }
}

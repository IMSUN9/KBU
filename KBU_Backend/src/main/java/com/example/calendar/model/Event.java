package com.example.calendar.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDate;

/**
 * 📌 Event 엔티티 - 사용자별 일정 정보 저장
 */
@Entity
public class Event {

    // ✅ 고유 ID (PK)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ✅ 일정 제목
    @Column(nullable = false)
    private String title;

    // ✅ 일정 유형
    @Column(nullable = false)
    private String type;

    // ✅ 일정 날짜 (형식: YYYY-MM-DD)
    @Column(nullable = false)
    private LocalDate date;

    // ✅ 일정 완료 여부 (기본값: false)
    @Column(nullable = false)
    private boolean completed = false;

    // ✅ 일정 설명 (선택 입력 가능)
    @Column(columnDefinition = "TEXT")
    private String description;

    // ✅ 연관 사용자 정보 (ManyToOne)
    @ManyToOne
    @JoinColumn(name = "user_id") // 외래키: user_id
    private User user;

    // ✅ 기본 생성자 (JPA 필수)
    public Event() {}

    // ✅ 생성자: user 없이
    public Event(String title, String type, LocalDate date) {
        this.title = title;
        this.type = type;
        this.date = date;
    }

    // ✅ 생성자: user 포함
    public Event(String title, String type, LocalDate date, User user) {
        this.title = title;
        this.type = type;
        this.date = date;
        this.user = user;
    }

    // ✅ Getter / Setter
    @JsonProperty("id")
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

    public LocalDate getDate() {
        return date;
    }
    public void setDate(LocalDate date) {
        this.date = date;
    }

    public boolean isCompleted() {
        return completed;
    }
    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public User getUser() {
        return user;
    }
    public void setUser(User user) {
        this.user = user;
    }

    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }
}

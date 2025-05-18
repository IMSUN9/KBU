package com.example.calendar.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users") // 테이블명 users로 설정
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 사용자 이름 (고유)
    @Column(nullable = false, unique = true)
    private String username;

    // 비밀번호
    @Column(nullable = false)
    private String password;

    // 생성자
    public User() {}

    public User(String username, String password) {
        this.username = username;
        this.password = password;
    }

    // Getter/Setter
    public Long getId() {
        return id;
    }

    public void setId(Long id) { this.id = id; }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) { this.username = username; }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) { this.password = password; }
}

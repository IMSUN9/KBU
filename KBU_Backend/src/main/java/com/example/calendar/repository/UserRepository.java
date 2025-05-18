package com.example.calendar.repository;

import com.example.calendar.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // username으로 사용자 찾기
    User findByUsername(String username);
}

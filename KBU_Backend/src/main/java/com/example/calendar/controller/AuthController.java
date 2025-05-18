package com.example.calendar.controller;

import com.example.calendar.dto.LoginRequest;
import com.example.calendar.model.User;
import com.example.calendar.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // 모든 출처에서 접근 허용
public class AuthController {

    @Autowired
    private UserService userService;

    // ✅ 회원가입 처리
    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody User user) {
        boolean success = userService.registerUser(user);
        if (success) {
            return ResponseEntity.ok("회원가입 성공!");
        } else {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("이미 존재하는 사용자입니다.");
        }
    }

    // ✅ 로그인 처리
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        String token = userService.login(loginRequest.getUsername(), loginRequest.getPassword());
        if (token != null) {
            return ResponseEntity.ok().body(token); // 로그인 성공 → JWT 반환
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인 실패: 아이디 또는 비밀번호가 올바르지 않습니다.");
        }
    }
}

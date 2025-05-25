package com.example.calendar.controller;

import com.example.calendar.dto.LoginRequest;
import com.example.calendar.model.User;
import com.example.calendar.repository.UserRepository;
import com.example.calendar.service.UserService;
import com.example.calendar.util.JwtUtil;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:63342", allowCredentials = "true")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

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

    // ✅ 일반 로그인 처리
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        String token = userService.login(loginRequest.getUsername(), loginRequest.getPassword());
        if (token != null) {
            return ResponseEntity.ok().body(token);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("로그인 실패: 아이디 또는 비밀번호가 올바르지 않습니다.");
        }
    }

    // ✅ 카카오 로그인 처리
    @PostMapping("/kakao-login")
    public ResponseEntity<String> kakaoLogin(@RequestParam("kakaoId") String kakaoId,
                                             @RequestParam("nickname") String nickname) {

        String username = "kakao_" + kakaoId;
        Optional<User> optionalUser = userRepository.findByUsername(username);
        User user;

        if (optionalUser.isPresent()) {
            user = optionalUser.get();
        } else {
            user = new User();
            user.setUsername(username);
            user.setPassword("kakao_dummy_password"); // 의미 없는 값
            userRepository.save(user);
        }

        String token = JwtUtil.createToken(user.getUsername());
        return ResponseEntity.ok(token);
    }

    // ✅ 로그아웃 시 카카오 연결 해제 예시 (프론트에서 직접 호출 권장)
    @PostMapping("/kakao-logout")
    public ResponseEntity<String> kakaoLogout() {
        // 백엔드에서는 실제 연결 끊는 API 호출 없이 안내만 가능
        return ResponseEntity.ok("카카오 연결 해제는 프론트에서 SDK의 unlink 호출로 처리하세요.");
    }
}

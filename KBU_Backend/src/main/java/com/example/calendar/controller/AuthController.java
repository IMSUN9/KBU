// ✅ AuthController.java
package com.example.calendar.controller;

import com.example.calendar.dto.LoginRequest;
import com.example.calendar.model.User;
import com.example.calendar.repository.UserRepository;
import com.example.calendar.service.KakaoService;
import com.example.calendar.service.UserService;
import com.example.calendar.util.JwtUtil;
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

    @Autowired
    private KakaoService kakaoService;

    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody User user) {
        boolean success = userService.registerUser(user);
        if (success) {
            return ResponseEntity.ok("회원가입 성공!");
        } else {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("이미 존재하는 사용자입니다.");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        String token = userService.login(loginRequest.getUsername(), loginRequest.getPassword());
        if (token != null) {
            return ResponseEntity.ok(token);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("로그인 실패: 아이디 또는 비밀번호가 올바르지 않습니다.");
        }
    }

    @PostMapping("/kakao-login")
    public ResponseEntity<String> kakaoLogin(@RequestParam("kakaoId") String kakaoId,
                                             @RequestParam("nickname") String nickname) {
        String username = "kakao_" + kakaoId;
        Optional<User> optionalUser = userRepository.findByUsername(username);
        User user = optionalUser.orElseGet(() -> {
            User newUser = new User();
            newUser.setUsername(username);
            newUser.setPassword("kakao_dummy_password");
            return userRepository.save(newUser);
        });

        String token = JwtUtil.createToken(user.getUsername());
        return ResponseEntity.ok(token);
    }

    @PostMapping("/kakao-logout")
    public ResponseEntity<String> kakaoLogout() {
        return ResponseEntity.ok("카카오 연결 해제는 프론트에서 SDK unlink로 처리해주세요.");
    }

    @GetMapping("/kakao/callback")
    public ResponseEntity<String> kakaoCallback(@RequestParam String code) {
        try {
            String jwtToken = kakaoService.kakaoLogin(code);
            return ResponseEntity.ok(jwtToken);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("❌ 카카오 로그인 실패: " + e.getMessage());
        }
    }
}

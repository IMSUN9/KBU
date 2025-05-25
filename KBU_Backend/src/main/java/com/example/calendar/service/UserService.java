package com.example.calendar.service;

import com.example.calendar.model.User;
import com.example.calendar.repository.UserRepository;
import com.example.calendar.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // ✅ 회원가입 처리
    public boolean registerUser(User user) {
        Optional<User> existingUser = userRepository.findByUsername(user.getUsername());
        if (existingUser.isPresent()) {
            System.out.println("⚠️ 이미 존재하는 사용자명: " + user.getUsername());
            return false;
        }

        // 비밀번호 암호화 후 저장
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        System.out.println("✅ 회원가입 성공: " + user.getUsername());
        return true;
    }

    // ✅ 로그인 처리 및 JWT 토큰 발급
    public String login(String username, String password) {
        Optional<User> optionalUser = userRepository.findByUsername(username);
        User user = optionalUser.orElse(null);

        if (user == null) {
            System.out.println("[로그인 실패] 사용자 없음: " + username);
            return null;
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            System.out.println("[로그인 실패] 비밀번호 불일치 (입력: " + password + ")");
            return null;
        }

        String token = JwtUtil.createToken(user.getUsername());
        System.out.println("✅ 로그인 성공: " + username);
        return token;
    }
}

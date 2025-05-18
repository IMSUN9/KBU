package com.example.calendar.service;

import com.example.calendar.model.User;
import com.example.calendar.repository.UserRepository;
import com.example.calendar.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // 비밀번호 암호화 인코더
    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // ✅ 회원가입 처리
    public boolean registerUser(User user) {
        if (userRepository.findByUsername(user.getUsername()) != null) {
            System.out.println("[회원가입 실패] 이미 존재하는 사용자: " + user.getUsername());
            return false;
        }

        String encryptedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encryptedPassword);
        userRepository.save(user);
        System.out.println("[회원가입 성공] 사용자 등록 완료: " + user.getUsername());
        return true;
    }

    // ✅ 로그인 처리 - 토큰 발급
    public String login(String username, String password) {
        User user = userRepository.findByUsername(username);

        if (user == null) {
            System.out.println("[로그인 실패] 사용자 없음: " + username);
            return null;
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            System.out.println("[로그인 실패] 비밀번호 불일치 (입력: " + password + ")");
            System.out.println("[로그인 실패] 저장된 암호화 비번: " + user.getPassword());
            return null;
        }

        System.out.println("[로그인 성공] JWT 토큰 발급: " + username);
        return JwtUtil.createToken(username);
    }
}

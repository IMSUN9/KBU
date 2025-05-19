// js/login.js

function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const messageEl = document.getElementById("login-message");

  // 기본 유효성 검사
  if (!username || !password) {
    messageEl.textContent = "아이디와 비밀번호를 모두 입력하세요.";
    messageEl.className = "error";
    return;
  }

  fetch("http://localhost:8080/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, password })
  })
    .then(res => {
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error("아이디 또는 비밀번호가 올바르지 않습니다.");
        }
        throw new Error("서버 오류가 발생했습니다.");
      }
      return res.text(); // 서버에서 토큰을 문자열로 반환
    })
    .then(token => {
      localStorage.setItem("token", token); // 토큰 저장
      messageEl.textContent = "로그인 성공! 잠시 후 이동합니다...";
      messageEl.className = "success";

      // 1초 후 메인 페이지로 이동
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);
    })
    .catch(err => {
      messageEl.textContent = err.message;
      messageEl.className = "error";
    });
}

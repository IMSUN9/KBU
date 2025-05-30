// ✅ 일반 로그인 처리
function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const messageEl = document.getElementById("login-message");

  if (!username || !password) {
    messageEl.textContent = "아이디와 비밀번호를 모두 입력하세요.";
    messageEl.className = "error";
    return;
  }

  fetch("http://localhost:8080/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
    .then(res => {
      if (!res.ok) throw new Error("로그인 실패");
      return res.text(); // JWT 토큰
    })
    .then(token => {
      localStorage.setItem("token", token);
      messageEl.textContent = "로그인 성공!";
      messageEl.className = "success";
      setTimeout(() => window.location.href = "/index.html", 1000);
    })
    .catch(err => {
      messageEl.textContent = "❌ 로그인 실패: " + err.message;
      messageEl.className = "error";
    });
}

// ✅ 카카오 로그인 (인가 코드 요청 → /kakao-login.html 로 이동)
function kakaoLogin() {
  const clientId = "1c32879542069ac7776ac22372d880d3"; // 본인 REST API 키
  const redirectUri = "http://localhost:8081/kakao-login.html";

  // ✅ 필요한 scope 명시
  const scope = "profile_nickname,talk_message";

  // ✅ 카카오 인가 코드 요청
  window.location.href =
    `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}` +
    `&redirect_uri=${redirectUri}` +
    `&response_type=code` +
    `&scope=${scope}`;
}

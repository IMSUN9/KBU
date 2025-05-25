// ✅ 일반 로그인 함수
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
      return res.text(); // JWT 토큰 문자열
    })
    .then(token => {
      localStorage.setItem("token", token);
      messageEl.textContent = "로그인 성공! 잠시 후 이동합니다...";
      messageEl.className = "success";
      setTimeout(() => {
        window.location.href = "/index.html";
      }, 1000);
    })
    .catch(err => {
      messageEl.textContent = "❌ 로그인 실패: " + err.message;
      messageEl.className = "error";
    });
}

// ✅ 카카오 로그인 버튼 이벤트 등록
document.addEventListener("DOMContentLoaded", () => {
  const kakaoBtn = document.getElementById("kakao-login-btn");
  if (kakaoBtn) {
    kakaoBtn.addEventListener("click", () => {
      Kakao.Auth.login({
        scope: "profile_nickname", // 닉네임 권한 요청
        success: function (authObj) {
          console.log('✅ 카카오 로그인 성공', authObj);

          Kakao.API.request({
            url: '/v2/user/me',
            success: function (res) {
              console.log('👤 카카오 사용자 정보:', res);

              const kakaoId = res.id;
              const nickname = res.properties?.nickname || "KakaoUser";

              // 🔁 백엔드에 로그인 요청
              fetch(`http://localhost:8080/api/auth/kakao-login?kakaoId=${kakaoId}&nickname=${encodeURIComponent(nickname)}`, {
                method: "POST"
              })
                .then(res => {
                  if (!res.ok) throw new Error("서버 응답 오류");
                  return res.text(); // JWT 토큰
                })
                .then(token => {
                  localStorage.setItem("token", token);
                  alert(`${nickname}님, 로그인 성공!`);
                  window.location.href = "/index.html";
                })
                .catch(err => {
                  console.error("❌ 백엔드 로그인 실패:", err);
                  alert("카카오 로그인 처리 중 오류 발생");
                });

            },
            fail: function (error) {
              console.error('❌ 사용자 정보 요청 실패:', error);
              alert("카카오 사용자 정보 요청 실패");
            }
          });
        },
        fail: function (err) {
          console.error('❌ 카카오 로그인 실패', err);
          alert("카카오 로그인에 실패했습니다.");
        }
      });
    });
  }
});

document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  const user = { username, password };

  fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(user)
  })
    .then(res => res.text())
    .then(tokenOrMessage => {
      const msg = document.getElementById('message');

      if (tokenOrMessage.startsWith('ey')) { // JWT 토큰은 보통 'ey...'로 시작
        localStorage.setItem('token', tokenOrMessage); // ✅ 토큰 저장
        window.location.href = 'index.html';           // ✅ 캘린더 화면으로 이동
      } else {
        msg.style.color = 'red';
        msg.textContent = tokenOrMessage; // 실패 메시지 출력
      }
    })
    .catch(err => {
      console.error('로그인 오류:', err);
      document.getElementById('message').textContent = '오류가 발생했습니다.';
    });
});

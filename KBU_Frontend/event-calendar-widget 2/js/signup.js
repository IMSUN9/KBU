function signup() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const messageDiv = document.getElementById('signup-message');

  // 유효성 검사
  if (!username || !password) {
    messageDiv.textContent = '아이디와 비밀번호를 모두 입력해주세요.';
    messageDiv.style.color = 'red';
    return;
  }

  fetch('http://localhost:8080/api/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  })
    .then(res => {
      if (!res.ok) throw new Error('이미 존재하는 아이디일 수 있습니다.');
      return res.text(); // 응답 텍스트 받기 (필요시 JSON으로 바꿔도 됨)
    })
    .then(msg => {
      // ✅ 성공 메시지 표시
      messageDiv.textContent = '✅ 회원가입이 완료되었습니다. 로그인해주세요.';
      messageDiv.style.color = 'green';

      // 잠시 후 로그인 화면으로 이동
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
    })
    .catch(err => {
      // ❌ 실패 메시지 표시
      console.error('회원가입 오류:', err);
      messageDiv.textContent = '❌ 회원가입 실패: ' + err.message;
      messageDiv.style.color = 'red';
    });
}

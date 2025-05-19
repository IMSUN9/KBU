document.getElementById('signupForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  const user = { username, password };

  fetch('http://localhost:8080/api/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(user)
  })
    .then(res => res.text())
    .then(message => {
      const msg = document.getElementById('message');
      if (message.includes('성공')) {
        msg.style.color = 'green';
        msg.textContent = '회원가입이 완료되었습니다. 로그인 페이지로 이동하세요.';
      } else {
        msg.style.color = 'red';
        msg.textContent = message;
      }
    })
    .catch(err => {
      console.error('회원가입 오류:', err);
      document.getElementById('message').textContent = '오류가 발생했습니다.';
    });
});

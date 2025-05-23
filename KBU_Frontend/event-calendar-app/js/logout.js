// 📁 js/logout.js

document.addEventListener('DOMContentLoaded', function () {
  const logoutBtn = document.getElementById('logout-btn');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      localStorage.removeItem('token'); // 🔐 JWT 토큰 삭제
      alert('로그아웃 되었습니다.');
      window.location.href = 'login.html'; // ✅ 상대 경로로 수정
    });
  } else {
    console.warn('❗ logout-btn 버튼을 찾을 수 없습니다.');
  }
});

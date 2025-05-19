// 📁 js/logout.js

// 로그아웃 버튼 클릭 시 토큰 제거 후 로그인 페이지로 이동
document.addEventListener('DOMContentLoaded', function () {
  const logoutBtn = document.getElementById('logout-btn');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      localStorage.removeItem('token'); // 🔐 JWT 토큰 삭제
      alert('로그아웃 되었습니다.');
      window.location.href = 'login.html'; // 🔄 로그인 페이지로 이동
    });
  } else {
    console.warn('❗ logout-btn 버튼을 찾을 수 없습니다.');
  }
});

// 🔐 fetch 실패 시 토큰 만료 처리
function handleFetchError(err) {
  console.error('요청 실패:', err);
  if (err.message.includes('401') || err.message.includes('403')) {
    alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
    localStorage.removeItem('token');
    window.location.href = './login.html';
  } else {
    alert('서버 통신 중 오류가 발생했습니다.');
  }
}

// 🔐 저장된 JWT 토큰을 가져오는 함수
function getToken() {
  return localStorage.getItem('token');
}

// ✅ 1. 명언 목록 정의
const quotes = [
  "성공은 실패를 거듭해도 열정을 잃지 않는 것이다. – 윈스턴 처칠",
  "기회는 준비된 자에게 온다. – 토마스 에디슨",
  "행동은 모든 성공의 기초이다. – 파블로 피카소",
  "꾸준함이 곧 실력이다.",
  "오늘 걷지 않으면 내일은 뛰어야 한다. – 도쿄대 벽 글귀",
  "시작이 반이다. – 아리스토텔레스",
  "지금 이 순간이 가장 중요한 순간이다.",
];

// ✅ 2. 오늘 날짜 기준으로 명언 1개 반환
function getTodayQuote() {
  const saved = localStorage.getItem("quoteDate");
  const todayStr = moment().format("YYYY-MM-DD");

  if (saved === todayStr) {
    return localStorage.getItem("quoteText");
  } else {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    localStorage.setItem("quoteDate", todayStr);
    localStorage.setItem("quoteText", randomQuote);
    return randomQuote;
  }
}

let allEvents = [];  // 전역 선언

let showPastEvents = true;  // ✅ 추가: 지난 일정 필터링 상태



function showAddModal({ onSubmit, onCancel }) {
    const modal = document.createElement('div');
    modal.className = 'add-modal';

    modal.innerHTML = `
      <div class="modal-content">
        <h3>새 일정 추가</h3>
        <input type="text" id="event-title" placeholder="일정 제목" />
        <select id="event-type">
          <option value="Work">Work</option>
          <option value="Sports">Sports</option>
          <option value="Friend">Friend</option>
          <option value="Other">Other</option>
        </select>
        <textarea id="event-description" placeholder="일정 설명 (선택)"></textarea>
        <div class="modal-actions">
          <button id="submit-event">추가</button>
          <button id="cancel-event">취소</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('submit-event').onclick = () => {
      const title = document.getElementById('event-title').value.trim();
      const type = document.getElementById('event-type').value;
      const description = document.getElementById('eventDescription').value.trim();  // ✅ 수정된 ID로 변경

      if (title) {
        onSubmit(title, type, description);  // ✅ description 전달
        modal.remove();
      }
    };

    document.getElementById('cancel-event').onclick = () => {
      onCancel();
      modal.remove();
    };
  }

  function showConfirmModal({ eventName, onConfirm, onCancel }) {
    const modal = document.createElement('div');
    modal.className = 'confirm-modal';

    modal.innerHTML = `
      <div class="confirm-box">
        <p><strong>"${eventName}"</strong> 일정을 삭제하시겠습니까?</p>
        <div class="modal-buttons">
          <button class="btn-yes">삭제</button>
          <button class="btn-no">취소</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.btn-yes').onclick = () => {
      onConfirm();
      modal.remove();
    };

    modal.querySelector('.btn-no').onclick = () => {
      onCancel();
      modal.remove();
    };
  }


// 🔐 캘린더 실행 함수 시작
!function () {
  const today = moment();

  function Calendar(selector, events) {
    this.el = document.querySelector(selector);
    this.events = events;
    this.current = moment().date(1);
    this.draw();
    const current = document.querySelector('.today');
    if (current) {
      setTimeout(() => this.openDay(current), 500);
    }
  }

  Calendar.prototype.draw = function () {
    this.drawHeader();
    this.drawMonth();
    this.drawLegend();
  };

  Calendar.prototype.drawHeader = function () {
    if (!this.header) {
      this.header = createElement('div', 'header');
      this.title = createElement('h1');
      const right = createElement('div', 'right');
      right.addEventListener('click', () => this.nextMonth());
      const left = createElement('div', 'left');
      left.addEventListener('click', () => this.prevMonth());
      this.header.append(this.title, right, left);
      this.el.appendChild(this.header);
    }
    this.title.innerHTML = this.current.format('MMMM YYYY');
  };

  Calendar.prototype.drawMonth = function () {
    if (this.month) {
      this.oldMonth = this.month;
      this.oldMonth.className = 'month out ' + (this.next ? 'next' : 'prev');
      this.oldMonth.addEventListener('animationend', () => {
        this.oldMonth.parentNode.removeChild(this.oldMonth);
        this.buildMonth();
      });
    } else {
      this.buildMonth();
    }
  };

  Calendar.prototype.buildMonth = function () {
    this.month = createElement('div', 'month');
    this.el.appendChild(this.month);
    this.backFill();
    this.currentMonth();
    this.fowardFill();
    this.month.className += ' new';
  };

  Calendar.prototype.backFill = function () {
    const clone = this.current.clone();
    const dayOfWeek = clone.day();
    if (!dayOfWeek) return;
    clone.subtract(dayOfWeek + 1, 'days');
    for (let i = dayOfWeek; i > 0; i--) {
      this.drawDay(clone.add(1, 'days'));
    }
  };

  Calendar.prototype.fowardFill = function () {
    const clone = this.current.clone().add(1, 'months').subtract(1, 'days');
    const dayOfWeek = clone.day();
    if (dayOfWeek === 6) return;
    for (let i = dayOfWeek; i < 6; i++) {
      this.drawDay(clone.add(1, 'days'));
    }
  };

  Calendar.prototype.currentMonth = function () {
    const clone = this.current.clone();
    while (clone.month() === this.current.month()) {
      this.drawDay(clone);
      clone.add(1, 'days');
    }
  };

  Calendar.prototype.getWeek = function (day) {
    if (!this.week || day.day() === 0) {
      this.week = createElement('div', 'week');
      this.month.appendChild(this.week);
    }
  };

  Calendar.prototype.drawDay = function (day)
  {
    this.getWeek(day);
    const outer = createElement('div', this.getDayClass(day));

    // ✅ 주말이면 weekend 클래스 추가
    const dow = day.day();  // 0: 일요일, 6: 토요일
    if (dow === 0 || dow === 6) {
      outer.classList.add('weekend');
    }

    outer.setAttribute('data-date', day.format('YYYY-MM-DD'));
    outer.addEventListener('click', () => this.openDay(outer));

    // ✅ 드롭 대상이 될 수 있도록 이벤트 추가
    outer.addEventListener('dragover', (e) => {
      e.preventDefault(); // 드롭 허용
    });

    outer.addEventListener('drop', (e) => {
      e.preventDefault();

      try {
        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        const targetDate = day.format('YYYY-MM-DD');

        if (data.date === targetDate) return; // 동일한 날짜로 드롭 시 무시

        // ✅ 서버에 업데이트 요청
        fetch(`/api/events/${data.id}/move`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
          },
          body: JSON.stringify({ newDate: targetDate })
        })
        .then(res => {
          if (!res.ok) throw new Error("서버 업데이트 실패");

          // ✅ UI 갱신을 위해 새로고침
          location.reload();
        })
        .catch(err => {
          console.error("이동 실패:", err);
          alert("일정 이동 중 오류 발생");
        });
      } catch (error) {
        console.error("드롭 파싱 오류:", error);
      }
    });


    const name = createElement('div', 'day-name', day.format('ddd'));
    const number = createElement('div', 'day-number', day.format('DD'));
    const events = createElement('div', 'day-events');

    this.drawEvents(day, events);

    outer.append(name, number, events);
    this.week.appendChild(outer);
  };

  Calendar.prototype.drawEvents = function (day, element) {
    if (day.month() === this.current.month()) {
      const todaysEvents = this.events.filter(ev => ev.date && ev.date.isSame(day, 'day'));
      todaysEvents.forEach(ev => {
        const evSpan = createElement('span', ev.color);
        element.appendChild(evSpan);
      });
    }
  };

  Calendar.prototype.getDayClass = function (day) {
    const classes = ['day'];
    if (day.month() !== this.current.month()) classes.push('other');
    else if (today.isSame(day, 'day')) classes.push('today');
    return classes.join(' ');
  };



Calendar.prototype.openDay = function (el) {
  // 기존 선택된 날짜 초기화 후 현재 선택
  document.querySelectorAll('.day.selected').forEach(el => el.classList.remove('selected'));
  el.classList.add('selected');

  const dateStr = el.getAttribute('data-date');
  const day = moment(dateStr, 'YYYY-MM-DD');
  let details, arrow;

  const currentOpened = document.querySelector('.details');

  if (
    currentOpened &&
    currentOpened.parentNode === el.parentNode &&
    currentOpened.getAttribute('data-date') === dateStr
  ) {
    details = currentOpened;
    arrow = document.querySelector('.arrow');
  } else {
    if (currentOpened) {
      currentOpened.addEventListener('animationend', () => currentOpened.remove());
      currentOpened.className = 'details out';
    }

    details = createElement('div', 'details in');
    details.setAttribute('data-date', dateStr);

    arrow = createElement('div', 'arrow');
    details.appendChild(arrow);

    // ✅ 상단 컨트롤 박스 생성
    const topControls = createElement('div', 'detail-controls');

    // ✅ 일정 추가 버튼
    const addEventBtn = createElement('button', 'add-event-button', 'Add Event');
    addEventBtn.addEventListener('click', () => {
      showAddModal({
        onSubmit: (title, type, description) => this.addEvent(title, type, description, day, details),
        onCancel: () => {}
      });
    });

    // ✅ 상세 보기 버튼
    const detailBtn = createElement('button', 'detail-button', '📌');
    detailBtn.addEventListener('click', () => {
      openDetailModal(this.events.filter(ev => ev.date.isSame(day, 'day')));
    });

    // ✅ 버튼들을 상단에 배치
    topControls.appendChild(addEventBtn);
    topControls.appendChild(detailBtn);
    details.appendChild(topControls);

    el.parentNode.appendChild(details);
  }

  // 해당 날짜 이벤트 렌더링
  const todaysEvents = this.events.filter(ev =>
    moment(ev.date).isSame(day, 'day')
  );

this.renderEvents(todaysEvents, details);  // ← 이게 핵심

  // 화살표 위치 조정
  arrow.style.left = el.offsetLeft - el.parentNode.offsetLeft + 27 + 'px';
};

// ✅ 지난 일정 필터링 함수
function filterEvents(events) {
  const today = moment(); // 오늘 날짜 객체
  return showPastEvents
    ? events                         // 전체 보기
    : events.filter(ev => ev.date.isSameOrAfter(today, 'day')); // 오늘 이후만 보기
}



  Calendar.prototype.addEvent = function (title, type, description, day, details) {
    const newEvent = {
    title,
    type,
    description, // ← 새로 추가한 설명 필드
    date: day.format('YYYY-MM-DD')
     };

    fetch('http://localhost:8080/api/events',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getToken()
      },
      body: JSON.stringify(newEvent)
    })
      .then(res => res.json())
      .then(addedEvent => {
        this.events.push({
          eventName: addedEvent.title,
          calendar: addedEvent.type,
          color: getColor(addedEvent.type),
          date: moment(addedEvent.date, 'YYYY-MM-DD'),
          description: addedEvent.description // ✅ 설명 추가!
        });

        this.renderEvents(this.events.filter(ev => ev.date.isSame(day, 'day')), details);

        const targetDayEl = document.querySelector(`.day[data-date="${day.format('YYYY-MM-DD')}"]`);
        if (targetDayEl) {
          const eventsEl = targetDayEl.querySelector('.day-events');
          if (eventsEl) {
            eventsEl.innerHTML = '';
            this.drawEvents(day, eventsEl);
          }
        }
      })
      .catch(handleFetchError);
  };

  Calendar.prototype.renderEvents = function (events, ele)
  {
    const currentWrapper = ele.querySelector('.events');
    const wrapper = createElement('div', 'events in' + (currentWrapper ? ' new' : ''));

    if (events.length) {
      events.forEach(ev => {
        const div = createElement('div', 'event');
        div.setAttribute('draggable', true); // ← 드래그 가능하게

        div.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', JSON.stringify({
            id: ev.id,
            title: ev.eventName,
            type: ev.calendar,
            color: ev.color,
            date: ev.date.format('YYYY-MM-DD')
          }));
        });

        const square = createElement('div', 'event-category ' + ev.color);
        const span = createElement('span', '', ev.eventName);
        const deleteBtn = createElement('button', 'delete-event-button', 'x');

        deleteBtn.addEventListener('click', () => {
          showConfirmModal({
            eventName: ev.eventName,
            onConfirm: () => {
              div.classList.add('fade-out');
              div.addEventListener('animationend', () => this.deleteEvent(ev, ele), { once: true });
            },
            onCancel: () => {}
          });
        });

        div.append(square, span, deleteBtn);
        wrapper.appendChild(div);
      });
    } else {
      const empty = createElement('div', 'event empty');
      const span = createElement('span', '', 'No Events');
      empty.appendChild(span);
      wrapper.appendChild(empty);
    }

    if (currentWrapper) currentWrapper.remove();
    ele.appendChild(wrapper);
  };

  Calendar.prototype.deleteEvent = function (ev, ele) {
    fetch(`http://localhost:8080/api/events?title=${encodeURIComponent(ev.eventName)}&type=${encodeURIComponent(ev.calendar)}&date=${ev.date.format('YYYY-MM-DD')}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + getToken()  // ✅ JWT 토큰 포함
      }
    })
      .then(res => {
        if (!res.ok) {
          console.error('❌ 삭제 요청 실패 상태코드:', res.status);
          throw new Error('삭제 실패');
        }

        // ✅ 정상 응답일 때만 삭제 처리
        const index = this.events.indexOf(ev);
        if (index > -1) this.events.splice(index, 1);
        this.renderEvents(this.events.filter(e => e.date.isSame(ev.date, 'day')), ele);

        const dayCell = document.querySelector(`.day[data-date="${ev.date.format('YYYY-MM-DD')}"]`);
        if (dayCell) {
          const container = dayCell.querySelector('.day-events');
          if (container) {
            container.innerHTML = '';
            this.drawEvents(ev.date, container);
          }
        }
      })
      .catch(handleFetchError);
  };


  Calendar.prototype.drawLegend = function () {
    const legend = createElement('div', 'legend');
    const types = [
      { name: 'Friend', color: 'pink' },   // #FF6384
          { name: 'Work', color: 'blue' },     // #36A2EB
          { name: 'Sports', color: 'yellow' }, // #FFCE56
          { name: 'Other', color: 'green' }    // #6BCB77
        ];


    const seen = new Set();

    types.forEach(t => addLegendEntry(legend, t, seen));
    this.events.forEach(e => addLegendEntry(legend, { name: e.calendar, color: e.color }, seen));

    this.el.appendChild(legend);
  };

  Calendar.prototype.nextMonth = function () {
    this.current.add(1, 'months');
    this.next = true;
    this.draw();
  };

  Calendar.prototype.prevMonth = function () {
    this.current.subtract(1, 'months');
    this.next = false;
    this.draw();
  };

  function createElement(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
  }

  function getColor(type) {
    switch (type.toLowerCase()) {
      case 'friend': return 'pink';      // #FF6384
      case 'work': return 'blue';        // #36A2EB
      case 'sports': return 'yellow';    // #FFCE56
      case 'other': return 'green';      // #6BCB77
      default: return 'gray';
    }
  }




  function addLegendEntry(container, entry, seen) {
    const key = entry.name + '|' + entry.color;
    if (!seen.has(key)) {
      seen.add(key);
      const span = createElement('span', 'entry ' + entry.color, entry.name);
      container.appendChild(span);
    }
  }

let calendarInstance = null;  // 전역에서 접근 가능하도록 선언

  fetch('http://localhost:8080/api/events', {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + getToken(),
      'Content-Type': 'application/json'
    }
  })
    .then(res => {
      if (!res.ok) throw new Error('401 Unauthorized');
      return res.json();
    })
    .then(eventList => {
      allEvents = eventList; // ✅ 원본 데이터를 전역에 저장 (검색용)

      const events = eventList.map(ev => ({
        id: ev.id,                // ✅ 이 줄 꼭 추가
        eventName: ev.title,
        calendar: ev.type,
        color: getColor(ev.type),
        date: moment(ev.date, 'YYYY-MM-DD'),
        completed: ev.completed, // 이 값도 detail 모달에서 필요
        description: ev.description || '' // ✅ 요거 추가!
      }));

      const filtered = filterEvents(events);  // ✅ 필터 적용

      calendarInstance = new Calendar('#calendar', filtered); // ← 전역 변수에 저장
      renderUpcomingEvents(filtered);         // ✅ 다가오는 일정도 필터된 데이터 사용
    })
    .catch(handleFetchError);

function getCssColor(className) {
  switch (className) {
    case 'pink': return '#f87171';
    case 'blue': return '#60a5fa';
    case 'yellow': return '#facc15';
    case 'green': return '#4ade80';
    default: return '#ccc';
  }
}

    function renderUpcomingEvents(events) {
      const box = document.getElementById('upcomingBox');
      box.innerHTML = '<h3>⏰ 다가오는 일정</h3>';

      const today = moment();
      const future = moment().add(3, 'days');

      // 날짜별 그룹핑
      const grouped = {};

      events.forEach(ev => {
        if (ev.date.isAfter(today, 'day') && ev.date.isSameOrBefore(future, 'day')) {
          const key = ev.date.format('YYYY-MM-DD');
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(ev);
        }
      });

      const sortedDates = Object.keys(grouped).sort();

      sortedDates.forEach(dateStr => {
        const dateMoment = moment(dateStr, 'YYYY-MM-DD');
        const dayBlock = document.createElement('div');
        dayBlock.className = 'upcoming-day';
        dayBlock.innerHTML = `<strong>📅 ${dateMoment.format('MM/DD (dd)')}</strong>`;

        grouped[dateStr].forEach(ev => {
          const div = document.createElement('div');
          div.className = 'upcoming-event';
          div.textContent = `- ${ev.eventName} (${ev.calendar})`;
          div.style.borderColor = getCssColor(ev.color);  // 기존 getColor 색상 변환
          dayBlock.appendChild(div);
        });

        box.appendChild(dayBlock);
      });
    }


// 📊 통계 보기 버튼 클릭 시 모달 열기 + 차트 fetch & 렌더링
document.getElementById("showStatsBtn").addEventListener("click", async () => {

  const modal = document.getElementById("statsModal");
  modal.style.display = "flex"; // 모달 띄우기

  const topBar = document.querySelector(".top-bar");
  if (topBar) topBar.style.display = "none";

  const token = localStorage.getItem("token");

  try {
    const response = await fetch("http://localhost:8080/api/events/statistics", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();
    console.log("📊 통계 응답 데이터:", data);

    drawTypeChart(data.typeCounts);
    drawDailyChart(data.dailyCounts);

  } catch (error) {
    console.error("통계 요청 실패:", error);
    alert("통계 데이터를 불러오는 데 실패했습니다.");
  }
});

// ❌ 닫기 버튼 클릭 시 모달 숨기기
document.getElementById("closeStatsBtn").addEventListener("click", () => {
  document.getElementById("statsModal").style.display = "none";

  const topBar = document.querySelector(".top-bar");
  if (topBar) topBar.style.display = "flex";
});


// ✅ 유형별 도넛 차트 그리기
function drawTypeChart(typeCounts) {
  const ctx = document.getElementById("typeChart").getContext("2d");

  // 안전하게 기존 차트 제거
  if (window.typeChart && typeof window.typeChart.destroy === 'function') {
    window.typeChart.destroy();
  }

  // 새 차트 생성
  window.typeChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: Object.keys(typeCounts),
      datasets: [{
        label: "유형별 일정 수",
        data: Object.values(typeCounts),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#6BCB77', '#845EC2'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        },
        title: {
          display: true,
          text: '📌 일정 유형별 통계'
        }
      }
    }
  });
}

// ✅ 날짜별 막대 차트 그리기
function drawDailyChart(dailyCountsByCategory) {
  const ctx = document.getElementById("dailyChart").getContext("2d");

  if (window.dailyChart && typeof window.dailyChart.destroy === 'function') {
    window.dailyChart.destroy();
  }

  // ✅ 날짜 라벨 추출
  const labels = Object.keys(dailyCountsByCategory).sort();

  // ✅ 카테고리 목록 및 색상 매핑
  const categoryColors = {
    Friend: '#f87171',
    Work: '#60a5fa',
    Other: '#facc15',
    Sports: '#4ade80'
  };

  const categories = Object.keys(categoryColors);

  // ✅ 카테고리별 데이터 추출
  const datasets = categories.map(category => ({
    label: category,
    backgroundColor: categoryColors[category],
    data: labels.map(date => {
      const dayData = dailyCountsByCategory[date] || {};
      return dayData[category] || 0;
    })
  }));

  // ✅ stacked bar chart 생성
  window.dailyChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: datasets
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: '📅 날짜별 일정 수 (카테고리별)'
        },
        legend: {
          position: 'bottom'
        }
      },
      scales: {
        x: {
          stacked: true,
          title: {
            display: true,
            text: '날짜'
          }
        },
        y: {
          stacked: true,
          beginAtZero: true,
          title: {
            display: true,
            text: '일정 개수'
          }
        }
      }
    }
  });
}


// ✅ 모달 열기 함수
function openDetailModal(events) {
  const modal = document.getElementById('detailModal');
  const list = document.getElementById('detailList');
  list.innerHTML = '';

  events.forEach(ev => {
    console.log("📌 이벤트 객체:", ev);
    console.log("📌 이벤트 ID:", ev.id);

    const li = document.createElement('li');
    li.dataset.eventId = ev.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `chk-${ev.eventName}-${ev.date.format('YYYYMMDD')}`;

    if (ev.completed) {
      checkbox.checked = true;
      li.classList.add('completed');
    }

    // ✅ 제목 span
    const title = document.createElement('span');
    title.textContent = ev.eventName;
    title.className = 'event-title';

    // ✅ 설명 div
    const desc = document.createElement('div');
    console.log("📌 설명:", ev.description);
    desc.textContent = ev.description || '';
    desc.className = 'event-description';

   // ✅ 라벨 안에 감쌀 wrapper 생성
   const wrapper = document.createElement('div');
   wrapper.className = 'event-label-wrapper'; // 필요 시 CSS로 스타일 줄 수 있음

   wrapper.appendChild(title);
   if (desc.textContent) wrapper.appendChild(desc);

   // ✅ 라벨 구성 (wrapper 사용)
   const label = document.createElement('label');
   label.setAttribute('for', checkbox.id);
   label.appendChild(wrapper);


    // ✅ 체크박스 이벤트 핸들러
    checkbox.addEventListener('change', () => {
      const eventId = li.dataset.eventId;
      const completed = checkbox.checked;

      if (completed) {
        li.classList.add('completed');
      } else {
        li.classList.remove('completed');
      }

      fetch(`/api/events/${eventId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ completed })
      })
        .then(response => {
          if (!response.ok) throw new Error("업데이트 실패");
        })
        .catch(error => {
          alert("⚠️ 상태 업데이트 실패");
          checkbox.checked = !completed;
          if (checkbox.checked) {
            li.classList.add('completed');
          } else {
            li.classList.remove('completed');
          }
        });
    });

    li.appendChild(checkbox);
    li.appendChild(label);
    list.appendChild(li);
  });

  modal.style.display = 'flex';
}


// ✅ 모달 닫기
document.getElementById('closeDetailBtn').addEventListener('click', () => {
  document.getElementById('detailModal').style.display = 'none';
});

let showPastEvents = true;  // 전역 상태 변수 선언

document.getElementById("togglePastBtn").addEventListener("click", () => {
  showPastEvents = !showPastEvents;

  // 버튼 텍스트 변경
  const btn = document.getElementById("togglePastBtn");
  btn.textContent = showPastEvents ? "지난 일정 숨기기" : "지난 일정 보기";

  // 서버에서 이벤트 다시 가져와서 필터 적용 후 캘린더 렌더링
  fetch("http://localhost:8080/api/events", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json"
    }
  })
    .then(res => res.json())
    .then(eventList => {
      const events = eventList.map(ev => ({
        id: ev.id,
        eventName: ev.title,
        calendar: ev.type,
        color: getColor(ev.type),
        date: moment(ev.date, 'YYYY-MM-DD'),
        completed: ev.completed,
        description: ev.description || '' // ✅ 요거 추가!
      }));

      const filtered = filterEvents(events);  // ✅ 지난 일정 필터링 적용

      // ✅ 기존 캘린더 내용 초기화
      const calendarEl = document.getElementById('calendar');
      calendarEl.innerHTML = '';

      // ✅ 새 캘린더 그리기
      new Calendar('#calendar', filtered);
      renderUpcomingEvents(filtered);
    })
    .catch(handleFetchError);
});

// ✅ 4. 상단 quoteBox에 명언 출력
document.addEventListener("DOMContentLoaded", () => {
  const quote = getTodayQuote();
  const box = document.getElementById("quoteBox");
  if (box) box.textContent = `💬 ${quote}`;
});

// ✅ 날씨 위젯 추가
  document.addEventListener("DOMContentLoaded", function () {
    const apiKey = "dfcc7de5ff919e6abbf96b0d62db69f8"; // 발급받은 OpenWeatherMap API 키
    const city = "Seoul"; // 원하는 도시

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=kr`)
      .then(res => {
        if (!res.ok) throw new Error("응답 오류");
        return res.json();
      })
      .then(data => {
        const temp = Math.round(data.main.temp); // 현재 온도
        const description = data.weather[0].description; // 날씨 설명
        const icon = data.weather[0].icon; // 날씨 아이콘 코드
        const iconUrl = `https://openweathermap.org/img/wn/${icon}.png`; // 아이콘 이미지 URL

        // HTML에 날씨 정보 출력
        const weatherEl = document.getElementById("weather");
        if (weatherEl) {
          weatherEl.innerHTML = `
            <img src="${iconUrl}" alt="날씨 아이콘" style="width:20px; vertical-align: middle; margin-right: 5px;" />
            ${city} | ${temp}°C, ${description}
          `;
        }
      })
      .catch(err => {
        console.error("❌ 날씨 불러오기 실패:", err);
        const weatherEl = document.getElementById("weather");
        if (weatherEl) {
          weatherEl.innerText = "날씨 정보 없음 (API 키 대기 중)";
        }
      });
  });

  document.getElementById('theme-toggle').addEventListener('click', function () {
    document.body.classList.toggle('light-mode');

    // 아이콘도 바꿔주기
    const isLight = document.body.classList.contains('light-mode');
    this.textContent = isLight ? '🌙' : '🌞';
  });

document.getElementById('goTodayBtn').addEventListener('click', () => {
  if (!calendarInstance) return;
  calendarInstance.current = moment().date(1); // 현재 월의 첫 날로 이동
  calendarInstance.draw();  // 다시 그리기

  // 오늘 날짜 셀 하이라이트
  const todayStr = moment().format("YYYY-MM-DD");
  const todayCell = document.querySelector(`[data-date="${todayStr}"]`);
  if (todayCell) {
    todayCell.classList.add('highlight-today');
    setTimeout(() => todayCell.classList.remove('highlight-today'), 2000);
  }
});

document.getElementById('searchInput').addEventListener('input', function (e) {
  const keyword = e.target.value.trim().toLowerCase();
  const resultsContainer = document.getElementById('searchResults');

  if (!keyword) {
    resultsContainer.innerHTML = '';
    clearSearchHighlights();
    return;
  }

  // ✅ 검색
  const matchedEvents = allEvents.filter(event =>
    event.title.toLowerCase().includes(keyword)
  );

  // ✅ 날짜 모아 강조
  const matchedDates = matchedEvents.map(event => event.date); // ['2025-07-04', '2025-07-10', ...]
  highlightDates(matchedDates);

  // ✅ 결과 출력
  if (matchedEvents.length > 0) {
    resultsContainer.innerHTML = matchedEvents
      .map(event => `📌 <strong>${event.title}</strong> - ${event.date}`)
      .join('<br>');
  } else {
    resultsContainer.innerHTML = '🔍 일치하는 일정이 없습니다.';
  }
});


// ✅ 기존 하이라이트 제거
function clearSearchHighlights() {
  document.querySelectorAll('.day').forEach(dayEl => {
    dayEl.classList.remove('search-highlight');
  });
}

// ✅ 검색된 날짜를 강조
function highlightDates(dates) {
  clearSearchHighlights();

  dates.forEach(dateStr => {
    const cell = document.querySelector(`.day[data-date="${dateStr}"]`);
    if (cell) {
      cell.classList.add('search-highlight');
    }
  });
}





}();
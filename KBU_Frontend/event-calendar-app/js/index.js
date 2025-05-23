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
      if (title) {
        onSubmit(title, type);
        modal.remove();
      }
    };

    document.getElementById('cancel-event').onclick = () => {
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
    clone.subtract('days', dayOfWeek + 1);
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

  Calendar.prototype.drawDay = function (day) {
    this.getWeek(day);
    const outer = createElement('div', this.getDayClass(day));
    outer.setAttribute('data-date', day.format('YYYY-MM-DD'));
    outer.addEventListener('click', () => this.openDay(outer));

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
    document.querySelectorAll('.day.selected').forEach(el => el.classList.remove('selected'));
    el.classList.add('selected');

    const dateStr = el.getAttribute('data-date');
    const day = moment(dateStr, 'YYYY-MM-DD');
    let details, arrow;
    const currentOpened = document.querySelector('.details');

    if (currentOpened && currentOpened.parentNode === el.parentNode && currentOpened.getAttribute('data-date') === dateStr) {
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

      const addBtn = createElement('button', 'add-event-button', 'Add Event');
      addBtn.addEventListener('click', () => {
        showAddModal({
          onSubmit: (title, type) => this.addEvent(title, type, day, details),
          onCancel: () => {}
        });
      });

      details.appendChild(addBtn);
      el.parentNode.appendChild(details);
    }

    const todaysEvents = this.events.filter(ev => ev.date.isSame(day, 'day'));
    this.renderEvents(todaysEvents, details);

    arrow.style.left = el.offsetLeft - el.parentNode.offsetLeft + 27 + 'px';
  };

  Calendar.prototype.addEvent = function (title, type, day, details) {
    const newEvent = { title, type, date: day.format('YYYY-MM-DD') };

    fetch('http://localhost:8080/api/events', {
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
          date: moment(addedEvent.date, 'YYYY-MM-DD')
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

  Calendar.prototype.renderEvents = function (events, ele) {
    const currentWrapper = ele.querySelector('.events');
    const wrapper = createElement('div', 'events in' + (currentWrapper ? ' new' : ''));

    if (events.length) {
      events.forEach(ev => {
        const div = createElement('div', 'event');
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
        'Authorization': 'Bearer ' + getToken()
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('삭제 실패');
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
      { name: 'Work', color: 'orange' },
      { name: 'Sports', color: 'blue' },
      { name: 'Friend', color: 'yellow' },
      { name: 'Other', color: 'green' }
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
      case 'work': return 'orange';
      case 'sports': return 'blue';
      case 'friend': return 'yellow';
      default: return 'green';
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
      const events = eventList.map(ev => ({
        eventName: ev.title,
        calendar: ev.type,
        color: getColor(ev.type),
        date: moment(ev.date, 'YYYY-MM-DD')
      }));
      new Calendar('#calendar', events);
    })
    .catch(handleFetchError);

}();

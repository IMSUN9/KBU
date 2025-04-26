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
          onSubmit: (eventName, eventType) => this.addEvent(eventName, eventType, day, details),
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
      headers: { 'Content-Type': 'application/json' },
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
      })
      .catch(err => {
        console.error('Error adding event:', err);
        alert('일정 추가 실패');
      });
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
      method: 'DELETE'
    })
      .then(response => {
        if (response.ok) {
          const index = this.events.indexOf(ev);
          if (index > -1) this.events.splice(index, 1);
          this.renderEvents(this.events.filter(e => e.date.isSame(ev.date, 'day')), ele);
        } else {
          throw new Error('삭제 실패');
        }
      })
      .catch(err => {
        console.error('삭제 중 오류:', err);
        alert('삭제 실패');
      });
  };

  Calendar.prototype.drawLegend = function () {
    const legend = createElement('div', 'legend');
    const base = [
      { name: 'Work', color: 'orange' },
      { name: 'Sports', color: 'blue' },
      { name: 'Friend', color: 'yellow' },
      { name: 'Other', color: 'green' }
    ];
    const seen = new Set();

    base.forEach(e => addLegendEntry(legend, e, seen));
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

  function createElement(tagName, className, innerText) {
    const ele = document.createElement(tagName);
    if (className) ele.className = className;
    if (innerText) ele.textContent = innerText;
    return ele;
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

  // 모달 함수 (추가/삭제 모달)
  function showAddModal({ onSubmit, onCancel }) {
    const existing = document.querySelector('.add-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.className = 'add-modal';
    modal.innerHTML = `
      <div class="add-box">
        <h3>일정을 추가하세요</h3>
        <input type="text" placeholder="제목을 입력하세요" class="add-title"/>
        <div class="type-buttons">
          <button data-type="Work">Work</button>
          <button data-type="Sports">Sports</button>
          <button data-type="Friend">Friend</button>
          <button data-type="Other">Other</button>
        </div>
        <div class="modal-buttons">
          <button class="btn-no">취소</button>
          <button class="btn-yes">추가</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    let selectedType = null;
    modal.querySelectorAll('.type-buttons button').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedType = btn.dataset.type;
        modal.querySelectorAll('.type-buttons button').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });

    modal.querySelector('.btn-yes').addEventListener('click', () => {
      const title = modal.querySelector('.add-title').value.trim();
      if (title && selectedType) {
        onSubmit(title, selectedType);
        modal.remove();
      } else {
        alert('제목과 유형을 선택하세요!');
      }
    });

    modal.querySelector('.btn-no').addEventListener('click', () => {
      onCancel();
      modal.remove();
    });
  }

  function showConfirmModal({ eventName, onConfirm, onCancel }) {
    const existing = document.querySelector('.confirm-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.className = 'confirm-modal';
    modal.innerHTML = `
      <div class="confirm-box">
        <p><strong>「${eventName}」</strong><br>일정을 삭제하시겠습니까?</p>
        <div class="modal-buttons">
          <button class="btn-yes">확인</button>
          <button class="btn-no">취소</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('.btn-yes').addEventListener('click', () => {
      onConfirm();
      modal.remove();
    });
    modal.querySelector('.btn-no').addEventListener('click', () => {
      onCancel();
      modal.remove();
    });
  }

  // 캘린더 실행
  const data = [];
  const calendar = new Calendar('#calendar', data);

}();

// index.js
!function() {

  const today = moment();

  function Calendar(selector, events) {
    this.el = document.querySelector(selector);
    this.events = events;
    this.current = moment().date(1);
    this.draw();
    const current = document.querySelector('.today');
    if (current) {
      const self = this;
      setTimeout(function () {
        self.openDay(current);
      }, 500);
    }
  }

  Calendar.prototype.draw = function () {
    this.drawHeader();
    this.drawMonth();
    this.drawLegend();
  };

  Calendar.prototype.drawHeader = function () {
    const self = this;
    if (!this.header) {
      this.header = createElement('div', 'header');
      this.title = createElement('h1');

      const right = createElement('div', 'right');
      right.addEventListener('click', () => self.nextMonth());

      const left = createElement('div', 'left');
      left.addEventListener('click', () => self.prevMonth());

      this.header.appendChild(this.title);
      this.header.appendChild(right);
      this.header.appendChild(left);
      this.el.appendChild(this.header);
    }
    this.title.innerHTML = this.current.format('MMMM YYYY');
  };

  Calendar.prototype.drawMonth = function () {
    const self = this;

    if (this.month) {
      this.oldMonth = this.month;
      this.oldMonth.className = 'month out ' + (self.next ? 'next' : 'prev');
      this.oldMonth.addEventListener('animationend', function () {
        self.oldMonth.parentNode.removeChild(self.oldMonth);
        self.month = createElement('div', 'month');
        self.backFill();
        self.currentMonth();
        self.fowardFill();
        self.el.appendChild(self.month);
        setTimeout(() => {
          self.month.className = 'month in ' + (self.next ? 'next' : 'prev');
        }, 16);
      });
    } else {
      this.month = createElement('div', 'month');
      this.el.appendChild(this.month);
      this.backFill();
      this.currentMonth();
      this.fowardFill();
      this.month.className = 'month new';
    }
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
    const self = this;
    this.getWeek(day);

    const outer = createElement('div', this.getDayClass(day));
    outer.setAttribute('data-date', day.format('YYYY-MM-DD'));
    outer.addEventListener('click', function () {
      self.openDay(this);
    });

    const name = createElement('div', 'day-name', day.format('ddd'));
    const number = createElement('div', 'day-number', day.format('DD'));
    const events = createElement('div', 'day-events');

    this.drawEvents(day, events);

    outer.appendChild(name);
    outer.appendChild(number);
    outer.appendChild(events);
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
    if (day.month() !== this.current.month()) {
      classes.push('other');
    } else if (today.isSame(day, 'day')) {
      classes.push('today');
    }
    return classes.join(' ');
  };

  Calendar.prototype.openDay = function (el) {
    const self = this;
    const dateStr = el.getAttribute('data-date');
    const day = moment(dateStr, 'YYYY-MM-DD');

    let details, arrow;

    const currentOpened = document.querySelector('.details');

    // 🔍 같은 주, 같은 날짜일 경우만 열지 않음
    if (
      currentOpened &&
      currentOpened.parentNode === el.parentNode &&
      currentOpened.getAttribute('data-date') === dateStr
    ) {
      details = currentOpened;
      arrow = document.querySelector('.arrow');
    } else {
      // 🔄 열려있는 다른 날짜 details는 제거
      if (currentOpened) {
        currentOpened.addEventListener('animationend', function () {
          currentOpened?.parentNode?.removeChild(currentOpened);
        });
        currentOpened.className = 'details out';
      }

      // 📦 새로운 details 박스 생성
      details = createElement('div', 'details in');
      details.setAttribute('data-date', dateStr); // 날짜 바인딩

      arrow = createElement('div', 'arrow');
      details.appendChild(arrow);

      // ➕ Add Event 버튼
      const addBtn = createElement('button', 'add-event-button', 'Add Event');
      addBtn.addEventListener('click', function () {
        const eventName = prompt('Event Title:');
        const eventType = prompt('Event Type (work, sports, friend, other):');

        if (eventName && eventType) {
          const newEvent = {
            eventName: eventName,
            calendar: eventType.charAt(0).toUpperCase() + eventType.slice(1),
            color:
              eventType.toLowerCase() === 'work'
                ? 'orange'
                : eventType.toLowerCase() === 'sports'
                ? 'blue'
                : eventType.toLowerCase() === 'friend'
                ? 'yellow'
                : 'green',
            date: day.clone(),
          };

          self.events.push(newEvent);

          // 🔁 다시 이벤트 렌더링
          self.renderEvents(
            self.events.filter((ev) => ev.date.isSame(day, 'day')),
            details
          );
        }
      });

      details.appendChild(addBtn);
      el.parentNode.appendChild(details);
    }

    // 📅 클릭한 날짜의 이벤트 필터링 후 표시
    const todaysEvents = this.events.reduce(function (memo, ev) {
      if (ev.date.isSame(day, 'day')) {
        memo.push(ev);
      }
      return memo;
    }, []);

    this.renderEvents(todaysEvents, details);

    // 📍화살표 위치 조정
    arrow.style.left = el.offsetLeft - el.parentNode.offsetLeft + 27 + 'px';
  };


  Calendar.prototype.renderEvents = function (events, ele) {
    const currentWrapper = ele.querySelector('.events');
    const wrapper = createElement('div', 'events in' + (currentWrapper ? ' new' : ''));

    if (events.length) {
      events.forEach(ev => {
        const div = createElement('div', 'event');
        const square = createElement('div', 'event-category ' + ev.color);
        const span = createElement('span', '', ev.eventName);
        div.appendChild(square);
        div.appendChild(span);
        wrapper.appendChild(div);
      });
    } else {
      const div = createElement('div', 'event empty');
      const span = createElement('span', '', 'No Events');
      div.appendChild(span);
      wrapper.appendChild(div);
    }

    if (currentWrapper) currentWrapper.remove();
    ele.appendChild(wrapper);
  };

  Calendar.prototype.drawLegend = function () {
    const legend = createElement('div', 'legend');

    const base = [
      { name: 'Work', color: 'orange' },
      { name: 'Sports', color: 'blue' },
      { name: 'Friend', color: 'yellow' },
      { name: 'Other', color: 'green' }
    ];

    // 중복 제거
    const seen = new Set();

    // 기본값 먼저 추가
    base.forEach(e => {
      const key = e.name + '|' + e.color;
      if (!seen.has(key)) {
        seen.add(key);
        const entry = createElement('span', 'entry ' + e.color, e.name);
        legend.appendChild(entry);
      }
    });

    // this.events에서 추가된 새로운 카테고리도 반영
    this.events.forEach(e => {
      const key = e.calendar + '|' + e.color;
      if (!seen.has(key)) {
        seen.add(key);
        const entry = createElement('span', 'entry ' + e.color, e.calendar);
        legend.appendChild(entry);
      }
    });

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

  const data = [];
  const calendar = new Calendar('#calendar', data);



}();
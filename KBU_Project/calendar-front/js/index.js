<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Custom Calendar</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.4/moment.min.js"></script>
  <style>
    /* 최소한의 스타일 */
    body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
    #calendar { width: 100%; max-width: 800px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; }
    .header h1 { font-size: 24px; }
    .left, .right { cursor: pointer; padding: 5px 10px; background: #ddd; border-radius: 4px; }
    .month { display: flex; flex-wrap: wrap; }
    .week { display: flex; width: 100%; }
    .day { flex: 1; padding: 10px; margin: 2px; background: white; border-radius: 4px; text-align: center; cursor: pointer; }
    .day.other { background: #eee; }
    .today { background: #fffae6; }
    .day-name { font-weight: bold; }
    .day-events span { display: block; width: 6px; height: 6px; border-radius: 50%; margin: 3px auto; }
    .legend { margin-top: 20px; }
    .legend .entry { margin-right: 10px; padding: 5px 10px; border-radius: 4px; display: inline-block; }
    .orange { background: orange; }
    .blue { background: blue; }
    .yellow { background: gold; }
    .green { background: green; }
    .details { animation: fadeIn 0.3s ease; margin-top: 10px; background: #fff; padding: 10px; border-radius: 4px; }
    .event { margin: 5px 0; display: flex; align-items: center; }
    .event-category { width: 10px; height: 10px; margin-right: 5px; border-radius: 50%; }
    .arrow { width: 0; height: 0; border-left: 7px solid transparent; border-right: 7px solid transparent; border-bottom: 7px solid #fff; margin: 0 auto; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  </style>
</head>
<body>

<div id="calendar"></div>

<script>
  !function() {
    var today = moment();

    function Calendar(selector, events) {
      this.el = document.querySelector(selector);
      this.events = events;
      this.current = moment().date(1);
      this.draw();
      var current = document.querySelector('.today');
      if(current) {
        var self = this;
        window.setTimeout(function() {
          self.openDay(current);
        }, 500);
      }
    }

    Calendar.prototype.draw = function() {
      this.drawHeader();
      this.drawMonth();
      this.drawLegend();
    }

    Calendar.prototype.drawHeader = function() {
      var self = this;
      if(!this.header) {
        this.header = createElement('div', 'header');
        this.title = createElement('h1');

        var right = createElement('div', 'right', '▶');
        right.addEventListener('click', function() { self.nextMonth(); });

        var left = createElement('div', 'left', '◀');
        left.addEventListener('click', function() { self.prevMonth(); });

        this.header.appendChild(left);
        this.header.appendChild(this.title);
        this.header.appendChild(right);
        this.el.appendChild(this.header);
      }

      this.title.innerHTML = this.current.format('MMMM YYYY');
    }

    Calendar.prototype.drawMonth = function() {
      var self = this;

      if(this.month) {
        this.oldMonth = this.month;
        this.oldMonth.className = 'month out ' + (self.next ? 'next' : 'prev');
        this.oldMonth.addEventListener('animationend', function() {
          self.oldMonth.parentNode.removeChild(self.oldMonth);
          self.month = createElement('div', 'month');
          self.backFill();
          self.currentMonth();
          self.fowardFill();
          self.el.appendChild(self.month);
          window.setTimeout(function() {
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
    }

    Calendar.prototype.backFill = function() {
      var clone = this.current.clone();
      var dayOfWeek = clone.day();
      if(!dayOfWeek) return;
      clone.subtract('days', dayOfWeek+1);
      for(var i = dayOfWeek; i > 0 ; i--) {
        this.drawDay(clone.add('days', 1));
      }
    }

    Calendar.prototype.fowardFill = function() {
      var clone = this.current.clone().add('months', 1).subtract('days', 1);
      var dayOfWeek = clone.day();
      if(dayOfWeek === 6) return;
      for(var i = dayOfWeek; i < 6 ; i++) {
        this.drawDay(clone.add('days', 1));
      }
    }

    Calendar.prototype.currentMonth = function() {
      var clone = this.current.clone();
      while(clone.month() === this.current.month()) {
        this.drawDay(clone);
        clone.add('days', 1);
      }
    }

    Calendar.prototype.getWeek = function(day) {
      if(!this.week || day.day() === 0) {
        this.week = createElement('div', 'week');
        this.month.appendChild(this.week);
      }
    }

    Calendar.prototype.drawDay = function(day) {
      var self = this;
      this.getWeek(day);

      var outer = createElement('div', this.getDayClass(day));
      outer.addEventListener('click', function() {
        self.openDay(this);
      });

      var name = createElement('div', 'day-name', day.format('ddd'));
      var number = createElement('div', 'day-number', day.format('DD'));
      var events = createElement('div', 'day-events');
      this.drawEvents(day, events);

      outer.appendChild(name);
      outer.appendChild(number);
      outer.appendChild(events);
      this.week.appendChild(outer);
    }

    Calendar.prototype.drawEvents = function(day, element) {
      if(day.month() === this.current.month()) {
        var todaysEvents = this.events.filter(ev => ev.date.isSame(day, 'day'));
        todaysEvents.forEach(function(ev) {
          var evSpan = createElement('span', ev.color);
          element.appendChild(evSpan);
        });
      }
    }

    Calendar.prototype.getDayClass = function(day) {
      let classes = ['day'];
      if(day.month() !== this.current.month()) classes.push('other');
      else if (today.isSame(day, 'day')) classes.push('today');
      return classes.join(' ');
    }

    Calendar.prototype.openDay = function(el) {
      var details, arrow;
      var dayNumber = +el.querySelector('.day-number').textContent;
      var day = this.current.clone().date(dayNumber);

      var currentOpened = document.querySelector('.details');
      if(currentOpened && currentOpened.parentNode === el.parentNode) {
        details = currentOpened;
        arrow = document.querySelector('.arrow');
      } else {
        if(currentOpened) {
          currentOpened.addEventListener('animationend', function() {
            currentOpened.parentNode.removeChild(currentOpened);
          });
          currentOpened.className = 'details out';
        }

        details = createElement('div', 'details in');
        arrow = createElement('div', 'arrow');
        details.appendChild(arrow);
        el.parentNode.appendChild(details);
      }

      var todaysEvents = this.events.filter(ev => ev.date.isSame(day, 'day'));
      this.renderEvents(todaysEvents, details);
      arrow.style.left = el.offsetLeft - el.parentNode.offsetLeft + 27 + 'px';
    }

    Calendar.prototype.renderEvents = function(events, ele) {
      var currentWrapper = ele.querySelector('.events');
      var wrapper = createElement('div', 'events in' + (currentWrapper ? ' new' : ''));

      events.forEach(function(ev) {
        var div = createElement('div', 'event');
        var square = createElement('div', 'event-category ' + ev.color);
        var span = createElement('span', '', ev.eventName);
        div.appendChild(square);
        div.appendChild(span);
        wrapper.appendChild(div);
      });

      if(!events.length) {
        var div = createElement('div', 'event empty');
        var span = createElement('span', '', 'No Events');
        div.appendChild(span);
        wrapper.appendChild(div);
      }

      if(currentWrapper) {
        currentWrapper.className = 'events out';
        currentWrapper.addEventListener('animationend', function() {
          currentWrapper.parentNode.removeChild(currentWrapper);
          ele.appendChild(wrapper);
        });
      } else {
        ele.appendChild(wrapper);
      }
    }

    Calendar.prototype.drawLegend = function() {
      var legend = createElement('div', 'legend');
      var calendars = this.events.map(e => e.calendar + '|' + e.color)
        .filter((e, i, a) => a.indexOf(e) === i)
        .forEach(function(e) {
          var parts = e.split('|');
          var entry = createElement('span', 'entry ' + parts[1], parts[0]);
          legend.appendChild(entry);
        });
      this.el.appendChild(legend);
    }

    Calendar.prototype.nextMonth = function() {
      this.current.add('months', 1);
      this.next = true;
      this.draw();
    }

    Calendar.prototype.prevMonth = function() {
      this.current.subtract('months', 1);
      this.next = false;
      this.draw();
    }

    window.Calendar = Calendar;

    function createElement(tagName, className, innerText) {
      var ele = document.createElement(tagName);
      if(className) ele.className = className;
      if(innerText) ele.innerText = ele.textContent = innerText;
      return ele;
    }
  }();

  !function() {
    var data = [
      { eventName: 'Lunch Meeting w/ Mark', calendar: 'Work', color: 'orange' },
      { eventName: 'Interview - Jr. Web Developer', calendar: 'Work', color: 'orange' },
      { eventName: 'Demo New App to the Board', calendar: 'Work', color: 'orange' },
      { eventName: 'Dinner w/ Marketing', calendar: 'Work', color: 'orange' },
      { eventName: 'Game vs Portland', calendar: 'Sports', color: 'blue' },
      { eventName: 'Game vs Houston', calendar: 'Sports', color: 'blue' },
      { eventName: 'Game vs Denver', calendar: 'Sports', color: 'blue' },
      { eventName: 'Game vs San Diego', calendar: 'Sports', color: 'blue' },
      { eventName: 'School Play', calendar: 'Kids', color: 'yellow' },
      { eventName: 'Parent/Teacher Conference', calendar: 'Kids', color: 'yellow' },
      { eventName: 'Pick up from Soccer Practice', calendar: 'Kids', color: 'yellow' },
      { eventName: 'Ice Cream Night', calendar: 'Kids', color: 'yellow' },
      { eventName: 'Free Tamale Night', calendar: 'Other', color: 'green' },
      { eventName: 'Bowling Team', calendar: 'Other', color: 'green' },
      { eventName: 'Teach Kids to Code', calendar: 'Other', color: 'green' },
      { eventName: 'Startup Weekend', calendar: 'Other', color: 'green' }
    ];

    function addDate(events) {
      var startDate = moment().date(1);
      events.forEach(function(ev, i) {
        ev.date = startDate.clone().add(i, 'days');
      });
    }

    addDate(data);
    var calendar = new Calendar('#calendar', data);
  }();
</script>

</body>
</html>

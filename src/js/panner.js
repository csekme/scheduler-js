class ScheduleTable {

  constructor(containerId, options = {}) {
    // Alapértelmezett opciók
    this.options = {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      displayWeekDays: false,
      daysInMonth: null,
      data: [],
      onCellChange: null,
      ...options, // Felülírás az átadott opciókkal
    };

    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`A megadott "${containerId}" ID nem található a DOM-ban.`);
    }

    this.draggedElement = null; // A jelenleg húzott elem
    this.options.daysInMonth = this.options.daysInMonth || this.calculateDaysInMonth();
    this.weekDays = ['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat', 'Vasárnap'];

    this.initTable();
    this.addDragAndDrop();
  }

  // Hónap napjainak kiszámítása
  calculateDaysInMonth() {
    const { year, month } = this.options;
    return new Date(year, month, 0).getDate(); // A hónap utolsó napja
  }

  getHoliday(day) {
    const { holidays } = this.options;
    if (!holidays) {
      return false;
    }
    return holidays.find(holiday => holiday.day === day);
  }

  clearTable() {
    this.container.innerHTML = '';
  }

  // Táblázat inicializálása
  initTable() {
    const { data, daysInMonth, displayWeekDays, sortDayNames } = this.options;

    const table = document.createElement('table');
    table.className = 'schedule-table';

    // Fejléc létrehozása
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.appendChild(this.createCell('Név', 'th'));
    for (let day = 1; day <= daysInMonth; day++) {
      let dayName = this.weekDays[(new Date(this.options.year, this.options.month - 1, day).getDay() + 6) % 7];
      if (sortDayNames) {
        dayName = dayName.substring(0, 3);
      }
      let holiday = this.getHoliday(day);
      headerRow.appendChild(this.createHeaderCell(day, dayName, holiday ? 'planner-th-holiday' : '', holiday ? holiday.name : ''));
    }
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Táblázat testének létrehozása
    const tbody = document.createElement('tbody');
    data.forEach(({ name, uuid, days }) => {
      const row = document.createElement('tr');
      row.appendChild(this.createCell(name, 'td', 'td-names')); // Név oszlop

      for (let day = 1; day <= daysInMonth; day++) {
        const dayData = days.find(d => d.day === day);
        const cellValue = dayData ? dayData.hours : '';
        const cell = this.createCell(cellValue, 'td', 'draggable');
        cell.draggable = true;

        // Data attribútumok hozzáadása
        cell.dataset.name = name;
        cell.dataset.day = day.toString();
        cell.dataset.uuid = uuid;
        row.appendChild(cell);
      }
      tbody.appendChild(row);
    });
    table.appendChild(tbody);

    this.container.appendChild(table);
    this.table = table; // Referencia a táblázatra
  }

  // Drag and drop logika hozzáadása
  addDragAndDrop() {
    this.table.addEventListener('dragstart', (e) => {
      if (e.target.classList.contains('draggable')) {
        this.draggedElement = e.target;
        setTimeout(() => {
          e.target.style.visibility = 'hidden';
        }, 0);
      }
    });

    this.table.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    this.table.addEventListener('drop', (e) => {
      if (this.draggedElement && e.target.classList.contains('draggable')) {
        const fromCell = this.draggedElement;
        const toCell = e.target;

        // Cellák értékeinek cseréje
        this.swapValues(fromCell, toCell);

        // Callback meghívása két eseménnyel (mindkét cellára)
        if (typeof this.options.onCellChange === 'function') {
          this.options.onCellChange({
            from: {
              value: fromCell.textContent,
              name: fromCell.dataset.name,
              day: fromCell.dataset.day,
              uuid: fromCell.dataset.uuid,
            },
            to: {
              value: toCell.textContent,
              name: toCell.dataset.name,
              day: toCell.dataset.day,
              uuid: toCell.dataset.uuid,
            },
          });
        }
      }
    });

    this.table.addEventListener('dragend', (e) => {
      if (this.draggedElement) {
        this.draggedElement.style.visibility = 'visible';
        this.draggedElement = null; // Töröljük a referencia
      }
    });
  }

  // Cellák értékeinek cseréje
  swapValues(el1, el2) {
    const temp = el1.textContent;
    el1.textContent = el2.textContent;
    el2.textContent = temp;
  }

  // Cellagenerátor
  createCell(content, type = 'td', additionalClass = '') {
    const cell = document.createElement(type);
    cell.textContent = content;
    if (additionalClass) {
      cell.classList.add(additionalClass);
    }
    return cell;
  }

  createHeaderCell(value, weekDay, additionalClass = '', tooltip = '') {
    const div = document.createElement('th');
    if (tooltip) {
      div.setAttribute('data-bs-toggle', 'tooltip');
      div.setAttribute('data-bs-title', tooltip);
      div.setAttribute('data-bs-placement', 'bottom');
    }

    if (additionalClass) {
      div.classList.add(additionalClass);
    }
    const divValue = document.createElement('div');
    divValue.textContent = value;
    divValue.classList.add('th-main-text');
    const divWeekDay = document.createElement('div');
    divWeekDay.classList.add('th-sub-text');
    divWeekDay.textContent = weekDay;
    div.appendChild(divValue);
    div.appendChild(divWeekDay);
    return div;
  }
}



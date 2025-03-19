const players = [
    {nickname: "Bull_Digga", rating: 1650, time: "3 + 2"},
    {nickname: "madi_nusha", rating: 2100, time: "15 + 10"},
    {nickname: "Bull_Digga", rating: 1650, time: "3 + 2"},
    {nickname: "madi_nusha", rating: 2100, time: "15 + 10"},
    {nickname: "Bull_Digga", rating: 1650, time: "3 + 2"},
    {nickname: "madi_nusha", rating: 2100, time: "15 + 10"},
    {nickname: "Bull_Digga", rating: 1650, time: "3 + 2"},
    {nickname: "madi_nusha", rating: 2100, time: "15 + 10"},
    {nickname: "Bull_Digga", rating: 1650, time: "3 + 2"},
    {nickname: "madi_nusha", rating: 2100, time: "15 + 10"},
    {nickname: "Bull_Digga", rating: 1650, time: "3 + 2"},
    {nickname: "madi_nusha", rating: 2100, time: "15 + 10"}
];

const tableBody = document.querySelector('.table-body');
players.forEach(player => {
    const row = document.createElement('div');
    row.className = 'player-row';
    row.innerHTML = `
        <div class="column nickname">${player.nickname}</div>
        <div class="column rating">${player.rating}</div>
        <div class="column time-control">${player.time}</div>
    `;
    tableBody.appendChild(row);
});

document.querySelectorAll('.clear-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const input = e.currentTarget.previousElementSibling;
        input.value = '';
        input.focus();
        btn.style.opacity = '0';
    });
});

document.querySelectorAll('.search-input').forEach(input => {
    const clearBtn = input.nextElementSibling;

    input.addEventListener('input', function() {
        clearBtn.style.opacity = this.value ? '1' : '0';
    });

    clearBtn.addEventListener('click', () => {
        input.value = '';
        clearBtn.style.opacity = '0';
        input.focus();
    });
});

document.querySelectorAll('#choose-color img').forEach(img => {
    img.addEventListener('click', function() {
        document.querySelectorAll('#choose-color img').forEach(i => {
            i.classList.remove('selected');
        });
        this.classList.add('selected');
    });
});

let currentInput = null; // Текущее активное поле ввода

// Обработчики для полей ввода времени
document.querySelectorAll('.time-input').forEach(input => {
    input.addEventListener('focus', () => {
        currentInput = input;
        document.querySelector('.time-numpad').style.display = 'block';
        document.getElementById('choose-color').classList.add('hidden');
        document.getElementById('choose-opponent').classList.add('hidden');
    });

    input.addEventListener('blur', (e) => {
        if (!e.relatedTarget?.closest('.time-numpad')) {
            document.querySelector('.time-numpad').style.display = 'none';
            document.getElementById('choose-color').classList.remove('hidden');
            document.getElementById('choose-opponent').classList.remove('hidden');
        }
    });
});

// Обработчики для цифровых кнопок
document.querySelectorAll('.numpad-btn:not(#numpad-backspace):not(#numpad-close)').forEach(btn => {
    btn.addEventListener('click', () => {
        if (currentInput) {
            currentInput.value += btn.textContent;
            currentInput.dispatchEvent(new Event('input'));
        }
    });
});

// Обработчик для крестика (×) - полная очистка
document.getElementById('numpad-close').addEventListener('click', () => {
    if (currentInput) {
        currentInput.value = '';
        currentInput.dispatchEvent(new Event('input'));
    }
});

// Закрытие нумпада при клике вне его области
document.addEventListener('click', (e) => {
    const numpad = document.querySelector('.time-numpad');
    if (!e.target.closest('.time-numpad') &&
        !e.target.classList.contains('time-input') &&
        numpad.style.display === 'block') {
        numpad.style.display = 'none';
        document.getElementById('choose-color').classList.remove('hidden');
        document.getElementById('choose-opponent').classList.remove('hidden');
    }
});

document.querySelectorAll('.time-input').forEach(input => {
    input.addEventListener('input', function() {
        if(this.value.length > 4) {
            this.value = this.value.slice(0,4);
        }
    });
});
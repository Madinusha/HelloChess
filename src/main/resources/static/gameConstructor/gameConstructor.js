window.WebSocketManager = WebSocketManager;
let wsManager = null;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/games/available');
        if (!response.ok) {
            console.error(`Failed to fetch available games: ${response.status}`);
            return;
        }

        const games = await response.json();
        if (Array.isArray(games) && games.length > 0) {
            games.forEach(game => addPlayerRow(game));
        } else {
            console.log('No available games found.');
        }
    } catch (error) {
        console.error('Failed to fetch available games:', error);
    }

    wsManager = new WebSocketManager();
    try {
        await wsManager.connect();
        console.log('WebSocket successfully connected and subscribed.');
    } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
    }
});

document.getElementById('create-game').addEventListener('click', async () => {
    if (!wsManager) {
        console.error('WebSocket is not initialized!');
        return;
    }
    const timeControl = {
        minutes: parseInt(document.querySelector('.time-input:nth-child(1)').value) || 10,
        increment: parseInt(document.querySelector('.time-input:nth-child(3)').value) || 0
    };
    const color = document.querySelector('#choose-color img.selected')?.id.toUpperCase() || 'RANDOM';

    wsManager.stompClient.subscribe('/user/queue/game-created', (message) => {
        const { sessionId } = JSON.parse(message.body);
        console.log(`Successfully created game with session ID: ${sessionId}`);
    });

    // При подключении:
    wsManager.stompClient.subscribe('/user/queue/game-start', (message) => {
        console.log('Game start message received:', message.body);
        const { sessionId } = JSON.parse(message.body);
        window.location.href = `/game?sessionId=${sessionId}`;
    });

    wsManager.stompClient.send(
        "/app/game/create",
        {},
        JSON.stringify({
            playerColor: color,
            timeControl: timeControl
        })
    );
});

function getTimeControl() {
    const [minutes, seconds] = Array.from(document.querySelectorAll('.time-input'))
                                  .map(input => parseInt(input.value) || 0);
    return {minutes, increment: seconds};
}

function getSelectedColor() {
    const selected = document.querySelector('#choose-color img.selected');
    return selected ? selected.id.toUpperCase() : 'RANDOM';
}

function addPlayerRow(player) {
    const tableBody = document.querySelector('.table-body');
    const row = document.createElement('div');
    row.className = 'player-row';
    row.dataset.sessionId = player.sessionId;

    const isMyGame = player.nickname === window.currentUser.nickname;
    if (isMyGame) {
        row.classList.add('my-game-row');
    }

    row.innerHTML = `
        <div class="column nickname">${player.nickname}</div>
        <div class="column rating">${player.rating}</div>
        <div class="column time-control">${player.time}</div>
    `;

    row.addEventListener('click', () => {
        if (!isMyGame) {
            wsManager.joinGame(player.sessionId);
        } else {
            wsManager.removeSession(player.sessionId);
        }

    });

    // Вставляем в начало, если это моя игра
    if (isMyGame) {
        console.log("Моя игра");
        tableBody.insertBefore(row, tableBody.firstChild);
    } else {
        tableBody.appendChild(row);
    }
}

function removePlayerRow(sessionId) {
    const tableBody = document.querySelector('.table-body');
    const row = Array.from(tableBody.children).find(r => r.dataset.sessionId === sessionId);
    if (row) {
        row.remove();
    }
}

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

function displayUserProfileBtn(user) {
    // Пример отображения информации о пользователе
    const profileBox = document.getElementById("profile-box");
    const profileBoxNickname = document.getElementById("profile-box-nickname");
    const profileBoxAvatar = document.getElementById("profile-box-avatar");
    profileBoxNickname.textContent = `${user.nickname}`; // Отображаем имя пользователя
    profileBox.style.display = "flex";

    const login = document.getElementById("login");
    login.style.display = "none";
}
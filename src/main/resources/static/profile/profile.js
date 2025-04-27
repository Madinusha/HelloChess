const mockData = {
    nickname: 'Post-Eggaura',
    email: 'email@gmail.com',
    stats: {
        total: 88,
        wins: 46,
        losses: 30,
        draws: 12
    },
    friends: [
        {nickname: 'Madina', rating: 1524},
        {nickname: 'Kolya', rating: 2183},
        {nickname: 'Malika', rating: 1134},
        {nickname: 'Madina', rating: 1524},
        {nickname: 'Kolya', rating: 2183},
        {nickname: 'Malika', rating: 1134},
        {nickname: 'Madina', rating: 1524},
        {nickname: 'Kolya', rating: 2183},
        {nickname: 'Malika', rating: 1134},
        {nickname: 'Madina', rating: 1524},
        {nickname: 'Kolya', rating: 2183},
        {nickname: 'Malika', rating: 1134},
        {nickname: 'Liliya777', rating: 2158}
    ]
};
const csrfToken = document.querySelector("meta[name='_csrf']")?.content;
const csrfHeader = document.querySelector("meta[name='_csrf_header']")?.content;

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    window.addEventListener('userDataLoaded', (e) => {
        loadProfileData(e.detail);
    });

    // На случай, если данные уже загружены
    if (window.currentUser.nickname) {
        loadProfileData(window.currentUser);
    }
});

async function handleApiError(response, defaultMessage = 'Произошла ошибка') {
    if (!response.ok) {
        try {
            const errorText = await response.text();
            const errorJson = tryParseJson(errorText);

            const message = errorJson?.message
                       || errorJson?.error
                       || errorText
                       || defaultMessage;

            showToast(message, 'error');
            throw new Error(message);
        } catch (e) {
            showToast(defaultMessage, 'error');
            throw new Error(defaultMessage);
        }
    }
}

function tryParseJson(text) {
    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
}

const searchInput1 = document.getElementById('friend-search');
const searchButton1 = document.getElementById('search-button');
const friendsList = document.querySelector('.friends-list');

let allFriends = [];

function searchFriend() {
    const searchTerm = searchInput1.value.trim().toLowerCase();

    if (!searchTerm) {
        // Если поле пустое, показываем всех друзей
        renderFriendsList(allFriends, '.friends-list', 'all');
        return;
    }

    // Фильтруем друзей по нику
    const filteredFriends = allFriends.filter(friend =>
        friend.nickname.toLowerCase().includes(searchTerm)
    );

    // Отображаем результаты
    renderFriendsList(filteredFriends, '.friends-list', 'all');
}

searchButton1.addEventListener('click', searchFriend);

let searchTimeout;
searchInput1.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(searchFriend, 300); // Задержка 300мс
});

function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));

    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.querySelector(`#${tabName}-tab`).classList.add('active');
}

// Загрузка данных профиля
async function loadProfileData() {
    try {

        console.log("window.currentUser: ", window.currentUser);
        // Основная информация
        document.getElementById('profile-nickname').textContent = window.currentUser.nickname;
        document.getElementById('profile-email').textContent = window.currentUser.email;
        const creationDate = await getUserCreationDate(window.currentUser.nickname);
        if (creationDate) {
            document.getElementById('cd-date').textContent = " " + creationDate;
        }
        // Статистика
        document.getElementById('total-games').textContent = mockData.stats.total;
        document.getElementById('wins').textContent = mockData.stats.wins;
        document.getElementById('losses').textContent = mockData.stats.losses;
        document.getElementById('draws').textContent = mockData.stats.draws;

        loadFriendsData('requests');
        loadFriendsData('suggestions');
        loadFriendsData('all');
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
    }
}

async function getUserCreationDate(nickname) {
    try {
        const response = await fetch(`/api/users/${encodeURIComponent(nickname)}/creation-date`);
        if (!response.ok) {
            throw new Error('Пользователь не найден');
        }
        const creationDate = await response.text();
        return creationDate; // Вернет строку в формате "дд.мм.гггг"
    } catch (error) {
        console.error('Ошибка при получении даты создания:', error);
        return null;
    }
}

// Обработчики внутренних вкладок
document.querySelectorAll('.subtab').forEach(tab => {
    tab.addEventListener('click', () => {
        const subtabName = tab.dataset.subtab;

        // Удаляем активные классы
        document.querySelectorAll('.subtab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.subtab-pane').forEach(p => p.classList.remove('active'));

        // Добавляем активные классы
        tab.classList.add('active');
        document.getElementById(`${subtabName}-friends`).classList.add('active');

        // Загружаем соответствующие данные
        loadFriendsData(subtabName);
    });
});

async function loadFriendsData(type) {
    try {
        let endpoint;
        let tabTitle;

        switch(type) {
            case 'all':
                endpoint = '/api/friends';
                tabTitle = 'Все';
                break;
            case 'requests':
                endpoint = '/api/friends/requests';
                tabTitle = 'Входящие';
                break;
            case 'suggestions':
                endpoint = '/api/friends/requests/suggestions';
                tabTitle = 'Исходящие';
                break;
        }

        const response = await fetch(endpoint);
        await handleApiError(response, `Ошибка загрузки ${type}`);

        const data = await response.json();
        if (type === 'all'){
            allFriends = data;
        }

        updateTabTitle(type, tabTitle, data.length);
        renderFriendsList(data, getContainerSelector(type), type);
    } catch (error) {
        console.error(`Ошибка загрузки ${type}:`, error);
        document.querySelector(getContainerSelector(type)).innerHTML = `
            <div class="error-message">Не удалось загрузить данные</div>
        `;
        updateTabTitle(type, type === 'all' ? 'Все' :
                      type === 'requests' ? 'Входящие' : 'Исходящие', 0);
    }
}

function updateTabTitle(type, baseTitle, count) {
    const tabElement = document.querySelector(`.subtab[data-subtab="${type}"]`);
    if (tabElement) {
        if (!tabElement.dataset.originalTitle) {
            tabElement.dataset.originalTitle = baseTitle;
        }
        tabElement.innerHTML = `${tabElement.dataset.originalTitle} <span class="badge">${count}</span>`;
    }
}

function getContainerSelector(type) {
    switch(type) {
        case 'all': return '.friends-list';
        case 'requests': return '.requests-list';
        case 'suggestions': return '.suggestions-list';
    }
}

function renderFriendsList(friends, containerSelector, tabType) {
    const container = document.querySelector(containerSelector);
    container.innerHTML = '';

    if (!friends || friends.length === 0) {
        container.innerHTML = '<div class="no-items">Список пуст</div>';
        return;
    }

    friends.forEach(friend => {
        const row = document.createElement('div');
        row.className = 'player-row';
        row.setAttribute('data-nickname', friend.nickname);
        let actionButtons = '';
        switch(tabType) {
            case 'all':
                actionButtons = `
                    <button class="versus-btn"></button>
                    <button class="remove-friend-btn"></button>
                `;
                break;

            case 'requests':
                actionButtons = `
                    <button class="accept-btn">Принять</button>
                    <button class="decline-btn">Отклонить</button>
                `;
                break;

            case 'suggestions':
                actionButtons = `
                    <button class="cancel-btn">Отменить заявку</button>
                `;
                break;
        }

        row.innerHTML = `
            <div class="nickname">${friend.nickname}</div>
            <div class="rating">${friend.rating}</div>
            <div class="actions">
                ${actionButtons}
            </div>
        `;

        container.appendChild(row);
    });
    setupActionHandlers(containerSelector, tabType);
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

function setupActionHandlers(containerSelector, tabType) {
    const container = document.querySelector(containerSelector);

    container.addEventListener('click', async (e) => {
        const row = e.target.closest('.player-row');
        if (!row) return;

        const nicknameElement = row.querySelector('.nickname');
        const nickname = nicknameElement ? nicknameElement.textContent : null;
        console.log("nickname обработка: ", nickname);
        if (!nickname) {
            console.error('Не удалось определить nickname');
            return;
        }

        try {
            if (e.target.classList.contains('accept-btn')) {
                // Принять запрос в друзья
                await acceptFriendRequest(nickname);
                row.remove();
                showToast('Запрос принят');
            }
            else if (e.target.classList.contains('decline-btn')) {
                // Отклонить запрос в друзья
                await declineFriendRequest(nickname);
                row.remove();
                showToast('Запрос отклонен');
            }
            else if (e.target.classList.contains('remove-friend-btn')) {
                // Удалить из друзей
                if (confirm(`Вы уверены, что хотите удалить ${nickname} из друзей?`)) {
                    await removeFriend(nickname);
                    row.remove();
                    showToast('Друг удален');
                }
            }
            else if (e.target.classList.contains('cancel-btn')) {
                // Отменить свою заявку
                await cancelFriendRequest(nickname);
                row.remove();
                showToast('Заявка отменена');
            }
            else if (e.target.classList.contains('versus-btn')) {
                // Начать игру с другом
                startGameWithFriend(nickname);
            }
        } catch (error) {
            console.error('Ошибка:', error);
            showToast('Произошла ошибка', 'error');
        }
    });
}

async function acceptFriendRequest(nickname) {
    const response = await fetch(`/api/friends/requests/${encodeURIComponent(nickname)}/accept`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            [csrfHeader]: getCsrfToken()
        }
    });
    await handleApiError(response, 'Ошибка при принятии запроса');
    showToast('Запрос принят');
}

async function declineFriendRequest(nickname) {
    const response = await fetch(`/api/friends/requests/${encodeURIComponent(nickname)}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            [csrfHeader]: getCsrfToken()
        }
    });
    await handleApiError(response, 'Ошибка при отклонении запроса');
    showToast('Запрос отклонен');
}

async function removeFriend(nickname) {
    const response = await fetch(`/api/friends/${encodeURIComponent(nickname)}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            [csrfHeader]: getCsrfToken()
        }
    });
    await handleApiError(response, 'Ошибка при удалении друга');
    showToast('Друг удален');
}

async function cancelFriendRequest(nickname) {
    const response = await fetch(`/api/friends/requests/${encodeURIComponent(nickname)}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            [csrfHeader]: getCsrfToken()
        }
    });
    await handleApiError(response, 'Ошибка при отмене заявки');
    showToast('Заявка отменена');
}

function startGameWithFriend(nickname) {
    // Реализация начала игры
    console.log(`Начинаем игру с ${nickname}`);
    // window.location.href = `/game?opponent=${encodeURIComponent(nickname)}`;
}

function getCsrfToken() {
    return csrfToken;
}

function showToast(message, type = 'success') {
    document.querySelectorAll('.toast').forEach(toast => toast.remove());

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-icon">${type === 'error' ? '⚠️' : '✓'}</div>
        <div class="toast-message">${message}</div>
    `;

    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('fade-out'), 2500);
    setTimeout(() => toast.remove(), 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('client-search');
    const searchButton = document.getElementById('client-search-button');
    const clearBtn = document.querySelector('.clear-btn');

    // Создаем контейнер для результатов поиска
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'search-results-container';
    searchInput.parentNode.insertBefore(resultsContainer, searchInput.nextSibling);

    // Обработчик ввода
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        const query = searchInput.value.trim();

        clearBtn.style.opacity = query ? '1' : '0';

        if (query.length >= 2) { // Ищем только при 2+ символах
            searchTimeout = setTimeout(() => searchUsers(query), 300);
        } else {
            hideResults();
        }
    });

    // Обработчик кнопки поиска
    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) searchUsers(query);
    });

    // Обработчик очистки
    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearBtn.style.opacity = '0';
        hideResults();
        searchInput.focus();
    });

    async function searchUsers(query) {
        try {
            const response = await fetch(`/api/friends/search?q=${encodeURIComponent(query)}&limit=5`);
            await handleApiError(response, 'Ошибка поиска пользователей');

            const users = await response.json();
            displayResults(users);
        } catch (error) {
            console.error('Ошибка поиска:', error);
            hideResults();
        }
    }

    function displayResults(users) {
        if (!users || users.length === 0) {
            resultsContainer.innerHTML = '<div class="no-results">Ничего не найдено</div>';
            return;
        }

        resultsContainer.innerHTML = users.map(user => {
            let actionButtons = '';

            // Определяем кнопки в зависимости от статуса
            switch(user.statusDetailed) {
                case 'friend':
                    actionButtons = `
                        <button class="versus-btn"></button>
                        <button class="remove-friend-btn"></button>
                    `;
                    break;

                case 'pending_outgoing':
                    actionButtons = `<button class="cancel-btn">-</button>`;
                    break;

                case 'pending_incoming':
                    actionButtons = `
                        <button class="accept-btn">+</button>
                        <button class="decline-btn">-</button>
                    `;
                    break;

                case 'declined':
                    actionButtons = `<span class="status-text">Запрос отклонен</span>`;
                    break;

                default: // 'none'
                    actionButtons = `<button class="add-friend-btn">+</button>`;
            }

            return `
                <div class="search-result-item" data-nickname="${user.nickname}">
                    <div class="nickname">${user.nickname}</div>
                    <div class="actions">
                        ${actionButtons}
                    </div>
                </div>
            `;
        }).join('');
        resultsContainer.style.display = 'block';

        // Добавляем обработчики для всех типов кнопок
        setupFriendshipActionHandlers();
    }

    function setupFriendshipActionHandlers() {
        // Добавление в друзья
        document.querySelectorAll('.add-friend-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const nickname = e.target.closest('.search-result-item').dataset.nickname;
                e.target.disabled = true;
                await sendFriendRequest(nickname);
                e.target.disabled = false;
            });
        });

        // Отмена исходящего запроса
        document.querySelectorAll('.cancel-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const nickname = e.target.closest('.search-result-item').dataset.nickname;
                e.target.disabled = true;
                await cancelFriendRequest(nickname);
                e.target.disabled = false;
            });
        });

        // Принятие входящего запроса
        document.querySelectorAll('.accept-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const nickname = e.target.closest('.search-result-item').dataset.nickname;
                e.target.disabled = true;
                await acceptFriendRequest(nickname);
                e.target.disabled = false;
            });
        });

        // Отклонение входящего запроса
        document.querySelectorAll('.decline-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const nickname = e.target.closest('.search-result-item').dataset.nickname;
                e.target.disabled = true;
                await declineFriendRequest(nickname);
                e.target.disabled = false;
            });
        });

        // Удаление из друзей
        document.querySelectorAll('.remove-friend-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const nickname = e.target.closest('.search-result-item').dataset.nickname;
                if (confirm(`Вы уверены, что хотите удалить ${nickname} из друзей?`)) {
                    e.target.disabled = true;
                    await removeFriend(nickname);
                    e.target.disabled = false;
                }
            });
        });

        // Кнопка "Играть" (если нужно)
        document.querySelectorAll('.versus-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const nickname = e.target.closest('.search-result-item').dataset.nickname;
                startGameWithFriend(nickname);
            });
        });
    }

    async function sendFriendRequest(nickname) {
        try {
            const response = await fetch(`/api/friends/requests/${encodeURIComponent(nickname)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    [csrfHeader]: getCsrfToken()
                }
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            // После успешного запроса обновляем кнопку
            updateFriendButton(nickname, 'cancel');
            showToast('Запрос отправлен');

            return await response.text();
        } catch (error) {
            console.error('Ошибка при отправке запроса в друзья:', error);
            showToast('Ошибка при отправке запроса', 'error');
            throw error;
        }
    }

    function updateFriendButton(nickname, action) {
        const items = document.querySelectorAll(`.search-result-item[data-nickname="${nickname}"]`);

        items.forEach(item => {
            const actionsDiv = item.querySelector('.actions');
            if (actionsDiv) {
                if (action === 'cancel') {
                    actionsDiv.innerHTML = `
                        <button class="cancel-btn">-</button>
                    `;
                } else if (action === 'add') {
                    actionsDiv.innerHTML = `
                        <button class="add-friend-btn">Добавить</button>
                    `;
                }
            }
        });
    }

    // Скрыть результаты
    function hideResults() {
        resultsContainer.style.display = 'none';
    }

    // Скрывать результаты при клике вне области
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
            hideResults();
        }
    });
});

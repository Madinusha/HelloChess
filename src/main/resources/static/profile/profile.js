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

const profileData = document.getElementById("profile-data");

const nickname = profileData.getAttribute("data-nickname");
const email = profileData.getAttribute("data-email");
const rating = profileData.getAttribute("data-rating");
const creationDate = profileData.getAttribute("data-creation-date");
const statusDetailed = profileData.getAttribute("data-status-detailed");
const isMyProfile = profileData.getAttribute("data-is-my-profile") === "true";
const isAdmin = profileData.getAttribute("data-isAdmin");

const csrfToken = document.querySelector("meta[name='_csrf']")?.content;
const csrfHeader = document.querySelector("meta[name='_csrf_header']")?.content;

document.addEventListener('DOMContentLoaded', () => {
    loadProfileData();
    displayFields();

});


document.addEventListener("DOMContentLoaded", function() {
    const settingsBtn = document.getElementById('settings-button');
    const dropdownNavbar = document.getElementById('dropdown-navbar');

    settingsBtn.addEventListener('click', () => {
        console.log("кликаю на настройки");
        dropdownNavbar.classList.toggle('show');
        settingsBtn.classList.toggle('active');
    });

    document.addEventListener('click', (event) => {
        if (!settingsBtn.contains(event.target) && !dropdownNavbar.contains(event.target)) {
            dropdownNavbar.classList.remove('show');
        }
    });

    if(isAdmin) {
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = 'block';
        });
    }
});

document.getElementById('logout-btn').addEventListener('click', function() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        fetch('/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                [csrfHeader]: csrfToken
            }
        }).then(response => {
            if (response.ok) {
                window.location.href = '/registration';
            }
        });
    }
});

document.getElementById('delete-account-btn').addEventListener('click', function() {
    document.getElementById('confirmDeleteModal').classList.remove('modal-hidden');
});

// Обработчики кнопок модального окна
document.getElementById('cancelDeleteBtn').addEventListener('click', function() {
    document.getElementById('confirmDeleteModal').classList.add('modal-hidden');
});

document.getElementById('confirmDeleteBtn').addEventListener('click', function() {
    const password = document.getElementById('passwordConfirm').value;
    const errorElement = document.getElementById('deleteError');

    if (!password) {
        errorElement.textContent = 'Пожалуйста, введите пароль';
        errorElement.classList.remove('modal-hidden');
        return;
    }

    // Показываем лоадер
    this.disabled = true;
    this.textContent = 'Удаление...';

    // Отправляем запрос
    fetch('/api/users/delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            [csrfHeader]: csrfToken
        },
        body: JSON.stringify({ password: password })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw err; });
        }
        return response;
    })
    .then(data => {
        window.location.href = '/registration';
    })
    .catch(error => {
        errorElement.textContent = error.message || 'Ошибка при удалении аккаунта';
        errorElement.classList.remove('modal-hidden');
        document.getElementById('confirmDeleteBtn').disabled = false;
        document.getElementById('confirmDeleteBtn').textContent = 'Удалить';
    });
});

function loadProfileData() {
    // Статистика
    document.getElementById('total-games').textContent = mockData.stats.total;
    document.getElementById('wins').textContent = mockData.stats.wins;
    document.getElementById('losses').textContent = mockData.stats.losses;
    document.getElementById('draws').textContent = mockData.stats.draws;

    if (isMyProfile) {
        loadFriendsData('requests');
        loadFriendsData('suggestions');
        loadFriendsData('all');
        loadGamesTab();
    }
}

function displayFields(data) {
    if (!isMyProfile) {
        setupFriendActions(nickname);
        const profileEmail = document.getElementById('profile-email');
        if (profileEmail) {
            profileEmail.style.display = 'none';
        }
        // Скрываем вкладку "Друзья"
        const friendsTabButton = document.querySelector('.tabs button[data-tab="friends"]');
        const friendsTabContent = document.getElementById('friends-tab');

        if (friendsTabButton && friendsTabContent) {
            friendsTabButton.style.display = 'none';
            friendsTabContent.style.display = 'none';
        }
    }
}

async function setupFriendActions(nickname) {
    try {
        const response = await fetch(`/api/friends/${nickname}/friendship`, {
            method: 'GET',
            headers: {
                [csrfHeader]: csrfToken
            }
        });
        if (!response.ok) throw new Error('Не удалось получить статус дружбы');

        const statusDetailed = await response.text();

        document.querySelectorAll('#top-actions button').forEach(btn => {
            btn.style.display = 'none';
            btn.onclick = null;
        });

        switch(statusDetailed) {
            case 'friend':
                const versusBtn = document.getElementById('top-versus-btn');
                const removeFriendBtn = document.getElementById('top-remove-friend-btn');
                versusBtn.style.display = 'block';
                versusBtn.onclick = () => startGameWithFriend(nickname);
                removeFriendBtn.style.display = 'block';
                removeFriendBtn.onclick = async () => {
                    if (confirm(`Вы уверены, что хотите удалить ${nickname} из друзей?`)) {
                        await removeFriend(nickname);
                        await setupFriendActions(nickname);
                        showToast('Друг удален');
                    }
                };
                break;
            case 'pending_outgoing':
                const cancelBtn = document.getElementById('top-cancel-btn');
                cancelBtn.style.display = 'block';
                cancelBtn.onclick = async () => {
                    await cancelFriendRequest(nickname);
                    await setupFriendActions(nickname);
                }
                break;
            case 'pending_incoming':
                const acceptBtn = document.getElementById('top-accept-btn');
                const declineBtn = document.getElementById('top-decline-btn');

                acceptBtn.style.display = 'block';
                acceptBtn.onclick = async () => {
                    await acceptFriendRequest(nickname);
                    await setupFriendActions(nickname);
                }

                declineBtn.style.display = 'block';
                declineBtn.onclick = async () => {
                    await declineFriendRequest(nickname);
                    await setupFriendActions(nickname);
                }
                break;
            default: // 'none'
                const addFriendBtn = document.getElementById('top-add-friend-btn');
                addFriendBtn.style.display = 'block';
                addFriendBtn.onclick = async () => {
                    await sendFriendRequest(nickname);
                    await setupFriendActions(nickname);
                }
        }
    } catch (error) {
        console.error('Ошибка при настройке кнопок:', error);
        showToast('Не удалось загрузить статус дружбы', 'error');
    }
}

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
        renderFriendsList(allFriends, '.friends-list', 'all');
        return;
    }
    const filteredFriends = allFriends.filter(friend =>
        friend.nickname.toLowerCase().includes(searchTerm)
    );
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

document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
});
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
    setupRowClickHandler(containerSelector);
}

function setupRowClickHandler(containerSelector) {
    const container = document.querySelector(containerSelector);

    container.addEventListener('click', (event) => {
        if (event.target.closest('.actions button')) {
            return;
        }

        const row = event.target.closest('.player-row');
        if (!row) return;

        const nickname = row.getAttribute('data-nickname');
        console.log("nickname attr ", nickname);

        if (nickname) {
            window.location.href = `/profile?nickname=${encodeURIComponent(nickname)}`;
        }
    });
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
            const response = await fetch(`/api/friends/search?q=${encodeURIComponent(query)}&limit=10`);
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
        setupRowClickHandlerOnSearch();
        resultsContainer.style.display = 'block';

        setupFriendshipActionHandlers();

    }

    function setupRowClickHandlerOnSearch() {
        const resultItems = document.querySelectorAll('.search-result-item');
        resultItems.forEach(item => {
            item.addEventListener('click', (event) => {
                if (event.target.closest('.actions button')) {
                    return;
                }
                const nickname = item.getAttribute('data-nickname');

                if (nickname) {
                    window.location.href = `/profile?nickname=${encodeURIComponent(nickname)}`;
                }
            });
        });
    }

    function setupFriendshipActionHandlers(){
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

    window.sendFriendRequest = async function(nickname) {
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



document.getElementById('add-language-btn').addEventListener('click', function () {
    const container = document.getElementById('languages-container');
    const availableLanguages = window.appData.availableLanguages;
    const languageLevels = window.appData.languageLevels;
    console.log("languageLevels ", languageLevels);
    // Создаем новую строку
    const newGroup = document.createElement('div');
    newGroup.className = 'language-row';

    // Выбор языка
    const languageSelect = document.createElement('select');
    languageSelect.name = 'languages';
    languageSelect.className = 'language-select about-input';
    availableLanguages.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang;
        option.textContent = lang;
        languageSelect.appendChild(option);
    });

    // Выбор уровня
    const levelSelect = document.createElement('select');
    levelSelect.name = 'languageLevels';
    levelSelect.className = 'level-select about-input';
   languageLevels.forEach(level => {
       const option = document.createElement('option');
       option.value = level; // Используем саму строку
       option.textContent = level; // Отображаемая строка
       levelSelect.appendChild(option);
   });


    // Кнопка удаления
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-language-btn';
    removeBtn.textContent = '×';

    container.addEventListener('click', function (event) {
        // Проверяем, что клик был по кнопке удаления
        if (event.target.classList.contains('remove-language-btn')) {
            // Находим ближайшую группу языков и удаляем её
            const languageGroup = event.target.closest('.language-row');
            if (languageGroup) {
                container.removeChild(languageGroup);
            }
        }
    });

    // Добавляем элементы в строку
    newGroup.appendChild(languageSelect);
    newGroup.appendChild(levelSelect);
    newGroup.appendChild(removeBtn);

    // Добавляем строку в контейнер
    container.appendChild(newGroup);
});

// Функция обновления доступных языков
function updateLanguageSelects() {
    const allSelects = document.querySelectorAll('.language-select');
    const allSelectedLanguages = Array.from(allSelects)
        .map(select => select.value)
        .filter(Boolean);

    allSelects.forEach(select => {
        const currentValue = select.value;
        Array.from(select.options).forEach(option => {
            if (option.value === '') return;

            option.disabled = allSelectedLanguages.includes(option.value) &&
                            option.value !== currentValue;
        });
    });

    // Показываем/скрываем кнопку добавления
    const addBtn = document.getElementById('add-language-btn');
    const allLanguages = ['Русский', 'Английский', 'Немецкий', 'Французский', 'Испанский'];
    addBtn.disabled = allSelectedLanguages.length >= allLanguages.length;
}

function getSelectedLanguages() {
    return Array.from(document.querySelectorAll('.language-select'))
        .map(select => ({
            language: select.value,
            level: select.value ?
                select.closest('.language-row').querySelector('.level-select').value :
                null
        }))
        .filter(item => item.language); // Фильтруем пустые значения
}

const editButton = document.getElementById('top-edit-button');
const cancelButton = document.getElementById('cancel-edit-btn');
const profileForm = document.getElementById('profile-form');

// Обработчик кнопки "Редактировать"
editButton.addEventListener('click', function() {

    // 2. Переключаем видимость блоков
    document.getElementById('about-view-mode').style.display = 'none';
    document.getElementById('about-edit-mode').style.display = 'block';
    editButton.style.display = 'none'; // Скрываем кнопку редактирования
});

// Обработчик кнопки "Отмена"
cancelButton.addEventListener('click', function() {
    // Возвращаемся в режим просмотра
    document.getElementById('about-view-mode').style.display = 'block';
    document.getElementById('about-edit-mode').style.display = 'none';
    editButton.style.display = 'block'; // Показываем кнопку редактирования
});

// Автоматическое добавление @ для Telegram
document.getElementById('edit-telegram').addEventListener('input', function(e) {
    if (!this.value.startsWith('@') && this.value.length > 0) {
        this.value = '@' + this.value.replace(/^@/, '');
    }
});


document.getElementById('edit-vk').addEventListener('input', function(e) {
    this.value = this.value.replace(/@/g, '').toLowerCase();
});

// Добавляем tooltips
document.querySelector('.telegram-icon').setAttribute('data-tooltip', 'Введите ваш @username в Telegram');
document.querySelector('.vk-icon').setAttribute('data-tooltip', 'Введите ваш ник Vk без @, только буквы/цифры');

// Обновление режима просмотра при редактировании
function updateViewMode() {
    // Для пола
    const genderSelect = document.getElementById('edit-gender');
    document.getElementById('gender-view').textContent =
        genderSelect.value === 'female' ? 'Женский' :
        genderSelect.value === 'male' ? 'Мужской' : 'Не указан';

    // Для даты рождения
    const birthdateInput = document.getElementById('edit-birthdate');
    document.getElementById('birthdate-view').textContent =
        birthdateInput.value || 'Не указана';
}


const mockGameData = [
    {
        id: 1,
        type: "Классика",
        timeControl: "30 + 20",
        opponentNickname: "prosto_erik",
        game_src: "/static/images/game2.png",
        opponentRating: 1654,
        isFinished: false,
        date: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 минут назад
    },
    {
        id: 2,
        type: "Классика",
        timeControl: "15 + 0",
        game_src: "/static/images/game4.png",
        opponentNickname: "sonya",
        opponentRating: 1432,
        result: "Победа",
        isFinished: true,
        date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 часа назад
    },
    {
        id: 3,
        type: "Рапид",
        timeControl: "10 + 3",
        game_src: "/static/images/game3.png",
        opponentNickname: "fed_ya",
        opponentRating: 1203,
        result: "Поражение",
        isFinished: true,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 день назад
    },
    {
        id: 4,
        type: "Блиц",
        timeControl: "3 + 2",
        game_src: "/static/images/game1.png",
        opponentNickname: "chessmaster34",
        opponentRating: 1570,
        result: "Ничья",
        isFinished: true,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 дня назад
    }
];

function createGameElement(game) {
    const gameEl = document.createElement("div");
    gameEl.className = "game-item";

    // Формируем время партии
    const game_src = game.game_src || "/static/images/game3.png";
    const timeControl = game.timeControl || "10 + 2";
    const opponentNick = game.opponentNickname || "Гость";
    const opponentRating = game.opponentRating || "1203";
    const dateAgo = formatTimeAgo(game.date);
    const gameType = game.type || "Классика";
    const resultText = game.isFinished ? game.result : "Активная партия";
    let resultClass = "";

    switch (resultText) {
        case "Победа":
            resultClass = "result-win";
            break;
        case "Поражение":
            resultClass = "result-loss";
            break;
        case "Ничья":
            resultClass = "result-draw";
            break;
        default:
            resultClass = "result-active";
    }

    gameEl.innerHTML = `
        <div class="game-left">
            <!-- Изображение доски -->
            <img src=${game_src} alt="Доска" class="game-board-img" />
        </div>
        <div class="game-right">
            <div class="game-top">
                ${timeControl} • ${gameType}
            </div>
            <div class="game-middle">
                <div class="game-player">
                    <span>${nickname}</span>
                    <span class="game-rating">${rating}</span>
                </div>
                <div class="game-versus">
                    <button class="versus-btn"></button>
                </div>
                <div class="game-opponent">
                    <span>${opponentNick}</span>
                    <span class="game-rating">${opponentRating}</span>
                </div>
            </div>
           <div class="game-bottom">
               <div class="game-result ${resultClass}">${resultText}</div>
               <div class="game-timestamp">${dateAgo}</div>
           </div>
        </div>
    `;

    // При клике можно добавить переход к партии
    gameEl.addEventListener("click", () => {
        alert(`Переход к партии с ${opponentNick}`);
    });

    return gameEl;
}

function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "только что";
    if (diffMins < 60) return `${diffMins} мин назад`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} ч назад`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} дн. назад`;
}

function loadGamesTab() {
    const gamesContainer = document.querySelector("#games-tab .games-history");
    if (!gamesContainer) return;

    gamesContainer.innerHTML = ""; // Очищаем предыдущее содержимое

    mockGameData.forEach(game => {
        const gameElement = createGameElement(game);
        gamesContainer.appendChild(gameElement);
    });
}
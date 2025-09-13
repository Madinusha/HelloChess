document.addEventListener('DOMContentLoaded', function() {
    const mockUsers = [
        { id: 1, username: 'Petya', banned: false, isAdmin: false, banDuration: 0 },
        { id: 2, username: 'fed_ya', banned: false, isAdmin: false, banDuration: 0 },
        { id: 3, username: '1_bad_guy', banned: true, isAdmin: false, banDuration: 1440 },
        { id: 4, username: 'sorry_not_sorry', banned: false, isAdmin: false, banDuration: 0 },
        { id: 5, username: 'devil666', banned: true, isAdmin: false, banDuration: 10080 },
        { id: 6, username: 'madi', banned: false, isAdmin: true, banDuration: 0 },
        { id: 7, username: 'Bull_Digga', banned: false, isAdmin: true, banDuration: 0 },
        { id: 8, username: 'fantom', banned: false, isAdmin: true, banDuration: 0 }
    ];

    const mockReports = [
        {
            id: 1,
            type: 'message',
            targetUser: 'dontWorry',
            message: 'Сообщение, нарушающее правила сообщества',
            count: 7
        },
        {
            id: 2,
            type: 'account',
            targetUser: 'fed_ya',
            message: 'Аккаунт, нарушающий правила сообщества',
            count: 5
        },
        {
            id: 3,
            type: 'message',
            targetUser: 'sorry_not_sorry',
            message: 'Оскорбительное сообщение',
            count: 3
        }
    ];

    const csrfToken = document.querySelector("meta[name='_csrf']")?.content;
    const csrfHeader = document.querySelector("meta[name='_csrf_header']")?.content;

    let bannedUsers = [];
    let admins = [];
    let reports = [];

    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', function () {
            const target = this.dataset.tab;

            // Удаляем активный класс у всех кнопок и панелей
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));

            // Добавляем активный класс нужной вкладке и кнопке
            this.classList.add('active');
            document.getElementById(target).classList.add('active');
        });
    });

    // По умолчанию загружаем админов и жалобы
    loadAdmins();
    loadBannedUsers();
    loadReports();

    // Инициализация поиска и фильтрации
    initSearch();
    initFilters();

    function initSearch() {
        // Можно оставить пустой, если не используется
    }
    function initFilters() {
        // Можно оставить пустой, если не используется
    }

    async function loadBannedUsers() {
        try {
            const response = await fetch('/api/admin/banned', {
                headers: {
                    'X-CSRF-TOKEN': csrfToken
                }
            });
            if (response.ok) {
                bannedUsers = await response.json();
                renderBannedUsers();
                renderSearchResults(bannedUsers.filter(u => !u.isBanned));
            }
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }

    async function loadReports() {
        try {
            const response = await fetch('/api/reports', {
                headers: {
                    'X-CSRF-TOKEN': csrfToken
                }
            });
            if (response.ok) {
                const data = await response.json();
                reports = data.content || [];
                renderReports('all');
            } else {
                console.error('Server responded with status:', response.status);
                reports = [];
                renderReports('all');
            }
        } catch (error) {
            console.error('Error loading reports:', error);
        }
    }

    async function loadAdmins() {
        try {
            const response = await fetch('/api/admin/admins', {
                headers: {
                    'X-CSRF-TOKEN': csrfToken
                }
            });
            if (response.ok) {
                admins = await response.json();
                renderAdmins(admins);
            }
        } catch (error) {
            console.error('Error loading admins:', error);
        }
    }

    // Поиск пользователей
    document.getElementById('search-btn').addEventListener('click', function() {
        const searchTerm = document.getElementById('user-search').value.toLowerCase();
        const results = admins.filter(user =>
            user.username.toLowerCase().includes(searchTerm) && !user.banned
        );
        renderSearchResults(results);
    });

    // Фильтрация жалоб
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            renderReports(this.dataset.type);
        });
    });

    document.getElementById('search-admin-btn').addEventListener('click', function() {
        const searchTerm = document.getElementById('admin-search').value.toLowerCase();
        const results = admins.filter(user =>
            user.username.toLowerCase().includes(searchTerm)
        );
        renderAdminSearchResults(results);
    });

    // Функции рендеринга
   function renderSearchResults(users) {
       const container = document.getElementById('users-list');
       container.innerHTML = '';
       if (users.length === 0) return;

       users.forEach(user => {
           const userEl = document.createElement('div');
           userEl.className = 'user-item';
           userEl.innerHTML = `
               <span>${user.username}</span>
               <div class="user-actions">
                   <button class="action-btn ban-btn" data-id="${user.id}">Бан</button>
               </div>
           `;
           container.appendChild(userEl);
       });

       addBanHandlers();
       addAdminHandlers();
   }

    function renderBannedUsers() {
        const container = document.getElementById('banned-list');
        container.innerHTML = '';

//        const bannedUsers = mockUsers.filter(user => user.banned);

        if (bannedUsers.length === 0) {
            container.innerHTML = '<p>Нет забаненных пользователей</p>';
            return;
        }

        bannedUsers.forEach(user => {
            const userEl = document.createElement('div');
            userEl.className = 'user-item';
            userEl.innerHTML = `
                <span>${user.username}</span>
                <button class="action-btn unban-btn" data-id="${user.id}">Разбанить</button>
            `;
            container.appendChild(userEl);
        });

        // Обработчики для кнопок
        addUnbanHandlers();
    }

    function renderReports(filterType) {
        const container = document.getElementById('reports-list');
        container.innerHTML = '';

        let filteredReports = reports;
        if (filterType !== 'all') {
            filteredReports = reports.filter(report => report.type === filterType);
        }

        if (filteredReports.length === 0) {
            container.innerHTML = '<p class="no-reports">Нет жалоб</p>';
            return;
        }

        filteredReports.forEach(report => {
            const reportEl = document.createElement('div');
            reportEl.className = 'report-item';

            reportEl.innerHTML = `
                <div class="report-header">
                    <div class="report-user">
                        <span class="report-username">${report.reporterUsername}</span>
                        <span class="report-count">${report.count}</span>
                    </div>
                    <div class="report-actions-wrapper">
                        <button class="action-btn resolve-btn" data-id="${report.id}">Решить</button>
                        <button class="action-btn ban-btn" data-id="${report.targetUser}">Бан</button>
                        <span class="report-expand">▼</span>
                    </div>
                </div>
                <div class="report-content">
                    ${report.type === 'MESSAGE'
                        ? `<div class="report-message">${report.message}</div>`
                        : `<div class="report-profile-notice">Жалоба на профиль</div>
                           <a href="/profile/${report.targetUser}" class="report-profile-link">Перейти к профилю →</a>`}
                </div>
            `;

            container.appendChild(reportEl);

            // Обработчик раскрытия/закрытия
            const header = reportEl.querySelector('.report-header');
            const content = reportEl.querySelector('.report-content');
            const expandIcon = reportEl.querySelector('.report-expand');

            header.addEventListener('click', function(e) {
                // Игнорируем клики по кнопкам
                if (e.target.classList.contains('action-btn')) return;

                content.classList.toggle('show');
                expandIcon.classList.toggle('rotated');
            });
        });

        // Обработчики для кнопок
        addBanHandlers();
        addResolveHandlers();
    }

    function renderAdmins() {
        const container = document.getElementById('admins-list');
        container.innerHTML = '';

//        const admins = mockUsers.filter(user => user.isAdmin);

        if (admins.length === 0) {
            container.innerHTML = '<p>Нет администраторов</p>';
            return;
        }

        admins.forEach(user => {
            const adminEl = document.createElement('div');
            adminEl.className = 'admin-item';
            adminEl.innerHTML = `
                <div class="admin-header">
                    <span>${user.nickname}</span>
                    <div class="admin-actions">
                        <button class="action-btn remove-admin-btn" data-id="${user.id}">Убрать</button>
                    </div>
                </div>
            `;
            container.appendChild(adminEl);
        });

        // Обработчики для кнопок
        addRemoveAdminHandlers();
    }

    // Обработчики действий
    function addBanHandlers() {
        const modal = document.getElementById('ban-modal');
        const banUsername = document.getElementById('ban-username');
        const banTime = document.getElementById('ban-time');
        const confirmBan = document.getElementById('confirm-ban');
        const cancelBan = document.getElementById('cancel-ban');
        const closeModal = document.querySelector('.close-modal');

        let currentUserToBan = null;

        // Обработчики закрытия модального окна
        closeModal.addEventListener('click', () => modal.style.display = 'none');
        cancelBan.addEventListener('click', () => modal.style.display = 'none');
        window.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });

        document.querySelectorAll('.ban-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                currentUserToBan = this.dataset.id;
                const user = mockUsers.find(u => u.username === currentUserToBan || u.id == currentUserToBan);

                if (!user) return;

                banUsername.textContent = user.username;
                modal.style.display = 'block';
            });
        });

        // Обработчик подтверждения бана
        confirmBan.addEventListener('click', async function() {
            if (!currentUserToBan) return;

            const duration = parseInt(banTime.value);
            let durationText = '';

            switch(duration) {
                case 5: durationText = '5 минут'; break;
                case 30: durationText = '30 минут'; break;
                case 60: durationText = '1 час'; break;
                case 240: durationText = '4 часа'; break;
                case 1440: durationText = '1 день'; break;
                case 10080: durationText = '1 неделю'; break;
                default: durationText = 'навсегда';
            }

            const user = mockUsers.find(u => u.username === currentUserToBan || u.id == currentUserToBan);
            if (confirm(`Подтверждаете бан пользователя ${user.username} на ${durationText}?`)) {
                const actionDTO = {
                    userId: user.id,
                    action: "ban",
                    banDuration: duration, // выбранное время
                    banReason: "Нарушение правил сообщества" // можно добавить поле для ввода причины
                };

                try {
                    const response = await fetch('/api/admin/actions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': csrfToken
                        },
                        body: JSON.stringify(actionDTO)
                    });

                    if (response.ok) {
                        user.banned = true;
                        alert(`Пользователь ${user.username} забанен на ${durationText}`);
                        renderBannedUsers();
                        modal.style.display = 'none';
                    } else {
                        alert('Ошибка при выполнении действия');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('Ошибка сети');
                }
            }
        });
    }

    function addUnbanHandlers() {
        document.querySelectorAll('.unban-btn').forEach(btn => {
            btn.addEventListener('click', async function(e) {
                e.stopPropagation();
                const userId = this.dataset.id;
                const user = mockUsers.find(u => u.id == userId);

                if (confirm(`Разбанить пользователя ${user.username}?`)) {
                    const actionDTO = {
                        userId: userId,
                        action: "unban"
                    };

                    try {
                        const response = await fetch('/api/admin/actions', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': csrfToken
                            },
                            body: JSON.stringify(actionDTO)
                        });

                        if (response.ok) {
                            alert(`Пользователь ${user.username} разбанен`);
                            // Обновляем интерфейс
                            user.banned = false;
                            renderBannedUsers();
                        } else {
                            const error = await response.text();
                            alert(`Ошибка: ${error}`);
                        }
                    } catch (error) {
                        console.error('Error:', error);
                        alert('Ошибка сети');
                    }
                }
            });
        });
    }

    function addAdminHandlers() {
        document.querySelectorAll('.admin-btn').forEach(btn => {
            btn.addEventListener('click', async function(e) {
                e.stopPropagation();
                const userId = this.dataset.id;
                const user = mockUsers.find(u => u.id == userId);

                if (confirm(`Назначить пользователя ${user.username} администратором?`)) {
                    const actionDTO = {
                        userId: userId,
                        action: "make_admin"
                    };

                    try {
                        const response = await fetch('/api/admin/actions', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': csrfToken
                            },
                            body: JSON.stringify(actionDTO)
                        });

                        if (response.ok) {
                            alert(`Пользователь ${user.username} теперь администратор`);
                            // Обновляем интерфейс
                            user.isAdmin = true;
                            renderAdmins();
                            renderAdminSearchResults(mockUsers.filter(u =>
                                u.username.toLowerCase().includes(
                                    document.getElementById('admin-search').value.toLowerCase()
                                )
                            ));
                        } else {
                            const error = await response.text();
                            alert(`Ошибка: ${error}`);
                        }
                    } catch (error) {
                        console.error('Error:', error);
                        alert('Ошибка сети');
                    }
                }
            });
        });
    }

    function addResolveHandlers() {
        document.querySelectorAll('.resolve-btn').forEach(btn => {
            btn.addEventListener('click', async function(e) {
                e.stopPropagation();
                const reportId = this.dataset.id;

                if (confirm(`Пометить жалобу #${reportId} как решенную?`)) {
                    try {
                        const response = await fetch(`/api/reports/${reportId}/resolve`, {
                            method: 'POST',
                            headers: {
                                'X-CSRF-TOKEN': csrfToken
                            }
                        });

                        if (response.ok) {
                            alert(`Жалоба #${reportId} помечена как решенная`);
                            // Обновляем интерфейс
                            mockReports = mockReports.filter(r => r.id != reportId);
                            renderReports(document.querySelector('.filter-btn.active').dataset.type);
                        } else {
                            const error = await response.text();
                            alert(`Ошибка: ${error}`);
                        }
                    } catch (error) {
                        console.error('Error:', error);
                        alert('Ошибка сети');
                    }
                }
            });
        });
    }

    // Функция рендеринга списка администраторов
    function renderAdmins2() {
        const container = document.getElementById('admins-list');
        container.innerHTML = '';

        const admins = mockUsers.filter(user => user.isAdmin);

        if (admins.length === 0) {
            container.innerHTML = '<p>Нет администраторов</p>';
            return;
        }

        admins.forEach(user => {
            const adminEl = document.createElement('div');
            adminEl.className = 'admin-item';
            adminEl.innerHTML = `
                <span>${user.username}</span>
                <div class="user-actions">
                    <button class="action-btn remove-admin-btn" data-id="${user.id}">Забрать права</button>
                </div>
            `;
            container.appendChild(adminEl);
        });

        addRemoveAdminHandlers();
        addBanHandlers();
    }

    function renderAdminSearchResults(users) {
        const container = document.getElementById('admins-found-list');
        container.innerHTML = '';
        if (users.length === 0) return;

        users.forEach(user => {
            const userEl = document.createElement('div');
            userEl.className = 'user-item';
            userEl.innerHTML = `
                <span>${user.username}</span>
                <div class="user-actions">
                    ${user.isAdmin ? '<button class="action-btn remove-admin-btn" data-id="${user.id}">Забрать права</button>' : '<button class="action-btn admin-btn" data-id="${user.id}">Назначить</button>'}
                </div>
            `;
            container.appendChild(userEl);
        });

        addAdminHandlers();
        addRemoveAdminHandlers();
    }

    // Функция рендеринга результатов поиска администраторов
//    function renderAdminSearchResults(users) {
//        const container = document.getElementById('admins-found-list');
//        container.innerHTML = '';
//
//        if (users.length === 0) {
//            container.innerHTML = '<p>Администраторы не найдены</p>';
//            return;
//        }
//
//        users.forEach(user => {
//            const userEl = document.createElement('div');
//            userEl.className = 'user-item';
//            userEl.innerHTML = `
//                <span>${user.username}</span>
//                <div class="user-actions">
//                    ${user.isAdmin
//                        ? '<button class="action-btn remove-admin-btn" data-id="${user.id}">Забрать права</button>'
//                        : '<button class="action-btn admin-btn" data-id="${user.id}">Назначить</button>'}
//                </div>
//            `;
//            container.appendChild(userEl);
//        });
//
//        addAdminHandlers();
//        addRemoveAdminHandlers();
//        addBanHandlers();
//    }

    // Обработчик для кнопки "Убрать админство"
    function addRemoveAdminHandlers() {
        document.querySelectorAll('.remove-admin-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const userId = this.dataset.id;
                const user = mockUsers.find(u => u.id == userId);
                if (confirm(`Убрать права администратора у ${user.username}?`)) {
                    // Здесь будет запрос на сервер
                    user.isAdmin = false;
                    alert(`Пользователь ${user.username} больше не администратор`);
                    renderAdmins();
                    renderAdminSearchResults(mockUsers.filter(u =>
                        u.username.toLowerCase().includes(
                            document.getElementById('admin-search').value.toLowerCase()
                        )
                    ));
                }
            });
        });
    }
});
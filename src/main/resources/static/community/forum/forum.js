window.showTopicModal = function(action, topicId, event, title) {
    if (event) event.stopPropagation();
    const modal = document.getElementById('topicModal');

     if (!modal) {
        console.error("Элемент modal не найден!");
        return;
    }
    const modalTitle = document.getElementById('modalTitle');

    document.getElementById('topicType').value = action;
    document.getElementById('topicId').value = topicId || '';

    if (action === 'create') {
        modalTitle.textContent = title;
        document.getElementById('topicName').value = '';
        document.getElementById('topicDescription').value = '';

        console.log("action === 'create'");
    } else if (action === 'edit') {
        modalTitle.textContent = 'Редактировать тему';
        // Здесь должна быть загрузка данных темы
        console.log("action === 'edit'");
    }

    modal.classList.remove('hidden');
    console.log("Класс hidden удалён, modal должен быть виден");
};

window.goBackToMainTopics = function() {
    const mainTopics = document.querySelector('.main-topics-container');
    const subtopicsContainer = document.querySelector('.subtopics-container');

    // Анимация ухода подтем
    subtopicsContainer.classList.remove('slide-in');
    subtopicsContainer.classList.add('slide-out');

    setTimeout(() => {
        subtopicsContainer.classList.add('hidden');

        // Показываем основные темы и запускаем анимацию появления
        mainTopics.classList.remove('hidden');
        setTimeout(() => {
            mainTopics.classList.remove('slide-out');
            mainTopics.classList.add('slide-in');
        }, 20);
    }, 100); // Ждем завершения анимации ухода
};


window.showDeleteModal = function(topicId, topicName, subtopicsCount, messagesCount, event) {
    if (event) event.stopPropagation();

    const modal = document.getElementById('confirmModal');
    document.getElementById('topicNameToDelete').textContent = "\"" + topicName + "\"";
    document.getElementById('subtopicsCount').textContent = subtopicsCount;
    document.getElementById('messagesCount').textContent = messagesCount;
    modal.dataset.topicId = topicId;
    modal.classList.remove('hidden');
};

window.closeModal = function() {
    document.getElementById('topicModal').classList.add('hidden');
    document.getElementById('confirmModal').classList.add('hidden');
};

window.deleteTopic = function() {
    const modal = document.getElementById('confirmModal');
    const topicId = modal.dataset.topicId;

    // Здесь должна быть логика удаления темы (AJAX запрос)
    console.log(`Deleting topic: ${topicId}`);

    closeModal();
    // Перезагрузить список тем
};


document.addEventListener('DOMContentLoaded', function() {
    const profileData = document.getElementById("profile-data");
    const isAdmin = profileData.dataset.isadmin === 'true';
    // Mock data for main topics
    const mainTopics = [
        {
            id: 1,
            title: "Шахматные стратегии",
            description: "Обсуждаем вариации стратегий и эндшпили",
            topicsCount: 24,
            messagesCount: 356,
            lastMessage: "2 часа назад"
        },
        {
            id: 2,
            title: "Отзывы и предложения",
            description: "Что можно улучшить в игре или форуме?",
            topicsCount: 12,
            messagesCount: 143,
            lastMessage: "1 нед. назад"
        },
        {
            id: 3,
            title: "Шахматные задачи",
            description: "Обсудите задачи и их гениальные решения",
            topicsCount: 32,
            messagesCount: 478,
            lastMessage: "3 часа назад"
        },
        {
            id: 4,
            title: "Помощь новым игрокам",
            description: "Спрашивайте и отвечайте на вопросы о платформе",
            topicsCount: 15,
            messagesCount: 189,
            lastMessage: "5 дней назад"
        },
        {
            id: 5,
            title: "Обсуждение турниров",
            description: "Чем закончился турнир и что вы об этом думаете",
            topicsCount: 18,
            messagesCount: 215,
            lastMessage: "1 день назад"
        }
    ];

    // Mock data for subtopics
    const subtopicsData = {
        1: [
            {
                title: "Вариации шахматного мата",
                replies: 42,
                lastReply: "1 час назад"
            },
            {
                title: "Стратегии королевского гамбита",
                replies: 35,
                lastReply: "3 часа назад"
            },
            {
                title: "Техники эндшпилей",
                replies: 28,
                lastReply: "Вчера"
            }
        ],
        2: [
            {
                title: "Процесс игры",
                replies: 56,
                lastReply: "5 часов назад"
            },
            {
                title: "Страница профиля",
                replies: 22,
                lastReply: "2 дня назад"
            }
        ],
        3: [
            {
                title: "World Championship 2023",
                replies: 56,
                lastReply: "5 часов назад"
            },
            {
                title: "Объявления результатов мирового чемпионата",
                replies: 22,
                lastReply: "2 дня назад"
            }
        ],
        4: [
            {
                title: "Ежедневный челлендж решения задач",
                replies: 78,
                lastReply: "Сегодня"
            },
            {
                title: "Мат в 3 хода",
                replies: 45,
                lastReply: "Вчера"
            }
        ]
    };

    loadMainTopics();

    document.getElementById('topicForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveTopic();
    });

    document.getElementById('createMainTopicBtn')?.addEventListener('click', () => {
        showTopicModal('create', null, null, "Создать новую тему");
    });

    document.querySelector('.create-topic-button')?.addEventListener('click', () => {
        showTopicModal('create', null, null, "Создать новый топик");
    });

    document.querySelector('.back-button')?.addEventListener('click', goBackToMainTopics);

    function showSubtopics(topicId, topicTitle) {
        const mainTopics = document.querySelector('.main-topics-container');
        const subtopicsContainer = document.querySelector('.subtopics-container');

        // Анимация ухода основных тем
        mainTopics.classList.add('slide-out');

        setTimeout(() => {
            mainTopics.classList.add('hidden');

            // Установка заголовка и загрузка подтем
            document.querySelector('.subtopic-title').textContent = topicTitle;
            const subtopicsList = document.querySelector('.subtopics-list');
            subtopicsList.innerHTML = '';

            if (subtopicsData[topicId]) {
                subtopicsData[topicId].forEach(subtopic => {
                    const subtopicElement = document.createElement('div');
                    subtopicElement.className = 'subtopic-item';

                    subtopicElement.innerHTML = `
                        <div class="subtopic-name">${subtopic.title}</div>
                        <div class="subtopic-stats">
                            <div class="subtopic-stat">
                                <div class="subtopic-stat-value">${subtopic.replies}</div>
                                <div class="subtopic-stat-label">Ответов</div>
                            </div>
                            <div class="subtopic-stat">
                                <div class="subtopic-stat-value">${subtopic.lastReply}</div>
                                <div class="subtopic-stat-label">Последнее</div>
                            </div>
                        </div>
                    `;

                     subtopicElement.addEventListener('click', function () {
                         window.openChat(topicId, true);
                     });

                    subtopicsList.appendChild(subtopicElement);
                });
            } else {
                subtopicsList.innerHTML = '<p>Нет подтем в этой категории</p>';
            }

            // Показываем контейнер подтем и запускаем анимацию появления
            subtopicsContainer.classList.remove('hidden');
            setTimeout(() => {
                subtopicsContainer.classList.add('slide-in');
            }, 20);
        }, 100);
    }

    const searchButton = document.querySelector('.search-button');
    const searchInput = document.querySelector('.search-input');
    const mainTopicsContainer = document.querySelector('.main-topics-container');
    const subtopicsContainer = document.querySelector('.subtopics-container');

    // Обработчики событий
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('input', handleSearchInput);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') performSearch();
    });

    // Таймер для debounce
    let searchTimer;

    function handleSearchInput() {
        // Очищаем предыдущий таймер
        clearTimeout(searchTimer);

        // Если введено меньше 3 символов - очищаем результаты
        if (searchInput.value.trim().length < 3) {
            if (searchInput.value.trim() === '') {
                mainTopicsContainer.innerHTML = '';
                loadMainTopics(); // Возвращаем обычный список тем
            }
            return;
        }

        // Устанавливаем новый таймер для поиска через 500мс после последнего ввода
        searchTimer = setTimeout(performSearch, 500);
    }

    function performSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();

        // Если меньше 3 символов - не выполняем поиск
        if (searchTerm.length < 3) {
            if (searchTerm === '') {
                loadMainTopics();
            }
            return;
        }

        // Ищем в основных темах
        const foundMainTopics = mainTopics.filter(topic =>
            topic.title.toLowerCase().includes(searchTerm) ||
            topic.description.toLowerCase().includes(searchTerm)
        );

        // Ищем в подтемах
        const foundSubtopics = [];
        Object.entries(subtopicsData).forEach(([topicId, subtopics]) => {
            subtopics.forEach(subtopic => {
                if (subtopic.title.toLowerCase().includes(searchTerm)) {
                    const mainTopic = mainTopics.find(t => t.id == topicId);
                    foundSubtopics.push({
                        ...subtopic,
                        mainTopicId: topicId,
                        mainTopicTitle: mainTopic?.title || 'Неизвестная тема'
                    });
                }
            });
        });

        displaySearchResults(foundMainTopics, foundSubtopics);
    }

    function escapeSingleQuotes(str) {
        return str.replace(/'/g, "\\'");
    }

    function displaySearchResults(mainTopicsResults, subtopicsResults) {
        // Очищаем контейнеры
        mainTopicsContainer.innerHTML = '';
        subtopicsContainer.classList.add('hidden');

        if (mainTopicsResults.length === 0 && subtopicsResults.length === 0) {
            mainTopicsContainer.innerHTML = '<div class="no-results">Ничего не найдено</div>';
            return;
        }

        // Отображаем найденные основные темы
        if (mainTopicsResults.length > 0) {
            const title = document.createElement('h2');
            title.textContent = 'Найденные темы';
            mainTopicsContainer.appendChild(title);

            mainTopicsResults.forEach(topic => {
                const topicElement = createTopicElement(topic);
                mainTopicsContainer.appendChild(topicElement);
            });
        }

        // Отображаем найденные подтемы
        if (subtopicsResults.length > 0) {
            const title = document.createElement('h2');
            title.textContent = 'Найденные подтемы';
            mainTopicsContainer.appendChild(title);

            subtopicsResults.forEach(subtopic => {
                const subtopicElement = document.createElement('div');
                subtopicElement.className = 'subtopic-search-result';
                subtopicElement.innerHTML = `
                    <div class="search-result-info">
                        <div class="subtopic-title">${subtopic.title}</div>
                        <div class="main-topic-link">В теме: ${subtopic.mainTopicTitle}</div>
                    </div>
                    <button class="go-to-topic" data-topic-id="${subtopic.mainTopicId}">Перейти</button>
                `;

                subtopicElement.querySelector('.go-to-topic').addEventListener('click', function() {
                    showSubtopics(subtopic.mainTopicId, subtopic.mainTopicTitle);
                });

                mainTopicsContainer.appendChild(subtopicElement);
            });
        }
    }

    window.openChat = function(topicId, isSubtopic = false) {
        console.log(`Переход в чат ${isSubtopic ? 'подтемы' : 'темы'} с ID: ${topicId}`);
        // Здесь будет реальная логика перехода в чат
        window.location.href = `/discussion`;
    };

    function highlightMatches(text, term) {
        const regex = new RegExp(`(${term})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    }

    function createTopicElement(topic) {
        const topicElement = document.createElement('div');
        topicElement.className = 'topic-card';
        topicElement.dataset.topicId = topic.id;

        let adminActions = '';
        if (isAdmin) {
            adminActions = `
                <div class="topic-actions">
                    <button class="topic-action edit" onclick="showTopicModal('edit', ${topic.id}, event, 'Редактировать тему')"></button>
                    <button class="topic-action delete" onclick="showDeleteModal(${topic.id}, '${escapeSingleQuotes(topic.title)}', ${topic.topicsCount}, ${topic.messagesCount}, event)"></button>
                </div>
            `;
        }

        topicElement.innerHTML = `
            <div class="topic-info">
                <div class="topic-title">${topic.title}</div>
                <p class="topic-description">${topic.description}</p>
            </div>
            <div class="topic-stats">
                <div class="stat">
                    <div class="stat-value">${topic.topicsCount}</div>
                    <div class="stat-label">Темы</div>
                </div>
                <div class="stat">
                    <div class="stat-value">${topic.messagesCount}</div>
                    <div class="stat-label">Сообщения</div>
                </div>
                <div class="stat">
                    <div class="stat-value">${topic.lastMessage}</div>
                    <div class="stat-label">Последнее</div>
                </div>
                ${adminActions}
            </div>
        `;

        topicElement.addEventListener('click', (e) => {
            if (!e.target.closest('.topic-actions')) {
                showSubtopics(topic.id, topic.title);
            }
        });

        return topicElement;
    }


    function saveTopic() {
        const action = document.getElementById('topicType').value;
        const topicId = document.getElementById('topicId').value;
        const topicName = document.getElementById('topicName').value;
        const topicDescription = document.getElementById('topicDescription').value;

        // Здесь должна быть логика сохранения темы (AJAX запрос)
        console.log(`Saving topic: ${action}, ${topicId}, ${topicName}, ${topicDescription}`);

        closeModal();
        // Перезагрузить список тем
    }

    function loadMainTopics() {
        const container = document.querySelector('.main-topics-container');
        container.innerHTML = '';

        mainTopics.forEach(topic => {
            const topicElement = document.createElement('div');
            topicElement.className = 'topic-card';
            topicElement.dataset.topicId = topic.id;

            let adminActions = '';
            console.log("isAdmin", isAdmin);
            if (isAdmin === true) {
                adminActions = `
                    <div class="topic-actions">
                        <button class="topic-action edit" onclick="showTopicModal('edit', ${topic.id}, event, 'Редактировать тему')"></button>
                        <button class="topic-action delete" onclick="showDeleteModal(${topic.id}, '${escapeSingleQuotes(topic.title)}', ${topic.topicsCount}, ${topic.messagesCount}, event)"></button>
                    </div>
                `;
            }

            function escapeSingleQuotes(str) {
                return str.replace(/'/g, "\\'");
            }

            topicElement.innerHTML = `
                <div class="topic-info">
                    <div class="topic-title">${topic.title}</div>
                    <p class="topic-description">${topic.description}</p>
                </div>
                <div class="topic-stats">
                    <div class="stat">
                        <div class="stat-value">${topic.topicsCount}</div>
                        <div class="stat-label">Темы</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${topic.messagesCount}</div>
                        <div class="stat-label">Сообщения</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${topic.lastMessage}</div>
                        <div class="stat-label">Последнее</div>
                    </div>
                    ${adminActions}
                </div>
            `;

            topicElement.addEventListener('click', (e) => {
                // Проверяем, был ли клик по кнопкам действий
                if (!e.target.closest('.topic-actions')) {
                    showSubtopics(topic.id, topic.title);
                }
            });
            container.appendChild(topicElement);
        });

        // Если админ - добавляем кнопку
        if (isAdmin === true) {
            addAdminCreateButton();
        }
    }

    function addAdminCreateButton() {
        const adminControls = document.createElement('div');
        adminControls.className = 'admin-controls';

        const createButton = document.createElement('button');
        createButton.className = 'create-main-topic-button';
        createButton.id = 'createMainTopicBtn';
        createButton.textContent = '+ Создать новую тему';

        createButton.addEventListener('click', () => {
            showTopicModal('create', null, null, "Создать новую тему");
        });

        adminControls.appendChild(createButton);

        // Вставляем кнопку после контейнера с темами
        const mainTopicsContainer = document.querySelector('.main-topics-container');
        mainTopicsContainer.appendChild(adminControls);
    }
});
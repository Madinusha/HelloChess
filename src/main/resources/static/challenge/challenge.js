const csrfToken = document.querySelector("meta[name='_csrf']")?.content;
const csrfHeader = document.querySelector("meta[name='_csrf_header']")?.content;

const profileData = document.getElementById("profile-data");
const isAdmin = profileData.getAttribute("data-isAdmin");
const lessonImages = [
    '/static/images/chance.png',
    '/static/images/Chess.jpg',
    '/static/images/versus-btn.png',
    '/static/images/white-flag.png',
    '/static/images/draw.png',
    '/static/images/find-opponent.png',

    '/static/images/white/King.png',
    '/static/images/white/Queen.png',
    '/static/images/white/Rook.png',
    '/static/images/white/Bishop.png',
    '/static/images/white/Knight.png',
    '/static/images/white/Pawn.png',
    '/static/images/black/King.png',
    '/static/images/black/Queen.png',
    '/static/images/black/Rook.png',
    '/static/images/black/Bishop.png',
    '/static/images/black/Knight.png',
    '/static/images/black/Pawn.png'
];
document.addEventListener('DOMContentLoaded', function() {
    // Создаем кнопку для мобильного меню
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'toggle-nav';
    toggleBtn.innerHTML = '☰';
    document.body.appendChild(toggleBtn);

    const navbar = document.querySelector('.e-navbar');
    const lessonsContainer = document.querySelector('.lessons');

    // Переключение мобильного меню
    toggleBtn.addEventListener('click', function() {
        navbar.classList.toggle('hidden');
    });

    const educationData = document.getElementById('education-data');

    const pieceLessonsJson = educationData.getAttribute('data-piece-lessons');
    const tacticsLessonsJson = educationData.getAttribute('data-tactics-lessons');
    const advancedLessonsJson = educationData.getAttribute('data-advanced-lessons');

    // Парсим JSON
    function parseJson(data) {
        try {
            return JSON.parse(data.replace(/&quot;/g, '"'));
        } catch (e) {
            console.warn('Ошибка парсинга JSON:', e);
            return [];
        }
    }

    // Теперь можно заполнить window.courses
    window.courses = {
        PIECE_TECHNIQUE: {
            title: 'Шахматные фигуры',
            lessons: parseJson(pieceLessonsJson)
        },
        TACTICS: {
            title: 'Шахматные приемы',
            lessons: parseJson(tacticsLessonsJson)
        },
        ADVANCED_LEVEL: {
            title: 'Повышенный уровень',
            lessons: parseJson(advancedLessonsJson)
        }
    };

    // Данные для уроков
    const courses1 = {
        'PIECE_TECHNIQUE': {
            title: 'Шахматные фигуры',
            lessons: [
                {
                    id: 1,
                    title: 'Пешка',
                    description: 'Изучите как ходит пешка, особенности взятия и превращения пешки в другие фигуры.',
                    image: '/static/images/white/Pawn.png',
                    score: 4,
                    progress: 75
                },
                {
                    id: 2,
                    title: 'Ладья',
                    description: 'Узнайте как ходит ладья и как эффективно использовать её в игре.',
                    image: '/static/images/white/Rook.png',
                    score: 3,
                    progress: 50
                },
                {
                    id: 3,
                    title: 'Конь',
                    description: 'Освойте необычный ход коня и его тактические возможности.',
                    image: '/static/images/white/Knight.png',
                    score: 5,
                    progress: 100
                }
            ]
        },
        'TACTICS': {
            title: 'Шахматные приемы',
            lessons: [
                {
                    id: 1,
                    title: 'Вилка',
                    description: 'Научитесь атаковать две фигуры одновременно с помощью коня.',
                    image: '/static/images/white/King.png',
                    score: 0,
                    progress: 0
                },
                {
                    id: 2,
                    title: 'Связка',
                    description: 'Узнайте как ограничивать подвижность фигур противника.',
                    image: '/static/images/white/King.png',
                    score: 0,
                    progress: 0
                }
            ]
        },
        'ADVANCED_LEVEL': {
            title: 'Повышенный уровень',
            lessons: [
                {
                    id: 1,
                    title: 'Мат в 1 ход',
                    description: 'Задачи на постановку мата в один ход.',
                    image: '/static/images/white/King.png',
                    score: 2,
                    progress: 30
                },
                {
                    id: 2,
                    title: 'Мат в 2 хода',
                    description: 'Более сложные задачи на мат в два хода.',
                    image: '/static/images/white/King.png',
                    score: 0,
                    progress: 0
                }
            ]
        }
    };

    // Режим редактирования
    let editMode = false;

    // Функция для отображения уроков
    function displayLessons(lessonType) {
        const course = courses[lessonType];
        if (!course) return;


        lessonsContainer.innerHTML = `
            <h1 class="course-title">${course.title}</h1>
            <div class="lesson-container"></div>
        `;

        const container = lessonsContainer.querySelector('.lesson-container');

        course.lessons.forEach(lesson => {
            addLessonToUI(lesson);
        });

        let adminPanel = lessonsContainer.querySelector('.admin-panel');

        if (isAdmin && !adminPanel) {
            adminPanel = document.createElement('div');
            adminPanel.className = 'admin-panel';
            adminPanel.id = 'adminPanel';
            adminPanel.style.display = 'none'; // Изначально скрыт
            adminPanel.innerHTML = `
                <button class="add-lesson-btn" id="addLessonBtn" data-lesson-type="${lessonType}">+ Добавить урок</button>
            `;
            lessonsContainer.appendChild(adminPanel);
            document.getElementById('addLessonBtn')?.addEventListener('click', function () {
               showAddLessonModal(lessonType);
            });
        }

        // Обновите отображение панели
        if (adminPanel) {
            adminPanel.style.display = editMode ? 'flex' : 'none';
        }
        setupLessonCardListeners();
    }

    function setupLessonCardListeners() {
        const container = document.querySelector('.lesson-container');
        if (!container) return;

        container.removeEventListener('click', handleLessonCardClick);
        container.addEventListener('click', handleLessonCardClick);
    }

    function handleLessonCardClick(e) {
        const card = e.target.closest('.lesson-card');
        if (!card) return;

        const lessonId = card.dataset.id;

        // Клик по кнопке удаления
        if (e.target.closest('.delete-btn')) {
            if (confirm('Удалить этот урок?')) {
                fetch(`/api/lessons/${lessonId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        [csrfHeader]: csrfToken
                    }
                })
                .then(response => {
                    if (!response.ok) throw new Error('Ошибка удаления');
                    card.remove();
                })
                .catch(err => {
                    console.error('Ошибка:', err);
                    alert('Не удалось удалить урок');
                });
            }
            return;
        }

        // Клик по кнопке редактирования
        if (e.target.closest('.edit-btn')) {
            console.log('Редактировать урок:', lessonId);
            if (e.target.closest('.edit-btn')) {
                let foundLesson = null;
                let currentCourseType = null;

                for (const courseType in courses) {
                    const lesson = courses[courseType].lessons.find(l => l.id === parseInt(lessonId));
                    if (lesson) {
                        foundLesson = lesson;
                        currentCourseType = courseType;
                        break;
                    }
                }
                if (!foundLesson) {
                    alert("Урок не найден");
                    return;
                }
                // Меняем заголовок
                document.getElementById('modal-title').textContent = 'Редактировать урок';

                const modal = document.getElementById('addLessonModal');
                modal.dataset.lessonType = currentCourseType;

                document.getElementById('lessonTitle').value = foundLesson.title;
                document.getElementById('lessonDescription').value = foundLesson.description;
                document.getElementById('selectedImage').value = foundLesson.image;

                const imageGallery = document.getElementById('imageGallery');
                const images = imageGallery.querySelectorAll('img');

                images.forEach(img => {
                    img.classList.remove('selected');
                    if (img.src === foundLesson.image) {
                        img.classList.add('selected');
                    }
                });

                // Сохраняем ID урока для последующего PUT-запроса
                document.getElementById('editLessonId').value = foundLesson.id;

                // Открываем модальное окно
                document.getElementById('addLessonModal').style.display = 'flex';
            }
            return;
        }

        // Клик по самой карточке
        console.log('Выбран урок:', lessonId);
        window.location.href = "/lesson/" + lessonId;
    }

    function initAdminControls() {
        // Переключение режима редактирования
        const editModeBtn = document.getElementById('toggleEditMode');
        if (editModeBtn) {
            editModeBtn.addEventListener('click', function() {
                editMode = !editMode;
                this.textContent = editMode ? 'Обычный режим' : 'Режим редактирования';
                document.querySelector('.admin-panel').style.display = editMode ? 'flex' : 'none';

                document.querySelectorAll('.lesson-actions').forEach(el => {
                    el.classList.toggle('hide-in-edit-mode', !editMode);
                });

            });
        }
        setupLessonCardListeners();
    }

    // Функции для работы с модальным окном
    function showAddLessonModal(lessonType) {
        const modal = document.getElementById('addLessonModal');
        modal.dataset.lessonType = lessonType;
        document.getElementById('modal-title').textContent = 'Добавить новый урок';
        document.getElementById('lessonTitle').value = '';
        document.getElementById('lessonDescription').value = '';
        document.getElementById('editLessonId').value = '';

        // Ставим первое изображение по умолчанию
        const hiddenInput = document.getElementById('selectedImage');
        const images = document.querySelectorAll('#imageGallery img');
        images.forEach(img => img.classList.remove('selected'));
        images[0]?.classList.add('selected');
        hiddenInput.value = images[0]?.src || '';

        // Показываем модалку
        document.getElementById('addLessonModal').style.display = 'flex';
    }

    function hideAddLessonModal() {
        document.getElementById('addLessonModal').style.display = 'none';
    }


    function upsertLessonInCourses(updatedLesson) {
        const lessonType = updatedLesson.lessonType;

        if (!courses[lessonType]) {
            console.warn("Неизвестный тип урока:", lessonType);
            return;
        }

        const lessons = courses[lessonType].lessons;
        const index = lessons.findIndex(l => l.id === updatedLesson.id);

        if (index !== -1) {
            // Обновляем существующий урок
            lessons[index] = updatedLesson;
        } else {
            // Добавляем новый урок
            lessons.push(updatedLesson);
        }
    }

    function addLessonToUI(lesson) {
        const container = document.querySelector('.lesson-container');
        if (!container) return;

        const lessonCard = document.createElement('div');
        lessonCard.className = 'lesson-card';
        lessonCard.dataset.id = lesson.id;
        lessonCard.innerHTML = `
            <img src="${lesson.image}" alt="${lesson.title}" class="lesson-image">
            <div class="lesson-content">
                <h3 class="lesson-title">${lesson.title}</h3>
                <p class="lesson-description">${lesson.description}</p>
            </div>
            <div class="lesson-score">
                <div class="stars">☆☆☆☆☆</div>
                <div class="progress">0%</div>
            </div>
            <div class="lesson-actions ${editMode ? '' : 'hide-in-edit-mode'}">
                <button class="edit-btn" data-id="${lesson.id}"></button>
                <button class="delete-btn" data-id="${lesson.id}"></button>
            </div>
        `;

        container.appendChild(lessonCard);
    }

    // Обработка навигации
    const navLinks = document.querySelectorAll('.e-navbar-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const lessonType = this.getAttribute('href').substring(1);
            displayLessons(lessonType);

            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    });

    // Обработчики модального окна
    document.getElementById('cancelAddLesson')?.addEventListener('click', hideAddLessonModal);
    document.getElementById('saveLesson')?.addEventListener('click', function () {
        const id = document.getElementById('editLessonId').value;
        const title = document.getElementById('lessonTitle').value.trim();
        const description = document.getElementById('lessonDescription').value.trim();
        const image = document.getElementById('selectedImage').value;
        const modal = document.getElementById('addLessonModal');
        const lessonType = modal.dataset.lessonType;

        if (!title || !description) {
            alert('Пожалуйста, введите все поля урока');
            return;
        }

        const url = id ? `/api/lessons/${id}` : `/api/lessons`;
        const method = id ? 'PUT' : 'POST';

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                [csrfHeader]: csrfToken
            },
            body: JSON.stringify({
                title,
                description,
                lessonType,
                image
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(method === 'POST' ? 'Не удалось создать урок' : 'Не удалось обновить урок');
            }
            return response.json();
        })
        .then(lesson => {
            hideAddLessonModal();
            upsertLessonInCourses(lesson);
            displayLessons(lesson.lessonType);
        })
        .catch(error => {
            console.error('Ошибка:', error);
            alert(`Не удалось ${id ? 'обновить' : 'создать'} урок. Попробуйте снова.`);
        });
    });

    function updateLessonInUI(updatedLesson) {
        const container = document.querySelector('.lesson-container');
        const card = container.querySelector(`.lesson-card[data-id="${updatedLesson.id}"]`);
        if (!card) return;

        // Обновляем поля на карточке
        card.querySelector('.lesson-title').textContent = updatedLesson.title;
        card.querySelector('.lesson-description').textContent = updatedLesson.description;
        card.querySelector('.lesson-image').src = updatedLesson.image;

        // Опционально: обновляем данные в массиве courses
        Object.keys(courses).forEach(type => {
            const index = courses[type].lessons.findIndex(l => l.id === updatedLesson.id);
            if (index !== -1) {
                courses[type].lessons[index] = updatedLesson;
            }
        });
    }

    function populateImageGallery() {
        const gallery = document.getElementById('imageGallery');
        const hiddenInput = document.getElementById('selectedImage');

        lessonImages.forEach(imageUrl => {
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = imageUrl;
            img.className = 'thumbnail';
            img.title = 'Выбрать изображение';

            img.addEventListener('click', () => {
                // Удаляем выделение у других изображений
                document.querySelectorAll('.thumbnail.selected').forEach(el => el.classList.remove('selected'));
                img.classList.add('selected');
                hiddenInput.value = imageUrl;
            });

            gallery.appendChild(img);
        });

        // Установите первое изображение по умолчанию
        if (lessonImages.length > 0) {
            hiddenInput.value = lessonImages[0];
            gallery.querySelector('img')?.classList.add('selected');
        }
    }

    displayLessons('ADVANCED_LEVEL');
    initAdminControls();
    populateImageGallery();
});
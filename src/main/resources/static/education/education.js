document.addEventListener('DOMContentLoaded', function() {
    // Тоггл для навбара
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'toggle-nav';
    toggleBtn.innerHTML = '☰';
    document.body.appendChild(toggleBtn);

    const navbar = document.querySelector('.e-navbar');
    const lessons = document.querySelector('.lessons');

    toggleBtn.addEventListener('click', function() {
        navbar.classList.toggle('hidden');
    });

    // Данные для уроков
    const courses = {
        'piece': {
            title: 'Шахматные фигуры',
            lessons: [
                {
                    id: 1,
                    title: 'Пешка',
                    description: 'Изучите как ходит пешка, особенности взятия и превращения пешки в другие фигуры.',
                    image: 'https://via.placeholder.com/80',
                    rating: 4,
                    progress: 75
                },
                {
                    id: 2,
                    title: 'Ладья',
                    description: 'Узнайте как ходит ладья и как эффективно использовать её в игре.',
                    image: 'https://via.placeholder.com/80',
                    rating: 3,
                    progress: 50
                },
                {
                    id: 3,
                    title: 'Конь',
                    description: 'Освойте необычный ход коня и его тактические возможности.',
                    image: 'https://via.placeholder.com/80',
                    rating: 5,
                    progress: 100
                }
            ]
        },
        'techniques': {
            title: 'Шахматные приемы',
            lessons: [
                {
                    id: 1,
                    title: 'Вилка',
                    description: 'Научитесь атаковать две фигуры одновременно с помощью коня.',
                    image: 'https://via.placeholder.com/80',
                    rating: 0,
                    progress: 0
                },
                {
                    id: 2,
                    title: 'Связка',
                    description: 'Узнайте как ограничивать подвижность фигур противника.',
                    image: 'https://via.placeholder.com/80',
                    rating: 0,
                    progress: 0
                }
            ]
        },
        'tasks': {
            title: 'Шахматные задачи',
            lessons: [
                {
                    id: 1,
                    title: 'Мат в 1 ход',
                    description: 'Простые задачи на нахождение мата в один ход.',
                    image: 'https://via.placeholder.com/80',
                    rating: 2,
                    progress: 30
                },
                {
                    id: 2,
                    title: 'Мат в 2 хода',
                    description: 'Более сложные задачи на мат в два хода.',
                    image: 'https://via.placeholder.com/80',
                    rating: 0,
                    progress: 0
                }
            ]
        }
    };

    // Функция для отображения уроков
    function displayLessons(courseId) {
        const course = courses[courseId];
        if (!course) return;

        lessons.innerHTML = `
            <h1 class="course-title">${course.title}</h1>
            <div class="lesson-container"></div>
        `;

        const container = lessons.querySelector('.lesson-container');

        course.lessons.forEach(lesson => {
            const stars = '★'.repeat(lesson.rating) + '☆'.repeat(5 - lesson.rating);

            const lessonCard = document.createElement('div');
            lessonCard.className = 'lesson-card';
            lessonCard.innerHTML = `
                <img src="${lesson.image}" alt="${lesson.title}" class="lesson-image">
                <div class="lesson-content">
                    <h3 class="lesson-title">${lesson.title}</h3>
                    <p class="lesson-description">${lesson.description}</p>
                </div>
                <div class="lesson-rating">
                    <div class="stars">${stars}</div>
                    <div class="progress">${lesson.progress}%</div>
                </div>
            `;

            container.appendChild(lessonCard);
        });
    }

    // Обработка навигации
    const navLinks = document.querySelectorAll('.e-navbar-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const courseId = this.getAttribute('href').substring(1);
            displayLessons(courseId);

            // Прокрутка к началу
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    });

    // Показать первый курс по умолчанию
    displayLessons('piece');
});
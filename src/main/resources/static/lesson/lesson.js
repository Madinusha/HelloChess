let editMode = false;

let editorIsFlipped = false;
let currentPosition = {};
let currentMoveSide = 'white';
let chessboard = {};
let editorChessboard = {};
let editorMoveHistory = []; // Массив для хранения истории ходов в формате ["e2-e4", "e7-e5"]
let taskMoveHistory = []; // История ходов пользователя
let taskInitialPosition = [];
let currentTask = null; // Текущая задача
let taskRatings = [ 3, 2, 1];

const chessSymbols = {
    "King": { "white": "♔", "black": "♚" },
    "Queen": { "white": "♕", "black": "♛" },
    "Rook": { "white": "♖", "black": "♜" },
    "Bishop": { "white": "♗", "black": "♝" },
    "Knight": { "white": "♘", "black": "♞" },
    "Pawn": { "white": "♙", "black": "♟" },
    "Donut": { "pink": "🍩", "pink": "🍩", "white": "🍩", "black": "🍩" }
};

const csrfToken = document.querySelector("meta[name='_csrf']").content;
const csrfHeader = document.querySelector("meta[name='_csrf_header']").content;

// Функция для закрытия редактора
function closeChessEditor() {
    document.getElementById('chess-editor-modal').style.display = 'none';
    editMode = false;
}

function renderEditorChessboard(position, isFlipped = false) {
    const board = document.getElementById('editor-chess-board');
    board.innerHTML = '';
    renderChessboard(position, isFlipped, true); // editBoard = true
    addBoardClickHandlers();
}

function parseJson(data) {
    try {
        return JSON.parse(data.replace(/&quot;/g, '"'));
    } catch (e) {
        console.warn('Ошибка парсинга JSON:', e);
        return [];
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'toggle-nav';
    toggleBtn.innerHTML = '☰';
    document.body.appendChild(toggleBtn);
    const navbar = document.querySelector('.e-navbar');
    // Переключение мобильного меню
    toggleBtn.addEventListener('click', function() {
        navbar.classList.toggle('hidden');
    });
    navbar.classList.toggle('hidden');

    const educationData = document.getElementById('education-data');
    const isAdmin = educationData.getAttribute('data-isAdmin') === 'true';
    const sameTypeLessonsJson = educationData.getAttribute('data-same-type-lessons');

    const currentLesson = parseJson(educationData.getAttribute('data-current-lesson-json'));
    console.log("currentLesson", currentLesson);
    const currentLessonId = currentLesson.id;

    const sameTypeLessons = JSON.parse(sameTypeLessonsJson);
    const lessonList = document.getElementById('lessonList');

    const lessonType = educationData.getAttribute('data-lesson-type');
    document.body.classList.add('lesson-type-' + lessonType);

    sameTypeLessons.forEach(lesson => {
        if (lesson.id !== currentLessonId) {
            const li = document.createElement('li');
            li.className = 'e-navbar-item';

            const a = document.createElement('a');
            a.href = '/lesson/' + lesson.id;
            a.textContent = lesson.title;
            a.className = 'e-navbar-link';

            li.appendChild(a);
            lessonList.appendChild(li);
        }
    });

    // Добавить кнопку редактирования, если пользователь — администратор
    if (isAdmin) {
        const editLi = document.createElement('li');
        editLi.className = 'e-navbar-item';
        editLi.id = 'toggleEditMode';
        editLi.textContent = 'Режим редактирования';

        lessonList.appendChild(editLi);
    }

    renderChessboard([]);
    loadTasks();


    document.getElementById('reset-position').addEventListener('click', function() {
        // Стандартная начальная позиция
        currentPosition = getInitialPosition();
        renderEditorChessboard(currentPosition, editorIsFlipped);
    });

    document.getElementById('clear-board').addEventListener('click', function() {
        currentPosition = {};
        renderEditorChessboard(currentPosition, editorIsFlipped);
    });

    document.getElementById('flip-board').addEventListener('click', function() {
        editorIsFlipped = !editorIsFlipped;
        renderEditorChessboard(currentPosition, editorIsFlipped);
    });

    document.getElementById('save-position').addEventListener('click', function() {
        const description = document.getElementById('task-description').value;
        const lessonId = parseJson(educationData.getAttribute('data-current-lesson-json')).id;

        const taskData = {
            description: description,
            chessData: {
                initialFen: initialPosition,
                solutionMoves: editorMoveHistory
            }
        };

        fetch(`/api/lessons/${lessonId}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                [csrfHeader]: csrfToken
            },
            body: JSON.stringify(taskData)
        })
        .then(response => {
            if (!response.ok) throw new Error('Ошибка сохранения');
            return response.json();
        })
        .then(data => {
            console.log('Задача сохранена:', data);
            closeChessEditor();
            location.reload();
        })
        .catch(error => {
            console.error('Ошибка:', error);
            alert('Не удалось сохранить задачу');
        });

    });

    document.getElementById('cancel-edit').addEventListener('click', closeChessEditor);

    if (document.getElementById('toggleEditMode')) {
        document.getElementById('toggleEditMode').addEventListener('click', function() {
            this.textContent = this.textContent.trim() === 'Режим редактирования'
                        ? 'Обычный режим'
                        : 'Режим редактирования';

            document.getElementById('admin-panel').style.display = 'grid';
            const editTask = document.getElementById('edit-task');
            const addTask = document.getElementById('add-task');
            const deleteTask = document.getElementById('delete-task');

            addTask.addEventListener('click', function() {
                openChessEditor(getInitialPosition());
            });

            deleteTask.addEventListener('click', function() {
                const selectedItem = document.querySelector('.task-item.selected-task');
                if (!selectedItem) {
                    alert('Выберите задачу для удаления');
                    return;
                }

                const lessonId = parseJson(educationData.getAttribute('data-current-lesson-json')).id;
                const taskId = selectedItem.dataset.taskId;
                const taskOrder = selectedItem.textContent.trim();
                const confirmMessage = `Вы уверены, что хотите удалить задачу №${taskOrder}?`;
                if (!confirm(confirmMessage)) {
                    return;
                }
                fetch(`/api/lessons/${lessonId}/tasks/${taskId}`, {
                    method: 'DELETE',
                    headers: {
                        [csrfHeader]: csrfToken
                    }
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Ошибка при удалении задачи');
                    }
                    return;
                })
                .then(() => {
                    location.reload();
                })
                .catch(error => {
                    console.error('Ошибка:', error);
                    alert('Не удалось удалить задачу');
                });
            });
        });
    }
});

function loadTasks() {
    const educationData = document.getElementById('education-data');
    const tasksJson = educationData?.getAttribute('data-tasks');

    let tasks = [];

    try {
        tasks = tasksJson ? JSON.parse(tasksJson) : [];
    } catch (error) {
        console.error("Ошибка парсинга JSON:", error);
        tasks = [];
    }

    const container = document.getElementById('taskContainer');
    container.innerHTML = '';

    tasks.forEach(task => {
        const item = document.createElement('div');
        item.className = 'task-item';
        item.textContent = `${task.order}`;
        item.dataset.taskId = task.id;
        item.dataset.taskOrder = task.order;

        item.addEventListener('click', function () {
            renderTask(task);
        });

        container.appendChild(item);
    });

    // Если есть задачи — рендерим первую и выделяем её
    if (Array.isArray(tasks) && tasks.length > 0) {
        const firstItem = container.querySelector('.task-item');
        if (firstItem) {
            firstItem.classList.add('selected-task');
            renderTask(tasks[0]);
        }
    }
}

function renderTask(task) {
    currentTask = task;
    taskMoveHistory = [];
    taskInitialPosition = deepCopy(currentTask.chessData.initialFen)
    const descriptionElement = document.getElementById('t-description');
    if (descriptionElement) {
        descriptionElement.textContent = task.description || 'Нет описания';
    }

    if (task.chessData && task.chessData.initialFen) {
        chessboard = deepCopy(task.chessData.initialFen);
        renderChessboard(chessboard, true, false);
    } else {
        console.warn("Нет данных для отрисовки доски");
    }
    document.querySelectorAll('.task-item').forEach(el => {
        const isSelected = parseInt(el.dataset.taskOrder, 10) === parseInt(task.order, 10);
        el.classList.toggle('selected-task', isSelected);
    });
}

function checkTaskCompletion() {
    if (!currentTask || !currentTask.chessData || !currentTask.chessData.initialFen) {
        console.warn("Нет данных для проверки задачи");
        return;
    }

    const solutionMoves = currentTask.chessData.solutionMoves || [];
    console.log("taskInitialPosition\n ", taskInitialPosition);
    // Проверяем, есть ли пончики в начальной позиции
    const hasDonuts = Object.values(taskInitialPosition).some(piece => piece.fileName === 'Donut');
    console.log("изначально были пончики? hasDonuts ", hasDonuts);

    const descriptionBox = document.getElementById('t-description');
    if (!descriptionBox) return;


    if (hasDonuts) {
        // Проверка: все ли пончики съедены
        const hasRemainingDonuts = Object.values(chessboard).some(piece => piece.fileName === 'Donut');
        console.log("Сейчас есть пончики? hasRemainingDonuts ", hasRemainingDonuts);
        if (!hasRemainingDonuts) {
            // Задача выполнена: подсчёт звёзд
            const moveCount = taskMoveHistory.length;
            const solutionLength = solutionMoves.length;
            console.log("moveCount ", moveCount);
            let stars = 1;
            let goods = 'В следующий раз получится лучше!';
            if (moveCount <= solutionLength) {
                stars = 3;
                goods = 'Ты супер!';
            } else if (moveCount <= solutionLength + 2) {
                stars = 2;
                goods = 'Очень хорошо!';
            }
            descriptionBox.textContent = goods;
            console.log(`Задача выполнена! Оценка: ${stars} звезд(ы)`);
            taskMoveHistory = null;
            completeTask(stars, currentTask);
            return;
        }
        descriptionBox.textContent = "Ага, дальше";
    } else {
          // Проверка: совпадает ли начало последовательности ходов с решением
          const matchesSolution = solutionMoves.every((move, i) => taskMoveHistory[i] === move);

          if (matchesSolution && taskMoveHistory.length >= solutionMoves.length) {
              // Задача выполнена успешно
              console.log("Задача выполнена! Оценка: 3 звезды");
              descriptionBox.textContent = "Молодец!";
              completeTask(3, currentTask);

              // Можно добавить кнопку "еще раз" или другую логику
          } else if (matchesSolution && taskMoveHistory.length < solutionMoves.length) {
              // Пользователь на правильном пути, но еще не завершил задачу
              console.log("Продолжайте: текущие ходы совпадают с решением");
              descriptionBox.textContent = "Круто! Продолжай";
          } else {
              // Ошибка: последовательность не совпадает
              console.log("Ошибка: последовательность ходов не совпадает с решением");

              descriptionBox.textContent = "Кажется, не то... Попробуй снова";
              descriptionBox.classList.add('wrong-answer');
              // Создаём кнопку "еще раз"
              const retryButton = document.createElement('button');
              retryButton.textContent = "Еще раз";
              retryButton.classList.add('task-retry');
              retryButton.onclick = () => {
                  taskMoveHistory = [];
                  if (retryButton.parentElement) {
                      retryButton.parentElement.removeChild(retryButton);
                  }
                  descriptionBox.classList.remove('wrong-answer');
                  renderTask(currentTask);
              };

              descriptionBox.appendChild(retryButton);

              // Блокируем дальнейшие ходы
              taskMoveHistory = null;
          }
    }
}

function completeTask(stars, task) {
    const taskContainer = document.getElementById('taskContainer');
    const taskElements = taskContainer.querySelectorAll('.task-item');

    const educationData = document.getElementById('education-data');
    const tasksJson = educationData?.getAttribute('data-tasks');

    let tasks = [];

    try {
        tasks = tasksJson ? JSON.parse(tasksJson) : [];
    } catch (error) {
        console.error("Ошибка парсинга JSON:", error);
        tasks = [];
    }



    // Получаем ID пользователя из данных страницы
    const userId = document.getElementById('user-profile')?.dataset.userId;
    const taskId = task.id;

    if (userId && taskId) {
        // Отправляем прогресс на сервер
        fetch(`/api/progress/task?userId=${userId}&taskId=${taskId}&stars=${stars}`, {
            method: 'POST',
            headers: {
                [csrfHeader]: csrfToken
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Не удалось сохранить прогресс');
            }
            console.log('Прогресс успешно сохранен');
        })
        .catch(error => {
            console.error('Ошибка сохранения прогресса:', error);
            alert('Не удалось сохранить прогресс. Проверьте соединение.');
        });
    }



    if (taskElements[task.order - 1]) {
        taskElements[task.order - 1].classList.add('done');
        taskRatings.push(stars);
    }

    setTimeout(() => {
        if (task.order - 1 < taskElements.length - 1) {
            renderTask(tasks[task.order]);
        } else {
            showLessonCompletionModal();
        }

    }, 1300);
}

function showLessonCompletionModal() {
    const overlay = document.createElement('div');
    overlay.style = `
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background: rgba(0,0,0,0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    `;

    const modal = document.createElement('div');
    modal.style = `
        background: white;
        padding: 30px;
        border-radius: 10px;
        text-align: center;
        box-shadow: 0 0 20px rgba(0,0,0,0.3);
    `;

    const totalStars = taskRatings.reduce((sum, rating) => sum + rating, 0);
    const averageRating = (totalStars / taskRatings.length).toFixed(2);

    // Переводим в 5-балльную систему (3 звезды = 5 баллов)
    const fiveStarRating = ((averageRating / 3) * 5).toFixed(2);

    modal.innerHTML = `
        <h2>🎉 Поздравляем!</h2>
        <p>Вы успешно освоили урок!</p>
        <p>Средний балл: <strong>${fiveStarRating}</strong> из 5</p>
        <button id="returnToLessonsBtn" style="
            margin-top: 20px;
            padding: 10px 20px;
            background: #8585b7;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        ">Вернуться в меню уроков</button>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    document.getElementById('returnToLessonsBtn').addEventListener('click', () => {
        window.location.href = '/education';
    });
}

function getInitialPosition() {
    return {
        // Белые фигуры
        'a1': { color: 'white', fileName: 'Rook', hasMoved: false },
        'b1': { color: 'white', fileName: 'Knight' },
        'c1': { color: 'white', fileName: 'Bishop' },
        'd1': { color: 'white', fileName: 'Queen' },
        'e1': { color: 'white', fileName: 'King', hasMoved: false, hasChecked: false },
        'f1': { color: 'white', fileName: 'Bishop' },
        'g1': { color: 'white', fileName: 'Knight' },
        'h1': { color: 'white', fileName: 'Rook', hasMoved: false },
        'a2': { color: 'white', fileName: 'Pawn', hasMoved: false },
        'b2': { color: 'white', fileName: 'Pawn', hasMoved: false },
        'c2': { color: 'white', fileName: 'Pawn', hasMoved: false },
        'd2': { color: 'white', fileName: 'Pawn', hasMoved: false },
        'e2': { color: 'white', fileName: 'Pawn', hasMoved: false },
        'f2': { color: 'white', fileName: 'Pawn', hasMoved: false },
        'g2': { color: 'white', fileName: 'Pawn', hasMoved: false },
        'h2': { color: 'white', fileName: 'Pawn', hasMoved: false},

        // Чёрные фигуры
        'a8': { color: 'black', fileName: 'Rook', hasMoved: false },
        'b8': { color: 'black', fileName: 'Knight' },
        'c8': { color: 'black', fileName: 'Bishop' },
        'd8': { color: 'black', fileName: 'Queen' },
        'e8': { color: 'black', fileName: 'King', hasMoved: false, hasChecked: false },
        'f8': { color: 'black', fileName: 'Bishop' },
        'g8': { color: 'black', fileName: 'Knight' },
        'h8': { color: 'black', fileName: 'Rook', hasMoved: false },
        'a7': { color: 'black', fileName: 'Pawn', hasMoved: false },
        'b7': { color: 'black', fileName: 'Pawn', hasMoved: false },
        'c7': { color: 'black', fileName: 'Pawn', hasMoved: false },
        'd7': { color: 'black', fileName: 'Pawn', hasMoved: false },
        'e7': { color: 'black', fileName: 'Pawn', hasMoved: false },
        'f7': { color: 'black', fileName: 'Pawn', hasMoved: false },
        'g7': { color: 'black', fileName: 'Pawn', hasMoved: false },
        'h7': { color: 'black', fileName: 'Pawn', hasMoved: false }
    };
}

function handleCellClick(position) {
    const square = document.getElementById(position);
    console.log("squareId:", position)
    const selectedSquare = document.querySelector('.selected');
    if (selectedSquare == square) {
        hideValidMove();
        return;
    }
    if (square.classList.contains('possible-move') || square.classList.contains('possible-move-on-piece')) {
       hideValidMove();
       makeMove(selectedSquare.id, square.id);
    } else {
        const pieceImg = square.querySelector('.piece');

        if (!pieceImg || pieceImg.dataset.piece === 'Donut') {
            hideValidMove();
            console.log(pieceImg ? "Фигура - donut, ходы недоступны" : "Нет фигуры");
            return;
        }
        fetchPossibleMoves(position);
    }
}

function makeMove(selectedSquareId, squareId) {
    let localChessboard;
    if (editMode) {
        localChessboard = editorChessboard;
    } else {
        localChessboard = chessboard;
    }

    const fromPosition = selectedSquareId.replace('editor-', '');
    const toPosition = squareId.replace('editor-', '');

    console.log("localChessboard:\n", toString(localChessboard));
    if (!localChessboard[fromPosition]) {
        console.error('Нет фигуры на позиции', fromPosition);
        return;
    }
    addMoveToBox(fromPosition, toPosition);
    animateMove(selectedSquareId, squareId);

    updateChessboard(localChessboard, fromPosition, toPosition);

    checkTaskCompletion();
}

async function fetchPossibleMoves(position) {
    let localChessboard;
    if (editMode) {
        localChessboard = editorChessboard;
    } else {
        localChessboard = chessboard;
    }
    console.log("localChessboard\n", toString(localChessboard));
    try {
        const response = await fetch('/api/lessons/{1}/tasks/possible-move', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                [csrfHeader]: csrfToken
            },
            body: JSON.stringify({
                position: position.replace('editor-', ''),
                clientData: localChessboard
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Ошибка запроса');
        }

        const data = await response.json();
        console.log("data", data);
        showValidMovesFor(data.position, data.possibleMoves);
    } catch (error) {
        console.error('Ошибка при получении возможных ходов:', error);
    }
}

function hideValidMove() {
    document.querySelectorAll('.possible-move').forEach(square => {
        square.classList.remove('possible-move');
    });
     document.querySelectorAll('.possible-move-on-piece').forEach(square => {
        square.classList.remove('possible-move-on-piece');
    });
    const selectedSquare = document.querySelector('.selected');
    if (selectedSquare) {
        selectedSquare.classList.remove('selected');
    }
}

function addMoveToBox(fromPosition, toPosition) {
    const moveNotation = `${fromPosition.replace('editor-', '')}-${toPosition.replace('editor-', '')}`;
    editorMoveHistory.push(moveNotation);
    taskMoveHistory.push(moveNotation);

    const moveBox = document.getElementById('move-box-window');
    const moveNumbers = document.getElementById('move-numbers');
    const movesColumn = document.getElementById('moves');

    // Создаем новую строку для каждого хода
    const moveNumber = editorMoveHistory.length

    // Всегда создаем новую строку для номера хода и для самого хода
    const numberElement = document.createElement('div');
    numberElement.className = 'move-box-row';
    numberElement.textContent = `${moveNumber}.`;
    moveNumbers.appendChild(numberElement);

    const moveElement = document.createElement('div');
    moveElement.className = 'move-box-row';
    moveElement.textContent = moveNotation;
    movesColumn.appendChild(moveElement);

    moveBox.scrollTop = moveBox.scrollHeight;
}

function clearMoveHistory() {
    editorMoveHistory = [];
    document.getElementById('move-numbers').innerHTML = '';
    document.getElementById('moves').innerHTML = '';
}

function showValidMovesFor(position, possibleMoves) {
    let localChessboard;
    if (editMode) {
        localChessboard = editorChessboard;
    } else {
        localChessboard = chessboard;
    }

    hideValidMove();
    const squareId = (editMode ? 'editor-' : '') + position;
    const square = document.getElementById(squareId);

    if (!square) {
        console.error('Element not found for position:', squareId);
        return;
    }

    square.classList.add('selected');

    // Обрабатываем возможные ходы
    possibleMoves.forEach(targetPos => {
        const targetSquareId = (editMode ? 'editor-' : '') + `${targetPos.col}${targetPos.row}`;
        const targetSquare = document.getElementById(targetSquareId);

        if (targetSquare) {
            const purePosition = targetSquareId.replace('editor-', '');
            if (localChessboard[purePosition]) {
                targetSquare.classList.add('possible-move-on-piece');
            } else {
                targetSquare.classList.add('possible-move');
            }
        } else {
            console.warn('Target square not found:', targetSquareId);
        }
    });
}

function renderChessboard(chessboard, isFlipped = false, editBoard = false) {
    let board = document.getElementById('chess-board');
    if (editBoard) {
        board = document.getElementById('editor-chess-board');
    }
    board.innerHTML = '';
    const rows = isFlipped ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];
    const cols = isFlipped ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    for (const row of rows) {
        for (const col of cols) {
            const position = col + row;
            const uniqueId = editBoard ? `editor-${position}` : position;
            const piece = chessboard[position];
            const isLight = (row + col.charCodeAt(0)) % 2 !== 0;
            const square = document.createElement('div');
            square.className = `square ${isLight ? 'light' : 'dark'}`;
            square.id = uniqueId;

            if (col === cols[7]) {
                const rowLabel = document.createElement('div');
                rowLabel.className = `coordinate row-label ${isLight ? 'light-label' : 'dark-label'}`;
                rowLabel.textContent = row;
                square.appendChild(rowLabel);
            }

            if (row === rows[rows.length - 1]) {
                const colLabel = document.createElement('div');
                colLabel.className = `coordinate col-label ${isLight ? 'light-label' : 'dark-label'}`;
                colLabel.textContent = col;
                square.appendChild(colLabel);
            }

            if (piece) {
                const img = document.createElement('img');
                img.className = 'piece';

                // Явно задаем путь к пончику
                if (piece.fileName === 'Donut') {
                    img.src = '/static/images/Donut.png';
                    img.classList.add('donut');
                } else {
                    img.src = `/static/images/${piece.color}/${piece.fileName}.png`;
                }

                img.dataset.piece = piece.fileName;
                img.dataset.color = piece.color;
                if (currentStep === 1) {
                    img.addEventListener('mousedown', startPieceDrag);
                }

                square.appendChild(img);
            }

            if (currentStep === 2 || editBoard === false) {
                square.addEventListener('click', () => handleCellClick(uniqueId));
            }

            board.appendChild(square);
        }
    }
}

function animateMove(positionFrom, positionTo) {
    return new Promise((resolve) => {
        console.log("positionFrom ", positionFrom);
        console.log("positionTo ", positionTo);
        const selectedSquare = document.getElementById(positionFrom);
        const targetSquare = document.getElementById(positionTo);

        // Получаем изображение фигуры
        const piece = selectedSquare.querySelector('.piece');
        document.querySelectorAll('.last-move').forEach(square => {
            square.classList.remove('last-move');
        });

        // Получаем координаты начального и конечного квадрата
        const startPos = selectedSquare.getBoundingClientRect();
        const endPos = targetSquare.getBoundingClientRect();

        // Вычисляем смещение
        const deltaX = endPos.left - startPos.left;
        const deltaY = endPos.top - startPos.top;
        // Добавляем анимацию
        requestAnimationFrame(() => {
            piece.style.zIndex = 1000;
            piece.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        });
        const moveSound = document.getElementById('moveSound');
        const eatSound = document.getElementById('eatSound');

        piece.addEventListener('transitionend', () => {

            selectedSquare.classList.add('last-move');
            targetSquare.classList.add('last-move');

            const targetPiece = targetSquare.querySelector('.piece');

            if (targetPiece) {
                targetPiece.remove();
                eatSound.play();
            } else moveSound.play();

            const pieceElement = document.createElement('img');
            targetSquare.appendChild(pieceElement);
            pieceElement.src = piece.src;
            pieceElement.classList.add('piece');
            piece.remove();

            resolve();
        });
    });
}

function addBoardClickHandlers() {
    const squares = document.querySelectorAll('.square');

    // Добавляем обработчики для клеток редакторской доски
    squares.forEach(square => {
        if (square.id.startsWith('editor-')) {
            const position = square.id.replace('editor-', '');

            // Обработчик клика
            square.addEventListener('click', (e) => {
                if (currentStep === 1 && selectedPieceType && selectedPieceColor) {
                    handleBoardClick(position);
                }
            });

            // Обработчик перетаскивания с доски
            const piece = square.querySelector('.piece');
            if (piece) {
                piece.addEventListener('mousedown', (e) => {
                    e.preventDefault(); // Предотвращаем дублирование событий

                    // Сохраняем данные о фигуре
                    const pieceType = piece.dataset.piece;
                    const pieceColor = piece.dataset.color;
                    const pieceSrc = piece.src;
                    const fromPosition = position;

                    // Удаляем фигуру с доски
                    piece.remove();
                    delete currentPosition[fromPosition];

                    // Создаем временное изображение
                    const dragGhost = document.createElement('img');
                    dragGhost.src = pieceSrc;
                    dragGhost.style.position = 'fixed';
                    dragGhost.style.zIndex = '1001';
                    dragGhost.style.pointerEvents = 'none';
                    dragGhost.style.width = '60px';
                    dragGhost.style.height = '60px';
                    document.body.appendChild(dragGhost);

                    // Перемещаем временное изображение
                    function dragMove(e) {
                        dragGhost.style.left = `${e.clientX - 30}px`;
                        dragGhost.style.top = `${e.clientY - 30}px`;
                    }

                    // Завершение перетаскивания
                    function dragEnd(e) {
                        document.removeEventListener('mousemove', dragMove);
                        document.removeEventListener('mouseup', dragEnd);
                        document.body.removeChild(dragGhost);

                        // Ищем клетку под курсором
                        let targetSquare = null;
                        squares.forEach(s => {
                            const rect = s.getBoundingClientRect();
                            if (
                                e.clientX >= rect.left &&
                                e.clientX <= rect.right &&
                                e.clientY >= rect.top &&
                                e.clientY <= rect.bottom
                            ) {
                                targetSquare = s;
                            }
                        });

                        // Если найдена целевая клетка - перемещаем фигуру
                        if (targetSquare) {
                            const toPosition = targetSquare.id.replace('editor-', '');

                            // Удаляем существующую фигуру
                            const existing = targetSquare.querySelector('.piece');
                            if (existing) existing.remove();

                            // Добавляем новую
                            const newPiece = document.createElement('img');
                            newPiece.src = pieceSrc;
                            newPiece.dataset.piece = pieceType;
                            newPiece.dataset.color = pieceColor;
                            newPiece.classList.add('piece');
                            newPiece.style.width = '100%';
                            newPiece.style.height = '100%';
                            targetSquare.appendChild(newPiece);

                            // Обновляем состояние
                            currentPosition[toPosition] = {
                                color: pieceColor,
                                fileName: pieceType
                            };
                        } else {
                            // Если целевая клетка не найдена - восстанавливаем фигуру
                            const originalSquare = document.getElementById(`editor-${fromPosition}`);
                            if (originalSquare) {
                                originalSquare.appendChild(piece);
                                currentPosition[fromPosition] = {
                                    color: pieceColor,
                                    fileName: pieceType
                                };
                            }
                        }
                    }

                    // Подписываемся на события
                    document.addEventListener('mousemove', dragMove);
                    document.addEventListener('mouseup', dragEnd);
                });

                // Устанавливаем курсор перетаскивания
                piece.style.cursor = 'grab';
                piece.addEventListener('mousedown', () => {
                    piece.style.cursor = 'grabbing';
                });
                piece.addEventListener('mouseup', () => {
                    piece.style.cursor = 'grab';
                });
            }
        }
    });
}

let currentStep = 1;
let initialPosition = {};
let moveHistory = [];

// Функция для открытия редактора
function openChessEditor() {
    currentStep = 1;
    initialPosition = getInitialPosition();
    currentPosition = deepCopy(initialPosition);
    moveHistory = [];
    editMode = true;

    const modal = document.getElementById('chess-editor-modal');
    modal.style.display = 'flex';
    updateStepUI();
    renderEditorChessboard(currentPosition, editorIsFlipped);
    renderPiecePanels();
}

// Обновление интерфейса для текущего шага
function updateStepUI() {
    const stepTitle = document.getElementById('step-title');
    const step1Controls = document.getElementById('step1-controls');
    const step2Controls = document.getElementById('step2-controls');
    const piecePanels = document.querySelectorAll('.piece-panel');

    if (currentStep === 1) {
        stepTitle.textContent = 'Шаг 1: Выберите начальную позицию';
        step1Controls.style.display = 'flex';
        step2Controls.style.display = 'none';
        piecePanels.forEach(panel => panel.style.display = 'flex');
        renderEditorChessboard(getInitialPosition(), editorIsFlipped);
    } else {
        editorChessboard = deepCopy(initialPosition);
        stepTitle.textContent = 'Шаг 2: Покажите решение задачи';
        step1Controls.style.display = 'none';
        step2Controls.style.display = 'flex';
        piecePanels.forEach(panel => panel.style.display = 'none');
        chessboard = deepCopy(initialPosition);
        renderChessboard(chessboard, editorIsFlipped, true);
        console.log();
        clearMoveHistory();
    }
}

let selectedPanelElement = null;

function renderPiecePanels() {
    const pieces = {
        white: ['King', 'Queen', 'Rook', 'Bishop', 'Knight', 'Pawn'],
        black: ['King', 'Queen', 'Rook', 'Bishop', 'Knight', 'Pawn']
    };
    const whitePanel = document.getElementById('white-pieces');
    const blackPanel = document.getElementById('black-pieces');
    whitePanel.innerHTML = '';
    blackPanel.innerHTML = '';

    function addSpecialImages(panel, color) {
        // Пончик
        const donut = document.createElement('img');
        donut.src = '/static/images/Donut.png';
        donut.alt = 'Пончик';
        donut.dataset.piece = 'Donut';
        donut.dataset.color = color;
        donut.addEventListener('click', () => {
            toggleSelection('Donut', color, donut.src, donut);
        });
        panel.appendChild(donut);

        // Мусорка
        const trash = document.createElement('img');
        trash.src = '/static/images/trash.png';
        trash.alt = 'Мусорка';
        trash.dataset.piece = 'trash';
        trash.dataset.color = color;
        trash.addEventListener('click', () => {
            toggleSelection('trash', color, trash.src, trash);
        });
        panel.appendChild(trash);
    }

    // Добавление стандартных фигур
    function addStandardPieces(panel, color) {
        pieces[color].forEach(piece => {
            const img = document.createElement('img');
            img.src = `/static/images/${color}/${piece}.png`;
            img.alt = `${color === 'white' ? 'Белая' : 'Чёрная'} ${piece}`;
            img.dataset.piece = piece;
            img.dataset.color = color;

            // Добавляем обработчик клика
            img.addEventListener('click', () => {
                toggleSelection(piece, color, img.src, img);
            });

            panel.appendChild(img);
        });
    }

    addStandardPieces(whitePanel, 'white');
    addSpecialImages(whitePanel, 'white');

    addStandardPieces(blackPanel, 'black');
    addSpecialImages(blackPanel, 'black');
}

function toggleSelection(pieceType, pieceColor, pieceSrc, element) {
    // Если клик по уже выбранной фигуре - сбрасываем выбор
    if (selectedPieceType === pieceType && selectedPieceColor === pieceColor) {
        selectedPieceType = null;
        selectedPieceColor = null;
        selectedPieceSrc = null;

        // Сбрасываем стили
        document.querySelectorAll('.piece-panel img').forEach(img => {
            img.classList.remove('panel-piece-selected');
        });

        return;
    }

    // Сбрасываем стили у всех элементов
    document.querySelectorAll('.piece-panel img').forEach(img => {
        img.classList.remove('panel-piece-selected');
    });

    // Добавляем стиль текущему элементу
    if (element && element.classList) {
        element.classList.add('panel-piece-selected');
    }

    // Устанавливаем новую выбранную фигуру
    selectedPieceType = pieceType;
    selectedPieceColor = pieceColor;
    selectedPieceSrc = pieceSrc;
}

// Обработка перехода между шагами
document.getElementById('next-step').addEventListener('click', function() {
    currentStep = 2;
    initialPosition = JSON.parse(JSON.stringify(currentPosition));
    updateStepUI();
});

document.getElementById('prev-step').addEventListener('click', function() {
    currentStep = 1;
    updateStepUI();
});

// Очистка решения (возврат к начальной позиции шага 2)
document.getElementById('clear-solution').addEventListener('click', function() {
    currentPosition = deepCopy(initialPosition);
    moveHistory = [];
    editorChessboard = deepCopy(initialPosition);
    console.log("initialPosition:\n", toString(initialPosition));
    renderChessboard(editorChessboard, editorIsFlipped, true);
    clearMoveHistory();
});

let selectedPieceType = null;
let selectedPieceColor = null;
let selectedPieceSrc = null;
let draggedFromBoard = false;

// Обновленная функция startPieceDrag
function startPieceDrag(e) {
    if (currentStep !== 1) return;

    // Сохраняем данные о фигуре
    const pieceType = e.target.dataset.piece;
    const pieceColor = e.target.dataset.color;
    const pieceSrc = e.target.src;

    // Устанавливаем текущую выбранную фигуру для кликов
    selectedPieceType = pieceType;
    selectedPieceColor = pieceColor;
    selectedPieceSrc = pieceSrc;

    // Если это мусорка или пончик - не запускаем драг
    if (pieceType === 'trash' || pieceType === 'Donut') return;

    // Создаем временную копию фигуры для перетаскивания
    const dragGhost = document.createElement('img');
    dragGhost.src = pieceSrc;
    dragGhost.style.position = 'fixed';
    dragGhost.style.zIndex = '1001';
    dragGhost.style.pointerEvents = 'none';
    dragGhost.style.width = '60px';
    dragGhost.style.height = '60px';
    dragGhost.style.left = `${e.clientX}px`;
    dragGhost.style.top = `${e.clientY}px`;
    document.body.appendChild(dragGhost);

    // Функция обновления позиции
    function dragMove(e) {
        // Центрируем изображение относительно курсора
        dragGhost.style.left = `${e.clientX - 30}px`;
        dragGhost.style.top = `${e.clientY - 30}px`;
    }

    // Функция завершения перетаскивания
    function dragEnd(e) {
        document.removeEventListener('mousemove', dragMove);
        document.removeEventListener('mouseup', dragEnd);
        document.body.removeChild(dragGhost);

        const squares = document.querySelectorAll('.square');
        let targetSquare = null;

        // Ищем клетку под курсором
        squares.forEach(square => {
            const rect = square.getBoundingClientRect();
            if (
                e.clientX >= rect.left &&
                e.clientX <= rect.right &&
                e.clientY >= rect.top &&
                e.clientY <= rect.bottom
            ) {
                targetSquare = square;
            }
        });

        // Добавляем фигуру на доску
        if (targetSquare) {
            const existingPiece = targetSquare.querySelector('.piece');
            if (existingPiece) existingPiece.remove();

            const newPiece = document.createElement('img');
            newPiece.src = pieceSrc;
            newPiece.dataset.piece = pieceType;
            newPiece.dataset.color = pieceColor;
            newPiece.classList.add('piece');
            targetSquare.appendChild(newPiece);
        }
    }

    // Подписываемся на события
    document.addEventListener('mousemove', dragMove);
    document.addEventListener('mouseup', dragEnd);
}

function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// Новая функция для обработки кликов по доске
function handleBoardClick(position) {
    if (currentStep !== 1 || !selectedPieceType || !selectedPieceColor) return;

    const square = document.getElementById(`editor-${position}`);
    if (!square) return;

    // Если это мусорка - удаляем
    if (selectedPieceType === 'trash') {
        const existing = square.querySelector('.piece');
        if (existing) existing.remove();
        delete currentPosition[position];
        return;
    }

    // Добавляем новую фигуру
    const existing = square.querySelector('.piece');
    if (existing) existing.remove();

    const newPiece = document.createElement('img');
    newPiece.src = selectedPieceSrc;
    newPiece.dataset.piece = selectedPieceType;
    newPiece.dataset.color = selectedPieceColor;
    newPiece.classList.add('piece');
    square.appendChild(newPiece);
    currentPosition[position] = {
        color: selectedPieceColor,
        fileName: selectedPieceType
    };
}

function updateChessboard(chessboard, fromPosition, toPosition) {
    const piece = chessboard[fromPosition];
    if (!piece) {
        console.error(`Нет фигуры на позиции ${fromPosition}`);
        return;
    }

    if (chessboard[toPosition]) {
        console.log('Фигура съедена:', chessboard[toPosition]);
    }

    delete chessboard[fromPosition];
    chessboard[toPosition] = piece;
    if (piece.hasMoved) {
        piece.hasMoved = true;
    }
}

function toString(board) {
    let result = '';

    for (let row = 8; row >= 1; row--) {
        for (let colCode = 'a'.charCodeAt(0); colCode <= 'h'.charCodeAt(0); colCode++) {
            const col = String.fromCharCode(colCode);
            const position = `${col}${row}`;
            const piece = board[position];

            if (piece && chessSymbols[piece.fileName]) {
                result += chessSymbols[piece.fileName][piece.color] + ' ';
            } else {
                result += '   ';
            }
        }
        result += '\n';
    }

    return result;
}



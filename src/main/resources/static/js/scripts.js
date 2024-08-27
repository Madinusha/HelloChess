// Пример использования
const chessboard = {
    "board": {
        "a1": {"color": "white", "hasMoved": false, "fileName": "Rook"},
        "a2": {"color": "white", "hasMoved": false, "fileName": "Pawn"},
        "a7": {"color": "black", "hasMoved": false, "fileName": "Pawn"},
        "a8": {"color": "black", "hasMoved": false, "fileName": "Rook"},
        "b1": {"color": "white", "fileName": "Knight"},
        "b2": {"color": "white", "hasMoved": false, "fileName": "Pawn"},
        "b7": {"color": "black", "hasMoved": false, "fileName": "Pawn"},
        "b8": {"color": "black", "fileName": "Knight"},
        "c1": {"color": "white", "fileName": "Bishop"},
        "c2": {"color": "white", "hasMoved": false, "fileName": "Pawn"},
        "c7": {"color": "black", "hasMoved": false, "fileName": "Pawn"},
        "c8": {"color": "black", "fileName": "Bishop"},
        "d1": {"color": "white", "fileName": "Queen"},
        "d2": {"color": "white", "hasMoved": false, "fileName": "Pawn"},
        "d7": {"color": "black", "hasMoved": false, "fileName": "Pawn"},
        "d8": {"color": "black", "fileName": "Queen"},
        "e1": {"color": "white", "hasMoved": false, "hasChecked": false, "fileName": "King"},
        "e2": {"color": "white", "hasMoved": false, "fileName": "Pawn"},
        "e7": {"color": "black", "hasMoved": false, "fileName": "Pawn"},
        "e8": {"color": "black", "hasMoved": false, "hasChecked": false, "fileName": "King"},
        "f1": {"color": "white", "fileName": "Bishop"},
        "f2": {"color": "white", "hasMoved": false, "fileName": "Pawn"},
        "f7": {"color": "black", "hasMoved": false, "fileName": "Pawn"},
        "f8": {"color": "black", "fileName": "Bishop"},
        "g1": {"color": "white", "fileName": "Knight"},
        "g2": {"color": "white", "hasMoved": false, "fileName": "Pawn"},
        "g7": {"color": "black", "hasMoved": false, "fileName": "Pawn"},
        "g8": {"color": "black", "fileName": "Knight"},
        "h1": {"color": "white", "hasMoved": false, "fileName": "Rook"},
        "h2": {"color": "white", "hasMoved": false, "fileName": "Pawn"},
        "h7": {"color": "black", "hasMoved": false, "fileName": "Pawn"},
        "h8": {"color": "black", "hasMoved": false, "fileName": "Rook"}
    }
};

document.addEventListener("DOMContentLoaded", function() {
    fetchChessboard().then(newChessboard => {
        renderChessboard(chessboard);
    });
    resizeBoard();
    buttonsInit();
});


function renderChessboard(chessboard) {
    const board = document.getElementById('chess-board');
    // Очистка доски перед новым рендерингом
    board.innerHTML = '';

    for (let row = 8; row >= 1; row--) {
        for (let col = 'a'; col <= 'h'; col = String.fromCharCode(col.charCodeAt(0) + 1)) {
            const position = col + row;
            const piece = chessboard.board[position];

            // Создание элемента для клетки
            const square = document.createElement('div');
            square.classList.add('square');
            square.id = `${col}${row}`;
            square.addEventListener('click', () => handleSquareClick(square.id));

            const isLight = (row + col.charCodeAt(0)) % 2 === 0;
            if (isLight) {
                square.classList.add('light');
            } else {
                square.classList.add('dark');
            }

            // Если фигура есть, создаем элемент для изображения
            if (piece) {
                const pieceElement = document.createElement('img');
                square.appendChild(pieceElement);
                pieceElement.classList.add('piece');
                pieceElement.src = `images/${piece.color}/${piece.fileName}.png`;
            }

            // Добавление клетки на доску
            board.appendChild(square);
        }
    }
}

function handleSquareClick(position) {
    const square = document.getElementById(position);
    const selectedSquare = document.querySelector('.selected');
    if (selectedSquare == square) {
        hideValidMove();
        return;
    }
    if (square.classList.contains('possible-move')) {
       hideValidMove();
       movePiece(selectedSquare, square);
    } else {
        if (!square.querySelector('.piece')) {
            hideValidMove();
            console.log("нет фигуры");
            return;
        }
        showValidMovesFrom(position);
    }
}

function getFigureAt(position) {
    return chessboard[position] || null;
}

function showValidMovesFrom(position) {
    console.log(`Clicked on position: ${position}`);
    hideValidMove();
    square = document.getElementById(position);
    square.classList.add('selected');

    // Отправляем запрос на сервер для получения возможных ходов
    getPossibleMoves(position).then(possibleMoves => {
        console.log('Possible moves:', possibleMoves);
        possibleMoves.forEach(targetPosition => {
            const targetSquare = document.getElementById(`${targetPosition.col}${targetPosition.row}`);
            if (targetSquare) {
                targetSquare.classList.add('possible-move');
            }
        });
    });
}

function hideValidMove() {
    document.querySelectorAll('.possible-move').forEach(square => {
        square.classList.remove('possible-move');
    });
    const selectedSquare = document.querySelector('.selected');
    if (selectedSquare) {
        selectedSquare.classList.remove('selected');
    }
}

function movePiece(selectedSquare, targetSquare) {
    // Получаем изображение фигуры
    const piece = selectedSquare.querySelector('.piece');
    console.log(piece.src);

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
        makeMove(selectedSquare.id, targetSquare.id);
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

    });
}

// Подключение к WebSocket
const socket = new SockJS('/ws');
const stompClient = Stomp.over(socket);

stompClient.connect({}, function (frame) {
    console.log('Connected: ' + frame);

    // Подписка на канал "/topic/promotion"
    stompClient.subscribe('/topic/promotion', function (message) {
        const position = JSON.parse(message.body); // Парсинг JSON, если нужно
        showPromotionMenu(position);
    });
}, function (error) {
    console.error('Ошибка при подключении в WebSocket:', error);
});

function showPromotionMenu(position) {
    console.log("showPromotionMenu");
}

// Функция для отображения диалога выбора фигуры
function showPromotionDialog(position) {
    // Например, вывод диалога с кнопками выбора
    const promotionDialog = document.getElementById('promotion-dialog');
    promotionDialog.style.display = 'block';

    // Пример обработки выбора фигуры пользователем
    document.querySelectorAll('.promotion-option').forEach(option => {
        option.addEventListener('click', function() {
            const selectedPiece = this.getAttribute('data-piece'); // выбранная фигура

            // Отправляем серверу информацию о выбранной фигуре и позиции
            sendPromotionChoice(position, selectedPiece);

            // Закрываем диалог
            promotionDialog.style.display = 'none';
        });
    });
}

// Функция для отправки выбора пользователя на сервер
function sendPromotionChoice(position, selectedPiece) {
    fetch('/api/chess/promotion', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ position: position, piece: selectedPiece })
    })
    .then(response => response.json())
    .then(data => {
        // Обновляем доску с новой фигурой
        renderChessboard(data);
    });
}


function buttonsInit() {
    const board = document.getElementById('chess-board');
    const chatBox = document.getElementById('chat-box');
    const chatBoxHeader = document.getElementById('chat-box-header');
    const chatBoxWindow = document.getElementById('chat-box-window');
    const chatBoxFooter = document.getElementById('chat-box-footer');
    const moveBox = document.getElementById('move-box');
    const toggleButton = document.getElementById('toggle-button');

    toggleButton.addEventListener('click', () => {
        if (chatBoxWindow.classList.contains('hidden')) {
            chatBoxWindow.classList.remove('hidden');
            chatBoxFooter.classList.remove('hidden');
            chatBox.classList.remove('collapsed');
        } else {
            chatBoxWindow.classList.add('hidden');
            chatBoxFooter.classList.add('hidden');
            chatBox.classList.add('collapsed');
        }
        toggleButton.classList.toggle('rotate');
        resizeBoard(); // Обновляем размеры после изменения состояния
    });

    const sendButton = document.getElementById('chat-box-send-button');
    const inputText = document.getElementById('chat-box-input-text');

    function addMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('my-message');
        messageDiv.textContent = message;
        chatBoxWindow.appendChild(messageDiv);
        chatBoxWindow.scrollTop = chatBoxWindow.scrollHeight; // Прокручиваем окно вниз
    }
    sendButton.addEventListener('click', () => {
        const message = inputText.value.trim();
        if (message !== "") {
            addMessage(message);
            inputText.value = ""; // Очистить поле ввода
        }
    });

    inputText.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            sendButton.click();
        }
    });

    const profileBox = document.getElementById('profile-box');
    const dropdownNavbar = document.getElementById('dropdown-navbar');

    profileBox.addEventListener('click', () => {
        dropdownNavbar.classList.toggle('show');
        profileBox.classList.toggle('active');
    });

    // Закрытие навбара при клике вне его области
    document.addEventListener('click', (event) => {
        if (!profileBox.contains(event.target) && !dropdownNavbar.contains(event.target)) {
            dropdownNavbar.classList.remove('show');
        }
    });
}


function resizeBoard() {
    const board = document.getElementById('chess-board');
    const chatBox = document.getElementById('chat-box');
    const chatBoxHeader = document.getElementById('chat-box-header');
    const chatBoxWindow = document.getElementById('chat-box-window');
    const chatBoxFooter = document.getElementById('chat-box-footer');
    const moveBox = document.getElementById('move-box');

    const squares = document.querySelectorAll('.square');
    const boardWidth = board.offsetWidth;
    const boardHeight = board.offsetHeight;
    const boardSize = Math.min(boardWidth, boardHeight);

    // Устанавливаем размеры доски
    board.style.width = `${boardSize}px`;
    board.style.height = `${boardSize}px`;

    const squareSize = boardSize / 8;

    squares.forEach(square => {
        square.style.width = `${squareSize}px`;
        square.style.height = `${squareSize}px`;
        square.style.fontSize = `${squareSize * 0.6}px`; // Пропорционально размеру клетки
    });

    if (!chatBox.classList.contains('collapsed')) {
        chatBox.style.height = `${boardSize}px`; // Высота равна высоте доски

    } else {
        chatBox.style.height = chatBoxHeader.style.height;
    }
    moveBox.style.height = `${boardSize}px`;

    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            if (entry.target === board) {
                resizeBoard();
            }
        }
    });

    window.addEventListener('resize', resizeBoard);
    resizeObserver.observe(board);
}

// Функция для получения возможных ходов
async function getPossibleMoves(position) {
    const response = await fetch(`/api/chess/possible-moves?position=${position}`);
    const possibleMoves = await response.json();
    return possibleMoves;
}

// Функция для выполнения хода
async function makeMove(fromPosition, toPosition) {
    const response = await fetch('/api/chess/make-move', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from: fromPosition,
            to: toPosition
        })
    });
    const result = await response.json();

    const newChessboard = result.chessboard;
    Object.keys(chessboard).forEach(key => delete chessboard[key]);
    Object.assign(chessboard, newChessboard);

    // Проверяем, есть ли информация о промоушене
    if (result.promotionRequired) {
        const promotionPosition = result.promotionPosition;
        // Показать меню выбора фигуры для промоушена
        showPromotionMenu(promotionPosition);
    }

    return chessboard;
}



async function fetchChessboard() {
    const response = await fetch('/api/chess/chessboard');
    const newChessboard = await response.json();

    // Очистили текущее содержимое объекта
    Object.keys(chessboard).forEach(key => delete chessboard[key]);

    // Обновили содержимое объекта новыми данными
    Object.assign(chessboard, newChessboard);

    return chessboard;
}



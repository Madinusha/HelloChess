// Пример использования
const chessboard = {
      "a1": { "fileName": "Rook", "color": "white", "hasMoved": false },
      "a2": { "fileName": "Pawn", "color": "white", "hasMoved": false },
      "a7": { "fileName": "Pawn", "color": "black", "hasMoved": false },
      "a8": { "fileName": "Rook", "color": "black", "hasMoved": false },
      "b1": { "fileName": "Knight", "color": "white" },
      "b2": { "fileName": "Pawn", "color": "white", "hasMoved": false },
      "b7": { "fileName": "Pawn", "color": "black", "hasMoved": false },
      "b8": { "fileName": "Knight", "color": "black" },
      "c1": { "fileName": "Bishop", "color": "white" },
      "c2": { "fileName": "Pawn", "color": "white", "hasMoved": false },
      "c7": { "fileName": "Pawn", "color": "black", "hasMoved": false },
      "c8": { "fileName": "Bishop", "color": "black" },
      "d1": { "fileName": "Queen", "color": "white" },
      "d2": { "fileName": "Pawn", "color": "white", "hasMoved": false },
      "d7": { "fileName": "Pawn", "color": "black", "hasMoved": false },
      "d8": { "fileName": "Queen", "color": "black" },
      "e1": { "fileName": "King", "color": "white", "hasMoved": false, "hasChecked": false },
      "e2": { "fileName": "Pawn", "color": "white", "hasMoved": false },
      "e7": { "fileName": "Pawn", "color": "black", "hasMoved": false },
      "e8": { "fileName": "King", "color": "black", "hasMoved": false, "hasChecked": false },
      "f1": { "fileName": "Bishop", "color": "white" },
      "f2": { "fileName": "Pawn", "color": "white", "hasMoved": false },
      "f7": { "fileName": "Pawn", "color": "black", "hasMoved": false },
      "f8": { "fileName": "Bishop", "color": "black" },
      "g1": { "fileName": "Knight", "color": "white" },
      "g2": { "fileName": "Pawn", "color": "white", "hasMoved": false },
      "g7": { "fileName": "Pawn", "color": "black", "hasMoved": false },
      "g8": { "fileName": "Knight", "color": "black" },
      "h1": { "fileName": "Rook", "color": "white", "hasMoved": false },
      "h2": { "fileName": "Pawn", "color": "white", "hasMoved": false },
      "h7": { "fileName": "Pawn", "color": "black", "hasMoved": false },
      "h8": { "fileName": "Rook", "color": "black", "hasMoved": false }
};
const promoteMenuPieces = {
    "1": { "fileName": "Queen"},
    "2": { "fileName": "Bishop", "hasMoved": false },
    "3": { "fileName": "Rook", "hasMoved": false },
    "4": { "fileName": "Knight"}
}
function updateChessboard(chessboard, fromPosition, toPosition) {
    const piece = chessboard.board[fromPosition];
    if (!piece) {
        console.error(`Нет фигуры на позиции ${fromPosition}`);
        return;
    }
    // Удаляем фигуру с исходной позиции
    delete chessboard.board[fromPosition];
    chessboard.board[toPosition] = piece;

}


document.addEventListener("DOMContentLoaded", function() {
    fetchChessboard().then(newChessboard => {
        renderChessboard(chessboard);
        console.log(chessboard);
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
            console.log("piece: ", piece);

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
    if (square.classList.contains('possible-move') || square.classList.contains('possible-move-on-piece')) {
       hideValidMove();
       makeMove(selectedSquare.id, square.id);
    } else {
        if (!square.querySelector('.piece')) {
            hideValidMove();
            console.log("нет фигуры");
            return;
        }
        showValidMovesFrom(position);
    }
}

function getPieceAt(position) {
    return chessboard.board[position] || null;
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
                if (chessboard.board[targetSquare.id]) {
                    targetSquare.classList.add('possible-move-on-piece');
                } else targetSquare.classList.add('possible-move');
            }
        });
    });
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

function movePiece(positionFrom, positionTo) {
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

    });
}

function showPromotionMenu(fromPosition, targetPosition) {
//     from - переменная типа стринг
//     targetPosition - переменная типа Position

    // Создаем промис, который завершится, когда будет сделан выбор
    return new Promise((resolve) => {
        const posToStr = targetPosition.col + parseInt(targetPosition.row);
        const playerColor = getPieceAt(fromPosition).color;
        const dir = targetPosition.row === 1 ? 1 : -1;

        document.querySelectorAll('.square').forEach(square => {
            square.classList.add('no-click');
        });

        for (let i = 0; i < 4; i++) {
            const squareId = targetPosition.col + ((parseInt(targetPosition.row) + i * dir));
            const square = document.getElementById(squareId);

            const button = document.createElement('button');
            button.classList.add('promote-button');

            const piece = promoteMenuPieces[(i + 1).toString()];
            piece.color = playerColor;
            const pieceElement = document.createElement('img');
            button.appendChild(pieceElement);
            pieceElement.classList.add('piece');
            pieceElement.src = `images/${playerColor}/${piece.fileName}.png`;
            square.appendChild(button);

            // Добавляем обработчик нажатия кнопки
            button.addEventListener('click', () => {
                sendPromotionChoice(posToStr, piece.fileName);
                const targetSquare = document.getElementById(posToStr);
                const fromSquare = document.getElementById(fromPosition);
                const fromPawnPiece = fromSquare.querySelector('img');
                if (fromPawnPiece) {
                    fromPawnPiece.remove();
                }
                const targetPawnPiece = targetSquare.querySelector('img');
                if (targetPawnPiece) {
                    targetPawnPiece.remove();
                }
                targetSquare.appendChild(pieceElement);
                // Убираем все кнопки после выбора
                document.querySelectorAll('.promote-button').forEach(button => {
                    button.remove();
                });
                document.querySelectorAll('.square').forEach(square => {
                    square.classList.remove('no-click');
                });
                // Разрешаем промис, передавая выбранную фигуру
                resolve(piece);
            });
        }
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

let moveCount = 0; // Счетчик ходов
function addMoveToBox(fromPosition, toPosition) {
    const moveBox = document.getElementById('move-box-window');
    const moveNumbers = document.getElementById('move-numbers');
    const whiteMoves = document.getElementById('white-moves');
    const blackMoves = document.getElementById('black-moves');

    // Форматируем ход как строку "e2-e4"
    const move = fromPosition + '-' + toPosition;

    const currentMoveBox = moveBox.querySelector('.current');
    if (currentMoveBox) {
        currentMoveBox.classList.remove('current');
    }

    // Проверяем, чей ход
    if (moveCount % 2 === 0) { // Ход белых
        const moveNumber = Math.floor(moveCount / 2) + 1;
        const numberElement = document.createElement('div');
        numberElement.classList.add('move-box-row');
        numberElement.textContent = moveNumber + '.';
        moveNumbers.appendChild(numberElement);
        // Добавляем ход белых
        const whiteMoveElement = document.createElement('div');
        whiteMoveElement.classList.add('current', 'move-box-row', 'to-bord');
        whiteMoveElement.textContent = move;
        whiteMoves.appendChild(whiteMoveElement);
        moveBox.scrollTop = moveBox.scrollHeight;
    } else { // Ход черных
        const blackMoveElement = document.createElement('div');
        blackMoveElement.textContent = move;
        blackMoveElement.classList.add('current', 'move-box-row');
        blackMoves.appendChild(blackMoveElement);
    }

    moveCount++;
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
    if (result.draw) {
        console.log("draw");
        movePiece(fromPosition, toPosition);
        updateChessboard(chessboard, fromPosition, toPosition);
        addMoveToBox(fromPosition, toPosition);
    } else if (result.victory) {
        console.log("winer is ");
        movePiece(fromPosition, toPosition);
        updateChessboard(chessboard, fromPosition, toPosition);
        addMoveToBox(fromPosition, toPosition);
    } else if (result.promotePawn) {
        const promotionPosition = result.promotePawn.position;
        const promotedPiece = await showPromotionMenu(fromPosition, promotionPosition);
        console.log("Выбрана фигура для промоушена: ", promotedPiece);
        updateChessboard(chessboard, fromPosition, toPosition);
        chessboard.board[toPosition] = promotedPiece;
        addMoveToBox(fromPosition, toPosition);
    } else if (result.castling) {
        console.log("рокировка!");
        const { from: rookFrom, to: rookTo } = result.castling;
        console.log(rookFrom, rookTo);
        movePiece(fromPosition, toPosition);
        movePiece(rookFrom.col + rookFrom.row, rookTo.col + rookTo.row);
        updateChessboard(chessboard, rookFrom.col + rookFrom.row, rookTo.col + rookTo.row);
        updateChessboard(chessboard, fromPosition, toPosition);
        addMoveToBox(fromPosition, toPosition);
    } else {
        movePiece(fromPosition, toPosition);
        updateChessboard(chessboard, fromPosition, toPosition);
        addMoveToBox(fromPosition, toPosition);
    }

    return chessboard;
}

async function sendPromotionChoice(position, selectedPieceType) {
    const response = await fetch('/api/chess/promotion', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            position: position,
            newPieceType: selectedPieceType
        })
    }).catch(error => {
        console.error('Ошибка при отправке запроса на промоушен:', error.message);
    });
    const result = await response.json();


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



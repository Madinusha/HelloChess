window.WebSocketManager = WebSocketManager;

let wsManager = null;
let timer1Interval;
let timer2Interval;
let activeTimer = null;

// Пример использования
let chessboard;
const promoteMenuPieces = {
    "1": { "fileName": "Queen"},
    "2": { "fileName": "Bishop", "hasMoved": false },
    "3": { "fileName": "Rook", "hasMoved": false },
    "4": { "fileName": "Knight"}
}
let myColor = "WHITE";
let currentPlayerColor = "WHITE";
const chessSymbols = {
    "King": { "white": "♔", "black": "♚" },
    "Queen": { "white": "♕", "black": "♛" },
    "Rook": { "white": "♖", "black": "♜" },
    "Bishop": { "white": "♗", "black": "♝" },
    "Knight": { "white": "♘", "black": "♞" },
    "Pawn": { "white": "♙", "black": "♟" }
};
const csrfToken = document.querySelector("meta[name='_csrf']").content;
const csrfHeader = document.querySelector("meta[name='_csrf_header']").content;

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('sessionId');

    if (!sessionId) {
        console.error('Session ID not found!');
        return;
    }

    try {
        wsManager = new WebSocketManager();
        await wsManager.connectWithSession(sessionId);
        console.log(`WebSocket connected for session: ${sessionId}`);

        fetch(`/api/game/${sessionId}/status`, {
            method: 'GET',
            headers: {
                [csrfHeader]: csrfToken
            }
        })
           .then(response => {
               if (!response.ok) {
                   throw new Error(`Failed to fetch game status: ${response.status}`);
               }
               return response.json();
           })
           .then(gameStatus => {
               if (!gameStatus) {
                   console.error('Invalid game status response:', gameStatus);
                   alert("Ошибка при загрузке состояния игры!");
                   return;
               }
               initializeGameUI(gameStatus);
           })
           .catch(error => {
               console.error('Failed to fetch game status:', error.message);
               if (error.message.includes("404")) {
                   alert("Игра не найдена или недоступна!");
               } else {
                   alert("Произошла ошибка при загрузке игры!");
               }
           });
    } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
    }
});

function initializeGameUI(gameStatus) {
    if (!gameStatus) {
        console.error('Invalid game status response!');
        return;
    }
    console.log("gameStatus: ", gameStatus);

    chessboard = gameStatus.chessboard.board;
    currentPlayerColor = gameStatus.currentPlayerColor;
    const moveHistory = gameStatus.moveHistory;
    const whiteTime = gameStatus.whiteTime;
    const blackTime = gameStatus.blackTime;
    const gameResult = gameStatus.gameResult;

    fillPageValues(gameStatus);

    // Рендерим доску
    console.log("myColor: ", myColor);
    renderChessboard(chessboard, myColor === "BLACK");
//    resizeBoard();
    buttonsInit();

    // Обновляем таймеры
    updateTimers(whiteTime, blackTime);

    // Проверяем результат игры
    if (gameResult) {
        handleGameResult(gameResult);
    }

    // Если требуется промоушен
    if (gameStatus.promotionRequired) {
        showPromotionMenu(gameStatus.promotionPosition.col + gameStatus.promotionPosition.row);
    }

    // Если возможна рокировка
    if (gameStatus.castlingPossible) {
        highlightCastlingOptions(gameStatus.castlingData);
    }

    // Отображаем историю ходов
    moveHistory.forEach(move => addMoveToBox(move.from, move.to));
}

function fillPageValues(gameStatus){
    const currentUser = document.getElementById('profile-box-nickname').innerText;
    const whitePlayer = gameStatus.whitePlayerUsername;
    const blackPlayer = gameStatus.blackPlayerUsername;

    let userNickname, opponentNickname;
    console.log("currentUser: ", currentUser);
    if (currentUser === whitePlayer) {
        userNickname = whitePlayer;
        myColor = "WHITE";
        opponentNickname = blackPlayer;
    } else {
        userNickname = blackPlayer;
        myColor = "BLACK";
        opponentNickname = whitePlayer;
    }

    console.log("userNickname ", userNickname)
    console.log("opponentNickname ", opponentNickname)

    // Обновляем интерфейс
    const nicknameElements = document.querySelectorAll('.mb-nickname');
    nicknameElements[0].textContent = opponentNickname; // Оппонент (верхний блок)
    nicknameElements[1].textContent = userNickname;     // Пользователь (нижний блок)

    // Обновляем заголовок чата
    const chatHeader = document.getElementById('chat-box-header');
    chatHeader.innerHTML = `Чат с ${opponentNickname}<button id="toggle-button"></button>`;

}

function handleGameUpdate(data) {
    if (data.type === 'move') {
        handleMove(data);
    } else if (data.type === 'timer') {
        updateTimers(data.whiteTime, data.blackTime);
    } else if (data.type === 'gameResult') {
        handleGameResult(data.result);
    } else if (data.type === 'possible-moves') {
        showValidMovesFor(data.position, data.possibleMoves);
    }
}

function updateChessboard(chessboard, fromPosition, toPosition) {
    const piece = chessboard[fromPosition];
    if (!piece) {
        console.error(`Нет фигуры на позиции ${fromPosition}`);
        return;
    }
    // Удаляем фигуру с исходной позиции
    delete chessboard[fromPosition];
    chessboard[toPosition] = piece;

}

function renderChessboard(chessboard, isFlipped = false) {
    const board = document.getElementById('chess-board');
    board.innerHTML = '';

    const rows = isFlipped
        ? [1, 2, 3, 4, 5, 6, 7, 8]
        : [8, 7, 6, 5, 4, 3, 2, 1];

    const cols = isFlipped
        ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a']
        : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    for (const row of rows) {
        for (const col of cols) {
            const position = col + row;
            const piece = chessboard[position];
            const isLight = (row + col.charCodeAt(0)) % 2 !== 0;

            const square = document.createElement('div');
            square.className = `square ${isLight ? 'light' : 'dark'}`;
            square.id = position;

            // Добавляем номер строки
            if (col === cols[7]) {
                const rowLabel = document.createElement('div');
                rowLabel.className = `coordinate row-label ${isLight ? 'light-label' : 'dark-label'}`;
                rowLabel.textContent = row;
                square.appendChild(rowLabel);
            }

            // Добавляем букву столбца
            if (row === rows[rows.length - 1]) {
                const colLabel = document.createElement('div');
                colLabel.className = `coordinate col-label ${isLight ? 'light-label' : 'dark-label'}`;
                colLabel.textContent = col;
                square.appendChild(colLabel);
            }

            if (piece) {
                const img = document.createElement('img');
                img.className = 'piece';
                img.src = `/static/images/${piece.color}/${piece.fileName}.png`;
                square.appendChild(img);
            }

            square.addEventListener('click', () => handleCellClick(position));
            board.appendChild(square);
        }
    }
}

function handleCellClick(position) {
    const square = document.getElementById(position);
    const selectedSquare = document.querySelector('.selected');
    if (selectedSquare == square) {
        hideValidMove();
        return;
    }
    if (square.classList.contains('possible-move') || square.classList.contains('possible-move-on-piece')) {
       hideValidMove();
       wsManager.makeMove(selectedSquare.id, square.id);
    } else {
        if (!square.querySelector('.piece')) {
            hideValidMove();
            console.log("нет фигуры");
            return;
        }
        wsManager.getPossibleMoves(position);
    }
}

function getPieceAt(position) {
    return chessboard[position] || null;
}

function showValidMovesFor(position, possibleMoves) {
    console.log("position in showValidMovesFor: ", position);
    console.log(`Clicked on position: ${position}`);
    hideValidMove();
    square = document.getElementById(`${position.col}${position.row}`);
    square.classList.add('selected');

    possibleMoves.forEach(targetPosition => {
        const targetSquare = document.getElementById(`${targetPosition.col}${targetPosition.row}`);
        if (targetSquare) {
            if (chessboard[targetSquare.id]) {
                targetSquare.classList.add('possible-move-on-piece');
            } else targetSquare.classList.add('possible-move');
        }
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

function animateMove(positionFrom, positionTo) {
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

            const color = (targetPiece.src).includes("/white/") ? "white" : "black";
            const lastSlashIndex = (targetPiece.src).lastIndexOf('/');
            const pngIndex = (targetPiece.src).lastIndexOf('.png');
            // Извлекаем строку между ними
            const pieceName = (targetPiece.src).substring(lastSlashIndex + 1, pngIndex);
            const pieceSymbol = chessSymbols[pieceName][color];

            if (color == myColor.toLowerCase()) {
                document.getElementById("opponent").textContent  += pieceSymbol;
            } else {
                document.getElementById("me").textContent  += pieceSymbol;
            }

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
            pieceElement.src = `/static/images/${playerColor}/${piece.fileName}.png`;
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

function showGameResult(result) {
    const resultElement = document.getElementById('result-container');
    const scaleElement = document.getElementById('scale');
    const resultTextElement = document.getElementById('result');
    if (result == "draw") {
        resultTextElement.textContent = "Ничья.";
        scaleElement.textContent = "½ - ½";
    } else if (result == "white"){
        resultTextElement.textContent = "Победа белых.";
        scaleElement.textContent = "1 - 0";
    } else if (result == "black"){
        resultTextElement.textContent = "Победа черных.";
        scaleElement.textContent = "0 - 1";
    }
    resultElement.style.visibility = "visible";

    const retry = document.getElementById('retry');
    const findOpponent = document.getElementById('find-opponent');
    const whiteFlag = document.getElementById('white-flag');
    const draw = document.getElementById('draw');

    retry.style.display = "flex";
    findOpponent.style.display = "flex";
    whiteFlag.style.display = "none";
    draw.style.display = "none";
}

let resizeTimeout;

function debounceResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resizeBoard, 100); // Вызов resizeBoard через 100 мс после последнего изменения размера
}

function resizeBoard() {
    const board = document.getElementById('chess-board');
    const chatBox = document.getElementById('chat-box');
    const chatBoxHeader = document.getElementById('chat-box-header');
    const moveBox = document.getElementById('move-box');

    // Замеряем размеры вне RAF для актуальных значений
    const boardSize = Math.min(
        board.parentElement.offsetWidth,
        board.parentElement.offsetHeight
    );

    requestAnimationFrame(() => {
        board.style.width = `${boardSize}px`;
        board.style.height = `${boardSize}px`;

        const squareSize = boardSize / 8;
        document.documentElement.style.setProperty('--square-size', `${squareSize}px`);

        // Устанавливаем высоту чата и окна ходов
        if (!chatBox.classList.contains('collapsed')) {
            chatBox.style.height = `${boardSize}px`;
        } else {
            chatBox.style.height = `${chatBoxHeader.offsetHeight}px`;
        }
        moveBox.style.height = `${boardSize}px`;
    });
    const resizeObserver = new ResizeObserver(entries => {
        // Дебаунсим вызовы
        let timeout;
        clearTimeout(timeout);
        timeout = setTimeout(resizeBoard, 100);
    });

    window.addEventListener('resize', () => {
        requestAnimationFrame(resizeBoard);
    });
//    const board = document.getElementById('chess-board');
    resizeObserver.observe(board.parentElement);
}




// Обновление отображения таймера
function updateTimerDisplay(timerId, time) {
    const timer = document.getElementById(timerId);
    let minutes = Math.floor(time / 60000); // Минуты
    let seconds = Math.floor((time % 60000) / 1000); // Секунды
    let tenths = Math.floor((time % 1000) / 100); // Десятые доли секунды

    // Отображаем десятые доли только если время <= 5 секунд
    if (time <= 5000) {
        timer.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${tenths}`;
    } else {
        timer.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    // Изменяем цвет фона при критическом времени
    if (time <= 5000) {
        timer.style.backgroundColor = "orange";
    } else {
        timer.style.backgroundColor = "";
    }
}

// Запуск таймера
function startTimer(timerId, time) {
    clearInterval(timer1Interval);
    clearInterval(timer2Interval);
    activeTimer = timerId;

    const interval = setInterval(() => {
        if (time > 0) {
            time -= 10; // Уменьшаем время на 10 мс (1/100 секунды)
            updateTimerDisplay(timerId, time);
        } else {
            clearInterval(interval); // Остановить таймер, когда время истечет
            if (timerId == "timer1") {
                showGameResult("black"); // Белые проиграли по времени
            } else if (timerId == "timer2") {
                showGameResult("white"); // Черные проиграли по времени
            }
            activeTimer = null; // Сброс активного таймера
        }
    }, 10);

    if (timerId === 'timer1') {
        timer1Interval = interval;
    } else if (timerId === 'timer2') {
        timer2Interval = interval;
    }
}

// Обновление таймеров на основе данных с сервера
function updateTimers(whiteTime, blackTime) {
    const whiteTimer = document.getElementById("timer1");
    const blackTimer = document.getElementById("timer2");

    // Конвертируем время из строкового формата в миллисекунды
    function parseTime(timeStr) {
        const parts = timeStr.split(':');
        const minutes = parseInt(parts[0], 10);
        const seconds = parseInt(parts[1], 10);
        const tenths = parts[2] ? parseInt(parts[2], 10) : 0;
        return (minutes * 60 + seconds) * 1000 + tenths * 100;
    }

    const parsedWhiteTime = parseTime(whiteTime);
    const parsedBlackTime = parseTime(blackTime);

    // Обновляем отображение таймеров
    updateTimerDisplay("timer1", parsedWhiteTime);
    updateTimerDisplay("timer2", parsedBlackTime);

    if (currentPlayerColor === "WHITE" && activeTimer !== "timer1") {
        startTimer("timer1", parsedWhiteTime);
    } else if (currentPlayerColor === "BLACK" && activeTimer !== "timer2") {
        startTimer("timer2", parsedBlackTime);
    }
}

// Функция для выполнения хода
function handleMove(move) {
    console.log("move: ", move);
    const result = move.moveResult;
    const fromPosition = `${move.move.from.col}${move.move.from.row}`;
    const toPosition = `${move.move.to.col}${move.move.to.row}`;
    if (result.draw) {
        console.log("draw");
        animateMove(fromPosition, toPosition);
        updateChessboard(chessboard, fromPosition, toPosition);
        addMoveToBox(fromPosition, toPosition);
        showGameResult("draw");
    } else if (result.victory) {
        console.log("winer is ");
        animateMove(fromPosition, toPosition);
        updateChessboard(chessboard, fromPosition, toPosition);
        addMoveToBox(fromPosition, toPosition);
        showGameResult(result.victory.winner);
    } else if (result.promotePawn) {
//        const promotionPosition = result.promotePawn.position;
//        const promotedPiece = await showPromotionMenu(fromPosition, promotionPosition);
//        console.log("Выбрана фигура для промоушена: ", promotedPiece);
//        updateChessboard(chessboard, fromPosition, toPosition);
//        chessboard[toPosition] = promotedPiece;
//        addMoveToBox(fromPosition, toPosition);
    } else if (result.castling) {
        console.log("рокировка!");
        const { from: rookFrom, to: rookTo } = result.castling;
        console.log(rookFrom, rookTo);
        animateMove(fromPosition, toPosition);
        animateMove(rookFrom.col + rookFrom.row, rookTo.col + rookTo.row);
        updateChessboard(chessboard, rookFrom.col + rookFrom.row, rookTo.col + rookTo.row);
        updateChessboard(chessboard, fromPosition, toPosition);
        addMoveToBox(fromPosition, toPosition);
    } else {
        animateMove(fromPosition, toPosition);
        updateChessboard(chessboard, fromPosition, toPosition);
        addMoveToBox(fromPosition, toPosition);
    }
//    resumeTimer();

    return chessboard;
}

//async function sendPromotionChoice(position, selectedPieceType) {
//    const response = await fetch('/api/chess/promotion', {
//        method: 'POST',
//        headers: {
//            'Content-Type': 'application/json',
//            [csrfHeader]: csrfToken
//        },
//        body: JSON.stringify({
//            position: position,
//            newPieceType: selectedPieceType
//        })
//    }).catch(error => {
//        console.error('Ошибка при отправке запроса на промоушен:', error.message);
//    });
//    const result = await response.json();
//}

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

let stompClient = null;
let sessionId = null;

function updateMoveHistory(moveHistory) {
    const whiteMoves = document.getElementById('white-moves');
    const blackMoves = document.getElementById('black-moves');
    const moveNumbers = document.getElementById('move-numbers');

    // Очищаем текущую историю
    whiteMoves.innerHTML = '';
    blackMoves.innerHTML = '';
    moveNumbers.innerHTML = '';

    // Перерисовываем историю
    moveHistory.forEach((move, index) => {
        const moveNumber = Math.floor(index / 2) + 1;
        if (index % 2 === 0) {
            addMoveToBox(move.from, move.to, 'white');
        } else {
            addMoveToBox(move.from, move.to, 'black');
        }
    });
}

function handlePromotion(promotionData) {
    showPromotionMenu(promotionData.from, promotionData.to)
        .then(selectedPiece => {
            stompClient.send(`/app/game/${sessionId}/promotion`, {},
                JSON.stringify({
                    position: promotionData.position,
                    pieceType: selectedPiece
                })
            );
        });
}

function handleCastling(castlingData) {
    animateMove(castlingData.king.from, castlingData.king.to);
    animateMove(castlingData.rook.from, castlingData.rook.to);
    addMoveToBox(castlingData.king.from, castlingData.king.to);
}

function handleGameResult(result) {
    if (result.draw) {
        showGameResult('draw');
    } else if (result.winner === 'white') {
        showGameResult('white');
    } else if (result.winner === 'black') {
        showGameResult('black');
    }
}

function sendPromotionChoice(position, pieceType) {
    stompClient.send(`/app/game/${sessionId}/promotion`, {},
        JSON.stringify({ position: position, pieceType: pieceType }));
}




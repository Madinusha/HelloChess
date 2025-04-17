window.WebSocketManager = WebSocketManager;

let wsManager = null;
const timerState = {
    white: 0,
    black: 0,
    interval: null
};

// Пример использования
let chessboard;
let chessboardHistory = [];
let eatenPieces = [];
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
    chessboardHistory = gameStatus.chessboard.boardHistory;
    currentPlayerColor = gameStatus.currentPlayerColor;
    eatenPieces = gameStatus.eatenPieces;
    const moveHistory = gameStatus.moveHistory;
    console.log("moveHistory: ", moveHistory);
    const whiteTime = gameStatus.whiteTime;
    const blackTime = gameStatus.blackTime;
    const timerActive = gameStatus.timerActive;
    const gameResult = gameStatus.gameResult;

    fillPageValues(gameStatus);

    // Рендерим доску
    console.log("myColor: ", myColor);
    renderChessboard(chessboard, myColor === "BLACK");
    buttonsInit();

    // Обновляем таймеры
    console.log("timerActive ", timerActive);
    updateTimers(whiteTime, blackTime, timerActive);

//    // Проверяем результат игры
//    if (gameResult) {
//        handleGameResult(gameResult);
//    }

//    // Если требуется промоушен
//    if (gameStatus.promotionRequired) {
//        showPromotionMenu(gameStatus.promotionPosition.col + gameStatus.promotionPosition.row);
//    }

//    // Если возможна рокировка
//    if (gameStatus.castlingPossible) {
//        highlightCastlingOptions(gameStatus.castlingData);
//    }
}

function fillPageValues(gameStatus){
    const currentUser = document.getElementById('profile-box-nickname').innerText;
    const whitePlayer = gameStatus.whitePlayerDTO;
    const blackPlayer = gameStatus.blackPlayerDTO;
    const chat = gameStatus.chatDTO;
    showChat(chat);
    showMoveHistory(gameStatus.moveHistory);

    let userNickname, opponentNickname;
    let userRating, opponentRating;

    userNickname = whitePlayer.nickname;
    userRating = whitePlayer.rating;
    opponentNickname = blackPlayer.nickname;
    opponentRating = blackPlayer.rating;
    if (currentUser === blackPlayer.nickname) {
        myColor = "BLACK";
        [userNickname, opponentNickname] = [opponentNickname, userNickname];
        [userRating, opponentRating] = [opponentRating, userRating];
    }

//    console.log("userNickname ", userNickname)
//    console.log("opponentNickname ", opponentNickname)

    // Обновляем интерфейс
    const nicknameElements = document.querySelectorAll('.mb-nickname');
    nicknameElements[0].textContent = opponentNickname; // Оппонент (верхний блок)
    nicknameElements[1].textContent = userNickname;     // Пользователь (нижний блок)

    const ratingElements = document.querySelectorAll('.mb-rating');
    ratingElements[0].textContent = opponentRating; // Оппонент (верхний блок)
    ratingElements[1].textContent = userRating;     // Пользователь (нижний блок)

//    const timerElements = document.querySelectorAll('.mb-timer');
//    timerElements[0].id = "timer2"; // Оппонент (верхний блок)
//    timerElements[1].id = "timer1";     // Пользователь (нижний блок)

    const userTimerId = myColor === "WHITE" ? "timer1" : "timer2";
    const opponentTimerId = myColor === "WHITE" ? "timer2" : "timer1";

    // Сохраняем в глобальной переменной или объекте состояния
    window.timerSettings = {
        userTimer: document.getElementById(userTimerId),
        opponentTimer: document.getElementById(opponentTimerId)
    };

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
    const resizeHandle = document.createElement('div');
    resizeHandle.id = 'resize-handle';
    board.appendChild(resizeHandle);

    let isResizing = false;
    let startX, startY, startWidth, startHeight;

    resizeHandle.addEventListener('mousedown', function(e) {
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = board.offsetWidth;
        startHeight = board.offsetHeight;
        e.preventDefault();
    });

    document.addEventListener('mousemove', function resize(e) {
        if (!isResizing) return;

        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        const computedStyle = getComputedStyle(board);

        let newWidth = startWidth + deltaX;
        newWidth = Math.max(
            parseFloat(computedStyle.minWidth),
            Math.min(newWidth, parseFloat(computedStyle.maxWidth))
        );

        board.style.width = `${newWidth}px`;
        board.style.height = `${newWidth}px`; // Сохраняем пропорции
        const boardSize = board.offsetWidth;

        const chatBox = document.getElementById('chat-box');
        const chatBoxHeader = document.getElementById('chat-box-header');
        const moveBox = document.getElementById('move-box');
        // Устанавливаем высоту чата и окна ходов
        if (!chatBox.classList.contains('collapsed')) {
            chatBox.style.height = `${boardSize}px`;
        } else {
            chatBox.style.height = chatBoxHeader.offsetHeight + 'px';
        }
        moveBox.style.height = `${boardSize}px`;
    });

    document.addEventListener('mouseup', () => isResizing = false);
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
       makeMove(selectedSquare.id, square.id);
    } else {
        if (!square.querySelector('.piece') || getPieceAt(position).color !== myColor.toLowerCase()) {
            hideValidMove();
            console.log("Нет вашей фигуры");
            return;
        }
        wsManager.getPossibleMoves(position);
    }
}

function makeMove(positionFrom, positionTo) {
    const piece = getPieceAt(positionFrom);
    if (piece.fileName === "Pawn") {
        const targetRank = positionTo[1]; // Получаем номер строки (например "8" или "1")
        const isPromotionRequired =
            (piece.color === "white" && targetRank === "8") ||
            (piece.color === "black" && targetRank === "1");
        if (isPromotionRequired) {
            showPromotionMenu(positionFrom, positionTo)
                .then(selectedPiece => {
                    if (selectedPiece) {
                        wsManager.makeMove(positionFrom, positionTo, selectedPiece);
                    } else {
                        console.log("Пользователь отменил выбор превращения");
                    }
                })
                .catch(error => {
                    console.error("Ошибка при выборе превращения:", error);
                });
            return;
        }
    }
    wsManager.makeMove(positionFrom, positionTo);
}

function getPieceAt(position) {
    return chessboard[position] || null;
}

function showValidMovesFor(position, possibleMoves) {
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
    return new Promise((resolve) => {
        console.log("positionFrom ", positionFrom);
        console.log("positionTo ", positionTo);
        document.querySelectorAll('.in-check').forEach(sq => {
            sq.classList.remove('in-check');
        });
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

function showPromotionMenu(positionFrom, positionTo) {
    const playerColor = getPieceAt(positionFrom).color;
    const dir = positionTo.row === 1 ? 1 : -1;

    return new Promise((resolve) => {
        document.querySelectorAll('.square').forEach(square => {
            square.classList.add('no-click');
        });

        for (let i = 0; i < 4; i++) {
            const squareId = positionTo[0] + ((parseInt(positionTo[1]) + i * dir));
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
                // Убираем все кнопки после выбора
                document.querySelectorAll('.promote-button').forEach(button => {
                    button.remove();
                });
                document.querySelectorAll('.square').forEach(square => {
                    square.classList.remove('no-click');
                });
                resolve(piece.fileName);
            });
        }
    });
}

async function finishPromotion(positionFrom, positionTo, newPiece) {
    await animateMove(positionFrom, positionTo);
    const targetCell = document.getElementById(positionTo);
    const targetPawnPiece = targetCell.querySelector('img');
    targetPawnPiece.remove();
    const pieceElement = document.createElement('img');
    pieceElement.classList.add('piece');
    pieceElement.src = `/static/images/${newPiece.color}/${newPiece.fileName}.png`;
    targetCell.appendChild(pieceElement);
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
        chatBox.classList.toggle('collapsed');
        chatBoxWindow.classList.toggle('hidden');
        chatBoxFooter.classList.toggle('hidden');
        toggleButton.classList.toggle('rotate');
        resizeBoard();
    });

    const sendButton = document.getElementById('chat-box-send-button');
    const inputText = document.getElementById('chat-box-input-text');

    function sendMessage(message) {
        wsManager.sendMessage(message);
        addMessage(message, false);
    }
    sendButton.addEventListener('click', () => {
        const message = inputText.value.trim();
        if (message !== "") {
            sendMessage(message);
            inputText.value = "";
        }
    });

    inputText.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            sendButton.click();
        }
    });

    const retryButton = document.getElementById('retry');
    const findOpponentButton = document.getElementById('find-opponent');
    const whiteFlagButton = document.getElementById('white-flag');
    const drawButton = document.getElementById('draw');

    retryButton.addEventListener('click', () => {
        handleRetryButtonClick();
    });

    findOpponentButton.addEventListener('click', () => {
        handleFindOpponentButtonClick();
    });
}

async function handleFindOpponentButtonClick() {
    const button = document.getElementById('find-opponent');
    if (!wsManager) {
        console.error('WebSocket is not initialized!');
        return;
    }
    try {
        button.classList.add('loading');
        button.disabled = true;
        const { color, timeControl } = await new Promise((resolve, reject) => {
            const subscription = wsManager.stompClient.subscribe(
                '/user/queue/initial-params',
                (message) => {
                    try {
                        subscription.unsubscribe();
                        const gameRequest = JSON.parse(message.body);
                        console.log("Получены параметры:", gameRequest);
                        resolve({
                            color: gameRequest.playerColor,
                            timeControl: {
                                minutes: gameRequest.timeControl.minutes,
                                increment: gameRequest.timeControl.increment
                            }
                        });
                    } catch (error) {
                        // Отклоняем Promise при ошибке
                        reject(error);
                    }
                }
            );
            // Таймаут на случай проблем
            setTimeout(() => {
                subscription.unsubscribe();
                reject(new Error("Превышено время ожидания параметров"));
            }, 5000); // 5 секунд

            wsManager.stompClient.send(
                `/app/game/${wsManager.sessionId}/initial-params`,
                {},
                {}
            );
        });

        wsManager.stompClient.subscribe('/user/queue/game-created', (message) => {
            const { sessionId } = JSON.parse(message.body);
            console.log(`Successfully created game with session ID: ${sessionId}`);
        });

        // При подключении:
        wsManager.stompClient.subscribe('/user/queue/game-start', (message) => {
            console.log('Game start message received:', message.body);
            const { sessionId } = JSON.parse(message.body);
            button.classList.remove('loading');
            button.disabled = false;
            window.location.href = `/game?sessionId=${sessionId}`;
        });

        wsManager.stompClient.send(
            "/app/game/create",
            {},
            JSON.stringify({
                playerColor: color,
                timeControl: timeControl
            })
        );
    } catch (error) {
        console.error("Ошибка:", error);
    }
}

function handleRetryButtonClick() {
//    wsManager.sendRetryRequest();
    const retryButton = document.getElementById('retry');
    const findOpponentButton = document.getElementById('find-opponent');
    retryButton.style.display = 'none';
    findOpponentButton.style.display = 'none';

    const buttonsContainer = document.getElementById('move-box-btns');
    buttonsContainer.classList.add('has-retry-request'); // Убираем паддинги у родителя

    const requestContainer = document.createElement('div');
    requestContainer.id = 'retry-request-container';
    requestContainer.classList.add('show');

    const text = document.createElement('span');
    text.id = 'retry-request-text';
    text.textContent = 'Отправлен запрос на реванш';

    const cancelButton = document.createElement('button');
    cancelButton.id = 'cancel-retry';

    requestContainer.appendChild(cancelButton);
    requestContainer.appendChild(text);
    buttonsContainer.insertBefore(requestContainer, buttonsContainer.firstChild);

    cancelButton.addEventListener('click', () => {
        //        wsManager.cancelRetryRequest();
        buttonsContainer.classList.remove('has-retry-request');
        requestContainer.remove();

        retryButton.style.display = 'block';
        findOpponentButton.style.display = 'block';
    });
}

function addMessage(message, isOpponent) {
    const messageDiv = document.createElement('div');
    const chatBoxWindow = document.getElementById('chat-box-window');
    messageDiv.classList.add(isOpponent ? 'your-message' : 'my-message');
    message = message.replace(/^"(.*)"$/, '$1');
    messageDiv.textContent = message;
    chatBoxWindow.appendChild(messageDiv);
    chatBoxWindow.scrollTop = chatBoxWindow.scrollHeight;
}

function showChat(chat) {
    const currentUser = document.getElementById('profile-box-nickname').innerText;
    chat.forEach(msg => {
        addMessage(msg.message, currentUser !== msg.senderNickname);
    });
}

let moveCount = 0; // Счетчик ходов
function addMoveToBox(fromPosition, toPosition, moveResult) {
    const moveBox = document.getElementById('move-box-window');
    const moveNumbers = document.getElementById('move-numbers');
    const whiteMoves = document.getElementById('white-moves');
    const blackMoves = document.getElementById('black-moves');
    console.log("fromPosition ", fromPosition);
    console.log("toPosition ", toPosition);
    console.log("moveResult ", moveResult);

    // Форматирование хода с учетом типа
    const move = formatChessNotation(fromPosition, toPosition, moveResult);
    console.log("Форматированный ход: ", move);

    const currentMoveBox = moveBox.querySelector('.current');
    if (currentMoveBox) currentMoveBox.classList.remove('current');

    // Логика нумерации ходов
    if (moveCount % 2 === 0) {
        const moveNumber = Math.floor(moveCount / 2) + 1;
        addMoveElement(moveNumbers, `${moveNumber}.`, 'move-box-row');

        const whiteElement = addMoveElement(whiteMoves, move, 'current move-box-row to-bord');
        whiteElement.innerHTML = addPieceSymbols(move, 'white');
    } else {
        const blackElement = addMoveElement(blackMoves, move, 'current move-box-row');
        blackElement.innerHTML = addPieceSymbols(move, 'black');
    }

    moveBox.scrollTop = moveBox.scrollHeight;
    moveCount++;
}

function formatChessNotation(from, to, result) {
//    console.log("chessboardHistory ", chessboardHistory);
//    console.log("moveCount ", moveCount);
    const piece = chessboardHistory[moveCount][from];
    if (!piece) {
        console.log("Нет фигуры на доске для истории ходов");
        return '';
    }
    let notation = '';

    // Рокировка
    if (result.castling) {
        return to[0] === 'g' ? '0-0' : '0-0-0';
    }

    // Символ фигуры (кроме пешки)
    if (piece.type !== 'Pawn') {
        notation += getPieceSymbol(piece.fileName, piece.color);
    }
    notation += from;

    const eatenEntry = result.eatenPiece;
    if (eatenEntry) {
        notation += ':';
        const pieceSymbol = chessSymbols[eatenEntry.fileName][eatenEntry.color];
        if (eatenEntry.color == myColor.toLowerCase()) {
            document.getElementById("opponent").textContent  += pieceSymbol;
        } else {
            document.getElementById("me").textContent  += pieceSymbol;
        }
    } else notation += '-'; // '—'

    // Целевая позиция
     if (piece.type !== 'Pawn') {
        notation += to.toLowerCase();
     }

    // Превращение пешки
    if (result.promotePawn) {
        notation += `=${getPieceSymbol(result.promotePawn.newPiece.fileName, result.promotePawn.newPiece.color)}`;
    }

    // Шах/мат
    if (result.kingInCheck) notation += '+';
    if (result.victory) notation += '#';

    return notation;
}

function getPieceSymbol(type, color) {
    return chessSymbols[type][color]; // Учитываем цвет
}

function addPieceSymbols(notation, color) {
    // Заменяем рокировку на символ короля
    let formatted = notation
        .replace(/0-0-0/g, '♔0-0-0')
        .replace(/0-0/g, '♔0-0');

    // Заменяем буквы фигур на символы
    return formatted.replace(/([KQRNB])/g, (_, p) =>
        Object.entries(chessSymbols)
            .find(([k]) => k.startsWith(p))[1][color]
    );
}

function addMoveElement(parent, text, className) {
    const element = document.createElement('div');
    element.className = className;
    element.innerHTML = text;
    parent.appendChild(element);
    return element;
}

function showMoveHistory(moveResults) {
    moveCount = 0;
    if (!moveResults || moveResults.length === 0) {
        console.log("не moveResults");
        return;
    }
    for (let i = 0; i < moveResults.length; i++) {
        const moveResult = moveResults[i];
        if (moveResult.castling) {
            console.log("moveResult в описании истории ", moveResult);
            addMoveToBox(`${moveResult.move.from}`, `${moveResult.move.to}`, moveResult);

        } else {
            addMoveToBox(`${moveResult.move.from}`, `${moveResult.move.to}`, moveResult);
        }

    }
}

function showGameResult(result) {
    clearInterval(timerState.interval);
    timerState.interval = null;
    const moveBoxWindow = document.getElementById('move-box-window');

    // Создаем элемент результата
    const resultRow = document.createElement('div');
    resultRow.className = 'result-container';

    // Текст результата
    const resultText = document.createElement('span');
    const scaleText = document.createElement('div');
    resultText.className = 'result';
    scaleText.className = 'scale';

    if (result === "draw") {
        resultText.textContent = "Ничья";
        scaleText.textContent = "½ - ½";
    } else if (result === "white") {
        resultText.textContent = "Победа белых";
        scaleText.textContent = "1 - 0";
    } else if (result === "black") {
        resultText.textContent = "Победа черных";
        scaleText.textContent = "0 - 1";
    }

    resultRow.appendChild(resultText);
    resultRow.appendChild(scaleText);

    // Добавляем результат в конец истории ходов
    moveBoxWindow.appendChild(resultRow);
    moveBoxWindow.scrollTop = moveBoxWindow.scrollHeight;

    const retry = document.getElementById('retry');
    const findOpponent = document.getElementById('find-opponent');
    const whiteFlag = document.getElementById('white-flag');
    const draw = document.getElementById('draw');

    retry.style.display = "flex";
    findOpponent.style.display = "flex";
    whiteFlag.style.display = "none";
    draw.style.display = "none";
}

let resizeObserver;
function resizeBoard() {
    const board = document.getElementById('chess-board');
    const chatBox = document.getElementById('chat-box');
    const chatBoxHeader = document.getElementById('chat-box-header');
    const moveBox = document.getElementById('move-box');

    // Замеряем размеры вне RAF для актуальных значений
    const boardSize = Math.min(
        board.offsetWidth,
        board.offsetHeight
    );
    if (chatBox.classList.contains('collapsed')) {
        chatBox.style.height = `${chatBoxHeader.offsetHeight}px`;
    } else {
        chatBox.style.height = `${boardSize}px`;
    }

    // Инициализация ResizeObserver (только один раз)
    if (!resizeObserver) {
        resizeObserver = new ResizeObserver(entries => {
            requestAnimationFrame(resizeBoard);
        });
        resizeObserver.observe(board.parentElement);
    }
}

function updateTimerDisplay(timerId, time) {
    const timer = document.getElementById(timerId);
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const tenths = Math.floor((time % 1000) / 100);

    timer.textContent = time <= 5000
        ? `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${tenths}`
        : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    timer.style.backgroundColor = time <= 5000 ? "orange" : "";
}

// Функция для преобразования строки времени в миллисекунды
function parseTime(timeStr) {
    console.log("2 - parseTime ");
    const [mins, secs, tenths] = timeStr.split(/[:.]/);
    return (+mins * 60 + +secs) * 1000 + (tenths ? +tenths * 100 : 0);
}

function startTimer() {
    console.log("4 - startTimer ");
    clearInterval(timerState.interval);

    timerState.interval = setInterval(() => {
        if (currentPlayerColor === 'WHITE') {
            timerState.white = Math.max(timerState.white - 100, 0);
        } else {
            timerState.black = Math.max(timerState.black - 100, 0);
        }

        if (myColor === "WHITE") {
            updateTimerDisplay("timer1", timerState.black);
            updateTimerDisplay("timer2", timerState.white);
        } else {
            updateTimerDisplay("timer1", timerState.white);
            updateTimerDisplay("timer2", timerState.black);
        }

        if (timerState.white <= 0 || timerState.black <= 0) {
            clearInterval(timerState.interval);
            timerState.interval = null;
        }
    }, 100);
}

// Обновление таймеров
function updateTimers(whiteTimeStr, blackTimeStr, timerActive = true) {
    timerState.white = parseTime(whiteTimeStr);
    timerState.black = parseTime(blackTimeStr);

    if (myColor === "WHITE") {
        updateTimerDisplay("timer1", timerState.black);
        updateTimerDisplay("timer2", timerState.white);
    } else {
        updateTimerDisplay("timer1", timerState.white);
        updateTimerDisplay("timer2", timerState.black);
    }

    if (timerState.white <= 0 || timerState.black <= 0) {
        const winner = timerState.white <= 0 ? "black" : "white";
        showGameResult(winner);
        return;
    }


    if (timerActive && !timerState.interval) {
        startTimer();
    }
}

function switchPlayer() {
    currentPlayerColor = currentPlayerColor === "WHITE" ? "BLACK" : "WHITE";
}

// Функция для выполнения хода
function handleMove(move) {
    console.log("handleMove: ", move);
    const result = move.moveResult;
    const fromPosition = `${result.move.from}`;
    const toPosition = `${result.move.to}`;
    chessboardHistory.push(move.chessboard.board);

    if (result.eatenPiece) {
        eatenPieces.push({
            moveNumber: moveCount,
            piece: result.eatenPiece
        });
    }
    if (result.draw) {
        console.log("draw");
        animateMove(fromPosition, toPosition);
        updateChessboard(chessboard, fromPosition, toPosition);
        addMoveToBox(fromPosition, toPosition, result);
        showGameResult("draw");
    } else if (result.victory) {
        console.log("winner is ");
        animateMove(fromPosition, toPosition);
        updateChessboard(chessboard, fromPosition, toPosition);
        addMoveToBox(fromPosition, toPosition, result);
        showGameResult(result.victory.winner);
    } else if (result.promotePawn) {
        const promotedPiece = result.promotePawn.newPiece;
        console.log("В промоушене");
        finishPromotion(fromPosition, toPosition, promotedPiece);
        updateChessboard(chessboard, fromPosition, toPosition);
        chessboard[toPosition] = promotedPiece;
        addMoveToBox(fromPosition, toPosition, result);
    } else if (result.castling) {
        console.log("рокировка!");
        const { from: rookFrom, to: rookTo } = result.castling;
        animateMove(fromPosition, toPosition);
        animateMove(rookFrom.col + rookFrom.row, rookTo.col + rookTo.row);
        updateChessboard(chessboard, rookFrom.col + rookFrom.row, rookTo.col + rookTo.row);
        updateChessboard(chessboard, fromPosition, toPosition);
        addMoveToBox(fromPosition, toPosition, result);
    } else {
        animateMove(fromPosition, toPosition);
        updateChessboard(chessboard, fromPosition, toPosition);
        addMoveToBox(fromPosition, toPosition, result);
    }
    if (result.kingInCheck) {
        console.log("КОРОЛЬ ПОД ШАХОМ :", result.kingInCheck);
        document.getElementById(result.kingInCheck).classList.add('in-check');
    }
    currentPlayerColor = move.currentPlayer;
    return chessboard;
}

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

function handleCastling(castlingData) {
    animateMove(castlingData.king.from, castlingData.king.to);
    animateMove(castlingData.rook.from, castlingData.rook.to);
    addMoveToBox(castlingData.king.from, castlingData.king.to);
}

function handleGameResult(result) {

    if (result.draw) {
        showGameResult('draw');
    } else {
        showGameResult(result.winner);
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
class WebSocketManager {
    constructor() {
        this.stompClient = null;
        this.csrfToken = document.querySelector("meta[name='_csrf']").content;
        this.csrfHeader = document.querySelector("meta[name='_csrf_header']").content;
        this.sessionId = null;
    }

    connect() {
        this.stompClient = StompJs.Stomp.over(() => new SockJS('/ws'));
        return new Promise((resolve, reject) => {
            this.stompClient.connect(
                { 'X-CSRF-TOKEN': this.csrfToken },
                () => {
                    console.log('WebSocket connected!');
                    resolve();
                    this.subscribeToAvailableGames();
                },
                (error) => {
                    console.error('WebSocket error:', error);
                    reject(error);
                }
            );
        });
    }

    subscribeToAvailableGames() {
        if (!this.stompClient || !this.stompClient.connected) {
            console.error('WebSocket is not connected yet!');
            return;
        }
        this.stompClient.subscribe('/topic/games/available', (message) => {
            const game = JSON.parse(message.body);
            addPlayerRow(game);
        });
        this.stompClient.subscribe('/topic/games/closed', (message) => {
            const sessionId = JSON.parse(message.body).sessionId;
            removePlayerRow(sessionId);
        });
    }

    joinGame(sessionId) {
        if (!sessionId) {
            console.error('Session ID is required!');
            return;
        }
        if (!wsManager.stompClient || !wsManager.stompClient.connected) {
            console.error('WebSocket is not connected yet!');
            return;
        }
        // Отправляем запрос на присоединение к игре
        wsManager.stompClient.send(`/app/game/${sessionId}/join`, {}, {});
        // Подписываемся на уведомление об успешном присоединении
        wsManager.stompClient.subscribe('/user/queue/game-joined', (message) => {
            const { sessionId } = JSON.parse(message.body);
            console.log(`Successfully joined game with session ID: ${sessionId}`);
        });
        // Подписываемся на ошибки
        wsManager.stompClient.subscribe('/user/queue/errors', (message) => {
            const error = JSON.parse(message.body).error;
            console.error(`Error joining game: ${error}`);
            alert("Не удалось присоединиться к игре!");
        });
    }

    connectWithSession(sessionId) {
        this.sessionId = sessionId
        this.stompClient = StompJs.Stomp.over(() => new SockJS('/ws'));
        return new Promise((resolve, reject) => {
            this.stompClient.connect(
                { 'X-CSRF-TOKEN': this.csrfToken },
                () => {
                    console.log('WebSocket connected for session:', sessionId);
                    resolve();
                    this.subscribeToGameSession(sessionId);
                },
                (error) => {
                    console.error('WebSocket error:', error);
                    reject(error);
                }
            );
        });
    }

    subscribeToGameSession() {
        if (!this.sessionId) {
            console.error('Session ID is not set!');
            return;
        }

        // Основные подписки
        this.stompClient.subscribe(`/topic/game/${this.sessionId}`, (message) => {
            const update = JSON.parse(message.body);
            handleGameUpdate(update);
        });

        this.stompClient.subscribe(`/topic/game/${this.sessionId}/timer`, (message) => {
            const timerData = JSON.parse(message.body);
            console.log("timerData ", timerData);
//            const { whiteTime, blackTime } = timerData;
            updateTimers(timerData.whiteTime, timerData.blackTime, timerData.timerActive);
        });

        // Добавляем подписку на возможные ходы
        this.stompClient.subscribe('/user/queue/possible-moves', (message) => {
            const data = JSON.parse(message.body);
            handleGameUpdate(data);
        });

        this.stompClient.subscribe('/user/queue/errors', (message) => {
            console.error('Ошибка:', message.body);
        });

        this.stompClient.subscribe('/user/queue/new-message', (message) => {
            const data = JSON.parse(message.body);
            addMessage(data.message, true);
        });

    }

    sendMessage(message) {
        if (!this.sessionId) {
            console.error('Session ID is not set!');
            return;
        }
        this.stompClient.send(
            `/app/${this.sessionId}/message`,
            {},
            JSON.stringify(message)
        );
    }

    getPossibleMoves(position) {
        if (!this.sessionId) {
            console.error('Session ID is not set!');
            return;
        }
        this.stompClient.send(
            `/app/${this.sessionId}/possible-moves`,
            {},
            JSON.stringify(position)
        );
    }

    makeMove(positionFrom, positionTo, promotionPiece = null) {
        if (!this.sessionId) {
            console.error('Session ID is not set!');
            return;
        }
        const moveRequest = {
            from: positionFrom,
            to: positionTo,
            promotionPiece: promotionPiece
        };

        this.stompClient.send(
            `/app/${this.sessionId}/move`,
            {},
            JSON.stringify(moveRequest)
        );
    }

}

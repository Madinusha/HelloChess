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

    removeSession(sessionId){
        this.stompClient.send(`/app/game/${sessionId}/remove`, {}, {});
    }

    joinGame(sessionId) {
        if (!sessionId) {
            console.error('Session ID is required!');
            return;
        }
        if (!this.stompClient || !this.stompClient.connected) {
            console.error('WebSocket is not connected yet!');
            return;
        }
        // Отправляем запрос на присоединение к игре
        this.stompClient.send(`/app/game/${sessionId}/join`, {}, {});
        // Подписываемся на уведомление об успешном присоединении
        this.stompClient.subscribe('/user/queue/game-joined', (message) => {
            const { sessionId } = JSON.parse(message.body);
            console.log(`Successfully joined game with session ID: ${sessionId}`);
            window.location.href = `/game?sessionId=${sessionId}`;
        });
        // Подписываемся на ошибки
        this.stompClient.subscribe('/user/queue/errors', (message) => {
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

        this.stompClient.subscribe('/user/queue/draw-suggestion', (message) => {
            console.log("пришел запрос на ничью");
            handleDrawSuggestionFromOpponent();
        });

        this.stompClient.subscribe('/user/queue/white-flag-raised', (message) => {
                const { winner } = JSON.parse(message.body);
                showGameResult(winner);
            }
        );

        this.stompClient.subscribe('/user/queue/retry', (message) => {
            const data = JSON.parse(message.body);
            const subscription = this.stompClient.subscribe(
                `/topic/game/${data.sessionId}/closed`,
                (message) => {
                    const closedSessionId = JSON.parse(message.body).sessionId;
                    cancelButtonClean();
                    subscription.unsubscribe();
                }
            );
            handleRetryRequestFromOpponent(data);
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

    async cancelCreationRequest(sessionId) {
        return new Promise((resolve, reject) => {
            const subscription = this.stompClient.subscribe(
                `/topic/game/${sessionId}/closed`,
                (message) => {
                    const closedSessionId = JSON.parse(message.body).sessionId;
                    if (closedSessionId === sessionId) {
                        cancelButtonClean();
                        subscription.unsubscribe();
                        resolve(closedSessionId);
                    }
                }
            );

            this.stompClient.send(
                `/app/game/${sessionId}/cancel-creation`,
                {},
                {}
            );
        });
    }

    async sendRetryRequest() {
        try {
            const { color, timeControl } = await new Promise((resolve, reject) => {
                const subscription = this.stompClient.subscribe(
                    '/user/queue/initial-params',
                    (message) => {
                        try {
                            subscription.unsubscribe();
                            const gameRequest = JSON.parse(message.body);
                            resolve({
                                color: gameRequest.playerColor,
                                timeControl: {
                                    minutes: gameRequest.timeControl.minutes,
                                    increment: gameRequest.timeControl.increment
                                }
                            });
                        } catch (error) {
                            reject(error);
                        }
                    }
                );
                setTimeout(() => {
                    subscription.unsubscribe();
                    reject(new Error("Timeout waiting for initial parameters"));
                }, 5000);

                this.stompClient.send(
                    `/app/game/${this.sessionId}/initial-params`,
                    {},
                    {}
                );
            });

            const sessionId = await new Promise((resolve, reject) => {
                const gameCreatedSub = this.stompClient.subscribe(
                    '/user/queue/game-created',
                    (message) => {
                        try {
                            gameCreatedSub.unsubscribe();
                            const { sessionId } = JSON.parse(message.body);
                            resolve(sessionId);
                        } catch (error) {
                            reject(error);
                        }
                    }
                );

                this.stompClient.send(
                    `/app/game/${this.sessionId}/retry`,
                    {},
                    JSON.stringify({
                        playerColor: color,
                        timeControl: timeControl
                    })
                );

                setTimeout(() => {
                    gameCreatedSub.unsubscribe();
                    reject(new Error("Timeout waiting for game creation"));
                }, 10000);
            });

            const startSubs = this.stompClient.subscribe('/user/queue/game-start', (message) => {
                const { sessionId } = JSON.parse(message.body);
                window.location.href = `/game?sessionId=${sessionId}`;
            });

            this.stompClient.subscribe(`/topic/game/${sessionId}/closed`, (message) => {
                const { sessionId } = JSON.parse(message.body);
                cancelButtonClean();
                startSubs.unsubscribe();
            });

            return sessionId;

        } catch (error) {
            console.error("Ошибка:", error);
            throw error;
        }
    }

    joinRetryGame(sessionId) {
        if (!sessionId) {
            console.error('Session ID is required!');
            return;
        }
        if (!this.stompClient || !this.stompClient.connected) {
            console.error('WebSocket is not connected yet!');
            return;
        }
        // Отправляем запрос на присоединение к игре
        this.stompClient.send(`/app/game/${sessionId}/retry-join`, {}, {});
        // Подписываемся на уведомление об успешном присоединении
        this.stompClient.subscribe('/user/queue/game-joined', (message) => {
            const { sessionId } = JSON.parse(message.body);
            console.log(`Successfully joined game with session ID: ${sessionId}`);
            window.location.href = `/game?sessionId=${sessionId}`;
        });
        // Подписываемся на ошибки
        this.stompClient.subscribe('/user/queue/errors', (message) => {
            const error = JSON.parse(message.body).error;
            console.error(`Error joining game: ${error}`);
            alert("Не удалось присоединиться к игре!");
        });
    }

    async sendDrawSuggestion() {
        try {
            const response = await new Promise((resolve, reject) => {
                const drawCreatedSub = this.stompClient.subscribe(
                    '/user/queue/draw-suggestion-created', () => {
                        drawCreatedSub.unsubscribe();
                        resolve();
                    }
                );
                this.stompClient.send(
                    `/app/${this.sessionId}/draw-suggestion`, {}, {}
                );
            });
            const acceptsSbscr = this.stompClient.subscribe('/user/queue/draw-suggestion-accepted', (message) => {
                cancelButtonClean(false);
                showGameResult("draw");
            });

            const cancelSbscr = this.stompClient.subscribe('/user/queue/cancel-draw-suggestion', (message) => {
                cancelButtonClean(false);
                acceptsSbscr.unsubscribe();
                cancelSbscr.unsubscribe();
            });
            return response;
        } catch (error) {
            console.error("Ошибка:", error);
            throw error;
        }
    }

     acceptDrawSuggestion() {
        this.stompClient.send(
            `/app/${this.sessionId}/accept-draw-suggestion`, {}, {}
        );
        const startSubs = this.stompClient.subscribe('/user/queue/draw-suggestion-accepted', (message) => {
            cancelButtonClean(false);
            showGameResult("draw");
        });
    }

    cancelDrawSuggestion() {
        this.stompClient.send(
            `/app/${this.sessionId}/cancel-draw-suggestion`, {}, {}
        );
        cancelButtonClean(false);
    }

    async raiseWhiteFlag() {
        this.stompClient.send(
            `/app/${this.sessionId}/white-flag`, {}, {}
        );
    }
}

class WebSocketManager {
    constructor() {
        this.stompClient = null;
        this.csrfToken = document.querySelector("meta[name='_csrf']").content;
        this.csrfHeader = document.querySelector("meta[name='_csrf_header']").content;
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
}

// Экспортируем класс для использования в других файлах
//export default WebSocketManager;
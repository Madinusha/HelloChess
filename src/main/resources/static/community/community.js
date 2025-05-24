document.addEventListener('DOMContentLoaded', function () {
    let stompClient;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;

    const csrfToken = document.querySelector("meta[name='_csrf']").content;

    function connect() {
        stompClient = StompJs.Stomp.over(() => new SockJS('/ws'));

        stompClient.connect(
            { 'X-CSRF-TOKEN': csrfToken },
            function onConnect(frame) {
                console.log('Connected to WebSocket:', frame);
                reconnectAttempts = 0;

                // Подписываемся на обновления
                stompClient.subscribe('/topic/online', function (message) {
                    const users = JSON.parse(message.body);
                    updateOnlineUsersList(users);
                });

                stompClient.send("/app/user/online", {}, JSON.stringify({}));

                stompClient.subscribe('/user/queue/user-online', message => {
                    console.log('Personal update:', message.body);
                });

                // Отправляем запрос на персональный апдейт
                stompClient.send("/app/user-online/list", {}, JSON.stringify({}));

                fetchTopPlayers();
            },
            function onError(error) {
                console.error('WebSocket error:', error);

                if (reconnectAttempts < maxReconnectAttempts) {
                    const delay = Math.min(3000, 1000 * (reconnectAttempts + 1));
                    console.log(`Trying to reconnect in ${delay} ms...`);
                    setTimeout(connect, delay);
                    reconnectAttempts++;
                } else {
                    document.getElementById('online-users-container').innerHTML =
                        '<div class="error">Connection failed. Please refresh the page.</div>';
                }
            }
        );
    }

   function updateOnlineUsersList(users) {
       const container = document.getElementById('online-users-container');
       if (!users || users.length === 0) {
           container.innerHTML = '<div class="no-users">No players online</div>';
           return;
       }

       container.innerHTML = '';
       users.forEach(user => {
           const userElement = document.createElement('div');
           userElement.className = 'online-user';
           userElement.textContent = user;
           container.appendChild(userElement);
       });
   }

   function fetchTopPlayers() {
       fetch('/api/users/top')
           .then(response => response.json())
           .then(players => {
               updateTopPlayersList(players);
           })
           .catch(error => {
               console.error('Error fetching top players:', error);
               document.getElementById('top-players-container').innerHTML =
                   '<div class="error">Failed to load top players</div>';
           });
   }

   function updateTopPlayersList(players) {
       const container = document.getElementById('top-players-container');
       if (!players || players.length === 0) {
           container.innerHTML = '<div class="no-users">No top players</div>';
           return;
       }

       container.innerHTML = '';
       players.forEach((player, index) => {
           const playerElement = document.createElement('div');
           playerElement.className = 'top-player';

           playerElement.innerHTML = `
               <span class="player-rank">${index + 1}.</span>
               <span class="player-name">${player.nickname}</span>
               <span class="player-rating">${player.rating}</span>
           `;

           container.appendChild(playerElement);
       });
   }

    // Начинаем первое подключение
    connect();
});
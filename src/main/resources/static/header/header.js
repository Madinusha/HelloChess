window.currentUser = {
    nickname: null,
    email: null,
    rating: 0
};

document.addEventListener("DOMContentLoaded", function() {
    checkUserProfile();
});

let notifications = [];
let notificationBadge = null;

async function checkUserProfile() {
    const csrfToken = document.querySelector("meta[name='_csrf']")?.content;
    const csrfHeader = document.querySelector("meta[name='_csrf_header']")?.content;
    try {
        const response = await fetch("/api/users/profile", {
            method: "GET",
            headers: {
                [csrfHeader]: csrfToken,
                "Accept": "application/json"
            },
            credentials: "include",
            redirect: "manual" // Отключаем автоматическое следование за редиректом
        });

        if (response.type === "opaqueredirect") {
//            window.location.href = "/login"; // обрабатываем вручную
            console.log("Был редирект");
            return;
        }

        if (response.ok) {
            const user = await response.json();
            if (user && user.nickname) {
                window.currentUser = {
                    nickname: user.nickname,
                    email: user.email,
                    rating: user.rating
                };

                console.log("nick: ", window.currentUser.nickname);
                console.log("rating: ", window.currentUser.rating);
                window.dispatchEvent(new CustomEvent('userDataLoaded', {
                    detail: window.currentUser
                }));
                displayUserProfileBtn(user);
            } else {
                console.error("Данные пользователя неполные:", user);
                showLoginButton();
            }
        } else {
            showLoginButton();
        }
    } catch (error) {
        console.error("Ошибка сети:", error);
    }
}

function goToProfile() {
    const nickname = window.currentUser.nickname;
    if (nickname) {
        document.location.href = `/profile?nickname=${encodeURIComponent(nickname)}`;
    } else {
        alert("Вы не авторизованы. Пожалуйста, войдите в систему.");
        document.location.href = "/registration";
    }
}

function showLoginButton() {
    document.getElementById("login").style.display = "block";
    document.getElementById("profile-box").style.display = "none";
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

    initNotifications();
}

function initNotifications() {
    const versusBtn = document.getElementById("versus-btn");
    notificationBadge = document.createElement("div");
    notificationBadge.className = "notification-badge";
    notificationBadge.style.display = "none";
    versusBtn.appendChild(notificationBadge);

    versusBtn.addEventListener("click", toggleNotifications);

    // Заглушечные уведомления для демонстрации
    setTimeout(() => {
        addNotification({
            type: "invite",
            username: "prosto_erik",
            rating: 1654,
            timeControl: "10 + 2"
        });
    }, 1000);
}

function toggleNotifications() {
    const list = document.getElementById("notifications-list");
    list.style.display = list.style.display === "block" ? "none" : "block";
}

document.addEventListener("click", function(event) {
    const list = document.getElementById("notifications-list");
    const versusBtn = document.getElementById("versus-btn");

    if (!versusBtn.contains(event.target) && !list.contains(event.target)) {
        list.style.display = "none";
    }
});

function addNotification(data) {
    const list = document.getElementById("notifications-list");
    const notification = document.createElement("div");
    notification.className = "notification";

    if (data.type === "invite") {
        notification.innerHTML = `
            <div class="notification-header">
                <span>Приглашение на матч</span>
                <span class="notification-close">&times;</span>
            </div>
            <div class="notification-content">
                <span class="notification-username">${data.username}</span>
                <span class="notification-rating">${data.rating}</span> предложил поиграть
                <span class="notification-time">${data.timeControl}</span>
            </div>
            <div class="notification-actions">
                <button class="notification-btn notification-accept">Играть</button>
                <button class="notification-btn notification-decline">Отклонить</button>
            </div>
        `;
    } else if (data.type === "decline") {
        notification.innerHTML = `
            <div class="notification-header">
                <span>Отказ от игры</span>
                <span class="notification-close">&times;</span>
            </div>
            <div class="notification-content">
                <span class="notification-username">${data.username}</span> отказался играть
            </div>
        `;
    } else if (data.type === "game_start") {
        notification.innerHTML = `
            <div class="notification-header">
                <span>Партия началась</span>
                <span class="notification-close">&times;</span>
            </div>
            <div class="notification-content">
                Партия <span class="notification-time">${data.timeControl}</span> с
                <span class="notification-username">${data.username}</span>
                <span class="notification-rating">${data.rating}</span> началась
            </div>
            <div class="notification-actions">
                <button class="notification-btn notification-view">Перейти</button>
            </div>
        `;
    }

    list.prepend(notification);
    notifications.push(data);
    updateBadge();

    // Обработчики событий
    notification.querySelector(".notification-close").addEventListener("click", () => {
        notification.remove();
        notifications = notifications.filter(n => n !== data);
        updateBadge();
    });

    if (data.type === "invite") {
        notification.querySelector(".notification-accept").addEventListener("click", () => {
            alert(`Принято приглашение от ${data.username}`);
            notification.remove();
            notifications = notifications.filter(n => n !== data);
            updateBadge();

            // Добавляем уведомление о начале игры
            setTimeout(() => {
                addNotification({
                    type: "game_start",
                    username: data.username,
                    rating: data.rating,
                    timeControl: data.timeControl
                });
            }, 1000);
        });

        notification.querySelector(".notification-decline").addEventListener("click", () => {
            alert(`Отклонено приглашение от ${data.username}`);
            notification.remove();
            notifications = notifications.filter(n => n !== data);
            updateBadge();
        });
    } else if (data.type === "game_start") {
        notification.querySelector(".notification-view").addEventListener("click", () => {
            alert(`Переход к партии с ${data.username}`);
            notification.remove();
            notifications = notifications.filter(n => n !== data);
            updateBadge();
        });
    }
}

function updateBadge() {
    if (notifications.length > 0) {
        notificationBadge.textContent = notifications.length;
        notificationBadge.style.display = "flex";
    } else {
        notificationBadge.style.display = "none";
    }
}
//
//addNotification({
//    type: "invite",
//    username: "prosto_erik",
//    rating: 1654,
//    timeControl: "10 + 2"
//});
//
//addNotification({
//    type: "decline",
//    username: "sonya"
//});
//
//addNotification({
//    type: "game_start",
//    username: "prosto_erik",
//    rating: 1654,
//    timeControl: "15 + 0"
//});
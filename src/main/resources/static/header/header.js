window.currentUser = {
    nickname: null,
    email: null,
    rating: 0
};

document.addEventListener("DOMContentLoaded", function() {
    checkUserProfile();
});


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


}

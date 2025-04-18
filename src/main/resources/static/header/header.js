document.addEventListener("DOMContentLoaded", function() {
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

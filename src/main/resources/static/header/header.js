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
            credentials: "include"
        });

        if (response.ok) {
            const user = await response.json();
            displayUserProfileBtn(user);
        } else if (response.status === 401) {
            const login = document.getElementById("login");
            login.style.display = "block";

            const profileBox = document.getElementById("profile-box");
            profileBox.style.display = "none";
        } else {
            console.error("Ошибка:", await response.text());
        }
    } catch (error) {
        console.error("Ошибка сети:", error);
    }
}

function displayUserProfileBtn(user) {
    // Пример отображения информации о пользователе
    const profileBox = document.getElementById("profile-box");
    const profileBoxNickname = document.getElementById("profile-box-nickname");
    const profileBoxAvatar = document.getElementById("profile-box-avatar");
    profileBoxNickname.textContent = `${user.username}`; // Отображаем имя пользователя
    profileBox.style.display = "flex";

    const login = document.getElementById("login");
    login.style.display = "none";
}

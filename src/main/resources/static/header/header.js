
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
    const response = await fetch("/api/users/profile", {
        method: "GET",
        credentials: "include" // Включает куки в запрос, если используется сессия
    });

    if (response.ok) {
        const user = await response.json(); // Предполагаем, что ваш API возвращает объект пользователя
        displayUserProfileBtn(user); // Функция, чтобы показать информацию о пользователе
    } else {
        const login = document.getElementById("login");
        login.style.display = "block";

        const profileBox = document.getElementById("profile-box");
        profileBox.style.display = "none";
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



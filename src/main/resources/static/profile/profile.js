const id = document.getElementById('id');
const username = document.getElementById('username');
const email = document.getElementById('email');
const role = document.getElementById('role');

document.addEventListener("DOMContentLoaded", function() {
    checkUserProfile();
});

async function checkUserProfile() {
    const response = await fetch("/api/users/profile", {
        method: "GET",
        credentials: "include" // Включает куки в запрос, если используется сессия
    });

    if (response.ok) {
        const user = await response.json();
        displayUserProfile(user);
    } else {
        console.log("fail");
    }
}

function displayUserProfile(user) {
    console.log(user);
    username.innerText = user.username;
    email.innerText = user.email;
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

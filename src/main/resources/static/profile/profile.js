const id = document.getElementById('id');
const nickname = document.getElementById('profile-info-nickname');
const email = document.getElementById('profile-info-email');

document.addEventListener("DOMContentLoaded", function() {
    getUserProfile();
});

async function getUserProfile() {
    try {
        const response = await fetch("/api/users/profile", {
            method: "GET",
            credentials: "include"
        });

        if (response.ok) {
            const user = await response.json();
            displayUserProfile(user);
        } else {
            console.log("Ошибка получения данных пользователя.");
        }
    } catch (error) {
        console.error("Request failed:", error);
    }
}


function displayUserProfile(user) {
    console.log(user);
    nickname.innerText = user.nickname;
    email.innerText = user.email;
    displayUserProfileBtn(user);
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

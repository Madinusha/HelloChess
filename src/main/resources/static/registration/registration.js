const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

signUpButton.addEventListener('click', () => {
	container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
	container.classList.remove("right-panel-active");
});


async function register() {
    event.preventDefault();
    const nickname = document.getElementById("regUsername").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;
    const passwordContainer = document.getElementById("regPassword");
    const role = "user";

    if (!validateFields(nickname, email, password)) {
        console.log("неправильно заполнены поля")
        return;
    } else {
        console.log("правильно заполнены поля")
    }

    try {
        const response = await fetch("/api/users/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ nickname, email, password, role })
        });

        if (response.ok) {
            showNotification("User registered successfully");
            container.classList.remove("right-panel-active");
        } else {
            const errorMessage = await response.text(); // Получаем текст ошибки от сервера
            showValidSymbolsFor(passwordContainer, errorMessage);
        }
    } catch (error) {
        console.error("Ошибка fetch:", error);
        showNotification("Произошла ошибка при регистрации");
    }
}

async function login() {
    event.preventDefault();
    const nickname = document.getElementById("authUsername").value;
    const password = document.getElementById("authPassword").value;
    const passwordContainer = document.getElementById("authPassword");

    try {
        const response = await fetch("/api/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ nickname, password })
        });

        if (response.ok) {
            window.location.href = "/game";
//            window.history.back();
        } else if (response.status === 401) {
            showValidSymbolsFor(passwordContainer, "Неверное имя пользователя или пароль");
        } else {
            const errorMessage = await response.text();
            showNotification(errorMessage || "Ошибка входа");
        }
    } catch (error) {
        console.error("Ошибка при запросе:", error);
        showNotification("Произошла ошибка сети. Попробуйте позже.");
    }
}

function showNotification(message) {
    const notification = document.createElement("div");
    notification.textContent = message;

    // Стили для уведомления
    Object.assign(notification.style, {
        position: "fixed",
        top: "-60px", // Начальная позиция над экраном
        left: "50%",
        transform: "translateX(-50%)",
        backgroundImage: "linear-gradient(90deg, #553A4C, #c73136)",
        color: "white",
        padding: "10px 20px",
        borderRadius: "5px",
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
        fontSize: "16px",
        zIndex: 1000,
        transition: "top 0.5s ease-in-out", // Анимация для выезда
    });

    document.body.appendChild(notification);

    // Запуск анимации выезда
    setTimeout(() => {
        notification.style.top = "20px"; // Позиция, в которой элемент остановится
    }, 10);

    // Анимация исчезновения
    setTimeout(() => {
        notification.style.top = "-60px"; // Уходит обратно вверх
        setTimeout(() => notification.remove(), 500); // Удаление после анимации
    }, 3000); // Время ожидания перед уходом обратно
}

function validateNickname(nickname) {
    // Проверка на наличие хотя бы одной буквы и только латиницу, цифры и символы '_'
    const nicknameRegex = /^(?=.*[a-zA-Z])[a-zA-Z0-9_]+$/;
    return nicknameRegex.test(nickname);
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[_!.\%?&]).+$/;
    return passwordRegex.test(password);
}

function validateNicknameHasLetter(nickname) {
    // Проверка, что в никнейме есть хотя бы одна буква
    const hasLetter = /[a-zA-Z]/.test(nickname);
    return hasLetter;
}

function validateFields(nickname, email, password) {
    const nicknameContainer = document.getElementById("regUsername");
    const emailContainer = document.getElementById("regEmail");
    const passwordContainer = document.getElementById("regPassword");

    const containers = [
        nicknameContainer,
        emailContainer,
        passwordContainer
    ];

    containers.forEach(container => {
        const existingMessage = container.nextElementSibling;
        if (existingMessage && existingMessage.classList.contains("validation-message")) {
            existingMessage.remove();
        }
    });

    // Проверка на пустые поля
    if (!nickname || !email || !password) {
        if (!nickname) {
            showValidSymbolsFor(nicknameContainer, "Поле не должно быть пустым");
        }
        if (!email) {
            showValidSymbolsFor(emailContainer, "Поле не должно быть пустым");
        }
        if (!password) {
            showValidSymbolsFor(passwordContainer, "Поле не должно быть пустым");
        }
        return false;
    }

    // Проверка на правильность ввода данных
    if (!validateNickname(nickname) || !validateEmail(email) || !validatePassword(password)) {
        if (!validateNickname(nickname)) {
            if (!validateNicknameHasLetter(nickname)) {
                showValidSymbolsFor(nicknameContainer, "Имя пользователя должно содержать хотя бы одну букву");
            } else {
                showValidSymbolsFor(nicknameContainer, "Имя пользователя может содержать только латиницу, цифры и символы '_'");
            }
        }
        if (!validateEmail(email)) {
            showValidSymbolsFor(emailContainer, "Введите корректный email");
        }
        if (!validatePassword(password)) {
            showValidSymbolsFor(passwordContainer, "Пароль должен содержать латиницу, заглавные буквы, цифры и символы _ ! . % ? &");
        }
        return false;
    }

    return true;
}


function showValidSymbolsFor(container, message) {
    // Удаляем предыдущее сообщение валидации, если оно есть
    const existingMessage = container.nextElementSibling;
    if (existingMessage && existingMessage.classList.contains("validation-message")) {
        existingMessage.remove();
    }

    // Создаем новый элемент для сообщения
    const messageElement = document.createElement("div");
    messageElement.classList.add("validation-message");
    messageElement.innerText = message;

    // Применяем стили для сообщения
    messageElement.style.color = "red";
    messageElement.style.fontSize = "12px";
    messageElement.style.marginTop = "0.1em";

    // Вставляем сообщение непосредственно под контейнером
    container.insertAdjacentElement("afterend", messageElement);
}







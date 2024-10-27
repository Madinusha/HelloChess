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
    const username = document.getElementById("regUsername").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;
    const role = "user";

    fetch("/api/users/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, email, password, role })
    })
    .then(response => {
        if (response.ok) {
            alert("User registered successfully");
            container.classList.remove("right-panel-active");
        } else {
            throw new Error("Registration failed");
        }
    })
    .catch(error => {
        console.error("Ошибка fetch:", error);
        alert("Registration failed");
    });
}


async function login() {
    const username = document.getElementById("authUsername").value;
    const password = document.getElementById("authPassword").value;

    const response = await fetch("/api/users/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => {
        alert("Login successful");
        window.location.href = "../index.html";
    })
    .catch(error => {
        alert("Invalid credentials");
    });
}


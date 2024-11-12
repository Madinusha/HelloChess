package org.madi.demo.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.madi.demo.model.User;
import org.madi.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.dao.DataIntegrityViolationException;
@RestController
@RequestMapping("/api/users")
public class UserController {

	@Autowired
	private UserService userService;



	@PostMapping("/register")
	public ResponseEntity<String> registerUser(@RequestBody User user) {
		try {
			userService.saveUser(user);
			return ResponseEntity.ok("User registered successfully");
		} catch (DataIntegrityViolationException e) {
			String errorMessage = "Этот ник уже занят. Пожалуйста, выберите другой.";
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorMessage);
		} catch (Exception e) {
			String errorMessage = "Произошла ошибка при регистрации. Попробуйте еще раз.";
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorMessage);
		}
	}


	@PostMapping("/login")
	public ResponseEntity<String> loginUser(@RequestBody User user, HttpServletRequest request) {
		try {
			User authenticatedUser = userService.findUserByNickname(user.getNickname());

			if (authenticatedUser != null && authenticatedUser.getPassword().equals(user.getPassword())) {
				// Создание сессии
				HttpSession session = request.getSession();
				session.setAttribute("user", authenticatedUser);
				return ResponseEntity.ok("Login successful");
			} else {
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Неверный логин или пароль");
			}
		} catch (DataAccessException e) {
			// Ошибки доступа к данным, например, проблемы с подключением к базе данных
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Ошибка при доступе к базе данных. Попробуйте позже.");
		} catch (Exception e) {
			// Другие неожиданные ошибки
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Произошла непредвиденная ошибка. Пожалуйста, попробуйте снова.");
		}
	}


	@GetMapping("/profile")
	public ResponseEntity<User> getProfile(HttpServletRequest request) {
		HttpSession session = request.getSession(false); // false: не создавать новую сессию
		if (session != null) {
			User user = (User) session.getAttribute("user");
			if (user != null) {
				return ResponseEntity.ok(user);
			}
		}
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
	}

	@GetMapping("/{nickname}")
	public User getUserByNickname(@PathVariable String nickname) {
		return userService.findUserByNickname(nickname);
	}
}

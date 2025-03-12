package org.madi.demo.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.madi.demo.dto.UserLoginDTO;
import org.madi.demo.dto.UserProfileDTO;
import org.madi.demo.dto.UserRegistrationDTO;
import org.madi.demo.entities.User;
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
	public ResponseEntity<String> registerUser(@Valid @RequestBody UserRegistrationDTO userDTO) {
		User user = new User();
		user.setNickname(userDTO.getNickname());
		user.setPassword(userDTO.getPassword());
		user.setEmail(userDTO.getEmail());
		user.setRole("user");
		userService.saveUser(user);
		return ResponseEntity.ok("Пользователь успешно зарегистрирован");
	}

	@PostMapping("/login")
	public ResponseEntity<String> loginUser(@Valid @RequestBody UserLoginDTO userDTO, HttpServletRequest request) {
		try {
			User authenticatedUser = userService.findUserByNickname(userDTO.getNickname());

			if (authenticatedUser != null && authenticatedUser.getPassword().equals(userDTO.getPassword())) {
				// Создание сессии
				HttpSession session = request.getSession();
				session.setAttribute("user", authenticatedUser);
				return ResponseEntity.ok("Login successful");
			} else {
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Неверный логин или пароль");
			}
		} catch (DataAccessException e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body("Ошибка при доступе к базе данных. Попробуйте позже.");
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body("Произошла непредвиденная ошибка. Пожалуйста, попробуйте снова.");
		}
	}

	@GetMapping("/profile")
	public ResponseEntity<UserProfileDTO> getProfile(HttpServletRequest request) {
		HttpSession session = request.getSession(false); // false: не создавать новую сессию
		if (session != null) {
			User user = (User) session.getAttribute("user");
			if (user != null) {
				UserProfileDTO profileDTO = new UserProfileDTO();
				profileDTO.setNickname(user.getNickname());
				profileDTO.setEmail(user.getEmail());
				return ResponseEntity.ok(profileDTO);
			}
		}
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
	}

	@GetMapping("/{nickname}")
	public User getUserByNickname(@PathVariable String nickname) {
		return userService.findUserByNickname(nickname);
	}
}

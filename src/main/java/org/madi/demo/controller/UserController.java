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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.dao.DataIntegrityViolationException;


@RestController
@RequestMapping("/api/users")
public class UserController {

	@Autowired
	private UserService userService;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@PostMapping("/register")
	public ResponseEntity<String> registerUser(@Valid @RequestBody UserRegistrationDTO userDTO) {
		User user = new User();
		user.setNickname(userDTO.getNickname());
		user.setPassword(passwordEncoder.encode(userDTO.getPassword())); // Кодируем пароль
		user.setEmail(userDTO.getEmail());
		user.setRole("user");

		userService.saveUser(user);
		return ResponseEntity.ok("Пользователь успешно зарегистрирован");
	}

	@Autowired
	private AuthenticationManager authenticationManager;

	@PostMapping("/login")
	public ResponseEntity<String> loginUser(
			@Valid @RequestBody UserLoginDTO userDTO,
			HttpServletRequest request
	) {
		try {
			// Аутентификация через Spring Security
			Authentication authentication = authenticationManager.authenticate(
					new UsernamePasswordAuthenticationToken(
							userDTO.getNickname(),
							userDTO.getPassword()
					)
			);
			// Установка контекста безопасности
			SecurityContextHolder.getContext().setAuthentication(authentication);

			// Сохранение контекста в сессии
			HttpSession session = request.getSession();
			session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());
			session.setAttribute("user", authentication.getPrincipal());

			return ResponseEntity.ok("Вход выполнен успешно");
		} catch (BadCredentialsException e) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Неверный логин или пароль");
		}
	}

//	@PostMapping("/login")
//	public ResponseEntity<String> loginUser(
//			@Valid @RequestBody UserLoginDTO userDTO,
//			HttpServletRequest request
//	) {
//		try {
//			Authentication authentication = authenticationManager.authenticate(
//					new UsernamePasswordAuthenticationToken(
//							userDTO.getNickname(),
//							userDTO.getPassword()
//					)
//			);
//			SecurityContextHolder.getContext().setAuthentication(authentication);
//
//			// Получаем полный объект User из базы данных
//			User user = userService.findUserByNickname(authentication.getName());
//
//			HttpSession session = request.getSession();
//			session.setAttribute("user", user); // Сохраняем объект User
//
//			return ResponseEntity.ok("Вход выполнен успешно");
//		} catch (BadCredentialsException e) {
//			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Неверный логин или пароль");
//		}
//	}




//	@GetMapping("/profile")
//	public ResponseEntity<UserProfileDTO> getProfile() {
//		// Получаем аутентификацию из контекста
//		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//
//		// Проверяем аутентификацию
//		if (authentication == null || !authentication.isAuthenticated()) {
//			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
//		}
//
//		User user = (User) authentication.getPrincipal();
//		return ResponseEntity.ok(
//				new UserProfileDTO(user.getNickname(), user.getEmail())
//		);
//	}

	@GetMapping("/profile")
	public ResponseEntity<UserProfileDTO> getProfile() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		// Получаем пользователя из базы данных
		User user = userService.findUserByNickname(authentication.getName());

		return ResponseEntity.ok(
				new UserProfileDTO(user.getNickname(), user.getEmail())
		);
	}

	@GetMapping("/{nickname}")
	public User getUserByNickname(@PathVariable String nickname) {
		return userService.findUserByNickname(nickname);
	}
}

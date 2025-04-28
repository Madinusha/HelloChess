package org.madi.demo.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.madi.demo.dto.*;
import org.madi.demo.entities.User;
import org.madi.demo.service.FriendshipService;
import org.madi.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.parameters.P;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.dao.DataIntegrityViolationException;

import java.security.Principal;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

	@Autowired
	private UserService userService;

	@Autowired
	private FriendshipService friendshipService;

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

	@GetMapping("/profile")
	public ResponseEntity<UserProfileDTO> getProfile() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.cacheControl(CacheControl.noStore())
					.build();
		}

		// Получаем пользователя из базы данных
		User user = userService.findUserByNickname(authentication.getName());

		if (user == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.cacheControl(CacheControl.noStore())
					.build();
		}
		return ResponseEntity.ok()
				.cacheControl(CacheControl.noStore()) // Основной случай успешного ответа
				.body(new UserProfileDTO(user.getNickname(), user.getEmail(), user.getRating()));
	}

	@GetMapping("/{nickname}")
	public User getUserByNickname(@PathVariable String nickname) {
		return userService.findUserByNickname(nickname);
	}

	@GetMapping("/{nickname}/creation-date")
	public ResponseEntity<String> getCreationDate(@PathVariable String nickname) {
		User user = userService.findUserByNickname(nickname);
		if (user == null) {
			return ResponseEntity.notFound().build();
		}

		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy");
		String formattedDate = user.getCreatedAt().format(formatter);

		return ResponseEntity.ok(formattedDate);
	}

	@GetMapping("/profile/{nickname}")
	public ResponseEntity<Map<String, Object>> getUserProfile(
			@PathVariable String nickname,
			Principal principal) {
		User currentUser = userService.findUserByNickname(principal.getName());
		User requestedUser = userService.findUserByNickname(nickname);
		if (requestedUser == null) {
			return ResponseEntity.notFound().build();
		}

		boolean isMyProfile = currentUser != null &&
				currentUser.getNickname().equals(nickname);

		String friendshipStatusDetailed = friendshipService.getDetailedFriendshipStatus(currentUser, requestedUser);

		UserProfilePageDTO profile = new UserProfilePageDTO();
		profile.setNickname(requestedUser.getNickname());
		profile.setRating(requestedUser.getRating());
		profile.setStatusDetailed(friendshipStatusDetailed);

		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy");
		String formattedDate = currentUser.getCreatedAt().format(formatter);
		profile.setCreationDate(formattedDate);

		Map<String, Object> response = new HashMap<>();
		response.put("profile", profile);
		response.put("isMyProfile", isMyProfile);

		return ResponseEntity.ok(response);
	}
}

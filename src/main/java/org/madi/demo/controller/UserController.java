package org.madi.demo.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.madi.demo.model.User;
import org.madi.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

	@Autowired
	private UserService userService;

	@PostMapping("/register")
	public ResponseEntity<String> registerUser(@RequestBody User user) {
		userService.saveUser(user);
		return ResponseEntity.ok("User registered successfully");
	}

	@PostMapping("/login")
	public ResponseEntity<String> loginUser(@RequestBody User user, HttpServletRequest request) {
		User authenticatedUser = userService.findUserByUsername(user.getUsername());

		if (authenticatedUser != null) {
			// Создание сессии
			HttpSession session = request.getSession();
			session.setAttribute("user", authenticatedUser);
			return ResponseEntity.ok("Login successful");
		} else {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
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



	@GetMapping("/{username}")
	public User getUserByUsername(@PathVariable String username) {
		return userService.findUserByUsername(username);
	}
}

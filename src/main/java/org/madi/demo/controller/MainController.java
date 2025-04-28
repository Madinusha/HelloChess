package org.madi.demo.controller;

import org.madi.demo.dto.UserProfilePageDTO;
import org.madi.demo.entities.User;
import org.madi.demo.service.FriendshipService;
import org.madi.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.security.Principal;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Controller
public class MainController {


	@GetMapping("/")
	public String index() {
		return "index";
	}

	@GetMapping("/game")
	public String game(
			@RequestParam String sessionId,
			Model model,
			Principal principal  // Добавьте этот параметр
	) {
		model.addAttribute("username", principal != null ? principal.getName() : "Guest");
		return "pages/game";
	}

	@GetMapping("/registration")
	public String registration() {
		return "pages/registration";
	}
	@GetMapping("/login")
	public String login() {
		return "pages/registration";
	}

//	@GetMapping("/profile")
//	public String profile() {
//		return "pages/profile";
//	}

	@GetMapping("/gameConstructor")
	public String gameConstructor() {
		return "pages/gameConstructor";
	}

	@Autowired
	private UserService userService;
	@Autowired
	private FriendshipService friendshipService;

	@GetMapping("/profile")
	public String profile(
			@RequestParam String nickname,
			Model model,
			Principal principal
	) {
		if (principal == null) {
			return "redirect:/registration";
		}

		User currentUser = userService.findUserByNickname(principal.getName());
		User requestedUser = userService.findUserByNickname(nickname);
		System.out.println("currentUser: " + currentUser.getNickname());
		System.out.println("requestedUser: " + requestedUser.getNickname());

		if (requestedUser == null) {
			model.addAttribute("error", "Пользователь не найден");
			return "error";
		}
		boolean isMyProfile = currentUser != null &&
				currentUser.getNickname().equals(nickname);

		String friendshipStatusDetailed = friendshipService.getDetailedFriendshipStatus(currentUser, requestedUser);
		System.out.println("friendshipStatusDetailed " + friendshipStatusDetailed);

		UserProfilePageDTO profile = new UserProfilePageDTO();
		profile.setNickname(requestedUser.getNickname());
		profile.setRating(requestedUser.getRating());
		profile.setEmail(requestedUser.getEmail());
		profile.setStatusDetailed(friendshipStatusDetailed);

		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy");
		String formattedDate = currentUser.getCreatedAt().format(formatter);
		profile.setCreationDate(formattedDate);

		model.addAttribute("profile", profile);
		model.addAttribute("isMyProfile", isMyProfile);

		return "pages/profile";
	}
}
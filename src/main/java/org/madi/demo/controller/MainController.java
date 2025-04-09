package org.madi.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.security.Principal;

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

	@GetMapping("/profile")
	public String profile() {
		return "pages/profile";
	}

	@GetMapping("/gameConstructor")
	public String gameConstructor() {
		return "pages/gameConstructor";
	}


}
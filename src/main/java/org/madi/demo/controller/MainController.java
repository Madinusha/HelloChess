package org.madi.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MainController {

	@GetMapping("/")
	public String index() {
		return "index"; // Возвращает шаблон game.html
	}

	@GetMapping("/game")
	public String game() {
		return "pages/game"; // Возвращает шаблон game.html
	}

	@GetMapping("/registration")
	public String registration() {
		return "pages/registration"; // Возвращает шаблон game.html
	}

//	@GetMapping("/profile")
//	public String profile() {
//		return "pages/profile"; // Возвращает шаблон profile.html
//	}
}
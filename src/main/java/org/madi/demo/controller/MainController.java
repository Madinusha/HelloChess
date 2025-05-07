package org.madi.demo.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.RequiredArgsConstructor;
import org.madi.demo.dto.LessonDTO;
import org.madi.demo.dto.ProfileUpdateDTO;
import org.madi.demo.dto.TaskDTO;
import org.madi.demo.dto.UserProfilePageDTO;
import org.madi.demo.entities.Rank;
import org.madi.demo.entities.User;
import org.madi.demo.entities.UserLanguage;
import org.madi.demo.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.security.Principal;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

import static org.madi.demo.entities.Lesson.LessonType.*;

@Controller
public class MainController {

	private final UserService userService;
	private final FriendshipService friendshipService;
	private final RankService rankService;
	private final UserLanguageService userLanguageService;
	private final LessonService lessonService;
	private final ObjectMapper objectMapper;
	private final TaskService taskService;

	public MainController(UserService userService, FriendshipService friendshipService, RankService rankService, UserLanguageService userLanguageService, LessonService lessonService, ObjectMapper objectMapper, TaskService taskService) {
		this.userService = userService;
		this.friendshipService = friendshipService;
		this.rankService = rankService;
		this.userLanguageService = userLanguageService;
		this.lessonService = lessonService;
		this.objectMapper = objectMapper;
		this.taskService = taskService;
	}

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

	@GetMapping("/gameConstructor")
	public String gameConstructor() {
		return "pages/gameConstructor";
	}

	@GetMapping("/education")
	public String education(Model model, Authentication authentication) throws JsonProcessingException {
		boolean isAdmin = false;

		if (authentication != null && authentication.isAuthenticated()) {
			isAdmin = authentication.getAuthorities().stream()
					.anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
		}

		model.addAttribute("isAdmin", isAdmin);
		List<LessonDTO> piece = lessonService.getLessonsByType(PIECE_TECHNIQUE);
		List<LessonDTO> advanced = lessonService.getLessonsByType(ADVANCED_LEVEL);
		List<LessonDTO> tactics = lessonService.getLessonsByType(TACTICS);
		for (var lesson : piece) {
			System.out.println("lesson есть " + lesson.getTitle());
			System.out.println("json " + objectMapper.writeValueAsString(piece));
		}

		model.addAttribute("pieceLessonsJson", objectMapper.writeValueAsString(piece));
		model.addAttribute("tacticsLessonsJson", objectMapper.writeValueAsString(tactics));
		model.addAttribute("advancedLessonsJson", objectMapper.writeValueAsString(advanced));
		return "pages/education";
	}

	@GetMapping("/lesson/{lessonId}")
	public String getLesson(
			@PathVariable Long lessonId,
			Model model,
			Authentication authentication
	) throws JsonProcessingException {
		// Проверка прав администратора
		boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
				.anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
		model.addAttribute("isAdmin", isAdmin);

		// Получаем данные урока
		LessonDTO lesson = lessonService.getLessonById(lessonId);
		if (lesson == null) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson not found");
		}
		ObjectMapper mapper = new ObjectMapper();
		String lessonJson = mapper.writeValueAsString(lesson);
		System.out.println("lessonJson " + lessonJson);

		List<LessonDTO> sameTypeLessons = lessonService.getLessonsByType(lesson.getLessonType());

		List<TaskDTO> tasks = taskService.getTasksByLessonId(lessonId);
		System.out.println("tasks len" + tasks.size());
		for (var task : tasks) {
			System.out.println("task есть " + task.getOrder());
			System.out.println("json " + objectMapper.writeValueAsString(task));
		}

		model.addAttribute("currentLessonJson", lessonJson);
		model.addAttribute("currentLesson", lesson);
		model.addAttribute("sameTypeLessonsJson", objectMapper.writeValueAsString(sameTypeLessons));
		model.addAttribute("tasksJson", objectMapper.writeValueAsString(tasks));
		model.addAttribute("lessonType", lesson.getLessonType().name().toLowerCase());

		return "pages/lesson";
	}

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

		List<UserLanguage> userLanguages = userLanguageService.findByUser(requestedUser);
		model.addAttribute("userLanguages", userLanguages);

		// Получаем все доступные языки для выпадающего списка
		List<String> availableLanguages = Arrays.asList("Русский", "Английский", "Немецкий", "Французский", "Испанский");
		model.addAttribute("availableLanguages", availableLanguages);
		List<String> languageLevels = Arrays.stream(UserLanguage.LanguageLevel.values())
				.map(UserLanguage.LanguageLevel::getDisplayName)
				.toList();
		model.addAttribute("languageLevels", languageLevels);

		model.addAttribute("user", requestedUser);
		model.addAttribute("profile", profile);
		model.addAttribute("isMyProfile", isMyProfile);
		model.addAttribute("allRanks", rankService.getAllRanksSorted());

		ProfileUpdateDTO profileUpdateDTO = new ProfileUpdateDTO();
		profileUpdateDTO.setBio(requestedUser.getBio());
		profileUpdateDTO.setBirthDate(requestedUser.getBirthDate());
		profileUpdateDTO.setGender(requestedUser.getGender() != null ? requestedUser.getGender().name() : null);
		profileUpdateDTO.setRankId(requestedUser.getRank() != null ? requestedUser.getRank().getId() : null);
		profileUpdateDTO.setTelegram(requestedUser.getTelegram());
		profileUpdateDTO.setInstagram(requestedUser.getInstagram());
		profileUpdateDTO.setLanguages(userLanguages.stream()
				.map(UserLanguage::getLanguage)
				.toList());
		profileUpdateDTO.setLanguageLevels(
				userLanguages.stream()
						.map(userLang -> userLang.getLevel().getDisplayName()) // Получаем displayName уровня
						.toList()
		);

		model.addAttribute("profileUpdateDTO", profileUpdateDTO);

		return "pages/profile";
	}

	@PostMapping("/profile/update")
	public String updateProfile(
			@ModelAttribute ProfileUpdateDTO updateDTO,
			Principal principal,
			RedirectAttributes redirectAttributes) {

		User user = userService.findUserByNickname(principal.getName());

		// Обновляем основные поля
		user.setBio(updateDTO.getBio());
		user.setBirthDate(updateDTO.getBirthDate());
		user.setGender(User.Gender.valueOf(updateDTO.getGender()));
		user.setTelegram(updateDTO.getTelegram());
		user.setInstagram(updateDTO.getInstagram());

		// Обновляем разряд
		if (updateDTO.getRankId() != null) {
			Rank rank = rankService.findById(updateDTO.getRankId());
			user.setRank(rank);
		} else {
			user.setRank(null);
		}

		// Обновляем языки
		List<UserLanguage.LanguageLevel> levels = updateDTO.getLanguageLevels().stream()
				.map(UserLanguage.LanguageLevel::fromDisplayName)
				.toList();

		// Обновляем языки
		userLanguageService.updateUserLanguages(
				user,
				updateDTO.getLanguages(),
				levels
		);

		userService.saveUser(user);

		redirectAttributes.addFlashAttribute("success", "Профиль успешно обновлен");
		return "redirect:/profile?nickname=" + user.getNickname();
	}
}
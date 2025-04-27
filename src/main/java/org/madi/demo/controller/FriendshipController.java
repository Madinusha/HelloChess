package org.madi.demo.controller;

import org.madi.demo.dto.FriendDTO;
import org.madi.demo.dto.FriendRequestDTO;
import org.madi.demo.entities.User;
import org.madi.demo.service.FriendshipService;
import org.madi.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api/friends")
@PreAuthorize("isAuthenticated()")
public class FriendshipController {

	@Autowired
	private FriendshipService friendshipService;

	@Autowired
	private UserService userService;

	// Получить список друзей
	@GetMapping
	public ResponseEntity<List<FriendDTO>> getFriends() {
		User currentUser = getCurrentUser();
		System.out.println("current user: " + currentUser.getNickname());
		List<FriendDTO> friends = friendshipService.getUserFriends(currentUser);
		return ResponseEntity.ok(friends);
	}

	// Получить входящие запросы в друзья
	@GetMapping("/requests")
	public ResponseEntity<List<FriendDTO>> getFriendRequests() {
		User currentUser = getCurrentUser();
		List<FriendDTO> requests = friendshipService.getPendingRequests(currentUser);
		return ResponseEntity.ok(requests);
	}

	// Получить исходящие запросы (отправленные текущим пользователем)
	@GetMapping("/requests/suggestions")
	public ResponseEntity<List<FriendDTO>> getOutgoingRequests() {
		User currentUser = getCurrentUser();
		List<FriendDTO> requests = friendshipService.getOutgoingRequests(currentUser);
		return ResponseEntity.ok(requests);
	}

	// Отправить запрос в друзья
	@PostMapping("/requests/{nickname}")
	public ResponseEntity<String> sendFriendRequest(@PathVariable String nickname) {
		User sender = getCurrentUser();
		User receiver = userService.findUserByNickname(nickname);

		if (receiver == null) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Пользователь не найден");
		}

		friendshipService.sendFriendRequest(sender, receiver);
		return ResponseEntity.ok("Запрос отправлен");
	}

	@PostMapping("/requests/{nickname}/accept")
	public ResponseEntity<String> acceptFriendRequest(@PathVariable String nickname) {
		friendshipService.acceptFriendRequest(nickname, getCurrentUser());
		return ResponseEntity.ok("Запрос принят");
	}

	@DeleteMapping("/requests/{nickname}")
	public ResponseEntity<String> declineFriendRequest(@PathVariable String nickname) {
		friendshipService.declineFriendRequest(nickname, getCurrentUser());
		return ResponseEntity.ok("Запрос отклонен");
	}

	@DeleteMapping("/{friendNickname}")
	public ResponseEntity<String> removeFriend(@PathVariable String friendNickname) {
		friendshipService.removeFriend(friendNickname, getCurrentUser());
		return ResponseEntity.ok("Друг успешно удален");
	}

	@GetMapping("/search")
	public ResponseEntity<List<FriendDTO>> searchUsers(
			@RequestParam String q,
			@RequestParam(defaultValue = "10") int limit) {

		User currentUser = getCurrentUser();
		List<User> foundUsers = userService.searchUsers(q, limit);

		List<FriendDTO> results = foundUsers.stream()
				.filter(user -> !user.getId().equals(currentUser.getId())) // Фильтруем текущего пользователя
				.map(user -> {
					FriendDTO dto = new FriendDTO();
					dto.setNickname(user.getNickname());
					dto.setRating(user.getRating());
					dto.setStatusDetailed(friendshipService.getDetailedFriendshipStatus(currentUser, user));
					return dto;
				})
				.collect(Collectors.toList());

		return ResponseEntity.ok(results);
	}

	private User getCurrentUser() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		return userService.findUserByNickname(auth.getName());
	}
}
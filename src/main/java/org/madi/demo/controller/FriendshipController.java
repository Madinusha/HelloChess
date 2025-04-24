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
		List<FriendDTO> friends = friendshipService.getUserFriends(currentUser);
		return ResponseEntity.ok(friends);
	}

	// Получить входящие запросы в друзья
	@GetMapping("/requests")
	public ResponseEntity<List<FriendRequestDTO>> getFriendRequests() {
		User currentUser = getCurrentUser();
		List<FriendRequestDTO> requests = friendshipService.getPendingRequests(currentUser);
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

	// Принять запрос
	@PostMapping("/requests/{requestId}/accept")
	public ResponseEntity<String> acceptFriendRequest(@PathVariable Long requestId) {
		friendshipService.acceptFriendRequest(requestId, getCurrentUser());
		return ResponseEntity.ok("Запрос принят");
	}

	// Отклонить запрос
	@PostMapping("/requests/{requestId}/decline")
	public ResponseEntity<String> declineFriendRequest(@PathVariable Long requestId) {
		friendshipService.declineFriendRequest(requestId, getCurrentUser());
		return ResponseEntity.ok("Запрос отклонен");
	}

	private User getCurrentUser() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		return userService.findUserByNickname(auth.getName());
	}
}
package org.madi.demo.controller;

import org.madi.demo.dto.AdminActionDTO;
import org.madi.demo.dto.AdminPageUserDTO;
import org.madi.demo.dto.FriendDTO;
import org.madi.demo.entities.User;
import org.madi.demo.service.AdminService;
import org.madi.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

	private final UserService userService;
	private final AdminService adminService;

	@Autowired
	public AdminController(UserService userService, AdminService adminService) {
		this.userService = userService;
		this.adminService = adminService;
	}

	@GetMapping("/admins")
	public ResponseEntity<List<AdminPageUserDTO>> getAdmins() {
		return ResponseEntity.ok(userService.findAdmins());
	}

	@PostMapping("/actions")
	public ResponseEntity<?> performAdminAction(@RequestBody AdminActionDTO actionDTO) {
		try {
			switch (actionDTO.getAction()) {
				case "ban":
					adminService.banUser(actionDTO.getUserId(), actionDTO.getBanDuration(), actionDTO.getBanReason());
					break;
				case "unban":
					adminService.unbanUser(actionDTO.getUserId());
					break;
				case "make_admin":
					adminService.makeAdmin(actionDTO.getUserId());
					break;
				case "remove_admin":
					adminService.removeAdmin(actionDTO.getUserId());
					break;
				default:
					return ResponseEntity.badRequest().body("Неизвестное действие");
			}
			return ResponseEntity.ok().body(Map.of("status", "success"));
		} catch (Exception e) {
			return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
		}
	}

	@GetMapping("/banned")
	public ResponseEntity<List<AdminPageUserDTO>> getBannedUsers() {
		return ResponseEntity.ok(userService.findBannedUsers());
	}

	@GetMapping("/search")
	public ResponseEntity<List<AdminPageUserDTO>> searchUsers(
			@RequestParam String q,
			@RequestParam(defaultValue = "10") int limit) {

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.cacheControl(CacheControl.noStore())
					.build();
		}

		User currentUser = userService.findUserByNickname(authentication.getName());

		List<User> foundUsers = userService.searchUsers(q, limit);
		List<AdminPageUserDTO> results = foundUsers.stream()
				.filter(user -> !user.getId().equals(currentUser.getId()))
				.map(user -> new AdminPageUserDTO(user.getId(), user.getNickname(), user.isBanned(), user.isAdmin()))
				.collect(Collectors.toList());

		return ResponseEntity.ok(results);
	}

}
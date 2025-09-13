package org.madi.demo.service;

import jakarta.annotation.PostConstruct;
import org.madi.demo.dto.AdminPageUserDTO;
import org.madi.demo.entities.User;
import org.madi.demo.repository.FriendshipRepository;
import org.madi.demo.repository.GameHistoryRepository;
import org.madi.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserService {
	private final String DELETED_USER_NICKNAME = "Deleted_User";

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private GameHistoryRepository gameHistoryRepository;

	@Autowired
	private FriendshipRepository friendshipRepository;

	@PostConstruct
	public void init() {
		ensureDeletedUserExists();
	}

	public User findUserByNickname(String nickname) {
		return userRepository.findByNickname(nickname);
	}
	public User findUserByEmail(String email) {
		return userRepository.findByEmail(email);
	}
	public User getUserById(Long id) {
		return userRepository.findById(id).orElse(null);
	}

	@Transactional
	public void saveUser(User user) {
		try {
			userRepository.save(user);
		} catch (DataIntegrityViolationException e) {
			throw e;
		}
	}

	public List<User> searchUsers(String query, int limit) {
		return userRepository.findByNicknameContainingIgnoreCase(query,
				PageRequest.of(0, limit));
	}

	// Метод для инициализации удаленного пользователя
	@Transactional
	public void ensureDeletedUserExists() {
		if (!userRepository.existsByNickname(DELETED_USER_NICKNAME)) {
			User deletedUser = new User();
			deletedUser.setNickname("Deleted_User");
			deletedUser.setEmail("Deleted@user");
			deletedUser.setPassword("deleted");
			deletedUser.setRole("ROLE_DELETED");
			deletedUser.setRating(0);
			deletedUser.setCreatedAt(LocalDateTime.now());
			userRepository.save(deletedUser);
		}
	}

	// Метод для удаления пользователя
	@Transactional
	public void deleteUser(User user) {
		ensureDeletedUserExists();

		Long deletedUserId = userRepository.findByNickname(DELETED_USER_NICKNAME).getId();
		gameHistoryRepository.updateWhitePlayerToDeletedUser(user.getId(), deletedUserId);
		gameHistoryRepository.updateBlackPlayerToDeletedUser(user.getId(), deletedUserId);

		friendshipRepository.deleteByUserIdOrFriendId(user.getId());

		userRepository.delete(user);
	}

	@Transactional
	public void updateRating(User user, int newRating) {
		user.setRating(newRating);
		userRepository.save(user);
	}

	public List<User> findTop10ByOrderByRatingDesc() {
		List<User> topUsers = userRepository.findTop10ByOrderByRatingDesc();

		return topUsers.stream()
				.filter(user -> !DELETED_USER_NICKNAME.equals(user.getNickname()))
				.toList();
	}

	public List<AdminPageUserDTO> findBannedUsers() {
		return userRepository.findByIsBannedTrue().stream()
				.map(user -> new AdminPageUserDTO(user.getId(), user.getUsername(), user.isBanned(), user.isAdmin()))
				.toList();
	}

	public List<AdminPageUserDTO> findAdmins() {
		return userRepository.findByIsAdminTrue().stream()
				.map(user -> new AdminPageUserDTO(user.getId(), user.getUsername(), user.isBanned(), user.isAdmin()))
				.toList();
	}

}

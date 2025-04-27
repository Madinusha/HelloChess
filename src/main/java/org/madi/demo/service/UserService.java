package org.madi.demo.service;

import org.madi.demo.entities.User;
import org.madi.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Service
public class UserService {

	@Autowired
	private UserRepository userRepository;

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

//	public void updateUserStats(User user, GameResult result) {
//		// Обновление рейтинга/статистики
//	}
}

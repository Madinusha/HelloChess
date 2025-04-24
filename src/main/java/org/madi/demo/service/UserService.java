package org.madi.demo.service;

import org.madi.demo.entities.User;
import org.madi.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

//	public void updateUserStats(User user, GameResult result) {
//		// Обновление рейтинга/статистики
//	}
}

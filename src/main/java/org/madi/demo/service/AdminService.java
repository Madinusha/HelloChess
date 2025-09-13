package org.madi.demo.service;

import org.madi.demo.entities.User;
import org.madi.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Transactional
public class AdminService {

	private final UserRepository userRepository;

	@Autowired
	public AdminService(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	public void banUser(Long userId, Integer durationMinutes, String reason) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new IllegalArgumentException("Пользователь не найден"));

		user.setBanned(true);
		user.setBanReason(reason);

		if (durationMinutes != null && durationMinutes > 0) {
			user.setBanExpiresAt(LocalDateTime.now().plusMinutes(durationMinutes));
		} else {
			user.setBanExpiresAt(null); // навсегда
		}

		userRepository.save(user);
	}

	public void unbanUser(Long userId) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new IllegalArgumentException("Пользователь не найден"));

		user.setBanned(false);
		user.setBanReason(null);
		user.setBanExpiresAt(null);

		userRepository.save(user);
	}

	public void makeAdmin(Long userId) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new IllegalArgumentException("Пользователь не найден"));

		user.setRole("ADMIN");
		userRepository.save(user);
	}

	public void removeAdmin(Long userId) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new IllegalArgumentException("Пользователь не найден"));

		user.setRole("USER");
		userRepository.save(user);
	}
}
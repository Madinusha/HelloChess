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

	@Transactional
	public void saveUser(User user) {
		if (userRepository.findByNickname(user.getNickname()) != null) {
			throw new DataIntegrityViolationException("Этот ник уже занят. Пожалуйста, выберите другой.");
		}
		userRepository.save(user);
	}
}

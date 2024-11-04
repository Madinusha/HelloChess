package org.madi.demo.service;

import org.madi.demo.model.User;
import org.madi.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

	@Autowired
	private UserRepository userRepository;

	public User findUserByNickname(String nickname) {
		return userRepository.findByNickname(nickname);
	}

	public void saveUser(User user) {
		userRepository.save(user);
	}
}

package org.madi.demo.service;

import lombok.RequiredArgsConstructor;
import org.madi.demo.entities.User;
import org.madi.demo.entities.UserLanguage;
import org.madi.demo.repository.UserLanguageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserLanguageService {
	private final UserLanguageRepository userLanguageRepository;

	public List<UserLanguage> findByUser(User user) {
		return userLanguageRepository.findByUser(user);
	}

	public void addLanguage(User user, String language, UserLanguage.LanguageLevel level) {
		UserLanguage userLanguage = new UserLanguage();
		userLanguage.setUser(user);
		userLanguage.setLanguage(language);
		userLanguage.setLevel(level);
		userLanguageRepository.save(userLanguage);
	}

	public void removeLanguage(User user, String language) {
		userLanguageRepository.deleteByUserAndLanguage(user, language);
	}

	@Transactional
	public void updateUserLanguages(User user, List<String> languages, List<UserLanguage.LanguageLevel> levels) {
		// Удаляем старые языки
		userLanguageRepository.deleteByUser(user);

		// Добавляем новые
		if (languages != null && levels != null && languages.size() == levels.size()) {
			for (int i = 0; i < languages.size(); i++) {
				UserLanguage userLanguage = new UserLanguage();
				userLanguage.setUser(user);
				userLanguage.setLanguage(languages.get(i));
				userLanguage.setLevel(levels.get(i));
//				userLanguage.setLevel(UserLanguage.LanguageLevel.fromDisplayName(levels.get(i)));
				userLanguageRepository.save(userLanguage);
			}
		}
	}
}

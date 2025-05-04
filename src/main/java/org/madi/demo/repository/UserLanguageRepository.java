package org.madi.demo.repository;

import org.madi.demo.entities.User;
import org.madi.demo.entities.UserLanguage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserLanguageRepository extends JpaRepository<UserLanguage, Long> {
	List<UserLanguage> findByUser(User user);
	void deleteByUserAndLanguage(User user, String language);
	void deleteByUser(User user);
}